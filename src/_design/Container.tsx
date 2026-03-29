import React, { ReactNode } from "react";
import { LoadSpinner } from "./LoadSpinner";
import { Text } from "./Typography";

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
      className={`w-full max-w-full min-h-screen p-3 pt-20 overflow-x-hidden${direction ? ` flex flex-${direction}` : ""} ${classes}`}
    >
      {title.length > 0 && (
        <div className="flex flex-row mb-1">
          <div className="flex items-center">
            <Text variant="h5">{title}</Text>
          </div>
        </div>
      )}
      {isLoading ? <LoadSpinner /> : children}
    </div>
  );
};
