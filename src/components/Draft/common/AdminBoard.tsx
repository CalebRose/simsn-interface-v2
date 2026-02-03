import React from "react";
import { League } from "../../../_constants/constants";
import { Text } from "../../../_design/Typography";
import { DraftStateObj } from "../hooks/useDraftState";
import { Button } from "../../../_design/Buttons";
import {
  getDraftPickOptions,
  getDraftRoundOptions,
} from "../PHLDraft/utils/draftHelpers";
import { SelectDropdown } from "../../../_design/Select";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";

interface DraftAdminBoardProps {
  draftState: DraftStateObj;
  handleManualDraftStateUpdate: (newState: any) => void;
  resyncDraftData: () => void;
  backgroundColor: string;
  league: League;
  formattedTime: string;
  isDraftComplete: boolean;
}

export const DraftAdminBoard: React.FC<DraftAdminBoardProps> = ({
  draftState,
  handleManualDraftStateUpdate,
  resyncDraftData,
  backgroundColor,
  league,
  formattedTime,
  isDraftComplete,
}) => {
  const draftPickOptions = getDraftPickOptions();
  const draftRoundOptions = getDraftRoundOptions();

  const selectDraftPickOption = (opt: SingleValue<SelectOption>) => {
    const { value } = opt as SelectOption;
    const pickNumber = parseInt(value, 10);

    handleManualDraftStateUpdate({
      currentPick: pickNumber,
      nextPick: pickNumber + 1,
    });
  };

  const selectDraftRoundOption = (opt: SingleValue<SelectOption>) => {
    const { value } = opt as SelectOption;
    const roundNumber = parseInt(value, 10);

    handleManualDraftStateUpdate({ currentRound: roundNumber });
  };

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
            <Text variant="body-small">Time Left</Text>
            <Text variant="xs">{formattedTime}</Text>
          </div>

          <div className="flex flex-col">
            <Text variant="body-small">Last Drafted Player</Text>
            <Text variant="xs">{draftState.recentlyDraftedPlayerID}</Text>
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
            <Text variant="body-small">Pause</Text>
            <Button variant="warning">Pause</Button>
          </div>
          <div className="flex flex-col">
            <Text variant="body-small">Reset</Text>
            <Button variant="danger">Reset</Button>
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
