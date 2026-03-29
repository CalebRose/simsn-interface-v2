import { FC, useCallback, useEffect, useState } from "react";
import { Modal } from "../../../../_design/Modal";
import { Text } from "../../../../_design/Typography";
import { Border } from "../../../../_design/Borders";
import { Button, ButtonGroup } from "../../../../_design/Buttons";
import { BaseballService } from "../../../../_services/baseballService";
import { useSnackbar } from "notistack";
import type {
  IFAAuctionDetail,
  IFAAuctionPhase,
  IFAOfferStatus,
} from "../../../../models/baseball/baseballIFAModels";
import { IFA_PHASE_COLORS, IFA_OFFER_STATUS_COLORS } from "../../../../models/baseball/baseballIFAModels";

const formatCurrency = (val: number): string => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
};

const phaseClasses: Record<string, string> = {
  green: "bg-green-600/20 text-green-400",
  yellow: "bg-yellow-600/20 text-yellow-400",
  red: "bg-red-600/20 text-red-400",
  gray: "bg-gray-600/20 text-gray-400",
};

const offerStatusClasses: Record<string, string> = {
  green: "text-green-400",
  blue: "text-blue-400",
  yellow: "text-yellow-400",
  red: "text-red-400",
  gray: "text-gray-400",
};

interface IFAPlayerDetailProps {
  isOpen: boolean;
  onClose: () => void;
  auctionId: number;
  orgId: number;
  ifaStatus: "active" | "pending" | "complete";
  onMakeOffer: (detail: IFAAuctionDetail) => void;
  onWithdraw: (auctionId: number) => void;
}

export const IFAPlayerDetail: FC<IFAPlayerDetailProps> = ({
  isOpen,
  onClose,
  auctionId,
  orgId,
  ifaStatus,
  onMakeOffer,
  onWithdraw,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [detail, setDetail] = useState<IFAAuctionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !auctionId) return;
    setIsLoading(true);
    BaseballService.GetIFAAuctionDetail(auctionId, orgId)
      .then(setDetail)
      .catch((err) => {
        enqueueSnackbar("Failed to load auction detail", { variant: "error" });
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, auctionId, orgId, enqueueSnackbar]);

  if (!isOpen) return null;

  const myOffer = detail?.offers.find((o) => o.is_mine);
  const canOffer = ifaStatus === "active" && detail && detail.phase !== "completed";
  const canWithdraw = ifaStatus === "active" && detail?.phase === "open" && myOffer?.status === "active";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={detail ? `${detail.firstName} ${detail.lastName}` : "Auction Detail"}
      maxWidth="min-[1025px]:max-w-[50vw]"
      actions={
        detail && (
          <ButtonGroup>
            <Button size="sm" variant="primaryOutline" onClick={onClose}>
              <Text variant="small">Close</Text>
            </Button>
            {canWithdraw && (
              <Button size="sm" variant="danger" onClick={() => onWithdraw(detail.auction_id)}>
                <Text variant="small">Withdraw</Text>
              </Button>
            )}
            {canOffer && (
              <Button size="sm" variant="success" onClick={() => onMakeOffer(detail)}>
                <Text variant="small">{myOffer ? "Update Offer" : "Make Offer"}</Text>
              </Button>
            )}
          </ButtonGroup>
        )
      }
    >
      {isLoading ? (
        <div className="py-8 text-center">
          <Text variant="body" classes="text-gray-400">Loading...</Text>
        </div>
      ) : !detail ? (
        <div className="py-8 text-center">
          <Text variant="body" classes="text-gray-400">Auction not found.</Text>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Player Bio */}
          <Border direction="col" classes="p-3 text-start">
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <Text variant="small">Age: <strong>{detail.age}</strong></Text>
              <Text variant="small">Type: <strong>{detail.ptype === "Pitcher" ? "P" : "Pos"}</strong></Text>
              <Text variant="small">Country: <strong>{detail.area}</strong></Text>
              <Text variant="small">Stars: <strong className="text-yellow-400">{"★".repeat(detail.star_rating)}{"☆".repeat(5 - detail.star_rating)}</strong></Text>
              <Text variant="small">Slot Value: <strong>{formatCurrency(detail.slot_value)}</strong></Text>
            </div>
          </Border>

          {/* Auction Status */}
          <Border direction="col" classes="p-3 text-start">
            <div className="flex items-center gap-3 mb-2">
              <Text variant="h6">Auction Status</Text>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${phaseClasses[IFA_PHASE_COLORS[detail.phase] ?? "gray"]}`}>
                {detail.phase}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <Text variant="small">Entered Week: <strong>{detail.entered_week}</strong></Text>
              <Text variant="small">Total Offers: <strong>{detail.offers.length}</strong></Text>
              {detail.winning_offer_id && (
                <Text variant="small" classes="text-blue-400">Winner determined</Text>
              )}
            </div>
          </Border>

          {/* Offers Table */}
          <Border direction="col" classes="p-3 text-start">
            <Text variant="h6" classes="mb-2">Offers</Text>
            {detail.offers.length === 0 ? (
              <Text variant="small" classes="text-gray-400">No offers yet.</Text>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-2 py-1 text-xs font-semibold text-left">Org</th>
                      <th className="px-2 py-1 text-xs font-semibold text-left">Status</th>
                      <th className="px-2 py-1 text-xs font-semibold text-left">Week</th>
                      <th className="px-2 py-1 text-xs font-semibold text-left">Bonus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.offers.map((offer) => {
                      const statusColor = IFA_OFFER_STATUS_COLORS[offer.status as IFAOfferStatus] ?? "gray";
                      return (
                        <tr
                          key={offer.offer_id}
                          className={`border-b border-gray-800 ${offer.is_mine ? "bg-blue-900/10" : ""}`}
                        >
                          <td className="px-2 py-1 font-medium">
                            {offer.org_abbrev}
                            {offer.is_mine && <span className="ml-1 text-blue-400 text-[10px]">(you)</span>}
                          </td>
                          <td className="px-2 py-1">
                            <span className={`capitalize font-semibold ${offerStatusClasses[statusColor]}`}>
                              {offer.status}
                            </span>
                          </td>
                          <td className="px-2 py-1">Week {offer.submitted_week}</td>
                          <td className="px-2 py-1">
                            {offer.is_mine && offer.bonus != null
                              ? <span className="text-green-400 font-semibold">{formatCurrency(offer.bonus)}</span>
                              : <span className="text-gray-500 italic">hidden</span>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Border>

          {/* Contract Terms */}
          <Border direction="col" classes="p-3 text-start">
            <Text variant="h6" classes="mb-1">Contract Terms (fixed)</Text>
            <Text variant="small" classes="text-gray-400">5 years at $40,000/year · Assigned to Level 4 (Low Minors)</Text>
          </Border>
        </div>
      )}
    </Modal>
  );
};
