import React, { useState, useCallback, useEffect } from 'react';
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
  const [inputValue, setInputValue] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);
  const percentage = ((value - min) / (max - min)) * 100;

  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(Math.max(numValue, min), max);
      const syntheticEvent = {
        target: {
          name,
          value: clampedValue.toString(),
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  }, [name, min, max, onChange]);

  const handleInputBlur = useCallback(() => {
    setIsEditing(false);
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) {
      setInputValue(value.toString());
    } else {
      const clampedValue = Math.min(Math.max(numValue, min), max);
      setInputValue(clampedValue.toString());
      if (clampedValue !== value) {
        const syntheticEvent = {
          target: {
            name,
            value: clampedValue.toString(),
          },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    }
  }, [inputValue, value, min, max, name, onChange]);

  const handleInputFocus = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  }, []);
  
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {runpass ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Text variant="small" classes="text-gray-300 font-medium">
              Pass
            </Text>
            <input
              type="text"
              value={100 - value}
              onChange={(e) => {
                const passValue = parseFloat(e.target.value);
                if (!isNaN(passValue)) {
                  const runValue = Math.min(Math.max(100 - passValue, min), max);
                  const syntheticEvent = {
                    target: { name, value: runValue.toString() },
                  } as React.ChangeEvent<HTMLInputElement>;
                  onChange(syntheticEvent);
                }
              }}
              onBlur={() => setIsEditing(false)}
              onFocus={() => setIsEditing(true)}
              disabled={disabled}
              className="w-12 px-1 py-0.5 text-sm text-gray-400 bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Text variant="small" classes="text-gray-400">%</Text>
          </div>
          <div className="flex items-center gap-2">
            <Text variant="small" classes="text-gray-300 font-medium">
              Run
            </Text>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
              disabled={disabled}
              className="w-12 px-1 py-0.5 text-sm text-gray-400 bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Text variant="small" classes="text-gray-400">%</Text>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <Text variant="small" classes="text-gray-300 font-medium">
            {label}
          </Text>
          {showValue && (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={isEditing ? inputValue : (valueLabel || value).toString().replace('%', '')}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onFocus={handleInputFocus}
                onKeyDown={handleInputKeyDown}
                disabled={disabled}
                className="w-14 px-1 py-0.5 text-sm text-blue-400 font-semibold bg-gray-800 border border-gray-600 rounded focus:border-blue-500 focus:outline-none text-right disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {(valueLabel && valueLabel.includes('%')) && (
                <Text variant="small" classes="text-blue-400 font-semibold">%</Text>
              )}
            </div>
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