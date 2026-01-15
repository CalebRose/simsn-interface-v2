import React, { FC, ReactNode, useMemo } from "react";
import { CollegePlayer as HockeyPlayer } from "../../../models/hockeyModels";
import {
  CollegePlayer as FootballPlayer,
  RecruitingTeamProfile as FootballTeamProfile,
} from "../../../models/footballModels";
import {
  TeamRecruitingProfile,
  TransferPlayerResponse as BasketballPlayer,
} from "../../../models/basketballModels";
import {
  AddPortalPlayerType,
  AddRecruitType,
  Attributes,
  InfoType,
  League,
  ModalAction,
  PortalInfoType,
  Preferences,
  SimCBB,
  SimCFB,
  SimCHL,
} from "../../../_constants/constants";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { Table, TableCell } from "../../../_design/Table";
import { getLogo } from "../../../_utility/getLogo";
import { Logo } from "../../../_design/Logo";
import {
  getCBBAttributes,
  getCBBPortalAttributes,
  getCHLAttributes,
  getCHLPortalAttributes,
} from "../../Team/TeamPageUtils";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { ActionLock, Plus } from "../../../_design/Icons";
import { useResponsive } from "../../../_hooks/useMobile";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import { useSimBBAStore } from "../../../context/SimBBAContext";

const getTableColumns = (
  league: League,
  category: string,
  isMobile: boolean
) => {
  if (league === SimCFB) {
    let columns: { header: string; accessor: string }[] = [
      { header: "ID", accessor: "" },
      { header: "Name", accessor: "LastName" },
      { header: "Pos", accessor: "Position" },
      { header: "Arch.", accessor: "Archetype" },
      { header: "⭐", accessor: "Stars" },
      { header: "Ht", accessor: "Height" },
      { header: "Wt", accessor: "Weight" },
      { header: "City", accessor: "City" },
      { header: "HS", accessor: "HighSchool" },
      { header: "State", accessor: "State" },
      { header: "Ovr", accessor: "OverallGrade" },
      { header: "Pot", accessor: "PotentialGrade" },
      { header: "AF1", accessor: "AffinityOne" },
      { header: "AF2", accessor: "AffinityTwo" },
      { header: "Status", accessor: "RecruitingStatus" },
      { header: "Leaders", accessor: "lead" },
      { header: "Actions", accessor: "actions" },
    ];

    return columns;
  }
  if (league === SimCBB) {
    let columns: { header: string; accessor: string }[] = [
      { header: "ID", accessor: "" },
      { header: "Prev. Team", accessor: "PreviousTeamID" },
      { header: "Name", accessor: "LastName" },
      { header: "Pos", accessor: "Position" },
      { header: "Arch.", accessor: "Archetype" },
      { header: "⭐", accessor: "Stars" },
      { header: "Yr", accessor: "Year" },
      { header: "State", accessor: "State" },
      { header: "Country", accessor: "Country" },
      { header: "Ovr", accessor: "OverallGrade" },
      { header: "Ins", accessor: "Finishing" },
      { header: "Mid", accessor: "Shooting2" },
      { header: "3pt", accessor: "Shooting3" },
      { header: "FT", accessor: "FreeThrow" },
      { header: "BW", accessor: "Ballwork" },
      { header: "RB", accessor: "Rebounding" },
      { header: "Int. D", accessor: "InteriorDefense" },
      { header: "Per. D", accessor: "PerimeterDefense" },
      { header: "Pot", accessor: "PotentialGrade" },
      { header: "Leaders", accessor: "lead" },
      { header: "Actions", accessor: "actions" },
    ];

    return columns;
  }
  if (league === SimCHL) {
    let columns: { header: string; accessor: string }[] = [
      { header: "ID", accessor: "" },
      { header: "Prev. Team", accessor: "PreviousTeamID" },
      { header: "Name", accessor: "LastName" },
      { header: "Pos", accessor: "Position" },
      { header: "Arch.", accessor: "Archetype" },
      { header: "Age", accessor: "Age" },
      { header: "Year", accessor: "Year" },
      { header: "⭐", accessor: "Stars" },
      { header: "Ht", accessor: "Height" },
      { header: "Wt", accessor: "Weight" },
      { header: "Country", accessor: "Country" },
      { header: "Region", accessor: "State" },
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
      ]);
    } else if (!isMobile && category === Preferences) {
      columns = columns.concat([
        { header: "Program", accessor: "ProgramPref" },
        { header: "Prof. Dev.", accessor: "ProfDevPref" },
        { header: "Trad.", accessor: "TraditionsPref" },
        { header: "Fac.", accessor: "FacilitiesPref" },
        { header: "Atm.", accessor: "AtmospherePref" },
        { header: "Aca.", accessor: "AcademicsPref" },
        { header: "Conf.", accessor: "ConferencePref" },
        { header: "Coach", accessor: "CoachPref" },
        { header: "Season", accessor: "SeasonMomentumPref" },
      ]);
    }
    columns.push({ header: "Leaders", accessor: "lead" });
    columns.push({ header: "Actions", accessor: "actions" });

    return columns;
  }

  return [];
};

