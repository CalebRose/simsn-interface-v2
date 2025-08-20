import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  CollegePlayer,
  NFLPlayer,
  CollegeTeamDepthChart,
  NFLDepthChart,
} from "../../../../models/footballModels";
import { SimCFB, SimNFL } from "../../../../_constants/constants";
import { Text } from "../../../../_design/Typography";
import { SelectDropdown } from "../../../../_design/Select";
import { SelectOption } from "../../../../_hooks/useSelectStyles";
import { useSimFBAStore } from "../../../../context/SimFBAContext";
import { useAuthStore } from "../../../../context/AuthContext";
import { Button } from "../../../../_design/Buttons";
import { SingleValue } from "react-select";
import { GameplanData } from "./GameplanHelper";
import { GameplanTab, GameplanTabs } from "../Constants/GameplanConstants";
import { useGameplanValidation } from "./useGameplanValidation";
import OffensiveFormationsPanel from "./OffensiveFormationsPanel";
import OffensiveDistributionsPanel from "./OffensiveDistributionsPanel";
import DefensePanel from "./DefensePanel";
import SpecialTeamsPanel from "./SpecialTeamsPanel";
import GameplanManager from "./GameplanManager";
import ValidationToast from "../Common/ValidationToast";
import {
  OffensiveFormations,
  OffensiveDistributions,
  Defense,
  SpecialTeams,
} from "../../../../_constants/constants";

export interface GameplanViewProps {
  gameplan: any;
  players: (CollegePlayer | NFLPlayer)[];
  depthChart?: CollegeTeamDepthChart | NFLDepthChart | null;
  team: any;
  league: typeof SimCFB | typeof SimNFL;
  opponentTeam?: any;
  onGameplanUpdate: (updatedGameplan: GameplanData) => void;
  onTeamChange?: (team: any) => void;
  canModify?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  accentColor?: string;
  borderTextColor?: string;
  backgroundTextColor?: string;
  onHasUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void;
}

