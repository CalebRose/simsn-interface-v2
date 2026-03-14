import { FC, useCallback, useMemo, useState } from "react";
import { Modal } from "../../../_design/Modal";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { Input } from "../../../_design/Inputs";
import { SelectDropdown } from "../../../_design/Select";
import { Border } from "../../../_design/Borders";
import { Player, BaseballSeasonContext } from "../../../models/baseball/baseballModels";
import { RosterWarning } from "../../../models/baseball/baseballTransactionModels";
import { ScoutingActionType, ScoutingBudget } from "../../../models/baseball/baseballScoutingModels";
import { BaseballService } from "../../../_services/baseballService";
import { displayLevel, LEVEL_ORDER, LEVEL_TO_NUMERIC, SCOUTING_ACTION_LABELS, SCOUTING_ACTION_COSTS } from "../../../_utility/baseballHelpers";
import { enqueueSnackbar } from "notistack";
import { SelectOption } from "../../../_hooks/useSelectStyles";

// ═══════════════════════════════════════════════
// Action type
// ═══════════════════════════════════════════════

export type TransactionAction =
  | "promote"
  | "demote"
  | "ir_place"
  | "ir_activate"
  | "release"
  | "buyout"
  | "extend";

// ═══════════════════════════════════════════════
// Dynamic options builder for ActionsDropdown
// ═══════════════════════════════════════════════

export const getTransactionOptions = (player: Player): SelectOption[] => {
  const options: SelectOption[] = [];
  const name = `${player.firstname} ${player.lastname}`;
  const hasContract = player.contract !== null;
  const onIR = player.contract?.on_ir ?? false;
  const levelIndex = LEVEL_ORDER.indexOf(player.league_level);

  if (hasContract && levelIndex > 0) {
    options.push({ value: "promote", label: `Promote ${name}` });
  }
  if (hasContract && levelIndex >= 0 && levelIndex < LEVEL_ORDER.length - 1) {
    options.push({ value: "demote", label: `Demote ${name}` });
  }
  if (hasContract && !onIR) {
    options.push({ value: "ir_place", label: `Place ${name} on IR` });
  }
  if (hasContract && onIR) {
    options.push({ value: "ir_activate", label: `Activate ${name} from IR` });
  }
  if (hasContract) {
    options.push({ value: "release", label: `Release ${name}` });
    options.push({ value: "buyout", label: `Buyout ${name}` });
    options.push({ value: "extend", label: `Extend ${name}` });
  }
  return options;
};

// ═══════════════════════════════════════════════
// Roster warning helper
// ═══════════════════════════════════════════════

const showRosterWarning = (warning?: RosterWarning) => {
  if (!warning?.over_limit) return;
  enqueueSnackbar(
    `Roster warning: ${warning.count}/${warning.max_roster} — over limit`,
    { variant: "warning", autoHideDuration: 5000 },
  );
};

// ═══════════════════════════════════════════════
// Main dispatcher
// ═══════════════════════════════════════════════

interface BaseballTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  action: TransactionAction | null;
  orgId: number;
  seasonContext: BaseballSeasonContext;
  onSuccess: () => void;
}

export const BaseballTransactionModal: FC<BaseballTransactionModalProps> = (props) => {
  if (!props.action || !props.isOpen) return null;

  switch (props.action) {
    case "promote":
    case "demote":
      return <MoveToLevelModal {...props} />;
    case "ir_place":
    case "ir_activate":
    case "release":
      return <ConfirmationModal {...props} type={props.action} />;
    case "buyout":
      return <BuyoutModal {...props} />;
    case "extend":
      return <ExtensionModal {...props} />;
    default:
      return null;
  }
};

// ═══════════════════════════════════════════════
// Move to Level (unified promote / demote)
// ═══════════════════════════════════════════════

const MoveToLevelModal: FC<
  Omit<BaseballTransactionModalProps, "action">
