import { useEffect, useState, useMemo } from "react";
import { Modal } from "../../../_design/Modal";
import { TabGroup, Tab } from "../../../_design/Tabs";
import { Text } from "../../../_design/Typography";
import { BaseballService } from "../../../_services/baseballService";
import {
  BoxScoreResponse,
  BoxScoreBattingLine,
  BoxScorePitchingLine,
  BoxScoreSubstitution,
  PlayByPlayEntry,
} from "../../../models/baseball/baseballStatsModels";
import { getLogo } from "../../../_utility/getLogo";
import { League, SimMLB, SimCollegeBaseball } from "../../../_constants/constants";
import "../../../components/Team/baseball/baseballMobile.css";

const POS_DISPLAY: Record<string, string> = {
  c: "C", fb: "1B", sb: "2B", tb: "3B", ss: "SS",
  lf: "LF", cf: "CF", rf: "RF", dh: "DH", p: "P",
  startingpitcher: "P",
};

interface Props {
  gameId: number | null;
  isOpen: boolean;
  onClose: () => void;
  league: string;
  isRetro?: boolean;
  onPlayerClick?: (playerId: number) => void;
}

export const BaseballBoxScoreModal = ({ gameId, isOpen, onClose, league, isRetro, onPlayerClick }: Props) => {
  const [boxScore, setBoxScore] = useState<BoxScoreResponse | null>(null);
  const [pbpData, setPbpData] = useState<PlayByPlayEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pbpLoading, setPbpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Box Score");

  const leagueType = league === SimMLB ? SimMLB : SimCollegeBaseball;

  // Load boxscore (without PBP for speed)
  useEffect(() => {
    if (!isOpen || !gameId) {
      setBoxScore(null);
      setPbpData(null);
      setError(null);
      setActiveTab("Box Score");
      return;
    }
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await BaseballService.GetBoxScore(gameId, false);
        setBoxScore(data);
        // If PBP was included in boxscore response, use it
        if (data.play_by_play && data.play_by_play.length > 0) {
          setPbpData(data.play_by_play);
        }
      } catch (e: any) {
        setError(e?.message ?? "Failed to load box score");
      }
      setIsLoading(false);
    };
    load();
  }, [isOpen, gameId]);

  // Lazy-load PBP when tab selected
  useEffect(() => {
    if (activeTab !== "Play-by-Play" || pbpData || !gameId || pbpLoading) return;
    const load = async () => {
      setPbpLoading(true);
      try {
        const data = await BaseballService.GetPlayByPlay(gameId);
        setPbpData(data.play_by_play ?? []);
      } catch {
        setPbpData([]);
      }
      setPbpLoading(false);
    };
    load();
  }, [activeTab, pbpData, gameId, pbpLoading]);

  const title = boxScore
    ? `${boxScore.away_team.abbrev} @ ${boxScore.home_team.abbrev} — Week ${boxScore.season_week}`
    : "Box Score";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-5xl" classes="max-h-[85vh] overflow-y-auto mx-2 sm:mx-auto !p-3 sm:!p-6">
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Text variant="body" classes="text-gray-400">Loading box score...</Text>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center py-12">
          <Text variant="body" classes="text-red-500">{error}</Text>
        </div>
      )}
      {boxScore && !isLoading && (
        <div>
          {/* Tabs */}
          <TabGroup classes="mb-4">
            <Tab label="Box Score" selected={activeTab === "Box Score"} setSelected={setActiveTab} />
            <Tab label="Play-by-Play" selected={activeTab === "Play-by-Play"} setSelected={setActiveTab} />
          </TabGroup>

          {activeTab === "Box Score" && (
            <BoxScoreTab boxScore={boxScore} leagueType={leagueType} isRetro={isRetro} onPlayerClick={onPlayerClick} />
          )}
          {activeTab === "Play-by-Play" && (
            <PlayByPlayTab
              plays={pbpData}
              isLoading={pbpLoading}
              homeAbbrev={boxScore.home_team.abbrev}
              awayAbbrev={boxScore.away_team.abbrev}
              onPlayerClick={onPlayerClick}
            />
          )}
        </div>
      )}
    </Modal>
  );
};

// ═══════════════════════════════════════════════
// Box Score Tab
// ═══════════════════════════════════════════════

