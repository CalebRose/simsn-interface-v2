import { useCallback, useEffect, useMemo, useState } from "react";
import { SimCFB } from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { Input, ToggleSwitch } from "../../_design/Inputs";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import {
  AdminService,
  CFBConferenceChampionshipDTO,
} from "../../_services/adminService";
import { getLogo } from "../../_utility/getLogo";
import { useAuthStore } from "../../context/AuthContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { CollegeGame, CollegeTeam } from "../../models/footballModels";

interface ConfDefaultConfig {
  gameTitle: string;
  isNeutral: boolean;
  stadiumID: number;
  stadium: string;
  city: string;
  state: string;
  isDomed: boolean;
  timeSlot: string;
}

const CONF_CHAMP_DEFAULTS: Record<number, ConfDefaultConfig> = {
  3: {
    gameTitle: "ACC Championship Game",
    isNeutral: true,
    stadiumID: 158,
    stadium: "Bank of America Stadium",
    city: "Charlotte",
    state: "NC",
    isDomed: false,
    timeSlot: "Saturday Evening",
  },
  4: {
    gameTitle: "Big Ten Championship Game",
    isNeutral: true,
    stadiumID: 154,
    stadium: "Lucas Oil Stadium",
    city: "Indianapolis",
    state: "IN",
    isDomed: true,
    timeSlot: "Saturday Evening",
  },
  5: {
    gameTitle: "Big 12 Championship Game",
    isNeutral: true,
    stadiumID: 99,
    stadium: "AT&T Stadium",
    city: "Arlington",
    state: "TX",
    isDomed: true,
    timeSlot: "Saturday Morning",
  },
  6: {
    gameTitle: "Pac-12 Championship Game",
    isNeutral: true,
    stadiumID: 155,
    stadium: "Allegiant Stadium",
    city: "Las Vegas",
    state: "NV",
    isDomed: true,
    timeSlot: "Friday Night",
  },
  7: {
    gameTitle: "SEC Championship Game",
    isNeutral: true,
    stadiumID: 25,
    stadium: "Mercedes-Benz Stadium",
    city: "Atlanta",
    state: "GA",
    isDomed: true,
    timeSlot: "Saturday Afternoon",
  },
  8: {
    gameTitle: "AAC Championship Game",
    isNeutral: false,
    stadiumID: 0,
    stadium: "",
    city: "",
    state: "",
    isDomed: false,
    timeSlot: "Saturday Afternoon",
  },
  9: {
    gameTitle: "C-USA Championship Game",
    isNeutral: false,
    stadiumID: 0,
    stadium: "",
    city: "",
    state: "",
    isDomed: false,
    timeSlot: "Friday Night",
  },
  10: {
    gameTitle: "MAC Championship Game",
    isNeutral: true,
    stadiumID: 147,
    stadium: "Ford Field",
    city: "Detroit",
    state: "MI",
    isDomed: true,
    timeSlot: "Saturday Morning",
  },
  11: {
    gameTitle: "MWC Championship Game",
    isNeutral: false,
    stadiumID: 0,
    stadium: "",
    city: "",
    state: "",
    isDomed: false,
    timeSlot: "Saturday Afternoon",
  },
  12: {
    gameTitle: "Sun Belt Championship Game",
    isNeutral: false,
    stadiumID: 0,
    stadium: "",
    city: "",
    state: "",
    isDomed: false,
    timeSlot: "Saturday Afternoon",
  },
};

const TIMESLOT_OPTIONS = [
  { value: "Thursday Night", label: "Thursday Night" },
  { value: "Friday Night", label: "Friday Night" },
  { value: "Saturday Morning", label: "Saturday Morning" },
  { value: "Saturday Afternoon", label: "Saturday Afternoon" },
  { value: "Saturday Evening", label: "Saturday Evening" },
  { value: "Saturday Night", label: "Saturday Night" },
];

