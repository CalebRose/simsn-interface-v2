import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { Modal } from "../../../_design/Modal";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { Border } from "../../../_design/Borders";
import { BaseballService } from "../../../_services/baseballService";
import { ApiError } from "../../../_helper/fetchHelper";
import { ContractDemand } from "../../../models/baseball/baseballFreeAgencyModels";
import { ExtendErrorCode, ExtendResponse } from "../../../models/baseball/baseballTransactionModels";
import { stepPresets } from "../../Common/MoneyInput";
import { CurrencyInput } from "./FreeAgency/CurrencyInput";
import {
  MAX_CONTRACT_YEARS,
  OfferLedger,
  targetNoteFor,
  SalaryRows,
  YearsPicker,
  BonusHint,
  BonusShare,
  ValueRules,
  floorError,
  offerValue,
  salaryToAsk,
  valueRules,
} from "./ContractTerms";

// ═══════════════════════════════════════════════
// Contract Extension modal
//
// Rules (server-enforced, see contract extensions frontend guide):
//  - Only for rows where contract overview `extension_eligible` is true.
//  - Accepted iff value per year >= min_aav and years >= min_years, where
//    value = salaries + bonus x (1 + bonus_value_premium): the player counts a
//    bonus dollar at $1.15. No chance, unlimited attempts.
//  - Veterans (veteran_min_salary set) must be paid at least that salary in
//    every season; the bonus doesn't count toward it. Extensions are MLB-only,
//    so the floor always applies when it's set.
//  - The bonus is paid at signing from cash not reserved by open FA offers.
//  - A rejected offer keeps the modal open so the user can raise it and resend.
// ═══════════════════════════════════════════════

const MAX_YEARS = MAX_CONTRACT_YEARS;

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
  rules: ValueRules;
}

