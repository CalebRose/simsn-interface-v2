import { FC } from "react";
import { CurrencyInput } from "./FreeAgency/CurrencyInput";
import { shortMoney } from "../../Common/MoneyInput";

// ═══════════════════════════════════════════════
// Shared contract-entry pieces for the baseball extension, free agent offer
// and free agent signing modals: a years picker, per-year salary rows, and a
// one-line live summary meant for the modal's pinned footer.
// ═══════════════════════════════════════════════

export const MAX_CONTRACT_YEARS = 5;

/** Per-year salary that reaches `total` over `years`, rounded up to $1,000 so it never lands just under. */
export const evenSalary = (total: number, years: number) =>
  years > 0 ? Math.ceil(Math.max(0, total) / years / 1000) * 1000 : 0;

// ── Years ─────────────────────────────────────

interface YearsPickerProps {
  value: number;
  onChange: (years: number) => void;
  /** Lengths outside this range can't be picked. */
  min?: number;
  max?: number;
  /** Lengths below this are allowed but shown faded (e.g. below the player's minimum). */
  softMin?: number;
  softMinTitle?: string;
}

export const YearsPicker: FC<YearsPickerProps> = ({
  value,
  onChange,
  min = 1,
  max = MAX_CONTRACT_YEARS,
  softMin,
  softMinTitle,
}) => (
  <div role="radiogroup" aria-label="Contract length in years" className="flex gap-1.5">
    {Array.from({ length: MAX_CONTRACT_YEARS }, (_, i) => i + 1).map((y) => {
      const selected = y === value;
      const outOfRange = y < min || y > max;
      const faded = softMin != null && y < softMin && !selected;
      return (
        <button
          key={y}
          type="button"
          role="radio"
          aria-checked={selected}
          disabled={outOfRange}
          onClick={() => onChange(y)}
          title={faded ? softMinTitle : outOfRange ? "Outside the lengths he'll accept" : undefined}
          className={`flex-1 sm:flex-none sm:w-12 min-h-11 sm:min-h-9 !px-0 text-base sm:text-sm font-semibold rounded-sm border transition-colors ${
            selected
              ? "bg-blue-600 border-blue-600 text-white"
              : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600"
          } ${faded ? "opacity-50" : ""} ${outOfRange ? "opacity-25 cursor-not-allowed" : ""}`}
        >
          {y}
        </button>
      );
    })}
  </div>
);

// ── Offer value ───────────────────────────────
//
// Players value a bonus dollar above a salary dollar: an offer is worth
// salaries + bonus x (1 + premium) to him, and his ask is checked against that
// value (per year and in total). Veterans' MLB seasons must each pay at least
// a minimum salary, which the bonus doesn't count toward. The cash a club pays
// is still salaries + bonus.

export interface ValueRules {
  /** Extra weight of a bonus dollar toward the ask; 0.15 means it counts as $1.15. */
  premium: number;
  /** Lowest salary any season may pay, or null when no floor applies. */
  minSalary: number | null;
}

/** Rules from an API demand; the floor only applies when `floorApplies` (an MLB-level deal). */
export const valueRules = (
  premium: number | null | undefined,
  vetMin: number | null | undefined,
  floorApplies = true,
): ValueRules => ({
  premium: premium ?? 0,
  minSalary: floorApplies && vetMin ? vetMin : null,
});

/** What a bonus is worth toward the ask. */
export const bonusValue = (bonus: number, rules: ValueRules) => bonus * (1 + rules.premium);

/** The offer as the player values it. */
export const offerValue = (salaries: number[], years: number, bonus: number, rules: ValueRules) =>
  salaries.slice(0, years).reduce((sum, v) => sum + v, 0) + bonusValue(bonus, rules);

/** Per-year salary that, with the bonus, reaches the ask, never below the floor. */
export const salaryToAsk = (askTotal: number, years: number, bonus: number, rules: ValueRules) =>
  Math.max(rules.minSalary ?? 0, evenSalary(askTotal - bonusValue(bonus, rules), years));

/** The validation message for seasons under the floor, or null. */
export const floorError = (salaries: number[], years: number, rules: ValueRules) => {
  if (rules.minSalary == null) return null;
  const low = salaries
    .slice(0, years)
    .map((v, i) => (v < rules.minSalary! ? i + 1 : 0))
    .filter(Boolean);
  if (low.length === 0) return null;
  return `Every season must pay at least ${dollars(rules.minSalary)} in salary (veteran minimum); ${
    low.length === 1 ? `Year ${low[0]} is` : `Years ${low.join(", ")} are`
  } below it`;
};

const dollars = (n: number) => `$${Math.round(n).toLocaleString()}`;

/** The one-line hint shown by the bonus field. */
export const BonusHint: FC<{ rules: ValueRules }> = ({ rules }) => {
  const parts: string[] = [];
  if (rules.premium > 0) {
    parts.push(`Bonus dollars count ${Math.round(rules.premium * 100)}% more toward the player's ask`);
  }
  if (rules.minSalary != null) {
    parts.push(`salaries must stay at or above ${shortMoney(rules.minSalary)} a season`);
  }
  if (parts.length === 0) return null;
  const text = parts.join("; ");
  return (
    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
      {text.charAt(0).toUpperCase() + text.slice(1)}.
    </p>
  );
};

