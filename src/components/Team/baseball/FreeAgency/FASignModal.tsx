import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "../../../../_design/Modal";
import { Text } from "../../../../_design/Typography";
import { Border } from "../../../../_design/Borders";
import { Button, ButtonGroup } from "../../../../_design/Buttons";
import { BaseballService } from "../../../../_services/baseballService";
import { useSnackbar } from "notistack";
import { FA_TYPE_LABELS } from "../../../../models/baseball/baseballFreeAgencyModels";
import type { FAPlayer } from "./faPlayerAdapter";
import { CurrencyInput } from "./CurrencyInput";
import { stepPresets } from "../../../Common/MoneyInput";
import {
  MAX_CONTRACT_YEARS,
  OfferLedger,
  targetNoteFor,
  SalaryRows,
  YearsPicker,
  BonusHint,
  BonusShare,
  floorError,
  offerValue,
  salaryToAsk,
  valueRules,
} from "../ContractTerms";

const MLB_LEVEL = 9;

/** Prefix of the below-the-ask error; the footer ledger shows the shortfall, so it isn't listed twice. */
const ASK_ERROR = "Below his ask";

const LEVEL_OPTIONS = [
  { value: 4, label: "Unassigned" },
  { value: 5, label: "A" },
  { value: 6, label: "High-A" },
  { value: 7, label: "AA" },
  { value: 8, label: "AAA" },
  { value: 9, label: "MLB" },
];

interface FASignModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: FAPlayer;
  orgId: number;
  leagueYearId: number;
  gameWeekId: number;
  availableBudget: number | null;
  onSuccess: () => void;
}

