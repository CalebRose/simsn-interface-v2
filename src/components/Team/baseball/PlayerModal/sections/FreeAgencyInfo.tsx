import { FC, memo } from "react";
import { Text } from "../../../../../_design/Typography";
import { Border } from "../../../../../_design/Borders";
import { formatMoney, faPhaseBadge } from "../utils/playerModalUtils";
import type { FAPlayerDetailResponse } from "../../../../../models/baseball/baseballFreeAgencyModels";

interface FreeAgencyInfoProps {
  faDetail: FAPlayerDetailResponse;
  scoutingAction: string | null;
  onScoutFA: (
    actionType: "pro_attrs_precise" | "pro_potential_precise",
  ) => void;
}

export const FreeAgencyInfo: FC<FreeAgencyInfoProps> = memo(
  ({ faDetail, scoutingAction, onScoutFA }) => {
    const { ratings, potentials, scouting, stats_summary, demand, contract_history, auction } =
      faDetail;
    const canScoutAttrs = scouting.available_actions.includes(
      "pro_attrs_precise",
    );
    const canScoutPots = scouting.available_actions.includes(
      "pro_potential_precise",
    );
    const attrLabel = scouting.attrs_precise ? "Precise" : "Fuzzed";
    const potsLabel = scouting.pots_precise ? "Precise" : "Fuzzed";

    return (
      <div className="space-y-4">
        {/* Attributes + Potentials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Border direction="col" classes="p-3 text-start">
            <div className="flex items-center justify-between mb-2">
              <Text variant="h6">Attributes ({attrLabel})</Text>
              {canScoutAttrs && (
                <button
                  className="text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 px-2 py-0.5 rounded disabled:opacity-40"
                  onClick={() => onScoutFA("pro_attrs_precise")}
                  disabled={scoutingAction != null}
                >
                  {scoutingAction === "pro_attrs_precise"
                    ? "..."
                    : "Scout (15 pts)"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm">
              {Object.entries(ratings).map(([key, val]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-400 capitalize">
                    {key.replace(/_display$/, "").replace(/_/g, " ")}
                  </span>
                  <span className="font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </Border>
          <Border direction="col" classes="p-3 text-start">
            <div className="flex items-center justify-between mb-2">
              <Text variant="h6">Potentials ({potsLabel})</Text>
              {canScoutPots && (
                <button
                  className="text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 px-2 py-0.5 rounded disabled:opacity-40"
                  onClick={() => onScoutFA("pro_potential_precise")}
                  disabled={scoutingAction != null}
                >
                  {scoutingAction === "pro_potential_precise"
                    ? "..."
                    : "Scout (15 pts)"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm">
              {Object.entries(potentials).map(([key, val]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-400 capitalize">
                    {key.replace(/_pot$/, "").replace(/_/g, " ")}
                  </span>
                  <span className="font-semibold">{val ?? "?"}</span>
                </div>
              ))}
            </div>
          </Border>
        </div>

        {/* Stats Summary */}
        {(stats_summary.batting || stats_summary.pitching) && (
          <Border direction="col" classes="p-3 text-start">
            <Text variant="h6" classes="mb-2">
              Last Season
            </Text>
            {stats_summary.batting && (
              <div className="flex flex-wrap gap-x-4 text-sm">
                <span>{stats_summary.batting.avg} AVG</span>
                <span>{stats_summary.batting.hr} HR</span>
                <span>{stats_summary.batting.hits} H</span>
                <span>{stats_summary.batting.walks} BB</span>
                <span>{stats_summary.batting.ab} AB</span>
                <span>{stats_summary.batting.sb} SB</span>
              </div>
            )}
            {stats_summary.pitching && (
              <div className="flex flex-wrap gap-x-4 text-sm">
                <span>{stats_summary.pitching.era} ERA</span>
                <span>
                  {stats_summary.pitching.wins}W-
                  {stats_summary.pitching.losses}L
                </span>
                <span>{stats_summary.pitching.ip} IP</span>
                <span>{stats_summary.pitching.so} SO</span>
                <span>{stats_summary.pitching.bb} BB</span>
                <span>{stats_summary.pitching.whip} WHIP</span>
              </div>
            )}
          </Border>
        )}

        {/* Demands + Contract History */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {demand && (
            <Border direction="col" classes="p-3 text-start">
              <Text variant="h6" classes="mb-2">
                Demands
              </Text>
              <Text variant="small">
                Min AAV: <strong>{formatMoney(demand.min_aav)}</strong>
              </Text>
              <Text variant="small">
                Years:{" "}
                <strong>
                  {demand.min_years}-{demand.max_years ?? 5}
                </strong>
              </Text>
              <Text variant="small">
                WAR: <strong>{demand.war}</strong>
              </Text>
            </Border>
          )}
          {contract_history.length > 0 && (
            <Border direction="col" classes="p-3 text-start">
              <Text variant="h6" classes="mb-2">
                Contract History
              </Text>
              {contract_history.map((ch, i) => (
                <Text key={i} variant="small">
                  {ch.org} - {ch.years}yr, $
                  {(ch.salary / 1_000_000).toFixed(1)}M/yr
                  {ch.is_extension ? " (ext)" : ""} — signed {ch.signed_year}
                </Text>
              ))}
            </Border>
          )}
        </div>

        {/* Auction Status */}
        {auction && (
          <Border direction="col" classes="p-3 text-start">
            <div className="flex items-center gap-2 mb-2">
              <Text variant="h6">Auction Status</Text>
              {faPhaseBadge(auction.phase)}
            </div>
            <Text variant="small">{auction.offer_count} offer(s)</Text>
            {auction.competing_teams.length > 0 && (
              <Text variant="small">
                Competing: {auction.competing_teams.join(", ")}
              </Text>
            )}
            {auction.my_offer ? (
              <Text variant="small" classes="text-green-400">
                Your offer: {auction.my_offer.years}yr, $
                {auction.my_offer.aav.toLocaleString()} AAV
              </Text>
            ) : (
              <Text variant="small" classes="text-gray-400">
                No offer submitted
              </Text>
            )}
          </Border>
        )}
      </div>
    );
  },
);
