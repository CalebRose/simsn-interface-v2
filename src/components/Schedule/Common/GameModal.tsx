import {
  FC,
  useMemo,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  League,
  SimCHL,
  SimPHL,
  SimCFB,
  SimNFL,
  PBP,
  BoxScore,
  SimNBA,
  SimCBB,
} from "../../../_constants/constants";
import { Modal } from "../../../_design/Modal";
import { Text } from "../../../_design/Typography";
import { Logo } from "../../../_design/Logo";
import FBAScheduleService from "../../../_services/scheduleService";
import {
  PlayerStats,
  PlayByPlay,
  FilteredStats,
  HockeyFilteredStats,
  BasketballFilteredStats,
  BasketballPlayerStats,
} from "./GameModalInterfaces";
import {
  CollegePlayerGameStats as CHLPlayerGameStats,
  GameResultsResponse,
} from "../../../models/hockeyModels";
import { GameResultsResponse as FootballGameResultsResponse } from "../../../models/footballModels";
import { darkenColor } from "../../../_utility/getDarkerColor";
import { ToggleSwitch } from "../../../_design/Inputs";
import { useResponsive } from "../../../_hooks/useMobile";
import { getTeamAbbrFromName } from "../../../_utility/getTeamAbbrFromName";
import {
  FBGameModalPassing,
  FBGameModalRushing,
  FBGameModalReceiving,
  FBGameModalDefensive,
  FBGameModalKicking,
  FBGameModalReturning,
  FBGameModalPBP,
  HKGameModalForwards,
  HKGameModalDefensemen,
  HKGameModalGoalies,
  HKGameModalPBP,
  FBGameModalStrategy,
  FBGameModalInfo,
  FBGameModalWeather,
} from "./GameModalComponents";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import { Button } from "../../../_design/Buttons";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import {
  CollegePlayerStats as CBBPlayerStats,
  MatchResultsPlayer,
  MatchResultsResponse,
  MatchResultsTeam,
} from "../../../models/basketballModels";
import { useSimBBAStore } from "../../../context/SimBBAContext";
import {
  getBasketballResultsColumns,
  GetBasketballResultsValues,
} from "./GameModalHelper";
import { Table, TableCell } from "../../../_design/Table";

export interface SchedulePageGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: League;
  playerMap?: any;
  game: any;
  title: string;
  teamMap?: any;
}

