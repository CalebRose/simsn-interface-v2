import { useState, useMemo } from "react";
import {
  FieldingLeaderRow,
  FieldingSortField,
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

interface Props {
  leaders: FieldingLeaderRow[];
  league: string;
  IsRetro?: boolean;
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
  clientSort?: boolean;
}

const COLUMNS: Column[] = [
  { label: "#", key: "rank" },
  { label: "Player", key: "name" },
  { label: "Team", key: "team_abbrev" },
  { label: "Pos", key: "pos", clientSort: true },
  { label: "G", key: "g", sortKey: "g" },
  { label: "Inn", key: "inn", sortKey: "inn" },
  { label: "PO", key: "po", sortKey: "putouts" },
  { label: "A", key: "a", sortKey: "assists" },
  { label: "E", key: "e", sortKey: "e" },
  { label: "FPCT", key: "fpct", sortKey: "fpct", bold: true },
  {
    label: "TC",
    key: "tc",
    sortKey: "tc",
    advanced: true,
    tooltip: "Total Chances (PO + A + E)",
  },
  {
    label: "TC/G",
    key: "tc_g",
    sortKey: "tc_g",
    advanced: true,
    tooltip: "Total Chances per Game",
  },
  {
    label: "RF/G",
    key: "rf_g",
    sortKey: "rf_g",
    advanced: true,
    tooltip: "Range Factor per Game",
  },
  {
    label: "PO/Inn",
    key: "po_inn",
    sortKey: "po_inn",
    advanced: true,
    tooltip: "Putouts per Inning",
  },
  {
    label: "A/Inn",
    key: "a_inn",
    sortKey: "a_inn",
    advanced: true,
    tooltip: "Assists per Inning",
  },
  {
    label: "E/Inn",
    key: "e_inn",
    sortKey: "e_inn",
    advanced: true,
    tooltip: "Errors per Inning",
  },
  {
    label: "DP",
    key: "dp",
    sortKey: "dp",
    advanced: true,
    tooltip: "Double Plays Participated In",
  },
  {
    label: "RF",
    key: "rf",
    sortKey: "rf",
    advanced: true,
    tooltip: "Range Factor — (PO + A) * 9 / Inn",
  },
  {
    label: "DP/G",
    key: "dp_g",
    sortKey: "dp_g",
    advanced: true,
    tooltip: "Double Plays per Game",
  },
  {
    label: "fWAR",
    key: "fwar",
    sortKey: "fwar",
    advanced: true,
    tooltip: "Fielding Wins Above Replacement",
  },
  {
    label: "ErrR",
    key: "err_runs",
    sortKey: "err_runs",
    advanced: true,
    tooltip: "Error Runs — runs saved/lost from errors",
  },
  {
    label: "RngR",
    key: "range_runs",
    sortKey: "range_runs",
    advanced: true,
    tooltip: "Range Runs — runs saved/lost from range",
  },
  {
    label: "DPR",
    key: "dp_runs",
    sortKey: "dp_runs",
    advanced: true,
    tooltip: "Double Play Runs — runs saved/lost from double plays",
  },
];

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
  pos: "left-[224px]",
};

const LAST_STICKY_KEY = "pos";

const WAR_FORMAT_KEYS = new Set(["fwar", "err_runs", "range_runs", "dp_runs"]);

const ROW_BG_EVEN = "bg-gray-50 dark:bg-gray-800";
const ROW_BG_ODD = "bg-white dark:bg-gray-900";

export const BaseballFieldingTable = ({
  leaders,
  league,
  IsRetro,
  accentColor,
  onPlayerClick,
  sortField,
  sortOrder,
  onSort,
}: Props) => {
  const leagueType = league === SimMLB ? SimMLB : SimCollegeBaseball;
  const { isDarkMode } = useAuthStore();
  const headerStyle = getStatsHeaderStyle(accentColor, isDarkMode);
  const [clientSortField, setClientSortField] = useState<string | null>(null);
  const [clientSortOrder, setClientSortOrder] = useState<"asc" | "desc">("desc");

  const displayLeaders = useMemo(() => {
    if (!clientSortField) return leaders;
    return [...leaders].sort((a, b) => {
      if (clientSortField === "pos") {
        const ai = POS_SORT_ORDER.indexOf((a.pos ?? "").toUpperCase());
        const bi = POS_SORT_ORDER.indexOf((b.pos ?? "").toUpperCase());
        const diff = (ai >= 0 ? ai : 99) - (bi >= 0 ? bi : 99);
        return clientSortOrder === "asc" ? diff : -diff;
      }
      const va = parseFloat(String((a as any)[clientSortField] ?? 0)) || 0;
      const vb = parseFloat(String((b as any)[clientSortField] ?? 0)) || 0;
      return clientSortOrder === "asc" ? va - vb : vb - va;
    });
  }, [leaders, clientSortField, clientSortOrder]);

  return (
    <div className="overflow-x-auto baseball-table-wrapper compact-table">
      <table className="border-collapse text-sm">
        <thead>
          <tr
            className="text-left text-xs font-semibold uppercase"
            style={headerStyle}
          >
            {COLUMNS.map((col) => {
              const isSortable = (!!col.sortKey && !!onSort) || col.clientSort;
              const isServerActive = col.sortKey === sortField;
              const isClientActive = col.clientSort && clientSortField === col.key;
              const isActive = isServerActive || isClientActive;
              const stickyOffset = STICKY_OFFSETS[col.key];
              const isLastSticky = col.key === LAST_STICKY_KEY;
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
                  className={`px-2 py-2 ${col.key === "name" ? "text-left min-w-[6rem]" : "text-center"} ${stickyOffset ? `sticky ${stickyOffset} z-20` : ""} ${isLastSticky ? "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.3)]" : ""} ${isSortable ? "cursor-pointer select-none hover:opacity-80" : ""} ${isActive ? "underline decoration-2 underline-offset-2" : ""}`}
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
                key={`${row.player_id}-${row.pos}`}
                className={`border-b border-gray-100 dark:border-gray-700 ${rowBg}`}
              >
                {COLUMNS.map((col) => {
                  const stickyOffset = STICKY_OFFSETS[col.key];
                  const isLastSticky = col.key === LAST_STICKY_KEY;
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
                  if (col.key === "pos") {
                    return (
                      <td key={col.key} className={`px-2 py-2.5 sm:py-1.5 text-center uppercase ${stickyClass}`}>
                        {row.pos}
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
              <td
                colSpan={COLUMNS.length}
                className="px-4 py-8 text-center text-gray-400"
              >
                No fielding data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
