import { FC, useState, useMemo, useCallback, useRef, ReactNode } from "react";
import { components, GroupBase, OptionProps, GroupHeadingProps } from "react-select";
import { Player, PlayerRatings, Ptype } from "../../../models/baseball/baseballModels";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { PositionShortMap, PositionRatingKey } from "./BaseballGameplanConstants";
import { Text } from "../../../_design/Typography";
import { ToggleSwitch } from "../../../_design/Inputs";

// ── Rating color as inline CSS (react-select can't use Tailwind classes) ──

export const ratingHexColor = (v: number): string => {
  if (v >= 70) return "#22c55e"; // green-500
  if (v >= 60) return "#4ade80"; // green-400
  if (v >= 50) return "#eab308"; // yellow-500
  if (v >= 40) return "#f97316"; // orange-500
  if (v >= 30) return "#fb923c"; // orange-400
  return "#ef4444";              // red-500
};

export const staminaHexColor = (v: number): string => {
  if (v >= 90) return "#22c55e"; // green-500
  if (v >= 70) return "#4ade80"; // green-400
  if (v >= 50) return "#eab308"; // yellow-500
  if (v >= 30) return "#f97316"; // orange-500
  return "#ef4444";              // red-500
};

// ── Extended option with extra data for custom rendering ──

export interface PlayerSelectOption extends SelectOption {
  ptype: Ptype;
  rating: number | null;
  listedPos: string | null;
  stamina: number | null;
  hasFatigueData: boolean;
}

// ── Build grouped options for a position/role dropdown ──

export function buildGroupedPlayerOptions(
  players: Player[],
  ratingKey: keyof PlayerRatings,
  hiddenPlayerIds: Set<number>,
  hideAssigned: boolean,
  assignedPlayerIds: Set<number>,
): GroupBase<PlayerSelectOption>[] {
  const filtered = players.filter((p) => {
    if (hiddenPlayerIds.has(p.id)) return false;
    if (hideAssigned && assignedPlayerIds.has(p.id)) return false;
    return true;
  });

  const posPlayers: Player[] = [];
  const pitchers: Player[] = [];
  for (const p of filtered) {
    if (p.ptype === Ptype.Pitcher) pitchers.push(p);
    else posPlayers.push(p);
  }

  const sortByRating = (a: Player, b: Player) => {
    const aVal = (a.ratings[ratingKey] as number) ?? 0;
    const bVal = (b.ratings[ratingKey] as number) ?? 0;
    return bVal - aVal;
  };
  posPlayers.sort(sortByRating);
  pitchers.sort(sortByRating);

  const toOption = (p: Player): PlayerSelectOption => {
    const rating = (p.ratings[ratingKey] as number) ?? null;
    const posLabel = p.listed_position
      ? PositionShortMap[p.listed_position] ?? p.listed_position.toUpperCase()
      : null;
    const typeTag = p.ptype === Ptype.Pitcher ? "P" : "Pos";
    const posTag = posLabel ? `${typeTag} · ${posLabel}` : typeTag;
    const ratingStr = rating != null ? String(rating) : "—";
    return {
      value: String(p.id),
      label: `[${posTag}] ${p.firstname} ${p.lastname} (${ratingStr})`,
      ptype: p.ptype,
      rating,
      listedPos: posLabel,
      stamina: p.stamina ?? null,
      hasFatigueData: p.has_fatigue_data ?? false,
    };
  };

  const groups: GroupBase<PlayerSelectOption>[] = [];
  if (posPlayers.length > 0) {
    groups.push({ label: "Position Players", options: posPlayers.map(toOption) });
  }
  if (pitchers.length > 0) {
    groups.push({ label: "Pitchers", options: pitchers.map(toOption) });
  }
  return groups;
}

/** Flat option list (for finding the currently-selected value across groups). */
export function flattenGroups(groups: GroupBase<PlayerSelectOption>[]): PlayerSelectOption[] {
  return groups.flatMap((g) => g.options);
}

