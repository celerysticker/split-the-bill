import { personColor } from "@/lib/person-colors";

/**
 * Per-person assignment checkbox: a rounded square that fills with the
 * person's color and shows a check when assigned, and is a plain bordered
 * box (darkening on hover) when not.
 */
export function AssignmentToggle({
  position,
  name,
  assigned,
  onToggle,
  disabled = false,
}: {
  position: number;
  name: string;
  assigned: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  const color = personColor(position);
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={assigned}
      aria-label={`${assigned ? "Unassign" : "Assign"} ${name}`}
      className={`flex h-[18px] w-[18px] flex-none items-center justify-center rounded transition-colors ${
        assigned
          ? `${color.dot} ${color.text}`
          : "border border-neutral-300 bg-white hover:border-neutral-500 hover:bg-neutral-100"
      } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
    >
      {assigned && (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M2.5 6.5 5 9l4.5-5.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
