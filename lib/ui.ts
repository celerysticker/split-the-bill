// Shared input styling so every field in the app focuses the same way:
// grey border at rest, blue border + ring on focus. `fieldClass` is for
// fields that always look like a form control (title, tax/tip, "add
// item"). `inlineEditClass` is for fields editing something that already
// looks like plain text (an existing item's name/price) — transparent
// until hovered or focused, so it doesn't read as a form until touched.

const focusRing =
  "outline-none transition-colors focus:border-blue-400 focus:ring-1 focus:ring-blue-400";

export const fieldClass = `rounded border border-neutral-300 bg-white px-2 py-1 text-sm ${focusRing}`;

export const inlineEditClass = `rounded border border-transparent bg-transparent px-1 py-0.5 -mx-1 hover:border-neutral-200 ${focusRing}`;
