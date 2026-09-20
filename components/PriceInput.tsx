"use client";

import { useRef, useState } from "react";
import { formatCents, parsePriceInput, type Currency } from "@/lib/mock-data";

// Only digits with at most two decimal places can be typed — no currency
// symbol, no commas, no minus sign.
const TYPING_RE = /^\d*(\.\d{0,2})?$/;

function toRaw(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * A price field that shows the currency symbol once you're done typing:
 * while focused it's a plain number you can edit ("35.00"), and on blur it
 * displays formatted ("$35.00"). The parent owns the raw typed text.
 */
export function PriceInput({
  value,
  onChange,
  onBlur,
  onKeyDown,
  currency,
  placeholder,
  className,
}: {
  value: string;
  onChange: (raw: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  currency: Currency;
  placeholder?: string;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);
  const wasFocusedOnMouseDown = useRef(false);

  const cents = parsePriceInput(value);
  const display =
    focused || value.trim() === "" || cents === null ? value : formatCents(cents, currency);

  return (
    <input
      value={display}
      onChange={(e) => {
        if (TYPING_RE.test(e.target.value)) onChange(e.target.value);
      }}
      onMouseDown={(e) => {
        wasFocusedOnMouseDown.current = document.activeElement === e.currentTarget;
      }}
      onMouseUp={(e) => {
        // Keep the select-all from focusing: without this, releasing the
        // click drops the caret and clears the selection.
        if (!wasFocusedOnMouseDown.current) e.preventDefault();
      }}
      onFocus={(e) => {
        setFocused(true);
        // Select after React swaps "$35.00" for "35.00", which would
        // otherwise reset the selection.
        const input = e.target;
        requestAnimationFrame(() => input.select());
      }}
      onBlur={() => {
        setFocused(false);
        onBlur?.();
      }}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      inputMode="decimal"
      className={className}
    />
  );
}

/**
 * PriceInput for a saved item: holds its own typed text and commits the new
 * price on blur (reverting if what's typed isn't a valid amount). Give it a
 * `key` that includes the saved price so it resets when the price changes.
 */
export function ItemPriceInput({
  cents,
  onCommit,
  currency,
  className,
}: {
  cents: number;
  onCommit: (cents: number) => void;
  currency: Currency;
  className?: string;
}) {
  const [raw, setRaw] = useState(toRaw(cents));

  return (
    <PriceInput
      value={raw}
      onChange={setRaw}
      onBlur={() => {
        const parsed = parsePriceInput(raw);
        if (parsed === null) setRaw(toRaw(cents));
        else {
          setRaw(toRaw(parsed));
          if (parsed !== cents) onCommit(parsed);
        }
      }}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      currency={currency}
      className={className}
    />
  );
}
