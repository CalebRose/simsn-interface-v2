import { FC, useMemo, useState } from "react";
import { Modal } from "../../_design/Modal";
import {
  Button,
  ButtonGrid,
  ButtonGroup,
  PillButton,
} from "../../_design/Buttons";
import { Text } from "../../_design/Typography";
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
} from "../../_constants/constants";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { Logo } from "../../_design/Logo";
import { getLogo } from "../../_utility/getLogo";

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
  const backgroundColor = "#1f2937";
  const teamRows = useMemo(() => {
    if (selectedLeague === SimCFB) {
      const sortedCfbTeams = cfbTeams.sort(
        (a, b) => a.ConferenceID - b.ConferenceID
      );
      return sortedCfbTeams.map((team) => {
        return {
          Logo: team.ID,
          Team: `${team.TeamName} ${team.Mascot}`,
          Conference: team.Conference,
          Coach:
            team.Coach !== "AI" && team.Coach !== "" ? team.Coach : "Available",
        };
      });
    }
    if (selectedLeague === SimNFL) {
      const sortedNFLTeams = nflTeams.sort(
        (a, b) => a.ConferenceID - b.ConferenceID
      );
      return sortedNFLTeams.map((team) => {
        return {
          Logo: team.ID,
          Team: `${team.TeamName} ${team.Mascot}`,
          Conference: team.Conference,
          Coach: team.NFLOwnerName,
        };
      });
    }
    if (selectedLeague === SimCBB) {
      const sortedSimCBBTeams = cbbTeams.sort(
        (a, b) => a.ConferenceID - b.ConferenceID
      );
      return sortedSimCBBTeams.map((team) => {
        return {
          Logo: team.ID,
          Team: `${team.Team} ${team.Nickname}`,
          Conference: team.Conference,
          Coach: team.IsUserCoached ? team.Coach : "Available",
        };
      });
    }
    if (selectedLeague === SimNBA) {
      const sortedSimNBATeams = nbaTeams.sort(
        (a, b) => a.ConferenceID - b.ConferenceID
      );
      return sortedSimNBATeams.map((team) => {
        return {
          Logo: team.ID,
          Team: `${team.Team} ${team.Nickname}`,
          Conference: team.Conference,
          Coach: team.NBAOwnerName.length > 0 ? team.NBAOwnerName : "Available",
        };
      });
    }
    if (selectedLeague === SimCHL) {
      const sortedSimCHLTeams = chlTeams.sort(
        (a, b) => a.ConferenceID - b.ConferenceID
      );
      return sortedSimCHLTeams.map((team) => {
        return {
          Logo: team.ID,
          Team: `${team.TeamName} ${team.Mascot}`,
          Conference: team.Conference,
          Coach: team.IsUserCoached ? team.Coach : "Available",
        };
      });
    }
    if (selectedLeague === SimPHL) {
      const sortedSimPHLTeams = phlTeams.sort(
        (a, b) => a.ConferenceID - b.ConferenceID
      );
      return sortedSimPHLTeams.map((team) => {
        return {
          Logo: team.ID,
          Team: `${team.TeamName} ${team.Mascot}`,
          Conference: team.Conference,
          Coach: team.Owner.length > 0 ? team.Owner : "Available",
        };
      });
    }
    return [];
  }, [
    selectedLeague,
    cfbTeams,
    nflTeams,
    cbbTeams,
    nbaTeams,
    chlTeams,
    phlTeams,
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
            <Button
              size="xs"
              variant={selectedLeague === SimCFB ? "primary" : "secondary"}
              onClick={() => setSelectedLeague(SimCFB)}
            >
              {SimCFB}
            </Button>
            <Button
              size="xs"
              variant={selectedLeague === SimNFL ? "primary" : "secondary"}
              onClick={() => setSelectedLeague(SimNFL)}
            >
              {SimNFL}
            </Button>
            <Button
              size="xs"
              variant={selectedLeague === SimCBB ? "primary" : "secondary"}
              onClick={() => setSelectedLeague(SimCBB)}
            >
              {SimCBB}
            </Button>
            <Button
              size="xs"
              variant={selectedLeague === SimNBA ? "primary" : "secondary"}
              onClick={() => setSelectedLeague(SimNBA)}
            >
              {SimNBA}
            </Button>
            <Button
              size="xs"
              variant={selectedLeague === SimCHL ? "primary" : "secondary"}
              onClick={() => setSelectedLeague(SimCHL)}
            >
              {SimCHL}
            </Button>
            <Button
              size="xs"
              variant={selectedLeague === SimPHL ? "primary" : "secondary"}
              onClick={() => setSelectedLeague(SimPHL)}
            >
              {SimPHL}
            </Button>
            <Button
              size="xs"
              variant={
                selectedLeague === SimCollegeBaseball ? "primary" : "secondary"
              }
              onClick={() => setSelectedLeague(SimCollegeBaseball)}
            >
              {SimCollegeBaseball}
            </Button>
            <Button
              size="xs"
              variant={selectedLeague === SimMLB ? "primary" : "secondary"}
              onClick={() => setSelectedLeague(SimMLB)}
            >
              {SimMLB}
            </Button>
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
              Coach
            </Text>
          </div>
        </div>
        <div className="max-h-[40vh] overflow-y-auto">
          {teamRows?.map((team) => {
            const url = getLogo(selectedLeague, team.Logo, false);
            return (
              <div
                className="grid grid-cols-4 gap-2 text-sm border-b py-2"
                key={`${team.Logo}${team.Team}${team.Conference}`}
              >
                <Logo url={url} variant="small" />
                <Text variant="xs" classes="text-left">
                  {team.Team}
                </Text>
                <Text variant="xs" classes="text-left">
                  {team.Conference}
                </Text>
                <Text variant="xs" classes="text-left">
                  {team.Coach}
                </Text>
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
};
