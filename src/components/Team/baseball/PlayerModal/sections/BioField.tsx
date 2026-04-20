import { FC, memo } from "react";

export const BioField: FC<{ label: string; value: string }> = memo(
  ({ label, value }) => (
    <div>
      <span className="text-gray-400 text-xs">{label}: </span>
      <span className="dark:text-white">{value}</span>
    </div>
  ),
);