// ── Salaries ──────────────────────────────────

interface SalaryRowsProps {
  years: number;
  /** Always MAX_CONTRACT_YEARS long; only the first `years` are shown and sent. */
  salaries: number[];
  onChange: (salaries: number[]) => void;
  idPrefix: string;
  /**
   * When a year is raised, lift any later year that would fall below it.
   * For contracts whose salaries may never go down year to year.
   */
  raiseLaterYears?: boolean;
  /** Lowest salary a season may pay; seasons under it are flagged and the shift buttons stop there. */
  minSalary?: number | null;
  /** Spreads the ask across the years; omit to hide the button. */
  onFillToAsk?: () => void;
  fillToAskLabel?: string;
}

const TOOL_CLASS =
  "min-h-9 sm:min-h-7 px-2.5 text-xs font-medium rounded-sm border border-gray-400/40 hover:bg-gray-500/15 active:bg-gray-500/25 disabled:opacity-40";

const SHIFT_STEP = 1_000_000;

export const SalaryRows: FC<SalaryRowsProps> = ({
  years,
  salaries,
  onChange,
  idPrefix,
  raiseLaterYears = false,
  minSalary = null,
  onFillToAsk,
  fillToAskLabel = "Fill to his ask",
}) => {
  const floor = minSalary ?? 0;

  const setYear = (index: number, amount: number) => {
    const next = [...salaries];
    next[index] = Math.max(0, amount);
    if (raiseLaterYears) {
      for (let j = index + 1; j < next.length; j++) {
        if (next[j] < next[index]) next[j] = next[index];
      }
    }
    onChange(next);
  };

  const sameEveryYear = () => onChange(salaries.map(() => salaries[0] ?? 0));
  const allSame = salaries.slice(0, years).every((s) => s === salaries[0]);

  /** Moves every year by the same amount, stopping at the floor, so the shape of the deal holds. */
  const shiftAll = (by: number) => onChange(salaries.map((s) => Math.max(floor, s + by)));
  const allAtFloor = salaries.slice(0, years).every((s) => s <= floor);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="text-sm font-semibold">Salary by year</span>
        <div className="flex flex-wrap gap-1.5">
          {onFillToAsk && (
            <button type="button" className={TOOL_CLASS} onClick={onFillToAsk}>
              {fillToAskLabel}
            </button>
          )}
          {years > 1 && (
            <button
              type="button"
              className={TOOL_CLASS}
              onClick={sameEveryYear}
              disabled={allSame}
              title="Copy Year 1's salary to every year"
            >
              Same every year
            </button>
          )}
          <button
            type="button"
            className={TOOL_CLASS}
            onClick={() => shiftAll(-SHIFT_STEP)}
            disabled={allAtFloor}
            title={`Lower every year's salary by $1M (not below ${minSalary ? shortMoney(minSalary) : "$0"})`}
          >
            All −$1M
          </button>
          <button
            type="button"
            className={TOOL_CLASS}
            onClick={() => shiftAll(SHIFT_STEP)}
            title="Raise every year's salary by $1M"
          >
            All +$1M
          </button>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: years }, (_, i) => {
          const low = minSalary != null && (salaries[i] ?? 0) < minSalary;
          return (
            <div key={i} className="flex items-center gap-2">
              <label
                htmlFor={`${idPrefix}-salary-${i}`}
                className="w-14 shrink-0 text-sm text-gray-600 dark:text-gray-300"
              >
                Year {i + 1}
              </label>
              <CurrencyInput
                id={`${idPrefix}-salary-${i}`}
                className="flex-1 min-w-0"
                value={salaries[i] ?? 0}
                onChange={(v) => setYear(i, v)}
                invalid={low}
              />
            </div>
          );
        })}
      </div>
      {(raiseLaterYears && years > 1) || minSalary != null ? (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {minSalary != null &&
            `Each season must pay at least ${shortMoney(minSalary)} in salary (veteran minimum); the bonus doesn't count toward it. `}
          {raiseLaterYears && years > 1 &&
            "Salaries can't go down year to year, so raising a year lifts the years after it."}
        </p>
      ) : null}
    </div>
  );
};

// ── Bonus share of the ask ────────────────────

export const BONUS_SHARES = [0, 25, 50, 75, 100] as const;

/**
 * Splits the ask between salary and bonus so the offer still meets it:
 * salaries carry (100 - pct)% of the ask's value, spread evenly and never
 * below the floor; the bonus covers the rest, divided by its 1 + premium
 * weight. 100% is the most bonus allowed (salaries at the floor).
 * Rounded to $1,000, upward, so the value never lands just under.
 */
export const splitAsk = (askTotal: number, years: number, pct: number, rules: ValueRules) => {
  const ask = Math.max(0, askTotal);
  const perYear = Math.max(rules.minSalary ?? 0, evenSalary((ask * (100 - pct)) / 100, years));
  const bonus = Math.max(0, Math.ceil((ask - perYear * years) / (1 + rules.premium) / 1000) * 1000);
  return { bonus, perYear };
};

