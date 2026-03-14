import { FC, useEffect, useState } from "react";
import { Text } from "../../../../_design/Typography";
import { BaseballService } from "../../../../_services/baseballService";
import { ScoutingBudget } from "../../../../models/baseball/baseballScoutingModels";

interface ScoutingBudgetBarProps {
  orgId: number;
  leagueYearId: number;
  /** Called when budget data is loaded or refreshed */
  onBudgetLoaded?: (budget: ScoutingBudget) => void;
  /** Increment to force a refresh */
  refreshKey?: number;
}

export const ScoutingBudgetBar: FC<ScoutingBudgetBarProps> = ({
  orgId,
  leagueYearId,
  onBudgetLoaded,
  refreshKey = 0,
}) => {
  const [budget, setBudget] = useState<ScoutingBudget | null>(null);

  useEffect(() => {
    if (!orgId || !leagueYearId) return;
    let cancelled = false;
    BaseballService.GetScoutingBudget(orgId, leagueYearId)
      .then((b) => {
        if (cancelled) return;
        setBudget(b);
        onBudgetLoaded?.(b);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [orgId, leagueYearId, refreshKey]);

  if (!budget) return null;

  const pct = budget.total_points > 0
    ? (budget.remaining_points / budget.total_points) * 100
    : 0;

  return (
    <div className="flex items-center gap-3">
      <Text variant="small" classes="font-semibold whitespace-nowrap">
        Scouting Budget: {budget.remaining_points} / {budget.total_points} pts
      </Text>
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-[200px]">
        <div
          className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
