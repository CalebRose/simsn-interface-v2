import { useEffect, useState, useCallback } from "react";

export const useResponsive = () => {
  const getSizes = useCallback(() => {
    // Guard against SSR and ensure window is available
    if (typeof window === "undefined") {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
      };
    }

    // Safari-safe width access with additional safety checks
    try {
      const width =
        window.innerWidth || document.documentElement?.clientWidth || 0;
      return {
        isMobile: width < 768,
        isTablet: width > 767 && width <= 1024,
        isDesktop: width > 1024,
      };
    } catch (error) {
      console.warn("Error accessing window dimensions:", error);
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
      };
    }
  }, []);

  // Initialize with safe defaults, then update in useEffect
  const [sizes, setSizes] = useState(() => {
    // Use lazy initialization to avoid calling window during SSR
    if (typeof window === "undefined") {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
      };
    }
    return getSizes();
  });

  useEffect(() => {
    // Safari requires a small delay to ensure proper initialization
    const initTimer = setTimeout(() => {
      setSizes(getSizes());
    }, 0);

    // Safari-compatible resize handler with throttling
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setSizes(getSizes());
      }, 100); // Throttle for Safari performance
    };

    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      clearTimeout(initTimer);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [getSizes]);

  return sizes; // { isMobile, isTablet, isDesktop }
};
