import React, { FC } from "react";
import { Text } from "./Typography";

export const SectionHeading: FC<{ label: string }> = ({ label }) => (
  <div className="border-b border-gray-300 dark:border-gray-600 pb-1 mb-3 mt-4">
    <Text
      variant="h6"
      classes="font-semibold uppercase tracking-wide text-xs text-gray-500 dark:text-gray-400"
    >
      {label}
    </Text>
  </div>
);
