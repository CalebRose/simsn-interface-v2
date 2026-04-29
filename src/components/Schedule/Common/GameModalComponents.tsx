import { League } from "../../../_constants/constants";
import { getPasserRating } from "../../../_utility/getPasserRating";
import {
  FilteredStats,
  HockeyFilteredStats,
  PlayByPlay,
} from "./GameModalInterfaces";
import { Text } from "../../../_design/Typography";
import { useResponsive } from "../../../_hooks/useMobile";
import { useMemo } from "react";

interface GameStatsMappingProps {
  data: FilteredStats;
  league: League;
  isPro: boolean;
  backgroundColor: string;
  borderColor: string;
  score?: any;
  isHome?: boolean;
  game?: any;
  homeTeam?: any;
  coach?: any;
}

export const FBGameModalInfo = ({
  data,
  league,
  isPro,
  backgroundColor,
  borderColor,
  game,
  homeTeam,
}: GameStatsMappingProps) => {
  const gameTitle = useMemo(() => {
    if (game.GameTitle.length > 0) {
      return game.GameTitle;
    }
    if (game.IsPlayoffGame) {
      return "Playoff Game";
    }
    if (game.IsRivalryGame) {
      return "Rivalry Game";
    }
    if (game.IsSpringGame) {
      return "Spring Game";
    }
    if (game.IsPreseason) {
      return "Preseason";
    }
    if (game.IsNeutralSite) {
      return "Neutral Site Game";
    }
    if (game.IsConference) {
      return "Conference Game";
    }
    if (game.IsDivisional) {
      return "Division Game";
    }
    return "Out of Conference";
  }, [game]);
  return (
    <div className="grid rounded-lg border-t px-1" style={{ backgroundColor }}>
      <div className="grid grid-cols-12 gap-2 font-semibold py-1 border-b">
        <Text variant="xs" classes="col-span-2 text-left">
          Timeslot
        </Text>
        <Text variant="xs" classes="col-span-3 text-left">
          Info
        </Text>
        <Text variant="xs" classes="col-span-3 text-left">
          Stadium
        </Text>
        <Text variant="xs" classes="col-span-1 text-left">
          Attendance
        </Text>
        <Text variant="xs" classes="col-span-1 text-left">
          Capacity
        </Text>
        <Text variant="xs" classes="col-span-1 text-left">
          City
        </Text>
        <Text variant="xs" classes="col-span-1 text-left">
          State
        </Text>
      </div>

      <div
        className="grid grid-cols-12 gap-2 text-sm border-b py-1"
        style={{
          backgroundColor: borderColor,
        }}
      >
        <Text variant="xs" classes="col-span-2 text-left">
          {game.TimeSlot}
        </Text>
        <Text variant="xs" classes="col-span-3 text-left">
          {gameTitle}
        </Text>
        <Text variant="xs" classes="col-span-3 text-left">
          {game.Stadium}
        </Text>
        <Text variant="xs" classes="col-span-1 text-left">
          ?
        </Text>
        <Text variant="xs" classes="col-span-1 text-left">
          ?
        </Text>
        <Text variant="xs" classes="col-span-1 text-left">
          {game.City}
        </Text>
        <Text variant="xs" classes="col-span-1 text-left">
          {game.State}
        </Text>
      </div>
    </div>
  );
};

