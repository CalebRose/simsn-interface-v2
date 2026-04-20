import { FC, memo, useEffect, useState } from "react";
import { Text } from "../../../../../_design/Typography";
import { Border } from "../../../../../_design/Borders";
import { StatPair } from "../sections/StatPair";
import { BaseballService } from "../../../../../_services/baseballService";
import type { ScoutingPlayerResponse } from "../../../../../models/baseball/baseballScoutingModels";
import type { PlayerStatsResponse } from "../../../../../models/baseball/baseballStatsModels";

const ReportCard: FC<{ title: string; text: string }> = ({ title, text }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
    <Text variant="xs" classes="font-semibold mb-1">
      {title}
    </Text>
    <Text variant="xs" classes="text-gray-600 dark:text-gray-300">
      {text}
    </Text>
  </div>
);

const GeneratedBattingSection: FC<{ stats: any }> = ({ stats }) => (
  <div className="mb-2">
    <Text variant="xs" classes="font-semibold text-gray-400 mb-1">
      Batting
    </Text>
    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
      <StatPair label="G" value={stats.games} />
      <StatPair label="AB" value={stats.at_bats} />
      <StatPair label="H" value={stats.hits} />
      <StatPair label="HR" value={stats.home_runs} />
      <StatPair label="RBI" value={stats.rbi} />
      <StatPair label="AVG" value={stats.avg} />
      <StatPair label="OBP" value={stats.obp} />
      <StatPair label="SLG" value={stats.slg} />
    </div>
  </div>
);

const GeneratedFieldingSection: FC<{ stats: any }> = ({ stats }) => (
  <div className="mb-2">
    <Text variant="xs" classes="font-semibold text-gray-400 mb-1">
      Fielding
    </Text>
    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
      <StatPair label="G" value={stats.games} />
      <StatPair label="PO" value={stats.putouts} />
      <StatPair label="A" value={stats.assists} />
      <StatPair label="E" value={stats.errors} />
      <StatPair label="FLD%" value={stats.fielding_pct} />
    </div>
  </div>
);

const GeneratedPitchingSection: FC<{ stats: any }> = ({ stats }) => (
  <div className="mb-2">
    <Text variant="xs" classes="font-semibold text-gray-400 mb-1">
      Pitching
    </Text>
    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
      <StatPair label="W" value={stats.wins} />
      <StatPair label="L" value={stats.losses} />
      <StatPair label="ERA" value={stats.era?.toFixed(2)} />
      <StatPair label="K" value={stats.strikeouts} />
      <StatPair label="BB" value={stats.walks} />
      <StatPair label="IP" value={stats.innings_pitched?.toFixed(1) ?? "—"} />
      <StatPair label="WHIP" value={stats.whip?.toFixed(2)} />
      <StatPair label="SV" value={stats.saves} />
    </div>
  </div>
);

interface StatisticsTabProps {
  player: ScoutingPlayerResponse;
}

