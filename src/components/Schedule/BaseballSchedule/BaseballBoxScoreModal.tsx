import { useEffect, useState } from "react";
import { Modal } from "../../../_design/Modal";
import { Text } from "../../../_design/Typography";
import { BaseballService } from "../../../_services/baseballService";
import { BoxScoreResponse, BoxScoreSubstitution } from "../../../models/baseball/baseballStatsModels";
import { getLogo } from "../../../_utility/getLogo";
import { League, SimMLB, SimCollegeBaseball } from "../../../_constants/constants";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leagueType = league === SimMLB ? SimMLB : SimCollegeBaseball;

  useEffect(() => {
    if (!isOpen || !gameId) {
      setBoxScore(null);
      setError(null);
      return;
    }
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await BaseballService.GetBoxScore(gameId);
        setBoxScore(data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load box score");
      }
      setIsLoading(false);
    };
    load();
  }, [isOpen, gameId]);

  const title = boxScore
    ? `${boxScore.away_team.abbrev} @ ${boxScore.home_team.abbrev} — Week ${boxScore.season_week}`
    : "Box Score";

  const allSubs = boxScore?.substitutions ?? [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-5xl" classes="max-h-[85vh] overflow-y-auto">
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
            <BattingLineTable lines={boxScore.batting.away} onPlayerClick={onPlayerClick} />
          </div>

          {/* Home Batting */}
          <div>
            <SectionHeader label={`${boxScore.home_team.abbrev} Batting`} teamId={boxScore.home_team.id} leagueType={leagueType} isRetro={isRetro} />
            <BattingLineTable lines={boxScore.batting.home} onPlayerClick={onPlayerClick} />
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
      )}
    </Modal>
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
    <div className="overflow-x-auto flex justify-center">
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
              <td key={i} className="px-2 py-1.5 text-center">
                {i < ls.away.runs.length ? ls.away.runs[i] : ""}
              </td>
            ))}
            <td className="px-2 py-1.5 text-center font-bold border-l-2 border-gray-300 dark:border-gray-500">{ls.away.R}</td>
            <td className="px-2 py-1.5 text-center">{ls.away.H}</td>
            <td className="px-2 py-1.5 text-center">{ls.away.E}</td>
          </tr>
          <tr>
            <td className="px-3 py-1.5 font-semibold">
              <div className="flex items-center gap-1.5">
                {homeLogo && <img src={homeLogo} className="w-4 h-4 object-contain" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                {boxScore.home_team.abbrev}
              </div>
            </td>
            {innings.map((i) => (
              <td key={i} className="px-2 py-1.5 text-center">
                {i < ls.home.runs.length ? ls.home.runs[i] : ""}
              </td>
            ))}
            <td className="px-2 py-1.5 text-center font-bold border-l-2 border-gray-300 dark:border-gray-500">{ls.home.R}</td>
            <td className="px-2 py-1.5 text-center">{ls.home.H}</td>
            <td className="px-2 py-1.5 text-center">{ls.home.E}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const BattingLineTable = ({ lines, onPlayerClick }: { lines: BoxScoreResponse["batting"]["home"]; onPlayerClick?: (playerId: number) => void }) => {
  if (lines.length === 0) {
    return <Text variant="small" classes="text-gray-400 py-2">No batting data available.</Text>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
            <th className="px-2 py-1 text-left min-w-[8rem]">Player</th>
            <th className="px-1 py-1 text-center">Pos</th>
            <th className="px-1 py-1 text-center">AB</th>
            <th className="px-1 py-1 text-center">R</th>
            <th className="px-1 py-1 text-center">H</th>
            <th className="px-1 py-1 text-center">2B</th>
            <th className="px-1 py-1 text-center">3B</th>
            <th className="px-1 py-1 text-center">HR</th>
            <th className="px-1 py-1 text-center" title="Inside-the-Park HR">ITPHR</th>
            <th className="px-1 py-1 text-center">RBI</th>
            <th className="px-1 py-1 text-center">BB</th>
            <th className="px-1 py-1 text-center">SO</th>
            <th className="px-1 py-1 text-center">SB</th>
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
              <td className="px-1 py-1 text-center text-gray-500 dark:text-gray-400">{POS_DISPLAY[line.pos ?? ""] ?? line.pos ?? ""}</td>
              <td className="px-1 py-1 text-center">{line.ab}</td>
              <td className="px-1 py-1 text-center">{line.r}</td>
              <td className="px-1 py-1 text-center font-semibold">{line.h}</td>
              <td className="px-1 py-1 text-center">{line["2b"]}</td>
              <td className="px-1 py-1 text-center">{line["3b"]}</td>
              <td className="px-1 py-1 text-center font-semibold">{line.hr > 0 ? line.hr : ""}</td>
              <td className="px-1 py-1 text-center">{line.itphr > 0 ? line.itphr : ""}</td>
              <td className="px-1 py-1 text-center">{line.rbi}</td>
              <td className="px-1 py-1 text-center">{line.bb}</td>
              <td className="px-1 py-1 text-center">{line.so}</td>
              <td className="px-1 py-1 text-center">{line.sb > 0 ? line.sb : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PitchingLineTable = ({ lines, onPlayerClick }: { lines: BoxScoreResponse["pitching"]["home"]; onPlayerClick?: (playerId: number) => void }) => {
  if (lines.length === 0) {
    return <Text variant="small" classes="text-gray-400 py-2">No pitching data available.</Text>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
            <th className="px-2 py-1 text-left min-w-[8rem]">Pitcher</th>
            <th className="px-1 py-1 text-center">Dec</th>
            <th className="px-1 py-1 text-center">IP</th>
            <th className="px-1 py-1 text-center">H</th>
            <th className="px-1 py-1 text-center">R</th>
            <th className="px-1 py-1 text-center">ER</th>
            <th className="px-1 py-1 text-center">BB</th>
            <th className="px-1 py-1 text-center">SO</th>
            <th className="px-1 py-1 text-center">HR</th>
            <th className="px-1 py-1 text-center" title="Inside-the-Park HR">ITPHR</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, idx) => {
            const decColor = line.dec === "W" ? "text-green-600 dark:text-green-400"
              : line.dec === "L" ? "text-red-600 dark:text-red-400"
              : line.dec === "S" ? "text-blue-600 dark:text-blue-400"
              : "";
            return (
              <tr key={line.player_id} className={`border-b border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}`}>
                <td className="px-2 py-1">
                  {onPlayerClick ? (
                    <span className="cursor-pointer hover:underline hover:text-blue-500" onClick={() => onPlayerClick(line.player_id)}>{line.name}</span>
                  ) : line.name}
                </td>
                <td className={`px-1 py-1 text-center font-bold ${decColor}`}>{line.dec || ""}</td>
                <td className="px-1 py-1 text-center">{line.ip}</td>
                <td className="px-1 py-1 text-center">{line.h}</td>
                <td className="px-1 py-1 text-center">{line.r}</td>
                <td className="px-1 py-1 text-center">{line.er}</td>
                <td className="px-1 py-1 text-center">{line.bb}</td>
                <td className="px-1 py-1 text-center font-semibold">{line.so}</td>
                <td className="px-1 py-1 text-center">{line.hr > 0 ? line.hr : ""}</td>
                <td className="px-1 py-1 text-center">{line.itphr > 0 ? line.itphr : ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

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
            <span className="text-gray-500 dark:text-gray-400"> ({POS_DISPLAY[sub.new_position] ?? sub.new_position})</span>
          </span>
          {getTypeBadge(sub.type)}
        </div>
      ))}
    </div>
  );
};
