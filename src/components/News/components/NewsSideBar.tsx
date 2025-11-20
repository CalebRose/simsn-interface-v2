import { FC, useMemo } from "react";
import { Border } from "../../../_design/Borders";
import {
  FootballWeeks,
  League,
  LeagueTypeOptions,
  navyBlueColor,
  NewsTypeOptions,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../../_constants/constants";
import { TeamLabel } from "../../Common/Labels";
import { CollegeTeam as CHLTeam } from "../../../models/hockeyModels";
import { Team } from "../../../models/basketballModels";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { CollegeTeam } from "../../../models/footballModels";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { CategoryDropdown } from "../../Recruiting/Common/RecruitingCategoryDropdown";
import {
  MakeBBAWeeksOptionList,
  MakeFBASeasonsOptionList,
  MakeFBAWeeksOptionList,
  MakeHCKSeasonsOptionList,
  MakeHCKWeeksOptionList,
} from "../../../_helper/statsPageHelper";

interface NewsSideBarProps {
  teamColors: any;
  selectedTeam?: any;
  league?: League;
  ts: any;
  selectedSeason: number;
  changeLeagueOption: (opts: SingleValue<SelectOption>) => void;
  SelectSeasonOption: (opts: SingleValue<SelectOption>) => void;
  SelectWeekOption: (opts: SingleValue<SelectOption>) => void;
  SelectNewsTypeOption: (opts: SingleValue<SelectOption>) => void;
  currentPage: number;
  totalPages: number;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
}

export const NewsSideBar: FC<NewsSideBarProps> = ({
  teamColors,
  selectedTeam,
  league,
  ts,
  selectedSeason,
  changeLeagueOption,
  SelectSeasonOption,
  SelectWeekOption,
  SelectNewsTypeOption,
  goToPreviousPage,
  goToNextPage,
  currentPage,
  totalPages,
}) => {
  const headerTextColorClass = getTextColorBasedOnBg(teamColors.One);

  const teamLabel = useMemo(() => {
    let label = "";
    switch (league) {
      case SimCHL:
      case SimPHL: {
        const hckTeam = selectedTeam as CHLTeam;
        label = hckTeam?.TeamName ?? "";
        break;
      }
      case SimCBB:
      case SimNBA: {
        const t = selectedTeam as Team;
        label = t?.Team ?? "";
        break;
      }
      case SimCFB:
      case SimNFL:
        const fbTeam = selectedTeam as CollegeTeam;
        label = fbTeam?.TeamName ?? "";
        break;
      default:
        break;
    }
    return label;
  }, [league, selectedTeam]);

  const seasonOptions = useMemo(() => {
    if (!ts) {
      return [{ label: "2025", value: "1" }];
    }
    if (league === SimCHL || league === SimPHL) {
      return MakeHCKSeasonsOptionList(ts);
    }
    if (league === SimCFB || league === SimNFL) {
      return MakeFBASeasonsOptionList(ts);
    }
    if (league === SimCBB || league === SimNBA) {
      return MakeFBASeasonsOptionList(ts);
    }
    return [{ label: "2025", value: "1" }];
  }, [ts, league]);

  const weekOptions = useMemo(() => {
    if (league === SimCHL || league === SimPHL) {
      return MakeHCKWeeksOptionList(selectedSeason);
    }
    if (league === SimCFB || league === SimNFL) {
      return MakeFBAWeeksOptionList(selectedSeason);
    }
    if (league === SimCBB || league === SimNBA) {
      return MakeBBAWeeksOptionList(selectedSeason);
    }
    return MakeHCKWeeksOptionList(selectedSeason);
  }, [selectedSeason, league]);

  return (
    <div className="flex flex-col w-full h-full max-[1024px]:gap-y-2 mb-2">
      <Border
        direction="col"
        classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 px-4 py-2 h-full items-center justify-start"
        styles={{
          borderColor: teamColors.One,
          backgroundColor: navyBlueColor,
        }}
      >
        <div className="flex flex-col gap-x-2 flex-wrap w-full text-start mx-2 mb-2">
          <TeamLabel
            team={teamLabel}
            variant="h5"
            backgroundColor={teamColors.One}
            borderColor={teamColors.One}
            headerTextColorClass={headerTextColorClass}
          />
        </div>
        <div className="flex flex-col gap-x-2 gap-y-2 flex-wrap w-full text-start mt-2 px-2">
          <CategoryDropdown
            label="Active League"
            options={LeagueTypeOptions}
            isMulti={false}
            isMobile={false}
            change={changeLeagueOption}
          />
          <CategoryDropdown
            label="Season"
            options={seasonOptions}
            isMulti={false}
            isMobile={false}
            change={SelectSeasonOption}
          />
          <CategoryDropdown
            label="Week"
            options={weekOptions}
            isMulti={false}
            isMobile={false}
            change={SelectWeekOption}
          />
          <CategoryDropdown
            label="News Type"
            options={NewsTypeOptions}
            isMulti={false}
            isMobile={false}
            change={SelectNewsTypeOption}
          />
        </div>
      </Border>
    </div>
  );
};
