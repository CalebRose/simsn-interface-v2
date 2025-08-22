import React from 'react';
import { Text } from '../../../../_design/Typography';

export interface GameplanSliderProps {
  name: string;
  label: string;
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  valueLabel?: string;
  className?: string;
  error?: string;
  warning?: string;
  runpass?: boolean;
}

export const GameplanSlider: React.FC<GameplanSliderProps> = ({
  name,
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = true,
  valueLabel,
  className = '',
  error,
  warning,
  runpass = false,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {runpass ? (
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <Text variant="small" classes="text-gray-300 font-medium">
              Pass
            </Text>
            <Text variant="small" classes="text-gray-400">
              {100 - value}%
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="small" classes="text-gray-300 font-medium">
              Run
            </Text>
            <Text variant="small" classes="text-gray-400">
              {value}%
            </Text>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <Text variant="small" classes="text-gray-300 font-medium">
            {label}
          </Text>
          {showValue && (
            <Text variant="small" classes="text-blue-400 font-semibold">
              {valueLabel || value}
            </Text>
          )}
        </div>
      )}
      <div className="relative">
        <input
          type="range"
          name={name}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`
            w-full h-2 p-0 bg-gray-700 rounded-lg appearance-none cursor-pointer
            slider-thumb:appearance-none slider-thumb:h-4 slider-thumb:w-4 
            slider-thumb:rounded-full slider-thumb:bg-blue-500 slider-thumb:cursor-pointer
            slider-thumb:hover:bg-blue-400 slider-thumb:transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'ring-2 ring-red-500 ring-opacity-50' : ''}
            ${warning ? 'ring-2 ring-yellow-500 ring-opacity-50' : ''}
          `}
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - min) / (max - min)) * 100}%, #374151 ${((value - min) / (max - min)) * 100}%, #374151 100%)`
          }}
        />
      </div>
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

export interface PitchDiveFocusSliderProps {
  pitchValue: number;
  diveValue: number;
  onPitchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDiveChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

export const PitchDiveFocusSlider: React.FC<PitchDiveFocusSliderProps> = ({
  pitchValue,
  diveValue,
  onPitchChange,
  onDiveChange,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <GameplanSlider
        name="PitchFocus"
        label="Pitch Focus"
        value={pitchValue}
        onChange={onPitchChange}
        min={0}
        max={100}
        disabled={disabled}
        valueLabel={`${pitchValue}%`}
      />
      
      <GameplanSlider
        name="DiveFocus"
        label="Dive Focus"
        value={diveValue}
        onChange={onDiveChange}
        min={0}
        max={100}
        disabled={disabled}
        valueLabel={`${diveValue}%`}
      />
    </div>
  );
};

export default GameplanSlider;