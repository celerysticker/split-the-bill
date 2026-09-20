// Client-only fixture data for the interactive demo in app/page.tsx, until
// a real database is connected (see the tech spec's Phase 2). Shaped like
// the Prisma models but flat, since there's no DB round-trip here.

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

export const initialPeople: UIPerson[] = [
  { id: "nina", name: "Nina", position: 0 },
  { id: "alex", name: "Alex", position: 1 },
  { id: "sam", name: "Sam", position: 2 },
];

export const initialItems: UIItem[] = [
  { id: "i1", name: "Margherita", priceCents: 1800, assigneeIds: ["nina", "alex"] },
  { id: "i2", name: "Caesar salad", priceCents: 1200, assigneeIds: ["sam"] },
];

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

/** Parses a user-typed price string ("9.5", "$9.50") into integer cents, or null if invalid. */
export function parsePriceToCents(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (cleaned === "") return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
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
