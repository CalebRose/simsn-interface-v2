import { FC } from "react";
import { Text } from "../../../_design/Typography";
import { SelectDropdown } from "../../../_design/Select";

interface NewsDropdownProps {
  label: string;
  options: { label: string; value: string }[];
  change: (opts: any) => void;
  isMulti: boolean;
  isMobile?: boolean;
}

export const NewsDropdown: FC<NewsDropdownProps> = ({
  label,
  options,
  change,
  isMulti,
  isMobile = false,
}) => {
  return (
    <div className="flex flex-col max-[768px]:flex-1">
      <Text
        variant="h6"
        classes="text-start max-[768px]:text-xs max-[768px]:mb-0.5 mb-1"
      >
        {label}
      </Text>
      <SelectDropdown
        options={options}
        onChange={change}
        isMulti={isMulti}
        placeholder="Select..."
        styles={{
          control: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
            borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
            color: "#ffffff",
            minWidth: isMobile ? "6rem" : "13rem",
            maxWidth: "100%",
            width: "100%",
            flexGrow: 1,
            padding: isMobile ? "0.1rem" : "0.3rem",
            minHeight: isMobile ? "2rem" : "auto",
            fontSize: isMobile ? "0.75rem" : "1rem",
            boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
            borderRadius: "6px",
            transition: "all 0.2s ease",
          }),
          menu: (provided) => ({
            ...provided,
            backgroundColor: "#1a202c",
            borderRadius: "6px",
            fontSize: isMobile ? "0.75rem" : "1rem",
          }),
          menuList: (provided) => ({
            ...provided,
            backgroundColor: "#1a202c",
            padding: "0",
          }),
          option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
            color: "#ffffff",
            padding: isMobile ? "6px 8px" : "10px",
            cursor: "pointer",
            fontSize: isMobile ? "0.75rem" : "1rem",
          }),
          singleValue: (provided) => ({
            ...provided,
            color: "#ffffff",
            fontSize: isMobile ? "0.75rem" : "1rem",
          }),
          placeholder: (provided) => ({
            ...provided,
            color: "#A0AEC0",
            fontSize: isMobile ? "0.75rem" : "1rem",
          }),
          input: (provided) => ({
            ...provided,
            color: "#fff",
            fontSize: isMobile ? "0.75rem" : "1rem",
          }),
          dropdownIndicator: (provided) => ({
            ...provided,
            padding: isMobile ? "2px" : "8px",
          }),
          indicatorSeparator: (provided) => ({
            ...provided,
            display: isMobile ? "none" : "block",
          }),
        }}
      />
    </div>
  );
};
