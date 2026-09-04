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

export const initialTaxCents = 501;
export const initialTipCents = 500;

let nextId = 1;
export function localId(prefix: string): string {
  return `${prefix}-${nextId++}`;
}

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
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
