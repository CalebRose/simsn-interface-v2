import { useMemo } from "react";
import {
  PitchingLeaderRow,
  PitchingSortField,
} from "../../../models/baseball/baseballStatsModels";
import { getLogo } from "../../../_utility/getLogo";
import { SimMLB, SimCollegeBaseball } from "../../../_constants/constants";
import { getStatsHeaderStyle } from "./statsHeaderStyle";
import { useAuthStore } from "../../../context/AuthContext";
import "../../Team/baseball/baseballMobile.css";

// ── Column groups ──────────────────────────────

export type PitchingColumnGroup =
  | "standard"
  | "advanced"
  | "league_indexed"
  | "batted_ball"
  | "pitch_data"
  | "reliever";

export const PITCHING_COLUMN_GROUP_LABELS: Record<PitchingColumnGroup, string> = {
  standard: "Standard",
  advanced: "Advanced",
  league_indexed: "League-Indexed",
  batted_ball: "Batted Ball",
  pitch_data: "Pitch Data",
  reliever: "Reliever",
};

export const DEFAULT_PITCHING_GROUPS: Set<PitchingColumnGroup> = new Set([
  "standard",
  "advanced",
]);

// ── Types ──────────────────────────────────────

interface Props {
  leaders: PitchingLeaderRow[];
  league: string;
  IsRetro?: boolean;
  accentColor?: string;
  onPlayerClick?: (playerId: number) => void;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
  visibleGroups?: Set<PitchingColumnGroup>;
}

interface Column {
  label: string;
  key: string;
  sortKey?: PitchingSortField;
  bold?: boolean;
  group: PitchingColumnGroup;
  isIdentity?: boolean;
  tooltip?: string;
}

// ── All columns ────────────────────────────────

