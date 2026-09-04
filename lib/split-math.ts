// The only place a person's total is ever computed. Pure functions, integer
// cents in and out, no dependency on Prisma or Next.js — see the tech spec,
// section 4, for the rounding rules this implements.

export type Person = {
  id: string;
  position: number;
};

export type Item = {
  id: string;
  priceCents: number;
  assigneeIds: string[];
};

export type Split = {
  people: Person[];
  items: Item[];
  taxCents: number;
  tipCents: number;
};

export type PersonTotal = {
  personId: string;
  subtotalCents: number;
  taxTipCents: number;
  totalCents: number;
};

/**
 * Splits `totalCents` evenly among `recipients`. Any leftover cents (there
 * are always fewer leftover cents than recipients) go one each to the
 * lowest-`position` recipients first.
 */
export function splitCents(
  totalCents: number,
  recipients: Person[],
): Record<string, number> {
  if (recipients.length === 0) return {};

  const n = recipients.length;
  const base = Math.floor(totalCents / n);
  const remainder = totalCents - base * n;
  const ordered = [...recipients].sort((a, b) => a.position - b.position);

  const shares: Record<string, number> = {};
  ordered.forEach((person, i) => {
    shares[person.id] = base + (i < remainder ? 1 : 0);
  });
  return shares;
}

/**
 * Computes each person's subtotal (sum of their assigned items' shares),
 * proportional tax/tip share, and total. Leftover tax/tip cents from
 * rounding are distributed round-robin by position, starting at position 0.
 */
export function computeSplitTotals(split: Split): PersonTotal[] {
  const people = [...split.people].sort((a, b) => a.position - b.position);
  const peopleById = new Map(people.map((p) => [p.id, p]));

  const subtotal = new Map<string, number>(people.map((p) => [p.id, 0]));

  for (const item of split.items) {
    const assignees = item.assigneeIds
      .map((id) => peopleById.get(id))
      .filter((p): p is Person => p !== undefined);
    if (assignees.length === 0) continue;

    const shares = splitCents(item.priceCents, assignees);
    for (const [personId, cents] of Object.entries(shares)) {
      subtotal.set(personId, (subtotal.get(personId) ?? 0) + cents);
    }
  }

  const billSubtotal = split.items.reduce((sum, i) => sum + i.priceCents, 0);
  const taxTipPool = split.taxCents + split.tipCents;

  const floors = people.map((p) => {
    const exact =
      billSubtotal === 0
        ? 0
        : (taxTipPool * (subtotal.get(p.id) ?? 0)) / billSubtotal;
    return Math.floor(exact);
  });

  let leftover = taxTipPool - floors.reduce((sum, f) => sum + f, 0);
  for (let i = 0; leftover > 0; i = (i + 1) % floors.length, leftover--) {
    floors[i] += 1;
  }

  return people.map((p, i) => {
    const subtotalCents = subtotal.get(p.id) ?? 0;
    const taxTipCents = floors[i];
    return {
      personId: p.id,
      subtotalCents,
      taxTipCents,
      totalCents: subtotalCents + taxTipCents,
    };
  });
}