> = ({ isOpen, onClose, player, orgId, seasonContext, onSuccess }) => {
  const [targetLevel, setTargetLevel] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const name = `${player.firstname} ${player.lastname}`;
  const currentIndex = LEVEL_ORDER.indexOf(player.league_level);

  const levelOptions: SelectOption[] = useMemo(() => {
    return LEVEL_ORDER
      .filter((_, i) => i !== currentIndex)
      .map((l) => ({ value: l, label: displayLevel(l) }));
  }, [currentIndex]);

  const handleConfirm = useCallback(async () => {
    if (!targetLevel || !player.contract) return;
    setIsSubmitting(true);
    try {
      const targetIndex = LEVEL_ORDER.indexOf(targetLevel);
      const isPromotion = targetIndex < currentIndex;
      const dto = {
        contract_id: player.contract.id,
        target_level_id: LEVEL_TO_NUMERIC[targetLevel],
        league_year_id: seasonContext.current_league_year_id,
      };
      if (isPromotion) {
        const res = await BaseballService.PromotePlayer(dto);
        showRosterWarning(res.roster_warning);
      } else {
        await BaseballService.DemotePlayer(dto);
      }

      enqueueSnackbar(
        `${name} moved to ${displayLevel(targetLevel)}`,
        { variant: "success", autoHideDuration: 3000 },
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Failed to move player", {
        variant: "error",
        autoHideDuration: 4000,
      });
    }
    setIsSubmitting(false);
  }, [targetLevel, player, currentIndex, seasonContext, onSuccess, onClose, name]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Move ${name}`}
      actions={
        <ButtonGroup>
          <Button size="sm" variant="danger" onClick={onClose}>
            <Text variant="small">Cancel</Text>
          </Button>
          <Button
            size="sm"
            variant="success"
            onClick={handleConfirm}
            disabled={!targetLevel || isSubmitting}
          >
            <Text variant="small">{isSubmitting ? "Processing..." : "Confirm"}</Text>
          </Button>
        </ButtonGroup>
      }
    >
      <Text classes="mb-2">
        Current level: <strong>{displayLevel(player.league_level)}</strong>
      </Text>
      <Text classes="mb-3">Select target level:</Text>
      <SelectDropdown
        options={levelOptions}
        onChange={(opt) => setTargetLevel(opt ? (opt as SelectOption).value : null)}
        placeholder="Select level..."
      />
    </Modal>
  );
};

// ═══════════════════════════════════════════════
// Confirmation (IR Place, IR Activate, Release)
// ═══════════════════════════════════════════════

type ConfirmationType = "ir_place" | "ir_activate" | "release";

const ConfirmationModal: FC<
  Omit<BaseballTransactionModalProps, "action"> & { type: ConfirmationType }
> = ({ isOpen, onClose, player, type, orgId, seasonContext, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const name = `${player.firstname} ${player.lastname}`;

  const config: Record<ConfirmationType, { title: string; warning: string; confirmVariant: "success" | "danger" }> = {
    ir_place: {
      title: `Place ${name} on Injured Reserve?`,
      warning: `${name} will be placed on the injured reserve. They will not be available for games until activated.`,
      confirmVariant: "success",
    },
    ir_activate: {
      title: `Activate ${name} from Injured Reserve?`,
      warning: `${name} will be activated from the injured reserve and returned to active duty.`,
      confirmVariant: "success",
    },
    release: {
      title: `Release ${name}?`,
      warning: `WARNING: ${name} will be released from your organization. Guaranteed money on the contract will continue to flow through your books. This action cannot be undone.`,
      confirmVariant: "danger",
    },
  };

  const { title, warning, confirmVariant } = config[type];

  const handleConfirm = useCallback(async () => {
    if (!player.contract) return;
    setIsSubmitting(true);
    try {
      if (type === "ir_place") {
        await BaseballService.PlaceOnIR({
          contract_id: player.contract.id,
          league_year_id: seasonContext.current_league_year_id,
        });
        enqueueSnackbar(`${name} placed on IR`, { variant: "success", autoHideDuration: 3000 });
      } else if (type === "ir_activate") {
        const res = await BaseballService.ActivateFromIR({
          contract_id: player.contract.id,
          league_year_id: seasonContext.current_league_year_id,
        });
        enqueueSnackbar(`${name} activated from IR`, { variant: "success", autoHideDuration: 3000 });
        showRosterWarning(res.roster_warning);
      } else {
        const res = await BaseballService.ReleasePlayer({
          contract_id: player.contract.id,
          org_id: orgId,
          league_year_id: seasonContext.current_league_year_id,
        });
        const suffix =
          res.years_remaining_on_books > 0
            ? ` ${res.years_remaining_on_books} year(s) remaining on books.`
            : "";
        enqueueSnackbar(`${name} released.${suffix}`, { variant: "success", autoHideDuration: 4000 });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Transaction failed", { variant: "error", autoHideDuration: 4000 });
    }
    setIsSubmitting(false);
  }, [player, type, orgId, seasonContext, onSuccess, onClose, name]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={
        <ButtonGroup>
          <Button size="sm" variant="danger" onClick={onClose}>
            <Text variant="small">Cancel</Text>
          </Button>
          <Button size="sm" variant={confirmVariant} onClick={handleConfirm} disabled={isSubmitting}>
            <Text variant="small">{isSubmitting ? "Processing..." : "Confirm"}</Text>
          </Button>
        </ButtonGroup>
      }
    >
      <Text classes={`mb-3 ${type === "release" ? "text-red-500" : ""}`}>{warning}</Text>
    </Modal>
  );
};

// ═══════════════════════════════════════════════
// Buyout
// ═══════════════════════════════════════════════

const BuyoutModal: FC<Omit<BaseballTransactionModalProps, "action">> = ({
  isOpen,
  onClose,
  player,
  orgId,
  seasonContext,
  onSuccess,
}) => {
  const [buyoutAmount, setBuyoutAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const name = `${player.firstname} ${player.lastname}`;
  const numAmount = Number(buyoutAmount) || 0;

  const errors = useMemo(() => {
    const errs: string[] = [];
    if (!player.contract) errs.push("Player has no active contract");
    if (buyoutAmount !== "" && numAmount <= 0) errs.push("Buyout amount must be greater than 0");
    if (buyoutAmount === "") errs.push("Enter a buyout amount");
    return errs;
  }, [buyoutAmount, numAmount, player.contract]);

  const handleConfirm = useCallback(async () => {
    if (!player.contract || errors.length > 0) return;
    setIsSubmitting(true);
    try {
      const res = await BaseballService.BuyoutContract({
        contract_id: player.contract.id,
        org_id: orgId,
        buyout_amount: numAmount,
        league_year_id: seasonContext.current_league_year_id,
        game_week_id: seasonContext.current_week_index,
      });
      enqueueSnackbar(
        `${name} bought out for $${(res.buyout_amount / 1_000_000).toFixed(2)}M`,
        { variant: "success", autoHideDuration: 4000 },
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Buyout failed", { variant: "error", autoHideDuration: 4000 });
    }
    setIsSubmitting(false);
  }, [player, orgId, numAmount, seasonContext, errors, onSuccess, onClose, name]);

  const currentSalary = player.contract?.current_year_detail?.base_salary;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Buyout ${name}`}
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
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Border direction="col" classes="p-3 text-start">
          <Text variant="h6" classes="mb-2">Contract Info</Text>
          <Text variant="small">Years: {player.contract?.years ?? "—"}</Text>
          <Text variant="small">Current Year: {player.contract?.current_year ?? "—"}</Text>
          <Text variant="small">
            Salary: {currentSalary != null ? `$${(currentSalary / 1_000_000).toFixed(2)}M` : "—"}
          </Text>
        </Border>
        <Border direction="col" classes="p-3 text-start">
          <Text variant="h6" classes="mb-2">Errors</Text>
          {errors.length === 0 && <Text variant="small">None</Text>}
          {errors.map((err) => (
            <Text key={err} variant="small" classes="text-red-500">{err}</Text>
          ))}
        </Border>
      </div>
      <Text classes="mb-2 text-sm">
        The buyout terminates the original contract and creates a 1-year buyout contract.
        The buyout amount hits the ledger immediately.
      </Text>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          label="Buyout ($)"
          name="buyoutAmount"
          value={buyoutAmount}
          onChange={(e) => setBuyoutAmount(e.target.value)}
          min={0}
        />
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════════
// Extension
// ═══════════════════════════════════════════════

