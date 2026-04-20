import { FC, memo } from "react";
import { Text } from "../../../../../_design/Typography";
import { Border } from "../../../../../_design/Borders";
import { formatMoney, faPhaseBadge } from "../utils/playerModalUtils";
import { getClassYear } from "../../../../../_utility/baseballHelpers";
import type { FAPlayerDetailResponse } from "../../../../../models/baseball/baseballFreeAgencyModels";

interface ContractTabProps {
  contract?: any;
  isCollege: boolean;
  faDetail?: FAPlayerDetailResponse | null;
}

export const ContractTab: FC<ContractTabProps> = memo(
  ({ contract, isCollege, faDetail }) => {
    const hasFAData =
      faDetail &&
      (faDetail.demand ||
        faDetail.contract_history?.length ||
        faDetail.auction);

    // Current contract section (MLB) — shown for both FA and standard views
    const renderCurrentContract = () => {
      if (!contract || isCollege) return null;
      const salary = contract.current_year_detail?.base_salary;
      const salaryDisplay = salary != null ? formatMoney(salary) : "—";
      const bonusDisplay = contract.bonus ? formatMoney(contract.bonus) : "—";

      return (
        <Border classes="p-3">
          <Text variant="small" classes="font-semibold mb-3">
            Current Contract
          </Text>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <Text
                variant="body"
                classes="mb-1 whitespace-nowrap font-semibold"
              >
                Term
              </Text>
              <Text variant="small">
                Yr {contract.current_year} of {contract.years}
              </Text>
            </div>
            <div className="flex flex-col">
              <Text
                variant="body"
                classes="mb-1 whitespace-nowrap font-semibold"
              >
                Salary
              </Text>
              <Text variant="small">{salaryDisplay}</Text>
            </div>
            {contract.bonus > 0 && (
              <div className="flex flex-col">
                <Text
                  variant="body"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Bonus
                </Text>
                <Text variant="small">{bonusDisplay}</Text>
              </div>
            )}
            {contract.on_ir && (
              <div className="flex flex-col">
                <Text
                  variant="body"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  IL Status
                </Text>
                <Text
                  variant="small"
                  classes="text-red-600 dark:text-red-400 font-semibold"
                >
                  On IL
                </Text>
              </div>
            )}
          </div>
        </Border>
      );
    };

    // FA mode — show current contract, demands, contract history, and auction status
    if (hasFAData) {
      const { demand, contract_history, auction } = faDetail;
      return (
        <div className="space-y-3">
          {/* Current Contract (the contract a claiming team would adopt) */}
          {renderCurrentContract()}

          {/* Demands */}
          {demand && (
            <Border classes="p-3">
              <Text variant="small" classes="font-semibold mb-2">
                Demands
              </Text>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <Text
                    variant="body"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Min AAV
                  </Text>
                  <Text variant="small">{formatMoney(demand.min_aav)}</Text>
                </div>
                <div className="flex flex-col">
                  <Text
                    variant="body"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Years
                  </Text>
                  <Text variant="small">
                    {demand.min_years}–{demand.max_years ?? 5}
                  </Text>
                </div>
                <div className="flex flex-col">
                  <Text
                    variant="body"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    WAR
                  </Text>
                  <Text variant="small">{demand.war}</Text>
                </div>
              </div>
            </Border>
          )}

          {/* Contract History */}
          {contract_history && contract_history.length > 0 && (
            <Border classes="p-3">
              <Text variant="small" classes="font-semibold mb-2">
                Contract History
              </Text>
              <div className="space-y-1">
                {contract_history.map((ch, i) => (
                  <Text key={i} variant="small">
                    {ch.org} — {ch.years}yr, {formatMoney(ch.salary)}/yr
                    {ch.bonus > 0 && ` + ${formatMoney(ch.bonus)} bonus`}
                    {ch.is_extension ? " (ext)" : ""}
                    {ch.is_buyout ? " (buyout)" : ""}
                    {" — signed "}
                    {ch.signed_year}
                  </Text>
                ))}
              </div>
            </Border>
          )}

          {/* Auction Status */}
          {auction && (
            <Border classes="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Text variant="small" classes="font-semibold">
                  Auction Status
                </Text>
                {faPhaseBadge(auction.phase)}
              </div>
              <Text variant="small">{auction.offer_count} offer(s)</Text>
              {auction.competing_teams.length > 0 && (
                <Text variant="small">
                  Competing: {auction.competing_teams.join(", ")}
                </Text>
              )}
              {auction.my_offer ? (
                <Text
                  variant="small"
                  classes="text-green-600 dark:text-green-400"
                >
                  Your offer: {auction.my_offer.years}yr,{" "}
                  {formatMoney(auction.my_offer.aav)} AAV
                </Text>
              ) : (
                <Text variant="small" classes="text-gray-400">
                  No offer submitted
                </Text>
              )}
            </Border>
          )}
        </div>
      );
    }

    // Standard mode — existing contract display
    if (!contract) {
      return (
        <Border classes="p-3">
          <Text variant="xs" classes="text-gray-400">
            No contract data available.
          </Text>
        </Border>
      );
    }

    if (isCollege) {
      const classYear = getClassYear(contract);
      return (
        <Border classes="p-3">
          <Text variant="small" classes="font-semibold mb-3">
            Eligibility
          </Text>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <Text
                variant="body"
                classes="mb-1 whitespace-nowrap font-semibold"
              >
                Class
              </Text>
              <Text variant="small">{classYear.label || "—"}</Text>
            </div>
            <div className="flex flex-col">
              <Text
                variant="body"
                classes="mb-1 whitespace-nowrap font-semibold"
              >
                Year
              </Text>
              <Text variant="small">
                {contract.current_year} of {contract.years}
              </Text>
            </div>
            {contract.is_extension && (
              <div className="flex flex-col">
                <Text
                  variant="body"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Redshirt
                </Text>
                <Text
                  variant="small"
                  classes="text-yellow-600 dark:text-yellow-400"
                >
                  Yes
                </Text>
              </div>
            )}
          </div>
        </Border>
      );
    }

    // MLB contract (non-FA)
    return renderCurrentContract() ?? (
      <Border classes="p-3">
        <Text variant="xs" classes="text-gray-400">
          No contract data available.
        </Text>
      </Border>
    );
  },
);