interface CHLRowProps {
  item: HockeyPlayer;
  index: number;
  backgroundColor: string;
  openModal: (type: ModalAction, player: any) => void;
  recruitOnBoardMap: Record<number, boolean>;
  isMobile: boolean;
  category: string;
}

const CHLRow: React.FC<CHLRowProps> = ({
  item,
  index,
  openModal,
  backgroundColor,
  recruitOnBoardMap,
  isMobile,
  category,
}) => {
  const hkStore = useSimHCKStore();
  const { transferProfileMapByPlayerID, chlTeam } = hkStore;
  const { isTablet } = useResponsive();
  const selection = getCHLPortalAttributes(item, isMobile, isTablet, category!);
  const actionVariant =
    !recruitOnBoardMap[item.ID] && item.PreviousTeamID !== chlTeam?.ID
      ? "success"
      : "secondary";

  const transferProfiles = useMemo(() => {
    return transferProfileMapByPlayerID[item.ID];
  }, [transferProfileMapByPlayerID, item]);

  const leadingTeamsList = useMemo(() => {
    const list = [];
    const sortedProfiles = transferProfiles.sort(
      (a, b) => b.TotalPoints - a.TotalPoints
    );
    let runningThreshold = 0;
    let totalPoints = 0;
    for (let i = 0; i < sortedProfiles.length; i++) {
      if (sortedProfiles[i].RemovedFromBoard) continue;
      if (runningThreshold === 0) {
        runningThreshold = sortedProfiles[i].TotalPoints * 0.66;
      }
      if (sortedProfiles[i].TotalPoints >= runningThreshold) {
        totalPoints += sortedProfiles[i].TotalPoints;
      }
    }
    for (let i = 0; i < sortedProfiles.length; i++) {
      if (sortedProfiles[i].RemovedFromBoard) continue;
      if (sortedProfiles[i].TotalPoints < runningThreshold) continue;
      let odds = 0;
      if (runningThreshold > 0) {
        odds = sortedProfiles[i].TotalPoints / totalPoints;
      }
      const obj = {
        TeamID: sortedProfiles[i].ProfileID,
        TeamAbbreviation: sortedProfiles[i].TeamAbbreviation,
        Odds: odds,
      };
      list.push(obj);
    }
    return list;
  }, [transferProfiles]);

  const leadingTeams = useMemo(() => {
    if (leadingTeamsList.length === 0) {
      return "None";
    }

    const competingTeams = leadingTeamsList.filter((x, idx) => x.Odds > 0);
    const topTeams = competingTeams.filter((x, idx) => idx <= 3);

    if (topTeams.length === 0) {
      return "None";
    }
    const competingIDs = topTeams.map((x) => x.TeamID);
    return competingIDs.map((x) => {
      const logo = getLogo(SimCHL, x, false);
      return (
        <div key={x}>
          <Logo url={logo} variant="tiny" />
        </div>
      );
    });
  }, [leadingTeamsList]);

  const previousTeamLogo = useMemo(() => {
    if (item.PreviousTeamID === 0 && item.LeagueID === 1) {
      return "";
    }
    let teamID = item.PreviousTeamID;
    if (item.LeagueID === 2) {
      teamID = item.TeamID;
    }
    const previousURL = getLogo(SimCHL, teamID, false);
    return <Logo url={previousURL} variant="small" />;
  }, [item]);

  return (
    <div
      key={item.ID}
      className="table-row border-b dark:border-gray-700 text-left"
      style={{ backgroundColor }}
    >
      <TableCell classes="text-xs">{item.ID}</TableCell>
      <TableCell classes="text-xs">{previousTeamLogo}</TableCell>
      {selection.map((attr, idx) => (
        <TableCell key={attr.label}>
          {attr.label === "Name" ? (
            <span
              className={`text-xs cursor-pointer font-semibold ${
                item.IsCustomCroot ? "text-blue-400" : ""
              }`}
              onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
                (e.target as HTMLElement).style.color = "#fcd53f";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
                (e.target as HTMLElement).style.color = "";
              }}
              onClick={() => openModal(PortalInfoType, item)}
            >
              {attr.value}
            </span>
          ) : (
            <span className="text-xs">{attr.value}</span>
          )}
        </TableCell>
      ))}
      <TableCell>
        <div className="flex flex-row gap-x-1 text-xs">
          {item.TeamID > 0 && item.TeamID < 75 ? (
            <div key={item.TeamID}>
              <Logo url={getLogo(SimCHL, item.TeamID, false)} variant="small" />
            </div>
          ) : (
            leadingTeams
          )}
        </div>
      </TableCell>
      <TableCell>
        <ButtonGroup classes="flex-nowrap">
          <Button
            variant={actionVariant}
            size="xs"
            onClick={() => openModal(AddPortalPlayerType, item as HockeyPlayer)}
            disabled={
              recruitOnBoardMap[item.ID] ||
              item.IsSigned ||
              item.Age < 18 ||
              item.PreviousTeamID === chlTeam?.ID
            }
          >
            {recruitOnBoardMap[item.ID] ||
            item.Age < 18 ||
            item.IsSigned ||
            item.PreviousTeamID === chlTeam?.ID ? (
              <ActionLock />
            ) : (
              <Plus />
            )}
          </Button>
        </ButtonGroup>
      </TableCell>
    </div>
  );
};

