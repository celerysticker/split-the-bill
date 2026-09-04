"use client";

import { useRef, useState } from "react";
import { AssignmentToggle } from "@/components/AssignmentToggle";
import { formatCents, parsePriceToCents, type UIItem, type UIPerson } from "@/lib/mock-data";

/**
 * Desktop editing — a real table with one column per person. Adding an item
 * is a single step: the toggles are live from the first keystroke (tech
 * spec, section 6.2). Tab order is just DOM order: Name → Price → toggles →
 * the confirm button → the next draft row's Name, so no manual tabIndex
 * wiring is needed.
 */
export function EditorTable({
  people,
  items,
  onAddItem,
  onToggleAssignment,
  onRemoveItem,
}: {
  people: UIPerson[];
  items: UIItem[];
  onAddItem: (name: string, priceCents: number, assigneeIds: string[]) => void;
  onToggleAssignment: (itemId: string, personId: string) => void;
  onRemoveItem: (itemId: string) => void;
}) {
  const [draftName, setDraftName] = useState("");
  const [draftPrice, setDraftPrice] = useState("");
  const [draftAssignees, setDraftAssignees] = useState<string[]>([]);
  const nameRef = useRef<HTMLInputElement>(null);

  function toggleDraftAssignee(personId: string) {
    setDraftAssignees((prev) =>
      prev.includes(personId) ? prev.filter((id) => id !== personId) : [...prev, personId],
    );
  }

  function confirm() {
    const cents = parsePriceToCents(draftPrice);
    if (draftName.trim() === "" || cents === null) return;
    onAddItem(draftName.trim(), cents, draftAssignees);
    setDraftName("");
    setDraftPrice("");
    setDraftAssignees([]);
    requestAnimationFrame(() => nameRef.current?.focus());
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") confirm();
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-400">
          <th className="pb-2 pr-2 font-normal">Item</th>
          <th className="pb-2 pr-2 font-normal">Price</th>
          {people.map((p) => (
            <th key={p.id} className="w-8 pb-2 text-center font-normal">
              {p.name.charAt(0).toUpperCase()}
            </th>
          ))}
          <th className="w-6" />
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="border-t border-neutral-200">
            <td className="py-2 pr-2">{item.name}</td>
            <td className="py-2 pr-2 tabular-nums">{formatCents(item.priceCents)}</td>
            {people.map((p) => (
              <td key={p.id} className="text-center">
                <div className="flex justify-center">
                  <AssignmentToggle
                    position={p.position}
                    name={p.name}
                    assigned={item.assigneeIds.includes(p.id)}
                    onToggle={() => onToggleAssignment(item.id, p.id)}
                  />
                </div>
              </td>
            ))}
            <td className="text-center">
              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                aria-label={`Remove ${item.name}`}
                className="text-neutral-300 hover:text-red-500"
              >
                ×
              </button>
            </td>
          </tr>
        ))}
        <tr className="border-t border-blue-400">
          <td className="py-2 pr-2">
            <input
              ref={nameRef}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Item name"
              className="w-full rounded border border-blue-400 px-2 py-1 text-sm outline-none"
            />
          </td>
          <td className="py-2 pr-2">
            <input
              value={draftPrice}
              onChange={(e) => setDraftPrice(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="0.00"
              inputMode="decimal"
              className="w-16 rounded border border-neutral-300 px-2 py-1 text-sm outline-none"
            />
          </td>
          {people.map((p) => (
            <td key={p.id} className="text-center">
              <div className="flex justify-center">
                <AssignmentToggle
                  position={p.position}
                  name={p.name}
                  assigned={draftAssignees.includes(p.id)}
                  onToggle={() => toggleDraftAssignee(p.id)}
                />
              </div>
            </td>
          ))}
          <td className="text-center">
            <button
              type="button"
              onClick={confirm}
              aria-label="Add item"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-200 text-xs text-green-900"
            >
              ✓
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