const BoxScoreTab = ({
  boxScore,
  leagueType,
  isRetro,
  onPlayerClick,
}: {
  boxScore: BoxScoreResponse;
  leagueType: League;
  isRetro?: boolean;
  onPlayerClick?: (playerId: number) => void;
}) => {
  const allSubs = boxScore.substitutions ?? [];

  // Build player_id → position lookup from defense dict (reverse map)
  const buildPosMap = (def?: Record<string, number>): Record<number, string> => {
    if (!def) return {};
    const map: Record<number, string> = {};
    for (const [pos, pid] of Object.entries(def)) {
      map[pid] = pos;
    }
    return map;
  };
  const awayPosMap = buildPosMap(boxScore.defense?.away);
  const homePosMap = buildPosMap(boxScore.defense?.home);

  return (
    <div className="space-y-6">
      {/* Linescore */}
      {boxScore.linescore?.away && boxScore.linescore?.home ? (
        <LinescoreTable boxScore={boxScore} leagueType={leagueType} isRetro={isRetro} />
      ) : (
        <div className="text-center py-3">
          <Text variant="small" classes="text-gray-400">Linescore not available for this game.</Text>
        </div>
      )}

      {/* Away Batting */}
      <div>
        <SectionHeader label={`${boxScore.away_team.abbrev} Batting`} teamId={boxScore.away_team.id} leagueType={leagueType} isRetro={isRetro} />
        <BattingLineTable lines={boxScore.batting.away} posMap={awayPosMap} onPlayerClick={onPlayerClick} />
      </div>

      {/* Home Batting */}
      <div>
        <SectionHeader label={`${boxScore.home_team.abbrev} Batting`} teamId={boxScore.home_team.id} leagueType={leagueType} isRetro={isRetro} />
        <BattingLineTable lines={boxScore.batting.home} posMap={homePosMap} onPlayerClick={onPlayerClick} />
      </div>

      {/* Away Pitching */}
      <div>
        <SectionHeader label={`${boxScore.away_team.abbrev} Pitching`} teamId={boxScore.away_team.id} leagueType={leagueType} isRetro={isRetro} />
        <PitchingLineTable lines={boxScore.pitching.away} onPlayerClick={onPlayerClick} />
      </div>

      {/* Home Pitching */}
      <div>
        <SectionHeader label={`${boxScore.home_team.abbrev} Pitching`} teamId={boxScore.home_team.id} leagueType={leagueType} isRetro={isRetro} />
        <PitchingLineTable lines={boxScore.pitching.home} onPlayerClick={onPlayerClick} />
      </div>

      {/* Substitutions */}
      {allSubs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-1 pb-1 border-b border-gray-200 dark:border-gray-600">
            <Text variant="body-small" classes="font-bold">Substitutions</Text>
          </div>
          <SubstitutionsList subs={allSubs} onPlayerClick={onPlayerClick} />
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════

const SectionHeader = ({ label, teamId, leagueType, isRetro }: { label: string; teamId: number; leagueType: League; isRetro?: boolean }) => {
  const logo = getLogo(leagueType, teamId, isRetro);
  return (
    <div className="flex items-center gap-2 mb-1 pb-1 border-b border-gray-200 dark:border-gray-600">
      {logo && <img src={logo} className="w-5 h-5 object-contain" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
      <Text variant="body-small" classes="font-bold">{label}</Text>
    </div>
  );
};

const LinescoreTable = ({ boxScore, leagueType, isRetro }: { boxScore: BoxScoreResponse; leagueType: League; isRetro?: boolean }) => {
  const ls = boxScore.linescore!;
  const numInnings = ls.innings ?? Math.max(ls.away.runs.length, ls.home.runs.length);
  const innings = Array.from({ length: numInnings }, (_, i) => i);

  const awayLogo = getLogo(leagueType, boxScore.away_team.id, isRetro);
  const homeLogo = getLogo(leagueType, boxScore.home_team.id, isRetro);

  return (
    <div className="compact-table overflow-x-auto flex justify-center">
      <table className="border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-gray-300 dark:border-gray-500">
            <th className="px-3 py-1 text-left min-w-[5rem]"></th>
            {innings.map((i) => (
              <th key={i} className="px-2 py-1 text-center min-w-[2rem]">{i + 1}</th>
            ))}
            <th className="px-2 py-1 text-center font-bold border-l-2 border-gray-300 dark:border-gray-500">R</th>
            <th className="px-2 py-1 text-center font-bold">H</th>
            <th className="px-2 py-1 text-center font-bold">E</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200 dark:border-gray-600">
            <td className="px-3 py-1.5 font-semibold">
              <div className="flex items-center gap-1.5">
                {awayLogo && <img src={awayLogo} className="w-4 h-4 object-contain" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                {boxScore.away_team.abbrev}
              </div>
            </td>
            {innings.map((i) => (
              <td key={i} className="px-1.5 sm:px-2 py-1.5 text-center">
                {i < ls.away.runs.length ? ls.away.runs[i] : ""}
              </td>
            ))}
            <td className="px-1.5 sm:px-2 py-1.5 text-center font-bold border-l-2 border-gray-300 dark:border-gray-500">{ls.away.R}</td>
            <td className="px-1.5 sm:px-2 py-1.5 text-center">{ls.away.H}</td>
            <td className="px-1.5 sm:px-2 py-1.5 text-center">{ls.away.E}</td>
          </tr>
          <tr>
            <td className="px-3 py-1.5 font-semibold">
              <div className="flex items-center gap-1.5">
                {homeLogo && <img src={homeLogo} className="w-4 h-4 object-contain" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                {boxScore.home_team.abbrev}
              </div>
            </td>
            {innings.map((i) => (
              <td key={i} className="px-1.5 sm:px-2 py-1.5 text-center">
                {i < ls.home.runs.length ? ls.home.runs[i] : ""}
              </td>
            ))}
            <td className="px-1.5 sm:px-2 py-1.5 text-center font-bold border-l-2 border-gray-300 dark:border-gray-500">{ls.home.R}</td>
            <td className="px-1.5 sm:px-2 py-1.5 text-center">{ls.home.H}</td>
            <td className="px-1.5 sm:px-2 py-1.5 text-center">{ls.home.E}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// ── Batting Table ────────────────────────────────────────────────────

const BattingLineTable = ({ lines, posMap, onPlayerClick }: { lines: BoxScoreBattingLine[]; posMap?: Record<number, string>; onPlayerClick?: (playerId: number) => void }) => {
  if (lines.length === 0) {
    return <Text variant="small" classes="text-gray-400 py-2">No batting data available.</Text>;
  }

  const hasHbp = lines.some((l) => l.hbp > 0);
  const hasCs = lines.some((l) => l.cs > 0);
  const hasItphr = lines.some((l) => l.itphr > 0);

  return (
    <div className="compact-table overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
            <th className="px-1.5 sm:px-2 py-1 text-left min-w-[8rem]">Player</th>
            <th className="px-1 py-1 text-center">Pos</th>
            <th className="px-1 py-1 text-center" title="At Bats (Plate Appearances)">AB</th>
            <th className="px-1 py-1 text-center">R</th>
            <th className="px-1 py-1 text-center">H</th>
            <th className="px-1 py-1 text-center">2B</th>
            <th className="px-1 py-1 text-center">3B</th>
            <th className="px-1 py-1 text-center">HR</th>
            {hasItphr && <th className="px-1 py-1 text-center" title="Inside-the-Park HR">ITPHR</th>}
            <th className="px-1 py-1 text-center">RBI</th>
            <th className="px-1 py-1 text-center">BB</th>
            {hasHbp && <th className="px-1 py-1 text-center">HBP</th>}
            <th className="px-1 py-1 text-center">SO</th>
            <th className="px-1 py-1 text-center">SB</th>
            {hasCs && <th className="px-1 py-1 text-center">CS</th>}
          </tr>
        </thead>
        <tbody>
          {lines.map((line, idx) => (
            <tr key={line.player_id} className={`border-b border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}`}>
              <td className="px-2 py-1">
                {onPlayerClick ? (
                  <span className="cursor-pointer hover:underline hover:text-blue-500" onClick={() => onPlayerClick(line.player_id)}>{line.name}</span>
                ) : line.name}
              </td>
              <td className="px-1 py-1 text-center text-gray-500 dark:text-gray-400">{(() => { const raw = line.pos || posMap?.[line.player_id] || ""; if (!raw) return "DH"; return POS_DISPLAY[raw.toLowerCase()] ?? raw; })()}</td>
              <td className="px-1 py-1 text-center" title={line.pa > 0 ? `PA: ${line.pa}` : undefined}>{line.ab}</td>
              <td className="px-1 py-1 text-center">{line.r}</td>
              <td className="px-1 py-1 text-center font-semibold">{line.h}</td>
              <td className="px-1 py-1 text-center">{line["2b"] || ""}</td>
              <td className="px-1 py-1 text-center">{line["3b"] || ""}</td>
              <td className="px-1 py-1 text-center font-semibold">{line.hr > 0 ? line.hr : ""}</td>
              {hasItphr && <td className="px-1 py-1 text-center">{line.itphr > 0 ? line.itphr : ""}</td>}
              <td className="px-1 py-1 text-center">{line.rbi}</td>
              <td className="px-1 py-1 text-center">{line.bb}</td>
              {hasHbp && <td className="px-1 py-1 text-center">{line.hbp || ""}</td>}
              <td className="px-1 py-1 text-center">{line.so}</td>
              <td className="px-1 py-1 text-center">{line.sb > 0 ? line.sb : ""}</td>
              {hasCs && <td className="px-1 py-1 text-center">{line.cs > 0 ? line.cs : ""}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Pitching Table ───────────────────────────────────────────────────

const PitchingLineTable = ({ lines, onPlayerClick }: { lines: BoxScorePitchingLine[]; onPlayerClick?: (playerId: number) => void }) => {
  if (lines.length === 0) {
    return <Text variant="small" classes="text-gray-400 py-2">No pitching data available.</Text>;
  }

  // Sort: starter(s) first, then relievers in original order
  const sorted = [...lines].sort((a, b) => b.gs - a.gs);

  // Detect if expanded data is available (pc > 0 means expanded tracking)
  const hasExpandedData = sorted.some((l) => l.pc > 0);
  const hasItphr = sorted.some((l) => l.itphr > 0);
  const hasHbp = hasExpandedData && sorted.some((l) => l.hbp > 0);
  const hasWp = hasExpandedData && sorted.some((l) => l.wp > 0);

  return (
    <div className="compact-table overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
            <th className="px-1.5 sm:px-2 py-1 text-left min-w-[8rem]">Pitcher</th>
            <th className="px-1 py-1 text-center w-8"></th>
            <th className="px-1 py-1 text-center">Dec</th>
            <th className="px-1 py-1 text-center">IP</th>
            <th className="px-1 py-1 text-center">H</th>
            <th className="px-1 py-1 text-center">R</th>
            <th className="px-1 py-1 text-center">ER</th>
            <th className="px-1 py-1 text-center">BB</th>
            <th className="px-1 py-1 text-center">SO</th>
            <th className="px-1 py-1 text-center">HR</th>
            {hasItphr && <th className="px-1 py-1 text-center" title="Inside-the-Park HR">ITPHR</th>}
            {hasExpandedData && <th className="px-1 py-1 text-center">PC</th>}
            {hasExpandedData && <th className="px-1 py-1 text-center" title="Balls-Strikes">B-S</th>}
            {hasHbp && <th className="px-1 py-1 text-center">HBP</th>}
            {hasWp && <th className="px-1 py-1 text-center">WP</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.map((line, idx) => {
            const decColor = line.dec === "W" ? "text-green-600 dark:text-green-400"
              : line.dec === "L" ? "text-red-600 dark:text-red-400"
              : line.dec === "S" ? "text-blue-600 dark:text-blue-400"
              : "";
            const role = line.gs === 1 ? "SP" : "RP";
            const roleColor = line.gs === 1
              ? "text-blue-500 dark:text-blue-400"
              : "text-gray-400 dark:text-gray-500";
            return (
              <tr key={line.player_id} className={`border-b border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}`}>
                <td className="px-2 py-1">
                  {onPlayerClick ? (
                    <span className="cursor-pointer hover:underline hover:text-blue-500" onClick={() => onPlayerClick(line.player_id)}>{line.name}</span>
                  ) : line.name}
                </td>
                <td className={`px-1 py-1 text-center text-[10px] font-bold ${roleColor}`}>{role}</td>
                <td className={`px-1 py-1 text-center font-bold ${decColor}`}>{line.dec || ""}</td>
                <td className="px-1 py-1 text-center">{line.ip}</td>
                <td className="px-1 py-1 text-center">{line.h}</td>
                <td className="px-1 py-1 text-center">{line.r}</td>
                <td className="px-1 py-1 text-center">{line.er}</td>
                <td className="px-1 py-1 text-center">{line.bb}</td>
                <td className="px-1 py-1 text-center font-semibold">{line.so}</td>
                <td className="px-1 py-1 text-center">{line.hr > 0 ? line.hr : ""}</td>
                {hasItphr && <td className="px-1 py-1 text-center">{line.itphr > 0 ? line.itphr : ""}</td>}
                {hasExpandedData && <td className="px-1 py-1 text-center">{line.pc}</td>}
                {hasExpandedData && <td className="px-1 py-1 text-center text-gray-500 dark:text-gray-400">{line.balls}-{line.strikes}</td>}
                {hasHbp && <td className="px-1 py-1 text-center">{line.hbp || ""}</td>}
                {hasWp && <td className="px-1 py-1 text-center">{line.wp || ""}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ── Substitutions ────────────────────────────────────────────────────

const SubstitutionsList = ({ subs, onPlayerClick }: { subs: BoxScoreSubstitution[]; onPlayerClick?: (playerId: number) => void }) => {
  const formatInning = (sub: BoxScoreSubstitution) => {
    const half = sub.half === "top" ? "T" : "B";
    return `${half}${sub.inning}`;
  };

  const getTypeBadge = (type: BoxScoreSubstitution["type"]) => {
    switch (type) {
      case "emergency_pitcher":
        return <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">EMERGENCY</span>;
      case "pinch_hit":
        return <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">PH</span>;
      case "defensive_sub":
        return <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">DEF</span>;
      default:
        return null;
    }
  };

  const PlayerName = ({ id, name }: { id: number; name: string }) =>
    onPlayerClick ? (
      <span className="cursor-pointer hover:underline hover:text-blue-500" onClick={() => onPlayerClick(id)}>{name}</span>
    ) : <span>{name}</span>;

  return (
    <div className="space-y-1">
      {subs.map((sub, idx) => (
        <div key={idx} className="flex items-center gap-2 text-xs py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50">
          <span className="font-mono font-semibold text-gray-500 dark:text-gray-400 w-8 shrink-0">{formatInning(sub)}</span>
          <span className="text-gray-400">&#9654;</span>
          <span>
            <PlayerName id={sub.player_in.id} name={sub.player_in.name} />
            {" replaced "}
            <PlayerName id={sub.player_out.id} name={sub.player_out.name} />
            <span className="text-gray-500 dark:text-gray-400"> ({POS_DISPLAY[(sub.new_position || "").toLowerCase()] ?? sub.new_position})</span>
          </span>
          {getTypeBadge(sub.type)}
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════
// Play-by-Play Tab
// ═══════════════════════════════════════════════

/** Get batter name from either format */
const pbpName = (p: any): string => p?.name ?? p?.player_name ?? "Unknown";

/** Group plays by inning + half */
interface InningGroup {
  label: string;
  inning: number;
  half: string;
  plays: PlayByPlayEntry[];
}

function groupPlaysByInning(plays: PlayByPlayEntry[]): InningGroup[] {
  const groups: InningGroup[] = [];
  let current: InningGroup | null = null;
  for (const play of plays) {
    const half = play["Inning Half"];
    const inn = play.Inning;
    if (!current || current.inning !== inn || current.half !== half) {
      const ordinal: string = inn === 1 ? "1st" : inn === 2 ? "2nd" : inn === 3 ? "3rd" : `${inn}th`;
      current = { label: `${half} ${ordinal}`, inning: inn, half, plays: [] };
      groups.push(current);
    }
    current.plays.push(play);
  }
  return groups;
}

/** Color class for an outcome */
function outcomeColor(play: PlayByPlayEntry): string {
  if (play.Is_Homerun) return "text-green-500 dark:text-green-400 font-bold";
  if (play.Is_Triple || play.Is_Double) return "text-green-500 dark:text-green-400 font-semibold";
  if (play.Is_Single || play.Is_Hit) return "text-green-600 dark:text-green-400";
  if (play.Is_Strikeout) return "text-red-500 dark:text-red-400";
  if (play.Is_Walk || play.Is_HBP) return "text-blue-500 dark:text-blue-400";
  if ((play.Error_Count ?? 0) > 0) return "text-orange-500 dark:text-orange-400";
  return "";
}

/** Baserunner dots */
const BaseIndicator = ({ play }: { play: PlayByPlayEntry }) => {
  const r1 = play["On First"] != null;
  const r2 = play["On Second"] != null;
  const r3 = play["On Third"] != null;
  if (!r1 && !r2 && !r3) return null;
  return (
    <span className="inline-flex items-center gap-0.5 ml-1" title={[
      r3 ? "3B" : "", r2 ? "2B" : "", r1 ? "1B" : "",
    ].filter(Boolean).join(", ")}>
      <span className={`w-1.5 h-1.5 rounded-full ${r3 ? "bg-yellow-400" : "bg-gray-600"}`} />
      <span className={`w-1.5 h-1.5 rounded-full ${r2 ? "bg-yellow-400" : "bg-gray-600"}`} />
      <span className={`w-1.5 h-1.5 rounded-full ${r1 ? "bg-yellow-400" : "bg-gray-600"}`} />
    </span>
  );
};

const PlayByPlayTab = ({
  plays,
  isLoading,
  homeAbbrev,
  awayAbbrev,
  onPlayerClick,
}: {
  plays: PlayByPlayEntry[] | null;
  isLoading: boolean;
  homeAbbrev: string;
  awayAbbrev: string;
  onPlayerClick?: (playerId: number) => void;
}) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const groups = useMemo(() => (plays ? groupPlaysByInning(plays) : []), [plays]);

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Text variant="body" classes="text-gray-400">Loading play-by-play...</Text>
      </div>
    );
  }

  if (!plays || plays.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Text variant="body" classes="text-gray-400">No play-by-play data available for this game.</Text>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {groups.map((group) => {
        const isCollapsed = collapsed.has(group.label);
        const lastPlay = group.plays[group.plays.length - 1];
        const score = `${awayAbbrev} ${lastPlay["Away Score"]} - ${homeAbbrev} ${lastPlay["Home Score"]}`;
        return (
          <div key={group.label} className="rounded border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Inning header */}
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-650 cursor-pointer transition-colors"
            >
              <Text variant="small" classes="font-bold">{group.label}</Text>
              <div className="flex items-center gap-2">
                <Text variant="small" classes="text-gray-500 dark:text-gray-400">{score}</Text>
                <span className="text-gray-400 text-xs">{isCollapsed ? "▶" : "▼"}</span>
              </div>
            </button>

            {/* Plays */}
            {!isCollapsed && (
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {group.plays.map((play) => {
                  const colorClass = outcomeColor(play);
                  const isAbOver = play.AB_Over === true;
                  const scored = play.Runners_Scored > 0;
                  return (
                    <div
                      key={play.ID}
                      className={`px-3 py-1 text-xs flex items-start gap-2 ${
                        scored ? "bg-green-900/10" : ""
                      }`}
                    >
                      {/* Count + Outs */}
                      <span className="font-mono text-gray-500 dark:text-gray-400 w-10 shrink-0 text-center">
                        {play["Ball Count"]}-{play["Strike Count"]}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 w-12 shrink-0">
                        {play["Out Count"]} out{play["Out Count"] !== 1 ? "s" : ""}
                      </span>

                      {/* Play content */}
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-400">
                          {pbpName(play.Batter)} vs {pbpName(play.Pitcher)}
                        </span>
                        <span className={`ml-1.5 ${colorClass}`}>
                          — {play.Outcomes}
                        </span>
                        <BaseIndicator play={play} />
                        {scored && (
                          <span className="ml-1.5 text-green-500 dark:text-green-400 font-semibold">
                            ({awayAbbrev} {play["Away Score"]} - {homeAbbrev} {play["Home Score"]})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
