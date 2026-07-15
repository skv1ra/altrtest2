import JSZip from "jszip";
import { IMPORT_LIMITS } from "./limits";

export type SafeZipEntry = { name: string; bytes: Uint8Array };

type ZipMetadata = {
  name: string;
  compressedSize: number;
  uncompressedSize: number;
  directory: boolean;
  compressionMethod: number;
};

function assertSafeArchiveName(name: string) {
  const normalized = name.replace(/\\/g, "/");
  if (
    !normalized ||
    normalized.startsWith("/") ||
    /^[a-z]:\//i.test(normalized) ||
    normalized.includes("\u0000") ||
    normalized.split("/").some((part) => part === ".." || part === "")
  ) {
    throw new Error("ZIP_PATH_TRAVERSAL");
  }
}

function findEndOfCentralDirectory(bytes: Uint8Array) {
  if (bytes.byteLength < 22) throw new Error("ZIP_EOCD_NOT_FOUND");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const minimum = Math.max(0, bytes.length - 65_557);
  for (let offset = bytes.length - 22; offset >= minimum; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) return offset;
  }
  throw new Error("ZIP_EOCD_NOT_FOUND");
}

export function inspectZip(bytes: Uint8Array): ZipMetadata[] {
  if (bytes.byteLength > IMPORT_LIMITS.compressedFileBytes) throw new Error("COMPRESSED_FILE_TOO_LARGE");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocd = findEndOfCentralDirectory(bytes);
  const diskNumber = view.getUint16(eocd + 4, true);
  const centralDirectoryDisk = view.getUint16(eocd + 6, true);
  const entryCount = view.getUint16(eocd + 10, true);
  const centralDirectorySize = view.getUint32(eocd + 12, true);
  const centralDirectoryOffset = view.getUint32(eocd + 16, true);
  if (diskNumber !== 0 || centralDirectoryDisk !== 0) throw new Error("ZIP_MULTIDISK_UNSUPPORTED");
  if (entryCount === 0xffff || centralDirectorySize === 0xffffffff || centralDirectoryOffset === 0xffffffff) {
    throw new Error("ZIP64_UNSUPPORTED");
  }
  if (entryCount > IMPORT_LIMITS.zipEntries) throw new Error("ZIP_TOO_MANY_ENTRIES");
  if (centralDirectoryOffset + centralDirectorySize > bytes.length) throw new Error("ZIP_CENTRAL_DIRECTORY_INVALID");

  const decoder = new TextDecoder("utf-8", { fatal: false });
  const entries: ZipMetadata[] = [];
  let offset = centralDirectoryOffset;
  let totalUncompressed = 0;
  while (offset < centralDirectoryOffset + centralDirectorySize && entries.length < entryCount) {
    if (offset + 46 > bytes.length || view.getUint32(offset, true) !== 0x02014b50) {
      throw new Error("ZIP_CENTRAL_DIRECTORY_INVALID");
    }
    const flags = view.getUint16(offset + 8, true);
    const compressionMethod = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    if ((flags & 0x1) !== 0) throw new Error("ZIP_ENCRYPTED_UNSUPPORTED");
    if (![0, 8].includes(compressionMethod)) throw new Error("ZIP_COMPRESSION_UNSUPPORTED");
    if (compressedSize === 0xffffffff || uncompressedSize === 0xffffffff) throw new Error("ZIP64_UNSUPPORTED");
    const nameStart = offset + 46;
    const nameEnd = nameStart + nameLength;
    if (nameEnd > bytes.length) throw new Error("ZIP_CENTRAL_DIRECTORY_INVALID");
    const name = decoder.decode(bytes.subarray(nameStart, nameEnd));
    assertSafeArchiveName(name);
    const directory = name.endsWith("/");
    if (!directory) {
      if (uncompressedSize > IMPORT_LIMITS.zipEntryBytes) throw new Error("ZIP_ENTRY_TOO_LARGE");
      totalUncompressed += uncompressedSize;
      if (totalUncompressed > IMPORT_LIMITS.uncompressedTotalBytes) throw new Error("ZIP_UNCOMPRESSED_LIMIT");
      if (compressedSize === 0 && uncompressedSize > 0) throw new Error("ZIP_SUSPICIOUS_RATIO");
      if (compressedSize > 0 && uncompressedSize / compressedSize > 200) throw new Error("ZIP_SUSPICIOUS_RATIO");
    }
    entries.push({ name, compressedSize, uncompressedSize, directory, compressionMethod });
    offset = nameEnd + extraLength + commentLength;
  }
  if (entries.length !== entryCount || offset !== centralDirectoryOffset + centralDirectorySize) {
    throw new Error("ZIP_ENTRY_COUNT_MISMATCH");
  }
  return entries;
}

export async function extractSafeZipEntries(bytes: Uint8Array, signal?: AbortSignal): Promise<SafeZipEntry[]> {
  const metadata = inspectZip(bytes);
  if (signal?.aborted) throw new DOMException("Import cancelled", "AbortError");
  const zip = await JSZip.loadAsync(bytes, { checkCRC32: true, createFolders: false });
  const supported = metadata.filter(
    (entry) => !entry.directory && /\.(json|txt|html?|csv|mbox)$/i.test(entry.name) && !/\.(zip|7z|rar|tar|gz)$/i.test(entry.name),
  );
  if (!supported.length) throw new Error("ZIP_HAS_NO_SUPPORTED_EXPORT");
  const extracted: SafeZipEntry[] = [];
  let extractedBytes = 0;
  for (const entry of supported) {
    if (signal?.aborted) throw new DOMException("Import cancelled", "AbortError");
    const file = zip.file(entry.name);
    if (!file) throw new Error("ZIP_ENTRY_MISSING");
    const data = await file.async("uint8array");
    if (data.byteLength !== entry.uncompressedSize) throw new Error("ZIP_ENTRY_SIZE_MISMATCH");
    extractedBytes += data.byteLength;
    if (extractedBytes > IMPORT_LIMITS.uncompressedTotalBytes) throw new Error("ZIP_UNCOMPRESSED_LIMIT");
    extracted.push({ name: entry.name, bytes: data });
  }
  return extracted;
}
