import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SimNBA } from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import {
  AdminService,
  NBAPlayoffScheduleRequest,
} from "../../_services/adminService";
import { getLogo } from "../../_utility/getLogo";
import { useAuthStore } from "../../context/AuthContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { NBAMatch, NBAStandings, NBATeam } from "../../models/basketballModels";

const PLAYOFF_ROUNDS = [
  "Play-In Tournament",
  "First Round",
  "Conference Semifinals",
  "Conference Finals",
  "The NBA Finals",
];

const SEEDS_PER_CONFERENCE = 8;
const PLAY_IN_SEEDS = [7, 8, 9, 10];

const getNBATeamName = (t?: NBATeam | null): string => {
  if (!t) return "";
  return t.Nickname ? `${t.Team} ${t.Nickname}` : t.Team;
};

export const AdminNBAPostseasonTab = () => {
  const { currentUser } = useAuthStore();
  const {
    nbaTeams,
    nbaTeamMap,
    allProStandings,
    currentProStandings,
    allProGames,
    currentProSeasonGames,
  } = useSimBBAStore();

  const eastCsvInputRef = useRef<HTMLInputElement | null>(null);
  const westCsvInputRef = useRef<HTMLInputElement | null>(null);

  const [activeSection, setActiveSection] = useState<
    "playin" | "playoffs" | "matches"
  >("playin");
  const [selectedConference, setSelectedConference] = useState<"East" | "West">(
    "East",
  );

  // Playoff seeds state: 1 to 8 for East and West
  const [eastSeeds, setEastSeeds] = useState<number[]>(
    Array(SEEDS_PER_CONFERENCE).fill(0),
  );
  const [westSeeds, setWestSeeds] = useState<number[]>(
    Array(SEEDS_PER_CONFERENCE).fill(0),
  );

  // Play-In seeds state: 7, 8, 9, 10 for East and West (indices 0..3)
  const [eastPlayInSeeds, setEastPlayInSeeds] = useState<number[]>([0, 0, 0, 0]);
  const [westPlayInSeeds, setWestPlayInSeeds] = useState<number[]>([0, 0, 0, 0]);

  const [postseasonGames, setPostseasonGames] = useState<NBAMatch[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load postseason games
  const loadPostseasonGames = useCallback(() => {
    const source =
      currentProSeasonGames && currentProSeasonGames.length > 0
        ? currentProSeasonGames
        : allProGames || [];

    const filtered = source.filter(
      (m) =>
        m.IsPlayInGame ||
        m.IsPlayoffGame ||
        m.IsTheFinals ||
        m.MatchName?.includes("Play-In") ||
        m.MatchName?.includes("Playoff") ||
        m.MatchName?.includes("Finals"),
    );

    setPostseasonGames(filtered);
  }, [allProGames, currentProSeasonGames]);

  useEffect(() => {
    loadPostseasonGames();
  }, [loadPostseasonGames]);

  // Standings lookup by conference
  const standingsByConf = useMemo(() => {
    const standingsSource =
      currentProStandings && currentProStandings.length > 0
        ? currentProStandings
        : allProStandings || [];

    const east: NBAStandings[] = [];
    const west: NBAStandings[] = [];

    standingsSource.forEach((st) => {
      const team = nbaTeamMap?.[st.TeamID];
      const conf = st.ConferenceName || team?.Conference || "";
      if (conf.toLowerCase().includes("east")) {
        east.push(st);
      } else {
        west.push(st);
      }
    });

    const sorter = (a: NBAStandings, b: NBAStandings) => {
      const aPct =
        a.TotalWins + a.TotalLosses > 0
          ? a.TotalWins / (a.TotalWins + a.TotalLosses)
          : 0;
      const bPct =
        b.TotalWins + b.TotalLosses > 0
          ? b.TotalWins / (b.TotalWins + b.TotalLosses)
          : 0;
      if (bPct !== aPct) return bPct - aPct;
      return b.TotalWins - a.TotalWins;
    };

    return {
      East: east.sort(sorter),
      West: west.sort(sorter),
    };
  }, [allProStandings, currentProStandings, nbaTeamMap]);

  // Teams lookup by conference
  const teamsByConf = useMemo(() => {
    const east: NBATeam[] = [];
    const west: NBATeam[] = [];

    (nbaTeams || []).forEach((t) => {
      const conf = t.Conference || "";
      if (conf.toLowerCase().includes("east")) {
        east.push(t);
      } else {
        west.push(t);
      }
    });

    return {
      East: east.sort((a, b) =>
        getNBATeamName(a).localeCompare(getNBATeamName(b)),
      ),
      West: west.sort((a, b) =>
        getNBATeamName(a).localeCompare(getNBATeamName(b)),
      ),
    };
  }, [nbaTeams]);

  // Auto-seed Play-In from Standings (ranks 7, 8, 9, 10)
  const autoSeedPlayIn = () => {
    const east7to10 = standingsByConf.East.slice(6, 10).map((st) => st.TeamID);
    const west7to10 = standingsByConf.West.slice(6, 10).map((st) => st.TeamID);

    while (east7to10.length < 4) east7to10.push(0);
    while (west7to10.length < 4) west7to10.push(0);

    setEastPlayInSeeds(east7to10);
    setWestPlayInSeeds(west7to10);
    setMsg({
      type: "success",
      text: "Auto-seeded Play-In teams (ranks 7-10) for Eastern and Western Conferences.",
    });
  };

  // Auto-seed Playoffs from Standings (ranks 1 to 8)
  const autoSeedPlayoffs = () => {
    const east1to8 = standingsByConf.East.slice(0, 8).map((st) => st.TeamID);
    const west1to8 = standingsByConf.West.slice(0, 8).map((st) => st.TeamID);

    while (east1to8.length < 8) east1to8.push(0);
    while (west1to8.length < 8) west1to8.push(0);

    setEastSeeds(east1to8);
    setWestSeeds(west1to8);
    setMsg({
      type: "success",
      text: "Auto-seeded top 8 teams for Eastern and Western Conferences.",
    });
  };

  // CSV Import handler
  const handleCSVUpload = (
    e: ChangeEvent<HTMLInputElement>,
    conf: "East" | "West",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = String(event.target?.result || "");
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);

        const newSeeds = conf === "East" ? [...eastSeeds] : [...westSeeds];
        const confTeamList = teamsByConf[conf];

        for (const line of lines) {
          const parts = line.split(",").map((p) => p.trim());
          if (parts.length >= 2) {
            const seedNum = parseInt(parts[0], 10);
            const teamIdOrName = parts[1];

            if (seedNum >= 1 && seedNum <= 8) {
              const matched = confTeamList.find(
                (t) =>
                  t.ID.toString() === teamIdOrName ||
                  getNBATeamName(t).toLowerCase() === teamIdOrName.toLowerCase() ||
                  (t.Abbr && t.Abbr.toLowerCase() === teamIdOrName.toLowerCase()),
              );
              if (matched) {
                newSeeds[seedNum - 1] = matched.ID;
              }
            }
          }
        }

        if (conf === "East") setEastSeeds(newSeeds);
        else setWestSeeds(newSeeds);

        setMsg({
          type: "success",
          text: `Successfully imported ${conf} seeds from CSV.`,
        });
      } catch (err: any) {
        setMsg({
          type: "error",
          text: `Failed to import CSV: ${err?.message || err}`,
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Download Sample CSV
  const downloadSampleCSV = (conf: "East" | "West") => {
    const currentSeeds = conf === "East" ? eastSeeds : westSeeds;
    const rows = [
      "Seed,TeamID,TeamName",
      ...currentSeeds.map((teamId, idx) => {
        const team = nbaTeamMap?.[teamId];
        return `${idx + 1},${teamId || ""},${getNBATeamName(team)}`;
      }),
    ];

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NBA_${conf}_Playoff_Seeds.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate Play-In Schedule
  const handleGeneratePlayIn = async () => {
    const eastUnset = eastPlayInSeeds.filter((s) => s === 0).length;
    const westUnset = westPlayInSeeds.filter((s) => s === 0).length;

    if (eastUnset > 0 || westUnset > 0) {
      setMsg({
        type: "error",
        text: "Please set all Play-In seeds (7, 8, 9, 10) for both East and West.",
      });
      return;
    }

    setIsGenerating(true);
    setMsg(null);
    try {
      const payload: NBAPlayoffScheduleRequest = {
        IncludePlayIn: true,
        EastSeeds: eastPlayInSeeds.map((teamId, idx) => ({
          Seed: PLAY_IN_SEEDS[idx],
          TeamID: teamId,
          TeamName: getNBATeamName(nbaTeamMap?.[teamId]) || `Team #${teamId}`,
        })),
        WestSeeds: westPlayInSeeds.map((teamId, idx) => ({
          Seed: PLAY_IN_SEEDS[idx],
          TeamID: teamId,
          TeamName: getNBATeamName(nbaTeamMap?.[teamId]) || `Team #${teamId}`,
        })),
      };

      await AdminService.GenerateNBAPlayoffSchedule(payload);
      setMsg({
        type: "success",
        text: "Successfully generated NBA Play-In Tournament schedule!",
      });
      loadPostseasonGames();
    } catch (err: any) {
      setMsg({
        type: "error",
        text: `Failed to generate Play-In schedule: ${err?.message || err}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate NBA Playoffs Schedule
  const handleGeneratePlayoffs = async () => {
    const eastUnset = eastSeeds.filter((s) => s === 0).length;
    const westUnset = westSeeds.filter((s) => s === 0).length;

    if (eastUnset > 0 || westUnset > 0) {
      setMsg({
        type: "error",
        text: "Please assign all 8 seeds for both Eastern and Western Conferences.",
      });
      return;
    }

    setIsGenerating(true);
    setMsg(null);
    try {
      const payload: NBAPlayoffScheduleRequest = {
        IncludePlayIn: false,
        EastSeeds: eastSeeds.map((teamId, idx) => ({
          Seed: idx + 1,
          TeamID: teamId,
          TeamName: getNBATeamName(nbaTeamMap?.[teamId]) || `Team #${teamId}`,
        })),
        WestSeeds: westSeeds.map((teamId, idx) => ({
          Seed: idx + 1,
          TeamID: teamId,
          TeamName: getNBATeamName(nbaTeamMap?.[teamId]) || `Team #${teamId}`,
        })),
      };

      await AdminService.GenerateNBAPlayoffSchedule(payload);
      setMsg({
        type: "success",
        text: "Successfully generated NBA Playoffs Best-of-7 series schedule!",
      });
      loadPostseasonGames();
    } catch (err: any) {
      setMsg({
        type: "error",
        text: `Failed to generate playoffs schedule: ${err?.message || err}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete Postseason Game
  const handleDeleteGame = async (gameID: number) => {
    try {
      await AdminService.DeleteNBAPostseasonMatch(gameID);
      setPostseasonGames((prev) => prev.filter((g) => g.ID !== gameID));
      setMsg({
        type: "success",
        text: `Deleted NBA postseason game #${gameID}.`,
      });
    } catch (err: any) {
      setMsg({
        type: "error",
        text: `Failed to delete game: ${err?.message || err}`,
      });
    }
  };

  // Dropdown options for East / West teams
  const eastTeamOptions = useMemo(() => {
    return teamsByConf.East.map((t) => ({
      value: t.ID.toString(),
      label: `${getNBATeamName(t)} [${t.Abbr}]`,
    }));
  }, [teamsByConf.East]);

  const westTeamOptions = useMemo(() => {
    return teamsByConf.West.map((t) => ({
      value: t.ID.toString(),
      label: `${getNBATeamName(t)} [${t.Abbr}]`,
    }));
  }, [teamsByConf.West]);

  // Group scheduled games by round
  const gamesByRound = useMemo(() => {
    const map: Record<string, NBAMatch[]> = {
      "Play-In Tournament": [],
      "First Round": [],
      "Conference Semifinals": [],
      "Conference Finals": [],
      "The NBA Finals": [],
      Other: [],
    };

    postseasonGames.forEach((g) => {
      const name = g.MatchName || "";
      if (g.IsPlayInGame || name.includes("Play-In")) {
        map["Play-In Tournament"].push(g);
      } else if (name.includes("First Round") || name.includes("Round 1")) {
        map["First Round"].push(g);
      } else if (name.includes("Semifinal")) {
        map["Conference Semifinals"].push(g);
      } else if (name.includes("Conference Final")) {
        map["Conference Finals"].push(g);
      } else if (g.IsTheFinals || name.includes("Finals")) {
        map["The NBA Finals"].push(g);
      } else {
        map.Other.push(g);
      }
    });

    return map;
  }, [postseasonGames]);

  return (
    <div className="flex flex-col w-full gap-y-6 p-4">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900/60 p-4 rounded-xl border border-gray-700">
        <div>
          <Text variant="h5" classes="font-bold text-white">
            SimNBA Postseason & Playoffs
          </Text>
          <Text variant="small" classes="text-gray-400">
            Play-In Tournament seeds, 7-game playoff series generator, and fixture manager.
          </Text>
        </div>

        <ButtonGroup>
          <Button
            variant={activeSection === "playin" ? "primary" : "secondary"}
            onClick={() => setActiveSection("playin")}
          >
            Play-In Tournament (7-10)
          </Button>
          <Button
            variant={activeSection === "playoffs" ? "primary" : "secondary"}
            onClick={() => setActiveSection("playoffs")}
          >
            NBA Playoffs (1-8)
          </Button>
          <Button
            variant={activeSection === "matches" ? "primary" : "secondary"}
            onClick={() => setActiveSection("matches")}
          >
            Scheduled Games ({postseasonGames.length})
          </Button>
        </ButtonGroup>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-lg border ${
            msg.type === "success"
              ? "bg-green-900/40 border-green-700 text-green-300"
              : "bg-red-900/40 border-red-700 text-red-300"
          }`}
        >
          <Text variant="body-small">{msg.text}</Text>
        </div>
      )}

      {/* SECTION 1: PLAY-IN TOURNAMENT */}
      {activeSection === "playin" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* East Play-In */}
          <Border classes="p-4 flex flex-col gap-y-4 bg-gray-800/40">
            <div className="flex justify-between items-center pb-2 border-b border-gray-700">
              <div>
                <Text variant="h6" classes="font-bold text-white">
                  Eastern Conference Play-In
                </Text>
                <Text variant="small" classes="text-gray-400">
                  Seeds 7, 8, 9, 10 competing for final 2 playoff seeds.
                </Text>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLAY_IN_SEEDS.map((seedNum, idx) => {
                const teamId = eastPlayInSeeds[idx];
                const team = nbaTeamMap?.[teamId];
                return (
                  <div
                    key={seedNum}
                    className="p-3 rounded-lg border border-gray-700 bg-gray-900/60 flex flex-col gap-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                        East #{seedNum} Seed
                      </span>
                      {team && (
                        <Logo
                          url={getLogo(SimNBA, team.ID, currentUser?.IsRetro)}
                          variant="small"
                          containerClass="w-5 h-5"
                        />
                      )}
                    </div>
                    <SelectDropdown
                      options={eastTeamOptions}
                      value={
                        eastTeamOptions.find(
                          (o) => o.value === teamId.toString(),
                        ) || null
                      }
                      onChange={(opt) => {
                        const next = [...eastPlayInSeeds];
                        next[idx] = opt ? parseInt(opt.value, 10) : 0;
                        setEastPlayInSeeds(next);
                      }}
                      placeholder={`Select East #${seedNum}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-700 text-xs text-gray-400 flex flex-col gap-y-1">
              <span className="font-semibold text-gray-300">Format:</span>
              <span>Game 1: #7 vs #8 (Winner is East #7 seed)</span>
              <span>Game 2: #9 vs #10 (Loser eliminated)</span>
              <span>Game 3: Game 1 Loser vs Game 2 Winner (Winner is East #8 seed)</span>
            </div>
          </Border>

          {/* West Play-In */}
          <Border classes="p-4 flex flex-col gap-y-4 bg-gray-800/40">
            <div className="flex justify-between items-center pb-2 border-b border-gray-700">
              <div>
                <Text variant="h6" classes="font-bold text-white">
                  Western Conference Play-In
                </Text>
                <Text variant="small" classes="text-gray-400">
                  Seeds 7, 8, 9, 10 competing for final 2 playoff seeds.
                </Text>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLAY_IN_SEEDS.map((seedNum, idx) => {
                const teamId = westPlayInSeeds[idx];
                const team = nbaTeamMap?.[teamId];
                return (
                  <div
                    key={seedNum}
                    className="p-3 rounded-lg border border-gray-700 bg-gray-900/60 flex flex-col gap-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                        West #{seedNum} Seed
                      </span>
                      {team && (
                        <Logo
                          url={getLogo(SimNBA, team.ID, currentUser?.IsRetro)}
                          variant="small"
                          containerClass="w-5 h-5"
                        />
                      )}
                    </div>
                    <SelectDropdown
                      options={westTeamOptions}
                      value={
                        westTeamOptions.find(
                          (o) => o.value === teamId.toString(),
                        ) || null
                      }
                      onChange={(opt) => {
                        const next = [...westPlayInSeeds];
                        next[idx] = opt ? parseInt(opt.value, 10) : 0;
                        setWestPlayInSeeds(next);
                      }}
                      placeholder={`Select West #${seedNum}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-700 text-xs text-gray-400 flex flex-col gap-y-1">
              <span className="font-semibold text-gray-300">Format:</span>
              <span>Game 1: #7 vs #8 (Winner is West #7 seed)</span>
              <span>Game 2: #9 vs #10 (Loser eliminated)</span>
              <span>Game 3: Game 1 Loser vs Game 2 Winner (Winner is West #8 seed)</span>
            </div>
          </Border>

          {/* Bottom Action Bar for Play-In */}
          <div className="lg:col-span-2 flex justify-between items-center bg-gray-900/60 p-4 rounded-xl border border-gray-700">
            <Button
              size="sm"
              variant="secondaryOutline"
              onClick={autoSeedPlayIn}
            >
              Auto-Seed Play-In From Standings
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleGeneratePlayIn}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Play-In Schedule"}
            </Button>
          </div>
        </div>
      )}

      {/* SECTION 2: NBA PLAYOFFS (1-8 SEEDS) */}
      {activeSection === "playoffs" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* East Playoff Seeds */}
          <Border classes="p-4 flex flex-col gap-y-4 bg-gray-800/40">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-gray-700 gap-2">
              <div>
                <Text variant="h6" classes="font-bold text-white">
                  Eastern Conference (Seeds 1–8)
                </Text>
                <Text variant="small" classes="text-gray-400">
                  Best-of-7 series bracket matchups.
                </Text>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={eastCsvInputRef}
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => handleCSVUpload(e, "East")}
                />
                <Button
                  size="xs"
                  variant="secondaryOutline"
                  onClick={() => eastCsvInputRef.current?.click()}
                >
                  Import CSV
                </Button>
                <Button
                  size="xs"
                  variant="secondaryOutline"
                  onClick={() => downloadSampleCSV("East")}
                >
                  Sample CSV
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {eastSeeds.map((teamId, idx) => {
                const seedNum = idx + 1;
                const team = nbaTeamMap?.[teamId];
                return (
                  <div
                    key={seedNum}
                    className="p-3 rounded-lg border border-gray-700 bg-gray-900/60 flex flex-col gap-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                        East #{seedNum}
                      </span>
                      {team && (
                        <Logo
                          url={getLogo(SimNBA, team.ID, currentUser?.IsRetro)}
                          variant="small"
                          containerClass="w-5 h-5"
                        />
                      )}
                    </div>
                    <SelectDropdown
                      options={eastTeamOptions}
                      value={
                        eastTeamOptions.find(
                          (o) => o.value === teamId.toString(),
                        ) || null
                      }
                      onChange={(opt) => {
                        const next = [...eastSeeds];
                        next[idx] = opt ? parseInt(opt.value, 10) : 0;
                        setEastSeeds(next);
                      }}
                      placeholder={`Select East #${seedNum}`}
                    />
                  </div>
                );
              })}
            </div>
          </Border>

          {/* West Playoff Seeds */}
          <Border classes="p-4 flex flex-col gap-y-4 bg-gray-800/40">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-gray-700 gap-2">
              <div>
                <Text variant="h6" classes="font-bold text-white">
                  Western Conference (Seeds 1–8)
                </Text>
                <Text variant="small" classes="text-gray-400">
                  Best-of-7 series bracket matchups.
                </Text>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={westCsvInputRef}
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => handleCSVUpload(e, "West")}
                />
                <Button
                  size="xs"
                  variant="secondaryOutline"
                  onClick={() => westCsvInputRef.current?.click()}
                >
                  Import CSV
                </Button>
                <Button
                  size="xs"
                  variant="secondaryOutline"
                  onClick={() => downloadSampleCSV("West")}
                >
                  Sample CSV
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {westSeeds.map((teamId, idx) => {
                const seedNum = idx + 1;
                const team = nbaTeamMap?.[teamId];
                return (
                  <div
                    key={seedNum}
                    className="p-3 rounded-lg border border-gray-700 bg-gray-900/60 flex flex-col gap-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                        West #{seedNum}
                      </span>
                      {team && (
                        <Logo
                          url={getLogo(SimNBA, team.ID, currentUser?.IsRetro)}
                          variant="small"
                          containerClass="w-5 h-5"
                        />
                      )}
                    </div>
                    <SelectDropdown
                      options={westTeamOptions}
                      value={
                        westTeamOptions.find(
                          (o) => o.value === teamId.toString(),
                        ) || null
                      }
                      onChange={(opt) => {
                        const next = [...westSeeds];
                        next[idx] = opt ? parseInt(opt.value, 10) : 0;
                        setWestSeeds(next);
                      }}
                      placeholder={`Select West #${seedNum}`}
                    />
                  </div>
                );
              })}
            </div>
          </Border>

          {/* Bottom Action Bar for Playoffs */}
          <div className="lg:col-span-2 flex justify-between items-center bg-gray-900/60 p-4 rounded-xl border border-gray-700">
            <Button
              size="sm"
              variant="secondaryOutline"
              onClick={autoSeedPlayoffs}
            >
              Auto-Seed Playoffs From Standings
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleGeneratePlayoffs}
              disabled={isGenerating}
            >
              {isGenerating
                ? "Generating..."
                : "Generate Best-of-7 Playoff Series"}
            </Button>
          </div>
        </div>
      )}

      {/* SECTION 3: SCHEDULED POSTSEASON MATCHES */}
      {(activeSection === "matches" || postseasonGames.length > 0) && (
        <Border classes="p-4 flex flex-col gap-y-4 bg-gray-800/40">
          <div className="flex justify-between items-center pb-2 border-b border-gray-700">
            <div>
              <Text variant="h6" classes="font-bold text-white">
                Scheduled NBA Postseason Matches ({postseasonGames.length})
              </Text>
              <Text variant="small" classes="text-gray-400">
                Play-In games and Best-of-7 Playoff series.
              </Text>
            </div>
            <Button
              size="xs"
              variant="secondaryOutline"
              onClick={loadPostseasonGames}
            >
              Refresh Games
            </Button>
          </div>

          {postseasonGames.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              No NBA postseason or Play-In games currently scheduled.
            </div>
          ) : (
            <div className="flex flex-col gap-y-6">
              {PLAYOFF_ROUNDS.concat(["Other"]).map((roundName) => {
                const roundMatches = gamesByRound[roundName] || [];
                if (roundMatches.length === 0) return null;
                return (
                  <div key={roundName} className="flex flex-col gap-y-2">
                    <Text variant="body" classes="font-bold text-cyan-400">
                      {roundName} ({roundMatches.length} match
                      {roundMatches.length === 1 ? "" : "es"})
                    </Text>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-300 border-collapse">
                        <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs">
                          <tr>
                            <th className="p-2 border border-gray-700">Match</th>
                            <th className="p-2 border border-gray-700">Home Team</th>
                            <th className="p-2 border border-gray-700">Away Team</th>
                            <th className="p-2 border border-gray-700 text-center">Score</th>
                            <th className="p-2 border border-gray-700">Arena</th>
                            <th className="p-2 border border-gray-700 text-center">Week</th>
                            <th className="p-2 border border-gray-700 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roundMatches.map((match) => {
                            const homeTeam = nbaTeamMap?.[match.HomeTeamID];
                            const awayTeam = nbaTeamMap?.[match.AwayTeamID];
                            return (
                              <tr
                                key={match.ID}
                                className="border-b border-gray-800 hover:bg-gray-700/30"
                              >
                                <td className="p-2 border border-gray-700 font-semibold text-white">
                                  {match.MatchName || roundName}
                                </td>
                                <td className="p-2 border border-gray-700">
                                  <div className="flex items-center gap-x-2">
                                    {homeTeam && (
                                      <Logo
                                        url={getLogo(
                                          SimNBA,
                                          homeTeam.ID,
                                          currentUser?.IsRetro,
                                        )}
                                        variant="small"
                                        containerClass="w-5 h-5"
                                      />
                                    )}
                                    <span>{match.HomeTeam}</span>
                                  </div>
                                </td>
                                <td className="p-2 border border-gray-700">
                                  <div className="flex items-center gap-x-2">
                                    {awayTeam && (
                                      <Logo
                                        url={getLogo(
                                          SimNBA,
                                          awayTeam.ID,
                                          currentUser?.IsRetro,
                                        )}
                                        variant="small"
                                        containerClass="w-5 h-5"
                                      />
                                    )}
                                    <span>{match.AwayTeam}</span>
                                  </div>
                                </td>
                                <td className="p-2 border border-gray-700 text-center font-mono">
                                  {match.GameComplete
                                    ? `${match.HomeTeamScore} - ${match.AwayTeamScore}`
                                    : "Scheduled"}
                                </td>
                                <td className="p-2 border border-gray-700 text-gray-400">
                                  {match.Arena || "TBD"}
                                </td>
                                <td className="p-2 border border-gray-700 text-center font-mono">
                                  W{match.Week}
                                </td>
                                <td className="p-2 border border-gray-700 text-center">
                                  <Button
                                    size="xs"
                                    variant="danger"
                                    onClick={() => handleDeleteGame(match.ID)}
                                  >
                                    Delete
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Border>
      )}
    </div>
  );
};