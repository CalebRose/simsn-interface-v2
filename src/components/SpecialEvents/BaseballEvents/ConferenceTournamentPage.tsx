import { useCallback, useEffect, useMemo, useState } from "react";
import { Text } from "../../../_design/Typography";
import { Border } from "../../../_design/Borders";
import { PageContainer } from "../../../_design/Container";
import { TabGroup, Tab } from "../../../_design/Tabs";
import { SimCollegeBaseball } from "../../../_constants/constants";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useAuthStore } from "../../../context/AuthContext";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { isBrightColor } from "../../../_utility/isBrightColor";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { getLogo } from "../../../_utility/getLogo";
import { getPrimaryBaseballTeam } from "../../../_utility/baseballHelpers";
import { BaseballService } from "../../../_services/baseballService";
import {
  PlayoffBracketResponse,
  PlayoffSeries,
  ConferenceTournamentData,
  CLINCH_WINS,
} from "../../../models/baseball/baseballEventModels";
import "../../Team/baseball/baseballMobile.css";

// ═══════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════

/** Derive a human-readable label for a CT round based on its position from the end. */
function ctRoundLabel(roundKey: string, totalRounds: number, roundKeys: string[]): string {
  const idx = roundKeys.indexOf(roundKey);
  const fromEnd = totalRounds - 1 - idx;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semifinal";
  if (fromEnd === 2) return "Quarterfinal";
  return `Round ${idx + 1}`;
}

/** Sort CT round keys numerically (CT_R1, CT_R2, ...). */
function sortCTRounds(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const numA = parseInt(a.replace("CT_R", ""), 10);
    const numB = parseInt(b.replace("CT_R", ""), 10);
    return numA - numB;
  });
}

type ConferenceStatus = "not_started" | "in_progress" | "complete";

interface ConferenceSummary {
  name: string;
  status: ConferenceStatus;
  currentRound: number;
  totalRounds: number;
  champion: string | null;
}

function getConferenceSummary(name: string, data: ConferenceTournamentData): ConferenceSummary {
  const roundKeys = sortCTRounds(Object.keys(data.rounds));
  const totalRounds = roundKeys.length;

  if (totalRounds === 0) {
    return { name, status: "not_started", currentRound: 0, totalRounds: 0, champion: null };
  }

  // Check if the final round is complete
  const finalRound = data.rounds[roundKeys[roundKeys.length - 1]] ?? [];
  const finalSeries = finalRound[0];
  if (finalSeries && finalSeries.status === "complete" && finalSeries.winner) {
    return { name, status: "complete", currentRound: totalRounds, totalRounds, champion: finalSeries.winner.abbrev };
  }

  // Find the latest round that has activity
  let currentRound = 1;
  for (let i = roundKeys.length - 1; i >= 0; i--) {
    const series = data.rounds[roundKeys[i]] ?? [];
    if (series.length > 0) {
      currentRound = i + 1;
      break;
    }
  }

  return { name, status: "in_progress", currentRound, totalRounds, champion: null };
}

// ═══════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════

