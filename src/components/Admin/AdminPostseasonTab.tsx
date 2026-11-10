import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SimCFB } from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import { AdminService, CFBPlayoffSeedDTO } from "../../_services/adminService";
import { getLogo } from "../../_utility/getLogo";
import { useAuthStore } from "../../context/AuthContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { CollegeGame, CollegeTeam } from "../../models/footballModels";

const FBS_SEED_COUNT = 12;
const FCS_SEED_COUNT = 24;

export const AdminPostseasonTab = () => {
  const { currentUser } = useAuthStore();
  const { cfbTeams, cfbTeamMap, cfbStandingsMap, cfb_Timestamp } =
    useSimFBAStore();

  const fbsFileInputRef = useRef<HTMLInputElement | null>(null);
  const fcsFileInputRef = useRef<HTMLInputElement | null>(null);

  const [fbsSeeds, setFbsSeeds] = useState<number[]>(
    Array(FBS_SEED_COUNT).fill(0),
  );
  const [fcsSeeds, setFcsSeeds] = useState<number[]>(
    Array(FCS_SEED_COUNT).fill(0),
  );
  const [postseasonGames, setPostseasonGames] = useState<CollegeGame[]>([]);
  const [isGeneratingFBS, setIsGeneratingFBS] = useState(false);
  const [isGeneratingFCS, setIsGeneratingFCS] = useState(false);
  const [fbsMsg, setFbsMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [fcsMsg, setFcsMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadPostseasonGames = useCallback(async () => {
    try {
      const games = await AdminService.GetCFBPostseasonGames();
      setPostseasonGames(games || []);
    } catch (e) {
      console.error("Failed to load postseason games", e);
    }
  }, []);

  useEffect(() => {
    loadPostseasonGames();
  }, [loadPostseasonGames]);

  const fbsTeams = useMemo(
    () =>
      (cfbTeams || [])
        .filter((t) => t.IsFBS)
        .sort((a, b) => a.TeamName.localeCompare(b.TeamName)),
    [cfbTeams],
  );

  const fcsTeams = useMemo(
    () =>
      (cfbTeams || [])
        .filter((t) => !t.IsFBS)
        .sort((a, b) => a.TeamName.localeCompare(b.TeamName)),
    [cfbTeams],
  );

  const fbsOptions = useMemo(
    () =>
      fbsTeams.map((t) => {
        const st = cfbStandingsMap?.[t.ID];
        const rec = st ? ` (${st.TotalWins}-${st.TotalLosses})` : "";
        const rank = st && st.Rank > 0 ? `#${st.Rank} ` : "";
        return {
          value: t.ID.toString(),
          label: `${rank}${t.TeamName} ${t.Mascot} [${t.TeamAbbr}]${rec}`,
        };
      }),
    [fbsTeams, cfbStandingsMap],
  );

  const fcsOptions = useMemo(
    () =>
      fcsTeams.map((t) => {
        const st = cfbStandingsMap?.[t.ID];
        const rec = st ? ` (${st.TotalWins}-${st.TotalLosses})` : "";
        const rank = st && st.Rank > 0 ? `#${st.Rank} ` : "";
        return {
          value: t.ID.toString(),
          label: `${rank}${t.TeamName} ${t.Mascot} [${t.TeamAbbr}]${rec}`,
        };
      }),
    [fcsTeams, cfbStandingsMap],
  );

  const resolveTeamFromText = useCallback(
    (raw: string, pool: CollegeTeam[]): CollegeTeam | undefined => {
      const cleaned = raw.replace(/^["']|["']$/g, "").trim().toUpperCase();
      if (!cleaned) return undefined;
      const asNum = Number(cleaned);
      if (!Number.isNaN(asNum) && asNum > 0) {
        const byID = pool.find((t) => t.ID === asNum);
        if (byID) return byID;
      }
      return pool.find(
        (t) =>
          t.TeamAbbr.toUpperCase() === cleaned ||
          t.TeamName.toUpperCase() === cleaned ||
          `${t.TeamName} ${t.Mascot}`.toUpperCase() === cleaned,
      );
    },
    [],
  );

  const autoFillFBSFromStandings = () => {
    const sorted = [...fbsTeams].sort((a, b) => {
      const stA = cfbStandingsMap?.[a.ID];
      const stB = cfbStandingsMap?.[b.ID];
      const rA = stA?.Rank && stA.Rank > 0 ? stA.Rank : 999;
      const rB = stB?.Rank && stB.Rank > 0 ? stB.Rank : 999;
      if (rA !== rB) return rA - rB;
      const wDiff = (stB?.TotalWins ?? 0) - (stA?.TotalWins ?? 0);
      if (wDiff !== 0) return wDiff;
      return (stA?.TotalLosses ?? 0) - (stB?.TotalLosses ?? 0);
    });
    setFbsSeeds(sorted.slice(0, FBS_SEED_COUNT).map((t) => t.ID));
    setFbsMsg(null);
  };

  const autoFillFCSFromStandings = () => {
    const sorted = [...fcsTeams].sort((a, b) => {
      const stA = cfbStandingsMap?.[a.ID];
      const stB = cfbStandingsMap?.[b.ID];
      const rA = stA?.Rank && stA.Rank > 0 ? stA.Rank : 999;
      const rB = stB?.Rank && stB.Rank > 0 ? stB.Rank : 999;
      if (rA !== rB) return rA - rB;
      const wDiff = (stB?.TotalWins ?? 0) - (stA?.TotalWins ?? 0);
      if (wDiff !== 0) return wDiff;
      return (stA?.TotalLosses ?? 0) - (stB?.TotalLosses ?? 0);
    });
    setFcsSeeds(sorted.slice(0, FCS_SEED_COUNT).map((t) => t.ID));
    setFcsMsg(null);
  };

  const exportRankingsTemplate = (isFBS: boolean) => {
    const count = isFBS ? FBS_SEED_COUNT : FCS_SEED_COUNT;
    const currentSeeds = isFBS ? fbsSeeds : fcsSeeds;
    const rows = Array.from({ length: count }, (_, idx) => {
      const seedNum = idx + 1;
      const teamID = currentSeeds[idx];
      const team = teamID ? cfbTeamMap?.[teamID] : undefined;
      return `${seedNum},${team?.TeamAbbr ?? ""},${team?.TeamName ?? ""}`;
    });
    const csv = ["Seed,TeamAbbr,TeamName", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const seasonYear = cfb_Timestamp?.Season ?? "cfb";
    link.href = url;
    link.setAttribute(
      "download",
      `${seasonYear}_${isFBS ? "fbs_top_12" : "fcs_top_24"}_rankings.csv`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleUploadRankingsCSV = async (
    e: ChangeEvent<HTMLInputElement>,
    isFBS: boolean,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const count = isFBS ? FBS_SEED_COUNT : FCS_SEED_COUNT;
    const pool = isFBS ? fbsTeams : fcsTeams;
    const setMsg = isFBS ? setFbsMsg : setFcsMsg;

    try {
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const nextSeeds = Array(count).fill(0);
      let startIdx = 0;
      const firstCols = lines[0].toLowerCase().split(",");
      if (
        firstCols[0].includes("seed") ||
        firstCols[0].includes("rank") ||
        firstCols[0].includes("team")
      ) {
        startIdx = 1;
      }

      let sequentialSeed = 1;
      for (let i = startIdx; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        if (cols.length === 0) continue;

        let seedNum = sequentialSeed;
        let teamCandidate = cols[0];

        if (cols.length >= 2 && !Number.isNaN(Number(cols[0]))) {
          seedNum = Number(cols[0]);
          teamCandidate = cols[1] || cols[2] || "";
        }

        if (seedNum >= 1 && seedNum <= count) {
          const matched =
            resolveTeamFromText(teamCandidate, pool) ||
            (cols[2] ? resolveTeamFromText(cols[2], pool) : undefined);
          if (!matched) {
            throw new Error(
              `Could not match '${teamCandidate}' for Seed #${seedNum} to a valid ${isFBS ? "FBS" : "FCS"} team.`,
            );
          }
          nextSeeds[seedNum - 1] = matched.ID;
          sequentialSeed = seedNum + 1;
        }
      }

      if (isFBS) {
        setFbsSeeds(nextSeeds);
      } else {
        setFcsSeeds(nextSeeds);
      }
      setMsg({
        type: "success",
        text: `Loaded ${isFBS ? "FBS Top 12" : "FCS Top 24"} rankings from CSV. Review below and click 'Set ${isFBS ? "FBS" : "FCS"} Playoff Schedule' to save.`,
      });
    } catch (err) {
      setMsg({
        type: "error",
        text: `Failed to parse CSV: ${err instanceof Error ? err.message : err}`,
      });
    } finally {
      if (isFBS && fbsFileInputRef.current) fbsFileInputRef.current.value = "";
      if (!isFBS && fcsFileInputRef.current) fcsFileInputRef.current.value = "";
    }
  };

  const handleGenerateFBSPlayoffs = async () => {
    if (fbsSeeds.some((id) => !id)) {
      setFbsMsg({
        type: "error",
        text: "Please select all 12 FBS Playoff teams (Seeds #1 through #12).",
      });
      return;
    }
    const unique = new Set(fbsSeeds);
    if (unique.size !== FBS_SEED_COUNT) {
      setFbsMsg({
        type: "error",
        text: "Each FBS Playoff seed (#1-#12) must be a unique team.",
      });
      return;
    }

    const payload: CFBPlayoffSeedDTO[] = fbsSeeds.map((teamID, idx) => ({
      Seed: idx + 1,
      TeamID: teamID,
      TeamAbbr: cfbTeamMap?.[teamID]?.TeamAbbr ?? "",
    }));

    setIsGeneratingFBS(true);
    setFbsMsg(null);
    try {
      const created = await AdminService.GenerateFBSPlayoffSchedule({
        Seeds: payload,
      });
      await loadPostseasonGames();
      setFbsMsg({
        type: "success",
        text: `Generated ${created.length} FBS College Football Playoff games (Round 1, Quarterfinals, Semifinals, and National Championship)!`,
      });
    } catch (e) {
      setFbsMsg({
        type: "error",
        text: `Failed to generate FBS playoff schedule: ${e instanceof Error ? e.message : e}`,
      });
    } finally {
      setIsGeneratingFBS(false);
    }
  };

  const handleGenerateFCSPlayoffs = async () => {
    if (fcsSeeds.some((id) => !id)) {
      setFcsMsg({
        type: "error",
        text: "Please select all 24 FCS Playoff teams (Seeds #1 through #24).",
      });
      return;
    }
    const unique = new Set(fcsSeeds);
    if (unique.size !== FCS_SEED_COUNT) {
      setFcsMsg({
        type: "error",
        text: "Each FCS Playoff seed (#1-#24) must be a unique team.",
      });
      return;
    }

    const payload: CFBPlayoffSeedDTO[] = fcsSeeds.map((teamID, idx) => ({
      Seed: idx + 1,
      TeamID: teamID,
      TeamAbbr: cfbTeamMap?.[teamID]?.TeamAbbr ?? "",
    }));

    setIsGeneratingFCS(true);
    setFcsMsg(null);
    try {
      const created = await AdminService.GenerateFCSPlayoffSchedule({
        Seeds: payload,
      });
      await loadPostseasonGames();
      setFcsMsg({
        type: "success",
        text: `Generated ${created.length} FCS Playoff games (First Round, Second Round, Quarterfinals, Semifinals, and FCS National Championship)!`,
      });
    } catch (e) {
      setFcsMsg({
        type: "error",
        text: `Failed to generate FCS playoff schedule: ${e instanceof Error ? e.message : e}`,
      });
    } finally {
      setIsGeneratingFCS(false);
    }
  };

  const fbsPlayoffGames = useMemo(
    () => (postseasonGames || []).filter((g) => g.IsPlayoffGame && g.IsBowlGame),
    [postseasonGames],
  );

  const fcsPlayoffGames = useMemo(
    () =>
      (postseasonGames || []).filter((g) => g.IsPlayoffGame && !g.IsBowlGame),
    [postseasonGames],
  );

  const renderTeamLabel = (seedIdx: number, seedsArr: number[]) => {
    const teamID = seedsArr[seedIdx];
    const team = teamID ? cfbTeamMap?.[teamID] : undefined;
    return team ? `#${seedIdx + 1} ${team.TeamAbbr}` : `#${seedIdx + 1} TBD`;
  };

  return (
    <div className="flex flex-col w-full gap-y-8 p-4">
      {/* SECTION 1: FBS 12-TEAM PLAYOFF COMMITTEE RANKINGS */}
      <Border classes="p-5 flex flex-col gap-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-700 pb-4">
          <div className="flex flex-col gap-y-1">
            <Text variant="h5">
              Section 1: FBS Playoff Committee Rankings (Seeds 1–12)
            </Text>
            <Text variant="small" classes="text-gray-400">
              Upload or select the 12 FBS Playoff teams ranked 1–12 by the
              playoff committee to generate the Round 1 (Week 17), Quarterfinals
              (Week 18 NY6 Bowls), Semifinals (Week 19), and National
              Championship (Week 20) schedule.
            </Text>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fbsFileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleUploadRankingsCSV(e, true)}
            />
            <ButtonGroup>
              <Button
                size="sm"
                variant="secondaryOutline"
                onClick={autoFillFBSFromStandings}
              >
                Auto-Fill Top 12 from Standings
              </Button>
              <Button
                size="sm"
                variant="secondaryOutline"
                onClick={() => exportRankingsTemplate(true)}
              >
                Export CSV Template
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => fbsFileInputRef.current?.click()}
              >
                Upload 1–12 CSV
              </Button>
            </ButtonGroup>
          </div>
        </div>

        {/* 1-12 Seed Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fbsSeeds.map((selectedID, idx) => {
            const seedNumber = idx + 1;
            const isBye = seedNumber <= 4;
            const isHost = seedNumber >= 5 && seedNumber <= 8;
            const selectedOption =
              fbsOptions.find((o) => Number(o.value) === selectedID) ?? null;
            const filteredOptions = fbsOptions.filter(
              (o) =>
                Number(o.value) === selectedID ||
                !fbsSeeds.includes(Number(o.value)),
            );

            return (
              <div
                key={seedNumber}
                className="flex flex-col gap-y-1.5 p-3 rounded bg-gray-900/40 border border-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-2">
                    <span className="font-bold text-sm text-blue-400">
                      Seed #{seedNumber}
                    </span>
                    {selectedID > 0 && (
                      <Logo
                        url={getLogo(SimCFB, selectedID, currentUser?.IsRetro)}
                        variant="tiny"
                      />
                    )}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                    {isBye
                      ? "First-Round Bye (NY6 QF)"
                      : isHost
                        ? `Hosts #${17 - seedNumber} in R1`
                        : `Plays @ #${17 - seedNumber} in R1`}
                  </span>
                </div>
                <SelectDropdown
                  options={filteredOptions}
                  value={selectedOption}
                  onChange={(opt) => {
                    if (!opt) return;
                    const next = [...fbsSeeds];
                    next[idx] = Number(opt.value);
                    setFbsSeeds(next);
                  }}
                  placeholder={`Select FBS Seed #${seedNumber}...`}
                />
              </div>
            );
          })}
        </div>

        {/* Live Bracket Preview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded bg-gray-950/60 border border-gray-800 text-xs">
          <div className="flex flex-col gap-y-1">
            <span className="font-semibold text-gray-300">
              Pod 1 (Rose Bowl QF)
            </span>
            <span className="text-gray-400">
              Bye: {renderTeamLabel(0, fbsSeeds)}
            </span>
            <span className="text-gray-400">
              R1: {renderTeamLabel(8, fbsSeeds)} @{" "}
              {renderTeamLabel(7, fbsSeeds)}
            </span>
          </div>
          <div className="flex flex-col gap-y-1">
            <span className="font-semibold text-gray-300">
              Pod 2 (Cotton Bowl QF)
            </span>
            <span className="text-gray-400">
              Bye: {renderTeamLabel(3, fbsSeeds)}
            </span>
            <span className="text-gray-400">
              R1: {renderTeamLabel(11, fbsSeeds)} @{" "}
              {renderTeamLabel(4, fbsSeeds)}
            </span>
          </div>
          <div className="flex flex-col gap-y-1">
            <span className="font-semibold text-gray-300">
              Pod 3 (Sugar Bowl QF)
            </span>
            <span className="text-gray-400">
              Bye: {renderTeamLabel(1, fbsSeeds)}
            </span>
            <span className="text-gray-400">
              R1: {renderTeamLabel(9, fbsSeeds)} @{" "}
              {renderTeamLabel(6, fbsSeeds)}
            </span>
          </div>
          <div className="flex flex-col gap-y-1">
            <span className="font-semibold text-gray-300">
              Pod 4 (Orange Bowl QF)
            </span>
            <span className="text-gray-400">
              Bye: {renderTeamLabel(2, fbsSeeds)}
            </span>
            <span className="text-gray-400">
              R1: {renderTeamLabel(10, fbsSeeds)} @{" "}
              {renderTeamLabel(5, fbsSeeds)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="primary"
            onClick={handleGenerateFBSPlayoffs}
            disabled={isGeneratingFBS || fbsSeeds.some((id) => !id)}
          >
            {isGeneratingFBS
              ? "Setting FBS Playoff Schedule..."
              : "Set FBS Playoff Schedule (Seeds 1–12)"}
          </Button>
          {fbsMsg && (
            <Text
              variant="body-small"
              classes={
                fbsMsg.type === "success" ? "text-green-400" : "text-red-400"
              }
            >
              {fbsMsg.text}
            </Text>
          )}
        </div>

        {fbsPlayoffGames.length > 0 && (
          <div className="flex flex-col gap-y-2 pt-3 border-t border-gray-800">
            <Text variant="body-small" classes="font-semibold text-gray-300">
              Scheduled FBS Playoff Games ({fbsPlayoffGames.length})
            </Text>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 uppercase">
                    <th className="py-1.5 px-2">ID</th>
                    <th className="py-1.5 px-2">Week</th>
                    <th className="py-1.5 px-2">Game Title</th>
                    <th className="py-1.5 px-2">Home</th>
                    <th className="py-1.5 px-2">Away</th>
                    <th className="py-1.5 px-2">Venue</th>
                    <th className="py-1.5 px-2">Advances To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {fbsPlayoffGames.map((g) => (
                    <tr key={g.ID}>
                      <td className="py-1.5 px-2">{g.ID}</td>
                      <td className="py-1.5 px-2">W{g.Week}</td>
                      <td className="py-1.5 px-2 font-medium">{g.GameTitle}</td>
                      <td className="py-1.5 px-2">
                        {g.HomeTeam
                          ? `${g.HomeTeamRank > 0 ? `#${g.HomeTeamRank} ` : ""}${g.HomeTeam}`
                          : "TBD"}
                      </td>
                      <td className="py-1.5 px-2">
                        {g.AwayTeam
                          ? `${g.AwayTeamRank > 0 ? `#${g.AwayTeamRank} ` : ""}${g.AwayTeam}`
                          : "TBD"}
                      </td>
                      <td className="py-1.5 px-2 text-gray-400">
                        {g.Stadium} ({g.City}, {g.State})
                      </td>
                      <td className="py-1.5 px-2 text-gray-400">
                        {g.NextGameID > 0
                          ? `Game #${g.NextGameID} (${g.NextGameHOA})`
                          : "Champion"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Border>

      {/* SECTION 2: FCS TOP 24 PLAYOFF TEAMS */}
      <Border classes="p-5 flex flex-col gap-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-700 pb-4">
          <div className="flex flex-col gap-y-1">
            <Text variant="h5">
              Section 2: FCS Playoff Bracket (Top 24 FCS Teams)
            </Text>
            <Text variant="small" classes="text-gray-400">
              Upload or select the top 24 FCS teams (Seeds 1–24) to set the FCS
              Playoff schedule: First Round (Week 16, Seeds 9–24), Second Round
              (Week 17, Seeds 1–8 byes), Quarterfinals (Week 18), Semifinals
              (Week 19), and FCS National Championship (Week 20).
            </Text>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fcsFileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleUploadRankingsCSV(e, false)}
            />
            <ButtonGroup>
              <Button
                size="sm"
                variant="secondaryOutline"
                onClick={autoFillFCSFromStandings}
              >
                Auto-Fill Top 24 FCS from Standings
              </Button>
              <Button
                size="sm"
                variant="secondaryOutline"
                onClick={() => exportRankingsTemplate(false)}
              >
                Export CSV Template
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => fcsFileInputRef.current?.click()}
              >
                Upload 1–24 CSV
              </Button>
            </ButtonGroup>
          </div>
        </div>

        {/* 1-24 Seed Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {fcsSeeds.map((selectedID, idx) => {
            const seedNumber = idx + 1;
            const isBye = seedNumber <= 8;
            const isR1Host = seedNumber >= 9 && seedNumber <= 16;
            const selectedOption =
              fcsOptions.find((o) => Number(o.value) === selectedID) ?? null;
            const filteredOptions = fcsOptions.filter(
              (o) =>
                Number(o.value) === selectedID ||
                !fcsSeeds.includes(Number(o.value)),
            );

            return (
              <div
                key={seedNumber}
                className="flex flex-col gap-y-1 p-2.5 rounded bg-gray-900/40 border border-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-1.5">
                    <span className="font-bold text-xs text-amber-400">
                      FCS #{seedNumber}
                    </span>
                    {selectedID > 0 && (
                      <Logo
                        url={getLogo(SimCFB, selectedID, currentUser?.IsRetro)}
                        variant="tiny"
                      />
                    )}
                  </div>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                    {isBye
                      ? "R1 Bye (R2 Host)"
                      : isR1Host
                        ? `Hosts #${33 - seedNumber} (R1)`
                        : `@ #${33 - seedNumber} (R1)`}
                  </span>
                </div>
                <SelectDropdown
                  options={filteredOptions}
                  value={selectedOption}
                  onChange={(opt) => {
                    if (!opt) return;
                    const next = [...fcsSeeds];
                    next[idx] = Number(opt.value);
                    setFcsSeeds(next);
                  }}
                  placeholder={`Select FCS #${seedNumber}...`}
                />
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="primary"
            onClick={handleGenerateFCSPlayoffs}
            disabled={isGeneratingFCS || fcsSeeds.some((id) => !id)}
          >
            {isGeneratingFCS
              ? "Setting FCS Playoff Schedule..."
              : "Set FCS Playoff Schedule (Seeds 1–24)"}
          </Button>
          {fcsMsg && (
            <Text
              variant="body-small"
              classes={
                fcsMsg.type === "success" ? "text-green-400" : "text-red-400"
              }
            >
              {fcsMsg.text}
            </Text>
          )}
        </div>

        {fcsPlayoffGames.length > 0 && (
          <div className="flex flex-col gap-y-2 pt-3 border-t border-gray-800">
            <Text variant="body-small" classes="font-semibold text-gray-300">
              Scheduled FCS Playoff Games ({fcsPlayoffGames.length})
            </Text>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-gray-900">
                  <tr className="border-b border-gray-700 text-gray-400 uppercase">
                    <th className="py-1.5 px-2">ID</th>
                    <th className="py-1.5 px-2">Week</th>
                    <th className="py-1.5 px-2">Round</th>
                    <th className="py-1.5 px-2">Home</th>
                    <th className="py-1.5 px-2">Away</th>
                    <th className="py-1.5 px-2">Venue</th>
                    <th className="py-1.5 px-2">Advances To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {fcsPlayoffGames.map((g) => (
                    <tr key={g.ID}>
                      <td className="py-1.5 px-2">{g.ID}</td>
                      <td className="py-1.5 px-2">W{g.Week}</td>
                      <td className="py-1.5 px-2 font-medium">{g.GameTitle}</td>
                      <td className="py-1.5 px-2">
                        {g.HomeTeam
                          ? `${g.HomeTeamRank > 0 ? `#${g.HomeTeamRank} ` : ""}${g.HomeTeam}`
                          : "TBD"}
                      </td>
                      <td className="py-1.5 px-2">
                        {g.AwayTeam
                          ? `${g.AwayTeamRank > 0 ? `#${g.AwayTeamRank} ` : ""}${g.AwayTeam}`
                          : "TBD"}
                      </td>
                      <td className="py-1.5 px-2 text-gray-400">
                        {g.Stadium
                          ? `${g.Stadium} (${g.City}, ${g.State})`
                          : "Higher Seed Campus"}
                      </td>
                      <td className="py-1.5 px-2 text-gray-400">
                        {g.NextGameID > 0
                          ? `Game #${g.NextGameID} (${g.NextGameHOA})`
                          : "FCS Champion"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Border>
    </div>
  );
};
