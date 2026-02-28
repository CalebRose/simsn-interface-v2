import { FC, useCallback, useMemo, useState, useEffect } from "react";
import {
  CollegeGameplan,
  CollegePlayer,
  CollegeShootoutLineup,
  ProfessionalPlayer,
  ProfessionalShootoutLineup,
  ProGameplan,
} from "../../../models/hockeyModels";
import { Input, ToggleSwitch } from "../../../_design/Inputs";
import { SelectDropdown } from "../../../_design/Select";
import {
  AttackingGoalZone,
  AttackingZone,
  DefendingGoalZone,
  DefendingZone,
  Help1,
  Help2,
  Help3,
  InfoType,
  League,
  Lineup,
  ModalAction,
  NeutralZone,
  SimCHL,
  Zone,
} from "../../../_constants/constants";
import { CSSObjectWithLabel, SingleValue } from "react-select";
import { SelectOption, selectStyles } from "../../../_hooks/useSelectStyles";
import {
  getHCKAIGameplanOptionsOptions,
  getShootoutOptionList,
  getShootoutPlaceholder,
} from "./lineupHelper";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { Modal } from "../../../_design/Modal";
import { PlayerInfoModalBody } from "../../Common/Modals";
import { Info } from "../../../_design/Icons";
import {
  getDefensiveSystemFromMap,
  getHCKAICheckPreferenceObject,
  getHCKAIShotPreferenceObject,
  getHCKAISortObject,
  getHCKGoalieSortObject,
  getOffensiveSystemFromMap,
} from "./useLineupUtils";
import { getHockeyLetterGrade } from "../../../_utility/getLetterGrade";
import Slider from "../../Common/Slider";

interface LineupPlayerProps {
  playerID: number;
  rosterMap: Record<number, CollegePlayer | ProfessionalPlayer>;
  zoneInputList: { label: string; key: string }[];
  lineCategory: Lineup;
  lineIDX: number;
  optionList: { label: string; value: string }[];
  ChangeState: (value: number, property: string) => void;
  ChangePlayerInput: (
    playerID: number,
    property: string,
    value: number,
  ) => void;
  property: string;
  league?: League;
  activatePlayer: (player: CollegePlayer | ProfessionalPlayer) => void;
  offenseSystemInformation?: any;
  defenseSystemInformation?: any;
  zoneCategory: Zone;
}

