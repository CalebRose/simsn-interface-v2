import { Dispatch, ReactNode, SetStateAction } from "react";
import { Text } from "./Typography";

interface TabGroupProps {
  children: ReactNode;
  classes?: string;
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
    ? "inline-block p-2 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500"
    : "inline-block p-2 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300";
  return (
    <li onClick={() => setSelected(label)}>
      <Text variant="small" className={`${selectedClass} cursor-pointer ${classes}`}>
        {label}
      </Text>
    </li>
  );
};
