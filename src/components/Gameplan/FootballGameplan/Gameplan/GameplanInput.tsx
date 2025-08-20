import React from 'react';
import { Input } from '../../../../_design/Inputs';
import { Text } from '../../../../_design/Typography';

export interface GameplanInputProps {
  name: string;
  label: string;
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  error?: string;
  warning?: string;
  className?: string;
}

export const GameplanInput: React.FC<GameplanInputProps> = ({
  name,
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  disabled = false,
  error,
  warning,
  className = ''
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Text variant="small" classes="text-gray-300 font-medium">
        {label}
      </Text>
      <Input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        disabled={disabled}
        className={`w-full ${error ? 'border-red-500' : warning ? 'border-yellow-500' : ''}`}
      />
      {error && (
        <Text variant="xs" classes="text-red-400">
          {error}
        </Text>
      )}
      {warning && !error && (
        <Text variant="xs" classes="text-yellow-400">
          {warning}
        </Text>
      )}
    </div>
  );
};

export interface GameplanInputSmallProps extends GameplanInputProps {
  size?: 'xs' | 'sm' | 'md';
}

export const GameplanInputSmall: React.FC<GameplanInputSmallProps> = ({
  name,
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  disabled = false,
  error,
  warning,
  size = 'sm',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base'
  };

  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      <Text variant="small" classes={`w-full text-right text-gray-300 font-medium min-w-0 ${sizeClasses[size]}`}>
        {label}:
      </Text>
      <div className="">
        <Input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          disabled={disabled}
          className={`${sizeClasses[size]} ${error ? 'border-red-500' : warning ? 'border-yellow-500' : ''}`}
        />
        {error && (
          <Text variant="xs" classes="text-red-400 mt-1">
            {error}
          </Text>
        )}
        {warning && !error && (
          <Text variant="xs" classes="text-yellow-400 mt-1">
            {warning}
          </Text>
        )}
      </div>
    </div>
  );
};

export interface RunnerInputProps {
  name: string;
  label: string;
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  playerInfo?: {
    firstName: string;
    lastName: string;
    position: string;
    archetype: string;
    overall: number | string;
  };
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const RunnerInput: React.FC<RunnerInputProps> = ({
  name,
  label,
  value,
  onChange,
  playerInfo,
  disabled = false,
  error,
  className = ''
}) => {
  const displayLabel = playerInfo 
    ? `${playerInfo.archetype} ${playerInfo.position} ${playerInfo.firstName} ${playerInfo.lastName} | ${playerInfo.overall}`
    : label;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Text variant="xs" classes="text-gray-300 font-medium min-w-0 flex-1">
        {displayLabel}
      </Text>
      <div className="">
        <Input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          min={0}
          max={10}
          disabled={disabled}
          className={`w-full text-sm ${error ? 'border-red-500' : ''}`}
        />
      </div>
    </div>
  );
};

export interface TargetInputProps extends RunnerInputProps {
  targetDepth?: string;
  onTargetDepthChange?: (depth: string) => void;
  targetDepthOptions?: string[];
}

export const TargetInput: React.FC<TargetInputProps> = ({
  name,
  label,
  value,
  onChange,
  playerInfo,
  targetDepth = 'None',
  onTargetDepthChange,
  targetDepthOptions = ['Quick', 'Short', 'Long', 'None'],
  disabled = false,
  error,
  className = ''
}) => {
  const displayLabel = playerInfo 
    ? `${playerInfo.archetype} ${playerInfo.position} ${playerInfo.firstName} ${playerInfo.lastName} | ${playerInfo.overall}`
    : label;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Text variant="xs" classes=" text-gray-300 font-medium min-w-0 flex-1">
        {displayLabel}
      </Text>
      {onTargetDepthChange && (
        <div className="relative">
          <select
            value={targetDepth}
            onChange={(e) => onTargetDepthChange(e.target.value)}
            disabled={disabled}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {targetDepthOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="">
        <Input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          min={0}
          max={10}
          disabled={disabled}
          className={`w-full text-sm ${error ? 'border-red-500' : ''}`}
        />
      </div>
    </div>
  );
};

export default GameplanInput;