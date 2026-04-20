import { FC, memo } from "react";

export const StatPair: FC<{ label: string; value: string | number }> = memo(
  ({ label, value }) => (
    <div className="text-center">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm font-medium">
        {typeof value === "number"
          ? value % 1 !== 0
            ? value.toFixed(3).replace(/^0/, "")
            : value
          : value}
      </div>
    </div>
  ),
);