const ExtensionModal: FC<Omit<BaseballTransactionModalProps, "action">> = ({
  isOpen,
  onClose,
  player,
  orgId,
  seasonContext,
  onSuccess,
}) => {
  const [years, setYears] = useState(1);
  const [salaries, setSalaries] = useState<number[]>([0, 0, 0, 0, 0]);
  const [bonus, setBonus] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const name = `${player.firstname} ${player.lastname}`;

  const totalSalary = useMemo(() => {
    return salaries.slice(0, years).reduce((sum, s) => sum + s, 0);
  }, [salaries, years]);

  const errors = useMemo(() => {
    const errs: string[] = [];
    if (!player.contract) errs.push("Player has no active contract");
    if (years < 1 || years > 5) errs.push("Contract must be 1-5 years");
    if (totalSalary <= 0 && bonus <= 0) errs.push("Contract must have some value");
    for (let i = 0; i < years; i++) {
      if (salaries[i] < 0) errs.push(`Year ${i + 1} salary cannot be negative`);
    }
    if (bonus < 0) errs.push("Bonus cannot be negative");
    return errs;
  }, [player.contract, years, salaries, bonus, totalSalary]);

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
    if (!player.contract || errors.length > 0) return;
    setIsSubmitting(true);
    try {
      const res = await BaseballService.ExtendContract({
        contract_id: player.contract.id,
        org_id: orgId,
        years,
        salaries: salaries.slice(0, years),
        bonus,
        league_year_id: seasonContext.current_league_year_id,
        game_week_id: seasonContext.current_week_index,
      });
      enqueueSnackbar(
        `Extension offered to ${name} — ${res.years} year(s), starts year ${res.starts_league_year}`,
        { variant: "success", autoHideDuration: 4000 },
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Extension failed", { variant: "error", autoHideDuration: 4000 });
    }
    setIsSubmitting(false);
  }, [player, orgId, years, salaries, bonus, seasonContext, errors, onSuccess, onClose, name]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Extend ${name}`}
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
          <Text variant="xs">Contracts must be 1 through 5 years.</Text>
          <Text variant="xs">Extension starts the year after the current contract ends.</Text>
          <Text variant="xs">Bonus is validated against signing budget and hits the ledger immediately.</Text>
        </Border>
        <Border direction="col" classes="text-start p-3 overflow-y-auto">
          <Text variant="h6">Errors</Text>
          {errors.length === 0 && <Text variant="small">None</Text>}
          {errors.map((err) => (
            <Text key={err} variant="small" classes="text-red-500">{err}</Text>
          ))}
        </Border>
      </div>

      {/* Length + Bonus */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Input
          type="number"
          label="Years"
          name="years"
          value={years}
          min={1}
          max={5}
          onChange={(e) => setYears(Math.min(5, Math.max(1, Number(e.target.value) || 1)))}
        />
        <Input
          type="number"
          label="Bonus ($)"
          name="bonus"
          value={bonus}
          min={0}
          onChange={(e) => setBonus(Number(e.target.value) || 0)}
        />
        <Input
          type="number"
          label="Total"
          name="total"
          value={totalSalary + bonus}
          disabled
        />
      </div>

      {/* Per-year salary inputs */}
      <div className="grid grid-cols-5 gap-2 mb-2">
        {[0, 1, 2, 3, 4].map((i) => (
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

// ═══════════════════════════════════════════════
// Scouting Confirmation
// ═══════════════════════════════════════════════

interface ScoutingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  actionType: ScoutingActionType;
  budget: ScoutingBudget | null;
  orgId: number;
  leagueYearId: number;
  onSuccess: () => void;
}

export const ScoutingConfirmationModal: FC<ScoutingConfirmationModalProps> = ({
  isOpen,
  onClose,
  player,
  actionType,
  budget,
  orgId,
  leagueYearId,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const name = `${player.firstname} ${player.lastname}`;
  const label = SCOUTING_ACTION_LABELS[actionType] ?? actionType;
  const cost = SCOUTING_ACTION_COSTS[actionType] ?? 0;
  const remaining = budget?.remaining_points ?? 0;
  const canAfford = remaining >= cost;

  const handleConfirm = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await BaseballService.PerformScoutingAction({
        org_id: orgId,
        league_year_id: leagueYearId,
        player_id: player.id,
        action_type: actionType,
      });
      enqueueSnackbar(`${label} completed for ${name}`, {
        variant: "success",
        autoHideDuration: 3000,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      enqueueSnackbar(err?.message || `Scouting action failed`, {
        variant: "error",
        autoHideDuration: 4000,
      });
    }
    setIsSubmitting(false);
  }, [orgId, leagueYearId, player.id, actionType, label, name, onSuccess, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${label}`}
      actions={
        <ButtonGroup>
          <Button size="sm" variant="danger" onClick={onClose}>
            <Text variant="small">Cancel</Text>
          </Button>
          <Button
            size="sm"
            variant="success"
            onClick={handleConfirm}
            disabled={!canAfford || isSubmitting}
          >
            <Text variant="small">{isSubmitting ? "Processing..." : "Confirm"}</Text>
          </Button>
        </ButtonGroup>
      }
    >
      <Text classes="mb-2">
        Scout <strong>{name}</strong>
      </Text>
      <Text classes="mb-1 text-sm">
        Action: <strong>{label}</strong>
      </Text>
      <Text classes="mb-1 text-sm">
        Cost: <strong>{cost} pts</strong>
      </Text>
      <Text classes="mb-3 text-sm">
        Budget remaining: <strong className={canAfford ? "" : "text-red-500"}>{remaining} pts</strong>
      </Text>
      {!canAfford && (
        <Text classes="text-red-500 text-sm">
          Insufficient scouting budget for this action.
        </Text>
      )}
    </Modal>
  );
};
