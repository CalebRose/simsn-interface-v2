import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Border } from "../../_design/Borders";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import { CheckCircle, Medic, TrashCan } from "../../_design/Icons";
import { SelectDropdown } from "../../_design/Select";
import { SelectOption } from "../../_hooks/useSelectStyles";
import routes from "../../_constants/routes";
import {
  BaseballOrganization,
  BaseballGame,
  BaseballStanding,
  BaseballNotification,
  BaseballNewsLog,
  BaseballInjury,
  BaseballTeam,
  BaseballFinancials,
} from "../../models/baseball/baseballModels";
import { SimCollegeBaseball, SimMLB, League } from "../../_constants/constants";
import { useModal } from "../../_hooks/useModal";
import { BaseballScoutingModal } from "../Team/baseball/BaseballScouting/BaseballScoutingModal";
import { ScoutingBudget } from "../../models/baseball/baseballScoutingModels";
import { BaseballService } from "../../_services/baseballService";
import { Player } from "../../models/baseball/baseballModels";
import { getLogo } from "../../_utility/getLogo";
import { useSimBaseballStore } from "../../context/SimBaseballContext";
import { useAuthStore } from "../../context/AuthContext";
import { useResponsive } from "../../_hooks/useMobile";
import {
  displayLevel,
  LEVEL_ORDER,
  LEVEL_TO_NUMERIC,
} from "../../_utility/baseballHelpers";
import { useTeamColors } from "../../_hooks/useTeamColors";
import { isBrightColor } from "../../_utility/isBrightColor";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { BaseballBoxScoreModal } from "../Schedule/BaseballSchedule/BaseballBoxScoreModal";
import {
  BattingLeaderRow,
  PitchingLeaderRow,
} from "../../models/baseball/baseballStatsModels";
import PlayerPicture from "../../_utility/usePlayerFaces";

interface BaseballLandingPageProps {
  organization: BaseballOrganization;
  league: string;
  ts: any;
}

