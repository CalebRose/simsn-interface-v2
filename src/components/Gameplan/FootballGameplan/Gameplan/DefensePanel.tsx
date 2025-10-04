import React from "react";
import { Text } from "../../../../_design/Typography";
import { Button } from "../../../../_design/Buttons";
import { ToggleSwitch } from "../../../../_design/Inputs";
import { Modal } from "../../../../_design/Modal";
import { SelectDropdown } from "../../../../_design/Select";
import { useModal } from "../../../../_hooks/useModal";
import { GameplanData, getDefensivePositions } from "./GameplanHelper";
import {
  FormationMap,
  DefensiveSchemeOptions,
  CoverageOptions,
  BlitzAggressivenessOptions,
  FocusPlayOptions,
} from "../Constants/GameplanConstants";
import { GameplanInputSmall } from "./GameplanInput";
import { GameplanSlider, PitchDiveFocusSlider } from "./GameplanSlider";
import {
  SchemeDropdown,
  CoverageDropdown,
  BlitzAggressionDropdown,
  DoubleTeamDropdown,
} from "./SchemeDropdown";
import { OpposingSchemeInfo } from "./SchemeInfo";
import { GameplanValidationResult } from "./useGameplanValidation";
import { parseFocusPlays, stringifyFocusPlays } from "./GameplanHelper";
import {
  getFieldError,
  getFieldWarning,
} from "../Utils/GameplanValidationUtils";
import { createOpponentPlayerOptions } from "../Utils/GameplanPlayerUtils";
import { Player, Formations, Focus } from "../../../../_constants/constants";
import { InformationCircle } from "../../../../_design/Icons";

export interface DefensePanelProps {
  gameplan: GameplanData;
  opponentScheme?: string;
  opponentPlayers?: any[];
  onChange: (field: string, value: any) => void;
  onToggle: (field: string) => void;
  onSliderChange: (field: string, value: number) => void;
  validation: GameplanValidationResult;
  disabled?: boolean;
  className?: string;
  backgroundColor?: string;
  borderColor?: string;
  accentColor?: string;
}