const ALL_COLUMNS: Column[] = [
  // Always-visible identity columns
  { label: "#", key: "rank", group: "standard", isIdentity: true },
  { label: "Player", key: "name", group: "standard", isIdentity: true },
  { label: "Team", key: "team_abbrev", group: "standard", isIdentity: true },

  // Standard
  { label: "G", key: "g", sortKey: "g", group: "standard", tooltip: "Games Pitched" },
  { label: "GS", key: "gs", sortKey: "gs", group: "standard", tooltip: "Games Started" },
  { label: "W", key: "w", sortKey: "wins", bold: true, group: "standard", tooltip: "Wins" },
  { label: "L", key: "l", sortKey: "l", group: "standard", tooltip: "Losses" },
  { label: "SV", key: "sv", sortKey: "saves", group: "standard", tooltip: "Saves" },
  { label: "IP", key: "ip", sortKey: "ip", group: "standard", tooltip: "Innings Pitched" },
  { label: "H", key: "h", sortKey: "h", group: "standard", tooltip: "Hits Allowed" },
  { label: "R", key: "r", sortKey: "r", group: "standard", tooltip: "Runs Allowed" },
  { label: "ER", key: "er", sortKey: "er", group: "standard", tooltip: "Earned Runs" },
  { label: "BB", key: "bb", sortKey: "bb", group: "standard", tooltip: "Walks Allowed" },
  { label: "SO", key: "so", sortKey: "so", bold: true, group: "standard", tooltip: "Strikeouts" },
  { label: "HR", key: "hr", sortKey: "hr", group: "standard", tooltip: "Home Runs Allowed" },
  { label: "ITPHR", key: "itphr", sortKey: "itphr", tooltip: "Inside-the-Park HR Allowed", group: "standard" },
  { label: "ERA", key: "era", sortKey: "era", bold: true, group: "standard", tooltip: "Earned Run Average" },
  { label: "WHIP", key: "whip", sortKey: "whip", group: "standard", tooltip: "Walks + Hits per Inning Pitched" },

  // Advanced
  { label: "pWAR", key: "pwar", sortKey: "pwar", group: "advanced", bold: true, tooltip: "Pitching Wins Above Replacement" },
  { label: "FIP", key: "fip", sortKey: "fip", bold: true, group: "advanced", tooltip: "Fielding Independent Pitching" },
  { label: "xFIP", key: "xfip", sortKey: "xfip", group: "advanced", tooltip: "Expected FIP (league-avg HR/FB rate)" },
  { label: "K/9", key: "k9", sortKey: "k9", group: "advanced", tooltip: "Strikeouts per 9 Innings" },
  { label: "BB/9", key: "bb9", sortKey: "bb9", group: "advanced", tooltip: "Walks per 9 Innings" },
  { label: "HR/9", key: "hr9", sortKey: "hr9", group: "advanced", tooltip: "Home Runs per 9 Innings" },
  { label: "H/9", key: "h9", sortKey: "h9", group: "advanced", tooltip: "Hits per 9 Innings" },
  { label: "K%", key: "k_pct", sortKey: "k_pct", group: "advanced", tooltip: "Strikeout Rate" },
  { label: "BB%", key: "bb_pct", sortKey: "bb_pct", group: "advanced", tooltip: "Walk Rate" },
  { label: "K-BB%", key: "k_bb_pct", sortKey: "k_bb_pct", group: "advanced", tooltip: "K% minus BB% — most predictive single pitching metric" },
  { label: "K/BB", key: "k_bb", sortKey: "k_bb", group: "advanced", tooltip: "Strikeout-to-Walk Ratio" },
  { label: "W%", key: "w_pct", sortKey: "w_pct", group: "advanced", tooltip: "Win Percentage" },
  { label: "BABIP", key: "babip", sortKey: "babip", group: "advanced", tooltip: "Batting Average on Balls in Play Against" },
  { label: "IP/GS", key: "ip_gs", sortKey: "ip_gs", group: "advanced", tooltip: "Innings per Game Started" },

  // League-indexed
  { label: "ERA-", key: "era_minus", sortKey: "era_minus", group: "league_indexed", tooltip: "ERA Minus — league-indexed ERA (100 = avg, lower is better)" },
  { label: "FIP-", key: "fip_minus", sortKey: "fip_minus", group: "league_indexed", tooltip: "FIP Minus — league-indexed FIP (100 = avg, lower is better)" },

  // Batted ball
  { label: "GB%", key: "gb_pct", sortKey: "gb_pct", group: "batted_ball", tooltip: "Ground Ball Rate Allowed" },
  { label: "FB%", key: "fb_pct", sortKey: "fb_pct", group: "batted_ball", tooltip: "Fly Ball Rate Allowed" },
  { label: "HR/FB", key: "hr_fb", sortKey: "hr_fb", group: "batted_ball", tooltip: "HR / Fly Ball Ratio" },
  { label: "Barrel%", key: "barrel_pct", sortKey: "barrel_pct", group: "batted_ball", tooltip: "Barrel Rate Allowed" },
  { label: "HardHit%", key: "hard_hit_pct", sortKey: "hard_hit_pct", group: "batted_ball", tooltip: "Hard Hit Rate Allowed" },
  { label: "Soft%", key: "soft_pct", sortKey: "soft_pct", group: "batted_ball", tooltip: "Soft Contact Rate Allowed" },
  { label: "LD%", key: "ld_pct", sortKey: "ld_pct", group: "batted_ball", tooltip: "Line Drive Rate Allowed" },
  { label: "LOB%", key: "lob_pct", sortKey: "lob_pct", group: "batted_ball", tooltip: "Left On Base Percentage (strand rate)" },

  // Pitch data
  { label: "Pitches", key: "pitches", sortKey: "pitches", group: "pitch_data", tooltip: "Total Pitches Thrown" },
  { label: "Str%", key: "str_pct", sortKey: "str_pct", group: "pitch_data", tooltip: "Strike Percentage" },
  { label: "P/IP", key: "p_ip", sortKey: "p_ip", group: "pitch_data", tooltip: "Pitches per Inning" },
  { label: "HBP", key: "hbp", sortKey: "hbp", group: "pitch_data", tooltip: "Hit Batters" },
  { label: "WP", key: "wp", sortKey: "wp", group: "pitch_data", tooltip: "Wild Pitches" },
  { label: "WP/9", key: "wp9", sortKey: "wp9", group: "pitch_data", tooltip: "Wild Pitches per 9 Innings" },
  { label: "BF", key: "bf", sortKey: "bf", group: "pitch_data", tooltip: "Batters Faced" },

  // Reliever
  { label: "HLD", key: "hld", sortKey: "holds", group: "reliever", tooltip: "Holds" },
  { label: "BS", key: "bs", sortKey: "blown_saves", group: "reliever", tooltip: "Blown Saves" },
  { label: "QS", key: "qs", sortKey: "quality_starts", group: "reliever", tooltip: "Quality Starts" },
  { label: "IR", key: "ir", sortKey: "ir", group: "reliever", tooltip: "Inherited Runners" },
  { label: "IRS", key: "irs", sortKey: "irs", group: "reliever", tooltip: "Inherited Runners Scored" },
  { label: "IR%", key: "ir_pct", sortKey: "ir_pct", group: "reliever", tooltip: "Inherited Runner Scoring Rate" },
  { label: "GIDP", key: "gidp_induced", sortKey: "gidp_induced", group: "reliever", tooltip: "GIDP Induced" },
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
};

