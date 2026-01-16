import { getTextColorBasedOnBg } from "./getBorderClass";

interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

export const getThemeColors = (isDark: boolean): ThemeColors => {
  if (isDark) {
    return {
      background: "#1f2937",
      surface: "#374151",
      text: "#f9fafb",
      textSecondary: "#d1d5db",
      border: "#4b5563",
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6",
    };
  } else {
    return {
      background: "#f8fafc",
      surface: "#ffffff",
      text: "#1f2937",
      textSecondary: "#6b7280",
      border: "#e5e7eb",
      success: "#059669",
      error: "#dc2626",
      warning: "#d97706",
      info: "#2563eb",
    };
  }
};

export const getNotificationStyles = (isDark: boolean, isUnread: boolean) => {
  const baseClasses =
    "col-span-8 grid grid-cols-8 border-b border-opacity-30 pb-2 mb-1";

  if (!isUnread) return baseClasses;

  const unreadClasses = isDark
    ? "border-l-4 border-l-blue-400 pl-2 bg-blue-900 bg-opacity-20"
    : "border-l-4 border-l-blue-500 pl-2 bg-blue-100 bg-opacity-30";

  return `${baseClasses} ${unreadClasses}`;
};

export const getButtonStyles = (
  isDark: boolean,
  variant: "primary" | "success" | "error" | "warning"
) => {
  const baseClasses = "rounded text-white transition-colors";

  const variants = {
    primary: isDark
      ? "bg-blue-500 hover:bg-blue-600"
      : "bg-blue-600 hover:bg-blue-700",
    success: isDark
      ? "bg-green-500 hover:bg-green-600"
      : "bg-green-600 hover:bg-green-700",
    error: isDark
      ? "bg-red-500 hover:bg-red-600"
      : "bg-red-600 hover:bg-red-700",
    warning: isDark
      ? "bg-yellow-500 hover:bg-yellow-600"
      : "bg-yellow-600 hover:bg-yellow-700",
  };

  return `${baseClasses} ${variants[variant]}`;
};

export const getThemeAwareBackground = (
  isDark: boolean,
  teamColor?: string
): string => {
  if (teamColor) {
    // Use team color but ensure it's appropriate for the theme
    return teamColor;
  }

  // Fall back to theme background
  return isDark ? "#1f2937" : "#f8fafc";
};

export const getThemeAwareText = (
  isDark: boolean,
  background?: string
): string => {
  if (background) {
    // If we have a specific background, calculate appropriate text color
    return getTextColorBasedOnBg(background);
  }

  // Use theme text color
  return isDark ? "#f9fafb" : "#1f2937";
};

export const getThemeAwareAccent = (
  isDark: boolean,
  variant: "primary" | "success" | "error" | "warning"
): string => {
  const accents = {
    primary: isDark ? "#3b82f6" : "#2563eb",
    success: isDark ? "#10b981" : "#059669",
    error: isDark ? "#ef4444" : "#dc2626",
    warning: isDark ? "#f59e0b" : "#d97706",
  };

  return accents[variant];
};
