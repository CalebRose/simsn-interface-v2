import { BattingLeaderRow, BattingSortField } from "../../../models/baseball/baseballStatsModels";
import { getLogo } from "../../../_utility/getLogo";
import { SimMLB, SimCollegeBaseball } from "../../../_constants/constants";
import { getStatsHeaderStyle } from "./statsHeaderStyle";
import { useAuthStore } from "../../../context/AuthContext";

interface Props {
  leaders: BattingLeaderRow[];
  league: string;
  isRetro?: boolean;
  accentColor?: string;
  onPlayerClick?: (playerId: number) => void;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
}

interface Column {
  label: string;
  key: string;
  sortKey?: BattingSortField;
  width?: string;
  bold?: boolean;
  advanced?: boolean;
  tooltip?: string;
  format?: (row: BattingLeaderRow) => string;
}

const COLUMNS: Column[] = [
  { label: "#", key: "rank", width: "w-10" },
  { label: "Player", key: "name", width: "min-w-[6rem]" },
  { label: "Team", key: "team_abbrev", width: "w-16" },
  { label: "Pos", key: "position", width: "w-12" },
  { label: "G", key: "g", sortKey: "g" },
  { label: "PA", key: "pa", sortKey: "pa" },
  { label: "AB", key: "ab", sortKey: "ab" },
  { label: "H", key: "h", sortKey: "hits" },
  { label: "2B", key: "2b", sortKey: "2b" },
  { label: "3B", key: "3b", sortKey: "3b" },
  { label: "HR", key: "hr", sortKey: "hr", bold: true },
  { label: "ITPHR", key: "itphr", tooltip: "Inside-the-Park Home Runs" },
  { label: "RBI", key: "rbi", sortKey: "rbi" },
  { label: "R", key: "r", sortKey: "r" },
  { label: "BB", key: "bb", sortKey: "bb" },
  { label: "SO", key: "so", sortKey: "so" },
  { label: "SB", key: "sb", sortKey: "sb" },
  { label: "CS", key: "cs", sortKey: "cs" },
  { label: "TB", key: "tb", sortKey: "tb" },
  { label: "AVG", key: "avg", sortKey: "avg", bold: true },
  { label: "OBP", key: "obp", sortKey: "obp" },
  { label: "SLG", key: "slg", sortKey: "slg" },
  { label: "OPS", key: "ops", sortKey: "ops", bold: true },
  { label: "ISO", key: "iso", sortKey: "iso", advanced: true, tooltip: "Isolated Power (SLG - AVG)" },
  { label: "BABIP", key: "babip", sortKey: "babip", advanced: true, tooltip: "Batting Average on Balls in Play" },
  { label: "BB%", key: "bb_pct", sortKey: "bb_pct", advanced: true, tooltip: "Walk Rate" },
  { label: "K%", key: "k_pct", sortKey: "k_pct", advanced: true, tooltip: "Strikeout Rate" },
  { label: "BB/K", key: "bb_k", sortKey: "bb_k", advanced: true, tooltip: "Walk-to-Strikeout Ratio" },
  { label: "XBH%", key: "xbh_pct", sortKey: "xbh_pct", advanced: true, tooltip: "Extra-Base Hit Rate" },
  { label: "SB%", key: "sb_pct", sortKey: "sb_pct", advanced: true, tooltip: "Stolen Base Success Rate" },
];

const SortIndicator = ({ field, sortField, sortOrder }: { field?: string; sortField?: string; sortOrder?: string }) => {
  if (!field || field !== sortField) return null;
  return <span className="ml-0.5 text-[10px]">{sortOrder === "asc" ? "▲" : "▼"}</span>;
};

export const BaseballBattingTable = ({ leaders, league, isRetro, accentColor, onPlayerClick, sortField, sortOrder, onSort }: Props) => {
  const leagueType = league === SimMLB ? SimMLB : SimCollegeBaseball;
  const { isDarkMode } = useAuthStore();
  const headerStyle = getStatsHeaderStyle(accentColor, isDarkMode);

  const getValue = (row: BattingLeaderRow, col: Column): string | number => {
    if (col.format) return col.format(row);
    return (row as any)[col.key] ?? "—";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr
            className="text-left text-xs font-semibold uppercase"
            style={headerStyle}
          >
            {COLUMNS.map((col) => {
              const isSortable = !!col.sortKey && !!onSort;
              const isActive = col.sortKey === sortField;
              return (
                <th
                  key={col.key}
                  className={`px-2 py-2 ${col.width ?? "w-12"} ${col.key === "name" ? "text-left" : "text-center"} ${isSortable ? "cursor-pointer select-none hover:opacity-80" : ""} ${isActive ? "underline decoration-2 underline-offset-2" : ""}`}
                  title={col.tooltip}
                  onClick={isSortable ? () => onSort!(col.sortKey!) : undefined}
                >
                  {col.label}
                  <SortIndicator field={col.sortKey} sortField={sortField} sortOrder={sortOrder} />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {leaders.map((row, idx) => {
            const logo = getLogo(leagueType, row.team_id, isRetro);
            return (
              <tr
                key={row.player_id}
                className={`border-b border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}`}
              >
                {COLUMNS.map((col) => {
                  if (col.key === "rank") {
                    return <td key={col.key} className="px-2 py-1.5 text-center text-gray-400">{row.rank}</td>;
                  }
                  if (col.key === "name") {
                    return (
                      <td key={col.key} className="px-2 py-1.5 font-medium">
                        {onPlayerClick ? (
                          <span className="cursor-pointer hover:underline hover:text-blue-500" onClick={() => onPlayerClick(row.player_id)}>{row.name}</span>
                        ) : row.name}
                      </td>
                    );
                  }
                  if (col.key === "team_abbrev") {
                    return (
                      <td key={col.key} className="px-2 py-1.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {logo && <img src={logo} className="w-4 h-4 object-contain" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                          <span className="text-xs">{row.team_abbrev}</span>
                        </div>
                      </td>
                    );
                  }
                  if (col.key === "position") {
                    return <td key={col.key} className="px-2 py-1.5 text-center text-xs uppercase">{row.position || "—"}</td>;
                  }
                  const isActive = col.sortKey === sortField;
                  return (
                    <td
                      key={col.key}
                      className={`px-2 py-1.5 text-center ${col.bold ? "font-semibold" : ""} ${isActive ? "bg-yellow-50/60 dark:bg-yellow-900/15" : ""}`}
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
              <td colSpan={COLUMNS.length} className="px-4 py-8 text-center text-gray-400">
                No batting data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
