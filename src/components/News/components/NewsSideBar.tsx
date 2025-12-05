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
import { NewsDropdown } from "./NewsDropdown";
import {
  MakeBBAWeeksOptionList,
  MakeFBASeasonsOptionList,
  MakeFBAWeeksOptionList,
  MakeHCKSeasonsOptionList,
  MakeHCKWeeksOptionList,
} from "../../../_helper/statsPageHelper";
import { BarsArrowDown, BarsArrowUp, Refresh } from "../../../_design/Icons";
import { Text } from "../../../_design/Typography";

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
  refreshNews: () => void;
  sortByNewest: boolean;
  setSortByNewest: React.Dispatch<React.SetStateAction<boolean>>;
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
  refreshNews,
  setSortByNewest,
  sortByNewest,
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
    const noneOption = { label: "None", value: "-1" };
    if (!ts) {
      return [noneOption, { label: "2025", value: "1" }];
    }
    let options = [];
    if (league === SimCHL || league === SimPHL) {
      options = MakeHCKSeasonsOptionList(ts);
    } else if (league === SimCFB || league === SimNFL) {
      options = MakeFBASeasonsOptionList(ts);
    } else if (league === SimCBB || league === SimNBA) {
      options = MakeFBASeasonsOptionList(ts);
    } else {
      options = [{ label: "2025", value: "1" }];
    }
    return [noneOption, ...options];
  }, [ts, league]);

  const weekOptions = useMemo(() => {
    const noneOption = { label: "None", value: "-1" };
    let options = [];
    if (league === SimCHL || league === SimPHL) {
      options = MakeHCKWeeksOptionList(selectedSeason);
    } else if (league === SimCFB || league === SimNFL) {
      options = MakeFBAWeeksOptionList(selectedSeason);
    } else if (league === SimCBB || league === SimNBA) {
      options = MakeBBAWeeksOptionList(selectedSeason);
    } else {
      options = MakeHCKWeeksOptionList(selectedSeason);
    }
    return [noneOption, ...options];
  }, [selectedSeason, league]);

  return (
    <div className="flex flex-col w-full h-fit max-[768px]:gap-y-1 max-[1024px]:gap-y-2 mb-2 sticky top-20 max-[768px]:mt-2 mt-4 z-10">
      <Border
        direction="col"
        classes="w-full max-[768px]:px-1 max-[768px]:py-1 max-[1024px]:px-2 max-[1024px]:pb-4 px-4 py-2 h-fit items-center justify-start"
        styles={{
          borderColor: teamColors.One,
          backgroundColor: navyBlueColor,
        }}
      >
        <div className="flex flex-col gap-x-2 flex-wrap w-full text-start max-[768px]:mx-1 max-[768px]:mb-1 mx-2 mb-2">
          <TeamLabel
            team={teamLabel}
            variant="h5"
            backgroundColor={teamColors.One}
            borderColor={teamColors.One}
            headerTextColorClass={headerTextColorClass}
          />
        </div>
        <div className="flex flex-col gap-x-2 max-[768px]:gap-y-1 gap-y-2 flex-wrap w-full text-start max-[768px]:mt-1 mt-2 max-[768px]:px-1 px-2">
          {/* Desktop layout - single column */}
          <div className="hidden min-[769px]:flex flex-col gap-y-2">
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

          {/* Mobile layout - 2x2 grid */}
          <div className="flex max-[768px]:flex-col gap-y-1 min-[769px]:hidden">
            <div className="flex gap-x-1 w-full">
              <NewsDropdown
                label="League"
                options={LeagueTypeOptions}
                isMulti={false}
                isMobile={true}
                change={changeLeagueOption}
              />
              <NewsDropdown
                label="Season"
                options={seasonOptions}
                isMulti={false}
                isMobile={true}
                change={SelectSeasonOption}
              />
            </div>
            <div className="flex gap-x-1 w-full">
              <NewsDropdown
                label="Week"
                options={weekOptions}
                isMulti={false}
                isMobile={true}
                change={SelectWeekOption}
              />
              <NewsDropdown
                label="Type"
                options={NewsTypeOptions}
                isMulti={false}
                isMobile={true}
                change={SelectNewsTypeOption}
              />
            </div>
          </div>
        </div>
        {/* Desktop layout - separate sections */}
        <div className="hidden min-[769px]:flex flex-col gap-x-2 gap-y-2 flex-wrap w-full text-start mt-2 px-2">
          <ButtonGroup direction="row" classes="justify-center">
            <Button
              variant="primary"
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Text variant="body-small" classes="flex items-center">
              {currentPage + 1}
            </Text>
            <Button
              variant="primary"
              onClick={goToNextPage}
              disabled={currentPage + 1 >= totalPages}
            >
              Next
            </Button>
          </ButtonGroup>
        </div>
        <div className="hidden min-[769px]:flex flex-row gap-2 w-full text-start mx-2 mt-2 pb-2 justify-center">
          <Button
            variant="success"
            onClick={refreshNews}
            classes="flex gap-x-2 text-xs text-center justify-center items-center"
          >
            Refresh News <Refresh />
          </Button>
          <Button
            variant="primary"
            onClick={() => setSortByNewest((prev) => !prev)}
            classes="flex gap-x-2 text-xs text-center justify-center items-center py-1 px-2 flex-shrink-0"
          >
            {sortByNewest ? <BarsArrowDown /> : <BarsArrowUp />}
          </Button>
        </div>

        {/* Mobile layout - combined section with refresh on left */}
        <div className="flex max-[768px]:flex-row min-[769px]:hidden gap-x-1 w-full text-start mt-1 px-1 items-center justify-between">
          <Button
            variant="success"
            onClick={refreshNews}
            classes="flex gap-x-1 text-center justify-center items-center text-xs py-1 px-2 flex-shrink-0"
          >
            <Refresh />
          </Button>
          <Button
            variant="primary"
            onClick={() => setSortByNewest((prev) => !prev)}
            classes="flex gap-x-1 text-center justify-center items-center text-xs py-1 px-2 flex-shrink-0"
          >
            {sortByNewest ? <BarsArrowDown /> : <BarsArrowUp />}
          </Button>
          <div className="flex items-center gap-x-1">
            <Button
              variant="primary"
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              classes="text-xs px-2"
            >
              Previous
            </Button>
            <Text variant="body-small" classes="flex items-center text-xs px-1">
              {currentPage + 1}
            </Text>
            <Button
              variant="primary"
              onClick={goToNextPage}
              disabled={currentPage + 1 >= totalPages}
              classes="text-xs px-2"
            >
              Next
            </Button>
          </div>
        </div>
      </Border>
    </div>
  );
};
