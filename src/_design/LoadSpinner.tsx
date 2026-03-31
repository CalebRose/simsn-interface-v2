import React from "react";
import { Text } from "./Typography";
import { LoadingMessages } from "../_constants/loadMessages";
import { useLoadMessage } from "../_hooks/useLoadMessage";

export const LoadSpinner: React.FC = () => {
  const loadMessage = useLoadMessage(LoadingMessages, 3000);
  return (
    <div className="flex flex-col my-auto items-center justify-center mt-[40vh]">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <Text variant="h5" classes="mt-4">
        {loadMessage}
      </Text>
    </div>
  );
};
