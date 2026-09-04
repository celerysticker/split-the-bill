"use client";

import { useState } from "react";
import { EditorList } from "@/components/EditorList";
import { EditorTable } from "@/components/EditorTable";
import { PersonAvatar } from "@/components/PersonAvatar";
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

type Screen = "start" | "edit" | "summary";

/**
 * Client-only interactive demo of all three screens, wired to in-memory
 * state instead of the real database (see the tech spec — Phase 2 swaps
 * this for Server Actions once a Postgres connection exists). The screen
 * switcher below is a dev convenience; production navigation is by route
 * (/, /e/[editToken], /s/[id]), not a tab strip.
 */
export default function Home() {
  const [screen, setScreen] = useState<Screen>("edit");
  const [splitName, setSplitName] = useState("Luigi's dinner");
  const [people, setPeople] = useState<UIPerson[]>(initialPeople);
  const [items, setItems] = useState<UIItem[]>(initialItems);
  const [taxCents, setTaxCents] = useState(initialTaxCents);
  const [tipCents, setTipCents] = useState(initialTipCents);
  const [organizerName, setOrganizerName] = useState("");

  function addPerson(name: string) {
    setPeople((prev) => [...prev, { id: localId("p"), name, position: prev.length }]);
  }

  function removePerson(id: string) {
    setPeople((prev) => prev.filter((p) => p.id !== id));
  }

  function addItem(name: string, priceCents: number, assigneeIds: string[] = []) {
    setItems((prev) => [...prev, { id: localId("i"), name, priceCents, assigneeIds }]);
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
  const canStartEditing = organizerName.trim() !== "" && people.length >= 1;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-4 py-8">
      <div className="flex gap-1.5 self-center rounded-lg bg-neutral-100 p-1 text-xs">
        {(["start", "edit", "summary"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScreen(s)}
            className={`rounded-md px-3 py-1 capitalize ${
              screen === s ? "bg-white font-medium shadow-sm" : "text-neutral-500"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {screen === "start" && (
        <div className="mx-auto w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-5">
          <p className="mb-4 text-center text-base font-medium">Start a new split</p>
          <p className="mb-1 text-xs text-neutral-400">Split name</p>
          <input
            value={splitName}
            onChange={(e) => setSplitName(e.target.value)}
            placeholder="e.g. Luigi's dinner"
            className="mb-4 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
          />
          <p className="mb-1.5 text-xs text-neutral-400">Who&apos;s splitting?</p>
          <div className="mb-1.5">
            <input
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div className="mb-4">
            <PillInput
              pills={people.map((p) => ({ ...p }))}
              onAdd={addPerson}
              onRemove={removePerson}
            />
          </div>
          <button
            disabled={!canStartEditing}
            onClick={() => {
              if (organizerName.trim()) {
                setPeople((prev) => [
                  { id: localId("p"), name: organizerName.trim(), position: 0 },
                  ...prev.map((p, i) => ({ ...p, position: i + 1 })),
                ]);
              }
              setScreen("edit");
            }}
            className="w-full rounded-lg bg-violet-200 py-2 text-sm font-medium text-violet-900 disabled:opacity-40"
          >
            Add items
          </button>
        </div>
      )}

      {screen === "edit" && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="mb-3 text-base font-medium">{splitName || "Untitled split"}</p>

          <div className="hidden md:flex md:gap-4">
            <div className="flex-[2.1]">
              <EditorTable people={people} items={items} onAddItem={addItem} onToggleAssignment={toggleAssignment} />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="rounded-lg bg-neutral-100 p-3 text-sm">
                <p className="mb-2 text-xs text-neutral-400">People</p>
                <div className="flex flex-col gap-1.5">
                  {people.map((p) => (
                    <span key={p.id} className="flex items-center gap-2">
                      <PersonAvatar name={p.name} position={p.position} />
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
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
            <EditorList people={people} items={items} onAddItem={(n, c) => addItem(n, c)} onToggleAssignment={toggleAssignment} />
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
      <div className="flex items-center justify-between text-neutral-500">
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
    </div>
  );
}
