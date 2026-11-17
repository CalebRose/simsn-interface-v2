import { ButtonHTMLAttributes, CSSProperties, FC, ReactNode } from "react";
import { GroupBase, Props as SelectProps } from "react-select";
import { SelectDropdown } from "../../_design/Select";
import { SelectOption } from "../../_hooks/useSelectStyles";

// The app-style parts baseball and volleyball pages are built from: filled
// surfaces instead of outlined boxes, small uppercase section labels, one
// segmented control for every toggle and filter, compact dropdowns. The
// colours are the --sport-* variables in index.css, derived from the theme.
// TechDocs/sport-ui-guide.md has the rules; /sport-ui shows them.

/** A section's name: small, uppercase, muted. Not a heading in bold. */
export const sportLabel =
  "text-[0.7rem] font-semibold uppercase tracking-wider text-(--text-muted)";

/** A filled, slightly raised surface. No outline. */
export const sportSurface =
  "rounded-xl bg-(--sport-surface) [box-shadow:var(--sport-shadow)]";

/** A row divider inside a surface. */
export const sportDivider = "border-b border-(--sport-divider)";

interface SportPanelProps {
  /** The section's name, shown as a label. */
  title?: ReactNode;
  /** Controls on the right of the title line (a toggle, a link). */
  actions?: ReactNode;
  /**
   * A team colour as a thin strip along the top, for the user's own team's
   * panels. Never an outline.
   */
  accent?: string;
  classes?: string;
  children: ReactNode;
}

/** A bare surface, for a block that is not a titled section. */
export const SportSurface: FC<{
  classes?: string;
  styles?: CSSProperties;
  children: ReactNode;
}> = ({ classes = "", styles, children }) => (
  <div className={`${sportSurface} ${classes}`} style={styles}>
    {children}
  </div>
);

