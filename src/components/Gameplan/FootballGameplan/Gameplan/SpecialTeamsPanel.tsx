import React from "react";
import { Text } from "../../../../_design/Typography";
import { Button } from "../../../../_design/Buttons";
import { ToggleSwitch } from "../../../../_design/Inputs";
import { Modal } from "../../../../_design/Modal";
import { useModal } from "../../../../_hooks/useModal";
import { GameplanData } from "./GameplanHelper";
import {
  SpecialTeamsOptions,
  SpecialTeamsLabels,
  PaceOptions,
  FourthDownAggressivenessOptions,
  TwoPointAggressivenessOptions,
  SituationalPlayCallingOptions,
} from "../Constants/GameplanConstants";
import { GameplanInput } from "./GameplanInput";
import { GameplanValidationResult } from "./useGameplanValidation";
import {
  getFieldError,
  getFieldWarning,
} from "../Utils/GameplanValidationUtils";
import {
  getAggressionLevelColor,
  getAggressionLevelText,
} from "../Utils/ComponentStyleUtils";
import { InformationCircle } from "../../../../_design/Icons";
import Slider from "../../../Common/Slider";
import { SchemeDropdown } from "./SchemeDropdown";

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
  className = "",
  backgroundColor,
  borderColor,
  accentColor,
}) => {
  const {
    isModalOpen: isInfoModalOpen,
    handleOpenModal: openInfoModal,
    handleCloseModal: closeInfoModal,
  } = useModal();

  const currentPace = gameplan.Pace || "Standard";
  const current4thAggression = gameplan.AggressiveFourthDown || "Standard";
  const current2PtAggression = gameplan.AggressiveTwoPoint || "Standard";

  const current3rdShortPlay = gameplan.PlayCalling3rdShort || "Default";
  const current3rdLongPlay = gameplan.PlayCalling3rdLong || "Default";
  const current4thShortPlay = gameplan.PlayCalling4thShort || "Default";
  const current4thLongPlay = gameplan.PlayCalling4thLong || "Default";

  const getPaceBadgeColor = (pace: string) => {
    switch (pace) {
      case "Slow":
        return "text-yellow-400 bg-yellow-900/40 border-yellow-500/50";
      case "Fast":
        return "text-emerald-400 bg-emerald-900/40 border-emerald-500/50";
      default:
        return "text-blue-400 bg-blue-900/40 border-blue-500/50";
    }
  };

  const getPaceDescription = (pace: string) => {
    switch (pace) {
      case "Slow":
        return "Slow / Chew Clock: Chews 35-40s per play. Shrinks total possessions, protects leads, and leans on the running game.";
      case "Fast":
        return "Fast / Up-Tempo: Quick snaps in 25-30s per play. Maximizes play volume and possessions for high-powered offenses.";
      default:
        return "Standard / Balanced: Balanced 30-35s pace per play. Traditional huddle rhythm recommended for balanced offenses.";
    }
  };

  const getFourthDownBadgeColor = (agg: string) => {
    switch (agg) {
      case "Conservative":
        return "text-blue-400 bg-blue-900/40 border-blue-500/50";
      case "Aggressive":
        return "text-red-400 bg-red-900/40 border-red-500/50";
      default:
        return "text-amber-400 bg-amber-900/40 border-amber-500/50";
    }
  };

  const getFourthDownTriggerZones = (agg: string) => {
    switch (agg) {
      case "Conservative":
        return {
          goalLine: "Always kick FG inside opponent 5",
          shortZone: "Active inside Opponent 40 only",
          longZone: "Active inside Opponent 40 only",
        };
      case "Aggressive":
        return {
          goalLine: "Always go for TD inside opponent 5 (distance ≤ 2)",
          shortZone: "Active across Own 40-yard line & up",
          longZone: "Active across Midfield 50 & up",
        };
      default:
        return {
          goalLine: "Situational TD attempts inside opponent 5",
          shortZone: "Active across Midfield 50 & up",
          longZone: "Active inside Opponent 40 only",
        };
    }
  };

  const getTwoPointBadgeColor = (agg: string) => {
    switch (agg) {
      case "Conservative":
        return "text-blue-400 bg-blue-900/40 border-blue-500/50";
      case "Aggressive":
        return "text-red-400 bg-red-900/40 border-red-500/50";
      default:
        return "text-amber-400 bg-amber-900/40 border-amber-500/50";
    }
  };

  const getTwoPointDescription = (agg: string) => {
    switch (agg) {
      case "Conservative":
        return "Conservative: Almost always kicks the extra point. Only attempts 2-point conversions when trailing by 2 in the 4th quarter or forced in NCAA OT.";
      case "Aggressive":
        return "Aggressive: Proactively attempts 2-point conversions across multiple deficit and lead margins in the 2nd half to maximize point differential.";
      default:
        return "Standard: Follows modern analytics chart (goes for 2 when trailing by 2, 5, 8, 10, 15 or leading by 1, 4, 5, 12 in 2nd half/4th quarter).";
    }
  };

  const getPlayCallBadgeColor = (play: string) => {
    switch (play) {
      case "Traditional Run":
        return "text-amber-400 bg-amber-900/40 border-amber-500/50";
      case "Option Run":
        return "text-orange-400 bg-orange-900/40 border-orange-500/50";
      case "Pass":
        return "text-cyan-400 bg-cyan-900/40 border-cyan-500/50";
      case "RPO":
        return "text-purple-400 bg-purple-900/40 border-purple-500/50";
      default:
        return "text-gray-300 bg-gray-700/50 border-gray-600";
    }
  };

  const fourthDownZones = getFourthDownTriggerZones(current4thAggression);

  return (
    <div
      className={`border-2 rounded-lg p-4 space-y-6 ${className}`}
      style={{ backgroundColor, borderColor }}
    >
      {/* Header and Field Goal Controls */}
      <div
        className="flex flex-col md:flex-row gap-4 items-center justify-between border-b pb-4"
        style={{ borderColor: accentColor }}
      >
        <div className="rounded-lg px-4 pb-2 sm:p-4 w-full md:w-1/2">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex flex-col sm:flex-row justify-start gap-4 items-center">
                <Text variant="h5" classes="text-white font-medium">
                  Default Special Teams
                </Text>
                <ToggleSwitch
                  checked={gameplan.DefaultSpecialTeams}
                  onChange={() => onToggle("DefaultSpecialTeams")}
                />
              </div>
              <Text variant="small" classes="text-gray-400 mt-1">
                Let the computer make special teams and pace decisions automatically
              </Text>
            </div>
          </div>
        </div>
        <div className="rounded-lg p-4 pt-0 w-full md:w-1/2 flex flex-col items-center">
          <Text variant="h5" classes="text-white font-semibold mb-1">
            Field Goal Settings
          </Text>
          <div className="w-full max-w-md">
            <GameplanInput
              name="MaximumFGDistance"
              label={SpecialTeamsLabels.MaximumFGDistance}
              value={gameplan.MaximumFGDistance}
              onChange={(e) =>
                onChange("MaximumFGDistance", parseInt(e.target.value) || 0)
              }
              disabled={disabled || gameplan.DefaultSpecialTeams}
              min={SpecialTeamsOptions.MaxFieldGoalDistance.Min}
              max={SpecialTeamsOptions.MaxFieldGoalDistance.Max}
              error={getFieldError(validation, "MaximumFGDistance")}
              warning={getFieldWarning(validation, "MaximumFGDistance")}
            />
          </div>
        </div>
        <Button
          variant="secondaryOutline"
          size="sm"
          onClick={openInfoModal}
          className="flex items-center gap-2 p-2 rounded-full self-end md:self-center"
          title="Special Teams & Pace Information"
        >
          <InformationCircle />
        </Button>
      </div>

      {/* Game Pace / Tempo Section */}
      <div className="bg-gray-800 bg-black/50 rounded-lg p-4 border border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <Text variant="h5" classes="text-white font-semibold">
              Game Pace & Tempo
            </Text>
            <Text variant="small" classes="text-gray-400">
              Dictates how much clock runs off before snaps throughout normal gameplay
            </Text>
          </div>
          <span
            className={`mt-2 sm:mt-0 px-3 py-1 text-xs font-semibold rounded-full border ${getPaceBadgeColor(
              currentPace
            )}`}
          >
            {currentPace} Tempo
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="col-span-1">
            <Text variant="small" classes="text-gray-300 font-medium mb-2">
              Select Tempo:
            </Text>
            <SchemeDropdown
              value={currentPace}
              options={PaceOptions}
              onChange={(val) => onChange("Pace", val)}
              disabled={disabled || gameplan.DefaultSpecialTeams}
            />
          </div>
          <div className="col-span-1 lg:col-span-2 bg-gray-700 bg-black/40 p-3 rounded-lg border border-gray-600/50">
            <Text variant="small" classes="text-gray-200">
              {getPaceDescription(currentPace)}
            </Text>
            <div className="mt-2 pt-2 border-t border-gray-600/40 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <Text variant="xs" classes="text-gray-400">
                Note: Engine automatic clock management switches to Hurry-Up drill in the final 3 minutes (or 6 minutes if trailing by 2+ scores).
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Unified 4th Down Decision-Making & Strategy Section */}
      <div className="bg-gray-800 bg-black/50 rounded-lg p-4 border border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <Text variant="h5" classes="text-white font-semibold">
              4th Down Decision-Making & Strategy
            </Text>
            <Text variant="small" classes="text-gray-400">
              Cohesive 4th-down system: Aggressiveness sets field position trigger zones; sliders set conversion frequency within them.
            </Text>
          </div>
          <span
            className={`mt-2 sm:mt-0 px-3 py-1 text-xs font-semibold rounded-full border ${getFourthDownBadgeColor(
              current4thAggression
            )}`}
          >
            {current4thAggression} Philosophy
          </span>
        </div>

        {/* 4th Down Aggressiveness Level & Trigger Zone Mapping */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center bg-gray-900/60 p-4 rounded-lg border border-gray-700/80">
          <div className="col-span-1">
            <Text variant="small" classes="text-gray-300 font-medium mb-2">
              4th Down Aggressiveness Level:
            </Text>
            <SchemeDropdown
              value={current4thAggression}
              options={FourthDownAggressivenessOptions}
              onChange={(val) => onChange("AggressiveFourthDown", val)}
              disabled={disabled || gameplan.DefaultSpecialTeams}
            />
            <Text variant="xs" classes="text-gray-400 mt-2">
              Determines the field-position trigger zones where your coach considers going for it.
            </Text>
          </div>
          <div className="col-span-1 lg:col-span-2 space-y-2">
            <Text variant="xs" classes="text-blue-400 font-semibold uppercase tracking-wider">
              Active Trigger Boundaries & Goal-Line Rule:
            </Text>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gray-800/80 p-2.5 rounded border border-gray-700 text-center">
                <Text variant="xs" classes="text-gray-400">Goal-Line (Inside 5)</Text>
                <Text variant="small" classes="text-gray-200 font-semibold mt-1">
                  {fourthDownZones.goalLine}
                </Text>
              </div>
              <div className="bg-gray-800/80 p-2.5 rounded border border-gray-700 text-center">
                <Text variant="xs" classes="text-gray-400">4th & Short Trigger Zone</Text>
                <Text variant="small" classes="text-gray-200 font-semibold mt-1">
                  {fourthDownZones.shortZone}
                </Text>
              </div>
              <div className="bg-gray-800/80 p-2.5 rounded border border-gray-700 text-center">
                <Text variant="xs" classes="text-gray-400">4th & Long Trigger Zone</Text>
                <Text variant="small" classes="text-gray-200 font-semibold mt-1">
                  {fourthDownZones.longZone}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Sliders and Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 space-y-4">
            <div className="space-y-1">
              <Slider
                name="GoFor4AndShort"
                label={SpecialTeamsLabels.GoFor4AndShort}
                value={gameplan.GoFor4AndShort}
                onChange={(e) =>
                  onChange("GoFor4AndShort", parseInt(e.target.value) || 0)
                }
                min={SpecialTeamsOptions.GoFor4AndShort.Min}
                max={SpecialTeamsOptions.GoFor4AndShort.Max}
                error={getFieldError(validation, "GoFor4AndShort")}
                warning={getFieldWarning(validation, "GoFor4AndShort")}
                disabled={disabled || gameplan.DefaultSpecialTeams}
              />
              <Text variant="xs" classes="text-gray-400 pl-1">
                Rolled when in: <span className="text-gray-300 font-medium">{fourthDownZones.shortZone}</span>
              </Text>
            </div>

            <div className="space-y-1">
              <Slider
                name="GoFor4AndLong"
                label={SpecialTeamsLabels.GoFor4AndLong}
                value={gameplan.GoFor4AndLong}
                onChange={(e) =>
                  onChange("GoFor4AndLong", parseInt(e.target.value) || 0)
                }
                min={SpecialTeamsOptions.GoFor4AndLong.Min}
                max={SpecialTeamsOptions.GoFor4AndLong.Max}
                error={getFieldError(validation, "GoFor4AndLong")}
                warning={getFieldWarning(validation, "GoFor4AndLong")}
                disabled={disabled || gameplan.DefaultSpecialTeams}
              />
              <Text variant="xs" classes="text-gray-400 pl-1">
                Rolled when in: <span className="text-gray-300 font-medium">{fourthDownZones.longZone}</span>
              </Text>
            </div>
          </div>

          <div className="p-4 bg-gray-700 bg-black/50 rounded-lg col-span-1 lg:col-span-2 flex flex-col justify-center">
            <Text variant="small" classes="text-blue-400 font-semibold mb-3">
              Cohesive 4th Down Strategy Summary:
            </Text>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-3 rounded bg-gray-800/80 border border-gray-700">
                <Text variant="xs" classes="text-gray-300">
                  4th & Short (1-3 yds)
                </Text>
                <Text
                  variant="h5"
                  classes={`font-bold ${getAggressionLevelColor(
                    gameplan.GoFor4AndShort,
                    "short"
                  )}`}
                >
                  {gameplan.GoFor4AndShort}%
                </Text>
                <Text variant="xs" classes="text-gray-400">
                  {getAggressionLevelText(gameplan.GoFor4AndShort, "short")}
                </Text>
              </div>
              <div className="text-center p-3 rounded bg-gray-800/80 border border-gray-700">
                <Text variant="xs" classes="text-gray-300">
                  4th & Long (4+ yds)
                </Text>
                <Text
                  variant="h5"
                  classes={`font-bold ${getAggressionLevelColor(
                    gameplan.GoFor4AndLong,
                    "long"
                  )}`}
                >
                  {gameplan.GoFor4AndLong}%
                </Text>
                <Text variant="xs" classes="text-gray-400">
                  {getAggressionLevelText(gameplan.GoFor4AndLong, "long")}
                </Text>
              </div>
              <div className="text-center p-3 rounded bg-gray-800/80 border border-gray-700">
                <Text variant="xs" classes="text-gray-300">
                  Trigger Boundary
                </Text>
                <Text
                  variant="h5"
                  classes={`font-bold ${
                    current4thAggression === "Aggressive"
                      ? "text-red-400"
                      : current4thAggression === "Conservative"
                      ? "text-blue-400"
                      : "text-amber-400"
                  }`}
                >
                  {current4thAggression}
                </Text>
                <Text variant="xs" classes="text-gray-400">
                  Own 40 / Midfield / Opp 40
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Situational Down Playcalling (3rd & 4th Down Play Type Overrides) */}
      <div className="bg-gray-800 bg-black/50 rounded-lg p-4 border border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <Text variant="h5" classes="text-white font-semibold">
              Situational Down Playcalling (3rd & 4th Down)
            </Text>
            <Text variant="small" classes="text-gray-400">
              Override the offense's natural scheme weights to enforce specific play types in clutch late-down situations
            </Text>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* 3rd & Short */}
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <Text variant="small" classes="text-white font-semibold">
                3rd & Short (≤ 3 yds)
              </Text>
              <span className={`px-2 py-0.5 text-xs rounded border ${getPlayCallBadgeColor(current3rdShortPlay)}`}>
                {current3rdShortPlay}
              </span>
            </div>
            <SchemeDropdown
              value={current3rdShortPlay}
              options={SituationalPlayCallingOptions}
              onChange={(val) => onChange("PlayCalling3rdShort", val)}
              disabled={disabled || gameplan.DefaultSpecialTeams}
            />
          </div>

          {/* 3rd & Long */}
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <Text variant="small" classes="text-white font-semibold">
                {"3rd & Long (> 3 yds)"}
              </Text>
              <span className={`px-2 py-0.5 text-xs rounded border ${getPlayCallBadgeColor(current3rdLongPlay)}`}>
                {current3rdLongPlay}
              </span>
            </div>
            <SchemeDropdown
              value={current3rdLongPlay}
              options={SituationalPlayCallingOptions}
              onChange={(val) => onChange("PlayCalling3rdLong", val)}
              disabled={disabled || gameplan.DefaultSpecialTeams}
            />
          </div>

          {/* 4th & Short */}
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <Text variant="small" classes="text-white font-semibold">
                4th & Short (≤ 3 yds)
              </Text>
              <span className={`px-2 py-0.5 text-xs rounded border ${getPlayCallBadgeColor(current4thShortPlay)}`}>
                {current4thShortPlay}
              </span>
            </div>
            <SchemeDropdown
              value={current4thShortPlay}
              options={SituationalPlayCallingOptions}
              onChange={(val) => onChange("PlayCalling4thShort", val)}
              disabled={disabled || gameplan.DefaultSpecialTeams}
            />
          </div>

          {/* 4th & Long */}
          <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <Text variant="small" classes="text-white font-semibold">
                {"4th & Long (> 3 yds)"}
              </Text>
              <span className={`px-2 py-0.5 text-xs rounded border ${getPlayCallBadgeColor(current4thLongPlay)}`}>
                {current4thLongPlay}
              </span>
            </div>
            <SchemeDropdown
              value={current4thLongPlay}
              options={SituationalPlayCallingOptions}
              onChange={(val) => onChange("PlayCalling4thLong", val)}
              disabled={disabled || gameplan.DefaultSpecialTeams}
            />
          </div>
        </div>

        <div className="p-3 bg-gray-700 bg-black/40 rounded-lg border border-gray-600/50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <Text variant="xs" classes="text-gray-300">
            Setting to <strong>Default</strong> allows your offensive scheme's situational formulas to dynamically select between Run, Pass, Option, or RPO. Specifying a type guarantees that play call category whenever the conversion is attempted.
          </Text>
        </div>
      </div>

      {/* PAT & 2-Point Conversion Strategy Section */}
      <div className="bg-gray-800 bg-black/50 rounded-lg p-4 border border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <Text variant="h5" classes="text-white font-semibold">
              PAT & 2-Point Conversion Strategy
            </Text>
            <Text variant="small" classes="text-gray-400">
              Governs when the offense will attempt a 2-point conversion vs kicking the extra point after a touchdown
            </Text>
          </div>
          <span
            className={`mt-2 sm:mt-0 px-3 py-1 text-xs font-semibold rounded-full border ${getTwoPointBadgeColor(
              current2PtAggression
            )}`}
          >
            {current2PtAggression} Conversions
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="col-span-1">
            <Text variant="small" classes="text-gray-300 font-medium mb-2">
              Conversion Aggressiveness:
            </Text>
            <SchemeDropdown
              value={current2PtAggression}
              options={TwoPointAggressivenessOptions}
              onChange={(val) => onChange("AggressiveTwoPoint", val)}
              disabled={disabled || gameplan.DefaultSpecialTeams}
            />
          </div>
          <div className="col-span-1 lg:col-span-2 bg-gray-700 bg-black/40 p-3 rounded-lg border border-gray-600/50">
            <Text variant="small" classes="text-gray-200">
              {getTwoPointDescription(current2PtAggression)}
            </Text>
            <div className="mt-2 pt-2 border-t border-gray-600/40">
              <Text variant="xs" classes="text-gray-400">
                Note: In NCAA 3rd overtime and beyond, 2-point conversion tries are mandatory for all teams.
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Validation feedback */}
      {(getFieldError(validation, "specialTeams") ||
        getFieldWarning(validation, "specialTeams")) && (
        <div
          className={`p-3 rounded-lg border ${
            getFieldError(validation, "specialTeams")
              ? "bg-red-900 bg-black/50 border-red-500"
              : "bg-yellow-900 bg-black/50 border-yellow-500"
          }`}
        >
          <Text
            variant="small"
            classes={
              getFieldError(validation, "specialTeams")
                ? "text-red-400"
                : "text-yellow-400"
            }
          >
            {getFieldError(validation, "specialTeams") ||
              getFieldWarning(validation, "specialTeams")}
          </Text>
        </div>
      )}

      {/* Information Modal */}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={closeInfoModal}
        title="Special Teams, Pace & Situational Down Strategy"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          <Text variant="body" classes="text-gray-300">
            Special Teams, Pace, and Late-Down settings control your team's tactical philosophy on clock management, field position, 4th down attempts, situational playcalling, and point-after decisions.
          </Text>
          <div className="space-y-4">
            <div className="border-b border-gray-700 pb-3">
              <Text variant="body" classes="text-white font-semibold mb-1">
                Game Pace & Tempo:
              </Text>
              <Text variant="small" classes="text-gray-300">
                Pace determines how many seconds tick off the game clock before each snap:
              </Text>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-gray-300">
                <li>
                  <strong className="text-yellow-400">Slow (Chew Clock):</strong> Consumes 35s on sacks/runs (40s in NFL inbounds). Best for ball-control schemes, bleeding late leads, and keeping opponents off the field.
                </li>
                <li>
                  <strong className="text-blue-400">Standard (Balanced):</strong> Standard 30s runoff (35s NFL inbounds). Default setting providing balanced play volume and time of possession.
                </li>
                <li>
                  <strong className="text-emerald-400">Fast (Up-Tempo):</strong> Quick snaps in 25s (30s NFL inbounds). Great for high-tempo passing offenses seeking maximum plays per game.
                </li>
              </ul>
            </div>

            <div className="border-b border-gray-700 pb-3">
              <Text variant="body" classes="text-white font-semibold mb-1">
                4th Down Decision-Making (Tiers & Probability Dials):
              </Text>
              <Text variant="small" classes="text-gray-300">
                The 4th down system pairs an <strong>Aggressiveness Level</strong> (which sets field position boundaries and goal-line behavior) with <strong>Go-For-It Probability Dials</strong> (which set the conversion chance within those boundaries):
              </Text>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-gray-300">
                <li>
                  <strong className="text-blue-400">Conservative:</strong> Punts until Opponent 40-yard line; strictly kicks field goals inside the 5-yard line.
                </li>
                <li>
                  <strong className="text-amber-400">Standard:</strong> Starts 4th & Short rolls at Midfield (50); rolls 4th & Long inside Opponent 40; attempts goal-line TDs when leading outside the 4th.
                </li>
                <li>
                  <strong className="text-red-400">Aggressive:</strong> Starts 4th & Short rolls from own 40-yard line; starts 4th & Long rolls from Midfield (50); always goes for goal-line TDs inside the 5.
                </li>
                <li>
                  <strong>Go For It on 4th and Short / Long Sliders:</strong> Dictates the percentage roll (0-85%) when inside the active trigger zone.
                </li>
              </ul>
            </div>

            <div className="border-b border-gray-700 pb-3">
              <Text variant="body" classes="text-white font-semibold mb-1">
                Situational Down Playcalling (3rd & 4th Down Overrides):
              </Text>
              <Text variant="small" classes="text-gray-300">
                Allows you to dictate the exact offensive category run in clutch short and long conversion situations:
              </Text>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-gray-300">
                <li>
                  <strong>Default:</strong> Follows your offensive scheme's natural run/pass tendencies and situational weighting.
                </li>
                <li>
                  <strong>Traditional Run:</strong> Guarantees an inside or outside run from the selected formation.
                </li>
                <li>
                  <strong>Option Run:</strong> Calls an option play (Read Option, Speed Option, Triple Option, etc.).
                </li>
                <li>
                  <strong>Pass:</strong> Enforces a traditional passing concept (Short, Medium, Deep, Screen, Play Action).
                </li>
                <li>
                  <strong>RPO:</strong> Executes a Run-Pass Option, reading linebackers and edge rushers.
                </li>
              </ul>
            </div>

            <div className="border-b border-gray-700 pb-3">
              <Text variant="body" classes="text-white font-semibold mb-1">
                PAT & 2-Point Conversion Strategy:
              </Text>
              <Text variant="small" classes="text-gray-300">
                Controls whether your team kicks an extra point (1 pt) or attempts a conversion (2 pts) from the 2-yard line:
              </Text>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-gray-300">
                <li>
                  <strong className="text-blue-400">Conservative:</strong> Strict extra-point kicker. Only attempts 2 points in end-of-game deficits where 2 points are required to tie/win.
                </li>
                <li>
                  <strong className="text-amber-400">Standard:</strong> Uses modern analytics (goes for 2 when trailing by 2, 5, 8, 10, 15, or leading by 1, 4, 5, 12 in the 2nd half/4th quarter).
                </li>
                <li>
                  <strong className="text-red-400">Aggressive:</strong> Aggressively hunts 2-point conversions across additional margins (down 1, 2, 5, 8, 10, 11, 12, 13, 15 or up 1, 4, 5, 12) to create multi-possession leads.
                </li>
              </ul>
            </div>

            <div>
              <Text variant="body" classes="text-white font-semibold mb-1">
                Maximum Field Goal Distance:
              </Text>
              <Text variant="small" classes="text-gray-300">
                Sets the longest distance (15-85 yards) your team will attempt a field goal. Beyond this line, the team will automatically punt (or go for it on 4th down if within aggression criteria).
              </Text>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SpecialTeamsPanel;
