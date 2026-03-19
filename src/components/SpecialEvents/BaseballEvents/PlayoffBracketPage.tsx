import { useCallback, useEffect, useMemo, useState } from "react";
import { Text } from "../../../_design/Typography";
import { Border } from "../../../_design/Borders";
import { PageContainer } from "../../../_design/Container";
import { TabGroup, Tab } from "../../../_design/Tabs";
import { SelectDropdown } from "../../../_design/Select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { SimMLB, SimCollegeBaseball } from "../../../_constants/constants";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useAuthStore } from "../../../context/AuthContext";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { isBrightColor } from "../../../_utility/isBrightColor";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { getLogo } from "../../../_utility/getLogo";
import { getPrimaryBaseballTeam } from "../../../_utility/baseballHelpers";
import { BaseballService } from "../../../_services/baseballService";
import {
  PlayoffBracketResponse, PlayoffSeries, CWSBracketEntry, PendingGame,
  MLB_ROUND_ORDER, MILB_ROUND_ORDER, CWS_ROUND_ORDER, ROUND_LABELS,
  SERIES_LENGTH_LABEL, CLINCH_WINS,
  BootstrapPlayoffEvent, bootstrapPlayoffToBracket,
} from "../../../models/baseball/baseballEventModels";
import "../../Team/baseball/baseballMobile.css";

// ═══════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════

