import { FC, useMemo } from "react";
import { Border } from "../../../_design/Borders";
import {
  League,
  navyBlueColor,
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

interface NewsSideBarProps {
  teamColors: any;
  selectedTeam?: any;
  league?: League;
}

export const NewsSideBar: FC<NewsSideBarProps> = ({
  teamColors,
  selectedTeam,
  league,
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
        // Remove some of these as affinities aren't used in portal
        break;
      default:
        break;
    }
    return label;
  }, [league, selectedTeam]);
  return (
    <div className="flex flex-col w-full h-full max-[1024px]:gap-y-2">
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
        <div className="flex flex-col gap-x-2 flex-wrap w-full text-start mt-2"></div>
      </Border>
    </div>
  );
};