export const BaseballLandingPage = ({
  organization: userOrg,
  league,
  ts,
}: BaseballLandingPageProps) => {
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const {
    organizations,
    standings,
    allGames,
    allTeams,
    notifications,
    news,
    injuryReport,
    seasonContext,
    financials,
    toggleNotificationAsRead,
    deleteNotification,
    loadBootstrapForOrg,
    bootstrappedOrgId,
    isBootstrapLoading,
  } = useSimBaseballStore();
  const { isMobile } = useResponsive();

  // Reload bootstrap when the org prop changes (e.g. switching between MLB ↔ College)
  useEffect(() => {
    if (userOrg.id && userOrg.id !== bootstrappedOrgId && !isBootstrapLoading) {
      loadBootstrapForOrg(userOrg.id);
    }
  }, [userOrg.id, bootstrappedOrgId, isBootstrapLoading, loadBootstrapForOrg]);

  // --- Player modal ---
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalPlayerId, setModalPlayerId] = useState<number | null>(null);
  const [scoutingBudget, setScoutingBudget] = useState<ScoutingBudget | null>(
    null,
  );
  const orgId = userOrg.id;
  const leagueYearId = seasonContext?.current_league_year_id ?? 0;

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

  // --- Org selector: view any org ---
  const [viewedOrgId, setViewedOrgId] = useState<number | null>(null);
  const viewedOrg = useMemo(() => {
    if (viewedOrgId == null) return userOrg;
    return organizations?.find((o) => o.id === viewedOrgId) ?? userOrg;
  }, [viewedOrgId, organizations, userOrg]);
  const isOwnOrg = viewedOrg.id === userOrg.id;
  // True only while a bootstrap network call is in-flight (cache hits are instant)
  const isDataStale = isBootstrapLoading;

  const handleOrgChange = useCallback(
    (orgId: number) => {
      setViewedOrgId(orgId === userOrg.id ? null : orgId);
      setSelectedLevel(null);
      loadBootstrapForOrg(orgId); // use cache when available for instant swap
    },
    [userOrg.id, loadBootstrapForOrg],
  );

  // --- Level navigation ---
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const defaultLevel =
    league === SimCollegeBaseball
      ? (Object.keys(viewedOrg.teams ?? {})[0] ?? "college")
      : "mlb";
  const activeLevel = selectedLevel ?? defaultLevel;

  const activeTeam: BaseballTeam | null = useMemo(() => {
    return viewedOrg.teams?.[activeLevel] ?? null;
  }, [viewedOrg, activeLevel]);
  const activeTeamId = activeTeam?.team_id ?? null;
  const activeNumericLevel =
    activeTeam?.team_level ?? LEVEL_TO_NUMERIC[activeLevel] ?? null;

  // Box score modal
  const [boxScoreGameId, setBoxScoreGameId] = useState<number | null>(null);

  // Team color theming
  const teamColors = useTeamColors(
    activeTeam?.color_one ?? undefined,
    activeTeam?.color_two ?? undefined,
    activeTeam?.color_three ?? undefined,
  );
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }
  const headerTextClass = getTextColorBasedOnBg(headerColor);

  // Build teamId → abbreviation map
  const teamIdToAbbrev = useMemo(() => {
    const map: Record<number, string> = {};
    if (allTeams) {
      for (const t of allTeams) {
        if (t.team_id) map[t.team_id] = t.team_abbrev;
      }
    }
    if (organizations) {
      for (const org of organizations) {
        if (org.teams) {
          for (const team of Object.values(org.teams)) {
            map[team.team_id] = team.team_abbrev;
          }
        }
      }
    }
    return map;
  }, [allTeams, organizations]);

  // Logo for current view
  const logo = useMemo(() => {
    if (!activeTeam) return "";
    return getLogo(
      league === SimMLB ? SimMLB : SimCollegeBaseball,
      activeTeam.team_id,
      currentUser?.IsRetro,
    );
  }, [activeTeam, league, currentUser?.IsRetro]);

  const roleDisplay = useMemo(() => {
    if (!viewedOrg) return "";
    if (league === SimCollegeBaseball) {
      return viewedOrg.coach ? `Coach: ${viewedOrg.coach}` : "Coach";
    }
    const roles: string[] = [];
    if (viewedOrg.owner_name) roles.push(`Owner: ${viewedOrg.owner_name}`);
    if (viewedOrg.gm_name) roles.push(`GM: ${viewedOrg.gm_name}`);
    if (viewedOrg.manager_name)
      roles.push(`Manager: ${viewedOrg.manager_name}`);
    if (viewedOrg.scout_name) roles.push(`Scout: ${viewedOrg.scout_name}`);
    return roles.join(" | ");
  }, [viewedOrg, league]);

  const seasonLabel = seasonContext
    ? `Season ${seasonContext.league_year}, Week ${seasonContext.current_week_index}`
    : ts
      ? `Season ${ts.Season}, Week ${ts.Week}`
      : "";

  const pageTitle = useMemo(() => {
    if (!viewedOrg) return "";
    if (selectedLevel) {
      const team = viewedOrg.teams?.[selectedLevel];
      if (league === SimCollegeBaseball && team?.team_full_name)
        return team.team_full_name;
      if (team?.team_full_name) return team.team_full_name;
      return `${viewedOrg.org_abbrev} ${displayLevel(selectedLevel)}`;
    }
    if (league === SimCollegeBaseball) {
      const t = Object.values(viewedOrg.teams ?? {})[0];
      return t?.team_full_name || viewedOrg.org_abbrev;
    }
    const mlbTeam = viewedOrg.teams?.["mlb"];
    if (mlbTeam?.team_full_name) {
      return `${mlbTeam.team_full_name} Organization`;
    }
    return `${viewedOrg.org_abbrev} Organization`;
  }, [viewedOrg, selectedLevel, league]);

  // --- Org dropdown options ---
  const leagueKey = league === SimMLB ? "mlb" : "college";

  const leagueOrgs = useMemo(() => {
    if (!organizations) return [];
    return organizations
      .filter((o) => o.league === leagueKey)
      .sort((a, b) => a.org_abbrev.localeCompare(b.org_abbrev));
  }, [organizations, leagueKey]);

  const isCollege = league === SimCollegeBaseball;

  const orgOptions = useMemo(() => {
    if (isCollege) {
      const conferenceMap: Record<string, SelectOption[]> = {};
      for (const org of leagueOrgs) {
        const team = Object.values(org.teams ?? {})[0];
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
    }
    return leagueOrgs.map((org) => ({
      value: String(org.id),
      label: org.teams?.["mlb"]?.team_full_name || org.org_abbrev,
    }));
  }, [leagueOrgs, isCollege]);

  const selectedOrgOption = useMemo(() => {
    const id = String(viewedOrg.id);
    if (isCollege) {
      for (const group of orgOptions as {
        label: string;
        options: SelectOption[];
      }[]) {
        const found = group.options.find((o) => o.value === id);
        if (found) return found;
      }
      return null;
    }
    return (orgOptions as SelectOption[]).find((o) => o.value === id) || null;
  }, [orgOptions, viewedOrg.id, isCollege]);

  // --- Filtered data ---

  const teamStandings = useMemo(() => {
    if (!standings || standings.length === 0 || activeNumericLevel == null)
      return [];
    return standings
      .filter((s) => s.team_level === activeNumericLevel)
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses);
  }, [standings, activeNumericLevel]);

  // Group standings by conference/division when data exists
  const groupedStandings = useMemo(() => {
    if (teamStandings.length === 0) return null;

    const hasDivisions = teamStandings.some((s) => s.division);
    const hasConferences = teamStandings.some((s) => s.conference);

    if (hasDivisions && hasConferences) {
      // MLB-style: group by conference → division
      const confMap: Record<string, Record<string, BaseballStanding[]>> = {};
      for (const s of teamStandings) {
        const conf = s.conference || "Other";
        const div = s.division || "Other";
        if (!confMap[conf]) confMap[conf] = {};
        if (!confMap[conf][div]) confMap[conf][div] = [];
        confMap[conf][div].push(s);
      }
      // Sort each division by wins desc
      for (const conf of Object.keys(confMap)) {
        for (const div of Object.keys(confMap[conf])) {
          confMap[conf][div].sort(
            (a, b) => b.wins - a.wins || a.losses - b.losses,
          );
        }
      }
      return { type: "division" as const, conferences: confMap };
    }

    if (hasConferences) {
      // Conference-only grouping
      const confMap: Record<string, BaseballStanding[]> = {};
      for (const s of teamStandings) {
        const conf = s.conference || "Other";
        if (!confMap[conf]) confMap[conf] = [];
        confMap[conf].push(s);
      }
      for (const conf of Object.keys(confMap)) {
        confMap[conf].sort((a, b) => b.wins - a.wins || a.losses - b.losses);
      }
      return { type: "conference" as const, conferences: confMap };
    }

    // Flat list (no grouping)
    return { type: "flat" as const };
  }, [teamStandings]);

  const { seasonGames, nextGame, firstUpcomingIdx } = useMemo(() => {
    if (!allGames || allGames.length === 0 || !activeTeamId) {
      return { seasonGames: [], nextGame: null, firstUpcomingIdx: 0 };
    }
    const teamGames = allGames
      .filter(
        (g) =>
          g.home_team_id === activeTeamId || g.away_team_id === activeTeamId,
      )
      .sort((a, b) => a.week - b.week || a.game_day.localeCompare(b.game_day));

    let foundIdx = teamGames.length;
    let foundGame: BaseballGame | null = null;
    for (let i = 0; i < teamGames.length; i++) {
      if (!teamGames[i].is_complete) {
        foundIdx = i;
        foundGame = teamGames[i];
        break;
      }
    }
    return {
      seasonGames: teamGames,
      nextGame: foundGame,
      firstUpcomingIdx: foundIdx,
    };
  }, [allGames, activeTeamId]);

  const teamNotifications = useMemo(() => {
    if (!isOwnOrg || !notifications || notifications.length === 0) return [];
    return [...notifications]
      .filter((n) => n.org_id === viewedOrg.id)
      .reverse();
  }, [notifications, viewedOrg.id, isOwnOrg]);

  const teamNews = useMemo(() => {
    if (!news || news.length === 0) return [];
    return [...news]
      .filter((n) => n.org_id === viewedOrg.id)
      .slice(-10)
      .reverse();
  }, [news, viewedOrg.id]);

  const teamInjuries = useMemo(() => {
    if (!injuryReport || injuryReport.length === 0) return [];
    return injuryReport;
  }, [injuryReport]);

  const abbrev = (teamId: number) => teamIdToAbbrev[teamId] ?? "???";

  // --- Financial display ---
  const currentBalance = useMemo(() => {
    if (financials?.summary?.ending_balance != null) {
      return financials.summary.ending_balance;
    }
    return viewedOrg.cash ?? null;
  }, [financials, viewedOrg.cash]);

  const obligationsTotal = financials?.obligations?.totals?.overall ?? null;

  // --- Computed leaders (fetched from stats endpoints) ---
  const [avgLeader, setAvgLeader] = useState<BattingLeaderRow | null>(null);
  const [hrLeader, setHrLeader] = useState<BattingLeaderRow | null>(null);
  const [spLeader, setSpLeader] = useState<PitchingLeaderRow | null>(null);
  const [rpLeader, setRpLeader] = useState<PitchingLeaderRow | null>(null);
  const [leadersLoading, setLeadersLoading] = useState(false);

  /** Parse IP string like "123.2" to a float for sorting (123.2 = 123 + 2/3). */
  const parseIP = (ip: string): number => {
    const parts = ip.split(".");
    const full = parseInt(parts[0], 10) || 0;
    const partial = parseInt(parts[1], 10) || 0;
    return full + partial / 3;
  };

  useEffect(() => {
    if (
      !seasonContext?.current_league_year_id ||
      !activeNumericLevel ||
      !activeTeamId
    )
      return;
    let cancelled = false;
    const fetchLeaders = async () => {
      setLeadersLoading(true);
      try {
        // Fetch team-specific leaders for the currently viewed team
        const [battingRes, pitchingRes] = await Promise.all([
          BaseballService.GetBattingLeaders({
            league_year_id: seasonContext.current_league_year_id,
            league_level: activeNumericLevel,
            team_id: activeTeamId,
            sort: "h",
            min_ab: 0,
            page_size: 30,
          }),
          BaseballService.GetPitchingLeaders({
            league_year_id: seasonContext.current_league_year_id,
            league_level: activeNumericLevel,
            team_id: activeTeamId,
            sort: "wins",
            min_ip: 0,
            page_size: 30,
          }),
        ]);

        if (cancelled) return;

        // Batting: sort by AB desc, take top 11, find AVG leader and HR leader
        const byAB = [...(battingRes.leaders ?? [])].sort(
          (a, b) => b.ab - a.ab,
        );
        const top11 = byAB.slice(0, 11);
        if (top11.length > 0) {
          const bestAvg = [...top11].sort(
            (a, b) => parseFloat(b.avg) - parseFloat(a.avg),
          )[0];
          const bestHR = [...top11].sort((a, b) => b.hr - a.hr)[0];
          setAvgLeader(bestAvg);
          setHrLeader(bestHR.hr > 0 ? bestHR : null);
        } else {
          setAvgLeader(null);
          setHrLeader(null);
        }

        // Pitching: sort by IP desc, top 5 are starters, rest are relievers
        const pitchers = [...(pitchingRes.leaders ?? [])].sort(
          (a, b) => parseIP(b.ip) - parseIP(a.ip),
        );
        const topStarters = pitchers.slice(0, 5);
        const relievers = pitchers.slice(5);
        if (topStarters.length > 0) {
          const bestSP = [...topStarters].sort(
            (a, b) => parseFloat(a.era) - parseFloat(b.era),
          )[0];
          setSpLeader(bestSP);
        } else {
          setSpLeader(null);
        }
        if (relievers.length > 0) {
          // Best reliever: lowest ERA among non-top-5 IP pitchers with at least 1 game
          const bestRP =
            [...relievers]
              .filter((p) => p.g > 0)
              .sort((a, b) => parseFloat(a.era) - parseFloat(b.era))[0] ?? null;
          setRpLeader(bestRP);
        } else {
          setRpLeader(null);
        }
      } catch (e) {
        console.error("Failed to fetch leaders", e);
      }
      if (!cancelled) setLeadersLoading(false);
    };
    fetchLeaders();
    return () => {
      cancelled = true;
    };
  }, [seasonContext?.current_league_year_id, activeNumericLevel, activeTeamId]);

  const formatOrgLabel = useCallback(
    (option: SelectOption) => {
      const org = leagueOrgs.find((o) => String(o.id) === option.value);
      if (!org) return <span>{option.label}</span>;
      const team = isCollege
        ? Object.values(org.teams ?? {})[0]
        : org.teams?.["mlb"];
      const logoUrl = team
        ? getLogo(
            league === SimMLB ? SimMLB : SimCollegeBaseball,
            team.team_id,
            currentUser?.IsRetro,
          )
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
    [leagueOrgs, isCollege, league, currentUser?.IsRetro],
  );

  return (
    <div className="flex flex-col w-[95vw] sm:w-[90vw] md:w-full md:mb-6">
      {/* Team-colored header bar */}
      <div
        className={`flex items-center gap-3 mb-2 flex-wrap rounded-lg px-3 py-2 ${headerTextClass}`}
        style={{
          backgroundColor: headerColor,
          borderBottom: `3px solid ${borderColor}`,
        }}
      >
        {logo && (
          <img
            src={logo}
            className="w-10 h-10 object-contain"
            alt={viewedOrg.org_abbrev}
          />
        )}
        <div className="flex flex-col">
          <Text variant="h5" classes={`font-semibold ${headerTextClass}`}>
            {pageTitle}
          </Text>
          {seasonLabel && (
            <Text
              variant="small"
              classes={headerTextClass}
              style={{ opacity: 0.8 }}
            >
              {seasonLabel}
            </Text>
          )}
        </div>
        <div className="ml-auto">
          <SelectDropdown
            options={orgOptions}
            value={selectedOrgOption}
            onChange={(opt) => {
              if (opt) handleOrgChange(Number((opt as SelectOption).value));
            }}
            formatOptionLabel={formatOrgLabel}
            isSearchable
            placeholder="Select organization..."
            styles={{
              control: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                borderColor: state.isFocused ? borderColor : "#4A5568",
                color: "#ffffff",
                minWidth: isMobile ? "60vw" : "280px",
                maxWidth: "400px",
                padding: "0.2rem",
                boxShadow: state.isFocused
                  ? `0 0 0 1px ${borderColor}`
                  : "none",
                borderRadius: "8px",
                transition: "all 0.2s ease",
              }),
            }}
          />
        </div>
        {!isOwnOrg && (
          <span
            className={`text-xs italic ${headerTextClass}`}
            style={{ opacity: 0.7 }}
          >
            Viewing — roster actions disabled
          </span>
        )}
      </div>

      {/* Level Navigation Tabs */}
      {viewedOrg.teams && Object.keys(viewedOrg.teams).length > 1 && (
        <div className="flex items-center gap-1 mb-2 overflow-x-auto">
          {(league === SimCollegeBaseball
            ? Object.keys(viewedOrg.teams)
            : LEVEL_ORDER.filter((l) => viewedOrg.teams?.[l])
          ).map((level) => {
            const team = viewedOrg.teams[level];
            const isActive = activeLevel === level;
            return (
              <button
                key={level}
                onClick={() =>
                  setSelectedLevel(level === defaultLevel ? null : level)
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all cursor-pointer border-2
                  ${
                    !isActive
                      ? "border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 bg-white dark:bg-gray-800"
                      : "font-semibold"
                  }`}
                style={
                  isActive
                    ? {
                        borderColor: headerColor,
                        backgroundColor: `${headerColor}15`,
                        color: headerColor,
                      }
                    : undefined
                }
              >
                <img
                  src={getLogo(
                    league === SimMLB ? SimMLB : SimCollegeBaseball,
                    team.team_id,
                    currentUser?.IsRetro,
                  )}
                  className="w-5 h-5 object-contain"
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span>{displayLevel(level)}</span>
                {team.team_abbrev && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {team.team_abbrev}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Games Bar */}
      {seasonGames.length > 0 && activeTeamId && !isDataStale && (
        <BaseballGamesBar
          games={seasonGames}
          activeTeamId={activeTeamId}
          league={league}
          currentUser={currentUser}
          firstUpcomingIdx={firstUpcomingIdx}
          teamIdToAbbrev={teamIdToAbbrev}
          accentColor={headerColor}
          onGameClick={(gameId) => setBoxScoreGameId(gameId)}
        />
      )}

      <div className="flex-col lg:flex lg:flex-row gap-[1vw] md:gap-4 items-start w-full justify-center">
        {/* Left Column: Standings + Matchup */}
        <div className="flex md:gap-[2vw] lg:gap-4 flex-col-reverse md:flex-row">
          {/* Standings */}
          <Border
            classes="py-0 px-0 w-full md:max-w-[45vw] lg:max-w-[30rem]"
            styles={{ borderTop: `3px solid ${headerColor}` }}
          >
            <div className="p-3">
              <Text variant="h5" classes="mb-2 font-semibold">
                {isCollege
                  ? "Standings"
                  : `${displayLevel(activeLevel)} Standings`}
              </Text>
              {isDataStale ? (
                <Text
                  variant="body-small"
                  classes="text-gray-500 dark:text-gray-400"
                >
                  Loading...
                </Text>
              ) : teamStandings.length === 0 ? (
                <Text
                  variant="body-small"
                  classes="text-gray-500 dark:text-gray-400"
                >
                  No standings available.
                </Text>
              ) : (
                <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                  {groupedStandings?.type === "division" ? (
                    // MLB-style: Conference → Division grouping
                    <div className="space-y-3">
                      {Object.keys(groupedStandings.conferences)
                        .sort((a, b) => {
                          const userConf = activeTeam?.conference;
                          if (userConf) {
                            if (a === userConf && b !== userConf) return -1;
                            if (b === userConf && a !== userConf) return 1;
                          }
                          return a.localeCompare(b);
                        })
                        .map((conf) => (
                          <div key={conf}>
                            <Text
                              variant="body-small"
                              classes="font-bold mb-1 px-1"
                            >
                              {conf}
                            </Text>
                            {Object.keys(groupedStandings.conferences[conf])
                              .sort()
                              .map((div) => {
                                const divStandings =
                                  groupedStandings.conferences[conf][div];
                                return (
                                  <div key={div} className="mb-2">
                                    <div className="text-xs font-semibold uppercase px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                      {div}
                                    </div>
                                    <StandingsTable
                                      rows={divStandings}
                                      activeTeamId={activeTeamId}
                                      league={league}
                                      currentUser={currentUser}
                                      highlightColor={headerColor}
                                    />
                                  </div>
                                );
                              })}
                          </div>
                        ))}
                    </div>
                  ) : groupedStandings?.type === "conference" ? (
                    // Conference-only grouping
                    <div className="space-y-3">
                      {Object.keys(groupedStandings.conferences)
                        .sort((a, b) => {
                          const userConf = activeTeam?.conference;
                          if (userConf) {
                            if (a === userConf && b !== userConf) return -1;
                            if (b === userConf && a !== userConf) return 1;
                          }
                          return a.localeCompare(b);
                        })
                        .map((conf) => {
                          const confStandings = (
                            groupedStandings.conferences as Record<
                              string,
                              BaseballStanding[]
                            >
                          )[conf];
                          return (
                            <div key={conf}>
                              <div className="text-xs font-semibold uppercase px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mb-0.5">
                                {conf}
                              </div>
                              <StandingsTable
                                rows={confStandings}
                                activeTeamId={activeTeamId}
                                league={league}
                                currentUser={currentUser}
                                highlightColor={headerColor}
                              />
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    // Flat list (no conference/division data)
                    <StandingsTable
                      rows={teamStandings}
                      activeTeamId={activeTeamId}
                      league={league}
                      currentUser={currentUser}
                      highlightColor={headerColor}
                    />
                  )}
                </div>
              )}
            </div>
          </Border>

          {/* Middle Column: Matchup + Inbox + News */}
          <div className="flex flex-col items-center md:h-auto w-full md:w-[50vw] lg:w-[32em]">
            {/* Next Game Matchup */}
            <Border
              classes="py-0 px-0 w-full mb-2"
              styles={{ borderTop: `3px solid ${headerColor}` }}
            >
              <div className="p-3">
                <Text variant="h5" classes="mb-2 font-semibold">
                  Next Game
                </Text>
                {isDataStale ? (
                  <Text
                    variant="body-small"
                    classes="text-gray-500 dark:text-gray-400"
                  >
                    Loading...
                  </Text>
                ) : nextGame ? (
                  <div className="flex items-center justify-center gap-4 py-3">
                    <div className="flex flex-col items-center">
                      <img
                        src={getLogo(
                          league === SimMLB ? SimMLB : SimCollegeBaseball,
                          nextGame.away_team_id,
                          currentUser?.IsRetro,
                        )}
                        className="w-12 h-12 object-contain"
                        alt={abbrev(nextGame.away_team_id)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <Text variant="body-small" classes="font-semibold mt-1">
                        {abbrev(nextGame.away_team_id)}
                      </Text>
                    </div>
                    <div className="flex flex-col items-center">
                      <Text
                        variant="body-small"
                        classes="text-gray-500 dark:text-gray-400"
                      >
                        Week {nextGame.week}
                      </Text>
                      <Text variant="h4" classes="font-bold">
                        {activeTeamId === nextGame.home_team_id ? "VS" : "AT"}
                      </Text>
                    </div>
                    <div className="flex flex-col items-center">
                      <img
                        src={getLogo(
                          league === SimMLB ? SimMLB : SimCollegeBaseball,
                          nextGame.home_team_id,
                          currentUser?.IsRetro,
                        )}
                        className="w-12 h-12 object-contain"
                        alt={abbrev(nextGame.home_team_id)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <Text variant="body-small" classes="font-semibold mt-1">
                        {abbrev(nextGame.home_team_id)}
                      </Text>
                    </div>
                  </div>
                ) : (
                  <Text
                    variant="body-small"
                    classes="text-gray-500 dark:text-gray-400"
                  >
                    No upcoming games.
                  </Text>
                )}
              </div>
            </Border>

            {/* Injuries (mobile) */}
            {isMobile && !isDataStale && (
              <Border
                classes="py-0 px-0 w-full mb-2"
                styles={{ borderTop: `3px solid ${headerColor}` }}
              >
                <BaseballInjuriesSection injuries={teamInjuries} />
              </Border>
            )}

            {/* Team Inbox (only for own org) */}
            {isOwnOrg && (
              <Border
                classes="py-0 px-0 w-full mb-2"
                styles={{ borderTop: `3px solid ${headerColor}` }}
              >
                <div className="p-3">
                  <Text variant="h5" classes="mb-2 font-semibold">
                    Team Inbox
                  </Text>
                  {teamNotifications.length === 0 ? (
                    <Text
                      variant="body-small"
                      classes="text-gray-500 dark:text-gray-400"
                    >
                      Your inbox is empty.
                    </Text>
                  ) : (
                    <div className="space-y-1 max-h-[30vh] overflow-y-auto">
                      {teamNotifications.map((n: BaseballNotification) => (
                        <div
                          key={n.id}
                          className={`flex items-start justify-between gap-2 p-2 rounded text-sm ${
                            n.is_read
                              ? "bg-gray-50 dark:bg-gray-800 opacity-70"
                              : "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500"
                          }`}
                        >
                          <Text variant="small" classes="flex-1">
                            {n.message}
                          </Text>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              size="xs"
                              onClick={() => toggleNotificationAsRead(n.id)}
                              disabled={n.is_read}
                              title="Mark as read"
                            >
                              <CheckCircle textColorClass="text-white" />
                            </Button>
                            <Button
                              size="xs"
                              onClick={() => deleteNotification(n.id)}
                              title="Delete"
                            >
                              <TrashCan textColorClass="text-white" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Border>
            )}

            {/* Team News */}
            <Border
              classes="py-0 px-0 w-full"
              styles={{ borderTop: `3px solid ${headerColor}` }}
            >
              <div className="p-3">
                <Text variant="h5" classes="mb-2 font-semibold">
                  Team News
                </Text>
                {teamNews.length === 0 ? (
                  <Text
                    variant="body-small"
                    classes="text-gray-500 dark:text-gray-400"
                  >
                    No news to show.
                  </Text>
                ) : (
                  <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                    {teamNews.map((n: BaseballNewsLog) => (
                      <div key={n.id} className="py-1">
                        <Text variant="small">{n.message}</Text>
                        <Text variant="small" classes="text-right opacity-70">
                          Week {n.week} | {n.message_type} news
                        </Text>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Border>
          </div>
        </div>

        {/* Right Column: Org Info + Financials + Injuries + Stats */}
        <div className="flex flex-col items-start pt-1 md:pt-0 h-full md:h-auto md:w-[30vw] lg:w-[32em] md:min-w-[20em] lg:min-w-[20em] md:max-w-[35vw] lg:max-w-[30em]">
          {/* Org Info */}
          <Border
            classes="py-0 px-0 w-full mb-2"
            styles={{ borderTop: `3px solid ${headerColor}` }}
          >
            <div className="p-3">
              <Text variant="h5" classes="mb-2 font-semibold">
                {selectedLevel ? displayLevel(selectedLevel) : "Organization"}
              </Text>
              <div className="flex items-center gap-3 mb-2">
                {logo && (
                  <img
                    src={logo}
                    className="w-10 h-10 object-contain"
                    alt={viewedOrg.org_abbrev}
                  />
                )}
                <div>
                  <Text variant="body" classes="font-semibold">
                    {pageTitle}
                  </Text>
                  {seasonLabel && (
                    <Text
                      variant="small"
                      classes="text-gray-500 dark:text-gray-400"
                    >
                      {seasonLabel}
                    </Text>
                  )}
                </div>
              </div>
              <div className="space-y-1 text-sm">
                {roleDisplay && <Text variant="small">{roleDisplay}</Text>}
              </div>
            </div>
          </Border>

          {/* Financials (MLB) or Roster Breakdown link (College) */}
          {isCollege ? (
            <Border
              classes="py-0 px-0 w-full mb-2"
              styles={{ borderTop: `3px solid ${headerColor}` }}
            >
              <div className="p-3">
                <Text variant="h5" classes="mb-2 font-semibold">
                  Roster
                </Text>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Players
                    </span>
                    <span className="font-semibold">
                      {Object.values(viewedOrg.teams ?? {}).length > 0
                        ? "View breakdown"
                        : "—"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(routes.COLLEGE_BASEBALL_FINANCIALS)}
                  className="mt-3 text-sm text-blue-500 hover:text-blue-400 hover:underline cursor-pointer"
                >
                  Roster Breakdown →
                </button>
              </div>
            </Border>
          ) : (
            <Border
              classes="py-0 px-0 w-full mb-2"
              styles={{ borderTop: `3px solid ${headerColor}` }}
            >
              <div className="p-3">
                <Text variant="h5" classes="mb-2 font-semibold">
                  Financials
                </Text>
                {isDataStale ? (
                  <Text
                    variant="body-small"
                    classes="text-gray-500 dark:text-gray-400"
                  >
                    Loading...
                  </Text>
                ) : (
                  <FinancialsSection
                    financials={financials}
                    fallbackCash={viewedOrg.cash}
                  />
                )}
                <button
                  onClick={() => navigate(routes.MLB_FINANCIALS)}
                  className="mt-3 text-sm text-blue-500 hover:text-blue-400 hover:underline cursor-pointer"
                >
                  See Full Financials →
                </button>
              </div>
            </Border>
          )}

          {/* Injuries (desktop) */}
          {!isMobile && !isDataStale && (
            <Border
              classes="py-0 px-0 w-full mb-2"
              styles={{ borderTop: `3px solid ${headerColor}` }}
            >
              <BaseballInjuriesSection injuries={teamInjuries} />
            </Border>
          )}

          {/* Team Leaders */}
          <Border
            classes="py-0 px-0 w-full"
            styles={{ borderTop: `3px solid ${headerColor}` }}
          >
            <div className="p-3">
              <Text variant="h5" classes="mb-2 font-semibold">
                Team Leaders
              </Text>
              {leadersLoading ? (
                <Text
                  variant="body-small"
                  classes="text-gray-500 dark:text-gray-400"
                >
                  Loading leaders...
                </Text>
              ) : (
                <div className="space-y-3">
                  {avgLeader && (
                    <LeaderCard
                      label="AVG Leader"
                      labelColor="text-blue-600 dark:text-blue-400"
                      playerId={avgLeader.player_id}
                      name={avgLeader.name}
                      team={activeTeam}
                      league={league}
                      statLine={`${avgLeader.avg}/${avgLeader.obp}/${avgLeader.slg} (${avgLeader.ops} OPS)`}
                      details={`${avgLeader.h} H | ${avgLeader.hr} HR | ${avgLeader.rbi} RBI | ${avgLeader.ab} AB`}
                    />
                  )}

                  {hrLeader && hrLeader.player_id !== avgLeader?.player_id && (
                    <LeaderCard
                      label="Power Leader"
                      labelColor="text-purple-600 dark:text-purple-400"
                      playerId={hrLeader.player_id}
                      name={hrLeader.name}
                      team={activeTeam}
                      league={league}
                      statLine={`${hrLeader.avg}/${hrLeader.obp}/${hrLeader.slg} (${hrLeader.ops} OPS)`}
                      details={`${hrLeader.hr} HR | ${hrLeader.rbi} RBI | ${hrLeader.h} H | ${hrLeader.ab} AB`}
                    />
                  )}

                  {spLeader && (
                    <LeaderCard
                      label="Starting Pitcher"
                      labelColor="text-red-600 dark:text-red-400"
                      playerId={spLeader.player_id}
                      name={spLeader.name}
                      team={activeTeam}
                      league={league}
                      statLine={`${spLeader.era} ERA | ${spLeader.whip} WHIP`}
                      details={`${spLeader.w}-${spLeader.l} | ${spLeader.ip} IP | ${spLeader.so} K | ${spLeader.bb} BB`}
                    />
                  )}

                  {rpLeader && (
                    <LeaderCard
                      label="Top Reliever"
                      labelColor="text-teal-600 dark:text-teal-400"
                      playerId={rpLeader.player_id}
                      name={rpLeader.name}
                      team={activeTeam}
                      league={league}
                      statLine={`${rpLeader.era} ERA | ${rpLeader.whip} WHIP`}
                      details={`${rpLeader.w}-${rpLeader.l} | ${rpLeader.sv} SV | ${rpLeader.ip} IP | ${rpLeader.so} K`}
                    />
                  )}

                  {!avgLeader && !spLeader && !rpLeader && (
                    <Text
                      variant="body-small"
                      classes="text-gray-500 dark:text-gray-400"
                    >
                      No stats available yet.
                    </Text>
                  )}
                </div>
              )}
            </div>
          </Border>
        </div>
      </div>

      {/* Box Score Modal */}
      <BaseballBoxScoreModal
        gameId={boxScoreGameId}
        isOpen={boxScoreGameId !== null}
        onClose={() => setBoxScoreGameId(null)}
        league={league}
        IsRetro={currentUser?.IsRetro}
        onPlayerClick={openPlayerModal}
      />

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
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const formatMoney = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const FinancialsSection = ({
  financials,
  fallbackCash,
}: {
  financials: BaseballFinancials | null;
  fallbackCash: number;
}) => {
  if (!financials) {
    return (
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Cash Balance</span>
          <span className="font-semibold">
            {formatMoney(Number(fallbackCash ?? 0))}
          </span>
        </div>
      </div>
    );
  }

  const { summary, obligations, future_obligations } = financials;
  const futureYears = future_obligations
    ? Object.entries(future_obligations).sort(([a], [b]) => a.localeCompare(b))
    : [];

  return (
    <div className="space-y-3 text-sm">
      {/* Balance */}
      {summary && (
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">
              Current Balance
            </span>
            <span className="font-bold text-base">
              {formatMoney(summary.ending_balance)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">
              Season Revenue
            </span>
            <span className="text-green-600 dark:text-green-400">
              +{formatMoney(summary.season_revenue)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">
              Season Expenses
            </span>
            <span className="text-red-600 dark:text-red-400">
              -{formatMoney(summary.season_expenses)}
            </span>
          </div>
        </div>
      )}

      {/* Obligations */}
      {obligations && (
        <div className="border-t dark:border-gray-600 pt-2 space-y-1">
          <Text variant="small" classes="font-semibold">
            {obligations.league_year} Obligations
          </Text>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">
              Active Salary
            </span>
            <span>{formatMoney(obligations.totals.active_salary)}</span>
          </div>
          {obligations.totals.inactive_salary > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Inactive Salary
              </span>
              <span>{formatMoney(obligations.totals.inactive_salary)}</span>
            </div>
          )}
          {obligations.totals.buyout > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Buyouts</span>
              <span>{formatMoney(obligations.totals.buyout)}</span>
            </div>
          )}
          {obligations.totals.signing_bonus > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Signing Bonuses
              </span>
              <span>{formatMoney(obligations.totals.signing_bonus)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold border-t dark:border-gray-600 pt-1">
            <span>Total Committed</span>
            <span>{formatMoney(obligations.totals.overall)}</span>
          </div>
        </div>
      )}

      {/* Future Obligations */}
      {futureYears.length > 0 && (
        <div className="border-t dark:border-gray-600 pt-2 space-y-1">
          <Text variant="small" classes="font-semibold">
            Future Commitments
          </Text>
          {futureYears.map(([year, amount]) => (
            <div key={year} className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{year}</span>
              <span>{formatMoney(amount)}</span>
            </div>
          ))}
          <Text
            variant="small"
            classes="text-gray-400 dark:text-gray-500 text-xs italic"
          >
            Committed contracts only — see Contracts tab for projected renewals
          </Text>
        </div>
      )}
    </div>
  );
};

const BaseballInjuriesSection = ({
  injuries,
}: {
  injuries: BaseballInjury[];
}) => (
  <div className="p-3">
    <Text variant="h5" classes="mb-2 font-semibold">
      Injury Report
    </Text>
    {injuries.length === 0 ? (
      <Text variant="body-small" classes="text-gray-500 dark:text-gray-400">
        No injuries to report.
      </Text>
    ) : (
      <div className="flex flex-wrap gap-2">
        {injuries.map((injury: BaseballInjury, idx: number) => (
          <div
            key={idx}
            className="flex flex-col p-2 w-[8em] h-[5em] max-h-[7em] sm:w-[12em] sm:h-[8em] border rounded-md bg-red-900 justify-center items-center"
          >
            <Medic textColorClass="text-red-500 rounded-xl bg-white" />
            <Text variant="xs" classes="text-white font-semibold">
              {injury.position} {injury.firstname} {injury.lastname}
            </Text>
            <Text variant="xs" classes="text-white">
              {injury.injury_type}
            </Text>
            <Text variant="xs" classes="text-white">
              {injury.weeks_remaining}{" "}
              {injury.weeks_remaining === 1 ? "week" : "weeks"}
            </Text>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── Leader Card ─────────────────────────────────────────────────────────────

const LeaderCard = ({
  label,
  labelColor,
  playerId,
  name,
  team,
  league,
  statLine,
  details,
}: {
  label: string;
  labelColor: string;
  playerId: number;
  name: string;
  team: BaseballTeam | null;
  league: string;
  statLine: string;
  details: string;
}) => (
  <div className="flex items-start gap-3 p-3 rounded-lg border dark:border-gray-600">
    <div className="w-[72px] h-[72px] shrink-0">
      <PlayerPicture
        playerID={playerId}
        team={team}
        league={(league === SimMLB ? SimMLB : SimCollegeBaseball) as League}
      />
    </div>
    <div className="flex flex-col min-w-0 items-start">
      <Text variant="small" classes={`font-semibold ${labelColor}`}>
        {label}
      </Text>
      <Text variant="body" classes="font-semibold truncate">
        {name}
      </Text>
      <Text variant="small" classes="font-medium text-left">
        {statLine}
      </Text>
      <Text
        variant="small"
        classes="text-gray-500 dark:text-gray-400 text-left"
      >
        {details}
      </Text>
    </div>
  </div>
);

// ─── Games Bar ───────────────────────────────────────────────────────────────

interface BaseballGamesBarProps {
  games: BaseballGame[];
  activeTeamId: number;
  league: string;
  currentUser: any;
  firstUpcomingIdx: number;
  teamIdToAbbrev: Record<number, string>;
  onGameClick?: (gameId: number) => void;
}

const PAST_GAMES_VISIBLE = 3;

const BaseballGamesBar = ({
  games,
  activeTeamId,
  league,
  currentUser,
  firstUpcomingIdx,
  teamIdToAbbrev,
  accentColor,
  onGameClick,
}: BaseballGamesBarProps & { accentColor?: string }) => {
  const leagueType = league === SimMLB ? SimMLB : SimCollegeBaseball;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll: position so ~3 completed games are visible to the left
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || games.length === 0) return;
    // Wait a tick for layout to settle
    requestAnimationFrame(() => {
      const firstCard = el.firstElementChild as HTMLElement | null;
      if (!firstCard) return;
      const cardWidth = firstCard.offsetWidth;
      const gap = parseFloat(getComputedStyle(el).gap) || 8;
      const step = cardWidth + gap;
      const targetIdx = Math.max(0, firstUpcomingIdx - PAST_GAMES_VISIBLE);
      el.scrollTo({ left: targetIdx * step, behavior: "auto" });
    });
  }, [games, firstUpcomingIdx]);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -240, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 240, behavior: "smooth" });
  };

  const abbrev = (id: number) => teamIdToAbbrev[id] ?? "???";

  return (
    <div className="flex pb-1 mb-2">
      <div className="flex w-[95vw] sm:w-[90vw] md:w-full max-w-[1600px] justify-center">
        <div className="relative flex items-center w-[92vw] md:w-[85vw] lg:w-[72.6em] 3xl:w-full pb-1">
          {/* Left scroll button */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-gray-800 text-white border border-gray-600 hover:bg-gray-700 transition-colors"
          >
            &lt;
          </button>

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="flex flex-row gap-2 overflow-x-auto w-full px-8 py-1"
          >
            {games.map((game, idx) => {
              const isHome = game.home_team_id === activeTeamId;
              const opponentId = isHome ? game.away_team_id : game.home_team_id;
              const opponentAbbrev = abbrev(opponentId);
              const prefix = isHome ? "vs" : "@";
              const teamScore = isHome ? game.home_score : game.away_score;
              const oppScore = isHome ? game.away_score : game.home_score;
              const isComplete = !!game.is_complete;
              const won = isComplete && teamScore > oppScore;
              const lost = isComplete && teamScore < oppScore;
              const isNextGame = idx === firstUpcomingIdx;

              let cardBg = isHome
                ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                : "bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-600/60";
              if (isComplete) {
                if (won)
                  cardBg = "bg-green-50 dark:bg-green-900/20 border-green-500";
                else if (lost)
                  cardBg = "bg-red-50 dark:bg-red-900/20 border-red-500";
                else cardBg = "bg-gray-100 dark:bg-gray-700 border-gray-400";
              }

              return (
                <div
                  key={game.id}
                  className={`flex flex-col items-center shrink-0 w-28 md:w-32 lg:w-36 rounded-lg border-2 px-2 py-1.5 ${cardBg} ${isComplete && onGameClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
                  style={
                    isNextGame
                      ? {
                          boxShadow: `0 0 0 2px ${accentColor || "#60a5fa"}`,
                          outline: "1px solid transparent",
                          outlineOffset: "1px",
                        }
                      : undefined
                  }
                  onClick={
                    isComplete && onGameClick
                      ? () => onGameClick(game.id)
                      : undefined
                  }
                >
                  {/* Week */}
                  <span className="text-[0.6rem] text-gray-500 dark:text-gray-400">
                    Wk {game.week}
                    {game.game_day ? ` ${game.game_day.toUpperCase()}` : ""}
                  </span>

                  {/* Opponent logo */}
                  <img
                    src={getLogo(leagueType, opponentId, currentUser?.IsRetro)}
                    className="w-7 h-7 md:w-8 md:h-8 object-contain my-0.5"
                    alt={opponentAbbrev}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />

                  {/* Matchup */}
                  <span className="text-xs font-semibold">
                    {prefix} {opponentAbbrev}
                  </span>

                  {/* Result */}
                  {isComplete ? (
                    <div className="flex flex-col items-center mt-0.5">
                      <span
                        className={`text-sm font-bold ${won ? "text-green-600 dark:text-green-400" : lost ? "text-red-600 dark:text-red-400" : ""}`}
                      >
                        {teamScore} - {oppScore}
                      </span>
                      <span
                        className={`text-[0.55rem] font-bold uppercase tracking-wider px-1.5 py-px rounded mt-0.5 ${
                          won
                            ? "bg-green-600 text-white"
                            : lost
                              ? "bg-red-600 text-white"
                              : "bg-gray-500 text-white"
                        }`}
                      >
                        {won ? "W" : lost ? "L" : "T"}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`text-[0.65rem] mt-1 ${isNextGame ? "font-bold text-blue-500" : "text-gray-400 dark:text-gray-500"}`}
                    >
                      {isNextGame ? "NEXT" : "—"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right scroll button */}
          <button
            onClick={scrollRight}
            className="absolute right-0 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-gray-800 text-white border border-gray-600 hover:bg-gray-700 transition-colors"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Standings Table ─────────────────────────────────────────────────────────

const formatGB = (gb: number) => {
  if (gb === 0) return "—";
  return gb % 1 === 0 ? String(gb) : gb.toFixed(1);
};

const StandingsTable = ({
  rows,
  activeTeamId,
  league,
  currentUser,
  highlightColor,
}: {
  rows: BaseballStanding[];
  activeTeamId: number | null;
  league: string;
  currentUser: any;
  highlightColor?: string;
}) => {
  const leader = rows[0];

  return (
    <div className="compact-table overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 sticky top-0">
          <tr>
            <th className="px-2 py-1">#</th>
            <th className="px-2 py-1">Team</th>
            <th className="px-2 py-1">W</th>
            <th className="px-2 py-1">L</th>
            <th className="px-2 py-1">PCT</th>
            <th className="px-2 py-1">GB</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s, idx) => {
            const gb = leader
              ? (leader.wins - s.wins + (s.losses - leader.losses)) / 2
              : 0;
            return (
              <tr
                key={s.team_id}
                className={`border-b dark:border-gray-600 ${
                  s.team_id === activeTeamId
                    ? "font-semibold"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                style={
                  s.team_id === activeTeamId && highlightColor
                    ? {
                        backgroundColor: `${highlightColor}20`,
                        borderLeft: `3px solid ${highlightColor}`,
                      }
                    : undefined
                }
              >
                <td className="px-2 py-1">{idx + 1}</td>
                <td className="px-2 py-1 flex items-center gap-1">
                  <img
                    src={getLogo(
                      league === SimMLB ? SimMLB : SimCollegeBaseball,
                      s.team_id,
                      currentUser?.IsRetro,
                    )}
                    className="w-5 h-5 object-contain"
                    alt={s.team_abbrev}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {s.team_abbrev}
                </td>
                <td className="px-2 py-1">{s.wins}</td>
                <td className="px-2 py-1">{s.losses}</td>
                <td className="px-2 py-1">{s.win_pct?.toFixed(3)}</td>
                <td className="px-2 py-1">{formatGB(gb)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
