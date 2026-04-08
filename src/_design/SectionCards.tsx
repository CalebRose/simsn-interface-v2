import React, { ReactElement } from "react";
import { Text } from "./Typography";
import { darkenColor } from "../_utility/getDarkerColor";
import { isBrightColor } from "../_utility/isBrightColor";
import { getTextColorBasedOnBg } from "../_utility/getBorderClass";

interface SectionCardsProps {
  header: string | ReactElement;
  children: React.ReactNode;
  team: any;
  classes?: string;
  backgroundColor: string;
  headerColor: string;
  darkerBackgroundColor: string;
  borderColor: string;
  textColorClass: string;
  onHeaderClick?: () => void;
}

export const SectionCards: React.FC<SectionCardsProps> = ({
  header,
  children,
  team,
  classes = "bg-[#1f2937]",
  backgroundColor,
  headerColor,
  darkerBackgroundColor,
  textColorClass,
  borderColor,
  onHeaderClick,
}) => {
  const headerTextColorClass = getTextColorBasedOnBg(headerColor);

  return (
    <div
      className={`flex flex-col rounded-lg p-4 max-w-[50em] h-full shadow-md border-2 ${classes}`}
      style={{ borderColor: headerColor, backgroundColor }}
    >
      <div
        className={`mb-4 rounded-md${
          onHeaderClick
            ? " cursor-pointer hover:opacity-80 transition-opacity"
            : ""
        }`}
        style={{ backgroundColor: headerColor, borderColor: headerColor }}
        onClick={onHeaderClick}
        role={onHeaderClick ? "button" : undefined}
        tabIndex={onHeaderClick ? 0 : undefined}
        onKeyDown={
          onHeaderClick
            ? (e) => e.key === "Enter" && onHeaderClick()
            : undefined
        }
      >
        <Text
          variant="h4"
          className={`font-semibold rounded-md py-1 px-1 ${headerTextColorClass}`}
        >
          {header}
        </Text>
      </div>
      <div className="flex flex-col overflow-auto h-full">
        {React.Children.map(children, (child, index) => (
          <div
            className={
              index % 2 === 0 ? "border-t-2 pt-0.5" : "border-t-2 pt-0.5"
            }
            style={{
              backgroundColor:
                index % 2 === 0 ? "transparent" : darkerBackgroundColor,
              borderColor,
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};
