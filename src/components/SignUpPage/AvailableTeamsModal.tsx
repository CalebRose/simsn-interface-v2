import { FC, useMemo, useState } from "react";
import { Modal } from "../../_design/Modal";
import { Button, ButtonGrid, ButtonGroup } from "../../_design/Buttons";
import { Text } from "../../_design/Typography";
import { League, SimCFB } from "../../_constants/constants";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimBaseballStore } from "../../context/SimBaseballContext";
import { Logo } from "../../_design/Logo";
import { getLogo } from "../../_utility/getLogo";
import {
  availableTeamLeagues,
  buildAvailableTeamRows,
  getAvailableTeamLeagueLabel,
} from "../AvailableTeams/availableTeamsRows";

interface AvailableTeamsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AvailableTeamsModal: FC<AvailableTeamsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedLeague, setSelectedLeague] = useState<League>(SimCFB);
  const { cfbTeams, nflTeams } = useSimFBAStore();
  const { cbbTeams, nbaTeams } = useSimBBAStore();
  const { chlTeams, phlTeams } = useSimHCKStore();
  const { organizations } = useSimBaseballStore();
  const backgroundColor = "#1f2937";
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
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Available Teams"
        maxWidth="max-w-[60rem]"
        actions={
          <>
            <ButtonGroup>
              <Button size="sm" variant="primary" onClick={onClose}>
                <Text variant="small">Close</Text>
              </Button>
            </ButtonGroup>
          </>
        }
      >
        <div className="grid grid-flow-col mb-2">
          <ButtonGrid>
            {availableTeamLeagues.map((league) => (
              <Button
                key={league}
                size="xs"
                variant={selectedLeague === league ? "primary" : "secondary"}
                onClick={() => setSelectedLeague(league)}
              >
                {getAvailableTeamLeagueLabel(league)}
              </Button>
            ))}
          </ButtonGrid>
        </div>
        <div
          className="grid grid-flow-col gap-2 font-semibold border-t px-1"
          style={{ backgroundColor }}
        >
          <div className="grid grid-cols-4 gap-2 font-semibold py-1 border-b">
            <Text variant="xs" classes="text-left">
              Logo
            </Text>
            <Text variant="xs" classes="text-left">
              Team
            </Text>
            <Text variant="xs" classes="text-left">
              Conference
            </Text>
            <Text variant="xs" classes="text-left">
              Status
            </Text>
          </div>
        </div>
        <div className="max-h-[40vh] overflow-y-auto">
          {teamRows?.map((team) => {
            const url = getLogo(selectedLeague, team.logoId, false);
            const rowAvailabilityClass = team.isAvailable
              ? "bg-green-900/30 text-green-50"
              : "";
            const mutedTextClass = team.isAvailable
              ? "text-green-100"
              : "";

            return (
              <div
                className={`grid grid-cols-4 gap-2 text-sm border-b py-2 ${rowAvailabilityClass}`}
                key={`${selectedLeague}${team.logoId}${team.teamName}${team.conference}`}
              >
                <Logo url={url} variant="small" />
                <Text variant="xs" classes="text-left">
                  {team.teamName}
                </Text>
                <Text variant="xs" classes={`text-left ${mutedTextClass}`}>
                  {team.conference}
                </Text>
                <Text variant="xs" classes={`text-left ${mutedTextClass}`}>
                  {team.status}
                </Text>
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
};