// ── Custom react-select components for color-coded ratings ──

export const ColoredOptionSimple: FC<OptionProps<PlayerSelectOption, false, GroupBase<PlayerSelectOption>>> = (props) => {
  const { data } = props;
  const ratingColor = data.rating != null ? ratingHexColor(data.rating) : "#9ca3af";
  const nameMatch = data.label.match(/^(\[.+?\]) (.+?) \((.+?)\)$/);
  if (!nameMatch) return <components.Option {...props} />;
  const [, badge, name, ratingStr] = nameMatch;
  return (
    <components.Option {...props}>
      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{
          fontSize: "0.65rem",
          padding: "1px 4px",
          borderRadius: "3px",
          backgroundColor: "rgba(255,255,255,0.08)",
          color: data.ptype === Ptype.Pitcher ? "#60a5fa" : "#a78bfa",
          fontWeight: 600,
        }}>
          {badge.slice(1, -1)}
        </span>
        <span>{name}</span>
        <span style={{ color: ratingColor, fontWeight: 600, marginLeft: "auto" }}>
          {ratingStr}
        </span>
        {data.stamina != null && (
          <span style={{
            color: staminaHexColor(data.stamina),
            fontSize: "0.6rem",
            fontWeight: 600,
            marginLeft: "4px",
          }}>
            S:{data.stamina}
          </span>
        )}
      </span>
    </components.Option>
  );
};

export const StyledGroupHeading: FC<GroupHeadingProps<PlayerSelectOption, false, GroupBase<PlayerSelectOption>>> = (props) => (
  <components.GroupHeading {...props}>
    <span style={{
      fontSize: "0.7rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: "#9ca3af",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
      display: "block",
      paddingBottom: "4px",
    }}>
      {props.children}
    </span>
  </components.GroupHeading>
);

// ── PlayerFilter — filter bar with hide-assigned toggle & bulk hide/unhide ──

interface PlayerFilterProps {
  players: Player[];
  /** Which tab context: "defense" hides pitchers by default label, "pitching" hides pos players */
  context: "defense" | "pitching";
  hiddenPlayerIds: Set<number>;
  onHiddenChange: (ids: Set<number>) => void;
  hideAssigned: boolean;
  onHideAssignedChange: (v: boolean) => void;
}

