import React, { useCallback } from "react";
import { League } from "../../../_constants/constants";
import { Text } from "../../../_design/Typography";
import { DraftStateObj } from "../hooks/useDraftState";
import { Button } from "../../../_design/Buttons";
import {
  formatDraftTime,
  getDraftPickOptions,
  getDraftRoundOptions,
  getSecondsByRound,
} from "../PHLDraft/utils/draftHelpers";
import { SelectDropdown } from "../../../_design/Select";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";

interface DraftAdminBoardProps {
  draftState: DraftStateObj;
  handleManualDraftStateUpdate: (newState: any) => Promise<void>;
  resyncDraftData: () => void;
  backgroundColor: string;
  league: League;
  isDraftComplete: boolean;
}

export const DraftAdminBoard: React.FC<DraftAdminBoardProps> = ({
  draftState,
  handleManualDraftStateUpdate,
  resyncDraftData,
  backgroundColor,
  league,
  isDraftComplete,
}) => {
  const draftPickOptions = getDraftPickOptions();
  const draftRoundOptions = getDraftRoundOptions();

  const selectDraftPickOption = async (opt: SingleValue<SelectOption>) => {
    const { value } = opt as SelectOption;
    const pickNumber = parseInt(value, 10);

    await handleManualDraftStateUpdate({
      currentPick: pickNumber,
      nextPick: pickNumber + 1,
    });
  };

  const selectDraftRoundOption = async (opt: SingleValue<SelectOption>) => {
    const { value } = opt as SelectOption;
    const roundNumber = parseInt(value, 10);
    const newSeconds = getSecondsByRound(roundNumber);
    await handleManualDraftStateUpdate({
      currentRound: roundNumber,
      seconds: newSeconds,
    });
  };

  const secondsRound = getSecondsByRound(draftState.currentRound);
  const formattedTime = formatDraftTime(secondsRound);

  const removePlayerFromPick = useCallback(async () => {
    // Logic to remove player from the current pick
    const draftPickMap = { ...draftState.allDraftPicks };
    const roundKey = draftState.currentRound;
    const picksInRound = draftPickMap[roundKey] || [];
    if (picksInRound.length === 0) return; // No picks in this round
    const currentPickIndex = picksInRound.findIndex(
      (pick) => pick.ID === draftState.currentPick,
    );
    if (currentPickIndex === -1) return; // Pick not found
    draftPickMap[roundKey][currentPickIndex].DrafteeID = 0;
    draftPickMap[roundKey][currentPickIndex].SelectedPlayerID = 0;
    draftPickMap[roundKey][currentPickIndex].SelectedPlayerName = "";
    draftPickMap[roundKey][currentPickIndex].SelectedPlayerPosition = "";

    await handleManualDraftStateUpdate({ allDraftPicks: draftPickMap });
  }, [draftState, handleManualDraftStateUpdate]);

  return (
    <>
      <div className="w-full p-4" style={{ backgroundColor }}>
        <Text variant="h2" className="mb-4">
          Admin Board - {league}
        </Text>
        <div className="grid grid-cols-4 mb-4 gap-4">
          <div className="flex flex-col">
            <Text variant="body-small">Current Round</Text>
            <Text variant="xs">{draftState.currentRound}</Text>
            <div className="flex justify-center p-2 mt-2">
              <SelectDropdown
                options={draftRoundOptions}
                onChange={selectDraftRoundOption}
                placeholder="Go to Round..."
              />
            </div>
          </div>
          <div className="flex flex-col">
            <Text variant="body-small">Current Pick</Text>
            <Text variant="xs">{draftState.currentPick}</Text>
            <div className="flex justify-center p-2 mt-2">
              <SelectDropdown
                options={draftPickOptions}
                onChange={selectDraftPickOption}
                placeholder="Go to Pick..."
              />
            </div>
          </div>

          <div className="flex flex-col">
            <Text variant="body-small">Time Per Round</Text>
            <Text variant="small" classes="mt-8">
              {formattedTime}
            </Text>
          </div>

          <div className="flex flex-col">
            <Text variant="body-small">Last Drafted Player</Text>
            <Text variant="xs" classes="mt-8">
              {draftState.recentlyDraftedPlayerID === 0
                ? "None"
                : draftState.recentlyDraftedPlayerID}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="body-small">Resync Draft Picks</Text>
            <Button
              disabled={draftState.currentPick > 1}
              variant="success"
              onClick={resyncDraftData}
            >
              Resync
            </Button>
          </div>
          <div className="flex flex-col">
            <Text variant="body-small">Start Draft</Text>
            <Button variant="warning">Start</Button>
          </div>
          <div className="flex flex-col">
            <Text variant="body-small">Pause Draft</Text>
            <Button variant="warning">Pause</Button>
          </div>
          <div className="flex flex-col">
            <Text variant="body-small">Reset Timer</Text>
            <Button variant="danger">Reset</Button>
          </div>
          <div className="flex flex-col">
            <Text variant="body-small">Remove Player from Pick</Text>
            <Button
              disabled={!draftState.isPaused}
              onClick={removePlayerFromPick}
            >
              Remove
            </Button>
          </div>
          <div className="flex flex-col">
            <Text variant="body-small">Export Draft</Text>
            <Button disabled={!(isDraftComplete && draftState.exportComplete)}>
              Export
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
