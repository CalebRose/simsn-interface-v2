import { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  FreeAgentOffer,
  League,
  OfferAction,
  SimNBA,
  SimNFL,
  SimPHL,
  WaiverOffer,
} from "../../_constants/constants";
import {
  FreeAgencyOffer as PHLFreeAgencyOffer,
  ProfessionalPlayer,
  WaiverOffer as PHLWaiverOffer,
  Timestamp as HCKTimestamp,
  ProCapsheet,
  FreeAgencyOfferDTO as PHLFreeAgencyOfferDTO,
} from "../../models/hockeyModels";
import {
  FreeAgencyOffer as NFLFreeAgencyOffer,
  NFLPlayer,
  NFLWaiverOffer,
  Timestamp as FBTimestamp,
  NFLCapsheet,
  Timestamp,
  FreeAgencyOfferDTO,
} from "../../models/footballModels";
import {
  NBAContractOffer,
  NBAPlayer,
  NBAWaiverOffer,
  Timestamp as BKTimestamp,
  NBACapsheet,
} from "../../models/basketballModels";
import { Modal } from "../../_design/Modal";
import { Text } from "../../_design/Typography";
import { Border } from "../../_design/Borders";
import { Input } from "../../_design/Inputs";
import { Button, ButtonGroup } from "../../_design/Buttons";
import {
  createOffer,
  GenerateNFLFAErrorList,
  GeneratePHLFAErrorList,
  GetNFLAAVValue,
  GetNFLContractValue,
  getNFLSalaryData,
  getPHLSalaryData,
} from "../../_helper/offerHelper";

interface OfferModalProps {
  action: OfferAction;
  player: ProfessionalPlayer | NFLPlayer | NBAPlayer;
  existingOffer?:
    | PHLFreeAgencyOffer
    | PHLWaiverOffer
    | NFLFreeAgencyOffer
    | NFLWaiverOffer
    | NBAContractOffer
    | NBAWaiverOffer;
  league: League;
  isOpen: boolean;
  ts: HCKTimestamp | FBTimestamp | BKTimestamp;
  capsheet: ProCapsheet | NFLCapsheet | NBACapsheet;
  onClose: () => void;
  confirmOffer: (dto: any) => Promise<void>;
}

