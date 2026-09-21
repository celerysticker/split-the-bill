"use client";

import { useState } from "react";
import { AssignmentSheet } from "@/components/AssignmentSheet";
import { AssignmentSummaryButton } from "@/components/AssignmentSummaryButton";
import { AssignmentToggle } from "@/components/AssignmentToggle";
import { ItemPriceInput, PriceInput } from "@/components/PriceInput";
import { parsePriceInput, type Currency, type UIItem, type UIPerson } from "@/lib/mock-data";
import { INLINE_TOGGLE_LIMIT, fieldClass, inlineEditClass } from "@/lib/ui";

/**
 * Mobile editing — stacked cards. Assignment is inline toggle boxes up to
 * two people (each column labeled with an initial); past that, every row collapses to a summary + tap-to-open
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
  onUpdateItem,
  onToggleAssignment,
  onRemoveItem,
  currency,
}: {
  people: UIPerson[];
  items: UIItem[];
  onAddItem: (name: string, priceCents: number) => void;
  onUpdateItem: (itemId: string, updates: { name?: string; priceCents?: number }) => void;
  onToggleAssignment: (itemId: string, personId: string) => void;
  onRemoveItem: (itemId: string) => void;
  currency: Currency;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftPrice, setDraftPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sheetItemId, setSheetItemId] = useState<string | null>(null);

  const useSheet = people.length > INLINE_TOGGLE_LIMIT;
  const sheetItem = items.find((i) => i.id === sheetItemId) ?? null;

  function confirm() {
    const name = draftName.trim();
    const rawPrice = draftPrice.trim();
    const cents = parsePriceInput(rawPrice);
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
    onAddItem(name, cents);
    setDraftName("");
    setDraftPrice("");
    setError(null);
    setIsAdding(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {items.length > 0 && (
        <div className="grid grid-cols-[1fr_76px_104px_16px] gap-2 px-2.5 text-[11px] uppercase tracking-wide text-neutral-400">
          <span>Item</span>
          <span>Price</span>
          {useSheet ? (
            <span>Assigned</span>
          ) : (
            <span className="flex gap-1.5">
              {people.map((p) => (
                <span key={p.id} className="w-[18px] flex-none text-center">
                  {p.name.trim().charAt(0).toUpperCase()}
                </span>
              ))}
            </span>
          )}
          <span />
        </div>
      )}
      {items.map((item) => {
        const assignedIds = item.assigneeIds;
        return (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_76px_104px_16px] items-center gap-2 rounded-lg bg-neutral-100 px-2.5 py-1.5 text-sm"
          >
            <input
              key={`${item.id}-name-${item.name}`}
              defaultValue={item.name}
              onBlur={(e) => {
                const name = e.target.value.trim();
                if (name) onUpdateItem(item.id, { name });
                else e.target.value = item.name;
              }}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              className={`min-w-0 ${inlineEditClass}`}
            />
            <ItemPriceInput
              key={`${item.id}-price-${item.priceCents}`}
              cents={item.priceCents}
              currency={currency}
              onCommit={(priceCents) => onUpdateItem(item.id, { priceCents })}
              className={`w-full text-left text-neutral-400 tabular-nums ${inlineEditClass}`}
            />
            <div className="flex min-w-0 items-center">
              {useSheet ? (
                <AssignmentSummaryButton
                  people={people}
                  assignedIds={assignedIds}
                  onClick={() => setSheetItemId(item.id)}
                />
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
            <button
              type="button"
              onClick={() => onRemoveItem(item.id)}
              aria-label={`Remove ${item.name}`}
              className="cursor-pointer text-neutral-300 hover:text-red-500"
            >
              ×
            </button>
          </div>
        );
      })}

      {isAdding ? (
        <div>
          <div className={`flex items-center gap-1.5 rounded-lg border border-neutral-300 px-2 ${error ? "pt-1.5 pb-1" : "py-1.5"}`}>
            <input
              autoFocus
              value={draftName}
              onChange={(e) => {
                setDraftName(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && confirm()}
              placeholder="Item name"
              className={`min-w-0 flex-1 ${fieldClass}`}
            />
            <PriceInput
              value={draftPrice}
              onChange={(raw) => {
                setDraftPrice(raw);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && confirm()}
              currency={currency}
              placeholder="0.00"
              className={`w-20 flex-none ${fieldClass}`}
            />
            <button
              type="button"
              onClick={confirm}
              className="flex-none cursor-pointer rounded-md bg-neutral-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-neutral-700"
            >
              Add
            </button>
          </div>
          {error && <p className="px-1 text-xs text-red-600">{error}</p>}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setIsAdding(true);
            setError(null);
          }}
          className="cursor-pointer rounded-lg border border-dashed border-neutral-300 px-2.5 py-1.5 text-left text-sm text-neutral-400"
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