export const LineupPlayer: FC<LineupPlayerProps> = ({
  playerID,
  rosterMap,
  zoneInputList,
  lineCategory,
  lineIDX,
  optionList,
  ChangeState,
  ChangePlayerInput,
  property,
  activatePlayer,
  league,
  offenseSystemInformation,
  defenseSystemInformation,
  zoneCategory,
}) => {
  const player = rosterMap[playerID];
  const GetValue = useCallback(
    (opts: SingleValue<SelectOption>) => {
      if (opts) {
        ChangeState(Number(opts.value), property);
      }
    },
    [ChangeState, property],
  );

  const placeHolder = useMemo(() => {
    if (player && playerID > 0) {
      return `${player.Position} ${player.FirstName} ${player.LastName}`;
    }
    return "None";
  }, [player, playerID]);

  const ChangeInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      ChangePlayerInput(
        playerID,
        event.target.name,
        Number(event.target.value),
      );
    },
    [ChangePlayerInput, playerID],
  );

  const selectedOption = useMemo(() => {
    return optionList.find((opt) => Number(opt.value) === playerID) || null;
  }, [optionList, playerID]);

  const staminaTextColor = useMemo(() => {
    if (!player) return "";
    if (player.GoalieStamina < 30) {
      return "text-red-400";
    }
    if (player.GoalieStamina > 75) {
      return "text-green-400";
    }
    return "";
  }, [player]);

  const isGoodOffensiveFit = useMemo(() => {
    if (!player || !offenseSystemInformation) return false;
    const goodFits = offenseSystemInformation.GoodFits;
    const idx = goodFits.findIndex(
      (x: any) => x.archetype === player.Archetype,
    );
    if (idx > -1) {
      return true;
    }
    return false;
  }, [player, offenseSystemInformation]);

  const isBadOffensiveFit = useMemo(() => {
    if (!player || !offenseSystemInformation) return false;
    const badFits = offenseSystemInformation.BadFits;
    const idx = badFits.findIndex((x: any) => x.archetype === player.Archetype);
    if (idx > -1) {
      return true;
    }
    return false;
  }, [player, offenseSystemInformation]);

  const isGoodDefensiveFit = useMemo(() => {
    if (!player || !defenseSystemInformation) return false;
    const goodFits = defenseSystemInformation.GoodFits;
    const idx = goodFits.findIndex(
      (x: any) => x.archetype === player.Archetype,
    );
    if (idx > -1) {
      return true;
    }
    return false;
  }, [player, defenseSystemInformation]);

  const isBadDefensiveFit = useMemo(() => {
    if (!player || !defenseSystemInformation) return false;
    const badFits = defenseSystemInformation.BadFits;
    const idx = badFits.findIndex((x: any) => x.archetype === player.Archetype);
    if (idx > -1) {
      return true;
    }
    return false;
  }, [player, defenseSystemInformation]);

  return (
    <div className="flex flex-col px-4 h-full w-full max-w-[85vw] sm:max-w-[40vw] md:max-w-[30vw] lg:max-w-[20vw] xl:max-w-[15vw]">
      <>
        <div className="flex flex-row mb-2 gap-x-1 justify-end w-full items-end">
          {playerID > 0 && player && (
            <>
              <Button
                classes="h-full"
                onClick={() => activatePlayer(player)}
                disabled={!player}
              >
                <Info />
              </Button>
            </>
          )}
          <SelectDropdown
            value={selectedOption}
            onChange={GetValue}
            options={optionList}
            placeholder={placeHolder}
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: "32px", // shorter control
                fontSize: "1.5vh", // smaller text
                backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                color: "#ffffff",
                padding: "0.6vh",
                boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                borderRadius: "8px",
                transition: "all 0.2s ease",
                width: "100%",
              }),
              valueContainer: (base: CSSObjectWithLabel) => ({
                ...base,
                padding: "0 0.6vh", // tighter padding
                width: "10rem",
              }),
              singleValue: (base: CSSObjectWithLabel) => ({
                ...base,
                fontSize: "1.5vh",
                color: "#fff",
              }),
              placeholder: (base: CSSObjectWithLabel) => ({
                ...base,
                fontSize: "1.5vh",
                color: "#fff",
              }),
              option: (base: any, state: { isFocused: any }) => ({
                ...base,
                backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                color: "#fff",
                padding: "10px",
                cursor: "pointer",
                // etc.
              }),
              menu: (base: CSSObjectWithLabel) => ({
                ...base,
                fontSize: "0.75rem",
                backgroundColor: "#1a202c",
                borderRadius: "8px",
                color: "#fff",
              }),
              menuList: (provided: any) => ({
                ...provided,
                backgroundColor: "#1a202c",
                padding: "0",
                color: "#fff",
              }),
            }}
          />
        </div>
        {playerID > 0 && player && (
          <>
            <div className="grid grid-cols-2 gap-y-2 text-start mb-2">
              <Text variant="xs">Archetype: {player.Archetype}</Text>
              <Text variant="xs">
                Overall: {getHockeyLetterGrade(player.Overall, player.Year)}
              </Text>
              {isGoodOffensiveFit && (
                <Text variant="xs" className="text-green-400">
                  Good Offensive Fit
                </Text>
              )}
              {!isGoodOffensiveFit && !isBadOffensiveFit && (
                <Text variant="xs" className="text-yellow-400">
                  Neutral Offensive Fit
                </Text>
              )}
              {isBadOffensiveFit && (
                <Text variant="xs" className="text-red-400">
                  Bad Offensive Fit
                </Text>
              )}
              {isGoodDefensiveFit && (
                <Text variant="xs" className="text-green-400">
                  Good Defensive Fit
                </Text>
              )}
              {!isGoodDefensiveFit && !isBadDefensiveFit && (
                <Text variant="xs" className="text-yellow-400">
                  Neutral Defensive Fit
                </Text>
              )}
              {isBadDefensiveFit && (
                <Text variant="xs" className="text-red-400">
                  Bad Defensive Fit
                </Text>
              )}
              {player.Position != "G" &&
                (zoneCategory === DefendingGoalZone ||
                  zoneCategory === DefendingZone) && (
                  <>
                    <Text variant="xs">
                      Body Check:{" "}
                      {league === SimCHL
                        ? getHockeyLetterGrade(player.BodyChecking, player.Year)
                        : player.BodyChecking}
                    </Text>
                    <Text variant="xs">
                      Stick Check:{" "}
                      {league === SimCHL
                        ? getHockeyLetterGrade(
                            player.StickChecking,
                            player.Year,
                          )
                        : player.StickChecking}
                    </Text>
                    <Text variant="xs">
                      Shot Block:{" "}
                      {league === SimCHL
                        ? getHockeyLetterGrade(player.ShotBlocking, player.Year)
                        : player.ShotBlocking}
                    </Text>
                    <Text variant="xs">
                      Agility:{" "}
                      {league === SimCHL
                        ? getHockeyLetterGrade(player.Agility, player.Year)
                        : player.Agility}
                    </Text>
                  </>
                )}
              {player.Position != "G" && zoneCategory === NeutralZone && (
                <>
                  <Text variant="xs">
                    Agility:{" "}
                    {league === SimCHL
                      ? getHockeyLetterGrade(player.Agility, player.Year)
                      : player.Agility}
                  </Text>
                  <Text variant="xs">
                    Passing:{" "}
                    {league === SimCHL
                      ? getHockeyLetterGrade(player.Passing, player.Year)
                      : player.Passing}
                  </Text>
                  <Text variant="xs">
                    Puck Handling:{" "}
                    {league === SimCHL
                      ? getHockeyLetterGrade(player.PuckHandling, player.Year)
                      : player.PuckHandling}
                  </Text>
                </>
              )}
              {player.Position != "G" && zoneCategory === AttackingZone && (
                <>
                  <Text variant="xs">
                    Agility:{" "}
                    {league === SimCHL
                      ? getHockeyLetterGrade(player.Agility, player.Year)
                      : player.Agility}
                  </Text>
                  <Text variant="xs">
                    Passing:{" "}
                    {league === SimCHL
                      ? getHockeyLetterGrade(player.Passing, player.Year)
                      : player.Passing}
                  </Text>
                  <Text variant="xs">
                    Long Shot Accuracy:{" "}
                    {league === SimCHL
                      ? getHockeyLetterGrade(
                          player.LongShotAccuracy,
                          player.Year,
                        )
                      : player.LongShotAccuracy}
                  </Text>
                  <Text variant="xs">
                    Long Shot Power:{" "}
                    {league === SimCHL
                      ? getHockeyLetterGrade(player.LongShotPower, player.Year)
                      : player.LongShotPower}
                  </Text>
                </>
              )}
              {player.Position != "G" && zoneCategory === AttackingGoalZone && (
                <>
                  <Text variant="xs">
                    Agility:{" "}
                    {league === SimCHL
                      ? getHockeyLetterGrade(player.Agility, player.Year)
                      : player.Agility}
                  </Text>
                  <Text variant="xs">
                    Passing:{" "}
                    {league === SimCHL
                      ? getHockeyLetterGrade(player.Passing, player.Year)
                      : player.Passing}
                  </Text>
                  <Text variant="xs">
                    Close Shot Accuracy:{" "}
                    {league === SimCHL
                      ? getHockeyLetterGrade(
                          player.CloseShotAccuracy,
                          player.Year,
                        )
                      : player.CloseShotAccuracy}
                  </Text>
                  <Text variant="xs">
                    Close Shot Power:{" "}
                    {league === SimCHL
                      ? getHockeyLetterGrade(player.CloseShotPower, player.Year)
                      : player.CloseShotPower}
                  </Text>
                </>
              )}
            </div>
            <div className="flex flex-col gap-y-2 flex-1">
              {property !== "GoalieID" &&
                zoneInputList.map((x) => (
                  <Input
                    type="number"
                    key={x.key}
                    label={x.label}
                    name={x.key}
                    value={player[x.key] as number}
                    onChange={ChangeInput}
                  />
                ))}
              {property === "GoalieID" && (
                <div className="mt-2 grid grid-cols-2 gap-y-2">
                  <Text variant="small">Agility</Text>
                  <Text variant="small" classes="font-semibold">
                    {league === SimCHL
                      ? getHockeyLetterGrade(player.Agility, player.Year)
                      : player.Agility}
                  </Text>
                  <Text variant="small">Strength</Text>
                  <Text variant="small" classes="font-semibold">
                    {league === SimCHL
                      ? getHockeyLetterGrade(player.Strength, player.Year)
                      : player.Strength}
                  </Text>
                  <Text variant="small">Goalie Vision</Text>
                  <Text variant="small" classes="font-semibold">
                    {league === SimCHL
                      ? getHockeyLetterGrade(player.GoalieVision, player.Year)
                      : player.GoalieVision}
                  </Text>
                  <Text variant="small">Goalkeeping</Text>
                  <Text variant="small" classes="font-semibold">
                    {league === SimCHL
                      ? getHockeyLetterGrade(player.Goalkeeping, player.Year)
                      : player.Goalkeeping}
                  </Text>
                  <Text variant="small" classes="border-t-[0.1em] pt-2">
                    Current Stamina
                  </Text>
                  <Text
                    variant="small"
                    classes={`font-semibold border-t-[0.1em] pt-2 ${staminaTextColor}`}
                  >
                    {player.GoalieStamina}
                  </Text>
                  <Text variant="small">Max Stamina</Text>
                  <Text variant="small" classes="font-semibold">
                    100
                  </Text>
                </div>
              )}
            </div>
          </>
        )}
      </>
    </div>
  );
};

