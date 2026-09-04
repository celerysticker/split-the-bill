import { personColor } from "@/lib/person-colors";

export function PersonAvatar({
  name,
  position,
  size = "md",
}: {
  name: string;
  position: number;
  size?: "sm" | "md";
}) {
  const color = personColor(position);
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const dims = size === "sm" ? "h-4 w-4 text-[9px]" : "h-6 w-6 text-[11px]";

  return (
    <span
      className={`inline-flex ${dims} flex-none items-center justify-center rounded-full font-medium ${color.bg} ${color.text}`}
    >
      {initial}
    </span>
  );
}