const LAST_STICKY_KEY = "team_abbrev";

const WAR_FORMAT_KEYS = new Set(["pwar"]);

const ROW_BG_EVEN = "bg-gray-50 dark:bg-gray-800";
const ROW_BG_ODD = "bg-white dark:bg-gray-900";

// ── Component ──────────────────────────────────

export const BaseballPitchingTable = ({
  leaders,
  league,
  IsRetro,
  accentColor,
  onPlayerClick,
  sortField,
  sortOrder,
  onSort,
  visibleGroups = DEFAULT_PITCHING_GROUPS,
}: Props) => {
  const leagueType = league === SimMLB ? SimMLB : SimCollegeBaseball;
  const { isDarkMode } = useAuthStore();
  const headerStyle = getStatsHeaderStyle(accentColor, isDarkMode);

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

  return (
    <div className="overflow-x-auto baseball-table-wrapper compact-table">
      <table className="border-collapse text-sm">
        <thead>
          <tr
            className="text-left text-xs font-semibold uppercase"
            style={headerStyle}
          >
            {columns.map((col) => {
              const isSortable = !!col.sortKey && !!onSort;
              const isActive = col.sortKey === sortField;
              const stickyOffset = STICKY_OFFSETS[col.key];
              const isLastSticky = col.key === LAST_STICKY_KEY;
              const isBoundary = groupBoundaryKeys.has(col.key);
              return (
                <th
                  key={col.key}
                  className={`px-2 py-2 ${col.key === "name" ? "text-left min-w-[6rem] max-w-[10rem]" : "text-center"} ${stickyOffset ? `sticky ${stickyOffset} z-20` : ""} ${isLastSticky ? "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.3)]" : ""} ${isBoundary ? "border-l-2 border-gray-300/40 dark:border-gray-500/30" : ""} ${isSortable ? "cursor-pointer select-none hover:opacity-80" : ""} ${isActive ? "underline decoration-2 underline-offset-2" : ""}`}
                  style={stickyOffset ? { backgroundColor: headerStyle?.backgroundColor as string } : undefined}
                  title={col.tooltip}
                  onClick={isSortable ? () => onSort!(col.sortKey!) : undefined}
                >
                  {col.label}
                  <SortIndicator
                    field={col.sortKey}
                    sortField={sortField}
                    sortOrder={sortOrder}
                  />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {leaders.map((row, idx) => {
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
                  const isActive = col.sortKey === sortField;
                  const rawVal = (row as any)[col.key];
                  const val = WAR_FORMAT_KEYS.has(col.key) && rawVal != null
                    ? Number(rawVal).toFixed(1)
                    : rawVal ?? "—";
                  return (
                    <td
                      key={col.key}
                      className={`px-2 py-2.5 sm:py-1.5 text-center ${boundaryClass} ${col.bold ? "font-semibold" : ""} ${isActive ? "bg-yellow-50/60 dark:bg-yellow-900/15" : ""}`}
                    >
                      {val}
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
                No pitching data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
