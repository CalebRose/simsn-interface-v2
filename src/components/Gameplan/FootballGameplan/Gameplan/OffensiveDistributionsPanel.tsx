import React, { useState } from 'react';
import { Text } from '../../../../_design/Typography';
import { Button } from '../../../../_design/Buttons';
import { Modal } from '../../../../_design/Modal';
import { useModal } from '../../../../_hooks/useModal';
import { CollegePlayer, NFLPlayer, CollegeTeamDepthChart, NFLDepthChart } from '../../../../models/footballModels';
import { SimCFB, SimNFL } from '../../../../_constants/constants';
import { GameplanData } from './GameplanHelper';
import { 
  TargetingLabels, 
  RunPlayLabels, 
  OptionPlayLabels, 
  PassPlayLabels, 
  RPOLabels,
  TargetDepthOptions 
} from '../Constants/GameplanConstants';
import { RunnerInput, TargetInput } from './GameplanInput';
import { GameplanInputSmall } from './GameplanInput';
import { GameplanSlider } from './GameplanSlider';
import { GameplanValidationResult } from './useGameplanValidation';
import { getCFBOverall } from '../../../../_utility/getLetterGrade';
import { GetNFLOverall } from '../../../Team/TeamPageUtils';
import { getFieldError } from '../Utils/GameplanValidationUtils';
import { getPercentageStatusColor } from '../Utils/ComponentStyleUtils';
import { 
  calculateRunDistributionTotal, 
  calculatePassDistributionTotal, 
  calculateOptionDistributionTotal, 
  calculateRPODistributionTotal 
} from '../Utils/GameplanCalculationUtils';
import { getGameplanPlayerInfo, getDepthChartPlayerInfo } from '../Utils/GameplanPlayerUtils';
import {
  Team,
  Player
 } from '../../../../_constants/constants';
import { InformationCircle } from '../../../../_design/Icons';
import { getPassTypeRanges } from '../Utils/GameplanCalculationUtils';

export interface OffensiveDistributionsPanelProps {
  gameplan: GameplanData;
  players: (CollegePlayer | NFLPlayer)[];
  depthChart?: CollegeTeamDepthChart | NFLDepthChart | null;
  league: typeof SimCFB | typeof SimNFL;
  onChange: (field: string, value: any) => void;
  validation: GameplanValidationResult;
  disabled?: boolean;
  className?: string;
  backgroundColor?: string;
  borderColor?: string;
  accentColor?: string;
}