const CTSeriesCard = ({
  series,
  isRetro,
}: {
  series: PlayoffSeries;
  isRetro?: boolean;
}) => {
  const logoA = getLogo(SimCollegeBaseball, series.team_a.id, isRetro);
  const logoB = getLogo(SimCollegeBaseball, series.team_b.id, isRetro);

  const statusColor =
    series.status === "complete"
      ? "border-green-400 dark:border-green-600"
      : "border-gray-300 dark:border-gray-600";

  const isWinnerA = series.winner?.id === series.team_a.id;
  const isWinnerB = series.winner?.id === series.team_b.id;

  return (
    <div className={`border-2 rounded-lg p-3 ${statusColor} bg-white dark:bg-gray-800 min-w-full sm:min-w-[14rem]`}>
      {/* Format header */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-semibold">
          Single Game
        </span>
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
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <span className="text-sm">{series.team_a.abbrev}</span>
          {series.team_a.seed > 0 && (
            <span className="text-[11px] sm:text-[10px] text-gray-400">
              ({series.team_a.seed})
            </span>
          )}
        </div>
        <span className="text-sm font-semibold tabular-nums">{series.wins_a}</span>
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
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <span className="text-sm">{series.team_b.abbrev}</span>
          {series.team_b.seed > 0 && (
            <span className="text-[11px] sm:text-[10px] text-gray-400">
              ({series.team_b.seed})
            </span>
          )}
        </div>
        <span className="text-sm font-semibold tabular-nums">{series.wins_b}</span>
      </div>
      {/* Status badge */}
      <div className="mt-1.5 text-center">
        <span
          className={`text-[11px] sm:text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${
            series.status === "complete"
              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
              : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          }`}
        >
          {series.status === "complete"
            ? `${series.winner?.abbrev} wins`
            : "Pending"}
        </span>
      </div>
    </div>
  );
};

/** Placeholder card for teams with first-round byes. */
const CTByeCard = ({
  team, isRetro,
}: {
  team: { id: number; abbrev: string; seed: number };
  isRetro?: boolean;
}) => {
  const logo = getLogo(SimCollegeBaseball, team.id, isRetro);
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

const CTRoundColumn = ({
  roundKey, seriesList, roundKeys, isRetro, byeTeams,
}: {
  roundKey: string;
  seriesList: PlayoffSeries[];
  roundKeys: string[];
  isRetro?: boolean;
  byeTeams?: { id: number; abbrev: string; seed: number }[];
}) => {
  const label = ctRoundLabel(roundKey, roundKeys.length, roundKeys);
  const isFirstRound = roundKeys.indexOf(roundKey) === 0;
  const showByes = isFirstRound && byeTeams && byeTeams.length > 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <Text
        variant="small"
        classes="font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400"
      >
        {label}
      </Text>
      {showByes && byeTeams!.map((bt) => (
        <CTByeCard key={bt.id} team={bt} isRetro={isRetro} />
      ))}
      {seriesList.length === 0 && !showByes ? (
        <div className="text-xs text-gray-400 italic">TBD</div>
      ) : (
        seriesList.map((s) => (
          <CTSeriesCard key={s.series_id} series={s} isRetro={isRetro} />
        ))
      )}
    </div>
  );
};

/** Overview card showing a conference's tournament status at a glance. */
const ConferenceOverviewCard = ({
  summary, isSelected, onClick,
}: {
  summary: ConferenceSummary;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const statusBadge = (() => {
    switch (summary.status) {
      case "complete":
        return (
          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
            Champion: {summary.champion}
          </span>
        );
      case "in_progress":
        return (
          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            Round {summary.currentRound} of {summary.totalRounds}
          </span>
        );
      default:
        return (
          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
            Not Started
          </span>
        );
    }
  })();

  return (
    <button
      onClick={onClick}
      className={`text-left border-2 rounded-lg px-3 py-2 transition-colors ${
        isSelected
          ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      <div className="text-sm font-medium mb-1 truncate">{summary.name}</div>
      {statusBadge}
    </button>
  );
};

// ═══════════════════════════════════════════════
// CWS Readiness Indicator
// ═══════════════════════════════════════════════

const CWSReadiness = ({
  summaries, headerColor,
}: {
  summaries: ConferenceSummary[];
  headerColor: string;
}) => {
  const completed = summaries.filter((s) => s.status === "complete");
  const remaining = summaries.filter((s) => s.status !== "complete");
  const allDone = remaining.length === 0 && summaries.length > 0;

  return (
    <Border classes="p-4 mb-2" styles={{ borderTop: `3px solid ${headerColor}` }}>
      <div className="flex items-center gap-2 mb-3">
        <Text variant="h5">CWS Readiness</Text>
        {allDone ? (
          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
            All Conferences Complete
          </span>
        ) : (
          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
            {completed.length} / {summaries.length} Complete
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {summaries.map((s) => (
          <div
            key={s.name}
            className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded text-sm ${
              s.status === "complete"
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                : "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400"
            }`}
          >
            <span className="truncate">{s.name}</span>
            {s.status === "complete" ? (
              <span className="font-semibold whitespace-nowrap">{s.champion}</span>
            ) : s.status === "in_progress" ? (
              <span className="text-xs whitespace-nowrap">R{s.currentRound}/{s.totalRounds}</span>
            ) : (
              <span className="text-xs">—</span>
            )}
          </div>
        ))}
      </div>
    </Border>
  );
};

// ═══════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════

