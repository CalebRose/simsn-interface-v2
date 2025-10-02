import { FC, ReactNode } from "react";
import { League, SimCBB, SimCFB, SimCHL } from "../../../_constants/constants";
import { RecruitingTeamProfile as HockeyTeamProfile } from "../../../models/hockeyModels";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { RecruitingTeamProfile as FootballTeamProfile } from "../../../models/footballModels";
import { Table } from "../../../_design/Table";
import { getLogo } from "../../../_utility/getLogo";
import { Logo } from "../../../_design/Logo";
import {
  Team as CBBTeam,
  TeamRecruitingProfile,
} from "../../../models/basketballModels";

const getRankingsColumns = (league: League, isMobile: boolean) => {
  let columns: { header: string; accessor: string }[] = [
    { header: "Rank", accessor: "RecruitClassRank" },
    { header: "Team", accessor: "TeamName" },
    { header: "Conference", accessor: "ConferenceName" },
    { header: "Signees", accessor: "TotalCommitments" },
    { header: "5 ⭐s", accessor: "FiveStars" },
    { header: "4 ⭐s", accessor: "FourStars" },
    { header: "3 ⭐s", accessor: "ThreeStars" },
    { header: "Composite", accessor: "CompositeScore" },
    { header: "ESPN", accessor: "EspnScore" },
    { header: "Rivals", accessor: "RivalsScore" },
    { header: "247", accessor: "Rank247Score" },
  ];
  return columns;
};

interface TeamRankingsTableProps {
  colorOne?: string;
  colorTwo?: string;
  colorThree?: string;
  teamProfiles:
    | HockeyTeamProfile[]
    | FootballTeamProfile[]
    | TeamRecruitingProfile[];
  teamMap: any;
  team: any;
  league: League;
  isMobile?: boolean;
}

export const TeamRankingsTable: FC<TeamRankingsTableProps> = ({
  colorOne,
  colorTwo,
  colorThree,
  teamProfiles,
  teamMap,
  team,
  league,
  isMobile = false,
}) => {
  if (!teamMap) {
    return <></>;
  }
  const backgroundColor = colorOne;
  const borderColor = colorTwo;
  const secondaryBorderColor = colorThree;
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const columns = getRankingsColumns(league, isMobile);

  const CFBRowRenderer = (
    item: FootballTeamProfile,
    index: number,
    backgroundColor: string
  ) => {
    const cfbTeam = teamMap[item.ID];
    if (!cfbTeam) {
      return <></>; // or some fallback UI
    }
    const logo = getLogo(SimCFB, item.ID, false);
    return (
      <div
        key={item.ID}
        className="table-row border-b dark:border-gray-700 text-left"
        style={{ backgroundColor }}
      >
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>{index + 1}</span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Logo url={logo} variant="xs" containerClass="p-4" />
            <span className={`text-sm ${textColorClass}`}>
              {cfbTeam.TeamName}
            </span>
          </div>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>
            {cfbTeam.Conference}
          </span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>
            {item.TotalCommitments}
          </span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>{item.FiveStars}</span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>{item.FourStars}</span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>{item.ThreeStars}</span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>
            {item.CompositeScore.toFixed(3)}
          </span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>
            {item.ESPNScore.toFixed(3)}
          </span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>
            {item.RivalsScore.toFixed(3)}
          </span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>
            {item.Rank247Score.toFixed(3)}
          </span>
        </div>
      </div>
    );
  };

  const CHLRowRenderer = (
    item: HockeyTeamProfile,
    index: number,
    backgroundColor: string
  ) => {
    console.log({ item });
    const chlTeam = teamMap[item.ID];
    if (!chlTeam) {
      return <></>; // or some fallback UI
    }
    const logo = getLogo(SimCHL, item.ID, false);
    return (
      <div
        key={item.ID}
        className="table-row border-b dark:border-gray-700 text-left"
        style={{ backgroundColor }}
      >
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>{index + 1}</span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Logo url={logo} variant="xs" containerClass="p-3" />
            <span className={`text-sm ${textColorClass}`}>
              {chlTeam.TeamName}
            </span>
          </div>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>
            {chlTeam.Conference}
          </span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>
            {item.TotalCommitments}
          </span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>{item.FiveStars}</span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>{item.FourStars}</span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>{item.ThreeStars}</span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>
            {item.CompositeScore.toFixed(3)}
          </span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>
            {item.ESPNScore.toFixed(3)}
          </span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>
            {item.RivalsScore.toFixed(3)}
          </span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>
            {item.Rank247Score.toFixed(3)}
          </span>
        </div>
      </div>
    );
  };

  const CBBRowRenderer = (
    item: TeamRecruitingProfile,
    index: number,
    backgroundColor: string
  ) => {
    const cbbTeam = teamMap[item.ID] as CBBTeam;
    if (!cbbTeam) {
      return <></>; // or some fallback UI
    }
    const logo = getLogo(SimCBB, item.ID, false);
    return (
      <div
        key={item.ID}
        className="table-row border-b dark:border-gray-700 text-left"
        style={{ backgroundColor }}
      >
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>{index + 1}</span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Logo url={logo} variant="xs" containerClass="p-3" />
            <span className={`text-sm ${textColorClass}`}>{cbbTeam.Team}</span>
          </div>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>
            {cbbTeam.Conference}
          </span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>
            {item.TotalCommitments}
          </span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>{item.FiveStars}</span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>{item.FourStars}</span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>{item.ThreeStars}</span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>
            {item.CompositeScore.toFixed(3)}
          </span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>
            {item.ESPNScore.toFixed(3)}
          </span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>
            {item.RivalsScore.toFixed(3)}
          </span>
        </div>
        <div className="table-cell px-2 py-1 whitespace-nowrap">
          <span className={`text-sm ${textColorClass}`}>
            {item.Rank247Score.toFixed(3)}
          </span>
        </div>
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
  console.log({ teamProfiles });
  return (
    <div className="xl:min-w-[70vw]">
      <Table
        columns={columns}
        data={teamProfiles!!}
        team={team}
        rowRenderer={rowRenderer(league)}
      />
    </div>
  );
};