/** A section of a page: a surface with an optional label line. */
export const SportPanel: FC<SportPanelProps> = ({
  title,
  actions,
  accent,
  classes = "",
  children,
}) => (
  <section
    className={`min-w-0 overflow-x-auto ${sportSurface} ${classes}`}
    style={accent ? { borderTop: `3px solid ${accent}` } : undefined}
  >
    {(title || actions) && (
      <div className="flex flex-wrap items-center gap-2 px-3 pb-1 pt-3 text-left">
        {title && <div className={sportLabel}>{title}</div>}
        {actions && (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    )}
    {children}
  </section>
);

/**
 * A drop-in for the design kit's SectionCards on baseball and volleyball
 * pages: the same props, drawn as a sport panel. The colour props are
 * accepted and ignored; the theme decides. Each child is a row, divided by
 * a hairline.
 */
export const SportSectionCard: FC<{
  header: ReactNode;
  children: ReactNode;
  onHeaderClick?: () => void;
  classes?: string;
  [ignored: string]: unknown;
}> = ({ header, children, onHeaderClick }) => (
  <SportPanel
    classes="flex h-full flex-col"
    title={
      onHeaderClick ? (
        <span
          role="button"
          tabIndex={0}
          className="cursor-pointer hover:text-(--text-primary)"
          onClick={onHeaderClick}
          onKeyDown={(event) => event.key === "Enter" && onHeaderClick()}
        >
          {header}
        </span>
      ) : (
        header
      )
    }
  >
    <div className="flex h-full flex-col overflow-auto px-3 pb-3 [&>*+*]:border-t [&>*+*]:border-(--sport-divider)">
      {children}
    </div>
  </SportPanel>
);

interface SportSegmentedProps<K extends string | number> {
  options: ReadonlyArray<
    readonly [value: K, label: ReactNode, disabledReason?: string]
  >;
  value: K | null;
  onChange: (value: K) => void;
  /** Read by screen readers. */
  label: string;
  classes?: string;
}

/**
 * Picks one of a few values: Top 10 / Top 25, Poll / Elo / RPI, a news
 * kind, a week. The one control for toggles and filters; a long list
 * scrolls sideways.
 */
export const SportSegmented = <K extends string | number>({
  options,
  value,
  onChange,
  label,
  classes = "",
}: SportSegmentedProps<K>) => (
  <div
    role="radiogroup"
    aria-label={label}
    className={`inline-flex max-w-full gap-0.5 overflow-x-auto rounded-lg bg-(--sport-surface-2) p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${classes}`}
  >
    {options.map(([option, text, disabledReason]) => {
      const active = option === value;
      return (
        <button
          key={String(option)}
          type="button"
          role="radio"
          aria-checked={active}
          disabled={Boolean(disabledReason)}
          title={disabledReason}
          onClick={() => onChange(option)}
          className={`shrink-0 whitespace-nowrap rounded-md border-0 px-2.5 py-1 text-xs transition-colors hover:border-0 disabled:opacity-40 sm:text-sm ${
            active
              ? "bg-(--sport-surface) font-semibold text-(--text-primary) [box-shadow:var(--sport-shadow)] hover:bg-(--sport-surface)"
              : "bg-transparent text-(--text-muted) hover:bg-transparent hover:text-(--text-primary)"
          }`}
        >
          {text}
        </button>
      );
    })}
  </div>
);

type SportButtonVariant = "primary" | "secondary" | "success" | "danger";

const sportButtonVariants: Record<SportButtonVariant, string> = {
  primary:
    "bg-(--accent-primary) text-white hover:bg-[color-mix(in_srgb,var(--accent-primary)_85%,black)]",
  secondary:
    "bg-(--sport-surface-2) text-(--text-primary) hover:bg-[color-mix(in_srgb,var(--sport-surface-2)_85%,var(--text-primary))]",
  success:
    "bg-(--accent-success) text-white hover:bg-[color-mix(in_srgb,var(--accent-success)_85%,black)]",
  // Quiet until pointed at: a destructive action should not be the loudest
  // thing on the page.
  danger:
    "bg-[color-mix(in_srgb,var(--accent-error)_15%,transparent)] text-(--accent-error) hover:bg-(--accent-error) hover:text-white",
};

const sportButtonSizes = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

/**
 * Does something: save, offer, release. The design kit's Button with the
 * sports' colours, taken from the theme; same props, so swapping is a rename.
 * Choosing between values is SportSegmented, not this.
 */
export const SportButton: FC<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: SportButtonVariant;
    size?: keyof typeof sportButtonSizes;
    /** Marks the chosen one of a few buttons. */
    isSelected?: boolean;
    classes?: string;
  }
> = ({
  variant = "primary",
  size = "md",
  isSelected = false,
  classes = "",
  type = "button",
  children,
  ...rest
}) => (
  <button
    type={type}
    {...rest}
    className={`inline-flex items-center justify-center gap-1 rounded-lg border-0 font-semibold transition-colors hover:border-0 disabled:cursor-not-allowed disabled:opacity-40 ${sportButtonSizes[size]} ${sportButtonVariants[variant]} ${
      isSelected
        ? "ring-2 ring-(--accent-primary) ring-offset-1 ring-offset-(--sport-surface)"
        : ""
    } ${classes}`}
  >
    {children}
  </button>
);

/** A small neutral label (Injury, Commit). `tone` marks one that needs action. */
export const SportChip: FC<{
  children: ReactNode;
  tone?: "neutral" | "attention";
}> = ({ children, tone = "neutral" }) => (
  <span
    className={`inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-[0.7rem] font-semibold ${
      tone === "attention"
        ? "bg-(--accent-warning)/20 text-(--accent-warning)"
        : "bg-(--sport-surface-2) text-(--text-muted)"
    }`}
  >
    {children}
  </span>
);

// Compact, theme-aware dropdown styles: the height of a segmented control,
// in the surface colours, in every theme.
const sportSelectStyles = {
  control: (base: object, state: { isFocused: boolean }) => ({
    ...base,
    minHeight: "32px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "var(--sport-surface-2)",
    boxShadow: state.isFocused ? "0 0 0 2px var(--accent-primary)" : "none",
    fontSize: "0.875rem",
    cursor: "pointer",
    padding: 0,
    width: "100%",
    maxWidth: "none",
  }),
  valueContainer: (base: object) => ({ ...base, padding: "0 8px" }),
  singleValue: (base: object) => ({
    ...base,
    color: "var(--text-primary)",
    fontSize: "0.875rem",
  }),
  placeholder: (base: object) => ({
    ...base,
    color: "var(--text-muted)",
    fontSize: "0.875rem",
  }),
  input: (base: object) => ({ ...base, color: "var(--text-primary)" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base: object) => ({
    ...base,
    padding: "4px 6px",
    color: "var(--text-muted)",
  }),
  menu: (base: object) => ({
    ...base,
    backgroundColor: "var(--sport-surface)",
    borderRadius: "10px",
    boxShadow: "0 8px 24px rgb(0 0 0 / 0.25)",
    overflow: "hidden",
    fontSize: "0.875rem",
  }),
  menuList: (base: object) => ({
    ...base,
    backgroundColor: "var(--sport-surface)",
    padding: "4px",
  }),
  option: (
    base: object,
    state: { isFocused: boolean; isSelected: boolean },
  ) => ({
    ...base,
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
    color: state.isSelected ? "#ffffff" : "var(--text-primary)",
    backgroundColor: state.isSelected
      ? "var(--accent-primary)"
      : state.isFocused
        ? "var(--sport-surface-2)"
        : "transparent",
  }),
  groupHeading: (base: object) => ({
    ...base,
    color: "var(--text-muted)",
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.05em",
  }),
};

/** A dropdown in the sports' compact style. Same props as SelectDropdown. */
export type SportSelectProps<IsMulti extends boolean = false> = SelectProps<
  SelectOption,
  IsMulti,
  GroupBase<SelectOption>
>;

export const SportSelect = <IsMulti extends boolean = false>(
  props: SportSelectProps<IsMulti>,
) => (
  <SelectDropdown<IsMulti>
    {...props}
    styles={{ ...sportSelectStyles, ...(props.styles ?? {}) } as never}
  />
);
