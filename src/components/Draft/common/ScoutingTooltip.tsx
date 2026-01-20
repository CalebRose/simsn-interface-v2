import React, { FC, ReactNode } from 'react';
import { InformationCircle } from '../../../_design/Icons';

interface ScoutingTooltipProps {
  children?: ReactNode;
}

export const ScoutingTooltip: FC<ScoutingTooltipProps> = ({ children }) => {
  return (
    <div className="relative group inline-block">
      {children || (
        <InformationCircle />
      )}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 max-w-xs">
        <div className="space-y-2">
          <p className="font-semibold">How Scouting Works:</p>
          <ul className="text-xs space-y-1">
            <li>• Players show letter grades initially</li>
            <li>• Spend points to reveal actual values</li>
            <li>• Key attributes cost more points</li>
            <li>• Scout wisely - points are limited!</li>
          </ul>
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    </div>
  );
};