import { FC, memo } from "react";
import { ratingColor, gradeColor } from "../../baseballColorConfig";

interface AttrRowProps {
  attrKey: string;
  label: string;
  letterGrades?: Record<string, string>;
  attributes?: Record<string, number>;
  isHidden?: boolean;
  isFuzzed?: boolean;
  compact?: boolean;
}

export const AttrRow: FC<AttrRowProps> = memo(
  ({ attrKey, label, letterGrades, attributes, isHidden, isFuzzed, compact }) => {
    const grade = letterGrades?.[attrKey];
    const numeric = attributes?.[`${attrKey}_display`];

    const cls = compact
      ? "flex justify-between text-xs"
      : "flex justify-between text-xs py-0.5";

    if (isHidden && !grade && numeric == null) {
      return (
        <div className={cls}>
          <span className="text-gray-400">{label}</span>
          <span className="text-gray-500">?</span>
        </div>
      );
    }

    return (
      <div className={cls}>
        <span className="text-gray-400">{label}</span>
        <span className="flex gap-1.5">
          {grade && (
            <span className={`font-semibold ${gradeColor(grade)}`}>
              {grade}
            </span>
          )}
          {numeric != null && (
            <span
              className={`${ratingColor(numeric)} ${grade ? "text-gray-300" : "font-semibold"}`}
            >
              {grade ? `(${numeric.toFixed(0)})` : `${numeric.toFixed(0)}`}
            </span>
          )}
          {!grade && numeric == null && (
            <span className="text-gray-500">?</span>
          )}
        </span>
      </div>
    );
  },
);
