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
      className={`relative flex items-center max-[768px]:gap-0.5 gap-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 border rounded-md max-[768px]:px-1.5 max-[768px]:py-0.5 px-2 py-1 max-[768px]:text-xs ${
        isActive
          ? `${activeColor} transform scale-105 border-current z-0`
          : `text-gray-500 ${hoverColor} border-gray-600/30 hover:border-gray-500/50 z-0`
      }`}
    >
      <span className="max-[768px]:text-sm text-lg">{emoji}</span>
      {count > 0 && (
        <span className="text-xs bg-gray-700 text-white max-[768px]:px-1 max-[768px]:py-0 px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
};
