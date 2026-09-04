import { personColor } from "@/lib/person-colors";

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
      className={`h-4 w-4 flex-none rounded-full transition ${
        assigned
          ? `${color.dot} border border-transparent`
          : "border border-dashed border-neutral-400 hover:border-neutral-600"
      } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
    />
  );
}
