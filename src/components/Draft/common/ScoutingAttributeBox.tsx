import { FC } from "react";
import {
  getGradeColor,
  getRatingColor,
} from "../../Gameplan/FootballGameplan/Utils/UIUtils";
import { DraftLeague, Draftee } from "./types";
import {
  getAttributeFieldName,
  getOverallGrade,
  getPotentialGrade,
} from "./draftHelpers";
import { SimPHL } from "../../../_constants/constants";
import { getGeneralLetterGrade } from "../../../_utility/getLetterGrade";

interface ScoutingAttributeBoxProps {
  attributeName: string;
  player: Draftee;
  cost: number;
  revealed: boolean;
  canAfford: boolean;
  onClick: () => void;
  league: DraftLeague;
}

export const ScoutingAttributeBox: FC<ScoutingAttributeBoxProps> = ({
  attributeName,
  player,
  cost,
  revealed,
  canAfford,
  onClick,
  league,
}) => {
  let fieldName = getAttributeFieldName(attributeName, league);
  const isClickable = !revealed && canAfford;
  const isOverallGrade = attributeName === "Overall Grade";
  const isPotentialGrade = attributeName === "Potential Grade";
  const isHCKPotentialGrade =
    league === SimPHL && attributeName.includes("Potential");
  let displayValue: string;
  let valueColor: string = "";

  if (isOverallGrade) {
    displayValue = getOverallGrade(player, league);
    valueColor = getGradeColor(displayValue);
  } else if (isPotentialGrade) {
    if (revealed) {
      displayValue = getPotentialGrade(player, league);
      valueColor = getGradeColor(displayValue);
    } else {
      displayValue = "?";
      valueColor = getGradeColor(displayValue);
    }
  } else if (revealed) {
    displayValue = (player as any)[fieldName]?.toString() || "0";
    if (isHCKPotentialGrade) {
      displayValue = getGeneralLetterGrade(parseInt(displayValue) || 0);
      valueColor = getRatingColor(displayValue, league);
    } else {
      valueColor = getRatingColor(parseInt(displayValue), league);
    }
  } else {
    if (fieldName === "MidRangeShooting") {
      fieldName = "MidrangeShooting";
    }
    const grade = (player as any)[`${fieldName}Grade`];
    displayValue = grade || "?";
    valueColor = getGradeColor(displayValue);
  }

  const clickIt = () => {
    if (revealed) return;
    onClick();
  };

  return (
    <div
      className={`
        relative p-2 rounded-sm border text-center cursor-pointer
        ${isPotentialGrade || isOverallGrade ? "min-w-12.5 min-h-12.5 sm:min-w-15 sm:min-h-15 max-w-20 max-h-20" : "min-w-15 min-h-15 sm:min-w-17.5 sm:min-h-17.5 max-w-20 max-h-20"}
        flex flex-col justify-center items-center
        ${
          revealed
            ? "bg-gray-700 border-gray-600 cursor-default"
            : isClickable
              ? "bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500 hover:scale-105 active:scale-95 active:bg-gray-600 transition-transform touch-manipulation"
              : "bg-gray-800 border-gray-700 cursor-not-allowed"
        }
      `}
      onClick={clickIt}
      title={`${attributeName}${!revealed ? ` (${cost} points)` : ` - ${displayValue}`}`}
    >
      {!(isPotentialGrade || isOverallGrade) && (
        <div className="text-[10px] font-medium text-gray-400 mb-1 leading-tight">
          {attributeName}
        </div>
      )}
      <div className={`text-sm font-bold ${valueColor}`}>{displayValue}</div>
      {!revealed && (
        <div className="absolute top-0 right-0 text-xs bg-gray-900 text-gray-400 px-1 rounded-bl text-[10px]">
          {cost}
        </div>
      )}
    </div>
  );
};
