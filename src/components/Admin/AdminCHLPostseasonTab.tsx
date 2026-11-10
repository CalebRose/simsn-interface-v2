import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SimCHL } from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import {
  AdminService,
  CHLPostseasonTournamentRequest,
} from "../../_services/adminService";
import { getLogo } from "../../_utility/getLogo";
import { useAuthStore } from "../../context/AuthContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import {
  CollegeGame,
  CollegeStandings,
  CollegeTeam,
} from "../../models/hockeyModels";

const POSTSEASON_ROUNDS = [
  "Round of 16",
  "Regional Finals (Quarterfinals)",
  "Frozen Four (Semifinals)",
  "National Championship",
];

const BRACKET_ORDER = [
  { highSeed: 1, lowSeed: 16, label: "Regional 1 - Semi A" },
  { highSeed: 8, lowSeed: 9, label: "Regional 1 - Semi B" },
  { highSeed: 4, lowSeed: 13, label: "Regional 2 - Semi A" },
  { highSeed: 5, lowSeed: 12, label: "Regional 2 - Semi B" },
  { highSeed: 2, lowSeed: 15, label: "Regional 3 - Semi A" },
  { highSeed: 7, lowSeed: 10, label: "Regional 3 - Semi B" },
  { highSeed: 3, lowSeed: 14, label: "Regional 4 - Semi A" },
  { highSeed: 6, lowSeed: 11, label: "Regional 4 - Semi B" },
];

const getCHLTeamName = (t?: CollegeTeam | null): string => {
  if (!t) return "";
  return t.Mascot ? `${t.TeamName} ${t.Mascot}` : t.TeamName;
};

