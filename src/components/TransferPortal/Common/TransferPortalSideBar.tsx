import { FC } from "react";
import {
  League,
  navyBlueColor,
  SimCBB,
  SimCFB,
  SimCHL,
} from "../../../_constants/constants";
import {
  CollegeTeam as HockeyTeam,
  RecruitingTeamProfile as HockeyProfile,
} from "../../../models/hockeyModels";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import {
  Team as BasketballTeam,
  TeamRecruitingProfile as BasketballProfile,
} from "../../../models/basketballModels";
import {
  CollegeTeam as FootballTeam,
  RecruitingTeamProfile as FootballProfile,
} from "../../../models/footballModels";
import { getAffinityList } from "../../../_helper/recruitingHelper";
import { Text } from "../../../_design/Typography";
import { TeamLabel } from "../../Common/Labels";
import { Border } from "../../../_design/Borders";

interface TPSideBarProps {
  TeamProfile: HockeyProfile | BasketballProfile | FootballProfile;
  Team: HockeyTeam | BasketballTeam | FootballTeam;
  teamColors: any;
  league: League;
  rosterCount: Record<string, number>;
}

export const TransferPortalSideBar: FC<TPSideBarProps> = ({
  TeamProfile,
  Team,
  teamColors,
  league,
  rosterCount,
}) => {
  const headerTextColorClass = getTextColorBasedOnBg(teamColors.One);
  let teamLabel = "";
  let classRank = 0;
  let programDevelopment = 0;
  let profDev = 0;
  let trad = 0;
  let fac = 0;
  let atm = 0;
  let aca = 0;
  let conf = 0;
  let coach = 0;
  let season = 0;
  let affinities: any[] = [];
  let res = 0;
  let region = "";
  let spotsRemaining = 0;
  switch (league) {
    case SimCHL:
      const tp = TeamProfile as HockeyProfile;
      const t = Team as HockeyTeam;
      teamLabel = t.TeamName;
      classRank = tp.RecruitingClassRank;
      programDevelopment = t.ProgramPrestige;
      profDev = t.ProfessionalPrestige;
      trad = t.Traditions;
      fac = t.Facilities;
      atm = t.Atmosphere;
      aca = t.Academics;
      conf = t.ConferencePrestige;
      coach = t.CoachRating;
      season = t.SeasonMomentum;
      spotsRemaining = 34 - rosterCount.rosterCount;
      break;
    case SimCBB:
      const cbbtp = TeamProfile as BasketballProfile;
      const cbbt = Team as BasketballTeam;
      teamLabel = cbbt.Team;
      region = cbbtp.Region;
      break;
    case SimCFB:
      // Remove some of these as affinities aren't used in portal
      const cfbtp = TeamProfile as FootballProfile;
      const cfbt = Team as FootballTeam;
      teamLabel = cfbt.TeamName;
      classRank = cfbtp.RecruitingClassRank;
      affinities = getAffinityList(cfbtp);
      res = cfbtp.RecruitingEfficiencyScore * 100;
      break;
    default:
      break;
  }
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
          <Text variant="xs">Recruiter: {TeamProfile?.Recruiter}</Text>
          <Text variant="xs">State: {Team?.State}</Text>
          {league === SimCBB && <Text variant="xs">Region: {region}</Text>}
          <Text variant="xs">Spots Remaining: {spotsRemaining}</Text>
        </div>
        {league === SimCFB && (
          <div className="flex flex-col gap-x-2 flex-wrap w-full text-start mt-2">
            <TeamLabel
              team="Affinities"
              variant="h5"
              backgroundColor={teamColors.One}
              borderColor={teamColors.One}
              headerTextColorClass={headerTextColorClass}
            />
            {affinities.map((x) => (
              <Text variant="xs">{x}</Text>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-x-2 flex-wrap w-full text-start mt-2">
          <TeamLabel
            team="Team Needs"
            variant="h5"
            backgroundColor={teamColors.One}
            borderColor={teamColors.One}
            headerTextColorClass={headerTextColorClass}
          />
          {league === SimCHL && (
            <>
              <Text variant="xs">Center Count: {rosterCount.C}</Text>
              <Text variant="xs">Forward Count: {rosterCount.F}</Text>
              <Text variant="xs">Defender Count: {rosterCount.D}</Text>
              <Text variant="xs">Goalie Count: {rosterCount.G}</Text>
            </>
          )}
        </div>
        {league === SimCHL && (
          <div className="flex flex-col gap-x-2 flex-wrap w-full text-start mt-2">
            <TeamLabel
              team="Team Values"
              variant="h5"
              backgroundColor={teamColors.One}
              borderColor={teamColors.One}
              headerTextColorClass={headerTextColorClass}
            />
            <Text variant="xs">Program Development: {programDevelopment}</Text>
            <Text variant="xs">Professional Development: {profDev}</Text>
            <Text variant="xs">Traditions: {trad}</Text>
            <Text variant="xs">Facilities: {fac}</Text>
            <Text variant="xs">Atmosphere: {atm}</Text>
            <Text variant="xs">Academics: {aca}</Text>
            <Text variant="xs">Conf. Prestige: {conf}</Text>
            <Text variant="xs">Coach Rating: {coach}</Text>
            <Text variant="xs">Season Momentum: {season}</Text>
          </div>
        )}
      </Border>
    </div>
  );
};
