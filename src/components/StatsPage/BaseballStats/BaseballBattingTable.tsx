import { useState, useMemo } from "react";
import {
  BattingLeaderRow,
  BattingSortField,
} from "../../../models/baseball/baseballStatsModels";
import { getLogo } from "../../../_utility/getLogo";
import { SimMLB, SimCollegeBaseball } from "../../../_constants/constants";
import { getStatsHeaderStyle } from "./statsHeaderStyle";
import { useAuthStore } from "../../../context/AuthContext";
import "../../Team/baseball/baseballMobile.css";

const POS_SORT_ORDER = [
  "C",
  "1B",
  "2B",
  "3B",
  "SS",
  "LF",
  "CF",
  "RF",
  "DH",
  "SP",
  "RP",
  "P",
];

// ── Column groups ──────────────────────────────

export type BattingColumnGroup =
  | "standard"
  | "advanced"
  | "batted_ball"
  | "counting";

export const BATTING_COLUMN_GROUP_LABELS: Record<BattingColumnGroup, string> = {
  standard: "Standard",
  advanced: "Advanced",
  batted_ball: "Batted Ball",
  counting: "Counting",
};

export const DEFAULT_BATTING_GROUPS: Set<BattingColumnGroup> = new Set([
  "standard",
  "advanced",
]);

// ── Types ──────────────────────────────────────

interface Props {
  leaders: BattingLeaderRow[];
  league: string;
  IsRetro?: boolean;
  accentColor?: string;
  onPlayerClick?: (playerId: number) => void;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
  visibleGroups?: Set<BattingColumnGroup>;
}

interface Column {
  label: string;
  key: string;
  sortKey?: BattingSortField;
  clientSort?: boolean; // position only — all stats are now server-sorted
  width?: string;
  bold?: boolean;
  group: BattingColumnGroup;
  isIdentity?: boolean;
  tooltip?: string;
  format?: (row: BattingLeaderRow) => string;
}

// ── All columns ────────────────────────────────

