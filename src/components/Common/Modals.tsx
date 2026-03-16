import { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  League,
  SimCHL,
  SimPHL,
  SimCFB,
  SimNFL,
  SimCBB,
  USA,
  SimNBA,
  SimMLB,
  SimCollegeBaseball,
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
  getAdditionalBBAPortalAttributes,
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
  RecruitPlayerProfile as CBBProfile,
  TransferPlayerResponse,
} from "../../models/basketballModels";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { GetRecruitingTendency } from "../../_utility/getRecruitingTendency";
import { getDisplayStatus } from "../../_helper/recruitingHelper";
import { SelectDropdown } from "../../_design/Select";
import { Tab, TabGroup } from "../../_design/Tabs";
import { getPlayerOverall } from "../Gameplan/FootballGameplan/DepthChart/Modal/DepthChartModalHelper";
import {
  FootballPlayerStatsModalView,
  HockeyPlayerStatsModalView,
} from "./PlayerStatsModalView";
import { Player as BaseballPlayer, PlayerContract as BaseballPlayerContract } from "../../models/baseball/baseballModels";
import { getClassYear } from "../../_utility/baseballHelpers";
import { useSimBaseballStore } from "../../context/SimBaseballContext";
import { displayLevel } from "../../_utility/baseballHelpers";
import { BaseballService } from "../../_services/baseballService";
import { InjuryHistoryItem, PositionUsageRow, PlayerStatsResponse } from "../../models/baseball/baseballStatsModels";

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
  if (league === SimMLB || league === SimCollegeBaseball) {
    return <BaseballPlayerInfoModalBody player={player} league={league} />;
  }
  return <>Unsupported League.</>;
};

interface CHLPlayerInfoModalBodyProps {
  player: CHLPlayer;
}

