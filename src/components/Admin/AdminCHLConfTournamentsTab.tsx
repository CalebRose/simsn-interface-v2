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
import { Input } from "../../_design/Inputs";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import {
  AdminService,
  CHLConferenceTournamentRequest,
  CHLTournamentMatchDTO,
} from "../../_services/adminService";
import { getLogo } from "../../_utility/getLogo";
import { useAuthStore } from "../../context/AuthContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import {
  CollegeGame,
  CollegeStandings,
  CollegeTeam,
} from "../../models/hockeyModels";

const TOURNAMENT_SIZES = [
  { value: "8", label: "8-Team Bracket (Quarterfinals Best-of-3 -> Semis -> Final)" },
  { value: "4", label: "4-Team Bracket (Semifinals -> Final)" },
  { value: "6", label: "6-Team Bracket (Top 2 Byes -> Semis -> Final)" },
];

const getCHLTeamName = (t?: CollegeTeam | null): string => {
  if (!t) return "";
  return t.Mascot ? `${t.TeamName} ${t.Mascot}` : t.TeamName;
};

export const AdminCHLConfTournamentsTab = () => {
  const { currentUser } = useAuthStore();
  const {
    chlTeams,
    chlTeamMap,
    chlConferenceOptions,
    allCHLStandings,
    allCollegeGames,
    currentCollegeSeasonGames,
    hck_Timestamp,
  } = useSimHCKStore();

  // Conference selector
  const [selectedConf, setSelectedConf] = useState<string>("");
  const [tournamentSize, setTournamentSize] = useState<number>(8);
  const [seeds, setSeeds] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  // Manual Match Scheduling form state
  const [manualRound, setManualRound] = useState<string>("Quarterfinals");
  const [manualHomeTeamID, setManualHomeTeamID] = useState<number>(0);
  const [manualAwayTeamID, setManualAwayTeamID] = useState<number>(0);
  const [manualHomeSeed, setManualHomeSeed] = useState<number>(1);
  const [manualAwaySeed, setManualAwaySeed] = useState<number>(8);
  const [manualWeek, setManualWeek] = useState<number>(18);
  const [manualGameDay, setManualGameDay] = useState<string>("A");
  const [manualArena, setManualArena] = useState<string>("");
  const [isSavingManual, setIsSavingManual] = useState<boolean>(false);

  // Scheduled games for current conference
  const [confGames, setConfGames] = useState<CollegeGame[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Conferences list
  const conferenceList = useMemo(() => {
    if (chlConferenceOptions && chlConferenceOptions.length > 0) {
      return chlConferenceOptions.filter((c) => c.value !== "ALL");
    }
    const set = new Set<string>();
    (chlTeams || []).forEach((t) => {
      if (t.Conference && t.Conference.trim().length > 0) {
        set.add(t.Conference);
      }
    });
    return Array.from(set)
      .sort()
      .map((c) => ({ label: c, value: c }));
  }, [chlConferenceOptions, chlTeams]);

  // Set default conference on initial load
  useEffect(() => {
    if (!selectedConf && conferenceList.length > 0) {
      setSelectedConf(conferenceList[0].value);
    }
  }, [conferenceList, selectedConf]);

  // Reset seed slots when tournament size changes
  useEffect(() => {
    setSeeds((prev) => {
      const next = new Array(tournamentSize).fill(0);
      for (let i = 0; i < Math.min(prev.length, tournamentSize); i++) {
        next[i] = prev[i];
      }
      return next;
    });
  }, [tournamentSize]);

  // Teams belonging to selected conference
  const confTeams = useMemo(() => {
    if (!chlTeams || !selectedConf) return [];
    return chlTeams
      .filter((t) => t.Conference === selectedConf)
      .sort((a, b) => getCHLTeamName(a).localeCompare(getCHLTeamName(b)));
  }, [chlTeams, selectedConf]);

  // Standings for selected conference
  const confStandings = useMemo(() => {
    if (!allCHLStandings || !selectedConf) return [];
    const list = allCHLStandings.filter((s) => {
      const team = chlTeamMap?.[s.TeamID];
      return team?.Conference === selectedConf;
    });

    // Sort by Points descending, then GoalsFor descending
    return [...list].sort((a, b) => {
      const ptsA = Number(a.Points || 0);
      const ptsB = Number(b.Points || 0);
      if (ptsA !== ptsB) return ptsB - ptsA;
      return Number(b.GoalsFor || 0) - Number(a.GoalsFor || 0);
    });
  }, [allCHLStandings, selectedConf, chlTeamMap]);

  // Load scheduled games for selected conference tournament
  const loadConfGames = useCallback(() => {
    const gamesSource =
      currentCollegeSeasonGames && currentCollegeSeasonGames.length > 0
        ? currentCollegeSeasonGames
        : allCollegeGames || [];

    const filtered = gamesSource.filter((g) => {
      const homeTeam = chlTeamMap?.[g.HomeTeamID];
      const awayTeam = chlTeamMap?.[g.AwayTeamID];
      const isConfGame =
        homeTeam?.Conference === selectedConf ||
        awayTeam?.Conference === selectedConf ||
        g.GameTitle?.includes(selectedConf);

      const isTourney =
        Boolean((g as any).IsConferenceTournament) ||
        g.IsPlayoffGame ||
        g.GameTitle?.toLowerCase().includes("tournament") ||
        g.GameTitle?.toLowerCase().includes("quarterfinal") ||
        g.GameTitle?.toLowerCase().includes("semifinal") ||
        g.GameTitle?.toLowerCase().includes("championship");

      return isConfGame && isTourney;
    });

    setConfGames(filtered);
  }, [
    allCollegeGames,
    currentCollegeSeasonGames,
    selectedConf,
    chlTeamMap,
  ]);

  useEffect(() => {
    loadConfGames();
  }, [loadConfGames]);

  // Auto-seed from standings
  const autoSeedFromStandings = () => {
    if (confStandings.length === 0) {
      setMsg({
        type: "error",
        text: `No standings found for ${selectedConf} to auto-seed.`,
      });
      return;
    }
    const newSeeds = new Array(tournamentSize).fill(0);
    for (let i = 0; i < Math.min(confStandings.length, tournamentSize); i++) {
      newSeeds[i] = confStandings[i].TeamID;
    }
    setSeeds(newSeeds);
    setMsg({
      type: "success",
      text: `Auto-seeded top ${tournamentSize} teams from ${selectedConf} standings (by Points & Goals For).`,
    });
  };

  // Change single seed manually
  const handleSeedChange = (index: number, teamId: number) => {
    setSeeds((prev) => {
      const updated = [...prev];
      updated[index] = teamId;
      return updated;
    });
  };

  // CSV Import for Tournament Seeds
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

            if (seedNum >= 1 && seedNum <= tournamentSize) {
              const matchedTeam =
                confTeams.find(
                  (t) =>
                    t.ID.toString() === teamIdOrName ||
                    getCHLTeamName(t).toLowerCase() === teamIdOrName.toLowerCase() ||
                    (t.Abbreviation && t.Abbreviation.toLowerCase() === teamIdOrName.toLowerCase()),
                ) ||
                chlTeams.find(
                  (t) =>
                    t.ID.toString() === teamIdOrName ||
                    getCHLTeamName(t).toLowerCase() === teamIdOrName.toLowerCase(),
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
          text: `Successfully imported seeds from CSV.`,
        });
      } catch (err: any) {
        setMsg({
          type: "error",
          text: `Failed to parse CSV: ${err?.message || err}`,
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Download Sample CSV
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
    a.download = `${selectedConf.replace(/\s+/g, "_")}_Tournament_Seeds.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate Conference Tournament Schedule
  const handleGenerateTournament = async () => {
    const unsetCount = seeds.filter((s) => s === 0).length;
    if (unsetCount > 0) {
      setMsg({
        type: "error",
        text: `Please assign all ${tournamentSize} seed slots before generating the bracket.`,
      });
      return;
    }

    setIsGenerating(true);
    setMsg(null);
    try {
      const seedPayload = seeds.map((teamId, idx) => ({
        Seed: idx + 1,
        TeamID: teamId,
        TeamName: getCHLTeamName(chlTeamMap?.[teamId]) || `Team #${teamId}`,
      }));

      const payload: CHLConferenceTournamentRequest = {
        ConferenceID: confTeams[0]?.ConferenceID,
        Conference: selectedConf,
        Format:
          tournamentSize === 8
            ? "8-Team"
            : tournamentSize === 4
              ? "4-Team"
              : "6-Team",
        Seeds: seedPayload,
      };

      await AdminService.GenerateCHLConferenceTournament(payload);
      setMsg({
        type: "success",
        text: `Successfully generated ${selectedConf} Hockey Tournament bracket!`,
      });
      loadConfGames();
    } catch (err: any) {
      setMsg({
        type: "error",
        text: `Failed to generate tournament: ${err?.message || err}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Schedule Single Manual Tournament Match
  const handleSaveManualMatch = async () => {
    if (!manualHomeTeamID || !manualAwayTeamID) {
      setMsg({
        type: "error",
        text: "Please select both Home and Away teams.",
      });
      return;
    }
    if (manualHomeTeamID === manualAwayTeamID) {
      setMsg({
        type: "error",
        text: "Home and Away teams cannot be the same.",
      });
      return;
    }

    setIsSavingManual(true);
    setMsg(null);
    try {
      const homeTeam = chlTeamMap?.[manualHomeTeamID];
      const awayTeam = chlTeamMap?.[manualAwayTeamID];

      const dto: CHLTournamentMatchDTO = {
        GameTitle: `${selectedConf} ${manualRound}`,
        Conference: selectedConf,
        RoundName: manualRound,
        HomeTeamID: manualHomeTeamID,
        AwayTeamID: manualAwayTeamID,
        HomeTeamSeed: manualHomeSeed,
        AwayTeamSeed: manualAwaySeed,
        Week: manualWeek,
        GameDay: manualGameDay,
        Arena: manualArena || homeTeam?.Arena || "Neutral Arena",
        City: homeTeam?.City || "",
        State: homeTeam?.State || "",
        IsConferenceTournament: true,
        IsPlayoffGame: true,
      };

      await AdminService.SaveCHLConferenceTournamentMatch(dto);
      setMsg({
        type: "success",
        text: `Successfully scheduled ${manualRound} match: ${getCHLTeamName(homeTeam)} vs ${getCHLTeamName(awayTeam)}!`,
      });
      loadConfGames();
    } catch (err: any) {
      setMsg({
        type: "error",
        text: `Failed to save match: ${err?.message || err}`,
      });
    } finally {
      setIsSavingManual(false);
    }
  };

  // Delete Tournament Game
  const handleDeleteGame = async (gameID: number) => {
    try {
      await AdminService.DeleteCHLPostseasonMatch(gameID);
      setConfGames((prev) => prev.filter((g) => g.ID !== gameID));
      setMsg({
        type: "success",
        text: `Deleted tournament game #${gameID}.`,
      });
    } catch (err: any) {
      setMsg({
        type: "error",
        text: `Failed to delete game: ${err?.message || err}`,
      });
    }
  };

  // Team dropdown options for current conference
  const confTeamOptions = useMemo(() => {
    return confTeams.map((t) => ({
      value: t.ID.toString(),
      label: `${getCHLTeamName(t)} [${t.Abbreviation}]`,
    }));
  }, [confTeams]);

  // Group scheduled games by round
  const gamesByRound = useMemo(() => {
    const map: Record<string, CollegeGame[]> = {
      Quarterfinals: [],
      Semifinals: [],
      Championship: [],
      Other: [],
    };

    confGames.forEach((g) => {
      const title = (g.GameTitle || "").toLowerCase();
      if (title.includes("quarter")) {
        map.Quarterfinals.push(g);
      } else if (title.includes("semi")) {
        map.Semifinals.push(g);
      } else if (
        title.includes("final") ||
        title.includes("champ") ||
        g.IsNationalChampionship
      ) {
        map.Championship.push(g);
      } else {
        map.Other.push(g);
      }
    });

    return map;
  }, [confGames]);

  return (
    <div className="flex flex-col gap-y-4 w-full p-2">
      {/* Header & Conference Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/60 p-4 rounded-lg border border-gray-800">
        <div>
          <Text variant="h5" classes="font-bold text-white">
            SimCHL Conference Tournaments Manager
          </Text>
          <Text variant="small" classes="text-gray-400">
            Configure, seed, and generate single/multi-game tournament brackets for college hockey conferences.
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-56">
            <SelectDropdown
              options={conferenceList}
              value={
                conferenceList.find((c) => c.value === selectedConf) || {
                  label: selectedConf,
                  value: selectedConf,
                }
              }
              onChange={(opt) => opt && setSelectedConf(opt.value)}
            />
          </div>
          <div className="w-64">
            <SelectDropdown
              options={TOURNAMENT_SIZES}
              value={
                TOURNAMENT_SIZES.find(
                  (s) => s.value === tournamentSize.toString(),
                ) || TOURNAMENT_SIZES[0]
              }
              onChange={(opt) => opt && setTournamentSize(Number(opt.value))}
            />
          </div>
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

      {/* Main Grid: Standings & Seeding Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Conference Standings (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-y-3">
          <Border classes="p-4 bg-gray-800/40 flex flex-col gap-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-700">
              <Text variant="h6" classes="font-bold text-white">
                {selectedConf} Standings
              </Text>
              <Button size="sm" variant="secondary" onClick={autoSeedFromStandings}>
                Auto-Seed ({tournamentSize})
              </Button>
            </div>

            {confStandings.length === 0 ? (
              <div className="py-6 text-center text-gray-400 text-sm">
                No standings data found for {selectedConf}.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[380px]">
                <table className="w-full text-left text-xs text-gray-300 border-collapse">
                  <thead className="bg-gray-900/80 text-gray-400 uppercase sticky top-0">
                    <tr>
                      <th className="p-2 border border-gray-700 w-10 text-center">
                        #
                      </th>
                      <th className="p-2 border border-gray-700">Team</th>
                      <th className="p-2 border border-gray-700 text-center">
                        Pts
                      </th>
                      <th className="p-2 border border-gray-700 text-center">
                        Conf Rec
                      </th>
                      <th className="p-2 border border-gray-700 text-center">
                        GF / GA
                      </th>
                      <th className="p-2 border border-gray-700 text-center">
                        Overall
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {confStandings.map((st, idx) => {
                      const team = chlTeamMap?.[st.TeamID];
                      return (
                        <tr
                          key={st.TeamID}
                          className="border-b border-gray-800 hover:bg-gray-700/30"
                        >
                          <td className="p-2 border border-gray-700 text-center font-bold text-gray-400 font-mono">
                            {idx + 1}
                          </td>
                          <td className="p-2 border border-gray-700">
                            <div className="flex items-center gap-x-2">
                              {team && (
                                <Logo
                                  url={getLogo(
                                    SimCHL,
                                    team.ID,
                                    currentUser?.IsRetro,
                                  )}
                                  variant="small"
                                  containerClass="w-5 h-5"
                                />
                              )}
                              <span className="font-semibold text-white">
                                {st.TeamName || getCHLTeamName(team)}
                              </span>
                            </div>
                          </td>
                          <td className="p-2 border border-gray-700 text-center font-mono font-bold text-yellow-400">
                            {st.Points ?? 0}
                          </td>
                          <td className="p-2 border border-gray-700 text-center font-mono">
                            {st.ConferenceWins}-{st.ConferenceLosses}
                            {st.ConferenceOTLosses ? `-${st.ConferenceOTLosses}` : ""}
                          </td>
                          <td className="p-2 border border-gray-700 text-center font-mono text-gray-400">
                            {st.GoalsFor ?? 0} / {st.GoalsAgainst ?? 0}
                          </td>
                          <td className="p-2 border border-gray-700 text-center font-mono text-gray-400">
                            {st.TotalWins}-{st.TotalLosses}
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

        {/* Right Column: Seeding Grid & Generator (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-y-3">
          <Border classes="p-4 bg-gray-800/40 flex flex-col gap-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-gray-700">
              <div>
                <Text variant="h6" classes="font-bold text-white">
                  Tournament Bracket Seeding ({tournamentSize} Teams)
                </Text>
                <Text variant="small" classes="text-gray-400">
                  Assign seeds for {selectedConf}. Top seed plays bottom seed.
                </Text>
              </div>

              <div className="flex items-center gap-2">
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
                  onClick={() => fileInputRef.current?.click()}
                >
                  Import CSV
                </Button>
                <Button size="sm" variant="secondary" onClick={downloadSampleCSV}>
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Seed Assignment Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto p-1">
              {seeds.map((teamId, idx) => {
                const seedNum = idx + 1;
                const currentTeam = chlTeamMap?.[teamId];
                return (
                  <div
                    key={`seed-${seedNum}`}
                    className="flex items-center gap-x-2 p-2 rounded bg-gray-900/60 border border-gray-700"
                  >
                    <span className="w-8 text-center font-bold text-yellow-400 font-mono">
                      #{seedNum}
                    </span>
                    <div className="flex-1">
                      <SelectDropdown
                        options={[
                          { label: "-- Select Team --", value: "0" },
                          ...confTeamOptions,
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
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-700">
              <Button
                variant="primary"
                onClick={handleGenerateTournament}
                disabled={isGenerating}
              >
                {isGenerating
                  ? "Generating Bracket..."
                  : `Generate ${selectedConf} Tournament Schedule`}
              </Button>
            </div>
          </Border>
        </div>
      </div>

      {/* Manual Game Scheduling Accordion / Section */}
      <Border classes="p-4 bg-gray-800/40 flex flex-col gap-y-3">
        <Text variant="h6" classes="font-bold text-white border-b border-gray-700 pb-2">
          Schedule Single Tournament Game (Manual)
        </Text>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 mb-1">Round</span>
            <SelectDropdown
              options={[
                { label: "Quarterfinals", value: "Quarterfinals" },
                { label: "Semifinals", value: "Semifinals" },
                { label: "Conference Championship", value: "Conference Championship" },
              ]}
              value={{ label: manualRound, value: manualRound }}
              onChange={(opt) => opt && setManualRound(opt.value)}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-400 mb-1">Home Team (High Seed)</span>
            <SelectDropdown
              options={[
                { label: "-- Select Home Team --", value: "0" },
                ...confTeamOptions,
              ]}
              value={
                manualHomeTeamID > 0
                  ? {
                      label: getCHLTeamName(chlTeamMap?.[manualHomeTeamID]),
                      value: manualHomeTeamID.toString(),
                    }
                  : { label: "-- Select Home Team --", value: "0" }
              }
              onChange={(opt) => opt && setManualHomeTeamID(Number(opt.value))}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-400 mb-1">Away Team (Low Seed)</span>
            <SelectDropdown
              options={[
                { label: "-- Select Away Team --", value: "0" },
                ...confTeamOptions,
              ]}
              value={
                manualAwayTeamID > 0
                  ? {
                      label: getCHLTeamName(chlTeamMap?.[manualAwayTeamID]),
                      value: manualAwayTeamID.toString(),
                    }
                  : { label: "-- Select Away Team --", value: "0" }
              }
              onChange={(opt) => opt && setManualAwayTeamID(Number(opt.value))}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-400 mb-1">Arena (or Neutral)</span>
            <Input
              value={manualArena}
              placeholder="e.g. Xcel Energy Center"
              onChange={(e) => setManualArena(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-400 mb-1">Week</span>
            <Input
              type="number"
              value={manualWeek}
              onChange={(e) => setManualWeek(Number(e.target.value) || 18)}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-400 mb-1">Game Day (Slot)</span>
            <SelectDropdown
              options={[
                { label: "Day A", value: "A" },
                { label: "Day B", value: "B" },
                { label: "Day C", value: "C" },
                { label: "Day D", value: "D" },
              ]}
              value={{ label: `Day ${manualGameDay}`, value: manualGameDay }}
              onChange={(opt) => opt && setManualGameDay(opt.value)}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-400 mb-1">Home Seed</span>
            <Input
              type="number"
              value={manualHomeSeed}
              onChange={(e) => setManualHomeSeed(Number(e.target.value) || 1)}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-400 mb-1">Away Seed</span>
            <Input
              type="number"
              value={manualAwaySeed}
              onChange={(e) => setManualAwaySeed(Number(e.target.value) || 8)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="secondary"
            onClick={handleSaveManualMatch}
            disabled={isSavingManual}
          >
            {isSavingManual ? "Saving Match..." : "Save Tournament Match"}
          </Button>
        </div>
      </Border>

      {/* Scheduled Tournament Matches Table */}
      <Border classes="p-4 bg-gray-800/40 flex flex-col gap-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div>
            <Text variant="h6" classes="font-bold text-white">
              Scheduled {selectedConf} Tournament Games ({confGames.length})
            </Text>
            <Text variant="small" classes="text-gray-400">
              Active games scheduled for the {selectedConf} conference tournament.
            </Text>
          </div>
          <Button size="sm" variant="secondary" onClick={loadConfGames}>
            Refresh
          </Button>
        </div>

        {confGames.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No tournament matches scheduled for {selectedConf}. Generate the bracket above or schedule manually.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-sm text-gray-300 border-collapse">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs sticky top-0">
                <tr>
                  <th className="p-3 border-b border-gray-700 w-24 text-center">
                    Week/Day
                  </th>
                  <th className="p-3 border-b border-gray-700">Matchup</th>
                  <th className="p-3 border-b border-gray-700 w-44">Title / Round</th>
                  <th className="p-3 border-b border-gray-700 w-44">Arena</th>
                  <th className="p-3 border-b border-gray-700 w-28 text-center">
                    Status
                  </th>
                  <th className="p-3 border-b border-gray-700 w-20 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {confGames.map((g) => {
                  const home = chlTeamMap?.[g.HomeTeamID];
                  const away = chlTeamMap?.[g.AwayTeamID];
                  const isCompleted = g.GameComplete;
                  return (
                    <tr
                      key={g.ID}
                      className="border-b border-gray-800 hover:bg-gray-700/30"
                    >
                      <td className="p-3 border-b border-gray-800 text-center font-mono font-bold text-gray-400">
                        Wk {g.Week} ({g.GameDay || "A"})
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
                        {g.GameTitle || "Tournament Match"}
                      </td>
                      <td className="p-3 border-b border-gray-800 text-xs text-gray-400">
                        {g.Arena || "TBD"}
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
