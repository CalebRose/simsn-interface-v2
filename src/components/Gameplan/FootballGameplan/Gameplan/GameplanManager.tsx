import React, { useState } from "react";
import { Text } from "../../../../_design/Typography";
import { Button } from "../../../../_design/Buttons";
import { Modal } from "../../../../_design/Modal";
import { useModal } from "../../../../_hooks/useModal";
import { GameplanData } from "./GameplanHelper";
import {
  GameplanTab,
  GameplanTabs,
  FormationMap,
  DefensiveSchemeOptions,
  OffensiveSchemeOptions,
} from "../Constants/GameplanConstants";
import {
  OffensiveDistributions,
  OffensiveFormations,
  Defense,
  SpecialTeams,
  ButtonGreen,
} from "../../../../_constants/constants";
import { SchemeDropdown } from "./SchemeDropdown";
import { SchemeInfo } from "./SchemeInfo";
import { GameplanValidationResult } from "./useGameplanValidation";
import {
  FootballPlayer,
  ShieldBash,
  TicTacToe,
  KickBall,
  InformationCircle,
} from "../../../../_design/Icons";

export interface GameplanManagerProps {
  gameplan: GameplanData;
  selectedTab: GameplanTab;
  onTabChange: (tab: GameplanTab) => void;
  validation: GameplanValidationResult;
  onChange: (field: string, value: any) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
  isValid: boolean;
  hasUnsavedChanges: boolean;
  canModify?: boolean;
  className?: string;
  backgroundColor?: string;
  borderColor?: string;
}

