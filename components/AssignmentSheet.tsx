"use client";

import { useEffect, useRef } from "react";
import { PersonAvatar } from "@/components/PersonAvatar";
import type { UIPerson } from "@/lib/mock-data";

/**
 * The >4-person fallback (mobile only — see the PRD, section 4.7): a native
 * <dialog> checklist with a "select all" shortcut, instead of inline
 * per-person toggle circles that stop fitting past four people.
 */
export function AssignmentSheet({
  open,
  onClose,
  itemName,
  people,
  assignedIds,
  onToggle,
  onSelectAll,
}: {
  open: boolean;
  onClose: () => void;
  itemName: string;
  people: UIPerson[];
  assignedIds: string[];
  onToggle: (personId: string) => void;
  onSelectAll: (select: boolean) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const allSelected = people.length > 0 && assignedIds.length === people.length;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="w-72 rounded-xl border border-neutral-200 bg-white p-4 backdrop:bg-black/40"
    >
      <p className="mb-3 text-xs text-neutral-500">Assign — {itemName}</p>
      <label className="mb-1.5 flex cursor-pointer items-center gap-2 rounded-lg bg-neutral-100 px-2 py-1.5 text-sm font-medium">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => onSelectAll(e.target.checked)}
          className="cursor-pointer"
        />
        Select all
      </label>
      <div className="flex flex-col gap-1.5">
        {people.map((p) => (
          <label
            key={p.id}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-neutral-100 px-2 py-1.5 text-sm"
          >
            <input
              type="checkbox"
              checked={assignedIds.includes(p.id)}
              onChange={() => onToggle(p.id)}
              className="cursor-pointer"
            />
            <PersonAvatar name={p.name} position={p.position} size="sm" />
            {p.name}
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 w-full cursor-pointer rounded-lg border border-neutral-300 py-1.5 text-sm font-medium"
      >
        Done
      </button>
    </dialog>
  );
}
