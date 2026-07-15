"use client";

import { ArrowLeft, Ban, RefreshCw, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AiMark } from "@/components/Navigation";
import type { PlanLimits } from "@/lib/billing/limits";
import { IMPORT_LIMITS } from "@/lib/imports/limits";
import type { ImportPlatform, ParseResult } from "@/lib/imports/types";

const mime: Record<string, string> = {
  json: "application/json",
  txt: "text/plain",
  html: "text/html",
  htm: "text/html",
  csv: "text/csv",
  zip: "application/zip",
  mbox: "application/mbox",
};

type ActiveWorker = {
  worker: Worker;
  requestId: string;
  reject: (error: Error) => void;
  timeoutId: number;
};

export default function ImportPage() {
  const [platform, setPlatform] = useState<ImportPlatform>("telegram");
  const [status, setStatus] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [planId, setPlanId] = useState("loading");
  const activeWorker = useRef<ActiveWorker | null>(null);

  useEffect(() => {
    fetch("/api/imports")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        setLimits(body.limits);
        setPlanId(body.planId);
      })
      .catch(() => setStatus("Could not load server-enforced import limits."));
  }, []);

  const stopWorker = (reason: "IMPORT_CANCELLED" | "PROCESSING_TIMEOUT") => {
    const active = activeWorker.current;
    if (!active) return;
    window.clearTimeout(active.timeoutId);
    active.worker.terminate();
    activeWorker.current = null;
    active.reject(new Error(reason));
  };

  const extractMemories = async (importId: string) => {
    for (let batch = 0; batch < 250; batch += 1) {
      setStatus(`Import complete. Extracting memories, batch ${batch + 1}…`);
      const response = await fetch(`/api/imports/${importId}/extract`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) {
        if (body.error === "AI_PROVIDER_NOT_CONFIGURED") {
          setStatus("Import complete. AI provider is not configured, so memory extraction is paused.");
          return;
        }
        throw new Error(body.error);
      }
      if (body.done) {
        setStatus("Import and memory extraction complete. Raw source file was not uploaded.");
        return;
      }
    }
    throw new Error("MEMORY_EXTRACTION_BATCH_LIMIT");
  };

  const run = async (file: File) => {
    if (!consent) return setStatus("Confirm that normalized data may be stored.");
    if (!limits) return setStatus("Server-enforced plan limits are still loading.");
    if (file.size > limits.maxFileBytes) return setStatus(`File exceeds your ${(limits.maxFileBytes / 1024 / 1024).toFixed(0)} MB plan limit.`);
    setLastFile(file);
    setBusy(true);
    setStatus("Parsing locally in your browser…");
    const worker = new Worker(new URL("../../workers/conversation-parser.worker.ts", import.meta.url));
    const requestId = crypto.randomUUID();
    let createdImportId: string | null = null;

    try {
      const parsed = await new Promise<ParseResult>((resolve, reject) => {
        const timeoutId = window.setTimeout(() => stopWorker("PROCESSING_TIMEOUT"), IMPORT_LIMITS.processingTimeoutMs);
        activeWorker.current = { worker, requestId, reject, timeoutId };
        worker.onmessage = (event) => {
          if (event.data?.requestId !== requestId) return;
          window.clearTimeout(timeoutId);
          activeWorker.current = null;
          event.data.ok ? resolve(event.data) : reject(new Error(event.data.error));
        };
        worker.onerror = () => {
          window.clearTimeout(timeoutId);
          activeWorker.current = null;
          reject(new Error("WORKER_FAILED"));
        };
        worker.postMessage({ type: "parse", requestId, file, platform });
      });

      if (parsed.conversations.length > limits.maxConversationsPerImport) throw new Error("CONVERSATION_LIMIT_REACHED");
      const parsedMessageCount = parsed.conversations.reduce((sum, conversation) => sum + conversation.messages.length, 0);
      if (parsedMessageCount > limits.maxMessagesPerImport) throw new Error("MESSAGE_LIMIT_REACHED");

      const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await file.arrayBuffer())))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      const create = await fetch("/api/imports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          sourceName: file.name,
          sourceHash: hash,
          bytes: file.size,
          mimeType: mime[extension] ?? file.type,
          extension,
          parserVersion: parsed.parserVersion,
          preview: parsed.preview,
          rawFileStored: false,
        }),
      });
      const created = await create.json();
      if (!create.ok) {
        if (created.error === "DUPLICATE_IMPORT") throw new Error(`DUPLICATE_IMPORT:${created.import?.status ?? "existing"}`);
        throw new Error(created.error);
      }
      createdImportId = created.import.id;

      const chunks = [];
      for (let index = 0; index < parsed.conversations.length; index += 10) chunks.push(parsed.conversations.slice(index, index + 10));
      for (let index = 0; index < chunks.length; index += 1) {
        const response = await fetch(`/api/imports/${created.import.id}/chunks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chunkIndex: index, final: index === chunks.length - 1, conversations: chunks[index] }),
        });
        if (!response.ok) throw new Error((await response.json()).error);
        setStatus(`Uploading normalized chunk ${index + 1}/${chunks.length}…`);
      }
      await extractMemories(created.import.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "IMPORT_FAILED";
      const preserveImport = message === "AI_PROVIDER_NOT_CONFIGURED" || message.startsWith("MEMORY_");
      if (createdImportId && !preserveImport) await fetch(`/api/imports/${createdImportId}`, { method: "DELETE" }).catch(() => undefined);
      if (message === "IMPORT_CANCELLED") setStatus("Import cancelled. No raw file was uploaded. You can retry safely.");
      else if (message === "PROCESSING_TIMEOUT") setStatus("Import stopped after 30 seconds. Try a smaller export or split the archive.");
      else if (message.startsWith("DUPLICATE_IMPORT")) setStatus("This exact file was already imported. Delete or review the existing import before retrying.");
      else setStatus(`Import failed: ${message}. You can safely retry with the same local file.`);
    } finally {
      if (activeWorker.current?.worker === worker) {
        window.clearTimeout(activeWorker.current.timeoutId);
        activeWorker.current = null;
      }
      worker.terminate();
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05080c] px-5 py-10 text-white">
      <header className="mx-auto flex max-w-4xl justify-between">
        <Link href="/dashboard" className="flex gap-2"><ArrowLeft className="h-4 w-4" />Dashboard</Link>
        <span className="flex gap-2">Altr <AiMark /></span>
      </header>
      <section className="pricing-card mx-auto mt-16 max-w-3xl rounded-[2rem] p-8">
        <p className="eyebrow">LOCAL PARSER / PRIVATE BY DEFAULT</p>
        <h1 className="mt-4 text-4xl">Import normalized conversations.</h1>
        <p className="mt-4 leading-7 text-white/45">The raw export stays in your browser. Only normalized plain text is uploaded, then server-side AI extraction creates reviewable memories.</p>
        {limits && <p className="mt-4 text-sm text-cyan-100/60">{planId} plan: {(limits.maxFileBytes / 1024 / 1024).toFixed(0)} MB, {limits.maxMessagesPerImport.toLocaleString()} messages, {limits.importsPerMonth} imports/month.</p>}
        <select value={platform} onChange={(event) => setPlatform(event.target.value as ImportPlatform)} disabled={busy} className="mt-7 w-full rounded-xl bg-white/5 p-3">
          {["telegram", "gmail", "whatsapp", "instagram", "messenger", "slack", "discord", "manual"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <label className="mt-5 flex gap-3 text-sm text-white/55"><input type="checkbox" checked={consent} disabled={busy} onChange={(event) => setConsent(event.target.checked)} />I authorize storage of normalized results. The raw file will not be uploaded.</label>
        <label className={`future-button mt-6 flex items-center justify-center gap-2 rounded-full px-6 py-4 ${busy ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
          <UploadCloud className="h-4 w-4" />Choose export
          <input type="file" disabled={busy} accept=".json,.txt,.html,.htm,.csv,.zip,.mbox" className="hidden" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) void run(selected); }} />
        </label>
        {busy && <button type="button" onClick={() => stopWorker("IMPORT_CANCELLED")} className="mt-4 flex items-center gap-2 text-sm text-red-200/70"><Ban className="h-4 w-4" />Cancel local parsing</button>}
        {!busy && lastFile && (status.startsWith("Import failed") || status.includes("retry")) && <button type="button" onClick={() => void run(lastFile)} className="mt-4 flex items-center gap-2 text-sm text-cyan-100/70"><RefreshCw className="h-4 w-4" />Retry safely</button>}
        {status && <p className="mt-5 text-sm text-cyan-100/60">{status}</p>}
      </section>
    </main>
  );
}
