import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SimNFL } from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import { AdminService, NFLPlayoffSeedDTO } from "../../_services/adminService";
import { getLogo } from "../../_utility/getLogo";
import { useAuthStore } from "../../context/AuthContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { NFLGame, NFLTeam } from "../../models/footballModels";

const SEEDS_PER_CONFERENCE = 7;

export const AdminNFLPostseasonTab = () => {
  const { currentUser } = useAuthStore();
  const { nflTeams, proTeamMap, allProStandings, cfb_Timestamp } =
    useSimFBAStore();

  const afcFileInputRef = useRef<HTMLInputElement | null>(null);
  const nfcFileInputRef = useRef<HTMLInputElement | null>(null);

  const [afcSeeds, setAfcSeeds] = useState<number[]>(
    Array(SEEDS_PER_CONFERENCE).fill(0),
  );
  const [nfcSeeds, setNfcSeeds] = useState<number[]>(
    Array(SEEDS_PER_CONFERENCE).fill(0),
  );
  const [postseasonGames, setPostseasonGames] = useState<NFLGame[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const standingsMap = useMemo(() => {
    const map: Record<number, any> = {};
    if (allProStandings && Array.isArray(allProStandings)) {
      for (const st of allProStandings) {
        if (st && st.TeamID) {
          map[st.TeamID] = st;
        }
      }
    }
    return map;
  }, [allProStandings]);

  const loadPostseasonGames = useCallback(async () => {
    try {
      const games = await AdminService.GetNFLPostseasonGames();
      setPostseasonGames(games || []);
    } catch (e) {
      console.error("Failed to load NFL postseason games", e);
    }
  }, []);

  useEffect(() => {
    loadPostseasonGames();
  }, [loadPostseasonGames]);

  const afcTeams = useMemo(() => {
    return (nflTeams || [])
      .filter((t) => {
        const conf = (t.Conference || "").toUpperCase();
        return conf.includes("AFC") || conf.includes("AMERICAN") || t.ConferenceID === 1;
      })
      .sort((a, b) => a.TeamName.localeCompare(b.TeamName));
  }, [nflTeams]);

  const nfcTeams = useMemo(() => {
    return (nflTeams || [])
      .filter((t) => {
        const conf = (t.Conference || "").toUpperCase();
        return conf.includes("NFC") || conf.includes("NATIONAL") || t.ConferenceID === 2;
      })
      .sort((a, b) => a.TeamName.localeCompare(b.TeamName));
  }, [nflTeams]);

  const afcOptions = useMemo(
    () =>
      afcTeams.map((t) => {
        const st = standingsMap[t.ID];
        const rec = st ? ` (${st.TotalWins}-${st.TotalLosses})` : "";
        return {
          value: t.ID.toString(),
          label: `${t.TeamName} ${t.Mascot} [${t.TeamAbbr}]${rec}`,
        };
      }),
    [afcTeams, standingsMap],
  );

  const nfcOptions = useMemo(
    () =>
      nfcTeams.map((t) => {
        const st = standingsMap[t.ID];
        const rec = st ? ` (${st.TotalWins}-${st.TotalLosses})` : "";
        return {
          value: t.ID.toString(),
          label: `${t.TeamName} ${t.Mascot} [${t.TeamAbbr}]${rec}`,
        };
      }),
    [nfcTeams, standingsMap],
  );

  const autoFillAFCFromStandings = () => {
    const sorted = [...afcTeams].sort((a, b) => {
      const stA = standingsMap[a.ID];
      const stB = standingsMap[b.ID];
      const rA = stA?.Rank && stA.Rank > 0 ? stA.Rank : 999;
      const rB = stB?.Rank && stB.Rank > 0 ? stB.Rank : 999;
      if (rA !== rB) return rA - rB;
      const wDiff = (stB?.TotalWins ?? 0) - (stA?.TotalWins ?? 0);
      if (wDiff !== 0) return wDiff;
      return (stA?.TotalLosses ?? 0) - (stB?.TotalLosses ?? 0);
    });
    setAfcSeeds(sorted.slice(0, SEEDS_PER_CONFERENCE).map((t) => t.ID));
    setMsg(null);
  };

  const autoFillNFCFromStandings = () => {
    const sorted = [...nfcTeams].sort((a, b) => {
      const stA = standingsMap[a.ID];
      const stB = standingsMap[b.ID];
      const rA = stA?.Rank && stA.Rank > 0 ? stA.Rank : 999;
      const rB = stB?.Rank && stB.Rank > 0 ? stB.Rank : 999;
      if (rA !== rB) return rA - rB;
      const wDiff = (stB?.TotalWins ?? 0) - (stA?.TotalWins ?? 0);
      if (wDiff !== 0) return wDiff;
      return (stA?.TotalLosses ?? 0) - (stB?.TotalLosses ?? 0);
    });
    setNfcSeeds(sorted.slice(0, SEEDS_PER_CONFERENCE).map((t) => t.ID));
    setMsg(null);
  };

  const exportRankingsTemplate = (isAFC: boolean) => {
    const currentSeeds = isAFC ? afcSeeds : nfcSeeds;
    const confName = isAFC ? "AFC" : "NFC";
    const rows = Array.from({ length: SEEDS_PER_CONFERENCE }, (_, idx) => {
      const seedNum = idx + 1;
      const teamID = currentSeeds[idx];
      const team = teamID ? proTeamMap?.[teamID] : undefined;
      return `${seedNum},${confName},${team?.TeamAbbr ?? ""},${team?.TeamName ?? ""}`;
    });
    const csv = ["Seed,Conference,TeamAbbr,TeamName", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const seasonYear = cfb_Timestamp?.Season ?? "nfl";
    link.href = url;
    link.setAttribute(
      "download",
      `${seasonYear}_${confName.toLowerCase()}_playoff_seeds.csv`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleUploadRankingsCSV = async (
    e: ChangeEvent<HTMLInputElement>,
    isAFC: boolean,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const pool = isAFC ? afcTeams : nfcTeams;

    try {
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const nextSeeds = Array(SEEDS_PER_CONFERENCE).fill(0);
      let startIdx = 0;
      const firstCols = lines[0].toLowerCase().split(",");
      if (firstCols.some((c) => c.includes("seed") || c.includes("team"))) {
        startIdx = 1;
      }

      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.trim());
        if (parts.length === 0 || !parts[0]) continue;
        const seedIdx = Number(parts[0]) - 1;
        if (seedIdx < 0 || seedIdx >= SEEDS_PER_CONFERENCE) continue;

        let teamIdent = parts.length > 2 ? parts[2] : parts[1];
        if (!teamIdent && parts.length > 1) teamIdent = parts[1];

        const matched = pool.find(
          (t) =>
            t.TeamAbbr.toUpperCase() === teamIdent?.toUpperCase() ||
            t.TeamName.toUpperCase() === teamIdent?.toUpperCase() ||
            t.ID === Number(teamIdent),
        );

        if (matched) {
          nextSeeds[seedIdx] = matched.ID;
        }
      }

      if (isAFC) {
        setAfcSeeds(nextSeeds);
      } else {
        setNfcSeeds(nextSeeds);
      }
      setMsg({
        type: "success",
        text: `Loaded seeds from CSV for ${isAFC ? "AFC" : "NFC"}!`,
      });
    } catch (err: any) {
      setMsg({
        type: "error",
        text: `Failed to parse CSV: ${err?.message || "Invalid format"}`,
      });
    } finally {
      e.target.value = "";
    }
  };

  const handleGeneratePlayoffs = async () => {
    setMsg(null);
    const unassignedAFC = afcSeeds.findIndex((id) => !id || id === 0);
    if (unassignedAFC !== -1) {
      setMsg({
        type: "error",
        text: `Please assign a team for AFC Seed #${unassignedAFC + 1}.`,
      });
      return;
    }

    const unassignedNFC = nfcSeeds.findIndex((id) => !id || id === 0);
    if (unassignedNFC !== -1) {
      setMsg({
        type: "error",
        text: `Please assign a team for NFC Seed #${unassignedNFC + 1}.`,
      });
      return;
    }

    const afcSet = new Set(afcSeeds);
    if (afcSet.size !== SEEDS_PER_CONFERENCE) {
      setMsg({
        type: "error",
        text: "Duplicate teams detected in AFC playoff seeds.",
      });
      return;
    }

    const nfcSet = new Set(nfcSeeds);
    if (nfcSet.size !== SEEDS_PER_CONFERENCE) {
      setMsg({
        type: "error",
        text: "Duplicate teams detected in NFC playoff seeds.",
      });
      return;
    }

    const allSeeds: NFLPlayoffSeedDTO[] = [];
    afcSeeds.forEach((teamID, idx) => {
      const team = proTeamMap?.[teamID];
      allSeeds.push({
        Seed: idx + 1,
        TeamID: teamID,
        TeamAbbr: team?.TeamAbbr ?? "",
        Conference: "AFC",
      });
    });

    nfcSeeds.forEach((teamID, idx) => {
      const team = proTeamMap?.[teamID];
      allSeeds.push({
        Seed: idx + 1,
        TeamID: teamID,
        TeamAbbr: team?.TeamAbbr ?? "",
        Conference: "NFC",
      });
    });

    setIsGenerating(true);
    try {
      const games = await AdminService.GenerateNFLPlayoffSchedule({
        Seeds: allSeeds,
      });
      setPostseasonGames(games || []);
      setMsg({
        type: "success",
        text: "NFL Playoff Schedule successfully generated!",
      });
    } catch (err: any) {
      setMsg({
        type: "error",
        text: err?.message || "Failed to generate NFL playoff schedule.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteGame = async (gameID: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this playoff game? This cannot be undone.",
      )
    ) {
      return;
    }
    try {
      await AdminService.DeleteNFLPostseasonGame(gameID);
      await loadPostseasonGames();
    } catch (err: any) {
      alert(`Failed to delete game: ${err?.message || "Unknown error"}`);
    }
  };

  const getRoundLabel = (week: number) => {
    switch (week) {
      case 19:
        return "Wild Card Weekend (Week 19)";
      case 20:
        return "Divisional Round (Week 20)";
      case 21:
        return "Conference Championships (Week 21)";
      case 22:
        return "Super Bowl (Week 22)";
      default:
        return `Postseason Week ${week}`;
    }
  };

  return (
    <div className="flex flex-col w-full gap-y-6 p-4">
      {msg && (
        <div
          className={`p-3 rounded-lg border text-sm font-semibold ${
            msg.type === "success"
              ? "bg-green-900/40 border-green-500 text-green-300"
              : "bg-red-900/40 border-red-500 text-red-300"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Seeds Config Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900/60 p-4 rounded-xl border border-gray-700">
        <div>
          <Text variant="h5" classes="text-white font-bold tracking-wide">
            NFL Postseason Playoff Seeds (14 Teams)
          </Text>
          <Text variant="small" classes="text-gray-400">
            Set the top 7 AFC seeds and top 7 NFC seeds to generate the 4-round
            playoff bracket (Wild Card, Divisional, Conference Championships, Super Bowl).
          </Text>
        </div>
        <Button
          variant="primary"
          onClick={handleGeneratePlayoffs}
          disabled={isGenerating}
        >
          {isGenerating ? "GENERATING..." : "GENERATE NFL PLAYOFF SCHEDULE"}
        </Button>
      </div>

      {/* Grid of AFC & NFC Seeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* AFC Bracket */}
        <Border classes="p-4 flex flex-col gap-y-3 bg-gray-800/40">
          <div className="flex flex-row justify-between items-center pb-2 border-b border-gray-700">
            <div className="flex items-center gap-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <Text variant="h6" classes="font-bold text-white">
                AFC Seeds (1-7)
              </Text>
            </div>
            <ButtonGroup>
              <Button size="xs" variant="secondary" onClick={autoFillAFCFromStandings}>
                Auto-fill
              </Button>
              <Button size="xs" variant="secondary" onClick={() => exportRankingsTemplate(true)}>
                Export CSV
              </Button>
              <Button
                size="xs"
                variant="secondary"
                onClick={() => afcFileInputRef.current?.click()}
              >
                Import CSV
              </Button>
            </ButtonGroup>
            <input
              type="file"
              ref={afcFileInputRef}
              accept=".csv"
              className="hidden"
              onChange={(e) => handleUploadRankingsCSV(e, true)}
            />
          </div>

          <div className="flex flex-col gap-y-2 mt-2">
            {Array.from({ length: SEEDS_PER_CONFERENCE }, (_, idx) => {
              const seedNum = idx + 1;
              const currentTeamID = afcSeeds[idx];
              return (
                <div
                  key={`afc-seed-${seedNum}`}
                  className="flex items-center gap-x-3 p-2 rounded-lg bg-gray-900/50 border border-gray-700"
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      seedNum === 1
                        ? "bg-amber-500 text-black font-extrabold"
                        : "bg-gray-700 text-gray-200"
                    }`}
                  >
                    #{seedNum}
                  </span>
                  {currentTeamID > 0 && (
                    <Logo
                      url={getLogo(SimNFL, currentTeamID, currentUser?.IsRetro)}
                      variant="small"
                      containerClass="w-7 h-7"
                    />
                  )}
                  <div className="flex-1">
                    <SelectDropdown
                      options={afcOptions}
                      value={
                        afcOptions.find(
                          (o) => o.value === (currentTeamID ? currentTeamID.toString() : ""),
                        ) || null
                      }
                      onChange={(opt) => {
                        const next = [...afcSeeds];
                        next[idx] = Number(opt?.value ?? 0);
                        setAfcSeeds(next);
                      }}
                      placeholder={`Select AFC Seed #${seedNum}${
                        seedNum === 1 ? " (1st Round Bye)" : ""
                      }`}
                    />
                  </div>
                  {seedNum === 1 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-600">
                      BYE
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Border>

        {/* NFC Bracket */}
        <Border classes="p-4 flex flex-col gap-y-3 bg-gray-800/40">
          <div className="flex flex-row justify-between items-center pb-2 border-b border-gray-700">
            <div className="flex items-center gap-x-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <Text variant="h6" classes="font-bold text-white">
                NFC Seeds (1-7)
              </Text>
            </div>
            <ButtonGroup>
              <Button size="xs" variant="secondary" onClick={autoFillNFCFromStandings}>
                Auto-fill
              </Button>
              <Button size="xs" variant="secondary" onClick={() => exportRankingsTemplate(false)}>
                Export CSV
              </Button>
              <Button
                size="xs"
                variant="secondary"
                onClick={() => nfcFileInputRef.current?.click()}
              >
                Import CSV
              </Button>
            </ButtonGroup>
            <input
              type="file"
              ref={nfcFileInputRef}
              accept=".csv"
              className="hidden"
              onChange={(e) => handleUploadRankingsCSV(e, false)}
            />
          </div>

          <div className="flex flex-col gap-y-2 mt-2">
            {Array.from({ length: SEEDS_PER_CONFERENCE }, (_, idx) => {
              const seedNum = idx + 1;
              const currentTeamID = nfcSeeds[idx];
              return (
                <div
                  key={`nfc-seed-${seedNum}`}
                  className="flex items-center gap-x-3 p-2 rounded-lg bg-gray-900/50 border border-gray-700"
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      seedNum === 1
                        ? "bg-amber-500 text-black font-extrabold"
                        : "bg-gray-700 text-gray-200"
                    }`}
                  >
                    #{seedNum}
                  </span>
                  {currentTeamID > 0 && (
                    <Logo
                      url={getLogo(SimNFL, currentTeamID, currentUser?.IsRetro)}
                      variant="small"
                      containerClass="w-7 h-7"
                    />
                  )}
                  <div className="flex-1">
                    <SelectDropdown
                      options={nfcOptions}
                      value={
                        nfcOptions.find(
                          (o) => o.value === (currentTeamID ? currentTeamID.toString() : ""),
                        ) || null
                      }
                      onChange={(opt) => {
                        const next = [...nfcSeeds];
                        next[idx] = Number(opt?.value ?? 0);
                        setNfcSeeds(next);
                      }}
                      placeholder={`Select NFC Seed #${seedNum}${
                        seedNum === 1 ? " (1st Round Bye)" : ""
                      }`}
                    />
                  </div>
                  {seedNum === 1 && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-600">
                      BYE
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Border>
      </div>

      {/* Scheduled Postseason Games Table */}
      <Border classes="p-4 flex flex-col gap-y-3 bg-gray-800/40">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <Text variant="h6" classes="font-bold text-white">
            Generated NFL Postseason Schedule ({postseasonGames.length} Games)
          </Text>
          <Button size="xs" variant="secondary" onClick={loadPostseasonGames}>
            Refresh Games
          </Button>
        </div>

        {postseasonGames.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            No NFL postseason games found for the current season. Configure the
            seeds above and click &quot;Generate NFL Playoff Schedule&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300 border-collapse">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs">
                <tr>
                  <th className="p-2 border border-gray-700">Round / Week</th>
                  <th className="p-2 border border-gray-700">Matchup Title</th>
                  <th className="p-2 border border-gray-700">Timeslot</th>
                  <th className="p-2 border border-gray-700">Away Team</th>
                  <th className="p-2 border border-gray-700 text-center">Score</th>
                  <th className="p-2 border border-gray-700">Home Team</th>
                  <th className="p-2 border border-gray-700">Status</th>
                  <th className="p-2 border border-gray-700 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {postseasonGames.map((game) => {
                  const isComplete = game.GameComplete;
                  return (
                    <tr
                      key={game.ID}
                      className="border-b border-gray-800 hover:bg-gray-700/30"
                    >
                      <td className="p-2 border border-gray-700 font-semibold text-white whitespace-nowrap">
                        {getRoundLabel(game.Week)}
                      </td>
                      <td className="p-2 border border-gray-700 text-gray-300">
                        {game.GameTitle || `Game #${game.ID}`}
                      </td>
                      <td className="p-2 border border-gray-700 text-gray-400 whitespace-nowrap">
                        {game.TimeSlot}
                      </td>
                      <td className="p-2 border border-gray-700">
                        <div className="flex items-center gap-x-2">
                          {game.AwayTeamID > 0 && (
                            <Logo
                              url={getLogo(SimNFL, game.AwayTeamID, currentUser?.IsRetro)}
                              variant="small"
                              containerClass="w-5 h-5"
                            />
                          )}
                          <span
                            className={
                              isComplete && game.AwayTeamWin
                                ? "font-bold text-green-400"
                                : "text-gray-200"
                            }
                          >
                            {game.AwayTeam || "TBD"}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 border border-gray-700 text-center font-mono font-bold whitespace-nowrap">
                        {isComplete
                          ? `${game.AwayTeamScore} - ${game.HomeTeamScore}`
                          : "vs"}
                      </td>
                      <td className="p-2 border border-gray-700">
                        <div className="flex items-center gap-x-2">
                          {game.HomeTeamID > 0 && (
                            <Logo
                              url={getLogo(SimNFL, game.HomeTeamID, currentUser?.IsRetro)}
                              variant="small"
                              containerClass="w-5 h-5"
                            />
                          )}
                          <span
                            className={
                              isComplete && game.HomeTeamWin
                                ? "font-bold text-green-400"
                                : "text-gray-200"
                            }
                          >
                            {game.HomeTeam || "TBD"}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 border border-gray-700 whitespace-nowrap">
                        {isComplete ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-green-900/60 text-green-300 border border-green-700 font-semibold">
                            Final
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs bg-yellow-900/50 text-yellow-300 border border-yellow-700">
                            Scheduled
                          </span>
                        )}
                      </td>
                      <td className="p-2 border border-gray-700 text-center whitespace-nowrap">
                        {!isComplete && (
                          <Button
                            size="xs"
                            variant="danger"
                            onClick={() => handleDeleteGame(game.ID)}
                          >
                            Delete
                          </Button>
                        )}
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
