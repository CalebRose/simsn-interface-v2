import { FC, useCallback, useEffect, useState } from "react";
import { Border } from "../../../../_design/Borders";
import { Text } from "../../../../_design/Typography";
import { BaseballService } from "../../../../_services/baseballService";
import {
  AuctionBoardEntry,
  AuctionPhase,
  AUCTION_PHASE_LABELS,
  AUCTION_STAGES,
  FA_ASK_FLOOR,
  OFFER_STATUS_INFO,
} from "../../../../models/baseball/baseballFreeAgencyModels";

const millions = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`;

/** Open › Listening › Final three › Signed, with the current stage marked. */
const StageStepper: FC<{ phase: AuctionPhase }> = ({ phase }) => {
  const idx = AUCTION_STAGES.indexOf(phase);
  if (idx < 0) {
    // expired / withdrawn sit outside the normal path
    return (
      <span className="px-2 py-0.5 rounded-sm text-xs font-semibold bg-gray-600/20 text-gray-400">
        {AUCTION_PHASE_LABELS[phase] ?? phase}
      </span>
    );
  }
  return (
    <ol
      className="flex items-center gap-1 text-[11px] whitespace-nowrap"
      aria-label={`Stage: ${AUCTION_PHASE_LABELS[phase]}`}
    >
      {AUCTION_STAGES.map((stage, i) => (
        <li key={stage} className="flex items-center gap-1">
          {i > 0 && <span className="text-gray-500" aria-hidden>›</span>}
          <span
            className={
              i === idx
                ? "px-1.5 py-0.5 rounded-sm font-semibold bg-blue-600/25 text-blue-300 underline underline-offset-2"
                : i < idx
                  ? "text-gray-500"
                  : "text-gray-400"
            }
            aria-current={i === idx ? "step" : undefined}
          >
            {AUCTION_PHASE_LABELS[stage]}
          </span>
        </li>
      ))}
    </ol>
  );
};

/** Live ask, with the starting ask struck through once it has fallen. */
const AskCell: FC<{ entry: AuctionBoardEntry }> = ({ entry }) => {
  const fell =
    (entry.ask_decay_steps ?? 0) > 0 &&
    entry.initial_min_aav != null &&
    entry.initial_min_aav > entry.min_aav;
  const quietRounds = entry.offer_count === 0 ? entry.rounds_without_offer ?? 0 : 0;
  const title =
    quietRounds > 0
      ? `${quietRounds} round${quietRounds === 1 ? "" : "s"} without an offer. After two, his ask falls 10% a round (never below ${millions(FA_ASK_FLOOR)}).`
      : undefined;
  return (
    <span className="tabular-nums" title={title}>
      {fell && (
        <s className="text-gray-500 mr-1" aria-label={`started at ${millions(entry.initial_min_aav!)}`}>
          {millions(entry.initial_min_aav!)}
        </s>
      )}
      {millions(entry.min_aav)}
      {quietRounds > 0 && (
        <span className="ml-1 text-[11px] text-gray-400">({quietRounds} quiet)</span>
      )}
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

  // league_year_id is sent as the API asks, but the board covers every
  // season's auctions, so nothing is filtered by year here.
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
            <tr className="border-b dark:border-gray-600">
              <th className={th}>Player</th>
              <th className={th}>Pos</th>
              <th className={th}>Age</th>
              <th className={th}>Type</th>
              <th className={th}>WAR</th>
              <th className={th}>Stage</th>
              <th className={th} title="His current asking yearly average">Ask</th>
              <th className={th}>Offers</th>
              <th className={th} title="Clubs bidding, alphabetical. Amounts are hidden.">Bidding</th>
              <th className={th}>My Offer</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const myStatus = e.my_offer ? e.my_offer.status ?? "active" : null;
              const statusInfo = myStatus ? OFFER_STATUS_INFO[myStatus] : null;
              const lastChance =
                e.phase === "open" && e.offer_count > 0 && myStatus !== "active";
              return (
                <tr
                  key={e.auction_id}
                  className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => onPlayerClick(e)}
                >
                  <td className="px-2 py-1 font-medium">{e.player_name}</td>
                  <td className="px-2 py-1 text-xs font-semibold">{e.listed_position ?? "—"}</td>
                  <td className="px-2 py-1 tabular-nums">{e.age}</td>
                  <td className="px-2 py-1">{e.player_type === "Pitcher" ? "P" : "Pos"}</td>
                  <td className="px-2 py-1 tabular-nums">{e.war}</td>
                  <td className="px-2 py-1"><StageStepper phase={e.phase} /></td>
                  <td className="px-2 py-1"><AskCell entry={e} /></td>
                  <td className="px-2 py-1 tabular-nums">{e.offer_count}</td>
                  <td className="px-2 py-1 text-xs">
                    {e.competing_teams.join(", ") || "—"}
                    {lastChance && (
                      <span
                        className="block text-amber-400 font-semibold"
                        title="Others have bid. New clubs can only join until the next round."
                      >
                        Last chance to join
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1">
                    {e.my_offer ? (
                      <span className="tabular-nums" title={statusInfo?.meaning}>
                        {millions(e.my_offer.aav)}
                        {statusInfo && (
                          <span className="ml-1 text-xs text-gray-400">· {statusInfo.label}</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Border>
  );
};
