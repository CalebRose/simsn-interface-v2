import React from "react";
import { ButtonGrid, ButtonGroup, PillButton } from "../../_design/Buttons";
import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimCLAX,
  SimCollegeBaseball,
  SimCVB,
  SimMLB,
  SimNBA,
  SimNFL,
  SimPHL,
  SimPVB,
} from "../../_constants/constants";
import { simLogos } from "../../_constants/logos";
import { useAuthStore } from "../../context/AuthContext";
import { useSimBaseballStore } from "../../context/SimBaseballContext";
import { useResponsive } from "../../_hooks/useMobile";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimLAXStore } from "../../context/SimLAXContext";
import { useSimVBStore } from "../../context/SimVBContext";

/**
 * LeagueSelector - A reusable component for selecting between different sport leagues
 *
 * This component renders pill buttons for each league that the user participates in,
 * displaying team names and optional league logos. It automatically handles user
 * permissions and team availability.
 *
 * @example
 * ```tsx
 * <LeagueSelector
 *   selectedLeague={currentLeague}
 *   onLeagueSelect={(league, team) => {
 *     setCurrentLeague(league);
 *     setCurrentTeam(team);
 *   }}
 *   teams={{
 *     cfbTeam: userCfbTeam,
 *     nflTeam: userNflTeam,
 *     // ... other teams
 *   }}
 *   showLogos={true}
 *   className="mb-4"
 * />
 * ```
 */
export const getTeamDisplayName = (league: League, team: any) => {
  switch (league) {
    case SimCFB:
      return team?.TeamName;
    case SimNFL:
      return team?.Mascot;
    case SimCBB:
      return team?.Team;
    case SimNBA:
      return team?.Nickname;
    case SimCHL:
      return team?.TeamName;
    case SimPHL:
      return team?.Mascot;
    case SimCollegeBaseball: {
      const cblTeam = team?.teams && (Object.values(team.teams)[0] as any);
      if (cblTeam?.team_full_name && cblTeam?.team_nickname) {
        return cblTeam.team_full_name
          .replace(cblTeam.team_nickname, "")
          .trim();
      }
      return cblTeam?.team_full_name || team?.org_abbrev;
    }
    case SimMLB: {
      const mlbTeam = team?.teams?.["mlb"] as any;
      return mlbTeam?.team_nickname || team?.org_abbrev;
    }
    case SimCLAX:
      return team?.nickname;
    case SimCVB:
      return team?.Name;
    case SimPVB:
      return team?.Nickname || team?.Name;
    default:
      return "";
  }
};

export const getLeagueLogo = (league: League) => {
  switch (league) {
    case SimCFB:
      return simLogos.SimCFB;
    case SimNFL:
      return simLogos.SimNFL;
    case SimCBB:
      return simLogos.SimCBB;
    case SimNBA:
      return simLogos.SimNBA;
    case SimCHL:
      return simLogos.SimCHL;
    case SimPHL:
      return simLogos.SimPHL;
    case SimMLB:
      return simLogos.SimMLB;
    case SimCollegeBaseball:
      return simLogos.SimCBL;
    case SimCLAX:
      return simLogos.SimCLAX;
    case SimCVB:
      return simLogos.SimCVB;
    case SimPVB:
      return simLogos.SimPVB;
    default:
      return "";
  }
};

export interface UserLeague {
  league: League;
  team: any;
  displayName: string;
  logo: string;
}

/**
 * The leagues the user has a team in, in the site's order, from every
 * sport's store. The pill row and the sport banner's league row both read it.
 */
export const useUserLeagues = (): UserLeague[] => {
  const { isCFBUser, isCBBUser, isCHLUser, isNFLUser, isNBAUser, isPHLUser } =
    useAuthStore();
  const {
    isCollegeBaseballUser,
    isMlbUser,
    collegeOrganization,
    mlbOrganization,
  } = useSimBaseballStore();
  const { cfbTeam, nflTeam } = useSimFBAStore();
  const { cbbTeam, nbaTeam } = useSimBBAStore();
  const { chlTeam, phlTeam } = useSimHCKStore();
  const { claxTeam } = useSimLAXStore();
  const { cvbTeam, pvbTeam } = useSimVBStore();
  const entries: Array<[string, any, boolean]> = [
    [SimCFB, cfbTeam, isCFBUser],
    [SimNFL, nflTeam, isNFLUser],
    [SimCBB, cbbTeam, isCBBUser],
    [SimNBA, nbaTeam, isNBAUser],
    [SimCHL, chlTeam, isCHLUser],
    [SimPHL, phlTeam, isPHLUser],
    [SimCollegeBaseball, collegeOrganization, isCollegeBaseballUser],
    [SimMLB, mlbOrganization, isMlbUser],
    [SimCLAX, claxTeam, Boolean(claxTeam)],
    [SimCVB, cvbTeam, Boolean(cvbTeam)],
    [SimPVB, pvbTeam, Boolean(pvbTeam)],
  ];
  return entries
    .filter(([, team, isUser]) => isUser && team)
    .map(([league, team]) => ({
      league: league as League,
      team,
      displayName: getTeamDisplayName(league as League, team),
      logo: getLeagueLogo(league as League),
    }));
};

