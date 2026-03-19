import { useState, useMemo } from "react";
import { TeamBattingRow, TeamPitchingRow } from "../../../models/baseball/baseballStatsModels";
import { BaseballStanding } from "../../../models/baseball/baseballModels";
import { getLogo } from "../../../_utility/getLogo";
import { SimMLB, SimCollegeBaseball } from "../../../_constants/constants";
import { getStatsHeaderStyle } from "./statsHeaderStyle";
import { useAuthStore } from "../../../context/AuthContext";
import "../../Team/baseball/baseballMobile.css";

interface Props {
  batting: TeamBattingRow[];
  pitching: TeamPitchingRow[];
  standings?: BaseballStanding[];
  league: string;
  IsRetro?: boolean;
  accentColor?: string;
}

type TeamSortField =
  // Batting
  | "g"
  | "pa"
  | "ab"
  | "r"
  | "h"
  | "2b"
  | "3b"
  | "hr"
  | "itphr"
  | "rbi"
  | "bb"
  | "so"
  | "sb"
  | "cs"
  | "tb"
  | "avg"
  | "obp"
  | "slg"
  | "ops"
  | "babip"
  // Pitching
  | "p_w"
  | "p_l"
  | "p_sv"
  | "p_hld"
  | "p_bs"
  | "p_qs"
  | "p_ip"
  | "p_r"
  | "p_er"
  | "p_hr"
  | "p_itphr"
  | "p_bb"
  | "p_so"
  | "p_ha"
  | "p_era"
  | "p_whip"
  | "p_k9"
  | "p_bb9"
  | "p_hr9";

const BATTING_COLS: {
  label: string;
  key: string;
  sortKey: TeamSortField;
  bold?: boolean;
}[] = [
  { label: "G", key: "g", sortKey: "g" },
  { label: "PA", key: "pa", sortKey: "pa" },
  { label: "R", key: "r", sortKey: "r" },
  { label: "H", key: "h", sortKey: "h" },
  { label: "HR", key: "hr", sortKey: "hr", bold: true },
  { label: "ITPHR", key: "itphr", sortKey: "itphr" },
  { label: "RBI", key: "rbi", sortKey: "rbi" },
  { label: "SB", key: "sb", sortKey: "sb" },
  { label: "BB", key: "bb", sortKey: "bb" },
  { label: "SO", key: "so", sortKey: "so" },
  { label: "AVG", key: "avg", sortKey: "avg", bold: true },
  { label: "OBP", key: "obp", sortKey: "obp" },
  { label: "SLG", key: "slg", sortKey: "slg" },
  { label: "OPS", key: "ops", sortKey: "ops", bold: true },
  { label: "BABIP", key: "babip", sortKey: "babip" },
];

const PITCHING_COLS: {
  label: string;
  key: string;
  sortKey: TeamSortField;
  bold?: boolean;
}[] = [
  { label: "W", key: "w", sortKey: "p_w", bold: true },
  { label: "L", key: "l", sortKey: "p_l" },
  { label: "SV", key: "sv", sortKey: "p_sv" },
  { label: "HLD", key: "hld", sortKey: "p_hld" },
  { label: "BS", key: "bs", sortKey: "p_bs" },
  { label: "QS", key: "qs", sortKey: "p_qs" },
  { label: "IP", key: "ip", sortKey: "p_ip" },
  { label: "R", key: "r", sortKey: "p_r" },
  { label: "ER", key: "er", sortKey: "p_er" },
  { label: "HR", key: "hr", sortKey: "p_hr" },
  { label: "ITPHR", key: "itphr", sortKey: "p_itphr" },
  { label: "BB", key: "bb", sortKey: "p_bb" },
  { label: "SO", key: "so", sortKey: "p_so" },
  { label: "ERA", key: "era", sortKey: "p_era", bold: true },
  { label: "WHIP", key: "whip", sortKey: "p_whip" },
  { label: "K/9", key: "k9", sortKey: "p_k9" },
  { label: "BB/9", key: "bb9", sortKey: "p_bb9" },
  { label: "HR/9", key: "hr9", sortKey: "p_hr9" },
];

// ASC-by-default fields (lower is better)
const ASC_DEFAULTS = new Set<TeamSortField>([
  "so",
  "p_er",
  "p_r",
  "p_hr",
  "p_bb",
  "p_ha",
  "p_era",
  "p_whip",
  "p_bb9",
  "p_hr9",
  "p_l",
  "p_bs",
]);

const parseNum = (v: string | number): number => {
  if (typeof v === "number") return v;
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};

