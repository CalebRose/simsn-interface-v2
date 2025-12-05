import { FC, useEffect, useMemo, useState } from "react";
import { League, SimCBB, SimCFB, SimCHL } from "../../../_constants/constants";
import {
  CollegeGame as HCKCollegeGame,
  CollegePollSubmission as HockeyPollSubmission,
  CollegeStandings as HockeyStandings,
  CollegeTeam as HockeyTeam,
  Timestamp as HCKTimestamp,
} from "../../../models/hockeyModels";
import { Modal } from "../../../_design/Modal";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import { SelectDropdown } from "../../../_design/Select";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { getLogo } from "../../../_utility/getLogo";
import { Logo } from "../../../_design/Logo";
import { useAuthStore } from "../../../context/AuthContext";
import {
  CollegePollSubmission as BasketballPollSubmission,
  CollegeStandings as BBCollegeStandings,
  Match,
  Team,
  Timestamp as BBATimestamp,
} from "../../../models/basketballModels";
import { useSimBBAStore } from "../../../context/SimBBAContext";
import {
  CollegeGame,
  CollegePollSubmission,
  CollegeStandings,
  CollegeTeam,
  Timestamp as FBATimestamp,
} from "../../../models/footballModels";
import { useSimFBAStore } from "../../../context/SimFBAContext";

interface SubmitPollModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: League;
  teamMap?: any;
  standingsMap?: any;
  pollSubmission?: any;
  submitPoll: (dto: any) => Promise<void>;
  timestamp: any;
}

export const SubmitPollModal: FC<SubmitPollModalProps> = ({
  league,
  isOpen,
  onClose,
  pollSubmission,
  submitPoll,
  timestamp,
}) => {
  return (
    <>
      {league === SimCHL && (
        <SubmitHockeyPoll
          isOpen={isOpen}
          onClose={onClose}
          pollSubmission={pollSubmission}
          submitPoll={submitPoll}
          timestamp={timestamp}
        />
      )}
      {league === SimCBB && (
        <SubmitBasketballPoll
          isOpen={isOpen}
          onClose={onClose}
          pollSubmission={pollSubmission}
          submitPoll={submitPoll}
          timestamp={timestamp}
        />
      )}
      {league === SimCFB && (
        <SubmitFootballPoll
          isOpen={isOpen}
          onClose={onClose}
          pollSubmission={pollSubmission}
          submitPoll={submitPoll}
          timestamp={timestamp}
        />
      )}
    </>
  );
};

interface PollDropdownProps {
  idx: number;
  label: string;
  list: any[];
  selection: any;
  setSelection: (opts: any) => void;
  standingsMap: any;
  gameMap: any;
  teamMap: any;
  league: League;
}

