"use client";

// Remembers the organizer's edit links in the browser so the Start screen
// can resurface past splits without an account. Purely client-side — see
// the tech spec, section 7. If storage is unavailable (private browsing,
// blocked cookies/storage) this silently no-ops rather than throwing.

const STORAGE_KEY = "itemizer:recentSplits";
const MAX_REMEMBERED = 20;

export type RecentSplit = {
  id: string;
  editToken: string;
  name: string | null;
  savedAt: string;
};

function readAll(): RecentSplit[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function rememberSplit(split: {
  id: string;
  editToken: string;
  name: string | null;
}): void {
  try {
    const existing = readAll().filter((s) => s.id !== split.id);
    const next: RecentSplit[] = [
      { ...split, savedAt: new Date().toISOString() },
      ...existing,
    ].slice(0, MAX_REMEMBERED);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable — the split still exists server-side, only the
    // shortcut back to it is lost
  }
}

export function getRecentSplits(): RecentSplit[] {
  return readAll();
}
