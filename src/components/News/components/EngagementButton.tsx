import React from "react";
import { EngagementType } from "./NewsLogItem";

interface EngagementButtonProps {
  type: EngagementType;
  emoji: string;
  count: number;
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
  activeColor: string;
  hoverColor: string;
}

export const EngagementButton: React.FC<EngagementButtonProps> = ({
  type,
  emoji,
  count,
  isActive,
  isDisabled,
  onClick,
  activeColor,
  hoverColor,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`flex items-center gap-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 border rounded-md px-2 py-1 ${
        isActive
          ? `${activeColor} transform scale-110 border-current`
          : `text-gray-500 ${hoverColor} border-gray-600/30 hover:border-gray-500/50`
      }`}
    >
      <span className="text-lg">{emoji}</span>
      {count > 0 && (
        <span className="text-xs bg-gray-700 text-white px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
};
