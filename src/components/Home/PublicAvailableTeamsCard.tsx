import { useMemo, useState } from "react";
import { Button } from "../../_design/Buttons";
import { Logo } from "../../_design/Logo";
import { Text } from "../../_design/Typography";
import { League, SimCFB } from "../../_constants/constants";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimBaseballStore } from "../../context/SimBaseballContext";
import { getLogo } from "../../_utility/getLogo";
import {
  availableTeamLeagues,
  buildAvailableTeamRows,
  getAvailableTeamLeagueLabel,
} from "../AvailableTeams/availableTeamsRows";

export const PublicAvailableTeamsCard = () => {
  const [selectedLeague, setSelectedLeague] = useState<League>(SimCFB);
  const { cfbTeams, nflTeams } = useSimFBAStore();
  const { cbbTeams, nbaTeams } = useSimBBAStore();
  const { chlTeams, phlTeams } = useSimHCKStore();
  const { organizations } = useSimBaseballStore();

  const teamRows = useMemo(() => {
    return buildAvailableTeamRows(selectedLeague, {
      cfbTeams,
      nflTeams,
      cbbTeams,
      nbaTeams,
      chlTeams,
      phlTeams,
      organizations,
    });
  }, [
    selectedLeague,
    cfbTeams,
    nflTeams,
    cbbTeams,
    nbaTeams,
    chlTeams,
    phlTeams,
    organizations,
  ]);

  return (
    <section className="mt-4 w-full rounded-md border border-white/15 bg-gray-950/80 p-4 text-left shadow-lg">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Text variant="h5" classes="text-white">
            Available Teams
          </Text>
          <Text variant="small" classes="text-gray-300">
            Preview open and assigned teams before creating an account.
          </Text>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {availableTeamLeagues.map((league) => (
          <Button
            key={league}
            size="xs"
            variant={selectedLeague === league ? "primary" : "secondary"}
            onClick={() => setSelectedLeague(league)}
            classes="min-w-20"
          >
            {getAvailableTeamLeagueLabel(league)}
          </Button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-md border border-white/10">
        <div className="grid grid-cols-[1.75rem_minmax(2.75rem,0.7fr)_minmax(3.75rem,0.85fr)_minmax(4.5rem,1.5fr)] gap-1 bg-gray-800 px-2 py-2 sm:grid-cols-[3rem_minmax(8rem,1.4fr)_minmax(6rem,0.8fr)_minmax(8rem,1.5fr)] sm:gap-2 sm:px-3">
          <Text variant="xs" classes="truncate text-left font-semibold text-gray-200">
            Logo
          </Text>
          <Text variant="xs" classes="truncate text-left font-semibold text-gray-200">
            Team
          </Text>
          <Text variant="xs" classes="truncate text-left font-semibold text-gray-200">
            Conference
          </Text>
          <Text variant="xs" classes="truncate text-left font-semibold text-gray-200">
            Status
          </Text>
        </div>

        <div className="max-h-72 overflow-y-auto bg-black/30">
          {teamRows.length > 0 ? (
            teamRows.map((team) => {
              const rowAvailabilityClass = team.isAvailable
                ? "bg-green-900/45 text-green-50"
                : "";
              const mutedTextClass = team.isAvailable
                ? "text-green-100"
                : "text-gray-300";

              return (
                <div
                  className={`grid grid-cols-[1.75rem_minmax(2.75rem,0.7fr)_minmax(3.75rem,0.85fr)_minmax(4.5rem,1.5fr)] items-center gap-1 border-t border-white/10 px-2 py-2 sm:grid-cols-[3rem_minmax(8rem,1.4fr)_minmax(6rem,0.8fr)_minmax(8rem,1.45fr)] sm:gap-2 sm:px-3 ${rowAvailabilityClass}`}
                  key={`${selectedLeague}${team.logoId}${team.teamName}${team.conference}`}
                >
                  <Logo
                    url={getLogo(selectedLeague, team.logoId, false)}
                    variant="tiny"
                    containerClass="items-start"
                  />
                  <Text variant="xs" classes="min-w-0 truncate text-left text-gray-100">
                    <span className="sm:hidden">{team.teamAbbr}</span>
                    <span className="hidden sm:inline">{team.teamName}</span>
                  </Text>
                  <Text variant="xs" classes={`min-w-0 truncate text-left ${mutedTextClass}`}>
                    {team.conference}
                  </Text>
                  <Text variant="xs" classes={`min-w-0 truncate text-left ${mutedTextClass}`}>
                    <span className="sm:hidden">{team.mobileStatus}</span>
                    <span className="hidden sm:inline">{team.status}</span>
                  </Text>
                </div>
              );
            })
          ) : (
            <div className="px-3 py-6 text-center">
              <Text variant="small" classes="text-gray-300">
                Loading teams...
              </Text>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