export const AdminCHLPostseasonTab = () => {
  const { currentUser } = useAuthStore();
  const {
    chlTeams,
    chlTeamMap,
    allCHLStandings,
    allCollegeGames,
    currentCollegeSeasonGames,
    hck_Timestamp,
  } = useSimHCKStore();

  const [seeds, setSeeds] = useState<number[]>(new Array(16).fill(0));
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const [postseasonGames, setPostseasonGames] = useState<CollegeGame[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load national postseason games (Round of 16, Frozen Four, National Championship)
  const loadPostseasonGames = useCallback(() => {
    const gamesSource =
      currentCollegeSeasonGames && currentCollegeSeasonGames.length > 0
        ? currentCollegeSeasonGames
        : allCollegeGames || [];

    const filtered = gamesSource.filter((g) => {
      const isPostseason =
        g.IsNationalChampionship ||
        (g.IsPlayoffGame && !Boolean((g as any).IsConferenceTournament)) ||
        g.GameTitle?.toLowerCase().includes("frozen four") ||
        g.GameTitle?.toLowerCase().includes("round of 16") ||
        g.GameTitle?.toLowerCase().includes("regional final") ||
        g.GameTitle?.toLowerCase().includes("national championship") ||
        g.Week >= 20;

      return isPostseason;
    });

    setPostseasonGames(filtered);
  }, [allCollegeGames, currentCollegeSeasonGames]);

  useEffect(() => {
    loadPostseasonGames();
  }, [loadPostseasonGames]);

  // Overall sorted teams by PairwiseRank / RPIRank / Auto-Qualifiers
  const autoSeedNationalTournament = () => {
    if (!allCHLStandings || allCHLStandings.length === 0) {
      setMsg({
        type: "error",
        text: "No standings data available for auto-seeding.",
      });
      return;
    }

    const pool: CollegeStandings[] = [];
    const qualified = new Set<number>();

    // 1. Conference Tournament Champions Auto-Qualify
    allCHLStandings.forEach((st) => {
      if (st.IsConferenceTournamentChampion) {
        pool.push(st);
        qualified.add(st.TeamID);
      }
    });

    // 2. Sort remaining teams by PairwiseRank ascending, then RPIRank ascending
    const atLargeCandidates = [...allCHLStandings].sort((a, b) => {
      const prA = a.PairwiseRank || 999;
      const prB = b.PairwiseRank || 999;
      if (prA !== prB) return prA - prB;
      return (a.RPIRank || 999) - (b.RPIRank || 999);
    });

    for (const st of atLargeCandidates) {
      if (pool.length >= 16) break;
      if (!qualified.has(st.TeamID)) {
        pool.push(st);
        qualified.add(st.TeamID);
      }
    }

    // 3. Sort final 16 teams 1 to 16 by Pairwise & RPI
    pool.sort((a, b) => {
      const prA = a.PairwiseRank || 999;
      const prB = b.PairwiseRank || 999;
      if (prA !== prB) return prA - prB;
      return (a.RPIRank || 999) - (b.RPIRank || 999);
    });

    const newSeeds = new Array(16).fill(0);
    for (let i = 0; i < Math.min(pool.length, 16); i++) {
      newSeeds[i] = pool[i].TeamID;
    }

    setSeeds(newSeeds);
    setMsg({
      type: "success",
      text: "Auto-seeded 16 teams based on Conference Tournament Champions & Pairwise/RPI rankings!",
    });
  };

  // Change individual seed
  const handleSeedChange = (index: number, teamId: number) => {
    setSeeds((prev) => {
      const updated = [...prev];
      updated[index] = teamId;
      return updated;
    });
  };

  // CSV Import
  const handleCSVUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
        const newSeeds = [...seeds];

        for (const line of lines) {
          const parts = line.split(",").map((p) => p.trim());
          if (parts.length >= 2) {
            const seedNum = parseInt(parts[0], 10);
            const teamIdOrName = parts[1];

            if (seedNum >= 1 && seedNum <= 16) {
              const matchedTeam = (chlTeams || []).find(
                (t) =>
                  t.ID.toString() === teamIdOrName ||
                  getCHLTeamName(t).toLowerCase() === teamIdOrName.toLowerCase() ||
                  (t.Abbreviation && t.Abbreviation.toLowerCase() === teamIdOrName.toLowerCase()),
              );

              if (matchedTeam) {
                newSeeds[seedNum - 1] = matchedTeam.ID;
              }
            }
          }
        }

        setSeeds(newSeeds);
        setMsg({
          type: "success",
          text: "Successfully imported 16 postseason seeds from CSV.",
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

  // CSV Export
  const downloadSampleCSV = () => {
    const rows = [
      "Seed,TeamID,TeamName",
      ...seeds.map((teamId, idx) => {
        const team = chlTeamMap?.[teamId];
        return `${idx + 1},${teamId || ""},${getCHLTeamName(team)}`;
      }),
    ];

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SimCHL_National_Tournament_16_Seeds.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate National Postseason Schedule
  const handleGeneratePostseason = async () => {
    const unset = seeds.filter((s) => s === 0).length;
    if (unset > 0) {
      setMsg({
        type: "error",
        text: `Please assign all 16 seeds before generating the national tournament bracket (${unset} unassigned).`,
      });
      return;
    }

    setIsGenerating(true);
    setMsg(null);
    try {
      const payload: CHLPostseasonTournamentRequest = {
        TournamentName: "NCAA Frozen Four Tournament",
        Seeds: seeds.map((teamId, idx) => ({
          Seed: idx + 1,
          TeamID: teamId,
          TeamName: getCHLTeamName(chlTeamMap?.[teamId]) || `Team #${teamId}`,
        })),
      };

      await AdminService.GenerateCHLPostseasonSchedule(payload);
      setMsg({
        type: "success",
        text: "Successfully generated 16-team SimCHL Postseason & Frozen Four schedule!",
      });
      loadPostseasonGames();
    } catch (err: any) {
      setMsg({
        type: "error",
        text: `Failed to generate tournament schedule: ${err?.message || err}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete Postseason Game
  const handleDeleteGame = async (gameID: number) => {
    try {
      await AdminService.DeleteCHLPostseasonMatch(gameID);
      setPostseasonGames((prev) => prev.filter((g) => g.ID !== gameID));
      setMsg({
        type: "success",
        text: `Deleted postseason match #${gameID}.`,
      });
    } catch (err: any) {
      setMsg({
        type: "error",
        text: `Failed to delete match: ${err?.message || err}`,
      });
    }
  };

  // Team dropdown options
  const allTeamOptions = useMemo(() => {
    return (chlTeams || [])
      .map((t) => ({
        label: `${getCHLTeamName(t)} [${t.Abbreviation || t.Conference}]`,
        value: t.ID.toString(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [chlTeams]);

  // Group scheduled games by round
  const gamesByRound = useMemo(() => {
    const map: Record<string, CollegeGame[]> = {
      "Round of 16": [],
      "Regional Finals": [],
      "Frozen Four (Semifinals)": [],
      "National Championship": [],
      Other: [],
    };

    postseasonGames.forEach((g) => {
      const title = (g.GameTitle || "").toLowerCase();
      if (title.includes("round of 16") || g.Week === 20) {
        map["Round of 16"].push(g);
      } else if (title.includes("quarter") || title.includes("regional") || g.Week === 21) {
        map["Regional Finals"].push(g);
      } else if (title.includes("semi") || title.includes("frozen four") || g.Week === 22) {
        map["Frozen Four (Semifinals)"].push(g);
      } else if (title.includes("champ") || g.IsNationalChampionship || g.Week === 23) {
        map["National Championship"].push(g);
      } else {
        map.Other.push(g);
      }
    });

    return map;
  }, [postseasonGames]);

  return (
    <div className="flex flex-col gap-y-4 w-full p-2">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/60 p-4 rounded-lg border border-gray-800">
        <div>
          <Text variant="h5" classes="font-bold text-white">
            SimCHL Postseason & Frozen Four Championship
          </Text>
          <Text variant="small" classes="text-gray-400">
            16-team national tournament featuring 4 regional brackets, advancing to the Frozen Four and National Championship.
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            className="hidden"
            onChange={handleCSVUpload}
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={autoSeedNationalTournament}
          >
            Auto-Seed (Pairwise/RPI)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Import CSV
          </Button>
          <Button size="sm" variant="secondary" onClick={downloadSampleCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-lg border text-sm font-semibold ${
            msg.type === "success"
              ? "bg-green-900/50 border-green-500 text-green-300"
              : "bg-red-900/50 border-red-500 text-red-300"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* 16-Team National Seed Setup Grid */}
      <Border classes="p-4 bg-gray-800/40 flex flex-col gap-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div>
            <Text variant="h6" classes="font-bold text-white">
              National Tournament Seeds (1 - 16)
            </Text>
            <Text variant="small" classes="text-gray-400">
              Assigned seeds will form the 4 regionals: (1 vs 16), (8 vs 9), (4 vs 13), (5 vs 12), (2 vs 15), (7 vs 10), (3 vs 14), (6 vs 11).
            </Text>
          </div>
          <Button
            variant="primary"
            onClick={handleGeneratePostseason}
            disabled={isGenerating}
          >
            {isGenerating
              ? "Generating Bracket..."
              : "Generate 16-Team Tournament Schedule"}
          </Button>
        </div>

        {/* 16 Seed Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto p-1">
          {seeds.map((teamId, idx) => {
            const seedNum = idx + 1;
            const currentTeam = chlTeamMap?.[teamId];
            const quadrant =
              seedNum <= 4
                ? "Top Seed (#1)"
                : seedNum <= 8
                  ? "High Seed (#2)"
                  : seedNum <= 12
                    ? "Mid Seed (#3)"
                    : "Low Seed (#4)";

            return (
              <div
                key={`national-seed-${seedNum}`}
                className="flex flex-col gap-y-1 p-2.5 rounded bg-gray-900/60 border border-gray-700"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-yellow-400 font-mono">
                    Seed #{seedNum}
                  </span>
                  <span className="text-gray-500 text-[11px]">{quadrant}</span>
                </div>
                <SelectDropdown
                  options={[
                    { label: "-- Select Team --", value: "0" },
                    ...allTeamOptions,
                  ]}
                  value={
                    teamId > 0 && currentTeam
                      ? {
                          label: `${getCHLTeamName(currentTeam)} [${currentTeam.Abbreviation}]`,
                          value: teamId.toString(),
                        }
                      : { label: "-- Select Team --", value: "0" }
                  }
                  onChange={(opt) =>
                    opt && handleSeedChange(idx, Number(opt.value))
                  }
                />
              </div>
            );
          })}
        </div>
      </Border>

      {/* Bracket Matchups Preview Card */}
      <Border classes="p-4 bg-gray-800/40 flex flex-col gap-y-3">
        <Text variant="h6" classes="font-bold text-white border-b border-gray-700 pb-2">
          Round of 16 Matchups Preview
        </Text>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BRACKET_ORDER.map((pair, idx) => {
            const highTeam = chlTeamMap?.[seeds[pair.highSeed - 1]];
            const lowTeam = chlTeamMap?.[seeds[pair.lowSeed - 1]];
            return (
              <div
                key={`pair-${idx}`}
                className="p-3 rounded bg-gray-900/70 border border-gray-700 flex flex-col gap-y-2"
              >
                <span className="text-xs font-semibold text-gray-400">
                  {pair.label}
                </span>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-white truncate">
                    #{pair.highSeed} {highTeam ? getCHLTeamName(highTeam) : "TBD"}
                  </span>
                  <span className="text-xs text-yellow-400 font-mono">H</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-300 truncate">
                    #{pair.lowSeed} {lowTeam ? getCHLTeamName(lowTeam) : "TBD"}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">A</span>
                </div>
              </div>
            );
          })}
        </div>
      </Border>

      {/* Scheduled National Postseason Games */}
      <Border classes="p-4 bg-gray-800/40 flex flex-col gap-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div>
            <Text variant="h6" classes="font-bold text-white">
              Scheduled National Postseason Games ({postseasonGames.length})
            </Text>
            <Text variant="small" classes="text-gray-400">
              Scheduled Round of 16, Regional Finals, Frozen Four, and National Championship games.
            </Text>
          </div>
          <Button size="sm" variant="secondary" onClick={loadPostseasonGames}>
            Refresh
          </Button>
        </div>

        {postseasonGames.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No national postseason games scheduled. Generate the 16-team schedule above to begin the tournament.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-sm text-gray-300 border-collapse">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs sticky top-0">
                <tr>
                  <th className="p-3 border-b border-gray-700 w-24 text-center">
                    Week
                  </th>
                  <th className="p-3 border-b border-gray-700">Matchup</th>
                  <th className="p-3 border-b border-gray-700 w-48">Round / Title</th>
                  <th className="p-3 border-b border-gray-700 w-44">Arena / Location</th>
                  <th className="p-3 border-b border-gray-700 w-28 text-center">
                    Status
                  </th>
                  <th className="p-3 border-b border-gray-700 w-20 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {postseasonGames.map((g) => {
                  const home = chlTeamMap?.[g.HomeTeamID];
                  const away = chlTeamMap?.[g.AwayTeamID];
                  const isCompleted = g.GameComplete;
                  return (
                    <tr
                      key={g.ID}
                      className="border-b border-gray-800 hover:bg-gray-700/30"
                    >
                      <td className="p-3 border-b border-gray-800 text-center font-mono font-bold text-gray-400">
                        Wk {g.Week}
                      </td>
                      <td className="p-3 border-b border-gray-800">
                        <div className="flex items-center gap-x-3">
                          <div className="flex items-center gap-x-1.5 font-semibold text-white">
                            {home && (
                              <Logo
                                url={getLogo(SimCHL, home.ID, currentUser?.IsRetro)}
                                variant="small"
                                containerClass="w-5 h-5"
                              />
                            )}
                            {g.HomeTeamRank > 0 && (
                              <span className="text-yellow-400 text-xs font-mono">
                                #{g.HomeTeamRank}
                              </span>
                            )}
                            <span>{getCHLTeamName(home)}</span>
                          </div>
                          <span className="text-gray-500 font-bold">vs</span>
                          <div className="flex items-center gap-x-1.5 font-semibold text-white">
                            {away && (
                              <Logo
                                url={getLogo(SimCHL, away.ID, currentUser?.IsRetro)}
                                variant="small"
                                containerClass="w-5 h-5"
                              />
                            )}
                            {g.AwayTeamRank > 0 && (
                              <span className="text-yellow-400 text-xs font-mono">
                                #{g.AwayTeamRank}
                              </span>
                            )}
                            <span>{getCHLTeamName(away)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 border-b border-gray-800 text-xs text-gray-300 font-medium">
                        {g.GameTitle || "Postseason Match"}
                      </td>
                      <td className="p-3 border-b border-gray-800 text-xs text-gray-400">
                        {g.Arena || "TBD"}
                        {g.City ? ` (${g.City}, ${g.State})` : ""}
                      </td>
                      <td className="p-3 border-b border-gray-800 text-center">
                        {isCompleted ? (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-900/60 text-green-300 border border-green-500/50">
                            {g.HomeTeamScore} - {g.AwayTeamScore}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-700 text-gray-300">
                            Scheduled
                          </span>
                        )}
                      </td>
                      <td className="p-3 border-b border-gray-800 text-center">
                        <Button
                          size="sm"
                          variant="dangerOutline"
                          onClick={() => handleDeleteGame(g.ID)}
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
        )}
      </Border>
    </div>
  );
};
