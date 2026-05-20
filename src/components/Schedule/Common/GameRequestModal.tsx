import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLeagueStore } from "../../../context/LeagueContext";
import { SimCBB, SimCFB, SimCHL, SimNFL } from "../../../_constants/constants";
import { Modal } from "../../../_design/Modal";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import { TabGroup, Tab } from "../../../_design/Tabs";
import { Button } from "../../../_design/Buttons";
import { SelectDropdown } from "../../../_design/Select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { Text } from "../../../_design/Typography";
import {
  CFBGameRequest,
  CollegeGame,
  NFLGame,
  NFLGameRequest,
} from "../../../models/footballModels";
import FBAScheduleService from "../../../_services/scheduleService";
import { ToggleSwitch } from "../../../_design/Inputs";
import { getPlayerOverall } from "../../Gameplan/FootballGameplan/DepthChart/Modal/DepthChartModalHelper";
import { getYear } from "../../../_utility/getYear";
import { getFBAWeekID } from "../../../_helper/statsPageHelper";
import { Logo } from "../../../_design/Logo";
import { Tag, TagProps } from "../../../_design/Tags";
import { getLogo } from "../../../_utility/getLogo";
import { useAuthStore } from "../../../context/AuthContext";

export interface GameRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export const GameRequestModal = ({
  isOpen,
  onClose,
  title,
}: GameRequestModalProps) => {
  const { selectedLeague } = useLeagueStore();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      classes={`h-[80vh] sm:min-w-[1650px] overflow-auto`}
    >
      {selectedLeague === SimCFB && <CFBGameRequestModal />}
      {selectedLeague === SimNFL && <NFLGameRequestModal />}
      {selectedLeague === SimCBB && <>CBB Component</>}
      {selectedLeague === SimCHL && <>CHL Component</>}
    </Modal>
  );
};

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS = {
  CREATE: "Create Request",
  INCOMING: "Incoming",
  SENT: "Sent",
  ACCEPTED: "Accepted",
} as const;

type TabKey = (typeof TABS)[keyof typeof TABS];

const MAX_GAMES = 12;
const MAX_HOME_GAMES = 7;
const MAX_AWAY_GAMES = 7;
const REGULAR_SEASON_WEEKS = 14;

const MAX_NFL_PRESEASON_GAMES = 3;
const NFL_PRESEASON_WEEKS = 3;

const scheduleService = new FBAScheduleService();

// ─── NFLGameRequestModal ─────────────────────────────────────────────────────

