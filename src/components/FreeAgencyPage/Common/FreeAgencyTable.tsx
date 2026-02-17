import { FC, ReactNode, useMemo } from "react";
import {
  FreeAgencyOffer as PHLFreeAgencyOffer,
  ProfessionalPlayer as PHLPlayer,
  WaiverOffer as PHLWaiverOffer,
} from "../../../models/hockeyModels";
import {
  FreeAgencyOffer,
  NFLPlayer,
  NFLWaiverOffer,
} from "../../../models/footballModels";
import {
  NBAContractOffer,
  NBAPlayer,
  NBAWaiverOffer,
} from "../../../models/basketballModels";
import {
  Attributes,
  FreeAgentOffer,
  InfoType,
  League,
  ModalAction,
  OfferAction,
  Preferences,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../../_constants/constants";
import { Table, TableCell } from "../../../_design/Table";
import { Text } from "../../../_design/Typography";
import {
  getNBAAttributes,
  getNFLAttributes,
  getPHLAttributes,
} from "../../Team/TeamPageUtils";
import { Button } from "../../../_design/Buttons";
import { ActionLock, Plus } from "../../../_design/Icons";
import { getLogo } from "../../../_utility/getLogo";
import { Logo } from "../../../_design/Logo";
import {
  getFACompetitivePreference,
  getFAFinancialPreference,
  getFAMarketPreference,
} from "../../../_helper/utilHelper";
import { useResponsive } from "../../../_hooks/useMobile";

interface FreeAgentTableProps {
  players: PHLPlayer[] | NFLPlayer[] | NBAPlayer[];
  offersByPlayer:
    | Record<number, PHLWaiverOffer[]>
    | Record<number, PHLFreeAgencyOffer[]>
    | Record<number, FreeAgencyOffer[]>
    | Record<number, NFLWaiverOffer[]>
    | Record<number, NBAContractOffer[]>
    | Record<number, NBAWaiverOffer[]>;
  teamOfferMap:
    | Record<number, PHLWaiverOffer>
    | Record<number, PHLFreeAgencyOffer>
    | Record<number, FreeAgencyOffer>
    | Record<number, NFLWaiverOffer>
    | Record<number, NBAContractOffer>
    | Record<number, NBAWaiverOffer>;
  colorOne?: string;
  colorTwo?: string;
  colorThree?: string;
  teamMap: any;
  team: any;
  category?: string;
  openModal: (
    action: ModalAction,
    player: PHLPlayer | NFLPlayer | NBAPlayer,
  ) => void;
  handleOfferModal: (
    action: OfferAction,
    player: PHLPlayer | NFLPlayer | NBAPlayer,
  ) => void;
  league: League;
  currentPage: number;
}

export const FreeAgentTable: FC<FreeAgentTableProps> = ({
  players,
  colorOne,
  teamMap,
  teamOfferMap,
  offersByPlayer,
  team,
  category,
  openModal,
  handleOfferModal,
  league,
  currentPage,
}) => {
  const { isTablet, isDesktop } = useResponsive();
  const backgroundColor = colorOne;
  const rosterColumns = useMemo(() => {
    let columns = [
      { header: "ID", accessor: "ID" },
      { header: "Name", accessor: "LastName" },
      { header: "Pos", accessor: "Position" },
      { header: !isDesktop ? "Arch" : "Archetype", accessor: "Archetype" },
      { header: "Exp", accessor: "Year" },
      { header: "Ovr", accessor: "Overall" },
    ];

    if (league === SimNFL) {
      columns = columns.concat([
        { header: "Pot", accessor: "PotentialGrade" },
        { header: "Prev", accessor: "PreviousTeamID" },
        { header: "Bias", accessor: "FreeAgencyBias" },
      ]);
    }

    if (league === SimPHL && isDesktop && category === Attributes) {
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

    if (league === SimNBA && isDesktop && category === Attributes) {
      columns = [
        { header: "ID", accessor: "ID" },
        { header: "Name", accessor: "LastName" },
        { header: "Pos", accessor: "Position" },
        { header: !isDesktop ? "Arch" : "Archetype", accessor: "Archetype" },
        { header: "Age", accessor: "Age" },
        { header: "Exp", accessor: "Year" },
        { header: "Ovr", accessor: "Overall" },
      ];
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
      ]);
    }

    if (league === SimPHL && isDesktop && category === Preferences) {
      columns = columns.concat([
        { header: "Market", accessor: "MarketPreference" },
        { header: "Competitive", accessor: "CompetitivePreference" },
        { header: "Financial", accessor: "FinancialPreference" },
      ]);
    }

    columns.push({ header: "Min. Value", accessor: "MinimumValue" });
    if (league === SimNFL) {
      columns.push({ header: "AAV", accessor: "AAV" });
    }
    columns.push({ header: "Interest", accessor: "LeadingTeams" });
    columns.push({ header: "Actions", accessor: "actions" });
    return columns;
  }, [isDesktop, category, league]);

  const NFLRowRenderer = (
    item: NFLPlayer,
    index: number,
    backgroundColor: string,
  ) => {
    const attributes = getNFLAttributes(
      item,
      !isDesktop,
      category!,
      item.ShowLetterGrade,
      null,
    ) as {
      label: string;
      value: number;
      letter: string;
    }[];

    const offers = offersByPlayer[item.ID];
    let offerIds: number[] = [];
    let logos: string[] = [];
    if (offers) {
      offerIds = offers && offers.map((x) => x.TeamID);
      logos = offers && offerIds.map((id) => getLogo(SimNFL, id, false));
    }
    const actionVariant = !teamOfferMap[item.ID] ? "success" : "secondary";
    let previousLogo = "";
    if (item.PreviousTeamID > 0) {
      previousLogo = getLogo(SimNFL, item.PreviousTeamID, false);
    }

    return (
      <div
        key={item.ID}
        className={`table-row border-b dark:border-gray-700 text-left`}
        style={{ backgroundColor }}
      >
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
                className={`cursor-pointer font-semibold text-left`}
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
            ) : attr.label === "Sta" || attr.label === "Inj" ? (
              <Text variant="small">{attr.letter}</Text>
            ) : (
              <Text variant="small" classes="text-left">
                {attr.value}
              </Text>
            )}
          </TableCell>
        ))}
        <TableCell>{item.PotentialGrade}</TableCell>
        <TableCell>
          {item.PreviousTeamID > 0 ? (
            <Logo url={previousLogo} variant="tiny" />
          ) : (
            "None"
          )}
        </TableCell>
        <TableCell>{item.FreeAgency}</TableCell>
        <TableCell>{item.MinimumValue.toFixed(2)}</TableCell>
        <TableCell>{item.AAV.toFixed(2)}</TableCell>
        <TableCell classes="w-[5em] min-[430px]:w-[10em]">
          <div className="flex flex-row">
            {(!offers || offers.length === 0) && "None"}
            {logos.length > 0 &&
              logos.map((url) => (
                <Logo url={url} variant="tiny" containerClass="px-1 py-2" />
              ))}
          </div>
        </TableCell>
        <TableCell classes="w-[5em] min-[430px]:w-[6em] sm:w-[6SSSem]">
          <Button
            variant={actionVariant}
            size="xs"
            onClick={() => handleOfferModal(FreeAgentOffer, item as NFLPlayer)}
            disabled={!!teamOfferMap[item.ID]}
          >
            {teamOfferMap[item.ID] ? <ActionLock /> : <Plus />}
          </Button>
        </TableCell>
      </div>
    );
  };

  const PHLRowRenderer = (
    item: PHLPlayer,
    index: number,
    backgroundColor: string,
  ) => {
    const attributes = getPHLAttributes(
      item,
      !isDesktop,
      isTablet,
      category!,
      null,
    ) as {
      label: string;
      value: number;
      letter: string;
    }[];
    const offers = offersByPlayer[item.ID];
    let offerIds = [];
    let logos: string[] = [];
    if (offers) {
      offerIds = offers && offers.map((x) => x.TeamID);
      logos = offers && offerIds.map((id) => getLogo(SimPHL, id, false));
    }
    const actionVariant = !teamOfferMap[item.ID] ? "success" : "secondary";

    return (
      <div
        key={item.ID}
        className={`table-row border-b dark:border-gray-700 text-left`}
        style={{ backgroundColor }}
      >
        <>
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
                  onClick={() => openModal(InfoType, item)}
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
          <TableCell>
            <Text variant="small">{item.Stamina}</Text>
          </TableCell>
          <TableCell>
            <Text variant="small">{item.InjuryRating}</Text>
          </TableCell>
        </>
        {category === Preferences && (
          <>
            <TableCell>
              <Text variant="small">
                {getFAMarketPreference(item.MarketPreference)}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small">
                {getFACompetitivePreference(item.CompetitivePreference)}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="small">
                {getFAFinancialPreference(item.FinancialPreference)}
              </Text>
            </TableCell>
          </>
        )}
        <TableCell>{item.MinimumValue}</TableCell>
        <TableCell classes="w-[5em] min-[430px]:w-[10em]">
          <div className="flex flex-row">
            {!offers || (offers.length === 0 && "None")}
            {logos.length > 0 &&
              logos.map((url) => (
                <Logo url={url} variant="tiny" containerClass="px-1 py-2" />
              ))}
          </div>
        </TableCell>
        <TableCell classes="w-[5em] min-[430px]:w-[6em] sm:w-[6SSSem]">
          <Button
            variant={actionVariant}
            size="xs"
            onClick={() => handleOfferModal(FreeAgentOffer, item as PHLPlayer)}
            disabled={!!teamOfferMap[item.ID]}
          >
            {teamOfferMap[item.ID] ? <ActionLock /> : <Plus />}
          </Button>
        </TableCell>
      </div>
    );
  };

  const NBARowRenderer = (
    item: NBAPlayer,
    index: number,
    backgroundColor: string,
  ) => {
    const attributes = getNBAAttributes(item, !isDesktop, category!) as {
      label: string;
      value: number;
      letter: string;
    }[];
    const offers = offersByPlayer[item.ID];
    let offerIds = [];
    let logos: string[] = [];
    if (offers) {
      offerIds = offers && offers.map((x) => x.TeamID);
      logos = offers && offerIds.map((id) => getLogo(SimNBA, id, false));
    }
    const actionVariant = !teamOfferMap[item.ID] ? "success" : "secondary";

    return (
      <div
        key={item.ID}
        className={`table-row border-b dark:border-gray-700 text-left`}
        style={{ backgroundColor }}
      >
        <>
          {attributes.map((attr, idx) => {
            if (attr.label === "Min") return <></>;
            if (attr.label === "PTE") return <></>;

            return (
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
                  <Text variant="small">{attr.value}</Text>
                )}
              </TableCell>
            );
          })}
        </>
        <TableCell>{item.MinimumValue}</TableCell>
        <TableCell classes="w-[5em] min-[430px]:w-[10em]">
          <div className="flex flex-row">
            {!offers || offers === undefined || (offers.length === 0 && "None")}
            {logos.length > 0 &&
              logos.map((url) => (
                <Logo url={url} variant="tiny" containerClass="px-1 py-2" />
              ))}
          </div>
        </TableCell>
        <TableCell classes="w-[5em] min-[430px]:w-[6em] sm:w-[6SSSem]">
          <Button
            variant={actionVariant}
            size="xs"
            onClick={() => handleOfferModal(FreeAgentOffer, item as NBAPlayer)}
            disabled={
              !!teamOfferMap[item.ID] ||
              (item.IsIntGenerated && !item.IsIntDeclared)
            }
          >
            {teamOfferMap[item.ID] ? <ActionLock /> : <Plus />}
          </Button>
        </TableCell>
      </div>
    );
  };

  const rowRenderer = (
    league: League,
  ): ((item: any, index: number, backgroundColor: string) => ReactNode) => {
    if (league === SimPHL) {
      return PHLRowRenderer;
    }
    if (league === SimNBA) {
      return NBARowRenderer;
    }
    return NFLRowRenderer;
  };

  return (
    <Table
      columns={rosterColumns}
      data={players}
      rowRenderer={rowRenderer(league)}
      backgroundColor={backgroundColor}
      team={team}
      enablePagination
      league={league}
      currentPage={currentPage}
    />
  );
};