export const FBGameModalWeather = ({
  data,
  league,
  isPro,
  backgroundColor,
  borderColor,
  game,
}: GameStatsMappingProps) => {
  return (
    <div className="grid rounded-lg border-t px-1" style={{ backgroundColor }}>
      <div className="grid grid-cols-11 gap-2 font-semibold py-1 border-b">
        <Text variant="xs" classes="col-span-3 text-left">
          Prediction
        </Text>
        <Text variant="xs" classes="col-span-1 text-left">
          Actual
        </Text>
        <Text variant="xs" classes="col-span-1 text-left">
          Skies
        </Text>
        <Text variant="xs" classes="col-span-1 text-left">
          Precip.
        </Text>
        <Text variant="xs" classes="col-span-2 text-left">
          Wind
        </Text>
        <Text variant="xs" classes="col-span-1 text-left">
          Wind Speed
        </Text>
      </div>

      <div
        className="grid grid-cols-11 gap-2 text-sm border-b py-1"
        style={{
          backgroundColor: borderColor,
        }}
      >
        <Text variant="xs" classes="col-span-3 text-left">
          {game.LowTemp.toFixed(1)}-{game.HighTemp.toFixed(1)} deg.
        </Text>
        <Text variant="xs" classes="col-span-1 text-left">
          {game.GameComplete ? `${game.GameTemp.toFixed(2)} deg.` : "?"}
        </Text>
        <Text variant="xs" classes="col-span-1 text-left">
          {game.Cloud}
        </Text>
        <Text variant="xs" classes="col-span-1 text-left">
          {game.Precip}
        </Text>
        <Text variant="xs" classes="col-span-2 text-left">
          {game.WindCategory}
        </Text>
        <Text variant="xs" classes="col-span-1 text-left">
          {game.WindSpeed.toFixed(2)} mph
        </Text>
      </div>
    </div>
  );
};

export const FBGameModalStrategy = ({
  data,
  league,
  isPro,
  backgroundColor,
  borderColor,
  score,
  coach,
  isHome,
}: GameStatsMappingProps) => {
  return (
    <div className="grid rounded-lg border-t px-1" style={{ backgroundColor }}>
      <div className="grid grid-cols-11 gap-2 font-semibold py-1 border-b">
        <Text variant="xs" classes="col-span-3 text-left">
          Offensive Scheme
        </Text>
        <Text variant="xs" classes="col-span-3 text-left">
          Defensive Scheme
        </Text>
        <Text variant="xs" classes="col-span-3 text-left">
          Coach
        </Text>
      </div>

      <div
        className="grid grid-cols-11 gap-2 text-sm border-b py-1"
        style={{
          backgroundColor: borderColor,
        }}
      >
        <Text variant="xs" classes="col-span-3 text-left">
          {isHome ? score.HomeOffensiveScheme : score.AwayOffensiveScheme}
        </Text>
        <Text variant="xs" classes="col-span-3 text-left">
          {isHome ? score.HomeDefensiveScheme : score.AwayDefensiveScheme}
        </Text>
        <Text variant="xs" classes="col-span-3 text-left">
          {coach ? coach : "N/A"}
        </Text>
      </div>
    </div>
  );
};

export const FBGameModalPassing = ({
  data,
  league,
  isPro,
  backgroundColor,
  borderColor,
}: GameStatsMappingProps) => {
  return (
    <div className="grid rounded-lg border-t px-1" style={{ backgroundColor }}>
      <div className="grid grid-cols-11 gap-2 font-semibold py-1 border-b">
        <Text variant="xs" classes="col-span-3 text-left">
          Player
        </Text>
        <Text variant="xs">CMP</Text>
        <Text variant="xs">ATT</Text>
        <Text variant="xs">YDS</Text>
        <Text variant="xs">YDS/ATT</Text>
        <Text variant="xs">TD</Text>
        <Text variant="xs">INT</Text>
        <Text variant="xs">RTG</Text>
        <Text variant="xs">SCK</Text>
      </div>
      {data?.PassingStats.map((player, index) => {
        const passingYards = player.PassingYards ?? 0;
        const passAttempts = player.PassAttempts ?? 0;
        const passCompletions = player.PassCompletions ?? 0;
        const passingTDs = player.PassingTDs ?? 0;
        const interceptions = player.Interceptions ?? 0;
        const sacks = player.Sacks ?? 0;

        const yardsPerAttempt = passAttempts
          ? (passingYards / passAttempts).toFixed(2)
          : "0.00";

        const qbr = getPasserRating(
          isPro,
          passCompletions,
          passAttempts,
          passingYards,
          passingTDs,
          interceptions,
        );

        return (
          <div
            key={index}
            className="grid grid-cols-11 gap-2 text-sm border-b py-1"
            style={{
              backgroundColor: index % 2 === 0 ? borderColor : "transparent",
            }}
          >
            <Text variant="xs" classes="col-span-3 text-left">
              {player.Position ?? "N/A"} {player.FirstName ?? ""}{" "}
              {player.LastName ?? ""}
            </Text>
            <Text variant="xs">{passCompletions}</Text>
            <Text variant="xs">{passAttempts}</Text>
            <Text variant="xs">{passingYards}</Text>
            <Text variant="xs">{yardsPerAttempt}</Text>
            <Text variant="xs">{passingTDs}</Text>
            <Text variant="xs">{interceptions}</Text>
            <Text variant="xs">{qbr}</Text>
            <Text variant="xs">{sacks}</Text>
          </div>
        );
      })}
    </div>
  );
};

