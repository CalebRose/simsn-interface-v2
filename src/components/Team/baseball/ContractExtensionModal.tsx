import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { Modal } from "../../../_design/Modal";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { Input } from "../../../_design/Inputs";
import { Border } from "../../../_design/Borders";
import { BaseballService } from "../../../_services/baseballService";
import { ApiError } from "../../../_helper/fetchHelper";
import { ContractDemand } from "../../../models/baseball/baseballFreeAgencyModels";
import { ExtendErrorCode, ExtendResponse } from "../../../models/baseball/baseballTransactionModels";

// ═══════════════════════════════════════════════
// Contract Extension modal
//
// Rules (server-enforced, see contract extensions frontend guide):
//  - Only for rows where contract overview `extension_eligible` is true.
//  - Accepted iff AAV >= min_aav and years >= min_years, where
//    AAV = (sum of salaries + bonus) / years. No chance, unlimited attempts.
//  - A rejected offer keeps the modal open so the user can raise it and resend.
// ═══════════════════════════════════════════════

const MAX_YEARS = 5;
const YEAR_OPTIONS = [1, 2, 3, 4, 5];

/** Codes meaning the action is no longer valid for this contract — close and refresh. */
const STALE_CODES: ReadonlySet<ExtendErrorCode> = new Set([
  "not_holder",
  "not_mlb",
  "not_final_year",
  "not_fa_eligible",
  "already_extended",
  "not_in_force",
  "not_found",
]);

interface NormalizedDemand {
  minAav: number;
  minYears: number;
  war: number;
}