export const ConferenceTournamentPage = () => {
  const { currentUser } = useAuthStore();
  const {
    seasonContext,
    collegeOrganization,
    bootstrappedOrgId,
    loadBootstrapForOrg,
  } = useSimBaseballStore();

  const organization = collegeOrganization;
  const primaryTeam = organization ? getPrimaryBaseballTeam(organization) : undefined;

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
    return getLogo(SimCollegeBaseball, primaryTeam.team_id, currentUser?.IsRetro);
  }, [primaryTeam, currentUser?.IsRetro]);

  // Data state
  const [bracket, setBracket] = useState<PlayoffBracketResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConference, setSelectedConference] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!seasonContext) return;
    setIsLoading(true);
    try {
      const data = await BaseballService.GetPlayoffBracket(seasonContext.current_league_year_id, 3);
      setBracket(data);
    } catch (e) {
      console.error("Failed to load bracket data", e);
      setBracket(null);
    }
    setIsLoading(false);
  }, [seasonContext]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Extract conference tournament data
  const confTournaments: Record<string, ConferenceTournamentData> = useMemo(() => {
    return bracket?.conf_tournaments ?? {};
  }, [bracket]);

  const conferenceNames = useMemo(() => {
    return Object.keys(confTournaments).sort();
  }, [confTournaments]);

  const hasData = conferenceNames.length > 0;

  // Conference summaries for overview
  const conferenceSummaries = useMemo(() => {
    return conferenceNames.map((name) => getConferenceSummary(name, confTournaments[name]));
  }, [conferenceNames, confTournaments]);

  // Selected conference bracket data
  const selectedConfData = selectedConference ? confTournaments[selectedConference] : null;
  const selectedRoundKeys = useMemo(() => {
    if (!selectedConfData) return [];
    return sortCTRounds(Object.keys(selectedConfData.rounds));
  }, [selectedConfData]);

  // Derive bye teams for selected conference
  // Bye teams appear in R2 but not R1 — they skipped the first round
  const byeTeams = useMemo(() => {
    if (!selectedConfData || selectedRoundKeys.length < 2) return [];
    const r1Series = selectedConfData.rounds[selectedRoundKeys[0]] ?? [];
    const r2Series = selectedConfData.rounds[selectedRoundKeys[1]] ?? [];
    if (r1Series.length === 0) return [];

    const r1TeamIds = new Set(
      r1Series.flatMap((s) => [s.team_a.id, s.team_b.id]),
    );
    const byes: { id: number; abbrev: string; seed: number }[] = [];
    for (const s of r2Series) {
      if (!r1TeamIds.has(s.team_a.id)) {
        byes.push({ id: s.team_a.id, abbrev: s.team_a.abbrev, seed: s.team_a.seed });
      }
      if (!r1TeamIds.has(s.team_b.id)) {
        byes.push({ id: s.team_b.id, abbrev: s.team_b.abbrev, seed: s.team_b.seed });
      }
    }
    return byes;
  }, [selectedConfData, selectedRoundKeys]);

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
              Conference Tournaments
            </Text>
            <Text variant="small" classes={`${headerTextClass} opacity-75`}>
              Season {seasonContext.league_year}
            </Text>
          </div>
        </div>

        {/* CWS Readiness */}
        {hasData && (
          <CWSReadiness summaries={conferenceSummaries} headerColor={headerColor} />
        )}

        {/* Overview Dashboard */}
        {hasData && (
          <Border classes="p-4 mb-2" styles={{ borderTop: `3px solid ${headerColor}` }}>
            <Text variant="h5" classes="mb-3">All Conferences</Text>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {conferenceSummaries.map((summary) => (
                <ConferenceOverviewCard
                  key={summary.name}
                  summary={summary}
                  isSelected={selectedConference === summary.name}
                  onClick={() =>
                    setSelectedConference(
                      selectedConference === summary.name ? null : summary.name,
                    )
                  }
                />
              ))}
            </div>
          </Border>
        )}

        {/* Conference Bracket View */}
        {selectedConference && selectedConfData ? (
          <Border classes="p-4" styles={{ borderTop: `3px solid ${headerColor}` }}>
            <div className="flex items-center justify-between mb-4">
              <Text variant="h5">{selectedConference}</Text>
              {(() => {
                const summary = conferenceSummaries.find((s) => s.name === selectedConference);
                if (!summary) return null;
                if (summary.status === "complete") {
                  return (
                    <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                      Champion: {summary.champion}
                    </span>
                  );
                }
                if (summary.status === "in_progress") {
                  return (
                    <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      Round {summary.currentRound} of {summary.totalRounds}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
            <div className="baseball-table-wrapper overflow-x-auto">
              <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start min-w-max py-2">
                {selectedRoundKeys.map((roundKey) => {
                  const seriesList = selectedConfData.rounds[roundKey] ?? [];
                  return (
                    <CTRoundColumn
                      key={roundKey}
                      roundKey={roundKey}
                      seriesList={seriesList}
                      roundKeys={selectedRoundKeys}
                      isRetro={currentUser?.IsRetro}
                      byeTeams={roundKey === selectedRoundKeys[0] ? byeTeams : undefined}
                    />
                  );
                })}
              </div>
            </div>
          </Border>
        ) : (
          <Border classes="p-4" styles={{ borderTop: `3px solid ${headerColor}` }}>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Text variant="body" classes="text-gray-500 dark:text-gray-400">
                  Loading tournament data...
                </Text>
              </div>
            ) : !hasData ? (
              <div className="flex items-center justify-center py-12">
                <Text variant="body" classes="text-gray-400">
                  Conference tournaments have not started yet.
                </Text>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <Text variant="body" classes="text-gray-400">
                  Select a conference above to view its bracket.
                </Text>
              </div>
            )}
          </Border>
        )}
      </div>
    </PageContainer>
  );
};
