export type ComponentSize = 'sm' | 'md' | 'lg';

export const DEPTH_CHART_SIZE_CLASSES = {
  sm: 'w-full h-24',
  md: 'w-full h-32',
  lg: 'w-full h-36'
} as const;

export const ATTRIBUTE_CARD_SIZE_CLASSES = {
  sm: 'w-full h-40',
  md: 'w-full h-48',
  lg: 'w-full h-56'
} as const;

export const POSITION_SLOT_SIZE_CLASSES = {
  sm: 'w-20',
  md: 'w-24', 
  lg: 'w-28'
} as const;

export const POSITION_SLOT_MIN_HEIGHTS = {
  sm: 'min-h-24',
  md: 'min-h-32',
  lg: 'min-h-36'
} as const;

export const TEXT_SIZE_CLASSES = {
  sm: 'xs' as const,
  md: 'small' as const,
  lg: 'body-small' as const
};

export const PICTURE_SIZE_CLASSES = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8', 
  lg: 'h-10 w-10'
} as const;

export const PICTURE_SIZE_CLASSES_ALT = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10', 
  lg: 'h-12 w-12'
} as const;

export const generateBackgroundPattern = (accentColor: string): React.CSSProperties => {
  return {
    backgroundImage: `linear-gradient(45deg, ${accentColor} 25%, transparent 25%), 
                      linear-gradient(-45deg, ${accentColor} 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, ${accentColor} 75%), 
                      linear-gradient(-45deg, transparent 75%, ${accentColor} 75%)`,
    backgroundSize: '8px 8px',
    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
  };
};

export const generateSimpleBackgroundPattern = (accentColor: string): React.CSSProperties => {
  return {
    backgroundImage: `linear-gradient(45deg, ${accentColor} 25%, transparent 25%), 
                      linear-gradient(-45deg, ${accentColor} 25%, transparent 25%)`,
    backgroundSize: '4px 4px',
    backgroundPosition: '0 0, 2px 2px'
  };
};

export const generateCardGradient = (backgroundColor: string): string => {
  return `linear-gradient(135deg, ${backgroundColor} 50%, ${backgroundColor}dd 100%)`;
};

export type BackgroundPatternType = 'squares' | 'simple-squares' | 'stripes' | 'dots' | 'hexagon' | 'waves' | 'triangles' | 'cross' | 'texture' | 'none';

export const generateStripedPattern = (accentColor: string): React.CSSProperties => {
  return {
    backgroundImage: `repeating-linear-gradient(45deg, ${accentColor} 0px, ${accentColor} 2px, transparent 2px, transparent 8px)`,
  };
};

export const generateDotPattern = (accentColor: string): React.CSSProperties => {
  return {
    backgroundImage: `radial-gradient(circle at 50% 50%, ${accentColor} 1px, transparent 1px)`,
    backgroundSize: '8px 8px',
  };
};

export const generateHexPattern = (accentColor: string): React.CSSProperties => {
  const encodedColor = encodeURIComponent(accentColor);
  return {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='10,2 17,6 17,14 10,18 3,14 3,6' fill='${encodedColor}' opacity='0.15'/%3E%3C/svg%3E")`,
    backgroundSize: '20px 20px',
  };
};

export const generateWavePattern = (accentColor: string): React.CSSProperties => {
  const encodedColor = encodeURIComponent(accentColor);
  return {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,5 Q5,0 10,5 T20,5' stroke='${encodedColor}' stroke-width='1' fill='none' opacity='0.2'/%3E%3C/svg%3E")`,
    backgroundSize: '20px 10px',
  };
};

export const generateTrianglePattern = (accentColor: string): React.CSSProperties => {
  return {
    backgroundImage: `linear-gradient(45deg, transparent 40%, ${accentColor} 40%, ${accentColor} 60%, transparent 60%)`,
    backgroundSize: '8px 8px',
  };
};

export const generateCrossPattern = (accentColor: string): React.CSSProperties => {
  return {
    backgroundImage: `
      linear-gradient(90deg, transparent 40%, ${accentColor} 40%, ${accentColor} 60%, transparent 60%),
      linear-gradient(0deg, transparent 40%, ${accentColor} 40%, ${accentColor} 60%, transparent 60%)
    `,
    backgroundSize: '8px 8px',
  };
};

export const generateTexturePattern = (accentColor: string): React.CSSProperties => {
  return {
    backgroundImage: `radial-gradient(circle at 50% 50%, ${accentColor} 1px, transparent 1px), radial-gradient(circle at 75% 75%, ${accentColor} 1px, transparent 1px)`,
    backgroundSize: '4px 4px',
  };
};

export const getBackgroundPattern = (patternType: BackgroundPatternType, accentColor: string): React.CSSProperties => {
  switch (patternType) {
    case 'squares':
      return generateBackgroundPattern(accentColor);
    case 'simple-squares':
      return generateSimpleBackgroundPattern(accentColor);
    case 'stripes':
      return generateStripedPattern(accentColor);
    case 'dots':
      return generateDotPattern(accentColor);
    case 'hexagon':
      return generateHexPattern(accentColor);
    case 'waves':
      return generateWavePattern(accentColor);
    case 'triangles':
      return generateTrianglePattern(accentColor);
    case 'cross':
      return generateCrossPattern(accentColor);
    case 'texture':
      return generateTexturePattern(accentColor);
    case 'none':
    default:
      return {};
  }
};

export const getSizeClasses = (size: ComponentSize, type: 'depthChart' | 'attribute' | 'positionSlot') => {
  switch (type) {
    case 'depthChart':
      return DEPTH_CHART_SIZE_CLASSES[size];
    case 'attribute':
      return ATTRIBUTE_CARD_SIZE_CLASSES[size];
    case 'positionSlot':
      return POSITION_SLOT_SIZE_CLASSES[size];
    default:
      return DEPTH_CHART_SIZE_CLASSES[size];
  }
};

export const getTextSize = (size: ComponentSize) => TEXT_SIZE_CLASSES[size];

export const getPictureSize = (size: ComponentSize, alt: boolean = false) => {
  return alt ? PICTURE_SIZE_CLASSES_ALT[size] : PICTURE_SIZE_CLASSES[size];
};

export const getMinHeight = (size: ComponentSize) => POSITION_SLOT_MIN_HEIGHTS[size];

export { 
  getPercentageStatusColor,
  getPercentageStatusBgColor,
  getAggressionLevelText,
  getAggressionLevelColor,
  getPlayTypeColor,
  getFormationWeightColor,
  getValidationBorderClass as getValidationBorderColor
} from './UIUtils';