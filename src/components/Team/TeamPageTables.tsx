import { FC, useMemo } from "react";
import { Table, TableCell } from "../../_design/Table";
import { Text } from "../../_design/Typography";
import {
  CollegePlayer as CHLPlayer,
  ProfessionalPlayer as PHLPlayer,
  ProContract as PHLContract,
  CollegeGameplan,
  ProGameplan,
} from "../../models/hockeyModels";
import {
  CollegePlayer as CFBPlayer,
  NFLPlayer,
  NFLContract,
  NFLExtensionOffer,
} from "../../models/footballModels";
import { useResponsive } from "../../_hooks/useMobile";
import {
  Attributes,
  Potentials,
  Contracts,
  Overview,
  TextGreen,
  Affiliate,
  TradeBlock,
  PracticeSquad,
  Promises,
  Draft,
  PickUp,
  FranchiseTag,
} from "../../_constants/constants";
import {
  getCHLAttributes,
  getPHLAttributes,
  getCFBAttributes,
  getNFLAttributes,
  getCBBAttributes,
  getNBAAttributes,
  getTradeBlockAttributes,
} from "./TeamPageUtils";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { useModal } from "../../_hooks/useModal";
import {
  Cut,
  InfoType,
  ModalAction,
  Promise,
  Redshirt,
} from "../../_constants/constants";
import { SelectDropdown } from "../../_design/Select";
import {
  CheckCircle,
  CrossCircle,
  DashCircle,
  ShieldCheck,
  User,
} from "../../_design/Icons";
import { SimNFL } from "../../_constants/constants";
import {
  CollegePlayer as CBBPlayer,
  CollegePromise as BasketballPromise,
  NBAContract,
  NBAPlayer,
} from "../../models/basketballModels";
import { TradeBlockRow } from "./TeamPageTypes";
import { SingleValue } from "react-select";
import { SelectOption } from "../../_hooks/useSelectStyles";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import {
  getGeneralLetterGrade,
  getHockeyLetterGrade,
} from "../../_utility/getLetterGrade";
import { useSimFBAStore } from "../../context/SimFBAContext";
import {
  defensiveSystemsInformationList,
  offensiveSystemsInformationList,
} from "../Gameplan/HockeyLineups/useLineupUtils";
import { DraftPick } from "../Draft/common";

interface CHLRosterTableProps {
  roster: CHLPlayer[];
  backgroundColor?: string;
  headerColor?: string;
  borderColor?: string;
  team?: any;
  category?: string;
  openModal: (action: ModalAction, player: CHLPlayer) => void;
  openPromiseModal: (player: CHLPlayer) => void;
  disable: boolean;
  gameplan: CollegeGameplan;
  redshirtCount: number;
}

