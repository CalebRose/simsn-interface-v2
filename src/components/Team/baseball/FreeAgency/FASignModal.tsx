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

  // Guard — parent should not open this modal without demand data
  if (!demand) return null;

  const demandMinAav = parseFloat(demand.min_aav);
  const demandMinYears = demand.min_years;
  const demandMaxYears = demand.max_years ?? 5;

  const [years, setYears] = useState(demandMinYears);
  const [salaries, setSalaries] = useState<number[]>(() =>
    Array(5).fill(demandMinAav),
  );
  const [bonus, setBonus] = useState(0);
  const [levelId, setLevelId] = useState(9);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens or player changes
  useEffect(() => {
    if (isOpen) {
      const minAav = parseFloat(demand.min_aav);
      const minYrs = demand.min_years;
      setYears(minYrs);
      setSalaries(Array(5).fill(minAav));
      setBonus(0);
      setLevelId(player.last_level >= 4 ? player.last_level : 9);
    }
  }, [isOpen, player]);

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
      errs.push(
        `Bonus exceeds available budget ($${availableBudget.toLocaleString()})`,
      );
    }
    if (demandMinAav > 0 && totalValue > 0) {
      const minTotal = demandMinAav * years;
      if (totalValue < minTotal) {
        errs.push(
          `Total value ($${totalValue.toLocaleString()}) below minimum ($${minTotal.toLocaleString()})`,
        );
      }
    }
    return errs;
  }, [
    years,
    demandMinYears,
    demandMaxYears,
    salaries,
    bonus,
    availableBudget,
    demandMinAav,
    totalValue,
  ]);

  const handleSalaryChange = useCallback(
    (index: number, value: string) => {
      setSalaries((prev) => {
        const next = [...prev];
        next[index] = Number(value) || 0;
        return next;
      });
    },
    [],
  );

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
        `Signed ${player.firstname} ${player.lastname} — ${years}yr, $${aav.toLocaleString()} AAV`,
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
    aav,
    onSuccess,
    onClose,
    enqueueSnackbar,
  ]);

  if (!isOpen) return null;

  const playerName = `${player.firstname} ${player.lastname}`;
  const tierLabel = FA_TYPE_LABELS[player.fa_type] ?? player.fa_type;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Sign: ${playerName}`}
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
            Min Salary:{" "}
            <strong>${demandMinAav.toLocaleString()}</strong>
          </span>
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
      <Border direction="col" classes="p-3 mb-4 text-start">
        <Text variant="small" classes="font-semibold mb-2">
          Your Offer
        </Text>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <Text variant="xs" classes="text-gray-400 mb-1">
              Years
            </Text>
            <select
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full text-sm border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
            >
              {Array.from(
                { length: demandMaxYears - demandMinYears + 1 },
                (_, i) => demandMinYears + i,
              ).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <CurrencyInput
            label="Signing Bonus"
            value={bonus}
            onChange={setBonus}
          />
          <div>
            <Text variant="xs" classes="text-gray-400 mb-1">
              Assign to Level
            </Text>
            <select
              value={levelId}
              onChange={(e) => setLevelId(Number(e.target.value))}
              className="w-full text-sm border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
            >
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Salary per year */}
        <div className="space-y-2 mb-3">
          {Array.from({ length: years }, (_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1">
                <CurrencyInput
                  label={`Year ${i + 1}`}
                  value={salaries[i]}
                  onChange={(val) => handleSalaryChange(i, String(val))}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="flex flex-wrap gap-x-6 text-sm border-t border-gray-700 pt-2">
          <span>
            Total Value: <strong>${totalValue.toLocaleString()}</strong>
          </span>
          <span>
            AAV: <strong>${Math.round(aav).toLocaleString()}</strong>
          </span>
        </div>
      </Border>

      {/* Validation */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <Text key={i} variant="xs" classes="text-red-400">
              {err}
            </Text>
          ))}
        </div>
      )}
      {errors.length === 0 && totalValue > 0 && (
        <Text variant="xs" classes="text-green-400">
          Meets player minimum
        </Text>
      )}
    </Modal>
  );
};