export const StatisticsTab: FC<StatisticsTabProps> = memo(({ player }) => {
  const hasGenerated = player.generated_stats;
  const hasCounting = player.counting_stats;
  const hasReport = player.text_report;

  const [fallbackStats, setFallbackStats] =
    useState<PlayerStatsResponse | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  useEffect(() => {
    if (hasGenerated || hasCounting) return;
    let cancelled = false;
    setFallbackLoading(true);
    BaseballService.GetPlayerStats(player.bio.id, {})
      .then((data) => {
        if (!cancelled) setFallbackStats(data);
      })
      .catch(() => {
        if (!cancelled) setFallbackStats(null);
      })
      .finally(() => {
        if (!cancelled) setFallbackLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [player.bio.id, hasGenerated, hasCounting]);

  const hasFallback =
    fallbackStats &&
    ((fallbackStats.batting?.length ?? 0) > 0 ||
      (fallbackStats.pitching?.length ?? 0) > 0 ||
      (fallbackStats.fielding?.length ?? 0) > 0);

  if (
    !hasGenerated &&
    !hasCounting &&
    !hasReport &&
    !hasFallback &&
    !fallbackLoading
  ) {
    return (
      <Border classes="p-3">
        <Text variant="xs" classes="text-gray-400">
          No statistics available.
        </Text>
      </Border>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Text Report */}
      {hasReport && (
        <Border classes="p-3">
          <Text variant="small" classes="font-semibold mb-2">
            Scout Report
          </Text>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {player.text_report!.batting && (
              <ReportCard title="Batting" text={player.text_report!.batting} />
            )}
            {player.text_report!.fielding && (
              <ReportCard
                title="Fielding"
                text={player.text_report!.fielding}
              />
            )}
            {player.text_report!.pitching && (
              <ReportCard
                title="Pitching"
                text={player.text_report!.pitching}
              />
            )}
            {player.text_report!.athletic && (
              <ReportCard
                title="Athletic"
                text={player.text_report!.athletic}
              />
            )}
          </div>
        </Border>
      )}

      {/* Generated Stats */}
      {hasGenerated && (
        <Border classes="p-3">
          <Text variant="small" classes="font-semibold mb-2">
            Season Stats
          </Text>
          {player.generated_stats!.batting && (
            <GeneratedBattingSection stats={player.generated_stats!.batting} />
          )}
          {player.generated_stats!.fielding && (
            <GeneratedFieldingSection
              stats={player.generated_stats!.fielding}
            />
          )}
          {player.generated_stats!.pitching && (
            <GeneratedPitchingSection
              stats={player.generated_stats!.pitching}
            />
          )}
        </Border>
      )}

      {/* Counting Stats (INTAM) */}
      {hasCounting && (
        <Border classes="p-3">
          <Text variant="small" classes="font-semibold mb-2">
            Stats
          </Text>
          {player.counting_stats!.batting && (
            <GeneratedBattingSection stats={player.counting_stats!.batting} />
          )}
          {player.counting_stats!.fielding && (
            <GeneratedFieldingSection
              stats={player.counting_stats!.fielding}
            />
          )}
          {player.counting_stats!.pitching && (
            <GeneratedPitchingSection
              stats={player.counting_stats!.pitching}
            />
          )}
        </Border>
      )}

      {/* Fallback: stats from GetPlayerStats endpoint */}
      {fallbackLoading && (
        <Border classes="p-3">
          <Text variant="xs" classes="text-gray-400">
            Loading statistics...
          </Text>
        </Border>
      )}
      {!hasGenerated && !hasCounting && hasFallback && fallbackStats && (
        <Border classes="p-3">
          <Text variant="small" classes="font-semibold mb-2">
            Season Stats
          </Text>
          {fallbackStats.batting.length > 0 && (
            <div className="mb-3">
              <Text variant="xs" classes="font-semibold text-gray-400 mb-1">
                Batting
              </Text>
              <div className="baseball-table-wrapper overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b dark:border-gray-600">
                      <th className="px-2 py-1 text-center">Year</th>
                      <th className="px-2 py-1 text-center">Team</th>
                      <th className="px-2 py-1 text-center">G</th>
                      <th className="px-2 py-1 text-center">AB</th>
                      <th className="px-2 py-1 text-center">H</th>
                      <th className="px-2 py-1 text-center">HR</th>
                      <th className="px-2 py-1 text-center">RBI</th>
                      <th className="px-2 py-1 text-center">BB</th>
                      <th className="px-2 py-1 text-center">SO</th>
                      <th className="px-2 py-1 text-center">SB</th>
                      <th className="px-2 py-1 text-center">AVG</th>
                      <th className="px-2 py-1 text-center">OBP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fallbackStats.batting.map((s, i) => (
                      <tr key={i} className="border-b dark:border-gray-700">
                        <td className="px-2 py-1 text-center">
                          {s.league_year_id}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {s.team_abbrev}
                        </td>
                        <td className="px-2 py-1 text-center">{s.g}</td>
                        <td className="px-2 py-1 text-center">{s.ab}</td>
                        <td className="px-2 py-1 text-center">{s.h}</td>
                        <td className="px-2 py-1 text-center">{s.hr}</td>
                        <td className="px-2 py-1 text-center">{s.rbi}</td>
                        <td className="px-2 py-1 text-center">{s.bb}</td>
                        <td className="px-2 py-1 text-center">{s.so}</td>
                        <td className="px-2 py-1 text-center">{s.sb}</td>
                        <td className="px-2 py-1 text-center font-semibold">
                          {s.avg}
                        </td>
                        <td className="px-2 py-1 text-center font-semibold">
                          {s.obp}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {fallbackStats.pitching.length > 0 && (
            <div className="mb-3">
              <Text variant="xs" classes="font-semibold text-gray-400 mb-1">
                Pitching
              </Text>
              <div className="baseball-table-wrapper overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b dark:border-gray-600">
                      <th className="px-2 py-1 text-center">Year</th>
                      <th className="px-2 py-1 text-center">Team</th>
                      <th className="px-2 py-1 text-center">G</th>
                      <th className="px-2 py-1 text-center">GS</th>
                      <th className="px-2 py-1 text-center">W</th>
                      <th className="px-2 py-1 text-center">L</th>
                      <th className="px-2 py-1 text-center">SV</th>
                      <th className="px-2 py-1 text-center">IP</th>
                      <th className="px-2 py-1 text-center">SO</th>
                      <th className="px-2 py-1 text-center">BB</th>
                      <th className="px-2 py-1 text-center">ERA</th>
                      <th className="px-2 py-1 text-center">WHIP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fallbackStats.pitching.map((s, i) => (
                      <tr key={i} className="border-b dark:border-gray-700">
                        <td className="px-2 py-1 text-center">
                          {s.league_year_id}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {s.team_abbrev}
                        </td>
                        <td className="px-2 py-1 text-center">{s.g}</td>
                        <td className="px-2 py-1 text-center">{s.gs}</td>
                        <td className="px-2 py-1 text-center">{s.w}</td>
                        <td className="px-2 py-1 text-center">{s.l}</td>
                        <td className="px-2 py-1 text-center">{s.sv}</td>
                        <td className="px-2 py-1 text-center">{s.ip}</td>
                        <td className="px-2 py-1 text-center">{s.so}</td>
                        <td className="px-2 py-1 text-center">{s.bb}</td>
                        <td className="px-2 py-1 text-center font-semibold">
                          {s.era}
                        </td>
                        <td className="px-2 py-1 text-center font-semibold">
                          {s.whip}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {fallbackStats.fielding.length > 0 && (
            <div className="mb-3">
              <Text variant="xs" classes="font-semibold text-gray-400 mb-1">
                Fielding
              </Text>
              <div className="baseball-table-wrapper overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b dark:border-gray-600">
                      <th className="px-2 py-1 text-center">Year</th>
                      <th className="px-2 py-1 text-center">Team</th>
                      <th className="px-2 py-1 text-center">Pos</th>
                      <th className="px-2 py-1 text-center">G</th>
                      <th className="px-2 py-1 text-center">INN</th>
                      <th className="px-2 py-1 text-center">PO</th>
                      <th className="px-2 py-1 text-center">A</th>
                      <th className="px-2 py-1 text-center">E</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fallbackStats.fielding.map((s, i) => (
                      <tr key={i} className="border-b dark:border-gray-700">
                        <td className="px-2 py-1 text-center">
                          {s.league_year_id}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {s.team_abbrev}
                        </td>
                        <td className="px-2 py-1 text-center">{s.pos}</td>
                        <td className="px-2 py-1 text-center">{s.g}</td>
                        <td className="px-2 py-1 text-center">{s.inn}</td>
                        <td className="px-2 py-1 text-center">{s.po}</td>
                        <td className="px-2 py-1 text-center">{s.a}</td>
                        <td className="px-2 py-1 text-center">{s.e}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Border>
      )}
    </div>
  );
});