const formatDollars = (n: number) =>
  `$${Math.round(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const formatMillions = (n: number) => `$${(n / 1_000_000).toFixed(2)}M`;

const FieldLabel: FC<{ htmlFor: string; children: ReactNode }> = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="block mb-1 text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap"
  >
    {children}
  </label>
);

export interface ContractExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: number;
  playerName: string;
  contractId: number;
  orgId: number;
  leagueYearId: number;
  /** Cached demand from the contract overview, if any. Fetched/computed otherwise. */
  demand?: ContractDemand | null;
  /** Called after the extension is signed. */
  onSigned: (res: ExtendResponse) => void;
  /** Called when the server says the action no longer applies (refresh eligibility). */
  onStale?: () => void;
}

export const ContractExtensionModal: FC<ContractExtensionModalProps> = ({
  isOpen,
  onClose,
  playerId,
  playerName,
  contractId,
  orgId,
  leagueYearId,
  demand: cachedDemand,
  onSigned,
  onStale,
}) => {
  // --- Demand ---
  const initialDemand: NormalizedDemand | null =
    cachedDemand && cachedDemand.type === "extension"
      ? {
          minAav: parseFloat(cachedDemand.min_aav) || 0,
          minYears: cachedDemand.min_years,
          war: cachedDemand.war,
        }
      : null;
  const [demand, setDemand] = useState<NormalizedDemand | null>(initialDemand);
  const [demandLoading, setDemandLoading] = useState(initialDemand === null);
  const [demandError, setDemandError] = useState(false);

  // --- Signing budget (bonus is charged immediately) ---
  const [budget, setBudget] = useState<number | null>(null);

  // --- Form ---
  const [years, setYears] = useState(initialDemand?.minYears ?? 2);
  const [yearsTouched, setYearsTouched] = useState(false);
  const [salaries, setSalaries] = useState<number[]>(() => Array(MAX_YEARS).fill(0));
  const [bonus, setBonus] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejection, setRejection] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    if (initialDemand) return;
    let cancelled = false;
    const load = async () => {
      setDemandLoading(true);
      setDemandError(false);
      try {
        let res;
        try {
          res = await BaseballService.GetExtensionDemand(playerId, leagueYearId);
        } catch (err) {
          if (!(err instanceof ApiError) || err.status !== 404) throw err;
          res = await BaseballService.ComputeExtensionDemand({
            player_id: playerId,
            league_year_id: leagueYearId,
            demand_type: "extension",
            contract_id: contractId,
          });
        }
        if (cancelled) return;
        setDemand({
          minAav: parseFloat(res.min_aav) || 0,
          minYears: res.min_years,
          war: res.war,
        });
      } catch {
        // Non-fatal: the server computes the demand on the first offer anyway.
        if (!cancelled) setDemandError(true);
      } finally {
        if (!cancelled) setDemandLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // initialDemand is derived from props once; only refetch if the target changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, leagueYearId, contractId]);

  useEffect(() => {
    let cancelled = false;
    BaseballService.GetSigningBudget(orgId, leagueYearId)
      .then((res) => {
        if (!cancelled) setBudget(res.available_budget);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [orgId, leagueYearId]);

  // Start the years selector at the player's minimum once it is known.
  useEffect(() => {
    if (demand && !yearsTouched) {
      setYears(Math.min(MAX_YEARS, Math.max(1, demand.minYears)));
    }
  }, [demand, yearsTouched]);

  // --- Derived ---
  const activeSalaries = salaries.slice(0, years);
  const totalSalary = activeSalaries.reduce((sum, s) => sum + s, 0);
  const totalValue = totalSalary + bonus;
  const aav = years > 0 ? totalValue / years : 0;

  const meetsAav = demand ? aav >= demand.minAav : null;
  const meetsYears = demand ? years >= demand.minYears : null;
  const meetsDemand = meetsAav === true && meetsYears === true;

  const formErrors = useMemo(() => {
    const errs: string[] = [];
    if (years < 1 || years > MAX_YEARS) errs.push(`Extension length must be 1-${MAX_YEARS} years`);
    if (activeSalaries.some((s) => s < 0)) errs.push("Salaries cannot be negative");
    if (bonus < 0) errs.push("Bonus cannot be negative");
    if (totalValue <= 0) errs.push("Enter salaries and/or a bonus");
    if (budget != null && bonus > budget) {
      errs.push(`Bonus exceeds available signing budget (${formatDollars(budget)})`);
    }
    return errs;
  }, [years, activeSalaries, bonus, totalValue, budget]);

  // --- Handlers ---
  const clearRejection = () => setRejection(null);

  const handleYearsChange = (y: number) => {
    setYears(y);
    setYearsTouched(true);
    clearRejection();
  };

  const handleSalaryChange = useCallback((index: number, value: string) => {
    setSalaries((prev) => {
      const next = [...prev];
      next[index] = Math.max(0, Number(value) || 0);
      return next;
    });
    setRejection(null);
  }, []);

  /** Spread the remaining value evenly so the offer exactly meets the demanded AAV. */
  const handleFillToDemand = () => {
    if (!demand) return;
    const y = Math.max(years, demand.minYears);
    const needed = Math.max(0, demand.minAav * y - bonus);
    // Round each year up to the nearest $1,000 so AAV never lands just under.
    const perYear = Math.ceil(needed / y / 1000) * 1000;
    setYears(Math.min(MAX_YEARS, y));
    setYearsTouched(true);
    setSalaries((prev) => prev.map((s, i) => (i < y ? perYear : s)));
    clearRejection();
  };

  const handleSubmit = useCallback(async () => {
    if (formErrors.length > 0) return;
    setIsSubmitting(true);
    setRejection(null);
    try {
      const res = await BaseballService.ExtendContract({
        contract_id: contractId,
        org_id: orgId,
        years,
        salaries: salaries.slice(0, years),
        bonus,
        league_year_id: leagueYearId,
        executed_by: "user",
      });
      const throughYear = res.starts_league_year + res.years - 1;
      enqueueSnackbar(`${playerName} extended through ${throughYear}`, {
        variant: "success",
        autoHideDuration: 4000,
      });
      onSigned(res);
      onClose();
    } catch (err: any) {
      const code: ExtendErrorCode | null | undefined =
        err instanceof ApiError ? err.body?.code : undefined;
      const message: string = err?.message || "Extension failed";
      if (code && STALE_CODES.has(code)) {
        enqueueSnackbar(message, { variant: "warning", autoHideDuration: 5000 });
        onStale?.();
        onClose();
      } else {
        const isDemandMiss = /below player's minimum demand/i.test(message);
        setRejection({
          title: isDemandMiss ? "Offer rejected" : "Offer not submitted",
          message,
        });
      }
    }
    setIsSubmitting(false);
  }, [
    formErrors,
    contractId,
    orgId,
    years,
    salaries,
    bonus,
    leagueYearId,
    playerName,
    onSigned,
    onClose,
    onStale,
  ]);

  // --- Render ---
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Extend ${playerName}`}
      maxWidth="min-[1025px]:max-w-[60vw]"
      actions={
        <ButtonGroup>
          <Button size="sm" variant="danger" onClick={onClose}>
            <Text variant="small">Cancel</Text>
          </Button>
          <Button
            size="sm"
            variant={formErrors.length === 0 && meetsDemand ? "success" : "warning"}
            onClick={handleSubmit}
            disabled={formErrors.length > 0 || isSubmitting}
          >
            <Text variant="small">{isSubmitting ? "Submitting..." : "Submit Offer"}</Text>
          </Button>
        </ButtonGroup>
      }
    >
      {/* Player demand */}
      <Border direction="col" classes="p-3 mb-4 text-start">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <Text variant="h6">Player Demand</Text>
          {demand && (
            <button
              type="button"
              onClick={handleFillToDemand}
              className="px-2 py-0.5 text-xs rounded-sm bg-blue-600/20 text-blue-500 dark:text-blue-400 hover:bg-blue-600/40"
            >
              Fill salaries to demand
            </button>
          )}
        </div>
        {demandLoading && (
          <Text variant="small" classes="text-gray-500 dark:text-gray-400">
            Loading demand...
          </Text>
        )}
        {!demandLoading && demand && (
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <Text variant="small">
              Min AAV: <strong>{formatDollars(demand.minAav)}</strong>
            </Text>
            <Text variant="small">
              Min years: <strong>{demand.minYears}</strong>
            </Text>
            <Text variant="small">
              WAR: <strong>{demand.war}</strong>
            </Text>
          </div>
        )}
        {!demandLoading && !demand && demandError && (
          <Text variant="small" classes="text-gray-500 dark:text-gray-400">
            Demand unavailable — the player will still evaluate your offer when you submit it.
          </Text>
        )}
        <Text variant="xs" classes="mt-2 text-gray-500 dark:text-gray-400">
          Accepted immediately if AAV (salaries + bonus, divided by years) meets the minimum
          and the length meets the minimum years. You can resend as often as you like.
        </Text>
      </Border>

      {/* Years selector */}
      <div className="mb-4 text-start">
        <Text variant="small" classes="mb-1 font-semibold">
          Years
        </Text>
        <div className="flex gap-1.5">
          {YEAR_OPTIONS.map((y) => {
            const selected = y === years;
            const belowMin = demand != null && y < demand.minYears;
            return (
              <button
                key={y}
                type="button"
                onClick={() => handleYearsChange(y)}
                className={`w-10 !px-0 py-1 text-sm rounded-sm border transition-colors ${
                  selected
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600"
                } ${belowMin && !selected ? "opacity-50" : ""}`}
                title={belowMin ? `Below the player's minimum of ${demand!.minYears}` : undefined}
              >
                {y}
              </button>
            );
          })}
        </div>
      </div>

      {/* Per-year salaries */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-3">
        {YEAR_OPTIONS.map((y, i) => (
          <div key={y} className={`text-start ${i >= years ? "opacity-30 pointer-events-none" : ""}`}>
            <FieldLabel htmlFor={`ext_salary_${i}`}>Year {y} salary ($)</FieldLabel>
            <Input
              type="number"
              showLabel={false}
              classes="w-full"
              id={`ext_salary_${i}`}
              name={`salary_${i}`}
              value={salaries[i]}
              min={0}
              step={100000}
              disabled={i >= years}
              onChange={(e) => handleSalaryChange(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Bonus */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-2 mb-4 items-end">
        <div className="text-start">
          <FieldLabel htmlFor="ext_bonus">Signing bonus ($)</FieldLabel>
          <Input
            type="number"
            showLabel={false}
            classes="w-full"
            id="ext_bonus"
            name="bonus"
            value={bonus}
            min={0}
            step={100000}
            onChange={(e) => {
              setBonus(Math.max(0, Number(e.target.value) || 0));
              clearRejection();
            }}
          />
        </div>
        <Text variant="xs" classes="text-start text-gray-500 dark:text-gray-400 pb-2">
          Charged immediately and counted in AAV.
          {budget != null && <> Available signing budget: <strong>{formatDollars(budget)}</strong>.</>}
        </Text>
      </div>

      {/* Live summary */}
      <Border direction="col" classes="p-3 mb-3 text-start">
        <div className="flex flex-wrap gap-x-6 gap-y-1 items-center">
          <Text variant="small">
            Total: <strong>{formatMillions(totalValue)}</strong>
          </Text>
          <Text variant="small">
            AAV: <strong>{formatMillions(aav)}</strong>
          </Text>
          {demand && (
            <span
              className={`px-2 py-0.5 text-xs rounded-sm font-medium ${
                meetsDemand
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
              }`}
            >
              {meetsDemand
                ? "Meets the player's demand"
                : !meetsYears
                  ? `Needs at least ${demand.minYears} years`
                  : `AAV ${formatDollars(demand.minAav - aav)} short`}
            </span>
          )}
        </div>
        {formErrors.map((e) => (
          <Text key={e} variant="small" classes="mt-1 text-red-500">
            {e}
          </Text>
        ))}
      </Border>

      {/* Server rejection — modal stays open so the user can adjust and resend */}
      {rejection && (
        <div className="p-3 rounded-sm border border-red-400/50 bg-red-50 dark:bg-red-900/20 text-start">
          <Text variant="small" classes="font-semibold text-red-600 dark:text-red-400">
            {rejection.title}
          </Text>
          <Text variant="small" classes="text-red-600 dark:text-red-400">
            {rejection.message}
          </Text>
        </div>
      )}
    </Modal>
  );
};
