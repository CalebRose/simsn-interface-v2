import React from "react";

interface UnderlineTabsProps<K extends string> {
  tabs: readonly (readonly [K, string])[];
  value: K;
  onChange: (key: K) => void;
  classes?: string;
}

/** Equal-width tab strip with an accent underline on the active tab. */
export function UnderlineTabs<K extends string>({
  tabs,
  value,
  onChange,
  classes = "",
}: UnderlineTabsProps<K>) {
  return (
    <div
      role="tablist"
      className={`grid border-b border-(--border-primary) ${classes}`}
      style={{
        gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
      }}
    >
      {tabs.map(([key, label]) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={value === key}
          onClick={() => onChange(key)}
          className={`min-h-11 border-b-2 mb-2 text-sm font-medium transition-colors ${
            value === key
              ? "border-(--accent-primary) text-(--text-primary)"
              : "border-transparent text-(--text-muted)"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
