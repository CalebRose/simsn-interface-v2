import { useEffect, useMemo, useState } from "react";
import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { Input, ToggleSwitch } from "../../_design/Inputs";
import { Modal } from "../../_design/Modal";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import { getFBAWeekID, getHCKWeekID } from "../../_helper/statsPageHelper";
import { AdminService } from "../../_services/adminService";
import { DraftService } from "../../_services/draftService";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { phaseCountByLeague, weekByPhase } from "./helper/adminHelper";

type ToggleDef = { key: string; label: string };

const footballToggles: ToggleDef[] = [
  { key: "CFBSpringGames", label: "CFB Spring Games" },
  { key: "NFLPreseason", label: "NFL Preseason" },
  { key: "ThursdayGames", label: "Thursday Games" },
  { key: "FridayGames", label: "Friday Games" },
  { key: "SaturdayMorning", label: "Saturday Morning" },
  { key: "SaturdayNoon", label: "Saturday Noon" },
  { key: "SaturdayEvening", label: "Saturday Evening" },
  { key: "SaturdayNight", label: "Saturday Night" },
  { key: "NFLThursday", label: "NFL Thursday" },
  { key: "NFLSundayNoon", label: "NFL Sunday Noon" },
  { key: "NFLSundayAfternoon", label: "NFL Sunday Afternoon" },
  { key: "NFLSundayEvening", label: "NFL Sunday Evening" },
  { key: "NFLMondayEvening", label: "NFL Monday Evening" },
];

const gamesToggles: ToggleDef[] = [
  { key: "IsPreseason", label: "Is Preseason" },
  { key: "GamesARan", label: "Games A Ran" },
  { key: "GamesBRan", label: "Games B Ran" },
  { key: "GamesCRan", label: "Games C Ran" },
  { key: "GamesDRan", label: "Games D Ran" },
];

interface TimestampDraft {
  Phase: number;
  Week: number;
  WeekID: number;
  SeasonID: number;
  SalaryCap: number;
  toggles: Record<string, boolean>;
}

const isFootball = (league: League) => league === SimCFB || league === SimNFL;
const isBasketball = (league: League) => league === SimCBB || league === SimNBA;
const isHockey = (league: League) => league === SimCHL || league === SimPHL;
const isProLeague = (league: League) =>
  league === SimNFL || league === SimNBA || league === SimPHL;

const computeWeekID = (league: League, week: number, seasonID: number) =>
  isHockey(league)
    ? getHCKWeekID(week, seasonID)
    : getFBAWeekID(week, seasonID);

const readDraft = (league: League, ts: any): TimestampDraft | null => {
  if (!ts) return null;
  const pro = isProLeague(league);
  let week = 0;
  let weekID = 0;
  let seasonID = 0;
  if (isFootball(league)) {
    week = pro ? ts.NFLWeek : ts.CollegeWeek;
    weekID = pro ? ts.NFLWeekID : ts.CollegeWeekID;
    seasonID = pro ? ts.NFLSeasonID : ts.CollegeSeasonID;
  } else if (isBasketball(league)) {
    week = pro ? ts.NBAWeek : ts.CollegeWeek;
    weekID = pro ? ts.NBAWeekID : ts.CollegeWeekID;
    seasonID = ts.SeasonID;
  } else {
    week = ts.Week;
    weekID = ts.WeekID;
    seasonID = ts.SeasonID;
  }

  const salaryCap =
    pro ? (ts.Y1Capspace ?? ts.SalaryCap ?? 0) : 0;

  const toggleDefs = isFootball(league) ? footballToggles : gamesToggles;
  const toggles: Record<string, boolean> = {};
  toggleDefs.forEach(({ key }) => {
    const source =
      key === "IsPreseason" && isBasketball(league) ? "NBAPreseason" : key;
    toggles[key] = Boolean(ts[source]);
  });

  return {
    Phase: ts.Phase ?? 0,
    Week: week ?? 0,
    WeekID: weekID ?? 0,
    SeasonID: seasonID ?? 0,
    SalaryCap: salaryCap,
    toggles,
  };
};

const compRoundOptions = [
  { value: "1", label: "Round 1" },
  { value: "2", label: "Round 2" },
  { value: "3", label: "Round 3" },
  { value: "4", label: "Round 4" },
  { value: "5", label: "Round 5" },
  { value: "6", label: "Round 6" },
  { value: "7", label: "Round 7" },
];

