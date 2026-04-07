import { FC, useCallback, useEffect, useState } from "react";
import { Text } from "../../../../_design/Typography";
import { Border } from "../../../../_design/Borders";
import { BaseballService } from "../../../../_services/baseballService";
import { useSnackbar } from "notistack";
import {
  WaiverEntry,
  FA_TYPE_LABELS,
} from "../../../../models/baseball/baseballFreeAgencyModels";

interface FAWaiverWireProps {
  orgId: number;
  leagueYearId: number;
}

const LEVEL_LABELS: Record<number, string> = {
  4: "Unassigned",
  5: "A",
  6: "High-A",
  7: "AA",
  8: "AAA",
  9: "MLB",
};

export const FAWaiverWire: FC<FAWaiverWireProps> = ({
  orgId,
  leagueYearId,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [waivers, setWaivers] = useState<WaiverEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInFlight, setActionInFlight] = useState<number | null>(null);

  const loadWaivers = useCallback(() => {
    if (!orgId || !leagueYearId) return;
    setIsLoading(true);
    BaseballService.GetWaivers(leagueYearId, orgId)
      .then((res) => setWaivers(res.waivers ?? []))
      .catch(() => enqueueSnackbar("Failed to load waivers", { variant: "error" }))
      .finally(() => setIsLoading(false));
  }, [orgId, leagueYearId, enqueueSnackbar]);

  useEffect(() => {
    loadWaivers();
  }, [loadWaivers]);

  const handleClaim = useCallback(
    async (waiverClaimId: number, playerName: string) => {
      setActionInFlight(waiverClaimId);
      try {
        const res = await BaseballService.PlaceWaiverClaim(waiverClaimId, orgId);
        if (res.already_claimed) {
          enqueueSnackbar(`You already have a claim on ${playerName}`, {
            variant: "info",
            autoHideDuration: 3000,
          });
        } else {
          enqueueSnackbar(`Waiver claim placed on ${playerName}`, {
            variant: "success",
            autoHideDuration: 3000,
          });
        }
        loadWaivers();
      } catch (err: any) {
        enqueueSnackbar(err?.message || "Failed to place claim", {
          variant: "error",
        });
      }
      setActionInFlight(null);
    },
    [orgId, loadWaivers, enqueueSnackbar],
  );

  const handleWithdraw = useCallback(
    async (waiverClaimId: number, playerName: string) => {
      setActionInFlight(waiverClaimId);
      try {
        await BaseballService.WithdrawWaiverClaim(waiverClaimId, orgId);
        enqueueSnackbar(`Claim withdrawn on ${playerName}`, {
          variant: "success",
          autoHideDuration: 3000,
        });
        loadWaivers();
      } catch (err: any) {
        enqueueSnackbar(err?.message || "Failed to withdraw claim", {
          variant: "error",
        });
      }
      setActionInFlight(null);
    },
    [orgId, loadWaivers, enqueueSnackbar],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Text variant="body" classes="text-gray-500 dark:text-gray-400">
          Loading waivers...
        </Text>
      </div>
    );
  }

  if (waivers.length === 0) {
    return (
      <Text variant="body-small" classes="text-gray-500 dark:text-gray-400">
        No players currently on waivers.
      </Text>
    );
  }

  const th =
    "px-2 py-1 text-xs font-semibold text-left whitespace-nowrap";

  return (
    <div className="baseball-table-wrapper overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b dark:border-gray-600">
            <th className={th}>Name</th>
            <th className={th}>Age</th>
            <th className={th}>Type</th>
            <th className={th}>OVR</th>
            <th className={th}>Tier</th>
            <th className={th}>Level</th>
            <th className={th}>Released By</th>
            <th className={th}>Expires</th>
            <th className={th}>Claims</th>
            <th className={th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {waivers.map((w) => {
            const isOwnRelease = w.releasing_org_id === orgId;
            const busy = actionInFlight === w.waiver_claim_id;
            return (
              <tr
                key={w.waiver_claim_id}
                className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-2 py-1 font-medium">{w.player_name}</td>
                <td className="px-2 py-1">{w.age}</td>
                <td className="px-2 py-1">
                  {w.ptype === "Pitcher" ? "P" : "Pos"}
                </td>
                <td className="px-2 py-1">{w.displayovr ?? "—"}</td>
                <td className="px-2 py-1">
                  <span
                    className={`px-1.5 py-0.5 text-[10px] rounded font-semibold ${
                      w.fa_type === "mlb_fa"
                        ? "bg-purple-600/20 text-purple-400"
                        : w.fa_type === "arb"
                          ? "bg-yellow-600/20 text-yellow-400"
                          : w.fa_type === "pre_arb"
                            ? "bg-blue-600/20 text-blue-400"
                            : "bg-gray-600/20 text-gray-400"
                    }`}
                  >
                    {FA_TYPE_LABELS[w.fa_type] ?? w.fa_type}
                  </span>
                </td>
                <td className="px-2 py-1">
                  {LEVEL_LABELS[w.last_level] ?? `Lvl ${w.last_level}`}
                </td>
                <td className="px-2 py-1">{w.releasing_org_abbrev}</td>
                <td className="px-2 py-1">Wk {w.expires_week}</td>
                <td className="px-2 py-1">{w.bid_count}</td>
                <td className="px-2 py-1">
                  {isOwnRelease ? (
                    <span className="text-xs text-gray-500">Your release</span>
                  ) : w.my_bid ? (
                    <button
                      className="px-2 py-0.5 rounded text-xs font-semibold bg-red-600/20 text-red-400 hover:bg-red-600/40 disabled:opacity-40"
                      onClick={() =>
                        handleWithdraw(w.waiver_claim_id, w.player_name)
                      }
                      disabled={busy}
                    >
                      {busy ? "..." : "Withdraw"}
                    </button>
                  ) : (
                    <button
                      className="px-2 py-0.5 rounded text-xs font-semibold bg-green-600/20 text-green-400 hover:bg-green-600/40 disabled:opacity-40"
                      onClick={() =>
                        handleClaim(w.waiver_claim_id, w.player_name)
                      }
                      disabled={busy}
                    >
                      {busy ? "..." : "Claim"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
