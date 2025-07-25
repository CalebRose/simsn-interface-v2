import { useCallback, useMemo, useState } from "react";
import { useModal } from "../../../_hooks/useModal";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import {
  CollegeLineup,
  CollegePlayer,
  CollegeShootoutLineup,
  ProfessionalLineup,
  ProfessionalPlayer,
  ProfessionalShootoutLineup,
} from "../../../models/hockeyModels";
import { useCHLLineupUtils, usePHLLineupUtils } from "./useLineupUtils";
import { Border } from "../../../_design/Borders";
import { Button, ButtonGrid, ButtonGroup } from "../../../_design/Buttons";
import {
  DefendingGoalZone,
  Help1,
  Help2,
  Help3,
  InfoType,
  Lineup,
  LineupF1,
  LineupG1,
  LineupG2,
  LineupSO,
  ModalAction,
  navyBlueColor,
  SimCHL,
  SimPHL,
  Zone,
} from "../../../_constants/constants";
import { Text } from "../../../_design/Typography";
import { Input } from "../../../_design/Inputs";
import {
  getLineupDropdownOptions,
  getLineupIdx,
  getZoneInputList,
  updateLineupFieldWithClass,
} from "./lineupHelper";
import {
  HCKAIGameplanModal,
  LineupHelpModal,
  LineupPlayer,
  ShootoutPlayer,
} from "./LineupComponents";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { useResponsive } from "../../../_hooks/useMobile";

