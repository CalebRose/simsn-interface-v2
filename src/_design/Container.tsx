import React, { createContext, ReactNode, useContext } from "react";
import { LoadSpinner } from "./LoadSpinner";
import { Text } from "./Typography";

/**
 * A banner a route puts at the top of its page, above the page's own content
 * (a sport's navigation bar, for one). Without a provider there is none, and
 * the container is unchanged.
 */
export const PageBannerContext = createContext<ReactNode>(null);

/** The route's banner, for a page that does not use PageContainer. */
export const PageBanner = () => {
  const banner = useContext(PageBannerContext);
  return banner ? <div className="w-full">{banner}</div> : null;
};

// 🔑 Define Props Interface for PageContainer
interface PageContainerProps {
  children: ReactNode;
  isLoading?: boolean;
  /** When provided, applies `flex flex-{direction}`. Omit to let `classes` control layout freely. */
  direction?: string;
  classes?: string;
  title?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  isLoading = false,
  direction,
  classes = "",
  title = "",
}) => {
  return (
    <div
      // overflow-x-clip (not -hidden) avoids the browser forcing overflow-y to
      // "auto" on this element, which would break position:sticky descendants.
      className={`w-full max-w-full min-h-screen pt-20 py-3 px-4 overflow-x-clip${direction ? ` flex ${direction === "row" ? "flex-row" : "flex-col"}` : ""} ${classes}`}
    >
      {title.length > 0 && (
        <div className="flex flex-row mb-1">
          <div className="flex items-center">
            <Text variant="h5">{title}</Text>
          </div>
        </div>
      )}
      {isLoading ? (
        <LoadSpinner />
      ) : (
        <>
          <PageBanner />
          {children}
        </>
      )}
    </div>
  );
};
