"use client";

const KNOWN_KEY = "acp:flashcards:known";
const TEST_HISTORY_KEY = "acp:tests:history";

export interface TestHistoryEntry {
  date: string;
  percentage: number;
  passed: boolean;
  totalCorrect: number;
  totalQuestions: number;
  valuesCorrect: number;
  valuesTotal: number;
}

function readJson<T>(key: string, fallback: T, sanitize: (value: unknown) => T | null): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const sanitized = sanitize(parsed);
    return sanitized ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

// Drops any entries/keys that don't match the expected shape instead of
// rejecting the whole value, so a single corrupt entry (e.g. written by a
// future/older version of the app, or by hand in devtools) can't crash
// downstream rendering.
function sanitizeKnownCards(value: unknown): Record<string, boolean> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const result: Record<string, boolean> = {};
  for (const [id, known] of Object.entries(value as Record<string, unknown>)) {
    if (typeof known === "boolean") result[id] = known;
  }
  return result;
}

function isValidHistoryEntry(entry: unknown): entry is TestHistoryEntry {
  if (typeof entry !== "object" || entry === null) return false;
  const e = entry as Record<string, unknown>;
  return (
    typeof e.date === "string" &&
    typeof e.percentage === "number" &&
    typeof e.passed === "boolean" &&
    typeof e.totalCorrect === "number" &&
    typeof e.totalQuestions === "number" &&
    typeof e.valuesCorrect === "number" &&
    typeof e.valuesTotal === "number"
  );
}

function sanitizeHistory(value: unknown): TestHistoryEntry[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter(isValidHistoryEntry);
}

type Listener = () => void;
const listeners = new Set<Listener>();
function emitChange() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const EMPTY_KNOWN: Record<string, boolean> = {};
let knownCache: Record<string, boolean> | null = null;

export function getKnownCardsSnapshot(): Record<string, boolean> {
  if (knownCache === null) knownCache = readJson(KNOWN_KEY, {} as Record<string, boolean>, sanitizeKnownCards);
  return knownCache;
}

export function getKnownCardsServerSnapshot(): Record<string, boolean> {
  return EMPTY_KNOWN;
}

export function setCardKnown(id: string, known: boolean) {
  knownCache = { ...getKnownCardsSnapshot(), [id]: known };
  writeJson(KNOWN_KEY, knownCache);
  emitChange();
}

export function resetKnownCards() {
  knownCache = {};
  writeJson(KNOWN_KEY, knownCache);
  emitChange();
}

const EMPTY_HISTORY: TestHistoryEntry[] = [];
let historyCache: TestHistoryEntry[] | null = null;

export function getTestHistorySnapshot(): TestHistoryEntry[] {
  if (historyCache === null) historyCache = readJson(TEST_HISTORY_KEY, [] as TestHistoryEntry[], sanitizeHistory);
  return historyCache;
}

export function getTestHistoryServerSnapshot(): TestHistoryEntry[] {
  return EMPTY_HISTORY;
}

export function addTestHistory(entry: TestHistoryEntry) {
  historyCache = [entry, ...getTestHistorySnapshot()].slice(0, 20);
  writeJson(TEST_HISTORY_KEY, historyCache);
  emitChange();
}

// Keep other tabs/windows in sync: the native `storage` event only fires in
// tabs other than the one that made the change, so this complements (not
// duplicates) the emitChange() calls above.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === KNOWN_KEY || event.key === TEST_HISTORY_KEY || event.key === null) {
      knownCache = null;
      historyCache = null;
      emitChange();
    }
  });
}
