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
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import { getFBAWeekID, getHCKWeekID } from "../../_helper/statsPageHelper";
import { AdminService } from "../../_services/adminService";
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
    toggles,
  };
};

export const AdminStatesTab = () => {
  const { selectedLeague } = useLeagueStore();
  const { cfb_Timestamp } = useSimFBAStore();
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
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setDraft(initial);
  }, [initial]);

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
    try {
      if (isFootball(league)) {
        await AdminService.FBAUpdateTimestamp(dto);
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
              onChange={(option) =>
                option && changePhase(Number(option.value))
              }
            />
          </div>
          <Input
            type="number"
            label="Season ID"
            min={1}
            value={draft.SeasonID}
            onChange={(e) => changeSeason(Number(e.target.value) || 0)}
          />
          <Input label="Week" value={draft.Week} readOnly disabled />
          <Input label="Week ID" value={draft.WeekID} readOnly disabled />
        </div>
      </div>

      <div className="flex flex-col gap-y-3">
        <Text variant="h6">Toggles</Text>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {toggleDefs.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-x-4">
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
    </div>
  );
};