export const AdminStatesTab = () => {
  const { selectedLeague } = useLeagueStore();
  const {
    cfb_Timestamp,
    setCFB_Timestamp,
    nflTeams,
    nflDraftPicks,
    setNFLDraftPicks,
  } = useSimFBAStore();
  const { hck_Timestamp } = useSimHCKStore();
  const { cbb_Timestamp } = useSimBBAStore();

  const league = selectedLeague as League;
  const timestamp: any = isFootball(league)
    ? cfb_Timestamp
    : isBasketball(league)
      ? cbb_Timestamp
      : isHockey(league)
        ? hck_Timestamp
        : null;

  const initial = useMemo(
    () => readDraft(league, timestamp),
    [league, timestamp],
  );
  const [draft, setDraft] = useState<TimestampDraft | null>(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunningGames, setIsRunningGames] = useState(false);
  const [runGamesTriggered, setRunGamesTriggered] = useState(
    Boolean(cfb_Timestamp?.RunGames),
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Compensatory Draft Pick Modal State
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compTeamID, setCompTeamID] = useState<number>(0);
  const [compYear, setCompYear] = useState<number>(cfb_Timestamp?.Season ?? 2026);
  const [compRound, setCompRound] = useState<number>(3);
  const [compPickNumber, setCompPickNumber] = useState<number>(33);
  const [isSubmittingComp, setIsSubmittingComp] = useState(false);
  const [compMessage, setCompMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setDraft(initial);
  }, [initial]);

  useEffect(() => {
    setRunGamesTriggered(Boolean(cfb_Timestamp?.RunGames));
  }, [cfb_Timestamp?.RunGames]);

  const toggleDefs = isFootball(league) ? footballToggles : gamesToggles;

  const phaseOptions = useMemo(() => {
    const count = phaseCountByLeague(league);
    return Array.from({ length: count }, (_, i) => {
      const phase = i + 1;
      return {
        value: phase.toString(),
        label: `Phase ${phase} (Week ${weekByPhase(phase, league)})`,
      };
    });
  }, [league]);

  const teamOptions = useMemo(() => {
    if (!nflTeams || nflTeams.length === 0) return [];
    return [...nflTeams]
      .sort((a, b) => a.TeamName.localeCompare(b.TeamName))
      .map((t) => ({
        value: t.ID.toString(),
        label: `${t.TeamName} ${t.Mascot}`,
      }));
  }, [nflTeams]);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initial),
    [draft, initial],
  );

  if (!draft || !initial) {
    return (
      <div className="flex w-full p-4">
        <Text variant="body">
          Timestamp data is not available for {selectedLeague}.
        </Text>
      </div>
    );
  }

  const changePhase = (phase: number) => {
    const week = weekByPhase(phase, league);
    setDraft({
      ...draft,
      Phase: phase,
      Week: week,
      WeekID: computeWeekID(league, week, draft.SeasonID),
    });
  };

  const changeSeason = (seasonID: number) => {
    setDraft({
      ...draft,
      SeasonID: seasonID,
      WeekID: computeWeekID(league, draft.Week, seasonID),
    });
  };

  const changeSalaryCap = (salaryCap: number) => {
    setDraft({
      ...draft,
      SalaryCap: salaryCap,
    });
  };

  const changeToggle = (key: string, value: boolean) => {
    setDraft({ ...draft, toggles: { ...draft.toggles, [key]: value } });
  };

  const save = async () => {
    setIsSaving(true);
    setMessage(null);
    const dto: any = {
      WeekID: draft.WeekID,
      Week: draft.Week,
      SeasonID: draft.SeasonID,
      Phase: draft.Phase,
      ...draft.toggles,
    };
    if (isProLeague(league)) {
      dto.SalaryCap = Number(draft.SalaryCap);
      dto.Y1Capspace = Number(draft.SalaryCap);
    }
    try {
      if (isFootball(league)) {
        await AdminService.FBAUpdateTimestamp(dto);
        if (setCFB_Timestamp && cfb_Timestamp) {
          setCFB_Timestamp({
            ...cfb_Timestamp,
            ...dto,
            Y1Capspace: Number(draft.SalaryCap),
            SalaryCap: Number(draft.SalaryCap),
          });
        }
      } else if (isBasketball(league)) {
        await AdminService.BBAUpdateTimestamp(dto);
      } else {
        await AdminService.HCKUpdateTimestamp(dto);
      }
      setMessage({ type: "success", text: "Timestamp updated." });
    } catch (e) {
      setMessage({
        type: "error",
        text: `Failed to update timestamp: ${e instanceof Error ? e.message : e}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const runThisWeeksGames = async () => {
    setIsRunningGames(true);
    setMessage(null);
    try {
      const updatedTS = await AdminService.FBARunTheGames();
      setRunGamesTriggered(Boolean(updatedTS?.RunGames ?? true));
      setMessage({
        type: "success",
        text: "This week's CFB and NFL games have been triggered to run on the backend.",
      });
    } catch (e) {
      setMessage({
        type: "error",
        text: `Failed to run this week's games: ${e instanceof Error ? e.message : e}`,
      });
    } finally {
      setIsRunningGames(false);
    }
  };

  const nextGameSlot = useMemo(() => {
    if (!draft?.toggles) return null;
    if (!draft.toggles.GamesARan) return "A";
    if (!draft.toggles.GamesBRan) return "B";
    if (!draft.toggles.GamesCRan) return "C";
    if (!draft.toggles.GamesDRan) return "D";
    return null;
  }, [draft?.toggles]);

  const runNextSetOfGames = async () => {
    if (!nextGameSlot) return;
    const slot = nextGameSlot;
    setIsRunningGames(true);
    setMessage(null);
    try {
      const nextToggles = { ...draft.toggles };
      if (slot === "A") nextToggles.GamesARan = true;
      else if (slot === "B") nextToggles.GamesBRan = true;
      else if (slot === "C") nextToggles.GamesCRan = true;
      else if (slot === "D") nextToggles.GamesDRan = true;

      const dto: any = {
        WeekID: draft.WeekID,
        Week: draft.Week,
        SeasonID: draft.SeasonID,
        Phase: draft.Phase,
        ...nextToggles,
      };
      if (isProLeague(league)) {
        dto.SalaryCap = Number(draft.SalaryCap);
        dto.Y1Capspace = Number(draft.SalaryCap);
      }

      if (isBasketball(league)) {
        await AdminService.BBARunNextGames(slot);
        await AdminService.BBAUpdateTimestamp(dto);
      } else {
        await AdminService.HCKRunNextGames(slot);
        await AdminService.HCKUpdateTimestamp(dto);
      }

      setDraft({
        ...draft,
        toggles: nextToggles,
      });

      setMessage({
        type: "success",
        text: `Set ${slot} games for ${league} have been run! Games ${slot} Ran toggle updated.`,
      });
    } catch (e) {
      setMessage({
        type: "error",
        text: `Failed to run Set ${slot} games: ${e instanceof Error ? e.message : e}`,
      });
    } finally {
      setIsRunningGames(false);
    }
  };

  const handleOpenCompModal = () => {
    const defaultYear =
      cfb_Timestamp?.Season ??
      (draft?.SeasonID ? draft.SeasonID + 2020 : 2026);
    setCompYear(defaultYear);
    if (teamOptions.length > 0 && !compTeamID) {
      setCompTeamID(Number(teamOptions[0].value));
    }
    setCompRound(3);
    setCompPickNumber(33);
    setCompMessage(null);
    setIsCompModalOpen(true);
  };

  const handleSaveCompPick = async () => {
    if (!compTeamID) {
      setCompMessage({ type: "error", text: "Please select a team." });
      return;
    }
    if (!compRound || compRound < 1 || compRound > 7) {
      setCompMessage({ type: "error", text: "Round must be between 1 and 7." });
      return;
    }
    if (!compPickNumber || compPickNumber < 1) {
      setCompMessage({
        type: "error",
        text: "Pick number within the round must be at least 1.",
      });
      return;
    }

    setIsSubmittingComp(true);
    setCompMessage(null);
    try {
      const createdPick = await DraftService.AddCompensatoryDraftPick({
        TeamID: compTeamID,
        Season: compYear,
        SeasonID: compYear > 2020 ? compYear - 2020 : compYear,
        DraftRound: compRound,
        DraftNumber: compPickNumber,
      });

      if (setNFLDraftPicks && createdPick) {
        setNFLDraftPicks([...(nflDraftPicks || []), createdPick]);
      }

      setCompMessage({
        type: "success",
        text: `Successfully added compensatory pick: Round ${compRound}, Pick #${compPickNumber}!`,
      });
      setTimeout(() => {
        setIsCompModalOpen(false);
      }, 1500);
    } catch (e) {
      setCompMessage({
        type: "error",
        text: `Failed to add comp pick: ${e instanceof Error ? e.message : e}`,
      });
    } finally {
      setIsSubmittingComp(false);
    }
  };

  const selectedPhase = phaseOptions.find(
    (o) => o.value === draft.Phase.toString(),
  );

  return (
    <div className="flex flex-col w-full gap-y-6 p-4">
      <div className="flex flex-col gap-y-3">
        <Text variant="h6">{selectedLeague} Timestamp</Text>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <div className="flex flex-col gap-y-1">
            <Text variant="small" classes="text-gray-400">
              Phase
            </Text>
            <SelectDropdown
              options={phaseOptions}
              value={selectedPhase ?? null}
              onChange={(option) => option && changePhase(Number(option.value))}
            />
          </div>
          <Input
            type="number"
            label="Season ID"
            min={1}
            value={draft.SeasonID}
            onChange={(e) => changeSeason(Number(e.target.value) || 0)}
          />
          {isProLeague(league) && (
            <Input
              type="number"
              label="Salary Cap ($M)"
              min={0}
              step="0.5"
              value={draft.SalaryCap}
              onChange={(e) => changeSalaryCap(Number(e.target.value) || 0)}
            />
          )}
          <Input label="Week" value={draft.Week} readOnly disabled />
          <Input label="Week ID" value={draft.WeekID} readOnly disabled />
        </div>
      </div>

      <div className="flex flex-col gap-y-3">
        <Text variant="h6">Toggles</Text>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {toggleDefs.map(({ key, label }) => (
            <div
              key={key}
              className="              flex items-center justify-start gap-x-3"
            >
              <Text variant="body-small">{label}</Text>
              <ToggleSwitch
                checked={draft.toggles[key]}
                onChange={(value) => changeToggle(key, value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-y-2">
        <ButtonGroup>
          <Button onClick={save} disabled={!isDirty || isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            variant="secondaryOutline"
            onClick={() => setDraft(initial)}
            disabled={!isDirty || isSaving}
          >
            Reset
          </Button>
          {isFootball(league) && isProLeague(league) && (
            <Button variant="secondaryOutline" onClick={handleOpenCompModal}>
              Add a Comp Pick
            </Button>
          )}
          {isFootball(league) ? (
            <Button
              variant="primary"
              onClick={runThisWeeksGames}
              disabled={isRunningGames || runGamesTriggered}
            >
              {isRunningGames
                ? "Starting Games..."
                : runGamesTriggered
                  ? "This Week's Games Running / Queued"
                  : "Run This Weeks Games"}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={runNextSetOfGames}
              disabled={isRunningGames || !nextGameSlot}
            >
              {isRunningGames
                ? `Running Set ${nextGameSlot}...`
                : nextGameSlot
                  ? `Run Next Set of Games (${nextGameSlot})`
                  : "All Game Sets Complete"}
            </Button>
          )}
        </ButtonGroup>
        {message && (
          <Text
            variant="body-small"
            classes={
              message.type === "success" ? "text-green-400" : "text-red-400"
            }
          >
            {message.text}
          </Text>
        )}
      </div>

      {/* Add Compensatory Draft Pick Modal */}
      {isCompModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCompModalOpen(false)}
          title="Add Compensatory Draft Pick"
          actions={
            <ButtonGroup>
              <Button
                variant="secondaryOutline"
                onClick={() => setIsCompModalOpen(false)}
                disabled={isSubmittingComp}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveCompPick}
                disabled={isSubmittingComp || !compTeamID}
              >
                {isSubmittingComp ? "Adding..." : "Add Pick"}
              </Button>
            </ButtonGroup>
          }
        >
          <div className="flex flex-col gap-y-4 p-2">
            <Text variant="body-small" classes="text-gray-400">
              Add a compensatory pick to the draft order for a designated NFL team.
            </Text>

            <div className="flex flex-col gap-y-1">
              <Text variant="small" classes="text-gray-400">
                Team
              </Text>
              <SelectDropdown
                options={teamOptions}
                value={
                  teamOptions.find((o) => o.value === compTeamID.toString()) ??
                  null
                }
                onChange={(opt) => opt && setCompTeamID(Number(opt.value))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                type="number"
                label="Year"
                min={2020}
                value={compYear}
                onChange={(e) => setCompYear(Number(e.target.value) || 2026)}
              />

              <div className="flex flex-col gap-y-1">
                <Text variant="small" classes="text-gray-400">
                  Round
                </Text>
                <SelectDropdown
                  options={compRoundOptions}
                  value={
                    compRoundOptions.find(
                      (r) => r.value === compRound.toString(),
                    ) ?? null
                  }
                  onChange={(opt) => opt && setCompRound(Number(opt.value))}
                />
              </div>

              <Input
                type="number"
                label="Pick in Round"
                min={1}
                value={compPickNumber}
                onChange={(e) => setCompPickNumber(Number(e.target.value) || 1)}
              />
            </div>

            {compMessage && (
              <Text
                variant="body-small"
                classes={
                  compMessage.type === "success"
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {compMessage.text}
              </Text>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
