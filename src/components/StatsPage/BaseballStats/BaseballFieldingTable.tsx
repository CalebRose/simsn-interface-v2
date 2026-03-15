import { FieldingLeaderRow, FieldingSortField } from "../../../models/baseball/baseballStatsModels";
import { getLogo } from "../../../_utility/getLogo";
import { SimMLB, SimCollegeBaseball } from "../../../_constants/constants";
import { getStatsHeaderStyle } from "./statsHeaderStyle";
import { useAuthStore } from "../../../context/AuthContext";
import "../../Team/baseball/baseballMobile.css";

interface Props {
  leaders: FieldingLeaderRow[];
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
  sortKey?: FieldingSortField;
  bold?: boolean;
  advanced?: boolean;
  tooltip?: string;
}

const COLUMNS: Column[] = [
  { label: "#", key: "rank" },
  { label: "Player", key: "name" },
  { label: "Team", key: "team_abbrev" },
  { label: "Pos", key: "pos" },
  { label: "G", key: "g", sortKey: "g" },
  { label: "Inn", key: "inn", sortKey: "inn" },
  { label: "PO", key: "po", sortKey: "putouts" },
  { label: "A", key: "a", sortKey: "assists" },
  { label: "E", key: "e", sortKey: "e" },
  { label: "FPCT", key: "fpct", sortKey: "fpct", bold: true },
  { label: "TC", key: "tc", sortKey: "tc", advanced: true, tooltip: "Total Chances (PO + A + E)" },
  { label: "TC/G", key: "tc_g", sortKey: "tc_g", advanced: true, tooltip: "Total Chances per Game" },
  { label: "RF/G", key: "rf_g", sortKey: "rf_g", advanced: true, tooltip: "Range Factor per Game" },
  { label: "PO/Inn", key: "po_inn", sortKey: "po_inn", advanced: true, tooltip: "Putouts per Inning" },
  { label: "A/Inn", key: "a_inn", sortKey: "a_inn", advanced: true, tooltip: "Assists per Inning" },
  { label: "E/Inn", key: "e_inn", sortKey: "e_inn", advanced: true, tooltip: "Errors per Inning" },
];

const SortIndicator = ({ field, sortField, sortOrder }: { field?: string; sortField?: string; sortOrder?: string }) => {
  if (!field || field !== sortField) return null;
  return <span className="ml-0.5 text-[10px]">{sortOrder === "asc" ? "▲" : "▼"}</span>;
};

export const BaseballFieldingTable = ({ leaders, league, isRetro, accentColor, onPlayerClick, sortField, sortOrder, onSort }: Props) => {
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
                key={`${row.player_id}-${row.pos}`}
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
                  if (col.key === "pos") {
                    return <td key={col.key} className="px-2 py-2.5 sm:py-1.5 text-center uppercase">{row.pos}</td>;
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
                No fielding data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