export const CHLLineupPage = () => {
  const hkStore = useSimHCKStore();
  const {
    chlTeam,
    chlRosterMap,
    updateCHLRosterMap,
    chlLineups,
    chlShootoutLineup,
    saveCHLGameplan,
    chlGameplan,
    saveCHLAIGameplan,
  } = hkStore;
  const [lineCategory, setLineCategory] = useState<Lineup>(LineupF1);
  const [zoneCategory, setZoneCategory] = useState<Zone>(DefendingGoalZone);
  const [originalLineups, setOriginalLineups] = useState(chlLineups);
  const [originalShootoutLineups, setOriginalShootoutLineups] =
    useState(chlShootoutLineup);
  const [currentLineups, setCurrentLineups] = useState(chlLineups);
  const [currentShootoutLineups, setCurrentShootoutLineups] =
    useState<CollegeShootoutLineup>(chlShootoutLineup);
  const [modalAction, setModalAction] = useState<ModalAction>(Help1);
  const [modalPlayer, setModalPlayer] = useState<
    CollegePlayer | ProfessionalPlayer
  >({} as CollegePlayer);
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();

  const teamColors = useTeamColors(
    chlTeam?.ColorOne,
    chlTeam?.ColorTwo,
    chlTeam?.ColorThree
  );
  const backgroundColor = teamColors.One;
  const borderColor = teamColors.Two;

  const {
    chlTeamRosterMap,
    chlTeamRoster,
    lineupCategories,
    zoneCategories,
    errors,
  } = useCHLLineupUtils(chlTeam!, chlRosterMap, currentLineups);
  const { isMobile } = useResponsive();

  const chlTeamRosterOptions = useMemo(() => {
    if (chlTeamRoster) {
      return getLineupDropdownOptions(chlTeamRoster);
    }
  }, [chlTeamRoster]);

  const zoneInputList = useMemo(
    () => getZoneInputList(zoneCategory),
    [zoneCategory]
  );

  const lineupIdx = useMemo(() => {
    return getLineupIdx(lineCategory);
  }, [lineCategory]);

  const lineup = useMemo(() => {
    return currentLineups[lineupIdx] || ({} as CollegeLineup);
  }, [lineupIdx, currentLineups]);

  const Save = async () => {
    if (chlTeam) {
      setOriginalLineups(currentLineups);
      setOriginalShootoutLineups(currentShootoutLineups);
      const dto = {
        CHLTeamID: chlTeam?.ID,
        CHLLineups: currentLineups,
        CHLShootoutLineup: currentShootoutLineups,
        CollegePlayers: chlRosterMap[chlTeam.ID],
      };
      await saveCHLGameplan(dto);
    }
  };

  const ResetLineups = () => {
    setCurrentLineups(originalLineups);
    setCurrentShootoutLineups(originalShootoutLineups);
    // Will need to also reset the player ids -- actually, those will be reset automatically. Or should be.
  };

  const ChangeValueInShootoutLineup = (value: number, key: string) => {
    updateLineupFieldWithClass(
      setCurrentShootoutLineups,
      CollegeShootoutLineup,
      key,
      value
    );
  };

  const ChangeLineupInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const numericValue = Number(value);
    ChangeLineupValue(numericValue, name);
  };

  const ChangeLineupValue = useCallback(
    (value: number, key: string) => {
      setCurrentLineups((prevLineups) =>
        prevLineups.map((lineup, index) =>
          index === lineupIdx
            ? new CollegeLineup({ ...lineup, [key]: value })
            : lineup
        )
      );
    },
    [lineupIdx]
  );

  const ChangePlayerInput = useCallback(
    (playerID: number, key: string, value: number) => {
      const updatedRosterMap = { ...chlRosterMap };
      updatedRosterMap[chlTeam!.ID] = [...updatedRosterMap[chlTeam!.ID]];
      const playerIdx = updatedRosterMap[chlTeam!.ID]?.findIndex(
        (x) => x.ID === playerID
      );
      if (playerIdx > -1) {
        updatedRosterMap[chlTeam!.ID][playerIdx] = new CollegePlayer({
          ...updatedRosterMap[chlTeam!.ID][playerIdx],
          [key]: value,
        });
        updateCHLRosterMap(updatedRosterMap);
      }
    },
    [chlRosterMap, updateCHLRosterMap, chlTeam]
  );

  const activatePlayerModal = (player: CollegePlayer | ProfessionalPlayer) => {
    setModalAction(InfoType);
    setModalPlayer(player);
    handleOpenModal();
  };

  const changeLineCategory = useCallback((x: Lineup) => {
    setLineCategory(x);
    if (x === LineupG1 || x === LineupG2) {
      setZoneCategory(DefendingGoalZone);
    }
  }, []);

  const isGoalieLineup = useMemo(() => {
    return lineCategory === LineupG1 || lineCategory === LineupG2;
  }, [lineCategory]);

  const aiGameplanModal = useModal();

  return (
    <>
      <HCKAIGameplanModal
        isOpen={aiGameplanModal.isModalOpen}
        onClose={aiGameplanModal.handleCloseModal}
        league={SimCHL}
        gameplan={chlGameplan}
        saveGameplan={saveCHLAIGameplan}
      />
      <div className="w-full grid grid-flow-row max-[1024px]:grid-cols-1 max-[1024px]:gap-y-2 grid-cols-[6fr_4fr] grid-auto-rows-fr h-full max-[1024px]:gap-x-1 gap-x-2 mb-2">
        <div className="flex flex-col w-full h-full max-[1024px]:gap-y-2">
          <div className="flex flex-row md:flex-col w-full h-full">
            <Border
              direction="col"
              classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 px-4 py-2 h-full items-center justify-center"
              styles={{
                borderColor: teamColors.One,
                backgroundColor: navyBlueColor,
              }}
            >
              <ButtonGrid>
                {lineupCategories.map((x) => (
                  <Button
                    key={x}
                    size="sm"
                    classes="lg:text-nowrap"
                    isSelected={lineCategory === x}
                    onClick={() => changeLineCategory(x as Lineup)}
                  >
                    <Text variant="small">{x}</Text>
                  </Button>
                ))}
              </ButtonGrid>
            </Border>
          </div>
          <div className="flex flex-row md:flex-col w-full h-full">
            <Border
              direction="col"
              classes="w-full max-[1024px]:px-2 px-4 max-[1024px]:pb-4 py-2 h-full items-center justify-center"
              styles={{
                borderColor: teamColors.One,
                backgroundColor: navyBlueColor,
              }}
            >
              <ButtonGrid classes="justify-center">
                {zoneCategories.map((x) => (
                  <Button
                    key={x}
                    size="sm"
                    classes="lg:text-nowrap"
                    isSelected={zoneCategory === x}
                    onClick={() => setZoneCategory(x as Zone)}
                    disabled={isGoalieLineup && x !== DefendingGoalZone}
                  >
                    <Text variant="small">{x}</Text>
                  </Button>
                ))}
              </ButtonGrid>
            </Border>
          </div>
        </div>
        <div className="flex flex-col w-full h-full">
          <Border
            direction="row"
            classes="w-full max-[1024px]:px-2 px-4 py-2 h-full gap-x-2"
            styles={{
              borderColor: teamColors.One,
              backgroundColor: navyBlueColor,
            }}
          >
            <div className="flex flex-col min-h-full w-full">
              <Border classes="h-full w-full">
                {errors.length === 0 && "No Errors"}
                {errors.length > 0 &&
                  errors.map((err) => (
                    <Text key={err} variant="small">
                      {err}
                    </Text>
                  ))}
              </Border>
            </div>
            <ButtonGroup classes="mb-2 justify-end w-1/5">
              <Button
                classes="w-full"
                disabled={errors.length > 0}
                variant={errors.length > 0 ? "danger" : "success"}
                onClick={Save}
                size="xs"
              >
                <Text variant="small">Save</Text>
              </Button>
              <Button
                classes="w-full"
                disabled={errors.length > 0}
                variant="primary"
                size="xs"
                onClick={aiGameplanModal.handleOpenModal}
              >
                <Text variant="small">AI</Text>
              </Button>
              <Button size="xs" classes="w-full" onClick={ResetLineups}>
                <Text variant="small">Reset</Text>
              </Button>
              <Button
                size="xs"
                classes="w-full"
                onClick={() => {
                  setModalAction(Help1);
                  handleOpenModal();
                }}
              >
                <Text variant="small">Help</Text>
              </Button>
            </ButtonGroup>
          </Border>
        </div>
      </div>
      <LineupHelpModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        league={SimCHL}
        modalAction={modalAction}
        player={modalPlayer}
      />

      <div className="grid grid-cols-1 max-[1024px]:grid-cols-1 min-[1025px]:grid-cols-[1fr_3fr] gap-4 w-full">
        <Border
          direction="col"
          classes="w-full px-4 py-3 min-h-full"
          styles={{
            borderColor: teamColors.One,
            backgroundColor: navyBlueColor,
          }}
        >
          <div className="flex flex-row mb-6 gap-x-2 justify-center w-full">
            <Text
              variant="body-small"
              classes="flex items-center justify-center"
            >
              <strong>{zoneCategory} Inputs</strong>
            </Text>
            <Button
              classes="justify-end"
              onClick={() => {
                setModalAction(Help2);
                handleOpenModal();
              }}
            >
              <Text variant="small">Help</Text>
            </Button>
          </div>
          <div className="flex flex-col gap-y-2 flex-1">
            {zoneInputList.map((x) => (
              <Input
                key={x.key}
                type="number"
                label={x.label}
                name={x.key}
                value={lineup[x.key] as number}
                onChange={ChangeLineupInput}
              />
            ))}
          </div>
        </Border>
        {chlTeamRosterMap && (
          <Border
            direction="col"
            classes="w-full max-[1024px]:px-2 px-4 py-4"
            styles={{
              borderColor: teamColors.One,
              backgroundColor: navyBlueColor,
            }}
          >
            <div className="flex flex-row w-full justify-start items-center gap-x-2 mb-6">
              <Text variant="h6" classes="flex">
                {lineCategory} Players
              </Text>
              <Button
                type="button"
                classes=""
                onClick={() => {
                  setModalAction(Help3);
                  handleOpenModal();
                }}
              >
                Help
              </Button>
            </div>
            <div className="flex flex-col">
              <div className="grid grid-cols-1 max-[541px]:grid-cols-1 max-[768px]:grid-cols-2 max-[854px]:grid-cols-2 max-[1024px]:grid-cols-3 min-[1025px]:grid-cols-3 gap-4 px-4 w-full">
                {lineCategory !== LineupSO && (
                  <>
                    {lineup.LineType === 1 && (
                      <>
                        <LineupPlayer
                          playerID={lineup.CenterID}
                          rosterMap={chlTeamRosterMap}
                          zoneInputList={zoneInputList}
                          lineCategory={lineCategory}
                          lineIDX={lineupIdx}
                          optionList={chlTeamRosterOptions!.centerOptions}
                          ChangeState={ChangeLineupValue}
                          ChangePlayerInput={ChangePlayerInput}
                          property="CenterID"
                          activatePlayer={activatePlayerModal}
                        />
                        <LineupPlayer
                          playerID={lineup.Forward1ID}
                          rosterMap={chlTeamRosterMap}
                          zoneInputList={zoneInputList}
                          lineCategory={lineCategory}
                          lineIDX={lineupIdx}
                          optionList={chlTeamRosterOptions!.forwardOptions}
                          ChangeState={ChangeLineupValue}
                          ChangePlayerInput={ChangePlayerInput}
                          property="Forward1ID"
                          activatePlayer={activatePlayerModal}
                        />
                        <LineupPlayer
                          playerID={lineup.Forward2ID}
                          rosterMap={chlTeamRosterMap}
                          zoneInputList={zoneInputList}
                          lineCategory={lineCategory}
                          lineIDX={lineupIdx}
                          optionList={chlTeamRosterOptions!.forwardOptions}
                          ChangeState={ChangeLineupValue}
                          ChangePlayerInput={ChangePlayerInput}
                          property="Forward2ID"
                          activatePlayer={activatePlayerModal}
                        />
                      </>
                    )}
                    {lineup.LineType === 2 && (
                      <>
                        <LineupPlayer
                          playerID={lineup.Defender1ID}
                          rosterMap={chlTeamRosterMap}
                          zoneInputList={zoneInputList}
                          lineCategory={lineCategory}
                          lineIDX={lineupIdx}
                          optionList={chlTeamRosterOptions!.defenderOptions}
                          ChangeState={ChangeLineupValue}
                          ChangePlayerInput={ChangePlayerInput}
                          property="Defender1ID"
                          activatePlayer={activatePlayerModal}
                        />
                        <LineupPlayer
                          playerID={lineup.Defender2ID}
                          rosterMap={chlTeamRosterMap}
                          zoneInputList={zoneInputList}
                          lineCategory={lineCategory}
                          lineIDX={lineupIdx}
                          optionList={chlTeamRosterOptions!.defenderOptions}
                          ChangeState={ChangeLineupValue}
                          ChangePlayerInput={ChangePlayerInput}
                          property="Defender2ID"
                          activatePlayer={activatePlayerModal}
                        />
                      </>
                    )}
                    {lineup.LineType === 3 && (
                      <>
                        <LineupPlayer
                          playerID={lineup.GoalieID}
                          rosterMap={chlTeamRosterMap}
                          zoneInputList={zoneInputList}
                          lineCategory={lineCategory}
                          lineIDX={lineupIdx}
                          optionList={chlTeamRosterOptions!.goalieOptions}
                          ChangeState={ChangeLineupValue}
                          ChangePlayerInput={ChangePlayerInput}
                          property="GoalieID"
                          activatePlayer={activatePlayerModal}
                          league={SimCHL}
                        />
                      </>
                    )}
                  </>
                )}
                {lineCategory === LineupSO && (
                  <>
                    {[1, 2, 3, 4, 5, 6].map((x) => (
                      <ShootoutPlayer
                        key={`${x}-${currentShootoutLineups[`Shooter${x}ID`]}`}
                        idx={x}
                        playerID={currentShootoutLineups[`Shooter${x}ID`]}
                        rosterMap={chlTeamRosterMap}
                        optionList={chlTeamRosterOptions!.shootoutOptions}
                        property={`Shooter${x}ID`}
                        shootoutProperty={`Shooter${x}ShotType`}
                        ChangeState={ChangeValueInShootoutLineup}
                        lineCategory={currentShootoutLineups}
                        activatePlayer={activatePlayerModal}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          </Border>
        )}
      </div>
    </>
  );
};

export const PHLLineupPage = () => {
  const hkStore = useSimHCKStore();
  const {
    phlTeam,
    proRosterMap,
    updateProRosterMap,
    phlLineups,
    phlShootoutLineup,
    savePHLGameplan,
    phlGameplan,
    savePHLAIGameplan,
  } = hkStore;
  const [lineCategory, setLineCategory] = useState<Lineup>(LineupF1);
  const [zoneCategory, setZoneCategory] = useState<Zone>(DefendingGoalZone);
  const [originalLineups, setOriginalLineups] = useState(phlLineups);
  const [originalShootoutLineups, setOriginalShootoutLineups] =
    useState(phlShootoutLineup);
  const [currentLineups, setCurrentLineups] = useState(phlLineups);
  const [currentShootoutLineups, setCurrentShootoutLineups] =
    useState<ProfessionalShootoutLineup>(phlShootoutLineup);
  const [modalAction, setModalAction] = useState<ModalAction>(Help1);
  const [modalPlayer, setModalPlayer] = useState<
    CollegePlayer | ProfessionalPlayer
  >({} as ProfessionalPlayer);
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();

  const teamColors = useTeamColors(
    phlTeam?.ColorOne,
    phlTeam?.ColorTwo,
    phlTeam?.ColorThree
  );

  const {
    phlTeamRosterMap,
    phlTeamRoster,
    lineupCategories,
    zoneCategories,
    errors,
  } = usePHLLineupUtils(phlTeam!, proRosterMap, currentLineups);
  const { isMobile } = useResponsive();

  const phlTeamRosterOptions = useMemo(() => {
    if (phlTeamRoster) {
      return getLineupDropdownOptions(phlTeamRoster);
    }
  }, [phlTeamRoster]);

  const zoneInputList = useMemo(
    () => getZoneInputList(zoneCategory),
    [zoneCategory]
  );

  const lineupIdx = useMemo(() => {
    return getLineupIdx(lineCategory);
  }, [lineCategory]);

  const lineup = useMemo(() => {
    return currentLineups[lineupIdx] || ({} as ProfessionalLineup);
  }, [lineupIdx, currentLineups]);

  const Save = async () => {
    if (phlTeam) {
      setOriginalLineups(currentLineups);
      setOriginalShootoutLineups(currentShootoutLineups);
      const dto = {
        PHLTeamID: phlTeam.ID,
        PHLLineups: currentLineups,
        PHLShootoutLineup: currentShootoutLineups,
        ProPlayers: proRosterMap[phlTeam.ID],
      };
      await savePHLGameplan(dto);
    }
  };

  const ResetLineups = () => {
    setCurrentLineups(originalLineups);
    setCurrentShootoutLineups(originalShootoutLineups);
    // Will need to also reset the player ids -- actually, those will be reset automatically. Or should be.
  };

  const ChangeValueInShootoutLineup = (value: number, key: string) => {
    updateLineupFieldWithClass(
      setCurrentShootoutLineups,
      ProfessionalShootoutLineup,
      key,
      value
    );
  };

  const ChangeLineupInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const numericValue = Number(value);
    ChangeLineupValue(numericValue, name);
  };

  const ChangeLineupValue = useCallback(
    (value: number, key: string) => {
      setCurrentLineups((prevLineups) =>
        prevLineups.map((lineup, index) =>
          index === lineupIdx
            ? new ProfessionalLineup({ ...lineup, [key]: value })
            : lineup
        )
      );
    },
    [lineupIdx]
  );

  const ChangePlayerInput = useCallback(
    (playerID: number, key: string, value: number) => {
      const updatedRosterMap = { ...proRosterMap };
      updatedRosterMap[phlTeam!.ID] = [...updatedRosterMap[phlTeam!.ID]];
      const playerIdx = updatedRosterMap[phlTeam!.ID]?.findIndex(
        (x) => x.ID === playerID
      );

      if (playerIdx > -1) {
        updatedRosterMap[phlTeam!.ID][playerIdx] = new ProfessionalPlayer({
          ...updatedRosterMap[phlTeam!.ID][playerIdx],
          [key]: value,
        });
        updateProRosterMap(updatedRosterMap);
      }
    },
    [proRosterMap, updateProRosterMap, phlTeam]
  );

  const activatePlayerModal = (player: CollegePlayer | ProfessionalPlayer) => {
    setModalAction(InfoType);
    setModalPlayer(player);
    handleOpenModal();
  };

  const changeLineCategory = useCallback((x: Lineup) => {
    setLineCategory(x);
    if (x === LineupG1 || x === LineupG2) {
      setZoneCategory(DefendingGoalZone);
    }
  }, []);

  const isGoalieLineup = useMemo(() => {
    return lineCategory === LineupG1 || lineCategory === LineupG2;
  }, [lineCategory]);

  const aiGameplanModal = useModal();

  return (
    <>
      <HCKAIGameplanModal
        isOpen={aiGameplanModal.isModalOpen}
        onClose={aiGameplanModal.handleCloseModal}
        league={SimPHL}
        gameplan={phlGameplan}
        saveGameplan={savePHLAIGameplan}
      />
      <div className="grid grid-flow-row max-[1024px]:grid-cols-1 max-[1024px]:gap-y-2 grid-cols-[6fr_4fr] grid-auto-rows-fr h-full max-[1024px]:gap-x-1 gap-x-2 mb-2">
        <div className="flex flex-col w-full h-full max-[1024px]:gap-y-2">
          <div className="flex flex-row md:flex-col w-full h-full">
            <Border
              direction="col"
              classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 px-3 py-2 h-full items-center justify-center"
              styles={{
                borderColor: teamColors.One,
                backgroundColor: navyBlueColor,
              }}
            >
              <ButtonGrid>
                {lineupCategories.map((x) => (
                  <Button
                    key={x}
                    size="sm"
                    classes="lg:text-nowrap"
                    isSelected={lineCategory === x}
                    onClick={() => changeLineCategory(x as Lineup)}
                  >
                    <Text variant="small">{x}</Text>
                  </Button>
                ))}
              </ButtonGrid>
            </Border>
          </div>
          <div className="flex flex-row md:flex-col w-full h-full">
            <Border
              direction="col"
              classes="w-full max-[1024px]:px-2 px-4 max-[1024px]:pb-4 py-2 h-full items-center justify-center"
              styles={{
                borderColor: teamColors.One,
                backgroundColor: navyBlueColor,
              }}
            >
              <ButtonGrid classes="justify-center">
                {zoneCategories.map((x) => (
                  <Button
                    key={x}
                    size="sm"
                    classes="lg:text-nowrap"
                    isSelected={zoneCategory === x}
                    onClick={() => setZoneCategory(x as Zone)}
                    disabled={isGoalieLineup && x !== DefendingGoalZone}
                  >
                    <Text variant="small">{x}</Text>
                  </Button>
                ))}
              </ButtonGrid>
            </Border>
          </div>
        </div>
        <div className="flex flex-col w-full h-full">
          <Border
            direction="row"
            classes="w-full max-[1024px]:px-2 px-4 py-2 h-full gap-x-2"
            styles={{
              borderColor: teamColors.One,
              backgroundColor: navyBlueColor,
            }}
          >
            <div className="flex flex-col min-h-full w-full">
              <Border classes="h-full w-full">
                {errors.length === 0 && "No Errors"}
                {errors.length > 0 &&
                  errors.map((err) => (
                    <Text key={err} variant="small">
                      {err}
                    </Text>
                  ))}
              </Border>
            </div>
            <ButtonGroup classes="mb-2 justify-end w-1/5">
              <Button
                classes="w-full"
                disabled={errors.length > 0}
                variant={errors.length > 0 ? "danger" : "success"}
                onClick={Save}
                size="xs"
              >
                <Text variant="small">Save</Text>
              </Button>
              <Button
                classes="w-full"
                disabled={errors.length > 0}
                variant="primary"
                size="xs"
                onClick={aiGameplanModal.handleOpenModal}
              >
                <Text variant="small">AI</Text>
              </Button>
              <Button classes="w-full" onClick={ResetLineups} size="xs">
                <Text variant="small">Reset</Text>
              </Button>
              <Button
                classes="w-full"
                onClick={() => {
                  setModalAction(Help1);
                  handleOpenModal();
                }}
                size="xs"
              >
                <Text variant="small">Help</Text>
              </Button>
            </ButtonGroup>
          </Border>
        </div>
      </div>
      <LineupHelpModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        league={SimPHL}
        modalAction={modalAction}
        player={modalPlayer}
      />

      <div className="grid grid-cols-1 max-[1024px]:grid-cols-1 min-[1025px]:grid-cols-[1fr_3fr] gap-4 w-full">
        <Border
          direction="col"
          classes="w-full px-4 py-3 min-h-full"
          styles={{
            borderColor: teamColors.One,
            backgroundColor: navyBlueColor,
          }}
        >
          <div className="flex flex-row mb-6 gap-x-2 justify-center w-full">
            <Text
              variant="body-small"
              classes="flex items-center justify-center"
            >
              <strong>{zoneCategory} Inputs</strong>
            </Text>
            <Button
              classes="justify-end"
              onClick={() => {
                setModalAction(Help2);
                handleOpenModal();
              }}
            >
              <Text variant="small">Help</Text>
            </Button>
          </div>
          <div className="flex flex-col gap-y-2 flex-1">
            {zoneInputList.map((x) => (
              <Input
                key={x.key}
                type="number"
                label={x.label}
                name={x.key}
                value={lineup[x.key] as number}
                onChange={ChangeLineupInput}
              />
            ))}
          </div>
        </Border>
        {phlTeamRosterMap && (
          <Border
            direction="col"
            classes="w-full max-[1024px]:px-2 px-4 py-4"
            styles={{
              borderColor: teamColors.One,
              backgroundColor: navyBlueColor,
            }}
          >
            <div className="flex flex-row w-full justify-start items-center gap-x-2 mb-6">
              <Text variant="h6" classes="flex">
                {lineCategory} Players
              </Text>
              <Button
                type="button"
                classes=""
                onClick={() => {
                  setModalAction(Help3);
                  handleOpenModal();
                }}
              >
                Help
              </Button>
            </div>
            <div className="flex flex-col">
              <div className="grid grid-cols-1 max-[541px]:grid-cols-1 max-[768px]:grid-cols-2 max-[854px]:grid-cols-2 max-[1024px]:grid-cols-3 min-[1025px]:grid-cols-3 gap-4 px-4 w-full">
                {lineCategory !== LineupSO && (
                  <>
                    {lineup.LineType === 1 && (
                      <>
                        <LineupPlayer
                          playerID={lineup.CenterID}
                          rosterMap={phlTeamRosterMap}
                          zoneInputList={zoneInputList}
                          lineCategory={lineCategory}
                          lineIDX={lineupIdx}
                          optionList={phlTeamRosterOptions!.centerOptions}
                          ChangeState={ChangeLineupValue}
                          ChangePlayerInput={ChangePlayerInput}
                          property="CenterID"
                          activatePlayer={activatePlayerModal}
                        />
                        <LineupPlayer
                          playerID={lineup.Forward1ID}
                          rosterMap={phlTeamRosterMap}
                          zoneInputList={zoneInputList}
                          lineCategory={lineCategory}
                          lineIDX={lineupIdx}
                          optionList={phlTeamRosterOptions!.forwardOptions}
                          ChangeState={ChangeLineupValue}
                          ChangePlayerInput={ChangePlayerInput}
                          property="Forward1ID"
                          activatePlayer={activatePlayerModal}
                        />
                        <LineupPlayer
                          playerID={lineup.Forward2ID}
                          rosterMap={phlTeamRosterMap}
                          zoneInputList={zoneInputList}
                          lineCategory={lineCategory}
                          lineIDX={lineupIdx}
                          optionList={phlTeamRosterOptions!.forwardOptions}
                          ChangeState={ChangeLineupValue}
                          ChangePlayerInput={ChangePlayerInput}
                          property="Forward2ID"
                          activatePlayer={activatePlayerModal}
                        />
                      </>
                    )}
                    {lineup.LineType === 2 && (
                      <>
                        <LineupPlayer
                          playerID={lineup.Defender1ID}
                          rosterMap={phlTeamRosterMap}
                          zoneInputList={zoneInputList}
                          lineCategory={lineCategory}
                          lineIDX={lineupIdx}
                          optionList={phlTeamRosterOptions!.defenderOptions}
                          ChangeState={ChangeLineupValue}
                          ChangePlayerInput={ChangePlayerInput}
                          property="Defender1ID"
                          activatePlayer={activatePlayerModal}
                        />
                        <LineupPlayer
                          playerID={lineup.Defender2ID}
                          rosterMap={phlTeamRosterMap}
                          zoneInputList={zoneInputList}
                          lineCategory={lineCategory}
                          lineIDX={lineupIdx}
                          optionList={phlTeamRosterOptions!.defenderOptions}
                          ChangeState={ChangeLineupValue}
                          ChangePlayerInput={ChangePlayerInput}
                          property="Defender2ID"
                          activatePlayer={activatePlayerModal}
                        />
                      </>
                    )}
                    {lineup.LineType === 3 && (
                      <>
                        <LineupPlayer
                          playerID={lineup.GoalieID}
                          rosterMap={phlTeamRosterMap}
                          zoneInputList={zoneInputList}
                          lineCategory={lineCategory}
                          lineIDX={lineupIdx}
                          optionList={phlTeamRosterOptions!.goalieOptions}
                          ChangeState={ChangeLineupValue}
                          ChangePlayerInput={ChangePlayerInput}
                          property="GoalieID"
                          activatePlayer={activatePlayerModal}
                        />
                      </>
                    )}
                  </>
                )}
                {lineCategory === LineupSO && (
                  <>
                    {[1, 2, 3, 4, 5, 6].map((x) => (
                      <ShootoutPlayer
                        key={`${x}-${currentShootoutLineups[`Shooter${x}ID`]}`}
                        idx={x}
                        playerID={currentShootoutLineups[`Shooter${x}ID`]}
                        rosterMap={phlTeamRosterMap}
                        optionList={phlTeamRosterOptions!.shootoutOptions}
                        property={`Shooter${x}ID`}
                        shootoutProperty={`Shooter${x}ShotType`}
                        ChangeState={ChangeValueInShootoutLineup}
                        lineCategory={currentShootoutLineups}
                        activatePlayer={activatePlayerModal}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          </Border>
        )}
      </div>
    </>
  );
};