export const FBGameModalRushing = ({
  data,
  league,
  isPro,
  backgroundColor,
  borderColor,
}: GameStatsMappingProps) => {
  return (
    <div className="grid rounded-lg border-t px-1" style={{ backgroundColor }}>
      <div className="grid grid-cols-9 gap-2 font-semibold py-1 border-b">
        <Text variant="xs" classes="col-span-3 text-left">
          Player
        </Text>
        <Text variant="xs">CAR</Text>
        <Text variant="xs">YDS</Text>
        <Text variant="xs">YDS/CAR</Text>
        <Text variant="xs">TD</Text>
        <Text variant="xs">FUM</Text>
        <Text variant="xs">LONG</Text>
      </div>
      {data?.RushingStats.map((player, index) => {
        const carries = player.RushAttempts ?? 0;
        const rushYards = player.RushingYards ?? 0;
        const rushTD = player.RushingTDs ?? 0;
        const fumbles = player.Fumbles ?? 0;
        const longRush = player.LongestRush ?? 0;

        const yardsPerCarry = carries
          ? (rushYards / carries).toFixed(2)
          : "0.00";

        return (
          <div
            key={index}
            className="grid grid-cols-9 gap-2 text-sm border-b py-1"
            style={{
              backgroundColor: index % 2 === 0 ? borderColor : "transparent",
            }}
          >
            <Text variant="xs" classes="col-span-3 text-left">
              {player.Position ?? "N/A"} {player.FirstName ?? ""}{" "}
              {player.LastName ?? ""}
            </Text>
            <Text variant="xs">{carries}</Text>
            <Text variant="xs">{rushYards}</Text>
            <Text variant="xs">{yardsPerCarry}</Text>
            <Text variant="xs">{rushTD}</Text>
            <Text variant="xs">{fumbles}</Text>
            <Text variant="xs">{longRush}</Text>
          </div>
        );
      })}
    </div>
  );
};

export const FBGameModalReceiving = ({
  data,
  league,
  isPro,
  backgroundColor,
  borderColor,
}: GameStatsMappingProps) => {
  return (
    <div className="grid rounded-lg border-t px-1" style={{ backgroundColor }}>
      <div className="grid grid-cols-10 gap-2 font-semibold py-1 border-b">
        <Text variant="xs" classes="col-span-3 text-left">
          Player
        </Text>
        <Text variant="xs">TGT</Text>
        <Text variant="xs">REC</Text>
        <Text variant="xs">YDS</Text>
        <Text variant="xs">YDS/REC</Text>
        <Text variant="xs">TD</Text>
        <Text variant="xs">FUM</Text>
        <Text variant="xs">LONG</Text>
      </div>
      {data?.ReceivingStats.map((player, index) => {
        const targets = player.Targets ?? 0;
        const receptions = player.Catches ?? 0;
        const recYards = player.ReceivingYards ?? 0;
        const recTD = player.ReceivingTDs ?? 0;
        const recFumble = player.Fumbles ?? 0;
        const longRec = player.LongestReception ?? 0;

        const yardsPerRec = receptions
          ? (recYards / receptions).toFixed(2)
          : "0.00";

        return (
          <div
            key={index}
            className="grid grid-cols-10 gap-2 text-sm border-b py-1"
            style={{
              backgroundColor: index % 2 === 0 ? borderColor : "transparent",
            }}
          >
            <Text variant="xs" classes="col-span-3 text-left">
              {player.Position ?? "N/A"} {player.FirstName ?? ""}{" "}
              {player.LastName ?? ""}
            </Text>
            <Text variant="xs">{targets}</Text>
            <Text variant="xs">{receptions}</Text>
            <Text variant="xs">{recYards}</Text>
            <Text variant="xs">{yardsPerRec}</Text>
            <Text variant="xs">{recTD}</Text>
            <Text variant="xs">{recFumble}</Text>
            <Text variant="xs">{longRec}</Text>
          </div>
        );
      })}
    </div>
  );
};

