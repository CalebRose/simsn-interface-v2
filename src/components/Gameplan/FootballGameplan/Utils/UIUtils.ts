import { 
  VALIDATION_COLORS, 
  HOVER_EFFECTS, 
  TRANSITIONS,
  INPUT_CLASSES,
  DROPDOWN_CLASSES,
  CARD_CLASSES,
  SLIDER_CLASSES,
  RATING_COLORS,
  RATING_BG_COLORS,
  ATTRIBUTE_COLORS,
  RATING_THRESHOLDS,
  AGGRESSION_THRESHOLDS,
  PLAY_TYPE_COLORS,
  FORMATION_WEIGHT_COLORS,
  PERCENTAGE_STATUS_COLORS,
  PERCENTAGE_STATUS_BG_COLORS
} from '../Constants/UIConstants';

export const getValidationClasses = (hasError: boolean, hasWarning: boolean) => {
  if (hasError) return VALIDATION_COLORS.ERROR;
  if (hasWarning) return VALIDATION_COLORS.WARNING;
  return VALIDATION_COLORS.SUCCESS;
};

export const getValidationBorderClass = (hasError: boolean, hasWarning: boolean): string => {
  if (hasError) return VALIDATION_COLORS.ERROR.border;
  if (hasWarning) return VALIDATION_COLORS.WARNING.border;
  return '';
};

export const getValidationTextColor = (hasError: boolean, hasWarning: boolean): string => {
  if (hasError) return VALIDATION_COLORS.ERROR.text;
  if (hasWarning) return VALIDATION_COLORS.WARNING.text;
  return VALIDATION_COLORS.SUCCESS.text;
};

export const getValidationBgColor = (hasError: boolean, hasWarning: boolean): string => {
  if (hasError) return VALIDATION_COLORS.ERROR.bg;
  if (hasWarning) return VALIDATION_COLORS.WARNING.bg;
  return VALIDATION_COLORS.SUCCESS.bg;
};

export const getRatingColor = (rating: number | string): string => {
  if (typeof rating === 'string') {
    return RATING_COLORS.STRING[rating as keyof typeof RATING_COLORS.STRING] || RATING_COLORS.STRING.F;
  }
  
  if (rating >= RATING_THRESHOLDS.ELITE) return RATING_COLORS.NUMBER.ELITE;
  if (rating >= RATING_THRESHOLDS.EXCELLENT) return RATING_COLORS.NUMBER.EXCELLENT;
  if (rating >= RATING_THRESHOLDS.GOOD) return RATING_COLORS.NUMBER.GOOD;
  if (rating >= RATING_THRESHOLDS.ABOVE_AVERAGE) return RATING_COLORS.NUMBER.ABOVE_AVERAGE;
  if (rating >= RATING_THRESHOLDS.AVERAGE) return RATING_COLORS.NUMBER.AVERAGE;
  return RATING_COLORS.NUMBER.BELOW_AVERAGE;
};

export const getRatingBgColor = (rating: number | string): string => {
  if (typeof rating === 'string') {
    return RATING_BG_COLORS.STRING[rating as keyof typeof RATING_BG_COLORS.STRING] || RATING_BG_COLORS.STRING.F;
  }
  
  if (rating >= RATING_THRESHOLDS.ELITE) return RATING_BG_COLORS.NUMBER.ELITE;
  if (rating >= RATING_THRESHOLDS.EXCELLENT) return RATING_BG_COLORS.NUMBER.EXCELLENT;
  if (rating >= RATING_THRESHOLDS.GOOD) return RATING_BG_COLORS.NUMBER.GOOD;
  if (rating >= RATING_THRESHOLDS.ABOVE_AVERAGE) return RATING_BG_COLORS.NUMBER.ABOVE_AVERAGE;
  if (rating >= RATING_THRESHOLDS.AVERAGE) return RATING_BG_COLORS.NUMBER.AVERAGE;
  return RATING_BG_COLORS.NUMBER.BELOW_AVERAGE;
};

export const getAttributeColor = (value: any): string => {
  // Check for shotgun rating values and return white
  if (value === 'Balanced' || value === 'Under Center' || value === 'Shotgun') {
    return 'text-white';
  }
  
  if (typeof value === 'string') {
    return ATTRIBUTE_COLORS.STRING[value as keyof typeof ATTRIBUTE_COLORS.STRING] || ATTRIBUTE_COLORS.STRING.DEFAULT;
  }
  
  if (typeof value === 'number') {
    if (value >= ATTRIBUTE_COLORS.NUMBER.EXCELLENT.threshold) return ATTRIBUTE_COLORS.NUMBER.EXCELLENT.color;
    if (value >= ATTRIBUTE_COLORS.NUMBER.GOOD.threshold) return ATTRIBUTE_COLORS.NUMBER.GOOD.color;
    if (value >= ATTRIBUTE_COLORS.NUMBER.AVERAGE.threshold) return ATTRIBUTE_COLORS.NUMBER.AVERAGE.color;
    if (value >= ATTRIBUTE_COLORS.NUMBER.BELOW_AVERAGE.threshold) return ATTRIBUTE_COLORS.NUMBER.BELOW_AVERAGE.color;
    return ATTRIBUTE_COLORS.NUMBER.POOR.color;
  }
  
  return 'text-gray-300';
};

export const getGradeColor = (grade: string): string => {
  return ATTRIBUTE_COLORS.STRING[grade as keyof typeof ATTRIBUTE_COLORS.STRING] || ATTRIBUTE_COLORS.STRING.DEFAULT;
};