export const BaseballTeamStatsTable = ({ batting, pitching, standings, league, isRetro, accentColor }: Props) => {
  const leagueType = league === SimMLB ? SimMLB : SimCollegeBaseball;
  const { isDarkMode } = useAuthStore();
  const headerStyle = getStatsHeaderStyle(accentColor, isDarkMode);
  const [sortField, setSortField] = useState<TeamSortField>("ops");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const pitchingMap = useMemo(() => {
    const m = new Map<number, TeamPitchingRow>();
    for (const p of pitching) m.set(p.team_id, p);
    return m;
  }, [pitching]);

  // Build a map of team_id → games played from standings (wins + losses), the authoritative source
  const standingsGPMap = useMemo(() => {
    const m = new Map<number, number>();
    for (const s of standings ?? []) m.set(s.team_id, s.wins + s.losses);
    return m;
  }, [standings]);

  const handleSort = (field: TeamSortField) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder(ASC_DEFAULTS.has(field) ? "asc" : "desc");
    }
  };

  const sortedBatting = useMemo(() => {
    const rows = [...batting];
    rows.sort((a, b) => {
      let va: number, vb: number;
      if (sortField.startsWith("p_")) {
        const pKey = sortField.slice(2);
        const pa = pitchingMap.get(a.team_id);
        const pb = pitchingMap.get(b.team_id);
        va = pa ? parseNum((pa as any)[pKey] ?? 0) : 0;
        vb = pb ? parseNum((pb as any)[pKey] ?? 0) : 0;
      } else if (sortField === "g") {
        va = standingsGPMap.get(a.team_id) ?? 0;
        vb = standingsGPMap.get(b.team_id) ?? 0;
      } else {
        va = parseNum((a as any)[sortField] ?? 0);
        vb = parseNum((b as any)[sortField] ?? 0);
      }
      return sortOrder === "asc" ? va - vb : vb - va;
    });
    return rows;
  }, [batting, pitchingMap, standingsGPMap, sortField, sortOrder]);

  const SortHeader = ({
    label,
    field,
    bold,
  }: {
    label: string;
    field: TeamSortField;
    bold?: boolean;
  }) => {
    const isActive = sortField === field;
    return (
      <th
        className={`px-2 py-1 text-center cursor-pointer select-none hover:opacity-80 ${isActive ? "underline decoration-2 underline-offset-2" : ""} ${bold ? "font-bold" : ""}`}
        onClick={() => handleSort(field)}
      >
        {label}
        {isActive && (
          <span className="ml-0.5 text-[10px]">
            {sortOrder === "asc" ? "▲" : "▼"}
          </span>
        )}
      </th>
    );
  };

  return (
    <div className="overflow-x-auto compact-table">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr
            className="text-left text-xs font-semibold uppercase"
            style={headerStyle}
          >
            <th className="px-2 py-2 text-left min-w-[8rem]">Team</th>
            <th className="px-2 py-2 text-center" colSpan={BATTING_COLS.length}>
              <span className="border-b-2 border-current pb-0.5">Batting</span>
            </th>
            <th
              className="px-2 py-2 text-center"
              colSpan={PITCHING_COLS.length}
            >
              <span className="border-b-2 border-current pb-0.5">Pitching</span>
            </th>
          </tr>
          <tr
            className="text-xs border-b border-gray-200 dark:border-gray-600"
            style={
              headerStyle ? { color: headerStyle.color as string } : undefined
            }
          >
            <th className="px-2 py-1"></th>
            {BATTING_COLS.map((col) => (
              <SortHeader
                key={col.sortKey}
                label={col.label}
                field={col.sortKey}
                bold={col.bold}
              />
            ))}
            {PITCHING_COLS.map((col) => (
              <SortHeader
                key={col.sortKey}
                label={col.label}
                field={col.sortKey}
                bold={col.bold}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedBatting.map((b, idx) => {
            const p = pitchingMap.get(b.team_id);
            const logo = getLogo(leagueType, b.team_id, IsRetro);
            return (
              <tr
                key={b.team_id}
                className={`border-b border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}`}
              >
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    {logo && (
                      <img
                        src={logo}
                        className="w-5 h-5 object-contain"
                        alt=""
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <span className="font-medium">{b.team_abbrev}</span>
                  </div>
                </td>
                {BATTING_COLS.map((col) => {
                  const isActive = sortField === col.sortKey;
                  // G column: use standings GP (wins+losses) as the authoritative source
                  const val = col.key === "g"
                    ? (standingsGPMap.get(b.team_id) ?? "—")
                    : (b as any)[col.key] ?? "—";
                  return (
                    <td key={col.sortKey} className={`px-2 py-1.5 text-center ${col.bold ? "font-semibold" : ""} ${isActive ? "bg-yellow-50/60 dark:bg-yellow-900/15" : ""}`}>
                      {val}
                    </td>
                  );
                })}
                {PITCHING_COLS.map((col) => {
                  const isActive = sortField === col.sortKey;
                  return (
                    <td
                      key={col.sortKey}
                      className={`px-2 py-1.5 text-center ${col.bold ? "font-semibold" : ""} ${isActive ? "bg-yellow-50/60 dark:bg-yellow-900/15" : ""}`}
                    >
                      {p ? ((p as any)[col.key] ?? "—") : "—"}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {batting.length === 0 && (
            <tr>
              <td
                colSpan={1 + BATTING_COLS.length + PITCHING_COLS.length}
                className="px-4 py-8 text-center text-gray-400"
              >
                No team stats available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
