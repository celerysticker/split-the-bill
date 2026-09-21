"use client";

import { useState } from "react";
import { PersonAvatar } from "@/components/PersonAvatar";
import { computeSplitTotals, splitCents } from "@/lib/split-math";
import { formatCents, type Currency, type UIItem, type UIPerson } from "@/lib/mock-data";

/**
 * Read-only summary. Desktop shows the full itemized ledger and every
 * person's total side by side; mobile is person-first cards, all collapsed
 * by default, since there isn't room to show everything at once (PRD,
 * sections 4.5 / 4.6). Same column order as the editor: Item → Price →
 * assignment.
 */
export function SummaryView({
  people,
  items,
  taxCents,
  tipCents,
  currency,
}: {
  people: UIPerson[];
  items: UIItem[];
  taxCents: number;
  tipCents: number;
  currency: Currency;
}) {
  const totals = computeSplitTotals({ people, items, taxCents, tipCents });
  const totalsByPersonId = Object.fromEntries(totals.map((t) => [t.personId, t]));
  const billSubtotal = items.reduce((sum, i) => sum + i.priceCents, 0);
  const grandTotal = billSubtotal + taxCents + tipCents;
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  return (
    <div>
      {/* Desktop: ledger + person cards side by side */}
      <div className="hidden gap-4 md:flex">
        <div className="flex-[2.1]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-400">
                <th className="pb-1.5 pr-4 font-normal">Item</th>
                <th className="pb-1.5 pr-4 font-normal">Price</th>
                <th className="pb-1.5 font-normal">Assigned to</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-neutral-200">
                  <td className="py-1.5 pr-4">{item.name}</td>
                  <td className="whitespace-nowrap py-1.5 pr-4 tabular-nums">{formatCents(item.priceCents, currency)}</td>
                  <td className="py-1.5 text-neutral-500">
                    {item.assigneeIds
                      .map((id) => people.find((p) => p.id === id)?.name)
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-neutral-200 text-neutral-500">
                <td className="whitespace-nowrap py-1.5 pr-4">Tax + tip</td>
                <td className="whitespace-nowrap py-1.5 pr-4 tabular-nums">{formatCents(taxCents + tipCents, currency)}</td>
                <td />
              </tr>
              <tr className="border-t border-neutral-300 font-medium">
                <td className="py-1.5 pr-4">Total</td>
                <td className="whitespace-nowrap py-1.5 pr-4 tabular-nums">{formatCents(grandTotal, currency)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {people.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-neutral-100 px-3 py-2.5 text-sm"
            >
              <span className="flex items-center gap-2">
                <PersonAvatar name={p.name} position={p.position} />
                {p.name}
              </span>
              <span className="font-medium tabular-nums">
                {formatCents(totalsByPersonId[p.id]?.totalCents ?? 0, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: person-first cards, all collapsed */}
      <div className="flex flex-col gap-1.5 md:hidden">
        {people.map((p) => {
          const isExpanded = expandedIds.includes(p.id);
          const total = totalsByPersonId[p.id];
          const personItems = items.filter((i) => i.assigneeIds.includes(p.id));
          return (
            <div key={p.id} className="rounded-lg bg-neutral-100 px-3 py-2 text-sm">
              <button
                type="button"
                onClick={() =>
                  setExpandedIds((prev) =>
                    isExpanded ? prev.filter((id) => id !== p.id) : [...prev, p.id],
                  )
                }
                className="flex w-full cursor-pointer items-center justify-between gap-3"
              >
                <span className="flex items-center gap-2">
                  <PersonAvatar name={p.name} position={p.position} />
                  {p.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="font-medium tabular-nums">
                    {formatCents(total?.totalCents ?? 0, currency)}
                  </span>
                  <span className="text-neutral-400">{isExpanded ? "⌄" : "›"}</span>
                </span>
              </button>
              {isExpanded && (
                <div className="mt-1.5 flex flex-col gap-1 border-t border-neutral-200 pt-1.5 text-xs text-neutral-500">
                  {personItems.map((item) => {
                    const assignees = item.assigneeIds
                      .map((id) => people.find((person) => person.id === id))
                      .filter((person): person is UIPerson => person !== undefined);
                    const share = splitCents(item.priceCents, assignees)[p.id] ?? 0;
                    return (
                      <div key={item.id} className="flex justify-between gap-3">
                        <span>{item.name}</span>
                        <span className="tabular-nums">{formatCents(share, currency)}</span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between gap-3">
                    <span>Tax + tip share</span>
                    <span className="tabular-nums">
                      {formatCents(total?.taxTipCents ?? 0, currency)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div className="mt-1 flex justify-between border-t border-neutral-200 pt-2 text-sm font-medium">
          <span>Total</span>
          <span className="tabular-nums">{formatCents(grandTotal, currency)}</span>
        </div>
      </div>
    </div>
  );
}
