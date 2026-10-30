import React from "react";

export const Field = ({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1 justify-start text-start">
    <label className="text-sm font-semibold text-white">{label}</label>
    {hint && <span className="text-xs text-gray-400">{hint}</span>}
    {children}
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
);