export const DefensePanel: React.FC<DefensePanelProps> = ({
  gameplan,
  opponentScheme = "Power Run",
  opponentPlayers = [],
  onChange,
  onToggle,
  onSliderChange,
  validation,
  disabled = false,
  className = "",
  backgroundColor,
  borderColor,
  accentColor,
}) => {
  const {
    isModalOpen: isFormationModalOpen,
    handleOpenModal: openFormationModal,
    handleCloseModal: closeFormationModal,
  } = useModal();
  const [selectedFormation, setSelectedFormation] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState<any>(Formations);
  const defensiveSchemeData = FormationMap[gameplan.DefensiveScheme];
  const defensiveFormations = defensiveSchemeData?.Formations || [];
  const opposingSchemeData = FormationMap[opponentScheme];
  const opposingFormations = opposingSchemeData?.Formations || [];
  const focusPlays = parseFocusPlays(gameplan.FocusPlays || "");
  const opponentOptions = createOpponentPlayerOptions(opponentPlayers);

  const handleFormationInfoClick = (formationName: string) => {
    setSelectedFormation(formationName);
    openFormationModal();
  };

  const handleFocusPlaysChange = (selectedOptions: any) => {
    const plays = Array.isArray(selectedOptions)
      ? selectedOptions.map((option) => option.value)
      : [];
    onChange("FocusPlays", stringifyFocusPlays(plays));
  };

  const focusPlayOptions = FocusPlayOptions.map((play) => ({
    value: play,
    label: play,
  }));
  const selectedFocusOptions = focusPlays.map((play) => ({
    value: play,
    label: play,
  }));

  const getTabTitle = () => {
    switch (activeTab) {
      case Formations:
        return "Defensive Formations vs Opposing Formations";
      case Player:
        return "Defensive Settings";
      case Focus:
        return "Defense Focus";
      default:
        return "";
    }
  };

  return (
    <div
      className={`sm:space-y-6 ${className} p-1 sm:p-4 rounded-lg border-2`}
      style={{ borderColor, backgroundColor }}
    >
      <div
        className="flex border-b pb-4 pt-2"
        style={{ borderColor: accentColor }}
      >
        <div className="bg-opacity-50 rounded-lg p-3 sm:w-1/3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
                <Text variant="h5" classes="text-white font-medium">
                  Default Defense
                </Text>
                <ToggleSwitch
                  checked={gameplan.DefaultDefense}
                  onChange={() => onToggle("DefaultDefense")}
                />
              </div>
              <Text variant="small" classes="text-gray-400 mt-1">
                Let the computer choose defensive formations and settings
                automatically
              </Text>
            </div>
          </div>
        </div>
        {opponentScheme && (
          <OpposingSchemeInfo opponentScheme={opponentScheme} />
        )}
      </div>
      <div className="rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <Text variant="h5" classes="text-white font-semibold">
            {getTabTitle()}
          </Text>
          <div className="flex flex-col sm:flex-row items-center gap-1">
            <Button
              variant="secondaryOutline"
              size="sm"
              onClick={() => setActiveTab(Formations)}
              className={`px-3 py-1 ${
                activeTab === Formations
                  ? "bg-orange-900 bg-opacity-50 hover:bg-orange-700 text-white border-orange-500"
                  : ""
              }`}
            >
              Formations
            </Button>
            <Button
              variant="secondaryOutline"
              size="sm"
              onClick={() => setActiveTab(Player)}
              className={`px-3 py-1 ${
                activeTab === Player
                  ? "bg-orange-900 bg-opacity-50 hover:bg-orange-700 text-white border-orange-500"
                  : ""
              }`}
            >
              Player
            </Button>
            <Button
              variant="secondaryOutline"
              size="sm"
              onClick={() => setActiveTab(Focus)}
              className={`px-3 py-1 ${
                activeTab === Focus
                  ? "bg-orange-900 bg-opacity-50 hover:bg-orange-700 text-white border-orange-500"
                  : ""
              }`}
            >
              Focus
            </Button>
          </div>
        </div>
        {activeTab === Formations && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {opposingFormations.map((opposingFormation, index) => {
                const formationNumber = index + 1;
                const defFormationField = `DefFormation${formationNumber}`;
                const runToPassField = `DefFormation${formationNumber}RunToPass`;
                const blitzWeightField = `DefFormation${formationNumber}BlitzWeight`;
                const blitzAggressionField = `DefFormation${formationNumber}BlitzAggression`;
                const selectedDefFormation = gameplan[
                  defFormationField as keyof GameplanData
                ] as string;
                const defFormationData = defensiveFormations.find(
                  (df) => df.name === selectedDefFormation
                );

                return (
                  <div
                    key={`${opposingFormation.name}-${index}`}
                    className="bg-gray-700 bg-opacity-50 rounded-lg p-2 border border-gray-600"
                  >
                    <Text
                      variant="small"
                      classes="text-orange-400 font-semibold mb-1"
                    >
                      vs {opposingFormation.name}
                    </Text>
                    <Text variant="xs" classes="text-orange-300 mb-3">
                      {opposingFormation.positions.join(", ")}
                    </Text>

                    <div className="space-y-3">
                      <div>
                        <Text variant="xs" classes="text-gray-300 mb-1">
                          Defensive Formation:
                        </Text>
                        <div className="flex items-center gap-1">
                          <SchemeDropdown
                            value={selectedDefFormation}
                            options={defensiveFormations.map((df) => df.name)}
                            onChange={(value) =>
                              onChange(defFormationField, value)
                            }
                            disabled={disabled || gameplan.DefaultDefense}
                            className="flex-1"
                          />
                          {selectedDefFormation && (
                            <Button
                              variant="secondaryOutline"
                              size="xs"
                              onClick={() =>
                                handleFormationInfoClick(selectedDefFormation)
                              }
                              className="p-1 rounded-full"
                            >
                              <InformationCircle />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div>
                        <div
                          className="border-b pb-2"
                          style={{ borderColor: accentColor }}
                        >
                          <GameplanSlider
                            name={runToPassField}
                            label="Run to Pass"
                            value={
                              gameplan[
                                runToPassField as keyof GameplanData
                              ] as number
                            }
                            onChange={(e) =>
                              onChange(
                                runToPassField,
                                parseInt(e.target.value) || 0
                              )
                            }
                            min={0}
                            max={100}
                            disabled={disabled || gameplan.DefaultDefense}
                            runpass
                          />
                        </div>
                        <GameplanSlider
                          name={blitzWeightField}
                          label="Blitz Weight"
                          value={
                            gameplan[
                              blitzWeightField as keyof GameplanData
                            ] as number
                          }
                          onChange={(e) =>
                            onChange(
                              blitzWeightField,
                              parseInt(e.target.value) || 0
                            )
                          }
                          min={0}
                          max={100}
                          disabled={disabled || gameplan.DefaultDefense}
                          className="pt-2"
                        />
                      </div>
                      <div>
                        <Text variant="xs" classes="text-gray-300 mb-1">
                          Blitz Aggression:
                        </Text>
                        <SchemeDropdown
                          value={
                            gameplan[
                              blitzAggressionField as keyof GameplanData
                            ] as string
                          }
                          options={BlitzAggressivenessOptions}
                          onChange={(value) =>
                            onChange(blitzAggressionField, value)
                          }
                          disabled={disabled || gameplan.DefaultDefense}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {getFieldError(validation, "defense") && (
              <div className="mt-4 p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg">
                <Text variant="small" classes="text-red-400">
                  {getFieldError(validation, "defense")}
                </Text>
              </div>
            )}
          </>
        )}
        {activeTab === Player && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4 bg-gray-700 bg-opacity-50 rounded-lg p-3 border border-gray-600">
              <Text variant="body" classes="text-white font-medium">
                Blitz Options
              </Text>
              <div className="flex items-center justify-between">
                <Text variant="small" classes="text-gray-300">
                  Blitz Safeties
                </Text>
                <ToggleSwitch
                  checked={gameplan.BlitzSafeties}
                  onChange={() => onToggle("BlitzSafeties")}
                />
              </div>
              <div className="flex items-center justify-between">
                <Text variant="small" classes="text-gray-300">
                  Blitz Corners
                </Text>
                <ToggleSwitch
                  checked={gameplan.BlitzCorners}
                  onChange={() => onToggle("BlitzCorners")}
                />
              </div>
            </div>
            <div className="space-y-4 bg-gray-700 bg-opacity-50 rounded-lg p-3 border border-gray-600">
              <Text variant="body" classes="text-white font-medium">
                Coverage Settings
              </Text>
              <CoverageDropdown
                label="Linebacker Coverage"
                value={gameplan.LinebackerCoverage}
                onChange={(value) => onChange("LinebackerCoverage", value)}
                disabled={disabled || gameplan.DefaultDefense}
              />
              <CoverageDropdown
                label="Corners Coverage"
                value={gameplan.CornersCoverage}
                onChange={(value) => onChange("CornersCoverage", value)}
                disabled={disabled || gameplan.DefaultDefense}
              />
              <CoverageDropdown
                label="Safeties Coverage"
                value={gameplan.SafetiesCoverage}
                onChange={(value) => onChange("SafetiesCoverage", value)}
                disabled={disabled || gameplan.DefaultDefense}
              />
            </div>
            <div className="space-y-4 bg-gray-700 bg-opacity-50 rounded-lg p-3 border border-gray-600">
              <Text variant="body" classes="text-white font-medium">
                Special Options
              </Text>
              <div>
                <Text variant="small" classes="text-gray-300 mb-2">
                  Double Team Coverage
                </Text>
                <DoubleTeamDropdown
                  value={gameplan.DoubleTeam?.toString() || "None"}
                  options={opponentOptions}
                  onChange={(value) =>
                    onChange(
                      "DoubleTeam",
                      value.toString() === "-1" ? "None" : value
                    )
                  }
                  disabled={disabled || gameplan.DefaultDefense}
                  placeholder="Select player to double team..."
                />
              </div>
            </div>
          </div>
        )}
        {activeTab === Focus && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-3 border border-gray-600">
              <Text variant="h6" classes="text-white font-semibold mb-4">
                Option Defense Focus
              </Text>
              <PitchDiveFocusSlider
                pitchValue={gameplan.PitchFocus}
                diveValue={gameplan.DiveFocus}
                onPitchChange={(e) =>
                  onSliderChange("PitchFocus", parseInt(e.target.value))
                }
                onDiveChange={(e) =>
                  onSliderChange("DiveFocus", parseInt(e.target.value))
                }
                disabled={disabled || gameplan.DefaultDefense}
              />
            </div>
            <div className="flex flex-col items-center bg-gray-700 bg-opacity-50 rounded-lg p-3 border border-gray-600">
              <Text variant="h6" classes="text-white font-semibold mb-4">
                Focus Plays (Select up to 3)
              </Text>
              <SelectDropdown
                isMulti
                options={focusPlayOptions}
                value={selectedFocusOptions}
                onChange={handleFocusPlaysChange}
                placeholder="Select focus plays..."
                isDisabled={disabled}
                className="z-10"
              />
              {focusPlays.length > 0 && (
                <div className="mt-3">
                  <Text variant="small" classes="text-blue-400 mb-2">
                    Selected Focus Plays:
                  </Text>
                  <Text variant="small" classes="text-gray-300">
                    {focusPlays.join(", ")}
                  </Text>
                </div>
              )}
              {getFieldError(validation, "focusPlays") && (
                <div className="mt-3 p-2 bg-red-900 bg-opacity-50 border border-red-500 rounded">
                  <Text variant="small" classes="text-red-400">
                    {getFieldError(validation, "focusPlays")}
                  </Text>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Modal
        isOpen={isFormationModalOpen}
        onClose={closeFormationModal}
        title={`${selectedFormation} Formation`}
        maxWidth="max-w-2xl"
      >
        {selectedFormation && (
          <div className="space-y-4">
            {(() => {
              const formationData = defensiveFormations.find(
                (df) => df.name === selectedFormation
              );
              if (!formationData) return null;

              return (
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                  <Text variant="body" classes="text-white font-semibold mb-2">
                    Personnel Formation:
                  </Text>
                  <div className="text-center space-y-2">
                    {getDefensivePositions(formationData.positions).map(
                      (line, index) => (
                        <div key={index}>
                          {typeof line === "string" ? (
                            <Text variant="small" classes="text-gray-300">
                              {line}
                            </Text>
                          ) : (
                            line
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DefensePanel;