export const FBGameModalDefensive = ({
  data,
  league,
  isPro,
  backgroundColor,
  borderColor,
}: GameStatsMappingProps) => {
  return (
    <div className="grid rounded-lg border-t px-1" style={{ backgroundColor }}>
      <div className="grid grid-cols-11 gap-2 font-semibold py-1 border-b">
        <Text variant="xs" classes="col-span-3 text-left">
          Player
        </Text>
        <Text variant="xs">TOT</Text>
        <Text variant="xs">SOLO</Text>
        <Text variant="xs">SACKS</Text>
        <Text variant="xs">TFL</Text>
        <Text variant="xs">FF/FR</Text>
        <Text variant="xs">PD</Text>
        <Text variant="xs">INT</Text>
        <Text variant="xs">TD</Text>
      </div>
      {data?.DefenseStats.map((player, index) => {
        const soloTackles = player.SoloTackles ?? 0;
        const assistedTackles = player.AssistedTackles ?? 0;
        const sack = player.SacksMade ?? 0;
        const tfl = player.TacklesForLoss ?? 0;
        const forceFumbles = player.ForcedFumbles ?? 0;
        const recoveredFumbles = player.RecoveredFumbles ?? 0;
        const PassDeflections = player.PassDeflections ?? 0;
        const ints = player.InterceptionsCaught ?? 0;
        const defTDs = player.DefensiveTDs ?? 0;
        const tackles = soloTackles ? soloTackles + assistedTackles : "0";

        return (
          <div
            key={index}
            className="grid grid-cols-11 gap-2 text-sm border-b py-1"
            style={{
              backgroundColor: index % 2 === 0 ? borderColor : "transparent",
            }}
          >
            <Text variant="xs" classes="col-span-3 text-left">
              {player.Position ?? "N/A"} {player.FirstName ?? ""}{" "}
              {player.LastName ?? ""}
            </Text>
            <Text variant="xs">{tackles}</Text>
            <Text variant="xs">{soloTackles}</Text>
            <Text variant="xs">{sack}</Text>
            <Text variant="xs">{tfl}</Text>
            <Text variant="xs">
              {forceFumbles}/{recoveredFumbles}
            </Text>
            <Text variant="xs">{PassDeflections}</Text>
            <Text variant="xs">{ints}</Text>
            <Text variant="xs">{defTDs}</Text>
          </div>
        );
      })}
    </div>
  );
};

