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
  const fieldName = getAttributeFieldName(attributeName, league);
  const isClickable = !revealed && canAfford;
  const isOverallGrade = attributeName === "Overall Grade";
  const isPotentialGrade = attributeName === "Potential Grade";
  const isHCKPotentialGrade =
    league === SimPHL && attributeName.includes("Potential");
  let displayValue: string;
  let valueColor: string = "";

  if (isOverallGrade) {
    displayValue = getOverallGrade(player);
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
    const grade = (player as any)[`${fieldName}Grade`];
    displayValue = grade || "?";
    valueColor = getGradeColor(displayValue);
  }

  return (
    <div
      className={`
        relative p-2 rounded border text-center cursor-pointer
        ${isPotentialGrade || isOverallGrade ? "min-w-[50px] min-h-[50px] max-w-[80px] max-h-[80px]" : "min-w-[60px] min-h-[60px] max-w-[80px] max-h-[80px]"}
        flex flex-col justify-center items-center
        ${
          revealed
            ? "bg-gray-700 border-gray-600 cursor-default"
            : isClickable
              ? "bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500 hover:scale-105 transition-transform"
              : "bg-gray-800 border-gray-700 cursor-not-allowed"
        }
      `}
      onClick={onClick}
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