export const AdminConfChampionshipsTab = () => {
  const { currentUser } = useAuthStore();
  const { cfbTeams, cfbTeamMap, cfbStandingsMap, cfb_Timestamp } =
    useSimFBAStore();

  const [postseasonGames, setPostseasonGames] = useState<CollegeGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedConfID, setSelectedConfID] = useState<number>(0);
  const [team1ID, setTeam1ID] = useState<number>(0);
  const [team2ID, setTeam2ID] = useState<number>(0);
  const [timeSlot, setTimeSlot] = useState<string>("Saturday Afternoon");
  const [isNeutral, setIsNeutral] = useState<boolean>(true);
  const [stadium, setStadium] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [isDomed, setIsDomed] = useState<boolean>(false);
  const [gameTitle, setGameTitle] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadPostseasonGames = useCallback(async () => {
    setIsLoading(true);
    try {
      const games = await AdminService.GetCFBPostseasonGames();
      setPostseasonGames(games || []);
    } catch (e) {
      console.error("Failed to load postseason games", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPostseasonGames();
  }, [loadPostseasonGames]);

  // Filter strictly to FBS conferences, excluding Independent conferences (IDs 13, 22 or name containing Independent) and FCS conferences
  const fbsConferences = useMemo(() => {
    const confMap = new Map<number, string>();
    (cfbTeams || []).forEach((team: CollegeTeam) => {
      if (!team.IsFBS) return;
      if (team.ConferenceID === 13 || team.ConferenceID === 22) return;
      if (
        !team.Conference ||
        team.Conference.toLowerCase().includes("independent")
      ) {
        return;
      }
      if (!confMap.has(team.ConferenceID)) {
        confMap.set(team.ConferenceID, team.Conference);
      }
    });
    return Array.from(confMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [cfbTeams]);

  const conferenceDropdownOptions = useMemo(
    () =>
      fbsConferences.map((c) => ({
        value: c.id.toString(),
        label: c.name,
      })),
    [fbsConferences],
  );

  const confChampionshipGames = useMemo(
    () =>
      (postseasonGames || []).filter((g) => g.IsConferenceChampionship),
    [postseasonGames],
  );

  const confGameByConfID = useMemo(() => {
    const map: Record<number, CollegeGame> = {};
    confChampionshipGames.forEach((g) => {
      if (g.ConferenceID) {
        map[g.ConferenceID] = g;
      } else if (g.HomeTeamID && cfbTeamMap?.[g.HomeTeamID]) {
        map[cfbTeamMap[g.HomeTeamID].ConferenceID] = g;
      }
    });
    return map;
  }, [confChampionshipGames, cfbTeamMap]);

  const selectConference = useCallback(
    (confID: number) => {
      setSelectedConfID(confID);
      setStatusMsg(null);
      const existing = confGameByConfID[confID];
      const confObj = fbsConferences.find((c) => c.id === confID);
      const def = CONF_CHAMP_DEFAULTS[confID];

      if (existing) {
        setTeam1ID(existing.HomeTeamID);
        setTeam2ID(existing.AwayTeamID);
        setTimeSlot(existing.TimeSlot || def?.timeSlot || "Saturday Afternoon");
        setIsNeutral(existing.IsNeutral);
        setStadium(existing.Stadium || def?.stadium || "");
        setCity(existing.City || def?.city || "");
        setState(existing.State || def?.state || "");
        setIsDomed(Boolean(existing.IsDomed));
        setGameTitle(
          existing.GameTitle ||
            def?.gameTitle ||
            `${confObj?.name ?? ""} Championship Game`,
        );
      } else {
        // Default to top 2 teams in conference standings if available
        const confTeams = (cfbTeams || [])
          .filter((t) => t.IsFBS && t.ConferenceID === confID)
          .sort((a, b) => {
            const stA = cfbStandingsMap?.[a.ID];
            const stB = cfbStandingsMap?.[b.ID];
            const cwDiff =
              (stB?.ConferenceWins ?? 0) - (stA?.ConferenceWins ?? 0);
            if (cwDiff !== 0) return cwDiff;
            const clDiff =
              (stA?.ConferenceLosses ?? 0) - (stB?.ConferenceLosses ?? 0);
            if (clDiff !== 0) return clDiff;
            return (stB?.TotalWins ?? 0) - (stA?.TotalWins ?? 0);
          });

        const defaultTeam1 = confTeams[0];
        const defaultTeam2 = confTeams[1];

        setTeam1ID(defaultTeam1?.ID ?? 0);
        setTeam2ID(defaultTeam2?.ID ?? 0);
        setTimeSlot(def?.timeSlot ?? "Saturday Afternoon");
        setIsNeutral(def?.isNeutral ?? false);
        if (def?.isNeutral) {
          setStadium(def.stadium);
          setCity(def.city);
          setState(def.state);
          setIsDomed(def.isDomed);
        } else if (defaultTeam1) {
          setStadium(defaultTeam1.Stadium);
          setCity(defaultTeam1.City);
          setState(defaultTeam1.State);
          setIsDomed(false);
        }
        setGameTitle(
          def?.gameTitle ?? `${confObj?.name ?? ""} Championship Game`,
        );
      }
    },
    [confGameByConfID, fbsConferences, cfbTeams, cfbStandingsMap],
  );

  // Initialize first FBS conference when loaded
  useEffect(() => {
    if (selectedConfID === 0 && fbsConferences.length > 0) {
      selectConference(fbsConferences[0].id);
    }
  }, [fbsConferences, selectedConfID, selectConference]);

  // Teams strictly belonging to the selected FBS conference
  const conferenceTeams = useMemo(() => {
    if (!selectedConfID) return [];
    return (cfbTeams || [])
      .filter((t) => t.IsFBS && t.ConferenceID === selectedConfID)
      .sort((a, b) => a.TeamName.localeCompare(b.TeamName));
  }, [cfbTeams, selectedConfID]);

  const teamDropdownOptions = useMemo(() => {
    return conferenceTeams.map((t) => {
      const st = cfbStandingsMap?.[t.ID];
      const recStr = st
        ? ` (${st.TotalWins}-${st.TotalLosses}, ${st.ConferenceWins}-${st.ConferenceLosses} ${t.Conference})`
        : "";
      return {
        value: t.ID.toString(),
        label: `${t.TeamName} ${t.Mascot}${recStr}`,
      };
    });
  }, [conferenceTeams, cfbStandingsMap]);

  const handleTeam1Change = (newTeam1ID: number) => {
    setTeam1ID(newTeam1ID);
    if (!isNeutral) {
      const t1 = cfbTeamMap?.[newTeam1ID];
      if (t1) {
        setStadium(t1.Stadium);
        setCity(t1.City);
        setState(t1.State);
      }
    }
  };

  const handleSaveChampionship = async () => {
    if (!selectedConfID) {
      setStatusMsg({ type: "error", text: "Please select an FBS conference." });
      return;
    }
    if (!team1ID || !team2ID) {
      setStatusMsg({
        type: "error",
        text: "Please select both Team 1 and Team 2.",
      });
      return;
    }
    if (team1ID === team2ID) {
      setStatusMsg({
        type: "error",
        text: "Team 1 and Team 2 must be different teams.",
      });
      return;
    }

    const confObj = fbsConferences.find((c) => c.id === selectedConfID);
    const existing = confGameByConfID[selectedConfID];
    const def = CONF_CHAMP_DEFAULTS[selectedConfID];

    const dto: CFBConferenceChampionshipDTO = {
      GameID: existing?.ID ?? 0,
      ConferenceID: selectedConfID,
      Conference: confObj?.name ?? "",
      HomeTeamID: team1ID,
      AwayTeamID: team2ID,
      TimeSlot: timeSlot,
      StadiumID: isNeutral ? def?.stadiumID ?? 0 : cfbTeamMap?.[team1ID]?.StadiumID ?? 0,
      Stadium: stadium,
      City: city,
      State: state,
      IsDomed: isDomed,
      IsNeutral: isNeutral,
      GameTitle:
        gameTitle ||
        def?.gameTitle ||
        `${confObj?.name ?? ""} Championship Game`,
      Week: 15,
    };

    setIsSaving(true);
    setStatusMsg(null);
    try {
      const saved = await AdminService.SaveCFBConferenceChampionship(dto);
      setPostseasonGames((prev) => {
        const filtered = prev.filter(
          (g) =>
            g.ID !== saved.ID &&
            !(
              g.IsConferenceChampionship &&
              g.ConferenceID === saved.ConferenceID
            ),
        );
        return [...filtered, saved];
      });
      setStatusMsg({
        type: "success",
        text: `Saved ${saved.GameTitle}: ${saved.HomeTeam} vs ${saved.AwayTeam}!`,
      });
    } catch (e) {
      setStatusMsg({
        type: "error",
        text: `Failed to save championship game: ${e instanceof Error ? e.message : e}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGame = async (gameID: number) => {
    try {
      await AdminService.DeleteCFBPostseasonGame(gameID);
      setPostseasonGames((prev) => prev.filter((g) => g.ID !== gameID));
      setStatusMsg({
        type: "success",
        text: "Removed conference championship game.",
      });
    } catch (e) {
      setStatusMsg({
        type: "error",
        text: `Failed to remove game: ${e instanceof Error ? e.message : e}`,
      });
    }
  };

  const selectedConfOption =
    conferenceDropdownOptions.find(
      (o) => o.value === selectedConfID.toString(),
    ) ?? null;
  const selectedTeam1Option =
    teamDropdownOptions.find((o) => o.value === team1ID.toString()) ?? null;
  const selectedTeam2Option =
    teamDropdownOptions.find((o) => o.value === team2ID.toString()) ?? null;
  const selectedTimeslotOption =
    TIMESLOT_OPTIONS.find((o) => o.value === timeSlot) ?? TIMESLOT_OPTIONS[3];

  const team1Obj = team1ID ? cfbTeamMap?.[team1ID] : null;
  const team2Obj = team2ID ? cfbTeamMap?.[team2ID] : null;

  return (
    <div className="flex flex-col w-full gap-y-6 p-4">
      <div className="flex flex-col gap-y-1">
        <Text variant="h5">FBS Conference Championships (Week 15)</Text>
        <Text variant="small" classes="text-gray-400">
          Select an FBS Conference on the left to set Team 1 (Home) and Team 2
          (Away) from that conference&apos;s teams. Independent and FCS
          conferences are excluded.
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: FBS Conference Selection */}
        <Border classes="lg:col-span-4 p-4 flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-2">
            <Text variant="h6">1. Select FBS Conference</Text>
            <SelectDropdown
              options={conferenceDropdownOptions}
              value={selectedConfOption}
              onChange={(opt) => opt && selectConference(Number(opt.value))}
              placeholder="Choose FBS Conference..."
            />
          </div>

          <div className="flex flex-col gap-y-2 mt-2">
            <Text variant="small" classes="text-gray-400 font-semibold">
              FBS Conferences Status ({Object.keys(confGameByConfID).length} /{" "}
              {fbsConferences.length} Set)
            </Text>
            <div className="flex flex-col gap-y-1.5">
              {fbsConferences.map((conf) => {
                const game = confGameByConfID[conf.id];
                const isSelected = conf.id === selectedConfID;
                return (
                  <button
                    key={conf.id}
                    type="button"
                    onClick={() => selectConference(conf.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded border text-left transition cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-950/40"
                        : "border-gray-700 hover:border-gray-500 bg-gray-900/40"
                    }`}
                  >
                    <span className="font-medium text-sm">{conf.name}</span>
                    {game ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-900/60 text-green-300 border border-green-700">
                        {game.HomeTeam} vs {game.AwayTeam}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                        Not Set
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Border>

        {/* Right Column: Matchup & Venue Configuration */}
        <Border classes="lg:col-span-8 p-4 flex flex-col gap-y-5">
          <div className="flex items-center justify-between border-b border-gray-700 pb-3">
            <Text variant="h6">
              2. Configure{" "}
              {selectedConfOption?.label ?? "Conference"} Championship Matchup
            </Text>
            <Text variant="small" classes="text-gray-400">
              {conferenceTeams.length} teams in conference
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team 1 (Home) */}
            <div className="flex flex-col gap-y-2">
              <Text variant="small" classes="text-gray-300 font-semibold">
                Team 1 (Home Team)
              </Text>
              <SelectDropdown
                options={teamDropdownOptions.filter(
                  (o) => Number(o.value) !== team2ID,
                )}
                value={selectedTeam1Option}
                onChange={(opt) => opt && handleTeam1Change(Number(opt.value))}
                placeholder="Select Team 1..."
              />
              {team1Obj && (
                <div className="flex items-center gap-x-3 p-2.5 rounded bg-gray-900/50 border border-gray-800 mt-1">
                  <Logo
                    url={getLogo(
                      SimCFB,
                      team1Obj.ID,
                      currentUser?.IsRetro,
                    )}
                    variant="small"
                  />
                  <div className="flex flex-col">
                    <Text variant="body-small" classes="font-semibold">
                      {team1Obj.TeamName} {team1Obj.Mascot} ({team1Obj.TeamAbbr})
                    </Text>
                    <Text variant="xs" classes="text-gray-400">
                      Coach: {team1Obj.Coach || "AI"} | Home:{" "}
                      {team1Obj.Stadium}
                    </Text>
                  </div>
                </div>
              )}
            </div>

            {/* Team 2 (Away) */}
            <div className="flex flex-col gap-y-2">
              <Text variant="small" classes="text-gray-300 font-semibold">
                Team 2 (Away Team)
              </Text>
              <SelectDropdown
                options={teamDropdownOptions.filter(
                  (o) => Number(o.value) !== team1ID,
                )}
                value={selectedTeam2Option}
                onChange={(opt) => opt && setTeam2ID(Number(opt.value))}
                placeholder="Select Team 2..."
              />
              {team2Obj && (
                <div className="flex items-center gap-x-3 p-2.5 rounded bg-gray-900/50 border border-gray-800 mt-1">
                  <Logo
                    url={getLogo(
                      SimCFB,
                      team2Obj.ID,
                      currentUser?.IsRetro,
                    )}
                    variant="small"
                  />
                  <div className="flex flex-col">
                    <Text variant="body-small" classes="font-semibold">
                      {team2Obj.TeamName} {team2Obj.Mascot} ({team2Obj.TeamAbbr})
                    </Text>
                    <Text variant="xs" classes="text-gray-400">
                      Coach: {team2Obj.Coach || "AI"}
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-800">
            <Input
              label="Game Title"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
            />
            <div className="flex flex-col gap-y-1">
              <Text variant="small" classes="text-gray-400">
                Timeslot
              </Text>
              <SelectDropdown
                options={TIMESLOT_OPTIONS}
                value={selectedTimeslotOption}
                onChange={(opt) => opt && setTimeSlot(String(opt.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="flex items-center gap-x-3">
              <Text variant="body-small">Neutral Site</Text>
              <ToggleSwitch
                checked={isNeutral}
                onChange={(val) => {
                  setIsNeutral(val);
                  if (!val && team1Obj) {
                    setStadium(team1Obj.Stadium);
                    setCity(team1Obj.City);
                    setState(team1Obj.State);
                  } else if (val && CONF_CHAMP_DEFAULTS[selectedConfID]?.stadium) {
                    const def = CONF_CHAMP_DEFAULTS[selectedConfID];
                    setStadium(def.stadium);
                    setCity(def.city);
                    setState(def.state);
                    setIsDomed(def.isDomed);
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-x-3">
              <Text variant="body-small">Domed Stadium</Text>
              <ToggleSwitch
                checked={isDomed}
                onChange={(val) => setIsDomed(val)}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Stadium"
                value={stadium}
                onChange={(e) => setStadium(e.target.value)}
                disabled={!isNeutral}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <ButtonGroup>
              <Button
                variant="primary"
                onClick={handleSaveChampionship}
                disabled={isSaving || !team1ID || !team2ID || team1ID === team2ID}
              >
                {isSaving
                  ? "Saving..."
                  : confGameByConfID[selectedConfID]
                    ? "Update Championship Game"
                    : "Set Championship Game"}
              </Button>
            </ButtonGroup>
            {statusMsg && (
              <Text
                variant="body-small"
                classes={
                  statusMsg.type === "success"
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {statusMsg.text}
              </Text>
            )}
          </div>
        </Border>
      </div>

      {/* Scheduled Conference Championship Games Table */}
      <Border classes="p-4 flex flex-col gap-y-3">
        <div className="flex items-center justify-between">
          <Text variant="h6">
            Scheduled FBS Conference Championship Games (Season{" "}
            {cfb_Timestamp?.Season ?? ""})
          </Text>
          <Button
            variant="secondaryOutline"
            size="sm"
            onClick={loadPostseasonGames}
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {confChampionshipGames.length === 0 ? (
          <Text variant="body-small" classes="text-gray-400 py-4">
            No FBS Conference Championship games have been scheduled for this
            season yet.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                  <th className="py-2 px-3">Title</th>
                  <th className="py-2 px-3">Week</th>
                  <th className="py-2 px-3">Team 1 (Home)</th>
                  <th className="py-2 px-3">Team 2 (Away)</th>
                  <th className="py-2 px-3">Timeslot</th>
                  <th className="py-2 px-3">Location</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {confChampionshipGames.map((game) => (
                  <tr key={game.ID} className="hover:bg-gray-900/40">
                    <td className="py-2.5 px-3 font-medium">
                      {game.GameTitle}
                    </td>
                    <td className="py-2.5 px-3">{game.Week}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-x-2">
                        <Logo
                          url={getLogo(
                            SimCFB,
                            game.HomeTeamID,
                            currentUser?.IsRetro,
                          )}
                          variant="tiny"
                        />
                        <span>
                          {game.HomeTeamRank > 0
                            ? `#${game.HomeTeamRank} `
                            : ""}
                          {game.HomeTeam}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-x-2">
                        <Logo
                          url={getLogo(
                            SimCFB,
                            game.AwayTeamID,
                            currentUser?.IsRetro,
                          )}
                          variant="tiny"
                        />
                        <span>
                          {game.AwayTeamRank > 0
                            ? `#${game.AwayTeamRank} `
                            : ""}
                          {game.AwayTeam}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">{game.TimeSlot}</td>
                    <td className="py-2.5 px-3 text-gray-300">
                      {game.Stadium} ({game.City}, {game.State})
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-x-2">
                        <Button
                          size="xs"
                          variant="secondaryOutline"
                          onClick={() => {
                            const confID =
                              game.ConferenceID ||
                              cfbTeamMap?.[game.HomeTeamID]?.ConferenceID ||
                              0;
                            if (confID) selectConference(confID);
                          }}
                        >
                          Edit
                        </Button>
                        {!game.GameComplete && (
                          <Button
                            size="xs"
                            variant="danger"
                            onClick={() => handleDeleteGame(game.ID)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Border>
    </div>
  );
};