export const OfferModal: FC<OfferModalProps> = ({
  isOpen,
  onClose,
  action,
  player,
  league,
  existingOffer,
  ts,
  capsheet,
  confirmOffer,
}) => {
  const [offer, setOffer] = useState<
    | PHLFreeAgencyOffer
    | PHLWaiverOffer
    | NFLFreeAgencyOffer
    | NFLWaiverOffer
    | NBAContractOffer
    | NBAWaiverOffer
  >(() => {
    if (league === SimNFL && action === FreeAgentOffer) {
      return new NFLFreeAgencyOffer({ existingOffer });
    }
    if (league === SimNFL && action === WaiverOffer) {
      return new NFLWaiverOffer({ existingOffer });
    }
    if (league === SimNBA && action === FreeAgentOffer) {
      return new NBAContractOffer({ existingOffer });
    }
    if (league === SimNBA && action === WaiverOffer) {
      return new NBAWaiverOffer({ existingOffer });
    }
    if (league === SimPHL && action === WaiverOffer) {
      return new PHLWaiverOffer({ existingOffer });
    }
    if (league === SimNFL && action === FreeAgentOffer) {
      return new NFLFreeAgencyOffer();
    }
    if (league === SimNFL && action === WaiverOffer) {
      return new NFLWaiverOffer();
    }
    if (league === SimNBA && action === FreeAgentOffer) {
      return new NBAContractOffer();
    }
    if (league === SimNBA && action === WaiverOffer) {
      return new NBAWaiverOffer();
    }
    if (league === SimPHL && action === WaiverOffer) {
      return new PHLWaiverOffer();
    }
    return new PHLFreeAgencyOffer();
  });

  useEffect(() => {
    setOffer(createOffer(league, action, existingOffer));
  }, [existingOffer, league, action]);

  const isNFL = useMemo(() => {
    return league === SimNFL && offer instanceof NFLFreeAgencyOffer;
  }, [league]);

  const isNBA = useMemo(() => {
    return league === SimNBA && offer instanceof NBAContractOffer;
  }, [league]);

  const isPHL = useMemo(() => {
    return league === SimPHL && offer instanceof PHLFreeAgencyOffer;
  }, [league]);

  const playerLabel = useMemo(() => {
    return `${player.Age} year, ${player.Position} ${player.FirstName} ${player.LastName}`;
  }, [player]);

  const title = useMemo(() => {
    if (action === FreeAgentOffer) {
      return `Offer ${playerLabel}`;
    } else if (action === WaiverOffer) {
      return `Pick Up ${playerLabel}`;
    }
    return "";
  }, [action, playerLabel]);

  const totalBonus = useMemo(() => {
    if (!offer || !isNFL) return 0;
    let total = 0;
    if (offer.Y1Bonus) {
      total += offer.Y1Bonus;
    }
    if (offer.Y2Bonus) {
      total += offer.Y2Bonus;
    }
    if (offer.Y3Bonus) {
      total += offer.Y3Bonus;
    }
    if (offer.Y4Bonus) {
      total += offer.Y4Bonus;
    }
    if (offer.Y5Bonus) {
      total += offer.Y5Bonus;
    }
    return total;
  }, [offer, isNFL]);

  const totalSalary = useMemo(() => {
    if (!offer) return 0;
    if (isNFL || isPHL) {
      let total = 0;
      if (offer.Y1BaseSalary) {
        total += offer.Y1BaseSalary;
      }
      if (offer.Y2BaseSalary) {
        total += offer.Y2BaseSalary;
      }
      if (offer.Y3BaseSalary) {
        total += offer.Y3BaseSalary;
      }
      if (offer.Y4BaseSalary) {
        total += offer.Y4BaseSalary;
      }
      if (offer.Y5BaseSalary) {
        total += offer.Y5BaseSalary;
      }
      return total;
    }
    if (isNBA) {
      return (
        offer.Year1Total +
        offer.Year2Total +
        offer.Year3Total +
        offer.Year4Total +
        offer.Year5Total
      );
    }
    return 0;
  }, [offer, isNFL, isPHL, isNBA]);

  const offerValues = useMemo(() => {
    if (league !== SimNFL) return {};
    const y1value = offer.Y1Bonus * 1 + offer.Y1BaseSalary * 0.8;
    const y2value = offer.Y2Bonus * 0.9 + offer.Y2BaseSalary * 0.4;
    const y3value = offer.Y3Bonus * 0.8 + offer.Y3BaseSalary * 0.2;
    const y4value = offer.Y4Bonus * 0.7 + offer.Y4BaseSalary * 0.1;
    const y5value = offer.Y5Bonus * 0.6 + offer.Y5BaseSalary * 0.05;

    return {
      Y1Value: y1value,
      Y2Value: y2value,
      Y3Value: y3value,
      Y4Value: y4value,
      Y5Value: y5value,
    };
  }, [league, offer]);

  const contractValue = useMemo(() => {
    if (isPHL) {
      const {
        ContractLength,
        Y1BaseSalary,
        Y2BaseSalary,
        Y3BaseSalary,
        Y4BaseSalary,
        Y5BaseSalary,
      } = offer;
      if (!ContractLength || ContractLength === 0) return 0;
      let y1 = Y1BaseSalary ? Y1BaseSalary : 0;
      let y2 = Y2BaseSalary ? Y2BaseSalary : 0;
      let y3 = Y3BaseSalary ? Y3BaseSalary : 0;
      let y4 = Y4BaseSalary ? Y4BaseSalary : 0;
      let y5 = Y5BaseSalary ? Y5BaseSalary : 0;
      const total = y1 + y2 + y3 + y4 + y5;
      if (isNaN(total)) return 0;
      return total / ContractLength;
    }
    if (isNFL && player.Age) {
      return GetNFLContractValue(player.Age, offer as NFLFreeAgencyOffer);
    }
    return 0;
  }, [offer, player]);

  const aavValue = useMemo(() => {
    if (isNFL) {
      return GetNFLAAVValue(totalBonus + totalSalary, offer.ContractLength);
    }
    return 0;
  }, [isNFL, totalBonus, totalSalary, offer]);

  const playerAAV = useMemo(() => {
    if (league === SimNFL) {
      let nflPlayer = player as NFLPlayer;
      if (nflPlayer.ID > 0) {
        return nflPlayer.AAV.toFixed(2);
      }
    }
    return 0;
  }, [league, player]);

  const playerMinimumValue = useMemo(() => {
    if (league === SimNFL) {
      let nflPlayer = player as NFLPlayer;
      if (nflPlayer.ID && nflPlayer.ID > 0) {
        return nflPlayer.MinimumValue.toFixed(2);
      }
    }
    return 0;
  }, [league, player]);

  const errors = useMemo(() => {
    const list: string[] = [];
    if (league === SimPHL) {
      return GeneratePHLFAErrorList(
        offer as PHLFreeAgencyOffer,
        ts as HCKTimestamp,
        capsheet as ProCapsheet
      );
    }
    if (league === SimNFL) {
      return GenerateNFLFAErrorList(
        offer as NFLFreeAgencyOffer,
        ts as Timestamp,
        capsheet as NFLCapsheet,
        Number(playerAAV),
        aavValue
      );
    }
    return list;
  }, [offer, capsheet, ts]);

  const ChangeInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      const val = Number(value);
      setOffer((prev) => {
        if (prev instanceof NFLFreeAgencyOffer) {
          let updated = new NFLFreeAgencyOffer({ ...prev }); // Shallow clone with current values
          const match = name.match(/^Y([1-5])Bonus$/);

          if (match) {
            const editedYear = Number(match[1]);
            if (editedYear > updated.ContractLength) {
              updated = updated.updateField(name, val);
            }
            // otherwise overwrite **all** bonus fields 1…ContractLength
            for (let year = 1; year <= updated.ContractLength; year++) {
              updated = updated.updateField(`Y${year}Bonus`, val);
            }
            return updated;
          } else {
            updated = updated.updateField(name, val);
          }
          return updated;
        }
        if (prev instanceof NBAContractOffer) {
          return prev.updateField(name, val);
        }
        if (prev instanceof PHLFreeAgencyOffer) {
          return prev.updateField(name, val);
        }
        return prev;
      });
    },
    [league]
  );

  const Confirm = useCallback(async () => {
    if (league === SimPHL) {
      const { totalComp, ContractLength } = getPHLSalaryData(
        offer as PHLFreeAgencyOffer
      );
      if (totalComp === 0 && ContractLength === 0) {
        onClose();
        return;
      }
      const dto = new PHLFreeAgencyOfferDTO({
        ...offer,
        PlayerID: player.ID,
        TeamID: capsheet.ID,
      });
      await confirmOffer(dto);
    }
    if (league === SimNFL) {
      const { totalComp, ContractLength } = getNFLSalaryData(
        offer as NFLFreeAgencyOffer
      );
      if (totalComp === 0 && ContractLength === 0) {
        onClose();
        return;
      }

      const dto = new FreeAgencyOfferDTO({
        ...offer,
        NFLPlayerID: player.ID,
        TeamID: capsheet.ID,
        AAV: aavValue,
      });
      await confirmOffer(dto);
    }

    onClose();
  }, [offer, player, capsheet, league]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        actions={
          <>
            <ButtonGroup>
              <Button variant="danger" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant={errors.length === 0 ? "success" : "warning"}
                disabled={errors.length > 0}
                onClick={Confirm}
              >
                Confirm
              </Button>
            </ButtonGroup>
          </>
        }
        maxWidth="min-[1025px]:max-w-[60vw]"
      >
        <div className="grid grid-cols-[2fr__3fr] space-x-2 mb-2">
          <Border direction="col" classes="text-start p-3">
            <Text variant="h6">Rules</Text>
            <Text variant="xs">
              Contracts need to be between 1 through 5 years.
            </Text>
            {league === SimPHL && (
              <Text variant="xs">
                - AAV is calculated using the total of all inputs divided by the
                length of the contract.
              </Text>
            )}
            {isNFL && (
              <>
                <Text variant="xs">
                  - AAV is calculated using the total of all inputs divided by
                  the length of the contract.
                </Text>
                <Text variant="xs">
                  - Before the NFL Draft, at least 30% of any contract must be
                  bonus money.
                </Text>
                <Text variant="xs">
                  - After the draft, bonus can be any amount; however, once the
                  value is greater than $5M, 30% must be bonus money.
                </Text>
                <Text variant="xs">
                  - Salary cannot decrease (but can remain flat)
                </Text>
                <Text variant="xs">
                  - Highest year cannot be more than 100% of the lowest year (or
                  $6M)
                </Text>
                <Text variant="xs">
                  - An input for salary that isn't zero must be greater than 0.5
                </Text>
                <Text variant="xs">
                  - The minimum value for a player AND the player's AAV must be
                  met.
                </Text>
              </>
            )}
          </Border>
          <Border
            direction="col"
            classes="text-start p-3 flex-wrap overflow-y-auto"
          >
            <Text variant="h6">Errors</Text>
            {errors.length === 0 && <Text variant="small">None</Text>}
            {errors.length > 0 &&
              errors.map((err) => (
                <Text key={err} variant="small" classes="text-red-500">
                  {err}
                </Text>
              ))}
          </Border>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-6 space-y-1 lg:space-y-0 space-x-2 mb-2">
          <div className="flex">
            {(offer instanceof PHLFreeAgencyOffer ||
              offer instanceof NFLFreeAgencyOffer) && (
              <Input
                type="number"
                label="Length"
                name="ContractLength"
                value={offer.ContractLength || 0}
                max={5}
                onChange={ChangeInput}
              />
            )}
          </div>
          <div className="flex">
            {isNFL && (
              <Input
                type="number"
                label="Min. Value"
                name="MinimumValue"
                value={playerMinimumValue}
                disabled
              />
            )}
          </div>
          <div className="flex">
            {isNFL && (
              <Input
                type="number"
                label="Player AAV"
                name="AAV"
                value={playerAAV}
                disabled
              />
            )}
          </div>
          <div className="flex">
            {isNFL && (
              <Input
                type="number"
                label="Offer AAV"
                name="AAV"
                value={aavValue}
                disabled
              />
            )}
          </div>
          <div className="flex"></div>
          <div className="flex">
            {offer instanceof PHLFreeAgencyOffer && (
              <Input
                type="number"
                label="AAV"
                name="AAV"
                value={contractValue}
                disabled
              />
            )}
          </div>
        </div>
        {isNFL && (
          <div className="grid grid-cols-6 space-x-2 mb-4">
            <div className="flex">
              <Input
                type="number"
                label="Y1 Bonus"
                name="Y1Bonus"
                value={offer.Y1Bonus || 0}
                onChange={ChangeInput}
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y2 Bonus"
                name="Y2Bonus"
                value={offer.Y2Bonus || 0}
                onChange={ChangeInput}
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y3 Bonus"
                name="Y3Bonus"
                value={offer.Y3Bonus || 0}
                onChange={ChangeInput}
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y4 Bonus"
                name="Y4Bonus"
                value={offer.Y4Bonus || 0}
                onChange={ChangeInput}
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y5 Bonus"
                name="Y5Bonus"
                value={offer.Y5Bonus || 0}
                onChange={ChangeInput}
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Total Bonus"
                name="TotalBonus"
                value={totalBonus}
                disabled
              />
            </div>
          </div>
        )}
        {isNBA && (
          <div className="grid grid-cols-6 space-x-2 mb-2">
            <div className="flex flex-col">
              <Input
                type="number"
                label="Y1 Salary"
                name="Year1Total"
                value={offer.Year1Total || 0}
                onChange={ChangeInput}
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y2 Salary"
                name="Year2Total"
                value={offer.Year2Total || 0}
                onChange={ChangeInput}
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y3 Salary"
                name="Year3Total"
                value={offer.Year3Total || 0}
                onChange={ChangeInput}
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y4 Salary"
                name="Year4Total"
                value={offer.Year4Total || 0}
                onChange={ChangeInput}
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y5 Salary"
                name="Year5Total"
                value={offer.Year5Total || 0}
                onChange={ChangeInput}
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Total Salary"
                name="TotalSalary"
                value={totalSalary}
                disabled
              />
            </div>
          </div>
        )}
        {(isPHL || isNFL) && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 space-y-[0.5rem] md:space-y-2 lg:space-y-0 space-x-2 mb-4">
            <div className="flex">
              <Input
                type="number"
                label="Y1 Salary"
                name="Y1BaseSalary"
                value={offer.Y1BaseSalary || 0}
                onChange={ChangeInput}
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y2 Salary"
                name="Y2BaseSalary"
                value={offer.Y2BaseSalary || 0}
                onChange={ChangeInput}
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y3 Salary"
                name="Y3BaseSalary"
                value={offer.Y3BaseSalary || 0}
                onChange={ChangeInput}
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y4 Salary"
                name="Y4BaseSalary"
                value={offer.Y4BaseSalary || 0}
                onChange={ChangeInput}
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y5 Salary"
                name="Y5BaseSalary"
                value={offer.Y5BaseSalary || 0}
                onChange={ChangeInput}
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Total Salary"
                name="TotalSalary"
                value={totalSalary}
                disabled
              />
            </div>
          </div>
        )}
        {isNFL && (
          <div className="grid grid-cols-6 space-x-2 mb-4">
            <div className="flex">
              <Input
                type="number"
                label="Y1 Total"
                name="Y1Bonus"
                value={offer.Y1Bonus + offer.Y1BaseSalary || 0}
                disabled
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y2 Total"
                name="Y2Bonus"
                value={offer.Y2Bonus + offer.Y2BaseSalary || 0}
                disabled
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y3 Total"
                name="Y3Bonus"
                value={offer.Y3Bonus + offer.Y3BaseSalary || 0}
                disabled
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y4 Total"
                name="Y4Bonus"
                value={offer.Y4Bonus + offer.Y4BaseSalary || 0}
                disabled
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y5 Total"
                name="Y5Bonus"
                value={offer.Y5Bonus + offer.Y5BaseSalary || 0}
                disabled
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Total"
                name="Total"
                value={totalBonus + totalSalary}
                disabled
              />
            </div>
          </div>
        )}
        {/* Offer Value Row */}
        {isNFL && (
          <div className="grid grid-cols-6 space-x-2">
            <div className="flex">
              <Input
                type="number"
                label="Y1 Value"
                name="Y1Bonus"
                value={offerValues.Y1Value?.toFixed(2) || 0}
                disabled
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y2 Value"
                name="Y2Bonus"
                value={offerValues.Y2Value?.toFixed(2) || 0}
                disabled
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y3 Value"
                name="Y3Bonus"
                value={offerValues.Y3Value?.toFixed(2) || 0}
                disabled
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y4 Value"
                name="Y4Bonus"
                value={offerValues.Y4Value?.toFixed(2) || 0}
                disabled
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="Y5 Value"
                name="Y5Bonus"
                value={offerValues.Y5Value?.toFixed(2) || 0}
                disabled
              />
            </div>
            <div className="flex">
              <Input
                type="number"
                label="CV"
                name="Total"
                value={contractValue.toFixed(2)}
                disabled
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