const GameplanView: React.FC<GameplanViewProps> = ({
  gameplan,
  players,
  depthChart,
  team,
  league,
  opponentTeam,
  onGameplanUpdate,
  onTeamChange,
  canModify = true,
  backgroundColor,
  borderColor,
  accentColor,
  borderTextColor,
  backgroundTextColor,
  onHasUnsavedChangesChange,
}) => {
  const [localGameplan, setLocalGameplan] = useState<GameplanData>(gameplan);
  const [selectedTab, setSelectedTab] =
    useState<GameplanTab>(OffensiveFormations);
  const [isSaving, setIsSaving] = useState(false);
  const {
    cfbTeamOptions,
    nflTeamOptions,
    cfbTeamMap,
    proTeamMap,
    saveCFBGameplan,
    saveNFLGameplan,
  } = useSimFBAStore();
  const { currentUser } = useAuthStore();
  const validation = useGameplanValidation({
    gameplan: localGameplan,
    league,
    canModify,
  });

  const teamOptions = league === SimCFB ? cfbTeamOptions : nflTeamOptions;
  const handleTeamSelection = useCallback(
    (selectedOption: SingleValue<SelectOption>) => {
      if (!selectedOption || !onTeamChange) return;
      const teamId = Number(selectedOption.value);
      const teamMap = league === SimCFB ? cfbTeamMap : proTeamMap;
      const selectedTeam = teamMap?.[teamId];

      if (selectedTeam) {
        onTeamChange(selectedTeam);
      }
    },
    [league, cfbTeamMap, proTeamMap, onTeamChange]
  );

  const handleGameplanChange = useCallback((field: string, value: any) => {
    setLocalGameplan((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleToggleChange = useCallback((field: string) => {
    setLocalGameplan((prev) => ({
      ...prev,
      [field]: !prev[field as keyof GameplanData],
    }));
  }, []);

  const handleSliderChange = useCallback((field: string, value: number) => {
    setLocalGameplan((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleTabChange = useCallback((tab: GameplanTab) => {
    setSelectedTab(tab);
  }, []);

  const handleSaveGameplan = useCallback(async () => {
    if (
      !validation.isValid ||
      !canModify ||
      isSaving ||
      !localGameplan ||
      !currentUser
    ) {
      return;
    }

    setIsSaving(true);
    try {
      let result;
      let dto = {
        GameplanID: team.ID.toString(),
        UpdatedGameplan: {},
        UpdatedNFLGameplan: {},
        Username: currentUser.username,
        TeamName: team.TeamName || "",
      };

      if (league === SimCFB) {
        dto.UpdatedGameplan = localGameplan;
        result = await saveCFBGameplan(dto, { ...gameplan, ...localGameplan });
      } else {
        dto.UpdatedNFLGameplan = localGameplan;
        result = await saveNFLGameplan(dto, { ...gameplan, ...localGameplan });
      }

      if (result && result.success) {
        onGameplanUpdate(localGameplan);
        console.log("Gameplan saved successfully");
      } else {
        console.error("Failed to save gameplan:", result?.error);
      }
    } catch (error) {
      console.error("Error saving gameplan:", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    validation.isValid,
    canModify,
    isSaving,
    localGameplan,
    league,
    saveCFBGameplan,
    saveNFLGameplan,
    onGameplanUpdate,
    currentUser,
    team,
  ]);

  const handleResetGameplan = useCallback(() => {
    setLocalGameplan(gameplan);
  }, [gameplan]);

  const hasUnsavedChanges = useMemo(() => {
    if (!localGameplan || !gameplan) return false;

    const keys = Object.keys(localGameplan) as (keyof GameplanData)[];
    return keys.some((key) => localGameplan[key] !== gameplan[key]);
  }, [localGameplan, gameplan]);

  useEffect(() => {
    if (onHasUnsavedChangesChange) {
      onHasUnsavedChangesChange(hasUnsavedChanges);
    }
  }, [hasUnsavedChanges, onHasUnsavedChangesChange]);

  const opponentScheme = opponentTeam?.OffensiveScheme || "Power Run";
  const opponentPlayers = opponentTeam?.Players || [];

  const renderActivePanel = () => {
    const panelProps = {
      gameplan: localGameplan,
      onChange: handleGameplanChange,
      onToggle: handleToggleChange,
      validation,
      disabled: !canModify,
      className: "h-full",
      borderColor: borderColor,
      backgroundColor: backgroundColor,
      accentColor: accentColor,
    };

    switch (selectedTab) {
      case OffensiveFormations:
        return <OffensiveFormationsPanel {...panelProps} />;
      case OffensiveDistributions:
        return (
          <OffensiveDistributionsPanel
            {...panelProps}
            players={players}
            depthChart={depthChart}
            league={league}
          />
        );
      case Defense:
        return (
          <DefensePanel
            {...panelProps}
            opponentScheme={opponentScheme}
            opponentPlayers={opponentPlayers}
            onSliderChange={handleSliderChange}
          />
        );
      case SpecialTeams:
        return <SpecialTeamsPanel {...panelProps} />;

      default:
        return <OffensiveFormationsPanel {...panelProps} />;
    }
  };

  return (
    <div className="w-full space-y-8">
      <ValidationToast
        errors={validation.errors}
        warnings={validation.warnings}
        isValid={validation.isValid}
        contextName="Gameplan"
      />
      <div className="xl:grid flex flex-col-reverse xl:grid-cols-3 gap-8">
        <div className="relative col-span-2">
          <div className="text-center pb-4">
            <Text variant="h3" classes="text-white font-bold">
              {selectedTab}
            </Text>
            <Text variant="body" classes="text-gray-400 mt-2">
              Configure your {selectedTab.toLowerCase()} settings
            </Text>
          </div>
          <div className="bg-opacity-50 rounded-lg min-h-[600px]">
            {renderActivePanel()}
          </div>
          <div className="mt-4 text-center">
            <Text variant="small" classes="text-gray-400">
              {hasUnsavedChanges
                ? "Unsaved changes detected"
                : "All changes saved"}
            </Text>
          </div>
        </div>
        <div className="relative">
          <div className="text-center pb-4">
            <Text variant="h3" classes="text-white font-bold">
              Gameplan Management
            </Text>
            <Text variant="body" classes="text-gray-400 mt-2">
              Navigate sections and save changes
            </Text>
          </div>
          <div className="rounded-lg">
            <GameplanManager
              gameplan={localGameplan}
              selectedTab={selectedTab}
              onTabChange={handleTabChange}
              validation={validation}
              onChange={handleGameplanChange}
              onSave={handleSaveGameplan}
              onReset={handleResetGameplan}
              isSaving={isSaving}
              isValid={validation.isValid}
              hasUnsavedChanges={hasUnsavedChanges}
              canModify={canModify}
              backgroundColor={backgroundColor}
              borderColor={borderColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameplanView;
