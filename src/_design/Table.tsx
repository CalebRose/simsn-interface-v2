import React, {
  FC,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getTextColorBasedOnBg } from "../_utility/getBorderClass";
import { getThemeAwareDarkenColor } from "../_utility/getDarkerColor";
import { Text } from "./Typography";
import { isBrightColor } from "../_utility/isBrightColor";
import { League, SimNFL } from "../_constants/constants";
import { useAuthStore } from "../context/AuthContext";
import { getThemeColors } from "../_utility/themeHelpers";

export interface SortState {
  key: string | null;
  order: "asc" | "desc";
}

// ✅ Define Types for Columns
interface TableColumn<T = any> {
  header: string;
  accessor: string;
}

// ✅ Define Props Interface for Table
export interface TableProps<T> {
  columns: TableColumn[];
  data: T[];
  backgroundColor?: string;
  team: any;
  textColor?: string;
  rowRenderer: (item: T, index: number, backgroundColor: string) => ReactNode;
  rowBgColor?: string;
  darkerRowBgColor?: string;
  league?: League;
  enablePagination?: boolean;
  currentPage?: number;
  page?: string;
}

export const Table = <T,>({
  columns,
  data,
  team,
  rowRenderer,
  rowBgColor,
  darkerRowBgColor,
  league,
  enablePagination = false,
  currentPage = 0,
  page = "",
}: TableProps<T>): JSX.Element => {
  const { isDarkMode } = useAuthStore();
  const themeColors = getThemeColors(isDarkMode);

  // Use theme-aware colors instead of hardcoded dark colors
  let backgroundColor = rowBgColor || themeColors.background;
  let borderColor = team?.ColorTwo || themeColors.border;
  let tableBgColor = rowBgColor || themeColors.background;
  let darkerTableBgColor =
    darkerRowBgColor ||
    getThemeAwareDarkenColor(tableBgColor, -5) ||
    themeColors.surface;

  if (isBrightColor(backgroundColor)) {
    [backgroundColor, borderColor] = [borderColor, backgroundColor];
  }

  const darkerBackgroundColor =
    getThemeAwareDarkenColor(backgroundColor, -5) || themeColors.surface;
  const textColorClass = getTextColorBasedOnBg(backgroundColor);

  // Sorting state and sorted data
  const [sortState, setSortState] = useState<SortState>({
    key: null,
    order: "asc",
  });
  const [sortedData, setSortedData] = useState<T[]>(data);
  const [invalidSortKeys] = useState([
    "actions",
    "rank",
    "",
    "opp",
    "Day",
    "Home",
    "Away",
  ]);

  // When data or sortState changes, update sortedData
  useEffect(() => {
    if (sortState.key === null) {
      setSortedData(data);
      return;
    }
    const { key, order } = sortState;
    const sorted = [...data].sort((a: any, b: any) => {
      if (league === SimNFL && key === "Overall") {
        if (a.ShowLetterGrade && !b.ShowLetterGrade) return 1;
        if (!a.ShowLetterGrade && b.ShowLetterGrade) return -1;
      }
      if (
        key.includes("Y1") ||
        key.includes("Y2") ||
        key.includes("Y3") ||
        key.includes("Y4") ||
        key.includes("Y5") ||
        key.includes("ContractLength")
      ) {
        if (a.Contract[key] > b.Contract[key]) return order === "asc" ? -1 : 1;
        if (a.Contract[key] < b.Contract[key]) return order === "asc" ? 1 : -1;
      }

      if (key.includes("Grade")) {
        const gradeOrder = [
          "A+",
          "A",
          "A-",
          "B+",
          "B",
          "B-",
          "C+",
          "C",
          "C-",
          "D+",
          "D",
          "D-",
          "F",
        ];
        const ai = gradeOrder.indexOf(a[key] ?? "");
        const bi = gradeOrder.indexOf(b[key] ?? "");
        // if either grade isn’t found, fallback to string compare
        if (ai === -1 || bi === -1) {
          if (a[key] < b[key]) return order === "asc" ? -1 : 1;
          if (a[key] > b[key]) return order === "asc" ? 1 : -1;
          return 0;
        }
        if (ai < bi) return order === "asc" ? -1 : 1;
        if (ai > bi) return order === "asc" ? 1 : -1;
        return 0;
      }
      if (page === "StatsPLAYER") {
        if (
          key.includes("LastName") ||
          key.includes("Team") ||
          key.includes("TeamName") ||
          key.includes("Position") ||
          key.includes("Archetype") ||
          key.includes("Year") ||
          key.includes("Overall")
        ) {
          if (!a.Player || !b.Player) return 0;
          if (a.Player[key] > b.Player[key]) return order === "asc" ? -1 : 1;
          if (a.Player[key] < b.Player[key]) return order === "asc" ? 1 : -1;
          return 0;
        }
      }
      if (page === "StatsTEAM") {
        if (
          key.includes("Conference") ||
          key.includes("Team") ||
          key.includes("TeamName")
        ) {
          if (!a.Team || !b.Team) return 0;
          if (a.Team[key] > b.Team[key]) return order === "asc" ? -1 : 1;
          if (a.Team[key] < b.Team[key]) return order === "asc" ? 1 : -1;
          return 0;
        }
      }
      if (page === "RecruitingProfileTable") {
        if (
          key.includes("LastName") ||
          key.includes("Position") ||
          key.includes("Archetype") ||
          key.includes("Stars") ||
          key.includes("City") ||
          key.includes("HighSchool") ||
          key.includes("State") ||
          key.includes("Country") ||
          key.includes("OverallGrade") ||
          key.includes("PotentialGrade") ||
          key.includes("AffinityOne") ||
          key.includes("AffinityTwo") ||
          key.includes("RecruitingStatus") ||
          key.includes("SignedStatus")
        ) {
          if (!a.Croot || !b.Croot) return 0;
          if (a.Croot[key] > b.Croot[key]) return order === "asc" ? -1 : 1;
          if (a.Croot[key] < b.Croot[key]) return order === "asc" ? 1 : -1;
          return 0;
        }
      }
      if (a[key] < b[key]) return order === "asc" ? -1 : 1;
      if (a[key] > b[key]) return order === "asc" ? 1 : -1;
      return 0;
    });
    setSortedData(sorted);
  }, [data, sortState, page]);

  const pageSize = 100;

  const pagedData = useMemo(() => {
    if (!enablePagination) return sortedData;
    const start = currentPage!! * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [enablePagination, sortedData, currentPage, pageSize]);

  // Handler for sorting column
  const handleSort = (accessor: string) => {
    if (invalidSortKeys.includes(accessor)) return;
    setSortState((prev) => {
      const newOrder =
        prev.key === accessor && prev.order === "asc" ? "desc" : "asc";
      return { key: accessor, order: newOrder };
    });
  };

  return (
    <div className="overflow-x-auto w-full">
      <div
        className={`sm:table table-auto w-full border-b-2`}
        style={{ backgroundColor, borderColor }}
      >
        {/* Header */}
        <div className="table-header-group sticky top-0">
          <div
            className={`table-row text-left ${textColorClass}`}
            style={{ backgroundColor: backgroundColor, borderColor }}
          >
            {columns.map((col) => (
              <div
                key={col.accessor}
                title={col.accessor}
                className="table-cell border-b-2 px-[0.6vw] py-[0.25vw] font-semibold whitespace-nowrap cursor-pointer"
                style={{
                  backgroundColor: backgroundColor,
                  borderColor: borderColor,
                }}
                onClick={() => handleSort(col.accessor)}
              >
                <div className="flex flex-row gap-x-[0.5vw]">
                  <Text variant="body-small">{col.header}</Text>
                  {sortState.key === col.accessor
                    ? sortState.order === "asc"
                      ? " 🔼"
                      : " 🔽"
                    : null}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Body */}
        <div className="table-row-group">
          {pagedData.map((item, index) => {
            const bg = index % 2 === 0 ? darkerTableBgColor : tableBgColor;
            return (
              <React.Fragment key={index}>
                {rowRenderer(item, index, bg)}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface TableCellProps {
  children: any;
  classes?: string;
}

export const TableCell: FC<TableCellProps> = ({ children, classes }) => {
  const extraClasses = classes ? classes : "";
  return (
    <div
      className={`table-cell align-middle ${extraClasses} flex-wrap sm:flex-nowrap sm:px-[0.3vw] pb-1 sm:py-[0.25vw] whitespace-nowrap`}
    >
      {children}
    </div>
  );
};
