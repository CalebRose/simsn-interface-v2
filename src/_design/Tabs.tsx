import { Dispatch, ReactNode, SetStateAction } from "react";
import { Text } from "./Typography";

interface TabGroupProps {
  children: ReactNode;
  classes?: string;
  columns?: number;
}

export const TabGroup: React.FC<TabGroupProps> = ({
  children,
  classes = "",
}) => {
  return (
    <ul
      className={`flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 ${classes}`}
    >
      {children}
    </ul>
  );
};

export const TabGrid: React.FC<TabGroupProps> = ({
  children,
  classes = "",
  columns = 1,
}) => {
  return (
    <ul
      className={`grid grid-cols-${columns} text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 ${classes}`}
    >
      {children}
    </ul>
  );
};

interface TabProps {
  label?: string;
  classes?: string;
  selected: boolean;
  setSelected: Dispatch<SetStateAction<string>>;
}

export const Tab: React.FC<TabProps> = ({
  classes = "",
  selected,
  label = "",
  setSelected,
}) => {
  const selectedClass = selected
    ? "inline-block p-2 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-700 dark:text-blue-400"
    : "inline-block p-2 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-200 dark:hover:text-gray-700";
  return (
    <li className="w-full" onClick={() => setSelected(label)}>
      <Text
        variant="small"
        className={`${selectedClass} w-full cursor-pointer ${classes}`}
      >
        {label}
      </Text>
    </li>
  );
};
