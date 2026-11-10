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
import { Input } from "../../_design/Inputs";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import {
  AdminService,
  CBBTournamentMatchDTO,
  CBBTournamentScheduleRequest,
} from "../../_services/adminService";
import { getLogo } from "../../_utility/getLogo";
import { useAuthStore } from "../../context/AuthContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { CollegeStandings, Match, Team } from "../../models/basketballModels";

const TOURNAMENT_SIZES = [
  { value: "8", label: "8-Team Bracket (Quarterfinals -> Semis -> Final)" },
  { value: "4", label: "4-Team Bracket (Semifinals -> Final)" },
  { value: "16", label: "16-Team Bracket (Round 1 -> Quarters -> Semis -> Final)" },
];

const getTeamName = (t?: Team | null): string => {
  if (!t) return "";
  return t.Nickname ? `${t.Team} ${t.Nickname}` : t.Team;
};

const ROUND_OPTIONS = [
  { value: "Round 1", label: "First Round" },
  { value: "Quarterfinals", label: "Quarterfinals" },
  { value: "Semifinals", label: "Semifinals" },
  { value: "Championship", label: "Championship Final" },
];

const TIMESLOT_OPTIONS = [
  { value: "Morning", label: "Morning" },
  { value: "Afternoon", label: "Afternoon" },
  { value: "Evening", label: "Evening" },
  { value: "Night", label: "Night" },
];