const NFLGameRequestModal = () => {
  const { isModerator } = useAuthStore();
  const {
    nflTeam,
    nflTeamOptions,
    proTeamMap,
    allProGames,
    nflGameRequests,
    cfb_Timestamp,
    proRosterMap,
    nflGameplanMap,
  } = useSimFBAStore();

  // ── Local state ─────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<string>(TABS.CREATE);
  const [selectedOpponent, setSelectedOpponent] = useState<SelectOption | null>(
    null,
  );
  const [selectedWeek, setSelectedWeek] = useState<SelectOption | null>(null);
  const [homeTeamID, setHomeTeamID] = useState<number>(nflTeam?.ID ?? 0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [localRequests, setLocalRequests] =
    useState<NFLGameRequest[]>(nflGameRequests);

  useEffect(() => {
    setLocalRequests(nflGameRequests);
  }, [nflGameRequests]);

  useEffect(() => {
    if (nflTeam) setHomeTeamID(nflTeam.ID);
  }, [nflTeam]);

  // ── Memoized computations ───────────────────────────────────────────────

  /** My team's preseason games keyed by week number. */
  const myGamesMapByWeek = useMemo<Record<number, NFLGame>>(() => {
    if (!nflTeam || !allProGames) return {};
    const map: Record<number, NFLGame> = {};
    for (const game of allProGames) {
      if (
        (game.HomeTeamID === nflTeam.ID || game.AwayTeamID === nflTeam.ID) &&
        game.IsPreseasonGame
      ) {
        map[game.Week] = game;
      }
    }
    return map;
  }, [nflTeam, allProGames]);

  /** Total preseason games scheduled for my team. */
  const totalGames = useMemo(() => {
    if (!nflTeam || !allProGames) return 0;
    return allProGames.filter(
      (g) =>
        (g.HomeTeamID === nflTeam.ID || g.AwayTeamID === nflTeam.ID) &&
        g.IsPreseasonGame,
    ).length;
  }, [nflTeam, allProGames]);

  /** Total preseason games per team across the league. */
  const gameCountByTeam = useMemo<Record<number, number>>(() => {
    if (!allProGames) return {};
    const counts: Record<number, number> = {};
    for (const game of allProGames) {
      if (!game.IsPreseasonGame) continue;
      counts[game.HomeTeamID] = (counts[game.HomeTeamID] ?? 0) + 1;
      counts[game.AwayTeamID] = (counts[game.AwayTeamID] ?? 0) + 1;
    }
    return counts;
  }, [allProGames]);

  /** Set of preseason weeks each team is already scheduled. */
  const busyWeeksByTeam = useMemo<Record<number, Set<number>>>(() => {
    if (!allProGames) return {};
    const map: Record<number, Set<number>> = {};
    for (const game of allProGames) {
      if (!game.IsPreseasonGame) continue;
      if (!map[game.HomeTeamID]) map[game.HomeTeamID] = new Set();
      if (!map[game.AwayTeamID]) map[game.AwayTeamID] = new Set();
      map[game.HomeTeamID].add(game.Week);
      map[game.AwayTeamID].add(game.Week);
    }
    return map;
  }, [allProGames]);

  /** Checks whether either team in an accepted request already has a preseason game that week. */
  const getNFLWeekConflict = useCallback(
    (req: NFLGameRequest): boolean => {
      return (
        (busyWeeksByTeam[req.HomeTeamID]?.has(req.Week) ?? false) ||
        (busyWeeksByTeam[req.AwayTeamID]?.has(req.Week) ?? false)
      );
    },
    [busyWeeksByTeam],
  );

  /** Preseason weeks 1–3 where my team has no game. */
  const availableWeeks = useMemo<SelectOption[]>(() => {
    const options: SelectOption[] = [];
    for (let week = 1; week <= NFL_PRESEASON_WEEKS; week++) {
      if (!myGamesMapByWeek[week]) {
        options.push({ label: `Week ${week}`, value: String(week) });
      }
    }
    return options;
  }, [myGamesMapByWeek]);

  /** Team IDs already on my preseason schedule. */
  const alreadyScheduledOpponents = useMemo<Set<number>>(() => {
    if (!nflTeam || !allProGames) return new Set();
    const set = new Set<number>();
    for (const game of allProGames) {
      if (!game.IsPreseasonGame) continue;
      if (game.HomeTeamID === nflTeam.ID) set.add(game.AwayTeamID);
      else if (game.AwayTeamID === nflTeam.ID) set.add(game.HomeTeamID);
    }
    return set;
  }, [nflTeam, allProGames]);

  /** Available opponents: any team except self, those at the game limit,
   *  already-scheduled opponents, and teams busy on the selected week. */
  const availableOpponents = useMemo<SelectOption[]>(() => {
    if (!nflTeam || !nflTeamOptions || !proTeamMap) return [];
    const selectedWeekNum = selectedWeek ? parseInt(selectedWeek.value) : null;
    return nflTeamOptions.filter((option) => {
      const teamID = parseInt(option.value);
      if (teamID === nflTeam.ID) return false;
      if ((gameCountByTeam[teamID] ?? 0) >= MAX_NFL_PRESEASON_GAMES)
        return false;
      if (alreadyScheduledOpponents.has(teamID)) return false;
      if (
        selectedWeekNum !== null &&
        busyWeeksByTeam[teamID]?.has(selectedWeekNum)
      )
        return false;
      return true;
    });
  }, [
    nflTeam,
    nflTeamOptions,
    proTeamMap,
    selectedWeek,
    gameCountByTeam,
    alreadyScheduledOpponents,
    busyWeeksByTeam,
  ]);

  /** Requests sent TO my team that are not yet accepted. */
  const incomingRequests = useMemo<NFLGameRequest[]>(() => {
    if (!nflTeam) return [];
    return localRequests.filter(
      (r) =>
        r.RequestingTeamID === nflTeam.ID && !r.IsAccepted && !r.IsApproved,
    );
  }, [nflTeam, localRequests]);

  /** Requests my team sent out. */
  const outgoingRequests = useMemo<NFLGameRequest[]>(() => {
    if (!nflTeam) return [];
    return localRequests.filter((r) => r.SendingTeamID === nflTeam.ID);
  }, [nflTeam, localRequests]);

  /** Accepted-but-not-yet-approved requests (moderator view). */
  const acceptedRequests = useMemo<NFLGameRequest[]>(() => {
    return localRequests.filter((r) => r.IsAccepted && !r.IsApproved);
  }, [localRequests]);

  // ── Derived values ───────────────────────────────────────────────────

  const opponentID = selectedOpponent ? parseInt(selectedOpponent.value) : null;
  const weekNum = selectedWeek ? parseInt(selectedWeek.value) : null;

  const awayTeamID =
    opponentID !== null && nflTeam
      ? homeTeamID === nflTeam.ID
        ? opponentID
        : nflTeam.ID
      : null;

  const homeTeam = proTeamMap?.[homeTeamID];
  const awayTeam = proTeamMap?.[awayTeamID ?? 0];
  const homeTeamName = homeTeam?.TeamName ?? "—";
  const awayTeamName = awayTeam?.TeamName ?? "—";
  const homeTeamRoster = proRosterMap?.[homeTeamID] ?? [];
  const awayTeamRoster = proRosterMap?.[awayTeamID ?? 0] ?? [];
  const sortedHomeRoster = [...homeTeamRoster]
    .sort((a, b) => b.Overall - a.Overall)
    .slice(0, 20);
  const sortedAwayRoster = [...awayTeamRoster]
    .sort((a, b) => b.Overall - a.Overall)
    .slice(0, 20);
  const homeTeamGameplan = nflGameplanMap?.[homeTeamID];
  const awayTeamGameplan = nflGameplanMap?.[awayTeamID ?? 0];

  const canSubmit =
    !!nflTeam &&
    !!opponentID &&
    !!weekNum &&
    !isSubmitting &&
    totalGames < MAX_NFL_PRESEASON_GAMES;

  // ── Event handlers ──────────────────────────────────────────────────

  const handleOpponentChange = useCallback(
    (opt: SelectOption | null) => {
      setSelectedOpponent(opt);
      if (opt && nflTeam) setHomeTeamID(nflTeam.ID);
    },
    [nflTeam],
  );

  const handleSwapHOA = useCallback(() => {
    if (!nflTeam || !opponentID) return;
    setHomeTeamID((prev) => (prev === nflTeam.ID ? opponentID : nflTeam.ID));
  }, [nflTeam, opponentID]);

  const handleSubmitRequest = useCallback(async () => {
    if (!nflTeam || !opponentID || !weekNum || !cfb_Timestamp) return;
    const away = homeTeamID === nflTeam.ID ? opponentID : nflTeam.ID;
    const dto = {
      HomeTeamID: homeTeamID,
      AwayTeamID: away,
      SendingTeamID: nflTeam.ID,
      RequestingTeamID: opponentID,
      WeekID: getFBAWeekID(weekNum, cfb_Timestamp.NFLSeasonID),
      Week: weekNum,
      SeasonID: cfb_Timestamp.NFLSeasonID,
      IsNeutralSite: false,
      ArenaID: homeTeam?.StadiumID ?? 0,
      Arena: homeTeam?.Stadium ?? "",
      IsPreseason: true,
    };
    setIsSubmitting(true);
    try {
      await scheduleService.FBACreateNFLGameRequest(dto);
      setSelectedOpponent(null);
      setSelectedWeek(null);
      setHomeTeamID(nflTeam.ID);
    } finally {
      setIsSubmitting(false);
    }
  }, [nflTeam, opponentID, weekNum, cfb_Timestamp, homeTeamID, homeTeam]);

  const handleAcceptRequest = useCallback(async (requestID: number) => {
    await scheduleService.FBAAcceptNFLGameRequest(requestID);
    setLocalRequests((prev) => prev.filter((r) => r.ID !== requestID));
  }, []);

  const handleRejectRequest = useCallback(async (requestID: number) => {
    await scheduleService.FBARejectNFLGameRequest(requestID);
    setLocalRequests((prev) => prev.filter((r) => r.ID !== requestID));
  }, []);

  const handleProcessRequest = useCallback(async (requestID: number) => {
    await scheduleService.FBAProcessNFLGameRequest(requestID);
    setLocalRequests((prev) =>
      prev.map((r) =>
        r.ID === requestID
          ? Object.assign(new NFLGameRequest(r), { IsApproved: true })
          : r,
      ),
    );
  }, []);

  const handleVetoRequest = useCallback(async (requestID: number) => {
    await scheduleService.FBAVetoNFLGameRequest(requestID);
    setLocalRequests((prev) => prev.filter((r) => r.ID !== requestID));
  }, []);

  // ── Render ────────────────────────────────────────────────────────────

  if (!nflTeam) return null;

  return (
    <div className="flex flex-col gap-4 p-2">
      {/* Tabs */}
      <TabGroup>
        <Tab
          label={TABS.CREATE}
          selected={activeTab === TABS.CREATE}
          setSelected={setActiveTab}
        />
        <Tab
          label={TABS.INCOMING}
          selected={activeTab === TABS.INCOMING}
          setSelected={setActiveTab}
        />
        <Tab
          label={TABS.SENT}
          selected={activeTab === TABS.SENT}
          setSelected={setActiveTab}
        />
        {isModerator && (
          <Tab
            label={TABS.ACCEPTED}
            selected={activeTab === TABS.ACCEPTED}
            setSelected={setActiveTab}
          />
        )}
      </TabGroup>

      {/* ── Create Request View ────────────────────────────────────────────────────────── */}
      {activeTab === TABS.CREATE && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 justify-between items-center">
            <div>
              <Text variant="primary">
                Preseason games remaining:{" "}
                {MAX_NFL_PRESEASON_GAMES - totalGames}
              </Text>
              {totalGames >= MAX_NFL_PRESEASON_GAMES && (
                <Text variant="danger">
                  Maximum preseason games ({MAX_NFL_PRESEASON_GAMES}) reached.
                </Text>
              )}
            </div>
            <div />
            <div>
              <Button
                variant="success"
                onClick={handleSubmitRequest}
                disabled={!canSubmit}
              >
                {isSubmitting ? "Sending…" : "Send Game Request"}
              </Button>
            </div>
          </div>

          {/* Week + Opponent selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 justify-start items-start">
              <Text variant="small">Select Preseason Week</Text>
              <SelectDropdown
                options={availableWeeks}
                value={selectedWeek}
                onChange={(opt) => {
                  setSelectedWeek(opt as SelectOption | null);
                  setSelectedOpponent(null);
                  setHomeTeamID(nflTeam.ID);
                }}
                placeholder="Select week..."
                isDisabled={totalGames >= MAX_NFL_PRESEASON_GAMES}
              />
            </div>
            <div className="flex flex-col gap-1 justify-end items-end">
              <Text variant="small">Select Opponent</Text>
              <SelectDropdown
                options={availableOpponents}
                value={selectedOpponent}
                onChange={(opt) =>
                  handleOpponentChange(opt as SelectOption | null)
                }
                placeholder="Select opponent..."
                isDisabled={totalGames >= MAX_NFL_PRESEASON_GAMES}
              />
            </div>
          </div>

          {/* HOA panel */}
          {selectedOpponent && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Home team */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-row space-x-2 items-center justify-center">
                  <Text variant="small">
                    <strong>Home:</strong> {homeTeamName}
                  </Text>
                  <Text variant="small">
                    <strong>Coach:</strong>{" "}
                    {homeTeam?.NFLCoachName &&
                    homeTeam.NFLCoachName !== "AI" &&
                    homeTeam.NFLCoachName !== ""
                      ? homeTeam.NFLCoachName
                      : homeTeam?.NFLOwnerName && homeTeam.NFLOwnerName !== "AI"
                        ? homeTeam.NFLOwnerName
                        : "—"}
                  </Text>
                </div>
                <Text variant="small">
                  <strong>Scheme</strong>
                </Text>
                <div className="grid grid-cols-2 gap-2">
                  <Text variant="small">
                    Offense: {homeTeamGameplan?.OffensiveScheme ?? "—"}
                  </Text>
                  <Text variant="small">
                    Defense: {homeTeamGameplan?.DefensiveScheme ?? "—"}
                  </Text>
                </div>
                <Text variant="small">
                  <strong>Grades</strong>
                </Text>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Text variant="small">
                    Offense: {homeTeam?.OffenseGrade ?? "—"}
                  </Text>
                  <Text variant="small">
                    Defense: {homeTeam?.DefenseGrade ?? "—"}
                  </Text>
                  <Text variant="small">
                    Special Teams: {homeTeam?.SpecialTeamsGrade ?? "—"}
                  </Text>
                </div>
                <Text variant="small">
                  <strong>Top Players</strong>
                </Text>
                {sortedHomeRoster.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-48">
                    {sortedHomeRoster.map((player) => (
                      <>
                        <Text key={player.ID} variant="small">
                          Exp {player.Experience} {player.Position}
                          {player.PositionTwo.length > 0
                            ? `/${player.PositionTwo}`
                            : ""}{" "}
                          {player.Archetype}
                          {player.ArchetypeTwo.length > 0
                            ? `/${player.ArchetypeTwo}`
                            : ""}
                        </Text>
                        <Text key={`${player.ID}-name`} variant="small">
                          {player.FirstName} {player.LastName}
                        </Text>
                        <Text key={`${player.ID}-overall`} variant="small">
                          Overall: {getPlayerOverall(player, SimNFL)}
                        </Text>
                      </>
                    ))}
                  </div>
                )}
              </div>

              {/* Center column */}
              <div className="flex flex-col gap-3 justify-center items-center">
                <Text variant="h4">
                  <span className="text-gray-400 mx-1">vs.</span>
                </Text>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSwapHOA}
                  disabled={!selectedOpponent}
                >
                  Swap Home / Away
                </Button>
                <Text variant="small">
                  <strong>Stadium:</strong> {homeTeam?.Stadium ?? "—"}
                </Text>
                <Text variant="small">
                  <strong>Capacity:</strong> {homeTeam?.StadiumCapacity ?? "—"}
                </Text>
                <Text variant="small">
                  <strong>Location:</strong> {homeTeam?.City ?? "—"},{" "}
                  {homeTeam?.State ?? "—"}
                </Text>
              </div>

              {/* Away team */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-row space-x-2 items-center justify-center">
                  <Text variant="small">
                    <strong>Away:</strong> {awayTeamName}
                  </Text>
                  <Text variant="small">
                    <strong>Coach:</strong>{" "}
                    {awayTeam?.NFLCoachName &&
                    awayTeam.NFLCoachName !== "AI" &&
                    awayTeam.NFLCoachName !== ""
                      ? awayTeam.NFLCoachName
                      : awayTeam?.NFLOwnerName && awayTeam.NFLOwnerName !== "AI"
                        ? awayTeam.NFLOwnerName
                        : "—"}
                  </Text>
                </div>
                <Text variant="small">
                  <strong>Scheme</strong>
                </Text>
                <div className="grid grid-cols-2 gap-2">
                  <Text variant="small">
                    Offense: {awayTeamGameplan?.OffensiveScheme ?? "—"}
                  </Text>
                  <Text variant="small">
                    Defense: {awayTeamGameplan?.DefensiveScheme ?? "—"}
                  </Text>
                </div>
                <Text variant="small">
                  <strong>Grades</strong>
                </Text>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Text variant="small">
                    Offense: {awayTeam?.OffenseGrade ?? "—"}
                  </Text>
                  <Text variant="small">
                    Defense: {awayTeam?.DefenseGrade ?? "—"}
                  </Text>
                  <Text variant="small">
                    Special Teams: {awayTeam?.SpecialTeamsGrade ?? "—"}
                  </Text>
                </div>
                <Text variant="small">
                  <strong>Top Players</strong>
                </Text>
                {sortedAwayRoster.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-48">
                    {sortedAwayRoster.map((player) => (
                      <>
                        <Text key={player.ID} variant="small">
                          Exp {player.Experience} {player.Position}
                          {player.PositionTwo.length > 0
                            ? `/${player.PositionTwo}`
                            : ""}{" "}
                          {player.Archetype}
                          {player.ArchetypeTwo.length > 0
                            ? `/${player.ArchetypeTwo}`
                            : ""}
                        </Text>
                        <Text key={`${player.ID}-name`} variant="small">
                          {player.FirstName} {player.LastName}
                        </Text>
                        <Text key={`${player.ID}-overall`} variant="small">
                          Overall: {getPlayerOverall(player, SimNFL)}
                        </Text>
                      </>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Incoming Requests View ───────────────────────────────────────────────── */}
      {activeTab === TABS.INCOMING && (
        <div className="flex flex-col gap-3">
          {incomingRequests.length === 0 ? (
            <Text variant="small">No incoming game requests.</Text>
          ) : (
            incomingRequests.map((req) => (
              <NFLIncomingRequestCard
                key={req.ID}
                request={req}
                proTeamMap={proTeamMap}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
              />
            ))
          )}
        </div>
      )}

      {/* ── Sent Requests View ───────────────────────────────────────────────────────── */}
      {activeTab === TABS.SENT && (
        <div className="flex flex-col gap-3">
          {outgoingRequests.length === 0 ? (
            <Text variant="small">No sent game requests.</Text>
          ) : (
            outgoingRequests.map((req) => (
              <NFLSentRequestCard
                key={req.ID}
                request={req}
                proTeamMap={proTeamMap}
              />
            ))
          )}
        </div>
      )}

      {/* ── Accepted Requests View (moderator only) ───────────────────────────── */}
      {activeTab === TABS.ACCEPTED && isModerator && (
        <div className="flex flex-col gap-3">
          {acceptedRequests.length === 0 ? (
            <Text variant="small">No accepted requests pending approval.</Text>
          ) : (
            acceptedRequests.map((req) => (
              <NFLAcceptedRequestCard
                key={req.ID}
                request={req}
                proTeamMap={proTeamMap}
                hasWeekConflict={getNFLWeekConflict(req)}
                onProcess={handleProcessRequest}
                onVeto={handleVetoRequest}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ─── NFL Request Card Sub-components ─────────────────────────────────────────────

interface NFLIncomingRequestCardProps {
  request: NFLGameRequest;
  proTeamMap: Record<number, any> | null;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}

const NFLIncomingRequestCard: React.FC<NFLIncomingRequestCardProps> = ({
  request,
  proTeamMap,
  onAccept,
  onReject,
}) => {
  const sendingTeam = proTeamMap?.[request.SendingTeamID];
  const homeTeam = proTeamMap?.[request.HomeTeamID];
  const awayTeam = proTeamMap?.[request.AwayTeamID];

  return (
    <div className="border border-gray-600 border-l-4 border-l-blue-500 rounded-lg p-3 flex items-center gap-4">
      <div className="shrink-0">
        <Logo url={getLogo(SimNFL, request.SendingTeamID, false)} />
      </div>
      <div className="flex flex-1 items-start gap-6 min-w-0 flex-wrap sm:flex-nowrap">
        <div className="flex flex-col gap-1 w-44 shrink-0">
          <Text variant="xs" classes="text-gray-400 uppercase tracking-wide">
            From
          </Text>
          <Text variant="small" classes="font-semibold truncate">
            {sendingTeam?.TeamName ?? `Team #${request.SendingTeamID}`}
          </Text>
          <Tag variant="blue">Action Required</Tag>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <Text variant="xs" classes="text-gray-400 uppercase tracking-wide">
            Matchup
          </Text>
          <Text variant="small">
            <span className="font-medium">
              {homeTeam?.TeamName ?? `#${request.HomeTeamID}`}
            </span>
            <span className="text-gray-400"> (H) vs. </span>
            <span className="font-medium">
              {awayTeam?.TeamName ?? `#${request.AwayTeamID}`}
            </span>
            <span className="text-gray-400"> (A)</span>
          </Text>
          <Text variant="xs" classes="text-gray-400 truncate">
            @{" "}
            {homeTeam?.Stadium ||
              homeTeam?.TeamName ||
              `#${request.HomeTeamID}`}
          </Text>
        </div>
        <div className="flex flex-col gap-1 items-end shrink-0">
          <Text variant="xs" classes="text-gray-400 uppercase tracking-wide">
            Week
          </Text>
          <Text variant="small" classes="font-semibold">
            Week {request.Week}
          </Text>
          <Tag variant="indigo">Preseason</Tag>
        </div>
        <div className="flex flex-col gap-2 shrink-0 justify-center">
          <Button
            variant="success"
            size="sm"
            onClick={() => onAccept(request.ID)}
          >
            Accept
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onReject(request.ID)}
          >
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
};

interface NFLSentRequestCardProps {
  request: NFLGameRequest;
  proTeamMap: Record<number, any> | null;
}

const NFLSentRequestCard: React.FC<NFLSentRequestCardProps> = ({
  request,
  proTeamMap,
}) => {
  const requestingTeam = proTeamMap?.[request.RequestingTeamID];
  const homeTeam = proTeamMap?.[request.HomeTeamID];
  const awayTeam = proTeamMap?.[request.AwayTeamID];

  const status = request.IsApproved
    ? "Approved"
    : request.IsAccepted
      ? "Accepted – Pending Approval"
      : "Pending";

  const statusTagVariant: TagProps["variant"] = request.IsApproved
    ? "green"
    : request.IsAccepted
      ? "yellow"
      : "gray";

  const statusBorderAccent = request.IsApproved
    ? "border-l-green-500"
    : request.IsAccepted
      ? "border-l-yellow-500"
      : "border-l-gray-500";

  return (
    <div
      className={`border border-gray-600 border-l-4 ${statusBorderAccent} rounded-lg p-3 flex items-center gap-4`}
    >
      <div className="shrink-0">
        <Logo url={getLogo(SimNFL, request.RequestingTeamID, false)} />
      </div>
      <div className="flex flex-1 items-start gap-6 min-w-0 flex-wrap sm:flex-nowrap">
        <div className="flex flex-col gap-1 w-44 shrink-0">
          <Text variant="xs" classes="text-gray-400 uppercase tracking-wide">
            To
          </Text>
          <Text variant="small" classes="font-semibold truncate">
            {requestingTeam?.TeamName ?? `Team #${request.RequestingTeamID}`}
          </Text>
          <Tag variant={statusTagVariant}>{status}</Tag>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <Text variant="xs" classes="text-gray-400 uppercase tracking-wide">
            Matchup
          </Text>
          <Text variant="small">
            <span className="font-medium">
              {homeTeam?.TeamName ?? `#${request.HomeTeamID}`}
            </span>
            <span className="text-gray-400"> (H) vs. </span>
            <span className="font-medium">
              {awayTeam?.TeamName ?? `#${request.AwayTeamID}`}
            </span>
            <span className="text-gray-400"> (A)</span>
          </Text>
          <Text variant="xs" classes="text-gray-400 truncate">
            @{" "}
            {homeTeam?.Stadium ||
              homeTeam?.TeamName ||
              `#${request.HomeTeamID}`}
          </Text>
        </div>
        <div className="flex flex-col gap-1 items-end shrink-0">
          <Text variant="xs" classes="text-gray-400 uppercase tracking-wide">
            Week
          </Text>
          <Text variant="small" classes="font-semibold">
            Week {request.Week}
          </Text>
          <Tag variant="indigo">Preseason</Tag>
        </div>
      </div>
    </div>
  );
};

interface NFLAcceptedRequestCardProps {
  request: NFLGameRequest;
  proTeamMap: Record<number, any> | null;
  hasWeekConflict: boolean;
  onProcess: (id: number) => void;
  onVeto: (id: number) => void;
}

const NFLAcceptedRequestCard: React.FC<NFLAcceptedRequestCardProps> = ({
  request,
  proTeamMap,
  hasWeekConflict,
  onProcess,
  onVeto,
}) => {
  const sendingTeam = proTeamMap?.[request.SendingTeamID];
  const requestingTeam = proTeamMap?.[request.RequestingTeamID];
  const homeTeam = proTeamMap?.[request.HomeTeamID];
  const awayTeam = proTeamMap?.[request.AwayTeamID];

  return (
    <div
      className={`border border-gray-600 border-l-4 ${hasWeekConflict ? "border-l-red-500" : "border-l-yellow-500"} rounded-lg p-3 flex items-center gap-4`}
    >
      <div className="shrink-0">
        <Logo url={getLogo(SimNFL, request.SendingTeamID, false)} />
      </div>
      <div className="flex flex-1 items-start gap-6 min-w-0 flex-wrap sm:flex-nowrap">
        <div className="flex flex-col gap-1 w-44 shrink-0">
          <Text variant="xs" classes="text-gray-400 uppercase tracking-wide">
            Sent By
          </Text>
          <Text variant="small" classes="font-semibold truncate">
            {sendingTeam?.TeamName ?? `Team #${request.SendingTeamID}`}
          </Text>
          <Text variant="xs" classes="text-gray-400 truncate">
            To:{" "}
            {requestingTeam?.TeamName ?? `Team #${request.RequestingTeamID}`}
          </Text>
          <Tag variant="yellow">Pending Approval</Tag>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <Text variant="xs" classes="text-gray-400 uppercase tracking-wide">
            Matchup
          </Text>
          <Text variant="small">
            <span className="font-medium">
              {homeTeam?.TeamName ?? `#${request.HomeTeamID}`}
            </span>
            <span className="text-gray-400"> (H) vs. </span>
            <span className="font-medium">
              {awayTeam?.TeamName ?? `#${request.AwayTeamID}`}
            </span>
            <span className="text-gray-400"> (A)</span>
          </Text>
          <Text variant="xs" classes="text-gray-400 truncate">
            @{" "}
            {homeTeam?.Stadium ||
              homeTeam?.TeamName ||
              `#${request.HomeTeamID}`}
          </Text>
        </div>
        <div className="flex flex-col gap-1 items-end shrink-0">
          <Text variant="xs" classes="text-gray-400 uppercase tracking-wide">
            Week
          </Text>
          <Text variant="small" classes="font-semibold">
            Week {request.Week}
          </Text>
          <Tag variant="indigo">Preseason</Tag>
          {hasWeekConflict && <Tag variant="red">⚠ Week Conflict</Tag>}
        </div>
        <div className="flex flex-col gap-2 shrink-0 justify-center">
          <Button
            variant="success"
            size="sm"
            onClick={() => onProcess(request.ID)}
            disabled={hasWeekConflict}
          >
            Process
          </Button>
          <Button variant="danger" size="sm" onClick={() => onVeto(request.ID)}>
            Veto
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── CFBGameRequestModal ──────────────────────────────────────────────────────

const CFBGameRequestModal = () => {
  const { isModerator } = useAuthStore();
  const {
    cfbTeam,
    cfbTeamMap,
    cfbTeamOptions,
    allCollegeGames,
    cfbGameRequests,
    stadiums,
    cfb_Timestamp,
    cfbRosterMap,
    collegeGameplanMap,
  } = useSimFBAStore();

  // ── Local state ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<string>(TABS.CREATE);
  const [selectedOpponent, setSelectedOpponent] = useState<SelectOption | null>(
    null,
  );
  const [selectedWeek, setSelectedWeek] = useState<SelectOption | null>(null);
  const [isNeutralSite, setIsNeutralSite] = useState<boolean>(false);
  const [isSpringGame, setIsSpringGame] = useState<boolean>(false);
  const [homeTeamID, setHomeTeamID] = useState<number>(cfbTeam?.ID ?? 0);
  const [selectedStadium, setSelectedStadium] = useState<SelectOption | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Local copy of requests so we can remove entries after accept/reject without
  // waiting for a full bootstrap re-fetch.
  const [localRequests, setLocalRequests] =
    useState<CFBGameRequest[]>(cfbGameRequests);

  useEffect(() => {
    setLocalRequests(cfbGameRequests);
  }, [cfbGameRequests]);

  // Reset homeTeamID when cfbTeam changes
  useEffect(() => {
    if (cfbTeam) setHomeTeamID(cfbTeam.ID);
  }, [cfbTeam]);

  // Clear stadium selection when neutral site is unchecked
  useEffect(() => {
    if (!isNeutralSite) setSelectedStadium(null);
  }, [isNeutralSite]);

  // ── Memoized computations ──────────────────────────────────────────────────

  const stadiumMap = useMemo<Record<number, any>>(() => {
    if (!stadiums) return {};
    const map: Record<number, any> = {};
    for (const s of stadiums) {
      map[s.ID] = s;
    }
    return map;
  }, [stadiums]);

  const stadiumData = useMemo(() => {
    if (!selectedStadium) return null;
    return stadiumMap[parseInt(selectedStadium.value)];
  }, [selectedStadium, stadiumMap]);

  /** My team's games keyed by week number (scoped to spring or regular season). */
  const myGamesMapByWeek = useMemo<Record<number, CollegeGame>>(() => {
    if (!cfbTeam || !allCollegeGames) return {};
    const map: Record<number, CollegeGame> = {};
    for (const game of allCollegeGames) {
      if (
        (game.HomeTeamID === cfbTeam.ID || game.AwayTeamID === cfbTeam.ID) &&
        game.IsSpringGame === isSpringGame
      ) {
        map[game.Week] = game;
      }
    }
    return map;
  }, [cfbTeam, allCollegeGames, isSpringGame]);

  /** Home, away, and total game counts for my team (neutral games excluded from H/A, scoped to game type). */
  const { homeCount, awayCount, totalGames } = useMemo(() => {
    if (!cfbTeam || !allCollegeGames)
      return { homeCount: 0, awayCount: 0, totalGames: 0 };
    let h = 0,
      a = 0,
      t = 0;
    for (const game of allCollegeGames) {
      if (
        (game.HomeTeamID === cfbTeam.ID || game.AwayTeamID === cfbTeam.ID) &&
        game.IsSpringGame === isSpringGame
      ) {
        t++;
        if (!game.IsNeutral) {
          if (game.HomeTeamID === cfbTeam.ID) h++;
          else a++;
        }
      }
    }
    return { homeCount: h, awayCount: a, totalGames: t };
  }, [cfbTeam, allCollegeGames, isSpringGame]);

  /** Total games scheduled per team across the whole league (scoped to game type). */
  const gameCountByTeam = useMemo<Record<number, number>>(() => {
    if (!allCollegeGames) return {};
    const counts: Record<number, number> = {};
    for (const game of allCollegeGames) {
      if (game.IsSpringGame !== isSpringGame) continue;
      counts[game.HomeTeamID] = (counts[game.HomeTeamID] ?? 0) + 1;
      counts[game.AwayTeamID] = (counts[game.AwayTeamID] ?? 0) + 1;
    }
    return counts;
  }, [allCollegeGames, isSpringGame]);

  /** Set of week numbers each team is already scheduled to play (scoped to game type). */
  const busyWeeksByTeam = useMemo<Record<number, Set<number>>>(() => {
    if (!allCollegeGames) return {};
    const map: Record<number, Set<number>> = {};
    for (const game of allCollegeGames) {
      if (game.IsSpringGame !== isSpringGame) continue;
      if (!map[game.HomeTeamID]) map[game.HomeTeamID] = new Set();
      if (!map[game.AwayTeamID]) map[game.AwayTeamID] = new Set();
      map[game.HomeTeamID].add(game.Week);
      map[game.AwayTeamID].add(game.Week);
    }
    return map;
  }, [allCollegeGames, isSpringGame]);

  /** Busy weeks maps for accepted-request conflict checking (not scoped to isSpringGame toggle). */
  const busyWeeksByTeamRegular = useMemo<Record<number, Set<number>>>(() => {
    if (!allCollegeGames) return {};
    const map: Record<number, Set<number>> = {};
    for (const game of allCollegeGames) {
      if (game.IsSpringGame) continue;
      if (!map[game.HomeTeamID]) map[game.HomeTeamID] = new Set();
      if (!map[game.AwayTeamID]) map[game.AwayTeamID] = new Set();
      map[game.HomeTeamID].add(game.Week);
      map[game.AwayTeamID].add(game.Week);
    }
    return map;
  }, [allCollegeGames]);

  const busyWeeksByTeamSpring = useMemo<Record<number, Set<number>>>(() => {
    if (!allCollegeGames) return {};
    const map: Record<number, Set<number>> = {};
    for (const game of allCollegeGames) {
      if (!game.IsSpringGame) continue;
      if (!map[game.HomeTeamID]) map[game.HomeTeamID] = new Set();
      if (!map[game.AwayTeamID]) map[game.AwayTeamID] = new Set();
      map[game.HomeTeamID].add(game.Week);
      map[game.AwayTeamID].add(game.Week);
    }
    return map;
  }, [allCollegeGames]);

  /** Checks whether either team in an accepted request already has a game that week (same game type). */
  const getCFBWeekConflict = useCallback(
    (req: CFBGameRequest): boolean => {
      const map = req.IsSpringGame
        ? busyWeeksByTeamSpring
        : busyWeeksByTeamRegular;
      return (
        (map[req.HomeTeamID]?.has(req.Week) ?? false) ||
        (map[req.AwayTeamID]?.has(req.Week) ?? false)
      );
    },
    [busyWeeksByTeamRegular, busyWeeksByTeamSpring],
  );

  /** Weeks 1–REGULAR_SEASON_WEEKS where my team has no game. */
  const availableWeeks = useMemo<SelectOption[]>(() => {
    let weeks_available = isSpringGame ? 3 : REGULAR_SEASON_WEEKS;
    const options: SelectOption[] = [];
    for (let week = 0; week <= weeks_available; week++) {
      if (!myGamesMapByWeek[week]) {
        options.push({ label: `Week ${week}`, value: String(week) });
      }
    }
    return options;
  }, [myGamesMapByWeek, isSpringGame]);

  /** Set of team IDs already on my team's schedule (any week, scoped to game type). */
  const alreadyScheduledOpponents = useMemo<Set<number>>(() => {
    if (!cfbTeam || !allCollegeGames) return new Set();
    const set = new Set<number>();
    for (const game of allCollegeGames) {
      if (game.IsSpringGame !== isSpringGame) continue;
      if (game.HomeTeamID === cfbTeam.ID) set.add(game.AwayTeamID);
      else if (game.AwayTeamID === cfbTeam.ID) set.add(game.HomeTeamID);
    }
    return set;
  }, [cfbTeam, allCollegeGames, isSpringGame]);

  /**
   * Out-of-conference opponents available for the selected week.
   * Excludes teams with 12+ games, same-conference teams, teams already
   * on the schedule (any week), and teams busy on the selected week.
   */
  const availableOpponents = useMemo<SelectOption[]>(() => {
    if (!cfbTeam || !cfbTeamOptions || !cfbTeamMap) return [];
    const selectedWeekNum = selectedWeek ? parseInt(selectedWeek.value) : null;
    return cfbTeamOptions.filter((option) => {
      const teamID = parseInt(option.value);
      const team = cfbTeamMap[teamID];
      if (!team) return false;
      if (teamID === cfbTeam.ID) return false;
      // OOC only
      if (team.ConferenceID === cfbTeam.ConferenceID) return false;
      // Exclude teams at game limit
      if ((gameCountByTeam[teamID] ?? 0) >= MAX_GAMES) return false;
      // Exclude teams already on the schedule
      if (alreadyScheduledOpponents.has(teamID)) return false;
      // Exclude teams busy on the selected week
      if (
        selectedWeekNum !== null &&
        busyWeeksByTeam[teamID]?.has(selectedWeekNum)
      )
        return false;
      return true;
    });
  }, [
    cfbTeam,
    cfbTeamOptions,
    cfbTeamMap,
    selectedWeek,
    gameCountByTeam,
    alreadyScheduledOpponents,
    busyWeeksByTeam,
  ]);

  /** All CFB stadium options for neutral-site selection. */
  const stadiumOptions = useMemo<SelectOption[]>(() => {
    if (!stadiums) return [];
    return stadiums.map((s) => ({
      label: `${s.StadiumName} – ${s.City}, ${s.State}`,
      value: String(s.ID),
    }));
  }, [stadiums]);

  /** Requests sent TO my team that are not yet accepted. */
  const incomingRequests = useMemo<CFBGameRequest[]>(() => {
    if (!cfbTeam) return [];
    return localRequests.filter(
      (r) =>
        r.RequestingTeamID === cfbTeam.ID && !r.IsAccepted && !r.IsApproved,
    );
  }, [cfbTeam, localRequests]);

  /** Requests that my team sent out. */
  const outgoingRequests = useMemo<CFBGameRequest[]>(() => {
    if (!cfbTeam) return [];
    return localRequests.filter((r) => r.SendingTeamID === cfbTeam.ID);
  }, [cfbTeam, localRequests]);

  /** All accepted-but-not-yet-approved requests (moderator view). */
  const acceptedRequests = useMemo<CFBGameRequest[]>(() => {
    return localRequests.filter((r) => r.IsAccepted && !r.IsApproved);
  }, [localRequests]);

  // ── Derived values ─────────────────────────────────────────────────────────

  const opponentID = selectedOpponent ? parseInt(selectedOpponent.value) : null;
  const weekNum = selectedWeek ? parseInt(selectedWeek.value) : null;

  const awayTeamID =
    opponentID !== null && cfbTeam
      ? homeTeamID === cfbTeam.ID
        ? opponentID
        : cfbTeam.ID
      : null;

  const homeTeam = cfbTeamMap?.[homeTeamID];
  const awayTeam = cfbTeamMap?.[awayTeamID ?? 0];
  const homeTeamName = homeTeam?.TeamName ?? "—";
  const awayTeamName = awayTeam?.TeamName ?? "—";
  const homeTeamRoster = cfbRosterMap?.[homeTeamID] ?? [];
  const awayTeamRoster = cfbRosterMap?.[awayTeamID ?? 0] ?? [];
  const sortedHomeRoster = [...homeTeamRoster]
    .sort((a, b) => b.Overall - a.Overall)
    .slice(0, 20);
  const sortedAwayRoster = [...awayTeamRoster]
    .sort((a, b) => b.Overall - a.Overall)
    .slice(0, 20);
  const homeTeamGameplan = collegeGameplanMap?.[homeTeamID];
  const awayTeamGameplan = collegeGameplanMap?.[awayTeamID ?? 0];

  // HOA constraint helpers
  const swapWouldGoAway = homeTeamID === cfbTeam?.ID;
  const swapDisabled =
    isNeutralSite ||
    !selectedOpponent ||
    (swapWouldGoAway && awayCount >= MAX_AWAY_GAMES) ||
    (!swapWouldGoAway && homeCount >= MAX_HOME_GAMES);

  const canSubmit =
    !!cfbTeam &&
    !!opponentID &&
    !!weekNum &&
    !isSubmitting &&
    totalGames < MAX_GAMES &&
    (!isNeutralSite || !!selectedStadium);

  // ── Event handlers ─────────────────────────────────────────────────────────

  const handleOpponentChange = useCallback(
    (opt: SelectOption | null) => {
      setSelectedOpponent(opt);
      if (opt && cfbTeam) {
        // Respect home count constraint when choosing initial HOA
        setHomeTeamID(
          homeCount >= MAX_HOME_GAMES ? parseInt(opt.value) : cfbTeam.ID,
        );
      }
    },
    [cfbTeam, homeCount],
  );

  const handleSwapHOA = useCallback(() => {
    if (!cfbTeam || !opponentID) return;
    setHomeTeamID((prev) => (prev === cfbTeam.ID ? opponentID : cfbTeam.ID));
  }, [cfbTeam, opponentID]);

  const handleSubmitRequest = useCallback(async () => {
    if (!cfbTeam || !opponentID || !weekNum || !cfb_Timestamp) return;
    const away = homeTeamID === cfbTeam.ID ? opponentID : cfbTeam.ID;
    const dto = {
      HomeTeamID: homeTeamID,
      AwayTeamID: away,
      SendingTeamID: cfbTeam.ID,
      RequestingTeamID: opponentID,
      WeekID: getFBAWeekID(weekNum, cfb_Timestamp.CollegeSeasonID),
      Week: weekNum,
      SeasonID: cfb_Timestamp.CollegeSeasonID,
      IsNeutralSite: isNeutralSite,
      ArenaID:
        isNeutralSite && selectedStadium
          ? parseInt(selectedStadium.value)
          : (homeTeam?.StadiumID ?? 0),
      Arena:
        isNeutralSite && selectedStadium
          ? (stadiumData?.StadiumName ?? "")
          : (homeTeam?.Stadium ?? ""),
      IsSpringGame: isSpringGame,
    };
    setIsSubmitting(true);
    try {
      await scheduleService.FBACreateCFBGameRequest(dto);
      // Reset form on success
      setSelectedOpponent(null);
      setSelectedWeek(null);
      setIsNeutralSite(false);
      setSelectedStadium(null);
      setHomeTeamID(cfbTeam.ID);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    cfbTeam,
    opponentID,
    weekNum,
    cfb_Timestamp,
    homeTeamID,
    isNeutralSite,
    selectedStadium,
  ]);

  const handleAcceptRequest = useCallback(async (requestID: number) => {
    await scheduleService.FBAAcceptCFBGameRequest(requestID);
    setLocalRequests((prev) => prev.filter((r) => r.ID !== requestID));
  }, []);

  const handleRejectRequest = useCallback(async (requestID: number) => {
    await scheduleService.FBARejectCFBGameRequest(requestID);
    setLocalRequests((prev) => prev.filter((r) => r.ID !== requestID));
  }, []);

  const handleProcessRequest = useCallback(async (requestID: number) => {
    await scheduleService.FBAProcessCFBGameRequest(requestID);
    setLocalRequests((prev) =>
      prev.map((r) =>
        r.ID === requestID
          ? Object.assign(new CFBGameRequest(r), { IsApproved: true })
          : r,
      ),
    );
  }, []);

  const handleVetoRequest = useCallback(async (requestID: number) => {
    await scheduleService.FBAVetoCFBGameRequest(requestID);
    setLocalRequests((prev) => prev.filter((r) => r.ID !== requestID));
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!cfbTeam) return null;

  return (
    <div className="flex flex-col gap-4 p-2">
      {/* Tabs */}
      <TabGroup>
        <Tab
          label={TABS.CREATE}
          selected={activeTab === TABS.CREATE}
          setSelected={setActiveTab}
        />
        <Tab
          label={TABS.INCOMING}
          selected={activeTab === TABS.INCOMING}
          setSelected={setActiveTab}
        />
        <Tab
          label={TABS.SENT}
          selected={activeTab === TABS.SENT}
          setSelected={setActiveTab}
        />
        {isModerator && (
          <Tab
            label={TABS.ACCEPTED}
            selected={activeTab === TABS.ACCEPTED}
            setSelected={setActiveTab}
          />
        )}
      </TabGroup>

      {/* ── Create Request View ─────────────────────────────────────────── */}
      {activeTab === TABS.CREATE && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 justify-between items-center">
            <div className="flex flex-col space-y-2">
              <div className="flex flex-row space-x-2">
                <Text>Is Neutral Site</Text>
                <ToggleSwitch
                  onChange={(checked) => setIsNeutralSite(checked)}
                  checked={isNeutralSite}
                />
              </div>
              <div className="flex flex-row space-x-2">
                <Text>Is Spring Game</Text>
                <ToggleSwitch
                  onChange={(checked) => setIsSpringGame(checked)}
                  checked={isSpringGame}
                />
              </div>
            </div>
            {totalGames < MAX_GAMES && (
              <div>
                <Text variant="primary">
                  Games remaining: {MAX_GAMES - totalGames} (Home:{" "}
                  {6 - homeCount} | Away: {6 - awayCount})
                </Text>
              </div>
            )}
            {totalGames >= MAX_GAMES && (
              <div>
                <Text variant="danger">
                  Your team has reached the maximum of {MAX_GAMES} scheduled
                  games and cannot send new requests.
                </Text>
              </div>
            )}
            {/* Submit */}
            <div>
              <Button
                variant="success"
                onClick={handleSubmitRequest}
                disabled={!canSubmit}
              >
                {isSubmitting ? "Sending…" : "Send Game Request"}
              </Button>
            </div>
          </div>

          {/* Week + Opponent selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 justify-start items-start">
              <Text variant="small">Select Week</Text>
              <SelectDropdown
                options={availableWeeks}
                value={selectedWeek}
                onChange={(opt) => {
                  setSelectedWeek(opt as SelectOption | null);
                  // Clear opponent when week changes so availability re-evaluates
                  setSelectedOpponent(null);
                  setHomeTeamID(cfbTeam.ID);
                }}
                placeholder="Select week..."
                isDisabled={totalGames >= MAX_GAMES}
              />
            </div>
            <div className="flex flex-col gap-1 justify-end items-end">
              <Text variant="small">Select Opponent (Out-of-Conference)</Text>
              <SelectDropdown
                options={availableOpponents}
                value={selectedOpponent}
                onChange={(opt) =>
                  handleOpponentChange(opt as SelectOption | null)
                }
                placeholder="Select opponent..."
                isDisabled={totalGames >= MAX_GAMES}
              />
            </div>
          </div>

          {/* HOA + Neutral site controls */}
          {selectedOpponent && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-row space-x-2 items-center justify-center">
                    <Text variant="small">
                      <strong>Home:</strong> {homeTeamName}{" "}
                    </Text>
                    <Text variant="small">
                      <strong>Coach:</strong>{" "}
                      {homeTeam?.Coach != "AI" && homeTeam?.Coach != ""
                        ? homeTeam?.Coach
                        : "—"}
                    </Text>
                  </div>
                  <Text variant="small">
                    <strong>Scheme</strong>{" "}
                  </Text>
                  <div className="grid grid-cols-2 gap-2">
                    <Text variant="small">
                      Offense: {homeTeamGameplan?.OffensiveScheme ?? "—"}
                    </Text>
                    <Text variant="small">
                      Defense: {homeTeamGameplan?.DefensiveScheme ?? "—"}
                    </Text>
                  </div>
                  <Text variant="small">
                    <strong>Grades</strong>{" "}
                  </Text>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <Text variant="small">
                      Offense: {homeTeam?.OffenseGrade ?? "—"}
                    </Text>
                    <Text variant="small">
                      Defense: {homeTeam?.DefenseGrade ?? "—"}
                    </Text>
                    <Text variant="small">
                      Special Teams: {homeTeam?.SpecialTeamsGrade ?? "—"}
                    </Text>
                  </div>
                  <Text variant="small">
                    <strong>Top Players</strong>
                  </Text>
                  {sortedHomeRoster.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-48">
                      {sortedHomeRoster.map((player) => (
                        <>
                          <Text key={player.ID} variant="small">
                            {getYear(player.Year, player.IsRedshirt)}{" "}
                            {player.Position}
                            {player.PositionTwo.length > 0
                              ? `/${player.PositionTwo}`
                              : ""}{" "}
                            {player.Archetype}
                            {player.ArchetypeTwo.length > 0
                              ? `/${player.ArchetypeTwo}`
                              : ""}
                          </Text>
                          <Text key={`${player.ID}-name`} variant="small">
                            {player.FirstName} {player.LastName}
                          </Text>
                          <Text key={`${player.ID}-overall`} variant="small">
                            Overall: {getPlayerOverall(player, SimCFB)}
                          </Text>
                        </>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <Text variant="h4">
                    <span className="text-gray-400 mx-1">vs.</span>{" "}
                  </Text>
                  {/* HOA summary */}
                  <div className="flex flex-col gap-1 justify-center items-center">
                    <div className="flex flex-col flex-wrap items-center gap-2">
                      {!isNeutralSite && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleSwapHOA}
                          disabled={swapDisabled}
                        >
                          Swap Home / Away
                        </Button>
                      )}
                      {/* Stadium selector (neutral only) */}
                      {isNeutralSite && (
                        <div className="flex flex-col gap-1">
                          <Text variant="h6">Select Stadium</Text>
                          <SelectDropdown
                            options={stadiumOptions}
                            value={selectedStadium}
                            onChange={(opt) =>
                              setSelectedStadium(opt as SelectOption | null)
                            }
                            placeholder="Select stadium..."
                          />
                        </div>
                      )}
                      {homeCount >= MAX_HOME_GAMES && (
                        <Text variant="small" classes="text-yellow-400">
                          Max home games ({MAX_HOME_GAMES}) reached.
                        </Text>
                      )}
                      {awayCount >= MAX_AWAY_GAMES && (
                        <Text variant="small" classes="text-yellow-400">
                          Max away games ({MAX_AWAY_GAMES}) reached.
                        </Text>
                      )}
                      <Text variant="small">
                        <strong>Stadium:</strong>{" "}
                        {!isNeutralSite
                          ? (homeTeam?.Stadium ?? "—")
                          : (stadiumData?.StadiumName ?? "—")}
                      </Text>
                      <Text variant="small">
                        <strong>Capacity:</strong>{" "}
                        {!isNeutralSite
                          ? (homeTeam?.StadiumCapacity ?? "—")
                          : (stadiumData?.Capacity ?? "—")}
                      </Text>
                      <Text variant="small">
                        <strong>Location:</strong>{" "}
                        {!isNeutralSite
                          ? (homeTeam?.City ?? "—")
                          : (stadiumData?.City ?? "—")}
                        ,{" "}
                        {!isNeutralSite
                          ? (homeTeam?.State ?? "—")
                          : (stadiumData?.State ?? "—")}
                      </Text>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-row space-x-2 items-center justify-center">
                    <Text variant="small">
                      <strong>Away:</strong> {awayTeamName}{" "}
                    </Text>
                    <Text variant="small">
                      <strong>Coach:</strong>{" "}
                      {awayTeam?.Coach != "AI" && awayTeam?.Coach != ""
                        ? awayTeam?.Coach
                        : "—"}
                    </Text>
                  </div>
                  <Text variant="small">
                    <strong>Scheme</strong>{" "}
                  </Text>
                  <div className="grid grid-cols-2 gap-2">
                    <Text variant="small">
                      Offense: {awayTeamGameplan?.OffensiveScheme ?? "—"}
                    </Text>
                    <Text variant="small">
                      Defense: {awayTeamGameplan?.DefensiveScheme ?? "—"}
                    </Text>
                  </div>
                  <Text variant="small">
                    <strong>Grades</strong>{" "}
                  </Text>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <Text variant="small">
                      Offense: {awayTeam?.OffenseGrade ?? "—"}
                    </Text>
                    <Text variant="small">
                      Defense: {awayTeam?.DefenseGrade ?? "—"}
                    </Text>
                    <Text variant="small">
                      Special Teams: {awayTeam?.SpecialTeamsGrade ?? "—"}
                    </Text>
                  </div>
                  <Text variant="small">
                    <strong>Top Players</strong>
                  </Text>
                  {sortedAwayRoster.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-48">
                      {sortedAwayRoster.map((player) => (
                        <>
                          <Text key={player.ID} variant="small">
                            {getYear(player.Year, player.IsRedshirt)}{" "}
                            {player.Position}
                            {player.PositionTwo.length > 0
                              ? `/${player.PositionTwo}`
                              : ""}{" "}
                            {player.Archetype}
                            {player.ArchetypeTwo.length > 0
                              ? `/${player.ArchetypeTwo}`
                              : ""}
                          </Text>
                          <Text key={`${player.ID}-name`} variant="small">
                            {player.FirstName} {player.LastName}
                          </Text>
                          <Text key={`${player.ID}-overall`} variant="small">
                            Overall: {getPlayerOverall(player, SimCFB)}
                          </Text>
                        </>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Incoming Requests View ──────────────────────────────────────── */}
      {activeTab === TABS.INCOMING && (
        <div className="flex flex-col gap-3">
          {incomingRequests.length === 0 ? (
            <Text variant="small">No incoming game requests.</Text>
          ) : (
            incomingRequests.map((req) => (
              <IncomingRequestCard
                key={req.ID}
                request={req}
                cfbTeamMap={cfbTeamMap}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
              />
            ))
          )}
        </div>
      )}

      {/* ── Sent Requests View ──────────────────────────────────────────── */}
      {activeTab === TABS.SENT && (
        <div className="flex flex-col gap-3">
          {outgoingRequests.length === 0 ? (
            <Text variant="small">No sent game requests.</Text>
          ) : (
            outgoingRequests.map((req) => (
              <SentRequestCard
                key={req.ID}
                request={req}
                cfbTeamMap={cfbTeamMap}
              />
            ))
          )}
        </div>
      )}

      {/* ── Accepted Requests View (moderator only) ─────────────────────── */}
      {activeTab === TABS.ACCEPTED && isModerator && (
        <div className="flex flex-col gap-3">
          {acceptedRequests.length === 0 ? (
            <Text variant="small">No accepted requests pending approval.</Text>
          ) : (
            acceptedRequests.map((req) => (
              <AcceptedRequestCard
                key={req.ID}
                request={req}
                teamMap={cfbTeamMap}
                hasWeekConflict={getCFBWeekConflict(req)}
                onProcess={handleProcessRequest}
                onVeto={handleVetoRequest}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ─── Request Card Sub-components ─────────────────────────────────────────────

interface IncomingRequestCardProps {
  request: CFBGameRequest;
  cfbTeamMap: Record<number, any> | null;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}

const IncomingRequestCard: React.FC<IncomingRequestCardProps> = ({
  request,
  cfbTeamMap,
  onAccept,
  onReject,
}) => {
  const sendingTeam = cfbTeamMap?.[request.SendingTeamID];
  const homeTeam = cfbTeamMap?.[request.HomeTeamID];
  const awayTeam = cfbTeamMap?.[request.AwayTeamID];

  return (
    <div className="border border-gray-600 border-l-4 border-l-blue-500 rounded-lg p-3 flex items-center gap-4">
      {/* Logo */}
      <div className="shrink-0">
        <Logo url={getLogo(SimCFB, request.SendingTeamID, false)} />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-start gap-6 min-w-0 flex-wrap sm:flex-nowrap">
        {/* Sender */}
        <div className="flex flex-col gap-1 w-44 shrink-0">
          <Text variant="xs" classes="text-gray-400 uppercase tracking-wide">
            From
          </Text>
          <Text variant="small" classes="font-semibold truncate">
            {sendingTeam?.TeamName ?? `Team #${request.SendingTeamID}`}
          </Text>
          <Tag variant="blue">Action Required</Tag>
        </div>

        {/* Matchup + Venue */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <Text variant="xs" classes="text-gray-400 uppercase tracking-wide">
            Matchup
          </Text>
          <Text variant="small">
            <span className="font-medium">
              {homeTeam?.TeamName ?? `#${request.HomeTeamID}`}
            </span>
            <span className="text-gray-400"> (H) vs. </span>
            <span className="font-medium">
              {awayTeam?.TeamName ?? `#${request.AwayTeamID}`}
            </span>
            <span className="text-gray-400"> (A)</span>
          </Text>
          {request.IsNeutralSite ? (
            <Text variant="xs" classes="text-gray-400 truncate">
              @ {request.Arena || "Neutral Site"}
            </Text>
          ) : (
            <Text variant="xs" classes="text-gray-400 truncate">
              @{" "}
              {homeTeam?.Stadium ||
                homeTeam?.TeamName ||
                `#${request.HomeTeamID}`}
            </Text>
          )}
        </div>

        {/* Week + Tags */}
        <div className="flex flex-col gap-1 items-end shrink-0">
          <Text variant="xs" classes="text-gray-400 uppercase tracking-wide">
            Week
          </Text>
          <Text variant="small" classes="font-semibold">
            Week {request.Week}
          </Text>
          <div className="flex gap-1 flex-wrap justify-end">
            {request.IsSpringGame && <Tag variant="indigo">Spring</Tag>}
            {request.IsNeutralSite && <Tag variant="purple">Neutral</Tag>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0 justify-center">
          <Button
            variant="success"
            size="sm"
            onClick={() => onAccept(request.ID)}
          >
            Accept
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onReject(request.ID)}
          >
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
};

interface AcceptedRequestCardProps {
  request: CFBGameRequest;
  teamMap: Record<number, any> | null;
  hasWeekConflict: boolean;
  onProcess: (id: number) => void;
  onVeto: (id: number) => void;
}

const AcceptedRequestCard: React.FC<AcceptedRequestCardProps> = ({
  request,
  teamMap,
  hasWeekConflict,
  onProcess,
  onVeto,
}) => {
  const sendingTeam = teamMap?.[request.SendingTeamID];
  const requestingTeam = teamMap?.[request.RequestingTeamID];
  const homeTeam = teamMap?.[request.HomeTeamID];
  const awayTeam = teamMap?.[request.AwayTeamID];

  return (
    <div
      className={`border border-gray-600 border-l-4 ${hasWeekConflict ? "border-l-red-500" : "border-l-yellow-500"} rounded-lg p-3 flex items-center gap-4`}
    >
      {/* Logo */}
      <div className="shrink-0">
        <Logo url={getLogo(SimCFB, request.SendingTeamID, false)} />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-start gap-6 min-w-0 flex-wrap sm:flex-nowrap">
        {/* Teams */}
        <div className="flex flex-col gap-1 w-44 shrink-0">
          <Text variant="xs" classes="text-gray-400 uppercase tracking-wide">
            Sent By
          </Text>
          <Text variant="small" classes="font-semibold truncate">
            {sendingTeam?.TeamName ?? `Team #${request.SendingTeamID}`}
          </Text>
          <Text variant="xs" classes="text-gray-400 truncate">
            To:{" "}
            {requestingTeam?.TeamName ?? `Team #${request.RequestingTeamID}`}
          </Text>
          <Tag variant="yellow">Pending Approval</Tag>
        </div>

        {/* Matchup + Venue */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <Text variant="xs" classes="text-gray-400 uppercase tracking-wide">
            Matchup
          </Text>
          <Text variant="small">
            <span className="font-medium">
              {homeTeam?.TeamName ?? `#${request.HomeTeamID}`}
            </span>
            <span className="text-gray-400"> (H) vs. </span>
            <span className="font-medium">
              {awayTeam?.TeamName ?? `#${request.AwayTeamID}`}
            </span>
            <span className="text-gray-400"> (A)</span>
          </Text>
          {request.IsNeutralSite ? (
            <Text variant="xs" classes="text-gray-400 truncate">
              @ {request.Arena || "Neutral Site"}
            </Text>
          ) : (
            <Text variant="xs" classes="text-gray-400 truncate">
              @{" "}
              {homeTeam?.Stadium ||
                homeTeam?.TeamName ||
                `#${request.HomeTeamID}`}
            </Text>
          )}
        </div>

        {/* Week + Tags */}
        <div className="flex flex-col gap-1 items-end shrink-0">
          <Text variant="xs" classes="text-gray-400 uppercase tracking-wide">
            Week
          </Text>
          <Text variant="small" classes="font-semibold">
            Week {request.Week}
          </Text>
          <div className="flex gap-1 flex-wrap justify-end">
            {request.IsSpringGame && <Tag variant="indigo">Spring</Tag>}
            {request.IsNeutralSite && <Tag variant="purple">Neutral</Tag>}
            {hasWeekConflict && <Tag variant="red">⚠ Week Conflict</Tag>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0 justify-center">
          <Button
            variant="success"
            size="sm"
            onClick={() => onProcess(request.ID)}
            disabled={hasWeekConflict}
          >
            Process
          </Button>
          <Button variant="danger" size="sm" onClick={() => onVeto(request.ID)}>
            Veto
          </Button>
        </div>
      </div>
    </div>
  );
};

interface SentRequestCardProps {
  request: CFBGameRequest;
  cfbTeamMap: Record<number, any> | null;
}

const SentRequestCard: React.FC<SentRequestCardProps> = ({
  request,
  cfbTeamMap,
}) => {
  const requestingTeam = cfbTeamMap?.[request.RequestingTeamID];
  const homeTeam = cfbTeamMap?.[request.HomeTeamID];
  const awayTeam = cfbTeamMap?.[request.AwayTeamID];

  const status = request.IsApproved
    ? "Approved"
    : request.IsAccepted
      ? "Accepted – Pending Approval"
      : "Pending";

  const statusTagVariant: TagProps["variant"] = request.IsApproved
    ? "green"
    : request.IsAccepted
      ? "yellow"
      : "gray";

  const statusBorderAccent = request.IsApproved
    ? "border-l-green-500"
    : request.IsAccepted
      ? "border-l-yellow-500"
      : "border-l-gray-500";

  return (
    <div
      className={`border border-gray-600 border-l-4 ${statusBorderAccent} rounded-lg p-3 flex items-center gap-4`}
    >
      {/* Logo */}
      <div className="shrink-0">
        <Logo url={getLogo(SimCFB, request.RequestingTeamID, false)} />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-start gap-6 min-w-0 flex-wrap sm:flex-nowrap">
        {/* Recipient + Status */}
        <div className="flex flex-col gap-1 w-44 shrink-0">
          <Text variant="xs" classes="text-gray-400 uppercase tracking-wide">
            To
          </Text>
          <Text variant="small" classes="font-semibold truncate">
            {requestingTeam?.TeamName ?? `Team #${request.RequestingTeamID}`}
          </Text>
          <Tag variant={statusTagVariant}>{status}</Tag>
        </div>

        {/* Matchup + Venue */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <Text variant="xs" classes="text-gray-400 uppercase tracking-wide">
            Matchup
          </Text>
          <Text variant="small">
            <span className="font-medium">
              {homeTeam?.TeamName ?? `#${request.HomeTeamID}`}
            </span>
            <span className="text-gray-400"> (H) vs. </span>
            <span className="font-medium">
              {awayTeam?.TeamName ?? `#${request.AwayTeamID}`}
            </span>
            <span className="text-gray-400"> (A)</span>
          </Text>
          {request.IsNeutralSite && (
            <Text variant="xs" classes="text-gray-400 truncate">
              @ {request.Arena || "Neutral Site"}
            </Text>
          )}
          {!request.IsNeutralSite && (
            <Text variant="xs" classes="text-gray-400 truncate">
              @{" "}
              {homeTeam?.Stadium ||
                homeTeam?.TeamName ||
                `#${request.HomeTeamID}`}
            </Text>
          )}
        </div>

        {/* Week + Tags */}
        <div className="flex flex-col gap-1 items-end shrink-0">
          <Text variant="xs" classes="text-gray-400 uppercase tracking-wide">
            Week
          </Text>
          <Text variant="small" classes="font-semibold">
            Week {request.Week}
          </Text>
          <div className="flex gap-1 flex-wrap justify-end">
            {request.IsSpringGame && <Tag variant="indigo">Spring</Tag>}
            {request.IsNeutralSite && <Tag variant="purple">Neutral</Tag>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRequestModal;
