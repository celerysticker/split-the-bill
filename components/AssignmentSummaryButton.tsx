"use client";

import { PersonAvatar } from "@/components/PersonAvatar";
import type { UIPerson } from "@/lib/mock-data";

const PILE_SIZE = 2;

/**
 * The compact "sheet mode" trigger shown once a row has more people than
 * fit as inline toggles: an avatar pile of the first couple of assignees,
 * "+N more" for however many don't fit in the pile (omitted entirely when
 * there's no overflow), and a chevron. Tapping opens the assignment sheet.
 */
export function AssignmentSummaryButton({
  people,
  assignedIds,
  onClick,
}: {
  people: UIPerson[];
  assignedIds: string[];
  onClick: () => void;
}) {
  const shown = assignedIds.slice(0, PILE_SIZE);
  const more = assignedIds.length - shown.length;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer items-center gap-1.5 text-xs text-neutral-600"
    >
      <span className="flex">
        {shown.map((id, i) => {
          const person = people.find((p) => p.id === id);
          if (!person) return null;
          return (
            <span key={id} className={i > 0 ? "-ml-1" : ""} style={{ zIndex: shown.length - i }}>
              <PersonAvatar name={person.name} position={person.position} size="sm" />
            </span>
          );
        })}
      </span>
      {more > 0 && <span>+{more} more</span>}
      <span className="text-neutral-400">›</span>
    </button>
  );
}
