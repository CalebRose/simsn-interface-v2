import { FC, useMemo } from "react";
import { Table } from "../../_design/Table";
import { Text } from "../../_design/Typography";
import {
  CollegePlayer as CHLPlayer,
  ProfessionalPlayer as PHLPlayer,
  ProContract as PHLContract,
  DraftPick,
} from "../../models/hockeyModels";
import {
  CollegePlayer as CFBPlayer,
  NFLPlayer,
  NFLContract,
  Timestamp,
} from "../../models/footballModels";
import { useResponsive } from "../../_hooks/useMobile";
import {
  Attributes,
  Potentials,
  Contracts,
  Overview,
  ButtonGreen,
  TextGreen,
  Affiliate,
  TradeBlock,
} from "../../_constants/constants";
import {
  getCHLAttributes,
  getPHLAttributes,
  getCFBAttributes,
  getNFLAttributes,
  getCBBAttributes,
  getNBAAttributes,
  getPHLTradeBlockAttributes,
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
  ShieldCheck,
  User,
} from "../../_design/Icons";
import { SimNFL } from "../../_constants/constants";
import {
  CollegePlayer as CBBPlayer,
  NBAContract,
  NBAPlayer,
} from "../../models/basketballModels";
import { TradeBlockRow } from "./TeamPageTypes";
import { SingleValue } from "react-select";
import { SelectOption } from "../../_hooks/useSelectStyles";

interface CHLRosterTableProps {
  roster: CHLPlayer[];
  backgroundColor?: string;
  headerColor?: string;
  borderColor?: string;
  team?: any;
  category?: string;
  openModal: (action: ModalAction, player: CHLPlayer) => void;
  disable: boolean;
}

export const CHLRosterTable: FC<CHLRosterTableProps> = ({
  roster,
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

  let rosterColumns = useMemo(() => {
    let columns = [
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
      ]);
    }
    columns.push({ header: "Actions", accessor: "actions" });
    return columns;
  }, [isDesktop, category]);

  const sortedRoster = useMemo(() => {
    return [...roster].sort((a, b) => b.Overall - a.Overall);
  }, [roster]);

  const rowRenderer = (
    item: CHLPlayer,
    index: number,
    backgroundColor: string
  ) => {
    const attributes = getCHLAttributes(item, !isDesktop, isTablet, category!);
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
        <div className="table-cell align-middle w-[5em] min-[430px]:w-[6em] sm:w-full flex-wrap sm:flex-nowrap sm:px-2 pb-1 sm:py-1 whitespace-nowrap">
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
                openModal(Promise, item);
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
  openModal: (action: ModalAction, player: PHLPlayer) => void;
  disable: boolean;
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
  disable,
}) => {
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const { isDesktop, isTablet } = useResponsive();

  const rosterColumns = useMemo(() => {
    let columns = [
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
      ]);
    }

    if (isDesktop && category === Contracts) {
      columns = columns.concat([
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

    columns.push({ header: "Actions", accessor: "actions" });
    return columns;
  }, [isDesktop, category]);

  const sortedRoster = useMemo(() => {
    return [...roster].sort((a, b) => b.Overall - a.Overall);
  }, [roster]);

  const rowRenderer = (
    item: PHLPlayer,
    index: number,
    backgroundColor: string
  ) => {
    const playerContract = contracts?.find(
      (contract) => contract.PlayerID === item.ID
    );
    item.Contract = playerContract!!;
    const attributes = getPHLAttributes(
      item,
      !isDesktop,
      isTablet,
      category!,
      playerContract
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
                label: `Send to Affiliate Team - ${item.FirstName} ${item.LastName}`,
              },
              {
                value: "tradeBlock",
                label: `Trade Block - ${item.FirstName} ${item.LastName}`,
              },
            ]}
            onChange={(selectedOption: SingleValue<SelectOption>) => {
              if (selectedOption?.value === "cut") {
                openModal(Cut, item);
              } else if (selectedOption?.value === "affiliate") {
                openModal(Affiliate, item);
              } else if (selectedOption?.value === "tradeBlock") {
                openModal(TradeBlock, item);
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
      rowRenderer={rowRenderer}
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
  disable: boolean;
}

export const CFBRosterTable: FC<CFBRosterTableProps> = ({
  roster,
  backgroundColor,
  headerColor,
  borderColor,
  team,
  category,
  openModal,
  disable,
}) => {
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const { isDesktop } = useResponsive();

  let rosterColumns = useMemo(() => {
    let columns = [
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
    backgroundColor: string
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
                openModal(Promise, item);
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
  disable: boolean;
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
  disable,
}) => {
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const { isDesktop, isTablet } = useResponsive();

  const rosterColumns = useMemo(() => {
    let columns = [
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

  const rowRenderer = (
    item: NFLPlayer,
    index: number,
    backgroundColor: string
  ) => {
    const playerContract = contracts?.find(
      (contract) => contract.PlayerID === item.ID
    );
    item.Contract = playerContract!!;
    const attributes = getNFLAttributes(
      item,
      !isDesktop,
      category!,
      item.ShowLetterGrade,
      playerContract
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
            ) : attr.label === "Health" ? (
              <>
                {attr.value === true ? (
                  <User textColorClass="w-full text-center text-red-500" />
                ) : (
                  <User textColorClass={`w-full text-center ${TextGreen}`} />
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
                label: `Demote to Reserves - ${item.FirstName} ${item.LastName}`,
              },
              {
                value: "tradeBlock",
                label: `Trade Block - ${item.FirstName} ${item.LastName}`,
              },
            ]}
            onChange={(selectedOption) => {
              if (selectedOption?.value === "cut") {
                openModal(Cut, item);
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
  disable: boolean;
}

export const CBBRosterTable: FC<CBBRosterTableProps> = ({
  roster,
  backgroundColor,
  headerColor,
  borderColor,
  team,
  category,
  openModal,
  disable,
}) => {
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const { isDesktop } = useResponsive();

  let rosterColumns = useMemo(() => {
    let columns = [
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
        { header: "Fin", accessor: "Finishing" },
        { header: "SH2", accessor: "Shooting2" },
        { header: "SH3", accessor: "Shooting3" },
        { header: "FT", accessor: "Freethrow" },
        { header: "BW", accessor: "Ballwork" },
        { header: "RB", accessor: "Rebounding" },
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
    item: CBBPlayer,
    index: number,
    backgroundColor: string
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
  disable,
}) => {
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const { isDesktop } = useResponsive();

  let rosterColumns = useMemo(() => {
    let columns = [
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
        { header: "Fin", accessor: "Finishing" },
        { header: "SH2", accessor: "Shooting2" },
        { header: "SH3", accessor: "Shooting3" },
        { header: "FT", accessor: "Freethrow" },
        { header: "BW", accessor: "Ballwork" },
        { header: "RB", accessor: "Rebounding" },
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
    backgroundColor: string
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
              }
              if (selectedOption?.value === "redshirt") {
                openModal(Redshirt, item);
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
    backgroundColor: string
  ) => {
    const attributes = getPHLTradeBlockAttributes(
      item,
      item.isPlayer,
      !isDesktop,
      isTablet,
      category!
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
                onClick={() => openModal(InfoType, item.player!!)}
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
                item.isPlayer ? openModal(TradeBlock, item.player!!) : () => {};
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
