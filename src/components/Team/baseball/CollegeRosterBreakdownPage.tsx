import { useCallback, useEffect, useMemo, useState } from "react";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { PageContainer } from "../../../_design/Container";
import { SelectDropdown } from "../../../_design/Select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { Player, BaseballTeam } from "../../../models/baseball/baseballModels";
import { SimCollegeBaseball } from "../../../_constants/constants";
import { useModal } from "../../../_hooks/useModal";
import { BaseballScoutingModal } from "./BaseballScouting/BaseballScoutingModal";
import { ScoutingBudget } from "../../../models/baseball/baseballScoutingModels";
import { BaseballService } from "../../../_services/baseballService";
import { getLogo } from "../../../_utility/getLogo";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useAuthStore } from "../../../context/AuthContext";
import {
  normalizePlayer,
  getClassYear,
  isDraftEligible,
  numericToLetterGrade,
} from "../../../_utility/baseballHelpers";
import { gradeColor } from "./baseballColorConfig";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { isBrightColor } from "../../../_utility/isBrightColor";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import "./baseballMobile.css";

// ═══════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════

/** Combine RS + non-RS into 4 base class buckets. */
const BASE_CLASSES = ["FR", "SO", "JR", "SR"] as const;
const BASE_CLASS_LABELS: Record<string, string> = {
  FR: "Freshmen",
  SO: "Sophomores",
  JR: "Juniors",
  SR: "Seniors",
};

/** Map any class abbrev (e.g. "RS JR") to its base bucket ("JR"). */
const toBaseClass = (abbrev: string): string => {
  for (const base of BASE_CLASSES) {
    if (abbrev === base || abbrev === `RS ${base}`) return base;
  }
  return "SR"; // fallback
};

const td = "px-2 py-1.5 text-sm whitespace-nowrap";
const th =
  "px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap";

// ═══════════════════════════════════════════════
// Sortable header
// ═══════════════════════════════════════════════

type SortConfig = { key: string; dir: "asc" | "desc" } | null;

const SortHeader = ({
  label,
  sortKey,
  sortConfig,
  onSort,
  align = "center",
}: {
  label: string;
  sortKey: string;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  align?: "left" | "center";
}) => {
  const active = sortConfig?.key === sortKey;
  return (
    <th
      className={`${th} cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none text-${align}`}
      onClick={() => onSort(sortKey)}
    >
      {label} {active ? (sortConfig.dir === "asc" ? "▲" : "▼") : ""}
    </th>
  );
};

// ═══════════════════════════════════════════════
// Player row
// ═══════════════════════════════════════════════

const PlayerRow = ({
  p,
  onPlayerClick,
}: {
  p: Player;
  onPlayerClick?: (p: Player) => void;
}) => {
  const cy = getClassYear(p.contract);
  const eligible = isDraftEligible(p.contract, p.age);
  const ovr =
    p.displayovr != null ? numericToLetterGrade(Number(p.displayovr)) : "—";

  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className={`${td} font-medium cursor-pointer`} onClick={() => onPlayerClick?.(p)}>{p.firstname} {p.lastname}</td>
      <td className={`${td} text-center`}>{p.ptype === "Pitcher" ? "P" : "Pos"}</td>
      <td className={`${td} text-center font-semibold ${gradeColor(ovr)}`}>{ovr}</td>
      <td className={`${td} text-center`}>{p.age}</td>
      <td className={`${td} text-center`}>
        {p.bat_hand ?? "—"}/{p.pitch_hand ?? "—"}
      </td>
      <td className={`${td} text-center`}>
        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
          {cy.abbrev || "—"}
        </span>
      </td>
      <td className={`${td} text-center`}>
        {p.contract?.is_extension && (
          <span className="inline-block px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            RS
          </span>
        )}
      </td>
      <td className={`${td} text-center`}>
        {eligible && (
          <span className="inline-block px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 font-medium">
            Eligible
          </span>
        )}
      </td>
      <td className={`${td} text-center`}>
        {p.contract ? `${p.contract.current_year} / ${p.contract.years}` : "—"}
      </td>
    </tr>
  );
};

// ═══════════════════════════════════════════════
// Sort logic
// ═══════════════════════════════════════════════

const CLASS_SORT_ORDER = [
  "FR",
  "RS FR",
  "SO",
  "RS SO",
  "JR",
  "RS JR",
  "SR",
  "RS SR",
];

