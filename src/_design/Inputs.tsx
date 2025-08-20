import React, { ChangeEvent } from "react";

interface ToggleSwitchProps {
  // The current boolean state of the switch.
  checked: boolean;
  // Callback to toggle the switch state.
  onChange: (checked: boolean) => void;
  // Optional extra classes for the overall container.
  className?: string;
  // Optional extra classes for the switch track.
  trackClassName?: string;
  // Optional extra classes for the switch knob.
  knobClassName?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  className = "",
  trackClassName = "",
  knobClassName = "",
}) => {
  return (
    <div
      className={`relative inline-block w-12 h-6 ${className}`}
      onClick={() => onChange(!checked)}
    >
      {/* Hidden checkbox for accessibility */}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="opacity-0 w-0 h-0"
      />
      {/* Track */}
      <span
        className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition-colors duration-300 ${
          checked ? "bg-blue-500" : "bg-gray-300"
        } ${trackClassName}`}
      ></span>
      {/* Knob */}
      <span
        className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-300 transform ${
          checked ? "translate-x-6 bg-blue-500" : "translate-x-0 bg-white"
        } ${knobClassName}`}
      ></span>
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  textColor?: string;
  classes?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  classes,
  ...props
}) => {
  return (
    <div className="w-full flex items-center gap-x-2">
      {label && (
        <label className="w-[5rem] text-sm font-medium text-end text-white mb-1 whitespace-nowrap">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`
          flex-grow min-w-[5rem] px-4 py-2 border rounded-lg focus:outline-none 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          text-base
          placeholder-gray-400 bg-black text-white border-gray-500
          transition-all duration-200
          ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300"} 
          ${classes || ""}
        `}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
