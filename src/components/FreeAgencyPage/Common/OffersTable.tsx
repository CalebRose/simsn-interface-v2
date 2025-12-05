import { FC, ReactNode, useMemo } from "react";
import {
  Attributes,
  CancelOffer,
  FreeAgentOffer,
  InfoType,
  League,
  ModalAction,
  OfferAction,
  Preferences,
  SimNFL,
  SimPHL,
  Values,
} from "../../../_constants/constants";
import { NBAContractOffer, NBAPlayer } from "../../../models/basketballModels";
import {
  FreeAgencyOffer as NFLFreeAgencyOffer,
  NFLPlayer,
  Timestamp as FBTimestamp,
  NFLWaiverOffer,
} from "../../../models/footballModels";
import {
  FreeAgencyOffer as PHLFreeAgencyOffer,
  ProfessionalPlayer as PHLPlayer,
  WaiverOffer as PHLWaiverOffer,
  Timestamp as HCKTimestamp,
} from "../../../models/hockeyModels";
import {
  getNFLAttributes,
  getPHLAttributes,
  getPHLContracts,
} from "../../Team/TeamPageUtils";
import { getLogo } from "../../../_utility/getLogo";
import { Table, TableCell } from "../../../_design/Table";
import { Text } from "../../../_design/Typography";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import {
  CrossCircle,
  CurrencyDollar,
  QuestionMark,
} from "../../../_design/Icons";
import { Logo } from "../../../_design/Logo";
import {
  getFACompetitivePreference,
  getFAFinancialPreference,
  getFAMarketPreference,
} from "../../../_helper/utilHelper";
import { useResponsive } from "../../../_hooks/useMobile";

interface OfferTableProps {
  offers: PHLFreeAgencyOffer[] | NFLFreeAgencyOffer[] | NBAContractOffer[];
  playerMap:
    | Record<number, PHLPlayer>
    | Record<number, NFLPlayer>
    | Record<number, NBAPlayer>;
  offersByPlayer:
    | Record<number, PHLWaiverOffer[]>
    | Record<number, PHLFreeAgencyOffer[]>
    | Record<number, NFLFreeAgencyOffer[]>
    | Record<number, NFLWaiverOffer[]>;
  colorOne?: string;
  colorTwo?: string;
  colorThree?: string;
  teamMap: any;
  team: any;
  category?: string;
  openModal: (
    action: ModalAction,
    player: PHLPlayer | NFLPlayer | NBAPlayer
  ) => void;
  handleOfferModal: (
    action: OfferAction,
    player: PHLPlayer | NFLPlayer | NBAPlayer
  ) => void;
  league: League;
  isMobile?: boolean;
  ts: HCKTimestamp | FBTimestamp;
}

