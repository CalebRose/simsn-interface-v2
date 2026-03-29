import { FC, useCallback, useEffect, useState } from "react";
import { Border } from "../../_design/Borders";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import { BaseballService } from "../../_services/baseballService";
import { useSnackbar } from "notistack";
import type {
  IFAState,
  IFAAdvanceWeekResponse,
  IFAPhaseTransitions,
} from "../../models/baseball/baseballIFAModels";

interface IFAAdminPanelProps {
  leagueYearId: number;
}

const formatCurrency = (val: number): string => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
};

export const IFAAdminPanel: FC<IFAAdminPanelProps> = ({ leagueYearId }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [state, setState] = useState<IFAState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [lastResult, setLastResult] = useState<IFAAdvanceWeekResponse | null>(null);

  const loadState = useCallback(async () => {
    if (!leagueYearId) return;
    setIsLoading(true);
    try {
      const s = await BaseballService.GetIFAState(leagueYearId);
      setState(s);
    } catch (e) {
      console.error("Failed to load IFA state", e);
    }
    setIsLoading(false);
  }, [leagueYearId]);

  useEffect(() => { loadState(); }, [loadState]);

  const handleAdvance = useCallback(async () => {
    setIsAdvancing(true);
    setLastResult(null);
    try {
      const res = await BaseballService.AdvanceIFAWeek({ league_year_id: leagueYearId });
      setLastResult(res);
      setState({
        league_year_id: res.league_year_id,
        current_week: res.new_week,
        total_weeks: state?.total_weeks ?? 20,
        status: res.status,
      });
      enqueueSnackbar(
        `IFA advanced to Week ${res.new_week}${res.status === "complete" ? " (window closed)" : ""}`,
        { variant: "success", autoHideDuration: 4000 },
      );
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Failed to advance IFA week", { variant: "error", autoHideDuration: 4000 });
    }
    setIsAdvancing(false);
  }, [leagueYearId, state, enqueueSnackbar]);

  if (isLoading) {
    return (
      <Border classes="p-4">
        <Text variant="body" classes="text-gray-400">Loading IFA state...</Text>
      </Border>
    );
  }

  if (!state) {
    return (
      <Border classes="p-4">
        <Text variant="body" classes="text-gray-400">IFA state not available.</Text>
      </Border>
    );
  }

  const statusColor =
    state.status === "active" ? "text-green-400" :
    state.status === "pending" ? "text-yellow-400" :
    "text-gray-400";

  return (
    <Border classes="p-4">
      <Text variant="h6" classes="mb-3">IFA Signing Period</Text>

      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
        <Text variant="small">
          Status: <strong className={statusColor}>{state.status}</strong>
        </Text>
        <Text variant="small">
          Week: <strong>{state.current_week}</strong> of {state.total_weeks}
        </Text>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
        <div
          className="bg-green-500 h-2 rounded-full transition-all"
          style={{ width: `${(state.current_week / state.total_weeks) * 100}%` }}
        />
      </div>

      {/* Advance button */}
      {state.status !== "complete" ? (
        <Button
          size="sm"
          variant="success"
          onClick={handleAdvance}
          disabled={isAdvancing}
        >
          <Text variant="small">
            {isAdvancing
              ? "Advancing..."
              : state.current_week === 0
                ? "Initialize IFA Window (Week 0 → 1)"
                : `Advance to Week ${state.current_week + 1}`
            }
          </Text>
        </Button>
      ) : (
        <Text variant="small" classes="text-gray-400">IFA window is complete for this year.</Text>
      )}

      {/* Last advance result */}
      {lastResult && (
        <Border classes="p-3 mt-4 text-start">
          <Text variant="h6" classes="mb-2">Advance Result</Text>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mb-2">
            <Text variant="small">Week {lastResult.previous_week} → {lastResult.new_week}</Text>
            <Text variant="small">Status: <strong>{lastResult.status}</strong></Text>
          </div>

          {/* Initialization info */}
          {lastResult.players_ranked != null && (
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <Text variant="small">Players ranked: <strong>{lastResult.players_ranked}</strong></Text>
              <Text variant="small">Pools allocated: <strong>{lastResult.pools_allocated}</strong></Text>
            </div>
          )}

          {/* Phase transitions */}
          {lastResult.phase_transitions && (
            <div className="mt-2">
              <Text variant="xs" classes="text-gray-400 mb-1">Phase Transitions:</Text>
              <TransitionSummary transitions={lastResult.phase_transitions} />
            </div>
          )}
        </Border>
      )}
    </Border>
  );
};

const TransitionSummary: FC<{ transitions: IFAPhaseTransitions }> = ({ transitions }) => {
  const items = [
    { label: "Open → Listening", value: transitions.open_to_listening },
    { label: "Listening → Finalize", value: transitions.listening_to_finalize },
    { label: "Finalize → Completed (signed)", value: transitions.finalize_to_completed },
    { label: "Still open (no offers)", value: transitions.still_open },
  ];
  if (transitions.expired != null) {
    items.push({ label: "Expired (unsigned)", value: transitions.expired });
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
      {items.map((item) => (
        <Text key={item.label} variant="small">
          {item.label}: <strong>{item.value}</strong>
        </Text>
      ))}
    </div>
  );
};
