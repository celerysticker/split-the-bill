"use client";

import { useState } from "react";
import { AssignmentSheet } from "@/components/AssignmentSheet";
import { AssignmentToggle } from "@/components/AssignmentToggle";
import { PersonAvatar } from "@/components/PersonAvatar";
import { formatCents, parsePriceToCents, type UIItem, type UIPerson } from "@/lib/mock-data";

const INLINE_TOGGLE_LIMIT = 4;

/**
 * Mobile editing — stacked cards. Assignment is inline toggle circles up to
 * four people; past that, every row collapses to a summary + tap-to-open
 * sheet (PRD, section 4.7), so assignment stays equally fast for everyone
 * rather than favoring whoever fits in the first few slots.
 *
 * Adding an item is two steps (PRD, section 4.4): name & price only, no
 * toggles on screen at all — the saved row is what has toggles to tap.
 */
export function EditorList({
  people,
  items,
  onAddItem,
  onToggleAssignment,
}: {
  people: UIPerson[];
  items: UIItem[];
  onAddItem: (name: string, priceCents: number) => void;
  onToggleAssignment: (itemId: string, personId: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftPrice, setDraftPrice] = useState("");
  const [sheetItemId, setSheetItemId] = useState<string | null>(null);

  const useSheet = people.length > INLINE_TOGGLE_LIMIT;
  const sheetItem = items.find((i) => i.id === sheetItemId) ?? null;

  function confirm() {
    const cents = parsePriceToCents(draftPrice);
    if (draftName.trim() === "" || cents === null) return;
    onAddItem(draftName.trim(), cents);
    setDraftName("");
    setDraftPrice("");
    setIsAdding(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => {
        const assignedIds = item.assigneeIds;
        return (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg bg-neutral-100 px-2.5 py-1.5 text-sm"
          >
            <span>
              {item.name} <span className="text-neutral-400">{formatCents(item.priceCents)}</span>
            </span>
            {useSheet ? (
              <button
                type="button"
                onClick={() => setSheetItemId(item.id)}
                className="flex items-center gap-1.5 text-xs text-neutral-600"
              >
                <span className="flex">
                  {assignedIds.slice(0, 2).map((id, i) => {
                    const person = people.find((p) => p.id === id);
                    if (!person) return null;
                    return (
                      <span
                        key={id}
                        className={i > 0 ? "-ml-1" : ""}
                        style={{ zIndex: 2 - i }}
                      >
                        <PersonAvatar name={person.name} position={person.position} size="sm" />
                      </span>
                    );
                  })}
                </span>
                <span>{assignedIds.length} assigned</span>
                <span className="text-neutral-400">›</span>
              </button>
            ) : (
              <span className="flex gap-1.5">
                {people.map((p) => (
                  <AssignmentToggle
                    key={p.id}
                    position={p.position}
                    name={p.name}
                    assigned={assignedIds.includes(p.id)}
                    onToggle={() => onToggleAssignment(item.id, p.id)}
                  />
                ))}
              </span>
            )}
          </div>
        );
      })}

      {isAdding ? (
        <div className="flex items-center gap-1.5 rounded-lg border border-blue-400 px-2 py-1.5">
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirm()}
            placeholder="Item name"
            className="min-w-0 flex-1 rounded border border-blue-400 px-2 py-1 text-sm outline-none"
          />
          <input
            value={draftPrice}
            onChange={(e) => setDraftPrice(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirm()}
            placeholder="0.00"
            inputMode="decimal"
            className="w-14 flex-none rounded border border-neutral-300 px-2 py-1 text-sm outline-none"
          />
          <button
            type="button"
            onClick={confirm}
            aria-label="Save item"
            className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-green-200 text-xs text-green-900"
          >
            ✓
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="rounded-lg border border-dashed border-neutral-300 px-2.5 py-1.5 text-left text-sm text-neutral-400"
        >
          + Add item
        </button>
      )}

      {sheetItem && (
        <AssignmentSheet
          open={sheetItemId !== null}
          onClose={() => setSheetItemId(null)}
          itemName={sheetItem.name}
          people={people}
          assignedIds={sheetItem.assigneeIds}
          onToggle={(personId) => onToggleAssignment(sheetItem.id, personId)}
          onSelectAll={(select) => {
            for (const p of people) {
              const isAssigned = sheetItem.assigneeIds.includes(p.id);
              if (select && !isAssigned) onToggleAssignment(sheetItem.id, p.id);
              if (!select && isAssigned) onToggleAssignment(sheetItem.id, p.id);
            }
          }}
        />
      )}
    </div>
  );
}