export const OfferTable: FC<OfferTableProps> = ({
  offers,
  colorOne,
  teamMap,
  offersByPlayer,
  playerMap,
  team,
  category,
  openModal,
  handleOfferModal,
  league,
  isMobile = false,
  ts,
}) => {
  const { isTablet, isDesktop } = useResponsive();
  const backgroundColor = colorOne;
  const rosterColumns = useMemo(() => {
    let columns = [
      { header: "Team", accessor: "Team" },
      { header: "ID", accessor: "ID" },
      { header: "Name", accessor: "LastName" },
      { header: "Pos", accessor: "Position" },
      { header: !isDesktop ? "Arch" : "Archetype", accessor: "Archetype" },
      { header: "Exp", accessor: "Year" },
      { header: "Ovr", accessor: "Overall" },
    ];

    if (!isMobile && category === Attributes) {
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

    if (category === Preferences) {
      columns = columns.concat([
        { header: "Market", accessor: "MarketPreference" },
        { header: "Competitive", accessor: "CompetitivePreference" },
        { header: "Financial", accessor: "FinancialPreference" },
      ]);
    }

    if (category === Values && league === SimPHL) {
      columns = columns.concat([
        { header: "Y1", accessor: "Y1BaseSalary" },
        { header: "Y2", accessor: "Y2BaseSalary" },
        { header: "Y3", accessor: "Y3BaseSalary" },
        { header: "Y4", accessor: "Y4BaseSalary" },
        { header: "Y5", accessor: "Y5BaseSalary" },
        { header: "Yrs", accessor: "ContractLength" },
        { header: "NTC", accessor: "NoTradeClause" },
        { header: "NMC", accessor: "NoMovementClause" },
        { header: "CV", accessor: "ContractValue" },
      ]);
    }

    if (league === SimNFL) {
      columns.push({ header: "Pot.", accessor: "PotentialGrade" });
    }
    columns.push({ header: "Min. Value", accessor: "MinimumValue" });
    if (league === SimNFL) {
      columns.push({ header: "AAV", accessor: "AAV" });
    }
    columns.push({ header: "Interest", accessor: "LeadingTeams" });
    columns.push({ header: "Actions", accessor: "actions" });
    return columns;
  }, [isMobile, category]);

  const NFLRowRenderer = (
    item: NFLFreeAgencyOffer,
    index: number,
    backgroundColor: string
  ) => {
    const player = playerMap[item.NFLPlayerID] as NFLPlayer;
    if (!player) return <></>;
    const offers = offersByPlayer[item.NFLPlayerID];
    let offerIds = [];
    let logos: string[] = [];
    if (offers) {
      offerIds = offers && offers.map((x) => x.TeamID);
      logos = offers && offerIds.map((id) => getLogo(SimNFL, id, false));
    }
    let winningLogo = "FA";
    let teamID = player.TeamID;
    if (teamID > 0) {
      winningLogo = getLogo(SimNFL, teamID, false);
    }

    const attributes = getNFLAttributes(
      player,
      !isDesktop,
      category!,
      player.ShowLetterGrade,
      item
    );

    return (
      <div
        key={item.ID}
        className={`table-row border-b dark:border-gray-700 text-left`}
        style={{ backgroundColor }}
      >
        <TableCell classes="w-[5em] min-[430px]:w-[4em]">
          <div className="flex flex-row">
            {player && player.TeamID > 0 ? (
              <Logo url={winningLogo} variant="tiny" containerClass="p-2" />
            ) : (
              <div className="ml-2">
                <QuestionMark />
              </div>
            )}
          </div>
        </TableCell>
        {attributes.map((attr, idx) => (
          <TableCell
            key={idx}
            classes={`min-[360px]:max-w-[6em] min-[380px]:max-w-[8em] min-[430px]:max-w-[10em] 
          text-wrap sm:max-w-full text-left`}
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
                onClick={() => openModal(InfoType, player)}
              >
                <Text variant="small">{attr.value}</Text>
              </span>
            ) : attr.label === "Sta" || attr.label === "Inj" ? (
              <Text variant="small">{attr.value}</Text>
            ) : (
              <Text variant="small">{attr.value}</Text>
            )}
          </TableCell>
        ))}
        <TableCell>{player.PotentialGrade}</TableCell>
        <TableCell>{player.MinimumValue.toFixed(2)}</TableCell>
        <TableCell>{player.AAV.toFixed(2)}</TableCell>
        <TableCell classes="w-[5em] min-[430px]:w-[10em]">
          <div className="flex flex-row">
            {!offers || (offers.length === 0 && "None")}
            {logos.length > 0 &&
              logos.map((url) => (
                <Logo url={url} variant="tiny" containerClass="p-2" />
              ))}
          </div>
        </TableCell>
        <TableCell classes="w-[5.5em] min-[430px]:w-[6em] sm:w-[7rem]">
          <ButtonGroup direction="row" classes="">
            <Button
              variant="success"
              size="xs"
              disabled={ts.IsFreeAgencyLocked || item.IsRejected}
              onClick={() =>
                handleOfferModal(FreeAgentOffer, player as NFLPlayer)
              }
            >
              <CurrencyDollar />
            </Button>
            <Button
              variant="danger"
              size="xs"
              onClick={() => openModal(CancelOffer, player as NFLPlayer)}
            >
              <CrossCircle />
            </Button>
          </ButtonGroup>
        </TableCell>
      </div>
    );
  };

  const NBARowRenderer = (
    item: NBAContractOffer,
    index: number,
    backgroundColor: string
  ) => <></>;

  const PHLRowRenderer = (
    item: PHLFreeAgencyOffer,
    index: number,
    backgroundColor: string
  ) => {
    const player = playerMap[item.PlayerID] as PHLPlayer;
    const attributes = getPHLAttributes(
      player,
      isMobile,
      isTablet,
      category!,
      null
    ) as {
      label: string;
      value: number;
      letter: string;
    }[];
    const contract = getPHLContracts(item);
    const offers = offersByPlayer[item.PlayerID];
    let offerIds = [];
    let logos: string[] = [];
    if (offers) {
      offerIds = offers && offers.map((x) => x.TeamID);
      logos = offers && offerIds.map((id) => getLogo(SimPHL, id, false));
    }
    let winningLogo = "FA";
    let teamID = player.TeamID;
    if (teamID > 0) {
      winningLogo = getLogo(SimPHL, teamID, false);
    }

    return (
      <div
        key={item.ID}
        className={`table-row border-b dark:border-gray-700 text-left`}
        style={{ backgroundColor }}
      >
        <TableCell classes="w-[5em] min-[430px]:w-[4em]">
          <div className="flex flex-row">
            {player.TeamID > 0 ? (
              <Logo url={winningLogo} variant="tiny" containerClass="p-2" />
            ) : (
              <div className="ml-2">
                <QuestionMark />
              </div>
            )}
          </div>
        </TableCell>
        {attributes.map((attr, idx) => (
          <TableCell
            key={idx}
            classes={`min-[360px]:max-w-[6em] min-[380px]:max-w-[8em] min-[430px]:max-w-[10em] 
          text-wrap sm:max-w-full ${
            category === Attributes && idx === 6
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
                onClick={() => openModal(InfoType, player)}
              >
                <Text variant="small">{attr.value}</Text>
              </span>
            ) : attr.label === "Sta" || attr.label === "Inj" ? (
              <Text variant="small">{attr.letter}</Text>
            ) : (
              <Text variant="small">{attr.value}</Text>
            )}
          </TableCell>
        ))}
        {category === Preferences && (
          <>
            <TableCell>
              <Text variant="small">
                {getFAMarketPreference(player.MarketPreference)}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small">
                {getFACompetitivePreference(player.CompetitivePreference)}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small">
                {getFAFinancialPreference(player.FinancialPreference)}
              </Text>
            </TableCell>
          </>
        )}
        {category === Values && (
          <>
            {contract.map((x) => (
              <TableCell>{x.value}</TableCell>
            ))}
            <TableCell>{item.ContractValue}</TableCell>
          </>
        )}
        <TableCell>{player.MinimumValue}</TableCell>
        <TableCell classes="w-[5em] min-[430px]:w-[10em]">
          <div className="flex flex-row">
            {!offers || (offers.length === 0 && "None")}
            {logos.length > 0 &&
              logos.map((url) => (
                <Logo url={url} variant="tiny" containerClass="p-2" />
              ))}
          </div>
        </TableCell>
        <TableCell classes="w-[5.5em] min-[430px]:w-[6em] sm:w-[7rem]">
          <ButtonGroup direction="row" classes="">
            <Button
              variant="success"
              size="xs"
              disabled={ts.IsFreeAgencyLocked || item.IsRejected}
              onClick={() =>
                handleOfferModal(FreeAgentOffer, player as PHLPlayer)
              }
            >
              <CurrencyDollar />
            </Button>
            <Button
              variant="danger"
              size="xs"
              onClick={() => openModal(CancelOffer, player as PHLPlayer)}
            >
              <CrossCircle />
            </Button>
          </ButtonGroup>
        </TableCell>
      </div>
    );
  };

  const rowRenderer = (
    league: League
  ): ((item: any, index: number, backgroundColor: string) => ReactNode) => {
    if (league === SimPHL) {
      return PHLRowRenderer;
    }
    return NFLRowRenderer;
  };
  return (
    <>
      <Table
        columns={rosterColumns}
        data={offers}
        rowRenderer={rowRenderer(league)}
        backgroundColor={backgroundColor}
        team={team}
      />
    </>
  );
};