export const PlayerFilter: FC<PlayerFilterProps> = ({
  players,
  context,
  hiddenPlayerIds,
  onHiddenChange,
  hideAssigned,
  onHideAssignedChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const pitcherIds = useMemo(() => new Set(players.filter((p) => p.ptype === Ptype.Pitcher).map((p) => p.id)), [players]);
  const positionIds = useMemo(() => new Set(players.filter((p) => p.ptype === Ptype.Position).map((p) => p.id)), [players]);

  const allPitchersHidden = useMemo(() => {
    if (pitcherIds.size === 0) return false;
    for (const id of pitcherIds) {
      if (!hiddenPlayerIds.has(id)) return false;
    }
    return true;
  }, [pitcherIds, hiddenPlayerIds]);

  const allPositionHidden = useMemo(() => {
    if (positionIds.size === 0) return false;
    for (const id of positionIds) {
      if (!hiddenPlayerIds.has(id)) return false;
    }
    return true;
  }, [positionIds, hiddenPlayerIds]);

  const bulkHide = useCallback((ids: Set<number>) => {
    const next = new Set(hiddenPlayerIds);
    for (const id of ids) next.add(id);
    onHiddenChange(next);
  }, [hiddenPlayerIds, onHiddenChange]);

  const bulkUnhide = useCallback((ids: Set<number>) => {
    const next = new Set(hiddenPlayerIds);
    for (const id of ids) next.delete(id);
    onHiddenChange(next);
  }, [hiddenPlayerIds, onHiddenChange]);

  const unhideSingle = useCallback((id: number) => {
    const next = new Set(hiddenPlayerIds);
    next.delete(id);
    onHiddenChange(next);
  }, [hiddenPlayerIds, onHiddenChange]);

  // Players that are manually hidden (for chip display)
  const hiddenPlayers = useMemo(() => {
    return players.filter((p) => hiddenPlayerIds.has(p.id));
  }, [players, hiddenPlayerIds]);

  const hiddenCount = hiddenPlayers.length;

  return (
    <div className="mb-3 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-650 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Text variant="small" classes="font-semibold">Dropdown Filters</Text>
          {(hiddenCount > 0 || hideAssigned) && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-400">
              {hideAssigned ? "auto-hide" : ""}{hideAssigned && hiddenCount > 0 ? " + " : ""}{hiddenCount > 0 ? `${hiddenCount} hidden` : ""}
            </span>
          )}
        </div>
        <span className="text-gray-500 text-sm">{isOpen ? "▼" : "▶"}</span>
      </button>

      {isOpen && (
        <div className="px-3 py-3 bg-gray-50 dark:bg-gray-800 space-y-3">
          {/* Hide assigned toggle */}
          <div className="flex items-center gap-2">
            <ToggleSwitch checked={hideAssigned} onChange={onHideAssignedChange} />
            <Text variant="small" classes="text-gray-300">
              Hide already-assigned players from dropdowns
            </Text>
          </div>

          {/* Bulk buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => allPitchersHidden ? bulkUnhide(pitcherIds) : bulkHide(pitcherIds)}
              className={`text-xs px-2.5 py-1.5 rounded border font-medium transition-colors ${
                allPitchersHidden
                  ? "bg-blue-600/20 border-blue-500 text-blue-400 hover:bg-blue-600/30"
                  : "bg-gray-700 border-gray-500 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {allPitchersHidden ? "Show All Pitchers" : "Hide All Pitchers"}
            </button>
            <button
              onClick={() => allPositionHidden ? bulkUnhide(positionIds) : bulkHide(positionIds)}
              className={`text-xs px-2.5 py-1.5 rounded border font-medium transition-colors ${
                allPositionHidden
                  ? "bg-purple-600/20 border-purple-500 text-purple-400 hover:bg-purple-600/30"
                  : "bg-gray-700 border-gray-500 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {allPositionHidden ? "Show All Position Players" : "Hide All Position Players"}
            </button>
            {hiddenCount > 0 && (
              <button
                onClick={() => onHiddenChange(new Set())}
                className="text-xs px-2.5 py-1.5 rounded border border-gray-500 text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Hidden player chips */}
          {hiddenPlayers.length > 0 && (
            <div>
              <Text variant="small" classes="text-gray-500 text-xs mb-1">
                Manually hidden ({hiddenPlayers.length}):
              </Text>
              <div className="flex flex-wrap gap-1">
                {hiddenPlayers.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 border border-gray-600"
                  >
                    <span className={`font-semibold ${p.ptype === Ptype.Pitcher ? "text-blue-400" : "text-purple-400"}`}>
                      {p.ptype === Ptype.Pitcher ? "P" : "Pos"}
                    </span>
                    {p.firstname} {p.lastname}
                    <button
                      onClick={() => unhideSingle(p.id)}
                      className="ml-0.5 text-gray-400 hover:text-white cursor-pointer"
                      aria-label={`Show ${p.firstname} ${p.lastname}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Tooltip — hover wrapper that shows explanatory text ──────────────

interface TooltipProps {
  text: string;
  children: ReactNode;
}

export const Tooltip: FC<TooltipProps> = ({ text, children }) => {
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    timerRef.current = setTimeout(() => setShow(true), 1000);
  };
  const handleLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setShow(false);
  };

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
      {show && (
        <div className="pointer-events-none absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-56 px-2.5 py-1.5 rounded bg-gray-900 border border-gray-600 text-xs text-gray-300 leading-relaxed shadow-lg animate-fade-in">
          {text}
        </div>
      )}
    </div>
  );
};
