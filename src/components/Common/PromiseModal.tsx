import { FC, useMemo, useState, useEffect } from "react";
import { Text } from "../../_design/Typography";
import { SelectDropdown } from "../../_design/Select";
import { Modal } from "../../_design/Modal";
import { Button, ButtonGroup } from "../../_design/Buttons";
import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  USA,
} from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { CollegePlayerSeasonStats as HockeyPlayerSeasonStats } from "../../models/hockeyModels";
import { CollegePlayerSeasonStats as FootballPlayerSeasonStats } from "../../models/footballModels";
import { CollegePlayerSeasonStats as BasketballPlayerSeasonStats } from "../../models/basketballModels";
import { CSSObjectWithLabel, SingleValue } from "react-select";
import { SelectOption } from "../../_hooks/useSelectStyles";
import {
  getBBAPromiseWeight,
  getCFBPromiseWeight,
  getHCKPromiseWeight,
  getSimCBBTeamStateOptions,
  getSimCFBTeamStateOptions,
  getSimCHLTeamStateOptions,
} from "../../_helper/transferPortalHelper";
import Slider from "./Slider";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimBBAStore } from "../../context/SimBBAContext";

const CFB_OPTION_TYPES: { label: string; value: string }[] = [
  { label: "No Redshirt", value: "No Redshirt" },
  { label: "Snap Count", value: "Snap Count" },
  { label: "Wins", value: "Wins" },
  { label: "Bowl Game", value: "Bowl Game" },
  { label: "Home State Game", value: "Home State Game" },
  { label: "Conference Championship", value: "Conference Championship" },
  { label: "Playoffs", value: "Playoffs" },
  { label: "National Championship", value: "National Championship" },
  { label: "Good Gameplan Fit", value: "Good Gameplan Fit" },
  { label: "Not Bad Gameplan Fit", value: "Not Bad Gameplan Fit" },
];
const CBB_OPTION_TYPES: { label: string; value: string }[] = [
  { label: "No Redshirt", value: "No Redshirt" },
  { label: "Minutes", value: "Minutes" },
  { label: "Wins", value: "Wins" },
  { label: "Home State Game", value: "Home State Game" },
  { label: "Conference Championship", value: "Conference Championship" },
  { label: "Playoffs", value: "Playoffs" },
  { label: "Elite 8", value: "Elite 8" },
  { label: "Final Four", value: "Final Four" },
  { label: "National Championship", value: "National Championship" },
];
const CHL_OPTION_TYPES: { label: string; value: string }[] = [
  { label: "No Redshirt", value: "No Redshirt" },
  { label: "Time on Ice", value: "Time on Ice" },
  { label: "Wins", value: "Wins" },
  { label: "Home State Game", value: "Home State Game" },
  { label: "Conference Championship", value: "Conference Championship" },
  { label: "Playoffs", value: "Playoffs" },
  { label: "Frozen Four", value: "Frozen Four" },
  { label: "National Championship", value: "National Championship" },
];

interface PromiseModalProps {
  player: any;
  promise: any;
  isOpen: boolean;
  league: League;
  onClose: () => void;
  promisePlayer?: (dto: any) => Promise<void>;
}

