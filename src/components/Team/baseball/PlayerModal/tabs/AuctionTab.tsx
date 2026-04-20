import { FC, memo } from "react";
import { Text } from "../../../../../_design/Typography";
import { Border } from "../../../../../_design/Borders";
import {
  formatCurrency,
  ifaPhaseBadge,
  IFA_OFFER_STATUS_CLASS_MAP,
} from "../utils/playerModalUtils";
import type { IFAAuctionDetail } from "../../../../../models/baseball/baseballIFAModels";
import {
  IFA_OFFER_STATUS_COLORS,
  type IFAOfferStatus,
} from "../../../../../models/baseball/baseballIFAModels";

interface AuctionTabProps {
  detail: IFAAuctionDetail;
}

export const AuctionTab: FC<AuctionTabProps> = memo(({ detail }) => {
  return (
    <div className="space-y-4">
      {/* Auction Status */}
      <Border direction="col" classes="p-3 text-start">
        <div className="flex items-center gap-3 mb-2">
          <Text variant="h6">Auction Status</Text>
          {ifaPhaseBadge(detail.phase)}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <Text variant="small">
            Entered Week: <strong>{detail.entered_week}</strong>
          </Text>
          <Text variant="small">
            Total Offers: <strong>{detail.offers.length}</strong>
          </Text>
          {detail.winning_offer_id && (
            <Text variant="small" classes="text-blue-400">
              Winner determined
            </Text>
          )}
        </div>
      </Border>

      {/* Offers Table */}
      <Border direction="col" classes="p-3 text-start">
        <Text variant="h6" classes="mb-2">
          Offers
        </Text>
        {detail.offers.length === 0 ? (
          <Text variant="small" classes="text-gray-400">
            No offers yet.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-2 py-1 text-xs font-semibold text-left">
                    Org
                  </th>
                  <th className="px-2 py-1 text-xs font-semibold text-left">
                    Status
                  </th>
                  <th className="px-2 py-1 text-xs font-semibold text-left">
                    Week
                  </th>
                  <th className="px-2 py-1 text-xs font-semibold text-left">
                    Bonus
                  </th>
                </tr>
              </thead>
              <tbody>
                {detail.offers.map((offer) => {
                  const statusColor =
                    IFA_OFFER_STATUS_COLORS[
                      offer.status as IFAOfferStatus
                    ] ?? "gray";
                  return (
                    <tr
                      key={offer.offer_id}
                      className={`border-b border-gray-800 ${offer.is_mine ? "bg-blue-900/10" : ""}`}
                    >
                      <td className="px-2 py-1 font-medium">
                        {offer.org_abbrev}
                        {offer.is_mine && (
                          <span className="ml-1 text-blue-400 text-[10px]">
                            (you)
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1">
                        <span
                          className={`capitalize font-semibold ${IFA_OFFER_STATUS_CLASS_MAP[statusColor]}`}
                        >
                          {offer.status}
                        </span>
                      </td>
                      <td className="px-2 py-1">
                        Week {offer.submitted_week}
                      </td>
                      <td className="px-2 py-1">
                        {offer.is_mine && offer.bonus != null ? (
                          <span className="text-green-400 font-semibold">
                            {formatCurrency(offer.bonus)}
                          </span>
                        ) : (
                          <span className="text-gray-500 italic">hidden</span>
                        )}
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
        <Text variant="h6" classes="mb-1">
          Contract Terms (fixed)
        </Text>
        <Text variant="small" classes="text-gray-400">
          5 years at $40,000/year - Assigned to Level 4 (Low Minors)
        </Text>
      </Border>
    </div>
  );
});
