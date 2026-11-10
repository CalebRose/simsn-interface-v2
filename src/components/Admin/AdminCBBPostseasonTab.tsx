import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SimCBB } from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import {
  AdminService,
  CBBNCAATournamentRequest,
} from "../../_services/adminService";
import { getLogo } from "../../_utility/getLogo";
import { useAuthStore } from "../../context/AuthContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { Match, Team } from "../../models/basketballModels";

const REGIONS = ["East", "South", "Midwest", "West"] as const;
type RegionName = (typeof REGIONS)[number];

const SEEDS_PER_REGION = 16;

const NCAA_ROUNDS = [
  "Round of 64",
  "Round of 32",
  "Sweet 16",
  "Elite 8",
  "Final Four",
  "National Championship",
];

const getTeamName = (t?: Team | null): string => {
  if (!t) return "";
  return t.Nickname ? `${t.Team} ${t.Nickname}` : t.Team;
};

export const AdminCBBPostseasonTab = () => {
  const { currentUser } = useAuthStore();
  const {
    cbbTeams,
    cbbTeamMap,
    allCBBStandings,
    allCollegeGames,
    currentCollegeSeasonGames,
  } = useSimBBAStore();

  const csvFileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<"ncaa" | "nit">("ncaa");
  const [selectedRegion, setSelectedRegion] = useState<RegionName>("East");

  // 64 seeds state: map of region -> array of 16 team IDs (0-indexed: index 0 = Seed 1)
  const [regionSeeds, setRegionSeeds] = useState<Record<RegionName, number[]>>({
    East: Array(SEEDS_PER_REGION).fill(0),
    South: Array(SEEDS_PER_REGION).fill(0),
    Midwest: Array(SEEDS_PER_REGION).fill(0),
    West: Array(SEEDS_PER_REGION).fill(0),
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [tournamentGames, setTournamentGames] = useState<Match[]>([]);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load scheduled NCAA tournament and NIT games
  const loadTournamentGames = useCallback(() => {
    const source =
      currentCollegeSeasonGames && currentCollegeSeasonGames.length > 0
        ? currentCollegeSeasonGames
        : allCollegeGames || [];

    const filtered = source.filter((m) => {
      if (activeTab === "ncaa") {
        return (
          (m.IsPlayoffGame && !m.IsConferenceTournament) ||
          m.IsNationalChampionship ||
          m.MatchName?.includes("NCAA") ||
          m.MatchName?.includes("Round of") ||
          m.MatchName?.includes("Sweet 16") ||
          m.MatchName?.includes("Elite 8") ||
          m.MatchName?.includes("Final Four")
        );
      } else {
        return m.IsNITGame || m.MatchName?.includes("NIT");
      }
    });

    setTournamentGames(filtered);
  }, [allCollegeGames, currentCollegeSeasonGames, activeTab]);

  useEffect(() => {
    loadTournamentGames();
  }, [loadTournamentGames]);

  // Overall sorted teams based on standings / win pct for auto-seeding
  const sortedCBBTeams = useMemo(() => {
    if (!allCBBStandings || allCBBStandings.length === 0) {
      return [...cbbTeams].sort((a, b) =>
        getTeamName(a).localeCompare(getTeamName(b)),
      );
    }

    const sortedStandings = [...allCBBStandings].sort((a, b) => {
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
    });

    const teams: Team[] = [];
    const seen = new Set<number>();
    for (const st of sortedStandings) {
      const t = cbbTeamMap?.[st.TeamID];
      if (t && !seen.has(t.ID)) {
        seen.add(t.ID);
        teams.push(t);
      }
    }
    return teams;
  }, [allCBBStandings, cbbTeams, cbbTeamMap]);

  // Auto-seed all 64 teams into 4 regions in an S-curve
  const autoSeedAll64 = () => {
    if (sortedCBBTeams.length < 64) {
      setMsg({
        type: "error",
        text: `Need at least 64 teams to auto-seed NCAA tournament (found ${sortedCBBTeams.length}).`,
      });
      return;
    }

    const newRegionSeeds: Record<RegionName, number[]> = {
      East: Array(SEEDS_PER_REGION).fill(0),
      South: Array(SEEDS_PER_REGION).fill(0),
      Midwest: Array(SEEDS_PER_REGION).fill(0),
      West: Array(SEEDS_PER_REGION).fill(0),
    };

    // S-curve distribution across 16 seed lines
    let teamIdx = 0;
    for (let seed = 0; seed < SEEDS_PER_REGION; seed++) {
      const order =
        seed % 2 === 0
          ? [REGIONS[0], REGIONS[1], REGIONS[2], REGIONS[3]]
          : [REGIONS[3], REGIONS[2], REGIONS[1], REGIONS[0]];

      for (const reg of order) {
        if (teamIdx < sortedCBBTeams.length) {
          newRegionSeeds[reg][seed] = sortedCBBTeams[teamIdx].ID;
          teamIdx++;
        }
      }
    }

    setRegionSeeds(newRegionSeeds);
    setMsg({
      type: "success",
      text: "Successfully auto-seeded top 64 teams across East, South, Midwest, and West regions!",
    });
  };

  // CSV Import
  const handleCSVUpload = (e: ChangeEvent<HTMLInputElement>) => {
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

        const newRegionSeeds = {
          East: [...regionSeeds.East],
          South: [...regionSeeds.South],
          Midwest: [...regionSeeds.Midwest],
          West: [...regionSeeds.West],
        };

        for (const line of lines) {
          const parts = line.split(",").map((p) => p.trim());
          if (parts.length >= 3) {
            const regInput = parts[0];
            const seedNum = parseInt(parts[1], 10);
            const teamIdOrName = parts[2];

            const matchedRegion = REGIONS.find(
              (r) => r.toLowerCase() === regInput.toLowerCase(),
            );

            if (matchedRegion && seedNum >= 1 && seedNum <= 16) {
              const matchedTeam = cbbTeams.find(
                (t) =>
                  t.ID.toString() === teamIdOrName ||
                  getTeamName(t).toLowerCase() === teamIdOrName.toLowerCase() ||
                  (t.Abbr && t.Abbr.toLowerCase() === teamIdOrName.toLowerCase()),
              );

              if (matchedTeam) {
                newRegionSeeds[matchedRegion][seedNum - 1] = matchedTeam.ID;
              }
            }
          }
        }

        setRegionSeeds(newRegionSeeds);
        setMsg({
          type: "success",
          text: "Successfully imported NCAA tournament seeds from CSV.",
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
  const downloadSampleCSV = () => {
    const rows = ["Region,Seed,TeamID,TeamName"];
    REGIONS.forEach((reg) => {
      regionSeeds[reg].forEach((teamId, idx) => {
        const team = cbbTeamMap?.[teamId];
        rows.push(`${reg},${idx + 1},${teamId || ""},${getTeamName(team)}`);
      });
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "NCAA_Tournament_64_Seeds.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate NCAA Tournament Schedule
  const handleGenerateNCAA = async () => {
    // Validate that all 64 seeds are filled
    let unseededCount = 0;
    REGIONS.forEach((reg) => {
      unseededCount += regionSeeds[reg].filter((s) => s === 0).length;
    });

    if (unseededCount > 0) {
      setMsg({
        type: "error",
        text: `Please assign all 64 seeds across all 4 regions (${unseededCount} seeds remaining).`,
      });
      return;
    }

    setIsGenerating(true);
    setMsg(null);
    try {
      const payload: CBBNCAATournamentRequest = {
        TournamentName: "NCAA Tournament",
        Regions: {
          East: regionSeeds.East.map((teamId, idx) => ({
            Seed: idx + 1,
            TeamID: teamId,
            TeamName: getTeamName(cbbTeamMap?.[teamId]) || `Team #${teamId}`,
          })),
          South: regionSeeds.South.map((teamId, idx) => ({
            Seed: idx + 1,
            TeamID: teamId,
            TeamName: getTeamName(cbbTeamMap?.[teamId]) || `Team #${teamId}`,
          })),
          Midwest: regionSeeds.Midwest.map((teamId, idx) => ({
            Seed: idx + 1,
            TeamID: teamId,
            TeamName: getTeamName(cbbTeamMap?.[teamId]) || `Team #${teamId}`,
          })),
          West: regionSeeds.West.map((teamId, idx) => ({
            Seed: idx + 1,
            TeamID: teamId,
            TeamName: getTeamName(cbbTeamMap?.[teamId]) || `Team #${teamId}`,
          })),
        },
      };

      await AdminService.GenerateCBBPostseasonSchedule(payload);
      setMsg({
        type: "success",
        text: "Successfully generated NCAA Tournament (March Madness) schedule!",
      });
      loadTournamentGames();
    } catch (err: any) {
      setMsg({
        type: "error",
        text: `Failed to generate NCAA tournament: ${err?.message || err}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete Tournament Game
  const handleDeleteGame = async (gameID: number) => {
    try {
      await AdminService.DeleteCBBPostseasonMatch(gameID);
      setTournamentGames((prev) => prev.filter((g) => g.ID !== gameID));
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

  // Dropdown options for all teams
  const allTeamOptions = useMemo(() => {
    return [...cbbTeams]
      .sort((a, b) => getTeamName(a).localeCompare(getTeamName(b)))
      .map((t) => ({
        value: t.ID.toString(),
        label: `${getTeamName(t)} [${t.Abbr || t.Conference}]`,
      }));
  }, [cbbTeams]);

  // Group scheduled games by round
  const gamesByRound = useMemo(() => {
    const map: Record<string, Match[]> = {
      "Round of 64": [],
      "Round of 32": [],
      "Sweet 16": [],
      "Elite 8": [],
      "Final Four": [],
      "National Championship": [],
      Other: [],
    };

    tournamentGames.forEach((g) => {
      const name = g.MatchName || "";
      if (name.includes("Round of 64") || name.includes("First Round")) {
        map["Round of 64"].push(g);
      } else if (name.includes("Round of 32") || name.includes("Second Round")) {
        map["Round of 32"].push(g);
      } else if (name.includes("Sweet 16") || name.includes("Regional Semifinal")) {
        map["Sweet 16"].push(g);
      } else if (name.includes("Elite 8") || name.includes("Regional Final")) {
        map["Elite 8"].push(g);
      } else if (name.includes("Final Four") || name.includes("National Semifinal")) {
        map["Final Four"].push(g);
      } else if (
        name.includes("National Championship") ||
        name.includes("Championship Final") ||
        g.IsNationalChampionship
      ) {
        map["National Championship"].push(g);
      } else {
        map.Other.push(g);
      }
    });

    return map;
  }, [tournamentGames]);

  return (
    <div className="flex flex-col w-full gap-y-6 p-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900/60 p-4 rounded-xl border border-gray-700">
        <div>
          <Text variant="h5" classes="font-bold text-white">
            SimCBB Postseason & NCAA Tournament
          </Text>
          <Text variant="small" classes="text-gray-400">
            64-team March Madness national championship and postseason tournament manager.
          </Text>
        </div>

        <ButtonGroup>
          <Button
            variant={activeTab === "ncaa" ? "primary" : "secondary"}
            onClick={() => setActiveTab("ncaa")}
          >
            NCAA Tournament (64-Team)
          </Button>
          <Button
            variant={activeTab === "nit" ? "primary" : "secondary"}
            onClick={() => setActiveTab("nit")}
          >
            NIT / Other ({tournamentGames.filter((g) => g.IsNITGame).length})
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

      {/* NCAA Tournament 64-Team Seeding Card */}
      {activeTab === "ncaa" && (
        <Border classes="p-4 flex flex-col gap-y-4 bg-gray-800/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-gray-700 gap-3">
            <div>
              <Text variant="h6" classes="font-bold text-white">
                March Madness 64-Team Bracket Seeding
              </Text>
              <Text variant="small" classes="text-gray-400">
                Configure 16 seeds across all 4 national regions.
              </Text>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                ref={csvFileInputRef}
                accept=".csv"
                className="hidden"
                onChange={handleCSVUpload}
              />
              <Button
                size="xs"
                variant="secondaryOutline"
                onClick={autoSeedAll64}
              >
                Auto-Seed All 64
              </Button>
              <Button
                size="xs"
                variant="secondaryOutline"
                onClick={() => csvFileInputRef.current?.click()}
              >
                Import CSV
              </Button>
              <Button
                size="xs"
                variant="secondaryOutline"
                onClick={downloadSampleCSV}
              >
                Sample CSV
              </Button>
            </div>
          </div>

          {/* Region Tabs */}
          <div className="flex gap-2 border-b border-gray-700 pb-2">
            {REGIONS.map((reg) => {
              const isSelected = selectedRegion === reg;
              const filledCount = regionSeeds[reg].filter((s) => s > 0).length;
              return (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-4 py-2 rounded-t-lg font-semibold text-sm transition-colors ${
                    isSelected
                      ? "bg-gray-700 text-white border-t-2 border-cyan-400"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                  }`}
                >
                  {reg} Region ({filledCount}/16)
                </button>
              );
            })}
          </div>

          {/* Selected Region 16 Seeds Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {regionSeeds[selectedRegion].map((teamId, idx) => {
              const seedNum = idx + 1;
              const selectedTeam = cbbTeamMap?.[teamId];
              return (
                <div
                  key={seedNum}
                  className="p-3 rounded-lg border border-gray-700 bg-gray-900/60 flex flex-col gap-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                      {selectedRegion} #{seedNum}
                    </span>
                    {selectedTeam && (
                      <Logo
                        url={getLogo(
                          SimCBB,
                          selectedTeam.ID,
                          currentUser?.IsRetro,
                        )}
                        variant="small"
                        containerClass="w-5 h-5"
                      />
                    )}
                  </div>
                  <SelectDropdown
                    options={allTeamOptions}
                    value={
                      allTeamOptions.find(
                        (o) => o.value === teamId.toString(),
                      ) || null
                    }
                    onChange={(opt) => {
                      const newReg = [...regionSeeds[selectedRegion]];
                      newReg[idx] = opt ? parseInt(opt.value, 10) : 0;
                      setRegionSeeds((prev) => ({
                        ...prev,
                        [selectedRegion]: newReg,
                      }));
                    }}
                    placeholder={`Select #${seedNum}`}
                  />
                </div>
              );
            })}
          </div>

          <ButtonGroup classes="justify-end pt-2">
            <Button
              variant="primary"
              onClick={handleGenerateNCAA}
              disabled={isGenerating}
            >
              {isGenerating
                ? "Generating Tournament..."
                : "Generate NCAA Tournament Schedule"}
            </Button>
          </ButtonGroup>
        </Border>
      )}

      {/* Scheduled Tournament Matches Table */}
      <Border classes="p-4 flex flex-col gap-y-4 bg-gray-800/40">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div>
            <Text variant="h6" classes="font-bold text-white">
              Scheduled Postseason Matches ({tournamentGames.length})
            </Text>
            <Text variant="small" classes="text-gray-400">
              Active NCAA and postseason tournament games.
            </Text>
          </div>
          <Button
            size="xs"
            variant="secondaryOutline"
            onClick={loadTournamentGames}
          >
            Refresh Games
          </Button>
        </div>

        {tournamentGames.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            No postseason matches currently scheduled.
          </div>
        ) : (
          <div className="flex flex-col gap-y-6">
            {NCAA_ROUNDS.concat(["Other"]).map((roundName) => {
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
                          const homeTeam = cbbTeamMap?.[match.HomeTeamID];
                          const awayTeam = cbbTeamMap?.[match.AwayTeamID];
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
                                        SimCBB,
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
                                        SimCBB,
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
    </div>
  );
};