interface BonusShareProps {
  /** The value he's asking for over the current length. */
  askTotal: number;
  years: number;
  bonus: number;
  salaries: number[];
  rules: ValueRules;
  /** Applies the split: set the bonus and every year's salary. */
  onPick: (bonus: number, perYear: number) => void;
}

export const BonusShare: FC<BonusShareProps> = ({ askTotal, years, bonus, salaries, rules, onPick }) => {
  if (askTotal <= 0) return null;
  return (
    <div className="mt-2">
      <span className="block mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
        Share of his ask paid as bonus (salary covers the rest)
      </span>
      <div className="flex gap-1.5" role="group" aria-label="Share of his ask paid as bonus">
        {BONUS_SHARES.map((pct) => {
          const split = splitAsk(askTotal, years, pct, rules);
          const active =
            bonus === split.bonus && salaries.slice(0, years).every((v) => v === split.perYear);
          return (
            <button
              key={pct}
              type="button"
              aria-pressed={active}
              title={`Bonus ${shortMoney(split.bonus)}, salary ${shortMoney(split.perYear)} a year${
                pct === 100 && rules.minSalary != null ? " (the most bonus allowed)" : ""
              }`}
              onClick={() => onPick(split.bonus, split.perYear)}
              className={`flex-1 sm:flex-none sm:px-3 min-h-9 sm:min-h-7 text-xs font-medium rounded-sm border tabular-nums ${
                active
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-400/40 hover:bg-gray-500/15 active:bg-gray-500/25"
              }`}
            >
              {pct}%
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Live ledger (for the modal footer) ────────
//
// Two lines that keep cash and value apart:
//   You pay    $37.4M  · $20.0M salary over 4 seasons + $17.4M bonus at signing
//   He counts  $40.0M of $40.0M needed  · 4 yr x $10.0M
// with a bar toward the target and a meets / short pill.

interface OfferLedgerProps {
  years: number;
  salaries: number[];
  bonus: number;
  rules: ValueRules;
  /** Value he needs over the selected length. */
  target: number;
  /** How the target is made up, e.g. "4 yr × $10M" or "his minimum total". */
  targetNote: string;
  /** A reason the offer fails regardless of money (e.g. too few years). */
  blocker?: string | null;
}

const cents = (n: number) => Math.round(n * 100);

export const OfferLedger: FC<OfferLedgerProps> = ({
  years,
  salaries,
  bonus,
  rules,
  target,
  targetNote,
  blocker,
}) => {
  const salaryTotal = salaries.slice(0, years).reduce((sum, v) => sum + v, 0);
  const cash = salaryTotal + bonus;
  const value = offerValue(salaries, years, bonus, rules);
  const hasTarget = target > 0;
  const meets = hasTarget && cents(value) >= cents(target) && !blocker;
  const short = Math.max(0, target - value);
  const fill = hasTarget ? Math.min(1, value / target) : 0;
  const bonusCountsExtra = rules.premium > 0 && bonus > 0;

  return (
    <div className="text-sm text-start" aria-live="polite">
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 items-baseline">
        <span className="text-gray-500 dark:text-gray-400">You pay</span>
        <span className="tabular-nums">
          <strong>{shortMoney(cash)}</strong>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {" "}· {shortMoney(salaryTotal)} salary over {years} {years === 1 ? "season" : "seasons"} +{" "}
            {shortMoney(bonus)} bonus at signing
          </span>
        </span>

        <span className="text-gray-500 dark:text-gray-400">He counts</span>
        <span className="tabular-nums">
          <strong>{shortMoney(value)}</strong>
          {hasTarget && (
            <>
              {" "}of <strong>{shortMoney(target)}</strong> needed
            </>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {hasTarget && <> · {targetNote}</>}
            {bonusCountsExtra && <> · bonus counts ×{(1 + rules.premium).toFixed(2)}</>}
          </span>
        </span>
      </div>

      {hasTarget && (
        <div className="mt-1.5 flex items-center gap-2">
          <div
            className="h-1.5 flex-1 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden"
            role="meter"
            aria-label="Value toward his ask"
            aria-valuemin={0}
            aria-valuemax={target}
            aria-valuenow={Math.round(value)}
          >
            <div
              className={`h-full rounded-full ${meets ? "bg-green-500" : "bg-amber-500"}`}
              style={{ width: `${fill * 100}%` }}
            />
          </div>
          <span
            className={`shrink-0 px-2 py-0.5 text-xs rounded-sm font-medium ${
              meets
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            }`}
          >
            {meets
              ? "✓ Meets his ask"
              : blocker
                ? `✗ ${blocker}`
                : `✗ $${Math.ceil(short).toLocaleString()} short`}
          </span>
        </div>
      )}
    </div>
  );
};

/** "4 yr × $10M", or "his minimum total" when that's what binds. */
export const targetNoteFor = (years: number, minAav: number, minTotal = 0) =>
  minTotal > minAav * years
    ? "his minimum total"
    : `${years} yr × ${shortMoney(minAav)}`;
