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
  PbpV2AtBat,
  PbpV2Event,
  PbpV2Result,
} from "../../../models/baseball/baseballStatsModels";
import { getLogo } from "../../../_utility/getLogo";
import {
  League,
  SimMLB,
  SimCollegeBaseball,
} from "../../../_constants/constants";
import "../../../components/Team/baseball/baseballMobile.css";

const POS_DISPLAY: Record<string, string> = {
  c: "C",
  fb: "1B",
  sb: "2B",
  tb: "3B",
  ss: "SS",
  lf: "LF",
  cf: "CF",
  rf: "RF",
  dh: "DH",
  p: "P",
  startingpitcher: "P",
};

interface Props {
  gameId: number | null;
  isOpen: boolean;
  onClose: () => void;
  league: string;
  IsRetro?: boolean;
  onPlayerClick?: (playerId: number) => void;
}

export const BaseballBoxScoreModal = ({
  gameId,
  isOpen,
  onClose,
  league,
  IsRetro,
  onPlayerClick,
}: Props) => {
  const [boxScore, setBoxScore] = useState<BoxScoreResponse | null>(null);
  const [atBats, setAtBats] = useState<PbpV2AtBat[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pbpLoading, setPbpLoading] = useState(false);
  // Pitch-by-pitch detail is fetched lazily (include_events=1) only when the
  // user asks for it, then cached for the life of the modal.
  const [eventsBySeq, setEventsBySeq] = useState<Map<number, PbpV2Event[]> | null>(
    null,
  );
  const [eventsRequested, setEventsRequested] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Box Score");

  const leagueType = league === SimMLB ? SimMLB : SimCollegeBaseball;

  // Load boxscore (without PBP for speed — PBP comes from the v2 endpoint)
  useEffect(() => {
    if (!isOpen || !gameId) {
      setBoxScore(null);
      setAtBats(null);
      setEventsBySeq(null);
      setEventsRequested(false);
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
      } catch (e: any) {
        setError(e?.message ?? "Failed to load box score");
      }
      setIsLoading(false);
    };
    load();
  }, [isOpen, gameId]);

  // Lazy-load the lean v2 at-bat feed when the tab is first selected
  useEffect(() => {
    if (activeTab !== "Play-by-Play" || atBats || !gameId || pbpLoading) return;
    const load = async () => {
      setPbpLoading(true);
      try {
        const data = await BaseballService.GetPlayByPlayV2(gameId, {
          includeEvents: false,
        });
        setAtBats(data.at_bats ?? []);
      } catch {
        setAtBats([]);
      }
      setPbpLoading(false);
    };
    load();
  }, [activeTab, atBats, gameId, pbpLoading]);

  // Lazy-load pitch-by-pitch events (one request, cached) when first requested
  useEffect(() => {
    if (!eventsRequested || eventsBySeq || !gameId || eventsLoading) return;
    const load = async () => {
      setEventsLoading(true);
      try {
        const data = await BaseballService.GetPlayByPlayV2(gameId, {
          includeEvents: true,
        });
        const map = new Map<number, PbpV2Event[]>();
        for (const ab of data.at_bats ?? []) {
          map.set(ab.seq, ab.events ?? []);
        }
        setEventsBySeq(map);
      } catch {
        setEventsBySeq(new Map());
      }
      setEventsLoading(false);
    };
    load();
  }, [eventsRequested, eventsBySeq, gameId, eventsLoading]);

  const title = boxScore
    ? `${boxScore.away_team.abbrev} @ ${boxScore.home_team.abbrev} — Week ${boxScore.season_week}`
    : "Box Score";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-5xl"
      classes="max-h-[85vh] overflow-y-auto mx-2 sm:mx-auto p-3! sm:p-6!"
    >
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Text variant="body" classes="text-gray-400">
            Loading box score...
          </Text>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center py-12">
          <Text variant="body" classes="text-red-500">
            {error}
          </Text>
        </div>
      )}
      {boxScore && !isLoading && (
        <div>
          {/* Tabs */}
          <TabGroup classes="mb-4">
            <Tab
              label="Box Score"
              selected={activeTab === "Box Score"}
              setSelected={setActiveTab}
            />
            <Tab
              label="Play-by-Play"
              selected={activeTab === "Play-by-Play"}
              setSelected={setActiveTab}
            />
          </TabGroup>

          {activeTab === "Box Score" && (
            <BoxScoreTab
              boxScore={boxScore}
              leagueType={leagueType}
              IsRetro={IsRetro}
              onPlayerClick={onPlayerClick}
            />
          )}
          {activeTab === "Play-by-Play" && (
            <PlayByPlayTab
              atBats={atBats}
              isLoading={pbpLoading}
              homeAbbrev={boxScore.home_team.abbrev}
              awayAbbrev={boxScore.away_team.abbrev}
              eventsBySeq={eventsBySeq}
              eventsLoading={eventsLoading}
              onRequestEvents={() => setEventsRequested(true)}
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
  IsRetro,
  onPlayerClick,
}: {
  boxScore: BoxScoreResponse;
  leagueType: League;
  IsRetro?: boolean;
  onPlayerClick?: (playerId: number) => void;
}) => {
  const allSubs = boxScore.substitutions ?? [];

  // Build player_id → position lookup from defense dict (reverse map)
  const buildPosMap = (
    def?: Record<string, number>,
  ): Record<number, string> => {
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
        <LinescoreTable
          boxScore={boxScore}
          leagueType={leagueType}
          IsRetro={IsRetro}
        />
      ) : (
        <div className="text-center py-3">
          <Text variant="small" classes="text-gray-400">
            Linescore not available for this game.
          </Text>
        </div>
      )}

      {/* Away Batting */}
      <div>
        <SectionHeader
          label={`${boxScore.away_team.abbrev} Batting`}
          teamId={boxScore.away_team.id}
          leagueType={leagueType}
          IsRetro={IsRetro}
        />
        <BattingLineTable
          lines={boxScore.batting.away}
          posMap={awayPosMap}
          onPlayerClick={onPlayerClick}
        />
      </div>

      {/* Home Batting */}
      <div>
        <SectionHeader
          label={`${boxScore.home_team.abbrev} Batting`}
          teamId={boxScore.home_team.id}
          leagueType={leagueType}
          IsRetro={IsRetro}
        />
        <BattingLineTable
          lines={boxScore.batting.home}
          posMap={homePosMap}
          onPlayerClick={onPlayerClick}
        />
      </div>

      {/* Away Pitching */}
      <div>
        <SectionHeader
          label={`${boxScore.away_team.abbrev} Pitching`}
          teamId={boxScore.away_team.id}
          leagueType={leagueType}
          IsRetro={IsRetro}
        />
        <PitchingLineTable
          lines={boxScore.pitching.away}
          onPlayerClick={onPlayerClick}
        />
      </div>

      {/* Home Pitching */}
      <div>
        <SectionHeader
          label={`${boxScore.home_team.abbrev} Pitching`}
          teamId={boxScore.home_team.id}
          leagueType={leagueType}
          IsRetro={IsRetro}
        />
        <PitchingLineTable
          lines={boxScore.pitching.home}
          onPlayerClick={onPlayerClick}
        />
      </div>

      {/* Substitutions */}
      {allSubs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-1 pb-1 border-b border-gray-200 dark:border-gray-600">
            <Text variant="body-small" classes="font-bold">
              Substitutions
            </Text>
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

const SectionHeader = ({
  label,
  teamId,
  leagueType,
  IsRetro,
}: {
  label: string;
  teamId: number;
  leagueType: League;
  IsRetro?: boolean;
}) => {
  const logo = getLogo(leagueType, teamId, IsRetro);
  return (
    <div className="flex items-center gap-2 mb-1 pb-1 border-b border-gray-200 dark:border-gray-600">
      {logo && (
        <img
          src={logo}
          className="w-5 h-5 object-contain"
          alt=""
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <Text variant="body-small" classes="font-bold">
        {label}
      </Text>
    </div>
  );
};

const LinescoreTable = ({
  boxScore,
  leagueType,
  IsRetro,
}: {
  boxScore: BoxScoreResponse;
  leagueType: League;
  IsRetro?: boolean;
}) => {
  const ls = boxScore.linescore!;
  const numInnings =
    ls.innings ?? Math.max(ls.away.runs.length, ls.home.runs.length);
  const innings = Array.from({ length: numInnings }, (_, i) => i);

  const awayLogo = getLogo(leagueType, boxScore.away_team.id, IsRetro);
  const homeLogo = getLogo(leagueType, boxScore.home_team.id, IsRetro);

  return (
    <div className="compact-table overflow-x-auto flex justify-center">
      <table className="border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-gray-300 dark:border-gray-500">
            <th className="px-3 py-1 text-left min-w-20"></th>
            {innings.map((i) => (
              <th key={i} className="px-2 py-1 text-center min-w-8">
                {i + 1}
              </th>
            ))}
            <th className="px-2 py-1 text-center font-bold border-l-2 border-gray-300 dark:border-gray-500">
              R
            </th>
            <th className="px-2 py-1 text-center font-bold">H</th>
            <th className="px-2 py-1 text-center font-bold">E</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200 dark:border-gray-600">
            <td className="px-3 py-1.5 font-semibold">
              <div className="flex items-center gap-1.5">
                {awayLogo && (
                  <img
                    src={awayLogo}
                    className="w-4 h-4 object-contain"
                    alt=""
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                {boxScore.away_team.abbrev}
              </div>
            </td>
            {innings.map((i) => (
              <td key={i} className="px-1.5 sm:px-2 py-1.5 text-center">
                {i < ls.away.runs.length ? ls.away.runs[i] : ""}
              </td>
            ))}
            <td className="px-1.5 sm:px-2 py-1.5 text-center font-bold border-l-2 border-gray-300 dark:border-gray-500">
              {ls.away.R}
            </td>
            <td className="px-1.5 sm:px-2 py-1.5 text-center">{ls.away.H}</td>
            <td className="px-1.5 sm:px-2 py-1.5 text-center">{ls.away.E}</td>
          </tr>
          <tr>
            <td className="px-3 py-1.5 font-semibold">
              <div className="flex items-center gap-1.5">
                {homeLogo && (
                  <img
                    src={homeLogo}
                    className="w-4 h-4 object-contain"
                    alt=""
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                {boxScore.home_team.abbrev}
              </div>
            </td>
            {innings.map((i) => (
              <td key={i} className="px-1.5 sm:px-2 py-1.5 text-center">
                {i < ls.home.runs.length ? ls.home.runs[i] : ""}
              </td>
            ))}
            <td className="px-1.5 sm:px-2 py-1.5 text-center font-bold border-l-2 border-gray-300 dark:border-gray-500">
              {ls.home.R}
            </td>
            <td className="px-1.5 sm:px-2 py-1.5 text-center">{ls.home.H}</td>
            <td className="px-1.5 sm:px-2 py-1.5 text-center">{ls.home.E}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// ── Batting Table ────────────────────────────────────────────────────

const BattingLineTable = ({
  lines,
  posMap,
  onPlayerClick,
}: {
  lines: BoxScoreBattingLine[];
  posMap?: Record<number, string>;
  onPlayerClick?: (playerId: number) => void;
}) => {
  if (lines.length === 0) {
    return (
      <Text variant="small" classes="text-gray-400 py-2">
        No batting data available.
      </Text>
    );
  }

  const hasHbp = lines.some((l) => l.hbp > 0);
  const hasCs = lines.some((l) => l.cs > 0);
  const hasItphr = lines.some((l) => l.itphr > 0);
  // Detect if batting_order data exists (0 = legacy games without it)
  const hasBattingOrder = lines.some((l) => (l.batting_order ?? 0) > 0);

  // Track which batting_order slots have already shown their number
  const shownSlots = new Set<number>();

  return (
    <div className="compact-table overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
            {hasBattingOrder && (
              <th className="px-1 py-1 text-center w-6">#</th>
            )}
            <th className="px-1.5 sm:px-2 py-1 text-left min-w-32">
              Player
            </th>
            <th className="px-1 py-1 text-center">Pos</th>
            <th
              className="px-1 py-1 text-center"
              title="At Bats (Plate Appearances)"
            >
              AB
            </th>
            <th className="px-1 py-1 text-center">R</th>
            <th className="px-1 py-1 text-center">H</th>
            <th className="px-1 py-1 text-center">2B</th>
            <th className="px-1 py-1 text-center">3B</th>
            <th className="px-1 py-1 text-center">HR</th>
            {hasItphr && (
              <th className="px-1 py-1 text-center" title="Inside-the-Park HR">
                ITPHR
              </th>
            )}
            <th className="px-1 py-1 text-center">RBI</th>
            <th className="px-1 py-1 text-center">BB</th>
            {hasHbp && <th className="px-1 py-1 text-center">HBP</th>}
            <th className="px-1 py-1 text-center">SO</th>
            <th className="px-1 py-1 text-center">SB</th>
            {hasCs && <th className="px-1 py-1 text-center">CS</th>}
          </tr>
        </thead>
        <tbody>
          {lines.map((line, idx) => {
            const slot = line.batting_order ?? 0;
            const isFirstInSlot =
              hasBattingOrder && slot > 0 && !shownSlots.has(slot);
            if (isFirstInSlot) shownSlots.add(slot);
            const isSub = hasBattingOrder && slot > 0 && !isFirstInSlot;

            return (
              <tr
                key={line.player_id}
                className={`border-b border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""} ${isSub ? "italic text-gray-400 dark:text-gray-500" : ""}`}
              >
                {hasBattingOrder && (
                  <td className="px-1 py-1 text-center text-gray-400 dark:text-gray-500">
                    {isFirstInSlot ? slot : ""}
                  </td>
                )}
                <td className={`px-2 py-1 ${isSub ? "pl-4" : ""}`}>
                  {onPlayerClick ? (
                    <span
                      className="cursor-pointer hover:underline hover:text-blue-500"
                      onClick={() => onPlayerClick(line.player_id)}
                    >
                      {line.name}
                    </span>
                  ) : (
                    line.name
                  )}
                </td>
                <td className="px-1 py-1 text-center text-gray-500 dark:text-gray-400">
                  {(() => {
                    const raw = line.pos || posMap?.[line.player_id] || "";
                    if (!raw) return "DH";
                    return POS_DISPLAY[raw.toLowerCase()] ?? raw;
                  })()}
                </td>
                <td
                  className="px-1 py-1 text-center"
                  title={line.pa > 0 ? `PA: ${line.pa}` : undefined}
                >
                  {line.ab}
                </td>
                <td className="px-1 py-1 text-center">{line.r}</td>
                <td className="px-1 py-1 text-center font-semibold">
                  {line.h}
                </td>
                <td className="px-1 py-1 text-center">{line["2b"] || ""}</td>
                <td className="px-1 py-1 text-center">{line["3b"] || ""}</td>
                <td className="px-1 py-1 text-center font-semibold">
                  {line.hr > 0 ? line.hr : ""}
                </td>
                {hasItphr && (
                  <td className="px-1 py-1 text-center">
                    {line.itphr > 0 ? line.itphr : ""}
                  </td>
                )}
                <td className="px-1 py-1 text-center">{line.rbi}</td>
                <td className="px-1 py-1 text-center">{line.bb}</td>
                {hasHbp && (
                  <td className="px-1 py-1 text-center">{line.hbp || ""}</td>
                )}
                <td className="px-1 py-1 text-center">{line.so}</td>
                <td className="px-1 py-1 text-center">
                  {line.sb > 0 ? line.sb : ""}
                </td>
                {hasCs && (
                  <td className="px-1 py-1 text-center">
                    {line.cs > 0 ? line.cs : ""}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ── Pitching Table ───────────────────────────────────────────────────

const getPitcherRole = (
  line: BoxScorePitchingLine,
): { label: string; color: string } => {
  if (line.gs === 1)
    return { label: "SP", color: "text-blue-500 dark:text-blue-400" };
  if (line.dec === "S")
    return { label: "SV", color: "text-cyan-600 dark:text-cyan-400" };
  return { label: "RP", color: "text-gray-400 dark:text-gray-500" };
};

const getDecisionLabel = (
  line: BoxScorePitchingLine,
): { label: string; color: string } => {
  if (line.dec === "W") {
    const label = line.blown_save ? "W (BS)" : "W";
    return { label, color: "text-green-600 dark:text-green-400" };
  }
  if (line.dec === "L") {
    const label = line.blown_save ? "L (BS)" : "L";
    return { label, color: "text-red-600 dark:text-red-400" };
  }
  if (line.dec === "S")
    return { label: "S", color: "text-blue-600 dark:text-blue-400" };
  if (line.hold)
    return { label: "H", color: "text-gray-500 dark:text-gray-400" };
  if (line.blown_save)
    return { label: "BS", color: "text-orange-500 dark:text-orange-400" };
  return { label: "", color: "" };
};

const sumIP = (pitchers: BoxScorePitchingLine[]): string => {
  const totalOuts = pitchers.reduce((acc, p) => {
    const [full, partial] = p.ip.split(".");
    return acc + parseInt(full) * 3 + parseInt(partial || "0");
  }, 0);
  return `${Math.floor(totalOuts / 3)}.${totalOuts % 3}`;
};

const PitchingLineTable = ({
  lines,
  onPlayerClick,
}: {
  lines: BoxScorePitchingLine[];
  onPlayerClick?: (playerId: number) => void;
}) => {
  if (lines.length === 0) {
    return (
      <Text variant="small" classes="text-gray-400 py-2">
        No pitching data available.
      </Text>
    );
  }

  // API already sends pitchers in appearance order — render as-is
  const hasExpandedData = lines.some((l) => l.pc > 0);
  const hasItphr = lines.some((l) => l.itphr > 0);
  const hasHbp = hasExpandedData && lines.some((l) => l.hbp > 0);
  const hasWp = hasExpandedData && lines.some((l) => l.wp > 0);

  // Team totals
  const totals = {
    ip: sumIP(lines),
    h: lines.reduce((s, l) => s + l.h, 0),
    r: lines.reduce((s, l) => s + l.r, 0),
    er: lines.reduce((s, l) => s + l.er, 0),
    bb: lines.reduce((s, l) => s + l.bb, 0),
    so: lines.reduce((s, l) => s + l.so, 0),
    hr: lines.reduce((s, l) => s + l.hr, 0),
    itphr: lines.reduce((s, l) => s + l.itphr, 0),
    pc: lines.reduce((s, l) => s + l.pc, 0),
    balls: lines.reduce((s, l) => s + l.balls, 0),
    strikes: lines.reduce((s, l) => s + l.strikes, 0),
    hbp: lines.reduce((s, l) => s + l.hbp, 0),
    wp: lines.reduce((s, l) => s + l.wp, 0),
  };

  return (
    <div className="compact-table overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
            <th className="px-1 py-1 text-center w-8"></th>
            <th className="px-1.5 sm:px-2 py-1 text-left min-w-32">
              Pitcher
            </th>
            <th className="px-1 py-1 text-center">Dec</th>
            <th className="px-1 py-1 text-center">IP</th>
            <th className="px-1 py-1 text-center">H</th>
            <th className="px-1 py-1 text-center">R</th>
            <th className="px-1 py-1 text-center">ER</th>
            <th className="px-1 py-1 text-center">BB</th>
            <th className="px-1 py-1 text-center">SO</th>
            <th className="px-1 py-1 text-center">HR</th>
            {hasItphr && (
              <th className="px-1 py-1 text-center" title="Inside-the-Park HR">
                ITPHR
              </th>
            )}
            {hasExpandedData && <th className="px-1 py-1 text-center">PC</th>}
            {hasExpandedData && (
              <th className="px-1 py-1 text-center" title="Balls-Strikes">
                B-S
              </th>
            )}
            {hasHbp && <th className="px-1 py-1 text-center">HBP</th>}
            {hasWp && <th className="px-1 py-1 text-center">WP</th>}
          </tr>
        </thead>
        <tbody>
          {lines.map((line, idx) => {
            const { label: role, color: roleColor } = getPitcherRole(line);
            const { label: decLabel, color: decColor } = getDecisionLabel(line);
            const isQS = line.gs === 1 && line.quality_start === 1;
            return (
              <tr
                key={line.player_id}
                className={`border-b border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}`}
              >
                <td
                  className={`px-1 py-1 text-center text-[10px] font-bold ${roleColor}`}
                >
                  {role}
                </td>
                <td className="px-2 py-1">
                  <span className="inline-flex items-center gap-1">
                    {onPlayerClick ? (
                      <span
                        className="cursor-pointer hover:underline hover:text-blue-500"
                        onClick={() => onPlayerClick(line.player_id)}
                      >
                        {line.name}
                      </span>
                    ) : (
                      line.name
                    )}
                    {isQS && (
                      <span className="text-[9px] font-bold px-1 py-px rounded-sm bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                        QS
                      </span>
                    )}
                  </span>
                </td>
                <td className={`px-1 py-1 text-center font-bold ${decColor}`}>
                  {decLabel}
                </td>
                <td className="px-1 py-1 text-center">{line.ip}</td>
                <td className="px-1 py-1 text-center">{line.h}</td>
                <td className="px-1 py-1 text-center">{line.r}</td>
                <td className="px-1 py-1 text-center">{line.er}</td>
                <td className="px-1 py-1 text-center">{line.bb}</td>
                <td className="px-1 py-1 text-center font-semibold">
                  {line.so}
                </td>
                <td className="px-1 py-1 text-center">
                  {line.hr > 0 ? line.hr : ""}
                </td>
                {hasItphr && (
                  <td className="px-1 py-1 text-center">
                    {line.itphr > 0 ? line.itphr : ""}
                  </td>
                )}
                {hasExpandedData && (
                  <td
                    className={`px-1 py-1 text-center ${line.pc >= 100 ? "font-bold text-orange-500 dark:text-orange-400" : ""}`}
                  >
                    {line.pc}
                  </td>
                )}
                {hasExpandedData && (
                  <td className="px-1 py-1 text-center text-gray-500 dark:text-gray-400">
                    {line.balls}-{line.strikes}
                  </td>
                )}
                {hasHbp && (
                  <td className="px-1 py-1 text-center">{line.hbp || ""}</td>
                )}
                {hasWp && (
                  <td className="px-1 py-1 text-center">{line.wp || ""}</td>
                )}
              </tr>
            );
          })}
          {/* Team totals row */}
          <tr className="border-t-2 border-gray-300 dark:border-gray-500 font-semibold bg-gray-50 dark:bg-gray-800/50">
            <td className="px-1 py-1"></td>
            <td className="px-2 py-1">Totals</td>
            <td className="px-1 py-1"></td>
            <td className="px-1 py-1 text-center">{totals.ip}</td>
            <td className="px-1 py-1 text-center">{totals.h}</td>
            <td className="px-1 py-1 text-center">{totals.r}</td>
            <td className="px-1 py-1 text-center">{totals.er}</td>
            <td className="px-1 py-1 text-center">{totals.bb}</td>
            <td className="px-1 py-1 text-center">{totals.so}</td>
            <td className="px-1 py-1 text-center">{totals.hr || ""}</td>
            {hasItphr && (
              <td className="px-1 py-1 text-center">{totals.itphr || ""}</td>
            )}
            {hasExpandedData && (
              <td className="px-1 py-1 text-center">{totals.pc}</td>
            )}
            {hasExpandedData && (
              <td className="px-1 py-1 text-center text-gray-500 dark:text-gray-400">
                {totals.balls}-{totals.strikes}
              </td>
            )}
            {hasHbp && (
              <td className="px-1 py-1 text-center">{totals.hbp || ""}</td>
            )}
            {hasWp && (
              <td className="px-1 py-1 text-center">{totals.wp || ""}</td>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// ── Substitutions ────────────────────────────────────────────────────

const SubstitutionsList = ({
  subs,
  onPlayerClick,
}: {
  subs: BoxScoreSubstitution[];
  onPlayerClick?: (playerId: number) => void;
}) => {
  const formatInning = (sub: BoxScoreSubstitution) => {
    const half = sub.half === "top" ? "T" : "B";
    return `${half}${sub.inning}`;
  };

  const ordinal = (n: number) => {
    if (n === 1) return "1st";
    if (n === 2) return "2nd";
    if (n === 3) return "3rd";
    return `${n}th`;
  };

  const formatEntryContext = (sub: BoxScoreSubstitution): string => {
    if (sub.entry_score_diff === undefined) return "";
    const lead =
      sub.entry_score_diff > 0
        ? `leading by ${sub.entry_score_diff}`
        : sub.entry_score_diff < 0
          ? `trailing by ${Math.abs(sub.entry_score_diff)}`
          : "tied";
    const runners = sub.entry_runners_on ? `, ${sub.entry_runners_on} on` : "";
    const outs = `${sub.entry_outs} out${sub.entry_outs !== 1 ? "s" : ""}`;
    const save = sub.entry_is_save_situation ? " (save situation)" : "";
    return `Entered ${lead} in the ${ordinal(sub.entry_inning!)}, ${outs}${runners}${save}`;
  };

  const getTypeBadge = (sub: BoxScoreSubstitution) => {
    switch (sub.type) {
      case "emergency_pitcher":
        return (
          <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
            EMERGENCY
          </span>
        );
      case "pinch_hit":
        return (
          <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            PH
          </span>
        );
      case "defensive_sub":
        return (
          <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            DEF
          </span>
        );
      default: {
        if (sub.entry_is_save_situation) {
          return (
            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
              SAVE SIT
            </span>
          );
        }
        return null;
      }
    }
  };

  const PlayerName = ({ id, name }: { id: number; name: string }) =>
    onPlayerClick ? (
      <span
        className="cursor-pointer hover:underline hover:text-blue-500"
        onClick={() => onPlayerClick(id)}
      >
        {name}
      </span>
    ) : (
      <span>{name}</span>
    );

  return (
    <div className="space-y-1">
      {subs.map((sub, idx) => {
        const entryContext = formatEntryContext(sub);
        return (
          <div
            key={idx}
            className="flex flex-col gap-0.5 text-xs py-1 px-2 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-gray-500 dark:text-gray-400 w-8 shrink-0">
                {formatInning(sub)}
              </span>
              <span className="text-gray-400">&#9654;</span>
              <span>
                <PlayerName id={sub.player_in.id} name={sub.player_in.name} />
                {" replaced "}
                <PlayerName id={sub.player_out.id} name={sub.player_out.name} />
                <span className="text-gray-500 dark:text-gray-400">
                  {" "}
                  (
                  {POS_DISPLAY[(sub.new_position || "").toLowerCase()] ??
                    sub.new_position}
                  )
                </span>
              </span>
              {getTypeBadge(sub)}
            </div>
            {entryContext && (
              <div className="ml-10 text-[10px] text-gray-500 dark:text-gray-400 italic">
                {entryContext}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════
// Play-by-Play Tab (v2 narrative feed)
// ═══════════════════════════════════════════════

const ordinal = (n: number): string =>
  n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`;

const HIT_RESULTS = new Set<string>([
  "single",
  "double",
  "triple",
  "home_run",
  "inside_the_park_hr",
]);

/** Display-ready color/weight for a normalized at-bat result. */
function resultColor(result: PbpV2Result, hasError: boolean): string {
  switch (result) {
    case "home_run":
    case "inside_the_park_hr":
      return "text-green-500 dark:text-green-400 font-bold";
    case "double":
    case "triple":
      return "text-green-500 dark:text-green-400 font-semibold";
    case "single":
      return "text-green-600 dark:text-green-400";
    case "walk":
    case "hbp":
      return "text-blue-500 dark:text-blue-400";
    case "strikeout":
      return "text-red-500 dark:text-red-400";
    default:
      return hasError ? "text-orange-500 dark:text-orange-400" : "text-gray-300";
  }
}

/** Turn a snake_case engine enum into display text ("caught_stealing" → "caught stealing"). */
const humanize = (s: string): string => s.replace(/_/g, " ");

type PbpFilter = "all" | "scoring" | "hits";

interface AtBatGroup {
  key: string;
  label: string;
  inning: number;
  half: "top" | "bottom";
  atBats: PbpV2AtBat[];
}

function groupAtBats(atBats: PbpV2AtBat[]): AtBatGroup[] {
  const groups: AtBatGroup[] = [];
  for (const ab of atBats) {
    const key = `${ab.inning}|${ab.half}`;
    if (!groups.length || groups[groups.length - 1].key !== key) {
      const halfLabel = ab.half === "top" ? "Top" : "Bottom";
      groups.push({
        key,
        label: `${halfLabel} ${ordinal(ab.inning)}`,
        inning: ab.inning,
        half: ab.half,
        atBats: [],
      });
    }
    groups[groups.length - 1].atBats.push(ab);
  }
  return groups;
}

/** Runs / hits / errors / left-on-base for a half-inning. */
function halfInningSummary(atBats: PbpV2AtBat[]): {
  runs: number;
  hits: number;
  errors: number;
  lob: number;
} {
  let runs = 0;
  let hits = 0;
  let errors = 0;
  for (const ab of atBats) {
    runs += ab.runs_scored?.length ?? 0;
    if (ab.result && HIT_RESULTS.has(ab.result)) hits += 1;
    errors += ab.result_detail?.errors?.length ?? 0;
  }
  const last = atBats[atBats.length - 1]?.runners_after;
  const lob = last
    ? [last["1B"], last["2B"], last["3B"]].filter(Boolean).length
    : 0;
  return { runs, hits, errors, lob };
}

/** Mini base-state indicator from runners_after (rendered only when occupied). */
const BaseDiamond = ({ runners }: { runners: PbpV2AtBat["runners_after"] }) => {
  const r1 = runners["1B"] != null;
  const r2 = runners["2B"] != null;
  const r3 = runners["3B"] != null;
  if (!r1 && !r2 && !r3) return null;
  const dot = (on: boolean) =>
    `w-1.5 h-1.5 rounded-full ${on ? "bg-yellow-400" : "bg-gray-600/50"}`;
  return (
    <span
      className="inline-flex items-center gap-0.5 ml-1.5 align-middle"
      title={[r3 ? "3B" : "", r2 ? "2B" : "", r1 ? "1B" : ""]
        .filter(Boolean)
        .join(", ")}
    >
      <span className={dot(r3)} />
      <span className={dot(r2)} />
      <span className={dot(r1)} />
    </span>
  );
};

/** Outs-before pips (2 slots). */
const OutsPips = ({ outs }: { outs: number }) => (
  <span
    className="inline-flex items-center gap-0.5 w-8 shrink-0 justify-center pt-0.5"
    title={`${outs} out${outs !== 1 ? "s" : ""}`}
  >
    {[0, 1].map((i) => (
      <span
        key={i}
        className={`w-1.5 h-1.5 rounded-full ${i < outs ? "bg-red-500/80" : "bg-gray-400/30"}`}
      />
    ))}
  </span>
);

const ClickableName = ({
  player,
  fallback,
  onPlayerClick,
}: {
  player?: { id: number; name?: string } | null;
  fallback: string;
  onPlayerClick?: (playerId: number) => void;
}) => {
  const name = player?.name ?? fallback;
  if (player && onPlayerClick) {
    return (
      <span
        className="cursor-pointer hover:underline hover:text-blue-500"
        onClick={() => onPlayerClick(player.id)}
      >
        {name}
      </span>
    );
  }
  return <span>{name}</span>;
};

/** Coerce a possibly-object engine field to a display string. */
const asLabel = (v: unknown): string => (typeof v === "string" ? v : "");

/** A single pitch / steal / pickoff line inside an at-bat. */
const EventLine = ({ ev }: { ev: PbpV2Event }) => {
  const e = ev as Record<string, any>;
  const isBaserunning = ev.kind === "steal" || ev.kind === "pickoff";

  if (!isBaserunning) {
    // Pitch detail may arrive flat (per the guide) or nested under `pitch`/`result`.
    const detail =
      [e.pitch, e.result].find((v) => v && typeof v === "object") ?? e;
    const pitchType = asLabel(typeof e.pitch === "string" ? e.pitch : detail.pitch);
    const result = asLabel(detail.result);
    const swingRaw = asLabel(detail.swing ?? e.swing);
    const swing =
      swingRaw && swingRaw !== "None" ? ` (${swingRaw})` : "";
    return (
      <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
        <span className="font-mono w-7 shrink-0 text-center">
          {e.balls ?? 0}-{e.strikes ?? 0}
        </span>
        <span className="truncate">
          {[pitchType, result].filter(Boolean).join(" — ")}
          {swing}
        </span>
      </div>
    );
  }
  // steal / pickoff
  const runnerName = ev.runner?.name ?? "Runner";
  return (
    <div className="flex items-center gap-2 text-[11px] text-cyan-600 dark:text-cyan-400">
      <span className="font-mono w-7 shrink-0 text-center">↳</span>
      <span className="truncate">
        {runnerName}: {humanize(asLabel(ev.result))}
      </span>
    </div>
  );
};

const AtBatRow = ({
  ab,
  awayAbbrev,
  homeAbbrev,
  expanded,
  onToggle,
  events,
  eventsLoading,
  onPlayerClick,
}: {
  ab: PbpV2AtBat;
  awayAbbrev: string;
  homeAbbrev: string;
  expanded: boolean;
  onToggle: () => void;
  events?: PbpV2Event[];
  eventsLoading: boolean;
  onPlayerClick?: (playerId: number) => void;
}) => {
  const scored = (ab.runs_scored?.length ?? 0) > 0;
  const hasError = (ab.result_detail?.errors?.length ?? 0) > 0;
  const colorClass = resultColor(ab.result, hasError);

  return (
    <div className={scored ? "bg-green-900/10" : ""}>
      <div
        className="px-2 sm:px-3 py-1 text-xs flex items-start gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40"
        onClick={onToggle}
      >
        <OutsPips outs={ab.outs_before} />

        <div className="flex-1 min-w-0">
          <span className={colorClass}>{ab.description}</span>
          <BaseDiamond runners={ab.runners_after} />
          {ab.rbi > 0 && (
            <span className="ml-1.5 text-[9px] font-bold px-1 py-px rounded-sm bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 align-middle">
              {ab.rbi} RBI
            </span>
          )}
          {scored && (
            <span className="ml-1.5 text-green-500 dark:text-green-400 font-semibold">
              ({awayAbbrev} {ab.score_after.away} - {homeAbbrev}{" "}
              {ab.score_after.home})
            </span>
          )}
          {ab.pitcher.name && (
            <span className="ml-1.5 text-gray-400 dark:text-gray-500">
              vs{" "}
              <ClickableName
                player={ab.pitcher}
                fallback={ab.pitcher.name}
                onPlayerClick={onPlayerClick}
              />
            </span>
          )}
        </div>

        <span className="text-gray-400 text-[10px] shrink-0 pt-0.5">
          {expanded ? "▼" : "▶"}
        </span>
      </div>

      {expanded && (
        <div className="pl-12 pr-3 pb-1.5 space-y-0.5">
          {eventsLoading && !events && (
            <Text variant="xs" classes="text-gray-400">
              Loading pitches...
            </Text>
          )}
          {events && events.length === 0 && (
            <Text variant="xs" classes="text-gray-400">
              No pitch detail available.
            </Text>
          )}
          {events?.map((ev, i) => (
            <EventLine key={i} ev={ev} />
          ))}
        </div>
      )}
    </div>
  );
};

const FILTER_LABELS: Record<PbpFilter, string> = {
  all: "All",
  scoring: "Scoring",
  hits: "Hits",
};

const PlayByPlayTab = ({
  atBats,
  isLoading,
  homeAbbrev,
  awayAbbrev,
  eventsBySeq,
  eventsLoading,
  onRequestEvents,
  onPlayerClick,
}: {
  atBats: PbpV2AtBat[] | null;
  isLoading: boolean;
  homeAbbrev: string;
  awayAbbrev: string;
  eventsBySeq: Map<number, PbpV2Event[]> | null;
  eventsLoading: boolean;
  onRequestEvents: () => void;
  onPlayerClick?: (playerId: number) => void;
}) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [expandedSeqs, setExpandedSeqs] = useState<Set<number>>(new Set());
  const [showAllPitches, setShowAllPitches] = useState(false);
  const [filter, setFilter] = useState<PbpFilter>("all");

  const filteredAtBats = useMemo(() => {
    if (!atBats) return [];
    if (filter === "scoring")
      return atBats.filter(
        (ab) => ab.rbi > 0 || (ab.runs_scored?.length ?? 0) > 0,
      );
    if (filter === "hits")
      return atBats.filter((ab) => ab.result && HIT_RESULTS.has(ab.result));
    return atBats;
  }, [atBats, filter]);

  const groups = useMemo(() => groupAtBats(filteredAtBats), [filteredAtBats]);

  const toggleGroup = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAtBat = (seq: number) => {
    onRequestEvents();
    setExpandedSeqs((prev) => {
      const next = new Set(prev);
      if (next.has(seq)) next.delete(seq);
      else next.add(seq);
      return next;
    });
  };

  const toggleAllPitches = () => {
    if (!showAllPitches) onRequestEvents();
    setShowAllPitches((v) => !v);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Text variant="body" classes="text-gray-400">
          Loading play-by-play...
        </Text>
      </div>
    );
  }

  if (!atBats || atBats.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Text variant="body" classes="text-gray-400">
          Play-by-play not available for this game.
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          {(Object.keys(FILTER_LABELS) as PbpFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                filter === f
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
        <button
          onClick={toggleAllPitches}
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
            showAllPitches
              ? "bg-cyan-500 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          {showAllPitches ? "Hide pitches" : "Show pitches"}
        </button>
      </div>

      {groups.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <Text variant="small" classes="text-gray-400">
            No plays match this filter.
          </Text>
        </div>
      )}

      {groups.map((group) => {
        const isCollapsed = collapsed.has(group.key);
        const last = group.atBats[group.atBats.length - 1];
        const score = `${awayAbbrev} ${last.score_after.away} - ${homeAbbrev} ${last.score_after.home}`;
        const summary = halfInningSummary(group.atBats);
        return (
          <div
            key={group.key}
            className="rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Inning header */}
            <button
              onClick={() => toggleGroup(group.key)}
              className="w-full flex items-center justify-between px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors"
            >
              <Text variant="small" classes="font-bold">
                {group.label}
              </Text>
              <div className="flex items-center gap-2">
                <Text
                  variant="small"
                  classes="text-gray-500 dark:text-gray-400"
                >
                  {score}
                </Text>
                <span className="text-gray-400 text-xs">
                  {isCollapsed ? "▶" : "▼"}
                </span>
              </div>
            </button>

            {/* At-bats */}
            {!isCollapsed && (
              <>
                <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {group.atBats.map((ab) => {
                    const events = eventsBySeq?.get(ab.seq);
                    const expanded = showAllPitches || expandedSeqs.has(ab.seq);
                    return (
                      <AtBatRow
                        key={ab.seq}
                        ab={ab}
                        awayAbbrev={awayAbbrev}
                        homeAbbrev={homeAbbrev}
                        expanded={expanded}
                        onToggle={() => toggleAtBat(ab.seq)}
                        events={events}
                        eventsLoading={eventsLoading}
                        onPlayerClick={onPlayerClick}
                      />
                    );
                  })}
                </div>
                {/* Half-inning footer */}
                <div className="px-3 py-1 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-700/50">
                  <Text variant="xs" classes="text-gray-500 dark:text-gray-400">
                    {summary.runs} run{summary.runs !== 1 ? "s" : ""},{" "}
                    {summary.hits} hit{summary.hits !== 1 ? "s" : ""},{" "}
                    {summary.errors} error{summary.errors !== 1 ? "s" : ""}
                    {summary.lob > 0 ? ` — ${summary.lob} LOB` : ""}
                  </Text>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
