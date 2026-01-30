export const NFL_RATING_THRESHOLDS = {
  ELITE: 85,
  EXCELLENT: 80,
  GOOD: 75,
  ABOVE_AVERAGE: 70,
  AVERAGE: 65,
} as const;

export const PHL_RATING_THRESHOLDS = {
  ELITE: 45,
  EXCELLENT: 40,
  GOOD: 35,
  ABOVE_AVERAGE: 30,
  AVERAGE: 25,
} as const;

export const RATING_COLORS = {
  STRING: {
    "A+": "text-[#00ACC9]",
    A: "text-[#00A995]",
    "A-": "text-[#00A666]",
    "B+": "text-[#64B052]",
    B: "text-[#AEBA3F]",
    "B-": "text-[#D7C12C]",
    "C+": "text-[#F1C51A]",
    C: "text-[#FDC70D]",
    "C-": "text-[#FCBF15]",
    "D+": "text-[#F8AC23]",
    D: "text-[#F18831]",
    "D-": "text-[#EA5139]",
    F: "text-[#AC2B27]",
  },
  NUMBER: {
    ELITE: "text-[#00ACC9]",
    EXCELLENT: "text-[#00A666]",
    GOOD: "text-[#64B052]",
    ABOVE_AVERAGE: "text-[#64B052]",
    AVERAGE: "text-[#D7C12C]",
    BELOW_AVERAGE: "text-[#FDC70D]",
  },
} as const;

export const RATING_BG_COLORS = {
  STRING: {
    "A+": "bg-[#00ACC9]",
    A: "bg-[#00A995]",
    "A-": "bg-[#00A666]",
    "B+": "bg-[#64B052]",
    B: "bg-[#AEBA3F]",
    "B-": "bg-[#D7C12C]",
    "C+": "bg-[#F1C51A]",
    C: "bg-[#FDC70D]",
    "C-": "bg-[#FCBF15]",
    "D+": "bg-[#F8AC23]",
    D: "bg-[#F18831]",
    "D-": "bg-[#EA5139]",
    F: "bg-[#AC2B27]",
  },
  NUMBER: {
    ELITE: "bg-[#00ACC9]",
    EXCELLENT: "bg-[#00A666]",
    GOOD: "bg-[#64B052]",
    ABOVE_AVERAGE: "bg-[#64B052]",
    AVERAGE: "bg-[#D7C12C]",
    BELOW_AVERAGE: "bg-[#FDC70D]",
  },
} as const;

export const ATTRIBUTE_COLORS = {
  STRING: {
    "A+": "text-[#00A995]",
    A: "text-[#00A666]",
    "A-": "text-[#64B052]",
    "B+": "text-[#AEBA3F]",
    B: "text-[#D7C12C]",
    "B-": "text-[#F1C51A]",
    "C+": "text-[#FDC70D]",
    C: "text-[#FCBF15]",
    "C-": "text-[#F8AC23]",
    "D+": "text-[#F18831]",
    DEFAULT: "text-[#AC2B27]",
  },
  NUMBER: {
    EXCELLENT: { threshold: 80, color: "text-[#00A666]" },
    GOOD: { threshold: 70, color: "text-[#64B052]" },
    AVERAGE: { threshold: 60, color: "text-[#D7C12C]" },
    BELOW_AVERAGE: { threshold: 50, color: "text-[#FDC70D]" },
    POOR: { threshold: 0, color: "text-[#AC2B27]" },
  },
} as const;

export const VALIDATION_COLORS = {
  ERROR: {
    text: "text-red-400",
    border: "border-red-500",
    bg: "bg-red-900 bg-opacity-50 border-red-500",
    ring: "ring-2 ring-red-500 ring-opacity-50",
  },
  WARNING: {
    text: "text-yellow-400",
    border: "border-yellow-500",
    bg: "bg-yellow-900 bg-opacity-50 border-yellow-500",
    ring: "ring-2 ring-yellow-500 ring-opacity-50",
  },
  SUCCESS: {
    text: "text-green-400",
    border: "border-green-500",
    bg: "bg-green-900 bg-opacity-50 border-green-500",
    ring: "",
  },
} as const;

export const TRANSITIONS = {
  DEFAULT: "transition-all duration-200",
  FAST: "transition-all duration-150",
  SLOW: "transition-all duration-300",
  COLORS: "transition-colors duration-150",
  TRANSFORM: "transition-transform duration-200",
  OPACITY: "transition-opacity duration-200",
} as const;