export const FASignModal: FC<FASignModalProps> = ({
  isOpen,
  onClose,
  player,
  orgId,
  leagueYearId,
  gameWeekId,
  availableBudget,
  onSuccess,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const demand = player.demand;

  // Every hook must run on every render, so a missing demand is handled by
  // defaults here and the early return sits below the hooks.
  const demandMinAav = demand ? parseFloat(demand.min_aav) || 0 : 0;
  const demandMinYears = demand?.min_years ?? 1;
  const demandMaxYears = Math.min(demand?.max_years ?? MAX_CONTRACT_YEARS, MAX_CONTRACT_YEARS);
  const premium = demand?.bonus_value_premium ?? 0;
  const vetMin = demand?.veteran_min_salary ?? null;
  const startSalary = Math.max(demandMinAav, vetMin ?? 0);

  const [years, setYears] = useState(demandMinYears);
  const [salaries, setSalaries] = useState<number[]>(() =>
    Array(MAX_CONTRACT_YEARS).fill(startSalary),
  );
  const [bonus, setBonus] = useState(0);
  const [levelId, setLevelId] = useState(9);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens or player changes
  useEffect(() => {
    if (isOpen) {
      setYears(demandMinYears);
      setSalaries(Array(MAX_CONTRACT_YEARS).fill(startSalary));
      setBonus(0);
      setLevelId(player.last_level >= 4 ? player.last_level : MLB_LEVEL);
    }
  }, [isOpen, player, demandMinYears, startSalary]);

  const totalSalary = useMemo(
    () => salaries.slice(0, years).reduce((sum, s) => sum + s, 0),
    [salaries, years],
  );

  // Cash is what the club pays; value is what the player weighs (bonus counts
  // extra). The veteran floor only binds MLB-level deals.
  const rules = valueRules(premium, vetMin, levelId === MLB_LEVEL);
  const totalValue = totalSalary + bonus;
  const value = offerValue(salaries, years, bonus, rules);
  const valuePerYear = years > 0 ? value / years : 0;

  const errors = useMemo(() => {
    const errs: string[] = [];
    if (years < demandMinYears || years > demandMaxYears) {
      errs.push(`Years must be ${demandMinYears}-${demandMaxYears}`);
    }
    for (let i = 0; i < years; i++) {
      if (salaries[i] < 0) errs.push(`Year ${i + 1} salary cannot be negative`);
      if (i > 0 && salaries[i] < salaries[i - 1]) {
        errs.push(`Year ${i + 1} salary cannot be less than Year ${i}`);
      }
      if (i > 0 && salaries[i] > salaries[i - 1]) {
        const maxRaise = Math.max(salaries[i - 1], 2_000_000);
        if (salaries[i] - salaries[i - 1] > maxRaise) {
          errs.push(`Year ${i + 1} raise exceeds max ($${maxRaise.toLocaleString()})`);
        }
      }
    }
    const floor = floorError(salaries, years, rules);
    if (floor) errs.push(floor);
    if (bonus < 0) errs.push("Bonus cannot be negative");
    if (availableBudget != null && bonus > availableBudget) {
      errs.push(
        `Bonus is paid at signing but only $${availableBudget.toLocaleString()} is available`,
      );
    }
    if (demandMinAav > 0 && totalValue > 0 && Math.round(valuePerYear) < Math.round(demandMinAav)) {
      errs.push(
        `${ASK_ERROR}: value per year $${Math.round(valuePerYear).toLocaleString()} vs $${demandMinAav.toLocaleString()}`,
      );
    }
    return errs;
  }, [
    years,
    demandMinYears,
    demandMaxYears,
    salaries,
    rules,
    bonus,
    availableBudget,
    demandMinAav,
    totalValue,
    valuePerYear,
  ]);

  /** Spread what the bonus doesn't cover evenly (never below the floor), so the value meets his minimum. */
  const handleFillToAsk = () => {
    setSalaries(Array(MAX_CONTRACT_YEARS).fill(salaryToAsk(demandMinAav * years, years, bonus, rules)));
  };

  const handleConfirm = useCallback(async () => {
    if (errors.length > 0) return;
    setIsSubmitting(true);
    try {
      const res = await BaseballService.SignFreeAgent({
        player_id: player.id,
        org_id: orgId,
        years,
        salaries: salaries.slice(0, years),
        bonus,
        level_id: levelId,
        league_year_id: leagueYearId,
        game_week_id: gameWeekId,
        executed_by: "user",
      });
      enqueueSnackbar(
        `Signed ${player.firstname} ${player.lastname} — ${years}yr, $${Math.round(totalValue / years).toLocaleString()} a year in cash`,
        { variant: "success", autoHideDuration: 4000 },
      );
      if (res.roster_warning) {
        enqueueSnackbar(res.roster_warning, {
          variant: "warning",
          autoHideDuration: 6000,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Signing failed", {
        variant: "error",
        autoHideDuration: 4000,
      });
    }
    setIsSubmitting(false);
  }, [
    errors,
    player,
    orgId,
    years,
    salaries,
    bonus,
    levelId,
    leagueYearId,
    gameWeekId,
    totalValue,
    onSuccess,
    onClose,
    enqueueSnackbar,
  ]);

  // Parent should not open this modal without demand data.
  if (!isOpen || !demand) return null;

  const playerName = `${player.firstname} ${player.lastname}`;
  const tierLabel = FA_TYPE_LABELS[player.fa_type] ?? player.fa_type;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Sign: ${playerName}`}
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
            target={demandMinAav * years}
            targetNote={targetNoteFor(years, demandMinAav)}
          />
          {errors.filter((err) => !err.startsWith(ASK_ERROR)).map((err, i) => (
            <Text key={i} variant="xs" classes="mt-1 text-start text-red-400">
              {err}
            </Text>
          ))}
        </>
      }
      actions={
        <ButtonGroup>
          <Button size="sm" variant="danger" onClick={onClose}>
            <Text variant="small">Cancel</Text>
          </Button>
          <Button
            size="sm"
            variant={errors.length === 0 ? "success" : "warning"}
            onClick={handleConfirm}
            disabled={errors.length > 0 || isSubmitting}
          >
            <Text variant="small">
              {isSubmitting ? "Processing..." : "Sign Player"}
            </Text>
          </Button>
        </ButtonGroup>
      }
    >
      {/* Player info header */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-sm text-gray-300">
        <span>
          Age: <strong>{player.age}</strong>
        </span>
        <span>{player.ptype}</span>
        <span>OVR: <strong>{player.displayovr ?? "—"}</strong></span>
        <span>{tierLabel}</span>
        {player.last_org_abbrev && (
          <span>Last: {player.last_org_abbrev}</span>
        )}
      </div>

      {/* Demands */}
      <Border direction="col" classes="p-3 mb-4 text-start">
        <Text variant="small" classes="font-semibold mb-2">
          Player Demands
        </Text>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <span>
            Min value per year:{" "}
            <strong>${demandMinAav.toLocaleString()}</strong>
          </span>
          {vetMin != null && (
            <span>
              MLB salary floor: <strong>${vetMin.toLocaleString()}</strong> a season
            </span>
          )}
          <span>
            Years:{" "}
            <strong>
              {demandMinYears}
              {demandMaxYears > demandMinYears ? `–${demandMaxYears}` : ""}
            </strong>
          </span>
          {demand.war > 0 && (
            <span>
              WAR: <strong>{demand.war}</strong>
            </span>
          )}
        </div>
      </Border>

      {/* Offer form */}
      <div className="mb-4 text-start">
        <Text variant="small" classes="mb-1 font-semibold">Years</Text>
        <YearsPicker
          value={years}
          onChange={setYears}
          min={demandMinYears}
          max={demandMaxYears}
        />
      </div>

      <div className="mb-4 text-start">
        <SalaryRows
          years={years}
          salaries={salaries}
          onChange={setSalaries}
          idPrefix="fa-sign"
          raiseLaterYears
          minSalary={rules.minSalary}
          onFillToAsk={demandMinAav > 0 ? handleFillToAsk : undefined}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2 text-start">
        <div>
          <CurrencyInput
            id="fa-sign-bonus"
            label="Signing bonus"
            value={bonus}
            onChange={setBonus}
            presets={stepPresets(-1_000_000, -100_000, 100_000, 1_000_000)}
          />
          <BonusShare
            askTotal={demandMinAav * years}
            years={years}
            bonus={bonus}
            salaries={salaries}
            rules={rules}
            onPick={(b, perYear) => {
              setBonus(b);
              setSalaries(Array(MAX_CONTRACT_YEARS).fill(perYear));
            }}
          />
          <BonusHint rules={valueRules(premium, vetMin)} />
          <p className="mt-1 text-sm">
            Paid at signing: <strong>${bonus.toLocaleString()}</strong>
            {availableBudget != null && (
              <span className="text-gray-400"> of ${availableBudget.toLocaleString()} cash available</span>
            )}
          </p>
        </div>
        <div>
          <label
            htmlFor="fa-sign-level"
            className="block mb-1 text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            Assign to level
          </label>
          <select
            id="fa-sign-level"
            value={levelId}
            onChange={(e) => setLevelId(Number(e.target.value))}
            className="w-full min-h-10 text-base sm:text-sm border rounded-sm px-2 py-1.5 dark:bg-gray-700 dark:border-gray-600"
          >
            {LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
};
