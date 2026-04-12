import { useCallback, useEffect, useMemo, useState } from "react";
import { Text } from "../../../_design/Typography";
import { Border } from "../../../_design/Borders";
import { PageContainer } from "../../../_design/Container";
import { SelectDropdown } from "../../../_design/Select";
import { TabGroup, Tab } from "../../../_design/Tabs";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { SimMLB, SimCollegeBaseball } from "../../../_constants/constants";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useAuthStore } from "../../../context/AuthContext";
import { getPrimaryBaseballTeam, displayLevelFromId, NUMERIC_LEVEL_MAP } from "../../../_utility/baseballHelpers";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { isBrightColor } from "../../../_utility/isBrightColor";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { getLogo } from "../../../_utility/getLogo";
import { BaseballService } from "../../../_services/baseballService";
import {
  InjuryReportItem,
  InjuryHistoryItem,
} from "../../../models/baseball/baseballStatsModels";
import { enqueueSnackbar } from "notistack";
import { useModal } from "../../../_hooks/useModal";
import { BaseballScoutingModal } from "./BaseballScouting/BaseballScoutingModal";
import { ScoutingBudget } from "../../../models/baseball/baseballScoutingModels";
import { Player } from "../../../models/baseball/baseballModels";
import "./baseballMobile.css";

// ═══════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════

type InjuryTab = "Current" | "History";

interface Props {
  league: string;
}

