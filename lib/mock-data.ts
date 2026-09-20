// Types, initial state, and formatting/parsing helpers for the in-memory
// state in app/page.tsx.

export type UIPerson = {
  id: string;
  name: string;
  position: number;
};

export type UIItem = {
  id: string;
  name: string;
  priceCents: number;
  assigneeIds: string[];
};

// The app starts blank: no split name, no people, no items.
export const initialPeople: UIPerson[] = [];

export const initialItems: UIItem[] = [];

export const initialTaxCents = 0;
export const initialTipCents = 0;

let nextId = 1;
export function localId(prefix: string): string {
  return `${prefix}-${nextId++}`;
}

// Visual-only for now — picking a currency changes the symbol shown, not
// any stored data. Wiring this into the actual split (and the split-math
// module, which is currency-agnostic today) is a follow-up.
export type Currency = "USD" | "EUR";

export function formatCents(cents: number, currency: Currency = "USD"): string {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency,
  });
}

const STRICT_PRICE_RE = /^\d+(\.\d{1,2})?$/;

/**
 * Strict price validation: a non-negative number with at most two decimal
 * places (no currency symbols, no negative sign, no more than two
 * decimals). Returns null for anything else. Empty input isn't handled
 * here — callers treat an empty field as $0.00 themselves, same as a
 * price of "0" or "0.00" (an item can legitimately be free, e.g. a round
 * someone else picked up).
 */
export function parseCurrencyToCents(raw: string): number | null {
  const trimmed = raw.trim();
  if (!STRICT_PRICE_RE.test(trimmed)) return null;
  return Math.round(Number(trimmed) * 100);
}

/**
 * Parses what's typed into a price field: empty means $0.00 (an item can be
 * free), and a trailing "." from mid-typing ("12.") counts as whole dollars.
 * Returns null for anything that isn't a valid amount.
 */
export function parsePriceInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return 0;
  return parseCurrencyToCents(trimmed.endsWith(".") ? trimmed.slice(0, -1) : trimmed);
}