export const PromiseModal: FC<PromiseModalProps> = ({
  player,
  promise,
  isOpen,
  league,
  onClose,
  promisePlayer,
}) => {
  const { chlTeams, chlTeam, chlPlayerSeasonStatsMap, hck_Timestamp } =
    useSimHCKStore();
  const { cfbTeams, cfbTeam } = useSimFBAStore();
  const { cbbTeams, cbbTeam } = useSimBBAStore();

  const [promiseType, setPromiseType] = useState(promise?.PromiseType || "");
  const [benchmark, setBenchmark] = useState(promise?.Benchmark || 0);
  const [benchmarkStr, setBenchmarkStr] = useState(promise?.BenchmarkStr || "");
  const [hasUserMadeChanges, setHasUserMadeChanges] = useState(false);

  // Reset state when promise prop changes
  useEffect(() => {
    setPromiseType(promise?.PromiseType || "");
    setBenchmark(promise?.Benchmark || 0);
    setBenchmarkStr(promise?.BenchmarkStr || "");
    setHasUserMadeChanges(false); // Reset the change flag when promise changes
  }, [promise]);
  // Need to memoize by league
  const promiseOptions: { label: string; value: string }[] = useMemo(() => {
    if (league === SimCFB) {
      return CFB_OPTION_TYPES;
    }
    if (league === SimCBB) {
      return CBB_OPTION_TYPES;
    }
    if (league === SimCHL) {
      return CHL_OPTION_TYPES;
    }
    return [];
  }, [league]);

  const title = useMemo(() => {
    return `Send Promise to ${player.Position} ${player.FirstName} ${player.LastName}`;
  }, [player]);
  const promiseWeight = useMemo(() => {
    // If we have an existing promise and user hasn't made changes, use its weight
    if (promise?.PromiseWeight && !hasUserMadeChanges) {
      return promise.PromiseWeight;
    }
    // Otherwise calculate it based on current inputs
    if (league === SimCHL) {
      return getHCKPromiseWeight(promiseType, benchmark);
    }
    if (league === SimCBB) {
      return getBBAPromiseWeight(promiseType, benchmark);
    }
    if (league === SimCFB) {
      return getCFBPromiseWeight(promiseType, benchmark);
    }
    return "";
  }, [league, promiseType, benchmark, promise, hasUserMadeChanges]);

  const minRange = useMemo(() => {
    return 0;
  }, []);

  const maxRange = useMemo(() => {
    if (promiseType === "Wins" && league === SimCHL) {
      return 34;
    }
    if (promiseType === "Wins" && league === SimCBB) {
      return 40;
    }
    if (promiseType === "Time on Ice") {
      return 20; // minutes per game
    }
    if (promiseType === "Minutes") {
      return 40; // minutes per game
    }
    if (promiseType === "Snap Count") {
      return 60; // snaps per game
    }
    return 100;
  }, [promiseType, league]);

  const errors: string[] = useMemo(() => {
    const list: string[] = [];
    if (promiseType === "") {
      list.push("Promise type must be selected.");
    }
    if (
      promiseType === "Wins" ||
      promiseType === "Snap Count" ||
      promiseType === "Time on Ice" ||
      promiseType === "Minutes" ||
      promiseType === "Snap Count"
    ) {
      if (benchmark < minRange || benchmark > maxRange) {
        list.push(`Benchmark must be between ${minRange} and ${maxRange}.`);
      }
    }

    if (promiseType === "Home State Game" && player.Country !== USA) {
      list.push(
        "Home State Game promise can only be made to players from the USA.",
      );
    }
    if (promiseType === "Conference Championship") {
      if (
        (league === SimCHL && chlTeam?.Conference === "Independent") ||
        (league === SimCFB && cfbTeam?.Conference === "Independent") ||
        (league === SimCBB && cbbTeam?.Conference === "Independent")
      ) {
        list.push(
          "Cannot make Conference Championship promise while coaching a team without a conference.",
        );
      }
    }
    if (
      promiseType === "No Redshirt" &&
      (player.IsRedshirt || player.IsRedshirting)
    ) {
      list.push(
        "Cannot make a redshirt promise to someone who already has or is redshirting.",
      );
    }
    return list;
  }, [
    league,
    chlTeam,
    cfbTeam,
    cbbTeam,
    promiseType,
    benchmark,
    benchmarkStr,
    maxRange,
    minRange,
  ]);

  const seasonStats = useMemo(() => {
    if (league === SimCHL) {
      if (player && chlPlayerSeasonStatsMap && hck_Timestamp) {
        const seasonStats = chlPlayerSeasonStatsMap[hck_Timestamp!.SeasonID];
        // Need to find by player.ID;
        if (!seasonStats) {
          return new HockeyPlayerSeasonStats();
        }
        const playerSeasonStatsIdx = seasonStats.findIndex(
          (s) => s.PlayerID === player.ID,
        );
        if (playerSeasonStatsIdx >= 0) {
          return seasonStats[playerSeasonStatsIdx];
        }

        return player.SeasonStats;
      }
      return new HockeyPlayerSeasonStats();
    }
    if (league === SimCFB) {
      if (player) {
        return player.SeasonStats;
      }
      return new FootballPlayerSeasonStats();
    }
    if (league === SimCBB) {
      if (player) {
        return player.SeasonStats;
      }
      return new BasketballPlayerSeasonStats();
    }
    return null;
  }, [league, player, hck_Timestamp, chlPlayerSeasonStatsMap]);

  const stateOptions = useMemo(() => {
    if (league === SimCHL) {
      return getSimCHLTeamStateOptions(chlTeams);
    }
    if (league === SimCFB) {
      return getSimCFBTeamStateOptions(cfbTeams);
    }
    if (league === SimCBB) {
      return getSimCBBTeamStateOptions(cbbTeams);
    }
  }, [league, chlTeams, cfbTeams, cbbTeams]);

  const ChangePromiseType = (options: SingleValue<SelectOption>) => {
    if (!options) return;
    setPromiseType(() => options.value);
    setBenchmark(() => 0);
    setHasUserMadeChanges(true); // Mark that user has made changes
  };

  const ChangeBenchmark = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setBenchmark(() => Number(value));
    setHasUserMadeChanges(true); // Mark that user has made changes
  };

  const ChangeBenchmarkStr = (options: SingleValue<SelectOption>) => {
    if (!options) return;
    setBenchmarkStr(() => options.value);
    setHasUserMadeChanges(true); // Mark that user has made changes
  };

  const action = async () => {
    if (promisePlayer) {
      const dto = {
        CollegePlayerID: player.ID,
        PromiseType: promiseType,
        PromiseWeight: promiseWeight,
        Benchmark: benchmark,
        BenchmarkStr: benchmarkStr,
        IsActive: true,
        TeamID:
          league === SimCHL
            ? chlTeam?.ID
            : league === SimCFB
              ? cfbTeam?.ID
              : cbbTeam?.ID,
      };
      await promisePlayer(dto);
    }
    onClose();
  };

  const timeOnIce = useMemo(() => {
    if (league !== SimCHL) return 0;
    if (seasonStats && seasonStats.TimeOnIce && seasonStats.GamesPlayed) {
      return (seasonStats.TimeOnIce / 60 / seasonStats.GamesPlayed).toFixed(2);
    }
    return 0;
  }, [seasonStats, league]);

  const penaltyMinutes = useMemo(() => {
    if (league !== SimCHL) return 0;
    if (seasonStats && seasonStats.PenaltyMinutes && seasonStats.GamesPlayed) {
      return (
        seasonStats.PenaltyMinutes /
        60 /
        seasonStats.GamesPlayed
      ).toFixed(2);
    }
    return 0;
  }, [seasonStats, league]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        maxWidth="max-w-[60rem]"
        actions={
          <>
            <ButtonGroup>
              <>
                <Button size="sm" variant="danger" onClick={onClose}>
                  <Text variant="small">Cancel</Text>
                </Button>
                <Button size="sm" onClick={action} disabled={errors.length > 0}>
                  <Text variant="small">Confirm</Text>
                </Button>
              </>
            </ButtonGroup>
          </>
        }
      >
        <div className="grid grid-cols-2 mb-2">
          <div className="">
            <div>
              <Text variant="h4">Player</Text>
            </div>
            <div className="grid grid-cols-2">
              <div>
                <Text variant="body-small">
                  From {player.State}, {player.Country}
                </Text>
              </div>
              <div>
                <Text variant="body-small">
                  Transfer Intention: {player.TransferLikeliness}
                </Text>
              </div>
            </div>
            <Text>Season Stats</Text>
            <div className="grid grid-cols-4 gap-2">
              {league === SimCHL && seasonStats && (
                <>
                  <div>
                    <Text>Games Played</Text>
                    <Text>
                      <strong>{seasonStats.GamesPlayed}</strong>
                    </Text>
                  </div>
                  <div>
                    <Text>Goals</Text>
                    <Text>
                      <strong>{seasonStats.Goals}</strong>
                    </Text>
                  </div>
                  <div>
                    <Text>Assists</Text>
                    <Text>
                      <strong>{seasonStats.Assists}</strong>
                    </Text>
                  </div>
                  <div>
                    <Text>Points</Text>
                    <Text>
                      <strong>{seasonStats.Points}</strong>
                    </Text>
                  </div>
                  <div>
                    <Text>Time On Ice</Text>
                    <Text>
                      <strong>{timeOnIce}</strong>
                    </Text>
                  </div>
                  <div>
                    <Text>Pen. Minutes</Text>
                    <Text>
                      <strong>{penaltyMinutes}</strong>
                    </Text>
                  </div>
                  <div>
                    <Text>BodyChecks</Text>
                    <Text>
                      <strong>{seasonStats.BodyChecks}</strong>
                    </Text>
                  </div>
                  <div>
                    <Text>Stick Checks</Text>
                    <Text>
                      <strong>{seasonStats.StickChecks}</strong>
                    </Text>
                  </div>
                </>
              )}
              {league === SimCBB && seasonStats && (
                <>
                  <div>
                    <Text>Games Played</Text>
                    <Text>
                      <strong>{seasonStats.GamesPlayed}</strong>
                    </Text>
                  </div>
                  <div>
                    <Text>Points</Text>
                    <Text>
                      <strong>{seasonStats.Points}</strong>
                    </Text>
                  </div>
                  <div>
                    <Text>Assists</Text>
                    <Text>
                      <strong>{seasonStats.Assists}</strong>
                    </Text>
                  </div>
                  <div>
                    <Text>Points</Text>
                    <Text>
                      <strong>{seasonStats.FGPercentage}</strong>
                    </Text>
                  </div>
                  <div>
                    <Text>Minutes</Text>
                    <Text>
                      <strong>{seasonStats.Minutes}</strong>
                    </Text>
                  </div>
                  <div>
                    <Text>Rebounds</Text>
                    <Text>
                      <strong>{seasonStats.TotalRebounds}</strong>
                    </Text>
                  </div>
                  <div>
                    <Text>Steals</Text>
                    <Text>
                      <strong>{seasonStats.Steals}</strong>
                    </Text>
                  </div>
                  <div>
                    <Text>Blocks</Text>
                    <Text>
                      <strong>{seasonStats.Blocks}</strong>
                    </Text>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="">
            <div className="mb-2">
              <Text variant="h4">Promise Details</Text>
            </div>
            {errors.length > 0 && (
              <Border classes="mb-4 max-h-[8rem] overflow-y-auto p-2">
                {errors.map((error, index) => (
                  <Text key={index} variant="xs">
                    {error}
                  </Text>
                ))}
              </Border>
            )}
            <div className="grid grid-cols-2 justify-center gap-y-4 items-center">
              <div className="">
                <Text variant="body-small">Promise Options</Text>
              </div>
              <div className="flex w-full justify-center">
                <SelectDropdown
                  options={promiseOptions}
                  onChange={ChangePromiseType}
                  styles={{
                    control: (base: CSSObjectWithLabel, state: any) => ({
                      ...base,
                      minHeight: "32px", // shorter control
                      fontSize: "0.75rem", // smaller text
                      backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                      borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                      color: "#ffffff",
                      padding: "0.3rem",
                      boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                      borderRadius: "8px",
                      transition: "all 0.2s ease",
                      width: "15rem",
                    }),
                  }}
                />
              </div>
              <div>
                <Text variant="body-small">Promise Weight</Text>
              </div>
              <div>
                <Text>{promiseWeight}</Text>
              </div>
              <div>
                <Text variant="body-small">Benchmark</Text>
              </div>
              <div>
                {(promiseType === "Wins" ||
                  promiseType === "Time on Ice" ||
                  promiseType === "Minutes" ||
                  promiseType === "Snap Count") && (
                  <Slider
                    value={benchmark}
                    onChange={ChangeBenchmark}
                    min={minRange}
                    max={maxRange}
                    name="benchmark"
                    label={promiseType}
                  />
                )}
                {promiseType === "Home State Game" && (
                  <SelectDropdown
                    options={stateOptions}
                    onChange={ChangeBenchmarkStr}
                    styles={{
                      control: (base: CSSObjectWithLabel, state: any) => ({
                        ...base,
                        minHeight: "32px", // shorter control
                        fontSize: "0.75rem", // smaller text
                        backgroundColor: state.isFocused
                          ? "#2d3748"
                          : "#1a202c",
                        borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                        color: "#ffffff",
                        padding: "0.3rem",
                        boxShadow: state.isFocused
                          ? "0 0 0 1px #4A90E2"
                          : "none",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        width: "15rem",
                      }),
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <Text className="mb4 text-start">
          Are you sure you want to send a promise to this player?
        </Text>
      </Modal>
    </>
  );
};