const PollDropdown: FC<PollDropdownProps> = ({
  idx,
  league,
  label,
  list,
  selection,
  setSelection,
  standingsMap,
  gameMap,
  teamMap,
}) => {
  const selectedTeam = useMemo(() => {
    if (!selection) {
      return null;
    }
    return teamMap[selection.value];
  }, [selection, teamMap]);

  const selectedTeamName = useMemo(() => {
    if (!selectedTeam) {
      return "";
    }
    if (league === SimCHL) {
      let team = selectedTeam as HockeyTeam;
      return team.TeamName;
    } else if (league === SimCFB) {
      let team = selectedTeam as CollegeTeam;
      return team.TeamName;
    }
    if (league === SimCBB) {
      let team = selectedTeam as Team;
      return team.Team;
    }
    return "";
  }, [selectedTeam]);

  const selectionLabel = useMemo(() => {
    if (!selection) return "";
    if (league === SimCHL && selection.value > 0) {
      const standings = standingsMap[selection.value] as HockeyStandings;
      if (standings) {
        return `${standings.TotalWins} Wins | ${standings.TotalLosses} Losses | ${standings.TotalOTLosses} OT Losses | ${standings.ConferenceWins} Conference Wins | ${standings.ConferenceLosses} Losses | ${standings.ConferenceOTLosses} C.OT Losses`;
      }
    }
    if (league === SimCBB && selection.value > 0) {
      const standings = standingsMap[selection.value] as BBCollegeStandings;
      if (standings) {
        return `${standings.TotalWins} Wins | ${standings.TotalLosses} Losses | ${standings.ConferenceWins} Conference Wins | ${standings.ConferenceLosses} Losses`;
      }
    }
    if (league === SimCFB && selection.value > 0) {
      const standings = standingsMap[selection.value] as CollegeStandings;
      if (standings) {
        return `${standings.TotalWins} Wins | ${standings.TotalLosses} Losses | ${standings.ConferenceWins} Conference Wins | ${standings.ConferenceLosses} Losses`;
      }
    }
    return "";
  }, [league, selection, standingsMap]);

  const teamLogo = useMemo(() => {
    if (!selectedTeam) return "";
    return getLogo(league, selectedTeam.ID, false);
  }, [selectedTeam]);

  const lastPlayedGame = useMemo(() => {
    if (!selection) return "";
    if (league === SimCHL && selection.value > 0) {
      const games = gameMap[selection.value];
    }
    if (league === SimCFB && selection.value > 0) {
      const games = gameMap[selection.value];
    }
  }, [selection, gameMap]);

  const ChangeSelection = (opts: any) => {
    setSelection(opts);
  };

  return (
    <div className="flex flex-col mb-2 min-h-[5rem]">
      <div className="flex flex-row space-x-4">
        <h5 className="text-start align-middle">{label}</h5>
        {selectedTeam && <Logo url={teamLogo} variant="tiny" />}
        <h5>{selectedTeam && `: ${selectedTeamName}`}</h5>
      </div>

      <h6 className="text-start align-middle">{selectionLabel}</h6>
      <SelectDropdown
        value={selection}
        options={list}
        onChange={ChangeSelection}
      />
    </div>
  );
};

interface SubmitHockeyPollProps {
  isOpen: boolean;
  onClose: () => void;
  pollSubmission?: HockeyPollSubmission;
  submitPoll: (dto: HockeyPollSubmission) => Promise<void>;
  timestamp: HCKTimestamp;
}