export const FBGameModalKicking = ({
  data,
  league,
  isPro,
  backgroundColor,
  borderColor,
}: GameStatsMappingProps) => {
  return (
    <div className="grid rounded-lg border-t px-1" style={{ backgroundColor }}>
      <div className="grid grid-cols-8 gap-2 font-semibold py-1 border-b">
        <Text variant="xs" classes="col-span-3 text-left">
          Player
        </Text>
        <Text variant="xs">FG</Text>
        <Text variant="xs">XP</Text>
        <Text variant="xs">LONG</Text>
        <Text variant="xs">PUNTS</Text>
        <Text variant="xs">IN 20</Text>
      </div>
      {data?.SpecialTeamStats.map((player, index) => {
        const fieldGoalsMade = player.FGMade ?? 0;
        const fieldGoalsAttempted = player.FGAttempts ?? 0;
        const extraPointsMade = player.ExtraPointsMade ?? 0;
        const extraPointsAttempted = player.ExtraPointsAttempted ?? 0;
        const longFg = player.LongestFG ?? 0;
        const punts = player.Punts ?? 0;
        const inside20 = player.PuntsInside20 ?? 0;

        return (
          <div
            key={index}
            className="grid grid-cols-8 gap-2 text-sm border-b py-1"
            style={{
              backgroundColor: index % 2 === 0 ? borderColor : "transparent",
            }}
          >
            <Text variant="xs" classes="col-span-3 text-left">
              {player.Position ?? "N/A"} {player.FirstName ?? ""}{" "}
              {player.LastName ?? ""}
            </Text>
            <Text variant="xs">
              {fieldGoalsMade}/{fieldGoalsAttempted}
            </Text>
            <Text variant="xs">
              {extraPointsMade}/{extraPointsAttempted}
            </Text>
            <Text variant="xs">{longFg}</Text>
            <Text variant="xs">{punts}</Text>
            <Text variant="xs">{inside20}</Text>
          </div>
        );
      })}
    </div>
  );
};

export const FBGameModalReturning = ({
  data,
  league,
  isPro,
  backgroundColor,
  borderColor,
}: GameStatsMappingProps) => {
  return (
    <div className="grid rounded-lg border-t px-1" style={{ backgroundColor }}>
      <div className="grid grid-cols-7 gap-2 font-semibold py-1 border-b">
        <Text variant="xs" classes="col-span-3 text-left">
          Player
        </Text>
        <Text variant="xs">KR YDS</Text>
        <Text variant="xs">KR TD</Text>
        <Text variant="xs">PR YDS</Text>
        <Text variant="xs">PR TD</Text>
      </div>
      {data?.ReturnStats.map((player, index) => {
        const kickReturns = player.KickReturns ?? 0;
        const kickReturnYards = player.KickReturnYards ?? 0;
        const puntReturns = player.PuntReturns ?? 0;
        const puntReturnYards = player.PuntReturnYards ?? 0;
        const kickReturnTD = player.KickReturnTDs ?? 0;
        const puntReturnTD = player.PuntReturnTDs ?? 0;

        return (
          <div
            key={index}
            className="grid grid-cols-7 gap-2 text-sm border-b py-1"
            style={{
              backgroundColor: index % 2 === 0 ? borderColor : "transparent",
            }}
          >
            <Text variant="xs" classes="col-span-3 text-left">
              {player.Position ?? "N/A"} {player.FirstName ?? ""}{" "}
              {player.LastName ?? ""}
            </Text>
            <Text variant="xs">{kickReturnYards}</Text>
            <Text variant="xs">{kickReturnTD}</Text>
            <Text variant="xs">{puntReturnYards}</Text>
            <Text variant="xs">{puntReturnTD}</Text>
          </div>
        );
      })}
    </div>
  );
};

interface GameModalPBPProps {
  data: PlayByPlay[];
  league: League;
  isPro: boolean;
  backgroundColor: string;
  borderColor: string;
}

