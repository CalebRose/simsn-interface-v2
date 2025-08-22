import React from 'react';
import { Text } from '../../../../_design/Typography';
import { Button } from '../../../../_design/Buttons';
import { ToggleSwitch } from '../../../../_design/Inputs';
import { Modal } from '../../../../_design/Modal';
import { useModal } from '../../../../_hooks/useModal';
import { GameplanData } from './GameplanHelper';
import { SpecialTeamsOptions, SpecialTeamsLabels } from '../Constants/GameplanConstants';
import { GameplanInput } from './GameplanInput';
import { GameplanValidationResult } from './useGameplanValidation';
import { getFieldError, getFieldWarning } from '../Utils/GameplanValidationUtils';
import { getAggressionLevelColor, getAggressionLevelText } from '../Utils/ComponentStyleUtils';
import { InformationCircle } from '../../../../_design/Icons';
import GameplanSlider from './GameplanSlider';

export interface SpecialTeamsPanelProps {
  gameplan: GameplanData;
  onChange: (field: string, value: any) => void;
  onToggle: (field: string) => void;
  validation: GameplanValidationResult;
  disabled?: boolean;
  className?: string;
  backgroundColor?: string;
  borderColor?: string;
  accentColor?: string;
}

export const SpecialTeamsPanel: React.FC<SpecialTeamsPanelProps> = ({
  gameplan,
  onChange,
  onToggle,
  validation,
  disabled = false,
  className = '',
  backgroundColor,
  borderColor,
  accentColor
}) => {
  const { isModalOpen: isInfoModalOpen, handleOpenModal: openInfoModal, handleCloseModal: closeInfoModal } = useModal();

  return (
    <div className={`border-2 rounded-lg p-4`} style={{ backgroundColor, borderColor }}>
      <div className="flex gap-4 items-start justify-center border-b" style={{ borderColor: accentColor }}>
        <div className="rounded-lg px-4 pb-2 sm:p-4 w-1/2">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
                <Text variant="h5" classes="text-white font-medium">
                  Default Special Teams
                </Text>
                <ToggleSwitch
                checked={gameplan.DefaultSpecialTeams}
                onChange={() => onToggle('DefaultSpecialTeams')}
                />
              </div>
              <Text variant="small" classes="text-gray-400 mt-1">
                Let the computer make special teams decisions automatically
              </Text>
            </div>
          </div>
        </div>
        <div className="rounded-lg p-4 pt-0 w-full flex flex-col items-center">
          <Text variant="h5" classes="text-white font-semibold mb-1">
            Field Goal Settings
          </Text>
          <div className="max-w-md">
            <GameplanInput
              name="MaximumFGDistance"
              label={SpecialTeamsLabels.MaximumFGDistance}
              value={gameplan.MaximumFGDistance}
              onChange={(e) => onChange('MaximumFGDistance', parseInt(e.target.value) || 0)}
              disabled={disabled || gameplan.DefaultSpecialTeams}
              min={SpecialTeamsOptions.MaxFieldGoalDistance.Min}
              max={SpecialTeamsOptions.MaxFieldGoalDistance.Max}
              error={getFieldError(validation, 'MaximumFGDistance')}
              warning={getFieldWarning(validation, 'MaximumFGDistance')}
            />
          </div>
          
        </div>
        <Button
          variant="secondaryOutline"
          size="sm"
          onClick={openInfoModal}
          className="flex items-center gap-2 p-1 rounded-full"
        >
          <InformationCircle />
        </Button>
      </div>
      <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
        <Text variant="h5" classes="text-white font-semibold mb-4">
          4th Down Aggression
        </Text>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <GameplanSlider
              name="GoFor4AndShort"
              label={SpecialTeamsLabels.GoFor4AndShort}
              value={gameplan.GoFor4AndShort}
              onChange={(e) => onChange('GoFor4AndShort', parseInt(e.target.value) || 0)}
              min={SpecialTeamsOptions.GoFor4AndShort.Min}
              max={SpecialTeamsOptions.GoFor4AndShort.Max}
              error={getFieldError(validation, 'GoFor4AndShort')}
              warning={getFieldWarning(validation, 'GoFor4AndShort')}
              disabled={disabled || gameplan.DefaultSpecialTeams}
            />
            <GameplanSlider
              name="GoFor4AndLong"
              label={SpecialTeamsLabels.GoFor4AndLong}
              value={gameplan.GoFor4AndLong}
              onChange={(e) => onChange('GoFor4AndLong', parseInt(e.target.value) || 0)}
              min={SpecialTeamsOptions.GoFor4AndLong.Min}
              max={SpecialTeamsOptions.GoFor4AndLong.Max}
              error={getFieldError(validation, 'GoFor4AndLong')}
              warning={getFieldWarning(validation, 'GoFor4AndLong')}
              disabled={disabled || gameplan.DefaultSpecialTeams}
            />
          </div>
          <div className="mt-4 p-3 bg-gray-700 bg-opacity-50 rounded-lg col-span-2">
            <Text variant="small" classes="text-blue-400 font-semibold mb-2">
              4th Down Strategy Summary:
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <Text variant="small" classes="text-gray-300">
                  4th and Short (1-3 yards)
                </Text>
                <Text variant="h5" classes={`font-bold ${getAggressionLevelColor(gameplan.GoFor4AndShort, 'short')}`}>
                  {gameplan.GoFor4AndShort}%
                </Text>
                <Text variant="xs" classes="text-gray-400">
                  {getAggressionLevelText(gameplan.GoFor4AndShort, 'short')}
                </Text>
              </div>
              <div className="text-center">
                <Text variant="small" classes="text-gray-300">
                  4th and Long (4+ yards)
                </Text>
                <Text variant="h5" classes={`font-bold ${getAggressionLevelColor(gameplan.GoFor4AndLong, 'long')}`}>
                  {gameplan.GoFor4AndLong}%
                </Text>
                <Text variant="xs" classes="text-gray-400">
                  {getAggressionLevelText(gameplan.GoFor4AndLong, 'long')}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
      {(getFieldError(validation, 'specialTeams') || getFieldWarning(validation, 'specialTeams')) && (
        <div className={`p-3 rounded-lg border ${
          getFieldError(validation, 'specialTeams') 
            ? 'bg-red-900 bg-opacity-50 border-red-500' 
            : 'bg-yellow-900 bg-opacity-50 border-yellow-500'
        }`}>
          <Text variant="small" classes={
            getFieldError(validation, 'specialTeams') ? 'text-red-400' : 'text-yellow-400'
          }>
            {getFieldError(validation, 'specialTeams') || getFieldWarning(validation, 'specialTeams')}
          </Text>
        </div>
      )}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={closeInfoModal}
        title="Special Teams Information"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <Text variant="body" classes="text-gray-300">
            Special Teams settings control your team's approach to field goals and 4th down situations. 
            These settings can significantly impact game strategy and field position.
          </Text>
          <div className="space-y-3">
            <div>
              <Text variant="body" classes="text-white font-semibold">Maximum Field Goal Distance:</Text>
              <Text variant="small" classes="text-gray-300">
                Sets the maximum distance your kicker will attempt field goals. Beyond this distance, 
                your team will automatically punt instead. Consider your kicker's ability and game situation 
                when setting this value. Range: 15-85 yards.
              </Text>
            </div>
            <div>
              <Text variant="body" classes="text-white font-semibold">4th Down Aggression:</Text>
              <Text variant="small" classes="text-gray-300">
                Controls how often your team goes for it on 4th down instead of punting or attempting field goals. 
                Higher values mean more aggressive play-calling. Consider field position, score, and time remaining.
              </Text>
            </div>
            <div>
              <Text variant="body" classes="text-white font-semibold">Go For It on 4th and Short:</Text>
              <Text variant="small" classes="text-gray-300">
                Probability (0-85%) of attempting conversion on 4th down with 1-3 yards to go. 
                Higher values are more aggressive but riskier.
              </Text>
            </div>
            <div>
              <Text variant="body" classes="text-white font-semibold">Go For It on 4th and Long:</Text>
              <Text variant="small" classes="text-gray-300">
                Probability (0-85%) of attempting conversion on 4th down with 4+ yards to go. 
                Generally should be much lower than short yardage situations.
              </Text>
            </div>
            <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded-lg p-3">
              <Text variant="small" classes="text-yellow-400 font-semibold">
                Strategy Tips:
              </Text>
              <Text variant="small" classes="text-yellow-300 mt-1">
                • Conservative teams: Keep 4th down percentages low (0-15%)
                <br />
                • Balanced teams: Use moderate settings (15-35% short, 5-15% long)
                <br />
                • Aggressive teams: Higher percentages (35%+ short, 15%+ long)
                <br />
                • Consider your offensive line and running game strength for short yardage
              </Text>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SpecialTeamsPanel;