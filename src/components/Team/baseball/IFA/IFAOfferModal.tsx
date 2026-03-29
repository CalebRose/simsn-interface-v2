import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "../../../../_design/Modal";
import { Text } from "../../../../_design/Typography";
import { Border } from "../../../../_design/Borders";
import { Button, ButtonGroup } from "../../../../_design/Buttons";
import { Input } from "../../../../_design/Inputs";
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
      maxWidth="min-[1025px]:max-w-[40vw]"
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

      {/* Budget + Phase + Errors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        <Border direction="col" classes="p-3 text-start">
          <Text variant="small" classes="font-semibold mb-1">
            Pool Available: {formatCurrency(effectiveRemaining)}
          </Text>
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

      {/* Bonus input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        <Input
          type="number"
          label="Signing Bonus ($)"
          name="bonus"
          value={bonus}
          min={slotValue}
          onChange={(e) => setBonus(Number(e.target.value) || 0)}
        />
        <div className="flex flex-col justify-end">
          <Text variant="xs" classes="text-gray-400 mb-1">Contract Terms (fixed)</Text>
          <Text variant="small">5 years at $40,000/year</Text>
          <Text variant="small">Assigned to Level 4 (Low Minors)</Text>
        </div>
      </div>
    </Modal>
  );
};