export const CHLPlayerInfoModalBody: FC<CHLPlayerInfoModalBodyProps> = ({
  player,
}) => {
  const [selectedTab, setSelectedTab] = useState<string>("Attributes");
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
        <TabGroup classes="mb-3 w-full">
          <Tab
            label="Attributes"
            selected={selectedTab === "Attributes"}
            setSelected={setSelectedTab}
          />
          <Tab
            label="Stats"
            selected={selectedTab === "Stats"}
            setSelected={setSelectedTab}
          />
        </TabGroup>
        {selectedTab === "Attributes" && (
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
                        {getHockeyLetterGrade(
                          player.LongShotPower,
                          player.Year,
                        )}
                      </Text>
                      <Text variant="xs">Pow</Text>
                    </div>
                    <div className="flex flex-col">
                      <Text variant="small">
                        {getHockeyLetterGrade(
                          player.LongShotAccuracy,
                          player.Year,
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
                        {getHockeyLetterGrade(
                          player.CloseShotPower,
                          player.Year,
                        )}
                      </Text>
                      <Text variant="xs">Pow</Text>
                    </div>
                    <div className="flex flex-col">
                      <Text variant="small">
                        {getHockeyLetterGrade(
                          player.CloseShotAccuracy,
                          player.Year,
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
        )}
        {selectedTab === "Stats" && (
          <div className="mt-2 overflow-x-auto">
            <HockeyPlayerStatsModalView player={player} league={SimCHL} />
          </div>
        )}
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
  const [selectedTab, setSelectedTab] = useState<string>("Attributes");
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
      (_, index) => contract[`Y${index + 1}BaseSalary`] || 0,
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
        <TabGroup classes="mb-3 w-full">
          <Tab
            label="Attributes"
            selected={selectedTab === "Attributes"}
            setSelected={setSelectedTab}
          />
          <Tab
            label="Stats"
            selected={selectedTab === "Stats"}
            setSelected={setSelectedTab}
          />
        </TabGroup>
        {selectedTab === "Attributes" && (
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
        )}
        {selectedTab === "Stats" && (
          <div className="mt-2 overflow-x-auto">
            <HockeyPlayerStatsModalView player={player} league={SimPHL} />
          </div>
        )}
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
  const [selectedTab, setSelectedTab] = useState<string>("Attributes");
  // PING
  const { currentUser } = useAuthStore();
  const { cfbTeamMap } = useSimFBAStore();
  const team = cfbTeamMap ? cfbTeamMap[player.TeamID] : null;
  const teamLogo = getLogo(SimCFB, player.TeamID, currentUser?.isRetro);
  const heightObj = HeightToFeetAndInches(player.Height);
  const priorityAttributes = setPriorityCFBAttributes(player);

  return (
    <div className="flex flex-col w-full">
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
      </div>
      <div className="flex flex-col mt-4 pt-4">
        <TabGroup classes="mb-3">
          <Tab
            label="Attributes"
            selected={selectedTab === "Attributes"}
            setSelected={setSelectedTab}
          />
          <Tab
            label="Stats"
            selected={selectedTab === "Stats"}
            setSelected={setSelectedTab}
          />
        </TabGroup>
        {selectedTab === "Attributes" && (
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
        )}
        {selectedTab === "Stats" && (
          <div className="mt-2 overflow-x-auto">
            <FootballPlayerStatsModalView player={player} league={SimCFB} />
          </div>
        )}
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
  const [selectedTab, setSelectedTab] = useState<string>("Attributes");
  const { currentUser } = useAuthStore();
  const { proTeamMap: nflTeamMap, cfbTeamMap } = useSimFBAStore();
  const team = nflTeamMap ? nflTeamMap[player.TeamID] : null;
  const teamLogo = getLogo(SimNFL, player.TeamID, currentUser?.isRetro);
  const cfbTeam = cfbTeamMap?.[player.CollegeID];
  const heightObj = HeightToFeetAndInches(player.Height);
  const priorityAttributes = setPriorityNFLAttributes(
    player,
    player.ShowLetterGrade,
  );
  const rawValue = useMemo(() => {
    if (!contract) return 0;
    return Array.from(
      { length: contract.ContractLength },
      (_, index) =>
        (contract[`Y${index + 1}BaseSalary`] || 0) +
        (contract[`Y${index + 1}Bonus`] || 0),
    ).reduce((sum, salary) => sum + salary, 0);
  }, [contract]);
  const currentYearValue = useMemo(() => {
    if (!contract) return 0;
    return ((contract.Y1BaseSalary || 0) + (contract.Y1Bonus || 0)).toFixed(2);
  }, [contract]);
  const totalValue = `${rawValue.toFixed(2)}`;
  return (
    <div className="flex flex-col w-full">
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
            {player.Hometown.length > 0 &&
              `${player.Hometown}, ${player.State}`}
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
              <Text
                variant="body"
                classes="mb-1 whitespace-nowrap font-semibold"
              >
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
      </div>
      <div className="flex flex-col mt-4 pt-4">
        <TabGroup classes="mb-3">
          <Tab
            label="Attributes"
            selected={selectedTab === "Attributes"}
            setSelected={setSelectedTab}
          />
          <Tab
            label="Stats"
            selected={selectedTab === "Stats"}
            setSelected={setSelectedTab}
          />
        </TabGroup>
        {selectedTab === "Attributes" && (
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
        )}
        {selectedTab === "Stats" && (
          <div className="mt-2">
            <FootballPlayerStatsModalView player={player} league={SimNFL} />
          </div>
        )}
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
    player.ShowLetterGrade,
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
              <Text variant="xs" classes="mt-1 whitespace">
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
            className={`w-full max-h-[6rem] overflow-y-auto grid grid-cols-${
              hasSigned ? "4" : "3"
            } gap-y-2`}
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
  const { cbbTeam, cbbTeamMap, recruitProfiles } = useSimBBAStore();
  const teamProfiles = useMemo(() => {
    if (!cbbTeam) return [];
    if (!recruitProfiles) return [];
    return recruitProfiles.filter(
      (profile) => profile.ProfileID === cbbTeam.ID,
    );
  }, [cbbTeam, recruitProfiles]);

  const profileMap = useMemo(() => {
    if (!teamProfiles) return {};
    const map: Record<number, (typeof teamProfiles)[0]> = {};
    teamProfiles.forEach((profile) => {
      map[profile.RecruitID] = profile;
    });
    return map;
  }, [teamProfiles]);

  const recruitProfile = useMemo(() => {
    return profileMap[player.ID];
  }, [profileMap, player.ID]);

  const hasProfile = useMemo(() => {
    return recruitProfile !== undefined;
  }, [recruitProfile]);

  const scoutCount = useMemo(() => {
    let count = 0;
    if (!recruitProfile) return count;
    if (recruitProfile.InsideShooting) {
      count++;
    }
    if (recruitProfile.MidRangeShooting) {
      count++;
    }
    if (recruitProfile.ThreePointShooting) {
      count++;
    }
    if (recruitProfile.FreeThrow) {
      count++;
    }
    if (recruitProfile.Ballwork) {
      count++;
    }
    if (recruitProfile.Rebounding) {
      count++;
    }
    if (recruitProfile.InteriorDefense) {
      count++;
    }
    if (recruitProfile.PerimeterDefense) {
      count++;
    }
    if (recruitProfile.Agility) {
      count++;
    }
    if (recruitProfile.Stealing) {
      count++;
    }
    if (recruitProfile.Blocking) {
      count++;
    }
    if (recruitProfile.Potential) {
      count++;
    }
    return count;
  }, [recruitProfile]);

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
            Archetype
          </Text>
          <Text variant="small" classes="whitespace-nowrap">
            {hasProfile && scoutCount > 3 ? player.Archetype : "?"}
          </Text>
        </div>
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Height
          </Text>
          <Text variant="small" classes="whitespace-nowrap">
            {HeightToFeetAndInches(player.Height).feet}'
            {HeightToFeetAndInches(player.Height).inches}"
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
            {hasProfile && scoutCount > 5 ? player.OverallGrade : "?"}
          </Text>
        </div>
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Potential
          </Text>
          <Text variant="small" classes="whitespace-nowrap">
            {hasProfile && recruitProfile.Potential
              ? player.PotentialGrade
              : "?"}
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
                <Text variant="small">
                  {hasProfile && recruitProfile[attr.key] ? attr.value : "?"}
                </Text>
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
  const heightObj = HeightToFeetAndInches(player.Height);
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
          {player.Country !== USA
            ? player.Country
            : `${player.City}, ${player.State}`}
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
          {heightObj.feet}' {heightObj.inches}"
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
  const heightObj = HeightToFeetAndInches(player.Height);
  const team = useMemo(() => {
    return nbaTeamMap ? nbaTeamMap[player.TeamID] : null;
  }, [nbaTeamMap, player.TeamID]);

  const teamLogo = useMemo(() => {
    return getLogo(SimNBA, player.TeamID, currentUser?.isRetro);
  }, [player.TeamID, currentUser?.isRetro]);

  const cbbTeam = useMemo(() => {
    return player.IsIntGenerated
      ? nbaTeamMap!![player.CollegeID]
      : cbbTeamMap?.[player.CollegeID];
  }, [player.IsIntGenerated, player.CollegeID, nbaTeamMap, cbbTeamMap]);

  const contract = useMemo(() => {
    return proContractMap!![player.ID];
  }, [proContractMap, player.ID]);

  const priorityAttributes = useMemo(() => {
    return getPriorityNBAAttributes(player);
  }, [player]);

  const rawValue = useMemo(() => {
    if (!contract) return 0;
    return Array.from(
      { length: contract.YearsRemaining },
      (_, index) => contract[`Year${index + 1}Total`] || 0,
    ).reduce((sum, salary) => sum + salary, 0);
  }, [contract]);

  const currentYearValue = useMemo(() => {
    return (contract?.Year1Total || 0).toFixed(2);
  }, [contract]);

  const totalValue = useMemo(() => {
    return `${rawValue.toFixed(2)}`;
  }, [rawValue]);

  // Set contract on player (side effect)
  if (contract) {
    player.Contract = contract;
  }
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
          {player.Country !== USA
            ? player.Country
            : `${player.City}, ${player.State}`}
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
          {heightObj.feet}' {heightObj.inches}"
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
              {contract.YearsRemaining} years
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
          </div>{" "}
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

export const PortalInfoModalBody: FC<PlayerInfoModalBodyProps> = ({
  player,
  league,
}) => {
  if (league === SimCHL) {
    return <CHLPortalInfoModalBody player={player as CHLPlayer} />;
  }
  if (league === SimCFB) {
    return <CFBPortalInfoModalBody player={player as CFBPlayer} />;
  }
  if (league === SimCBB) {
    return <CBBPortalInfoModalBody player={player as TransferPlayerResponse} />;
  }

  return <>Unsupported League.</>;
};

export const CHLPortalInfoModalBody: FC<CHLPlayerInfoModalBodyProps> = ({
  player,
}) => {
  const [selectedTab, setSelectedTab] = useState<string>("Attributes");

  const { currentUser } = useAuthStore();
  const { chlTeamMap, transferProfileMapByPlayerID } = useSimHCKStore();
  const team = chlTeamMap[player.TeamID];
  const teamLogo = getLogo(SimCHL, player.TeamID, currentUser?.isRetro);
  const heightObj = HeightToFeetAndInches(player.Height);

  const transferProfiles = useMemo(() => {
    if (!player) return [];
    return transferProfileMapByPlayerID[player.ID] || [];
  }, [player]);

  const leadingTeamsList = useMemo(() => {
    const list = [];
    const sortedProfiles = transferProfiles.sort(
      (a, b) => b.TotalPoints - a.TotalPoints,
    );
    let runningThreshold = 0;
    let totalPoints = 0;
    for (let i = 0; i < sortedProfiles.length; i++) {
      if (sortedProfiles[i].RemovedFromBoard) continue;
      if (runningThreshold === 0) {
        runningThreshold = sortedProfiles[i].TotalPoints * 0.66;
      }
      if (sortedProfiles[i].TotalPoints >= runningThreshold) {
        totalPoints += sortedProfiles[i].TotalPoints;
      }
    }
    for (let i = 0; i < sortedProfiles.length; i++) {
      if (sortedProfiles[i].RemovedFromBoard) continue;
      if (sortedProfiles[i].TotalPoints < runningThreshold) continue;
      let odds = 0;
      if (runningThreshold > 0) {
        odds = sortedProfiles[i].TotalPoints / totalPoints;
      }
      const obj = {
        TeamID: sortedProfiles[i].ProfileID,
        TeamAbbreviation: sortedProfiles[i].TeamAbbreviation,
        Odds: odds,
        PromiseID: sortedProfiles[i].PromiseID,
      };
      list.push(obj);
    }
    return list;
  }, [transferProfiles]);

  return (
    <>
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
          <TabGroup classes="mb-3 w-full">
            <Tab
              label="Attributes"
              selected={selectedTab === "Attributes"}
              setSelected={setSelectedTab}
            />
            <Tab
              label="Stats"
              selected={selectedTab === "Stats"}
              setSelected={setSelectedTab}
            />
          </TabGroup>
          {selectedTab === "Attributes" && (
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
                          {getHockeyLetterGrade(
                            player.LongShotPower,
                            player.Year,
                          )}
                        </Text>
                        <Text variant="xs">Pow</Text>
                      </div>
                      <div className="flex flex-col">
                        <Text variant="small">
                          {getHockeyLetterGrade(
                            player.LongShotAccuracy,
                            player.Year,
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
                          {getHockeyLetterGrade(
                            player.CloseShotPower,
                            player.Year,
                          )}
                        </Text>
                        <Text variant="xs">Pow</Text>
                      </div>
                      <div className="flex flex-col">
                        <Text variant="small">
                          {getHockeyLetterGrade(
                            player.CloseShotAccuracy,
                            player.Year,
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
          )}
          {selectedTab === "Stats" && (
            <div className="mt-2 overflow-x-auto">
              <HockeyPlayerStatsModalView player={player} league={SimCHL} />
            </div>
          )}
        </div>
      </div>
      {leadingTeamsList && (
        <>
          <div className="w-full border-t-[0.1em] justify-center mt-2 mb-2">
            <Text variant="h6">Leading Teams</Text>
          </div>
          <div className={`w-full grid grid-cols-3 mb-1`}>
            <Text variant="body-small" classes="font-semibold">
              Team
            </Text>
            <Text variant="body-small" classes="font-semibold">
              Promise
            </Text>
            <Text variant="body-small" classes="font-semibold">
              Prediction
            </Text>
          </div>
          <div
            className={`w-full max-h-[6rem] overflow-y-auto grid grid-cols-3 gap-y-2 mb-2`}
          >
            {leadingTeamsList.map((contender) => {
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
                    {(() => {
                      // Handle both number and NullInt64 object types
                      const promiseId =
                        typeof contender.PromiseID === "object" &&
                        contender.PromiseID !== null
                          ? (contender.PromiseID as any).Int64
                          : contender.PromiseID;
                      return promiseId > 0 ? "Yes" : "No";
                    })()}
                  </Text>
                  <Text variant="xs" classes="font-semibold">
                    {displayStatus}
                  </Text>
                </>
              );
            })}
          </div>
        </>
      )}
    </>
  );
};

interface CBBPortalInfoModalBodyProps {
  player: TransferPlayerResponse;
}

export const CBBPortalInfoModalBody: FC<CBBPortalInfoModalBodyProps> = ({
  player,
}) => {
  const { currentUser } = useAuthStore();
  const { cbbTeamMap, transferProfileMapByPlayerID } = useSimBBAStore();
  const team = cbbTeamMap![player.TeamID];
  const teamLogo = getLogo(SimCBB, player.TeamID, currentUser?.isRetro);

  const transferProfiles = useMemo(() => {
    if (!player) return [];
    return transferProfileMapByPlayerID[player.ID] || [];
  }, [player]);

  const leadingTeamsList = useMemo(() => {
    const list = [];
    const sortedProfiles = transferProfiles.sort(
      (a, b) => b.TotalPoints - a.TotalPoints,
    );
    let runningThreshold = 0;
    let totalPoints = 0;
    for (let i = 0; i < sortedProfiles.length; i++) {
      if (sortedProfiles[i].RemovedFromBoard) continue;
      if (runningThreshold === 0) {
        runningThreshold = sortedProfiles[i].TotalPoints * 0.66;
      }
      if (sortedProfiles[i].TotalPoints >= runningThreshold) {
        totalPoints += sortedProfiles[i].TotalPoints;
      }
    }
    for (let i = 0; i < sortedProfiles.length; i++) {
      if (sortedProfiles[i].RemovedFromBoard) continue;
      if (sortedProfiles[i].TotalPoints < runningThreshold) continue;
      let odds = 0;
      if (runningThreshold > 0) {
        odds = sortedProfiles[i].TotalPoints / totalPoints;
      }
      const obj = {
        TeamID: sortedProfiles[i].ProfileID,
        TeamAbbreviation: sortedProfiles[i].TeamAbbreviation,
        Odds: odds,
        PromiseID: sortedProfiles[i].PromiseID,
      };
      list.push(obj);
    }
    return list;
  }, [transferProfiles]);

  const priorityAttributes = getAdditionalBBAPortalAttributes(player);

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-[auto auto auto auto] gap-4 w-full">
        <div className="row-span-3 flex flex-col items-center">
          <div className="flex items-center justify-center h-[6rem] w-[6rem] sm:h-[8rem] sm:w-[8rem] px-5 rounded-lg border-2 bg-white">
            <PlayerPicture playerID={player.ID} league={SimCBB} team={team} />
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
            {player.Height}"
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
            {player.OverallGrade}
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
      {leadingTeamsList && (
        <>
          <div className="w-full border-t-[0.1em] justify-center mt-2 mb-2">
            <Text variant="h6">Leading Teams</Text>
          </div>
          <div className={`w-full grid grid-cols-3 mb-1`}>
            <Text variant="body-small" classes="font-semibold">
              Team
            </Text>
            <Text variant="body-small" classes="font-semibold">
              Promise
            </Text>
            <Text variant="body-small" classes="font-semibold">
              Prediction
            </Text>
          </div>
          <div
            className={`w-full max-h-[6rem] overflow-y-auto grid grid-cols-3 gap-y-2 mb-2`}
          >
            {leadingTeamsList.map((contender) => {
              const logo = getLogo(SimCBB, contender.TeamID, false);
              const team = cbbTeamMap![contender.TeamID];
              const fullOdds = Math.round(contender.Odds * 100);
              const displayStatus = getDisplayStatus(fullOdds);
              const teamName = team ? team.Abbr : "Unknown";

              return (
                <>
                  <div className="flex flex-row justify-start px-2">
                    <Logo url={logo} variant="tiny" />{" "}
                    <span className="ms-4 font-semibold text-xs">
                      {teamName}
                    </span>
                  </div>
                  <Text variant="xs" classes="font-semibold">
                    {(() => {
                      // Handle both number and NullInt64 object types
                      const promiseId =
                        typeof contender.PromiseID === "object" &&
                        contender.PromiseID !== null
                          ? (contender.PromiseID as any).Int64
                          : contender.PromiseID;
                      return promiseId > 0 ? "Yes" : "No";
                    })()}
                  </Text>
                  <Text variant="xs" classes="font-semibold">
                    {displayStatus}
                  </Text>
                </>
              );
            })}
          </div>
        </>
      )}
    </>
  );
};

interface CFBPortalInfoModalBodyProps {
  player: CFBPlayer;
}

export const CFBPortalInfoModalBody: FC<CFBPortalInfoModalBodyProps> = ({
  player,
}) => {
  const { currentUser } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState<string>("Attributes");
  const { cfbTeamMap, transferProfileMapByPlayerID } = useSimFBAStore();
  const team = cfbTeamMap![player.TeamID];
  const teamLogo = getLogo(SimCFB, player.TeamID, currentUser?.isRetro);

  const transferProfiles = useMemo(() => {
    if (!player) return [];
    return transferProfileMapByPlayerID[player.ID] || [];
  }, [player]);

  const leadingTeamsList = useMemo(() => {
    const list = [];
    const sortedProfiles = transferProfiles.sort(
      (a, b) => b.TotalPoints - a.TotalPoints,
    );
    let runningThreshold = 0;
    let totalPoints = 0;
    for (let i = 0; i < sortedProfiles.length; i++) {
      if (sortedProfiles[i].RemovedFromBoard) continue;
      if (runningThreshold === 0) {
        runningThreshold = sortedProfiles[i].TotalPoints * 0.66;
      }
      if (sortedProfiles[i].TotalPoints >= runningThreshold) {
        totalPoints += sortedProfiles[i].TotalPoints;
      }
    }
    for (let i = 0; i < sortedProfiles.length; i++) {
      if (sortedProfiles[i].RemovedFromBoard) continue;
      if (sortedProfiles[i].TotalPoints < runningThreshold) continue;
      let odds = 0;
      if (runningThreshold > 0) {
        odds = sortedProfiles[i].TotalPoints / totalPoints;
      }
      const obj = {
        TeamID: sortedProfiles[i].ProfileID,
        TeamAbbreviation: sortedProfiles[i].TeamAbbreviation,
        Odds: odds,
        PromiseID: sortedProfiles[i].PromiseID,
      };
      list.push(obj);
    }
    return list;
  }, [transferProfiles]);

  const priorityAttributes = setPriorityCFBAttributes(player);
  return (
    <>
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
            {player.Height}"
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
            {getPlayerOverall(player, SimCFB)}
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
      </div>
      {leadingTeamsList && (
        <>
          <div className="w-full border-t-[0.1em] justify-center mt-2 mb-2">
            <Text variant="h6">Leading Teams</Text>
          </div>
          <div className={`w-full grid grid-cols-3 mb-1`}>
            <Text variant="body-small" classes="font-semibold">
              Team
            </Text>
            <Text variant="body-small" classes="font-semibold">
              Promise
            </Text>
            <Text variant="body-small" classes="font-semibold">
              Prediction
            </Text>
          </div>
          <div
            className={`w-full max-h-[6rem] overflow-y-auto grid grid-cols-3 gap-y-2 mb-2`}
          >
            {leadingTeamsList.map((contender) => {
              const logo = getLogo(SimCFB, contender.TeamID, false);
              const team = cfbTeamMap![contender.TeamID];
              const fullOdds = Math.round(contender.Odds * 100);
              const displayStatus = getDisplayStatus(fullOdds);
              const teamName = team ? team.TeamAbbr : "Unknown";

              return (
                <>
                  <div className="flex flex-row justify-start px-2">
                    <Logo url={logo} variant="tiny" />{" "}
                    <span className="ms-4 font-semibold text-xs">
                      {teamName}
                    </span>
                  </div>
                  <Text variant="xs" classes="font-semibold">
                    {(() => {
                      // Handle both number and NullInt64 object types
                      const promiseId =
                        typeof contender.PromiseID === "object" &&
                        contender.PromiseID !== null
                          ? (contender.PromiseID as any).Int64
                          : contender.PromiseID;
                      return promiseId > 0 ? "Yes" : "No";
                    })()}
                  </Text>
                  <Text variant="xs" classes="font-semibold">
                    {displayStatus}
                  </Text>
                </>
              );
            })}
          </div>
        </>
      )}
      <div className="flex flex-col mt-4 pt-4">
        <TabGroup classes="mb-3">
          <Tab
            label="Attributes"
            selected={selectedTab === "Attributes"}
            setSelected={setSelectedTab}
          />
          <Tab
            label="Stats"
            selected={selectedTab === "Stats"}
            setSelected={setSelectedTab}
          />
        </TabGroup>
        {selectedTab === "Attributes" && (
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
        )}
        {selectedTab === "Stats" && (
          <div className="mt-2">
            <FootballPlayerStatsModalView player={player} league={SimCFB} />
          </div>
        )}
      </div>
    </>
  );
};

// ─── Baseball Player Info Modal ─────────────────────────────────────────────

interface BaseballPlayerInfoModalBodyProps {
  player: BaseballPlayer;
  league: League;
}

const BaseballStatCell = ({
  label,
  value,
  pot,
  isFuzzed,
}: {
  label: string;
  value: number | string | null;
  pot?: string | null;
  isFuzzed?: boolean;
}) => {
  if (value == null) return null;
  // Handle both numeric (20-80) and letter grade (string) values
  const isGrade = typeof value === "string";
  const color = isGrade
    ? (value.startsWith("A") ? "text-green-600 dark:text-green-400"
      : value.startsWith("B") ? "text-blue-600 dark:text-blue-400"
      : value.startsWith("C") ? "text-yellow-600 dark:text-yellow-400"
      : value.startsWith("D") ? "text-orange-600 dark:text-orange-400"
      : "text-red-600 dark:text-red-400")
    : (value >= 70 ? "text-green-600 dark:text-green-400"
      : value >= 60 ? "text-blue-600 dark:text-blue-400"
      : value >= 50 ? ""
      : value >= 40 ? "text-yellow-600 dark:text-yellow-400"
      : "text-red-600 dark:text-red-400");
  return (
    <div className="flex flex-col px-1">
      <Text variant="small" classes="font-semibold whitespace-nowrap">
        {label}
      </Text>
      <Text variant="small" classes={`whitespace-nowrap ${color}`}>
        {isFuzzed && <span className="text-gray-400">~</span>}{typeof value === "number" ? Math.round(value) : value}
        {pot && pot !== "?" && (
          <span className="ml-0.5 text-xs text-gray-500 dark:text-gray-400">
            ({pot})
          </span>
        )}
        {pot === "?" && (
          <span className="ml-0.5 text-xs text-gray-400">(?)</span>
        )}
      </Text>
    </div>
  );
};

const BaseballContractRow: FC<{ contract: BaseballPlayerContract; league: League }> = ({ contract, league }) => {
  const isCollege = league === SimCollegeBaseball;

  if (isCollege) {
    const classYear = getClassYear(contract);
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-3 pt-3 border-t dark:border-gray-600">
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">Class</Text>
          <Text variant="small">{classYear.label || "—"}</Text>
        </div>
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">Year</Text>
          <Text variant="small">{contract.current_year} of {contract.years}</Text>
        </div>
        {contract.is_extension && (
          <div className="flex flex-col">
            <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">Redshirt</Text>
            <Text variant="small" classes="text-yellow-600 dark:text-yellow-400">Yes</Text>
          </div>
        )}
      </div>
    );
  }

  // MLB contract
  const salary = contract.current_year_detail?.base_salary;
  const fmt = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const salaryDisplay = salary != null ? fmt(salary) : "—";
  const bonusDisplay = contract.bonus ? fmt(contract.bonus) : "—";

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-3 pt-3 border-t dark:border-gray-600">
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">Contract</Text>
        <Text variant="small">Yr {contract.current_year} of {contract.years}</Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">Salary</Text>
        <Text variant="small">{salaryDisplay}</Text>
      </div>
      {contract.bonus > 0 && (
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">Bonus</Text>
          <Text variant="small">{bonusDisplay}</Text>
        </div>
      )}
      {contract.on_ir && (
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">IL Status</Text>
          <Text variant="small" classes="text-red-600 dark:text-red-400 font-semibold">On IL</Text>
        </div>
      )}
    </div>
  );
};

export const BaseballPlayerInfoModalBody: FC<
  BaseballPlayerInfoModalBodyProps
> = ({ player, league }) => {
  const [selectedTab, setSelectedTab] = useState<string>("Batting");
  const { currentUser } = useAuthStore();
  const { mlbOrganization, collegeOrganization, seasonContext, allTeams } = useSimBaseballStore();

  // Injury history
  const [injuryHistory, setInjuryHistory] = useState<InjuryHistoryItem[]>([]);
  const [injuryLoading, setInjuryLoading] = useState(false);

  // Position usage
  const [positionUsage, setPositionUsage] = useState<PositionUsageRow[]>([]);
  const [posUsageLoading, setPosUsageLoading] = useState(false);

  // Player statistics
  const [playerStats, setPlayerStats] = useState<PlayerStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (selectedTab !== "Injuries") return;
    let cancelled = false;
    const load = async () => {
      setInjuryLoading(true);
      try {
        const data = await BaseballService.GetInjuryHistory({ player_id: player.id });
        if (!cancelled) setInjuryHistory(data.events);
      } catch {
        if (!cancelled) setInjuryHistory([]);
      }
      if (!cancelled) setInjuryLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [selectedTab, player.id]);

  useEffect(() => {
    if (selectedTab !== "Positions") return;
    if (!seasonContext?.current_league_year_id) return;
    let cancelled = false;
    const load = async () => {
      setPosUsageLoading(true);
      try {
        const data = await BaseballService.GetPositionUsage({
          league_year_id: seasonContext.current_league_year_id,
          player_id: player.id,
        });
        if (!cancelled) setPositionUsage(data.positions);
      } catch {
        if (!cancelled) setPositionUsage([]);
      }
      if (!cancelled) setPosUsageLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [selectedTab, player.id, seasonContext?.current_league_year_id]);

  useEffect(() => {
    if (selectedTab !== "Statistics") return;
    let cancelled = false;
    const load = async () => {
      setStatsLoading(true);
      try {
        const data = await BaseballService.GetPlayerStats(player.id, {
          league_year_id: seasonContext?.current_league_year_id,
        });
        if (!cancelled) setPlayerStats(data);
      } catch {
        if (!cancelled) setPlayerStats(null);
      }
      if (!cancelled) setStatsLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [selectedTab, player.id, seasonContext?.current_league_year_id]);

  const heightObj = HeightToFeetAndInches(player.height);
  // Look up the player's team from allTeams (works for ANY org, not just the user's)
  const team = useMemo(() => {
    if (!allTeams || allTeams.length === 0) return null;
    // Match by team_abbrev (most reliable across orgs)
    if (player.team_abbrev) {
      const match = allTeams.find((t) => t.team_abbrev === player.team_abbrev);
      if (match) return match;
    }
    return null;
  }, [allTeams, player.team_abbrev]);
  const teamLogo = team
    ? getLogo(
        league === SimMLB ? SimMLB : SimCollegeBaseball,
        team.team_id,
        currentUser?.isRetro,
      )
    : "";

  const r = player.ratings;
  const pot = player.potentials;
  const isPitcher = player.ptype === "Pitcher";

  return (
    <div className="flex flex-col w-full">
      {/* Header: Face + Info Grid */}
      <div className="grid grid-cols-4 gap-4 w-full">
        {/* Face + Team Logo */}
        <div className="row-span-3 flex flex-col items-center">
          <div className="flex items-center justify-center h-[6rem] w-[6rem] sm:h-[8rem] sm:w-[8rem] px-5 rounded-lg border-2 bg-white">
            <PlayerPicture
              playerID={player.id}
              league={league as League}
              team={team}
            />
          </div>
          {team && (
            <Logo
              url={teamLogo}
              label={team.team_abbrev}
              classes="h-[5rem] max-h-[5rem]"
              containerClass="p-4"
              textClass="text-small"
            />
          )}
        </div>

        {/* Info cells */}
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Type
          </Text>
          <Text variant="small" classes="whitespace-nowrap">
            {player.ptype}
          </Text>
        </div>
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Age
          </Text>
          <Text variant="small">{player.age}</Text>
        </div>
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Overall
          </Text>
          <Text variant="small">{player.displayovr ?? "—"}</Text>
        </div>

        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Level
          </Text>
          <Text variant="small">{displayLevel(player.league_level)}</Text>
        </div>
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Team
          </Text>
          <Text variant="small">{player.team_abbrev}</Text>
        </div>
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Bats / Throws
          </Text>
          <Text variant="small">
            {player.bat_hand} / {player.pitch_hand}
          </Text>
        </div>

        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Height / Weight
          </Text>
          <Text variant="small">
            {heightObj.feet}'{heightObj.inches}" / {player.weight} lbs
          </Text>
        </div>
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Durability
          </Text>
          <Text variant="small">{player.durability || "—"}</Text>
        </div>
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
            Injury Risk
          </Text>
          <Text variant="small">{player.injury_risk || "—"}</Text>
        </div>
      </div>

      {/* Contract Info */}
      {player.contract && (
        <BaseballContractRow contract={player.contract} league={league} />
      )}

      {/* Tabs */}
      <div className="flex flex-col mt-4 pt-4 border-t dark:border-gray-600">
        <TabGroup classes="mb-3">
          <Tab
            label="Batting"
            selected={selectedTab === "Batting"}
            setSelected={setSelectedTab}
          />
          <Tab
            label="Fielding"
            selected={selectedTab === "Fielding"}
            setSelected={setSelectedTab}
          />
          {isPitcher && (
            <Tab
              label="Pitching"
              selected={selectedTab === "Pitching"}
              setSelected={setSelectedTab}
            />
          )}
          <Tab
            label="Positions"
            selected={selectedTab === "Positions"}
            setSelected={setSelectedTab}
          />
          <Tab
            label="Injuries"
            selected={selectedTab === "Injuries"}
            setSelected={setSelectedTab}
          />
          <Tab
            label="Statistics"
            selected={selectedTab === "Statistics"}
            setSelected={setSelectedTab}
          />
        </TabGroup>

        {selectedTab === "Batting" && (
          <div className="grid w-full grid-cols-3 sm:grid-cols-5 gap-3">
            <BaseballStatCell label="Contact" value={r.contact_display} pot={pot.contact_pot} />
            <BaseballStatCell label="Power" value={r.power_display} pot={pot.power_pot} />
            <BaseballStatCell label="Eye" value={r.eye_display} pot={pot.eye_pot} />
            <BaseballStatCell label="Discipline" value={r.discipline_display} pot={pot.discipline_pot} />
            <BaseballStatCell label="Speed" value={r.speed_display} pot={pot.speed_pot} />
            <BaseballStatCell label="Base Reaction" value={r.basereaction_display} pot={pot.basereaction_pot} />
            <BaseballStatCell label="Baserunning" value={r.baserunning_display} pot={pot.baserunning_pot} />
          </div>
        )}

        {selectedTab === "Fielding" && (
          <div className="grid w-full grid-cols-3 sm:grid-cols-5 gap-3">
            <BaseballStatCell label="Field Catch" value={r.fieldcatch_display} pot={pot.fieldcatch_pot} />
            <BaseballStatCell label="Field React" value={r.fieldreact_display} pot={pot.fieldreact_pot} />
            <BaseballStatCell label="Field Spot" value={r.fieldspot_display} pot={pot.fieldspot_pot} />
            <BaseballStatCell label="Throw Acc" value={r.throwacc_display} pot={pot.throwacc_pot} />
            <BaseballStatCell label="Throw Pow" value={r.throwpower_display} pot={pot.throwpower_pot} />
            <BaseballStatCell label="Catch Frame" value={r.catchframe_display} pot={pot.catchframe_pot} />
            <BaseballStatCell label="Catch Seq" value={r.catchsequence_display} pot={pot.catchsequence_pot} />
          </div>
        )}

        {selectedTab === "Pitching" && isPitcher && (
          <div className="space-y-3">
            <div className="grid w-full grid-cols-3 sm:grid-cols-5 gap-3">
              <BaseballStatCell label="Endurance" value={r.pendurance_display} pot={pot.pendurance_pot} />
              <BaseballStatCell label="Control" value={r.pgencontrol_display} pot={pot.pgencontrol_pot} />
              <BaseballStatCell label="Velocity" value={r.pthrowpower_display} pot={pot.pthrowpower_pot} />
              <BaseballStatCell label="Sequencing" value={r.psequencing_display} pot={pot.psequencing_pot} />
              <BaseballStatCell label="Pickoff" value={r.pickoff_display} pot={pot.pickoff_pot} />
            </div>
            <div className="border-t dark:border-gray-600 pt-3">
              <Text variant="small" classes="font-semibold mb-2">Pitch Arsenal</Text>
              <div className="grid w-full grid-cols-3 sm:grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((i) => {
                  const name = player[`pitch${i}_name` as keyof BaseballPlayer] as string | null;
                  const ovr = r[`pitch${i}_ovr` as keyof typeof r] as number | null;
                  if (!name) return null;
                  return (
                    <div key={i} className="flex flex-col px-1">
                      <Text variant="small" classes="font-semibold whitespace-nowrap">{name}</Text>
                      <Text variant="small" classes={`whitespace-nowrap ${
                        (ovr ?? 0) >= 70 ? "text-green-600 dark:text-green-400" :
                        (ovr ?? 0) >= 60 ? "text-blue-600 dark:text-blue-400" :
                        (ovr ?? 0) >= 50 ? "" :
                        (ovr ?? 0) >= 40 ? "text-yellow-600 dark:text-yellow-400" :
                        "text-red-600 dark:text-red-400"
                      }`}>
                        {ovr ?? "—"}
                      </Text>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {selectedTab === "Positions" && (
          <div className="space-y-4">
            {/* Position Ratings with XP modifier */}
            <div>
              <Text variant="small" classes="font-semibold mb-2">Position Ratings</Text>
              <div className="grid w-full grid-cols-3 sm:grid-cols-5 gap-3">
                {([
                  { label: "C", key: "c", ratingKey: "c_rating" },
                  { label: "1B", key: "fb", ratingKey: "fb_rating" },
                  { label: "2B", key: "sb", ratingKey: "sb_rating" },
                  { label: "3B", key: "tb", ratingKey: "tb_rating" },
                  { label: "SS", key: "ss", ratingKey: "ss_rating" },
                  { label: "LF", key: "lf", ratingKey: "lf_rating" },
                  { label: "CF", key: "cf", ratingKey: "cf_rating" },
                  { label: "RF", key: "rf", ratingKey: "rf_rating" },
                  { label: "DH", key: "dh", ratingKey: "dh_rating" },
                  ...(isPitcher ? [
                    { label: "SP", key: "sp", ratingKey: "sp_rating" },
                    { label: "RP", key: "rp", ratingKey: "rp_rating" },
                  ] : []),
                ] as { label: string; key: string; ratingKey: keyof typeof r }[]).map((pos) => {
                  const rating = r[pos.ratingKey] as number | null;
                  const xpMod = player.defensive_xp_mod?.[pos.key];
                  if (rating == null) return null;
                  const ratingColor =
                    rating >= 70 ? "text-green-600 dark:text-green-400" :
                    rating >= 60 ? "text-blue-600 dark:text-blue-400" :
                    rating >= 50 ? "" :
                    rating >= 40 ? "text-yellow-600 dark:text-yellow-400" :
                    "text-red-600 dark:text-red-400";
                  const xpColor = xpMod != null
                    ? xpMod >= 0.03 ? "text-green-600 dark:text-green-400"
                    : xpMod >= 0 ? "text-blue-600 dark:text-blue-400"
                    : xpMod >= -0.10 ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
                    : "";
                  return (
                    <div key={pos.key} className="flex flex-col px-1">
                      <Text variant="small" classes="font-semibold whitespace-nowrap">{pos.label}</Text>
                      <Text variant="small" classes={`whitespace-nowrap ${ratingColor}`}>
                        {rating}
                        {xpMod != null && (
                          <span className={`ml-1 text-[10px] ${xpColor}`}>
                            {xpMod >= 0 ? "+" : ""}{(xpMod * 100).toFixed(0)}%
                          </span>
                        )}
                      </Text>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Position Usage (games started) */}
            <div className="border-t dark:border-gray-600 pt-3">
              <Text variant="small" classes="font-semibold mb-2">Season Position Usage</Text>
              {posUsageLoading ? (
                <Text variant="small" classes="text-gray-400 py-2 text-center">Loading...</Text>
              ) : positionUsage.length === 0 ? (
                <Text variant="small" classes="text-gray-400 py-2 text-center">No position usage data this season.</Text>
              ) : (
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                      <th className="px-2 py-1 text-left">Position</th>
                      <th className="px-2 py-1 text-center">Starts</th>
                      <th className="px-2 py-1 text-center">vs L</th>
                      <th className="px-2 py-1 text-center">vs R</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positionUsage
                      .sort((a, b) => b.starts - a.starts)
                      .map((pu) => {
                        const posDisplay: Record<string, string> = {
                          c: "C", fb: "1B", sb: "2B", tb: "3B", ss: "SS",
                          lf: "LF", cf: "CF", rf: "RF", dh: "DH", p: "P",
                        };
                        return (
                          <tr key={pu.position_code} className="border-b border-gray-100 dark:border-gray-700">
                            <td className="px-2 py-1.5 font-medium">{posDisplay[pu.position_code] ?? pu.position_code.toUpperCase()}</td>
                            <td className="px-2 py-1.5 text-center font-semibold">{pu.starts}</td>
                            <td className="px-2 py-1.5 text-center text-gray-500">{pu.vs_l_starts}</td>
                            <td className="px-2 py-1.5 text-center text-gray-500">{pu.vs_r_starts}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {selectedTab === "Injuries" && (
          <div className="w-full">
            {injuryLoading ? (
              <Text variant="small" classes="text-gray-400 py-4 text-center">Loading injury history...</Text>
            ) : injuryHistory.length === 0 ? (
              <Text variant="small" classes="text-gray-400 py-4 text-center">No injury history found.</Text>
            ) : (
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                    <th className="px-2 py-1 text-left">Injury</th>
                    <th className="px-2 py-1 text-center">Assigned</th>
                    <th className="px-2 py-1 text-center">Remaining</th>
                    <th className="px-2 py-1 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {injuryHistory.map((evt) => (
                    <tr key={evt.event_id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="px-2 py-1.5">{evt.injury_name}</td>
                      <td className="px-2 py-1.5 text-center">{evt.weeks_assigned}w</td>
                      <td className="px-2 py-1.5 text-center">
                        <span className={evt.weeks_remaining > 0 ? "text-red-600 dark:text-red-400 font-semibold" : "text-green-600 dark:text-green-400"}>
                          {evt.weeks_remaining > 0 ? `${evt.weeks_remaining}w` : "Healed"}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-gray-500">{evt.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {selectedTab === "Statistics" && (
          <div className="w-full space-y-4">
            {statsLoading ? (
              <Text variant="small" classes="text-gray-400 py-4 text-center">Loading statistics...</Text>
            ) : !playerStats ? (
              <Text variant="small" classes="text-gray-400 py-4 text-center">No statistics available.</Text>
            ) : (
              <>
                {/* Batting Stats */}
                {playerStats.batting && playerStats.batting.length > 0 && (
                  <div>
                    <Text variant="small" classes="font-semibold mb-2">Batting</Text>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                            <th className="px-1.5 py-1 text-left">Team</th>
                            <th className="px-1.5 py-1 text-center">G</th>
                            <th className="px-1.5 py-1 text-center">AB</th>
                            <th className="px-1.5 py-1 text-center">R</th>
                            <th className="px-1.5 py-1 text-center">H</th>
                            <th className="px-1.5 py-1 text-center">2B</th>
                            <th className="px-1.5 py-1 text-center">3B</th>
                            <th className="px-1.5 py-1 text-center">HR</th>
                            <th className="px-1.5 py-1 text-center">RBI</th>
                            <th className="px-1.5 py-1 text-center">BB</th>
                            <th className="px-1.5 py-1 text-center">SO</th>
                            <th className="px-1.5 py-1 text-center">SB</th>
                            <th className="px-1.5 py-1 text-center">AVG</th>
                            <th className="px-1.5 py-1 text-center">OBP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {playerStats.batting.map((s, i) => (
                            <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                              <td className="px-1.5 py-1 font-medium">{s.team_abbrev}</td>
                              <td className="px-1.5 py-1 text-center">{s.g}</td>
                              <td className="px-1.5 py-1 text-center">{s.ab}</td>
                              <td className="px-1.5 py-1 text-center">{s.r}</td>
                              <td className="px-1.5 py-1 text-center">{s.h}</td>
                              <td className="px-1.5 py-1 text-center">{s["2b"]}</td>
                              <td className="px-1.5 py-1 text-center">{s["3b"]}</td>
                              <td className="px-1.5 py-1 text-center">{s.hr}</td>
                              <td className="px-1.5 py-1 text-center">{s.rbi}</td>
                              <td className="px-1.5 py-1 text-center">{s.bb}</td>
                              <td className="px-1.5 py-1 text-center">{s.so}</td>
                              <td className="px-1.5 py-1 text-center">{s.sb}</td>
                              <td className="px-1.5 py-1 text-center font-semibold">{s.avg}</td>
                              <td className="px-1.5 py-1 text-center font-semibold">{s.obp}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pitching Stats */}
                {playerStats.pitching && playerStats.pitching.length > 0 && (
                  <div>
                    <Text variant="small" classes="font-semibold mb-2">Pitching</Text>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                            <th className="px-1.5 py-1 text-left">Team</th>
                            <th className="px-1.5 py-1 text-center">G</th>
                            <th className="px-1.5 py-1 text-center">GS</th>
                            <th className="px-1.5 py-1 text-center">W</th>
                            <th className="px-1.5 py-1 text-center">L</th>
                            <th className="px-1.5 py-1 text-center">SV</th>
                            <th className="px-1.5 py-1 text-center">HLD</th>
                            <th className="px-1.5 py-1 text-center">BS</th>
                            <th className="px-1.5 py-1 text-center">QS</th>
                            <th className="px-1.5 py-1 text-center">IP</th>
                            <th className="px-1.5 py-1 text-center">H</th>
                            <th className="px-1.5 py-1 text-center">ER</th>
                            <th className="px-1.5 py-1 text-center">BB</th>
                            <th className="px-1.5 py-1 text-center">SO</th>
                            <th className="px-1.5 py-1 text-center">ERA</th>
                            <th className="px-1.5 py-1 text-center">WHIP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {playerStats.pitching.map((s, i) => (
                            <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                              <td className="px-1.5 py-1 font-medium">{s.team_abbrev}</td>
                              <td className="px-1.5 py-1 text-center">{s.g}</td>
                              <td className="px-1.5 py-1 text-center">{s.gs}</td>
                              <td className="px-1.5 py-1 text-center">{s.w}</td>
                              <td className="px-1.5 py-1 text-center">{s.l}</td>
                              <td className="px-1.5 py-1 text-center">{s.sv}</td>
                              <td className="px-1.5 py-1 text-center">{s.hld}</td>
                              <td className="px-1.5 py-1 text-center">{s.bs}</td>
                              <td className="px-1.5 py-1 text-center">{s.qs}</td>
                              <td className="px-1.5 py-1 text-center">{s.ip}</td>
                              <td className="px-1.5 py-1 text-center">{s.h}</td>
                              <td className="px-1.5 py-1 text-center">{s.er}</td>
                              <td className="px-1.5 py-1 text-center">{s.bb}</td>
                              <td className="px-1.5 py-1 text-center">{s.so}</td>
                              <td className="px-1.5 py-1 text-center font-semibold">{s.era}</td>
                              <td className="px-1.5 py-1 text-center font-semibold">{s.whip}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Fielding Stats */}
                {playerStats.fielding && playerStats.fielding.length > 0 && (
                  <div>
                    <Text variant="small" classes="font-semibold mb-2">Fielding</Text>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                            <th className="px-1.5 py-1 text-left">Team</th>
                            <th className="px-1.5 py-1 text-center">Pos</th>
                            <th className="px-1.5 py-1 text-center">G</th>
                            <th className="px-1.5 py-1 text-center">INN</th>
                            <th className="px-1.5 py-1 text-center">PO</th>
                            <th className="px-1.5 py-1 text-center">A</th>
                            <th className="px-1.5 py-1 text-center">E</th>
                          </tr>
                        </thead>
                        <tbody>
                          {playerStats.fielding.map((s, i) => (
                            <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                              <td className="px-1.5 py-1 font-medium">{s.team_abbrev}</td>
                              <td className="px-1.5 py-1 text-center">{s.pos}</td>
                              <td className="px-1.5 py-1 text-center">{s.g}</td>
                              <td className="px-1.5 py-1 text-center">{s.inn}</td>
                              <td className="px-1.5 py-1 text-center">{s.po}</td>
                              <td className="px-1.5 py-1 text-center">{s.a}</td>
                              <td className="px-1.5 py-1 text-center">{s.e}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {playerStats.batting?.length === 0 && playerStats.pitching?.length === 0 && playerStats.fielding?.length === 0 && (
                  <Text variant="small" classes="text-gray-400 py-4 text-center">No statistics recorded this season.</Text>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
