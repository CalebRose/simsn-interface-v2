import { FC, useEffect, useState } from "react";
import { Border } from "../../../../_design/Borders";
import { Text } from "../../../../_design/Typography";
import { BaseballService } from "../../../../_services/baseballService";
import { MarketSummary } from "../../../../models/baseball/baseballFreeAgencyModels";

interface FAMarketDashboardProps {
  leagueYearId: number;
}

const fmt = (val: string | number) => {
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "—";
  return "$" + num.toLocaleString();
};

export const FAMarketDashboard: FC<FAMarketDashboardProps> = ({ leagueYearId }) => {
  const [data, setData] = useState<MarketSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!leagueYearId) return;
    setIsLoading(true);
    BaseballService.GetMarketSummary(leagueYearId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, [leagueYearId]);

  if (isLoading) {
    return (
      <Border classes="p-4">
        <Text variant="body" classes="text-gray-400">Loading market data...</Text>
      </Border>
    );
  }

  if (!data) {
    return (
      <Border classes="p-4">
        <Text variant="body-small" classes="text-gray-400">Market data unavailable.</Text>
      </Border>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Key Metrics */}
      <Border classes="p-4">
        <Text variant="h5" classes="mb-3">Market Overview</Text>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <div>
            <Text variant="xs" classes="text-gray-400">$/WAR</Text>
            <Text variant="body" classes="font-semibold">{fmt(data.dollar_per_war)}</Text>
          </div>
          <div>
            <Text variant="xs" classes="text-gray-400">Total Signings</Text>
            <Text variant="body" classes="font-semibold">{data.total_signings}</Text>
          </div>
          <div>
            <Text variant="xs" classes="text-gray-400">Avg Years</Text>
            <Text variant="body" classes="font-semibold">{data.avg_years.toFixed(1)}</Text>
          </div>
          <div>
            <Text variant="xs" classes="text-gray-400">Avg AAV</Text>
            <Text variant="body" classes="font-semibold">{fmt(data.avg_aav)}</Text>
          </div>
          <div>
            <Text variant="xs" classes="text-gray-400">Avg Total Value</Text>
            <Text variant="body" classes="font-semibold">{fmt(data.avg_total_value)}</Text>
          </div>
        </div>
      </Border>

      {/* WAR Tier Distribution */}
      <Border classes="p-4">
        <Text variant="h6" classes="mb-2">Signings by WAR Tier</Text>
        <div className="flex flex-wrap gap-3">
          {Object.entries(data.war_tiers).map(([tier, count]) => (
            <div key={tier} className="text-center">
              <Text variant="small" classes="text-gray-400">{tier} WAR</Text>
              <Text variant="body" classes="font-semibold">{count}</Text>
            </div>
          ))}
        </div>
      </Border>

      {/* Recent Signings */}
      {data.recent_signings.length > 0 && (
        <Border classes="p-4">
          <Text variant="h6" classes="mb-2">Recent Signings</Text>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-2 py-1 text-xs font-semibold text-left">Player</th>
                  <th className="px-2 py-1 text-xs font-semibold text-left">Age</th>
                  <th className="px-2 py-1 text-xs font-semibold text-left">WAR</th>
                  <th className="px-2 py-1 text-xs font-semibold text-left">Years</th>
                  <th className="px-2 py-1 text-xs font-semibold text-left">AAV</th>
                  <th className="px-2 py-1 text-xs font-semibold text-left">Total</th>
                  <th className="px-2 py-1 text-xs font-semibold text-left">Source</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_signings.map((s) => (
                  <tr key={s.player_id} className="border-b border-gray-800">
                    <td className="px-2 py-1 font-medium">{s.name}</td>
                    <td className="px-2 py-1">{s.age}</td>
                    <td className="px-2 py-1">{s.war}</td>
                    <td className="px-2 py-1">{s.years}</td>
                    <td className="px-2 py-1">{fmt(s.aav)}</td>
                    <td className="px-2 py-1">{fmt(s.total_value)}</td>
                    <td className="px-2 py-1 text-xs capitalize">{s.source.replace(/_/g, " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Border>
      )}
    </div>
  );
};
