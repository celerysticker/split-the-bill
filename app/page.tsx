"use client";

import { useState } from "react";
import { EditorList } from "@/components/EditorList";
import { EditorTable } from "@/components/EditorTable";
import { PillInput } from "@/components/PillInput";
import { PriceInput } from "@/components/PriceInput";
import { SplitTheBillTitle } from "@/components/SplitTheBillTitle";
import { SummaryView } from "@/components/SummaryView";
import {
  formatCents,
  initialItems,
  initialPeople,
  initialTaxCents,
  initialTipCents,
  localId,
  parsePriceInput,
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
                currency={currency}
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
              currency={currency}
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
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="min-w-0 break-words text-xl font-medium">
              {splitName || "Untitled split"}
            </h2>
            <button
              onClick={() => setScreen("edit")}
              className="flex-none cursor-pointer rounded-lg border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-600"
            >
              Edit
            </button>
          </div>
          <SummaryView
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
  return (
    <div className="rounded-lg bg-neutral-100 p-3 text-sm">
      <div className="mb-1.5 flex justify-between text-neutral-500">
        <span>Subtotal</span>
        <span className="tabular-nums">{formatCents(subtotal, currency)}</span>
      </div>
      <MoneyRow
        key={`tax-${taxCents}`}
        label="Tax"
        cents={taxCents}
        onCommit={setTaxCents}
        currency={currency}
      />
      <MoneyRow
        key={`tip-${tipCents}`}
        label="Tip"
        cents={tipCents}
        onCommit={setTipCents}
        currency={currency}
      />
      <div className="flex justify-between border-t border-neutral-300 pt-1.5 font-medium text-neutral-900">
        <span>Total</span>
        <span className="tabular-nums">{formatCents(subtotal + taxCents + tipCents, currency)}</span>
      </div>
    </div>
  );
}

/**
 * A labeled amount field (tax or tip). Empty is $0.00 and shows the "0.00"
 * placeholder; otherwise it shows the currency symbol once you click out.
 * Give it a `key` that includes the saved amount so it resets on commit.
 */
function MoneyRow({
  label,
  cents,
  onCommit,
  currency,
}: {
  label: string;
  cents: number;
  onCommit: (cents: number) => void;
  currency: Currency;
}) {
  const [raw, setRaw] = useState(cents === 0 ? "" : (cents / 100).toFixed(2));
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mb-1.5">
      <div className="flex items-center justify-between text-neutral-500">
        <span>{label}</span>
        <PriceInput
          value={raw}
          onChange={(next) => {
            setRaw(next);
            setError(null);
          }}
          onBlur={() => {
            const parsed = parsePriceInput(raw);
            if (parsed === null) setError("Enter a valid amount, like 5.00");
            else onCommit(parsed);
          }}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          currency={currency}
          placeholder="0.00"
          className={`w-20 text-right ${fieldClass}`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