export const AdminCBBConfTournamentsTab = () => {
  const { currentUser } = useAuthStore();
  const {
    cbbTeams,
    cbbTeamMap,
    allCBBStandings,
    allCollegeGames,
    currentCollegeSeasonGames,
    cbbConferenceOptions,
    cbb_Timestamp,
  } = useSimBBAStore();

  const csvFileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedConf, setSelectedConf] = useState<string>("");
  const [tournamentSize, setTournamentSize] = useState<number>(8);
  const [seeds, setSeeds] = useState<number[]>(Array(8).fill(0));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Manual fixture scheduling state
  const [manualRound, setManualRound] = useState<string>("Quarterfinals");
  const [manualHomeTeamID, setManualHomeTeamID] = useState<number>(0);
  const [manualAwayTeamID, setManualAwayTeamID] = useState<number>(0);
  const [manualHomeSeed, setManualHomeSeed] = useState<number>(1);
  const [manualAwaySeed, setManualAwaySeed] = useState<number>(8);
  const [manualArena, setManualArena] = useState<string>("");
  const [manualTimeSlot, setManualTimeSlot] = useState<string>("Evening");
  const [manualWeek, setManualWeek] = useState<number>(
    cbb_Timestamp?.CollegeWeek ?? 18,
  );

  // List of conference tournament games
  const [confGames, setConfGames] = useState<Match[]>([]);

  // Initialize selected conference
  useEffect(() => {
    if (cbbConferenceOptions && cbbConferenceOptions.length > 0 && !selectedConf) {
      setSelectedConf(cbbConferenceOptions[0].value);
    }
  }, [cbbConferenceOptions, selectedConf]);

  // Adjust seed array length when tournament size changes
  useEffect(() => {
    setSeeds((prev) => {
      const next = Array(tournamentSize).fill(0);
      for (let i = 0; i < Math.min(prev.length, tournamentSize); i++) {
        next[i] = prev[i];
      }
      return next;
    });
  }, [tournamentSize]);

  // Teams belonging to selected conference
  const confTeams = useMemo(() => {
    if (!cbbTeams || !selectedConf) return [];
    return cbbTeams
      .filter((t) => t.Conference === selectedConf)
      .sort((a, b) => getTeamName(a).localeCompare(getTeamName(b)));
  }, [cbbTeams, selectedConf]);

  // Standings for selected conference
  const confStandings = useMemo(() => {
    if (!allCBBStandings || !selectedConf) return [];
    return allCBBStandings
      .filter((s) => s.ConferenceName === selectedConf)
      .sort((a, b) => {
        // Sort by Conf Win % descending, then overall wins
        const aWinPct =
          a.ConferenceWins + a.ConferenceLosses > 0
            ? a.ConferenceWins / (a.ConferenceWins + a.ConferenceLosses)
            : 0;
        const bWinPct =
          b.ConferenceWins + b.ConferenceLosses > 0
            ? b.ConferenceWins / (b.ConferenceWins + b.ConferenceLosses)
            : 0;
        if (bWinPct !== aWinPct) return bWinPct - aWinPct;
        return b.TotalWins - a.TotalWins;
      });
  }, [allCBBStandings, selectedConf]);

  // Load scheduled conference tournament games
  const loadConfGames = useCallback(() => {
    const gamesSource =
      currentCollegeSeasonGames && currentCollegeSeasonGames.length > 0
        ? currentCollegeSeasonGames
        : allCollegeGames || [];

    const filtered = gamesSource.filter((m) => {
      if (!m.IsConferenceTournament) return false;
      const homeTeam = cbbTeamMap?.[m.HomeTeamID];
      const awayTeam = cbbTeamMap?.[m.AwayTeamID];
      return (
        homeTeam?.Conference === selectedConf ||
        awayTeam?.Conference === selectedConf ||
        m.MatchName?.includes(selectedConf)
      );
    });
    setConfGames(filtered);
  }, [allCollegeGames, currentCollegeSeasonGames, cbbTeamMap, selectedConf]);

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

    const newSeeds = Array(tournamentSize).fill(0);
    for (let i = 0; i < Math.min(tournamentSize, confStandings.length); i++) {
      newSeeds[i] = confStandings[i].TeamID;
    }
    setSeeds(newSeeds);
    setMsg({
      type: "success",
      text: `Auto-seeded top ${Math.min(tournamentSize, confStandings.length)} teams from ${selectedConf} standings.`,
    });
  };

  // CSV Import handler
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
                    getTeamName(t).toLowerCase() === teamIdOrName.toLowerCase() ||
                    (t.Abbr && t.Abbr.toLowerCase() === teamIdOrName.toLowerCase()),
                ) ||
                cbbTeams.find(
                  (t) =>
                    t.ID.toString() === teamIdOrName ||
                    getTeamName(t).toLowerCase() === teamIdOrName.toLowerCase(),
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
        const team = cbbTeamMap?.[teamId];
        return `${idx + 1},${teamId || ""},${getTeamName(team)}`;
      }),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedConf}_Tournament_Seeds.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate Conference Tournament Bracket
  const handleGenerateTournament = async () => {
    // Check if seeds are assigned
    const unassigned = seeds.filter((s) => s === 0).length;
    if (unassigned > 0) {
      setMsg({
        type: "error",
        text: `Please assign all ${tournamentSize} seeds before generating the tournament.`,
      });
      return;
    }

    setIsGenerating(true);
    setMsg(null);
    try {
      const seedPayload = seeds.map((teamId, idx) => ({
        Seed: idx + 1,
        TeamID: teamId,
        TeamName: getTeamName(cbbTeamMap?.[teamId]) || `Team #${teamId}`,
      }));

      const payload: CBBTournamentScheduleRequest = {
        ConferenceID: confTeams[0]?.ConferenceID,
        TournamentName: `${selectedConf} Tournament`,
        Seeds: seedPayload,
        Format:
          tournamentSize === 8
            ? "8-Team"
            : tournamentSize === 4
              ? "4-Team"
              : "16-Team",
      };

      await AdminService.GenerateCBBConferenceTournament(payload);
      setMsg({
        type: "success",
        text: `Successfully generated ${selectedConf} Tournament bracket!`,
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
      const homeTeam = cbbTeamMap?.[manualHomeTeamID];
      const awayTeam = cbbTeamMap?.[manualAwayTeamID];

      const dto: CBBTournamentMatchDTO = {
        TournamentName: `${selectedConf} Tournament`,
        Conference: selectedConf,
        RoundName: manualRound,
        HomeTeamID: manualHomeTeamID,
        AwayTeamID: manualAwayTeamID,
        HomeTeamSeed: manualHomeSeed,
        AwayTeamSeed: manualAwaySeed,
        Week: manualWeek,
        TimeSlot: manualTimeSlot,
        Arena: manualArena || homeTeam?.Arena || "Neutral Arena",
        City: homeTeam?.City || "",
        State: homeTeam?.State || "",
        IsConferenceTournament: true,
      };

      await AdminService.SaveCBBConferenceTournamentMatch(dto);
      setMsg({
        type: "success",
        text: `Successfully scheduled ${manualRound} match: ${getTeamName(homeTeam)} vs ${getTeamName(awayTeam)}!`,
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
      await AdminService.DeleteCBBPostseasonMatch(gameID);
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
      label: `${getTeamName(t)} [${t.Abbr}]`,
    }));
  }, [confTeams]);

  // Group scheduled games by round
  const gamesByRound = useMemo(() => {
    const map: Record<string, Match[]> = {
      "Round 1": [],
      Quarterfinals: [],
      Semifinals: [],
      Championship: [],
      Other: [],
    };

    confGames.forEach((g) => {
      const title = g.MatchName || "";
      if (title.includes("Round 1") || title.includes("First Round")) {
        map["Round 1"].push(g);
      } else if (title.includes("Quarterfinal")) {
        map.Quarterfinals.push(g);
      } else if (title.includes("Semifinal")) {
        map.Semifinals.push(g);
      } else if (title.includes("Championship") || title.includes("Final")) {
        map.Championship.push(g);
      } else {
        map.Other.push(g);
      }
    });

    return map;
  }, [confGames]);

  return (
    <div className="flex flex-col w-full gap-y-6 p-4">
      {/* Top Header & Conference Select */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900/60 p-4 rounded-xl border border-gray-700">
        <div>
          <Text variant="h5" classes="font-bold text-white">
            SimCBB Conference Tournaments
          </Text>
          <Text variant="small" classes="text-gray-400">
            Generate brackets, seed teams, and schedule conference tournament games.
          </Text>
        </div>

        <div className="w-64">
          <SelectDropdown
            options={cbbConferenceOptions || []}
            value={
              cbbConferenceOptions?.find((o) => o.value === selectedConf) || null
            }
            onChange={(opt) => opt && setSelectedConf(opt.value)}
            placeholder="Select Conference"
          />
        </div>
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

      {/* Main Grid: Standings + Seeding Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left: Conference Standings (4 cols) */}
        <Border classes="lg:col-span-4 p-4 flex flex-col gap-y-3 bg-gray-800/40">
          <div className="flex justify-between items-center pb-2 border-b border-gray-700">
            <div>
              <Text variant="h6" classes="font-bold text-white">
                {selectedConf} Standings
              </Text>
              <Text variant="small" classes="text-gray-400">
                Conference win-loss records for seeding.
              </Text>
            </div>
            <Button
              size="xs"
              variant="secondaryOutline"
              onClick={autoSeedFromStandings}
            >
              Auto-Seed
            </Button>
          </div>

          {confStandings.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              No standings records found for {selectedConf}.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-sm text-gray-300 border-collapse">
                <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs sticky top-0">
                  <tr>
                    <th className="p-2 border border-gray-700 text-center">#</th>
                    <th className="p-2 border border-gray-700">Team</th>
                    <th className="p-2 border border-gray-700 text-center">Conf</th>
                    <th className="p-2 border border-gray-700 text-center">Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {confStandings.map((st, idx) => {
                    const team = cbbTeamMap?.[st.TeamID];
                    return (
                      <tr
                        key={st.ID || st.TeamID}
                        className="border-b border-gray-800 hover:bg-gray-700/30"
                      >
                        <td className="p-2 border border-gray-700 text-center font-bold text-cyan-400">
                          {idx + 1}
                        </td>
                        <td className="p-2 border border-gray-700">
                          <div className="flex items-center gap-x-2">
                            {team && (
                              <Logo
                                url={getLogo(SimCBB, team.ID, currentUser?.IsRetro)}
                                variant="small"
                                containerClass="w-5 h-5"
                              />
                            )}
                            <span className="font-semibold text-white">
                              {st.TeamName}
                            </span>
                          </div>
                        </td>
                        <td className="p-2 border border-gray-700 text-center font-mono">
                          {st.ConferenceWins}-{st.ConferenceLosses}
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

        {/* Right: Tournament Seeding & Bracket Setup (8 cols) */}
        <Border classes="lg:col-span-8 p-4 flex flex-col gap-y-4 bg-gray-800/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-gray-700 gap-2">
            <div>
              <Text variant="h6" classes="font-bold text-white">
                {selectedConf} Tournament Seeding
              </Text>
              <Text variant="small" classes="text-gray-400">
                Configure seeded teams and generate the tournament bracket.
              </Text>
            </div>

            <div className="flex items-center gap-2">
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
              <div className="w-48">
                <SelectDropdown
                  options={TOURNAMENT_SIZES}
                  value={
                    TOURNAMENT_SIZES.find(
                      (s) => s.value === tournamentSize.toString(),
                    ) || null
                  }
                  onChange={(opt) =>
                    opt && setTournamentSize(parseInt(opt.value, 10))
                  }
                />
              </div>
            </div>
          </div>

          {/* Seeds Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {seeds.map((teamId, idx) => {
              const seedNum = idx + 1;
              const selectedTeam = cbbTeamMap?.[teamId];
              return (
                <div
                  key={seedNum}
                  className="p-3 rounded-lg border border-gray-700 bg-gray-900/60 flex flex-col gap-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                      Seed #{seedNum}
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
                    options={confTeamOptions}
                    value={
                      confTeamOptions.find(
                        (o) => o.value === teamId.toString(),
                      ) || null
                    }
                    onChange={(opt) => {
                      const newSeeds = [...seeds];
                      newSeeds[idx] = opt ? parseInt(opt.value, 10) : 0;
                      setSeeds(newSeeds);
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
              onClick={handleGenerateTournament}
              disabled={isGenerating}
            >
              {isGenerating
                ? "Generating Bracket..."
                : `Generate ${selectedConf} Tournament`}
            </Button>
          </ButtonGroup>
        </Border>
      </div>

      {/* Manual Fixture Scheduling Section */}
      <Border classes="p-4 flex flex-col gap-y-4 bg-gray-800/40">
        <div className="pb-2 border-b border-gray-700">
          <Text variant="h6" classes="font-bold text-white">
            Schedule Individual Tournament Match
          </Text>
          <Text variant="small" classes="text-gray-400">
            Manually add or update a specific tournament game fixture.
          </Text>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-y-1">
            <Text variant="small" classes="text-gray-400">
              Tournament Round
            </Text>
            <SelectDropdown
              options={ROUND_OPTIONS}
              value={
                ROUND_OPTIONS.find((r) => r.value === manualRound) || null
              }
              onChange={(opt) => opt && setManualRound(opt.value)}
            />
          </div>

          <div className="flex flex-col gap-y-1">
            <Text variant="small" classes="text-gray-400">
              Home Team
            </Text>
            <SelectDropdown
              options={confTeamOptions}
              value={
                confTeamOptions.find(
                  (o) => o.value === manualHomeTeamID.toString(),
                ) || null
              }
              onChange={(opt) =>
                opt && setManualHomeTeamID(parseInt(opt.value, 10))
              }
              placeholder="Select Home Team"
            />
          </div>

          <div className="flex flex-col gap-y-1">
            <Text variant="small" classes="text-gray-400">
              Away Team
            </Text>
            <SelectDropdown
              options={confTeamOptions}
              value={
                confTeamOptions.find(
                  (o) => o.value === manualAwayTeamID.toString(),
                ) || null
              }
              onChange={(opt) =>
                opt && setManualAwayTeamID(parseInt(opt.value, 10))
              }
              placeholder="Select Away Team"
            />
          </div>

          <div className="flex flex-col gap-y-1">
            <Text variant="small" classes="text-gray-400">
              Time Slot
            </Text>
            <SelectDropdown
              options={TIMESLOT_OPTIONS}
              value={
                TIMESLOT_OPTIONS.find((t) => t.value === manualTimeSlot) || null
              }
              onChange={(opt) => opt && setManualTimeSlot(opt.value)}
            />
          </div>

          <Input
            type="number"
            label="Home Seed"
            min={1}
            max={32}
            value={manualHomeSeed}
            onChange={(e) => setManualHomeSeed(parseInt(e.target.value, 10) || 1)}
          />

          <Input
            type="number"
            label="Away Seed"
            min={1}
            max={32}
            value={manualAwaySeed}
            onChange={(e) => setManualAwaySeed(parseInt(e.target.value, 10) || 1)}
          />

          <Input
            type="number"
            label="Week"
            min={1}
            value={manualWeek}
            onChange={(e) => setManualWeek(parseInt(e.target.value, 10) || 1)}
          />

          <Input
            label="Neutral Arena (Optional)"
            placeholder="e.g. Madison Square Garden"
            value={manualArena}
            onChange={(e) => setManualArena(e.target.value)}
          />
        </div>

        <ButtonGroup classes="justify-end">
          <Button
            variant="secondary"
            onClick={handleSaveManualMatch}
            disabled={isSavingManual || !manualHomeTeamID || !manualAwayTeamID}
          >
            {isSavingManual ? "Saving Match..." : "Save Tournament Match"}
          </Button>
        </ButtonGroup>
      </Border>

      {/* Scheduled Tournament Matches Table */}
      <Border classes="p-4 flex flex-col gap-y-4 bg-gray-800/40">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <div>
            <Text variant="h6" classes="font-bold text-white">
              Scheduled {selectedConf} Tournament Matches ({confGames.length})
            </Text>
            <Text variant="small" classes="text-gray-400">
              Active conference tournament fixtures for the current season.
            </Text>
          </div>
          <Button size="xs" variant="secondaryOutline" onClick={loadConfGames}>
            Refresh Matches
          </Button>
        </div>

        {confGames.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            No conference tournament matches currently scheduled for {selectedConf}.
          </div>
        ) : (
          <div className="flex flex-col gap-y-6">
            {Object.entries(gamesByRound).map(([roundName, roundMatches]) => {
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