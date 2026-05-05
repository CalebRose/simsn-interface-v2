import { useCallback, useEffect, useRef, useState } from "react";

const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface StoredDraft<T> {
  data: T;
  savedAt: number;
}

function readDraft<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const stored: StoredDraft<T> = JSON.parse(raw);
    if (Date.now() - stored.savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return stored.data;
  } catch {
    return null;
  }
}

function writeDraft<T>(key: string, data: T): void {
  try {
    const stored: StoredDraft<T> = { data, savedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(stored));
  } catch {
    // Storage quota exceeded — silently skip
  }
}

function deleteDraft(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // silently ignore
  }
}

/**
 * Persists a draft value to localStorage under `key`, with a 800ms debounce on
 * writes and a 7-day TTL. Pass `null` as the key to disable persistence
 * (e.g. when the user is not logged in).
 */
export function useForumDraft<T>(key: string | null) {
  const [draft, setDraft] = useState<T | null>(() =>
    key ? readDraft<T>(key) : null,
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-read from storage when key changes (e.g. navigating to a different thread)
  useEffect(() => {
    if (!key) {
      setDraft(null);
      return;
    }
    const stored = readDraft<T>(key);
    setDraft(stored);
  }, [key]);

  const saveDraft = useCallback(
    (data: T) => {
      if (!key) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        writeDraft(key, data);
        setDraft(data);
      }, 800);
    },
    [key],
  );

  const clearDraft = useCallback(() => {
    if (!key) return;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    deleteDraft(key);
    setDraft(null);
  }, [key]);

  return { draft, saveDraft, clearDraft, hasDraft: draft !== null };
}
