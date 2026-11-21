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
  AUCTION_PHASE_LABELS,
  OFFER_STATUS_INFO,
} from "../../../../models/baseball/baseballFreeAgencyModels";
import { formatMoney } from "../BaseballFinancials/financialConstants";

const PRO_LEVEL_OPTIONS = [
  { value: 4, label: "Unassigned" },
  { value: 5, label: "A" },
  { value: 6, label: "High-A" },
  { value: 7, label: "AA" },
  { value: 8, label: "AAA" },
  { value: 9, label: "MLB" },
];

/** Contracts are 1–5 years; the player's demand narrows that range. */
const MAX_CONTRACT_YEARS = 5;

/** Money compared to the cent, so a restored 41M/3 offer equals the API's 13,666,666.67. */
const cents = (n: number) => Math.round(n * 100);

/** How a player weighs yearly average vs total value at his age (free agency guide). */
const ageWeighting = (age: number) =>
  age <= 28
    ? { aav: 30, total: 70, hint: "He values total guaranteed money, so more years help." }
    : age <= 31
      ? { aav: 50, total: 50, hint: "He weighs yearly salary and total value equally." }
      : age <= 33
        ? { aav: 70, total: 30, hint: "He leans toward yearly salary over total value." }
        : { aav: 85, total: 15, hint: "He is almost entirely after the highest yearly salary." };

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
  const demandMinAav = demand ? parseFloat(demand.min_aav) || 0 : 0;
  const demandMinYears = Math.min(
    Math.max(demand?.min_years ?? 1, 1),
    MAX_CONTRACT_YEARS,
  );
  const demandMaxYears = Math.min(
    Math.max(demand?.max_years ?? MAX_CONTRACT_YEARS, demandMinYears),
    MAX_CONTRACT_YEARS,
  );
  const demandMinTotal = demand?.min_total_value ?? 0;

  // A withdrawn, outbid, lost or failed offer is history, not something to update.
  const offerStatus = existingOffer?.status ?? "active";
  const hasActiveOffer = existingOffer != null && offerStatus === "active";
  const isUpdate = hasActiveOffer;
  const canLowerAav = phase === "open";

  const [years, setYears] = useState(demandMinYears);
  const [salaries, setSalaries] = useState<number[]>(
    Array(MAX_CONTRACT_YEARS).fill(demandMinAav),
  );
  const [bonus, setBonus] = useState(0);
  const [levelId, setLevelId] = useState(9);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  // Reset on open. New offers start at his ask; an active offer is restored
  // (the API doesn't return per-year salaries, so they're spread evenly,
  // which keeps the same total and yearly average).
  useEffect(() => {
    if (!isOpen) return;
    setConfirmWithdraw(false);
    if (hasActiveOffer && existingOffer) {
      const y = Math.min(Math.max(existingOffer.years, 1), MAX_CONTRACT_YEARS);
      const perYear = Math.round(
        (existingOffer.total_value - existingOffer.bonus) / y,
      );
      setYears(y);
      setBonus(existingOffer.bonus);
      setSalaries(Array(MAX_CONTRACT_YEARS).fill(Math.max(perYear, 0)));
    } else {
      setYears(demandMinYears);
      setSalaries(Array(MAX_CONTRACT_YEARS).fill(demandMinAav));
      setBonus(0);
      setLevelId(9);
    }
  }, [isOpen, hasActiveOffer, existingOffer, demandMinYears, demandMinAav]);

  const totalSalary = useMemo(
    () => salaries.slice(0, years).reduce((sum, s) => sum + s, 0),
    [salaries, years],
  );
  const totalValue = totalSalary + bonus;
  const aav = years > 0 ? totalValue / years : 0;
  // What an active offer reserves against the club's cash.
  const heldAmount = bonus + (salaries[0] ?? 0);

  // Why this club can't offer at all right now, if it can't.
  const blockedReason = useMemo(() => {
    if (phase === "completed" || phase === "expired" || phase === "withdrawn") {
      return "This auction is closed.";
    }
    if (phase !== "open" && !hasActiveOffer) {
      if (offerStatus === "outbid") return OFFER_STATUS_INFO.outbid.meaning;
      return `New clubs could only join during the Open stage. This auction is at ${AUCTION_PHASE_LABELS[phase]}.`;
    }
    return null;
  }, [phase, hasActiveOffer, offerStatus]);

  const errors = useMemo(() => {
    const errs: string[] = [];
    if (blockedReason) return [blockedReason];
    if (years < demandMinYears || years > demandMaxYears) {
      errs.push(
        demandMinYears === demandMaxYears
          ? `Length must be ${demandMinYears} years`
          : `Length must be ${demandMinYears}–${demandMaxYears} years`,
      );
    }
    for (let i = 0; i < years; i++) {
      if (salaries[i] < 0) errs.push(`Year ${i + 1} salary cannot be negative`);
      if (i > 0 && salaries[i] < salaries[i - 1]) {
        errs.push(`Year ${i + 1} salary cannot be less than Year ${i}`);
      }
      if (i > 0 && salaries[i] > salaries[i - 1]) {
        const maxRaise = Math.max(salaries[i - 1], 2_000_000);
        if (salaries[i] - salaries[i - 1] > maxRaise) {
          errs.push(`Year ${i + 1} raise exceeds max (${formatMoney(maxRaise)})`);
        }
      }
    }
    if (bonus < 0) errs.push("Bonus cannot be negative");
    if (demandMinAav > 0 && cents(aav) < cents(demandMinAav)) {
      errs.push(
        `Yearly average ${formatMoney(Math.round(aav))} is below his ask of ${formatMoney(demandMinAav)}`,
      );
    }
    if (demandMinTotal > 0 && totalValue < demandMinTotal) {
      errs.push(
        `Total ${formatMoney(totalValue)} is below his minimum total of ${formatMoney(demandMinTotal)}`,
      );
    }
    if (availableBudget != null && heldAmount > availableBudget) {
      errs.push(
        `This offer holds ${formatMoney(heldAmount)} but only ${formatMoney(availableBudget)} is available`,
      );
    }
    if (isUpdate && existingOffer && !canLowerAav && cents(aav) < cents(existingOffer.aav)) {
      errs.push(
        `Yearly average can't go below your current ${formatMoney(Math.round(existingOffer.aav))}`,
      );
    }
    return errs;
  }, [
    blockedReason,
    years,
    demandMinYears,
    demandMaxYears,
    salaries,
    bonus,
    demandMinAav,
    demandMinTotal,
    aav,
    totalValue,
    availableBudget,
    heldAmount,
    isUpdate,
    existingOffer,
    canLowerAav,
  ]);

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
        `${isUpdate ? "Updated" : "Submitted"} offer for ${playerName}: ${res.years} yr, ${formatMoney(Math.round(res.aav))} a year`,
        { variant: "success", autoHideDuration: 4000 },
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      // The server's message names the rule (and, for money, the cash and
      // reserved amounts), so show it as is.
      enqueueSnackbar(err?.message || "Offer failed", {
        variant: "error",
        autoHideDuration: 8000,
      });
    }
    setIsSubmitting(false);
  }, [errors, auctionId, orgId, years, salaries, bonus, levelId, leagueYearId, gameWeekId, isUpdate, playerName, onSuccess, onClose, enqueueSnackbar]);

  const handleWithdraw = useCallback(async () => {
    if (!confirmWithdraw) {
      setConfirmWithdraw(true);
      return;
    }
    setIsSubmitting(true);
    try {
      await BaseballService.WithdrawFAOffer(auctionId, orgId);
      enqueueSnackbar(
        `Withdrew your offer for ${playerName}. You can offer again while the auction is Open.`,
        { variant: "info", autoHideDuration: 5000 },
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Withdraw failed", {
        variant: "error",
        autoHideDuration: 8000,
      });
      setConfirmWithdraw(false);
    }
    setIsSubmitting(false);
  }, [confirmWithdraw, auctionId, orgId, playerName, onSuccess, onClose, enqueueSnackbar]);

  if (!isOpen) return null;

  const modalTitle = blockedReason
    ? playerName
    : !isUpdate
    ? `Make Offer: ${playerName}`
    : canLowerAav
      ? `Update Offer: ${playerName}`
      : `Increase Offer: ${playerName}`;
  const submitLabel = !isUpdate ? "Submit Offer" : canLowerAav ? "Update Offer" : "Increase Offer";
  const canWithdraw = hasActiveOffer && phase === "open";
  const weighting = age != null ? ageWeighting(age) : null;
  const pastStatus =
    existingOffer && !hasActiveOffer ? OFFER_STATUS_INFO[offerStatus] : null;

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
          {canWithdraw && (
            <Button
              size="sm"
              variant="warning"
              onClick={handleWithdraw}
              disabled={isSubmitting}
            >
              <Text variant="small">
                {confirmWithdraw ? "Confirm withdraw" : "Withdraw offer"}
              </Text>
            </Button>
          )}
          {!blockedReason && (
            <Button
              size="sm"
              variant={errors.length === 0 ? "success" : "warning"}
              onClick={handleConfirm}
              disabled={errors.length > 0 || isSubmitting}
            >
              <Text variant="small">{isSubmitting ? "Processing..." : submitLabel}</Text>
            </Button>
          )}
        </ButtonGroup>
      }
    >
      {/* Player Demands */}
      {demand && (
        <Border direction="col" classes="p-3 mb-4 text-start">
          <Text variant="h6" classes="mb-2">His Ask</Text>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <Text variant="small">Yearly average: <strong>{formatMoney(demandMinAav)}</strong></Text>
            {demandMinTotal > 0 && (
              <Text variant="small">Minimum total: <strong>{formatMoney(demandMinTotal)}</strong></Text>
            )}
            <Text variant="small">
              Length: <strong>{demandMinYears === demandMaxYears ? demandMinYears : `${demandMinYears}–${demandMaxYears}`} yr</strong>
            </Text>
            {demand.war > 0 && <Text variant="small">WAR: <strong>{demand.war}</strong></Text>}
            {age != null && <Text variant="small">Age: <strong>{age}</strong></Text>}
          </div>
          {weighting && (
            <Text variant="xs" classes="mt-2 text-gray-400">
              How he chooses: at {age}, he weighs yearly average {weighting.aav}% and
              total value {weighting.total}%. {weighting.hint}
            </Text>
          )}
        </Border>
      )}

      {/* Why this club can't offer, or what happened to its last offer */}
      {blockedReason && (
        <Border direction="col" classes="p-3 mb-4 text-start">
          <Text variant="small" classes="font-semibold">{blockedReason}</Text>
        </Border>
      )}
      {!blockedReason && pastStatus && (
        <Text variant="xs" classes="mb-3 text-gray-400">
          Last offer: {pastStatus.label}. {pastStatus.meaning}
        </Text>
      )}

      {/* Existing offer info */}
      {isUpdate && existingOffer && (
        <Border direction="col" classes="p-3 mb-4 text-start">
          <Text variant="h6" classes="mb-2">Your Current Offer</Text>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <Text variant="small">Years: <strong>{existingOffer.years}</strong></Text>
            <Text variant="small">Yearly average: <strong>{formatMoney(Math.round(existingOffer.aav))}</strong></Text>
            <Text variant="small">Total: <strong>{formatMoney(existingOffer.total_value)}</strong></Text>
          </div>
          {!canLowerAav && (
            <Text variant="xs" classes="text-yellow-400 mt-1">
              After the Open stage you can only raise the yearly average.
            </Text>
          )}
        </Border>
      )}

      {!blockedReason && (
        <>
          {/* Money held + Errors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <Border direction="col" classes="p-3 text-start">
              <Text variant="small" classes="font-semibold mb-1">
                This offer holds {formatMoney(heldAmount)}
              </Text>
              <Text variant="xs" classes="text-gray-400">
                Signing bonus plus first-season salary, held while the offer is active.
              </Text>
              {availableBudget != null && (
                <Text variant="xs" classes="text-gray-400 mt-1">
                  Cash available for signings: {formatMoney(availableBudget)}, less
                  what your other active offers hold.
                </Text>
              )}
              <Text variant="xs" classes="text-gray-400 mt-1">
                Stage: <span className="font-semibold">{AUCTION_PHASE_LABELS[phase] ?? phase}</span>
              </Text>
            </Border>
            <Border direction="col" classes="p-3 text-start overflow-y-auto">
              <Text variant="h6">Problems</Text>
              {errors.length === 0 && <Text variant="small">None</Text>}
              {errors.map((err) => (
                <Text key={err} variant="small" classes="text-red-500">{err}</Text>
              ))}
            </Border>
          </div>

          {/* Length + Bonus + Level */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1" htmlFor="fa-offer-years">Years</label>
              <select
                id="fa-offer-years"
                className="w-full text-sm border rounded-sm px-2 py-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              <label className="block text-xs text-gray-400 mb-1" htmlFor="fa-offer-level">Level</label>
              <select
                id="fa-offer-level"
                className="w-full text-sm border rounded-sm px-2 py-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              <Text variant="small">Total: <strong>{formatMoney(totalValue)}</strong></Text>
              <Text variant="small">Yearly avg: <strong>{formatMoney(Math.round(aav))}</strong></Text>
            </div>
          </div>

          {/* Per-year salary inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-2">
            {Array.from({ length: MAX_CONTRACT_YEARS }, (_, i) => (
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

          {/* Meets ask indicator (text, not just color) */}
          {demandMinAav > 0 && totalValue > 0 && (
            <Text variant="small" classes={`mt-2 ${cents(aav) >= cents(demandMinAav) ? "text-green-400" : "text-red-400"}`}>
              {cents(aav) >= cents(demandMinAav) ? "✓ Meets his ask" : "✗ Below his ask"}
            </Text>
          )}
        </>
      )}
    </Modal>
  );
};
