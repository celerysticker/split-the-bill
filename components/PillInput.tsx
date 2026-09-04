"use client";

import { useState } from "react";
import { PersonAvatar } from "@/components/PersonAvatar";
import { personColor } from "@/lib/person-colors";

export type Pill = { id: string; name: string; position: number };

/**
 * Wrapping pill/chip input for "who's splitting" — the same component at
 * any width; on a narrow phone the pills just wrap to a second line (PRD,
 * section 4.1). Enter or comma commits a pill; backspace on an empty field
 * removes the last one.
 */
export function PillInput({
  pills,
  onAdd,
  onRemove,
  placeholder = "Add another…",
}: {
  pills: Pill[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const name = draft.trim();
    if (name === "") return;
    onAdd(name);
    setDraft("");
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-neutral-300 p-1.5 transition-colors focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
      {pills.map((pill) => {
        const color = personColor(pill.position);
        return (
          <span
            key={pill.id}
            className={`flex items-center gap-1.5 rounded-full ${color.pillBg} ${color.text} py-1 pl-2.5 pr-1.5 text-xs`}
          >
            <PersonAvatar name={pill.name} position={pill.position} size="sm" />
            {pill.name}
            <button
              type="button"
              onClick={() => onRemove(pill.id)}
              aria-label={`Remove ${pill.name}`}
              className={`cursor-pointer ${color.text} hover:opacity-70`}
            >
              ×
            </button>
          </span>
        );
      })}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && draft === "" && pills.length > 0) {
            onRemove(pills[pills.length - 1].id);
          }
        }}
        onBlur={commit}
        placeholder={placeholder}
        className="min-w-[90px] flex-1 border-none bg-transparent px-1 py-1 text-sm outline-none"
      />
    </div>
  );
}
