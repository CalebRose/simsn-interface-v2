import { FC, useCallback, useEffect, useState } from "react";
import { Modal } from "../../../../_design/Modal";
import { Text } from "../../../../_design/Typography";
import { Border } from "../../../../_design/Borders";
import { Button, ButtonGroup } from "../../../../_design/Buttons";
import { BaseballService } from "../../../../_services/baseballService";
import { useSnackbar } from "notistack";
import {
  FAPlayerDetailResponse,
  AuctionPhase,
  PHASE_COLORS,
} from "../../../../models/baseball/baseballFreeAgencyModels";

interface FAPlayerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: number;
  orgId: number;
  leagueYearId: number;
  gameWeekId: number;
  availableBudget: number | null;
  scoutingBudget: number | null;
  onMakeOffer: (detail: FAPlayerDetailResponse) => void;
  onScouted: (detail: FAPlayerDetailResponse) => void;
}

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

const heightDisplay = (inches: number) => {
  const ft = Math.floor(inches / 12);
  const rem = inches % 12;
  return `${ft}'${rem}"`;
};

const formatMoney = (val: string | number) => {
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "—";
  return "$" + num.toLocaleString();
};

export const FAPlayerDetailModal: FC<FAPlayerDetailModalProps> = ({
  isOpen,
  onClose,
  playerId,
  orgId,
  leagueYearId,
  gameWeekId,
  availableBudget,
  scoutingBudget,
  onMakeOffer,
  onScouted,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [detail, setDetail] = useState<FAPlayerDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scoutingAction, setScoutingAction] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !playerId) return;
    setIsLoading(true);
    BaseballService.GetFAPlayerDetail(playerId, orgId, leagueYearId)
      .then(setDetail)
      .catch(() => enqueueSnackbar("Failed to load player detail", { variant: "error" }))
      .finally(() => setIsLoading(false));
  }, [isOpen, playerId, orgId, leagueYearId, enqueueSnackbar]);

  const handleScout = useCallback(async (actionType: "pro_attrs_precise" | "pro_potential_precise") => {
    setScoutingAction(actionType);
    try {
      const res = await BaseballService.ScoutFAPlayer({
        org_id: orgId,
        league_year_id: leagueYearId,
        player_id: playerId,
        action_type: actionType,
      });
      setDetail(res.player);
      onScouted(res.player);
      const cost = res.scouting_result.cost;
      enqueueSnackbar(
        cost > 0
          ? `Scouted! ${res.scouting_result.budget.remaining_points} pts remaining`
          : "Already scouted",
        { variant: cost > 0 ? "success" : "info", autoHideDuration: 3000 },
      );
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Scouting failed", { variant: "error" });
    }
    setScoutingAction(null);
  }, [orgId, leagueYearId, playerId, onScouted, enqueueSnackbar]);

  if (!isOpen) return null;

  if (isLoading || !detail) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Player Detail">
        <div className="flex items-center justify-center py-12">
          <Text variant="body" classes="text-gray-400">Loading...</Text>
        </div>
      </Modal>
    );
  }

  const { bio, ratings, potentials, contract_history, demand, auction, scouting, stats_summary } = detail;
  const canScoutAttrs = scouting.available_actions.includes("pro_attrs_precise");
  const canScoutPots = scouting.available_actions.includes("pro_potential_precise");

  const attrLabel = scouting.attrs_precise ? "Precise" : "Fuzzed";
  const potsLabel = scouting.pots_precise ? "Precise" : "Fuzzed";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${bio.firstname} ${bio.lastname}`}
      maxWidth="max-w-[48rem]"
      actions={
        auction ? (
          <ButtonGroup>
            <Button size="sm" variant="danger" onClick={onClose}>
              <Text variant="small">Close</Text>
            </Button>
            <Button
              size="sm"
              variant="success"
              onClick={() => onMakeOffer(detail)}
            >
              <Text variant="small">{auction.my_offer ? "Update Offer" : "Make Offer"}</Text>
            </Button>
          </ButtonGroup>
        ) : (
          <Button size="sm" variant="danger" onClick={onClose}>
            <Text variant="small">Close</Text>
          </Button>
        )
      }
    >
      {/* Bio Header */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-sm text-gray-300">
        <span>Age: <strong>{bio.age}</strong></span>
        <span>{bio.ptype}</span>
        <span>{bio.bat_hand}/{bio.pitch_hand}</span>
        <span>{heightDisplay(bio.height)} {bio.weight} lbs</span>
        <span>OVR: <strong>{bio.displayovr ?? "—"}</strong></span>
        {demand?.war != null && <span>WAR: <strong>{demand.war}</strong></span>}
      </div>

      {/* Attributes + Potentials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Border direction="col" classes="p-3 text-start">
          <div className="flex items-center justify-between mb-2">
            <Text variant="h6">Attributes ({attrLabel})</Text>
            {canScoutAttrs && (
              <button
                className="text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 px-2 py-0.5 rounded disabled:opacity-40"
                onClick={() => handleScout("pro_attrs_precise")}
                disabled={scoutingAction != null}
              >
                {scoutingAction === "pro_attrs_precise" ? "..." : "Scout (15 pts)"}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm">
            {Object.entries(ratings).map(([key, val]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-400 capitalize">{key.replace(/_display$/, "").replace(/_/g, " ")}</span>
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
                onClick={() => handleScout("pro_potential_precise")}
                disabled={scoutingAction != null}
              >
                {scoutingAction === "pro_potential_precise" ? "..." : "Scout (15 pts)"}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm">
            {Object.entries(potentials).map(([key, val]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-400 capitalize">{key.replace(/_pot$/, "").replace(/_/g, " ")}</span>
                <span className="font-semibold">{val ?? "?"}</span>
              </div>
            ))}
          </div>
        </Border>
      </div>

      {/* Stats Summary */}
      {(stats_summary.batting || stats_summary.pitching) && (
        <Border direction="col" classes="p-3 mb-4 text-start">
          <Text variant="h6" classes="mb-2">Last Season</Text>
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
              <span>{stats_summary.pitching.wins}W-{stats_summary.pitching.losses}L</span>
              <span>{stats_summary.pitching.ip} IP</span>
              <span>{stats_summary.pitching.so} SO</span>
              <span>{stats_summary.pitching.bb} BB</span>
              <span>{stats_summary.pitching.whip} WHIP</span>
            </div>
          )}
        </Border>
      )}

      {/* Demands + Contract History */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {demand && (
          <Border direction="col" classes="p-3 text-start">
            <Text variant="h6" classes="mb-2">Demands</Text>
            <Text variant="small">Min AAV: <strong>{formatMoney(demand.min_aav)}</strong></Text>
            <Text variant="small">Years: <strong>{demand.min_years}-{demand.max_years ?? 5}</strong></Text>
            <Text variant="small">WAR: <strong>{demand.war}</strong></Text>
          </Border>
        )}
        {contract_history.length > 0 && (
          <Border direction="col" classes="p-3 text-start">
            <Text variant="h6" classes="mb-2">Contract History</Text>
            {contract_history.map((ch, i) => (
              <Text key={i} variant="small">
                {ch.org} - {ch.years}yr, ${(ch.salary / 1_000_000).toFixed(1)}M/yr
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
            {phaseBadge(auction.phase)}
          </div>
          <Text variant="small">{auction.offer_count} offer(s)</Text>
          {auction.competing_teams.length > 0 && (
            <Text variant="small">Competing: {auction.competing_teams.join(", ")}</Text>
          )}
          {auction.my_offer ? (
            <Text variant="small" classes="text-green-400">
              Your offer: {auction.my_offer.years}yr, ${auction.my_offer.aav.toLocaleString()} AAV
            </Text>
          ) : (
            <Text variant="small" classes="text-gray-400">No offer submitted</Text>
          )}
        </Border>
      )}
    </Modal>
  );
};
