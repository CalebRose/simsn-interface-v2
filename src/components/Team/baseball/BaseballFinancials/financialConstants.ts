// Tab names
export const OVERVIEW_TAB = "Overview";
export const LEDGER_TAB = "Ledger";
export const CONTRACTS_TAB = "Contracts";
export const FINANCIALS_TABS = [OVERVIEW_TAB, LEDGER_TAB, CONTRACTS_TAB];

// Ledger entry type labels
export const ENTRY_TYPE_LABELS: Record<string, string> = {
  media: "Media",
  salary: "Salary",
  performance: "Performance",
  bonus: "Signing Bonus",
  buyout: "Buyout",
  interest_income: "Interest Income",
  interest_expense: "Interest Expense",
  playoff_gate: "Playoff Gate",
  playoff_media: "Playoff Media",
};

// Contract phase badge styling
export const PHASE_CONFIG: Record<string, { label: string; classes: string }> = {
  minor:        { label: "Minor",        classes: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" },
  pre_arb:      { label: "Pre-Arb",      classes: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
  arb_eligible: { label: "Arb Eligible", classes: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" },
  fa_eligible:  { label: "FA Eligible",  classes: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" },
};

// Level display names
export const LEVEL_NAMES: Record<number, string> = {
  9: "MLB", 8: "AAA", 7: "AA", 6: "High-A", 5: "A", 4: "Scraps",
};

// Salary constants for auto-renewal projections
export const MINOR_SALARY = 40_000;
export const PRE_ARB_SALARY = 800_000;
export const ARB_ESTIMATED_SALARY = 3_000_000;

// Shared formatters
export const formatMoney = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export const signedMoney = (n: number) => {
  if (n >= 0) return `+${formatMoney(n)}`;
  return `-${formatMoney(Math.abs(n))}`;
};
