import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { BaseballService } from "../../../../_services/baseballService";
import type {
  ScoutingPlayerResponse,
  ScoutingBudget,
  ScoutingActionRequest,
  ScoutingActionType,
} from "../../../../models/baseball/baseballScoutingModels";
import type { FAPlayerDetailResponse } from "../../../../models/baseball/baseballFreeAgencyModels";
import type { IFAAuctionDetail } from "../../../../models/baseball/baseballIFAModels";
import type { PlayerInjuryHistoryEvent } from "../../../../models/baseball/baseballStatsModels";
import { useSnackbar } from "notistack";

export type PlayerModalContext = "scouting" | "freeAgency" | "ifa";

interface UsePlayerModalDataOptions {
  playerId: number;
  orgId: number;
  leagueYearId: number;
  isOpen: boolean;
  context: PlayerModalContext;
  auctionId?: number;
  scoutingBudget?: ScoutingBudget | null;
  onBudgetChanged?: () => void;
  onScouted?: (detail: FAPlayerDetailResponse) => void;
}

export interface PlayerModalData {
  player: ScoutingPlayerResponse | null;
  faDetail: FAPlayerDetailResponse | null;
  ifaDetail: IFAAuctionDetail | null;
  injuryHistory: PlayerInjuryHistoryEvent[];
  isLoading: boolean;
  isUnlocking: boolean;
  injuryLoading: boolean;
  scoutingAction: string | null;
  selectedTab: string;
  setSelectedTab: Dispatch<SetStateAction<string>>;
  handleUnlock: (actionType: string) => Promise<void>;
  handleScoutFA: (
    actionType: "pro_attrs_precise" | "pro_potential_precise",
  ) => Promise<void>;
}

export function usePlayerModalData({
  playerId,
  orgId,
  leagueYearId,
  isOpen,
  context,
  auctionId,
  scoutingBudget,
  onBudgetChanged,
  onScouted,
}: UsePlayerModalDataOptions): PlayerModalData {
  const { enqueueSnackbar } = useSnackbar();

  const [player, setPlayer] = useState<ScoutingPlayerResponse | null>(null);
  const [faDetail, setFaDetail] = useState<FAPlayerDetailResponse | null>(null);
  const [ifaDetail, setIfaDetail] = useState<IFAAuctionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [scoutingAction, setScoutingAction] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("Attributes");

  // Injury history (lazy-loaded)
  const [injuryHistory, setInjuryHistory] = useState<
    PlayerInjuryHistoryEvent[]
  >([]);
  const [injuryLoading, setInjuryLoading] = useState(false);

  // Fetch player data on open
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setIsLoading(true);
    setSelectedTab(context === "ifa" ? "Auction" : "Attributes");

    if (context === "ifa") {
      if (!auctionId) return;
      BaseballService.GetIFAAuctionDetail(auctionId, orgId)
        .then((data) => {
          if (!cancelled) setIfaDetail(data);
        })
        .catch((err) => {
          if (!cancelled)
            enqueueSnackbar("Failed to load auction detail", {
              variant: "error",
            });
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    } else if (context === "freeAgency") {
      if (!playerId) return;
      // Fetch FA detail and scouting data independently so the modal can
      // render the FA-only view as soon as faDetail arrives, then upgrade
      // to the full tabbed view once scouting data loads.
      BaseballService.GetFAPlayerDetail(playerId, orgId, leagueYearId)
        .then((faData) => {
          if (!cancelled) {
            setFaDetail(faData);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (!cancelled)
            enqueueSnackbar(
              err?.message || "Failed to load player",
              { variant: "error" },
            );
        });
      BaseballService.GetScoutedPlayer(playerId, orgId, leagueYearId)
        .then((playerData) => {
          if (!cancelled) {
            setPlayer(playerData);
            setIsLoading(false);
          }
        })
        .catch(() => {
          // Scouting data is optional — FA-only view still works
          if (!cancelled) setIsLoading(false);
        });
    } else {
      if (!playerId) return;
      BaseballService.GetScoutedPlayer(playerId, orgId, leagueYearId)
        .then((data) => {
          if (!cancelled) setPlayer(data);
        })
        .catch((err) => {
          if (!cancelled)
            enqueueSnackbar(
              err?.message || "Failed to load player",
              { variant: "error" },
            );
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [isOpen, playerId, orgId, leagueYearId, context, auctionId, enqueueSnackbar]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setPlayer(null);
      setFaDetail(null);
      setIfaDetail(null);
      setInjuryHistory([]);
    }
  }, [isOpen]);

  // Lazy-load injury history
  useEffect(() => {
    if (selectedTab !== "Injuries" || !playerId) return;
    let cancelled = false;
    setInjuryLoading(true);
    BaseballService.GetPlayerInjuryHistory({ player_id: playerId })
      .then((data) => {
        if (!cancelled) setInjuryHistory(data.events);
      })
      .catch(() => {
        if (!cancelled) setInjuryHistory([]);
      })
      .finally(() => {
        if (!cancelled) setInjuryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedTab, playerId]);

  // Scouting unlock handler (for scouting context)
  const handleUnlock = useCallback(
    async (actionType: string) => {
      setIsUnlocking(true);
      try {
        const dto: ScoutingActionRequest = {
          org_id: orgId,
          league_year_id: leagueYearId,
          player_id: playerId,
          action_type: actionType as ScoutingActionType,
        };
        const res = await BaseballService.PerformScoutingAction(dto);
        if (res.status === "unlocked") {
          enqueueSnackbar(
            `Unlocked! (${res.points_spent} pts spent, ${res.points_remaining} remaining)`,
            { variant: "success", autoHideDuration: 3000 },
          );
        } else {
          enqueueSnackbar("Already unlocked", {
            variant: "info",
            autoHideDuration: 2000,
          });
        }
        onBudgetChanged?.();
        const updated = await BaseballService.GetScoutedPlayer(
          playerId,
          orgId,
          leagueYearId,
        );
        setPlayer(updated);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Scouting action failed";
        enqueueSnackbar(message, {
          variant: "error",
          autoHideDuration: 4000,
        });
      }
      setIsUnlocking(false);
    },
    [orgId, leagueYearId, playerId, onBudgetChanged, enqueueSnackbar],
  );

  // FA scouting handler
  const handleScoutFA = useCallback(
    async (
      actionType: "pro_attrs_precise" | "pro_potential_precise",
    ) => {
      setScoutingAction(actionType);
      try {
        const res = await BaseballService.ScoutFAPlayer({
          org_id: orgId,
          league_year_id: leagueYearId,
          player_id: playerId,
          action_type: actionType,
        });
        setFaDetail(res.player);
        onScouted?.(res.player);
        const cost = res.scouting_result.cost;
        enqueueSnackbar(
          cost > 0
            ? `Scouted! ${res.scouting_result.budget.remaining_points} pts remaining`
            : "Already scouted",
          { variant: cost > 0 ? "success" : "info", autoHideDuration: 3000 },
        );
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Scouting failed";
        enqueueSnackbar(message, { variant: "error" });
      }
      setScoutingAction(null);
    },
    [orgId, leagueYearId, playerId, onScouted, enqueueSnackbar],
  );

  return {
    player,
    faDetail,
    ifaDetail,
    injuryHistory,
    isLoading,
    isUnlocking,
    injuryLoading,
    scoutingAction,
    selectedTab,
    setSelectedTab,
    handleUnlock,
    handleScoutFA,
  };
}
