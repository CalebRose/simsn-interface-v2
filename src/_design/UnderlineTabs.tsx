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
          // The site-wide button style (a filled, rounded box with an outline
          // on hover) is undone here: a tab is text with an underline.
          className={`min-h-11 rounded-none border-0 border-b-2 bg-transparent text-sm font-medium transition-colors hover:bg-transparent ${
            value === key
              ? "border-b-(--accent-primary) text-(--text-primary) hover:border-b-(--accent-primary)"
              : "border-b-transparent text-(--text-muted) hover:border-b-(--border-primary) hover:text-(--text-primary)"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
