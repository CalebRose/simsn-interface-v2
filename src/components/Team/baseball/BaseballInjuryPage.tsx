import { useCallback, useEffect, useMemo, useState } from "react";
import { Text } from "../../../_design/Typography";
import { Border } from "../../../_design/Borders";
import { PageContainer } from "../../../_design/Container";
import { SelectDropdown } from "../../../_design/Select";
import { TabGroup, Tab } from "../../../_design/Tabs";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { InfoType, SimMLB, SimCollegeBaseball, League } from "../../../_constants/constants";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useAuthStore } from "../../../context/AuthContext";
import { getPrimaryBaseballTeam } from "../../../_utility/baseballHelpers";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { isBrightColor } from "../../../_utility/isBrightColor";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { getLogo } from "../../../_utility/getLogo";
import { BaseballService } from "../../../_services/baseballService";
import { InjuryReportItem, InjuryHistoryItem } from "../../../models/baseball/baseballStatsModels";
import { useModal } from "../../../_hooks/useModal";
import { ActionModal } from "../../Common/ActionModal";
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
  const { allTeams, seasonContext, mlbOrganization, collegeOrganization, bootstrappedOrgId, loadBootstrapForOrg, allRosters } = useSimBaseballStore();

  const isCollege = league === SimCollegeBaseball;
  const organization = isCollege ? collegeOrganization : mlbOrganization;
  const primaryTeam = organization ? getPrimaryBaseballTeam(organization) : undefined;

  // Ensure bootstrap data matches the current league's org
  useEffect(() => {
    if (organization && organization.id !== bootstrappedOrgId) {
      loadBootstrapForOrg(organization.id);
    }
  }, [organization?.id, bootstrappedOrgId, loadBootstrapForOrg]);

  // Team color theming
  const teamColors = useTeamColors(primaryTeam?.color_one ?? undefined, primaryTeam?.color_two ?? undefined, primaryTeam?.color_three ?? undefined);
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }
  const headerTextClass = getTextColorBasedOnBg(headerColor);

  const logo = useMemo(() => {
    if (!primaryTeam) return "";
    return getLogo(league === SimMLB ? SimMLB : SimCollegeBaseball, primaryTeam.team_id, currentUser?.isRetro);
  }, [primaryTeam, league, currentUser?.isRetro]);

  // Player modal
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalPlayer, setModalPlayer] = useState<Player | null>(null);
  const allPlayers = useMemo(() => allRosters.flatMap((r) => r.players), [allRosters]);

  const openPlayerModal = useCallback((playerId: number) => {
    const player = allPlayers.find((p) => p.id === playerId);
    if (player) {
      setModalPlayer(player);
      handleOpenModal();
    }
  }, [allPlayers, handleOpenModal]);

  // --- State ---
  const [activeTab, setActiveTab] = useState<InjuryTab>("Current");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedConference, setSelectedConference] = useState<string | null>(null);

  // History tab filters (independent from Current tab)
  const [historyTeamId, setHistoryTeamId] = useState<number | null>(null);
  const [historyConference, setHistoryConference] = useState<string | null>(null);

  // Data
  const [currentInjuries, setCurrentInjuries] = useState<InjuryReportItem[]>([]);
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
  const leagueTeamIds = useMemo(() => new Set(leagueTeams.map((t) => t.team_id)), [leagueTeams]);

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

  // Conference options
  const conferenceOptions = useMemo(() => {
    const conferences = new Set<string>();
    for (const t of leagueTeams) {
      if (t.conference) conferences.add(t.conference);
    }
    const sorted = Array.from(conferences).sort();
    const opts: SelectOption[] = [{ value: "__all__", label: "All Conferences" }];
    for (const c of sorted) {
      opts.push({ value: c, label: c });
    }
    return opts;
  }, [leagueTeams]);

  // Team options — filtered by selected conference
  const teamOptions = useMemo(() => {
    // For team dropdown, show the primary level only (college=3, MLB=9)
    const defaultLevel = isCollege ? 3 : 9;
    let teams = leagueTeams.filter((t) => t.team_level === defaultLevel);
    if (selectedConference) {
      teams = teams.filter((t) => t.conference === selectedConference);
    }
    const opts: SelectOption[] = [{ value: "__all__", label: "All Teams" }];
    for (const t of teams.sort((a, b) => a.team_full_name.localeCompare(b.team_full_name))) {
      opts.push({ value: String(t.team_id), label: t.team_full_name });
    }
    return opts;
  }, [leagueTeams, isCollege, selectedConference]);

  // History team options — filtered by history conference
  const historyTeamOptions = useMemo(() => {
    const defaultLevel = isCollege ? 3 : 9;
    let teams = leagueTeams.filter((t) => t.team_level === defaultLevel);
    if (historyConference) {
      teams = teams.filter((t) => t.conference === historyConference);
    }
    const opts: SelectOption[] = [{ value: "__all__", label: "All Teams" }];
    for (const t of teams.sort((a, b) => a.team_full_name.localeCompare(b.team_full_name))) {
      opts.push({ value: String(t.team_id), label: t.team_full_name });
    }
    return opts;
  }, [leagueTeams, isCollege, historyConference]);

  const selectedTeamOption = useMemo(() => {
    if (!selectedTeamId) return teamOptions.find((o) => o.value === "__all__") ?? null;
    return teamOptions.find((o) => o.value === String(selectedTeamId)) ?? null;
  }, [teamOptions, selectedTeamId]);

  const selectedConferenceOption = useMemo(() => {
    if (!selectedConference) return conferenceOptions.find((o) => o.value === "__all__") ?? null;
    return conferenceOptions.find((o) => o.value === selectedConference) ?? null;
  }, [conferenceOptions, selectedConference]);

  const historyTeamOption = useMemo(() => {
    if (!historyTeamId) return historyTeamOptions.find((o) => o.value === "__all__") ?? null;
    return historyTeamOptions.find((o) => o.value === String(historyTeamId)) ?? null;
  }, [historyTeamOptions, historyTeamId]);

  const historyConferenceOption = useMemo(() => {
    if (!historyConference) return conferenceOptions.find((o) => o.value === "__all__") ?? null;
    return conferenceOptions.find((o) => o.value === historyConference) ?? null;
  }, [conferenceOptions, historyConference]);

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
        let filtered = data.injuries.filter((inj) => leagueTeamIds.has(inj.team_id));
        // Apply conference filter
        if (selectedConference) {
          filtered = filtered.filter((inj) => teamIdToConference.get(inj.team_id) === selectedConference);
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
        // Apply history conference filter
        if (historyConference) {
          filtered = filtered.filter((evt) => {
            const teamId = abbrevToTeamId.get(evt.team_abbrev);
            return teamId !== undefined && teamIdToConference.get(teamId) === historyConference;
          });
        }
        // Apply history team filter
        if (historyTeamId) {
          const targetTeam = leagueTeams.find((t) => t.team_id === historyTeamId);
          if (targetTeam) {
            filtered = filtered.filter((evt) => evt.team_abbrev === targetTeam.team_abbrev);
          }
        }
        setHistoryEvents(filtered);
      }
    } catch (e) {
      console.error("Failed to load injury data", e);
    }
    setIsLoading(false);
  }, [seasonContext, activeTab, selectedTeamId, selectedConference, historyTeamId, historyConference, leagueTeamIds, teamIdToConference, abbrevToTeamId, leagueTeams, organization?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pageTitle = isCollege ? "College Baseball" : "MLB";

  if (!seasonContext) {
    return <PageContainer><Text variant="h4">Loading...</Text></PageContainer>;
  }

  const leagueType = league === SimMLB ? SimMLB : SimCollegeBaseball;

  return (
    <PageContainer>
      <div className="flex-col w-[95vw] sm:w-[90vw] md:w-full md:mb-6 px-2">
        {/* Header */}
        <div
          className={`flex items-center gap-3 mb-2 flex-wrap rounded-t-lg px-4 py-2 ${headerTextClass}`}
          style={{ backgroundColor: headerColor, borderBottom: `3px solid ${borderColor}` }}
        >
          {logo && <img src={logo} className="w-10 h-10 object-contain" alt="" />}
          <div>
            <Text variant="h4" classes={headerTextClass}>{pageTitle} Injury Report</Text>
            <Text variant="small" classes={`${headerTextClass} opacity-75`}>Season {seasonContext.league_year}</Text>
          </div>
        </div>

        {/* Tabs */}
        <TabGroup>
          <Tab label="Current" selected={activeTab === "Current"} setSelected={(val) => setActiveTab(val as InjuryTab)} />
          <Tab label="History" selected={activeTab === "History"} setSelected={(val) => setActiveTab(val as InjuryTab)} />
        </TabGroup>

        {/* Filters — Current Tab */}
        {activeTab === "Current" && (
          <Border classes="p-4 mb-2" styles={{ borderTop: `3px solid ${headerColor}` }}>
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-[14rem]">
                <Text variant="small" classes="font-semibold mb-1">Conference</Text>
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
                <Text variant="small" classes="font-semibold mb-1">Team</Text>
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
          <Border classes="p-4 mb-2" styles={{ borderTop: `3px solid ${headerColor}` }}>
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-[14rem]">
                <Text variant="small" classes="font-semibold mb-1">Conference</Text>
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
                <Text variant="small" classes="font-semibold mb-1">Team</Text>
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
        <Border classes="p-4" styles={{ borderTop: `3px solid ${headerColor}` }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Text variant="body" classes="text-gray-500 dark:text-gray-400">Loading injuries...</Text>
            </div>
          ) : activeTab === "Current" ? (
            <div className="baseball-table-wrapper overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-b-2 border-gray-200 dark:border-gray-600">
                    <th className="px-3 py-2 min-w-[10rem]">Player</th>
                    <th className="px-3 py-2">Team</th>
                    <th className="px-3 py-2">Injury</th>
                    <th className="px-3 py-2 text-center">Assigned</th>
                    <th className="px-3 py-2 text-center">Remaining</th>
                    <th className="px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentInjuries.map((inj, idx) => {
                    const teamLogo = getLogo(leagueType, inj.team_id, currentUser?.isRetro);
                    return (
                      <tr
                        key={`${inj.player_id}-${inj.injury_code}`}
                        className={`border-b border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}`}
                      >
                        <td className="px-3 py-2 font-medium">
                          <span
                            className="cursor-pointer hover:underline hover:text-blue-500"
                            onClick={() => openPlayerModal(inj.player_id)}
                          >
                            {inj.name}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            {teamLogo && <img src={teamLogo} className="w-4 h-4 object-contain" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                            <span className="text-xs">{inj.team_abbrev}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">{inj.injury_name}</td>
                        <td className="px-3 py-2 text-center">{inj.weeks_assigned}w</td>
                        <td className="px-3 py-2 text-center">
                          <span className={inj.weeks_remaining > 0 ? "text-red-600 dark:text-red-400 font-semibold" : "text-green-600 dark:text-green-400"}>
                            {inj.weeks_remaining > 0 ? `${inj.weeks_remaining}w` : "Ready"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${inj.status === "injured" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                            {inj.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {currentInjuries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No injuries found.</td>
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
                    <th className="px-3 py-2">Injury</th>
                    <th className="px-3 py-2 text-center">Recovery</th>
                    <th className="px-3 py-2 text-center">Remaining</th>
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
                        <span
                          className="cursor-pointer hover:underline hover:text-blue-500"
                          onClick={() => openPlayerModal(evt.player_id)}
                        >
                          {evt.name}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">{evt.team_abbrev}</td>
                      <td className="px-3 py-2">{evt.injury_name}</td>
                      <td className="px-3 py-2 text-center">{evt.weeks_assigned}w</td>
                      <td className="px-3 py-2 text-center">{evt.weeks_remaining}w</td>
                      <td className="px-3 py-2 text-xs text-gray-500">{evt.created_at}</td>
                    </tr>
                  ))}
                  {historyEvents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No injury history found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Border>
      </div>

      {/* Player Info Modal */}
      {modalPlayer && (
        <ActionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          playerID={modalPlayer.id}
          playerLabel={`${modalPlayer.firstname} ${modalPlayer.lastname}`}
          league={(league === SimMLB ? SimMLB : SimCollegeBaseball) as League}
          modalAction={InfoType}
          player={modalPlayer}
        />
      )}
    </PageContainer>
  );
};