interface ShootoutPlayerProps {
  league: League;
  playerID: number;
  idx: number;
  rosterMap: Record<number, CollegePlayer | ProfessionalPlayer>;
  lineCategory: CollegeShootoutLineup | ProfessionalShootoutLineup;
  optionList: { label: string; value: string }[];
  ChangeState: (value: number, property: string) => void;
  property: string;
  shootoutProperty: string;
  activatePlayer: (player: CollegePlayer | ProfessionalPlayer) => void;
}

export const ShootoutPlayer: FC<ShootoutPlayerProps> = ({
  league,
  playerID,
  idx,
  rosterMap,
  optionList,
  ChangeState,
  property,
  shootoutProperty,
  lineCategory,
  activatePlayer,
}) => {
  // if (playerID === 0) {
  //   return <></>;
  // }
  const player = rosterMap[playerID];

  const placeHolder = useMemo(() => {
    if (player && playerID > 0) {
      return `${player.Position} ${player.FirstName} ${player.LastName}`;
    }
    return "None";
  }, [player, playerID]);

  const GetValue = useCallback(
    (opts: SingleValue<SelectOption>) => {
      if (opts) {
        ChangeState(Number(opts.value), property);
      }
    },
    [ChangeState, property],
  );
  const GetShootoutValue = useCallback(
    (opts: SingleValue<SelectOption>) =>
      ChangeState(Number(opts?.value), shootoutProperty),
    [ChangeState, shootoutProperty],
  );

  const shootoutPlaceholder = useMemo(() => {
    return getShootoutPlaceholder(lineCategory[shootoutProperty]);
  }, [lineCategory]);

  const selectedOption = useMemo(() => {
    return optionList.find((opt) => Number(opt.value) === playerID) || null;
  }, [optionList, lineCategory, property, playerID]);

  const shotTypeSelectedOption = useMemo(() => {
    return (
      getShootoutOptionList().find(
        (opt) => Number(opt.value) === lineCategory[shootoutProperty],
      ) || null
    );
  }, [lineCategory, shootoutProperty]);

  return (
    <div className="flex flex-col gap-2 px-4 pb-2">
      <div className="flex flex-row gap-x-2">
        <label className="flex items-center min-[1025px]:justify-end min-[1025px]:text-end">
          Player {idx}
        </label>
      </div>
      <div className="flex flex-row gap-x-2">
        <Button
          classes=""
          onClick={() => activatePlayer(player)}
          disabled={!player}
        >
          <Info />
        </Button>
        <SelectDropdown
          key={`${property}-${playerID}`}
          value={selectedOption}
          onChange={GetValue}
          options={optionList}
          placeholder={`${placeHolder}`}
          styles={{
            control: (provided, state) => ({
              ...provided,
              backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
              borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
              color: "#ffffff",
              width: "15rem",
              maxWidth: "300px",
              padding: "0.3rem",
              boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }),
            menu: (provided) => ({
              ...provided,
              backgroundColor: "#1a202c",
              borderRadius: "8px",
            }),
            menuList: (provided) => ({
              ...provided,
              backgroundColor: "#1a202c",
              padding: "0",
            }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
              color: "#ffffff",
              padding: "10px",
              cursor: "pointer",
            }),
            singleValue: (provided) => ({
              ...provided,
              color: "#ffffff",
            }),
            placeholder: (provided) => ({
              ...provided,
              color: "#ffffff",
            }),
          }}
        />
      </div>
      <div className="flex flex-col w-full">
        <label className="flex items-center min-[1025px]:justify-start mr-2">
          Shot Type {idx}
        </label>
        <SelectDropdown
          value={shotTypeSelectedOption}
          onChange={GetShootoutValue}
          options={getShootoutOptionList()}
          placeholder={shootoutPlaceholder}
          styles={{
            control: (provided, state) => ({
              ...provided,
              backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
              borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
              color: "#ffffff",
              width: "100%",
              maxWidth: "300px",
              padding: "0.3rem",
              boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }),
            menu: (provided) => ({
              ...provided,
              backgroundColor: "#1a202c",
              borderRadius: "8px",
            }),
            menuList: (provided) => ({
              ...provided,
              backgroundColor: "#1a202c",
              padding: "0",
            }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
              color: "#ffffff",
              padding: "10px",
              cursor: "pointer",
            }),
            singleValue: (provided) => ({
              ...provided,
              color: "#ffffff",
            }),
            placeholder: (provided) => ({
              ...provided,
              color: "#ffffff",
            }),
          }}
        />
      </div>
      {player && (
        <div className="grid grid-cols-2 w-[80%]">
          <Text variant="xs">
            Close Shot Accuracy:{" "}
            {league === SimCHL
              ? getHockeyLetterGrade(player.CloseShotAccuracy, player.Year)
              : player.CloseShotAccuracy}
          </Text>
          <Text variant="xs">
            Close Shot Power:{" "}
            {league === SimCHL
              ? getHockeyLetterGrade(player.CloseShotPower, player.Year)
              : player.CloseShotPower}
          </Text>
          <Text variant="xs">
            Long Shot Accuracy:{" "}
            {league === SimCHL
              ? getHockeyLetterGrade(player.LongShotAccuracy, player.Year)
              : player.LongShotAccuracy}
          </Text>
          <Text variant="xs">
            Long Shot Power:{" "}
            {league === SimCHL
              ? getHockeyLetterGrade(player.LongShotPower, player.Year)
              : player.LongShotPower}
          </Text>
        </div>
      )}
    </div>
  );
};

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: League;
  player: any;
  modalAction: ModalAction;
}

