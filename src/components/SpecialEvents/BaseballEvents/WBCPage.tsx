import { useEffect, useMemo, useState } from "react";
import { Text } from "../../../_design/Typography";
import { Border } from "../../../_design/Borders";
import { PageContainer } from "../../../_design/Container";
import { TabGroup, Tab } from "../../../_design/Tabs";
import { SimMLB } from "../../../_constants/constants";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useAuthStore } from "../../../context/AuthContext";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { isBrightColor } from "../../../_utility/isBrightColor";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { getLogo } from "../../../_utility/getLogo";
import { getPrimaryBaseballTeam } from "../../../_utility/baseballHelpers";
import { BaseballService } from "../../../_services/baseballService";
import {
  WBCTeam,
  WBCRosterPlayer,
  WBCRostersResponse,
  PlayoffBracketResponse,
  PlayoffSeries,
  ROUND_LABELS,
  BootstrapWBCEvent,
} from "../../../models/baseball/baseballEventModels";
import "../../Team/baseball/baseballMobile.css";

// ═══════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════

const PoolStandingsTable = ({
  teams,
  poolGroup,
}: {
  teams: WBCTeam[];
  poolGroup: string;
}) => {
  const sorted = useMemo(
    () =>
      [...teams]
        .filter((t) => t.pool_group === poolGroup)
        .sort(
          (a, b) => b.pool_wins - a.pool_wins || a.pool_losses - b.pool_losses,
        ),
    [teams, poolGroup],
  );

  return (
    <div className="min-w-[12rem]">
      <Text variant="small" classes="font-bold mb-2 uppercase">
        Pool {poolGroup}
      </Text>
      <div className="baseball-table-wrapper overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold border-b border-gray-300 dark:border-gray-600">
              <th className="px-2 py-1 w-6">#</th>
              <th className="px-2 py-1">Country</th>
              <th className="px-2 py-1 text-center w-10">W</th>
              <th className="px-2 py-1 text-center w-10">L</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, idx) => (
              <tr
                key={t.country_code}
                className={`border-b border-gray-100 dark:border-gray-700 ${t.eliminated ? "opacity-40 line-through" : ""} ${idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}`}
              >
                <td className="px-2 py-1 text-center text-gray-400 text-xs">
                  {t.seed}
                </td>
                <td className="px-2 py-1 font-medium">
                  <span className="mr-1">{t.country_code}</span>
                  <span className="text-xs text-gray-400">
                    {t.country_name}
                  </span>
                </td>
                <td className="px-2 py-1 text-center font-semibold">
                  {t.pool_wins}
                </td>
                <td className="px-2 py-1 text-center">{t.pool_losses}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-2 py-4 text-center text-gray-400 text-xs"
                >
                  No teams in this pool.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CountryRosterTable = ({
  countryCode,
  players,
}: {
  countryCode: string;
  players: WBCRosterPlayer[];
}) => {
  return (
    <div>
      <Text variant="small" classes="font-bold mb-2">
        {countryCode} Roster
      </Text>
      <div className="baseball-table-wrapper overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold border-b border-gray-300 dark:border-gray-600">
              <th className="px-2 py-1 w-10">#</th>
              <th className="px-2 py-1 min-w-[10rem]">Player</th>
              <th className="px-2 py-1 text-center w-16">Pos</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, idx) => (
              <tr
                key={p.player_id}
                className={`border-b border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}`}
              >
                <td className="px-2 py-1 text-center text-gray-400">
                  {idx + 1}
                </td>
                <td className="px-2 py-1 font-medium">{p.name}</td>
                <td className="px-2 py-1 text-center uppercase text-xs">
                  {p.position}
                </td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-2 py-4 text-center text-gray-400 text-xs"
                >
                  No roster data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const KnockoutBracket = ({
  bracket,
}: {
  bracket: PlayoffBracketResponse | null;
}) => {
  if (!bracket || Object.keys(bracket.rounds).length === 0) {
    return (
      <div className="py-8 text-center">
        <Text variant="body" classes="text-gray-400">
          Knockout bracket not yet available.
        </Text>
      </div>
    );
  }

  const roundOrder = ["QF", "SF", "F"];

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-6 items-start min-w-max py-2">
        {roundOrder.map((roundKey) => {
          const seriesList = bracket.rounds[roundKey] ?? [];
          return (
            <div key={roundKey} className="flex flex-col items-center gap-4">
              <Text
                variant="small"
                classes="font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                {ROUND_LABELS[roundKey] ?? roundKey}
              </Text>
              {seriesList.length === 0 ? (
                <div className="text-xs text-gray-400 italic">TBD</div>
              ) : (
                seriesList.map((s) => (
                  <WBCSeriesCard key={s.series_id} series={s} />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WBCSeriesCard = ({ series }: { series: PlayoffSeries }) => {
  const isWinnerA = series.winner?.id === series.team_a.id;
  const isWinnerB = series.winner?.id === series.team_b.id;
  const statusColor =
    series.status === "complete"
      ? "border-green-400 dark:border-green-600"
      : series.status === "active"
        ? "border-blue-400 dark:border-blue-500"
        : "border-gray-300 dark:border-gray-600";

  return (
    <div
      className={`border-2 rounded-lg p-3 ${statusColor} bg-white dark:bg-gray-800 min-w-[14rem]`}
    >
      <div
        className={`flex items-center justify-between gap-2 py-1 ${isWinnerA ? "font-bold" : isWinnerB ? "opacity-50" : ""}`}
      >
        <span className="text-sm">{series.team_a.abbrev}</span>
        <span className="text-sm font-semibold tabular-nums">
          {series.wins_a}
        </span>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
      <div
        className={`flex items-center justify-between gap-2 py-1 ${isWinnerB ? "font-bold" : isWinnerA ? "opacity-50" : ""}`}
      >
        <span className="text-sm">{series.team_b.abbrev}</span>
        <span className="text-sm font-semibold tabular-nums">
          {series.wins_b}
        </span>
      </div>
      <div className="mt-1.5 text-center">
        <span
          className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${
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

// ═══════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════

type WBCTab = "Pools" | "Rosters" | "Knockout";

export const WBCPage = () => {
  const { currentUser } = useAuthStore();
  const {
    seasonContext,
    mlbOrganization,
    bootstrappedOrgId,
    loadBootstrapForOrg,
    specialEvents,
  } = useSimBaseballStore();
  const organization = mlbOrganization;
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
    return getLogo(SimMLB, primaryTeam.team_id, currentUser?.IsRetro);
  }, [primaryTeam, currentUser?.IsRetro]);

  // Extract WBC data from bootstrap
  const wbcEvent = useMemo(() => {
    return (
      specialEvents.find(
        (e): e is BootstrapWBCEvent => e.event_type === "wbc",
      ) ?? null
    );
  }, [specialEvents]);

  // State
  const [activeTab, setActiveTab] = useState<WBCTab>("Pools");
  const [rosters, setRosters] = useState<WBCRostersResponse | null>(null);
  const [rostersLoading, setRostersLoading] = useState(false);
  const [knockoutBracket, setKnockoutBracket] =
    useState<PlayoffBracketResponse | null>(null);
  const [knockoutLoading, setKnockoutLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Pool teams from bootstrap
  const teams = wbcEvent?.teams ?? [];

  // Fetch rosters on demand (not in bootstrap)
  useEffect(() => {
    if (activeTab !== "Rosters" || !wbcEvent) return;
    if (rosters) return; // already loaded
    // WBC rosters require event_id — discover from special-events endpoint
    let cancelled = false;
    const load = async () => {
      if (!seasonContext) return;
      setRostersLoading(true);
      try {
        const evts = await BaseballService.GetSpecialEvents(
          seasonContext.current_league_year_id,
        );
        const wbcEvt = evts.events.find(
          (e) => e.event_type === "wbc" && e.id != null,
        );
        if (wbcEvt?.id && !cancelled) {
          const data = await BaseballService.GetWBCRosters(wbcEvt.id);
          if (!cancelled) {
            setRosters(data);
            const countries = Object.keys(data.rosters);
            if (countries.length > 0 && !selectedCountry) {
              setSelectedCountry(countries[0]);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load WBC rosters", e);
      }
      if (!cancelled) setRostersLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [activeTab, wbcEvent, rosters, seasonContext, selectedCountry]);

  // Fetch knockout bracket on demand
  useEffect(() => {
    if (activeTab !== "Knockout" || !seasonContext) return;
    if (knockoutBracket) return; // already loaded
    let cancelled = false;
    const load = async () => {
      setKnockoutLoading(true);
      try {
        const data = await BaseballService.GetPlayoffBracket(
          seasonContext.current_league_year_id,
          99,
        );
        if (!cancelled) setKnockoutBracket(data);
      } catch (e) {
        console.error("Failed to load WBC knockout bracket", e);
      }
      if (!cancelled) setKnockoutLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [activeTab, seasonContext, knockoutBracket]);

  // Pool groups
  const poolGroups = useMemo(() => {
    const groups = new Set(teams.map((t) => t.pool_group));
    return [...groups].sort();
  }, [teams]);

  // Country list for roster tab
  const countryList = useMemo(() => {
    if (!rosters) return [];
    return Object.keys(rosters.rosters).sort();
  }, [rosters]);

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
              World Baseball Classic
            </Text>
            <Text variant="small" classes={`${headerTextClass} opacity-75`}>
              Season {seasonContext.league_year}
            </Text>
          </div>
        </div>

        {/* Tabs */}
        <TabGroup>
          {(["Pools", "Rosters", "Knockout"] as WBCTab[]).map((tab) => (
            <Tab
              key={tab}
              label={tab}
              selected={activeTab === tab}
              setSelected={(val) => setActiveTab(val as WBCTab)}
            />
          ))}
        </TabGroup>

        {/* Content */}
        <Border
          classes="p-4"
          styles={{ borderTop: `3px solid ${headerColor}` }}
        >
          {!wbcEvent ? (
            <div className="flex items-center justify-center py-12">
              <Text variant="body" classes="text-gray-400">
                No World Baseball Classic event found for this season.
              </Text>
            </div>
          ) : (
            <>
              {/* Pools Tab */}
              {activeTab === "Pools" && (
                <div className="flex gap-6 flex-wrap">
                  {poolGroups.map((group) => (
                    <PoolStandingsTable
                      key={group}
                      teams={teams}
                      poolGroup={group}
                    />
                  ))}
                  {poolGroups.length === 0 && (
                    <Text variant="body" classes="text-gray-400">
                      No pool data available.
                    </Text>
                  )}
                </div>
              )}

              {/* Rosters Tab */}
              {activeTab === "Rosters" && (
                <div>
                  {rostersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Text
                        variant="body"
                        classes="text-gray-500 dark:text-gray-400"
                      >
                        Loading rosters...
                      </Text>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {countryList.map((code) => (
                          <button
                            key={code}
                            onClick={() => setSelectedCountry(code)}
                            className={`px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer ${
                              selectedCountry === code
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            {code}
                          </button>
                        ))}
                      </div>
                      {selectedCountry && rosters?.rosters[selectedCountry] && (
                        <CountryRosterTable
                          countryCode={selectedCountry}
                          players={rosters.rosters[selectedCountry]}
                        />
                      )}
                      {countryList.length === 0 && (
                        <Text variant="body" classes="text-gray-400">
                          No roster data available.
                        </Text>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Knockout Tab */}
              {activeTab === "Knockout" &&
                (knockoutLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Text
                      variant="body"
                      classes="text-gray-500 dark:text-gray-400"
                    >
                      Loading bracket...
                    </Text>
                  </div>
                ) : (
                  <KnockoutBracket bracket={knockoutBracket} />
                ))}
            </>
          )}
        </Border>
      </div>
    </PageContainer>
  );
};
