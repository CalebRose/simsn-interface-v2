import { FC, useMemo } from "react";
import {
  League,
  SimCHL,
  SimPHL,
  SimCFB,
  SimNFL,
  SimCBB,
  USA,
  SimNBA,
} from "../../_constants/constants";
import {
  CollegePlayer as CHLPlayer,
  Croot as CHLCroot,
  ProfessionalPlayer as PHLPlayer,
} from "../../models/hockeyModels";
import {
  CollegePlayer as CFBPlayer,
  Croot as CFBCroot,
  NFLPlayer as NFLPlayer,
} from "../../models/footballModels";
import { Text } from "../../_design/Typography";
import { getLogo } from "../../_utility/getLogo";
import { useAuthStore } from "../../context/AuthContext";
import { Logo } from "../../_design/Logo";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import {
  getCBBOverall,
  getCFBOverall,
  getHockeyLetterGrade,
} from "../../_utility/getLetterGrade";
import {
  setPriorityCFBAttributes,
  setPriorityNFLAttributes,
  GetNFLYear,
  getAdditionalCBBAttributes,
  getPriorityCBBAttributes,
  getPriorityNBAAttributes,
  getPriorityCBBCrootAttributes,
} from "../Team/TeamPageUtils";
import { HeightToFeetAndInches } from "../../_utility/getHeightByFeetAndInches";
import { getYear } from "../../_utility/getYear";
import { CheckCircle, CrossCircle } from "../../_design/Icons";
import PlayerPicture from "../../_utility/usePlayerFaces";
import { GetNFLOverall } from "../Team/TeamPageUtils";
import {
  CollegePlayer as CBBPlayer,
  Croot,
  NBAPlayer,
} from "../../models/basketballModels";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { GetRecruitingTendency } from "../../_utility/getRecruitingTendency";
import { getDisplayStatus } from "../../_helper/recruitingHelper";

interface PlayerInfoModalBodyProps {
  league: League;
  player: any;
  contract?: any;
}

export const PlayerInfoModalBody: FC<PlayerInfoModalBodyProps> = ({
  player,
  league,
  contract,
}) => {
  if (league === SimCHL) {
    return <CHLPlayerInfoModalBody player={player as CHLPlayer} />;
  }
  if (league === SimPHL) {
    return (
      <PHLPlayerInfoModalBody
        player={player as PHLPlayer}
        contract={contract}
      />
    );
  }
  if (league === SimCFB) {
    return <CFBPlayerInfoModalBody player={player as CFBPlayer} />;
  }
  if (league === SimCBB) {
    return <CBBPlayerInfoModalBody player={player as CBBPlayer} />;
  }
  if (league === SimNBA) {
    return <NBAPlayerInfoModalBody player={player as NBAPlayer} />;
  }
  if (league === SimNFL) {
    return (
      <NFLPlayerInfoModalBody
        player={player as NFLPlayer}
        contract={contract}
      />
    );
  }
  return <>Unsupported League.</>;
};

interface CHLPlayerInfoModalBodyProps {
  player: CHLPlayer;
}