export const LineupHelpModal: FC<HelpModalProps> = ({
  isOpen,
  onClose,
  league,
  modalAction,
  player,
}) => {
  let title = "Lineup Page";
  if (modalAction === InfoType) {
    title = `${player.ID} ${player.Position} ${player.FirstName} ${player.LastName}`;
  } else if (modalAction === Help2) {
    title = `Zone Input Fields`;
  } else if (modalAction === Help3) {
    title = `Player Zone Input Fields`;
  }
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        actions={
          <>
            <ButtonGroup>
              <Button size="sm" variant="primary" onClick={onClose}>
                <Text variant="small">Close</Text>
              </Button>
            </ButtonGroup>
          </>
        }
      >
        {modalAction === InfoType && (
          <PlayerInfoModalBody league={league} player={player} />
        )}
        {modalAction === Help1 && (
          <div className="overflow-y-auto max-h-[60vh]">
            <Text className="mb-4 text-start">
              Welcome to the {league} Lineup Page.
            </Text>
            <Text className="mb-4 text-start">
              On this page, you can customize your lineups for all of your
              forwards, defenders, and goalies; including a shootout lineup as
              well.
            </Text>
            <Text className="mb-4 text-start">
              To better explain, each user will have access to four Forward
              lines, and three Defensive lines, and two Goalie lines. The first
              set of buttons allows you to view any of these lines.
            </Text>
            <Text className="mb-4 text-start">
              Each forward line must have two forwards and a center; each
              defensive line must have two defenders, and each Goalie line must
              have one goalie.
            </Text>
            <Text className="mb-4 text-start">
              Users can set two Goalie lines, with each Goalie line
              corresponding to the alternating schedule in the college hockey
              season. The same Goalie cannot start on both Goalie lines.
            </Text>
            <Text className="mb-4 text-start">
              The second set of buttons controls which zone of the rink you are
              viewing. Defending Goal Zone is the area around your goalie and
              the net. Defending Zone is the outer perimeter of the defensive
              zone up to the blue line. The neutral zone is the very center of
              the rink. The attacking zone is the outer area of your opponent's
              side of the rink. Finally, the Attacking Goal Zone is the area
              around your opponent's goalie and net.
            </Text>
            <Text className="mb-4 text-start">
              For more information, please view the{" "}
              <a
                href="https://docs.google.com/document/d/18h6drOHquHfhOdU9mdToBr39N8gyKQjC7CXvNbuy0XU/edit?usp=sharing"
                target="_blank"
              >
                Gameplan & Strategy
              </a>{" "}
              section of the SimHCK documentation.
            </Text>
          </div>
        )}
        {modalAction === Help2 && (
          <div className="overflow-y-auto max-h-[60vh]">
            <Text className="mb-4 text-start">
              Zone Inputs allow you to control the behavior of your selected
              line based on the area of the rink they are in.
            </Text>
            <Text className="mb-4 text-start">
              At a group level, you can configure how often you want your line
              to pass, move forward, shoot, even react defensively based on the
              designated zone the puck is located.
            </Text>
            <Text className="mb-4 text-start">
              If one of the players on your designated line is in possession of
              the puck, they will make a decision based on the designated zone
              input configurations made.
            </Text>
            <Text className="mb-4 text-start">
              For all non-check inputs (all except body-check and stick-check),
              users may input anywhere between 0-25 on any of the inputs. The
              total of all non-check inputs *must* equal to 15 times the number
              of non-check inputs.
            </Text>
            <Text className="mb-4 text-start">
              For more information, please view the{" "}
              <a
                href="https://docs.google.com/document/d/18h6drOHquHfhOdU9mdToBr39N8gyKQjC7CXvNbuy0XU/edit?usp=sharing"
                target="_blank"
              >
                Gameplan & Strategy
              </a>{" "}
              section of the SimHCK documentation.
            </Text>
          </div>
        )}
        {modalAction === Help3 && (
          <div className="overflow-y-auto max-h-[60vh]">
            <Text className="mb-4 text-start">
              Users are able to assign players to any line of their choosing.
              Each forward line must have one center and two forwards; each
              defensive line must have two defenders, and each goalie line must
              have one goalie.
            </Text>
            <Text className="mb-4 text-start">
              In addition to the zone inputs, you can alter the behavior of your
              designated line even further using the{" "}
              <strong>player zone inputs</strong>.
            </Text>
            <Text className="mb-4 text-start">
              The player zone inputs can alter the behavior of any of your line
              players even further. This allows users to control even further
              whenever a specific player has possession of the puck.{" "}
            </Text>
            <Text className="mb-4 text-start">
              The range of all player zone inputs is between -10 and 10, given
              the designated area of the rink.
            </Text>
            <Text className="mb-4 text-start">
              For more information, please view the{" "}
              <a
                href="https://docs.google.com/document/d/18h6drOHquHfhOdU9mdToBr39N8gyKQjC7CXvNbuy0XU/edit?usp=sharing"
                target="_blank"
              >
                Gameplan & Strategy
              </a>{" "}
              section of the SimHCK documentation.
            </Text>
          </div>
        )}
      </Modal>
    </>
  );
};