const resolveSortValue = (p: Player, key: string): string | number => {
  switch (key) {
    case "name":
      return `${p.lastname} ${p.firstname}`;
    case "type":
      return p.ptype;
    case "ovr":
      return p.displayovr != null ? Number(p.displayovr) : 0;
    case "age":
      return p.age;
    case "classYear": {
      const cy = getClassYear(p.contract);
      const idx = CLASS_SORT_ORDER.indexOf(cy.abbrev);
      return idx >= 0 ? idx : 99;
    }
    case "eligible":
      return isDraftEligible(p.contract, p.age) ? 0 : 1;
    default:
      return 0;
  }
};

const sortPlayers = (players: Player[], config: SortConfig): Player[] => {
  if (!config) return players;
  return [...players].sort((a, b) => {
    const va = resolveSortValue(a, config.key);
    const vb = resolveSortValue(b, config.key);
    const cmp =
      typeof va === "string"
        ? va.localeCompare(vb as string)
        : (va as number) - (vb as number);
    return config.dir === "asc" ? cmp : -cmp;
  });
};

// ═══════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════

export const CollegeRosterBreakdownPage = () => {
  const { currentUser } = useAuthStore();
  const {
    organizations,
    collegeOrganization,
    loadBootstrapForOrg,
    seasonContext,
  } = useSimBaseballStore();

  const userOrg = collegeOrganization;

  // --- Org selector ---
  const [viewedOrgId, setViewedOrgId] = useState<number | null>(null);

  const leagueOrgs = useMemo(() => {
    return (organizations ?? [])
      .filter((o) => o.league === "college")
      .sort((a, b) => a.org_abbrev.localeCompare(b.org_abbrev));
  }, [organizations]);

  const viewedOrg = useMemo(() => {
    if (viewedOrgId == null) return userOrg;
    return organizations?.find((o) => o.id === viewedOrgId) ?? userOrg;
  }, [viewedOrgId, organizations, userOrg]);

  // --- Page-local roster data ---
  const [pageRosterMap, setPageRosterMap] = useState<Record<string, Player[]>>(
    {},
  );
  const [pageAllTeams, setPageAllTeams] = useState<BaseballTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const processBootstrapResult = useCallback((data: any) => {
    if (data?.RosterMap) {
      const normalized: Record<string, Player[]> = {};
      for (const [key, players] of Object.entries(data.RosterMap)) {
        normalized[key] = (players as any[]).map(normalizePlayer);
      }
      setPageRosterMap(normalized);
    }
    if (data?.AllTeams) setPageAllTeams(data.AllTeams);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (userOrg?.id && viewedOrgId == null) {
      setIsLoading(true);
      loadBootstrapForOrg(userOrg.id).then(processBootstrapResult);
    }
  }, [userOrg?.id]);

  // --- Team color theming ---
  const primaryTeam = useMemo(() => {
    if (!viewedOrg?.teams) return null;
    return Object.values(viewedOrg.teams)[0] ?? null;
  }, [viewedOrg]);

  const teamColors = useTeamColors(
    primaryTeam?.color_one ?? undefined,
    primaryTeam?.color_two ?? undefined,
    primaryTeam?.color_three ?? undefined,
  );
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }
  const headerTextClass = getTextColorBasedOnBg(headerColor);

  // --- Org dropdown (conference-grouped) ---
  const orgOptions = useMemo(() => {
    const teamByOrgId: Record<number, BaseballTeam> = {};
    for (const t of pageAllTeams) {
      if (t.org_id) teamByOrgId[t.org_id] = t;
    }
    const conferenceMap: Record<string, SelectOption[]> = {};
    for (const org of leagueOrgs) {
      const team = teamByOrgId[org.id] || Object.values(org.teams ?? {})[0];
      const conf = team?.conference || "Independent";
      if (!conferenceMap[conf]) conferenceMap[conf] = [];
      conferenceMap[conf].push({
        value: String(org.id),
        label: team?.team_full_name || org.org_abbrev,
      });
    }
    return Object.keys(conferenceMap)
      .sort()
      .map((conf) => ({
        label: conf,
        options: conferenceMap[conf].sort((a, b) =>
          a.label.localeCompare(b.label),
        ),
      }));
  }, [leagueOrgs, pageAllTeams]);

  const selectedOrgOption = useMemo(() => {
    const orgId = String(viewedOrg?.id ?? userOrg?.id);
    const flat = orgOptions.flatMap((g) => g.options);
    return flat.find((o) => o.value === orgId) ?? null;
  }, [orgOptions, viewedOrg, userOrg]);

  const handleOrgChange = useCallback(
    (orgId: number) => {
      setViewedOrgId(orgId === userOrg?.id ? null : orgId);
      setIsLoading(true);
      loadBootstrapForOrg(orgId).then(processBootstrapResult);
    },
    [userOrg?.id, loadBootstrapForOrg, processBootstrapResult],
  );

  const formatOrgLabel = useCallback(
    (option: SelectOption) => {
      const org = leagueOrgs.find((o) => String(o.id) === option.value);
      if (!org) return <span>{option.label}</span>;
      const team = Object.values(org.teams ?? {})[0];
      const logoUrl = team
        ? getLogo(SimCollegeBaseball, team.team_id, currentUser?.IsRetro)
        : "";
      return (
        <div className="flex items-center gap-2">
          {logoUrl && (
            <img
              src={logoUrl}
              className="w-5 h-5 object-contain"
              alt=""
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span>{option.label}</span>
        </div>
      );
    },
    [leagueOrgs, currentUser?.IsRetro],
  );

  // --- Derived display ---
  const logo = useMemo(() => {
    if (!viewedOrg?.teams) return "";
    const es = Object.values(viewedOrg.teams);
    return es.length > 0
      ? getLogo(SimCollegeBaseball, es[0].team_id, currentUser?.IsRetro)
      : "";
  }, [viewedOrg, currentUser?.IsRetro]);

  const pageTitle = useMemo(() => {
    if (!viewedOrg) return "";
    const t = Object.values(viewedOrg.teams ?? {})[0];
    return t?.team_full_name || viewedOrg.org_abbrev;
  }, [viewedOrg]);

  const seasonLabel = seasonContext
    ? `Season ${seasonContext.league_year}`
    : "";

  // --- Player modal ---
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalPlayerId, setModalPlayerId] = useState<number | null>(null);
  const [scoutingBudget, setScoutingBudget] = useState<ScoutingBudget | null>(
    null,
  );
  const leagueYearId = seasonContext?.current_league_year_id ?? 0;
  const modalOrgId = viewedOrg?.id ?? 0;

  const refreshBudget = useCallback(() => {
    if (modalOrgId && leagueYearId) {
      BaseballService.GetScoutingBudget(modalOrgId, leagueYearId)
        .then(setScoutingBudget)
        .catch(() => {});
    }
  }, [modalOrgId, leagueYearId]);

  useEffect(() => {
    refreshBudget();
  }, [refreshBudget]);

  const openPlayerModal = useCallback(
    (player: Player) => {
      setModalPlayerId(player.id);
      handleOpenModal();
    },
    [handleOpenModal],
  );

  // --- Sort state ---
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key)
        return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      return { key, dir: "desc" };
    });
  }, []);

  // --- Player data ---
  const allPlayers = useMemo(() => {
    return Object.values(pageRosterMap).flat();
  }, [pageRosterMap]);

  /** 4 combined class buckets: FR (incl RS FR), SO, JR, SR */
  const classBuckets = useMemo(() => {
    const buckets: Record<string, Player[]> = {
      FR: [],
      SO: [],
      JR: [],
      SR: [],
    };
    for (const p of allPlayers) {
      const cy = getClassYear(p.contract);
      const base = toBaseClass(cy.abbrev || "SR");
      buckets[base].push(p);
    }
    return BASE_CLASSES.map((key) => ({
      key,
      label: BASE_CLASS_LABELS[key],
      players: buckets[key],
      pitchers: buckets[key].filter((p) => p.ptype === "Pitcher").length,
      position: buckets[key].filter((p) => p.ptype === "Position").length,
    }));
  }, [allPlayers]);

  const draftEligibleCount = useMemo(() => {
    return allPlayers.filter((p) => isDraftEligible(p.contract, p.age)).length;
  }, [allPlayers]);

  const sortedPlayers = useMemo(() => {
    return sortPlayers(allPlayers, sortConfig);
  }, [allPlayers, sortConfig]);

  // --- Guard ---
  if (!userOrg) {
    return (
      <PageContainer>
        <Text variant="h4">No organization found.</Text>
      </PageContainer>
    );
  }

  // --- Render ---
  return (
    <PageContainer>
      <div className="flex-col w-[95vw] sm:w-[90vw] md:w-full md:mb-6 px-2">
        {/* Team-colored header */}
        <div
          className={`flex items-center gap-3 mb-2 flex-wrap rounded-t-lg px-4 py-2 ${headerTextClass}`}
          style={{
            backgroundColor: headerColor,
            borderBottom: `3px solid ${borderColor}`,
          }}
        >
          {logo && (
            <img
              src={logo}
              className="w-10 h-10 object-contain"
              alt={viewedOrg?.org_abbrev ?? ""}
            />
          )}
          <div>
            <Text variant="h4" classes={headerTextClass}>
              {pageTitle}
            </Text>
            <Text variant="small" classes={`${headerTextClass} opacity-75`}>
              Roster Breakdown {seasonLabel && `· ${seasonLabel}`}
            </Text>
          </div>
          <div className="ml-auto">
            <SelectDropdown
              options={orgOptions}
              value={selectedOrgOption}
              onChange={(opt) => {
                if (opt) handleOrgChange(Number((opt as SelectOption).value));
              }}
              isSearchable
              placeholder="Select organization..."
              formatOptionLabel={formatOrgLabel}
              styles={{
                control: (base: any, state: any) => ({
                  ...base,
                  minWidth: "16rem",
                  backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                  borderColor: state.isFocused ? borderColor : "#4A5568",
                }),
              }}
            />
          </div>
        </div>

        {/* Summary cards */}
        <Border
          classes="p-4 mb-2"
          styles={{ borderTop: `3px solid ${headerColor}` }}
        >
          {isLoading ? (
            <Text variant="body" classes="text-gray-500 dark:text-gray-400">
              Loading roster...
            </Text>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {classBuckets.map((b) => (
                <div
                  key={b.key}
                  className="rounded-lg border border-gray-200 dark:border-gray-600 p-3"
                >
                  <Text
                    variant="small"
                    classes="text-gray-500 dark:text-gray-400 font-medium"
                  >
                    {b.label}
                  </Text>
                  <Text variant="h5" classes="font-bold">
                    {b.players.length}
                  </Text>
                  <Text
                    variant="small"
                    classes="text-gray-400 dark:text-gray-500 text-xs"
                  >
                    {b.pitchers}P / {b.position}Pos
                  </Text>
                </div>
              ))}
              <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-3">
                <Text
                  variant="small"
                  classes="text-amber-600 dark:text-amber-400 font-medium"
                >
                  Draft Eligible
                </Text>
                <Text
                  variant="h5"
                  classes="font-bold text-amber-600 dark:text-amber-400"
                >
                  {draftEligibleCount}
                </Text>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-600 p-3">
                <Text
                  variant="small"
                  classes="text-gray-500 dark:text-gray-400 font-medium"
                >
                  Total
                </Text>
                <Text variant="h5" classes="font-bold">
                  {allPlayers.length}
                </Text>
              </div>
            </div>
          )}
        </Border>

        {/* Roster table */}
        {!isLoading && (
          <Border
            classes="p-4"
            styles={{ borderTop: `3px solid ${headerColor}` }}
          >
            <div className="baseball-table-wrapper overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                    <SortHeader
                      label="Name"
                      sortKey="name"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                      align="left"
                    />
                    <SortHeader
                      label="Type"
                      sortKey="type"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                    <SortHeader
                      label="OVR"
                      sortKey="ovr"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                    <SortHeader
                      label="Age"
                      sortKey="age"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                    <th className={`${th} text-center`}>B/T</th>
                    <SortHeader
                      label="Class"
                      sortKey="classYear"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                    <th className={`${th} text-center`}>RS</th>
                    <SortHeader
                      label="Draft"
                      sortKey="eligible"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                    <th className={`${th} text-center`}>Yr</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className={`${td} text-center text-gray-400 py-8`}
                      >
                        No players found.
                      </td>
                    </tr>
                  ) : (
                    sortedPlayers.map((p) => (
                      <PlayerRow
                        key={p.id}
                        p={p}
                        onPlayerClick={openPlayerModal}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Border>
        )}
      </div>

      {modalPlayerId != null && (
        <BaseballScoutingModal
          isOpen={isModalOpen}
          onClose={() => {
            setModalPlayerId(null);
            handleCloseModal();
          }}
          playerId={modalPlayerId}
          orgId={modalOrgId}
          leagueYearId={leagueYearId}
          scoutingBudget={scoutingBudget}
          onBudgetChanged={refreshBudget}
          league={SimCollegeBaseball}
        />
      )}
    </PageContainer>
  );
};
