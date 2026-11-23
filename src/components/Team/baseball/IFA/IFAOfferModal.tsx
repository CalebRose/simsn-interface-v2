import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "../../../../_design/Modal";
import { Text } from "../../../../_design/Typography";
import { Border } from "../../../../_design/Borders";
import { Button, ButtonGroup } from "../../../../_design/Buttons";
import { stepPresets } from "../../../Common/MoneyInput";
import { CurrencyInput } from "../FreeAgency/CurrencyInput";
import { BaseballService } from "../../../../_services/baseballService";
import { useSnackbar } from "notistack";
import type { IFAAuctionPhase, IFAMyOffer } from "../../../../models/baseball/baseballIFAModels";

interface IFAOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  auctionId: number;
  phase: IFAAuctionPhase;
  starRating: number;
  slotValue: number;
  existingOffer: IFAMyOffer | null;
  orgId: number;
  leagueYearId: number;
  poolRemaining: number;
  onSuccess: () => void;
}

const formatCurrency = (val: number): string => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
};

export const IFAOfferModal: FC<IFAOfferModalProps> = ({
  isOpen,
  onClose,
  playerName,
  auctionId,
  phase,
  starRating,
  slotValue,
  existingOffer,
  orgId,
  leagueYearId,
  poolRemaining,
  onSuccess,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const isUpdate = existingOffer != null;

  const [bonus, setBonus] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBonus(existingOffer ? existingOffer.bonus : slotValue);
    }
  }, [isOpen, existingOffer, slotValue]);

  // For updates, available pool includes the current committed amount
  const effectiveRemaining = isUpdate
    ? poolRemaining + (existingOffer?.bonus ?? 0)
    : poolRemaining;

  const errors = useMemo(() => {
    const errs: string[] = [];
    if (bonus < slotValue) {
      errs.push(`Bonus must be at least ${formatCurrency(slotValue)} (slot value)`);
    }
    if (bonus > effectiveRemaining) {
      errs.push(`Bonus exceeds available pool (${formatCurrency(effectiveRemaining)})`);
    }
    if (isUpdate && existingOffer && (phase === "listening" || phase === "finalize")) {
      if (bonus < existingOffer.bonus) {
        errs.push("Cannot decrease bonus in this phase");
      }
    }
    return errs;
  }, [bonus, slotValue, effectiveRemaining, isUpdate, existingOffer, phase]);

  const handleConfirm = useCallback(async () => {
    if (errors.length > 0) return;
    setIsSubmitting(true);
    try {
      await BaseballService.SubmitIFAOffer(auctionId, {
        org_id: orgId,
        bonus,
        league_year_id: leagueYearId,
        executed_by: "user",
      });
      enqueueSnackbar(
        `${isUpdate ? "Updated" : "Submitted"} offer for ${playerName} — ${formatCurrency(bonus)}`,
        { variant: "success", autoHideDuration: 4000 },
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Offer failed", { variant: "error", autoHideDuration: 4000 });
    }
    setIsSubmitting(false);
  }, [errors, auctionId, orgId, bonus, leagueYearId, isUpdate, playerName, onSuccess, onClose, enqueueSnackbar]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isUpdate ? "Update" : "Make"} Offer: ${playerName}`}
      maxWidth="sm:max-w-xl min-[1025px]:max-w-[40vw]"
      mobileSheet
      closeOnOutsideClick={false}
      footer={
        <div className="text-start">
          <Text variant="small">
            Bonus: <strong>{formatCurrency(bonus)}</strong>
            <span className="text-gray-400"> · pool left after: {formatCurrency(Math.max(0, effectiveRemaining - bonus))}</span>
          </Text>
          {errors.map((err) => (
            <Text key={err} variant="xs" classes="mt-1 text-red-500">{err}</Text>
          ))}
        </div>
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
            <Text variant="small">{isSubmitting ? "Processing..." : isUpdate ? "Update Offer" : "Submit Offer"}</Text>
          </Button>
        </ButtonGroup>
      }
    >
      {/* Player Info */}
      <Border direction="col" classes="p-3 mb-4 text-start">
        <Text variant="h6" classes="mb-2">Player Info</Text>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <Text variant="small">Stars: <strong>{"★".repeat(starRating)}{"☆".repeat(5 - starRating)}</strong></Text>
          <Text variant="small">Slot Value (min): <strong>{formatCurrency(slotValue)}</strong></Text>
        </div>
      </Border>

      {/* Current offer */}
      {isUpdate && existingOffer && (
        <Border direction="col" classes="p-3 mb-4 text-start">
          <Text variant="h6" classes="mb-2">Current Offer</Text>
          <Text variant="small">Bonus: <strong>{formatCurrency(existingOffer.bonus)}</strong></Text>
        </Border>
      )}

      {/* Pool + Phase */}
      <Border direction="col" classes="p-3 mb-4 text-start">
        <Text variant="small" classes="font-semibold mb-1">
          Pool Available: {formatCurrency(effectiveRemaining)}
        </Text>
        <Text variant="small" classes="text-gray-400">
          Phase: <span className="font-semibold capitalize">{phase}</span>
        </Text>
      </Border>

      {/* Bonus input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2 text-start">
        <CurrencyInput
          id="ifa-offer-bonus"
          label="Signing bonus"
          value={bonus}
          onChange={setBonus}
          presets={[
            { label: "Slot value", apply: () => slotValue },
            ...stepPresets(10_000, 100_000),
            { label: "Whole pool", apply: () => effectiveRemaining },
          ]}
        />
        <div className="flex flex-col justify-start">
          <Text variant="xs" classes="text-gray-400 mb-1">Contract Terms (fixed)</Text>
          <Text variant="small">5 years at $40,000/year</Text>
          <Text variant="small">Assigned to Level 4 (Low Minors)</Text>
        </div>
      </div>
    </Modal>
  );
};
