import { FC } from "react";
import { Button } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { SelectDropdown } from "../../../_design/Select";

interface RecruitingCategoryDropdownProps {
  label: string;
  options: { label: string; value: string }[];
  change: (opts: any) => void;
  isMulti: boolean;
  isMobile?: boolean;
}

export const CategoryDropdown: FC<RecruitingCategoryDropdownProps> = ({
  label,
  options,
  change,
  isMulti,
  isMobile = false,
}) => {
  return (
    <div className="flex flex-col">
      <Text variant="h6" classes="text-start mb-1">
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
            width: isMobile ? "10.5rem" : "13rem",
            maxWidth: "300px",
            padding: "0.3rem",
            boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
            borderRadius: "8px",
            transition: "all 0.2s ease",
          }),
          menu: (provided) => ({
            ...provided,
            backgroundColor: "#1a202c",
            borderRadius: "8px",
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
            padding: "10px",
            cursor: "pointer",
          }),
          singleValue: (provided) => ({
            ...provided,
            color: "#ffffff",
          }),
          placeholder: (provided) => ({
            ...provided,
            color: "#A0AEC0",
          }),
          input: (provided) => ({
            ...provided,
            color: "#fff",
          }),
        }}
      />
    </div>
  );
};
