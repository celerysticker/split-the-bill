"use client";

import { useRef, useState } from "react";
import { AssignmentSheet } from "@/components/AssignmentSheet";
import { AssignmentSummaryButton } from "@/components/AssignmentSummaryButton";
import { AssignmentToggle } from "@/components/AssignmentToggle";
import {
  parseCurrencyToCents,
  parsePriceToCents,
  type UIItem,
  type UIPerson,
} from "@/lib/mock-data";
import { DESKTOP_INLINE_TOGGLE_LIMIT, fieldClass, inlineEditClass } from "@/lib/ui";

const DRAFT_SHEET_TARGET = "__draft__";

/**
 * Desktop editing — a real table with one column per person, up to
 * DESKTOP_INLINE_TOGGLE_LIMIT people. Past that, every row collapses to
 * the same compact summary + tap-to-open sheet used on mobile (PRD,
 * section 4.7) instead of one column per person indefinitely — a table
 * with a dozen toggle columns stops being scannable no matter how wide
 * the screen is.
 *
 * Adding an item is a single step when toggles are shown inline: they're
 * live from the first keystroke (tech spec, section 6.2). Tab order is
 * just DOM order: Name → Price → toggles → the confirm button → the next
 * draft row's Name, so no manual tabIndex wiring is needed.
 */
