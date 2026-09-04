import { describe, expect, it } from "vitest";
import { computeSplitTotals, splitCents, type Split } from "../lib/split-math";

const person = (id: string, position: number) => ({ id, position });

describe("splitCents", () => {
  it("divides evenly with no remainder", () => {
    const shares = splitCents(1800, [person("a", 0), person("b", 1)]);
    expect(shares).toEqual({ a: 900, b: 900 });
  });

  it("gives the leftover cents to the lowest-position recipients first", () => {
    // 1001 cents / 3 = 333 remainder 2 -> positions 0 and 1 get the extra cent
    const shares = splitCents(1001, [
      person("c", 2),
      person("a", 0),
      person("b", 1),
    ]);
    expect(shares).toEqual({ a: 334, b: 334, c: 333 });
    expect(shares.a + shares.b + shares.c).toBe(1001);
  });

  it("returns nothing for zero recipients", () => {
    expect(splitCents(500, [])).toEqual({});
  });
});

describe("computeSplitTotals", () => {
  it("splits a simple two-item, two-person bill with no tax/tip", () => {
    const split: Split = {
      people: [person("nina", 0), person("alex", 1)],
      items: [
        { id: "i1", priceCents: 1800, assigneeIds: ["nina", "alex"] },
        { id: "i2", priceCents: 1200, assigneeIds: ["nina"] },
      ],
      taxCents: 0,
      tipCents: 0,
    };
    const totals = computeSplitTotals(split);
    const nina = totals.find((t) => t.personId === "nina")!;
    const alex = totals.find((t) => t.personId === "alex")!;
    expect(nina.subtotalCents).toBe(900 + 1200);
    expect(alex.subtotalCents).toBe(900);
    expect(nina.totalCents).toBe(2100);
    expect(alex.totalCents).toBe(900);
  });

  it("distributes proportional tax/tip leftover cents round-robin from position 0", () => {
    // subtotals: nina $5.00, alex $3.00, sam $2.00 -> 50% / 30% / 20% of a $10.01 pool
    const split: Split = {
      people: [person("nina", 0), person("alex", 1), person("sam", 2)],
      items: [
        { id: "i1", priceCents: 500, assigneeIds: ["nina"] },
        { id: "i2", priceCents: 300, assigneeIds: ["alex"] },
        { id: "i3", priceCents: 200, assigneeIds: ["sam"] },
      ],
      taxCents: 501,
      tipCents: 500,
    };
    const totals = computeSplitTotals(split);
    const byId = Object.fromEntries(totals.map((t) => [t.personId, t]));
    // exact shares: 500.5 / 300.3 / 200.2 cents -> floors 500/300/200, 1 leftover cent -> position 0 (nina)
    expect(byId.nina.taxTipCents).toBe(501);
    expect(byId.alex.taxTipCents).toBe(300);
    expect(byId.sam.taxTipCents).toBe(200);
    const grandTotal = totals.reduce((sum, t) => sum + t.totalCents, 0);
    expect(grandTotal).toBe(1000 + 1001); // bill subtotal + tax + tip
  });

  it("gives an unassigned item to no one", () => {
    const split: Split = {
      people: [person("nina", 0)],
      items: [{ id: "i1", priceCents: 1000, assigneeIds: [] }],
      taxCents: 0,
      tipCents: 0,
    };
    const totals = computeSplitTotals(split);
    expect(totals[0].subtotalCents).toBe(0);
    expect(totals[0].totalCents).toBe(0);
  });

  it("gives a single-person split 100% of everything", () => {
    const split: Split = {
      people: [person("nina", 0)],
      items: [{ id: "i1", priceCents: 4321, assigneeIds: ["nina"] }],
      taxCents: 123,
      tipCents: 456,
    };
    const totals = computeSplitTotals(split);
    expect(totals[0].totalCents).toBe(4321 + 123 + 456);
  });

  it("always sums exactly to the bill subtotal plus tax plus tip, across randomized splits", () => {
    for (let trial = 0; trial < 200; trial++) {
      const peopleCount = 1 + Math.floor(Math.random() * 8);
      const people = Array.from({ length: peopleCount }, (_, i) =>
        person(`p${i}`, i),
      );
      const itemCount = 1 + Math.floor(Math.random() * 10);
      const items = Array.from({ length: itemCount }, (_, i) => {
        const assigneeCount = 1 + Math.floor(Math.random() * peopleCount);
        const shuffled = [...people].sort(() => Math.random() - 0.5);
        return {
          id: `i${i}`,
          priceCents: Math.floor(Math.random() * 5000),
          assigneeIds: shuffled.slice(0, assigneeCount).map((p) => p.id),
        };
      });
      const taxCents = Math.floor(Math.random() * 500);
      const tipCents = Math.floor(Math.random() * 1000);
      const split: Split = { people, items, taxCents, tipCents };

      const totals = computeSplitTotals(split);
      const billSubtotal = items.reduce((sum, i) => sum + i.priceCents, 0);
      const grandTotal = totals.reduce((sum, t) => sum + t.totalCents, 0);
      expect(grandTotal).toBe(billSubtotal + taxCents + tipCents);
    }
  });
});