export const SchedulePageGameModal: FC<SchedulePageGameModalProps> = ({
  league,
  isOpen,
  onClose,
  playerMap,
  teamMap,
  game,
  title,
}) => {
  const isPro = useMemo(() => {
    return league === SimPHL || league === SimNFL || league === SimNBA;
  }, [league]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${title} Box Score`}
        classes={`h-[80vh] ${
          league === SimNFL || league === SimCFB
            ? "sm:min-w-[1650px]"
            : "sm:min-w-[1400px]"
        } overflow-auto`}
      >
        {league === SimCHL && (
          <HockeyGameModal
            game={game}
            league={league}
            isPro={isPro}
            playerMap={playerMap}
            teamMap={teamMap}
          />
        )}
        {league === SimPHL && (
          <HockeyGameModal
            game={game}
            league={league}
            isPro={isPro}
            playerMap={playerMap}
            teamMap={teamMap}
          />
        )}
        {league === SimCFB && (
          <FootballGameModal game={game} league={league} isPro={isPro} />
        )}
        {league === SimNFL && (
          <FootballGameModal game={game} league={league} isPro={isPro} />
        )}
        {league === SimCBB && (
          <BasketBallGameModal
            game={game}
            teamMap={teamMap}
            league={league}
            isPro={isPro}
          />
        )}
        {league === SimNBA && (
          <BasketBallGameModal
            game={game}
            teamMap={teamMap}
            league={league}
            isPro={isPro}
          />
        )}
      </Modal>
    </>
  );
};

export interface GameModalProps {
  league: League;
  playerMap?: any;
  game: any;
  isPro: boolean;
  teamMap?: any;
}

export const FootballGameModal = ({ league, game, isPro }: GameModalProps) => {
  const fbStore = useSimFBAStore();
  const { cfbTeamMap, proTeamMap } = fbStore;
  const scheduleService = new FBAScheduleService();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [homePlayers, setHomePlayers] = useState<PlayerStats[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<PlayerStats[]>([]);
  const [viewableHomePlayers, setViewableHomePlayers] = useState<FilteredStats>(
    {
      PassingStats: [],
      RushingStats: [],
      ReceivingStats: [],
      DefenseStats: [],
      SpecialTeamStats: [],
      OLineStats: [],
      ReturnStats: [],
    }
  );

  const homeTeam = useMemo(() => {
    if (isPro) {
      return proTeamMap![game.HomeTeamID];
    }
    return cfbTeamMap![game.HomeTeamID];
  }, [isPro, game, cfbTeamMap, proTeamMap]);

  const [viewableAwayPlayers, setViewableAwayPlayers] = useState<FilteredStats>(
    {
      PassingStats: [],
      RushingStats: [],
      ReceivingStats: [],
      DefenseStats: [],
      SpecialTeamStats: [],
      OLineStats: [],
      ReturnStats: [],
    }
  );
  const [playByPlays, setPlayByPlays] = useState<PlayByPlay[]>([]);
  const [view, setView] = useState<string>(BoxScore);
  const [header, setHeader] = useState<string>("Box Score");
  const [score, setScore] = useState<any | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const backgroundColor = "#1f2937";
  const borderColor = darkenColor(backgroundColor, -5);
  const homeScoreColor =
    game.HomeTeamScore > game.AwayTeamScore ? "#189E5B" : "#ef4444";
  const awayScoreColor =
    game.AwayTeamScore > game.HomeTeamScore ? "#189E5B" : "#ef4444";
  const { isDesktop, isMobile } = useResponsive();

  useEffect(() => {
    if (!game || game.ID <= 0) return;
    GetMatchResults();
  }, [game]);

  const GetMatchResults = async (): Promise<void> => {
    setIsLoading(true);

    let response: FootballGameResultsResponse;
    if (isPro) {
      response = await scheduleService.GetNFLGameResultData(game.ID);
    } else {
      response = await scheduleService.GetCFBGameResultData(game.ID);
    }
    const filteredHomePlayerList = FilterStatsData(response.HomePlayers);
    const filteredAwayPlayerList = FilterStatsData(response.AwayPlayers);

    setViewableHomePlayers(filteredHomePlayerList);
    setViewableAwayPlayers(filteredAwayPlayerList);
    setHomePlayers(response.HomePlayers);
    setAwayPlayers(response.AwayPlayers);

    const pbp: PlayByPlay[] = isPro
      ? response.PlayByPlays.map((play) => ({
          ...play,
          Possession: getTeamAbbrFromName(play.Possession),
          LineOfScrimmage: play.LineOfScrimmage
            ? play.LineOfScrimmage.replace(
                /(\d+)\s(.+)/,
                (_, yardLine, teamName) =>
                  `${yardLine} ${getTeamAbbrFromName(teamName)}`
              )
            : play.LineOfScrimmage,
        }))
      : [...response.PlayByPlays];

    setPlayByPlays(pbp);
    setScore(response.Score);
    setIsLoading(false);
  };
  const FilterStatsData = (dataSet: any[]): FilteredStats => {
    const obj: FilteredStats = {
      PassingStats: [],
      RushingStats: [],
      ReceivingStats: [],
      DefenseStats: [],
      SpecialTeamStats: [],
      OLineStats: [],
      ReturnStats: [],
    };

    if (dataSet.length > 0) {
      obj.PassingStats = dataSet
        .filter((x) => x.PassAttempts && x.PassAttempts > 0)
        .sort((a, b) => (b.PassAttempts ?? 0) - (a.PassAttempts ?? 0));

      obj.RushingStats = dataSet
        .filter((x) => x.RushAttempts && x.RushAttempts > 0)
        .sort((a, b) => b.RushingYards - a.RushingYards);

      obj.ReceivingStats = dataSet
        .filter((x) => x.Targets && x.Targets > 0)
        .sort((a, b) => b.ReceivingYards - a.ReceivingYards);

      obj.DefenseStats = dataSet
        .filter((x) =>
          ["ILB", "OLB", "DT", "DE", "CB", "FS", "SS", "ATH"].includes(
            x.Position
          )
        )
        .map((player) => ({
          ...player,
          TotalTackles:
            (player.SoloTackles ?? 0) + (player.AssistedTackles ?? 0),
        }))
        .sort((a, b) => b.TotalTackles - a.TotalTackles);

      obj.OLineStats = dataSet
        .filter((x) => x.Pancakes && x.Pancakes > 0)
        .sort((a, b) => b.Pancakes - a.Pancakes);

      obj.SpecialTeamStats = dataSet
        .filter((x) => ["P", "K"].includes(x.Position))
        .sort((a, b) => b.FGAttempts - a.FGAttempts);

      obj.ReturnStats = dataSet
        .filter((x) => x.KickReturnYards || x.PuntReturnYards > 0)
        .sort((a, b) => b.KickReturnYards - a.KickReturnYards);
    }

    return obj;
  };

  const { isOvertime, OvertimeHomeScore, OvertimeAwayScore } = useMemo(() => {
    if (!score) {
      return { isOvertime: false, OvertimeHomeScore: 0, OvertimeAwayScore: 0 };
    }

    const overtimeScores = [
      score.OT1Home,
      score.OT1Away,
      score.OT2Home,
      score.OT2Away,
      score.OT3Home,
      score.OT3Away,
      score.OT4Home,
      score.OT4Away,
    ];

    const isOvertime = overtimeScores.some((otScore) => otScore > 0);

    const OvertimeHomeScore = isOvertime
      ? (score.OT1Home ?? 0) +
        (score.OT2Home ?? 0) +
        (score.OT3Home ?? 0) +
        (score.OT4Home ?? 0)
      : 0;

    const OvertimeAwayScore = isOvertime
      ? (score.OT1Away ?? 0) +
        (score.OT2Away ?? 0) +
        (score.OT3Away ?? 0) +
        (score.OT4Away ?? 0)
      : 0;

    return { isOvertime, OvertimeHomeScore, OvertimeAwayScore };
  }, [score]);

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center">
          <Text variant="small">Loading...</Text>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex flex-col sm:gap-2">
            <div className="flex w-full justify-around px-2">
              <div className="flex flex-col items-center w-1/3">
                <div className="flex items-center h-full gap-1 sm:gap-4">
                  <Logo url={game.HomeTeamLogo} classes="w-full h-full" />
                  <div className="flex flex-col text-left sm:pr-8">
                    {league === SimCFB && (
                      <Text variant="small" classes="opacity-50">
                        {game.HomeTeamRank > 0 ? `#${game.HomeTeamRank}` : "NR"}
                      </Text>
                    )}
                    <Text variant="alternate">{game.HomeTeamName}</Text>
                    <Text variant="h3-alt" classes="font-semibold">
                      {game.HomeTeamMascot}
                    </Text>
                  </div>
                  <div className="flex flex-col pr-2 sm:pr-0">
                    <Text variant="h1-alt" style={{ color: homeScoreColor }}>
                      {game.HomeTeamScore}
                    </Text>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-center">
                  <Text variant="body" classes="font-semibold">
                    Final
                  </Text>
                </div>
                <div className="grid">
                  <div
                    className={`grid ${
                      isOvertime ? "grid-cols-8" : "grid-cols-7"
                    } gap-2 sm:gap-3 border-b`}
                  >
                    <div className="text-center col-span-2"></div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">1</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">2</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">3</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">4</Text>
                    </div>
                    {isOvertime && (
                      <div className="text-center col-span-1">
                        <Text variant="body-small">OT</Text>
                      </div>
                    )}
                    <div className="text-center col-span-1">
                      <Text variant="body-small">T</Text>
                    </div>
                  </div>
                  <div
                    className={`grid ${
                      isOvertime ? "grid-cols-8" : "grid-cols-7"
                    } gap-2 sm:gap-3`}
                  >
                    <div className="text-left col-span-2">
                      <Text variant="body-small">{game.HomeTeamAbbr}</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{score.Q1Home}</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{score.Q2Home}</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{score.Q3Home}</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{score.Q4Home}</Text>
                    </div>
                    {isOvertime && (
                      <div className="text-center col-span-1">
                        <Text variant="body-small">{OvertimeHomeScore}</Text>
                      </div>
                    )}
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{game.HomeTeamScore}</Text>
                    </div>
                  </div>
                  <div
                    className={`grid ${
                      isOvertime ? "grid-cols-8" : "grid-cols-7"
                    } gap-2 sm:gap-3`}
                  >
                    <div className="text-left col-span-2">
                      <Text variant="body-small">{game.AwayTeamAbbr}</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{score.Q1Away}</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{score.Q2Away}</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{score.Q3Away}</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{score.Q4Away}</Text>
                    </div>
                    {isOvertime && (
                      <div className="text-center col-span-1">
                        <Text variant="body-small">{OvertimeAwayScore}</Text>
                      </div>
                    )}
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{game.AwayTeamScore}</Text>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center items-center gap-2 py-2">
                  <ToggleSwitch
                    onChange={(checked) => {
                      setView(checked ? PBP : BoxScore);
                      setIsChecked(checked);
                    }}
                    checked={isChecked}
                  />
                  <Text variant="small">Play By Play</Text>
                </div>
              </div>
              <div className="flex flex-col items-center w-1/3">
                <div className="flex items-center h-full gap-1 sm:gap-4">
                  <div className="flex flex-col pl-2 sm:pl-0">
                    <Text variant="h1-alt" style={{ color: awayScoreColor }}>
                      {game.AwayTeamScore}
                    </Text>
                  </div>
                  <div className="flex flex-col text-right sm:pl-8">
                    {league === SimCFB && (
                      <Text variant="small" classes="opacity-50">
                        {game.AwayTeamRank > 0 ? `#${game.AwayTeamRank}` : "NR"}
                      </Text>
                    )}
                    <Text variant="alternate">{game.AwayTeamName}</Text>
                    <Text variant="h3-alt" classes="font-semibold">
                      {game.AwayTeamMascot}
                    </Text>
                  </div>
                  <Logo url={game.AwayTeamLogo} classes="w-full h-full" />
                </div>
              </div>
            </div>
            <div
              className="flex flex-col rounded-lg p-2 justify-start w-full"
              style={{ backgroundColor: borderColor }}
            >
              {view === BoxScore && (
                <div className="flex flex-col">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start">
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Text variant="body-small" classes="font-semibold">
                            Game Info
                          </Text>
                        </div>
                        <FBGameModalInfo
                          data={viewableHomePlayers}
                          league={league}
                          isPro={isPro}
                          backgroundColor={backgroundColor}
                          borderColor={borderColor}
                          game={game}
                          homeTeam={homeTeam}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Text variant="body-small" classes="font-semibold">
                            Weather
                          </Text>
                        </div>
                        <FBGameModalWeather
                          data={viewableHomePlayers}
                          league={league}
                          isPro={isPro}
                          backgroundColor={backgroundColor}
                          borderColor={borderColor}
                          game={game}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start">
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.HomeTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.HomeTeamName} Strategy
                          </Text>
                        </div>
                        <FBGameModalStrategy
                          data={viewableHomePlayers}
                          league={league}
                          isPro={isPro}
                          backgroundColor={backgroundColor}
                          borderColor={borderColor}
                          score={score}
                          isHome
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.AwayTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.AwayTeamName} Strategy
                          </Text>
                        </div>
                        <FBGameModalStrategy
                          data={viewableHomePlayers}
                          league={league}
                          isPro={isPro}
                          backgroundColor={backgroundColor}
                          borderColor={borderColor}
                          score={score}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start">
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.HomeTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.HomeTeamName} Passing
                          </Text>
                        </div>
                        <FBGameModalPassing
                          data={viewableHomePlayers}
                          league={league}
                          isPro={isPro}
                          backgroundColor={backgroundColor}
                          borderColor={borderColor}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.AwayTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.AwayTeamName} Passing
                          </Text>
                        </div>
                        <FBGameModalPassing
                          data={viewableAwayPlayers}
                          league={league}
                          isPro={isPro}
                          backgroundColor={backgroundColor}
                          borderColor={borderColor}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start">
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.HomeTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.HomeTeamName} Rushing
                          </Text>
                        </div>
                        <FBGameModalRushing
                          data={viewableHomePlayers}
                          league={league}
                          isPro={isPro}
                          backgroundColor={backgroundColor}
                          borderColor={borderColor}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.AwayTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.AwayTeamName} Rushing
                          </Text>
                        </div>
                        <FBGameModalRushing
                          data={viewableAwayPlayers}
                          league={league}
                          isPro={isPro}
                          backgroundColor={backgroundColor}
                          borderColor={borderColor}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start">
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.HomeTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.HomeTeamName} Receiving
                          </Text>
                        </div>
                        <FBGameModalReceiving
                          data={viewableHomePlayers}
                          league={league}
                          isPro={isPro}
                          backgroundColor={backgroundColor}
                          borderColor={borderColor}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.AwayTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.AwayTeamName} Receiving
                          </Text>
                        </div>
                        <FBGameModalReceiving
                          data={viewableAwayPlayers}
                          league={league}
                          isPro={isPro}
                          backgroundColor={backgroundColor}
                          borderColor={borderColor}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start">
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.HomeTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.HomeTeamName} Defensive
                          </Text>
                        </div>
                        <FBGameModalDefensive
                          data={viewableHomePlayers}
                          league={league}
                          isPro={isPro}
                          backgroundColor={backgroundColor}
                          borderColor={borderColor}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.AwayTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.AwayTeamName} Defensive
                          </Text>
                        </div>
                        <FBGameModalDefensive
                          data={viewableAwayPlayers}
                          league={league}
                          isPro={isPro}
                          backgroundColor={backgroundColor}
                          borderColor={borderColor}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start">
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.HomeTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.HomeTeamName} Kicking and Punting
                          </Text>
                        </div>
                        <FBGameModalKicking
                          data={viewableHomePlayers}
                          league={league}
                          isPro={isPro}
                          backgroundColor={backgroundColor}
                          borderColor={borderColor}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.AwayTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.AwayTeamName} Kicking and Punting
                          </Text>
                        </div>
                        <FBGameModalKicking
                          data={viewableAwayPlayers}
                          league={league}
                          isPro={isPro}
                          backgroundColor={backgroundColor}
                          borderColor={borderColor}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start">
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.HomeTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.HomeTeamName} Returning
                          </Text>
                        </div>
                        <FBGameModalReturning
                          data={viewableHomePlayers}
                          league={league}
                          isPro={isPro}
                          backgroundColor={backgroundColor}
                          borderColor={borderColor}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.AwayTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.AwayTeamName} Returning
                          </Text>
                        </div>
                        <FBGameModalReturning
                          data={viewableAwayPlayers}
                          league={league}
                          isPro={isPro}
                          backgroundColor={backgroundColor}
                          borderColor={borderColor}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {view === PBP && (
                <FBGameModalPBP
                  data={playByPlays}
                  league={league}
                  isPro={isPro}
                  backgroundColor={backgroundColor}
                  borderColor={borderColor}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const HockeyGameModal = ({
  league,
  game,
  isPro,
  playerMap,
  teamMap,
}: GameModalProps) => {
  const scheduleService = new FBAScheduleService();
  const { ExportPlayByPlay } = useSimHCKStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [homePlayers, setHomePlayers] = useState<CHLPlayerGameStats[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<CHLPlayerGameStats[]>([]);
  const homeTeam = teamMap[game.HomeTeamID];
  const [viewableHomePlayers, setViewableHomePlayers] =
    useState<HockeyFilteredStats | null>(null);
  const [viewableAwayPlayers, setViewableAwayPlayers] =
    useState<HockeyFilteredStats | null>(null);
  const [playByPlays, setPlayByPlays] = useState<PlayByPlay[]>([]);
  const [view, setView] = useState<string>(BoxScore);
  const [header, setHeader] = useState<string>("Box Score");
  const [score, setScore] = useState<any | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const backgroundColor = "#1f2937";
  const borderColor = darkenColor(backgroundColor, -5);
  const homeScoreColor =
    game.HomeTeamScore > game.AwayTeamScore ||
    game.HomeTeamShootoutScore > game.AwayTeamShootoutScore
      ? "#189E5B"
      : "#ef4444";
  const awayScoreColor =
    game.AwayTeamScore > game.HomeTeamScore ||
    game.AwayTeamShootoutScore > game.HomeTeamShootoutScore
      ? "#189E5B"
      : "#ef4444";
  const shootoutScore = game.HomeTeamShootoutScore + game.AwayTeamShootoutScore;
  let isShootout = shootoutScore > 0 ? true : false;
  const city = game.City.length === 0 ? homeTeam.City : game.City;
  const state = game.State.length === 0 ? homeTeam.State : game.State;
  const country = game.Country.length === 0 ? homeTeam.Country : game.Country;
  const capacity = homeTeam ? homeTeam.ArenaCapacity : 0;
  let gameType = "";
  if (game.IsNeutralSite) {
    gameType += "Neutral Site ";
  }
  if (game.IsConference) {
    gameType += "Conference ";
  }
  if (game.IsPreseason) {
    gameType += "Preseason ";
  }
  if (game.IsPlayoff) {
    gameType += "Playoff ";
  }

  useEffect(() => {
    if (!game || game.ID <= 0) return;
    GetMatchResults();
  }, [game]);

  const GetMatchResults = async (): Promise<void> => {
    setIsLoading(true);

    let response: GameResultsResponse;
    if (isPro) {
      response = await scheduleService.GetPHLGameResultData(game.ID);
    } else {
      response = await scheduleService.GetCHLGameResultData(game.ID);
    }

    const filteredHomePlayerList = isPro
      ? FilterStatsData(response.PHLHomeStats)
      : FilterStatsData(response.CHLHomeStats);

    const filteredAwayPlayerList = isPro
      ? FilterStatsData(response.PHLAwayStats)
      : FilterStatsData(response.CHLAwayStats);

    setViewableHomePlayers(filteredHomePlayerList);
    setViewableAwayPlayers(filteredAwayPlayerList);

    if (isPro) {
      setHomePlayers(response.PHLHomeStats);
      setAwayPlayers(response.PHLAwayStats);
    } else {
      setHomePlayers(response.CHLHomeStats);
      setAwayPlayers(response.CHLAwayStats);
    }

    const pbp: PlayByPlay[] = isPro
      ? [...response.PHLPlayByPlays]
      : [...response.CHLPlayByPlays];

    setPlayByPlays(pbp);
    setScore(response.Score);
    setIsLoading(false);
  };

  const FilterStatsData = (dataSet: any[]): HockeyFilteredStats => {
    const obj: HockeyFilteredStats = {
      ForwardsStats: [],
      DefensemenStats: [],
      GoalieStats: [],
    };

    if (dataSet.length > 0) {
      obj.ForwardsStats = dataSet
        .filter((x) => x.TimeOnIce && x.TimeOnIce > 0)
        .filter((x) => {
          const playerDetails = playerMap[x.TeamID]?.[x.PlayerID];
          return (
            playerDetails?.Position === "F" || playerDetails?.Position === "C"
          );
        })
        .map((player) => {
          const playerDetails = playerMap[player.TeamID]?.[player.PlayerID];
          return {
            ...player,
            FirstName: playerDetails?.FirstName ?? "Unknown",
            LastName: playerDetails?.LastName ?? "Unknown",
            Position: playerDetails?.Position ?? "Unknown",
            Team: playerDetails?.Team ?? "Unknown",
          };
        })
        .sort((a, b) => b.TimeOnIce - a.TimeOnIce);

      obj.DefensemenStats = dataSet
        .filter((x) => x.TimeOnIce && x.TimeOnIce > 0)
        .filter((x) => {
          const playerDetails = playerMap[x.TeamID]?.[x.PlayerID];
          return playerDetails?.Position === "D";
        })
        .map((player) => {
          const playerDetails = playerMap[player.TeamID]?.[player.PlayerID];
          return {
            ...player,
            FirstName: playerDetails?.FirstName ?? "Unknown",
            LastName: playerDetails?.LastName ?? "Unknown",
            Position: playerDetails?.Position ?? "Unknown",
            Team: playerDetails?.Team ?? "Unknown",
          };
        })
        .sort((a, b) => b.TimeOnIce - a.TimeOnIce);

      obj.GoalieStats = dataSet
        .filter((x) => x.TimeOnIce && x.TimeOnIce > 0)
        .filter((x) => {
          const playerDetails = playerMap[x.TeamID]?.[x.PlayerID];
          return playerDetails?.Position === "G";
        })
        .map((player) => {
          const playerDetails = playerMap[player.TeamID]?.[player.PlayerID];
          return {
            ...player,
            FirstName: playerDetails?.FirstName ?? "Unknown",
            LastName: playerDetails?.LastName ?? "Unknown",
            Position: playerDetails?.Position ?? "Unknown",
            Team: playerDetails?.Team ?? "Unknown",
          };
        })
        .sort((a, b) => b.TimeOnIce - a.TimeOnIce);
    }

    return obj;
  };

  const threeStars = useMemo(() => {
    const list: any[] = [];
    const starIDs = [game.StarOne, game.StarTwo, game.StarThree];

    const findPlayerStats = (playerID: number) => {
      let player = playerMap![game.HomeTeamID][playerID];
      if (!player) {
        player = playerMap![game.AwayTeamID][playerID];
      }
      if (!player) {
        return null;
      }
      const isHome = player.TeamID === game.HomeTeamID;
      const viewable = isHome ? viewableHomePlayers : viewableAwayPlayers;
      if (!viewable) return null;

      let statsList;
      if (player.Position === "F" || player.Position === "C") {
        statsList = viewable.ForwardsStats;
      } else if (player.Position === "D") {
        statsList = viewable.DefensemenStats;
      } else if (player.Position === "G") {
        statsList = viewable.GoalieStats;
      } else {
        return null;
      }
      return statsList.find((x) => x.PlayerID === playerID) || null;
    };

    for (const starID of starIDs) {
      if (starID > 0) {
        const stat = findPlayerStats(starID);
        if (stat) {
          list.push(stat);
        }
      }
    }

    return list;
  }, [game, playerMap, viewableHomePlayers, viewableAwayPlayers]);

  const exportPlayByPlayResults = useCallback(async () => {
    if (league === SimCHL || league === SimPHL) {
      const dto = {
        League: league,
        GameID: game.ID,
      };
      await ExportPlayByPlay(dto);
    }
  }, []);
  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center">
          <Text variant="small">Loading...</Text>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex flex-col sm:gap-2">
            <div className="flex w-full justify-around px-2">
              <div className="flex flex-col items-center w-1/3">
                <div className="flex items-center h-full gap-1 sm:gap-4">
                  <Logo url={game.HomeTeamLogo} classes="w-full h-full" />
                  <div className="flex flex-col text-left sm:pr-8">
                    <Text variant="small" classes="opacity-50">
                      {game.HomeTeamRank > 0 ? `#${game.HomeTeamRank}` : "NR"}
                    </Text>
                    <Text variant="alternate">{game.HomeTeamName}</Text>
                    <Text variant="h3-alt" classes="font-semibold">
                      {game.HomeTeamMascot}
                    </Text>
                  </div>
                  <div className="flex flex-col pr-2 sm:pr-0">
                    {isShootout && (
                      <Text
                        variant="xs"
                        style={{ color: homeScoreColor }}
                      >{`(${game.HomeTeamShootoutScore})`}</Text>
                    )}
                    <Text variant="h1-alt" style={{ color: homeScoreColor }}>
                      {game.HomeTeamScore}
                    </Text>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-center">
                  <Text variant="body" classes="font-semibold">
                    Final
                  </Text>
                </div>
                <div className="grid">
                  <div
                    className={`grid ${
                      score.HomeShootoutScore > 0 ||
                      score.AwayShootoutScore > 0 ||
                      score.OTHome > 0 ||
                      score.OTAway > 0
                        ? "grid-cols-7"
                        : "grid-cols-6"
                    } gap-4 border-b`}
                  >
                    <div className="text-center col-span-2"></div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">1</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">2</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">3</Text>
                    </div>
                    {score.OTHome > 0 || score.OTAway > 0 ? (
                      <div className="text-center col-span-1">
                        <Text variant="body-small">OT</Text>
                      </div>
                    ) : score.HomeShootoutScore > 0 ||
                      score.AwayShootoutScore > 0 ? (
                      <div className="text-center col-span-1">
                        <Text variant="body-small">SO</Text>
                      </div>
                    ) : null}
                    <div className="text-center col-span-1">
                      <Text variant="body-small">T</Text>
                    </div>
                  </div>
                  <div
                    className={`grid ${
                      score.OTHome > 0 ||
                      score.OTAway > 0 ||
                      score.HomeShootoutScore > 0 ||
                      score.AwayShootoutScore > 0
                        ? "grid-cols-7"
                        : "grid-cols-6"
                    } gap-3`}
                  >
                    <div className="text-left col-span-2">
                      <Text variant="body-small">{game.HomeTeamAbbr}</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{score.P1Home}</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{score.P2Home}</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{score.P3Home}</Text>
                    </div>
                    {score.OTHome > 0 || score.OTAway > 0 ? (
                      <div className="text-center col-span-1">
                        <Text variant="body-small">{score.OTHome}</Text>
                      </div>
                    ) : score.HomeShootoutScore > 0 ||
                      score.AwayShootoutScore > 0 ? (
                      <div className="text-center col-span-1">
                        <Text variant="body-small">
                          {score.HomeShootoutScore}
                        </Text>
                      </div>
                    ) : null}
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{game.HomeTeamScore}</Text>
                    </div>
                  </div>

                  <div
                    className={`grid ${
                      score.OTHome > 0 ||
                      score.OTAway > 0 ||
                      score.HomeShootoutScore > 0 ||
                      score.AwayShootoutScore > 0
                        ? "grid-cols-7"
                        : "grid-cols-6"
                    } gap-3`}
                  >
                    <div className="text-left col-span-2">
                      <Text variant="body-small">{game.AwayTeamAbbr}</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{score.P1Away}</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{score.P2Away}</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{score.P3Away}</Text>
                    </div>
                    {score.OTHome > 0 || score.OTAway > 0 ? (
                      <div className="text-center col-span-1">
                        <Text variant="body-small">{score.OTAway}</Text>
                      </div>
                    ) : score.HomeShootoutScore > 0 ||
                      score.AwayShootoutScore > 0 ? (
                      <div className="text-center col-span-1">
                        <Text variant="body-small">
                          {score.AwayShootoutScore}
                        </Text>
                      </div>
                    ) : null}
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{game.AwayTeamScore}</Text>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center items-center gap-2 py-2">
                  <div className="flex gap-x-2">
                    <ToggleSwitch
                      onChange={(checked) => {
                        setView(checked ? PBP : BoxScore);
                        setIsChecked(checked);
                      }}
                      checked={isChecked}
                    />
                    <Text variant="small">Play By Play</Text>
                  </div>
                  <div>
                    <Button size="xs" onClick={exportPlayByPlayResults}>
                      Export
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center w-1/3">
                <div className="flex items-center h-full gap-1 sm:gap-4">
                  <div className="flex flex-col pl-2 sm:pl-0">
                    {isShootout && (
                      <Text
                        variant="xs"
                        style={{ color: awayScoreColor }}
                      >{`(${game.AwayTeamShootoutScore})`}</Text>
                    )}
                    <Text variant="h1-alt" style={{ color: awayScoreColor }}>
                      {game.AwayTeamScore}
                    </Text>
                  </div>
                  <div className="flex flex-col text-right sm:pl-8">
                    <Text variant="small" classes="opacity-50">
                      {game.AwayTeamRank > 0 ? `#${game.AwayTeamRank}` : "NR"}
                    </Text>
                    <Text variant="alternate">{game.AwayTeamName}</Text>
                    <Text variant="h3-alt" classes="font-semibold">
                      {game.AwayTeamMascot}
                    </Text>
                  </div>
                  <Logo url={game.AwayTeamLogo} classes="w-full h-full" />
                </div>
              </div>
            </div>
            <div
              className="flex flex-col rounded-lg p-2 justify-start w-full"
              style={{ backgroundColor: borderColor }}
            >
              {view === BoxScore && (
                <div className="flex flex-col">
                  <div className="flex flex-col sm:flex-row items-start gap-1 sm:gap-4">
                    <div className="flex flex-row items-center justify-start w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 w-full pb-2">
                          <Text variant="body-small" classes="font-semibold">
                            Game Info
                          </Text>
                        </div>
                        <div
                          className="grid rounded-lg border-t px-1"
                          style={{ backgroundColor }}
                        >
                          <div className="grid grid-cols-12 gap-2 font-semibold py-1 border-b">
                            <Text variant="xs" classes="col-span-3 text-left">
                              Arena
                            </Text>
                            <Text variant="xs" classes="col-span-2">
                              Attendance
                            </Text>
                            <Text variant="xs">Capacity</Text>
                            <Text variant="xs" classes="col-span-2">
                              City
                            </Text>
                            <Text variant="xs">State</Text>
                            <Text variant="xs">Country</Text>
                            <Text variant="xs" classes="col-span-2 text-left">
                              Game Type
                            </Text>
                          </div>
                          <div
                            className="grid grid-cols-12 gap-2 text-sm border-b py-1"
                            style={{
                              backgroundColor: borderColor,
                            }}
                          >
                            <Text variant="xs" classes="col-span-3 text-left">
                              {game.Arena}
                            </Text>
                            <Text variant="xs" classes="col-span-2">
                              {game.AttendanceCount}
                            </Text>
                            <Text variant="xs">{capacity}</Text>
                            <Text variant="xs" classes="col-span-2">
                              {city}
                            </Text>
                            <Text variant="xs">{state}</Text>
                            <Text variant="xs">{country}</Text>
                            <Text variant="xs" classes="col-span-2 text-left">
                              {gameType}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-start w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 w-full pb-2">
                          <Text variant="body-small" classes="font-semibold">
                            Three Stars
                          </Text>
                        </div>
                        <div
                          className="grid rounded-lg border-t px-1"
                          style={{ backgroundColor }}
                        >
                          <div className="grid grid-cols-12 gap-2 font-semibold py-1 border-b">
                            <Text variant="xs">Rank</Text>
                            <Text variant="xs">Team</Text>
                            <Text variant="xs" classes="col-span-2 text-left">
                              Player
                            </Text>
                            <Text variant="xs">G</Text>
                            <Text variant="xs">A</Text>
                            <Text variant="xs">P</Text>
                            <Text variant="xs">TOI</Text>
                            <Text variant="xs">BLK</Text>
                            <Text variant="xs">HITS</Text>
                            <Text variant="xs">GS</Text>
                            <Text variant="xs">GA</Text>
                          </div>
                          {threeStars.map((player, index) => {
                            const goals = player.Goals ?? 0;
                            const assists = player.Assists ?? 0;
                            const points = player.Points ?? 0;
                            const goalieSaves = player.Saves ?? 0;
                            const goalsAgainst = player.GoalsAgainst ?? 0;
                            const toiSeconds = player.TimeOnIce ?? 0;
                            const blocks = player.ShotsBlocked ?? 0;
                            const hits =
                              (player.BodyChecks ?? 0) +
                              (player.StickChecks ?? 0);
                            const faceoff =
                              player.FaceOffWinPercentage.toFixed(1);
                            const minutes = Math.floor(toiSeconds / 60);
                            const seconds = toiSeconds % 60;
                            const toi = `${minutes}:${seconds
                              .toString()
                              .padStart(2, "0")}`;

                            return (
                              <div
                                key={index}
                                className="grid grid-cols-12 gap-2 text-sm border-b py-1"
                                style={{
                                  backgroundColor:
                                    index % 2 === 0
                                      ? borderColor
                                      : "transparent",
                                }}
                              >
                                <Text variant="xs">{index + 1}</Text>
                                <Text variant="xs">{player.Team ?? "N/A"}</Text>
                                <Text
                                  variant="xs"
                                  classes="col-span-2 text-left"
                                >
                                  {player.Position ?? "N/A"}{" "}
                                  {player.FirstName ?? ""}{" "}
                                  {player.LastName ?? ""}
                                </Text>
                                <Text variant="xs">{goals}</Text>
                                <Text variant="xs">{assists}</Text>
                                <Text variant="xs">{points}</Text>
                                <Text variant="xs">{toi}</Text>
                                <Text variant="xs">{blocks}</Text>
                                <Text variant="xs">{hits}</Text>
                                <Text variant="xs">{goalieSaves}</Text>
                                <Text variant="xs">{goalsAgainst}</Text>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start gap-1 sm:gap-4">
                    <div className="flex flex-col items-center justify-start w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.HomeTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.HomeTeamName} Forwards
                          </Text>
                        </div>
                        <div
                          className="grid rounded-lg border-t px-1"
                          style={{ backgroundColor }}
                        >
                          <div className="grid grid-cols-12 gap-2 font-semibold py-1 border-b">
                            <Text variant="xs" classes="col-span-2 text-left">
                              Player
                            </Text>
                            <Text variant="xs">S</Text>
                            <Text variant="xs">G</Text>
                            <Text variant="xs">A</Text>
                            <Text variant="xs">P</Text>
                            <Text variant="xs">+/-</Text>
                            <Text variant="xs">TOI</Text>
                            <Text variant="xs">PPG</Text>
                            <Text variant="xs">BLK</Text>
                            <Text variant="xs">HITS</Text>
                            <Text variant="xs">FO%</Text>
                          </div>
                          {viewableHomePlayers?.ForwardsStats.map(
                            (player, index) => {
                              const goals = player.Goals ?? 0;
                              const assists = player.Assists ?? 0;
                              const points = player.Points ?? 0;
                              const plusminus = player.PlusMinus ?? 0;
                              const penaltysecs = player.PenaltyMinutes ?? 0;
                              const toiSeconds = player.TimeOnIce ?? 0;
                              const ppg = player.PowerPlayGoals ?? 0;
                              const shots = player.Shots ?? 0;
                              const blocks = player.ShotsBlocked ?? 0;
                              const hits =
                                (player.BodyChecks ?? 0) +
                                (player.StickChecks ?? 0);
                              const faceoff =
                                player.FaceOffWinPercentage.toFixed(1);
                              const minutes = Math.floor(toiSeconds / 60);
                              const seconds = toiSeconds % 60;
                              const toi = `${minutes}:${seconds
                                .toString()
                                .padStart(2, "0")}`;

                              return (
                                <div
                                  key={index}
                                  className="grid grid-cols-12 gap-2 text-sm border-b py-1"
                                  style={{
                                    backgroundColor:
                                      index % 2 === 0
                                        ? borderColor
                                        : "transparent",
                                  }}
                                >
                                  <Text
                                    variant="xs"
                                    classes="col-span-2 text-left"
                                  >
                                    {player.Position ?? "N/A"}{" "}
                                    {player.FirstName ?? ""}{" "}
                                    {player.LastName ?? ""}
                                  </Text>
                                  <Text variant="xs">{shots}</Text>
                                  <Text variant="xs">{goals}</Text>
                                  <Text variant="xs">{assists}</Text>
                                  <Text variant="xs">{points}</Text>
                                  <Text variant="xs">{plusminus}</Text>
                                  <Text variant="xs">{toi}</Text>
                                  <Text variant="xs">{ppg}</Text>
                                  <Text variant="xs">{blocks}</Text>
                                  <Text variant="xs">{hits}</Text>
                                  <Text variant="xs">{faceoff}</Text>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.AwayTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.AwayTeamName} Fowards
                          </Text>
                        </div>
                        <div
                          className="grid rounded-lg border-t px-1"
                          style={{ backgroundColor }}
                        >
                          <div className="grid grid-cols-12 gap-2 font-semibold py-1 border-b">
                            <Text variant="xs" classes="col-span-2 text-left">
                              Player
                            </Text>
                            <Text variant="xs">S</Text>
                            <Text variant="xs">G</Text>
                            <Text variant="xs">A</Text>
                            <Text variant="xs">P</Text>
                            <Text variant="xs">+/-</Text>
                            <Text variant="xs">TOI</Text>
                            <Text variant="xs">PPG</Text>
                            <Text variant="xs">BLK</Text>
                            <Text variant="xs">HITS</Text>
                            <Text variant="xs">FO%</Text>
                          </div>
                          {viewableAwayPlayers?.ForwardsStats.map(
                            (player, index) => {
                              const goals = player.Goals ?? 0;
                              const assists = player.Assists ?? 0;
                              const points = player.Points ?? 0;
                              const plusminus = player.PlusMinus ?? 0;
                              const penaltymins = player.PenaltyMinutes ?? 0;
                              const toiSeconds = player.TimeOnIce ?? 0;
                              const ppg = player.PowerPlayGoals ?? 0;
                              const shots = player.Shots ?? 0;
                              const blocks = player.ShotsBlocked ?? 0;
                              const hits =
                                (player.BodyChecks ?? 0) +
                                (player.StickChecks ?? 0);
                              const faceoff =
                                player.FaceOffWinPercentage.toFixed(1);
                              const minutes = Math.floor(toiSeconds / 60);
                              const seconds = toiSeconds % 60;
                              const toi = `${minutes}:${seconds
                                .toString()
                                .padStart(2, "0")}`;

                              return (
                                <div
                                  key={index}
                                  className="grid grid-cols-12 gap-2 text-sm border-b py-1"
                                  style={{
                                    backgroundColor:
                                      index % 2 === 0
                                        ? borderColor
                                        : "transparent",
                                  }}
                                >
                                  <Text
                                    variant="xs"
                                    classes="col-span-2 text-left"
                                  >
                                    {player.Position ?? "N/A"}{" "}
                                    {player.FirstName ?? ""}{" "}
                                    {player.LastName ?? ""}
                                  </Text>
                                  <Text variant="xs">{shots}</Text>
                                  <Text variant="xs">{goals}</Text>
                                  <Text variant="xs">{assists}</Text>
                                  <Text variant="xs">{points}</Text>
                                  <Text variant="xs">{plusminus}</Text>
                                  <Text variant="xs">{toi}</Text>
                                  <Text variant="xs">{ppg}</Text>
                                  <Text variant="xs">{blocks}</Text>
                                  <Text variant="xs">{hits}</Text>
                                  <Text variant="xs">{faceoff}</Text>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start">
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.HomeTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.HomeTeamName} Defensemen
                          </Text>
                        </div>
                        <div
                          className="grid rounded-lg border-t px-1"
                          style={{ backgroundColor }}
                        >
                          <div className="grid grid-cols-12 gap-2 font-semibold py-1 border-b">
                            <Text variant="xs" classes="col-span-2 text-left">
                              Player
                            </Text>
                            <Text variant="xs">S</Text>
                            <Text variant="xs">G</Text>
                            <Text variant="xs">A</Text>
                            <Text variant="xs">P</Text>
                            <Text variant="xs">+/-</Text>
                            <Text variant="xs">TOI</Text>
                            <Text variant="xs">PPG</Text>
                            <Text variant="xs">BLK</Text>
                            <Text variant="xs">HITS</Text>
                            <Text variant="xs">FO%</Text>
                          </div>
                          {viewableHomePlayers?.DefensemenStats.map(
                            (player, index) => {
                              const goals = player.Goals ?? 0;
                              const assists = player.Assists ?? 0;
                              const points = player.Points ?? 0;
                              const plusminus = player.PlusMinus ?? 0;
                              const penaltysecs = player.PenaltyMinutes ?? 0;
                              const toiSeconds = player.TimeOnIce ?? 0;
                              const ppg = player.PowerPlayGoals ?? 0;
                              const shots = player.Shots ?? 0;
                              const blocks = player.ShotsBlocked ?? 0;
                              const hits =
                                (player.BodyChecks ?? 0) +
                                (player.StickChecks ?? 0);
                              const faceoff =
                                player.FaceOffWinPercentage.toFixed(1);
                              const minutes = Math.floor(toiSeconds / 60);
                              const seconds = toiSeconds % 60;
                              const toi = `${minutes}:${seconds
                                .toString()
                                .padStart(2, "0")}`;

                              return (
                                <div
                                  key={index}
                                  className="grid grid-cols-12 gap-2 text-sm border-b py-1"
                                  style={{
                                    backgroundColor:
                                      index % 2 === 0
                                        ? borderColor
                                        : "transparent",
                                  }}
                                >
                                  <Text
                                    variant="xs"
                                    classes="col-span-2 text-left w-full"
                                  >
                                    {player.Position ?? "N/A"}{" "}
                                    {player.FirstName ?? ""}{" "}
                                    {player.LastName ?? ""}
                                  </Text>
                                  <Text variant="xs">{shots}</Text>
                                  <Text variant="xs">{goals}</Text>
                                  <Text variant="xs">{assists}</Text>
                                  <Text variant="xs">{points}</Text>
                                  <Text variant="xs">{plusminus}</Text>
                                  <Text variant="xs">{toi}</Text>
                                  <Text variant="xs">{ppg}</Text>
                                  <Text variant="xs">{blocks}</Text>
                                  <Text variant="xs">{hits}</Text>
                                  <Text variant="xs">{faceoff}</Text>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.AwayTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.AwayTeamName} Defensemen
                          </Text>
                        </div>
                        <div
                          className="grid rounded-lg border-t px-1"
                          style={{ backgroundColor }}
                        >
                          <div className="grid grid-cols-12 gap-2 font-semibold py-1 border-b">
                            <Text variant="xs" classes="col-span-2 text-left">
                              Player
                            </Text>
                            <Text variant="xs">S</Text>
                            <Text variant="xs">G</Text>
                            <Text variant="xs">A</Text>
                            <Text variant="xs">P</Text>
                            <Text variant="xs">+/-</Text>
                            <Text variant="xs">TOI</Text>
                            <Text variant="xs">PPG</Text>
                            <Text variant="xs">BLK</Text>
                            <Text variant="xs">HITS</Text>
                            <Text variant="xs">FO%</Text>
                          </div>
                          {viewableAwayPlayers?.DefensemenStats.map(
                            (player, index) => {
                              const goals = player.Goals ?? 0;
                              const assists = player.Assists ?? 0;
                              const points = player.Points ?? 0;
                              const plusminus = player.PlusMinus ?? 0;
                              const penaltysecs = player.PenaltyMinutes ?? 0;
                              const toiSeconds = player.TimeOnIce ?? 0;
                              const ppg = player.PowerPlayGoals ?? 0;
                              const shots = player.Shots ?? 0;
                              const blocks = player.ShotsBlocked ?? 0;
                              const hits =
                                (player.BodyChecks ?? 0) +
                                (player.StickChecks ?? 0);
                              const faceoff =
                                player.FaceOffWinPercentage.toFixed(1);
                              const minutes = Math.floor(toiSeconds / 60);
                              const seconds = toiSeconds % 60;
                              const toi = `${minutes}:${seconds
                                .toString()
                                .padStart(2, "0")}`;

                              return (
                                <div
                                  key={index}
                                  className="grid grid-cols-12 gap-2 text-sm border-b py-1"
                                  style={{
                                    backgroundColor:
                                      index % 2 === 0
                                        ? borderColor
                                        : "transparent",
                                  }}
                                >
                                  <Text
                                    variant="xs"
                                    classes="col-span-2 text-left w-full"
                                  >
                                    {player.Position ?? "N/A"}{" "}
                                    {player.FirstName ?? ""}{" "}
                                    {player.LastName ?? ""}
                                  </Text>
                                  <Text variant="xs">{shots}</Text>
                                  <Text variant="xs">{goals}</Text>
                                  <Text variant="xs">{assists}</Text>
                                  <Text variant="xs">{points}</Text>
                                  <Text variant="xs">{plusminus}</Text>
                                  <Text variant="xs">{toi}</Text>
                                  <Text variant="xs">{ppg}</Text>
                                  <Text variant="xs">{blocks}</Text>
                                  <Text variant="xs">{hits}</Text>
                                  <Text variant="xs">{faceoff}</Text>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start">
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.HomeTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.HomeTeamName} Goalies
                          </Text>
                        </div>
                        <div
                          className="grid rounded-lg border-t px-1"
                          style={{ backgroundColor }}
                        >
                          <div className="grid grid-cols-10 gap-2 font-semibold py-1 border-b">
                            <Text variant="xs" classes="col-span-3 text-left">
                              Player
                            </Text>
                            <Text variant="xs">SA</Text>
                            <Text variant="xs">GA</Text>
                            <Text variant="xs">SV</Text>
                            <Text variant="xs">SV%</Text>
                            <Text variant="xs">+/-</Text>
                            <Text variant="xs">TOI</Text>
                          </div>
                          {viewableHomePlayers?.GoalieStats.map(
                            (player, index) => {
                              const shotsagainst = player.ShotsAgainst ?? 0;
                              const goalsagainst = player.GoalsAgainst ?? 0;
                              const saves = player.Saves ?? 0;
                              const savepercentage =
                                player.SavePercentage.toFixed(3) ?? 0;
                              const plusminus = player.PlusMinus ?? 0;
                              const toiSeconds = player.TimeOnIce ?? 0;
                              const minutes = Math.floor(toiSeconds / 60);
                              const seconds = toiSeconds % 60;
                              const toi = `${minutes}:${seconds
                                .toString()
                                .padStart(2, "0")}`;

                              return (
                                <div
                                  key={index}
                                  className="grid grid-cols-10 gap-2 text-sm border-b py-1"
                                  style={{
                                    backgroundColor:
                                      index % 2 === 0
                                        ? borderColor
                                        : "transparent",
                                  }}
                                >
                                  <Text
                                    variant="xs"
                                    classes="col-span-3 text-left w-full"
                                  >
                                    {player.Position ?? "N/A"}{" "}
                                    {player.FirstName ?? ""}{" "}
                                    {player.LastName ?? ""}
                                  </Text>
                                  <Text variant="xs">{shotsagainst}</Text>
                                  <Text variant="xs">{goalsagainst}</Text>
                                  <Text variant="xs">{saves}</Text>
                                  <Text variant="xs">{savepercentage}</Text>
                                  <Text variant="xs">{plusminus}</Text>
                                  <Text variant="xs">{toi}</Text>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.AwayTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.AwayTeamName} Goalies
                          </Text>
                        </div>
                        <div
                          className="grid rounded-lg border-t px-1"
                          style={{ backgroundColor }}
                        >
                          <div className="grid grid-cols-10 gap-2 font-semibold py-1 border-b">
                            <Text variant="xs" classes="col-span-3 text-left">
                              Player
                            </Text>
                            <Text variant="xs">SA</Text>
                            <Text variant="xs">GA</Text>
                            <Text variant="xs">SV</Text>
                            <Text variant="xs">SV%</Text>
                            <Text variant="xs">+/-</Text>
                            <Text variant="xs">TOI</Text>
                          </div>
                          {viewableAwayPlayers?.GoalieStats.map(
                            (player, index) => {
                              const shotsagainst = player.ShotsAgainst ?? 0;
                              const goalsagainst = player.GoalsAgainst ?? 0;
                              const saves = player.Saves ?? 0;
                              const savepercentage =
                                player.SavePercentage.toFixed(3) ?? 0;
                              const plusminus = player.PlusMinus ?? 0;
                              const toiSeconds = player.TimeOnIce ?? 0;
                              const minutes = Math.floor(toiSeconds / 60);
                              const seconds = toiSeconds % 60;
                              const toi = `${minutes}:${seconds
                                .toString()
                                .padStart(2, "0")}`;

                              return (
                                <div
                                  key={index}
                                  className="grid grid-cols-10 gap-2 text-sm border-b py-1"
                                  style={{
                                    backgroundColor:
                                      index % 2 === 0
                                        ? borderColor
                                        : "transparent",
                                  }}
                                >
                                  <Text
                                    variant="xs"
                                    classes="col-span-3 text-left w-full"
                                  >
                                    {player.Position ?? "N/A"}{" "}
                                    {player.FirstName ?? ""}{" "}
                                    {player.LastName ?? ""}
                                  </Text>
                                  <Text variant="xs">{shotsagainst}</Text>
                                  <Text variant="xs">{goalsagainst}</Text>
                                  <Text variant="xs">{saves}</Text>
                                  <Text variant="xs">{savepercentage}</Text>
                                  <Text variant="xs">{plusminus}</Text>
                                  <Text variant="xs">{toi}</Text>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {view === PBP && (
                <div className="flex flex-col">
                  <div className="grid grid-cols-12 gap-2 font-semibold py-1 border-b">
                    <Text variant="xs" classes="text-center">
                      #
                    </Text>
                    <Text variant="xs" classes="text-center">
                      Period
                    </Text>
                    <Text variant="xs" classes="text-center">
                      Time
                    </Text>
                    <Text variant="xs" classes="text-center">
                      Event
                    </Text>
                    <Text variant="xs" classes="col-span-2 text-center">
                      Zone
                    </Text>
                    <Text variant="xs" classes="col-span-4 text-center">
                      Description
                    </Text>
                    <Text variant="xs" classes="col-span-2 text-center">
                      Score
                    </Text>
                  </div>
                  {playByPlays.map((play, index) => {
                    const nextPlay = playByPlays[index + 1];
                    const isScoreChange =
                      nextPlay &&
                      (play.HomeTeamScore !== nextPlay.HomeTeamScore ||
                        play.AwayTeamScore !== nextPlay.AwayTeamScore);
                    const score = `${play.HomeTeamScore}-${play.AwayTeamScore}`;
                    const bgColor = isScoreChange
                      ? "#189E5B"
                      : index % 2 === 0
                      ? backgroundColor
                      : "transparent";
                    const textColor = isScoreChange
                      ? { color: backgroundColor, fontWeight: "700" }
                      : { color: "inherit" };
                    return (
                      <div
                        key={play.PlayNumber}
                        className="grid grid-cols-12 gap-2 text-sm border-b py-1"
                        style={{ backgroundColor: bgColor }}
                      >
                        <Text
                          variant="xs"
                          classes="text-center"
                          style={textColor}
                        >
                          {play.PlayNumber}
                        </Text>
                        <Text
                          variant="xs"
                          classes="text-center"
                          style={textColor}
                        >
                          {play.Period}
                        </Text>
                        <Text
                          variant="xs"
                          classes="text-center"
                          style={textColor}
                        >
                          {play.TimeOnClock}
                        </Text>
                        <Text
                          variant="xs"
                          classes="text-center"
                          style={textColor}
                        >
                          {play.Event}
                        </Text>
                        <Text
                          variant="xs"
                          classes="col-span-2 text-center"
                          style={textColor}
                        >
                          {play.Zone}
                        </Text>
                        <Text
                          variant="xs"
                          classes="col-span-4 text-left"
                          style={textColor}
                        >
                          {play.Result}
                        </Text>
                        <Text
                          variant="xs"
                          classes="col-span-2 text-center"
                          style={textColor}
                        >
                          {score}
                        </Text>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const BasketBallGameModal = ({
  league,
  game,
  isPro,
  playerMap,
  teamMap,
}: GameModalProps) => {
  const scheduleService = new FBAScheduleService();
  const { ExportPlayByPlay, cbbTeam } = useSimBBAStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [homePlayers, setHomePlayers] = useState<MatchResultsPlayer[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<MatchResultsPlayer[]>([]);
  const homeTeam = teamMap[game.HomeTeamID];
  const [homeStats, setHomeStats] = useState<MatchResultsTeam>(
    {} as MatchResultsTeam
  );
  const [awayStats, setAwayStats] = useState<MatchResultsTeam>(
    {} as MatchResultsTeam
  );
  const [view, setView] = useState<string>(BoxScore);
  const [header, setHeader] = useState<string>("Box Score");
  const [isChecked, setIsChecked] = useState(false);
  const backgroundColor = "#1f2937";
  const borderColor = darkenColor(backgroundColor, -5);
  const homeScoreColor =
    game.HomeTeamScore > game.AwayTeamScore ||
    game.HomeTeamShootoutScore > game.AwayTeamShootoutScore
      ? "#189E5B"
      : "#ef4444";
  const awayScoreColor =
    game.AwayTeamScore > game.HomeTeamScore ||
    game.AwayTeamShootoutScore > game.HomeTeamShootoutScore
      ? "#189E5B"
      : "#ef4444";
  const city = game.City.length === 0 ? homeTeam.City : game.City;
  const state = game.State.length === 0 ? homeTeam.State : game.State;
  const capacity = homeTeam ? homeTeam.Capacity : 0;
  let gameType = "";
  if (game.IsNeutralSite) {
    gameType += "Neutral Site ";
  }
  if (game.IsConference) {
    gameType += "Conference ";
  }
  if (game.IsPreseason) {
    gameType += "Preseason ";
  }
  if (game.IsPlayoff) {
    gameType += "Playoff ";
  }

  const columns = useMemo(() => {
    return getBasketballResultsColumns();
  }, []);

  useEffect(() => {
    if (!game || game.ID <= 0) return;
    GetMatchResults();
  }, [game]);

  // CHANGE
  const GetMatchResults = async (): Promise<void> => {
    setIsLoading(true);

    let response: MatchResultsResponse;
    if (isPro) {
      response = await scheduleService.GetNBAGameResultData(game.ID);
    } else {
      response = await scheduleService.GetCBBGameResultData(game.ID);
    }

    setHomePlayers(response.HomePlayers);
    setAwayPlayers(response.AwayPlayers);
    setHomeStats(response.HomeStats);
    setAwayStats(response.AwayStats);

    setIsLoading(false);
  };

  const playerRenderer = (
    item: MatchResultsPlayer,
    index: number,
    backgroundColor: string
  ) => {
    const values = GetBasketballResultsValues(item);

    return (
      <div
        key={item.ID}
        className={`table-row border-b dark:border-gray-700 text-left`}
        style={{ backgroundColor }}
      >
        {values.map((stat: any, idx) => {
          return (
            <TableCell key={stat.label + idx}>
              <Text variant="small">{stat.value}</Text>
            </TableCell>
          );
        })}
      </div>
    );
  };
  const rowRenderer = (
    league: League
  ): ((
    item: MatchResultsPlayer,
    index: number,
    backgroundColor: string
  ) => ReactNode) => {
    return playerRenderer;
  };

  const scoreColumnCount = useMemo(() => {
    let baseColumns = 6;
    if (isPro) {
      baseColumns += 2; // For NBA, we have additional columns for Overtime and Shootout
    }
    if (homeStats.OvertimeScore > 0 || awayStats.OvertimeScore > 0) {
      baseColumns += 1; // Overtime column
    }
    return baseColumns;
  }, [isPro, homeStats, awayStats]);

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center">
          <Text variant="small">Loading...</Text>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex flex-col sm:gap-2">
            <div className="flex w-full justify-around px-2">
              <div className="flex flex-col items-center w-1/3">
                <div className="flex items-center h-full gap-1 sm:gap-4">
                  <Logo url={game.HomeTeamLogo} classes="w-full h-full" />
                  <div className="flex flex-col text-left sm:pr-8">
                    <Text variant="small" classes="opacity-50">
                      {game.HomeTeamRank > 0 ? `#${game.HomeTeamRank}` : "NR"}
                    </Text>
                    <Text variant="alternate">{game.HomeTeamName}</Text>
                    <Text variant="h3-alt" classes="font-semibold">
                      {game.HomeTeamMascot}
                    </Text>
                  </div>
                  <div className="flex flex-col pr-2 sm:pr-0">
                    <Text variant="h1-alt" style={{ color: homeScoreColor }}>
                      {game.HomeTeamScore}
                    </Text>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-center">
                  <Text variant="body" classes="font-semibold">
                    Final
                  </Text>
                </div>
                <div className="grid">
                  <div
                    className={`grid grid-cols-${scoreColumnCount} gap-4 border-b`}
                  >
                    <div className="text-center col-span-2"></div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">1</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">2</Text>
                    </div>
                    {isPro && (
                      <>
                        <div className="text-center col-span-1">
                          <Text variant="body-small">3</Text>
                        </div>
                        <div className="text-center col-span-1">
                          <Text variant="body-small">4</Text>
                        </div>
                      </>
                    )}
                    {homeStats.OvertimeScore > 0 ||
                    awayStats.OvertimeScore > 0 ? (
                      <div className="text-center col-span-1">
                        <Text variant="body-small">OT</Text>
                      </div>
                    ) : null}
                    <div className="text-center col-span-1">
                      <Text variant="body-small">T</Text>
                    </div>
                  </div>
                  <div className={`grid grid-cols-${scoreColumnCount} gap-3`}>
                    <div className="text-left col-span-2">
                      <Text variant="body-small">{game.HomeTeamAbbr}</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">
                        {homeStats.FirstHalfScore}
                      </Text>
                    </div>
                    {isPro && (
                      <div className="text-center col-span-1">
                        <Text variant="body-small">
                          {homeStats.SecondQuarterScore}
                        </Text>
                      </div>
                    )}
                    <div className="text-center col-span-1">
                      <Text variant="body-small">
                        {homeStats.SecondHalfScore}
                      </Text>
                    </div>
                    {isPro && (
                      <div className="text-center col-span-1">
                        <Text variant="body-small">
                          {homeStats.FourthQuarterScore}
                        </Text>
                      </div>
                    )}
                    {homeStats.OvertimeScore > 0 ||
                    awayStats.OvertimeScore > 0 ? (
                      <div className="text-center col-span-1">
                        <Text variant="body-small">
                          {homeStats.OvertimeScore}
                        </Text>
                      </div>
                    ) : null}
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{game.HomeTeamScore}</Text>
                    </div>
                  </div>

                  <div className={`grid grid-cols-${scoreColumnCount} gap-3`}>
                    <div className="text-left col-span-2">
                      <Text variant="body-small">{game.AwayTeamAbbr}</Text>
                    </div>
                    <div className="text-center col-span-1">
                      <Text variant="body-small">
                        {awayStats.FirstHalfScore}
                      </Text>
                    </div>
                    {isPro && (
                      <div className="text-center col-span-1">
                        <Text variant="body-small">
                          {awayStats.SecondQuarterScore}
                        </Text>
                      </div>
                    )}
                    <div className="text-center col-span-1">
                      <Text variant="body-small">
                        {awayStats.SecondHalfScore}
                      </Text>
                    </div>
                    {isPro && (
                      <div className="text-center col-span-1">
                        <Text variant="body-small">
                          {awayStats.FourthQuarterScore}
                        </Text>
                      </div>
                    )}
                    {homeStats.OvertimeScore > 0 ||
                    awayStats.OvertimeScore > 0 ? (
                      <div className="text-center col-span-1">
                        <Text variant="body-small">
                          {awayStats.OvertimeScore}
                        </Text>
                      </div>
                    ) : null}
                    <div className="text-center col-span-1">
                      <Text variant="body-small">{game.AwayTeamScore}</Text>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center w-1/3">
                <div className="flex items-center h-full gap-1 sm:gap-4">
                  <div className="flex flex-col pl-2 sm:pl-0">
                    <Text variant="h1-alt" style={{ color: awayScoreColor }}>
                      {game.AwayTeamScore}
                    </Text>
                  </div>
                  <div className="flex flex-col text-right sm:pl-8">
                    <Text variant="small" classes="opacity-50">
                      {game.AwayTeamRank > 0 ? `#${game.AwayTeamRank}` : "NR"}
                    </Text>
                    <Text variant="alternate">{game.AwayTeamName}</Text>
                    <Text variant="h3-alt" classes="font-semibold">
                      {game.AwayTeamMascot}
                    </Text>
                  </div>
                  <Logo url={game.AwayTeamLogo} classes="w-full h-full" />
                </div>
              </div>
            </div>
            <div
              className="flex flex-col rounded-lg p-2 justify-start w-full"
              style={{ backgroundColor: borderColor }}
            >
              {view === BoxScore && (
                <div className="flex flex-col">
                  <div className="flex flex-col sm:flex-row items-start gap-1 sm:gap-4">
                    <div className="flex flex-row items-center justify-start w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 w-full pb-2">
                          <Text variant="body-small" classes="font-semibold">
                            Game Info
                          </Text>
                        </div>
                        <div
                          className="grid rounded-lg border-t px-1"
                          style={{ backgroundColor }}
                        >
                          <div className="grid grid-cols-12 gap-2 font-semibold py-1 border-b">
                            <Text variant="xs" classes="col-span-3 text-left">
                              Arena
                            </Text>
                            <Text variant="xs" classes="col-span-2">
                              Attendance
                            </Text>
                            <Text variant="xs">Capacity</Text>
                            <Text variant="xs" classes="col-span-2">
                              City
                            </Text>
                            <Text variant="xs">State</Text>
                            <Text variant="xs">Country</Text>
                            <Text variant="xs" classes="col-span-2 text-left">
                              Game Type
                            </Text>
                          </div>
                          <div
                            className="grid grid-cols-12 gap-2 text-sm border-b py-1"
                            style={{
                              backgroundColor: borderColor,
                            }}
                          >
                            <Text variant="xs" classes="col-span-3 text-left">
                              {game.Arena}
                            </Text>
                            <Text variant="xs" classes="col-span-2">
                              {game.AttendanceCount
                                ? game.AttendanceCount
                                : "N/A"}
                            </Text>
                            <Text variant="xs">{capacity}</Text>
                            <Text variant="xs" classes="col-span-2">
                              {city}
                            </Text>
                            <Text variant="xs">{state}</Text>
                            <Text variant="xs">?</Text>
                            <Text variant="xs" classes="col-span-2 text-left">
                              {gameType}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start gap-1 sm:gap-4">
                    <div className="flex flex-col items-center justify-start w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.HomeTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.HomeTeamName} Players
                          </Text>
                        </div>
                        <div
                          className="grid rounded-lg border-t px-1"
                          style={{ backgroundColor }}
                        >
                          <Table
                            columns={columns}
                            data={homePlayers}
                            rowRenderer={rowRenderer(league)}
                            backgroundColor={backgroundColor}
                            team={cbbTeam}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start gap-1 sm:gap-4">
                    <div className="flex flex-col items-center justify-center w-full">
                      <div className="flex flex-col p-2 sm:p-4 w-full">
                        <div className="flex gap-2 items-center w-full pb-2">
                          <Logo
                            variant="tiny"
                            classes="opacity-80"
                            url={game.AwayTeamLogo}
                          />
                          <Text variant="body-small" classes="font-semibold">
                            {game.AwayTeamName} Players
                          </Text>
                        </div>
                        <div
                          className="grid rounded-lg border-t px-1"
                          style={{ backgroundColor }}
                        >
                          <Table
                            columns={columns}
                            data={awayPlayers}
                            rowRenderer={rowRenderer(league)}
                            backgroundColor={backgroundColor}
                            team={cbbTeam}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
