import React from "react";
import { ButtonGroup, PillButton } from "../../_design/Buttons";
import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { simLogos } from "../../_constants/logos";
import { useAuthStore } from "../../context/AuthContext";

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

  const { cfbTeam, nflTeam, cbbTeam, nbaTeam, chlTeam, phlTeam } = teams;

  const getTeamDisplayName = (league: League, team: any) => {
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
      default:
        return "";
    }
  };

  const getLeagueLogo = (league: League) => {
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
      default:
        return "";
    }
  };

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
  ];

  return (
    <div className={className}>
      <ButtonGroup>
        {leagues.map(({ league, team, isUser, displayName }) => {
          if (!isUser || !team) return null;

          return (
            <PillButton
              key={league}
              variant="primaryOutline"
              classes="flex flex-col"
              isSelected={selectedLeague === league}
              onClick={() => onLeagueSelect(league, team)}
            >
              {showLogos && (
                <img
                  src={getLeagueLogo(league)}
                  className="hidden md:block w-[4em] h-auto"
                  alt={`${league} logo`}
                />
              )}
              {displayName}
            </PillButton>
          );
        })}
      </ButtonGroup>
    </div>
  );
};