export const CHLPlayerInfoModalBody: FC<CHLPlayerInfoModalBodyProps> = ({
  player,
}) => {
  const { currentUser } = useAuthStore();
  const { chlTeamMap } = useSimHCKStore();
  const team = chlTeamMap[player.TeamID];
  const teamLogo = getLogo(SimCHL, player.TeamID, currentUser?.isRetro);
  const heightObj = HeightToFeetAndInches(player.Height);

  return (
    <div className="grid grid-cols-4 grid-rows-[auto auto auto auto] gap-4 w-full">
      <div className="row-span-3 flex flex-col items-center">
        <div className="flex items-center justify-center h-[6rem] w-[6rem] sm:h-[8rem] sm:w-[8rem] px-5 rounded-lg border-2 bg-white">
          <PlayerPicture playerID={player.ID} league={SimCHL} team={team} />
        </div>
        {team && (
          <Logo
            url={teamLogo}
            label={team.Abbreviation}
            classes="h-[5rem] max-h-[5rem]"
            containerClass="p-4"
            textClass="text-small"
          />
        )}
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Origin
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Country.length > 0 && `${player.Country}`}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Youth
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.HighSchool && player.HighSchool.trim() !== ""
            ? player.HighSchool
            : "Unknown"}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Age
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Age}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Height
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {heightObj.feet}'{heightObj.inches}"
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Weight
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Weight} lbs
        </Text>
      </div>
      <div className="flex flex-col items-center">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Personality
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Personality}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Overall
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {getHockeyLetterGrade(player.Overall, player.Year)}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Year
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {getYear(player.Year, player.IsRedshirt)}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Stars
        </Text>
        <Text variant="xs" classes="whitespace-nowrap pt-0.5">
          {player.Stars > 0
            ? Array(player.Stars).fill("⭐").join("")
            : player.Stars}
        </Text>
      </div>
      <div className="flex flex-wrap col-span-4 gap-3 border-t-[0.1em] pt-4">
        <div className="grid w-full grid-cols-4 gap-3">
          <div className="flex flex-col px-1 gap-1">
            <Text
              variant="small"
              classes="mb-1 whitespace-nowrap font-semibold"
            >
              Agility
            </Text>
            <Text variant="small">
              {getHockeyLetterGrade(player.Agility, player.Year)}
            </Text>
          </div>
          {player.Position !== "G" && (
            <>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Faceoffs
                </Text>
                <Text variant="small">
                  {getHockeyLetterGrade(player.Faceoffs, player.Year)}
                </Text>
              </div>
              <div className="flex flex-col gap-1 px-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Long Shot
                </Text>
                <div className="flex justify-around">
                  <div className="flex flex-col items-center justify-center align-center">
                    <Text variant="small">
                      {getHockeyLetterGrade(player.LongShotPower, player.Year)}
                    </Text>
                    <Text variant="xs">Pow</Text>
                  </div>
                  <div className="flex flex-col">
                    <Text variant="small">
                      {getHockeyLetterGrade(
                        player.LongShotAccuracy,
                        player.Year
                      )}
                    </Text>
                    <Text variant="xs">Acc</Text>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 px-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Close Shot
                </Text>
                <div className="flex justify-around">
                  <div className="flex flex-col items-center justify-center align-center">
                    <Text variant="small">
                      {getHockeyLetterGrade(player.CloseShotPower, player.Year)}
                    </Text>
                    <Text variant="xs">Pow</Text>
                  </div>
                  <div className="flex flex-col">
                    <Text variant="small">
                      {getHockeyLetterGrade(
                        player.CloseShotAccuracy,
                        player.Year
                      )}
                    </Text>
                    <Text variant="xs">Acc</Text>
                  </div>
                </div>
              </div>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Passing
                </Text>
                <Text variant="small">
                  {getHockeyLetterGrade(player.Passing, player.Year)}
                </Text>
              </div>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Puck Handling
                </Text>
                <Text variant="small">
                  {getHockeyLetterGrade(player.PuckHandling, player.Year)}
                </Text>
              </div>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Strength
                </Text>
                <Text variant="small">
                  {getHockeyLetterGrade(player.Strength, player.Year)}
                </Text>
              </div>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Body Checks
                </Text>
                <Text variant="small">
                  {getHockeyLetterGrade(player.BodyChecking, player.Year)}
                </Text>
              </div>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Stick Checks
                </Text>
                <Text variant="small">
                  {getHockeyLetterGrade(player.StickChecking, player.Year)}
                </Text>
              </div>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Shot Blocks
                </Text>
                <Text variant="small">
                  {getHockeyLetterGrade(player.ShotBlocking, player.Year)}
                </Text>
              </div>
            </>
          )}
          {player.Position === "G" && (
            <>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Strength
                </Text>
                <Text variant="small">
                  {getHockeyLetterGrade(player.Strength, player.Year)}
                </Text>
              </div>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Goalkeeping
                </Text>
                <Text variant="small">
                  {getHockeyLetterGrade(player.Goalkeeping, player.Year)}
                </Text>
              </div>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Goalie Vision
                </Text>
                <Text variant="small">
                  {getHockeyLetterGrade(player.GoalieVision, player.Year)}
                </Text>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface PHLPlayerInfoModalBodyProps {
  player: PHLPlayer;
  contract?: any;
}

export const PHLPlayerInfoModalBody: FC<PHLPlayerInfoModalBodyProps> = ({
  player,
  contract,
}) => {
  const { currentUser } = useAuthStore();
  const { phlTeamMap, chlTeamMap } = useSimHCKStore();
  const team = phlTeamMap[player.TeamID];
  const chlTeam = chlTeamMap[player.CollegeID];
  const teamLogo = getLogo(SimPHL, player.TeamID, currentUser?.isRetro);
  const heightObj = HeightToFeetAndInches(player.Height);
  let rawValue = 0;
  let totalValue = "";
  if (contract) {
    Array.from(
      { length: contract.ContractLength },
      (_, index) => contract[`Y${index + 1}BaseSalary`] || 0
    ).reduce((sum, salary) => sum + salary, 0);
    totalValue = `${rawValue.toFixed(2)}M`;
  }

  return (
    <div className="grid grid-cols-4 grid-rows-[auto auto auto auto] gap-4 w-full">
      <div className="row-span-3 flex flex-col items-center">
        <div className="flex items-center justify-center h-[6rem] w-[6rem] sm:h-[8rem] sm:w-[8rem] px-5 rounded-lg border-2 bg-white">
          <PlayerPicture playerID={player.ID} league={SimPHL} team={team} />
        </div>
        {team && (
          <Logo
            url={teamLogo}
            label={team.Abbreviation}
            classes="h-[5rem] max-h-[5rem]"
            containerClass="p-4"
            textClass="text-small"
          />
        )}
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Origin
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Country.length > 0 && `${player.Country}`}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Experience
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Year}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Age
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Age}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Height
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {heightObj.feet}'{heightObj.inches}"
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Weight
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Weight} lbs
        </Text>
      </div>
      <div className="flex flex-col items-center">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Personality
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Personality}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Overall
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Overall}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          College
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {chlTeam.Abbreviation}
        </Text>
      </div>
      <div className="flex flex-col items-center">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Drafted
        </Text>
        {player.DraftedRound === 0 && player.DraftedPick === 0 ? (
          <Text variant="small" classes="whitespace-nowrap">
            UDFA
          </Text>
        ) : (
          <>
            <Text variant="small" classes="whitespace-nowrap">
              Round {player.DraftedRound} - Pick {player.DraftedPick}
            </Text>
            <Text variant="xs" classes="whitespace-nowrap text-small">
              by {player.DraftedTeam}
            </Text>
          </>
        )}
      </div>
      {contract && (
        <>
          <div className="flex flex-col">
            <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
              Contract
            </Text>
            <Text variant="small" classes="whitespace-nowrap">
              {contract.ContractLength} years
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="body" classes="mb-1  font-semibold">
              Total Value
            </Text>
            <Text variant="small" classes="whitespace-nowrap">
              {totalValue}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="body" classes="mb-1 font-semibold">
              Current Year
            </Text>
            <Text variant="small" classes="whitespace-nowrap">
              {`${contract.Y1BaseSalary.toFixed(2)}M`}
            </Text>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-row w-full">
              <Text
                variant="body"
                classes="w-full mb-1 font-semibold text-center"
              >
                NTC
              </Text>
              <Text
                variant="body"
                classes="w-full mb-1 font-semibold text-center"
              >
                NMC
              </Text>
            </div>
            <div className="flex flex-row w-full">
              {contract.NoTradeClause ? (
                <CheckCircle textColorClass="w-full text-center text-green-500" />
              ) : (
                <CrossCircle textColorClass="w-full text-center text-red-500" />
              )}
              {contract.NoMovementClause ? (
                <CheckCircle textColorClass="w-full text-center text-green-500" />
              ) : (
                <CrossCircle textColorClass="w-full text-center text-red-500" />
              )}
            </div>
          </div>
        </>
      )}
      <div className="flex flex-wrap col-span-4 gap-3 border-t-[0.1em] pt-4">
        <div className="grid w-full grid-cols-4 gap-3">
          <div className="flex flex-col px-1 gap-1">
            <Text
              variant="small"
              classes="mb-1 whitespace-nowrap font-semibold"
            >
              Agility
            </Text>
            <Text variant="small">{player.Agility}</Text>
          </div>
          {player.Position !== "G" && (
            <>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Faceoffs
                </Text>
                <Text variant="small">{player.Faceoffs}</Text>
              </div>
              <div className="flex flex-col gap-1 px-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Long Shot
                </Text>
                <div className="flex justify-around">
                  <div className="flex flex-col items-center justify-center align-center">
                    <Text variant="small">{player.LongShotPower}</Text>
                    <Text variant="xs">Pow</Text>
                  </div>
                  <div className="flex flex-col">
                    <Text variant="small">{player.LongShotAccuracy}</Text>
                    <Text variant="xs">Acc</Text>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 px-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Close Shot
                </Text>
                <div className="flex justify-around">
                  <div className="flex flex-col items-center justify-center align-center">
                    <Text variant="small" classes="text-center">
                      {player.CloseShotPower}
                    </Text>
                    <Text variant="xs">Pow</Text>
                  </div>
                  <div className="flex flex-col">
                    <Text variant="small">{player.CloseShotAccuracy}</Text>
                    <Text variant="xs">Acc</Text>
                  </div>
                </div>
              </div>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Passing
                </Text>
                <Text variant="small">{player.Passing}</Text>
              </div>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Puck Handling
                </Text>
                <Text variant="small">{player.PuckHandling}</Text>
              </div>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Strength
                </Text>
                <Text variant="small">{player.Strength}</Text>
              </div>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Body Checks
                </Text>
                <Text variant="small">{player.BodyChecking}</Text>
              </div>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Stick Checks
                </Text>
                <Text variant="small">{player.StickChecking}</Text>
              </div>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Shot Blocks
                </Text>
                <Text variant="small">{player.ShotBlocking}</Text>
              </div>
            </>
          )}

          {player.Position === "G" && (
            <>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Strength
                </Text>
                <Text variant="small">{player.Strength}</Text>
              </div>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Goalkeeping
                </Text>
                <Text variant="small">{player.Goalkeeping}</Text>
              </div>
              <div className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  Goalie Vision
                </Text>
                <Text variant="small">{player.GoalieVision}</Text>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface CFBPlayerInfoModalBodyProps {
  player: CFBPlayer;
}

export const CFBPlayerInfoModalBody: FC<CFBPlayerInfoModalBodyProps> = ({
  player,
}) => {
  const { currentUser } = useAuthStore();
  const { cfbTeamMap } = useSimFBAStore();
  const team = cfbTeamMap ? cfbTeamMap[player.TeamID] : null;
  const teamLogo = getLogo(SimCFB, player.TeamID, currentUser?.isRetro);
  const heightObj = HeightToFeetAndInches(player.Height);
  const priorityAttributes = setPriorityCFBAttributes(player);

  return (
    <div className="grid grid-cols-4 grid-rows-[auto auto auto auto] gap-4 w-full">
      <div className="row-span-3 flex flex-col items-center">
        <div className="flex items-center justify-center h-[6rem] w-[6rem] sm:h-[8rem] sm:w-[8rem] px-5 rounded-lg border-2 bg-white">
          <PlayerPicture playerID={player.ID} league={SimCFB} team={team} />
        </div>
        {team && (
          <Logo
            url={teamLogo}
            label={team.TeamAbbr}
            classes="h-[5rem] max-h-[5rem]"
            containerClass="p-4"
            textClass="text-small"
          />
        )}
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Hometown
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.City.length > 0 && `${player.City}, ${player.State}`}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Year
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {getYear(player.Year, player.IsRedshirt)}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Age
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Age}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Height
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {heightObj.feet}'{heightObj.inches}"
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Weight
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Weight} lbs
        </Text>
      </div>
      <div className="flex flex-col items-center">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Personality
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Personality}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Overall
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {getCFBOverall(player.Overall, player.Year)}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Potential
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.PotentialGrade}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Stars
        </Text>
        <Text variant="xs" classes="whitespace-nowrap pt-0.5">
          {player.Stars > 0
            ? Array(player.Stars).fill("⭐").join("")
            : player.Stars}
        </Text>
      </div>
      <div className="flex flex-wrap col-span-4 gap-3 border-t-[0.1em] pt-4">
        <div className="grid w-full grid-cols-4 gap-3">
          {priorityAttributes.map((attr, idx) => (
            <div key={idx} className="flex flex-col px-1 gap-1">
              <Text
                variant="small"
                classes="mb-1 whitespace-nowrap font-semibold"
              >
                {attr.Name}
              </Text>
              <Text variant="small">{attr.Letter}</Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface NFLPlayerInfoModalBodyProps {
  player: NFLPlayer;
  contract: any;
}

export const NFLPlayerInfoModalBody: FC<NFLPlayerInfoModalBodyProps> = ({
  player,
  contract,
}) => {
  const { currentUser } = useAuthStore();
  const { proTeamMap: nflTeamMap, cfbTeamMap } = useSimFBAStore();
  const team = nflTeamMap ? nflTeamMap[player.TeamID] : null;
  const teamLogo = getLogo(SimNFL, player.TeamID, currentUser?.isRetro);
  const cfbTeam = cfbTeamMap?.[player.CollegeID];
  const heightObj = HeightToFeetAndInches(player.Height);
  const priorityAttributes = setPriorityNFLAttributes(
    player,
    player.ShowLetterGrade
  );
  const rawValue = useMemo(() => {
    if (!contract) return 0;
    return Array.from(
      { length: contract.ContractLength },
      (_, index) =>
        (contract[`Y${index + 1}BaseSalary`] || 0) +
        (contract[`Y${index + 1}Bonus`] || 0)
    ).reduce((sum, salary) => sum + salary, 0);
  }, [contract]);
  const currentYearValue = useMemo(() => {
    if (!contract) return 0;
    return ((contract.Y1BaseSalary || 0) + (contract.Y1Bonus || 0)).toFixed(2);
  }, [contract]);

  const totalValue = `${rawValue.toFixed(2)}`;
  return (
    <div className="grid grid-cols-4 grid-rows-[auto auto auto auto] gap-4 w-full">
      <div className="row-span-3 flex flex-col items-center">
        <div className="flex items-center justify-center h-[6rem] w-[6rem] sm:h-[8rem] sm:w-[8rem] px-5 rounded-lg border-2 bg-white">
          <PlayerPicture playerID={player.ID} league={SimNFL} team={team} />
        </div>
        {team && (
          <Logo
            url={teamLogo}
            label={team.TeamAbbr}
            classes="h-[5rem] max-h-[5rem]"
            containerClass="p-4"
            textClass="text-small"
          />
        )}
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Hometown
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Hometown.length > 0 && `${player.Hometown}, ${player.State}`}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Experience
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {GetNFLYear(player.Experience)}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Age
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Age}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Height
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {heightObj.feet}'{heightObj.inches}"
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Weight
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Weight} lbs
        </Text>
      </div>
      <div className="flex flex-col items-center">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Personality
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Personality}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Overall
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.ShowLetterGrade
            ? GetNFLOverall(player.Overall, player.ShowLetterGrade)
            : player.Overall}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Potential
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.PotentialGrade}
        </Text>
      </div>
      <div className="flex flex-col items-center">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Drafted
        </Text>
        {player.DraftedRound === 0 && player.DraftedPick === 0 ? (
          <Text variant="small" classes="whitespace-nowrap">
            UDFA
          </Text>
        ) : (
          <>
            <Text variant="small" classes="whitespace-nowrap">
              Round {player.DraftedRound} - Pick {player.DraftedPick}
            </Text>
            <Text variant="xs" classes="whitespace-nowrap text-small">
              by {player.DraftedTeam}
            </Text>
          </>
        )}
        {cfbTeam && (
          <Text variant="xs" classes="whitespace-nowrap text-small">
            from {cfbTeam?.TeamAbbr}
          </Text>
        )}
      </div>
      {contract && (
        <>
          <div className="flex flex-col">
            <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
              Contract
            </Text>
            <Text variant="small" classes="whitespace-nowrap">
              {contract.ContractLength} years
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="body" classes="mb-1  font-semibold">
              Total Value
            </Text>
            <Text variant="small" classes="whitespace-nowrap">
              {`${totalValue}M`}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="body" classes="mb-1 font-semibold">
              Current Year
            </Text>
            <Text variant="small" classes="whitespace-nowrap">
              {`${currentYearValue}M`}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="body" classes="mb-1 font-semibold">
              Bonus (p.a)
            </Text>
            <Text variant="small" classes="whitespace-nowrap">
              {`${contract.Y1Bonus.toFixed(2)}M`}
            </Text>
          </div>
        </>
      )}
      <div className="flex flex-wrap col-span-4 gap-3 border-t-[0.1em] pt-4">
        <div className="grid w-full grid-cols-4 gap-3">
          {priorityAttributes.map((attr, idx) => (
            <div key={idx} className="flex flex-col px-1 gap-1">
              <Text
                variant="small"
                classes="mb-1 whitespace-nowrap font-semibold"
              >
                {attr.Name}
              </Text>
              <Text variant="small">{attr.Value}</Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface NFLDepthChartInfoModalBodyProps {
  player: NFLPlayer;
}

export const NFLDepthChartInfoModalBody: FC<
  NFLDepthChartInfoModalBodyProps
> = ({ player }) => {
  const { currentUser } = useAuthStore();
  const { proTeamMap: nflTeamMap, cfbTeamMap } = useSimFBAStore();
  const team = nflTeamMap ? nflTeamMap[player.TeamID] : null;
  const teamLogo = getLogo(SimNFL, player.TeamID, currentUser?.isRetro);
  const cfbTeam = cfbTeamMap?.[player.CollegeID];
  const heightObj = HeightToFeetAndInches(player.Height);
  const priorityAttributes = setPriorityNFLAttributes(
    player,
    player.ShowLetterGrade
  );

  return (
    <div className="grid grid-cols-4 grid-rows-[auto auto auto auto] gap-4 w-full">
      <div className="row-span-3 flex flex-col items-center">
        <div className="flex items-center justify-center h-[6rem] w-[6rem] sm:h-[8rem] sm:w-[8rem] px-5 rounded-lg border-2 bg-white">
          <PlayerPicture playerID={player.ID} league={SimNFL} team={team} />
        </div>
        {team && (
          <Logo
            url={teamLogo}
            label={team.TeamAbbr}
            classes="h-[5rem] max-h-[5rem]"
            containerClass="p-4"
            textClass="text-small"
          />
        )}
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Hometown
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Hometown.length > 0 && `${player.Hometown}, ${player.State}`}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Experience
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {GetNFLYear(player.Experience)}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Age
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Age}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Height
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {heightObj.feet}'{heightObj.inches}"
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Weight
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Weight} lbs
        </Text>
      </div>
      <div className="flex flex-col items-center">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Personality
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Personality}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Overall
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.ShowLetterGrade
            ? GetNFLOverall(player.Overall, player.ShowLetterGrade)
            : player.Overall}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          College
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {cfbTeam?.TeamAbbr}
        </Text>
      </div>
      <div className="flex flex-col items-center">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Drafted
        </Text>
        {player.DraftedRound === 0 && player.DraftedPick === 0 ? (
          <Text variant="small" classes="whitespace-nowrap">
            UDFA
          </Text>
        ) : (
          <>
            <Text variant="small" classes="whitespace-nowrap">
              Round {player.DraftedRound} - Pick {player.DraftedPick}
            </Text>
            <Text variant="xs" classes="whitespace-nowrap text-small">
              by {player.DraftedTeam}
            </Text>
          </>
        )}
      </div>
      <div className="flex flex-wrap col-span-4 gap-3 border-t-[0.1em] pt-4">
        <div className="grid w-full grid-cols-4 gap-3">
          {priorityAttributes.map((attr, idx) => (
            <div key={idx} className="flex flex-col px-1 gap-1">
              <Text
                variant="small"
                classes="mb-1 whitespace-nowrap font-semibold"
              >
                {attr.Name}
              </Text>
              <Text variant="small">{attr.Value}</Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const RecruitInfoModalBody: FC<PlayerInfoModalBodyProps> = ({
  player,
  league,
}) => {
  if (league === SimCHL) {
    return <CHLCrootInfoModalBody player={player as CHLCroot} />;
  }
  if (league === SimCFB) {
    return <CFBCrootInfoModalBody player={player as CFBCroot} />;
  }
  if (league === SimCBB) {
    return <CBBCrootInfoModalBody player={player as Croot} />;
  }

  return <>Unsupported League.</>;
};

interface CHLCrootInfoModalBodyProps {
  player: CHLCroot;
}

export const CHLCrootInfoModalBody: FC<CHLCrootInfoModalBodyProps> = ({
  player,
}) => {
  const { currentUser } = useAuthStore();
  const { chlTeamMap } = useSimHCKStore();
  const team = chlTeamMap[player.TeamID];
  const teamLogo = getLogo(SimCHL, player.TeamID, currentUser?.isRetro);
  const heightObj = HeightToFeetAndInches(player.Height);
  const tendency = GetRecruitingTendency(player.RecruitModifier);
  const hasSigned = player.TeamID > 0;

  return (
    <div className="overflow-y-auto">
      <div className="w-full grid grid-cols-[1fr__3fr] gap-2">
        <div className="flex flex-col items-center px-1">
          <div
            className={`flex my-1 items-center justify-center 
                         px-3 h-[3rem] min-h-[3rem] sm:w-[5rem] sm:max-w-[5rem] sm:h-[5rem] rounded-lg border-2`}
            style={{ backgroundColor: "white" }}
          >
            <PlayerPicture playerID={player.ID} league={SimCHL} team={team} />
          </div>
          {team && player.IsSigned && (
            <Logo
              url={teamLogo}
              label={team.Abbreviation}
              classes="h-[5rem] max-h-[5rem]"
              containerClass="p-4"
              textClass="text-small"
            />
          )}
        </div>
        <div className="flex flex-col px-1 mb-2">
          <div className="grid grid-cols-3 gap-y-4">
            <div className="flex flex-col">
              <Text variant="h6" classes="mb-1 whitespace-nowrap">
                Origin
              </Text>
              <Text variant="body-small" classes="whitespace-nowrap">
                {player.Country.length > 0 && `${player.Country}`}
              </Text>
            </div>
            <div className="flex flex-col">
              <Text variant="h6" classes="mb-1 whitespace-nowrap">
                Youth
              </Text>
              <Text variant="xs" classes="">
                {player.HighSchool && player.HighSchool.trim() !== ""
                  ? player.HighSchool
                  : "Unknown"}
              </Text>
            </div>
            <div className="flex flex-col">
              <Text variant="h6" classes="mb-1 whitespace-nowrap">
                Height
              </Text>
              <Text variant="body-small" classes="whitespace-nowrap">
                {heightObj.feet}'{heightObj.inches}"
              </Text>
            </div>
            <div className="flex flex-col">
              <Text variant="h6" classes="mb-1 whitespace-nowrap">
                Weight
              </Text>
              <Text variant="body-small" classes="whitespace-nowrap">
                {player.Weight} lbs
              </Text>
            </div>
            <div className="flex flex-col">
              <Text classes="font-semibold mb-1 whitespace-nowrap">
                Expectation
              </Text>
              <Text variant="xs" classes="whitespace-nowrap pt-0.5">
                {tendency}
              </Text>
            </div>
            <div className="flex flex-col">
              <Text variant="h6" classes="mb-1 whitespace-nowrap">
                Overall
              </Text>
              <Text variant="body-small" classes="whitespace-nowrap">
                {player.OverallGrade}
              </Text>
            </div>
            <div className="flex flex-col">
              <Text variant="h6" classes="mb-1 whitespace-nowrap">
                Personality
              </Text>
              <Text variant="body-small" classes="whitespace-nowrap">
                {player.Personality}
              </Text>
            </div>
            <div className="flex flex-col pb-2">
              <Text variant="h6" classes="mb-1 whitespace-nowrap">
                Stars
              </Text>
              <Text variant="xs" classes="whitespace-nowrap pt-0.5">
                {player.Stars > 0
                  ? Array(player.Stars).fill("⭐").join("")
                  : player.Stars}
              </Text>
            </div>
            {player.IsCustomCroot && (
              <div className="flex flex-col">
                <Text classes="font-semibold mb-1 whitespace-nowrap">
                  Croot By
                </Text>
                <Text variant="xs" classes="whitespace-nowrap pt-0.5">
                  {player.CustomCrootFor}
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>
      {player.LeadingTeams && (
        <>
          <div className="w-full border-t-[0.1em] justify-center mb-2">
            <Text variant="h6">Leading Teams</Text>
          </div>
          <div
            className={`w-full grid grid-cols-${hasSigned ? "4" : "3"} mb-1`}
          >
            <Text variant="body-small" classes="font-semibold">
              Team
            </Text>
            <Text variant="body-small" classes="font-semibold">
              Scholarship
            </Text>
            <Text variant="body-small" classes="font-semibold">
              {hasSigned ? "Results" : "Prediction"}
            </Text>
            {hasSigned && (
              <Text variant="body-small" classes="font-semibold">
                Odds
              </Text>
            )}
          </div>
          <div
            className={`w-full max-h-[8rem] overflow-y-auto grid grid-cols-${
              hasSigned ? "4" : "3"
            } gap-y-2 mb-2`}
          >
            {player.LeadingTeams.map((contender) => {
              const logo = getLogo(SimCHL, contender.TeamID, false);
              const team = chlTeamMap[contender.TeamID];
              const fullOdds = Math.round(contender.Odds * 100);
              const displayStatus = getDisplayStatus(fullOdds);
              return (
                <>
                  <div className="flex flex-row justify-start px-2">
                    <Logo url={logo} variant="tiny" />{" "}
                    <span className="ms-4 font-semibold text-xs">
                      {team.TeamName}
                    </span>
                  </div>

                  <Text variant="xs" classes="font-semibold">
                    {contender.HasScholarship ? "Yes" : "No"}
                  </Text>
                  <Text variant="xs" classes="font-semibold">
                    {contender.TeamID === player.TeamID
                      ? "Committed!"
                      : displayStatus}
                  </Text>
                  {hasSigned && (
                    <Text variant="xs" classes="font-semibold">
                      {fullOdds}%
                    </Text>
                  )}
                </>
              );
            })}
          </div>
        </>
      )}
      <div className="w-full border-t-[0.1em]">
        <div className="flex flex-wrap col-span-4 gap-3 pt-2">
          <div className="grid grid-cols-4 gap-3">
            <div className="flex flex-col px-1 gap-1">
              <Text
                variant="body-small"
                classes="mb-1 whitespace-nowrap font-semibold"
              >
                Agility
              </Text>
              <Text variant="small">
                {getHockeyLetterGrade(player.Agility, 1)}
              </Text>
            </div>
            {player.Position !== "G" && (
              <>
                <div className="flex flex-col px-1 gap-1">
                  <Text
                    variant="body-small"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Faceoffs
                  </Text>
                  <Text variant="small">
                    {getHockeyLetterGrade(player.Faceoffs, 1)}
                  </Text>
                </div>
                <div className="flex flex-col gap-1 px-1">
                  <Text
                    variant="body-small"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Long Shot
                  </Text>
                  <div className="flex justify-around">
                    <div className="flex flex-col items-center justify-center align-center">
                      <Text variant="small">
                        {getHockeyLetterGrade(player.LongShotPower, 1)}
                      </Text>
                      <Text variant="xs">Pow</Text>
                    </div>
                    <div className="flex flex-col">
                      <Text variant="small">
                        {getHockeyLetterGrade(player.LongShotAccuracy, 1)}
                      </Text>
                      <Text variant="xs">Acc</Text>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 px-1">
                  <Text
                    variant="body-small"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Close Shot
                  </Text>
                  <div className="flex justify-around">
                    <div className="flex flex-col items-center justify-center align-center">
                      <Text variant="small" classes="text-center">
                        {getHockeyLetterGrade(player.CloseShotPower, 1)}
                      </Text>
                      <Text variant="xs">Pow</Text>
                    </div>
                    <div className="flex flex-col">
                      <Text variant="small">
                        {getHockeyLetterGrade(player.CloseShotAccuracy, 1)}
                      </Text>
                      <Text variant="xs">Acc</Text>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col px-1 gap-1">
                  <Text
                    variant="body-small"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Passing
                  </Text>
                  <Text variant="small">
                    {getHockeyLetterGrade(player.Passing, 1)}
                  </Text>
                </div>
                <div className="flex flex-col px-1 gap-1">
                  <Text
                    variant="body-small"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Puck Handling
                  </Text>
                  <Text variant="small">
                    {getHockeyLetterGrade(player.PuckHandling, 1)}
                  </Text>
                </div>
              </>
            )}
            <div className="flex flex-col px-1 gap-1">
              <Text
                variant="body-small"
                classes="mb-1 whitespace-nowrap font-semibold"
              >
                Strength
              </Text>
              <Text variant="small">
                {getHockeyLetterGrade(player.Strength, 1)}
              </Text>
            </div>
            {player.Position !== "G" && (
              <>
                <div className="flex flex-col px-1 gap-1">
                  <Text
                    variant="body-small"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Body Checks
                  </Text>
                  <Text variant="small">
                    {getHockeyLetterGrade(player.BodyChecking, 1)}
                  </Text>
                </div>
                <div className="flex flex-col px-1 gap-1">
                  <Text
                    variant="body-small"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Stick Checks
                  </Text>
                  <Text variant="small">
                    {getHockeyLetterGrade(player.StickChecking, 1)}
                  </Text>
                </div>
                <div className="flex flex-col px-1 gap-1">
                  <Text
                    variant="body-small"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Shot Blocks
                  </Text>
                  <Text variant="small">
                    {getHockeyLetterGrade(player.ShotBlocking, 1)}
                  </Text>
                </div>
              </>
            )}

            {player.Position === "G" && (
              <>
                <div className="flex flex-col px-1 gap-1">
                  <Text
                    variant="body-small"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Goalkeeping
                  </Text>
                  <Text variant="small">
                    {getHockeyLetterGrade(player.Goalkeeping, 1)}
                  </Text>
                </div>
                <div className="flex flex-col px-1 gap-1">
                  <Text
                    variant="body-small"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Goalie Vision
                  </Text>
                  <Text variant="small">
                    {getHockeyLetterGrade(player.GoalieVision, 1)}
                  </Text>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface CFBCrootInfoModalBodyProps {
  player: CFBCroot;
}

export const CFBCrootInfoModalBody: FC<CFBCrootInfoModalBodyProps> = ({
  player,
}) => {
  const { currentUser } = useAuthStore();
  const { cfbTeamMap } = useSimFBAStore();
  const team = cfbTeamMap![player.TeamID];
  const teamLogo = getLogo(SimCFB, player.TeamID, currentUser?.isRetro);
  const heightObj = HeightToFeetAndInches(player.Height);
  const tendency = GetRecruitingTendency(player.RecruitModifier);
  const hasSigned = player.TeamID > 0;

  return (
    <div className="overflow-y-auto">
      <div className="w-full grid grid-cols-[1fr__3fr] gap-2">
        <div className="flex flex-col items-center px-1">
          <div
            className={`flex my-1 items-center justify-center 
          px-3 h-[3rem] min-h-[3rem] sm:w-[5rem] sm:max-w-[5rem] sm:h-[5rem] rounded-lg border-2`}
            style={{ backgroundColor: "white" }}
          >
            <PlayerPicture playerID={player.ID} league={SimCFB} team={team} />
          </div>
          {team && player.IsSigned && (
            <Logo
              url={teamLogo}
              label={team.TeamAbbr}
              classes="h-[5rem] max-h-[5rem]"
              containerClass="p-4"
              textClass="text-small"
            />
          )}
        </div>
        <div className="flex flex-col px-1">
          <div className="grid grid-cols-3 gap-y-4">
            <div className="flex flex-col">
              <Text variant="h6" classes="mb-1 whitespace-nowrap">
                Youth
              </Text>
              <Text variant="body-small" classes="">
                {player.HighSchool && player.HighSchool.trim() !== ""
                  ? player.HighSchool
                  : "Unknown"}
              </Text>
            </div>
            <div className="flex flex-col">
              <Text variant="h6" classes="mb-1 whitespace-nowrap">
                City
              </Text>
              <Text variant="body-small" classes="">
                {player.City && player.HighSchool.trim() !== ""
                  ? player.City
                  : "Unknown"}
              </Text>
            </div>
            <div className="flex flex-col">
              <Text variant="h6" classes="whitespace-nowrap">
                State
              </Text>
              <Text variant="body-small" classes="whitespace-nowrap">
                {player.State}
              </Text>
            </div>
            <div className="flex flex-col">
              <Text variant="h6" classes="mb-1 whitespace-nowrap">
                Height
              </Text>
              <Text variant="body-small" classes="whitespace-nowrap">
                {heightObj.feet}'{heightObj.inches}"
              </Text>
            </div>
            <div className="flex flex-col">
              <Text variant="h6" classes="mb-1 whitespace-nowrap">
                Weight
              </Text>
              <Text variant="body-small" classes="whitespace-nowrap">
                {player.Weight} lbs
              </Text>
            </div>
            <div className="flex flex-col">
              <Text classes="font-semibold mb-1 whitespace-nowrap">
                Expectation
              </Text>
              <Text variant="xs" classes="whitespace-nowrap pt-0.5">
                {tendency}
              </Text>
            </div>
            <div className="flex flex-col">
              <Text variant="h6" classes="mb-1 whitespace-nowrap">
                Overall
              </Text>
              <Text variant="body-small" classes="whitespace-nowrap">
                {player.OverallGrade}
              </Text>
            </div>
            <div className="flex flex-col">
              <Text variant="h6" classes="mb-1 whitespace-nowrap">
                Potential
              </Text>
              <Text variant="body-small" classes="whitespace-nowrap">
                {player.PotentialGrade}
              </Text>
            </div>
            <div className="flex flex-col">
              <Text variant="h6" classes="mb-1 whitespace-nowrap">
                Stars
              </Text>
              <Text variant="xs" classes="whitespace-nowrap pt-0.5">
                {player.Stars > 0
                  ? Array(player.Stars).fill("⭐").join("")
                  : player.Stars}
              </Text>
            </div>
            <div className="flex flex-col">
              <Text variant="h6" classes="mb-1 whitespace-nowrap">
                Personality
              </Text>
              <Text variant="body-small" classes="whitespace-nowrap">
                {player.Personality}
              </Text>
            </div>
            <div className="flex flex-col">
              <Text variant="h6" classes="mb-1 whitespace-nowrap">
                Bias
              </Text>
              <Text variant="xs" classes="mt-1 whitespace-nowrap">
                {player.RecruitingBias}
              </Text>
            </div>
            {player.IsCustomCroot && (
              <div className="flex flex-col">
                <Text classes="font-semibold mb-1 whitespace-nowrap">
                  Croot By
                </Text>
                <Text variant="xs" classes="whitespace-nowrap pt-0.5">
                  {player.CustomCrootFor}
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>
      {player.LeadingTeams && (
        <>
          <div className="w-full mt-2 justify-center border-t-[0.1em]">
            <Text variant="h6">Leading Teams</Text>
          </div>
          <div className={`w-full grid grid-cols-${hasSigned ? "4" : "3"}`}>
            <Text variant="body" classes="font-semibold">
              Team
            </Text>
            <Text variant="body" classes="font-semibold">
              Scholarship
            </Text>
            <Text variant="body" classes="font-semibold">
              {hasSigned ? "Results" : "Prediction"}
            </Text>
            {hasSigned && (
              <Text variant="body" classes="font-semibold">
                Odds
              </Text>
            )}
          </div>
          <div
            className={`w-full grid grid-cols-${hasSigned ? "4" : "3"} gap-y-2`}
          >
            {player.LeadingTeams &&
              player.LeadingTeams.map((team) => {
                const logo = getLogo(SimCFB, team.TeamID, false);
                const fullOdds = Math.round(team.Odds * 100);
                const displayStatus = getDisplayStatus(fullOdds);
                return (
                  <>
                    <div className="flex flex-row justify-center">
                      <Logo url={logo} variant="tiny" />{" "}
                      <span className="ms-4 font-semibold">
                        {team.TeamAbbr}
                      </span>
                    </div>

                    <Text variant="body-small" classes="font-semibold">
                      {team.HasScholarship ? "Yes" : "No"}
                    </Text>
                    <Text variant="body-small" classes="font-semibold">
                      {team.TeamID === player.TeamID
                        ? "Committed!"
                        : displayStatus}
                    </Text>
                    {hasSigned && (
                      <Text variant="body-small" classes="font-semibold">
                        {fullOdds}%
                      </Text>
                    )}
                  </>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
};

interface CBBCrootInfoModalBodyProps {
  player: Croot;
}

export const CBBCrootInfoModalBody: FC<CBBCrootInfoModalBodyProps> = ({
  player,
}) => {
  const { currentUser } = useAuthStore();
  const { cbbTeamMap } = useSimBBAStore();
  const team = cbbTeamMap ? cbbTeamMap[player.TeamID] : null;
  const teamLogo = getLogo(SimCBB, player.TeamID, currentUser?.isRetro);
  const priorityAttributes = getPriorityCBBCrootAttributes(player);
  const hasSigned = player.TeamID > 0;
  return (
    <>
      <div className="grid grid-cols-4 grid-rows-[auto auto auto auto] gap-4 w-full mb-2">
        <div className="row-span-3 flex flex-col items-center">
          <div className="flex items-center justify-center h-[6rem] w-[6rem] sm:h-[8rem] sm:w-[8rem] px-5 rounded-lg border-2 bg-white">
            <PlayerPicture playerID={player.ID} league={SimCBB} team={team} />
          </div>
          {team && (
            <Logo
              url={teamLogo}
              label={team.Team}
              classes="h-[5rem] max-h-[5rem]"
              containerClass="p-4"
              textClass="text-small"
            />
          )}
        </div>
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Hometown
          </Text>
          <Text variant="small" classes="whitespace-nowrap">
            {player.Country.length > 0 && player.Country !== USA
              ? `${player.Country}`
              : player.State}
          </Text>
        </div>
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Age
          </Text>
          <Text variant="small" classes="whitespace-nowrap">
            18
          </Text>
        </div>
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Height
          </Text>
          <Text variant="small" classes="whitespace-nowrap">
            {player.Height}
          </Text>
        </div>
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Weight
          </Text>
          <Text variant="small" classes="whitespace-nowrap">
            ???
          </Text>
        </div>
        <div className="flex flex-col items-center">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Personality
          </Text>
          <Text variant="small" classes="whitespace-nowrap">
            {player.Personality}
          </Text>
        </div>
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Overall
          </Text>
          <Text variant="small" classes="whitespace-nowrap">
            {player.OverallGrade}
          </Text>
        </div>
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Potential
          </Text>
          <Text variant="small" classes="whitespace-nowrap">
            {player.PotentialGrade}
          </Text>
        </div>
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Stars
          </Text>
          <Text variant="xs" classes="whitespace-nowrap pt-0.5">
            {player.Stars > 0
              ? Array(player.Stars).fill("⭐").join("")
              : player.Stars}
          </Text>
        </div>
        <div className="flex flex-wrap col-span-4 gap-3 border-t-[0.1em] pt-4">
          <div className="grid w-full grid-cols-4 gap-3">
            {priorityAttributes.map((attr, idx) => (
              <div key={idx} className="flex flex-col px-1 gap-1">
                <Text
                  variant="small"
                  classes="mb-1 whitespace-nowrap font-semibold"
                >
                  {attr.label}
                </Text>
                <Text variant="small">{attr.value}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>
      {player.LeadingTeams && (
        <>
          <div className="w-full mt-2 justify-center border-t-[0.1em]">
            <Text variant="h6">Leading Teams</Text>
          </div>
          <div className={`w-full grid grid-cols-${hasSigned ? "4" : "3"}`}>
            <Text variant="body" classes="font-semibold">
              Team
            </Text>
            <Text variant="body" classes="font-semibold">
              Scholarship
            </Text>
            <Text variant="body" classes="font-semibold">
              {hasSigned ? "Results" : "Prediction"}
            </Text>
            {hasSigned && (
              <Text variant="body" classes="font-semibold">
                Odds
              </Text>
            )}
          </div>
          <div
            className={`w-full grid grid-cols-${
              hasSigned ? "4" : "3"
            } gap-y-2 overflow-y-auto max-h-[10rem] lg:max-h-[15rem]`}
          >
            {player.LeadingTeams &&
              player.LeadingTeams.map((team) => {
                const logo = getLogo(SimCBB, team.TeamID, false);
                const fullOdds = Math.round(team.Odds * 100);
                const displayStatus = getDisplayStatus(fullOdds);
                return (
                  <>
                    <div className="flex flex-row justify-center">
                      <Logo url={logo} variant="tiny" />{" "}
                      <span className="ms-4 font-semibold">
                        {team.TeamAbbr}
                      </span>
                    </div>

                    <Text variant="body-small" classes="font-semibold">
                      {team.Scholarship ? "Yes" : "No"}
                    </Text>
                    <Text variant="body-small" classes="font-semibold">
                      {team.TeamID === player.TeamID
                        ? "Committed!"
                        : displayStatus}
                    </Text>
                    {hasSigned && (
                      <Text variant="body-small" classes="font-semibold">
                        {fullOdds}%
                      </Text>
                    )}
                  </>
                );
              })}
          </div>
        </>
      )}
    </>
  );
};

interface CBBPlayerInfoModalBodyProps {
  player: CBBPlayer;
}

export const CBBPlayerInfoModalBody: FC<CBBPlayerInfoModalBodyProps> = ({
  player,
}) => {
  const { currentUser } = useAuthStore();
  const { cbbTeamMap } = useSimBBAStore();
  const team = cbbTeamMap ? cbbTeamMap[player.TeamID] : null;
  const teamLogo = getLogo(SimCBB, player.TeamID, currentUser?.isRetro);
  const priorityAttributes = getPriorityCBBAttributes(player);

  return (
    <div className="grid grid-cols-4 grid-rows-[auto auto auto auto] gap-4 w-full">
      <div className="row-span-3 flex flex-col items-center">
        <div className="flex items-center justify-center h-[6rem] w-[6rem] sm:h-[8rem] sm:w-[8rem] px-5 rounded-lg border-2 bg-white">
          <PlayerPicture playerID={player.ID} league={SimCBB} team={team} />
        </div>
        {team && (
          <Logo
            url={teamLogo}
            label={team.Team}
            classes="h-[5rem] max-h-[5rem]"
            containerClass="p-4"
            textClass="text-small"
          />
        )}
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Hometown
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Country.length > 0 && player.Country !== USA
            ? `${player.Country}`
            : player.State}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Year
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {getYear(player.Year, player.IsRedshirt)}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Age
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Age}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Height
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Height}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Weight
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          ???
        </Text>
      </div>
      <div className="flex flex-col items-center">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Personality
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Personality}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Overall
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {getCBBOverall(player.Overall, player.Year)}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Potential
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.PotentialGrade}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Stars
        </Text>
        <Text variant="xs" classes="whitespace-nowrap pt-0.5">
          {player.Stars > 0
            ? Array(player.Stars).fill("⭐").join("")
            : player.Stars}
        </Text>
      </div>
      <div className="flex flex-wrap col-span-4 gap-3 border-t-[0.1em] pt-4">
        <div className="grid w-full grid-cols-4 gap-3">
          {priorityAttributes.map((attr, idx) => (
            <div key={idx} className="flex flex-col px-1 gap-1">
              <Text
                variant="small"
                classes="mb-1 whitespace-nowrap font-semibold"
              >
                {attr.label}
              </Text>
              <Text variant="small">{attr.value}</Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface NBAPlayerInfoModalBodyProps {
  player: NBAPlayer;
}

export const NBAPlayerInfoModalBody: FC<NBAPlayerInfoModalBodyProps> = ({
  player,
}) => {
  const { currentUser } = useAuthStore();
  const { nbaTeamMap, proContractMap, cbbTeamMap } = useSimBBAStore();
  const team = nbaTeamMap ? nbaTeamMap[player.TeamID] : null;
  const teamLogo = getLogo(SimNBA, player.TeamID, currentUser?.isRetro);
  const cbbTeam = player.IsIntGenerated
    ? nbaTeamMap!![player.CollegeID]
    : cbbTeamMap?.[player.CollegeID];

  const contract = proContractMap!![player.ID];
  player.Contract = contract;
  const priorityAttributes = getPriorityNBAAttributes(player);
  const rawValue = Array.from(
    { length: contract.YearsRemaining },
    (_, index) => contract[`Year${index + 1}Total`] || 0
  ).reduce((sum, salary) => sum + salary, 0);
  const currentYearValue = (contract.Year1Total || 0).toFixed(2);
  const totalValue = `${rawValue.toFixed(2)}`;
  return (
    <div className="grid grid-cols-4 grid-rows-[auto auto auto auto] gap-4 w-full">
      <div className="row-span-3 flex flex-col items-center">
        <div className="flex items-center justify-center h-[6rem] w-[6rem] sm:h-[8rem] sm:w-[8rem] px-5 rounded-lg border-2 bg-white">
          <PlayerPicture playerID={player.ID} league={SimNBA} team={team} />
        </div>
        {team && (
          <Logo
            url={teamLogo}
            label={team.Abbr}
            classes="h-[5rem] max-h-[5rem]"
            containerClass="p-4"
            textClass="text-small"
          />
        )}
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Hometown
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Country !== USA ? player.Country : player.State}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Experience
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Year}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Age
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Age}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Height
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Height}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Weight
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          ???
        </Text>
      </div>
      <div className="flex flex-col items-center">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Personality
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Personality}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Overall
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {player.Overall}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          College
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {cbbTeam?.Abbr}
        </Text>
      </div>
      <div className="flex flex-col items-center">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Drafted
        </Text>
        {player.DraftedRound === 0 && player.DraftPickID === 0 ? (
          <Text variant="small" classes="whitespace-nowrap">
            UDFA
          </Text>
        ) : (
          <>
            <Text variant="small" classes="whitespace-nowrap">
              Round {player.DraftedRound} - Pick {player.DraftPick}
            </Text>
            <Text variant="xs" classes="whitespace-nowrap text-small">
              by {player.DraftedTeamAbbr}
            </Text>
          </>
        )}
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          Contract
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {contract.ContractLength} years
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1  font-semibold">
          Total Value
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {`${totalValue}M`}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 font-semibold">
          Current Year
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {`${currentYearValue}M`}
        </Text>
      </div>
      <div className="flex flex-wrap col-span-4 gap-3 border-t-[0.1em] pt-4">
        <div className="grid w-full grid-cols-4 gap-3">
          {priorityAttributes.map((attr, idx) => (
            <div key={idx} className="flex flex-col px-1 gap-1">
              <Text
                variant="small"
                classes="mb-1 whitespace-nowrap font-semibold"
              >
                {attr.label}
              </Text>
              <Text variant="small">{attr.value}</Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
