import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "../../../../_design/Modal";
import { Text } from "../../../../_design/Typography";
import { Border } from "../../../../_design/Borders";
import { Button, ButtonGroup } from "../../../../_design/Buttons";
import { Input } from "../../../../_design/Inputs";
import { BaseballService } from "../../../../_services/baseballService";
import { BaseballSeasonContext } from "../../../../models/baseball/baseballModels";
import { SigningBudgetResponse } from "../../../../models/baseball/baseballScoutingModels";
import { useSnackbar } from "notistack";

// Level options for the signing form
const PRO_LEVEL_OPTIONS = [
  { value: 4, label: "Unassigned" },
  { value: 5, label: "A" },
  { value: 6, label: "High-A" },
  { value: 7, label: "AA" },
  { value: 8, label: "AAA" },
  { value: 9, label: "MLB" },
];

interface BaseballSigningModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: number;
  playerName: string;
  poolType: "hs" | "college" | "intam" | "pro" | "mlb_fa";
  orgId: number;
  seasonContext: BaseballSeasonContext | null;
  executedBy?: string;
  onSuccess: () => void;
}

export const BaseballSigningModal: FC<BaseballSigningModalProps> = ({
  isOpen,
  onClose,
  playerId,
  playerName,
  poolType,
  orgId,
  seasonContext,
  executedBy,
  onSuccess,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const isCollege = poolType === "hs"; // HS → sign to college (fixed 4yr)
  const isPro = poolType === "college" || poolType === "intam";
  const isFA = poolType === "mlb_fa";

  const maxYears = isCollege ? 4 : 7;

  const [years, setYears] = useState(isCollege ? 4 : 1);
  const [salaries, setSalaries] = useState<number[]>(Array(7).fill(0));
  const [bonus, setBonus] = useState(0);
  const [levelId, setLevelId] = useState(isCollege ? 3 : 5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signingBudget, setSigningBudget] = useState<SigningBudgetResponse | null>(null);

  // Fetch signing budget for FA
  useEffect(() => {
    if (!isOpen || !isFA || !seasonContext) return;
    BaseballService.GetSigningBudget(orgId, seasonContext.current_league_year_id)
      .then(setSigningBudget)
      .catch(() => {});
  }, [isOpen, isFA, orgId, seasonContext]);

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setYears(isCollege ? 4 : 1);
      setSalaries(Array(7).fill(0));
      setBonus(0);
      setLevelId(isCollege ? 3 : 5);
    }
  }, [isOpen, isCollege]);

  const totalSalary = useMemo(() => {
    return salaries.slice(0, years).reduce((sum, s) => sum + s, 0);
  }, [salaries, years]);

  const errors = useMemo(() => {
    const errs: string[] = [];
    if (years < 1 || years > maxYears) errs.push(`Contract must be 1-${maxYears} years`);
    for (let i = 0; i < years; i++) {
      if (salaries[i] < 0) errs.push(`Year ${i + 1} salary cannot be negative`);
    }
    if (bonus < 0) errs.push("Bonus cannot be negative");
    if (isFA && signingBudget && bonus > signingBudget.available_budget) {
      errs.push(`Bonus exceeds available budget ($${signingBudget.available_budget.toLocaleString()})`);
    }
    return errs;
  }, [years, maxYears, salaries, bonus, isFA, signingBudget]);

  const handleSalaryChange = useCallback((index: number, value: string) => {
    setSalaries((prev) => {
      const next = [...prev];
      next[index] = Number(value) || 0;
      return next;
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!seasonContext || errors.length > 0) return;
    setIsSubmitting(true);
    try {
      const res = await BaseballService.SignPlayer({
        player_id: playerId,
        org_id: orgId,
        years,
        salaries: salaries.slice(0, years),
        bonus,
        level_id: levelId,
        league_year_id: seasonContext.current_league_year_id,
        game_week_id: seasonContext.current_week_index,
        executed_by: executedBy,
      });
      const warningText = res.roster_warning ? " (roster over limit!)" : "";
      enqueueSnackbar(
        `Signed ${playerName} — ${res.years} year(s)${warningText}`,
        { variant: "success", autoHideDuration: 4000 },
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Signing failed", { variant: "error", autoHideDuration: 4000 });
    }
    setIsSubmitting(false);
  }, [seasonContext, errors, playerId, orgId, years, salaries, bonus, levelId, executedBy, playerName, onSuccess, onClose, enqueueSnackbar]);

  if (!isOpen) return null;

  // ── College signing (HS→College): simple confirmation ──
  if (isCollege) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Sign ${playerName}`}
        actions={
          <ButtonGroup>
            <Button size="sm" variant="danger" onClick={onClose}>
              <Text variant="small">Cancel</Text>
            </Button>
            <Button size="sm" variant="success" onClick={handleConfirm} disabled={isSubmitting}>
              <Text variant="small">{isSubmitting ? "Processing..." : "Confirm"}</Text>
            </Button>
          </ButtonGroup>
        }
      >
        <Border classes="p-3 mb-3">
          <Text variant="body-small">
            Sign <strong>{playerName}</strong> to a 4-year college scholarship. No salary or bonus.
          </Text>
        </Border>
      </Modal>
    );
  }

  // ── Pro/FA signing: full contract form ──
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Sign ${playerName}`}
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
            <Text variant="small">{isSubmitting ? "Processing..." : "Confirm"}</Text>
          </Button>
        </ButtonGroup>
      }
    >
      {/* Rules + Errors */}
      <div className="grid grid-cols-[2fr_3fr] gap-2 mb-4">
        <Border direction="col" classes="text-start p-3">
          <Text variant="h6">Rules</Text>
          <Text variant="xs">Contracts must be 1 through {maxYears} years.</Text>
          {isFA && <Text variant="xs">Bonus is validated against signing budget.</Text>}
          <Text variant="xs">Salary array must match contract length.</Text>
        </Border>
        <Border direction="col" classes="text-start p-3 overflow-y-auto">
          <Text variant="h6">Errors</Text>
          {errors.length === 0 && <Text variant="small">None</Text>}
          {errors.map((err) => (
            <Text key={err} variant="small" classes="text-red-500">{err}</Text>
          ))}
        </Border>
      </div>

      {/* Signing budget (FA only) */}
      {isFA && signingBudget && (
        <Border classes="p-3 mb-3">
          <Text variant="small" classes="font-semibold">
            Available Signing Budget: ${signingBudget.available_budget.toLocaleString()}
          </Text>
        </Border>
      )}

      {/* Length + Bonus + Level */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Input
          type="number"
          label="Years"
          name="years"
          value={years}
          min={1}
          max={maxYears}
          onChange={(e) => setYears(Math.min(maxYears, Math.max(1, Number(e.target.value) || 1)))}
        />
        <Input
          type="number"
          label="Bonus ($)"
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
      </div>

      {/* Total */}
      <div className="mb-3">
        <Text variant="small" classes="text-gray-400">
          Total Value: <span className="font-semibold text-white">${(totalSalary + bonus).toLocaleString()}</span>
        </Text>
      </div>

      {/* Per-year salary inputs */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-2">
        {Array.from({ length: maxYears }, (_, i) => (
          <div key={i} className={i >= years ? "opacity-30 pointer-events-none" : ""}>
            <Input
              type="number"
              label={`Y${i + 1}`}
              name={`salary_${i}`}
              value={salaries[i]}
              min={0}
              disabled={i >= years}
              onChange={(e) => handleSalaryChange(i, e.target.value)}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
};
