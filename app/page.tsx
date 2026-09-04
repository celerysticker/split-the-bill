"use client";

import { useState } from "react";
import { EditorList } from "@/components/EditorList";
import { EditorTable } from "@/components/EditorTable";
import { PillInput } from "@/components/PillInput";
import { SummaryView } from "@/components/SummaryView";
import {
  formatCents,
  initialItems,
  initialPeople,
  initialTaxCents,
  initialTipCents,
  localId,
  parsePriceToCents,
  type UIItem,
  type UIPerson,
} from "@/lib/mock-data";

type Screen = "edit" | "summary";

/**
 * Client-only interactive demo of the app, wired to in-memory state instead
 * of the real database (see the tech spec — Phase 2 swaps this for Server
 * Actions once a Postgres connection exists). Edit and Summary are the only
 * two screens — Start is folded into the top of Edit, and navigation
 * between them is by explicit action (Share summary / Edit), not a tab
 * strip, matching how the real routes will work.
 */
export default function Home() {
  const [screen, setScreen] = useState<Screen>("edit");
  const [splitName, setSplitName] = useState("Luigi's dinner");
  const [people, setPeople] = useState<UIPerson[]>(initialPeople);
  const [items, setItems] = useState<UIItem[]>(initialItems);
  const [taxCents, setTaxCents] = useState(initialTaxCents);
  const [tipCents, setTipCents] = useState(initialTipCents);

  function addPerson(name: string) {
    setPeople((prev) => [...prev, { id: localId("p"), name, position: prev.length }]);
  }

  function removePerson(id: string) {
    setPeople((prev) =>
      prev.filter((p) => p.id !== id).map((p, i) => ({ ...p, position: i })),
    );
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        assigneeIds: item.assigneeIds.filter((pid) => pid !== id),
      })),
    );
  }

  function addItem(name: string, priceCents: number, assigneeIds: string[] = []) {
    setItems((prev) => [...prev, { id: localId("i"), name, priceCents, assigneeIds }]);
  }

  function removeItem(itemId: string) {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  function toggleAssignment(itemId: string, personId: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id !== itemId
          ? item
          : {
              ...item,
              assigneeIds: item.assigneeIds.includes(personId)
                ? item.assigneeIds.filter((id) => id !== personId)
                : [...item.assigneeIds, personId],
            },
      ),
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.priceCents, 0);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-4 py-8">
      {screen === "edit" && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <input
            value={splitName}
            onChange={(e) => setSplitName(e.target.value)}
            placeholder="Name this split"
            className="mb-3 w-full border-none p-0 text-base font-medium outline-none"
          />

          <div className="mb-3 rounded-lg bg-neutral-100 p-3">
            <p className="mb-1.5 text-xs text-neutral-400">Who&apos;s splitting?</p>
            <PillInput pills={people} onAdd={addPerson} onRemove={removePerson} />
          </div>

          <div className="hidden md:flex md:gap-4">
            <div className="flex-[2.1]">
              <EditorTable
                people={people}
                items={items}
                onAddItem={addItem}
                onToggleAssignment={toggleAssignment}
                onRemoveItem={removeItem}
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <TaxTipCard subtotal={subtotal} taxCents={taxCents} tipCents={tipCents} setTaxCents={setTaxCents} setTipCents={setTipCents} />
              <button
                onClick={() => setScreen("summary")}
                className="w-full rounded-lg bg-violet-200 py-2 text-sm font-medium text-violet-900"
              >
                Share summary
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            <EditorList
              people={people}
              items={items}
              onAddItem={(n, c) => addItem(n, c)}
              onToggleAssignment={toggleAssignment}
              onRemoveItem={removeItem}
            />
            <TaxTipCard subtotal={subtotal} taxCents={taxCents} tipCents={tipCents} setTaxCents={setTaxCents} setTipCents={setTipCents} />
            <button
              onClick={() => setScreen("summary")}
              className="w-full rounded-lg bg-violet-200 py-2 text-sm font-medium text-violet-900"
            >
              Share summary
            </button>
          </div>
        </div>
      )}

      {screen === "summary" && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex-1" />
            <button
              onClick={() => setScreen("edit")}
              className="rounded-lg border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-600"
            >
              Edit
            </button>
          </div>
          <SummaryView
            splitName={splitName || "Untitled split"}
            people={people}
            items={items}
            taxCents={taxCents}
            tipCents={tipCents}
          />
        </div>
      )}
    </main>
  );
}

function TaxTipCard({
  subtotal,
  taxCents,
  tipCents,
  setTaxCents,
  setTipCents,
}: {
  subtotal: number;
  taxCents: number;
  tipCents: number;
  setTaxCents: (cents: number) => void;
  setTipCents: (cents: number) => void;
}) {
  return (
    <div className="rounded-lg bg-neutral-100 p-3 text-sm">
      <div className="mb-1.5 flex justify-between text-neutral-500">
        <span>Subtotal</span>
        <span className="tabular-nums">{formatCents(subtotal)}</span>
      </div>
      <div className="mb-1.5 flex items-center justify-between text-neutral-500">
        <span>Tax</span>
        <input
          defaultValue={formatCents(taxCents).replace(/[^0-9.]/g, "")}
          onBlur={(e) => {
            const cents = parsePriceToCents(e.target.value);
            if (cents !== null) setTaxCents(cents);
          }}
          className="w-16 rounded border border-neutral-300 px-1.5 py-0.5 text-right text-sm"
        />
      </div>
      <div className="mb-1.5 flex items-center justify-between text-neutral-500">
        <span>Tip</span>
        <input
          defaultValue={formatCents(tipCents).replace(/[^0-9.]/g, "")}
          onBlur={(e) => {
            const cents = parsePriceToCents(e.target.value);
            if (cents !== null) setTipCents(cents);
          }}
          className="w-16 rounded border border-neutral-300 px-1.5 py-0.5 text-right text-sm"
        />
      </div>
      <div className="flex justify-between border-t border-neutral-300 pt-1.5 font-medium text-neutral-900">
        <span>Total</span>
        <span className="tabular-nums">{formatCents(subtotal + taxCents + tipCents)}</span>
      </div>
    </div>
  );
}