export const OffensiveDistributionsPanel: React.FC<OffensiveDistributionsPanelProps> = ({
  gameplan,
  players,
  depthChart,
  league,
  onChange,
  validation,
  disabled = false,
  className = '',
  backgroundColor,
  borderColor,
  accentColor
}) => {
  const { isModalOpen: isInfoModalOpen, handleOpenModal: openInfoModal, handleCloseModal: closeInfoModal } = useModal();
  const [viewMode, setViewMode] = useState<any>(Team);
  const [passTypeInfoModal, setPassTypeInfoModal] = useState<string | null>(null);
  const runDistTotal = calculateRunDistributionTotal(gameplan);
  const passDistTotal = calculatePassDistributionTotal(gameplan);
  const optionDistTotal = calculateOptionDistributionTotal(gameplan);
  const rpoDistTotal = calculateRPODistributionTotal(gameplan);

  return (
    <div className={`space-y-6 ${className} border-2 p-4 rounded-lg`} style={{ borderColor, backgroundColor }}>
      <div className="flex items-center justify-between border-b py-2" style={{ borderColor: accentColor }}>
        <div className="flex w-full items-center justify-end gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="secondaryOutline"
              size="sm"
              onClick={() => setViewMode(Team)}
              className={`px-3 py-1 ${viewMode === Team ? 'bg-orange-900 bg-opacity-50 hover:bg-orange-700 text-white border-orange-500' : ''}`}
            >
              <Text variant="body">Team</Text>
            </Button>
            <Button
              variant="secondaryOutline"
              size="sm"
              onClick={() => setViewMode(Player)}
              className={`px-3 py-1 ${viewMode === Player ? 'bg-orange-900 bg-opacity-50 hover:bg-orange-700 text-white border-orange-500' : ''}`}
            >
              <Text variant="body">Player</Text>
            </Button>
          </div>
          <Button
            variant="secondaryOutline"
            size="sm"
            onClick={openInfoModal}
            className="p-1 rounded-full"
          >
            <InformationCircle />
          </Button>
        </div>
      </div>
      {viewMode === Team && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-2">
          <div className="flex items-center justify-between mb-4 ">
            <Text variant="h5" classes="text-white font-semibold">
              Pass Type
            </Text>
            <Text variant="small" classes={`font-semibold ${getPercentageStatusColor(passDistTotal)}`}>
              Total: {passDistTotal}/100
            </Text>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {PassPlayLabels.map((label, index) => {
              const fieldName = `Pass${label}`;
              let displayLabel = label;
              let passType = label;
              if (index === 4) {
                displayLabel = 'Play Action Short';
                passType = 'PlayActionShort';
              } else if (index === 5) {
                displayLabel = 'Play Action Long';
                passType = 'PlayActionLong';
              }
              
              return (
                <div key={fieldName} className="flex items-center gap-2">
                  <div className="flex-1">
                    <GameplanInputSmall
                      name={fieldName}
                      label={displayLabel}
                      value={gameplan[fieldName as keyof GameplanData] as number}
                      onChange={(e) => onChange(fieldName, parseInt(e.target.value) || 0)}
                      disabled={disabled || gameplan.DefaultOffense}
                      error={getFieldError(validation, fieldName)}
                      size="xs"
                    />
                  </div>
                  <Button
                    variant="secondaryOutline"
                    size="sm"
                    onClick={() => setPassTypeInfoModal(passType)}
                    className="p-1 rounded-full min-w-0 h-6 w-6 flex items-center justify-center"
                  >
                    <InformationCircle />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-2">
          <div className="flex items-center justify-between mb-4">
            <Text variant="h5" classes="text-white font-semibold">
              RPO
            </Text>
            <Text variant="small" classes={`font-semibold ${getPercentageStatusColor(rpoDistTotal)}`}>
              Total: {rpoDistTotal}/100
            </Text>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {validation.playTypeTotals.rpo > 0 ? (
              RPOLabels.map((label) => {
                return (
                  <GameplanInputSmall
                    key={label}
                    name={label}
                    label={label.replace(/([A-Z])/g, ' $1').trim()}
                    value={gameplan[label as keyof GameplanData] as number}
                    onChange={(e) => onChange(label, parseInt(e.target.value) || 0)}
                    disabled={disabled || gameplan.DefaultOffense}
                    error={getFieldError(validation, label)}
                    size="xs"
                  />
                );
              })
            ) : (
              <Text variant="small" classes="text-gray-500 italic">
                No RPO plays in formations
              </Text>
            )}
          </div>
        </div>
        <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-2">
          <div className="flex items-center justify-between mb-4">
            <Text variant="h5" classes="text-white font-semibold">
              Run Type
            </Text>
            <Text variant="small" classes={`font-semibold ${getPercentageStatusColor(runDistTotal)}`}>
              Total: {runDistTotal}/100
            </Text>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {RunPlayLabels.map((label) => {
              const fieldName = `Run${label}`;
              return (
                <GameplanInputSmall
                  key={fieldName}
                  name={fieldName}
                  label={label.replace(/([A-Z])/g, ' $1').trim()}
                  value={gameplan[fieldName as keyof GameplanData] as number}
                  onChange={(e) => onChange(fieldName, parseInt(e.target.value) || 0)}
                  disabled={disabled || gameplan.DefaultOffense}
                  error={getFieldError(validation, fieldName)}
                  size="xs"
                />
              );
            })}
          </div>
        </div>
        <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-2">
          <div className="flex items-center justify-between mb-4">
            <Text variant="h5" classes="text-white font-semibold">
              Option Run
            </Text>
            <Text variant="small" classes={`font-semibold ${getPercentageStatusColor(optionDistTotal)}`}>
              Total: {optionDistTotal}/100
            </Text>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {OptionPlayLabels.map((label) => {
              return (
                <GameplanInputSmall
                  key={label}
                  name={label}
                  label={label.replace(/([A-Z])/g, ' $1').trim()}
                  value={gameplan[label as keyof GameplanData] as number}
                  onChange={(e) => onChange(label, parseInt(e.target.value) || 0)}
                  disabled={disabled || gameplan.DefaultOffense}
                  error={getFieldError(validation, label)}
                  size="xs"
                />
              );
            })}
          </div>
        </div>
        </div>
      )}
      {viewMode === Player && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-2">
          <Text variant="h5" classes="text-white font-semibold mb-4">
            Target Distributions (0-10 weights)
          </Text>
          <div className="space-y-3">
            {TargetingLabels.map((label) => {
              const fieldName = `Targeting${label}`;
              const position = label.slice(0, 2);
              const level = parseInt(label.slice(2)) || 1;
              
              let playerInfo;
              if (depthChart) {
                playerInfo = getDepthChartPlayerInfo(depthChart, position, level, league);
              } else {
                playerInfo = getGameplanPlayerInfo(players, position, level, league);
              }
              
              return (
                <TargetInput
                  key={fieldName}
                  name={fieldName}
                  label={label}
                  value={gameplan[fieldName as keyof GameplanData] as number}
                  onChange={(e) => onChange(fieldName, parseInt(e.target.value) || 0)}
                  playerInfo={playerInfo}
                  targetDepth={gameplan[`TargetDepth${label}` as keyof GameplanData] as string || 'None'}
                  onTargetDepthChange={(depth) => onChange(`TargetDepth${label}`, depth)}
                  targetDepthOptions={TargetDepthOptions}
                  disabled={disabled || gameplan.DefaultOffense}
                  error={getFieldError(validation, fieldName)}
                />
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-2 h-3/4">
            <Text variant="h5" classes="text-white font-semibold mb-4">
              Running Distributions (0-10 weights)
            </Text>
            <div className="space-y-3">
              <RunnerInput
                name="RunnerDistributionQB"
                label="QB"
                value={gameplan.RunnerDistributionQB}
                onChange={(e) => onChange('RunnerDistributionQB', parseInt(e.target.value) || 0)}
                playerInfo={depthChart ? getDepthChartPlayerInfo(depthChart, 'QB', 1, league) : getGameplanPlayerInfo(players, 'QB', 1, league)}
                disabled={disabled || gameplan.DefaultOffense}
                error={getFieldError(validation, 'RunnerDistributionQB')}
              />
              <RunnerInput
                name="RunnerDistributionRB1"
                label="RB1"
                value={gameplan.RunnerDistributionRB1}
                onChange={(e) => onChange('RunnerDistributionRB1', parseInt(e.target.value) || 0)}
                playerInfo={depthChart ? getDepthChartPlayerInfo(depthChart, 'RB', 1, league) : getGameplanPlayerInfo(players, 'RB', 1, league)}
                disabled={disabled || gameplan.DefaultOffense}
                error={getFieldError(validation, 'RunnerDistributionRB1')}
              />
              <RunnerInput
                name="RunnerDistributionRB2"
                label="RB2"
                value={gameplan.RunnerDistributionRB2}
                onChange={(e) => onChange('RunnerDistributionRB2', parseInt(e.target.value) || 0)}
                playerInfo={depthChart ? getDepthChartPlayerInfo(depthChart, 'RB', 2, league) : getGameplanPlayerInfo(players, 'RB', 2, league)}
                disabled={disabled || gameplan.DefaultOffense}
                error={getFieldError(validation, 'RunnerDistributionRB2')}
              />
              <RunnerInput
                name="RunnerDistributionRB3"
                label="RB3"
                value={gameplan.RunnerDistributionRB3}
                onChange={(e) => onChange('RunnerDistributionRB3', parseInt(e.target.value) || 0)}
                playerInfo={depthChart ? getDepthChartPlayerInfo(depthChart, 'RB', 3, league) : getGameplanPlayerInfo(players, 'RB', 3, league)}
                disabled={disabled || gameplan.DefaultOffense}
                error={getFieldError(validation, 'RunnerDistributionRB3')}
              />
              <RunnerInput
                name="RunnerDistributionFB1"
                label="FB1"
                value={gameplan.RunnerDistributionFB1}
                onChange={(e) => onChange('RunnerDistributionFB1', parseInt(e.target.value) || 0)}
                playerInfo={depthChart ? getDepthChartPlayerInfo(depthChart, 'FB', 1, league) : getGameplanPlayerInfo(players, 'FB', 1, league)}
                disabled={disabled || gameplan.DefaultOffense}
                error={getFieldError(validation, 'RunnerDistributionFB1')}
              />
              <RunnerInput
                name="RunnerDistributionFB2"
                label="FB2"
                value={gameplan.RunnerDistributionFB2}
                onChange={(e) => onChange('RunnerDistributionFB2', parseInt(e.target.value) || 0)}
                playerInfo={depthChart ? getDepthChartPlayerInfo(depthChart, 'FB', 2, league) : getGameplanPlayerInfo(players, 'FB', 2, league)}
                disabled={disabled || gameplan.DefaultOffense}
                error={getFieldError(validation, 'RunnerDistributionFB2')}
              />
              <TargetInput
                name="RunnerDistributionWR"
                label={gameplan.RunnerDistributionWRPosition || 'WR1'}
                value={gameplan.RunnerDistributionWR}
                onChange={(e) => onChange('RunnerDistributionWR', parseInt(e.target.value) || 0)}
                playerInfo={(() => {
                  const wrPosition = gameplan.RunnerDistributionWRPosition || 'WR1';
                  const wrLevel = parseInt(wrPosition.slice(2)) || 1;
                  return depthChart 
                    ? getDepthChartPlayerInfo(depthChart, 'WR', wrLevel, league)
                    : getGameplanPlayerInfo(players, 'WR', wrLevel, league);
                })()}
                targetDepth={gameplan.RunnerDistributionWRPosition || 'WR1'}
                onTargetDepthChange={(position) => onChange('RunnerDistributionWRPosition', position)}
                targetDepthOptions={['WR1', 'WR2', 'WR3', 'WR4', 'WR5']}
                disabled={disabled || gameplan.DefaultOffense}
                error={getFieldError(validation, 'RunnerDistributionWR')}
              />
            </div>
          </div>
          <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-4">
            <Text variant="h5" classes="text-white font-semibold mb-4">
              Primary HB Usage
            </Text>
            <GameplanSlider
              name="PrimaryHB"
              label="Primary HB"
              value={gameplan.PrimaryHB}
              onChange={(e) => onChange('PrimaryHB', parseInt(e.target.value) || 0)}
              min={0}
              max={100}
              disabled={disabled || gameplan.DefaultOffense}
              error={getFieldError(validation, 'PrimaryHB')}
              valueLabel={`${gameplan.PrimaryHB}%`}
            />
          </div>
        </div>
      </div>
      )}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={closeInfoModal}
        title="Offensive Distributions Information"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4">
          <Text variant="body" classes="text-gray-300">
            The Offensive Distributions window is where you can configure which types of plays are run, 
            and which player is being distributed or targeted for the ball in both the run and pass game.
          </Text>
          <div className="space-y-3">
            <div>
              <Text variant="body" classes="text-white font-semibold">Target Distribution (Pass Game):</Text>
              <Text variant="small" classes="text-gray-300">
                These are weights between 0 and 10 that determine targeting probability. The heavier the weight, 
                the more likely the player is to be targeted. Formula: Player Weight / Total Weight = Target Percentage.
              </Text>
            </div>
            <div>
              <Text variant="body" classes="text-white font-semibold">Running Distribution (Run Game):</Text>
              <Text variant="small" classes="text-gray-300">
                Weights between 0 and 10 that determine which players carry the ball. Similar calculation as targeting.
              </Text>
            </div>
            <div>
              <Text variant="body" classes="text-white font-semibold">Target Depth Dropdown:</Text>
              <Text variant="small" classes="text-gray-300">
                Controls which type of pass the receiver will most likely run. Options: Quick, Short, Long, or None (no preference).
              </Text>
            </div>
            <div>
              <Text variant="body" classes="text-white font-semibold">Play Type Distributions:</Text>
              <Text variant="small" classes="text-gray-300">
                Run, Option, Pass, and RPO type plays must accumulate to 100 in each category. 
                If you have no weights in Option or RPO plays in your formations, you can leave those distributions as-is.
              </Text>
            </div>
            <div>
              <Text variant="body" classes="text-white font-semibold">Primary HB:</Text>
              <Text variant="small" classes="text-gray-300">
                Slider between 0 and 100 that controls how much time on the field your RB1 will have, in comparison to the second or third string.
              </Text>
            </div>
          </div>
        </div>
      </Modal>
      
      <Modal
        isOpen={passTypeInfoModal !== null}
        onClose={() => setPassTypeInfoModal(null)}
        title={`${passTypeInfoModal} Pass Type Limits`}
        maxWidth="max-w-2xl"
      >
        {passTypeInfoModal && (
          <div className="space-y-4">
            <Text variant="body" classes="text-gray-300">
              Maximum values for {passTypeInfoModal} pass type by offensive scheme:
            </Text>
            <div className="space-y-3">
              {getPassTypeRanges(passTypeInfoModal).map((range, index) => (
                <div key={index} className="bg-gray-800 bg-opacity-50 border border-gray-600 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Text variant="body" classes="text-white font-semibold">
                      {range.scheme}
                    </Text>
                    <Text variant="body" classes="text-green-400 font-bold">
                      Max: {range.max}
                    </Text>
                  </div>
                  {range.note && (
                    <Text variant="small" classes="text-yellow-400 italic">
                      Note: {range.note}
                    </Text>
                  )}
                </div>
              ))}
            </div>
            <Text variant="small" classes="text-gray-400">
              Your current scheme: <span className="text-white font-semibold">{gameplan.OffensiveScheme}</span>
            </Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OffensiveDistributionsPanel;