const formatMoney = (n: number) =>
  `$${Math.round(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;


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
          rules: valueRules(cachedDemand.bonus_value_premium, cachedDemand.veteran_min_salary),
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
          rules: valueRules(res.bonus_value_premium, res.veteran_min_salary),
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

  // Start the salaries at his demand (never below the veteran minimum) once it
  // is known, unless the user has already entered something.
  useEffect(() => {
    if (!demand) return;
    setSalaries((prev) =>
      prev.every((s) => s === 0)
        ? Array(MAX_YEARS).fill(salaryToAsk(demand.minAav, 1, 0, demand.rules))
        : prev,
    );
  }, [demand]);

  // --- Derived ---
  // Cash is what the club pays; value is what the player weighs (bonus x 1.15).
  const rules: ValueRules = demand?.rules ?? valueRules(0, null);
  const activeSalaries = salaries.slice(0, years);
  const totalSalary = activeSalaries.reduce((sum, s) => sum + s, 0);
  const totalValue = totalSalary + bonus;
  const value = offerValue(salaries, years, bonus, rules);
  const valuePerYear = years > 0 ? value / years : 0;

  const meetsAav = demand ? valuePerYear >= demand.minAav : null;
  const meetsYears = demand ? years >= demand.minYears : null;
  const meetsDemand = meetsAav === true && meetsYears === true;

  const formErrors = useMemo(() => {
    const errs: string[] = [];
    if (years < 1 || years > MAX_YEARS) errs.push(`Extension length must be 1-${MAX_YEARS} years`);
    if (activeSalaries.some((s) => s < 0)) errs.push("Salaries cannot be negative");
    if (bonus < 0) errs.push("Bonus cannot be negative");
    if (totalValue <= 0) errs.push("Enter salaries and/or a bonus");
    const floor = floorError(salaries, years, rules);
    if (floor) errs.push(floor);
    if (budget != null && bonus > budget) {
      errs.push(`Bonus is paid at signing but only ${formatMoney(budget)} is available`);
    }
    return errs;
  }, [years, activeSalaries, salaries, rules, bonus, totalValue, budget]);

  // --- Handlers ---
  const clearRejection = () => setRejection(null);

  const handleYearsChange = (y: number) => {
    setYears(y);
    setYearsTouched(true);
    clearRejection();
  };

  const handleSalariesChange = (next: number[]) => {
    setSalaries(next);
    clearRejection();
  };

  /** Spread what the bonus doesn't cover evenly, so the offer's value meets the demand. */
  const handleFillToDemand = () => {
    if (!demand) return;
    const y = Math.min(MAX_YEARS, Math.max(years, demand.minYears));
    const perYear = salaryToAsk(demand.minAav * y, y, bonus, demand.rules);
    setYears(y);
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
      maxWidth="sm:max-w-2xl min-[1025px]:max-w-[60vw]"
      mobileSheet
      closeOnOutsideClick={false}
      footer={
        <>
          <OfferLedger
            years={years}
            salaries={salaries}
            bonus={bonus}
            rules={rules}
            target={demand ? demand.minAav * years : 0}
            targetNote={demand ? targetNoteFor(years, demand.minAav) : ""}
            blocker={demand && !meetsYears ? `Needs at least ${demand.minYears} years` : null}
          />
          {formErrors.map((e) => (
            <Text key={e} variant="xs" classes="mt-1 text-start text-red-500">
              {e}
            </Text>
          ))}
          {/* Server rejection: the modal stays open so the user can adjust and resend */}
          {rejection && (
            <div className="mt-2 p-2 rounded-sm border border-red-400/50 bg-red-50 dark:bg-red-900/20 text-start">
              <Text variant="small" classes="font-semibold text-red-600 dark:text-red-400">
                {rejection.title}
              </Text>
              <Text variant="xs" classes="text-red-600 dark:text-red-400">
                {rejection.message}
              </Text>
            </div>
          )}
        </>
      }
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
        <Text variant="h6" classes="mb-1">Player Demand</Text>
        {demandLoading && (
          <Text variant="small" classes="text-gray-500 dark:text-gray-400">
            Loading demand...
          </Text>
        )}
        {!demandLoading && demand && (
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <Text variant="small">
              Min value per year: <strong>{formatMoney(demand.minAav)}</strong>
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
          Accepted immediately if the value per year meets the minimum and the length meets
          the minimum years. Value counts each bonus dollar at{" "}
          {(1 + rules.premium).toFixed(2)}x. You can resend as often as you like.
        </Text>
      </Border>

      {/* Years */}
      <div className="mb-4 text-start">
        <Text variant="small" classes="mb-1 font-semibold">
          Years
        </Text>
        <YearsPicker
          value={years}
          onChange={handleYearsChange}
          softMin={demand?.minYears}
          softMinTitle={demand ? `Below the player's minimum of ${demand.minYears}` : undefined}
        />
      </div>

      {/* Per-year salaries */}
      <div className="mb-4 text-start">
        <SalaryRows
          years={years}
          salaries={salaries}
          onChange={handleSalariesChange}
          idPrefix="ext"
          minSalary={rules.minSalary}
          onFillToAsk={demand ? handleFillToDemand : undefined}
          fillToAskLabel="Fill to demand"
        />
      </div>

      {/* Bonus */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-2 mb-2 items-start text-start">
        <div>
          <CurrencyInput
            id="ext_bonus"
            label="Signing bonus"
            value={bonus}
            onChange={(v) => {
              setBonus(v);
              clearRejection();
            }}
            presets={stepPresets(-1_000_000, -100_000, 100_000, 1_000_000)}
          />
          {demand && (
            <BonusShare
              askTotal={demand.minAav * years}
              years={years}
              bonus={bonus}
              salaries={salaries}
              rules={rules}
              onPick={(b, perYear) => {
                setBonus(b);
                setSalaries(Array(MAX_YEARS).fill(perYear));
                clearRejection();
              }}
            />
          )}
          <BonusHint rules={rules} />
        </div>
        <div className="sm:pt-6 text-start">
          <Text variant="small">
            Paid at signing: <strong>{formatMoney(bonus)}</strong>
            {budget != null && (
              <>
                {" "}of <strong>{formatMoney(budget)}</strong> available
              </>
            )}
          </Text>
          <Text variant="xs" classes="text-gray-500 dark:text-gray-400">
            The bonus is paid the day the deal is signed, from cash not already reserved by your
            open free-agent offers. Salaries are paid over the seasons.
          </Text>
        </div>
      </div>
    </Modal>
  );
};
