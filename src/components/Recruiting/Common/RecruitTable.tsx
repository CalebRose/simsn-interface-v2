import { FC, ReactNode, useMemo } from "react";
import {
  AddRecruitType,
  Attributes,
  CloseToHome,
  League,
  ModalAction,
  Preferences,
  RecruitInfoType,
  SimCBB,
  SimCFB,
  SimCHL,
} from "../../../_constants/constants";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import {
  Croot as BasketballCroot,
  TeamRecruitingProfile,
} from "../../../models/basketballModels";
import {
  Croot as FootballCroot,
  RecruitingTeamProfile,
} from "../../../models/footballModels";
import { Croot as HockeyCroot } from "../../../models/hockeyModels";
import {
  getCBBCrootAttributes,
  getCFBCrootAttributes,
  getCHLCrootAttributes,
} from "../../Team/TeamPageUtils";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { ActionLock, Info, Plus } from "../../../_design/Icons";
import { Table, TableCell } from "../../../_design/Table";
import { Text } from "../../../_design/Typography";
import { getLogo } from "../../../_utility/getLogo";
import { Logo } from "../../../_design/Logo";
import {
  isBadFit,
  isGoodFit,
  ValidateAffinity,
  ValidateCloseToHome,
} from "../../../_helper/recruitingHelper";

const getRecruitingColumns = (
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
      { header: "Name", accessor: "LastName" },
      { header: "Pos", accessor: "Position" },
      { header: "Arch.", accessor: "Archetype" },
      { header: "⭐", accessor: "Stars" },
      { header: "Ht", accessor: "Height" },
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
      { header: "Status", accessor: "RecruitingStatus" },
      { header: "Leaders", accessor: "lead" },
      { header: "Actions", accessor: "actions" },
    ];

    return columns;
  }
  if (league === SimCHL) {
    let columns: { header: string; accessor: string }[] = [
      { header: "ID", accessor: "" },
      { header: "Name", accessor: "LastName" },
      { header: "Pos", accessor: "Position" },
      { header: "Arch.", accessor: "Archetype" },
      { header: "⭐", accessor: "Stars" },
      { header: "Ht", accessor: "Height" },
      { header: "Wt", accessor: "Weight" },
      { header: "Country", accessor: "Country" },
      { header: "Region", accessor: "State" },
      { header: "Ovr", accessor: "OverallGrade" },
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
    columns.push({ header: "Status", accessor: "RecruitingStatus" });
    columns.push({ header: "Leaders", accessor: "lead" });
    columns.push({ header: "Actions", accessor: "actions" });

    return columns;
  }

  return [];
};

interface CHLRowProps {
  item: HockeyCroot;
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
  const selection = getCHLCrootAttributes(item, isMobile, category!);
  const actionVariant = !recruitOnBoardMap[item.ID] ? "success" : "secondary";

  const leadingTeams = useMemo(() => {
    if (item.LeadingTeams === null || item.LeadingTeams.length === 0) {
      return "None";
    }

    const competingTeams = item.LeadingTeams.filter((x, idx) => x.Odds > 0);
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
  }, [item]);

  const winningLogo = useMemo(() => {
    if (!item.IsSigned) {
      return "";
    }
    const winningURL = getLogo(SimCHL, item.TeamID, false);
    return <Logo url={winningURL} variant="small" />;
  }, [item]);

