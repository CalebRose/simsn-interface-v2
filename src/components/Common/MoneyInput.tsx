import { FC, useId, useLayoutEffect, useRef, useState } from "react";

// ═══════════════════════════════════════════════
// MoneyInput: whole-dollar entry built for phones.
//
//  - 16px text, so iOS Safari doesn't zoom the page when the field is tapped.
//  - Number keypad (inputMode="numeric"), with thousands separators kept while
//    typing and the caret held in place as they're inserted.
//  - On a physical keyboard, shorthand like "12.5m" or "750k" also works.
//  - Optional quick buttons ("His ask", "+$1M", ...) so most offers need no
//    typing at all.
// Used by the baseball and volleyball contract forms.
// ═══════════════════════════════════════════════

export interface MoneyPreset {
  label: string;
  /** Given the current value (0 when empty), returns the new one. */
  apply: (current: number) => number;
  title?: string;
}

export interface MoneyInputProps {
  /** Whole dollars; null when the field is empty. */
  value: number | null;
  onChange: (value: number | null) => void;
  label?: string;
  /** Accessible name when there's no visible label (e.g. in a table cell). */
  ariaLabel?: string;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  presets?: MoneyPreset[];
  /** Classes for the box holding "$" and the input. Replaces the default look. */
  fieldClassName?: string;
  /** Classes for the outer wrapper (width, margins). */
  className?: string;
  /** Classes for the visible label. Replaces the default look. */
  labelClassName?: string;
  /** Marks the amount as not allowed (red outline, aria-invalid). */
  invalid?: boolean;
}

const DEFAULT_FIELD =
  "rounded-sm border border-gray-300 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus-within:ring-2 focus-within:ring-blue-500";

const DEFAULT_LABEL = "block mb-1 text-xs font-medium text-gray-500 dark:text-gray-400";

const PRESET_CLASS =
  "min-h-9 sm:min-h-7 px-2.5 text-xs font-medium rounded-sm border border-gray-400/40 hover:bg-gray-500/15 active:bg-gray-500/25 disabled:opacity-40 tabular-nums";

const groupDigits = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const formatMoneyText = (value: number | null) =>
  value == null ? "" : groupDigits(String(Math.max(0, Math.round(value))));

/** "12,500,000" → 12500000; "12.5m" → 12500000; "750k" → 750000; "" → null. */
export const parseMoneyText = (raw: string): number | null => {
  const text = raw.replace(/[$,\s]/g, "").toLowerCase();
  if (text === "") return null;
  const match = /^(\d*\.?\d*)([km]?)$/.exec(text);
  if (!match || match[1] === "" || match[1] === ".") return null;
  const mult = match[2] === "m" ? 1_000_000 : match[2] === "k" ? 1_000 : 1;
  return Math.round(parseFloat(match[1]) * mult);
};

/** Typed text that isn't plain digits yet, e.g. "12." or "1.5k" mid-entry. */
const isShorthand = (raw: string) => /[.km]/i.test(raw);

export const MoneyInput: FC<MoneyInputProps> = ({
  value,
  onChange,
  label,
  ariaLabel,
  id,
  disabled,
  placeholder = "0",
  presets,
  fieldClassName,
  className,
  labelClassName,
  invalid = false,
}) => {
  const autoId = useId();
  const inputId = id ?? `money-${autoId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(() => formatMoneyText(value));
  // Digits that should sit before the caret after the next render.
  const caretDigits = useRef<number | null>(null);

  // Follow outside changes (presets, "Fill to ask", a reset) without
  // fighting the user's own typing.
  // An emptied field counts as matching 0, so clearing it to retype doesn't
  // snap a "0" back in for parents that store empty as zero.
  // Layout effect, so the new amount shows on the same frame (no flicker).
  useLayoutEffect(() => {
    const shown = parseMoneyText(text);
    if (shown !== value && !(shown == null && value === 0)) {
      setText(formatMoneyText(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useLayoutEffect(() => {
    const el = inputRef.current;
    const want = caretDigits.current;
    if (!el || want == null || document.activeElement !== el) return;
    caretDigits.current = null;
    let pos = 0;
    let seen = 0;
    while (pos < text.length && seen < want) {
      if (/\d/.test(text[pos])) seen++;
      pos++;
    }
    el.setSelectionRange(pos, pos);
  }, [text]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (isShorthand(raw)) {
      setText(raw);
      const parsed = parseMoneyText(raw);
      if (parsed != null) onChange(parsed);
      return;
    }
    const caret = e.target.selectionStart ?? raw.length;
    const before = raw.slice(0, caret).replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    caretDigits.current = before.length;
    setText(groupDigits(digits));
    onChange(digits === "" ? null : Number(digits));
  };

  // Tidy to "12,500,000" on leaving; text that never parsed (a lone "m")
  // reverts to the current value instead of showing blank over it.
  const handleBlur = () => {
    if (text.trim() === "") return;
    setText(formatMoneyText(parseMoneyText(text) ?? value));
  };

  // Select the amount on focus, so typing replaces it instead of appending.
  // Deferred because mobile Safari places the caret after the focus event.
  const handleFocus = () => {
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el && document.activeElement === el) el.select();
    });
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className={labelClassName ?? DEFAULT_LABEL}>
          {label}
        </label>
      )}
      <div
        className={`flex items-center ${fieldClassName ?? DEFAULT_FIELD} ${
          disabled ? "opacity-40 cursor-not-allowed" : ""
        } ${invalid ? "ring-2 ring-red-500" : ""}`}
      >
        <span aria-hidden className="pl-2 pr-0.5 text-base opacity-60 select-none">
          $
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="done"
          aria-label={label ? undefined : ariaLabel}
          aria-invalid={invalid || undefined}
          placeholder={placeholder}
          value={text}
          disabled={disabled}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className="min-w-0 w-full bg-transparent py-1.5 pr-2 text-base tabular-nums outline-none disabled:cursor-not-allowed"
        />
      </div>
      {presets && presets.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              disabled={disabled}
              title={p.title}
              className={PRESET_CLASS}
              onClick={() => onChange(Math.max(0, Math.round(p.apply(value ?? 0))))}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/** Short money for preset labels: 1500000 → "$1.5M", 250000 → "$250K". */
export const shortMoney = (n: number) => {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (abs >= 1_000_000) return `${sign}$${+(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${+(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs}`;
};

/** "+$100K" / "−$100K" step presets. */
export const stepPresets = (...steps: number[]): MoneyPreset[] =>
  steps.map((step) => ({
    label: `${step > 0 ? "+" : ""}${shortMoney(step)}`,
    apply: (cur) => cur + step,
  }));
