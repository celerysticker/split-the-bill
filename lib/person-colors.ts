// Categorical avatar colors, cycling by position. Purely presentational —
// not the money math, so it's fine to keep separate from split-math.ts.
// `pillBg` is a shade lighter than `bg` — the pill capsule around a person
// tag is lighter than the avatar circle sitting inside it, so the icon
// reads as slightly more saturated than its own background.
const PALETTE = [
  { bg: "bg-violet-200", pillBg: "bg-violet-100", text: "text-violet-900", dot: "bg-violet-300" },
  { bg: "bg-teal-200", pillBg: "bg-teal-100", text: "text-teal-900", dot: "bg-teal-300" },
  { bg: "bg-orange-200", pillBg: "bg-orange-100", text: "text-orange-900", dot: "bg-orange-300" },
  { bg: "bg-pink-200", pillBg: "bg-pink-100", text: "text-pink-900", dot: "bg-pink-300" },
  { bg: "bg-blue-200", pillBg: "bg-blue-100", text: "text-blue-900", dot: "bg-blue-300" },
  { bg: "bg-lime-200", pillBg: "bg-lime-100", text: "text-lime-900", dot: "bg-lime-300" },
  { bg: "bg-amber-200", pillBg: "bg-amber-100", text: "text-amber-900", dot: "bg-amber-300" },
  { bg: "bg-cyan-200", pillBg: "bg-cyan-100", text: "text-cyan-900", dot: "bg-cyan-300" },
];

export function personColor(position: number) {
  return PALETTE[position % PALETTE.length];
}
