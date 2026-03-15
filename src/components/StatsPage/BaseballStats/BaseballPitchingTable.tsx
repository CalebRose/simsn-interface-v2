import { PitchingLeaderRow, PitchingSortField } from "../../../models/baseball/baseballStatsModels";
import { getLogo } from "../../../_utility/getLogo";
import { SimMLB, SimCollegeBaseball } from "../../../_constants/constants";
import { getStatsHeaderStyle } from "./statsHeaderStyle";
import { useAuthStore } from "../../../context/AuthContext";
import "../../Team/baseball/baseballMobile.css";

interface Props {
  leaders: PitchingLeaderRow[];
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
  sortKey?: PitchingSortField;
  bold?: boolean;
  advanced?: boolean;
  tooltip?: string;
}

const COLUMNS: Column[] = [
  { label: "#", key: "rank" },
  { label: "Player", key: "name" },
  { label: "Team", key: "team_abbrev" },
  { label: "G", key: "g", sortKey: "g" },
  { label: "GS", key: "gs", sortKey: "gs" },
  { label: "W", key: "w", sortKey: "wins", bold: true },
  { label: "L", key: "l", sortKey: "l" },
  { label: "SV", key: "sv", sortKey: "saves" },
  { label: "IP", key: "ip", sortKey: "ip" },
  { label: "H", key: "h", sortKey: "h" },
  { label: "R", key: "r", sortKey: "r" },
  { label: "ER", key: "er", sortKey: "er" },
  { label: "BB", key: "bb", sortKey: "bb" },
  { label: "SO", key: "so", sortKey: "so", bold: true },
  { label: "HR", key: "hr", sortKey: "hr" },
  { label: "ITPHR", key: "itphr", tooltip: "Inside-the-Park HR Allowed" },
  { label: "ERA", key: "era", sortKey: "era", bold: true },
  { label: "WHIP", key: "whip", sortKey: "whip" },
  { label: "K/9", key: "k9", sortKey: "k9", advanced: true, tooltip: "Strikeouts per 9 Innings" },
  { label: "BB/9", key: "bb9", sortKey: "bb9", advanced: true, tooltip: "Walks per 9 Innings" },
  { label: "HR/9", key: "hr9", sortKey: "hr9", advanced: true, tooltip: "Home Runs per 9 Innings" },
  { label: "H/9", key: "h9", sortKey: "h9", advanced: true, tooltip: "Hits per 9 Innings" },
  { label: "K/BB", key: "k_bb", sortKey: "k_bb", advanced: true, tooltip: "Strikeout-to-Walk Ratio" },
  { label: "W%", key: "w_pct", sortKey: "w_pct", advanced: true, tooltip: "Win Percentage" },
  { label: "K%", key: "k_pct", sortKey: "k_pct", advanced: true, tooltip: "Strikeout Rate" },
  { label: "BB%", key: "bb_pct", sortKey: "bb_pct", advanced: true, tooltip: "Walk Rate" },
  { label: "BABIP", key: "babip", sortKey: "babip", advanced: true, tooltip: "Batting Average on Balls in Play Against" },
  { label: "IP/GS", key: "ip_gs", sortKey: "ip_gs", advanced: true, tooltip: "Innings per Game Started" },
];

const SortIndicator = ({ field, sortField, sortOrder }: { field?: string; sortField?: string; sortOrder?: string }) => {
  if (!field || field !== sortField) return null;
  return <span className="ml-0.5 text-[10px]">{sortOrder === "asc" ? "▲" : "▼"}</span>;
};

export const BaseballPitchingTable = ({ leaders, league, isRetro, accentColor, onPlayerClick, sortField, sortOrder, onSort }: Props) => {
  const leagueType = league === SimMLB ? SimMLB : SimCollegeBaseball;
  const { isDarkMode } = useAuthStore();
  const headerStyle = getStatsHeaderStyle(accentColor, isDarkMode);

  return (
    <div className="overflow-x-auto baseball-table-wrapper">
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
                  className={`px-2 py-2 ${col.key === "name" ? "text-left min-w-[6rem] sticky left-0 z-10 bg-inherit" : "text-center"} ${isSortable ? "cursor-pointer select-none hover:opacity-80" : ""} ${isActive ? "underline decoration-2 underline-offset-2" : ""}`}
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
                    return <td key={col.key} className="px-2 py-2.5 sm:py-1.5 text-center text-gray-400">{row.rank}</td>;
                  }
                  if (col.key === "name") {
                    return (
                      <td key={col.key} className="px-2 py-2.5 sm:py-1.5 font-medium sticky left-0 z-10 bg-inherit">
                        {onPlayerClick ? (
                          <span className="cursor-pointer hover:underline hover:text-blue-500" onClick={() => onPlayerClick(row.player_id)}>{row.name}</span>
                        ) : row.name}
                      </td>
                    );
                  }
                  if (col.key === "team_abbrev") {
                    return (
                      <td key={col.key} className="px-2 py-2.5 sm:py-1.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {logo && <img src={logo} className="w-4 h-4 object-contain" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                          <span className="text-xs">{row.team_abbrev}</span>
                        </div>
                      </td>
                    );
                  }
                  const isActive = col.sortKey === sortField;
                  const val = (row as any)[col.key] ?? "—";
                  return (
                    <td
                      key={col.key}
                      className={`px-2 py-2.5 sm:py-1.5 text-center ${col.bold ? "font-semibold" : ""} ${isActive ? "bg-yellow-50/60 dark:bg-yellow-900/15" : ""}`}
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
              <td colSpan={COLUMNS.length} className="px-4 py-8 text-center text-gray-400">
                No pitching data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
