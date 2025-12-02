import { useEffect, useState } from "react";

export const useResponsive = () => {
  const getSizes = () => {
    // Guard against SSR and ensure window is available
    if (typeof window === "undefined") {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
      };
    }

    return {
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth > 767 && window.innerWidth <= 1024,
      isDesktop: window.innerWidth > 1024,
    };
  };

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
    // Ensure we have the correct initial size after mounting
    setSizes(getSizes());

    const onResize = () => setSizes(getSizes());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return sizes; // { isMobile, isTablet, isDesktop }
};
