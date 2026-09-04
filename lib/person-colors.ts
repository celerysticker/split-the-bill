// Categorical avatar colors, cycling by position. Purely presentational —
// not the money math, so it's fine to keep separate from split-math.ts.
const PALETTE = [
  { bg: "bg-violet-200", text: "text-violet-900", dot: "bg-violet-300" },
  { bg: "bg-teal-200", text: "text-teal-900", dot: "bg-teal-300" },
  { bg: "bg-orange-200", text: "text-orange-900", dot: "bg-orange-300" },
  { bg: "bg-pink-200", text: "text-pink-900", dot: "bg-pink-300" },
  { bg: "bg-blue-200", text: "text-blue-900", dot: "bg-blue-300" },
  { bg: "bg-lime-200", text: "text-lime-900", dot: "bg-lime-300" },
  { bg: "bg-amber-200", text: "text-amber-900", dot: "bg-amber-300" },
  { bg: "bg-cyan-200", text: "text-cyan-900", dot: "bg-cyan-300" },
];

export function personColor(position: number) {
  return PALETTE[position % PALETTE.length];
}