interface CFBRowProps {
  item: FootballPlayer;
  index: number;
  backgroundColor: string;
  openModal: (type: ModalAction, player: any) => void;
  recruitOnBoardMap: Record<number, boolean>;
  isMobile: boolean;
  category: string;
  teamProfile: FootballTeamProfile;
}

const CFBRow: React.FC<CFBRowProps> = ({
  item,
  index,
  openModal,
  backgroundColor,
  recruitOnBoardMap,
  isMobile,
  category,
  teamProfile,
}) => {
  return (
    <div
      key={item.ID}
      className="table-row border-b dark:border-gray-700 text-left"
      style={{ backgroundColor }}
    ></div>
  );
};

interface CBBRowProps {
  item: BasketballPlayer;
  index: number;
  backgroundColor: string;
  openModal: (type: ModalAction, player: any) => void;
  recruitOnBoardMap: Record<number, boolean>;
  isMobile: boolean;
  category: string;
  teamProfile: TeamRecruitingProfile;
}

const CBBRow: React.FC<CBBRowProps> = ({
  item,
  index,
  openModal,
  backgroundColor,
  recruitOnBoardMap,
  isMobile,
  category,
  teamProfile,
}) => {
  const { transferProfileMapByPlayerID, cbbTeam } = useSimBBAStore();
  const selection = getCBBPortalAttributes(item, isMobile, category!);
  const actionVariant = !recruitOnBoardMap[item.ID] ? "success" : "secondary";
  const { isTablet } = useResponsive();

  const transferProfiles = useMemo(() => {
    return transferProfileMapByPlayerID[item.ID];
  }, [transferProfileMapByPlayerID, item]);

  const leadingTeamsList = useMemo(() => {
    const list = [];
    const sortedProfiles = transferProfiles.sort(
      (a, b) => b.TotalPoints - a.TotalPoints
    );
    let runningThreshold = 0;
    let totalPoints = 0;
    for (let i = 0; i < sortedProfiles.length; i++) {
      if (sortedProfiles[i].RemovedFromBoard) continue;
      if (runningThreshold === 0) {
        runningThreshold = sortedProfiles[i].TotalPoints * 0.66;
      }
      if (sortedProfiles[i].TotalPoints >= runningThreshold) {
        totalPoints += sortedProfiles[i].TotalPoints;
      }
    }
    for (let i = 0; i < sortedProfiles.length; i++) {
      if (sortedProfiles[i].RemovedFromBoard) continue;
      if (sortedProfiles[i].TotalPoints < runningThreshold) continue;
      let odds = 0;
      if (runningThreshold > 0) {
        odds = sortedProfiles[i].TotalPoints / totalPoints;
      }
      const obj = {
        TeamID: sortedProfiles[i].ProfileID,
        TeamAbbreviation: sortedProfiles[i].TeamAbbreviation,
        Odds: odds,
      };
      list.push(obj);
    }
    return list;
  }, [transferProfiles]);

  const leadingTeams = useMemo(() => {
    if (leadingTeamsList.length === 0) {
      return "None";
    }

    const competingTeams = leadingTeamsList.filter((x, idx) => x.Odds > 0);
    const topTeams = competingTeams.filter((x, idx) => idx <= 3);

    if (topTeams.length === 0) {
      return "None";
    }
    const competingIDs = topTeams.map((x) => x.TeamID);
    return competingIDs.map((x) => {
      const logo = getLogo(SimCBB, x, false);
      return (
        <div key={x}>
          <Logo url={logo} variant="tiny" />
        </div>
      );
    });
  }, [leadingTeamsList]);

  const previousTeamLogo = useMemo(() => {
    if (item.PreviousTeamID === 0) {
      return "";
    }
    let teamID = item.PreviousTeamID;
    const previousURL = getLogo(SimCBB, teamID, false);
    return <Logo url={previousURL} variant="small" />;
  }, [item]);
  return (
    <div
      key={item.ID}
      className="table-row border-b dark:border-gray-700 text-left"
      style={{ backgroundColor }}
    >
      <TableCell classes="text-xs">{item.ID}</TableCell>
      <TableCell classes="text-xs">{previousTeamLogo}</TableCell>
      {selection.map((attr, idx) => (
        <TableCell key={attr.label}>
          {attr.label === "Name" ? (
            <span
              className={`text-xs cursor-pointer font-semibold`}
              onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
                (e.target as HTMLElement).style.color = "#fcd53f";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
                (e.target as HTMLElement).style.color = "";
              }}
              onClick={() => openModal(PortalInfoType, item)}
            >
              {attr.value}
            </span>
          ) : (
            <span className="text-xs">{attr.value}</span>
          )}
        </TableCell>
      ))}
      <TableCell>
        <div className="flex flex-row gap-x-1 text-xs">
          {item.TeamID > 0 && item.TeamID < 75 ? (
            <div key={item.TeamID}>
              <Logo url={getLogo(SimCBB, item.TeamID, false)} variant="small" />
            </div>
          ) : (
            leadingTeams
          )}
        </div>
      </TableCell>
      <TableCell>
        <ButtonGroup classes="flex-nowrap">
          <Button
            variant={actionVariant}
            size="xs"
            onClick={() =>
              openModal(AddPortalPlayerType, item as BasketballPlayer)
            }
            disabled={
              recruitOnBoardMap[item.ID] || item.PreviousTeamID === cbbTeam?.ID
            }
          >
            {recruitOnBoardMap[item.ID] ||
            item.PreviousTeamID === cbbTeam?.ID ? (
              <ActionLock />
            ) : (
              <Plus />
            )}
          </Button>
        </ButtonGroup>
      </TableCell>
    </div>
  );
};

