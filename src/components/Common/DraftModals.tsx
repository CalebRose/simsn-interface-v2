import React, { FC, useState } from "react";

import { DraftablePlayer } from "../../models/hockeyModels";
import { useAuthStore } from "../../context/AuthContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { getLogo } from "../../_utility/getLogo";
import { League, SimCHL, SimPHL } from "../../_constants/constants";
import { HeightToFeetAndInches } from "../../_utility/getHeightByFeetAndInches";
import PlayerPicture from "../../_utility/usePlayerFaces";
import { Logo } from "../../_design/Logo";
import { Text } from "../../_design/Typography";
import { Tab, TabGroup } from "../../_design/Tabs";
import { HockeyPlayerStatsModalView } from "./PlayerStatsModalView";
import { getOverallGrade } from "../Draft/common";

interface DrafteeInfoModalBodyProps {
  league: League;
  player: any;
}

export const DrafteeInfoModalBody: FC<DrafteeInfoModalBodyProps> = ({
  player,
  league,
}) => {
  if (league === SimPHL) {
    return <PHLDrafteeInfoModalBody player={player as DraftablePlayer} />;
  }
  return <>Unsupported League.</>;
};

interface PHLDrafteeInfoModalBodyProps {
  player: DraftablePlayer;
}

export const PHLDrafteeInfoModalBody: FC<PHLDrafteeInfoModalBodyProps> = ({
  player,
}) => {
  const [selectedTab, setSelectedTab] = useState<string>("Attributes");
  const { currentUser } = useAuthStore();
  const { phlTeamMap, chlTeamMap } = useSimHCKStore();
  const proTeam = phlTeamMap[player.TeamID];
  let chlTeam = chlTeamMap[player.CollegeID];
  if (!chlTeam) {
    chlTeam = chlTeamMap[player.TeamID];
  }
  const teamLogo = getLogo(SimCHL, player.TeamID, currentUser?.isRetro);
  const heightObj = HeightToFeetAndInches(player.Height);

  const abbr = chlTeam ? chlTeam.Abbreviation : "";

  return (
    <div className="grid grid-cols-4 grid-rows-[auto auto auto auto] gap-4 w-full">
      <div className="row-span-3 flex flex-col items-center">
        <div className="flex items-center justify-center h-[6rem] w-[6rem] sm:h-[8rem] sm:w-[8rem] px-5 rounded-lg border-2 bg-white">
          <PlayerPicture playerID={player.ID} league={SimPHL} team={proTeam} />
        </div>
        {chlTeam && (
          <Logo
            url={teamLogo}
            label={chlTeam.Abbreviation}
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
          {getOverallGrade(player)}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">
          College
        </Text>
        <Text variant="small" classes="whitespace-nowrap">
          {abbr}
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
              <Text variant="small">{player.AgilityGrade}</Text>
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
                  <Text variant="small">{player.FaceoffsGrade}</Text>
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
                      <Text variant="small">{player.LongShotPowerGrade}</Text>
                      <Text variant="xs">Pow</Text>
                    </div>
                    <div className="flex flex-col">
                      <Text variant="small">
                        {player.LongShotAccuracyGrade}
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
                      <Text variant="small" classes="text-center">
                        {player.CloseShotPowerGrade}
                      </Text>
                      <Text variant="xs">Pow</Text>
                    </div>
                    <div className="flex flex-col">
                      <Text variant="small">
                        {player.CloseShotAccuracyGrade}
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
                  <Text variant="small">{player.PassingGrade}</Text>
                </div>
                <div className="flex flex-col px-1 gap-1">
                  <Text
                    variant="small"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Puck Handling
                  </Text>
                  <Text variant="small">{player.PuckHandlingGrade}</Text>
                </div>
                <div className="flex flex-col px-1 gap-1">
                  <Text
                    variant="small"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Strength
                  </Text>
                  <Text variant="small">{player.StrengthGrade}</Text>
                </div>
                <div className="flex flex-col px-1 gap-1">
                  <Text
                    variant="small"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Body Checks
                  </Text>
                  <Text variant="small">{player.BodyCheckingGrade}</Text>
                </div>
                <div className="flex flex-col px-1 gap-1">
                  <Text
                    variant="small"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Stick Checks
                  </Text>
                  <Text variant="small">{player.StickCheckingGrade}</Text>
                </div>
                <div className="flex flex-col px-1 gap-1">
                  <Text
                    variant="small"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Shot Blocks
                  </Text>
                  <Text variant="small">{player.ShotBlockingGrade}</Text>
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
                  <Text variant="small">{player.StrengthGrade}</Text>
                </div>
                <div className="flex flex-col px-1 gap-1">
                  <Text
                    variant="small"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Goalkeeping
                  </Text>
                  <Text variant="small">{player.GoalkeepingGrade}</Text>
                </div>
                <div className="flex flex-col px-1 gap-1">
                  <Text
                    variant="small"
                    classes="mb-1 whitespace-nowrap font-semibold"
                  >
                    Goalie Vision
                  </Text>
                  <Text variant="small">{player.GoalieVisionGrade}</Text>
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