export const SubmitHockeyPoll: FC<SubmitHockeyPollProps> = ({
  isOpen,
  onClose,
  pollSubmission,
  submitPoll,
  timestamp,
}) => {
  const {
    chlTeamOptions,
    chlTeamMap,
    chlStandingsMap,
    currentCollegeSeasonGames,
  } = useSimHCKStore();

  const { currentUser } = useAuthStore();

  const gameMap = useMemo(() => {
    const currentGameMap: Record<number, HCKCollegeGame[]> = {};
    for (let i = 0; i < currentCollegeSeasonGames.length; i++) {
      const game = currentCollegeSeasonGames[i];
      if (!game.GameComplete) continue;
      if (!currentGameMap[game.HomeTeamID]) {
        currentGameMap[game.HomeTeamID] = [game];
      } else {
        currentGameMap[game.HomeTeamID].push(game);
      }
      if (!currentGameMap[game.AwayTeamID]) {
        currentGameMap[game.AwayTeamID] = [game];
      } else {
        currentGameMap[game.AwayTeamID].push(game);
      }
    }
    return currentGameMap;
  }, [currentCollegeSeasonGames]);
  const [validPoll, setValidPoll] = useState(true);
  const [ranks, setRanks] = useState<{ label: string; value: string }[]>(
    Array.from({ length: 20 }, () => ({ label: "Select", value: "0" }))
  );

  const updateRank = (
    index: number,
    newValue: { label: string; value: string }
  ) => {
    setRanks((prevRanks) => {
      const updated = [...prevRanks];
      updated[index] = newValue;
      return updated;
    });
  };

  useEffect(() => {
    const seen = new Set();
    let isValid = true;
    for (const rank of ranks) {
      if (seen.has(rank.value)) {
        isValid = false;
        break;
      }
      seen.add(rank.value);
    }
    setValidPoll(isValid);
  }, [ranks]);

  const submit = async () => {
    const dto: any = {
      ID: pollSubmission!.ID,
      Week: Number(timestamp.Week) + 1,
      WeekID: Number(timestamp.WeekID) + 1,
      SeasonID: timestamp.SeasonID,
      Username: currentUser!.username,
    };
    for (let i = 0; i < ranks.length; i++) {
      const num = i + 1;
      const rank = ranks[i];
      dto[`Rank${num}`] = rank.label;
      dto[`Rank${num}ID`] = Number(rank.value);
    }
    await submitPoll(dto as HockeyPollSubmission);
    onClose();
  };
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Submit SimCHL Poll`}
        maxWidth="max-w-[80rem]"
        actions={
          <>
            <ButtonGroup>
              <Button size="sm" disabled={!validPoll} onClick={submit}>
                <Text variant="small">Submit</Text>
              </Button>
            </ButtonGroup>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto max-h-[30rem]">
          {ranks.map((x, idx) => (
            <PollDropdown
              key={`rank-${idx + 1}`}
              label={`Rank ${idx + 1}`}
              list={chlTeamOptions}
              teamMap={chlTeamMap}
              league={SimCHL}
              idx={idx}
              selection={x}
              setSelection={(value) => updateRank(idx, value)}
              standingsMap={chlStandingsMap}
              gameMap={gameMap}
            />
          ))}
        </div>
      </Modal>
    </>
  );
};

interface SubmitBasketballPollProps {
  isOpen: boolean;
  onClose: () => void;
  pollSubmission?: BasketballPollSubmission;
  submitPoll: (dto: BasketballPollSubmission) => Promise<void>;
  timestamp: BBATimestamp;
}

export const SubmitBasketballPoll: FC<SubmitBasketballPollProps> = ({
  isOpen,
  onClose,
  pollSubmission,
  submitPoll,
  timestamp,
}) => {
  const {
    cbbTeamOptions,
    cbbTeamMap,
    cbbStandingsMap,
    currentCollegeSeasonGames,
  } = useSimBBAStore();

  const { currentUser } = useAuthStore();

  const gameMap = useMemo(() => {
    const currentGameMap: Record<number, Match[]> = {};
    for (let i = 0; i < currentCollegeSeasonGames.length; i++) {
      const game = currentCollegeSeasonGames[i];
      if (!game.GameComplete) continue;
      if (!currentGameMap[game.HomeTeamID]) {
        currentGameMap[game.HomeTeamID] = [game];
      } else {
        currentGameMap[game.HomeTeamID].push(game);
      }
      if (!currentGameMap[game.AwayTeamID]) {
        currentGameMap[game.AwayTeamID] = [game];
      } else {
        currentGameMap[game.AwayTeamID].push(game);
      }
    }
    return currentGameMap;
  }, [currentCollegeSeasonGames]);
  const [validPoll, setValidPoll] = useState(true);
  const [ranks, setRanks] = useState<{ label: string; value: string }[]>(
    Array.from({ length: 25 }, () => ({ label: "Select", value: "0" }))
  );

  const updateRank = (
    index: number,
    newValue: { label: string; value: string }
  ) => {
    setRanks((prevRanks) => {
      const updated = [...prevRanks];
      updated[index] = newValue;
      return updated;
    });
  };

  useEffect(() => {
    const seen = new Set();
    let isValid = true;
    for (const rank of ranks) {
      if (seen.has(rank.value)) {
        isValid = false;
        break;
      }
      seen.add(rank.value);
    }
    setValidPoll(isValid);
  }, [ranks]);

  const submit = async () => {
    const dto: any = {
      ID: pollSubmission!.ID,
      Week: Number(timestamp.CollegeWeek) + 1,
      WeekID: Number(timestamp.CollegeWeekID) + 1,
      SeasonID: timestamp.SeasonID,
      Username: currentUser!.username,
    };
    for (let i = 0; i < ranks.length; i++) {
      const num = i + 1;
      const rank = ranks[i];
      dto[`Rank${num}`] = rank.label;
      dto[`Rank${num}ID`] = Number(rank.value);
    }
    await submitPoll(dto as BasketballPollSubmission);
    onClose();
  };
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Submit SimCBB Poll`}
        maxWidth="max-w-[80rem]"
        actions={
          <>
            <ButtonGroup>
              <Button size="sm" disabled={!validPoll} onClick={submit}>
                <Text variant="small">Submit</Text>
              </Button>
            </ButtonGroup>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto max-h-[30rem]">
          {ranks.map((x, idx) => (
            <PollDropdown
              key={`rank-${idx + 1}`}
              label={`Rank ${idx + 1}`}
              list={cbbTeamOptions}
              teamMap={cbbTeamMap}
              league={SimCBB}
              idx={idx}
              selection={x}
              setSelection={(value) => updateRank(idx, value)}
              standingsMap={cbbStandingsMap}
              gameMap={gameMap}
            />
          ))}
        </div>
      </Modal>
    </>
  );
};