export const HOVER_EFFECTS = {
  SCALE: "hover:scale-105",
  SCALE_SMALL: "hover:scale-102",
  OPACITY: "hover:opacity-90",
  SHADOW: "hover:shadow-lg",
  BORDER_BLUE: "hover:border-blue-400",
  BG_GRAY: "hover:bg-gray-700",
} as const;

export const CARD_CLASSES = {
  BASE: "relative cursor-pointer select-none",
  DRAGGABLE: "cursor-move",
  OVERLAY:
    "absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white opacity-0 hover:opacity-10 transition-opacity duration-200 pointer-events-none",
} as const;

export const INPUT_CLASSES = {
  BASE: "w-full",
  DISABLED: "disabled:opacity-50 disabled:cursor-not-allowed",
  FOCUS:
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
} as const;

export const DROPDOWN_CLASSES = {
  BUTTON: "w-full justify-between text-left",
  MENU: "absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto",
  ITEM: "w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors duration-150",
  ITEM_SELECTED: "bg-blue-600 text-white",
  ITEM_DEFAULT: "text-gray-300",
} as const;

export const MODAL_CLASSES = {
  OVERLAY: "fixed inset-0 bg-black bg-opacity-50 z-40",
  CONTAINER: "fixed inset-0 flex items-center justify-center z-50 p-4",
  CONTENT:
    "bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden",
  HEADER: "p-4 border-b border-gray-600",
  BODY: "p-4 overflow-y-auto max-h-[60vh]",
} as const;

export const GRID_CLASSES = {
  PLAYER_SELECTION: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3",
  FORMATION: "absolute inset-0 grid grid-cols-14 grid-rows-12 gap-1 p-4",
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  DEFAULT: 200,
  SLOW: 300,
  VERY_SLOW: 600,
} as const;

export const OPACITY_VALUES = {
  DISABLED: 0.5,
  HOVER: 0.9,
  BACKGROUND_PATTERN: 0.1,
  BACKGROUND_OVERLAY: 0.05,
  ASSIGNED_PLAYER: 0.75,
} as const;

export const Z_INDEX = {
  BASE: 1,
  ELEVATED: 10,
  DROPDOWN: 50,
  MODAL_OVERLAY: 40,
  MODAL: 50,
} as const;

export const AGGRESSION_THRESHOLDS = {
  SHORT: {
    VERY_AGGRESSIVE: 50,
    MODERATE: 25,
    CONSERVATIVE: 0,
  },
  LONG: {
    VERY_AGGRESSIVE: 30,
    MODERATE: 10,
    CONSERVATIVE: 0,
  },
} as const;

export const PLAY_TYPE_COLORS = {
  traditionalRun: "text-green-400",
  optionRun: "text-blue-400",
  pass: "text-purple-400",
  rpo: "text-yellow-400",
  default: "text-gray-400",
} as const;

export const FORMATION_WEIGHT_COLORS = {
  HIGH: { threshold: 50, color: "text-red-400" },
  ACTIVE: { threshold: 0, color: "text-green-400" },
  INACTIVE: { threshold: -1, color: "text-gray-400" },
} as const;

export const PERCENTAGE_STATUS_COLORS = {
  COMPLETE: "text-green-400",
  INCOMPLETE: "text-red-400",
} as const;

export const PERCENTAGE_STATUS_BG_COLORS = {
  COMPLETE: "bg-green-900 bg-opacity-50",
  INCOMPLETE: "bg-red-900 bg-opacity-50",
} as const;

export const SLIDER_CLASSES = {
  TRACK: "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer",
  THUMB:
    "slider-thumb:appearance-none slider-thumb:h-4 slider-thumb:w-4 slider-thumb:rounded-full slider-thumb:bg-blue-500 slider-thumb:cursor-pointer slider-thumb:hover:bg-blue-400 slider-thumb:transition-colors",
  FOCUS:
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
  DISABLED: "disabled:opacity-50 disabled:cursor-not-allowed",
} as const;

export const TEXT_TRUNCATE_CLASSES = "truncate";
export const FLEX_CENTER_CLASSES = "flex items-center justify-center";
export const FLEX_BETWEEN_CLASSES = "flex items-center justify-between";
export const FULL_SIZE_CLASSES = "w-full h-full";

export const EMPTY_STATE_CLASSES = {
  CONTAINER:
    "text-center py-8 bg-gray-800 bg-opacity-30 rounded-lg border-2 border-dashed border-gray-600",
  TEXT: "text-gray-400",
} as const;