const ALL_COLUMNS: Column[] = [
  // Always-visible identity columns
  { label: "#", key: "rank", width: "w-10", group: "standard", isIdentity: true },
  { label: "Player", key: "name", width: "min-w-[6rem] max-w-[10rem]", group: "standard", isIdentity: true },
  { label: "Team", key: "team_abbrev", width: "w-16", group: "standard", isIdentity: true },
  { label: "Pos", key: "position", width: "w-12", group: "standard", isIdentity: true, clientSort: true },

  // Standard counting
  { label: "G", key: "g", sortKey: "g", group: "standard", tooltip: "Games Played" },
  { label: "PA", key: "pa", sortKey: "pa", group: "standard", tooltip: "Plate Appearances" },
  { label: "AB", key: "ab", sortKey: "ab", group: "standard", tooltip: "At Bats" },
  { label: "H", key: "h", sortKey: "h", group: "standard", tooltip: "Hits" },
  { label: "2B", key: "2b", sortKey: "2b", group: "standard", tooltip: "Doubles" },
  { label: "3B", key: "3b", sortKey: "3b", group: "standard", tooltip: "Triples" },
  { label: "HR", key: "hr", sortKey: "hr", bold: true, group: "standard", tooltip: "Home Runs" },
  { label: "ITPHR", key: "itphr", sortKey: "itphr", tooltip: "Inside-the-Park Home Runs", group: "standard" },
  { label: "RBI", key: "rbi", sortKey: "rbi", group: "standard", tooltip: "Runs Batted In" },
  { label: "R", key: "r", sortKey: "r", group: "standard", tooltip: "Runs Scored" },
  { label: "BB", key: "bb", sortKey: "bb", group: "standard", tooltip: "Walks (Base on Balls)" },
  { label: "SO", key: "so", sortKey: "so", group: "standard", tooltip: "Strikeouts" },
  { label: "SB", key: "sb", sortKey: "sb", group: "standard", tooltip: "Stolen Bases" },
  { label: "CS", key: "cs", sortKey: "cs", group: "standard", tooltip: "Caught Stealing" },
  { label: "TB", key: "tb", sortKey: "tb", group: "standard", tooltip: "Total Bases" },
  { label: "AVG", key: "avg", sortKey: "avg", bold: true, group: "standard", tooltip: "Batting Average" },
  { label: "OBP", key: "obp", sortKey: "obp", group: "standard", tooltip: "On-Base Percentage" },
  { label: "SLG", key: "slg", sortKey: "slg", group: "standard", tooltip: "Slugging Percentage" },
  { label: "OPS", key: "ops", sortKey: "ops", bold: true, group: "standard", tooltip: "On-Base Plus Slugging" },

  // Advanced rate stats
  { label: "bWAR", key: "bwar", sortKey: "bwar", group: "advanced", bold: true, tooltip: "Batting Wins Above Replacement", format: (r) => r.bwar != null ? r.bwar.toFixed(1) : "—" },
  { label: "wOBA", key: "woba", sortKey: "woba", bold: true, group: "advanced", tooltip: "Weighted On-Base Average" },
  { label: "wRC+", key: "wrc_plus", sortKey: "wrc_plus", group: "advanced", tooltip: "Weighted Runs Created Plus (100 = league avg)" },
  { label: "OPS+", key: "ops_plus", sortKey: "ops_plus", group: "advanced", tooltip: "OPS Plus (100 = league avg)" },
  { label: "ISO", key: "iso", sortKey: "iso", group: "advanced", tooltip: "Isolated Power (SLG - AVG)" },
  { label: "BABIP", key: "babip", sortKey: "babip", group: "advanced", tooltip: "Batting Average on Balls in Play" },
  { label: "BB%", key: "bb_pct", sortKey: "bb_pct", group: "advanced", tooltip: "Walk Rate" },
  { label: "K%", key: "k_pct", sortKey: "k_pct", group: "advanced", tooltip: "Strikeout Rate" },
  { label: "BB/K", key: "bb_k", sortKey: "bb_k", group: "advanced", tooltip: "Walk-to-Strikeout Ratio" },
  { label: "XBH%", key: "xbh_pct", sortKey: "xbh_pct", group: "advanced", tooltip: "Extra-Base Hit Rate" },
  { label: "SB%", key: "sb_pct", sortKey: "sb_pct", group: "advanced", tooltip: "Stolen Base Success Rate" },

  // Batted ball & contact quality
  { label: "GB%", key: "gb_pct", sortKey: "gb_pct", group: "batted_ball", tooltip: "Ground Ball Rate" },
  { label: "FB%", key: "fb_pct", sortKey: "fb_pct", group: "batted_ball", tooltip: "Fly Ball Rate" },
  { label: "HR/FB", key: "hr_fb", sortKey: "hr_fb", group: "batted_ball", tooltip: "Home Run / Fly Ball Ratio" },
  { label: "Barrel%", key: "barrel_pct", sortKey: "barrel_pct", group: "batted_ball", tooltip: "Barrel Contact Rate" },
  { label: "HardHit%", key: "hard_hit_pct", sortKey: "hard_hit_pct", group: "batted_ball", tooltip: "Hard Hit Rate (barrel + solid)" },
  { label: "Soft%", key: "soft_pct", sortKey: "soft_pct", group: "batted_ball", tooltip: "Soft Contact Rate" },
  { label: "Med%", key: "med_pct", sortKey: "med_pct", group: "batted_ball", tooltip: "Medium Contact Rate" },
  { label: "LD%", key: "ld_pct", sortKey: "ld_pct", group: "batted_ball", tooltip: "Line Drive Rate" },
  { label: "Contact%", key: "contact_pct", sortKey: "contact_pct", group: "batted_ball", tooltip: "Contact Rate — (AB - SO) / AB" },

  // Extra counting / derived
  { label: "HBP", key: "hbp", sortKey: "hbp", group: "counting", tooltip: "Hit By Pitch" },
  { label: "SF", key: "sf", sortKey: "sf", group: "counting", tooltip: "Sacrifice Flies" },
  { label: "GIDP", key: "gidp", sortKey: "gidp", group: "counting", tooltip: "Grounded Into Double Play" },
  { label: "RC", key: "rc", sortKey: "rc", group: "counting", tooltip: "Runs Created" },
  { label: "SecA", key: "sec_a", sortKey: "sec_a", group: "counting", tooltip: "Secondary Average" },
  { label: "PSS", key: "pss", sortKey: "pss", group: "counting", tooltip: "Power/Speed Score" },
];