interface LeagueSelectorProps {
  /** The currently selected league */
  selectedLeague: League;
  /** Callback function called when a league is selected */
  onLeagueSelect: (league: League, team: any) => void;
  /** Object containing team data for each league */
  teams: {
    cfbTeam?: any;
    nflTeam?: any;
    cbbTeam?: any;
    nbaTeam?: any;
    chlTeam?: any;
    phlTeam?: any;
    collegeBaseballOrg?: any;
    mlbOrg?: any;
    claxTeam?: any;
    cvbTeam?: any;
    pvbTeam?: any;
  };
  /** Whether to show league logos (default: true) */
  showLogos?: boolean;
  /** Additional CSS classes to apply to the container */
  className?: string;
}

export const LeagueSelector: React.FC<LeagueSelectorProps> = ({
  selectedLeague,
  onLeagueSelect,
  teams,
  showLogos = true,
  className = "",
}) => {
  const { isCFBUser, isCBBUser, isCHLUser, isNFLUser, isNBAUser, isPHLUser } =
    useAuthStore();
  const { isCollegeBaseballUser, isMlbUser } = useSimBaseballStore();

  const { isMobile } = useResponsive();

  const {
    cfbTeam,
    nflTeam,
    cbbTeam,
    nbaTeam,
    chlTeam,
    phlTeam,
    collegeBaseballOrg,
    mlbOrg,
    claxTeam,
    cvbTeam,
    pvbTeam,
  } = teams;

  const leagues: Array<{
    league: League;
    team: any;
    isUser: boolean;
    displayName: string;
  }> = [
    {
      league: SimCFB as League,
      team: cfbTeam,
      isUser: isCFBUser,
      displayName: getTeamDisplayName(SimCFB as League, cfbTeam),
    },
    {
      league: SimNFL as League,
      team: nflTeam,
      isUser: isNFLUser,
      displayName: getTeamDisplayName(SimNFL as League, nflTeam),
    },
    {
      league: SimCBB as League,
      team: cbbTeam,
      isUser: isCBBUser,
      displayName: getTeamDisplayName(SimCBB as League, cbbTeam),
    },
    {
      league: SimNBA as League,
      team: nbaTeam,
      isUser: isNBAUser,
      displayName: getTeamDisplayName(SimNBA as League, nbaTeam),
    },
    {
      league: SimCHL as League,
      team: chlTeam,
      isUser: isCHLUser,
      displayName: getTeamDisplayName(SimCHL as League, chlTeam),
    },
    {
      league: SimPHL as League,
      team: phlTeam,
      isUser: isPHLUser,
      displayName: getTeamDisplayName(SimPHL as League, phlTeam),
    },
    {
      league: SimCollegeBaseball as League,
      team: collegeBaseballOrg,
      isUser: isCollegeBaseballUser,
      displayName: getTeamDisplayName(
        SimCollegeBaseball as League,
        collegeBaseballOrg,
      ),
    },
    {
      league: SimMLB as League,
      team: mlbOrg,
      isUser: isMlbUser,
      displayName: getTeamDisplayName(SimMLB as League, mlbOrg),
    },
    {
      league: SimCLAX as League,
      team: claxTeam,
      isUser: Boolean(claxTeam),
      displayName: getTeamDisplayName(SimCLAX as League, claxTeam),
    },
    {
      league: SimCVB as League,
      team: cvbTeam,
      isUser: Boolean(cvbTeam),
      displayName: getTeamDisplayName(SimCVB as League, cvbTeam),
    },
    {
      league: SimPVB as League,
      team: pvbTeam,
      isUser: Boolean(pvbTeam),
      displayName: getTeamDisplayName(SimPVB as League, pvbTeam),
    },
  ];

  return (
    <div className={className}>
      <ButtonGrid classes={`${isMobile ? "grid-cols-4" : "grid-cols-12"} mb-1`}>
        {leagues.map(({ league, team, isUser, displayName }) => {
          if (!isUser || !team) return null;

          return (
            <PillButton
              key={league}
              variant="primaryOutline"
              classes={`flex ${isMobile ? "h-[3.5rem] w-[5.5rem]" : "h-[5.25rem] w-[8.75rem]"} shrink-0 flex-col px-3 py-2 text-center leading-tight`}
              size={isMobile ? "sm" : "md"}
              isSelected={selectedLeague === league}
              onClick={() => onLeagueSelect(league, team)}
            >
              {showLogos && (
                <img
                  src={getLeagueLogo(league)}
                  className="hidden h-10 w-16 object-contain md:block"
                  alt={`${league} logo`}
                />
              )}
              {displayName}
            </PillButton>
          );
        })}
      </ButtonGrid>
    </div>
  );
};