const SeriesCard = ({
  series,
  league,
  IsRetro,
}: {
  series: PlayoffSeries;
  league: string;
  IsRetro?: boolean;
}) => {
  const leagueType = league === SimMLB ? SimMLB : SimCollegeBaseball;
  const logoA = getLogo(leagueType, series.team_a.id, IsRetro);
  const logoB = getLogo(leagueType, series.team_b.id, IsRetro);

  const statusColor =
    series.status === "complete"
      ? "border-green-400 dark:border-green-600"
      : series.status === "active"
        ? "border-blue-400 dark:border-blue-500"
        : "border-gray-300 dark:border-gray-600";

  const isWinnerA = series.winner?.id === series.team_a.id;
  const isWinnerB = series.winner?.id === series.team_b.id;

  const clinchWins = CLINCH_WINS[series.series_length] ?? 1;
  const gameNumber = series.status === "active" ? series.wins_a + series.wins_b + 1 : null;

  return (
    <div className={`border-2 rounded-lg p-3 ${statusColor} bg-white dark:bg-gray-800 min-w-full sm:min-w-[14rem]`}>
      {/* Series format header */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold">
          {SERIES_LENGTH_LABEL[series.series_length] ?? `Bo${series.series_length}`}
        </span>
        {gameNumber && (
          <span className="text-[10px] text-blue-500 dark:text-blue-400 font-medium">
            Game {gameNumber}
          </span>
        )}
      </div>
      {/* Team A */}
      <div
        className={`flex items-center justify-between gap-2 py-1 ${isWinnerA ? "font-bold" : isWinnerB ? "opacity-50" : ""}`}
      >
        <div className="flex items-center gap-2">
          {logoA && (
            <img
              src={logoA}
              className="w-5 h-5 object-contain"
              alt=""
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span className="text-sm">{series.team_a.abbrev}</span>
          {series.team_a.seed > 0 && (
            <span className="text-[11px] sm:text-[10px] text-gray-400">
              ({series.team_a.seed})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold tabular-nums">{series.wins_a}</span>
          {series.status !== "complete" && (
            <span className="text-[10px] text-gray-400 tabular-nums">/ {clinchWins}</span>
          )}
        </div>
      </div>
      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
      {/* Team B */}
      <div
        className={`flex items-center justify-between gap-2 py-1 ${isWinnerB ? "font-bold" : isWinnerA ? "opacity-50" : ""}`}
      >
        <div className="flex items-center gap-2">
          {logoB && (
            <img
              src={logoB}
              className="w-5 h-5 object-contain"
              alt=""
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span className="text-sm">{series.team_b.abbrev}</span>
          {series.team_b.seed > 0 && (
            <span className="text-[11px] sm:text-[10px] text-gray-400">
              ({series.team_b.seed})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold tabular-nums">{series.wins_b}</span>
          {series.status !== "complete" && (
            <span className="text-[10px] text-gray-400 tabular-nums">/ {clinchWins}</span>
          )}
        </div>
      </div>
      {/* Status badge */}
      <div className="mt-1.5 text-center">
        <span
          className={`text-[11px] sm:text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${
            series.status === "complete"
              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
              : series.status === "active"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          }`}
        >
          {series.status === "complete"
            ? `${series.winner?.abbrev} wins`
            : series.status === "active"
              ? "In Progress"
              : "Pending"}
        </span>
      </div>
    </div>
  );
};

/** Placeholder card for teams with first-round byes (MLB seeds 1 & 2). */
const ByeCard = ({
  team, league, isRetro,
}: {
  team: { id: number; abbrev: string; seed: number };
  league: string;
  isRetro?: boolean;
}) => {
  const leagueType = league === SimMLB ? SimMLB : SimCollegeBaseball;
  const logo = getLogo(leagueType, team.id, isRetro);
  return (
    <div className="border-2 rounded-lg p-3 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 min-w-full sm:min-w-[14rem]">
      <div className="flex items-center justify-between gap-2 py-1 font-semibold">
        <div className="flex items-center gap-2">
          {logo && <img src={logo} className="w-5 h-5 object-contain" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
          <span className="text-sm">{team.abbrev}</span>
          <span className="text-[11px] sm:text-[10px] text-gray-400">({team.seed})</span>
        </div>
      </div>
      <div className="mt-1 text-center">
        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
          First-Round Bye
        </span>
      </div>
    </div>
  );
};

const RoundColumn = ({
  roundKey, seriesList, league, IsRetro, conference, byeTeams,
}: {
  roundKey: string;
  seriesList: PlayoffSeries[];
  league: string;
  IsRetro?: boolean;
  conference?: string | null;
  byeTeams?: { id: number; abbrev: string; seed: number }[];
}) => {
  const filtered = conference ? seriesList.filter((s) => s.conference === conference || s.conference === null) : seriesList;
  const showByes = roundKey === "WC" && byeTeams && byeTeams.length > 0;
  const filteredByes = showByes && conference
    ? byeTeams!.filter((bt) => {
        // Match bye teams to the conference by checking DS series
        return true; // Bye teams are shown for all conferences when we can't filter
      })
    : byeTeams;

  return (
    <div className="flex flex-col items-center gap-4">
      <Text
        variant="small"
        classes="font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400"
      >
        {ROUND_LABELS[roundKey] ?? roundKey}
      </Text>
      {showByes && filteredByes && filteredByes.map((bt) => (
        <ByeCard key={bt.id} team={bt} league={league} isRetro={IsRetro} />
      ))}
      {filtered.length === 0 && !showByes ? (
        <div className="text-xs text-gray-400 italic">TBD</div>
      ) : (
        filtered.map((s) => (
          <SeriesCard
            key={s.series_id}
            series={s}
            league={league}
            IsRetro={IsRetro}
          />
        ))
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// Up Next — Pending Games
// ═══════════════════════════════════════════════

const UpNextSection = ({
  games, headerColor,
}: {
  games: PendingGame[];
  headerColor: string;
}) => {
  if (games.length === 0) return null;

  return (
    <Border classes="p-4 mb-2" styles={{ borderTop: `3px solid ${headerColor}` }}>
      <Text variant="h5" classes="mb-3">Up Next</Text>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {games.map((g) => {
          const gameInSeries = g.wins_a + g.wins_b + 1;
          const clinch = CLINCH_WINS[g.series_length] ?? 1;
          return (
            <div
              key={g.game_id}
              className="flex items-center justify-between gap-3 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{g.away_abbrev}</span>
                  <span className="text-[10px] text-gray-400">@</span>
                  <span className="text-sm font-medium">{g.home_abbrev}</span>
                </div>
                <span className="text-[10px] text-gray-400">
                  {ROUND_LABELS[g.round] ?? g.round} &middot; Game {gameInSeries}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 tabular-nums">
                  {g.wins_a}-{g.wins_b} (need {clinch})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Border>
  );
};

// ═══════════════════════════════════════════════
// CWS Bracket Table
// ═══════════════════════════════════════════════

const CWSBracketTable = ({ entries }: { entries: CWSBracketEntry[] }) => {
  const winners = entries.filter((e) => e.bracket_side === "winners");
  const losers = entries.filter((e) => e.bracket_side === "losers");
  const eliminated = entries.filter((e) => e.bracket_side === "eliminated");

  const renderGroup = (
    label: string,
    items: CWSBracketEntry[],
    colorClass: string,
  ) => (
    <div>
      <Text variant="small" classes={`font-bold mb-2 ${colorClass}`}>
        {label}
      </Text>
      <div className="space-y-1">
        {items.map((e) => (
          <div key={e.team_id} className="flex items-center gap-2 text-sm">
            <span className="w-6 text-right text-gray-400 text-xs">
              {e.seed}
            </span>
            <span
              className={`font-medium ${e.eliminated ? "line-through opacity-50" : ""}`}
            >
              {e.team_abbrev}
            </span>
            <span className="text-xs text-gray-400">
              ({e.losses}L){" "}
              {e.qualification === "conf_champ" ? "Conf Champ" : "At-Large"}
            </span>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-xs text-gray-400 italic">None</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex gap-4 md:gap-8 flex-wrap">
      {renderGroup(
        "Winners Bracket",
        winners,
        "text-green-600 dark:text-green-400",
      )}
      {renderGroup(
        "Losers Bracket",
        losers,
        "text-yellow-600 dark:text-yellow-400",
      )}
      {renderGroup("Eliminated", eliminated, "text-red-600 dark:text-red-400")}
    </div>
  );
};

// ═══════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════

interface PlayoffBracketPageProps {
  league: string;
}

export const PlayoffBracketPage = ({ league }: PlayoffBracketPageProps) => {
  const { currentUser } = useAuthStore();
  const {
    seasonContext,
    mlbOrganization,
    collegeOrganization,
    bootstrappedOrgId,
    loadBootstrapForOrg,
    specialEvents,
  } = useSimBaseballStore();

  const isCollege = league === SimCollegeBaseball;
  const organization = isCollege ? collegeOrganization : mlbOrganization;
  const primaryTeam = organization
    ? getPrimaryBaseballTeam(organization)
    : undefined;

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

  // Level state (MLB only: MLB/AAA/AA/High-A/A)
  const [selectedLevel, setSelectedLevel] = useState<number>(isCollege ? 3 : 9);
  const [bracket, setBracket] = useState<PlayoffBracketResponse | null>(null);
  const [pendingGames, setPendingGames] = useState<PendingGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeConference, setActiveConference] = useState<string | null>(null);

  const levelOptions: SelectOption[] = useMemo(() => {
    if (isCollege) return [];
    return [
      { value: "9", label: "MLB" },
      { value: "8", label: "AAA" },
      { value: "7", label: "AA" },
      { value: "6", label: "High-A" },
      { value: "5", label: "A" },
    ];
  }, [isCollege]);

  // Check bootstrap for matching playoff data
  const bootstrapBracket = useMemo(() => {
    const playoffEvents = specialEvents.filter(
      (e): e is BootstrapPlayoffEvent => e.event_type === "playoff",
    );
    const match = playoffEvents.find((e) => e.league_level === selectedLevel);
    return match ? bootstrapPlayoffToBracket(match) : null;
  }, [specialEvents, selectedLevel]);

  // Fetch from API only if bootstrap doesn't have data for this level
  const fetchBracket = useCallback(async () => {
    if (!seasonContext) return;
    if (bootstrapBracket) {
      setBracket(bootstrapBracket);
    } else {
      setIsLoading(true);
      try {
        const data = await BaseballService.GetPlayoffBracket(seasonContext.current_league_year_id, selectedLevel);
        setBracket(data);
      } catch (e) {
        console.error("Failed to load playoff bracket", e);
        setBracket(null);
      }
      setIsLoading(false);
    }
    // Fetch pending games in parallel (no bootstrap source for these)
    try {
      const pg = await BaseballService.GetPendingPlayoffGames(seasonContext.current_league_year_id, selectedLevel);
      setPendingGames(pg.games ?? []);
    } catch {
      setPendingGames([]);
    }
  }, [seasonContext, selectedLevel, bootstrapBracket]);

  useEffect(() => {
    fetchBracket();
  }, [fetchBracket]);

  const roundOrder = useMemo(() => {
    if (isCollege) return [...CWS_ROUND_ORDER];
    if (selectedLevel === 9) return [...MLB_ROUND_ORDER];
    return [...MILB_ROUND_ORDER];
  }, [isCollege, selectedLevel]);

  const hasData = bracket && Object.keys(bracket.rounds).length > 0;
  const isMLB = selectedLevel === 9 && !isCollege;

  // For MLB, check if we have conferences to enable AL/NL tabs
  const hasConferences = useMemo(() => {
    if (!isMLB || !bracket) return false;
    return Object.values(bracket.rounds).some((seriesList) =>
      seriesList.some((s) => s.conference === "AL" || s.conference === "NL"),
    );
  }, [isMLB, bracket]);

  // Derive bye teams (MLB seeds 1 & 2 per conference — appear in DS but not WC)
  const byeTeams = useMemo(() => {
    if (!isMLB || !bracket?.rounds?.DS) return [];
    const dsSeries = bracket.rounds.DS;
    const wcTeamIds = new Set(
      (bracket.rounds.WC ?? []).flatMap((s) => [s.team_a.id, s.team_b.id]),
    );
    const byes: { id: number; abbrev: string; seed: number }[] = [];
    for (const ds of dsSeries) {
      // The bye team is the one that didn't appear in WC
      if (!wcTeamIds.has(ds.team_a.id)) {
        byes.push({ id: ds.team_a.id, abbrev: ds.team_a.abbrev, seed: ds.team_a.seed });
      }
      if (!wcTeamIds.has(ds.team_b.id)) {
        byes.push({ id: ds.team_b.id, abbrev: ds.team_b.abbrev, seed: ds.team_b.seed });
      }
    }
    return byes;
  }, [isMLB, bracket]);

  // Filter pending games by active conference
  const filteredPendingGames = useMemo(() => {
    if (!activeConference) return pendingGames;
    // Match pending games to series conference via series_id lookup
    if (!bracket) return pendingGames;
    const conferenceSeriesIds = new Set<number>();
    for (const seriesList of Object.values(bracket.rounds)) {
      for (const s of seriesList) {
        if (s.conference === activeConference || s.conference === null) {
          conferenceSeriesIds.add(s.series_id);
        }
      }
    }
    return pendingGames.filter((g) => conferenceSeriesIds.has(g.series_id));
  }, [pendingGames, activeConference, bracket]);

  const pageTitle = isCollege ? "College World Series" : "Playoffs";

  if (!seasonContext) {
    return (
      <PageContainer>
        <Text variant="h4">Loading...</Text>
      </PageContainer>
    );
  }

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
              {pageTitle}
            </Text>
            <Text variant="small" classes={`${headerTextClass} opacity-75`}>
              Season {seasonContext.league_year}
            </Text>
          </div>
        </div>

        {/* Filters */}
        {!isCollege && levelOptions.length > 0 && (
          <Border
            classes="p-4 mb-2"
            styles={{ borderTop: `3px solid ${headerColor}` }}
          >
            <div className="flex items-end gap-4">
              <div className="min-w-[8rem]">
                <Text variant="small" classes="font-semibold mb-1">
                  Level
                </Text>
                <SelectDropdown
                  options={levelOptions}
                  value={
                    levelOptions.find(
                      (o) => o.value === String(selectedLevel),
                    ) ?? null
                  }
                  onChange={(opt) => {
                    if (!opt) return;
                    setSelectedLevel(Number((opt as SelectOption).value));
                  }}
                />
              </div>
            </div>
          </Border>
        )}

        {/* MLB Conference Tabs */}
        {isMLB && hasConferences && (
          <TabGroup>
            <Tab
              label="Full Bracket"
              selected={activeConference === null}
              setSelected={() => setActiveConference(null)}
            />
            <Tab
              label="American League"
              selected={activeConference === "AL"}
              setSelected={() => setActiveConference("AL")}
            />
            <Tab
              label="National League"
              selected={activeConference === "NL"}
              setSelected={() => setActiveConference("NL")}
            />
          </TabGroup>
        )}

        {/* Up Next — Pending Games */}
        {hasData && filteredPendingGames.length > 0 && (
          <UpNextSection games={filteredPendingGames} headerColor={headerColor} />
        )}

        {/* Content */}
        <Border
          classes="p-4"
          styles={{ borderTop: `3px solid ${headerColor}` }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Text variant="body" classes="text-gray-500 dark:text-gray-400">
                Loading bracket...
              </Text>
            </div>
          ) : !hasData ? (
            <div className="flex items-center justify-center py-12">
              <Text variant="body" classes="text-gray-400">
                {isCollege ? "College World Series" : "Playoffs"} have not
                started yet.
              </Text>
            </div>
          ) : (
            <>
              {/* Bracket rounds — horizontal scroll */}
              <div className="baseball-table-wrapper overflow-x-auto">
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start min-w-max py-2">
                  {roundOrder.map((roundKey) => {
                    const seriesList = bracket.rounds[roundKey] ?? [];
                    return (
                      <RoundColumn
                        key={roundKey}
                        roundKey={roundKey}
                        seriesList={seriesList}
                        league={league}
                        IsRetro={currentUser?.IsRetro}
                        conference={activeConference}
                        byeTeams={isMLB ? byeTeams : undefined}
                      />
                    );
                  })}
                </div>
              </div>

              {/* CWS double-elimination bracket table */}
              {isCollege &&
                bracket.cws_bracket &&
                bracket.cws_bracket.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Text variant="h5" classes="mb-3">
                      CWS Bracket Standings
                    </Text>
                    <CWSBracketTable entries={bracket.cws_bracket} />
                  </div>
                )}
            </>
          )}
        </Border>
      </div>
    </PageContainer>
  );
};
