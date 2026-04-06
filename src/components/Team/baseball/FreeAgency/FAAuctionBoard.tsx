import { FC, useCallback, useEffect, useState } from "react";
import { Border } from "../../../../_design/Borders";
import { Text } from "../../../../_design/Typography";
import { BaseballService } from "../../../../_services/baseballService";
import {
  AuctionBoardEntry,
  AuctionPhase,
  PHASE_COLORS,
} from "../../../../models/baseball/baseballFreeAgencyModels";

const phaseBadge = (phase: AuctionPhase) => {
  const colorMap: Record<string, string> = {
    green: "bg-green-600/20 text-green-400",
    yellow: "bg-yellow-600/20 text-yellow-400",
    red: "bg-red-600/20 text-red-400",
    gray: "bg-gray-600/20 text-gray-400",
  };
  const color = PHASE_COLORS[phase] ?? "gray";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${colorMap[color]}`}>
      {phase}
    </span>
  );
};

interface FAAuctionBoardProps {
  leagueYearId: number;
  orgId: number;
  onPlayerClick: (entry: AuctionBoardEntry) => void;
  refreshKey: number;
}

export const FAAuctionBoard: FC<FAAuctionBoardProps> = ({
  leagueYearId,
  orgId,
  onPlayerClick,
  refreshKey,
}) => {
  const [entries, setEntries] = useState<AuctionBoardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!leagueYearId || !orgId) return;
    setIsLoading(true);
    try {
      const data = await BaseballService.GetAuctionBoard(leagueYearId, orgId);
      setEntries(data ?? []);
    } catch {
      setEntries([]);
    }
    setIsLoading(false);
  }, [leagueYearId, orgId]);

  useEffect(() => { load(); }, [load, refreshKey]);

  const th = "px-2 py-1 text-xs font-semibold text-left whitespace-nowrap select-none";

  if (isLoading) {
    return (
      <Border classes="p-4">
        <Text variant="body" classes="text-gray-400">Loading auction board...</Text>
      </Border>
    );
  }

  if (entries.length === 0) {
    return (
      <Border classes="p-4">
        <Text variant="body-small" classes="text-gray-400">No active auctions.</Text>
      </Border>
    );
  }

  return (
    <Border classes="p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className={th}>Player</th>
              <th className={th}>Pos</th>
              <th className={th}>Age</th>
              <th className={th}>Type</th>
              <th className={th}>WAR</th>
              <th className={th}>Phase</th>
              <th className={th}>Min AAV</th>
              <th className={th}>Offers</th>
              <th className={th}>Competing</th>
              <th className={th}>My Offer</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr
                key={e.auction_id}
                className="border-b border-gray-800 hover:bg-gray-700/30 cursor-pointer"
                onClick={() => onPlayerClick(e)}
              >
                <td className="px-2 py-1 font-medium">{e.player_name}</td>
                <td className="px-2 py-1 text-xs font-semibold">{e.listed_position ?? "—"}</td>
                <td className="px-2 py-1">{e.age}</td>
                <td className="px-2 py-1">{e.player_type === "Pitcher" ? "P" : "Pos"}</td>
                <td className="px-2 py-1">{e.war}</td>
                <td className="px-2 py-1">{phaseBadge(e.phase)}</td>
                <td className="px-2 py-1">${(e.min_aav / 1_000_000).toFixed(1)}M</td>
                <td className="px-2 py-1">{e.offer_count}</td>
                <td className="px-2 py-1 text-xs">{e.competing_teams.join(", ") || "—"}</td>
                <td className="px-2 py-1">
                  {e.my_offer
                    ? <span className="text-green-400">${(e.my_offer.aav / 1_000_000).toFixed(1)}M</span>
                    : <span className="text-gray-500">—</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Border>
  );
};
