"use client";

import { ArrowLeft, Check, Clock3, Copy, Save, ThumbsDown, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AiMark } from "@/components/Navigation";

type Assistant = {
  id: string;
  name: string;
  assistant_type: string;
  system_instructions: string | null;
  tone: "balanced" | "warm" | "direct" | "formal";
  is_active: boolean;
  config: Record<string, unknown>;
};

type DraftResult = {
  draft: string;
  assistantRunId: string;
  model: string;
  quota: { used: number; limit: number };
};

export default function AssistantsPage() {
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [providerConfigured, setProviderConfigured] = useState<boolean | null>(null);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState("");
  const [originalDraft, setOriginalDraft] = useState("");
  const [runId, setRunId] = useState("");
  const [model, setModel] = useState("");
  const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null);
  const [rating, setRating] = useState(0);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/assistants").then((response) => response.json()),
      fetch("/api/ai/provider-status").then((response) => response.json()),
    ]).then(([assistants, provider]) => {
      setAssistant(assistants.assistants?.find((item: Assistant) => item.assistant_type === "digital_twin") ?? null);
      setProviderConfigured(Boolean(provider.configured));
    }).catch(() => setError("ASSISTANT_LOAD_FAILED"));
  }, []);

  const save = async () => {
    if (!assistant) return;
    const response = await fetch(`/api/assistants/${assistant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: assistant.name,
        tone: assistant.tone,
        systemInstructions: assistant.system_instructions ?? "",
      }),
    });
    if (!response.ok) setError((await response.json()).error);
    else setNotice("Twin configuration saved.");
  };

  const generate = async () => {
    setError("");
    setNotice("");
    setDraft("");
    setBusy(true);
    try {
      const response = await fetch("/api/ai/draft-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incomingMessage: input, requestedLength: "medium", language: "auto" }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      const result = body as DraftResult;
      setDraft(result.draft);
      setOriginalDraft(result.draft);
      setRunId(result.assistantRunId);
      setModel(result.model);
      setQuota(result.quota);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "DRAFT_FAILED");
    } finally {
      setBusy(false);
    }
  };

  const feedback = async (outcome: "accepted" | "rejected" | "edited" | "copied" | "rated", selectedRating?: number) => {
    if (!runId) return;
    const response = await fetch(`/api/ai/drafts/${runId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        outcome,
        finalDraft: draft !== originalDraft ? draft : undefined,
        rating: selectedRating,
        consentToPersonalization: consent,
      }),
    });
    const body = await response.json();
    if (!response.ok) setError(body.error);
    else setNotice(`Feedback saved: ${outcome}.`);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(draft);
    await feedback("copied");
    setNotice("Draft copied. It was not sent.");
  };

  return (
    <main className="min-h-screen bg-[#05080c] px-5 py-10 text-white">
      <header className="mx-auto flex max-w-6xl justify-between">
        <Link href="/dashboard" className="flex gap-2"><ArrowLeft className="h-4 w-4" />Dashboard</Link>
        <span className="flex gap-2">Altr <AiMark /></span>
      </header>
      <section className="mx-auto mt-12 max-w-6xl">
        <p className="eyebrow">REAL SERVER ASSISTANT</p>
        <h1 className="mt-4 text-5xl">Altr Twin draft MVP.</h1>
        {providerConfigured === false && <p className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-amber-100">AI provider is not configured. Add OPENAI_API_KEY on the server. No fake draft will be returned.</p>}
        {error && <p className="mt-5 text-red-200">{error}</p>}
        {notice && <p className="mt-5 text-cyan-100/70">{notice}</p>}
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <article className="pricing-card rounded-3xl p-7">
            {assistant ? <>
              <label className="settings-field"><span>Name</span><input value={assistant.name} onChange={(event) => setAssistant({ ...assistant, name: event.target.value })} /></label>
              <label className="settings-field mt-4"><span>Tone</span><select value={assistant.tone} onChange={(event) => setAssistant({ ...assistant, tone: event.target.value as Assistant["tone"] })}>{["balanced", "warm", "direct", "formal"].map((tone) => <option key={tone}>{tone}</option>)}</select></label>
              <label className="settings-field mt-4"><span>Safe user instructions</span><textarea rows={6} value={assistant.system_instructions ?? ""} onChange={(event) => setAssistant({ ...assistant, system_instructions: event.target.value })} /></label>
              <button onClick={() => void save()} className="future-button mt-5 rounded-full px-5 py-3"><Save className="inline h-4 w-4" /> Save</button>
            </> : <p className="text-white/40">Loading Twin…</p>}
          </article>
          <article className="pricing-card rounded-3xl p-7">
            <h2 className="text-2xl">Generate a draft</h2>
            <textarea rows={7} value={input} onChange={(event) => setInput(event.target.value)} className="mt-5 w-full rounded-xl bg-white/5 p-3" placeholder="Incoming message" />
            <button disabled={busy || providerConfigured === false || input.trim().length < 1} onClick={() => void generate()} className="future-button mt-4 rounded-full px-5 py-3 disabled:opacity-40">{busy ? "Generating…" : "Generate"}</button>
            {quota && <p className="mt-3 text-xs text-white/35">Draft quota: {quota.used}/{quota.limit} this month.</p>}
            {draft && <>
              <textarea rows={8} value={draft} onChange={(event) => setDraft(event.target.value)} className="mt-5 w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/75" />
              <p className="mt-2 text-xs text-white/30">Draft only · model {model}</p>
              <label className="mt-4 flex gap-2 text-xs text-white/45"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />Allow the edited final draft to be stored for my own personalization.</label>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => void feedback(draft === originalDraft ? "accepted" : "edited")} className="rounded-full border border-white/10 px-4 py-2 text-sm"><Check className="inline h-4 w-4" /> Accept</button>
                <button onClick={() => void feedback("rejected")} className="rounded-full border border-white/10 px-4 py-2 text-sm"><ThumbsDown className="inline h-4 w-4" /> Reject</button>
                <button onClick={() => void copy()} className="rounded-full border border-white/10 px-4 py-2 text-sm"><Copy className="inline h-4 w-4" /> Copy</button>
                {[1, 2, 3, 4, 5].map((value) => <button key={value} onClick={() => { setRating(value); void feedback("rated", value); }} className={`rounded-full border px-3 py-2 text-xs ${rating === value ? "border-cyan-200/50" : "border-white/10"}`}><ThumbsUp className="inline h-3 w-3" /> {value}</button>)}
              </div>
            </>}
          </article>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">{["Operator", "Negotiator"].map((name) => <article key={name} className="pricing-card rounded-3xl p-6 opacity-70"><Clock3 className="h-5 w-5" /><h2 className="mt-4 text-xl">{name}</h2><p className="mt-2 text-sm text-white/40">Coming later. Preview only; it cannot send messages or execute external actions.</p></article>)}</div>
      </section>
    </main>
  );
}