export const FBGameModalPBP = ({
  data,
  league,
  isPro,
  backgroundColor,
  borderColor,
}: GameModalPBPProps) => {
  const { isMobile, isDesktop } = useResponsive();

  return (
    <div className="flex flex-col">
      <div
        className={`grid ${
          isMobile ? "grid-cols-25" : "grid-cols-42"
        } gap-2 text-sm border-b py-1`}
      >
        <Text variant="xs" classes="col-span-1 text-center">
          #
        </Text>
        <Text variant="xs" classes="col-span-1 text-center">
          Qtr
        </Text>
        <Text
          variant="xs"
          classes={`${isMobile ? "col-span-2" : "col-span-2"} text-center`}
        >
          Poss
        </Text>
        <Text
          variant="xs"
          classes={`${isMobile ? "col-span-2" : "col-span-2"} text-center`}
        >
          Time
        </Text>
        <Text
          variant="xs"
          classes={`${isMobile ? "col-span-3" : "col-span-2"} text-center`}
        >
          LOS
        </Text>
        <Text
          variant="xs"
          classes={`${isMobile ? "col-span-3" : "col-span-2"} text-center`}
        >
          Down
        </Text>
        <Text
          variant="xs"
          classes={`${isMobile ? "col-span-3" : "col-span-2"} text-center`}
        >
          Play Type
        </Text>
        {isDesktop && (
          <>
            <Text variant="xs" classes="col-span-2 text-center">
              Play
            </Text>
            <Text variant="xs" classes="col-span-3 text-center">
              Off Form.
            </Text>
            <Text variant="xs" classes="col-span-3 text-center">
              Def Form.
            </Text>
            <Text variant="xs" classes="col-span-2 text-center">
              Def Ten.
            </Text>
            <Text variant="xs" classes="col-span-1 text-center">
              Blitz#
            </Text>
            <Text variant="xs" classes="col-span-2 text-center">
              LB Cov.
            </Text>
            <Text variant="xs" classes="col-span-2 text-center">
              CB Cov.
            </Text>
            <Text variant="xs" classes="col-span-2 text-center">
              S Cov.
            </Text>
          </>
        )}
        <Text
          variant="xs"
          classes={`${
            isMobile ? "col-span-6" : "col-span-9"
          } text-left border-l pl-1`}
        >
          Description
        </Text>
        <Text
          variant="xs"
          classes={`${
            isMobile ? "col-span-2" : "col-span-1"
          } text-center border-r pr-1`}
        >
          Yds.
        </Text>
        <Text variant="xs" classes="col-span-2 text-center">
          Score
        </Text>
      </div>
      {data.map((play, index) => {
        const isTouchdown = play.Result?.toLowerCase().includes("touchdown");
        const bgColor = isTouchdown
          ? "#189E5B"
          : index % 2 === 0
            ? backgroundColor
            : "transparent";
        const textColor = isTouchdown
          ? { color: backgroundColor, fontWeight: "700" }
          : { color: "inherit" };
        return (
          <div
            key={play.PlayNumber}
            className={`grid ${
              isMobile ? "grid-cols-25" : "grid-cols-42"
            } gap-2 text-sm border-b py-1`}
            style={{ backgroundColor: bgColor }}
          >
            <Text
              variant="xs"
              classes="col-span-1 text-center"
              style={textColor}
            >
              {play.PlayNumber}
            </Text>
            <Text
              variant="xs"
              classes="col-span-1 text-center"
              style={textColor}
            >
              {play.Quarter}
            </Text>
            <Text
              variant="xs"
              classes={`${isMobile ? "col-span-2" : "col-span-2"} text-center`}
              style={textColor}
            >
              {play.Possession}
            </Text>
            <Text
              variant="xs"
              classes={`${isMobile ? "col-span-2" : "col-span-2"} text-center`}
              style={textColor}
            >
              {play.TimeRemaining}
            </Text>
            <Text
              variant="xs"
              classes={`${isMobile ? "col-span-3" : "col-span-2"} text-center`}
              style={textColor}
            >
              {play.LineOfScrimmage}
            </Text>
            <Text
              variant="xs"
              classes={`${isMobile ? "col-span-3" : "col-span-2"} text-center`}
              style={textColor}
            >
              {play.Down === 0
                ? ""
                : `${
                    play.Down === 1
                      ? "1st"
                      : play.Down === 2
                        ? "2nd"
                        : play.Down === 3
                          ? "3rd"
                          : "4th"
                  } 
                  and ${play.Distance}`}
            </Text>
            <Text
              variant="xs"
              classes={`${isMobile ? "col-span-3" : "col-span-2"} text-center`}
              style={textColor}
            >
              {play.PlayType}
            </Text>
            {isDesktop && (
              <>
                <Text
                  variant="xs"
                  classes="text-center col-span-2"
                  style={textColor}
                >
                  {play.PlayName}
                </Text>
                <Text
                  variant="xs"
                  classes="col-span-3 text-center"
                  style={textColor}
                >
                  {play.OffensiveFormation}
                </Text>
                <Text
                  variant="xs"
                  classes="col-span-3 text-center"
                  style={textColor}
                >
                  {play.DefensiveFormation}
                </Text>
                <Text
                  variant="xs"
                  classes="col-span-2 text-center"
                  style={textColor}
                >
                  {play.DefensiveTendency
                    ? play.DefensiveTendency.split(" ")[0]
                    : "N/A"}
                </Text>
                <Text
                  variant="xs"
                  classes="col-span-1 text-center"
                  style={textColor}
                >
                  {play.BlitzNumber}
                </Text>
                <Text
                  variant="xs"
                  classes="col-span-2 text-center"
                  style={textColor}
                >
                  {play.LBCoverage}
                </Text>
                <Text
                  variant="xs"
                  classes="col-span-2 text-center"
                  style={textColor}
                >
                  {play.CBCoverage}
                </Text>
                <Text
                  variant="xs"
                  classes="col-span-2 text-center"
                  style={textColor}
                >
                  {play.SCoverage}
                </Text>
              </>
            )}
            <Text
              variant="xs"
              classes={`${
                isMobile ? "col-span-6" : "col-span-9"
              } text-left border-l pl-1`}
              style={textColor}
            >
              {play.Result}
            </Text>
            <Text
              variant="xs"
              classes={`${
                isMobile ? "col-span-2" : "col-span-1"
              } text-center border-r pr-1`}
              style={textColor}
            >
              {play.ResultYards}
            </Text>
            <Text
              variant="xs"
              classes="col-span-2 text-center"
              style={textColor}
            >
              {play.HomeTeamScore} - {play.AwayTeamScore}
            </Text>
          </div>
        );
      })}
    </div>
  );
};

