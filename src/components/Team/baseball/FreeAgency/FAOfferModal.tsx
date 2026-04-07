import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "../../../../_design/Modal";
import { Text } from "../../../../_design/Typography";
import { Border } from "../../../../_design/Borders";
import { Button, ButtonGroup } from "../../../../_design/Buttons";
import { Input } from "../../../../_design/Inputs";
import { BaseballService } from "../../../../_services/baseballService";
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
  const demandMaxYears = demand?.max_years ?? 5;

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
    if (isUpdate && existingOffer && aav < existingOffer.aav) {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isUpdate ? "Update" : "Make"} Offer: ${playerName}`}
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
            <Text variant="small">{isSubmitting ? "Processing..." : isUpdate ? "Update Offer" : "Submit Offer"}</Text>
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
        <Input
          type="number"
          label="Years"
          name="years"
          value={years}
          min={demandMinYears}
          max={demandMaxYears}
          onChange={(e) => setYears(Math.min(demandMaxYears, Math.max(demandMinYears, Number(e.target.value) || demandMinYears)))}
        />
        <Input
          type="number"
          label="Signing Bonus ($)"
          name="bonus"
          value={bonus}
          min={0}
          onChange={(e) => setBonus(Number(e.target.value) || 0)}
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
            <Input
              type="number"
              label={`Y${i + 1} Salary`}
              name={`salary_${i}`}
              value={salaries[i]}
              min={0}
              disabled={i >= years}
              onChange={(e) => handleSalaryChange(i, e.target.value)}
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