export function EditorTable({
  people,
  items,
  onAddItem,
  onUpdateItem,
  onToggleAssignment,
  onRemoveItem,
}: {
  people: UIPerson[];
  items: UIItem[];
  onAddItem: (name: string, priceCents: number, assigneeIds: string[]) => void;
  onUpdateItem: (itemId: string, updates: { name?: string; priceCents?: number }) => void;
  onToggleAssignment: (itemId: string, personId: string) => void;
  onRemoveItem: (itemId: string) => void;
}) {
  const [draftName, setDraftName] = useState("");
  const [draftPrice, setDraftPrice] = useState("");
  const [draftAssignees, setDraftAssignees] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sheetTarget, setSheetTarget] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const useSheet = people.length > DESKTOP_INLINE_TOGGLE_LIMIT;
  const columnCount = (useSheet ? 1 : people.length) + 3; // item, price, assignment(s), remove

  function toggleDraftAssignee(personId: string) {
    setDraftAssignees((prev) =>
      prev.includes(personId) ? prev.filter((id) => id !== personId) : [...prev, personId],
    );
  }

  function confirm() {
    const name = draftName.trim();
    const rawPrice = draftPrice.trim();
    const cents = rawPrice === "" ? 0 : parseCurrencyToCents(rawPrice);
    if (!name && cents === null) {
      setError("Enter an item name and a valid price");
      return;
    }
    if (!name) {
      setError("Enter an item name");
      return;
    }
    if (cents === null) {
      setError("Enter a valid price, like 9.99");
      return;
    }
    onAddItem(name, cents, draftAssignees);
    setDraftName("");
    setDraftPrice("");
    setDraftAssignees([]);
    setError(null);
    requestAnimationFrame(() => nameRef.current?.focus());
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") confirm();
  }

  const sheetIsDraft = sheetTarget === DRAFT_SHEET_TARGET;
  const sheetItem = sheetTarget && !sheetIsDraft ? items.find((i) => i.id === sheetTarget) : null;
  const sheetAssignedIds = sheetIsDraft ? draftAssignees : (sheetItem?.assigneeIds ?? []);
  const sheetItemName = sheetIsDraft ? draftName || "New item" : (sheetItem?.name ?? "");

  function sheetToggle(personId: string) {
    if (sheetIsDraft) toggleDraftAssignee(personId);
    else if (sheetItem) onToggleAssignment(sheetItem.id, personId);
  }

  function sheetSelectAll(select: boolean) {
    for (const p of people) {
      const isAssigned = sheetAssignedIds.includes(p.id);
      if (select && !isAssigned) sheetToggle(p.id);
      if (!select && isAssigned) sheetToggle(p.id);
    }
  }

  return (
    <>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-400">
            <th className="pb-2 pr-2 font-normal">Item</th>
            <th className="pb-2 pr-2 font-normal">Price</th>
            {useSheet ? (
              <th className="pb-2 pr-2 font-normal">Assigned</th>
            ) : (
              people.map((p) => (
                <th key={p.id} className="w-8 pb-2 text-center font-normal">
                  {p.name.charAt(0).toUpperCase()}
                </th>
              ))
            )}
            <th className="w-6" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-neutral-200">
              <td className="py-2 pr-2">
                <input
                  key={`${item.id}-name-${item.name}`}
                  defaultValue={item.name}
                  onBlur={(e) => {
                    const name = e.target.value.trim();
                    if (name) onUpdateItem(item.id, { name });
                    else e.target.value = item.name;
                  }}
                  onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                  className={`w-full ${inlineEditClass}`}
                />
              </td>
              <td className="py-2 pr-2 tabular-nums">
                <input
                  key={`${item.id}-price-${item.priceCents}`}
                  defaultValue={(item.priceCents / 100).toFixed(2)}
                  onBlur={(e) => {
                    const cents = parsePriceToCents(e.target.value);
                    if (cents !== null) onUpdateItem(item.id, { priceCents: cents });
                    else e.target.value = (item.priceCents / 100).toFixed(2);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                  inputMode="decimal"
                  className={`w-16 tabular-nums ${inlineEditClass}`}
                />
              </td>
              {useSheet ? (
                <td className="py-2 pr-2">
                  <AssignmentSummaryButton
                    people={people}
                    assignedIds={item.assigneeIds}
                    onClick={() => setSheetTarget(item.id)}
                  />
                </td>
              ) : (
                people.map((p) => (
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
                ))
              )}
              <td className="text-center">
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  aria-label={`Remove ${item.name}`}
                  className="cursor-pointer text-neutral-300 hover:text-red-500"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
          <tr className="border-t border-neutral-300">
            <td className={error ? "pt-2 pb-1 pr-2" : "py-2 pr-2"}>
              <input
                ref={nameRef}
                value={draftName}
                onChange={(e) => {
                  setDraftName(e.target.value);
                  setError(null);
                }}
                onKeyDown={onKeyDown}
                placeholder="Item name"
                className={`w-full ${fieldClass}`}
              />
            </td>
            <td className={error ? "pt-2 pb-1 pr-2" : "py-2 pr-2"}>
              <input
                value={draftPrice}
                onChange={(e) => {
                  setDraftPrice(e.target.value);
                  setError(null);
                }}
                onKeyDown={onKeyDown}
                placeholder="0.00"
                inputMode="decimal"
                className={`w-16 ${fieldClass}`}
              />
            </td>
            {useSheet ? (
              <td className="py-2 pr-2">
                <AssignmentSummaryButton
                  people={people}
                  assignedIds={draftAssignees}
                  onClick={() => setSheetTarget(DRAFT_SHEET_TARGET)}
                />
              </td>
            ) : (
              people.map((p) => (
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
              ))
            )}
            <td className="text-center">
              <button
                type="button"
                onClick={confirm}
                className="cursor-pointer rounded-md bg-neutral-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-neutral-700"
              >
                Add
              </button>
            </td>
          </tr>
          {error && (
            <tr>
              <td colSpan={columnCount} className="px-1 text-xs text-red-600">
                {error}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {(sheetItem || sheetIsDraft) && (
        <AssignmentSheet
          open={sheetTarget !== null}
          onClose={() => setSheetTarget(null)}
          itemName={sheetItemName}
          people={people}
          assignedIds={sheetAssignedIds}
          onToggle={sheetToggle}
          onSelectAll={sheetSelectAll}
        />
      )}
    </>
  );
}
