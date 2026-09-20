"use client";

import { useState } from "react";
import { EditorList } from "@/components/EditorList";
import { EditorTable } from "@/components/EditorTable";
import { PillInput } from "@/components/PillInput";
import { SplitTheBillTitle } from "@/components/SplitTheBillTitle";
import { SummaryView } from "@/components/SummaryView";
import {
  formatCents,
  initialItems,
  initialPeople,
  initialTaxCents,
  initialTipCents,
  localId,
  parseCurrencyToCents,
  type Currency,
  type UIItem,
  type UIPerson,
} from "@/lib/mock-data";
import { fieldClass, inlineEditClass } from "@/lib/ui";

type Screen = "edit" | "summary";

/**
 * The whole app: all state lives in memory in this component, with no
 * backend. Edit and Summary are the only two screens — the people list is
 * part of Edit, and you move between them with explicit actions (Share
 * summary / Edit) rather than a tab strip.
 */
export default function Home() {
  const [screen, setScreen] = useState<Screen>("edit");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [splitName, setSplitName] = useState("");
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

  function updateItem(itemId: string, updates: { name?: string; priceCents?: number }) {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
    );
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
      <SplitTheBillTitle className="h-9 w-auto self-center text-neutral-900" />
      {screen === "edit" && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <input
              value={splitName}
              onChange={(e) => setSplitName(e.target.value)}
              placeholder="Name this split"
              className={`flex-1 text-base font-medium ${inlineEditClass}`}
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              aria-label="Currency"
              className={`text-xs ${fieldClass}`}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          <div className="mb-3">
            <p className="mb-1.5 text-xs text-neutral-400">Who&apos;s splitting?</p>
            <PillInput pills={people} onAdd={addPerson} onRemove={removePerson} />
          </div>

          <div className="hidden md:flex md:gap-4">
            <div className="flex-[2.1]">
              <EditorTable
                people={people}
                items={items}
                onAddItem={addItem}
                onUpdateItem={updateItem}
                onToggleAssignment={toggleAssignment}
                onRemoveItem={removeItem}
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <TaxTipCard subtotal={subtotal} taxCents={taxCents} tipCents={tipCents} setTaxCents={setTaxCents} setTipCents={setTipCents} currency={currency} />
              <button
                onClick={() => setScreen("summary")}
                className="w-full cursor-pointer rounded-lg bg-neutral-600 py-2 text-sm font-medium text-white hover:bg-neutral-700"
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
              onUpdateItem={updateItem}
              onToggleAssignment={toggleAssignment}
              onRemoveItem={removeItem}
            />
            <TaxTipCard subtotal={subtotal} taxCents={taxCents} tipCents={tipCents} setTaxCents={setTaxCents} setTipCents={setTipCents} currency={currency} />
            <button
              onClick={() => setScreen("summary")}
              className="w-full cursor-pointer rounded-lg bg-neutral-600 py-2 text-sm font-medium text-white hover:bg-neutral-700"
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
              className="cursor-pointer rounded-lg border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-600"
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
            currency={currency}
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
  currency,
}: {
  subtotal: number;
  taxCents: number;
  tipCents: number;
  setTaxCents: (cents: number) => void;
  setTipCents: (cents: number) => void;
  currency: Currency;
}) {
  const [taxError, setTaxError] = useState<string | null>(null);
  const [tipError, setTipError] = useState<string | null>(null);

  return (
    <div className="rounded-lg bg-neutral-100 p-3 text-sm">
      <div className="mb-1.5 flex justify-between text-neutral-500">
        <span>Subtotal</span>
        <span className="tabular-nums">{formatCents(subtotal, currency)}</span>
      </div>
      <div className="mb-1.5">
        <div className="flex items-center justify-between text-neutral-500">
          <span>Tax</span>
          <input
            key={`tax-${taxCents}`}
            defaultValue={taxCents === 0 ? "" : (taxCents / 100).toFixed(2)}
            placeholder="0.00"
            onChange={() => setTaxError(null)}
            onBlur={(e) => {
              const raw = e.target.value.trim();
              const cents = raw === "" ? 0 : parseCurrencyToCents(raw);
              if (cents === null) setTaxError("Enter a valid amount, like 5.00");
              else setTaxCents(cents);
            }}
            className={`w-16 text-right ${fieldClass}`}
          />
        </div>
        {taxError && <p className="mt-1 text-xs text-red-600">{taxError}</p>}
      </div>
      <div className="mb-1.5">
        <div className="flex items-center justify-between text-neutral-500">
          <span>Tip</span>
          <input
            key={`tip-${tipCents}`}
            defaultValue={tipCents === 0 ? "" : (tipCents / 100).toFixed(2)}
            placeholder="0.00"
            onChange={() => setTipError(null)}
            onBlur={(e) => {
              const raw = e.target.value.trim();
              const cents = raw === "" ? 0 : parseCurrencyToCents(raw);
              if (cents === null) setTipError("Enter a valid amount, like 5.00");
              else setTipCents(cents);
            }}
            className={`w-16 text-right ${fieldClass}`}
          />
        </div>
        {tipError && <p className="mt-1 text-xs text-red-600">{tipError}</p>}
      </div>
      <div className="flex justify-between border-t border-neutral-300 pt-1.5 font-medium text-neutral-900">
        <span>Total</span>
        <span className="tabular-nums">{formatCents(subtotal + taxCents + tipCents, currency)}</span>
      </div>
    </div>
  );
}