interface TransferTableProps {
  players: HockeyPlayer[] | FootballPlayer[] | BasketballPlayer[];
  colorOne?: string;
  colorTwo?: string;
  colorThree?: string;
  teamMap: any;
  team: any;
  category: string;
  openModal: (
    action: ModalAction,
    player: HockeyPlayer | FootballPlayer | BasketballPlayer
  ) => void;
  league: League;
  isMobile?: boolean;
  transferOnBoardMap: Record<number, boolean>;
  currentPage: number;
  teamProfile?: any;
}

export const TransferPlayerTable: FC<TransferTableProps> = ({
  players,
  colorOne,
  teamMap,
  team,
  category,
  openModal,
  league,
  isMobile = false,
  transferOnBoardMap,
  currentPage,
  teamProfile,
}) => {
  const backgroundColor = colorOne;
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const columns = getTableColumns(league, category, isMobile);

  const rowRenderer = (
    league: League
  ): ((item: any, index: number, backgroundColor: string) => ReactNode) => {
    if (league === SimCHL) {
      return (item, index, bg) => (
        <CHLRow
          key={item.ID}
          item={item as HockeyPlayer}
          index={index}
          backgroundColor={bg}
          openModal={openModal}
          isMobile={isMobile}
          category={category}
          recruitOnBoardMap={transferOnBoardMap}
        />
      );
    }
    if (league === SimCFB) {
      return (item, index, bg) => (
        <CFBRow
          key={item.ID}
          item={item as FootballPlayer}
          index={index}
          backgroundColor={bg}
          openModal={openModal}
          isMobile={isMobile}
          category={category}
          teamProfile={teamProfile}
          recruitOnBoardMap={transferOnBoardMap}
        />
      );
    }
    return (item, index, bg) => (
      <CBBRow
        key={item.ID}
        item={item as BasketballPlayer}
        index={index}
        backgroundColor={bg}
        openModal={openModal}
        isMobile={isMobile}
        category={category}
        teamProfile={teamProfile}
        recruitOnBoardMap={transferOnBoardMap}
      />
    );
  };

  return (
    <Table
      columns={columns}
      data={players}
      rowRenderer={rowRenderer(league)}
      team={team}
      enablePagination
      currentPage={currentPage}
    />
  );
};
