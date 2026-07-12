// Extracts every File from a drop event, walking into dropped folders recursively.
// dataTransfer.files alone does NOT include the contents of dropped directories —
// that requires the webkitGetAsEntry() API, which all modern browsers support.
// Entries must be captured synchronously: the DataTransferItemList is invalidated
// once the drop handler yields to the event loop.

interface FileSystemEntryLike {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  file: (ok: (f: File) => void, err: (e: unknown) => void) => void;
  createReader: () => {
    readEntries: (ok: (entries: FileSystemEntryLike[]) => void, err: (e: unknown) => void) => void;
  };
}

export async function getDroppedFiles(dt: DataTransfer): Promise<File[]> {
  const fallback = Array.from(dt.files);
  const entries: FileSystemEntryLike[] = [];
  for (const item of Array.from(dt.items ?? [])) {
    const entry = (item as { webkitGetAsEntry?: () => FileSystemEntryLike | null }).webkitGetAsEntry?.();
    if (entry) entries.push(entry);
  }
  if (entries.length === 0) return fallback;

  const files: File[] = [];

  async function walk(entry: FileSystemEntryLike): Promise<void> {
    if (entry.isFile) {
      try {
        const file = await new Promise<File>((ok, err) => entry.file(ok, err));
        // Skip hidden system files that come along with folders (.DS_Store etc.)
        if (!file.name.startsWith('.')) files.push(file);
      } catch {
        // unreadable entry — skip it rather than failing the whole drop
      }
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      // readEntries returns results in batches (Chrome caps at 100) — loop until empty
      let batch: FileSystemEntryLike[];
      do {
        batch = await new Promise<FileSystemEntryLike[]>((ok, err) => reader.readEntries(ok, err));
        for (const child of batch) await walk(child);
      } while (batch.length > 0);
    }
  }

  for (const entry of entries) await walk(entry);
  return files;
}