  return (
    <div
      key={item.ID}
      className="table-row border-b dark:border-gray-700 text-left"
      style={{ backgroundColor }}
    >
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
              onClick={() => openModal(RecruitInfoType, item)}
            >
              {attr.value}
            </span>
          ) : (
            <span className="text-xs">{attr.value}</span>
          )}
        </TableCell>
      ))}
      <TableCell classes="text-xs">
        {item.RecruitingStatus === "" ? "None" : item.RecruitingStatus}
      </TableCell>
      <TableCell>
        <div className="flex flex-row gap-x-1 text-xs">
          {item.IsSigned ? winningLogo : leadingTeams}
        </div>
      </TableCell>
      <TableCell>
        <ButtonGroup classes="flex-nowrap">
          <Button
            variant={actionVariant}
            size="xs"
            onClick={() => openModal(AddRecruitType, item as HockeyCroot)}
            disabled={recruitOnBoardMap[item.ID] || item.IsSigned}
          >
            {recruitOnBoardMap[item.ID] || item.IsSigned ? (
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
  item: FootballCroot;
  index: number;
  backgroundColor: string;
  openModal: (type: ModalAction, player: any) => void;
  recruitOnBoardMap: Record<number, boolean>;
  isMobile: boolean;
  category: string;
  teamProfile: RecruitingTeamProfile;
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
  const selection = getCFBCrootAttributes(item, isMobile, category!);
  const actionVariant = !recruitOnBoardMap[item.ID] ? "success" : "secondary";

  // Adjust name text color based on whether player is a good or bad fit, or if custom.

  const leadingTeams = useMemo(() => {
    if (item.LeadingTeams === null || item.LeadingTeams.length === 0) {
      return "None";
    }

    const competingTeams = item.LeadingTeams.filter((x, idx) => x.Odds > 0);
    const topTeams = competingTeams.filter((x, idx) => idx <= 3);

    if (topTeams.length === 0) {
      return "None";
    }
    const competingIDs = topTeams.map((x) => x.TeamID);
    return competingIDs.map((x) => {
      const logo = getLogo(SimCFB, x, false);
      return (
        <div key={x}>
          <Logo url={logo} variant="tiny" />
        </div>
      );
    });
  }, [item]);

  const winningLogo = useMemo(() => {
    if (!item.IsSigned) {
      return "";
    }
    const winningURL = getLogo(SimCFB, item.TeamID, false);
    return <Logo url={winningURL} variant="small" />;
  }, [item]);

  const isCrootGoodFit = useMemo(() => {
    return isGoodFit(
      teamProfile.OffensiveScheme,
      teamProfile.DefensiveScheme,
      item.Position,
      item.Archetype
    );
  }, [teamProfile]);

  const isCrootBadFit = useMemo(() => {
    return isBadFit(
      teamProfile.OffensiveScheme,
      teamProfile.DefensiveScheme,
      item.Position,
      item.Archetype
    );
  }, [teamProfile]);

  const nameColor = useMemo(() => {
    if (item.IsCustomCroot) {
      return "text-blue-400";
    } else if (isCrootGoodFit) {
      return "text-green-400";
    } else if (isCrootBadFit) {
      return "text-red-400";
    }
  }, [item, isCrootGoodFit, isCrootBadFit]);

  const affinityOneValid = useMemo(() => {
    if (item.AffinityOne === CloseToHome) {
      return ValidateCloseToHome(item, teamProfile.TeamAbbreviation);
    }
    return ValidateAffinity(item.AffinityOne, teamProfile);
  }, [item, teamProfile]);

  const affinityTwoValid = useMemo(() => {
    if (item.AffinityTwo === CloseToHome) {
      return ValidateCloseToHome(item, teamProfile.TeamAbbreviation);
    }
    return ValidateAffinity(item.AffinityTwo, teamProfile);
  }, [item, teamProfile]);

  return (
    <div
      key={item.ID}
      className="table-row border-b dark:border-gray-700 text-left"
      style={{ backgroundColor }}
    >
      {selection.map((attr, idx) => (
        <TableCell key={attr.label}>
          {attr.label === "Name" ? (
            <span
              className={`text-xs cursor-pointer font-semibold ${nameColor}`}
              onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
                (e.target as HTMLElement).style.color = "#fcd53f";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
                (e.target as HTMLElement).style.color = "";
              }}
              onClick={() => openModal(RecruitInfoType, item)}
            >
              {attr.value}
            </span>
          ) : attr.label === "AF1" ? (
            <span
              className={`text-xs ${affinityOneValid ? "text-blue-400" : ""}`}
            >
              {attr.value}
            </span>
          ) : attr.label === "AF2" ? (
            <span
              className={`text-xs ${affinityTwoValid ? "text-blue-400" : ""}`}
            >
              {attr.value}
            </span>
          ) : (
            <span className="text-xs">{attr.value}</span>
          )}
        </TableCell>
      ))}
      <TableCell classes="text-xs">
        {item.RecruitingStatus === "" ? "None" : item.RecruitingStatus}
      </TableCell>
      <TableCell>
        <div className="flex flex-row gap-x-1 text-xs">
          {item.IsSigned ? winningLogo : leadingTeams}
        </div>
      </TableCell>
      <TableCell>
        <ButtonGroup classes="flex-nowrap">
          <Button
            variant={actionVariant}
            size="xs"
            onClick={() => openModal(AddRecruitType, item as FootballCroot)}
            disabled={recruitOnBoardMap[item.ID] || item.IsSigned}
          >
            {recruitOnBoardMap[item.ID] || item.IsSigned ? (
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

interface CBBRowProps {
  item: BasketballCroot;
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
  const selection = getCBBCrootAttributes(item, isMobile, category!);
  const actionVariant = !recruitOnBoardMap[item.ID] ? "success" : "secondary";

  // Adjust name text color based on whether player is a good or bad fit, or if custom.

  const leadingTeams = useMemo(() => {
    if (item.LeadingTeams === null || item.LeadingTeams.length === 0) {
      return "None";
    }

    const competingTeams = item.LeadingTeams.filter((x, idx) => x.Odds > 0);
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
  }, [item]);

  const winningLogo = useMemo(() => {
    if (!item.IsSigned) {
      return "";
    }
    const winningURL = getLogo(SimCBB, item.TeamID, false);
    return <Logo url={winningURL} variant="small" />;
  }, [item]);

  const nameColor = useMemo(() => {
    if (item.IsCustomCroot) {
      return "text-blue-400";
    }
    return "";
  }, [item]);

  return (
    <div
      key={item.ID}
      className="table-row border-b dark:border-gray-700 text-left"
      style={{ backgroundColor }}
    >
      {selection.map((attr, idx) => (
        <TableCell key={attr.label}>
          {attr.label === "Name" ? (
            <span
              className={`text-xs cursor-pointer font-semibold ${nameColor}`}
              onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
                (e.target as HTMLElement).style.color = "#fcd53f";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
                (e.target as HTMLElement).style.color = "";
              }}
              onClick={() => openModal(RecruitInfoType, item)}
            >
              {attr.value}
            </span>
          ) : (
            <span className="text-xs">{attr.value}</span>
          )}
        </TableCell>
      ))}
      <TableCell classes="text-xs">
        {item.SigningStatus === "" ? "None" : item.SigningStatus}
      </TableCell>
      <TableCell>
        <div className="flex flex-row gap-x-1 text-xs">
          {item.IsSigned ? winningLogo : leadingTeams}
        </div>
      </TableCell>
      <TableCell>
        <ButtonGroup classes="flex-nowrap">
          <Button
            variant={actionVariant}
            size="xs"
            onClick={() => openModal(AddRecruitType, item as BasketballCroot)}
            disabled={recruitOnBoardMap[item.ID] || item.IsSigned}
          >
            {recruitOnBoardMap[item.ID] || item.IsSigned ? (
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

interface RecruitTableProps {
  croots: HockeyCroot[] | FootballCroot[] | BasketballCroot[];
  colorOne?: string;
  colorTwo?: string;
  colorThree?: string;
  teamMap: any;
  team: any;
  category: string;
  openModal: (
    action: ModalAction,
    player: HockeyCroot | FootballCroot | BasketballCroot
  ) => void;
  league: League;
  isMobile?: boolean;
  recruitOnBoardMap: Record<number, boolean>;
  currentPage: number;
  teamProfile?: any;
}

export const RecruitTable: FC<RecruitTableProps> = ({
  croots,
  colorOne,
  teamMap,
  team,
  category,
  openModal,
  league,
  isMobile = false,
  recruitOnBoardMap,
  currentPage,
  teamProfile,
}) => {
  const backgroundColor = colorOne;
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const columns = getRecruitingColumns(league, category, isMobile);

  const rowRenderer = (
    league: League
  ): ((item: any, index: number, backgroundColor: string) => ReactNode) => {
    if (league === SimCHL) {
      return (item, index, bg) => (
        <CHLRow
          key={item.ID}
          item={item as HockeyCroot}
          index={index}
          backgroundColor={bg}
          openModal={openModal}
          isMobile={isMobile}
          category={category}
          recruitOnBoardMap={recruitOnBoardMap}
        />
      );
    }
    if (league === SimCFB) {
      return (item, index, bg) => (
        <CFBRow
          key={item.ID}
          item={item as FootballCroot}
          index={index}
          backgroundColor={bg}
          openModal={openModal}
          isMobile={isMobile}
          category={category}
          teamProfile={teamProfile}
          recruitOnBoardMap={recruitOnBoardMap}
        />
      );
    }
    return (item, index, bg) => (
      <CBBRow
        key={item.ID}
        item={item as BasketballCroot}
        index={index}
        backgroundColor={bg}
        openModal={openModal}
        isMobile={isMobile}
        category={category}
        teamProfile={teamProfile}
        recruitOnBoardMap={recruitOnBoardMap}
      />
    );
  };

  return (
    <Table
      columns={columns}
      data={croots}
      rowRenderer={rowRenderer(league)}
      team={team}
      enablePagination
      currentPage={currentPage}
    />
  );
};
