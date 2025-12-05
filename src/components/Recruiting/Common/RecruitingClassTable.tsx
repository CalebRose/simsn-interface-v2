import { FC, ReactNode } from "react";
import {
  League,
  ModalAction,
  navyBlueColor,
  RecruitInfoType,
  SimCBB,
  SimCFB,
  SimCHL,
} from "../../../_constants/constants";
import {
  Croot as HockeyCroot,
  RecruitingTeamProfile as HockeyTeamProfile,
} from "../../../models/hockeyModels";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import {
  Croot as FootballCroot,
  RecruitingTeamProfile as FootballTeamProfile,
} from "../../../models/footballModels";
import { Table, TableCell } from "../../../_design/Table";
import { getLogo } from "../../../_utility/getLogo";
import { Logo } from "../../../_design/Logo";
import { Croot as BasketballCroot } from "../../../models/basketballModels";

const getClassColumns = (league: League, isMobile: boolean) => {
  if (league === SimCFB) {
    let columns: { header: string; accessor: string }[] = [
      { header: "ID", accessor: "ID" },
      { header: "Team", accessor: "TeamID" },
      { header: "Name", accessor: "LastName" },
      { header: "Position", accessor: "Position" },
      { header: "Archetype", accessor: "Archetype" },
      { header: "⭐s", accessor: "Stars" },
      { header: "Ovr", accessor: "OverallGrade" },
      { header: "Pot", accessor: "PotentialGrade" },
      { header: "City", accessor: "City" },
      { header: "HS", accessor: "HighSchool" },
      { header: "Region", accessor: "State" },
    ];
    return columns;
  }
  if (league === SimCBB) {
    let columns: { header: string; accessor: string }[] = [
      { header: "ID", accessor: "ID" },
      { header: "Team", accessor: "TeamID" },
      { header: "Name", accessor: "LastName" },
      { header: "Position", accessor: "Position" },
      { header: "Archetype", accessor: "Archetype" },
      { header: "⭐s", accessor: "Stars" },
      { header: "Ovr", accessor: "OverallGrade" },
      { header: "Pot", accessor: "PotentialGrade" },
      { header: "Region", accessor: "State" },
      { header: "Country", accessor: "Country" },
    ];
    return columns;
  }
  if (league === SimCHL) {
    let columns: { header: string; accessor: string }[] = [
      { header: "ID", accessor: "ID" },
      { header: "Team", accessor: "TeamID" },
      { header: "Name", accessor: "LastName" },
      { header: "Position", accessor: "Position" },
      { header: "Archetype", accessor: "Archetype" },
      { header: "⭐s", accessor: "Stars" },
      { header: "Ovr", accessor: "OverallGrade" },
      { header: "City", accessor: "City" },
      { header: "Youth", accessor: "HighSchool" },
      { header: "Region", accessor: "State" },
      { header: "Country", accessor: "Country" },
    ];
    return columns;
  }

  return [];
};

interface RecruitingClassTableProps {
  colorOne?: string;
  colorTwo?: string;
  colorThree?: string;
  crootingClass: HockeyCroot[] | FootballCroot[] | BasketballCroot[];
  teamMap: any;
  team: any;
  league: League;
  isMobile?: boolean;
  openModal: (type: ModalAction, player: any) => void;
}