interface SubmitFootballPollProps {
  isOpen: boolean;
  onClose: () => void;
  pollSubmission?: CollegePollSubmission;
  submitPoll: (dto: CollegePollSubmission) => Promise<void>;
  timestamp: FBATimestamp;
}

export const SubmitFootballPoll: FC<SubmitFootballPollProps> = ({
  isOpen,
  onClose,
  pollSubmission,
  submitPoll,
  timestamp,
}) => {
  const {
    cfbTeamOptions,
    cfbTeamMap,
    cfbStandingsMap,
    currentCollegeSeasonGames,
  } = useSimFBAStore();

  const { currentUser } = useAuthStore();

  const gameMap = useMemo(() => {
    const currentGameMap: Record<number, CollegeGame[]> = {};
    for (let i = 0; i < currentCollegeSeasonGames.length; i++) {
      const game = currentCollegeSeasonGames[i];
      if (!game.GameComplete) continue;
      if (!currentGameMap[game.HomeTeamID]) {
        currentGameMap[game.HomeTeamID] = [game];
      } else {
        currentGameMap[game.HomeTeamID].push(game);
      }
      if (!currentGameMap[game.AwayTeamID]) {
        currentGameMap[game.AwayTeamID] = [game];
      } else {
        currentGameMap[game.AwayTeamID].push(game);
      }
    }
    return currentGameMap;
  }, [currentCollegeSeasonGames]);
  const [validPoll, setValidPoll] = useState(true);
  const [ranks, setRanks] = useState<{ label: string; value: string }[]>(
    Array.from({ length: 25 }, () => ({ label: "Select", value: "0" }))
  );

  const updateRank = (
    index: number,
    newValue: { label: string; value: string }
  ) => {
    setRanks((prevRanks) => {
      const updated = [...prevRanks];
      updated[index] = newValue;
      return updated;
    });
  };

  useEffect(() => {
    const seen = new Set();
    let isValid = true;
    for (const rank of ranks) {
      if (seen.has(rank.value)) {
        isValid = false;
        break;
      }
      seen.add(rank.value);
    }
    setValidPoll(isValid);
  }, [ranks]);

  const submit = async () => {
    let id = 0;
    if (pollSubmission) {
      id = pollSubmission.ID;
    }
    const dto: any = {
      ID: id,
      Week: Number(timestamp.CollegeWeek) + 1,
      WeekID: Number(timestamp.CollegeWeekID) + 1,
      SeasonID: timestamp.CollegeSeasonID,
      Username: currentUser!.username,
    };
    for (let i = 0; i < ranks.length; i++) {
      const num = i + 1;
      const rank = ranks[i];
      dto[`Rank${num}`] = rank.label;
      dto[`Rank${num}ID`] = Number(rank.value);
    }
    await submitPoll(dto as CollegePollSubmission);
    onClose();
  };
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Submit SimCFB Poll`}
        maxWidth="max-w-[80rem]"
        actions={
          <>
            <ButtonGroup>
              <Button size="sm" disabled={!validPoll} onClick={submit}>
                <Text variant="small">Submit</Text>
              </Button>
            </ButtonGroup>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto max-h-[30rem]">
          {ranks.map((x, idx) => (
            <PollDropdown
              key={`rank-${idx + 1}`}
              label={`Rank ${idx + 1}`}
              list={cfbTeamOptions}
              teamMap={cfbTeamMap}
              league={SimCFB}
              idx={idx}
              selection={x}
              setSelection={(value) => updateRank(idx, value)}
              standingsMap={cfbStandingsMap}
              gameMap={gameMap}
            />
          ))}
        </div>
      </Modal>
    </>
  );
};