export const getInputClasses = (
  error?: boolean,
  warning?: boolean,
  disabled?: boolean,
  size?: 'xs' | 'sm' | 'md' | 'lg'
): string => {
  const classes: string[] = [INPUT_CLASSES.BASE];
  
  if (disabled) classes.push(INPUT_CLASSES.DISABLED);
  if (error) classes.push(VALIDATION_COLORS.ERROR.border);
  else if (warning) classes.push(VALIDATION_COLORS.WARNING.border);
  
  classes.push(INPUT_CLASSES.FOCUS);
  
  if (size) {
    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };
    classes.push(sizeClasses[size]);
  }
  
  return classes.join(' ');
};

export const getDropdownClasses = (isOpen: boolean, isSelected: boolean = false) => {
  return {
    button: DROPDOWN_CLASSES.BUTTON,
    menu: DROPDOWN_CLASSES.MENU,
    item: `${DROPDOWN_CLASSES.ITEM} ${isSelected ? DROPDOWN_CLASSES.ITEM_SELECTED : DROPDOWN_CLASSES.ITEM_DEFAULT}`
  };
};

export const getCardClasses = (isDraggable: boolean = false, customClasses: string = ''): string => {
  const classes: string[] = [CARD_CLASSES.BASE, TRANSITIONS.DEFAULT];
  if (isDraggable) classes.push(CARD_CLASSES.DRAGGABLE);
  if (customClasses) classes.push(customClasses);
  return classes.join(' ');
};

export const getHoverEffectClasses = (
  type: 'scale' | 'scaleSmall' | 'opacity' | 'shadow' | 'borderBlue' | 'bgGray' = 'scale'
): string => {
  const effectMap = {
    scale: HOVER_EFFECTS.SCALE,
    scaleSmall: HOVER_EFFECTS.SCALE_SMALL,
    opacity: HOVER_EFFECTS.OPACITY,
    shadow: HOVER_EFFECTS.SHADOW,
    borderBlue: HOVER_EFFECTS.BORDER_BLUE,
    bgGray: HOVER_EFFECTS.BG_GRAY
  };
  return effectMap[type];
};

export const getTransitionClasses = (
  type: 'default' | 'fast' | 'slow' | 'colors' | 'transform' | 'opacity' = 'default'
): string => {
  const transitionMap = {
    default: TRANSITIONS.DEFAULT,
    fast: TRANSITIONS.FAST,
    slow: TRANSITIONS.SLOW,
    colors: TRANSITIONS.COLORS,
    transform: TRANSITIONS.TRANSFORM,
    opacity: TRANSITIONS.OPACITY
  };
  return transitionMap[type];
};

export const getSliderClasses = (error?: boolean, warning?: boolean, disabled?: boolean): string => {
  const classes: string[] = [
    SLIDER_CLASSES.TRACK,
    SLIDER_CLASSES.THUMB,
    SLIDER_CLASSES.FOCUS
  ];
  
  if (disabled) classes.push(SLIDER_CLASSES.DISABLED);
  if (error) classes.push(VALIDATION_COLORS.ERROR.ring);
  else if (warning) classes.push(VALIDATION_COLORS.WARNING.ring);
  
  return classes.join(' ');
};

export const getSliderGradient = (value: number, min: number, max: number): React.CSSProperties => {
  const percentage = ((value - min) / (max - min)) * 100;
  return {
    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #374151 ${percentage}%, #374151 100%)`
  };
};

export const getAggressionLevelText = (percentage: number, type: 'short' | 'long'): string => {
  const thresholds = AGGRESSION_THRESHOLDS[type.toUpperCase() as keyof typeof AGGRESSION_THRESHOLDS];
  if (percentage > thresholds.VERY_AGGRESSIVE) return 'Very Aggressive';
  if (percentage > thresholds.MODERATE) return 'Moderate';
  return 'Conservative';
};

export const getAggressionLevelColor = (percentage: number, type: 'short' | 'long'): string => {
  const thresholds = AGGRESSION_THRESHOLDS[type.toUpperCase() as keyof typeof AGGRESSION_THRESHOLDS];
  if (percentage > thresholds.VERY_AGGRESSIVE) return 'text-red-400';
  if (percentage > thresholds.MODERATE) return 'text-yellow-400';
  return 'text-green-400';
};

export const getPlayTypeColor = (playType: keyof typeof PLAY_TYPE_COLORS): string => {
  return PLAY_TYPE_COLORS[playType] || PLAY_TYPE_COLORS.default;
};

export const getFormationWeightColor = (weight: number): string => {
  if (weight > FORMATION_WEIGHT_COLORS.HIGH.threshold) return FORMATION_WEIGHT_COLORS.HIGH.color;
  if (weight > FORMATION_WEIGHT_COLORS.ACTIVE.threshold) return FORMATION_WEIGHT_COLORS.ACTIVE.color;
  return FORMATION_WEIGHT_COLORS.INACTIVE.color;
};

export const getPercentageStatusColor = (total: number, target: number = 100): string => {
  return total === target ? PERCENTAGE_STATUS_COLORS.COMPLETE : PERCENTAGE_STATUS_COLORS.INCOMPLETE;
};

export const getPercentageStatusBgColor = (total: number, target: number = 100): string => {
  return total === target ? PERCENTAGE_STATUS_BG_COLORS.COMPLETE : PERCENTAGE_STATUS_BG_COLORS.INCOMPLETE;
};

export const createValidationMessage = (message: string, type: 'error' | 'warning' | 'success'): {
  message: string;
  className: string;
} => {
  const classMap = {
    error: VALIDATION_COLORS.ERROR.text,
    warning: VALIDATION_COLORS.WARNING.text,
    success: VALIDATION_COLORS.SUCCESS.text
  };
  
  return {
    message,
    className: classMap[type]
  };
};

export const combineClasses = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};