export const RecruitingClassTable: FC<RecruitingClassTableProps> = ({
  colorOne,
  colorTwo,
  colorThree,
  crootingClass,
  teamMap,
  team,
  league,
  isMobile = false,
  openModal,
}) => {
  const backgroundColor = colorOne;
  const borderColor = colorTwo;
  const secondaryBorderColor = colorThree;
  const textColorClass = getTextColorBasedOnBg(navyBlueColor);
  const columns = getClassColumns(league, isMobile);

  const CFBRowRenderer = (
    item: FootballCroot,
    index: number,
    backgroundColor: string
  ) => {
    const logo = getLogo(SimCFB, item.TeamID, false);
    return (
      <div
        key={item.ID}
        className="table-row border-b dark:border-gray-700 text-left"
        style={{ backgroundColor }}
      >
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>{item.ID}</span>
        </div>
        <TableCell>
          <div className="flex flex-row items-center">
            <Logo url={logo} variant="tiny" />
            <span className="ms-2 font-semibold text-xs">{item.College}</span>
          </div>
        </TableCell>
        <TableCell>
          <span
            className={`text-xs cursor-pointer font-semibold`}
            onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
              (e.target as HTMLElement).style.color = "#fcd53f";
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
              (e.target as HTMLElement).style.color = "";
            }}
            onClick={() => openModal(RecruitInfoType, item)}
          >
            {item.FirstName} {item.LastName}
          </span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>{item.Position}</span>
        </TableCell>

        <TableCell>
          <span className={`text-sm ${textColorClass}`}>{item.Archetype}</span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>{item.Stars}</span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>
            {item.OverallGrade}
          </span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>
            {item.PotentialGrade}
          </span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>{item.City}</span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>{item.HighSchool}</span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>{item.State}</span>
        </TableCell>
      </div>
    );
  };

  const CHLRowRenderer = (
    item: HockeyCroot,
    index: number,
    backgroundColor: string
  ) => {
    const logo = getLogo(SimCHL, item.TeamID, false);
    return (
      <div
        key={item.ID}
        className="table-row border-b dark:border-gray-700 text-left"
        style={{ backgroundColor }}
      >
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>{item.ID}</span>
        </div>
        <TableCell>
          <div className="flex flex-row items-center">
            <Logo url={logo} variant="tiny" />
            <span className="ms-2 font-semibold text-xs">{item.College}</span>
          </div>
        </TableCell>
        <TableCell>
          <span
            className={`text-xs cursor-pointer font-semibold`}
            onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
              (e.target as HTMLElement).style.color = "#fcd53f";
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
              (e.target as HTMLElement).style.color = "";
            }}
            onClick={() => openModal(RecruitInfoType, item)}
          >
            {item.FirstName} {item.LastName}
          </span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>{item.Position}</span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>{item.Archetype}</span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>{item.Stars}</span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>
            {item.OverallGrade}
          </span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>{item.City}</span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>{item.HighSchool}</span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>{item.State}</span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>{item.Country}</span>
        </TableCell>
      </div>
    );
  };

  const CBBRowRenderer = (
    item: BasketballCroot,
    index: number,
    backgroundColor: string
  ) => {
    const logo = getLogo(SimCBB, item.TeamID, false);
    return (
      <div
        key={item.ID}
        className="table-row border-b dark:border-gray-700 text-left"
        style={{ backgroundColor }}
      >
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>{item.ID}</span>
        </div>
        <TableCell>
          <div className="flex flex-row items-center">
            <Logo url={logo} variant="tiny" />
            <span className="ms-2 font-semibold text-xs">{item.College}</span>
          </div>
        </TableCell>
        <TableCell>
          <span
            className={`text-xs cursor-pointer font-semibold`}
            onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
              (e.target as HTMLElement).style.color = "#fcd53f";
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
              (e.target as HTMLElement).style.color = "";
            }}
            onClick={() => openModal(RecruitInfoType, item)}
          >
            {item.FirstName} {item.LastName}
          </span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>{item.Position}</span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>{item.Archetype}</span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>{item.Stars}</span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>
            {item.OverallGrade}
          </span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>
            {item.PotentialGrade}
          </span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>{item.State}</span>
        </TableCell>
        <TableCell>
          <span className={`text-sm ${textColorClass}`}>{item.Country}</span>
        </TableCell>
      </div>
    );
  };

  const rowRenderer = (
    league: League
  ): ((item: any, index: number, backgroundColor: string) => ReactNode) => {
    if (league === SimCHL) {
      return CHLRowRenderer;
    }
    if (league === SimCBB) {
      return CBBRowRenderer;
    }
    return CFBRowRenderer;
  };
  return (
    <div className="xl:min-w-[70vw]">
      <Table
        columns={columns}
        data={crootingClass!!}
        team={team}
        rowRenderer={rowRenderer(league)}
      />
    </div>
  );
};
