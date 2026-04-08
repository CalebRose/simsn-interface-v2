import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "../../../../_design/Modal";
import { Text } from "../../../../_design/Typography";
import { Border } from "../../../../_design/Borders";
import { Button, ButtonGroup } from "../../../../_design/Buttons";
import { BaseballService } from "../../../../_services/baseballService";
import { CurrencyInput } from "./CurrencyInput";
import { useSnackbar } from "notistack";
import {
  FAPlayerDemand,
  FAPlayerOffer,
  AuctionPhase,
} from "../../../../models/baseball/baseballFreeAgencyModels";

const PRO_LEVEL_OPTIONS = [
  { value: 4, label: "Unassigned" },
  { value: 5, label: "A" },
  { value: 6, label: "High-A" },
  { value: 7, label: "AA" },
  { value: 8, label: "AAA" },
  { value: 9, label: "MLB" },
];

interface FAOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  age?: number;
  auctionId: number;
  phase: AuctionPhase;
  demand: FAPlayerDemand | null;
  existingOffer: FAPlayerOffer | null;
  orgId: number;
  leagueYearId: number;
  gameWeekId: number;
  availableBudget: number | null;
  onSuccess: () => void;
}

export const FAOfferModal: FC<FAOfferModalProps> = ({
  isOpen,
  onClose,
  playerName,
  age,
  auctionId,
  phase,
  demand,
  existingOffer,
  orgId,
  leagueYearId,
  gameWeekId,
  availableBudget,
  onSuccess,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const isUpdate = existingOffer != null;
  const demandMinAav = demand ? parseFloat(demand.min_aav) : 0;
  const demandMinYears = demand?.min_years ?? 1;
  const demandMaxYears = 5; // hard cap per rules; demand sets the floor, not the ceiling

  const [years, setYears] = useState(demandMinYears);
  const [salaries, setSalaries] = useState<number[]>(Array(5).fill(0));
  const [bonus, setBonus] = useState(0);
  const [levelId, setLevelId] = useState(9);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      if (existingOffer) {
        setYears(existingOffer.years);
        setBonus(existingOffer.bonus);
      } else {
        setYears(demandMinYears);
        setSalaries(Array(5).fill(0));
        setBonus(0);
        setLevelId(9);
      }
    }
  }, [isOpen, existingOffer, demandMinYears]);

  const totalSalary = useMemo(
    () => salaries.slice(0, years).reduce((sum, s) => sum + s, 0),
    [salaries, years],
  );

  const totalValue = totalSalary + bonus;
  const aav = years > 0 ? totalValue / years : 0;

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
    if (bonus < 0) errs.push("Bonus cannot be negative");
    if (availableBudget != null && bonus > availableBudget) {
      errs.push(`Bonus exceeds available budget ($${availableBudget.toLocaleString()})`);
    }
    if (demandMinAav > 0 && totalValue > 0) {
      const minTotal = demandMinAav * years;
      if (totalValue < minTotal) {
        errs.push(`Total value ($${totalValue.toLocaleString()}) below minimum ($${minTotal.toLocaleString()})`);
      }
    }
    if (isUpdate && existingOffer && phase !== "open" && aav < existingOffer.aav) {
      errs.push(`AAV cannot decrease below previous ($${existingOffer.aav.toLocaleString()})`);
    }
    return errs;
  }, [years, demandMinYears, demandMaxYears, salaries, bonus, availableBudget, demandMinAav, totalValue, isUpdate, existingOffer, aav]);

  const handleSalaryChange = useCallback((index: number, value: string) => {
    setSalaries((prev) => {
      const next = [...prev];
      next[index] = Number(value) || 0;
      return next;
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (errors.length > 0) return;
    setIsSubmitting(true);
    try {
      const res = await BaseballService.SubmitFAOffer(auctionId, {
        org_id: orgId,
        years,
        salaries: salaries.slice(0, years),
        bonus,
        level_id: levelId,
        league_year_id: leagueYearId,
        game_week_id: gameWeekId,
        current_week: gameWeekId,
        executed_by: "user",
      });
      enqueueSnackbar(
        `${isUpdate ? "Updated" : "Submitted"} offer for ${playerName} — ${res.years}yr, $${res.aav.toLocaleString()} AAV`,
        { variant: "success", autoHideDuration: 4000 },
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Offer failed", { variant: "error", autoHideDuration: 4000 });
    }
    setIsSubmitting(false);
  }, [errors, auctionId, orgId, years, salaries, bonus, levelId, leagueYearId, gameWeekId, isUpdate, playerName, onSuccess, onClose, enqueueSnackbar]);

  if (!isOpen) return null;

  const canLowerAav = phase === "open";
  const modalTitle = !isUpdate
    ? `Make Offer: ${playerName}`
    : canLowerAav
      ? `Update Offer: ${playerName}`
      : `Increase Offer: ${playerName}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidth="min-[1025px]:max-w-[60vw]"
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
            <Text variant="small">{isSubmitting ? "Processing..." : !isUpdate ? "Submit Offer" : canLowerAav ? "Update Offer" : "Increase Offer"}</Text>
          </Button>
        </ButtonGroup>
      }
    >
      {/* Player Demands */}
      {demand && (
        <Border direction="col" classes="p-3 mb-4 text-start">
          <Text variant="h6" classes="mb-2">Player Demands</Text>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <Text variant="small">Min AAV: <strong>${demandMinAav.toLocaleString()}</strong></Text>
            <Text variant="small">Years: <strong>{demandMinYears}-{demandMaxYears}</strong></Text>
            {demand.war > 0 && <Text variant="small">WAR: <strong>{demand.war}</strong></Text>}
            {age != null && <Text variant="small">Age: <strong>{age}</strong></Text>}
          </div>
          {age != null && (
            <Text variant="xs" classes="mt-2 text-gray-400 italic">
              {age <= 28
                ? "This player values total guaranteed money \u2014 consider more years."
                : age <= 31
                  ? "This player weighs annual salary and total value equally."
                  : age <= 33
                    ? "This player prioritizes annual salary over total years."
                    : "This player is focused on maximizing per-year pay."}
            </Text>
          )}
        </Border>
      )}

      {/* Existing offer info */}
      {isUpdate && existingOffer && (
        <Border direction="col" classes="p-3 mb-4 text-start">
          <Text variant="h6" classes="mb-2">Current Offer</Text>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <Text variant="small">Years: <strong>{existingOffer.years}</strong></Text>
            <Text variant="small">AAV: <strong>${existingOffer.aav.toLocaleString()}</strong></Text>
            <Text variant="small">Total: <strong>${existingOffer.total_value.toLocaleString()}</strong></Text>
          </div>
        </Border>
      )}

      {/* Budget + Errors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        <Border direction="col" classes="p-3 text-start">
          {availableBudget != null && (
            <Text variant="small" classes="font-semibold mb-1">
              Signing Budget: ${availableBudget.toLocaleString()}
            </Text>
          )}
          <Text variant="small" classes="text-gray-400">
            Phase: <span className="font-semibold capitalize">{phase}</span>
          </Text>
          {!canLowerAav && isUpdate && existingOffer && (
            <Text variant="xs" classes="text-yellow-400 mt-1">
              AAV floor: ${existingOffer.aav.toLocaleString()} (cannot decrease in {phase} phase)
            </Text>
          )}
        </Border>
        <Border direction="col" classes="p-3 text-start overflow-y-auto">
          <Text variant="h6">Errors</Text>
          {errors.length === 0 && <Text variant="small">None</Text>}
          {errors.map((err) => (
            <Text key={err} variant="small" classes="text-red-500">{err}</Text>
          ))}
        </Border>
      </div>

      {/* Length + Bonus + Level */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Years</label>
          <select
            className="w-full text-sm border rounded px-2 py-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
          >
            {Array.from({ length: demandMaxYears - demandMinYears + 1 }, (_, i) => demandMinYears + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <CurrencyInput
          label="Signing Bonus"
          value={bonus}
          onChange={setBonus}
        />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Level</label>
          <select
            className="w-full text-sm border rounded px-2 py-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={levelId}
            onChange={(e) => setLevelId(Number(e.target.value))}
          >
            {PRO_LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <Text variant="xs" classes="text-gray-400 mb-1">Computed</Text>
          <Text variant="small">Total: <strong>${totalValue.toLocaleString()}</strong></Text>
          <Text variant="small">AAV: <strong>${Math.round(aav).toLocaleString()}</strong></Text>
        </div>
      </div>

      {/* Per-year salary inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={i >= years ? "opacity-30 pointer-events-none" : ""}>
            <CurrencyInput
              label={`Y${i + 1} Salary`}
              value={salaries[i]}
              disabled={i >= years}
              onChange={(val) => handleSalaryChange(i, String(val))}
            />
          </div>
        ))}
      </div>

      {/* Meets minimum indicator */}
      {demandMinAav > 0 && totalValue > 0 && (
        <Text variant="small" classes={`mt-2 ${aav >= demandMinAav ? "text-green-400" : "text-red-400"}`}>
          {aav >= demandMinAav ? "Meets player minimum" : "Below player minimum AAV"}
        </Text>
      )}
    </Modal>
  );
};