interface HCKAIGameplanModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: League;
  gameplan: CollegeGameplan | ProGameplan;
  saveGameplan: (dto: any) => Promise<void>;
}

export const HCKAIGameplanModal: FC<HCKAIGameplanModalProps> = ({
  isOpen,
  onClose,
  league,
  gameplan,
  saveGameplan,
}) => {
  let title = `${league} Gameplan Settings`;
  const [currentGameplan, setCurrentGameplan] = useState<
    CollegeGameplan | ProGameplan
  >(gameplan);

  // Sync currentGameplan with gameplan prop updates
  useEffect(() => {
    setCurrentGameplan(gameplan);
  }, [gameplan]);

  const [selectedCenterSort, setSelectedCenterSort] = useState(() => {
    let list = [];
    if (gameplan.CenterSortPreference1 > 0) {
      list.push(getHCKAISortObject(gameplan.CenterSortPreference1));
    }
    if (gameplan.CenterSortPreference2 > 0) {
      list.push(getHCKAISortObject(gameplan.CenterSortPreference2));
    }
    if (gameplan.CenterSortPreference3 > 0) {
      list.push(getHCKAISortObject(gameplan.CenterSortPreference3));
    }
    return list;
  });

  const [selectedForwardSort, setSelectedForwardSort] = useState(() => {
    let list = [];
    if (gameplan.ForwardSortPreference1 > 0) {
      list.push(getHCKAISortObject(gameplan.ForwardSortPreference1));
    }
    if (gameplan.ForwardSortPreference2 > 0) {
      list.push(getHCKAISortObject(gameplan.ForwardSortPreference2));
    }
    if (gameplan.ForwardSortPreference3 > 0) {
      list.push(getHCKAISortObject(gameplan.ForwardSortPreference3));
    }
    return list;
  });

  const [selectedDefenderSort, setSelectedDefenderSort] = useState(() => {
    let list = [];
    if (gameplan.DefenderSortPreference1 > 0) {
      list.push(getHCKAISortObject(gameplan.DefenderSortPreference1));
    }
    if (gameplan.DefenderSortPreference2 > 0) {
      list.push(getHCKAISortObject(gameplan.DefenderSortPreference2));
    }
    if (gameplan.DefenderSortPreference3 > 0) {
      list.push(getHCKAISortObject(gameplan.DefenderSortPreference3));
    }
    return list;
  });

  const selectedForwardShotPreference = useMemo(() => {
    return getHCKAIShotPreferenceObject(currentGameplan.ForwardShotPreference);
  }, [currentGameplan]);

  const selectedDefenderShotPreference = useMemo(() => {
    return getHCKAIShotPreferenceObject(currentGameplan.DefenderShotPreference);
  }, [currentGameplan]);

  const selectedForwardCheckPreference = useMemo(() => {
    return getHCKAICheckPreferenceObject(
      currentGameplan.ForwardCheckPreference,
    );
  }, [currentGameplan]);

  const selectedDefenderCheckPreference = useMemo(() => {
    return getHCKAICheckPreferenceObject(
      currentGameplan.DefenderCheckPreference,
    );
  }, [currentGameplan]);

  const selectedGoalieSort = useMemo(() => {
    return getHCKGoalieSortObject(currentGameplan.GoalieSortPreference);
  }, [currentGameplan]);

  const toggleAIGameplan = () => {
    if (league === SimCHL) {
      setCurrentGameplan((gp) => {
        return new CollegeGameplan({ ...gp, IsAI: !gp.IsAI });
      });
    } else {
      setCurrentGameplan((gp) => {
        return new ProGameplan({ ...gp, IsAI: !gp.IsAI });
      });
    }
  };

  const toggleLongPasses = () => {
    if (league === SimCHL) {
      setCurrentGameplan((gp) => {
        return new CollegeGameplan({
          ...gp,
          LongerPassesEnabled: !gp.LongerPassesEnabled,
        });
      });
    } else {
      setCurrentGameplan((gp) => {
        return new ProGameplan({
          ...gp,
          LongerPassesEnabled: !gp.LongerPassesEnabled,
        });
      });
    }
  };

  const GetForwardShotPreference = useCallback(
    (opts: SingleValue<SelectOption>) => {
      const val = Number(opts?.value);
      if (opts) {
        if (league === SimCHL) {
          setCurrentGameplan((gp) => {
            return new CollegeGameplan({ ...gp, ForwardShotPreference: val });
          });
        } else {
          setCurrentGameplan((gp) => {
            return new ProGameplan({ ...gp, ForwardShotPreference: val });
          });
        }
      }
    },
    [],
  );

  const GetDefenderShotPreference = useCallback(
    (opts: SingleValue<SelectOption>) => {
      const val = Number(opts?.value);
      if (opts) {
        if (league === SimCHL) {
          setCurrentGameplan((gp) => {
            return new CollegeGameplan({ ...gp, DefenderShotPreference: val });
          });
        } else {
          setCurrentGameplan((gp) => {
            return new ProGameplan({ ...gp, DefenderShotPreference: val });
          });
        }
      }
    },
    [],
  );

  const GetForwardCheckPreference = useCallback(
    (opts: SingleValue<SelectOption>) => {
      const val = Number(opts?.value);
      if (opts) {
        if (league === SimCHL) {
          setCurrentGameplan((gp) => {
            return new CollegeGameplan({ ...gp, ForwardCheckPreference: val });
          });
        } else {
          setCurrentGameplan((gp) => {
            return new ProGameplan({ ...gp, ForwardCheckPreference: val });
          });
        }
      }
    },
    [],
  );

  const GetDefenderCheckPreference = useCallback(
    (opts: SingleValue<SelectOption>) => {
      const val = Number(opts?.value);
      if (opts) {
        if (league === SimCHL) {
          setCurrentGameplan((gp) => {
            return new CollegeGameplan({ ...gp, DefenderCheckPreference: val });
          });
        } else {
          setCurrentGameplan((gp) => {
            return new ProGameplan({ ...gp, DefenderCheckPreference: val });
          });
        }
      }
    },
    [],
  );

  const GetCenterSortPreference = useCallback((opts: any) => {
    setSelectedCenterSort(opts);
  }, []);

  const GetForwardSortPreference = useCallback((opts: any) => {
    setSelectedForwardSort(opts);
  }, []);

  const GetDefenderSortPreference = useCallback((opts: any) => {
    setSelectedDefenderSort(opts);
  }, []);

  const GetGoalieSortPreference = useCallback(
    (opts: SingleValue<SelectOption>) => {
      const value = Number(opts?.value);
      if (league === SimCHL) {
        setCurrentGameplan((gp) => {
          return new CollegeGameplan({ ...gp, GoalieSortPreference: value });
        });
      } else {
        setCurrentGameplan((gp) => {
          return new ProGameplan({ ...gp, GoalieSortPreference: value });
        });
      }
    },
    [],
  );

  const dropdownOptions = getHCKAIGameplanOptionsOptions();

  const save = async () => {
    let centerSort1 = 1;
    let centerSort2 = 0;
    let centerSort3 = 0;
    let forwardSort1 = 1;
    let forwardSort2 = 0;
    let forwardSort3 = 0;
    let defenderSort1 = 1;
    let defenderSort2 = 0;
    let defenderSort3 = 0;

    let gp = { ...currentGameplan };

    if (selectedCenterSort.length > 0) {
      for (let i = 0; i < selectedCenterSort.length; i++) {
        gp[`CenterSortPreference${i + 1}`] = Number(
          selectedCenterSort[i].value,
        );
      }
    } else {
      gp[`CenterSortPreference1`] = centerSort1;
      gp[`CenterSortPreference2`] = centerSort2;
      gp[`CenterSortPreference3`] = centerSort3;
    }

    if (selectedForwardSort.length > 0) {
      for (let i = 0; i < selectedForwardSort.length; i++) {
        gp[`ForwardSortPreference${i + 1}`] = Number(
          selectedForwardSort[i].value,
        );
      }
    } else {
      gp[`ForwardSortPreference1`] = forwardSort1;
      gp[`ForwardSortPreference2`] = forwardSort2;
      gp[`ForwardSortPreference3`] = forwardSort3;
    }
    if (selectedDefenderSort.length > 0) {
      for (let i = 0; i < selectedDefenderSort.length; i++) {
        gp[`DefenderSortPreference${i + 1}`] = Number(
          selectedDefenderSort[i].value,
        );
      }
    } else {
      gp[`DefenderSortPreference1`] = defenderSort1;
      gp[`DefenderSortPreference2`] = defenderSort2;
      gp[`DefenderSortPreference3`] = defenderSort3;
    }

    onClose();
    await saveGameplan(gp);
  };

  const GetOffensiveSystem = useCallback((opts: SingleValue<SelectOption>) => {
    const val = Number(opts?.value);
    if (opts) {
      if (league === SimCHL) {
        setCurrentGameplan((gp) => {
          return new CollegeGameplan({ ...gp, OffensiveSystem: val });
        });
      } else {
        setCurrentGameplan((gp) => {
          return new ProGameplan({ ...gp, OffensiveSystem: val });
        });
      }
    }
  }, []);

  const GetDefensiveSystem = useCallback((opts: SingleValue<SelectOption>) => {
    const val = Number(opts?.value);
    if (opts) {
      if (league === SimCHL) {
        setCurrentGameplan((gp) => {
          return new CollegeGameplan({ ...gp, DefensiveSystem: val });
        });
      } else {
        setCurrentGameplan((gp) => {
          return new ProGameplan({ ...gp, DefensiveSystem: val });
        });
      }
    }
  }, []);

  const offensiveSystem = useMemo(() => {
    return getOffensiveSystemFromMap(currentGameplan.OffensiveSystem);
  }, [currentGameplan]);
  const defensiveSystem = useMemo(() => {
    return getDefensiveSystemFromMap(currentGameplan.DefensiveSystem);
  }, [currentGameplan]);

  const setIntensity = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (value < 1 || value > 10) {
      return;
    }
    if (league === SimCHL) {
      setCurrentGameplan((gp) => {
        return new CollegeGameplan({ ...gp, [event.target.name]: value });
      });
    } else {
      setCurrentGameplan((gp) => {
        return new ProGameplan({ ...gp, [event.target.name]: value });
      });
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        maxWidth="max-w-[50rem]"
        actions={
          <>
            <ButtonGroup>
              <Button size="sm" variant="primary" onClick={onClose}>
                <Text variant="small">Close</Text>
              </Button>
              <Button size="sm" variant="primary" onClick={save}>
                <Text variant="small">Confirm</Text>
              </Button>
            </ButtonGroup>
          </>
        }
      >
        <div className="overflow-y-auto max-h-[60vh] md:max-h-full">
          <div className="grid grid-cols-2 items-start space-x-2  mb-4">
            <div className="flex flex-row space-x-3">
              <Text>AI Toggle</Text>
              <ToggleSwitch
                checked={currentGameplan.IsAI}
                onChange={toggleAIGameplan}
              />
            </div>
            <div className="flex flex-row space-x-3">
              <Text>Enable Long Passes</Text>
              <ToggleSwitch
                checked={currentGameplan.LongerPassesEnabled}
                onChange={toggleLongPasses}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-2 mb-2">
            <div className="flex flex-col w-full">
              <label className="flex items-center min-[1025px]:justify-start mr-2">
                Offensive System
              </label>
              <SelectDropdown
                value={offensiveSystem}
                onChange={GetOffensiveSystem}
                options={dropdownOptions.offensiveSystemOptions}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                    color: "#ffffff",
                    width: "100%",
                    maxWidth: "300px",
                    padding: "0.3rem",
                    boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    borderRadius: "8px",
                  }),
                  menuList: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    padding: "0",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    color: "#ffffff",
                    padding: "10px",
                    cursor: "pointer",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                }}
              />
            </div>
            <div className="flex flex-col w-full">
              <label className="flex items-center min-[1025px]:justify-start mr-2">
                Defensive System
              </label>
              <SelectDropdown
                value={defensiveSystem}
                onChange={GetDefensiveSystem}
                options={dropdownOptions.defensiveSystemOptions}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                    color: "#ffffff",
                    width: "100%",
                    maxWidth: "300px",
                    padding: "0.3rem",
                    boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    borderRadius: "8px",
                  }),
                  menuList: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    padding: "0",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    color: "#ffffff",
                    padding: "10px",
                    cursor: "pointer",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                }}
              />
            </div>
            <div className="flex flex-col w-full">
              <Slider
                name="OffensiveIntensity"
                label="Offensive Intensity"
                value={currentGameplan.OffensiveIntensity}
                onChange={(e) => setIntensity(e)}
                min={1}
                max={10}
                valueLabel={`${currentGameplan.OffensiveIntensity}`}
                className="max-w-[82%]"
              />
            </div>
            <div className="flex flex-col w-full">
              <Slider
                name="DefensiveIntensity"
                label="Defensive Intensity"
                value={currentGameplan.DefensiveIntensity}
                onChange={(e) => setIntensity(e)}
                min={1}
                max={10}
                valueLabel={`${currentGameplan.DefensiveIntensity}`}
                className="max-w-[82%]"
              />
            </div>
            <div className="flex flex-col w-full">
              <label className="flex items-center min-[1025px]:justify-start mr-2">
                Forward Shot Preference
              </label>
              <SelectDropdown
                value={selectedForwardShotPreference}
                onChange={GetForwardShotPreference}
                options={dropdownOptions.shotPreferenceOptions}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                    color: "#ffffff",
                    width: "100%",
                    maxWidth: "300px",
                    padding: "0.3rem",
                    boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    borderRadius: "8px",
                  }),
                  menuList: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    padding: "0",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    color: "#ffffff",
                    padding: "10px",
                    cursor: "pointer",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                }}
              />
            </div>
            <div className="flex flex-col w-full">
              <label className="flex items-center min-[1025px]:justify-start mr-2">
                Defender Shot Preference
              </label>
              <SelectDropdown
                value={selectedDefenderShotPreference}
                onChange={GetDefenderShotPreference}
                options={dropdownOptions.shotPreferenceOptions}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                    color: "#ffffff",
                    width: "100%",
                    maxWidth: "300px",
                    padding: "0.3rem",
                    boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    borderRadius: "8px",
                  }),
                  menuList: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    padding: "0",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    color: "#ffffff",
                    padding: "10px",
                    cursor: "pointer",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                }}
              />
            </div>
            <div className="flex flex-col w-full">
              <label className="flex items-center min-[1025px]:justify-start mr-2">
                Forward Check Preference
              </label>
              <SelectDropdown
                value={selectedForwardCheckPreference}
                onChange={GetForwardCheckPreference}
                options={dropdownOptions.defensePreferenceOptions}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                    color: "#ffffff",
                    width: "100%",
                    maxWidth: "300px",
                    padding: "0.3rem",
                    boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    borderRadius: "8px",
                  }),
                  menuList: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    padding: "0",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    color: "#ffffff",
                    padding: "10px",
                    cursor: "pointer",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                }}
              />
            </div>
            <div className="flex flex-col w-full">
              <label className="flex items-center min-[1025px]:justify-start mr-2">
                Defender Check Preference
              </label>
              <SelectDropdown
                value={selectedDefenderCheckPreference}
                onChange={GetDefenderCheckPreference}
                options={dropdownOptions.defensePreferenceOptions}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                    color: "#ffffff",
                    width: "100%",
                    maxWidth: "300px",
                    padding: "0.3rem",
                    boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    borderRadius: "8px",
                  }),
                  menuList: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    padding: "0",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    color: "#ffffff",
                    padding: "10px",
                    cursor: "pointer",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-2">
            <div className="flex flex-col w-full">
              <label className="flex items-center min-[1025px]:justify-start mr-2">
                Center Sort Preference
              </label>
              <SelectDropdown
                isMulti
                value={selectedCenterSort}
                onChange={GetCenterSortPreference}
                options={dropdownOptions.playerSortPreferenceOptions}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                    color: "#ffffff",
                    width: "100%",
                    maxWidth: "300px",
                    padding: "0.3rem",
                    boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    borderRadius: "8px",
                  }),
                  menuList: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    padding: "0",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    color: "#ffffff",
                    padding: "10px",
                    cursor: "pointer",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                }}
              />
            </div>
            <div className="flex flex-col w-full">
              <label className="flex items-center min-[1025px]:justify-start mr-2">
                Forward Sort Preference
              </label>
              <SelectDropdown
                isMulti
                value={selectedForwardSort}
                onChange={GetForwardSortPreference}
                options={dropdownOptions.playerSortPreferenceOptions}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                    color: "#ffffff",
                    width: "100%",
                    maxWidth: "300px",
                    padding: "0.3rem",
                    boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    borderRadius: "8px",
                  }),
                  menuList: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    padding: "0",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    color: "#ffffff",
                    padding: "10px",
                    cursor: "pointer",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                }}
              />
            </div>
            <div className="flex flex-col w-full">
              <label className="flex items-center min-[1025px]:justify-start mr-2">
                Defender Sort Preference
              </label>
              <SelectDropdown
                isMulti
                value={selectedDefenderSort}
                onChange={GetDefenderSortPreference}
                options={dropdownOptions.playerSortPreferenceOptions}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                    color: "#ffffff",
                    width: "100%",
                    maxWidth: "300px",
                    padding: "0.3rem",
                    boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    borderRadius: "8px",
                  }),
                  menuList: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    padding: "0",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    color: "#ffffff",
                    padding: "10px",
                    cursor: "pointer",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                }}
              />
            </div>
            <div className="flex flex-col w-full">
              <label className="flex items-center min-[1025px]:justify-start mr-2">
                Goalie Sort Preference
              </label>
              <SelectDropdown
                value={selectedGoalieSort}
                onChange={GetGoalieSortPreference}
                options={dropdownOptions.goalieSortPreferenceOptions}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                    color: "#ffffff",
                    width: "100%",
                    maxWidth: "300px",
                    padding: "0.3rem",
                    boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    borderRadius: "8px",
                  }),
                  menuList: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    padding: "0",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    color: "#ffffff",
                    padding: "10px",
                    cursor: "pointer",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                  }),
                }}
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
