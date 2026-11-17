import { FC } from "react";
import { gradeColor } from "../Team/baseball/baseballColorConfig";
import { VbAbilityGrades, VbEstimates } from "../../_services/volleyballService";

// A player's ability as letter grades: an overall at her position and one
// grade for each of the seven rating families. For a college player these are
// either the public consensus everyone sees or, for a coach, their own staff's
// estimate, which is a range ("B-–A-") when the staff is unsure. Grades are
// shown as sent: never averaged, and never turned back into numbers.

/** The seven families, in the order every table shows them. */
export const vbFamilies: Array<[key: string, short: string, label: string]> = [
  ["Physical", "PHY", "Physical"],
  ["Serving", "SRV", "Serving"],
  ["BallControl", "BC", "Ball Control"],
  ["Setting", "SET", "Setting"],
  ["Attacking", "ATK", "Attacking"],
  ["Blocking", "BLK", "Blocking"],
  ["Temperament", "TMP", "Temperament"],
];

export const vbPositions = ["S", "OH", "OPP", "MB", "L"] as const;

/** The grades to show for one player, wherever they came from. */
export interface VbGradeSet {
  Overall?: string | null;
  OverallByPosition?: Record<string, string> | null;
  Families?: Record<string, string> | null;
  /** True when these are a coach's own staff's estimate. */
  estimate?: boolean;
}

type Athlete = VbEstimates["Athletes"][number];

/**
 * What to show for a player: a coach's own staff's estimate when they have
 * one, otherwise the public grades.
 */
export const vbGradesFor = (
  publicGrades: VbAbilityGrades | null | undefined,
  athlete?: Athlete,
): VbGradeSet | null => {
  if (athlete && (athlete.Overall || athlete.Families)) {
    return {
      Overall: athlete.Overall,
      OverallByPosition: athlete.OverallByPosition,
      Families: athlete.Families,
      estimate: true,
    };
  }
  return publicGrades ?? null;
};

const order = ["F", "D", "C", "B", "A"];

/**
 * Where a grade sits from F- to A+, for sorting a column. A range sorts by
 * its lower end, which is the first grade it shows.
 */
export const vbGradeRank = (value: string | null | undefined) => {
  if (!value) return null;
  const first = value.split("–")[0].trim();
  const letter = order.indexOf(first[0]);
  if (letter < 0) return null;
  return letter * 3 + (first.endsWith("+") ? 1 : first.endsWith("-") ? -1 : 0);
};

/** One grade, or a range of two, in the site's grade colours. */
export const VbGrade: FC<{ value: string | null | undefined }> = ({
  value,
}) => {
  if (!value) return <span className="text-(--text-muted)">—</span>;
  const ends = value.split("–").map((end) => end.trim());
  return (
    <span className="whitespace-nowrap tabular-nums">
      {ends.map((end, index) => (
        <span key={index}>
          {index > 0 && <span className="text-(--text-muted)">–</span>}
          <span className={gradeColor(end)}>{end}</span>
        </span>
      ))}
    </span>
  );
};

/**
 * A player's grades laid out for a profile: her overall, then her overall at
 * each position, then the seven families.
 */
export const VbGradeCard: FC<{
  grades: VbGradeSet;
  position?: string | null;
}> = ({ grades, position }) => (
  <div className="space-y-3 text-left">
    <div className="flex flex-wrap items-stretch gap-2">
      <div className="flex min-w-20 flex-col items-center justify-center rounded-lg bg-(--sport-surface-2) px-3 py-2">
        <div className="text-xs uppercase text-(--text-muted)">
          Overall{position ? ` · ${position}` : ""}
        </div>
        <div className="text-2xl">
          <VbGrade value={grades.Overall} />
        </div>
      </div>
      {vbFamilies.map(([key, , label]) => (
        <div
          key={key}
          className="flex min-w-20 flex-1 flex-col items-center justify-center rounded border border-(--sport-divider) px-2 py-2"
        >
          <div className="text-xs uppercase text-(--text-muted)">{label}</div>
          <div className="text-lg">
            <VbGrade value={grades.Families?.[key]} />
          </div>
        </div>
      ))}
    </div>
    {grades.OverallByPosition && (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="text-xs uppercase text-(--text-muted)">
          Overall at each position
        </span>
        {vbPositions.map((item) => (
          <span key={item}>
            <span className="text-(--text-muted)">{item}</span>{" "}
            <VbGrade value={grades.OverallByPosition?.[item]} />
          </span>
        ))}
      </div>
    )}
  </div>
);

/** One line saying whose view the grades on screen are. */
export const vbGradeNote = (grades: VbGradeSet | null | undefined, pro: boolean) =>
  grades?.estimate
    ? "Grades are your staff's estimate. A range means they are not sure; it narrows the better they know a player."
    : pro
      ? "Grades come from a pro's true ratings."
      : "Grades are the public read on a college player, the same for everyone, and can be a step off. Her exact ratings are known only to coaching staffs, as estimates.";
