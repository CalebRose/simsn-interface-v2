/**
 * Enhanced Theme Utility Functions
 *
 * This file provides comprehensive theme support utilities that work with CSS custom properties
 * and provide consistent theming across the application.
 */

export const THEME_CLASSES = {
  // Background classes
  bg: {
    primary: "bg-theme-primary",
    secondary: "bg-theme-secondary",
    surface: "bg-theme-surface",
  },
  // Text classes
  text: {
    primary: "text-theme-primary",
    secondary: "text-theme-secondary",
    muted: "text-theme-muted",
  },
  // Border classes
  border: {
    primary: "border-theme-primary",
    secondary: "border-theme-secondary",
  },
  // Accent classes
  accent: {
    primary: "accent-primary",
    success: "accent-success",
    error: "accent-error",
    warning: "accent-warning",
  },
  // Button classes
  button: {
    primary: "btn-theme-primary",
    success: "btn-theme-success",
    error: "btn-theme-error",
  },
} as const;

/**
 * Get Tailwind classes that respect theme preferences
 */
export const getThemeClasses = (isDark: boolean) => ({
  container: isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900",

  surface: isDark
    ? "bg-gray-800 border-gray-700"
    : "bg-gray-50 border-gray-200",

  interactive: isDark
    ? "hover:bg-gray-700 focus:bg-gray-700"
    : "hover:bg-gray-100 focus:bg-gray-100",

  text: {
    primary: isDark ? "text-white" : "text-gray-900",
    secondary: isDark ? "text-gray-300" : "text-gray-600",
    muted: isDark ? "text-gray-400" : "text-gray-500",
  },

  border: isDark ? "border-gray-600" : "border-gray-300",
});

/**
 * Apply theme-aware styles to components
 */
export const withThemeStyles = <T extends Record<string, any>>(
  component: T,
  isDark: boolean,
  customClasses?: string
): T => {
  const themeClasses = getThemeClasses(isDark);

  return {
    ...component,
    className: `${component.className || ""} ${themeClasses.container} ${
      customClasses || ""
    }`.trim(),
  };
};

/**
 * Get notification-specific theme styles
 */
export const getNotificationThemeStyles = (
  isDark: boolean,
  isUnread: boolean
) => {
  const base = "transition-all duration-200 ease-in-out";

  if (!isUnread) {
    return `${base} ${isDark ? "bg-gray-800" : "bg-gray-50"}`;
  }

  return `${base} notification-unread ${
    isDark
      ? "bg-blue-900 bg-opacity-20 border-blue-400"
      : "bg-blue-50 bg-opacity-30 border-blue-500"
  }`;
};

/**
 * Get button theme styles with variants
 */
export const getButtonThemeStyles = (
  isDark: boolean,
  variant:
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "warning" = "primary",
  size: "xs" | "sm" | "md" | "lg" = "md"
) => {
  const baseClasses =
    "font-medium rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantClasses = {
    primary: isDark
      ? "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
      : "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: isDark
      ? "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500"
      : "bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500",
    success: isDark
      ? "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500"
      : "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    error: isDark
      ? "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
      : "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    warning: isDark
      ? "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500"
      : "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500",
  };

  return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
};

/**
 * Theme-aware input styles
 */
export const getInputThemeStyles = (
  isDark: boolean,
  hasError: boolean = false
) => {
  const baseClasses =
    "block w-full rounded-md shadow-sm focus:outline-none focus:ring-1";

  if (hasError) {
    return `${baseClasses} border-red-500 focus:border-red-500 focus:ring-red-500 ${
      isDark
        ? "bg-gray-800 text-white placeholder-gray-400"
        : "bg-white text-gray-900 placeholder-gray-500"
    }`;
  }

  return `${baseClasses} ${
    isDark
      ? "border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400"
      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
  }`;
};

export default {
  THEME_CLASSES,
  getThemeClasses,
  withThemeStyles,
  getNotificationThemeStyles,
  getButtonThemeStyles,
  getInputThemeStyles,
};
