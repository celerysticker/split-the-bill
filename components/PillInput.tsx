"use client";

import { useState } from "react";
import { PersonAvatar } from "@/components/PersonAvatar";
import { personColor } from "@/lib/person-colors";

function capitalizeWords(name: string) {
  return name.replace(/(^|\s)(\S)/g, (_, space, ch) => space + ch.toUpperCase());
}

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
  placeholder = "Add person…",
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
    onAdd(capitalizeWords(name));
    setDraft("");
  }

  // Mobile keyboards often don't report "," as a keydown key, so a comma
  // typed mid-field would leave "alice, bob" in one input with only the
  // first letter auto-capitalized. Commit each comma-terminated token as
  // its own pill so the field is empty (and auto-capitalizes) again.
  function handleChange(value: string) {
    if (!value.includes(",")) {
      setDraft(value);
      return;
    }
    const parts = value.split(",");
    const rest = parts.pop() ?? "";
    for (const part of parts) {
      const name = part.trim();
      if (name) onAdd(capitalizeWords(name));
    }
    setDraft(rest.trimStart());
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
        onChange={(e) => handleChange(e.target.value)}
        autoCapitalize="words"
        autoComplete="off"
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
