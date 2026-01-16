import { useMemo } from "react";
import { navyBlueColor } from "../_constants/constants";
import { useAuthStore } from "../context/AuthContext";

export const useBackgroundColor = () => {
  const { viewMode } = useAuthStore();

  const backgroundColor = useMemo(() => {
    // If light class is present, return light gray
    // Otherwise (including no class or dark class), return navy blue
    return viewMode === "light" ? "#e5e7eb" : navyBlueColor;
  }, [viewMode]);

  const baseColor = useMemo(() => {
    switch (viewMode) {
      case "light":
        return "#e5e7eb";
      case "dark":
        return navyBlueColor;
      case "red":
        return "#5a1e1e";
      case "blue":
        return "#1e2a4a";
      case "sage":
        return "#202d20";
      default:
        return navyBlueColor;
    }
  }, [viewMode]);

  return { backgroundColor, baseColor };
};
