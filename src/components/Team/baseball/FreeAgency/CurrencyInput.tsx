import { FC, useState, useCallback, useRef } from "react";

/**
 * Format a number as a currency display string: $1,234,567
 * Returns "$0" for zero/falsy values.
 */
const formatDisplay = (value: number): string => {
  return `$${value.toLocaleString()}`;
};

/**
 * Strip a display string to a raw number.
 * Removes $, commas, spaces, and leading zeros.
 */
const parseInput = (raw: string): number => {
  const cleaned = raw.replace(/[$,\s]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) || num < 0 ? 0 : num;
};

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const CurrencyInput: FC<CurrencyInputProps> = ({
  value,
  onChange,
  label,
  disabled,
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [editText, setEditText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Show the raw number (no $ or commas) for easy editing, but strip leading zeros
    setEditText(value === 0 ? "" : String(value));
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = parseInput(editText);
    onChange(parsed);
  }, [editText, onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Only allow digits (strip anything else as they type)
    const digitsOnly = raw.replace(/[^\d]/g, "");
    setEditText(digitsOnly);
    // Live-update the parent so validation runs in real time
    const parsed = parseInt(digitsOnly, 10);
    onChange(isNaN(parsed) ? 0 : parsed);
  }, [onChange]);

  const inputClasses = `w-full text-sm border rounded px-2 py-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
    disabled ? "opacity-40 cursor-not-allowed" : ""
  } ${className ?? ""}`;

  return (
    <div>
      {label && (
        <label className="block text-xs text-gray-400 mb-1">{label}</label>
      )}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={isFocused ? editText : formatDisplay(value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        disabled={disabled}
        className={inputClasses}
      />
    </div>
  );
};