export const GameplanManager: React.FC<GameplanManagerProps> = ({
  gameplan,
  selectedTab,
  onTabChange,
  validation,
  onChange,
  onSave,
  onReset,
  isSaving,
  isValid,
  hasUnsavedChanges,
  canModify = true,
  className = "",
  backgroundColor,
  borderColor,
}) => {
  const [selectedScheme, setSelectedScheme] = useState<string>("");
  const {
    isModalOpen: isSchemeModalOpen,
    handleOpenModal: openSchemeModal,
    handleCloseModal: closeSchemeModal,
  } = useModal();
  const {
    isModalOpen: isValidationModalOpen,
    handleOpenModal: openValidationModal,
    handleCloseModal: closeValidationModal,
  } = useModal();

  const handleTabSelect = (tab: GameplanTab) => {
    onTabChange(tab);
  };

  const handleSchemeInfoClick = (
    scheme: string,
    schemeType: "offensive" | "defensive"
  ) => {
    setSelectedScheme(`${schemeType}:${scheme}`);
    openSchemeModal();
  };

  const getTabIcon = (tab: GameplanTab) => {
    switch (tab) {
      case OffensiveFormations:
        return <TicTacToe />;
      case OffensiveDistributions:
        return <FootballPlayer />;
      case Defense:
        return <ShieldBash />;
      case SpecialTeams:
        return <KickBall />;
      default:
        return null;
    }
  };

  const getValidationSummary = () => {
    const errorCount = validation.errors.length;
    const warningCount = validation.warnings.length;

    if (errorCount > 0) {
      return {
        text: `${errorCount} error${errorCount > 1 ? "s" : ""}`,
        color: "text-red-400",
        bgColor: "bg-red-900 bg-opacity-50 border-red-500",
      };
    }

    if (warningCount > 0) {
      return {
        text: `${warningCount} warning${warningCount > 1 ? "s" : ""}`,
        color: "text-yellow-400",
        bgColor: "bg-yellow-900 bg-opacity-50 border-yellow-500",
      };
    }

    return {
      text: "Valid gameplan",
      color: "text-green-400",
      bgColor: "bg-green-900 bg-opacity-50 border-green-500",
    };
  };

  const validationSummary = getValidationSummary();

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex gap-2 justify-center">
        <div className={`border rounded-lg p-4 ${validationSummary.bgColor}`}>
          <div className="flex flex-col items-center justify-between">
            <div>
              <Text
                variant="body"
                classes={`font-semibold ${validationSummary.color}`}
              >
                Gameplan Status
              </Text>
              <Text variant="small" classes={validationSummary.color}>
                {validationSummary.text}
              </Text>
            </div>
            {(validation.errors.length > 0 ||
              validation.warnings.length > 0) && (
              <Button
                variant="secondaryOutline"
                size="xs"
                onClick={openValidationModal}
                className="flex items-center gap-2"
              >
                <InformationCircle />
                Details
              </Button>
            )}
          </div>
        </div>
        {canModify && (
          <div
            className="rounded-lg p-4 border-2"
            style={{ borderColor, backgroundColor }}
          >
            <div className="flex gap-2">
              <Button
                variant={!isValid ? "danger" : "primary"}
                size="md"
                onClick={onSave}
                disabled={!isValid || isSaving || !hasUnsavedChanges}
                className={`w-full ${
                  !isValid || isSaving ? "cursor-not-allowed" : "cursor-pointer"
                } ${
                  !isValid
                    ? "bg-red-900 bg-opacity-50 border-red-500"
                    : "cursor-pointer"
                }`}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>

              <Button
                variant="secondaryOutline"
                size="md"
                onClick={onReset}
                disabled={isSaving || !hasUnsavedChanges}
                className={`w-full ${
                  isSaving || !hasUnsavedChanges
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                Reset
              </Button>
            </div>

            {hasUnsavedChanges && (
              <Text variant="xs" classes="text-yellow-400 mt-2 text-center">
                You have unsaved changes
              </Text>
            )}
          </div>
        )}
      </div>
      <div
        className="rounded-lg py-2 sm:p-2 border-2"
        style={{ borderColor, backgroundColor }}
      >
        <Text variant="h5" classes="text-white font-semibold mb-4">
          Gameplan Sections
        </Text>
        <div className="space-y-2">
          {GameplanTabs.map((tab) => (
            <Button
              key={tab}
              variant="secondaryOutline"
              size="md"
              onClick={() => handleTabSelect(tab)}
              className={`w-[16em] justify-start mx-1 ${
                selectedTab === tab
                  ? "hover:bg-[#189E5B] bg-green-900 text-white border-green-600"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {getTabIcon(tab)}
                <span>{tab}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>
      <div
        className="rounded-lg p-4 border-2"
        style={{ borderColor, backgroundColor }}
      >
        <Text variant="h5" classes="text-white font-semibold mb-4">
          Current Schemes
        </Text>
        <div className="flex items-center px-2 gap-2">
          <div className="bg-gray-700 bg-opacity-50 rounded-lg p-3 w-1/2 h-full">
            <div className="flex items-center justify-between mb-2">
              <Text variant="small" classes="text-blue-400 font-semibold">
                Offensive Scheme
              </Text>
              <Button
                variant="secondaryOutline"
                size="xs"
                onClick={() =>
                  handleSchemeInfoClick(gameplan.OffensiveScheme, "offensive")
                }
                className="p-1 rounded-full"
              >
                <InformationCircle />
              </Button>
            </div>
            <SchemeDropdown
              value={gameplan.OffensiveScheme}
              options={OffensiveSchemeOptions}
              onChange={(value) => onChange("OffensiveScheme", value)}
              disabled={!canModify}
            />
            {FormationMap[gameplan.OffensiveScheme] && (
              <Text variant="xs" classes="text-gray-400 mt-1">
                {OffensiveSchemeOptions.length || 0} formations available
              </Text>
            )}
          </div>
          <div className="bg-gray-700 bg-opacity-50 rounded-lg p-3 w-1/2 h-full">
            <div className="flex items-center justify-between mb-2">
              <Text variant="small" classes="text-red-400 font-semibold">
                Defensive Scheme
              </Text>
              <Button
                variant="secondaryOutline"
                size="xs"
                onClick={() =>
                  handleSchemeInfoClick(gameplan.DefensiveScheme, "defensive")
                }
                className="p-1 rounded-full"
              >
                <InformationCircle />
              </Button>
            </div>
            <SchemeDropdown
              value={gameplan.DefensiveScheme}
              options={DefensiveSchemeOptions}
              onChange={(value) => onChange("DefensiveScheme", value)}
              disabled={!canModify}
            />
            {FormationMap[gameplan.DefensiveScheme] && (
              <Text variant="xs" classes="text-gray-400 mt-1">
                {DefensiveSchemeOptions.length || 0} formations available
              </Text>
            )}
          </div>
        </div>
      </div>
      <Modal
        isOpen={isSchemeModalOpen}
        onClose={closeSchemeModal}
        title="Scheme Information"
        maxWidth="max-w-3xl"
      >
        {selectedScheme && (
          <div className="space-y-4">
            {(() => {
              const [schemeType, schemeName] = selectedScheme.split(":");
              return (
                <div>
                  <Text variant="body" classes="text-gray-300 mb-4">
                    {schemeType === "offensive" ? "Offensive" : "Defensive"}{" "}
                    scheme details and information.
                  </Text>
                  <SchemeInfo
                    scheme={schemeName}
                    showRanges={schemeType === "offensive"}
                  />
                </div>
              );
            })()}
          </div>
        )}
      </Modal>
      <Modal
        isOpen={isValidationModalOpen}
        onClose={closeValidationModal}
        title="Gameplan Validation Details"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          {validation.errors.length > 0 && (
            <div>
              <Text variant="body" classes="text-red-400 font-semibold mb-2">
                Errors ({validation.errors.length}):
              </Text>
              <div className="space-y-2">
                {validation.errors.map((error, index) => (
                  <div
                    key={index}
                    className="bg-red-900 bg-opacity-30 border border-red-500 rounded p-3"
                  >
                    <Text variant="small" classes="text-red-300 font-medium">
                      {error.field}
                    </Text>
                    <Text variant="small" classes="text-red-200">
                      {error.message}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          )}
          {validation.warnings.length > 0 && (
            <div>
              <Text variant="body" classes="text-yellow-400 font-semibold mb-2">
                Warnings ({validation.warnings.length}):
              </Text>
              <div className="space-y-2">
                {validation.warnings.map((warning, index) => (
                  <div
                    key={index}
                    className="bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded p-3"
                  >
                    <Text variant="small" classes="text-yellow-300 font-medium">
                      {warning.field}
                    </Text>
                    <Text variant="small" classes="text-yellow-200">
                      {warning.message}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          )}
          {validation.errors.length === 0 &&
            validation.warnings.length === 0 && (
              <div className="text-center py-8">
                <Text variant="body" classes="text-green-400">
                  No validation issues found. Your gameplan is ready to save!
                </Text>
              </div>
            )}
        </div>
      </Modal>
    </div>
  );
};

export default GameplanManager;