// ── Helpers ────────────────────────────────────

const SortIndicator = ({
  field,
  sortField,
  sortOrder,
}: {
  field?: string;
  sortField?: string;
  sortOrder?: string;
}) => {
  if (!field || field !== sortField) return null;
  return (
    <span className="ml-0.5 text-[10px]">
      {sortOrder === "asc" ? "▲" : "▼"}
    </span>
  );
};

// ── Sticky helpers ─────────────────────────────

const STICKY_OFFSETS: Record<string, string> = {
  rank: "left-0",
  name: "left-[40px]",
  team_abbrev: "left-[160px]",
  position: "left-[224px]",
};

const LAST_STICKY_KEY = "position";


const ROW_BG_EVEN = "bg-gray-50 dark:bg-gray-800";
const ROW_BG_ODD = "bg-white dark:bg-gray-900";

// ── Component ──────────────────────────────────

export const BaseballBattingTable = ({
  leaders,
  league,
  IsRetro,
  accentColor,
  onPlayerClick,
  sortField,
  sortOrder,
  onSort,
  visibleGroups = DEFAULT_BATTING_GROUPS,
}: Props) => {
  const leagueType = league === SimMLB ? SimMLB : SimCollegeBaseball;
  const { isDarkMode } = useAuthStore();
  const headerStyle = getStatsHeaderStyle(accentColor, isDarkMode);
  // Client-side sort state (position only — all stats are server-sorted)
  const [clientSortField, setClientSortField] = useState<string | null>(null);
  const [clientSortOrder, setClientSortOrder] = useState<"asc" | "desc">("desc");

  const columns = useMemo(
    () => ALL_COLUMNS.filter((col) => col.isIdentity || visibleGroups.has(col.group)),
    [visibleGroups],
  );

  // Group boundary detection for visual separators
  const groupBoundaryKeys = useMemo(() => {
    const boundaries = new Set<string>();
    for (let i = 1; i < columns.length; i++) {
      if (!columns[i].isIdentity && columns[i].group !== columns[i - 1].group) {
        boundaries.add(columns[i].key);
      }
    }
    return boundaries;
  }, [columns]);

  const displayLeaders = useMemo(() => {
    if (!clientSortField) return leaders;
    return [...leaders].sort((a, b) => {
      if (clientSortField === "position") {
        const ai = POS_SORT_ORDER.indexOf((a.position ?? "").toUpperCase());
        const bi = POS_SORT_ORDER.indexOf((b.position ?? "").toUpperCase());
        const diff = (ai >= 0 ? ai : 99) - (bi >= 0 ? bi : 99);
        return clientSortOrder === "asc" ? diff : -diff;
      }
      const va = parseFloat(String((a as any)[clientSortField] ?? 0)) || 0;
      const vb = parseFloat(String((b as any)[clientSortField] ?? 0)) || 0;
      return clientSortOrder === "asc" ? va - vb : vb - va;
    });
  }, [leaders, clientSortField, clientSortOrder]);

  const getValue = (row: BattingLeaderRow, col: Column): string | number => {
    if (col.format) return col.format(row);
    return (row as any)[col.key] ?? "—";
  };

  return (
    <div className="overflow-x-auto baseball-table-wrapper compact-table">
      <table className="border-collapse text-sm">
        <thead>
          <tr
            className="text-left text-xs font-semibold uppercase"
            style={headerStyle}
          >
            {columns.map((col) => {
              const isSortable = (!!col.sortKey && !!onSort) || col.clientSort;
              const isServerActive = col.sortKey === sortField;
              const isClientActive = col.clientSort && clientSortField === col.key;
              const isActive = isServerActive || isClientActive;
              const stickyOffset = STICKY_OFFSETS[col.key];
              const isLastSticky = col.key === LAST_STICKY_KEY;
              const isBoundary = groupBoundaryKeys.has(col.key);
              const handleClick = () => {
                if (col.clientSort) {
                  if (clientSortField === col.key) {
                    setClientSortOrder((o) => o === "asc" ? "desc" : "asc");
                  } else {
                    setClientSortField(col.key);
                    setClientSortOrder("desc");
                  }
                } else if (col.sortKey && onSort) {
                  setClientSortField(null);
                  onSort(col.sortKey);
                }
              };
              return (
                <th
                  key={col.key}
                  className={`px-2 py-2 ${col.width ?? "w-12"} ${col.key === "name" ? "text-left" : "text-center"} ${stickyOffset ? `sticky ${stickyOffset} z-20` : ""} ${isLastSticky ? "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.3)]" : ""} ${isBoundary ? "border-l-2 border-gray-300/40 dark:border-gray-500/30" : ""} ${isSortable ? "cursor-pointer select-none hover:opacity-80" : ""} ${isActive ? "underline decoration-2 underline-offset-2" : ""}`}
                  style={stickyOffset ? { backgroundColor: headerStyle?.backgroundColor as string } : undefined}
                  title={col.tooltip}
                  onClick={isSortable ? handleClick : undefined}
                >
                  {col.label}
                  {isClientActive ? (
                    <span className="ml-0.5 text-[10px]">
                      {clientSortOrder === "asc" ? "▲" : "▼"}
                    </span>
                  ) : (
                    <SortIndicator
                      field={col.sortKey}
                      sortField={sortField}
                      sortOrder={sortOrder}
                    />
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {displayLeaders.map((row, idx) => {
            const logo = getLogo(leagueType, row.team_id, IsRetro);
            const isEven = idx % 2 === 0;
            const rowBg = isEven ? ROW_BG_EVEN : ROW_BG_ODD;
            return (
              <tr
                key={row.player_id}
                className={`border-b border-gray-100 dark:border-gray-700 ${rowBg}`}
              >
                {columns.map((col) => {
                  const stickyOffset = STICKY_OFFSETS[col.key];
                  const isLastSticky = col.key === LAST_STICKY_KEY;
                  const isBoundary = groupBoundaryKeys.has(col.key);
                  const boundaryClass = isBoundary ? "border-l-2 border-gray-300/40 dark:border-gray-500/30" : "";
                  const stickyClass = stickyOffset
                    ? `sticky ${stickyOffset} z-10 ${rowBg} ${isLastSticky ? "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.3)]" : ""}`
                    : "";

                  if (col.key === "rank") {
                    return (
                      <td key={col.key} className={`px-2 py-2.5 sm:py-1.5 text-center text-gray-400 ${stickyClass}`}>
                        {row.rank}
                      </td>
                    );
                  }
                  if (col.key === "name") {
                    return (
                      <td key={col.key} className={`px-2 py-2.5 sm:py-1.5 font-medium text-left ${stickyClass}`}>
                        {onPlayerClick ? (
                          <span
                            className="cursor-pointer hover:underline hover:text-blue-500"
                            onClick={() => onPlayerClick(row.player_id)}
                          >
                            {row.name}
                          </span>
                        ) : (
                          row.name
                        )}
                      </td>
                    );
                  }
                  if (col.key === "team_abbrev") {
                    return (
                      <td key={col.key} className={`px-2 py-2.5 sm:py-1.5 text-center ${stickyClass}`}>
                        <div className="flex items-center justify-center gap-1">
                          {logo && (
                            <img
                              src={logo}
                              className="w-4 h-4 object-contain"
                              alt=""
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          )}
                          <span className="text-xs">{row.team_abbrev}</span>
                        </div>
                      </td>
                    );
                  }
                  if (col.key === "position") {
                    return (
                      <td key={col.key} className={`px-2 py-2.5 sm:py-1.5 text-center text-xs uppercase ${stickyClass}`}>
                        {row.position || "—"}
                      </td>
                    );
                  }
                  const isActive = col.sortKey === sortField || (col.clientSort && clientSortField === col.key);
                  return (
                    <td
                      key={col.key}
                      className={`px-2 py-2.5 sm:py-1.5 text-center ${boundaryClass} ${col.bold ? "font-semibold" : ""} ${isActive ? "bg-yellow-50/60 dark:bg-yellow-900/15" : ""}`}
                    >
                      {getValue(row, col)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {leaders.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-400"
              >
                No batting data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
