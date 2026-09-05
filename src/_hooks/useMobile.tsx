import { useEffect, useState } from "react";

// Hook directly into the browser's CSS media queries for instant, accurate detection
const getMatchMediaSizes = () => {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isUltraWide: false,
    };
  }
  return {
    isMobile: window.matchMedia("(max-width: 767px)").matches,
    isTablet: window.matchMedia("(min-width: 768px) and (max-width: 1024px)").matches,
    isDesktop: window.matchMedia("(min-width: 1025px) and (max-width: 2559px)").matches,
    isUltraWide: window.matchMedia("(min-width: 2560px)").matches,
  };
};

export const useResponsive = () => {
  // Initialize state directly with matchMedia so the very first frame is correct
  const [sizes, setSizes] = useState(getMatchMediaSizes);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateSizes = () => {
      setSizes(getMatchMediaSizes());
    };

    // Listen for screen size and orientation changes natively
    window.addEventListener("resize", updateSizes, { passive: true });
    window.addEventListener("orientationchange", updateSizes, { passive: true });

    // Force one immediate check in case the screen rotated during load
    updateSizes();

    return () => {
      window.removeEventListener("resize", updateSizes);
      window.removeEventListener("orientationchange", updateSizes);
    };
  }, []);

  return sizes;
};