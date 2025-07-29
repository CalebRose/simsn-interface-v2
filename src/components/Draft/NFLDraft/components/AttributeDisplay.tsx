import React, { FC } from 'react';
import { Text } from '../../../../_design/Typography';
import { getGradeColor } from '../../../Gameplan/FootballGameplan/Utils/UIUtils';

interface AttributeDisplayProps {
  name: string;
  value: number;
  grade: string;
  revealed: boolean;
  positionSpecific?: boolean;
}

export const AttributeDisplay: FC<AttributeDisplayProps> = ({
  name,
  value,
  grade,
  revealed,
  positionSpecific = false
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Text variant="small" classes="text-gray-400">
          {name}
        </Text>
        {positionSpecific && (
          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
            Key
          </span>
        )}
      </div>
      <div className="relative">
        {revealed ? (
          <div className="flex items-center space-x-2">
            <Text variant="h6" classes="text-white font-bold animate-fadeIn">
              {value}
            </Text>
            <Text variant="xs" classes={`${getGradeColor(grade)} opacity-60`}>
              ({grade})
            </Text>
          </div>
        ) : (
          <Text 
            variant="h6" 
            classes={`font-bold ${getGradeColor(grade)}`}
          >
            {grade}
          </Text>
        )}
      </div>
    </div>
  );
};