export const BaseballInjuryPage = ({ league }: Props) => {
  const { currentUser } = useAuthStore();
  const {
    allTeams,
    seasonContext,
    mlbOrganization,
    collegeOrganization,
    bootstrappedOrgId,
    loadBootstrapForOrg,
    allRosters,
  } = useSimBaseballStore();

  const isCollege = league === SimCollegeBaseball;
  const organization = isCollege ? collegeOrganization : mlbOrganization;
  const primaryTeam = organization
    ? getPrimaryBaseballTeam(organization)
    : undefined;

  // Ensure bootstrap data matches the current league's org
  useEffect(() => {
    if (organization && organization.id !== bootstrappedOrgId) {
      loadBootstrapForOrg(organization.id);
    }
  }, [organization?.id, bootstrappedOrgId, loadBootstrapForOrg]);

  // Team color theming
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

  const logo = useMemo(() => {
    if (!primaryTeam) return "";
    return getLogo(
      league === SimMLB ? SimMLB : SimCollegeBaseball,
      primaryTeam.team_id,
      currentUser?.IsRetro,
    );
  }, [primaryTeam, league, currentUser?.IsRetro]);

  // Player modal
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalPlayerId, setModalPlayerId] = useState<number | null>(null);
  const [scoutingBudget, setScoutingBudget] = useState<ScoutingBudget | null>(
    null,
  );

  const orgId = organization?.id ?? 0;
  const leagueYearId = seasonContext?.current_league_year_id ?? 0;

  // Build a lookup from player_id → contract_id for own org (needed for IR actions)
  const playerContractMap = useMemo(() => {
    const map = new Map<number, number>();
    if (!organization) return map;
    const orgRoster = allRosters.find((r) => r.org_id === organization.id);
    if (!orgRoster) return map;
    for (const p of orgRoster.players) {
      if (p.contract) map.set(p.id, p.contract.id);
    }
    return map;
  }, [allRosters, organization]);

  const [irSubmitting, setIrSubmitting] = useState<number | null>(null);

  const refreshBudget = useCallback(() => {
    if (orgId && leagueYearId) {
      BaseballService.GetScoutingBudget(orgId, leagueYearId)
        .then(setScoutingBudget)
        .catch(() => {});
    }
  }, [orgId, leagueYearId]);

  useEffect(() => {
    refreshBudget();
  }, [refreshBudget]);

  const openPlayerModal = useCallback(
    (playerId: number) => {
      setModalPlayerId(playerId);
      handleOpenModal();
    },
    [handleOpenModal],
  );

  // --- State ---
  const [activeTab, setActiveTab] = useState<InjuryTab>("Current");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedConference, setSelectedConference] = useState<string | null>(
    null,
  );

  // History tab filters (independent from Current tab)
  const [historyLevel, setHistoryLevel] = useState<number | null>(null);
  const [historyTeamId, setHistoryTeamId] = useState<number | null>(null);
  const [historyConference, setHistoryConference] = useState<string | null>(
    null,
  );

  // Data
  const [currentInjuries, setCurrentInjuries] = useState<InjuryReportItem[]>(
    [],
  );
  const [historyEvents, setHistoryEvents] = useState<InjuryHistoryItem[]>([]);

  // League-specific teams: filter allTeams to only those belonging to this league
  // College = level 3, MLB = levels 4-9
  const leagueTeams = useMemo(() => {
    if (!allTeams) return [];
    if (isCollege) {
      return allTeams.filter((t) => t.team_level === 3);
    }
    return allTeams.filter((t) => t.team_level >= 4 && t.team_level <= 9);
  }, [allTeams, isCollege]);

  // Set of team IDs belonging to this league (for client-side filtering)
  const leagueTeamIds = useMemo(
    () => new Set(leagueTeams.map((t) => t.team_id)),
    [leagueTeams],
  );

  // Build a team_abbrev → team_id lookup for history filtering (history items only have team_abbrev)
  const abbrevToTeamId = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of leagueTeams) {
      map.set(t.team_abbrev, t.team_id);
    }
    return map;
  }, [leagueTeams]);

  // Build a team_id → conference lookup
  const teamIdToConference = useMemo(() => {
    const map = new Map<number, string>();
    for (const t of leagueTeams) {
      if (t.conference) map.set(t.team_id, t.conference);
    }
    return map;
  }, [leagueTeams]);

  // Level options (pro only — college has a single level)
  const levelOptions = useMemo<SelectOption[]>(() => {
    if (isCollege) return [];
    const opts: SelectOption[] = [{ value: "__all__", label: "All Levels" }];
    for (const [num] of Object.entries(NUMERIC_LEVEL_MAP).sort(([a], [b]) => Number(b) - Number(a))) {
      opts.push({ value: num, label: displayLevelFromId(Number(num)) });
    }
    return opts;
  }, [isCollege]);

  // Conference options
  const conferenceOptions = useMemo(() => {
    const conferences = new Set<string>();
    for (const t of leagueTeams) {
      if (t.conference) conferences.add(t.conference);
    }
    const sorted = Array.from(conferences).sort();
    const opts: SelectOption[] = [
      { value: "__all__", label: "All Conferences" },
    ];
    for (const c of sorted) {
      opts.push({ value: c, label: c });
    }
    return opts;
  }, [leagueTeams]);

  // Team options — filtered by selected level & conference
  const teamOptions = useMemo(() => {
    let teams = leagueTeams;
    if (selectedLevel != null) {
      teams = teams.filter((t) => t.team_level === selectedLevel);
    } else if (!isCollege) {
      // Default: show MLB-level teams when no level selected
      teams = teams.filter((t) => t.team_level === 9);
    }
    if (selectedConference) {
      teams = teams.filter((t) => t.conference === selectedConference);
    }
    const opts: SelectOption[] = [{ value: "__all__", label: "All Teams" }];
    for (const t of teams.sort((a, b) =>
      a.team_full_name.localeCompare(b.team_full_name),
    )) {
      opts.push({ value: String(t.team_id), label: t.team_full_name });
    }
    return opts;
  }, [leagueTeams, isCollege, selectedLevel, selectedConference]);

  // History team options — filtered by history level & conference
  const historyTeamOptions = useMemo(() => {
    let teams = leagueTeams;
    if (historyLevel != null) {
      teams = teams.filter((t) => t.team_level === historyLevel);
    } else if (!isCollege) {
      teams = teams.filter((t) => t.team_level === 9);
    }
    if (historyConference) {
      teams = teams.filter((t) => t.conference === historyConference);
    }
    const opts: SelectOption[] = [{ value: "__all__", label: "All Teams" }];
    for (const t of teams.sort((a, b) =>
      a.team_full_name.localeCompare(b.team_full_name),
    )) {
      opts.push({ value: String(t.team_id), label: t.team_full_name });
    }
    return opts;
  }, [leagueTeams, isCollege, historyLevel, historyConference]);

  const selectedLevelOption = useMemo(() => {
    if (selectedLevel == null)
      return levelOptions.find((o) => o.value === "__all__") ?? null;
    return levelOptions.find((o) => o.value === String(selectedLevel)) ?? null;
  }, [levelOptions, selectedLevel]);

  const historyLevelOption = useMemo(() => {
    if (historyLevel == null)
      return levelOptions.find((o) => o.value === "__all__") ?? null;
    return levelOptions.find((o) => o.value === String(historyLevel)) ?? null;
  }, [levelOptions, historyLevel]);

  const selectedTeamOption = useMemo(() => {
    if (!selectedTeamId)
      return teamOptions.find((o) => o.value === "__all__") ?? null;
    return teamOptions.find((o) => o.value === String(selectedTeamId)) ?? null;
  }, [teamOptions, selectedTeamId]);

  const selectedConferenceOption = useMemo(() => {
    if (!selectedConference)
      return conferenceOptions.find((o) => o.value === "__all__") ?? null;
    return (
      conferenceOptions.find((o) => o.value === selectedConference) ?? null
    );
  }, [conferenceOptions, selectedConference]);

  const historyTeamOption = useMemo(() => {
    if (!historyTeamId)
      return historyTeamOptions.find((o) => o.value === "__all__") ?? null;
    return (
      historyTeamOptions.find((o) => o.value === String(historyTeamId)) ?? null
    );
  }, [historyTeamOptions, historyTeamId]);

  const historyConferenceOption = useMemo(() => {
    if (!historyConference)
      return conferenceOptions.find((o) => o.value === "__all__") ?? null;
    return conferenceOptions.find((o) => o.value === historyConference) ?? null;
  }, [conferenceOptions, historyConference]);

  // Clear team selection when level changes (Current tab)
  useEffect(() => {
    setSelectedTeamId(null);
  }, [selectedLevel]);

  // Clear team selection when level changes (History tab)
  useEffect(() => {
    setHistoryTeamId(null);
  }, [historyLevel]);

  // Clear team selection when conference changes (Current tab)
  useEffect(() => {
    if (selectedConference && selectedTeamId) {
      const team = leagueTeams.find((t) => t.team_id === selectedTeamId);
      if (team && team.conference !== selectedConference) {
        setSelectedTeamId(null);
      }
    }
  }, [selectedConference, selectedTeamId, leagueTeams]);

  // Clear team selection when conference changes (History tab)
  useEffect(() => {
    if (historyConference && historyTeamId) {
      const team = leagueTeams.find((t) => t.team_id === historyTeamId);
      if (team && team.conference !== historyConference) {
        setHistoryTeamId(null);
      }
    }
  }, [historyConference, historyTeamId, leagueTeams]);

  // --- Fetch ---
  const fetchData = useCallback(async () => {
    if (!seasonContext) return;
    setIsLoading(true);
    try {
      if (activeTab === "Current") {
        const data = await BaseballService.GetInjuries({
          league_year_id: seasonContext.current_league_year_id,
          team_id: selectedTeamId ?? undefined,
        });
        // Client-side filter: only show injuries for teams in this league
        let filtered = data.injuries.filter((inj) =>
          leagueTeamIds.has(inj.team_id),
        );
        // Apply level filter
        if (selectedLevel != null) {
          filtered = filtered.filter(
            (inj) => inj.current_level === selectedLevel,
          );
        }
        // Apply conference filter
        if (selectedConference) {
          filtered = filtered.filter(
            (inj) => teamIdToConference.get(inj.team_id) === selectedConference,
          );
        }
        setCurrentInjuries(filtered);
      } else {
        const data = await BaseballService.GetInjuryHistory({
          league_year_id: seasonContext.current_league_year_id,
        });
        // Client-side filter: only show history for teams in this league
        let filtered = data.events.filter((evt) => {
          const teamId = abbrevToTeamId.get(evt.team_abbrev);
          return teamId !== undefined && leagueTeamIds.has(teamId);
        });
        // Apply history level filter
        if (historyLevel != null) {
          filtered = filtered.filter(
            (evt) => evt.current_level === historyLevel,
          );
        }
        // Apply history conference filter
        if (historyConference) {
          filtered = filtered.filter((evt) => {
            const teamId = abbrevToTeamId.get(evt.team_abbrev);
            return (
              teamId !== undefined &&
              teamIdToConference.get(teamId) === historyConference
            );
          });
        }
        // Apply history team filter
        if (historyTeamId) {
          const targetTeam = leagueTeams.find(
            (t) => t.team_id === historyTeamId,
          );
          if (targetTeam) {
            filtered = filtered.filter(
              (evt) => evt.team_abbrev === targetTeam.team_abbrev,
            );
          }
        }
        setHistoryEvents(filtered);
      }
    } catch (e) {
      console.error("Failed to load injury data", e);
    }
    setIsLoading(false);
  }, [
    seasonContext,
    activeTab,
    selectedLevel,
    selectedTeamId,
    selectedConference,
    historyLevel,
    historyTeamId,
    historyConference,
    leagueTeamIds,
    teamIdToConference,
    abbrevToTeamId,
    leagueTeams,
    organization?.id,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleIrAction = useCallback(
    async (playerId: number, action: "place" | "activate") => {
      const contractId = playerContractMap.get(playerId);
      if (!contractId || !leagueYearId) return;
      setIrSubmitting(playerId);
      try {
        if (action === "place") {
          await BaseballService.PlaceOnIR({ contract_id: contractId, league_year_id: leagueYearId });
          enqueueSnackbar("Player placed on IR", { variant: "success", autoHideDuration: 3000 });
        } else {
          const res = await BaseballService.ActivateFromIR({ contract_id: contractId, league_year_id: leagueYearId });
          enqueueSnackbar("Player activated from IR", { variant: "success", autoHideDuration: 3000 });
          if (res.roster_warning?.over_limit) {
            enqueueSnackbar(
              `Roster warning: ${res.roster_warning.count}/${res.roster_warning.max_roster} — over limit`,
              { variant: "warning", autoHideDuration: 5000 },
            );
          }
        }
        fetchData();
      } catch (err: any) {
        enqueueSnackbar(err?.message || "IR action failed", { variant: "error", autoHideDuration: 4000 });
      }
      setIrSubmitting(null);
    },
    [playerContractMap, leagueYearId, fetchData],
  );

  const pageTitle = isCollege ? "College Baseball" : "MLB";

  if (!seasonContext) {
    return (
      <PageContainer>
        <Text variant="h4">Loading...</Text>
      </PageContainer>
    );
  }

  const leagueType = league === SimMLB ? SimMLB : SimCollegeBaseball;

  return (
    <PageContainer>
      <div className="flex-col w-[95vw] sm:w-[90vw] md:w-full md:mb-6 px-2">
        {/* Header */}
        <div
          className={`flex items-center gap-3 mb-2 flex-wrap rounded-t-lg px-4 py-2 ${headerTextClass}`}
          style={{
            backgroundColor: headerColor,
            borderBottom: `3px solid ${borderColor}`,
          }}
        >
          {logo && (
            <img src={logo} className="w-10 h-10 object-contain" alt="" />
          )}
          <div>
            <Text variant="h4" classes={headerTextClass}>
              {pageTitle} Injury Report
            </Text>
            <Text variant="small" classes={`${headerTextClass} opacity-75`}>
              Season {seasonContext.league_year}
            </Text>
          </div>
        </div>

        {/* Tabs */}
        <TabGroup>
          <Tab
            label="Current"
            selected={activeTab === "Current"}
            setSelected={(val) => setActiveTab(val as InjuryTab)}
          />
          <Tab
            label="History"
            selected={activeTab === "History"}
            setSelected={(val) => setActiveTab(val as InjuryTab)}
          />
        </TabGroup>

        {/* Filters — Current Tab */}
        {activeTab === "Current" && (
          <Border
            classes="p-4 mb-2"
            styles={{ borderTop: `3px solid ${headerColor}` }}
          >
            <div className="flex flex-wrap items-center gap-4">
              {!isCollege && levelOptions.length > 0 && (
                <div className="min-w-[10rem]">
                  <Text variant="small" classes="font-semibold mb-1">
                    Level
                  </Text>
                  <SelectDropdown
                    options={levelOptions}
                    value={selectedLevelOption}
                    onChange={(opt) => {
                      if (!opt) return;
                      const v = (opt as SelectOption).value;
                      setSelectedLevel(v === "__all__" ? null : Number(v));
                    }}
                    placeholder="Filter by level..."
                  />
                </div>
              )}
              <div className="min-w-[14rem]">
                <Text variant="small" classes="font-semibold mb-1">
                  Conference
                </Text>
                <SelectDropdown
                  options={conferenceOptions}
                  value={selectedConferenceOption}
                  onChange={(opt) => {
                    if (!opt) return;
                    const v = (opt as SelectOption).value;
                    setSelectedConference(v === "__all__" ? null : v);
                  }}
                  isSearchable
                  placeholder="Filter by conference..."
                />
              </div>
              <div className="min-w-[14rem]">
                <Text variant="small" classes="font-semibold mb-1">
                  Team
                </Text>
                <SelectDropdown
                  options={teamOptions}
                  value={selectedTeamOption}
                  onChange={(opt) => {
                    if (!opt) return;
                    const v = (opt as SelectOption).value;
                    setSelectedTeamId(v === "__all__" ? null : Number(v));
                  }}
                  isSearchable
                  placeholder="Filter by team..."
                />
              </div>
            </div>
          </Border>
        )}

        {/* Filters — History Tab */}
        {activeTab === "History" && (
          <Border
            classes="p-4 mb-2"
            styles={{ borderTop: `3px solid ${headerColor}` }}
          >
            <div className="flex flex-wrap items-center gap-4">
              {!isCollege && levelOptions.length > 0 && (
                <div className="min-w-[10rem]">
                  <Text variant="small" classes="font-semibold mb-1">
                    Level
                  </Text>
                  <SelectDropdown
                    options={levelOptions}
                    value={historyLevelOption}
                    onChange={(opt) => {
                      if (!opt) return;
                      const v = (opt as SelectOption).value;
                      setHistoryLevel(v === "__all__" ? null : Number(v));
                    }}
                    placeholder="Filter by level..."
                  />
                </div>
              )}
              <div className="min-w-[14rem]">
                <Text variant="small" classes="font-semibold mb-1">
                  Conference
                </Text>
                <SelectDropdown
                  options={conferenceOptions}
                  value={historyConferenceOption}
                  onChange={(opt) => {
                    if (!opt) return;
                    const v = (opt as SelectOption).value;
                    setHistoryConference(v === "__all__" ? null : v);
                  }}
                  isSearchable
                  placeholder="Filter by conference..."
                />
              </div>
              <div className="min-w-[14rem]">
                <Text variant="small" classes="font-semibold mb-1">
                  Team
                </Text>
                <SelectDropdown
                  options={historyTeamOptions}
                  value={historyTeamOption}
                  onChange={(opt) => {
                    if (!opt) return;
                    const v = (opt as SelectOption).value;
                    setHistoryTeamId(v === "__all__" ? null : Number(v));
                  }}
                  isSearchable
                  placeholder="Filter by team..."
                />
              </div>
            </div>
          </Border>
        )}

        {/* Content */}
        <Border
          classes="p-4"
          styles={{ borderTop: `3px solid ${headerColor}` }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Text variant="body" classes="text-gray-500 dark:text-gray-400">
                Loading injuries...
              </Text>
            </div>
          ) : activeTab === "Current" ? (
            <div className="baseball-table-wrapper overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-b-2 border-gray-200 dark:border-gray-600">
                    <th className="px-3 py-2 min-w-[10rem]">Player</th>
                    <th className="px-3 py-2">Team</th>
                    <th className="px-3 py-2">Level</th>
                    <th className="px-3 py-2">Injury</th>
                    <th className="px-3 py-2 text-center">Assigned</th>
                    <th className="px-3 py-2 text-center">Remaining</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    {organization && <th className="px-3 py-2 text-center">IR</th>}
                  </tr>
                </thead>
                <tbody>
                  {currentInjuries.map((inj, idx) => {
                    const teamLogo = getLogo(
                      leagueType,
                      inj.team_id,
                      currentUser?.IsRetro,
                    );
                    const isOwnOrg = inj.org_id === orgId;
                    const hasContract = isOwnOrg && playerContractMap.has(inj.player_id);
                    return (
                      <tr
                        key={`${inj.player_id}-${inj.injury_code}`}
                        className={`border-b border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}`}
                      >
                        <td className="px-3 py-2 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="cursor-pointer hover:underline hover:text-blue-500"
                              onClick={() => openPlayerModal(inj.player_id)}
                            >
                              {inj.name}
                            </span>
                            {inj.on_ir && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-semibold leading-none">
                                IR
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            {teamLogo && (
                              <img
                                src={teamLogo}
                                className="w-4 h-4 object-contain"
                                alt=""
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            )}
                            <span className="text-xs">{inj.team_abbrev}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {displayLevelFromId(inj.current_level)}
                        </td>
                        <td className="px-3 py-2">{inj.injury_name}</td>
                        <td className="px-3 py-2 text-center">
                          {inj.weeks_assigned}w
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={
                              inj.weeks_remaining > 0
                                ? "text-red-600 dark:text-red-400 font-semibold"
                                : "text-green-600 dark:text-green-400"
                            }
                          >
                            {inj.weeks_remaining > 0
                              ? `${inj.weeks_remaining}w`
                              : "Ready"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${inj.status === "injured" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}
                          >
                            {inj.status}
                          </span>
                        </td>
                        {organization && (
                          <td className="px-3 py-2 text-center">
                            {hasContract && !inj.on_ir && (
                              <button
                                className="px-2 py-1 rounded text-[11px] font-semibold bg-purple-600/20 text-purple-400 hover:bg-purple-600/40 disabled:opacity-30"
                                onClick={() => handleIrAction(inj.player_id, "place")}
                                disabled={irSubmitting === inj.player_id}
                              >
                                {irSubmitting === inj.player_id ? "..." : "Place IR"}
                              </button>
                            )}
                            {hasContract && inj.on_ir && (
                              <button
                                className="px-2 py-1 rounded text-[11px] font-semibold bg-green-600/20 text-green-400 hover:bg-green-600/40 disabled:opacity-30"
                                onClick={() => handleIrAction(inj.player_id, "activate")}
                                disabled={irSubmitting === inj.player_id}
                              >
                                {irSubmitting === inj.player_id ? "..." : "Activate"}
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {currentInjuries.length === 0 && (
                    <tr>
                      <td
                        colSpan={organization ? 8 : 7}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        No injuries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="baseball-table-wrapper overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-b-2 border-gray-200 dark:border-gray-600">
                    <th className="px-3 py-2 min-w-[10rem]">Player</th>
                    <th className="px-3 py-2">Team</th>
                    <th className="px-3 py-2">Level</th>
                    <th className="px-3 py-2">Injury</th>
                    <th className="px-3 py-2 text-center">Source</th>
                    <th className="px-3 py-2 text-center">Recovery</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {historyEvents.map((evt, idx) => (
                    <tr
                      key={evt.event_id}
                      className={`border-b border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}`}
                    >
                      <td className="px-3 py-2 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="cursor-pointer hover:underline hover:text-blue-500"
                            onClick={() => openPlayerModal(evt.player_id)}
                          >
                            {evt.name}
                          </span>
                          {evt.on_ir && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-semibold leading-none">
                              IR
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs">{evt.team_abbrev}</td>
                      <td className="px-3 py-2 text-xs">
                        {displayLevelFromId(evt.current_level)}
                      </td>
                      <td className="px-3 py-2">{evt.injury_name}</td>
                      <td className="px-3 py-2 text-center">
                        {evt.source ? (
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              evt.source === "pregame"
                                ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            }`}
                          >
                            {evt.source === "pregame" ? "Pre" : "In"}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {evt.weeks_remaining > 0
                          ? `${evt.weeks_remaining}/${evt.weeks_assigned}w`
                          : `${evt.weeks_assigned}w`}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={
                            (evt.status ?? (evt.weeks_remaining > 0 ? "active" : "healed")) === "active"
                              ? "text-red-600 dark:text-red-400 font-semibold"
                              : "text-green-600 dark:text-green-400"
                          }
                        >
                          {(evt.status ?? (evt.weeks_remaining > 0 ? "active" : "healed")) === "active" ? "Active" : "Healed"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                        {evt.created_at?.split("T")[0] ?? evt.created_at}
                      </td>
                    </tr>
                  ))}
                  {historyEvents.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        No injury history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Border>
      </div>

      {/* Player Modal */}
      {modalPlayerId != null && (
        <BaseballScoutingModal
          isOpen={isModalOpen}
          onClose={() => {
            setModalPlayerId(null);
            handleCloseModal();
          }}
          playerId={modalPlayerId}
          orgId={orgId}
          leagueYearId={leagueYearId}
          scoutingBudget={scoutingBudget}
          onBudgetChanged={refreshBudget}
          league={league === SimMLB ? SimMLB : SimCollegeBaseball}
        />
      )}
    </PageContainer>
  );
};
