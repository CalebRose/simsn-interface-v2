import { FC } from "react";
import { MoneyInput, MoneyPreset } from "../../../Common/MoneyInput";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  ariaLabel?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  presets?: MoneyPreset[];
  invalid?: boolean;
}

/** Baseball's dollar field: a MoneyInput where an empty field means $0. */
export const CurrencyInput: FC<CurrencyInputProps> = ({ value, onChange, ...rest }) => (
  <MoneyInput value={value} onChange={(v) => onChange(v ?? 0)} {...rest} />
);