interface HockeyGameStatsMappingProps {
  data: HockeyFilteredStats;
  league: League;
  isPro: boolean;
  backgroundColor: string;
  borderColor: string;
}

export const HKGameModalForwards = ({
  data,
  league,
  isPro,
  backgroundColor,
  borderColor,
}: HockeyGameStatsMappingProps) => {
  return (
    <div className="grid rounded-lg border-t px-1" style={{ backgroundColor }}>
      <div className="grid grid-cols-12 gap-2 font-semibold py-1 border-b">
        <Text variant="xs" classes="col-span-3 text-left">
          Player
        </Text>
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
      {data?.ForwardsStats.map((player, index) => {
        const goals = player.Goals ?? 0;
        const assists = player.Assists ?? 0;
        const points = player.Points ?? 0;
        const plusminus = player.PlusMinus ?? 0;
        const penaltysecs = player.PenaltyMinutes ?? 0;
        const toiSeconds = player.TimeOnIce ?? 0;
        const ppg = player.PowerPlayGoals ?? 0;
        const shots = player.Shots ?? 0;
        const blocks = player.ShotsBlocked ?? 0;
        const hits = (player.BodyChecks ?? 0) + (player.StickChecks ?? 0);
        const faceoff = player.FaceOffWinPercentage.toFixed(1);
        const minutes = Math.floor(toiSeconds / 60);
        const seconds = toiSeconds % 60;
        const toi = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        return (
          <div
            key={index}
            className="grid grid-cols-12 gap-2 text-sm border-b py-1"
            style={{
              backgroundColor: index % 2 === 0 ? borderColor : "transparent",
            }}
          >
            <Text variant="xs" classes="col-span-3 text-left">
              {player.Position ?? "N/A"} {player.FirstName ?? ""}{" "}
              {player.LastName ?? ""}
            </Text>
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
      })}
    </div>
  );
};

export const HKGameModalDefensemen = ({
  data,
  league,
  isPro,
  backgroundColor,
  borderColor,
}: HockeyGameStatsMappingProps) => {
  return (
    <div className="grid rounded-lg border-t px-1" style={{ backgroundColor }}>
      <div className="grid grid-cols-12 gap-2 font-semibold py-1 border-b">
        <Text variant="xs" classes="col-span-3 text-left">
          Player
        </Text>
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
      {data?.DefensemenStats.map((player, index) => {
        const goals = player.Goals ?? 0;
        const assists = player.Assists ?? 0;
        const points = player.Points ?? 0;
        const plusminus = player.PlusMinus ?? 0;
        const penaltysecs = player.PenaltyMinutes ?? 0;
        const toiSeconds = player.TimeOnIce ?? 0;
        const ppg = player.PowerPlayGoals ?? 0;
        const shots = player.Shots ?? 0;
        const blocks = player.ShotsBlocked ?? 0;
        const hits = (player.BodyChecks ?? 0) + (player.StickChecks ?? 0);
        const faceoff = player.FaceOffWinPercentage.toFixed(1);
        const minutes = Math.floor(toiSeconds / 60);
        const seconds = toiSeconds % 60;
        const toi = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        return (
          <div
            key={index}
            className="grid grid-cols-12 gap-2 text-sm border-b py-1"
            style={{
              backgroundColor: index % 2 === 0 ? borderColor : "transparent",
            }}
          >
            <Text variant="xs" classes="col-span-3 text-left w-full">
              {player.Position ?? "N/A"} {player.FirstName ?? ""}{" "}
              {player.LastName ?? ""}
            </Text>
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
      })}
    </div>
  );
};

export const HKGameModalGoalies = ({
  data,
  league,
  isPro,
  backgroundColor,
  borderColor,
}: HockeyGameStatsMappingProps) => {
  return (
    <div className="grid rounded-lg border-t px-1" style={{ backgroundColor }}>
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
      {data?.GoalieStats.map((player, index) => {
        const shotsagainst = player.ShotsAgainst ?? 0;
        const goalsagainst = player.GoalsAgainst ?? 0;
        const saves = player.Saves ?? 0;
        const savepercentage = player.SavePercentage.toFixed(3) ?? 0;
        const plusminus = player.PlusMinus ?? 0;
        const toiSeconds = player.TimeOnIce ?? 0;
        const minutes = Math.floor(toiSeconds / 60);
        const seconds = toiSeconds % 60;
        const toi = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        return (
          <div
            key={index}
            className="grid grid-cols-10 gap-2 text-sm border-b py-1"
            style={{
              backgroundColor: index % 2 === 0 ? borderColor : "transparent",
            }}
          >
            <Text variant="xs" classes="col-span-3 text-left w-full">
              {player.Position ?? "N/A"} {player.FirstName ?? ""}{" "}
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
      })}
    </div>
  );
};

export const HKGameModalPBP = ({
  data,
  league,
  isPro,
  backgroundColor,
  borderColor,
}: GameModalPBPProps) => {
  return (
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
      {data.map((play, index) => {
        const nextPlay = data[index + 1];
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
            <Text variant="xs" classes="text-center" style={textColor}>
              {play.PlayNumber}
            </Text>
            <Text variant="xs" classes="text-center" style={textColor}>
              {play.Period}
            </Text>
            <Text variant="xs" classes="text-center" style={textColor}>
              {play.TimeOnClock}
            </Text>
            <Text variant="xs" classes="text-center" style={textColor}>
              {play.Event}
            </Text>
            <Text
              variant="xs"
              classes="col-span-2 text-center"
              style={textColor}
            >
              {play.Zone}
            </Text>
            <Text variant="xs" classes="col-span-4 text-left" style={textColor}>
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
  );
};
