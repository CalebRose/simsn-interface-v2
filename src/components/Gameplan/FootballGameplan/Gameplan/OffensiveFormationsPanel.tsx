import React from 'react';
import { Text } from '../../../../_design/Typography';
import { Button } from '../../../../_design/Buttons';
import { ToggleSwitch } from '../../../../_design/Inputs';
import { Modal } from '../../../../_design/Modal';
import { useModal } from '../../../../_hooks/useModal';
import { GameplanData } from './GameplanHelper';
import { FormationMap, Formation } from '../Constants/GameplanConstants';
import { GameplanInput, GameplanInputSmall } from './GameplanInput';
import { FormationInfo } from './SchemeInfo';
import { GameplanValidationResult } from './useGameplanValidation';
import { getFieldError, getFieldWarning } from '../Utils/GameplanValidationUtils';
import { getPlayTypeColor, getFormationWeightColor } from '../Utils/ComponentStyleUtils';
import { InformationCircle } from '../../../../_design/Icons';

export interface OffensiveFormationsPanelProps {
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

export const OffensiveFormationsPanel: React.FC<OffensiveFormationsPanelProps> = ({
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
  const { isModalOpen: isFormationModalOpen, handleOpenModal: openFormationModal, handleCloseModal: closeFormationModal } = useModal();
  const [selectedFormation, setSelectedFormation] = React.useState<Formation | null>(null);
  const schemeData = FormationMap[gameplan.OffensiveScheme];
  const formations = schemeData?.Formations || [];
  const { playTypeTotals, formationWeights } = validation;

  const handleFormationInfoClick = (formation: Formation) => {
    setSelectedFormation(formation);
    openFormationModal();
  };

  return (
    <div className={`sm:space-y-6 ${className} p-1 sm:p-4 rounded-lg border-2`} style={{ borderColor, backgroundColor }}>
      <div className="flex justify-center gap-4 border-b" style={{ borderColor: accentColor }}>
        <div className="bg-gray-800 bg-black/50 rounded-lg p-4 w-1/3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
                <Text variant="h5" classes="text-white font-medium">
                  Default Offense
                </Text>
                <ToggleSwitch
                  checked={gameplan.DefaultOffense}
                  onChange={() => onToggle('DefaultOffense')}
                />
              </div>
              <Text variant="small" classes="text-gray-400 mt-1">
                Let the computer choose formations and distributions automatically
              </Text>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 bg-black/50 rounded-lg p-4 w-full">
          <Text variant="h5" classes="text-white font-semibold mb-3">
            Play Type Summary
          </Text>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-700 bg-black/50 border border-gray-600 rounded-lg p-2">
            <div className="text-center">
              <Text variant="small" classes="">
                Traditional Run
              </Text>
              <Text variant="h4" classes={`font-bold ${
                getFieldError(validation, 'traditionalRun') ? 'text-red-400' : getPlayTypeColor('traditionalRun')
              }`}>
                {playTypeTotals.traditionalRun}%
              </Text>
            </div>
            <div className="text-center">
              <Text variant="small" classes="">
                Option Run
              </Text>
              <Text variant="h4" classes={`font-bold ${
                getFieldError(validation, 'optionRun') ? 'text-red-400' : getPlayTypeColor('optionRun')
              }`}>
                {playTypeTotals.optionRun}%
              </Text>
            </div>
            <div className="text-center">
              <Text variant="small" classes="">
                Pass
              </Text>
              <Text variant="h4" classes={`font-bold ${
                getFieldError(validation, 'pass') ? 'text-red-400' : getPlayTypeColor('pass')
              }`}>
                {playTypeTotals.pass}%
              </Text>
            </div>
            <div className="text-center">
              <Text variant="small" classes="">
                RPO
              </Text>
              <Text variant="h4" classes={`font-bold ${
                getFieldError(validation, 'rpo') ? 'text-red-400' : getPlayTypeColor('rpo')
              }`}>
                {playTypeTotals.rpo}%
              </Text>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 bg-black/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <Text variant="h5" classes="text-white font-semibold">
            Formation Weights
          </Text>
          <Text variant="small" classes="text-gray-400">
            Total: {formationWeights.reduce((sum, weight) => sum + weight, 0)}/100
          </Text>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {formations.map((formation, index) => {
            const formationNumber = index + 1;
            const fieldPrefix = `OffForm${formationNumber}`;
            const weight = formationWeights[index];
            
            return (
              <div 
                key={formation.name}
                className="bg-gray-700 bg-black/50 rounded-lg p-1 border border-gray-600"
              >
                <div className="flex items-center justify-between mb-2">
                  <Text variant="small" classes="text-white font-medium px-2">
                    {formation.name}
                  </Text>
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => handleFormationInfoClick(formation)}
                    className="p-1 rounded-full"
                  >
                    <InformationCircle />
                  </Button>
                </div>
                <Text variant="xs" classes="text-gray-400 mb-3">
                  {formation.positions.join(', ')}
                </Text>
                <div className="mb-3 flex w-full items-center gap-1.5 justify-center">
                  <Text variant="small" classes={`min-w-[6em] font-bold`}>
                    Weight:
                  </Text>
                  <Text variant="body-small" classes={`font-bold ${getFormationWeightColor(weight)}`}>
                    {weight}
                  </Text>
                </div>
                <div className="space-y-2 p-2">
                  <GameplanInputSmall
                    name={`${fieldPrefix}TraditionalRun`}
                    label="Traditional Run"
                    value={gameplan[`${fieldPrefix}TraditionalRun` as keyof GameplanData] as number}
                    onChange={(e) => onChange(`${fieldPrefix}TraditionalRun`, parseInt(e.target.value) || 0)}
                    disabled={disabled || gameplan.DefaultOffense}
                    size="xs"
                    max={50}
                  />     
                  <GameplanInputSmall
                    name={`${fieldPrefix}OptionRun`}
                    label="Option Run"
                    value={gameplan[`${fieldPrefix}OptionRun` as keyof GameplanData] as number}
                    onChange={(e) => onChange(`${fieldPrefix}OptionRun`, parseInt(e.target.value) || 0)}
                    disabled={disabled || gameplan.DefaultOffense}
                    size="xs"
                    max={50}
                  />
                  <GameplanInputSmall
                    name={`${fieldPrefix}Pass`}
                    label="Pass"
                    value={gameplan[`${fieldPrefix}Pass` as keyof GameplanData] as number}
                    onChange={(e) => onChange(`${fieldPrefix}Pass`, parseInt(e.target.value) || 0)}
                    disabled={disabled || gameplan.DefaultOffense}
                    size="xs"
                    max={50}
                  />
                  <GameplanInputSmall
                    name={`${fieldPrefix}RPO`}
                    label="RPO"
                    value={gameplan[`${fieldPrefix}RPO` as keyof GameplanData] as number}
                    onChange={(e) => onChange(`${fieldPrefix}RPO`, parseInt(e.target.value) || 0)}
                    disabled={disabled || gameplan.DefaultOffense}
                    size="xs"
                    max={50}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {getFieldError(validation, 'formations') && (
          <div className="mt-4 p-3 bg-red-900 bg-black/50 border border-red-500 rounded-lg">
            <Text variant="small" classes="text-red-400">
              {getFieldError(validation, 'formations')}
            </Text>
          </div>
        )}
      </div>
      <Modal
        isOpen={isFormationModalOpen}
        onClose={closeFormationModal}
        title={selectedFormation ? `${selectedFormation.name} Formation` : "Formation Information"}
        maxWidth="max-w-2xl"
      >
        {selectedFormation && (
          <div className="space-y-4">
            <Text variant="body" classes="text-gray-300">
              Formation personnel and positioning information:
            </Text>
            <div className="bg-gray-800 bg-black/50 rounded-lg p-4">
              <Text variant="body" classes="text-white font-semibold mb-2">
                Personnel:
              </Text>
              <Text variant="small" classes="text-gray-300">
                {selectedFormation.positions.join(', ')}
              </Text>
            </div>
            <Text variant="small" classes="text-yellow-400">
              You can set weights for different play types within this formation. 
              The weight determines how often this formation is used relative to others.
            </Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OffensiveFormationsPanel;