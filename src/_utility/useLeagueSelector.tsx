import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimCollegeBaseball,
  SimMLB,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../_constants/constants";

interface TeamByLeagueParams {
  league: League;
  cfbTeam: any;
  nflTeam: any;
  cbbTeam: any;
  nbaTeam: any;
  chlTeam: any;
  phlTeam: any;
  collegeBaseballOrg?: any;
  mlbOrg?: any;
}

export const teamByLeague = ({
  league,
  cfbTeam,
  nflTeam,
  cbbTeam,
  nbaTeam,
  chlTeam,
  phlTeam,
  collegeBaseballOrg,
  mlbOrg,
}: TeamByLeagueParams) => {
  switch (league) {
    case SimCFB:
      return cfbTeam;
    case SimNFL:
      return nflTeam;
    case SimCBB:
      return cbbTeam;
    case SimNBA:
      return nbaTeam;
    case SimCHL:
      return chlTeam;
    case SimPHL:
      return phlTeam;
    case SimCollegeBaseball:
      return collegeBaseballOrg;
    case SimMLB:
      return mlbOrg;
    default:
      return null;
  }
};