export const CHLRosterTable: FC<CHLRosterTableProps> = ({
  roster,
  backgroundColor,
  headerColor,
  borderColor,
  team,
  category,
  openModal,
  openPromiseModal,
  disable,
  gameplan,
  redshirtCount,
}) => {
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const { isDesktop, isTablet } = useResponsive();
  const {
    hck_Timestamp,
    collegePromiseMap,
    phlTeamMap,
    individualDraftPickMap,
  } = useSimHCKStore();

  let rosterColumns = useMemo(() => {
    let columns = [
      { header: "ID", accessor: "ID" },
      { header: "Name", accessor: "LastName" },
      {
        header: !isDesktop && !isTablet ? "Pos" : "Position",
        accessor: "Position",
      },
      {
        header: !isDesktop && !isTablet ? "Arch" : "Archetype",
        accessor: "Archetype",
      },
      {
        header: !isDesktop && !isTablet ? "Yr" : "Year",
        accessor: "Year",
      },
      { header: "⭐", accessor: "Stars" },
      {
        header: !isDesktop && !isTablet ? "Ovr" : "Overall",
        accessor: "Overall",
      },
    ];

    if (isDesktop && category === Overview) {
      columns = columns.concat([
        { header: "Health", accessor: "isInjured" },
        { header: "Injury", accessor: "InjuryType" },
        { header: "Competitiveness", accessor: "Competitiveness" },
        { header: "Academics", accessor: "AcademicsPref" },
        { header: "Loyalty", accessor: "TeamLoyalty" },
        { header: "Morale", accessor: "PlayerMorale" },
        { header: "Redshirt", accessor: "isRedshirting" },
        { header: "Mood", accessor: "TransferStatus" },
        { header: "Offensive Fit", accessor: "OffensiveFit" },
        { header: "Defensive Fit", accessor: "DefensiveFit" },
      ]);
    }

    if (
      (isDesktop || isTablet) &&
      (category === Attributes || category === Potentials)
    ) {
      columns = columns.concat([
        { header: "Agi", accessor: "Agility" },
        { header: "FO", accessor: "Faceoffs" },
        { header: "LSA", accessor: "LongShotAccuracy" },
        { header: "LSP", accessor: "LongShotPower" },
        { header: "CSA", accessor: "CloseShotAccuracy" },
        { header: "CSP", accessor: "CloseShotPower" },
        { header: "Pass", accessor: "Passing" },
        { header: "PH", accessor: "PuckHandling" },
        { header: "Str", accessor: "Strength" },
        { header: "BChk", accessor: "BodyChecking" },
        { header: "SChk", accessor: "StickChecking" },
        { header: "SB", accessor: "ShotBlocking" },
        { header: "GK", accessor: "Goalkeeping" },
        { header: "GV", accessor: "GoalieVision" },
        { header: "Sta", accessor: "Stamina" },
        { header: "Inj", accessor: "Injury" },
        { header: "Off. Fit", accessor: "OffensiveFit" },
        { header: "Def. Fit", accessor: "DefensiveFit" },
      ]);
    }
    if ((isDesktop || isTablet) && category === Promises) {
      columns = columns.concat([
        { header: "Promise Type", accessor: "PromiseType" },
        { header: "Promise Weight", accessor: "PromiseWeight" },
        { header: "Benchmark", accessor: "Benchmark" },
        { header: "Benchmark 2", accessor: "BenchmarkStr" },
        { header: "Committed", accessor: "PromiseMade" },
        { header: "Active", accessor: "IsActive" },
      ]);
    }
    if ((isDesktop || isTablet) && category === Draft) {
      columns = columns.concat([
        { header: "Drafted Team", accessor: "DraftedTeamID" },
        { header: "Season", accessor: "SeasonID" },
        { header: "Round", accessor: "DraftRound" },
        { header: "Pick", accessor: "DraftPick" },
        { header: "Eligible for Pickup", accessor: "Eligible" },
      ]);
    }
    columns.push({ header: "Actions", accessor: "actions" });
    return columns;
  }, [isDesktop, category]);

  const sortedRoster = useMemo(() => {
    return [...roster].sort((a, b) => b.Overall - a.Overall);
  }, [roster]);

  const offensiveSystemsInformation = useMemo(() => {
    return offensiveSystemsInformationList[
      gameplan!.OffensiveSystem as keyof typeof offensiveSystemsInformationList
    ];
  }, [gameplan]);

  const defensiveSystemsInformation = useMemo(() => {
    return defensiveSystemsInformationList[
      gameplan!.DefensiveSystem as keyof typeof defensiveSystemsInformationList
    ];
  }, [gameplan]);

  const rowRenderer = (
    item: CHLPlayer,
    index: number,
    backgroundColor: string,
  ) => {
    const attributes = getCHLAttributes(item, !isDesktop, isTablet, category!);
    const collegePromise = collegePromiseMap[item.ID];
    const hasPromise = collegePromise !== undefined && collegePromise.ID > 0;

    const isGoodOffensiveFit = (() => {
      if (!item || !offensiveSystemsInformation) return false;
      const goodFits = offensiveSystemsInformation.GoodFits;
      const idx = goodFits.findIndex(
        (x: any) => x.archetype === item.Archetype,
      );
      if (idx > -1) {
        return true;
      }
      return false;
    })();

    const isBadOffensiveFit = (() => {
      if (!item || !offensiveSystemsInformation) return false;
      const badFits = offensiveSystemsInformation.BadFits;
      const idx = badFits.findIndex((x: any) => x.archetype === item.Archetype);
      if (idx > -1) {
        return true;
      }
      return false;
    })();

    const isGoodDefensiveFit = (() => {
      if (!item || !defensiveSystemsInformation) return false;
      const goodFits = defensiveSystemsInformation.GoodFits;
      const idx = goodFits.findIndex(
        (x: any) => x.archetype === item.Archetype,
      );
      if (idx > -1) {
        return true;
      }
      return false;
    })();

    const isBadDefensiveFit = (() => {
      if (!item || !defensiveSystemsInformation) return false;
      const badFits = defensiveSystemsInformation.BadFits;
      const idx = badFits.findIndex((x: any) => x.archetype === item.Archetype);
      if (idx > -1) {
        return true;
      }
      return false;
    })();

    const draftPickInfo = (() => {
      if (!individualDraftPickMap[item.DraftPickID]) {
        return null;
      }
      return individualDraftPickMap[item.DraftPickID];
    })();

    const draftedTeam = (() => {
      if (!phlTeamMap[item.DraftedTeamID]) {
        return null;
      }
      return phlTeamMap[item.DraftedTeamID];
    })();

    const isEligibleToPickUp = (() => {
      if (!draftPickInfo) return false;
      if (!hck_Timestamp) return false;
      return draftPickInfo.SeasonID < hck_Timestamp.SeasonID;
    })();

    return (
      <div
        key={item.ID}
        className={`table-row border-b dark:border-gray-700 text-left`}
        style={{ backgroundColor }}
      >
        {attributes.map((attr, idx) => (
          <div
            key={idx}
            className={`table-cell 
        align-middle 
        min-[360px]:max-w-[6em] min-[380px]:max-w-[8em] min-[430px]:max-w-[10em] 
        text-wrap sm:max-w-full px-1 sm:px-1.5 py-1 sm:whitespace-nowrap ${
          category === Overview && idx === 7
            ? "text-left"
            : idx !== 0
              ? "text-center"
              : ""
        }`}
          >
            {attr.label === "Redshirt" ? (
              <>
                {attr.value === true ? (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                ) : (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
              </>
            ) : attr.label === "Health" ? (
              <>
                {attr.value === true ? (
                  <User textColorClass="w-full text-center text-red-500" />
                ) : (
                  <User textColorClass={`w-full text-center ${TextGreen}`} />
                )}
              </>
            ) : attr.label === "TransferStatus" ? (
              <>
                {attr.value === 0 ? (
                  <ShieldCheck
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                ) : (
                  <ShieldCheck textColorClass="w-full text-center text-red-500" />
                )}
              </>
            ) : attr.label === "Name" ? (
              <span
                className={`cursor-pointer font-semibold text-start`}
                onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
                  (e.target as HTMLElement).style.color = "#fcd53f";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
                  (e.target as HTMLElement).style.color = "";
                }}
                onClick={() => openModal(InfoType, item)}
              >
                <Text variant="small">{attr.value}</Text>
              </span>
            ) : (
              <Text variant="small" classes="text-start">
                {attr.value}
              </Text>
            )}
          </div>
        ))}
        {category === Overview && isDesktop && (
          <>
            <TableCell>
              <Text variant="small" classes="text-start">
                {isGoodOffensiveFit && (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                )}
                {isBadOffensiveFit && (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
                {!isGoodOffensiveFit && !isBadOffensiveFit && (
                  <DashCircle textColorClass="w-full text-center text-gray-500" />
                )}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {isGoodDefensiveFit && (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                )}
                {isBadDefensiveFit && (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
                {!isGoodDefensiveFit && !isBadDefensiveFit && (
                  <DashCircle textColorClass="w-full text-center text-gray-500" />
                )}
              </Text>
            </TableCell>
          </>
        )}
        {category === Attributes && isDesktop && (
          <>
            <TableCell>
              <Text variant="small" classes="text-start">
                {getGeneralLetterGrade(item.Stamina)}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {getGeneralLetterGrade(item.InjuryRating)}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {isGoodOffensiveFit && (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                )}
                {isBadOffensiveFit && (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
                {!isGoodOffensiveFit && !isBadOffensiveFit && (
                  <DashCircle textColorClass="w-full text-center text-gray-500" />
                )}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {isGoodDefensiveFit && (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                )}
                {isBadDefensiveFit && (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
                {!isGoodDefensiveFit && !isBadDefensiveFit && (
                  <DashCircle textColorClass="w-full text-center text-gray-500" />
                )}
              </Text>
            </TableCell>
          </>
        )}
        {category === Potentials && isDesktop && (
          <>
            <TableCell>
              <Text variant="small" classes="text-start">
                {isGoodOffensiveFit && (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                )}
                {isBadOffensiveFit && (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
                {!isGoodOffensiveFit && !isBadOffensiveFit && (
                  <DashCircle textColorClass="w-full text-center text-gray-500" />
                )}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {isGoodDefensiveFit && (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                )}
                {isBadDefensiveFit && (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
                {!isGoodDefensiveFit && !isBadDefensiveFit && (
                  <DashCircle textColorClass="w-full text-center text-gray-500" />
                )}
              </Text>
            </TableCell>
          </>
        )}
        {category == Promises && isDesktop && (
          <>
            <TableCell>
              <Text variant="small" classes="text-start">
                {hasPromise ? collegePromise.PromiseType : "No Promise"}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {hasPromise ? collegePromise.PromiseWeight : "N/A"}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {hasPromise ? collegePromise.Benchmark : "N/A"}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {hasPromise ? collegePromise.BenchmarkStr : "N/A"}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {hasPromise && collegePromise.PromiseMade ? "Yes" : "No"}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {hasPromise && collegePromise.IsActive ? "Yes" : "No"}
              </Text>
            </TableCell>
          </>
        )}
        {category == Draft && isDesktop && (
          <>
            <TableCell>
              <Text variant="small" classes="text-start">
                {item.DraftPickID > 0 && draftedTeam
                  ? draftedTeam.TeamName + " " + draftedTeam.Mascot
                  : "N/A"}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {item.DraftPickID > 0 && draftPickInfo
                  ? draftPickInfo.Season
                  : "N/A"}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {item.DraftPickID > 0 && draftPickInfo
                  ? draftPickInfo.DraftRound
                  : "N/A"}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {item.DraftPickID > 0 && draftPickInfo
                  ? draftPickInfo.DraftNumber
                  : "N/A"}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {isEligibleToPickUp && (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                )}
                {!isEligibleToPickUp && (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
              </Text>
            </TableCell>
          </>
        )}

        <div className="table-cell align-middle w-[5em] min-[430px]:w-[6em] sm:w-full flex-wrap sm:flex-nowrap sm:px-2 pb-1 sm:py-1 whitespace-nowrap">
          <SelectDropdown
            placeholder={!isDesktop ? "Action" : "Select an action"}
            options={[
              {
                value: "cut",
                label: `Cut - ${item.FirstName} ${item.LastName}`,
              },
              ...(item.IsRedshirting || item.IsRedshirt || redshirtCount!! > 6
                ? []
                : [
                    {
                      value: "redshirt",
                      label: `Redshirt - ${item.FirstName} ${item.LastName}`,
                    },
                  ]),
              ...(item.TransferStatus === 0
                ? []
                : [
                    {
                      value: "promise",
                      label: `Send Promise - ${item.FirstName} ${item.LastName}`,
                    },
                  ]),
            ]}
            onChange={(selectedOption) => {
              if (selectedOption?.value === "cut") {
                openModal(Cut, item);
              }
              if (
                selectedOption?.value === "redshirt" &&
                hck_Timestamp!.Week < 2
              ) {
                openModal(Redshirt, item);
              }
              if (selectedOption?.value === "promise") {
                openPromiseModal(item);
              } else {
                console.log(`Action selected: ${selectedOption?.value}`);
              }
            }}
            isDisabled={disable}
          />
        </div>
      </div>
    );
  };

  return (
    <Table
      columns={rosterColumns}
      data={sortedRoster}
      rowRenderer={rowRenderer}
      backgroundColor={backgroundColor}
      team={team}
    />
  );
};

interface PHLRosterTableProps {
  roster: PHLPlayer[] | undefined;
  contracts?: PHLContract[] | null;
  ts: any;
  backgroundColor?: string;
  headerColor?: string;
  borderColor?: string;
  team?: any;
  category?: string;
  openModal: (action: ModalAction, player: PHLPlayer | CHLPlayer) => void;
  openExtensionModal: (player: PHLPlayer) => void;
  disable: boolean;
  gameplan: ProGameplan;
}

export const PHLRosterTable: FC<PHLRosterTableProps> = ({
  roster = [],
  contracts,
  ts,
  backgroundColor,
  headerColor,
  borderColor,
  team,
  category,
  openModal,
  openExtensionModal,
  disable,
  gameplan,
}) => {
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const { isDesktop, isTablet } = useResponsive();
  const {
    chlPlayerMap,
    phlDraftPicks,
    phlTeamMap,
    hck_Timestamp,
    proPlayerMap,
  } = useSimHCKStore();

  const rosterColumns = useMemo(() => {
    let columns = [
      { header: "ID", accessor: "ID" },
      { header: "Name", accessor: "LastName" },
      {
        header: !isDesktop && !isTablet ? "Pos" : "Pos",
        accessor: "Position",
      },
      {
        header: !isDesktop && !isTablet ? "Arch" : "Arch",
        accessor: "Archetype",
      },
      {
        header: !isDesktop && !isTablet ? "Exp" : "Exp",
        accessor: "Year",
      },
      {
        header: !isDesktop && !isTablet ? "Ovr" : "Ovr",
        accessor: "Overall",
      },
    ];

    if (isDesktop && category === Overview) {
      columns = columns.concat([
        { header: "Health", accessor: "isInjured" },
        { header: "Injury", accessor: "InjuryType" },
        { header: `${ts.Season} $`, accessor: "Y1BaseSalary" },
        { header: "Yrs Left", accessor: "ContractLength" },
        { header: "NTC", accessor: "NoTradeClause" },
        { header: "NMC", accessor: "NoMovementClause" },
        { header: "Trade Block", accessor: "IsOnTradeBlock" },
        { header: "Affiliate", accessor: "IsAffiliatePlayer" },
        { header: "Competitiveness", accessor: "Competitiveness" },
        { header: "Finance", accessor: "FinancialPref" },
        { header: "Market", accessor: "MarketPref" },
        { header: "Loyalty", accessor: "TeamLoyalty" },
        { header: "Morale", accessor: "PlayerMorale" },
      ]);
    }

    if ((isDesktop && category === Attributes) || category === Potentials) {
      columns = columns.concat([
        { header: "Agi", accessor: "Agility" },
        { header: "FO", accessor: "Faceoffs" },
        { header: "LSA", accessor: "LongShotAccuracy" },
        { header: "LSP", accessor: "LongShotPower" },
        { header: "CSA", accessor: "CloseShotAccuracy" },
        { header: "CSP", accessor: "CloseShotPower" },
        { header: "Pass", accessor: "Passing" },
        { header: "PH", accessor: "PuckHandling" },
        { header: "Str", accessor: "Strength" },
        { header: "BChk", accessor: "BodyChecking" },
        { header: "SChk", accessor: "StickChecking" },
        { header: "SB", accessor: "ShotBlocking" },
        { header: "GK", accessor: "Goalkeeping" },
        { header: "GV", accessor: "GoalieVision" },
        { header: "Sta", accessor: "Stamina" },
        { header: "Inj", accessor: "Injury" },
        { header: "Offensive Fit", accessor: "OffensiveFit" },
        { header: "Defensive Fit", accessor: "DefensiveFit" },
      ]);
    }

    if (isDesktop && category === Contracts) {
      columns = columns.concat([
        { header: "Offensive Fit", accessor: "OffensiveFit" },
        { header: "Defensive Fit", accessor: "DefensiveFit" },
        { header: "Y1 S", accessor: "Y1BaseSalary" },
        { header: "Y2 S", accessor: "Y2BaseSalary" },
        { header: "Y3 S", accessor: "Y3BaseSalary" },
        { header: "Y4 S", accessor: "Y4BaseSalary" },
        { header: "Y5 S", accessor: "Y5BaseSalary" },
        { header: "Yrs", accessor: "ContractLength" },
        { header: "NTC", accessor: "NoTradeClause" },
        { header: "NMC", accessor: "NoMovementClause" },
      ]);
    }
    if ((isDesktop || isTablet) && category === Draft) {
      columns = [
        { header: "Season", accessor: "SeasonID" },
        { header: "Round", accessor: "DraftRound" },
        { header: "Pick", accessor: "DraftPick" },
        { header: "Player", accessor: "PlayerName" },
        { header: "Prev. Team", accessor: "PreviousTeamID" },
        { header: "Orig. Team", accessor: "OriginalTeamID" },
        { header: "Offensive Fit", accessor: "OffensiveFit" },
        { header: "Defensive Fit", accessor: "DefensiveFit" },
        { header: "Eligible for Pickup", accessor: "Eligible" },
      ];
    }

    columns.push({ header: "Actions", accessor: "actions" });
    return columns;
  }, [isDesktop, category]);

  const sortedRoster = useMemo(() => {
    return [...roster].sort((a, b) => b.Overall - a.Overall);
  }, [roster]);

  const offensiveSystemsInformation = useMemo(() => {
    return offensiveSystemsInformationList[
      gameplan!.OffensiveSystem as keyof typeof offensiveSystemsInformationList
    ];
  }, [gameplan]);

  const defensiveSystemsInformation = useMemo(() => {
    return defensiveSystemsInformationList[
      gameplan!.DefensiveSystem as keyof typeof defensiveSystemsInformationList
    ];
  }, [gameplan]);

  const draftPicks = useMemo(() => {
    if (!team) return [];
    if (!phlDraftPicks) return [];
    return phlDraftPicks[team.ID] || [];
  }, [phlDraftPicks, team]);

  if (category === Draft) {
    // need to create a new rowRenderer

    const draftPickRowRenderer = (
      item: DraftPick,
      index: number,
      backgroundColor: string,
    ) => {
      const previousTeam = (() => {
        if (!phlTeamMap) return "None";
        if (item.PreviousTeamID === 0) return "None";
        const team = phlTeamMap[item.PreviousTeamID];
        return `${team.TeamName} ${team.Mascot}` || "None";
      })();

      const originalTeam = (() => {
        if (!phlTeamMap) return "None";
        if (item.OriginalTeamID === 0) return "None";
        const team = phlTeamMap[item.OriginalTeamID];
        return `${team.TeamName} ${team.Mascot}` || "None";
      })();

      const isCollegePlayer = (() => {
        if (!chlPlayerMap) return false;
        const collegePlayer = chlPlayerMap[item.DrafteeID];
        if (collegePlayer && collegePlayer.ID > 0) {
          return true;
        }
        return false;
      })();

      const draftedPlayer = (() => {
        if (!chlPlayerMap) return null;
        const collegePlayer = chlPlayerMap[item.DrafteeID];
        if (collegePlayer && collegePlayer.ID > 0) {
          return collegePlayer;
        }
        if (!proPlayerMap) return null;
        const proPlayer = proPlayerMap[item.DrafteeID];
        if (proPlayer && proPlayer.ID > 0) {
          return proPlayer;
        }
        return null;
      })();

      const draftedPlayerLabel = (() => {
        if (!draftedPlayer) return "No Player";
        return `${draftedPlayer.ID} ${draftedPlayer.Position} ${draftedPlayer.Archetype} ${draftedPlayer.FirstName} ${draftedPlayer.LastName}`;
      })();

      const isGoodOffensiveFit = (() => {
        if (!draftedPlayer || !offensiveSystemsInformation) return false;
        const goodFits = offensiveSystemsInformation.GoodFits;
        const idx = goodFits.findIndex(
          (x: any) => x.archetype === draftedPlayer.Archetype,
        );
        if (idx > -1) {
          return true;
        }
        return false;
      })();

      const isBadOffensiveFit = (() => {
        if (!draftedPlayer || !offensiveSystemsInformation) return false;
        const badFits = offensiveSystemsInformation.BadFits;
        const idx = badFits.findIndex(
          (x: any) => x.archetype === draftedPlayer.Archetype,
        );
        if (idx > -1) {
          return true;
        }
        return false;
      })();

      const isGoodDefensiveFit = (() => {
        if (!draftedPlayer || !defensiveSystemsInformation) return false;
        const goodFits = defensiveSystemsInformation.GoodFits;
        const idx = goodFits.findIndex(
          (x: any) => x.archetype === draftedPlayer.Archetype,
        );
        if (idx > -1) {
          return true;
        }
        return false;
      })();

      const isBadDefensiveFit = (() => {
        if (!draftedPlayer || !defensiveSystemsInformation) return false;
        const badFits = defensiveSystemsInformation.BadFits;
        const idx = badFits.findIndex(
          (x: any) => x.archetype === draftedPlayer.Archetype,
        );
        if (idx > -1) {
          return true;
        }
        return false;
      })();

      const isEligibleToPickUp = (() => {
        if (!hck_Timestamp) return false;
        return item.SeasonID < hck_Timestamp.SeasonID;
      })();
      return (
        <>
          <div
            key={item.ID}
            className={`table-row border-b dark:border-gray-700 text-left`}
            style={{ backgroundColor }}
          >
            <TableCell>
              <Text variant="small" classes="text-start">
                {item.Season}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {item.DraftRound}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {item.DraftNumber}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {draftedPlayerLabel}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {previousTeam}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {originalTeam}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {isGoodOffensiveFit && (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                )}
                {isBadOffensiveFit && (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
                {!isGoodOffensiveFit && !isBadOffensiveFit && (
                  <DashCircle textColorClass="w-full text-center text-gray-500" />
                )}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {isGoodDefensiveFit && (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                )}
                {isBadDefensiveFit && (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
                {!isGoodDefensiveFit && !isBadDefensiveFit && (
                  <DashCircle textColorClass="w-full text-center text-gray-500" />
                )}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {isEligibleToPickUp && (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                )}
                {!isEligibleToPickUp && (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
              </Text>
            </TableCell>
            <div
              className={`table-cell align-middle w-[5em] min-[430px]:w-[6em] sm:w-full flex-wrap sm:flex-nowrap sm:px-2 pb-1 sm:py-1 whitespace-nowrap`}
            >
              <SelectDropdown
                placeholder={!isDesktop ? "Action" : "Select an action"}
                options={[
                  {
                    value: "pickUp",
                    label: `Pick Up - ${draftedPlayer?.FirstName} ${draftedPlayer?.LastName}`,
                  },
                ]}
                onChange={(selectedOption: SingleValue<SelectOption>) => {
                  if (selectedOption?.value === "pickUp") {
                    openModal(PickUp, draftedPlayer!!);
                  } else {
                    console.log(`Action selected: ${selectedOption?.value}`);
                  }
                }}
                isDisabled={disable || !isCollegePlayer || !isEligibleToPickUp}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                    color: "#ffffff",
                    width: "15rem",
                    maxWidth: "300px",
                    padding: "0.3rem",
                    boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    borderRadius: "8px",
                  }),
                  menuList: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    padding: "0",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    color: "#ffffff",
                    padding: "10px",
                    cursor: "pointer",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                }}
              />
            </div>
          </div>
        </>
      );
    };

    return (
      <Table
        columns={rosterColumns}
        data={draftPicks}
        rowRenderer={draftPickRowRenderer}
        backgroundColor={backgroundColor}
        team={team}
      />
    );
  }

  const playerRowRenderer = (
    item: PHLPlayer,
    index: number,
    backgroundColor: string,
  ) => {
    const playerContract = contracts?.find(
      (contract) => contract.PlayerID === item.ID,
    );
    item.Contract = playerContract!!;
    const attributes = getPHLAttributes(
      item,
      !isDesktop,
      isTablet,
      category!,
      playerContract,
    );

    const isGoodOffensiveFit = (() => {
      if (!item || !offensiveSystemsInformation) return false;
      const goodFits = offensiveSystemsInformation.GoodFits;
      const idx = goodFits.findIndex(
        (x: any) => x.archetype === item.Archetype,
      );
      if (idx > -1) {
        return true;
      }
      return false;
    })();

    const isBadOffensiveFit = (() => {
      if (!item || !offensiveSystemsInformation) return false;
      const badFits = offensiveSystemsInformation.BadFits;
      const idx = badFits.findIndex((x: any) => x.archetype === item.Archetype);
      if (idx > -1) {
        return true;
      }
      return false;
    })();

    const isGoodDefensiveFit = (() => {
      if (!item || !defensiveSystemsInformation) return false;
      const goodFits = defensiveSystemsInformation.GoodFits;
      const idx = goodFits.findIndex(
        (x: any) => x.archetype === item.Archetype,
      );
      if (idx > -1) {
        return true;
      }
      return false;
    })();

    const isBadDefensiveFit = (() => {
      if (!item || !defensiveSystemsInformation) return false;
      const badFits = defensiveSystemsInformation.BadFits;
      const idx = badFits.findIndex((x: any) => x.archetype === item.Archetype);
      if (idx > -1) {
        return true;
      }
      return false;
    })();

    return (
      <div
        key={item.ID}
        className={`table-row border-b dark:border-gray-700 text-left`}
        style={{ backgroundColor }}
      >
        {attributes.map((attr, idx) => (
          <div
            key={idx}
            className={`table-cell 
        align-middle 
        min-[360px]:max-w-[6em] min-[380px]:max-w-[8em] min-[430px]:max-w-[10em] 
        text-wrap sm:max-w-full px-1 sm:px-1.5 py-1 sm:whitespace-nowrap ${
          category === Overview && idx === 6
            ? "text-left"
            : idx !== 0
              ? "text-center"
              : ""
        }`}
          >
            {attr.label === "NTC" || attr.label === "NMC" ? (
              <>
                {attr.value === true ? (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                ) : (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
              </>
            ) : attr.label === "Health" ? (
              <>
                {attr.value === true ? (
                  <User textColorClass="w-full text-center text-red-500" />
                ) : (
                  <User textColorClass={`w-full text-center ${TextGreen}`} />
                )}
              </>
            ) : attr.label === "TradeBlock" || attr.label === "Affiliate" ? (
              <>
                {attr.value === "Yes" ? (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                ) : (
                  <CrossCircle
                    textColorClass={`w-full text-center text-red-500`}
                  />
                )}
              </>
            ) : attr.label === "Name" ? (
              <span
                className={`cursor-pointer font-semibold text-start`}
                onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
                  (e.target as HTMLElement).style.color = "#fcd53f";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
                  (e.target as HTMLElement).style.color = "";
                }}
                onClick={() => openModal(InfoType, item)}
              >
                <Text variant="xs">{attr.value}</Text>
              </span>
            ) : (
              <Text variant="xs" classes="text-start">
                {attr.value}
              </Text>
            )}
          </div>
        ))}

        {category === Attributes && isDesktop && (
          <>
            <TableCell>
              <Text variant="xs" classes="text-start">
                {item.Stamina}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="xs" classes="text-start">
                {item.InjuryRating}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {isGoodOffensiveFit && (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                )}
                {isBadOffensiveFit && (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
                {!isGoodOffensiveFit && !isBadOffensiveFit && (
                  <DashCircle textColorClass="w-full text-center text-gray-500" />
                )}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {isGoodDefensiveFit && (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                )}
                {isBadDefensiveFit && (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
                {!isGoodDefensiveFit && !isBadDefensiveFit && (
                  <DashCircle textColorClass="w-full text-center text-gray-500" />
                )}
              </Text>
            </TableCell>
          </>
        )}
        {category === Potentials && isDesktop && (
          <>
            <TableCell>
              <Text variant="small" classes="text-start">
                {isGoodOffensiveFit && (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                )}
                {isBadOffensiveFit && (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
                {!isGoodOffensiveFit && !isBadOffensiveFit && (
                  <DashCircle textColorClass="w-full text-center text-gray-500" />
                )}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small" classes="text-start">
                {isGoodDefensiveFit && (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                )}
                {isBadDefensiveFit && (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
                {!isGoodDefensiveFit && !isBadDefensiveFit && (
                  <DashCircle textColorClass="w-full text-center text-gray-500" />
                )}
              </Text>
            </TableCell>
          </>
        )}
        <div
          className={`table-cell align-middle w-[5em] min-[430px]:w-[6em] sm:w-full flex-wrap sm:flex-nowrap sm:px-2 pb-1 sm:py-1 whitespace-nowrap`}
        >
          <SelectDropdown
            placeholder={!isDesktop ? "Action" : "Select an action"}
            options={[
              {
                value: "cut",
                label: `Cut - ${item.FirstName} ${item.LastName}`,
              },
              {
                value: "extension",
                label: `Offer Extension - ${item.FirstName} ${item.LastName}`,
              },
              {
                value: "franchise",
                label: `Franchise Tag - ${item.FirstName} ${item.LastName}`,
              },
              {
                value: "injuredReserve",
                label: `Send to Injured Reserve - ${item.FirstName} ${item.LastName}`,
              },
              {
                value: "affiliate",
                label: `${
                  item.IsAffiliatePlayer ? `Return From` : `Send To`
                } Affiliate Team - ${item.FirstName} ${item.LastName}`,
              },
              {
                value: "tradeBlock",
                label: `${
                  item.IsOnTradeBlock ? "Take Off" : "Place On"
                } Trade Block - ${item.FirstName} ${item.LastName}`,
              },
            ]}
            onChange={(selectedOption: SingleValue<SelectOption>) => {
              if (selectedOption?.value === "cut") {
                openModal(Cut, item);
              } else if (selectedOption?.value === "affiliate") {
                openModal(Affiliate, item);
              } else if (selectedOption?.value === "tradeBlock") {
                openModal(TradeBlock, item);
              } else if (
                selectedOption?.value === "extension" &&
                playerContract!.ContractLength <= 1
              ) {
                openExtensionModal(item);
              } else {
                console.log(`Action selected: ${selectedOption?.value}`);
              }
            }}
            isDisabled={disable}
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                color: "#ffffff",
                width: "15rem",
                maxWidth: "300px",
                padding: "0.3rem",
                boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                borderRadius: "8px",
                transition: "all 0.2s ease",
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: "#1a202c",
                borderRadius: "8px",
              }),
              menuList: (provided) => ({
                ...provided,
                backgroundColor: "#1a202c",
                padding: "0",
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                color: "#ffffff",
                padding: "10px",
                cursor: "pointer",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "#ffffff",
              }),
              placeholder: (provided) => ({
                ...provided,
                color: "#ffffff",
              }),
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <Table
      columns={rosterColumns}
      data={sortedRoster}
      rowRenderer={playerRowRenderer}
      backgroundColor={backgroundColor}
      team={team}
    />
  );
};

interface CFBRosterTableProps {
  roster: CFBPlayer[];
  backgroundColor?: string;
  headerColor?: string;
  borderColor?: string;
  team?: any;
  category?: string;
  openModal: (action: ModalAction, player: CFBPlayer) => void;
  openPromiseModal: (player: CFBPlayer) => void;
  disable: boolean;
  redshirtCount?: number;
}

export const CFBRosterTable: FC<CFBRosterTableProps> = ({
  roster,
  backgroundColor,
  headerColor,
  borderColor,
  redshirtCount,
  team,
  category,
  openModal,
  openPromiseModal,
  disable,
}) => {
  const store = useSimFBAStore();
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const { isDesktop } = useResponsive();

  let rosterColumns = useMemo(() => {
    let columns = [
      { header: "ID", accessor: "ID" },
      { header: "Name", accessor: "LastName" },
      { header: !isDesktop ? "Pos" : "Position", accessor: "Position" },
      { header: !isDesktop ? "Arch" : "Archetype", accessor: "Archetype" },
      { header: !isDesktop ? "Yr" : "Year", accessor: "Experience" },
      { header: "⭐", accessor: "Stars" },
      { header: !isDesktop ? "Ovr" : "Overall", accessor: "Overall" },
    ];

    if (isDesktop && category === Overview) {
      columns = columns.concat([
        {
          header: !isDesktop ? "Pot" : "Potential",
          accessor: "PotentialGrade",
        },
        { header: "Health", accessor: "isInjured" },
        { header: "Injury", accessor: "InjuryType" },
        { header: "Personality", accessor: "Personality" },
        { header: "Work Ethic", accessor: "WorkEthic" },
        { header: "Academics", accessor: "AcademicBias" },
        { header: "Redshirt", accessor: "isRedshirting" },
        { header: "Mood", accessor: "TransferStatus" },
      ]);
    }

    if (isDesktop && category === Attributes) {
      columns = columns.concat([
        { header: "Pot", accessor: "PotentialGrade" },
        { header: "FIQ", accessor: "FootballIQ" },
        { header: "SPD", accessor: "Speed" },
        { header: "AGI", accessor: "Agility" },
        { header: "CAR", accessor: "Carrying" },
        { header: "CTH", accessor: "Catching" },
        { header: "RTE", accessor: "RouteRunning" },
        { header: "THP", accessor: "ThrowPower" },
        { header: "THA", accessor: "ThrowAccuracy" },
        { header: "PBK", accessor: "PassBlock" },
        { header: "RBK", accessor: "RunBlock" },
        { header: "STR", accessor: "Strength" },
        { header: "TKL", accessor: "Tackle" },
        { header: "ZCV", accessor: "ZoneCoverage" },
        { header: "MCV", accessor: "ManCoverage" },
        { header: "RSH", accessor: "PassRush" },
        { header: "RDF", accessor: "RunDefense" },
        { header: "KP", accessor: "KickPower" },
        { header: "KA", accessor: "KickAccuracy" },
        { header: "PP", accessor: "PuntPower" },
        { header: "PA", accessor: "PuntAccuracy" },
        { header: "STA", accessor: "Stamina" },
        { header: "INJ", accessor: "Injury" },
      ]);
    }
    columns.push({ header: "Actions", accessor: "actions" });
    return columns;
  }, [isDesktop, category]);

  const sortedRoster = useMemo(() => {
    return [...roster].sort((a, b) => b.Overall - a.Overall);
  }, [roster]);

  const rowRenderer = (
    item: CFBPlayer,
    index: number,
    backgroundColor: string,
  ) => {
    const attributes = getCFBAttributes(item, !isDesktop, category!);
    return (
      <div
        key={item.ID}
        className={`table-row border-b dark:border-gray-700 text-start`}
        style={{ backgroundColor }}
      >
        {attributes.map((attr, idx) => (
          <div
            key={idx}
            className={`table-cell 
        align-middle 
        min-[360px]:max-w-[6em] min-[380px]:max-w-[8em] min-[430px]:max-w-[10em] 
        text-wrap sm:max-w-full px-1 sm:px-1.5 py-1 sm:whitespace-nowrap ${
          category === Overview && idx === 8
            ? "text-left"
            : idx !== 0
              ? "text-center"
              : ""
        }`}
          >
            {attr.label === "Redshirt" ? (
              <>
                {attr.value === true ? (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                ) : (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
              </>
            ) : attr.label === "Health" ? (
              <>
                {attr.value === true ? (
                  <User textColorClass="w-full text-center text-red-500" />
                ) : (
                  <User textColorClass={`w-full text-center ${TextGreen}`} />
                )}
              </>
            ) : attr.label === "TransferStatus" ? (
              <>
                {attr.value === 0 ? (
                  <ShieldCheck
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                ) : (
                  <ShieldCheck textColorClass="w-full text-center text-red-500" />
                )}
              </>
            ) : attr.label === "Name" ? (
              <span
                className={`cursor-pointer font-semibold`}
                onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
                  (e.target as HTMLElement).style.color = "#fcd53f";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
                  (e.target as HTMLElement).style.color = "";
                }}
                onClick={() => openModal(InfoType, item)}
              >
                <Text variant="small">{attr.value}</Text>
              </span>
            ) : (
              <Text variant="small" classes="text-start">
                {attr.value}
              </Text>
            )}
          </div>
        ))}
        <div className="table-cell align-middle w-[4em] min-[430px]:w-[5em] flex-wrap sm:flex-nowrap sm:px-2 pb-1 sm:py-1 whitespace-nowrap">
          <SelectDropdown
            placeholder={!isDesktop ? "Action" : "Select an action"}
            options={[
              {
                value: "cut",
                label: `Cut - ${item.FirstName} ${item.LastName}`,
              },
              ...(item.IsRedshirting || item.IsRedshirt || redshirtCount!! > 20
                ? []
                : [
                    {
                      value: "redshirt",
                      label: `Redshirt - ${item.FirstName} ${item.LastName}`,
                    },
                  ]),
              ...(item.TransferStatus === 0
                ? []
                : [
                    {
                      value: "promise",
                      label: `Send Promise - ${item.FirstName} ${item.LastName}`,
                    },
                  ]),
            ]}
            onChange={(selectedOption) => {
              if (selectedOption?.value === "cut") {
                openModal(Cut, item);
              }
              if (selectedOption?.value === "redshirt") {
                openModal(Redshirt, item);
              }
              if (selectedOption?.value === "promise") {
                openPromiseModal(item);
              } else {
                console.log(`Action selected: ${selectedOption?.value}`);
              }
            }}
            isDisabled={disable}
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                color: "#ffffff",
                width: "16rem",
                padding: "0.3rem",
                boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                borderRadius: "8px",
                transition: "all 0.2s ease",
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: "#1a202c",
                borderRadius: "8px",
              }),
              menuList: (provided) => ({
                ...provided,
                backgroundColor: "#1a202c",
                padding: "0",
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                color: "#ffffff",
                padding: "10px",
                cursor: "pointer",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "#ffffff",
              }),
              placeholder: (provided) => ({
                ...provided,
                color: "#ffffff",
              }),
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <Table
      columns={rosterColumns}
      data={sortedRoster}
      rowRenderer={rowRenderer}
      backgroundColor={backgroundColor}
      team={team}
    />
  );
};

interface NFLRosterTableProps {
  roster: NFLPlayer[];
  contracts?: NFLContract[] | null;
  ts: any;
  backgroundColor?: string;
  headerColor?: string;
  borderColor?: string;
  team?: any;
  category?: string;
  openModal: (action: ModalAction, player: NFLPlayer) => void;
  openExtensionModal: (player: NFLPlayer) => void;
  openFranchiseTagModal: (player: NFLPlayer) => void;
  disable: boolean;
  existingOfferMap?: Record<number, NFLExtensionOffer>;
}

export const NFLRosterTable: FC<NFLRosterTableProps> = ({
  roster,
  contracts,
  ts,
  backgroundColor,
  headerColor,
  borderColor,
  team,
  category,
  openModal,
  openExtensionModal,
  openFranchiseTagModal,
  existingOfferMap,
  disable,
}) => {
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const { isDesktop, isTablet } = useResponsive();

  const rosterColumns = useMemo(() => {
    let columns = [
      { header: "ID", accessor: "ID" },
      { header: "Name", accessor: "LastName" },
      { header: !isDesktop ? "Pos" : "Position", accessor: "Position" },
      { header: !isDesktop ? "Arch" : "Archetype", accessor: "Archetype" },
      { header: !isDesktop ? "Exp" : "Experience", accessor: "Experience" },
      { header: !isDesktop ? "Ovr" : "Overall", accessor: "Overall" },
    ];

    if (isDesktop && category === Overview) {
      columns = columns.concat([
        {
          header: !isDesktop ? "Pot" : "Potential",
          accessor: "PotentialGrade",
        },
        { header: "Health", accessor: "isInjured" },
        { header: "Injury", accessor: "InjuryType" },
        {
          header: `${ts.Season} ${!isDesktop ? "S" : "Salary"}`,
          accessor: "Y1BaseSalary",
        },
        {
          header: `${ts.Season} ${!isDesktop ? "B" : "Bonus"}`,
          accessor: "Y1Bonus",
        },
        {
          header: !isDesktop ? "Yrs Left" : "Years Left",
          accessor: "ContractLength",
        },
        { header: "Ext.", accessor: "isExtended" },
        { header: "Tagged", accessor: "isTagged" },
        { header: "Trade Block", accessor: "IsOnTradeBlock" },
        { header: "PS", accessor: "IsPracticeSquad" },
        { header: "Personality", accessor: "Personality" },
        { header: "Work Ethic", accessor: "WorkEthic" },
      ]);
    }

    if (isDesktop && category === Attributes) {
      columns = columns.concat([
        { header: "Pot", accessor: "PotentialGrade" },
        { header: "FIQ", accessor: "FootballIQ" },
        { header: "SPD", accessor: "Speed" },
        { header: "AGI", accessor: "Agility" },
        { header: "CAR", accessor: "Carrying" },
        { header: "CTH", accessor: "Catching" },
        { header: "RTE", accessor: "RouteRunning" },
        { header: "THP", accessor: "ThrowPower" },
        { header: "THA", accessor: "ThrowAccuracy" },
        { header: "PBK", accessor: "PassBlock" },
        { header: "RBK", accessor: "RunBlock" },
        { header: "STR", accessor: "Strength" },
        { header: "TKL", accessor: "Tackle" },
        { header: "ZCV", accessor: "ZoneCoverage" },
        { header: "MCV", accessor: "ManCoverage" },
        { header: "RSH", accessor: "PassRush" },
        { header: "RDF", accessor: "RunDefense" },
        { header: "KP", accessor: "KickPower" },
        { header: "KA", accessor: "KickAccuracy" },
        { header: "PP", accessor: "PuntPower" },
        { header: "PA", accessor: "PuntAccuracy" },
        { header: "STA", accessor: "Stamina" },
        { header: "INJ", accessor: "Injury" },
      ]);
    }

    if (isDesktop && category === Contracts) {
      columns = columns.concat([
        { header: "Y1 Bonus", accessor: "Y1Bonus" },
        { header: "Y1 Salary", accessor: "Y1BaseSalary" },
        { header: "Y2 Bonus", accessor: "Y2Bonus" },
        { header: "Y2 Salary", accessor: "Y2BaseSalary" },
        { header: "Y3 Bonus", accessor: "Y3Bonus" },
        { header: "Y3 Salary", accessor: "Y3BaseSalary" },
        { header: "Y4 Bonus", accessor: "Y4Bonus" },
        { header: "Y4 Salary", accessor: "Y4BaseSalary" },
        { header: "Y5 Bonus", accessor: "Y5Bonus" },
        { header: "Y5 Salary", accessor: "Y5BaseSalary" },
        { header: "Years", accessor: "ContractLength" },
      ]);
    }

    columns.push({ header: "Actions", accessor: "actions" });
    return columns;
  }, [isDesktop, category]);

  const sortedRoster = useMemo(() => {
    return [...roster].sort((a, b) => {
      if (a.ShowLetterGrade && !b.ShowLetterGrade) return 1;
      if (!a.ShowLetterGrade && b.ShowLetterGrade) return -1;
      return b.Overall - a.Overall;
    });
  }, [roster]);

  console.log({ existingOfferMap });

  const rowRenderer = (
    item: NFLPlayer,
    index: number,
    backgroundColor: string,
  ) => {
    const extensionOffer = useMemo(() => {
      if (!existingOfferMap) return null;
      return existingOfferMap[item.ID] || null;
    }, [existingOfferMap, item.ID]);

    const playerContract = contracts?.find(
      (contract) => contract.PlayerID === item.ID,
    );
    item.Contract = playerContract!!;
    const attributes = getNFLAttributes(
      item,
      !isDesktop,
      category!,
      item.ShowLetterGrade,
      playerContract,
      extensionOffer,
    );
    return (
      <div
        key={item.ID}
        className={`table-row border-b dark:border-gray-700 text-left`}
        style={{ backgroundColor }}
      >
        {attributes.map((attr, idx) => (
          <div
            key={idx}
            className={`table-cell 
          align-middle 
          min-[360px]:max-w-[6em] min-[380px]:max-w-[8em] min-[430px]:max-w-[10em] 
          text-wrap sm:max-w-full px-1 sm:px-1.5 py-1 sm:whitespace-nowrap ${
            category === Overview && idx === 7
              ? "text-left"
              : idx !== 0
                ? "text-center"
                : ""
          }`}
          >
            {attr.label === "Is Tagged" ||
            attr.label === "IsOnTradeBlock" ||
            attr.label === "PS" ? (
              <>
                {attr.value === true ? (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                ) : (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
              </>
            ) : attr.label === "Is Extended" ? (
              <>
                {!extensionOffer && (
                  <DashCircle
                    textColorClass={`w-full text-center text-gray-500`}
                  />
                )}
                {extensionOffer?.IsAccepted === true && (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                )}
                {extensionOffer?.IsActive === true &&
                  !extensionOffer.IsAccepted &&
                  !extensionOffer.IsRejected && (
                    <DashCircle
                      textColorClass={`w-full text-center ${extensionOffer.Rejections < 2 ? "text-yellow-500" : "text-orange-500"}`}
                    />
                  )}

                {extensionOffer?.IsActive === true &&
                  extensionOffer.IsRejected && (
                    <CrossCircle
                      textColorClass={`w-full text-center text-red-500`}
                    />
                  )}
              </>
            ) : attr.label === "Health" ? (
              <>
                {attr.value === true ? (
                  <User textColorClass="w-full text-center text-red-500" />
                ) : (
                  <User textColorClass={`w-full text-center ${TextGreen}`} />
                )}
              </>
            ) : attr.label === "Injury" ||
              attr.label === "Personality" ||
              attr.label === "Work Ethic" ? (
              <>
                <Text variant="xs" classes="text-start">
                  {attr.value}
                </Text>
              </>
            ) : attr.label === "Name" ? (
              <span
                className={`cursor-pointer font-semibold`}
                onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
                  (e.target as HTMLElement).style.color = "#fcd53f";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
                  (e.target as HTMLElement).style.color = "";
                }}
                onClick={() => openModal(InfoType, item)}
              >
                <Text variant="small">{attr.value}</Text>
              </span>
            ) : (
              <Text variant="small" classes="text-start">
                {attr.value}
              </Text>
            )}
          </div>
        ))}
        <div className="table-cell align-middle w-[4em] min-[430px]:w-[5.5em] sm:w-full flex-wrap sm:flex-nowrap sm:px-2 pb-1 sm:py-1 whitespace-nowrap">
          <SelectDropdown
            placeholder={!isDesktop ? "Action" : "Select an action"}
            options={[
              {
                value: "cut",
                label: `Cut - ${item.FirstName} ${item.LastName}`,
              },
              {
                value: "extension",
                label: `Offer Extension - ${item.FirstName} ${item.LastName}`,
              },
              {
                value: "franchise",
                label: `Franchise Tag - ${item.FirstName} ${item.LastName}`,
              },
              {
                value: "injuredReserve",
                label: `Send to Injured Reserve - ${item.FirstName} ${item.LastName}`,
              },
              {
                value: "practiceSquad",
                label: `${
                  item.IsPracticeSquad
                    ? "Bring Up from Practice Squad"
                    : "Send Down to Practice Squad"
                } - ${item.FirstName} ${item.LastName}`,
              },
              {
                value: "tradeBlock",
                label: `Trade Block - ${item.FirstName} ${item.LastName}`,
              },
            ]}
            onChange={(selectedOption) => {
              if (selectedOption?.value === "cut") {
                openModal(Cut, item);
              } else if (selectedOption?.value === "practiceSquad") {
                openModal(PracticeSquad, item);
              } else if (selectedOption?.value === "tradeBlock") {
                openModal(TradeBlock, item);
              } else if (selectedOption?.value === "franchise") {
                openFranchiseTagModal(item);
              } else if (
                selectedOption?.value === "extension" &&
                item.Rejections < 3
              ) {
                openExtensionModal(item);
              } else {
                console.log(`Action selected: ${selectedOption?.value}`);
              }
            }}
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                color: "#ffffff",
                width: "95%",
                padding: "0.3rem",
                boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                borderRadius: "8px",
                transition: "all 0.2s ease",
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: "#1a202c",
                borderRadius: "8px",
              }),
              menuList: (provided) => ({
                ...provided,
                backgroundColor: "#1a202c",
                padding: "0",
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                color: "#ffffff",
                padding: "10px",
                cursor: "pointer",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "#ffffff",
              }),
              placeholder: (provided) => ({
                ...provided,
                color: "#ffffff",
              }),
            }}
            isDisabled={disable}
          />
        </div>
      </div>
    );
  };

  return (
    <Table
      columns={rosterColumns}
      data={sortedRoster}
      rowRenderer={rowRenderer}
      backgroundColor={backgroundColor}
      team={team}
      league={SimNFL}
    />
  );
};

interface CBBRosterTableProps {
  roster: CBBPlayer[];
  backgroundColor?: string;
  headerColor?: string;
  borderColor?: string;
  team?: any;
  category?: string;
  openModal: (action: ModalAction, player: CBBPlayer) => void;
  openPromiseModal: (player: CBBPlayer) => void;
  disable: boolean;
  collegePromiseMap: Record<number, BasketballPromise>;
}

export const CBBRosterTable: FC<CBBRosterTableProps> = ({
  roster,
  backgroundColor,
  headerColor,
  borderColor,
  team,
  category,
  openModal,
  openPromiseModal,
  collegePromiseMap,
  disable,
}) => {
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const { isDesktop } = useResponsive();

  let rosterColumns = useMemo(() => {
    let columns = [
      { header: "ID", accessor: "ID" },
      { header: "Name", accessor: "LastName" },
      { header: !isDesktop ? "Pos" : "Position", accessor: "Position" },
      { header: !isDesktop ? "Arch" : "Archetype", accessor: "Archetype" },
      { header: !isDesktop ? "Yr" : "Year", accessor: "Experience" },
      { header: "⭐", accessor: "Stars" },
      { header: !isDesktop ? "Ovr" : "Overall", accessor: "Overall" },
    ];

    if (isDesktop && category === Overview) {
      columns = columns.concat([
        {
          header: !isDesktop ? "Pot" : "Potential",
          accessor: "PotentialGrade",
        },
        { header: "Health", accessor: "isInjured" },
        { header: "Injury", accessor: "InjuryType" },
        { header: "Personality", accessor: "Personality" },
        { header: "Work Ethic", accessor: "WorkEthic" },
        { header: "Academics", accessor: "AcademicBias" },
        { header: "Redshirt", accessor: "isRedshirting" },
        { header: "Mood", accessor: "TransferStatus" },
      ]);
    }

    if (isDesktop && category === Attributes) {
      columns = columns.concat([
        {
          header: !isDesktop ? "Pot" : "Potential",
          accessor: "PotentialGrade",
        },
        { header: "Agi", accessor: "Agility" },
        { header: "Ins", accessor: "InsideShooting" },
        { header: "Mid", accessor: "MidRangeShooting" },
        { header: "3pt", accessor: "ThreePointShooting" },
        { header: "FT", accessor: "Freethrow" },
        { header: "BW", accessor: "Ballwork" },
        { header: "Stl", accessor: "Stealing" },
        { header: "RB", accessor: "Rebounding" },
        { header: "Blk", accessor: "Blocking" },
        { header: "ID", accessor: "InteriorDefense" },
        { header: "PD", accessor: "PerimeterDefense" },
        { header: "IR", accessor: "InjuryRating" },
        { header: "PTE", accessor: "PlaytimeExpectations" },
      ]);
    }
    columns.push({ header: "Actions", accessor: "actions" });
    return columns;
  }, [isDesktop, category]);

  const sortedRoster = useMemo(() => {
    return [...roster].sort((a, b) => b.Overall - a.Overall);
  }, [roster]);

  const rowRenderer = (
    item: CBBPlayer,
    index: number,
    backgroundColor: string,
  ) => {
    const attributes = getCBBAttributes(item, !isDesktop, category!);
    return (
      <div
        key={item.ID}
        className={`table-row border-b dark:border-gray-700 text-start`}
        style={{ backgroundColor }}
      >
        {attributes.map((attr, idx) => (
          <div
            key={idx}
            className={`table-cell 
        align-middle 
        min-[360px]:max-w-[6em] min-[380px]:max-w-[8em] min-[430px]:max-w-[10em] 
        text-wrap sm:max-w-full px-1 sm:px-1.5 py-1 sm:whitespace-nowrap ${
          category === Overview && idx === 8
            ? "text-left"
            : idx !== 0
              ? "text-center"
              : ""
        }`}
          >
            {attr.label === "Redshirt" ? (
              <>
                {attr.value === true ? (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                ) : (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
              </>
            ) : attr.label === "Health" ? (
              <>
                {attr.value === true ? (
                  <User textColorClass="w-full text-center text-red-500" />
                ) : (
                  <User textColorClass={`w-full text-center ${TextGreen}`} />
                )}
              </>
            ) : attr.label === "TransferStatus" ? (
              <>
                {attr.value === 0 ? (
                  <ShieldCheck
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                ) : (
                  <ShieldCheck textColorClass="w-full text-center text-red-500" />
                )}
              </>
            ) : attr.label === "Name" ? (
              <span
                className={`cursor-pointer font-semibold`}
                onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
                  (e.target as HTMLElement).style.color = "#fcd53f";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
                  (e.target as HTMLElement).style.color = "";
                }}
                onClick={() => openModal(InfoType, item)}
              >
                <Text variant="small">{attr.value}</Text>
              </span>
            ) : (
              <Text variant="small" classes="text-start">
                {attr.value}
              </Text>
            )}
          </div>
        ))}
        <div className="table-cell align-middle w-[4em] min-[430px]:w-[5em] flex-wrap sm:flex-nowrap sm:px-2 pb-1 sm:py-1 whitespace-nowrap">
          <SelectDropdown
            placeholder={!isDesktop ? "Action" : "Select an action"}
            options={[
              {
                value: "cut",
                label: `Cut - ${item.FirstName} ${item.LastName}`,
              },
              ...(item.IsRedshirting || item.IsRedshirt
                ? []
                : [
                    {
                      value: "redshirt",
                      label: `Redshirt - ${item.FirstName} ${item.LastName}`,
                    },
                  ]),
              ...(item.TransferStatus === 0
                ? []
                : [
                    {
                      value: "promise",
                      label: `Send Promise - ${item.FirstName} ${item.LastName}`,
                    },
                  ]),
            ]}
            onChange={(selectedOption) => {
              if (selectedOption?.value === "cut") {
                openModal(Cut, item);
              }
              if (selectedOption?.value === "redshirt") {
                openModal(Redshirt, item);
              }
              if (selectedOption?.value === "promise") {
                openPromiseModal(item);
              } else {
                console.log(`Action selected: ${selectedOption?.value}`);
              }
            }}
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                color: "#ffffff",
                width: "16rem",
                padding: "0.3rem",
                boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                borderRadius: "8px",
                transition: "all 0.2s ease",
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: "#1a202c",
                borderRadius: "8px",
              }),
              menuList: (provided) => ({
                ...provided,
                backgroundColor: "#1a202c",
                padding: "0",
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                color: "#ffffff",
                padding: "10px",
                cursor: "pointer",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "#ffffff",
              }),
              placeholder: (provided) => ({
                ...provided,
                color: "#ffffff",
              }),
            }}
            isDisabled={disable}
          />
        </div>
      </div>
    );
  };

  return (
    <Table
      columns={rosterColumns}
      data={sortedRoster}
      rowRenderer={rowRenderer}
      backgroundColor={backgroundColor}
      team={team}
    />
  );
};

interface NBARosterTableProps {
  roster: NBAPlayer[];
  contracts: Record<number, NBAContract>;
  backgroundColor?: string;
  headerColor?: string;
  borderColor?: string;
  team?: any;
  ts: any;
  category?: string;
  openModal: (action: ModalAction, player: NBAPlayer) => void;
  openExtensionModal: (player: NBAPlayer) => void;

  disable: boolean;
}

export const NBARosterTable: FC<NBARosterTableProps> = ({
  roster,
  backgroundColor,
  contracts,
  headerColor,
  borderColor,
  team,
  ts,
  category,
  openModal,
  openExtensionModal,
  disable,
}) => {
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const { isDesktop } = useResponsive();

  let rosterColumns = useMemo(() => {
    let columns = [
      { header: "ID", accessor: "ID" },
      { header: "Name", accessor: "LastName" },
      { header: !isDesktop ? "Pos" : "Position", accessor: "Position" },
      { header: !isDesktop ? "Arch" : "Archetype", accessor: "Archetype" },
      { header: !isDesktop ? "Age" : "Age", accessor: "Age" },
      { header: !isDesktop ? "Yr" : "Year", accessor: "Year" },
      { header: !isDesktop ? "Ovr" : "Overall", accessor: "Overall" },
    ];

    if (isDesktop && category === Overview) {
      columns = columns.concat([
        {
          header: !isDesktop ? "Pot" : "Potential",
          accessor: "PotentialGrade",
        },
        {
          header: `${ts.Season} ${!isDesktop ? "B" : "Bonus"}`,
          accessor: "Year1Total",
        },
        {
          header: !isDesktop ? "Yrs Left" : "Years Left",
          accessor: "ContractLength",
        },
        { header: "Health", accessor: "isInjured" },
        { header: "Injury", accessor: "InjuryType" },
        { header: "Personality", accessor: "Personality" },
        { header: "Work Ethic", accessor: "WorkEthic" },
        { header: "Mood", accessor: "TransferStatus" },
      ]);
    }

    if (isDesktop && category === Attributes) {
      columns = columns.concat([
        {
          header: !isDesktop ? "Pot" : "Potential",
          accessor: "PotentialGrade",
        },
        { header: "Agi", accessor: "Agility" },
        { header: "Fin", accessor: "InsideShooting" },
        { header: "SH2", accessor: "MidRangeShooting" },
        { header: "SH3", accessor: "ThreePointShooting" },
        { header: "FT", accessor: "Freethrow" },
        { header: "BW", accessor: "Ballwork" },
        { header: "Stl", accessor: "Stealing" },
        { header: "RB", accessor: "Rebounding" },
        { header: "Blk", accessor: "Blocking" },
        { header: "ID", accessor: "InteriorDefense" },
        { header: "PD", accessor: "PerimeterDefense" },
        { header: "IR", accessor: "InjuryRating" },
        { header: "PTE", accessor: "PlaytimeExpectations" },
        { header: "Min", accessor: "Minutes" },
      ]);
    }
    columns.push({ header: "Actions", accessor: "actions" });
    return columns;
  }, [isDesktop, category]);

  const sortedRoster = useMemo(() => {
    return [...roster].sort((a, b) => b.Overall - a.Overall);
  }, [roster]);

  const rowRenderer = (
    item: NBAPlayer,
    index: number,
    backgroundColor: string,
  ) => {
    const contract = contracts[item.ID];
    if (!contract) return <></>;
    item.Contract = contract!!;
    const attributes = getNBAAttributes(item, !isDesktop, category!);
    return (
      <div
        key={item.ID}
        className={`table-row border-b dark:border-gray-700 text-start`}
        style={{ backgroundColor }}
      >
        {attributes.map((attr, idx) => (
          <div
            key={idx}
            className={`table-cell 
        align-middle 
        min-[360px]:max-w-[6em] min-[380px]:max-w-[8em] min-[430px]:max-w-[10em] 
        text-wrap sm:max-w-full px-1 sm:px-1.5 py-1 sm:whitespace-nowrap ${
          category === Overview && idx === 8
            ? "text-left"
            : idx !== 0
              ? "text-center"
              : ""
        }`}
          >
            {attr.label === "Redshirt" ? (
              <>
                {attr.value === true ? (
                  <CheckCircle
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                ) : (
                  <CrossCircle textColorClass="w-full text-center text-red-500" />
                )}
              </>
            ) : attr.label === "Health" ? (
              <>
                {attr.value === true ? (
                  <User textColorClass="w-full text-center text-red-500" />
                ) : (
                  <User textColorClass={`w-full text-center ${TextGreen}`} />
                )}
              </>
            ) : attr.label === "TransferStatus" ? (
              <>
                {attr.value === 0 ? (
                  <ShieldCheck
                    textColorClass={`w-full text-center ${TextGreen}`}
                  />
                ) : (
                  <ShieldCheck textColorClass="w-full text-center text-red-500" />
                )}
              </>
            ) : attr.label === "Name" ? (
              <span
                className={`cursor-pointer font-semibold`}
                onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
                  (e.target as HTMLElement).style.color = "#fcd53f";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
                  (e.target as HTMLElement).style.color = "";
                }}
                onClick={() => openModal(InfoType, item)}
              >
                <Text variant="small">{attr.value}</Text>
              </span>
            ) : (
              <Text variant="small" classes="text-start">
                {attr.value}
              </Text>
            )}
          </div>
        ))}
        <div className="table-cell align-middle w-[4em] min-[430px]:w-[5em] flex-wrap sm:flex-nowrap sm:px-2 pb-1 sm:py-1 whitespace-nowrap">
          <SelectDropdown
            placeholder={!isDesktop ? "Action" : "Select an action"}
            options={[
              {
                value: "cut",
                label: `Cut - ${item.FirstName} ${item.LastName}`,
              },
              {
                value: "extension",
                label: `Extensions - ${item.FirstName} ${item.LastName}`,
              },
              {
                value: "gLeague",
                label: `GLeague - ${item.FirstName} ${item.LastName}`,
              },
              {
                value: "twoWay",
                label: `Two-Way - ${item.FirstName} ${item.LastName}`,
              },
              {
                value: "tradeBlock",
                label: `Send to Trade Block - ${item.FirstName} ${item.LastName}`,
              },
            ]}
            onChange={(selectedOption) => {
              if (selectedOption?.value === "cut") {
                openModal(Cut, item);
              } else if (selectedOption?.value === "redshirt") {
                openModal(Redshirt, item);
              } else if (selectedOption?.value === "extension") {
                openExtensionModal(item);
              }
              if (selectedOption?.value === "promise") {
                openModal(Promise, item);
              } else {
                console.log(`Action selected: ${selectedOption?.value}`);
              }
            }}
            styles={{
              control: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                color: "#ffffff",
                width: "16rem",
                padding: "0.3rem",
                boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                borderRadius: "8px",
                transition: "all 0.2s ease",
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: "#1a202c",
                borderRadius: "8px",
              }),
              menuList: (provided) => ({
                ...provided,
                backgroundColor: "#1a202c",
                padding: "0",
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                color: "#ffffff",
                padding: "10px",
                cursor: "pointer",
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "#ffffff",
              }),
              placeholder: (provided) => ({
                ...provided,
                color: "#ffffff",
              }),
            }}
            isDisabled={disable}
          />
        </div>
      </div>
    );
  };

  return (
    <Table
      columns={rosterColumns}
      data={sortedRoster}
      rowRenderer={rowRenderer}
      backgroundColor={backgroundColor}
      team={team}
    />
  );
};

interface PHLTradeBlockTableProps {
  roster: TradeBlockRow[];
  ts: any;
  backgroundColor?: string;
  headerColor?: string;
  borderColor?: string;
  team?: any;
  category?: string;
  openModal: (action: ModalAction, player: PHLPlayer) => void;
  disable: boolean;
}

export const PHLTradeBlockTable: FC<PHLTradeBlockTableProps> = ({
  roster = [],
  ts,
  backgroundColor,
  headerColor,
  borderColor,
  team,
  category,
  openModal,
  disable,
}) => {
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const { isDesktop, isTablet } = useResponsive();

  const rosterColumns = useMemo(() => {
    let columns = [
      { header: "Type", accessor: "isPlayer" },
      { header: "Name", accessor: "LastName" },
      {
        header: !isDesktop && !isTablet ? "Pos" : "Position",
        accessor: "Position",
      },
      {
        header: !isDesktop && !isTablet ? "Arch" : "Archetype",
        accessor: "Archetype",
      },
      {
        header: !isDesktop && !isTablet ? "Exp" : "Experience",
        accessor: "Year",
      },
      {
        header: !isDesktop && !isTablet ? "Ovr" : "Overall",
        accessor: "Overall",
      },
      {
        header: !isDesktop && !isTablet ? "DR" : "DraftRound",
        accessor: "DraftRound",
      },
      {
        header: !isDesktop && !isTablet ? "PN" : "PickNumber",
        accessor: "PickNumber",
      },
      {
        header: !isDesktop && !isTablet ? "Val" : "Value",
        accessor: "Value",
      },
    ];

    columns.push({ header: "Actions", accessor: "actions" });
    return columns;
  }, [isDesktop, category]);

  const rowRenderer = (
    item: TradeBlockRow,
    index: number,
    backgroundColor: string,
  ) => {
    const attributes = getTradeBlockAttributes(
      item,
      item.isPlayer,
      !isDesktop,
      isTablet,
      category!,
    );
    return (
      <div
        key={item.id}
        className={`table-row border-b dark:border-gray-700 text-left`}
        style={{ backgroundColor }}
      >
        {attributes.map((attr, idx) => (
          <div
            key={idx}
            className={`table-cell 
        align-middle 
        min-[360px]:max-w-[6em] min-[380px]:max-w-[8em] min-[430px]:max-w-[10em] 
        text-wrap sm:max-w-full px-1 sm:px-1.5 py-1 sm:whitespace-nowrap ${
          category === Overview && idx === 6
            ? "text-left"
            : idx !== 0
              ? "text-center"
              : ""
        }`}
          >
            {attr.label === "Name" ? (
              <span
                className={`cursor-pointer font-semibold`}
                onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
                  (e.target as HTMLElement).style.color = "#fcd53f";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
                  (e.target as HTMLElement).style.color = "";
                }}
                onClick={() => openModal(InfoType, item.player!! as PHLPlayer)}
              >
                <Text variant="small">{attr.value}</Text>
              </span>
            ) : (
              <Text variant="small" classes="text-start">
                {attr.value}
              </Text>
            )}
          </div>
        ))}
        <div className="table-cell align-middle w-[5em] min-[430px]:w-[6em] sm:w-full flex-wrap sm:flex-nowrap sm:px-2 pb-1 sm:py-1 whitespace-nowrap">
          <SelectDropdown
            placeholder={!isDesktop ? "Action" : "Select an action"}
            options={
              item.isPlayer
                ? [
                    {
                      value: "tradeBlock",
                      label: `Trade Block - ${item.name}`,
                    },
                  ]
                : []
            }
            onChange={(selectedOption) => {
              if (selectedOption?.value === "tradeBlock") {
                item.isPlayer
                  ? openModal(TradeBlock, item.player!! as PHLPlayer)
                  : () => {};
              }
            }}
            isDisabled={disable}
          />
        </div>
      </div>
    );
  };

  return (
    <Table
      columns={rosterColumns}
      data={roster}
      rowRenderer={rowRenderer}
      backgroundColor={backgroundColor}
      team={team}
    />
  );
};

interface NFLTradeBlockTableProps {
  roster: TradeBlockRow[];
  ts: any;
  backgroundColor?: string;
  headerColor?: string;
  borderColor?: string;
  team?: any;
  category?: string;
  openModal: (action: ModalAction, player: NFLPlayer) => void;
  disable: boolean;
}

export const NFLTradeBlockTable: FC<NFLTradeBlockTableProps> = ({
  roster = [],
  ts,
  backgroundColor,
  headerColor,
  borderColor,
  team,
  category,
  openModal,
  disable,
}) => {
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const { isDesktop, isTablet } = useResponsive();

  const rosterColumns = useMemo(() => {
    let columns = [
      { header: "Type", accessor: "isPlayer" },
      { header: "Name", accessor: "LastName" },
      {
        header: !isDesktop && !isTablet ? "Pos" : "Position",
        accessor: "Position",
      },
      {
        header: !isDesktop && !isTablet ? "Arch" : "Archetype",
        accessor: "Archetype",
      },
      {
        header: !isDesktop && !isTablet ? "Exp" : "Experience",
        accessor: "Year",
      },
      {
        header: !isDesktop && !isTablet ? "Ovr" : "Overall",
        accessor: "Overall",
      },
      {
        header: !isDesktop && !isTablet ? "DR" : "DraftRound",
        accessor: "DraftRound",
      },
      {
        header: !isDesktop && !isTablet ? "PN" : "PickNumber",
        accessor: "PickNumber",
      },
      {
        header: !isDesktop && !isTablet ? "Val" : "Value",
        accessor: "Value",
      },
    ];

    columns.push({ header: "Actions", accessor: "actions" });
    return columns;
  }, [isDesktop, category]);

  const rowRenderer = (
    item: TradeBlockRow,
    index: number,
    backgroundColor: string,
  ) => {
    const attributes = getTradeBlockAttributes(
      item,
      item.isPlayer,
      !isDesktop,
      isTablet,
      category!,
    );
    return (
      <div
        key={item.id}
        className={`table-row border-b dark:border-gray-700 text-left`}
        style={{ backgroundColor }}
      >
        {attributes.map((attr, idx) => (
          <div
            key={idx}
            className={`table-cell 
        align-middle 
        min-[360px]:max-w-[6em] min-[380px]:max-w-[8em] min-[430px]:max-w-[10em] 
        text-wrap sm:max-w-full px-1 sm:px-1.5 py-1 sm:whitespace-nowrap ${
          category === Overview && idx === 6
            ? "text-left"
            : idx !== 0
              ? "text-center"
              : ""
        }`}
          >
            {attr.label === "Name" ? (
              <span
                className={`cursor-pointer font-semibold`}
                onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
                  (e.target as HTMLElement).style.color = "#fcd53f";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
                  (e.target as HTMLElement).style.color = "";
                }}
                onClick={() => openModal(InfoType, item.player!! as NFLPlayer)}
              >
                <Text variant="small">{attr.value}</Text>
              </span>
            ) : (
              <Text variant="small" classes="text-start">
                {attr.value}
              </Text>
            )}
          </div>
        ))}
        <div className="table-cell align-middle w-[5em] min-[430px]:w-[6em] sm:w-full flex-wrap sm:flex-nowrap sm:px-2 pb-1 sm:py-1 whitespace-nowrap">
          <SelectDropdown
            placeholder={!isDesktop ? "Action" : "Select an action"}
            options={
              item.isPlayer
                ? [
                    {
                      value: "tradeBlock",
                      label: `Trade Block - ${item.name}`,
                    },
                  ]
                : []
            }
            onChange={(selectedOption) => {
              if (selectedOption?.value === "tradeBlock") {
                item.isPlayer
                  ? openModal(TradeBlock, item.player!! as NFLPlayer)
                  : () => {};
              }
            }}
            isDisabled={disable}
          />
        </div>
      </div>
    );
  };

  return (
    <Table
      columns={rosterColumns}
      data={roster}
      rowRenderer={rowRenderer}
      backgroundColor={backgroundColor}
      team={team}
    />
  );
};
