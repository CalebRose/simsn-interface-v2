import { FC, memo } from "react";
import { Text } from "../../../../../_design/Typography";
import { Border } from "../../../../../_design/Borders";
import { PillButton } from "../../../../../_design/Buttons";
import type { ScoutingBudget } from "../../../../../models/baseball/baseballScoutingModels";
import type { ScoutingPlayerResponse } from "../../../../../models/baseball/baseballScoutingModels";
import {
  SCOUTING_ACTION_LABELS,
  SCOUTING_ACTION_COSTS,
} from "../../../../../_utility/baseballHelpers";

interface ScoutingActionsProps {
  visibility: ScoutingPlayerResponse["visibility"];
  scoutingBudget: ScoutingBudget | null;
  isUnlocking: boolean;
  onUnlock: (actionType: string) => void;
}

export const ScoutingActions: FC<ScoutingActionsProps> = memo(
  ({ visibility, scoutingBudget, isUnlocking, onUnlock }) => {
    if (
      !visibility ||
      (visibility.available_actions.length === 0 &&
        visibility.unlocked.length === 0)
    ) {
      return null;
    }

    return (
      <Border classes="p-3">
        <Text variant="small" classes="font-semibold mb-2">
          Scouting Actions
        </Text>
        <div className="flex gap-2 flex-wrap">
          {visibility.unlocked.map((action) => (
            <PillButton key={action} variant="primaryOutline" disabled>
              <Text variant="small" classes="text-gray-400 line-through">
                {SCOUTING_ACTION_LABELS[action] ?? action} ✓
              </Text>
            </PillButton>
          ))}
          {visibility.available_actions.map((action) => (
            <PillButton
              key={action}
              variant="primaryOutline"
              disabled={
                isUnlocking ||
                (scoutingBudget != null &&
                  scoutingBudget.remaining_points <
                    (SCOUTING_ACTION_COSTS[action] ?? 0))
              }
              onClick={() => onUnlock(action)}
            >
              <Text variant="small">
                {SCOUTING_ACTION_LABELS[action] ?? action} (
                {SCOUTING_ACTION_COSTS[action] ?? "?"} pts)
              </Text>
            </PillButton>
          ))}
        </div>
        {scoutingBudget && (
          <Text variant="xs" classes="text-gray-400 mt-1">
            Budget: {scoutingBudget.remaining_points} /{" "}
            {scoutingBudget.total_points} pts remaining
          </Text>
        )}
      </Border>
    );
  },
);
