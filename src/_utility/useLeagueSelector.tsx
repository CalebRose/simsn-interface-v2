import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
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
}

export const teamByLeague = ({
  league,
  cfbTeam,
  nflTeam,
  cbbTeam,
  nbaTeam,
  chlTeam,
  phlTeam,
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
    default:
      return null;
  }
};
