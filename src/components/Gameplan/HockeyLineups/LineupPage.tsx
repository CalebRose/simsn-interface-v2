import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  defensiveSystemsInformationList,
  getDefensiveSystemFromMap,
  getOffensiveSystemFromMap,
  offensiveSystemsInformationList,
  useCHLLineupUtils,
  usePHLLineupUtils,
} from "./useLineupUtils";
import { Border } from "../../../_design/Borders";
import { Button, ButtonGrid } from "../../../_design/Buttons";
import {
  DefendingGoalZone,
  Help1,
  InfoType,
  Lineup,
  LineupF1,
  LineupF2,
  LineupF3,
  LineupF4,
  LineupD1,
  LineupD2,
  LineupD3,
  LineupG1,
  LineupG2,
  LineupSO,
  ModalAction,
  SimCHL,
  SimPHL,
  Zone,
} from "../../../_constants/constants";
import { Text } from "../../../_design/Typography";
import {
  getLineupDropdownOptions,
  getLineupIdx,
  updateLineupFieldWithClass,
} from "./lineupHelper";
import {
  HCKAIGameplanModal,
  LineupHelpModal,
  ShootoutPlayer,
} from "./LineupComponents";
import { HockeyRinkVision } from "./HockeyRinkVision";
import { HockeyLineBlock } from "./HockeyLineBlock";
import { TeamLabel } from "../../Common/Labels";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { useBackgroundColor } from "../../../_hooks/useBackgroundColor";
import { CategoryDropdown } from "../../Recruiting/Common/RecruitingCategoryDropdown";
import { useResponsive } from "../../../_hooks/useMobile";

export const CHLLineupPage = () => {
  const {
    chlTeam,
    chlTeamMap,
    chlTeamOptions,
    chlRosterMap,
    updateCHLRosterMap,
    chlLineupsMap,
    chlShootoutLineupsMap,
    chlLineups,
    chlShootoutLineup,
    saveCHLGameplan,
    chlGameplan,
    saveCHLAIGameplan,
    getBootstrapLineupData,
  } = useSimHCKStore();

  console.log({ chlRosterMap });

  useEffect(() => {
    getBootstrapLineupData();
  }, []);

  const [selectedTeamID, setSelectedTeamID] = useState(chlTeam?.ID);
  const [selectedForwardLine, setSelectedForwardLine] =
    useState<Lineup>(LineupF1);
  const [selectedDefenderLine, setSelectedDefenderLine] =
    useState<Lineup>(LineupD1);
  const [selectedGoalieLine, setSelectedGoalieLine] =
    useState<Lineup>(LineupG1);
  const [showShootout, setShowShootout] = useState(false);
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
  const { isMobile } = useResponsive();

  const isUserTeam = useMemo(() => {
    return chlTeam?.ID === selectedTeamID;
  }, [chlTeam?.ID, selectedTeamID]);

  const selectedTeam = useMemo(
    () => (selectedTeamID ? (chlTeamMap[selectedTeamID] ?? chlTeam) : chlTeam),
    [chlTeam, chlTeamMap, selectedTeamID],
  );
  useEffect(() => {
    if (chlTeam?.ID && !selectedTeamID) setSelectedTeamID(chlTeam.ID);
  }, [chlTeam?.ID, selectedTeamID]);
  useEffect(() => {
    if (!selectedTeamID) return;
    const lineups =
      chlLineupsMap[selectedTeamID] ??
      (selectedTeamID === chlTeam?.ID ? chlLineups : []);
    setCurrentLineups(lineups);
    setOriginalLineups(lineups);
    setCurrentShootoutLineups(
      chlShootoutLineupsMap[selectedTeamID] ??
        (selectedTeamID === chlTeam?.ID
          ? chlShootoutLineup
          : ({} as CollegeShootoutLineup)),
    );
    setOriginalShootoutLineups(
      chlShootoutLineupsMap[selectedTeamID] ??
        (selectedTeamID === chlTeam?.ID
          ? chlShootoutLineup
          : ({} as CollegeShootoutLineup)),
    );
  }, [
    chlLineups,
    chlShootoutLineup,
    chlLineupsMap,
    chlShootoutLineupsMap,
    chlTeam?.ID,
    selectedTeamID,
  ]);

  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree,
  );
  const { backgroundColor: themeBackgroundColor } = useBackgroundColor();
  const backgroundColor = teamColors.One;
  const headerTextColorClass = getTextColorBasedOnBg(teamColors.One);

  const { chlTeamRosterMap, eligiblePlayers, zoneCategories, errors } =
    useCHLLineupUtils(
      chlTeam!,
      chlRosterMap,
      currentLineups,
      currentShootoutLineups,
      selectedTeamID,
    );

  const chlTeamRosterOptions = useMemo(() => {
    if (eligiblePlayers) {
      return getLineupDropdownOptions(eligiblePlayers);
    }
  }, [eligiblePlayers]);

  // Rink vision mirrors whichever forward/defense/goalie line is currently
  // selected in the sidebar.
  const forwardLineIdx = useMemo(
    () => getLineupIdx(selectedForwardLine),
    [selectedForwardLine],
  );
  const defenderLineIdx = useMemo(
    () => getLineupIdx(selectedDefenderLine),
    [selectedDefenderLine],
  );
  const goalieLineIdx = useMemo(
    () => getLineupIdx(selectedGoalieLine),
    [selectedGoalieLine],
  );
  const selectedForwardLineup = useMemo(
    () => currentLineups[forwardLineIdx] || ({} as CollegeLineup),
    [currentLineups, forwardLineIdx],
  );
  const selectedDefenderLineup = useMemo(
    () => currentLineups[defenderLineIdx] || ({} as CollegeLineup),
    [currentLineups, defenderLineIdx],
  );
  const selectedGoalieLineup = useMemo(
    () => currentLineups[goalieLineIdx] || ({} as CollegeLineup),
    [currentLineups, goalieLineIdx],
  );

  const Save = async () => {
    if (chlTeam && isUserTeam) {
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

  const SelectTeam = (options: any) => {
    const opts = Number(options.value);
    setSelectedTeamID(() => opts);
  };

  const ResetLineups = () => {
    if (!isUserTeam) return;
    setCurrentLineups(originalLineups);
    setCurrentShootoutLineups(originalShootoutLineups);
    // Will need to also reset the player ids -- actually, those will be reset automatically. Or should be.
  };

  const ChangeValueInShootoutLineup = (value: number, key: string) => {
    if (!isUserTeam) return;
    updateLineupFieldWithClass(
      setCurrentShootoutLineups,
      CollegeShootoutLineup,
      key,
      value,
    );
  };

  const ChangeLineupValue = useCallback(
    (value: number, key: string, index: number) => {
      if (!isUserTeam) return;
      setCurrentLineups((prevLineups) =>
        prevLineups.map((lineup, idx) =>
          idx === index
            ? new CollegeLineup({ ...lineup, [key]: value })
            : lineup,
        ),
      );
    },
    [isUserTeam],
  );

  const ChangePlayerInput = useCallback(
    (playerID: number, key: string, value: number) => {
      if (!isUserTeam || !chlTeam) return;
      const updatedRosterMap = { ...chlRosterMap };
      updatedRosterMap[chlTeam!.ID] = [...updatedRosterMap[chlTeam!.ID]];
      const playerIdx = updatedRosterMap[chlTeam!.ID]?.findIndex(
        (x) => x.ID === playerID,
      );
      if (playerIdx > -1) {
        updatedRosterMap[chlTeam!.ID][playerIdx] = new CollegePlayer({
          ...updatedRosterMap[chlTeam!.ID][playerIdx],
          [key]: value,
        });
        updateCHLRosterMap(updatedRosterMap);
      }
    },
    [chlRosterMap, updateCHLRosterMap, chlTeam, isUserTeam],
  );

  const activatePlayerModal = (player: CollegePlayer | ProfessionalPlayer) => {
    setModalAction(InfoType);
    setModalPlayer(player);
    handleOpenModal();
  };

  const aiGameplanModal = useModal();

  const offensiveSystemsInformation = useMemo(() => {
    return offensiveSystemsInformationList[
      chlGameplan!
        .OffensiveSystem as keyof typeof offensiveSystemsInformationList
    ];
  }, [chlGameplan]);

  const defensiveSystemsInformation = useMemo(() => {
    return defensiveSystemsInformationList[
      chlGameplan!
        .DefensiveSystem as keyof typeof defensiveSystemsInformationList
    ];
  }, [chlGameplan]);

  const forwardCategories: Lineup[] = [LineupF1, LineupF2, LineupF3, LineupF4];
  const defenderCategories: Lineup[] = [LineupD1, LineupD2, LineupD3];
  const goalieCategoriesList: Lineup[] = [LineupG1, LineupG2];

  return (
    <>
      <HCKAIGameplanModal
        isOpen={aiGameplanModal.isModalOpen}
        onClose={aiGameplanModal.handleCloseModal}
        league={SimCHL}
        gameplan={chlGameplan}
        saveGameplan={saveCHLAIGameplan}
      />
      <LineupHelpModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        league={SimCHL}
        modalAction={modalAction}
        player={modalPlayer}
      />
      <div className="grid grid-flow-row w-full h-full max-[1024px]:grid-cols-1 max-[1024px]:gap-y-2 grid-cols-[2fr_10fr] max-[1024px]:gap-x-1 gap-x-2 mb-2">
        <div className="flex flex-col w-full h-full max-[1024px]:gap-y-2">
          <Border
            direction="col"
            classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 px-4 py-2 items-center justify-start"
            styles={{
              borderColor: teamColors.One,
              backgroundColor: themeBackgroundColor,
            }}
          >
            <div className="flex flex-col gap-x-2 flex-wrap w-full text-start mb-2">
              <TeamLabel
                team={selectedTeam?.TeamName || ""}
                variant="h5"
                backgroundColor={teamColors.One}
                borderColor={teamColors.One}
                headerTextColorClass={headerTextColorClass}
              />
            </div>
            <div className="flex flex-col gap-x-2 flex-wrap w-full text-start mb-3">
              <CategoryDropdown
                label=""
                options={chlTeamOptions}
                change={SelectTeam}
                isMulti={false}
                isMobile={isMobile}
              />
            </div>
            <ButtonGrid classes="grid grid-cols-2 gap-2 w-full mb-2">
              <Button
                type="button"
                variant="primary"
                size="xs"
                disabled={!isUserTeam}
                onClick={aiGameplanModal.handleOpenModal}
              >
                Settings
              </Button>
              <Button
                type="button"
                size="xs"
                onClick={() => {
                  setModalAction(Help1);
                  handleOpenModal();
                }}
              >
                Help
              </Button>
              <Button
                type="button"
                size="xs"
                onClick={ResetLineups}
                disabled={!isUserTeam}
              >
                Reset
              </Button>
              <Button
                type="button"
                variant={errors.length > 0 ? "danger" : "success"}
                size="xs"
                disabled={errors.length > 0 || !isUserTeam}
                onClick={Save}
              >
                Save
              </Button>
            </ButtonGrid>
            {chlGameplan && (
              <div className="flex flex-col gap-x-2 flex-wrap w-full text-start my-2 space-y-2">
                <TeamLabel
                  team="Systems"
                  variant="h5"
                  backgroundColor={teamColors.One}
                  borderColor={teamColors.One}
                  headerTextColorClass={headerTextColorClass}
                />
                <Text variant="xs">
                  <strong>Offensive System:</strong>{" "}
                  {getOffensiveSystemFromMap(chlGameplan.OffensiveSystem).label}
                </Text>
                <Text variant="xs">
                  {offensiveSystemsInformation?.Philosophy}
                </Text>
                <Text variant="xs">
                  <strong>Pros:</strong>{" "}
                  {offensiveSystemsInformation?.GoodFits?.map(
                    (fit: any) => `${fit.archetype} (+${fit.bonus})`,
                  ).join(", ") || "None"}
                </Text>
                <Text variant="xs">
                  <strong>Cons:</strong>{" "}
                  {offensiveSystemsInformation?.BadFits?.map(
                    (fit: any) => `${fit.archetype} (${fit.penalty})`,
                  ).join(", ") || "None"}
                </Text>
                <Text variant="xs">
                  <strong>Defensive System:</strong>{" "}
                  {getDefensiveSystemFromMap(chlGameplan.DefensiveSystem).label}
                </Text>
                <Text variant="xs">
                  {defensiveSystemsInformation?.Philosophy}
                </Text>
                <Text variant="xs">
                  <strong>Pros:</strong>{" "}
                  {defensiveSystemsInformation?.GoodFits?.map(
                    (fit: any) => `${fit.archetype} (+${fit.bonus})`,
                  ).join(", ") || "None"}
                </Text>
                <Text variant="xs">
                  <strong>Cons:</strong>{" "}
                  {defensiveSystemsInformation?.BadFits?.map(
                    (fit: any) => `${fit.archetype} (${fit.penalty})`,
                  ).join(", ") || "None"}
                </Text>
              </div>
            )}
          </Border>
          <div className="min-[1025px]:sticky min-[1025px]:top-24">
            <Border
              direction="col"
              classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 px-4 py-2 items-center justify-start"
              styles={{
                borderColor: teamColors.One,
                backgroundColor: themeBackgroundColor,
              }}
            >
              <div className="flex flex-col gap-x-2 flex-wrap w-full text-start my-2 space-y-2">
                <TeamLabel
                  team="Zone"
                  variant="h5"
                  backgroundColor={teamColors.One}
                  borderColor={teamColors.One}
                  headerTextColorClass={headerTextColorClass}
                />
                <ButtonGrid classes="grid grid-cols-3 gap-x-2 w-full justify-center">
                  {zoneCategories.map((x) => (
                    <Button
                      key={x}
                      size="xs"
                      classes="max-[768px]:text-xs max-[768px]:px-2 max-[768px]:py-1 text-center"
                      isSelected={zoneCategory === x}
                      onClick={() => setZoneCategory(x as Zone)}
                    >
                      <Text variant="small">{x}</Text>
                    </Button>
                  ))}
                </ButtonGrid>
              </div>
              <div className="flex flex-col gap-x-2 flex-wrap w-full text-start my-2 space-y-2">
                <TeamLabel
                  team="Lineups"
                  variant="h5"
                  backgroundColor={teamColors.One}
                  borderColor={teamColors.One}
                  headerTextColorClass={headerTextColorClass}
                />
                <Text variant="small" classes="text-start">
                  Forward
                </Text>
                <ButtonGrid classes="grid grid-cols-4 gap-x-2 w-full justify-center">
                  {forwardCategories.map((x) => (
                    <Button
                      key={x}
                      size="xs"
                      classes="max-[768px]:text-xs max-[768px]:px-2 max-[768px]:py-1 text-center"
                      isSelected={selectedForwardLine === x}
                      onClick={() => setSelectedForwardLine(x)}
                    >
                      <Text variant="small">{x.replace("Forwards ", "F")}</Text>
                    </Button>
                  ))}
                </ButtonGrid>
                <Text variant="small" classes="text-start">
                  Defender
                </Text>
                <ButtonGrid classes="grid grid-cols-3 gap-x-2 w-full justify-center">
                  {defenderCategories.map((x) => (
                    <Button
                      key={x}
                      size="xs"
                      classes="max-[768px]:text-xs max-[768px]:px-2 max-[768px]:py-1 text-center"
                      isSelected={selectedDefenderLine === x}
                      onClick={() => setSelectedDefenderLine(x)}
                    >
                      <Text variant="small">
                        {x.replace("Defenders ", "D")}
                      </Text>
                    </Button>
                  ))}
                </ButtonGrid>
                <Text variant="small" classes="text-start">
                  Goalie
                </Text>
                <ButtonGrid classes="grid grid-cols-2 gap-x-2 w-full justify-center">
                  {goalieCategoriesList.map((x) => (
                    <Button
                      key={x}
                      size="xs"
                      classes="max-[768px]:text-xs max-[768px]:px-2 max-[768px]:py-1 text-center"
                      isSelected={selectedGoalieLine === x}
                      onClick={() => setSelectedGoalieLine(x)}
                    >
                      <Text variant="small">{x.replace("Goalies ", "G")}</Text>
                    </Button>
                  ))}
                </ButtonGrid>
                <Text variant="small" classes="text-start">
                  Shootout
                </Text>
                <ButtonGrid classes="grid grid-cols-1 gap-x-2 w-full justify-center">
                  <Button
                    size="xs"
                    classes="max-[768px]:text-xs max-[768px]:px-2 max-[768px]:py-1 text-center"
                    isSelected={showShootout}
                    onClick={() => setShowShootout((prev) => !prev)}
                  >
                    <Text variant="small">{LineupSO}</Text>
                  </Button>
                </ButtonGrid>
              </div>
              <div className="flex flex-col gap-x-2 flex-wrap w-full text-start my-2">
                <TeamLabel
                  team="Errors"
                  variant="h5"
                  backgroundColor={teamColors.One}
                  borderColor={teamColors.One}
                  headerTextColorClass={headerTextColorClass}
                />
              </div>
              <div className="flex flex-col gap-x-2 flex-wrap w-full text-start">
                {errors.length === 0 && (
                  <Text variant="small" classes="text-start">
                    No errors found.
                  </Text>
                )}
                {errors.map((error, index) => (
                  <Text key={index} variant="small" classes="text-start">
                    {error}
                  </Text>
                ))}
              </div>
            </Border>
          </div>
        </div>
        <div className="flex flex-col w-full max-[1024px]:gap-y-2">
          <HockeyRinkVision
            forwardLineup={selectedForwardLineup}
            defenseLineup={selectedDefenderLineup}
            goalieLineup={selectedGoalieLineup}
            rosterMap={chlTeamRosterMap || {}}
            team={selectedTeam!!}
            league={SimCHL}
            primaryColor={teamColors.One}
            accentColor={teamColors.Two}
            onPlayerClick={activatePlayerModal}
          />
          <Border
            direction="col"
            classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 items-start justify-between"
            styles={{
              borderColor: teamColors.One,
              backgroundColor: backgroundColor,
            }}
          >
            <div className="flex flex-col gap-y-6 w-full divide-y divide-white/10">
              {chlTeamRosterMap && (
                <div className="w-full pt-6 first:pt-0">
                  <HockeyLineBlock
                    lineCategory={selectedForwardLine}
                    lineIdx={forwardLineIdx}
                    lineup={selectedForwardLineup}
                    rosterMap={chlTeamRosterMap}
                    rosterOptions={chlTeamRosterOptions!}
                    zoneCategory={zoneCategory}
                    league={SimCHL}
                    ChangeLineupValue={ChangeLineupValue}
                    ChangePlayerInput={ChangePlayerInput}
                    activatePlayer={activatePlayerModal}
                    canModify={isUserTeam}
                  />
                </div>
              )}
              {chlTeamRosterMap && (
                <div className="w-full pt-6 first:pt-0">
                  <HockeyLineBlock
                    lineCategory={selectedDefenderLine}
                    lineIdx={defenderLineIdx}
                    lineup={selectedDefenderLineup}
                    rosterMap={chlTeamRosterMap}
                    rosterOptions={chlTeamRosterOptions!}
                    zoneCategory={zoneCategory}
                    league={SimCHL}
                    ChangeLineupValue={ChangeLineupValue}
                    ChangePlayerInput={ChangePlayerInput}
                    activatePlayer={activatePlayerModal}
                    canModify={isUserTeam}
                  />
                </div>
              )}
              {chlTeamRosterMap && (
                <div className="w-full pt-6 first:pt-0">
                  <HockeyLineBlock
                    lineCategory={selectedGoalieLine}
                    lineIdx={goalieLineIdx}
                    lineup={selectedGoalieLineup}
                    rosterMap={chlTeamRosterMap}
                    rosterOptions={chlTeamRosterOptions!}
                    zoneCategory={zoneCategory}
                    league={SimCHL}
                    ChangeLineupValue={ChangeLineupValue}
                    ChangePlayerInput={ChangePlayerInput}
                    activatePlayer={activatePlayerModal}
                    canModify={isUserTeam}
                  />
                </div>
              )}
              {chlTeamRosterMap && showShootout && (
                <div className="w-full pt-6 first:pt-0">
                  <div className="flex flex-row w-full justify-start items-center space-x-2 mb-3">
                    <Text variant="h6" classes="flex">
                      {LineupSO} Players
                    </Text>
                  </div>
                  <div className="grid grid-cols-1 max-[541px]:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 space-4 px-4 w-full">
                    {[1, 2, 3, 4, 5, 6].map((x) => (
                      <ShootoutPlayer
                        league={SimCHL}
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
                        canModify={isUserTeam}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Border>
        </div>
      </div>
    </>
  );
};

export const PHLLineupPage = () => {
  const hkStore = useSimHCKStore();
  const {
    phlTeam,
    phlTeamMap,
    phlTeamOptions,
    proRosterMap,
    updateProRosterMap,
    phlLineups,
    phlLineupsMap,
    phlShootoutLineup,
    phlShootoutLineupsMap,
    savePHLGameplan,
    phlGameplan,
    savePHLAIGameplan,
    getBootstrapLineupData,
  } = hkStore;
  useEffect(() => {
    getBootstrapLineupData();
  }, [getBootstrapLineupData]);

  const [selectedTeamID, setSelectedTeamID] = useState(phlTeam?.ID);
  const [selectedForwardLine, setSelectedForwardLine] =
    useState<Lineup>(LineupF1);
  const [selectedDefenderLine, setSelectedDefenderLine] =
    useState<Lineup>(LineupD1);
  const [selectedGoalieLine, setSelectedGoalieLine] =
    useState<Lineup>(LineupG1);
  const [showShootout, setShowShootout] = useState(false);
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
  const isUserTeam = useMemo(
    () => phlTeam?.ID === selectedTeamID,
    [phlTeam?.ID, selectedTeamID],
  );
  const selectedTeam = useMemo(
    () => (selectedTeamID ? (phlTeamMap[selectedTeamID] ?? phlTeam) : phlTeam),
    [phlTeam, phlTeamMap, selectedTeamID],
  );
  useEffect(() => {
    if (phlTeam?.ID && !selectedTeamID) setSelectedTeamID(phlTeam.ID);
  }, [phlTeam?.ID, selectedTeamID]);
  useEffect(() => {
    if (!selectedTeamID) return;
    const lineups =
      phlLineupsMap[selectedTeamID] ??
      (selectedTeamID === phlTeam?.ID ? phlLineups : []);
    setCurrentLineups(lineups);
    setOriginalLineups(lineups);
    setCurrentShootoutLineups(
      phlShootoutLineupsMap[selectedTeamID] ??
        (selectedTeamID === phlTeam?.ID
          ? phlShootoutLineup
          : ({} as ProfessionalShootoutLineup)),
    );
    setOriginalShootoutLineups(
      phlShootoutLineupsMap[selectedTeamID] ??
        (selectedTeamID === phlTeam?.ID
          ? phlShootoutLineup
          : ({} as ProfessionalShootoutLineup)),
    );
  }, [
    phlLineups,
    phlShootoutLineup,
    phlLineupsMap,
    phlShootoutLineupsMap,
    phlTeam?.ID,
    selectedTeamID,
  ]);

  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree,
  );
  const { backgroundColor: themeBackgroundColor } = useBackgroundColor();
  const backgroundColor = teamColors.One;
  const headerTextColorClass = getTextColorBasedOnBg(teamColors.One);

  const {
    phlTeamRosterMap,
    eligiblePlayers,
    lineupCategories,
    zoneCategories,
    errors,
  } = usePHLLineupUtils(
    phlTeam!,
    proRosterMap,
    currentLineups,
    currentShootoutLineups,
    selectedTeamID,
  );

  const phlTeamRosterOptions = useMemo(() => {
    if (eligiblePlayers) {
      return getLineupDropdownOptions(eligiblePlayers);
    }
  }, [eligiblePlayers]);

  const SelectTeam = (options: any) => {
    setSelectedTeamID(Number(options.value));
  };

  // Rink vision mirrors whichever forward/defense/goalie line is currently
  // selected in the sidebar.
  const forwardLineIdx = useMemo(
    () => getLineupIdx(selectedForwardLine),
    [selectedForwardLine],
  );
  const defenderLineIdx = useMemo(
    () => getLineupIdx(selectedDefenderLine),
    [selectedDefenderLine],
  );
  const goalieLineIdx = useMemo(
    () => getLineupIdx(selectedGoalieLine),
    [selectedGoalieLine],
  );
  const selectedForwardLineup = useMemo(
    () => currentLineups[forwardLineIdx] || ({} as ProfessionalLineup),
    [currentLineups, forwardLineIdx],
  );
  const selectedDefenderLineup = useMemo(
    () => currentLineups[defenderLineIdx] || ({} as ProfessionalLineup),
    [currentLineups, defenderLineIdx],
  );
  const selectedGoalieLineup = useMemo(
    () => currentLineups[goalieLineIdx] || ({} as ProfessionalLineup),
    [currentLineups, goalieLineIdx],
  );

  const Save = async () => {
    if (phlTeam && isUserTeam) {
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
    if (!isUserTeam) return;
    setCurrentLineups(originalLineups);
    setCurrentShootoutLineups(originalShootoutLineups);
    // Will need to also reset the player ids -- actually, those will be reset automatically. Or should be.
  };

  const ChangeValueInShootoutLineup = (value: number, key: string) => {
    if (!isUserTeam) return;
    updateLineupFieldWithClass(
      setCurrentShootoutLineups,
      ProfessionalShootoutLineup,
      key,
      value,
    );
  };

  const ChangeLineupValue = useCallback(
    (value: number, key: string, index: number) => {
      if (!isUserTeam) return;
      setCurrentLineups((prevLineups) =>
        prevLineups.map((lineup, idx) =>
          idx === index
            ? new ProfessionalLineup({ ...lineup, [key]: value })
            : lineup,
        ),
      );
    },
    [isUserTeam],
  );

  const ChangePlayerInput = useCallback(
    (playerID: number, key: string, value: number) => {
      if (!isUserTeam || !phlTeam) return;
      const updatedRosterMap = { ...proRosterMap };
      updatedRosterMap[phlTeam!.ID] = [...updatedRosterMap[phlTeam!.ID]];
      const playerIdx = updatedRosterMap[phlTeam!.ID]?.findIndex(
        (x) => x.ID === playerID,
      );

      if (playerIdx > -1) {
        updatedRosterMap[phlTeam!.ID][playerIdx] = new ProfessionalPlayer({
          ...updatedRosterMap[phlTeam!.ID][playerIdx],
          [key]: value,
        });
        updateProRosterMap(updatedRosterMap);
      }
    },
    [proRosterMap, updateProRosterMap, phlTeam, isUserTeam],
  );

  const activatePlayerModal = (player: CollegePlayer | ProfessionalPlayer) => {
    setModalAction(InfoType);
    setModalPlayer(player);
    handleOpenModal();
  };

  const aiGameplanModal = useModal();

  const offensiveSystemsInformation = useMemo(() => {
    return offensiveSystemsInformationList[
      phlGameplan!
        .OffensiveSystem as keyof typeof offensiveSystemsInformationList
    ];
  }, [phlGameplan]);

  const defensiveSystemsInformation = useMemo(() => {
    return defensiveSystemsInformationList[
      phlGameplan!
        .DefensiveSystem as keyof typeof defensiveSystemsInformationList
    ];
  }, [phlGameplan]);

  const forwardCategories: Lineup[] = [LineupF1, LineupF2, LineupF3, LineupF4];
  const defenderCategories: Lineup[] = [LineupD1, LineupD2, LineupD3];
  const goalieCategoriesList: Lineup[] = [LineupG1, LineupG2];

  return (
    <>
      <HCKAIGameplanModal
        isOpen={aiGameplanModal.isModalOpen}
        onClose={aiGameplanModal.handleCloseModal}
        league={SimPHL}
        gameplan={phlGameplan}
        saveGameplan={savePHLAIGameplan}
      />
      <LineupHelpModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        league={SimPHL}
        modalAction={modalAction}
        player={modalPlayer}
      />
      <div className="grid grid-flow-row w-full h-full max-[1024px]:grid-cols-1 max-[1024px]:gap-y-2 grid-cols-[2fr_10fr] max-[1024px]:gap-x-1 gap-x-2 mb-2">
        <div className="flex flex-col w-full h-full max-[1024px]:gap-y-2">
          <Border
            direction="col"
            classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 px-4 py-2 items-center justify-start"
            styles={{
              borderColor: teamColors.One,
              backgroundColor: themeBackgroundColor,
            }}
          >
            <div className="flex flex-col gap-x-2 flex-wrap w-full text-start mb-2">
              <TeamLabel
                team={selectedTeam?.TeamName || ""}
                variant="h5"
                backgroundColor={teamColors.One}
                borderColor={teamColors.One}
                headerTextColorClass={headerTextColorClass}
              />
            </div>
            <div className="flex flex-col gap-x-2 flex-wrap w-full text-start mb-3">
              <CategoryDropdown
                label=""
                options={phlTeamOptions}
                change={SelectTeam}
                isMulti={false}
                isMobile={false}
              />
            </div>
            <ButtonGrid classes="grid grid-cols-2 gap-2 w-full mb-2">
              <Button
                type="button"
                variant="primary"
                size="xs"
                disabled={!isUserTeam}
                onClick={aiGameplanModal.handleOpenModal}
              >
                Settings
              </Button>
              <Button
                type="button"
                size="xs"
                onClick={() => {
                  setModalAction(Help1);
                  handleOpenModal();
                }}
              >
                Help
              </Button>
              <Button
                type="button"
                size="xs"
                onClick={ResetLineups}
                disabled={!isUserTeam}
              >
                Reset
              </Button>
              <Button
                type="button"
                variant={errors.length > 0 ? "danger" : "success"}
                size="xs"
                disabled={errors.length > 0 || !isUserTeam}
                onClick={Save}
              >
                Save
              </Button>
            </ButtonGrid>
            {phlGameplan && (
              <div className="flex flex-col gap-x-2 flex-wrap w-full text-start my-2 space-y-2">
                <TeamLabel
                  team="Systems"
                  variant="h5"
                  backgroundColor={teamColors.One}
                  borderColor={teamColors.One}
                  headerTextColorClass={headerTextColorClass}
                />
                <Text variant="xs">
                  <strong>Offensive System:</strong>{" "}
                  {getOffensiveSystemFromMap(phlGameplan.OffensiveSystem).label}
                </Text>
                <Text variant="xs">
                  {offensiveSystemsInformation?.Philosophy}
                </Text>
                <Text variant="xs">
                  <strong>Pros:</strong>{" "}
                  {offensiveSystemsInformation?.GoodFits?.map(
                    (fit: any) => `${fit.archetype} (+${fit.bonus})`,
                  ).join(", ") || "None"}
                </Text>
                <Text variant="xs">
                  <strong>Cons:</strong>{" "}
                  {offensiveSystemsInformation?.BadFits?.map(
                    (fit: any) => `${fit.archetype} (${fit.penalty})`,
                  ).join(", ") || "None"}
                </Text>
                <Text variant="xs">
                  <strong>Defensive System:</strong>{" "}
                  {getDefensiveSystemFromMap(phlGameplan.DefensiveSystem).label}
                </Text>
                <Text variant="xs">
                  {defensiveSystemsInformation?.Philosophy}
                </Text>
                <Text variant="xs">
                  <strong>Pros:</strong>{" "}
                  {defensiveSystemsInformation?.GoodFits?.map(
                    (fit: any) => `${fit.archetype} (+${fit.bonus})`,
                  ).join(", ") || "None"}
                </Text>
                <Text variant="xs">
                  <strong>Cons:</strong>{" "}
                  {defensiveSystemsInformation?.BadFits?.map(
                    (fit: any) => `${fit.archetype} (${fit.penalty})`,
                  ).join(", ") || "None"}
                </Text>
              </div>
            )}
          </Border>
          <div className="min-[1025px]:sticky min-[1025px]:top-24">
            <Border
              direction="col"
              classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 px-4 py-2 items-center justify-start"
              styles={{
                borderColor: teamColors.One,
                backgroundColor: themeBackgroundColor,
              }}
            >
              <div className="flex flex-col gap-x-2 flex-wrap w-full text-start my-2 space-y-2">
                <TeamLabel
                  team="Zone"
                  variant="h5"
                  backgroundColor={teamColors.One}
                  borderColor={teamColors.One}
                  headerTextColorClass={headerTextColorClass}
                />
                <ButtonGrid classes="grid grid-cols-3 gap-x-2 w-full justify-center">
                  {zoneCategories.map((x) => (
                    <Button
                      key={x}
                      size="xs"
                      classes="max-[768px]:text-xs max-[768px]:px-2 max-[768px]:py-1 text-center"
                      isSelected={zoneCategory === x}
                      onClick={() => setZoneCategory(x as Zone)}
                    >
                      <Text variant="small">{x}</Text>
                    </Button>
                  ))}
                </ButtonGrid>
              </div>
              <div className="flex flex-col gap-x-2 flex-wrap w-full text-start my-2 space-y-2">
                <TeamLabel
                  team="Lineups"
                  variant="h5"
                  backgroundColor={teamColors.One}
                  borderColor={teamColors.One}
                  headerTextColorClass={headerTextColorClass}
                />
                <Text variant="small" classes="text-start">
                  Forward
                </Text>
                <ButtonGrid classes="grid grid-cols-4 gap-x-2 w-full justify-center">
                  {forwardCategories.map((x) => (
                    <Button
                      key={x}
                      size="xs"
                      classes="max-[768px]:text-xs max-[768px]:px-2 max-[768px]:py-1 text-center"
                      isSelected={selectedForwardLine === x}
                      onClick={() => setSelectedForwardLine(x)}
                    >
                      <Text variant="small">{x.replace("Forwards ", "F")}</Text>
                    </Button>
                  ))}
                </ButtonGrid>
                <Text variant="small" classes="text-start">
                  Defender
                </Text>
                <ButtonGrid classes="grid grid-cols-3 gap-x-2 w-full justify-center">
                  {defenderCategories.map((x) => (
                    <Button
                      key={x}
                      size="xs"
                      classes="max-[768px]:text-xs max-[768px]:px-2 max-[768px]:py-1 text-center"
                      isSelected={selectedDefenderLine === x}
                      onClick={() => setSelectedDefenderLine(x)}
                    >
                      <Text variant="small">
                        {x.replace("Defenders ", "D")}
                      </Text>
                    </Button>
                  ))}
                </ButtonGrid>
                <Text variant="small" classes="text-start">
                  Goalie
                </Text>
                <ButtonGrid classes="grid grid-cols-2 gap-x-2 w-full justify-center">
                  {goalieCategoriesList.map((x) => (
                    <Button
                      key={x}
                      size="xs"
                      classes="max-[768px]:text-xs max-[768px]:px-2 max-[768px]:py-1 text-center"
                      isSelected={selectedGoalieLine === x}
                      onClick={() => setSelectedGoalieLine(x)}
                    >
                      <Text variant="small">{x.replace("Goalies ", "G")}</Text>
                    </Button>
                  ))}
                </ButtonGrid>
                <Text variant="small" classes="text-start">
                  Shootout
                </Text>
                <ButtonGrid classes="grid grid-cols-1 gap-x-2 w-full justify-center">
                  <Button
                    size="xs"
                    classes="max-[768px]:text-xs max-[768px]:px-2 max-[768px]:py-1 text-center"
                    isSelected={showShootout}
                    onClick={() => setShowShootout((prev) => !prev)}
                  >
                    <Text variant="small">{LineupSO}</Text>
                  </Button>
                </ButtonGrid>
              </div>
              <div className="flex flex-col gap-x-2 flex-wrap w-full text-start my-2">
                <TeamLabel
                  team="Errors"
                  variant="h5"
                  backgroundColor={teamColors.One}
                  borderColor={teamColors.One}
                  headerTextColorClass={headerTextColorClass}
                />
              </div>
              <div className="flex flex-col gap-x-2 flex-wrap w-full text-start">
                {errors.length === 0 && (
                  <Text variant="small" classes="text-start">
                    No errors found.
                  </Text>
                )}
                {errors.map((error, index) => (
                  <Text key={index} variant="small" classes="text-start">
                    {error}
                  </Text>
                ))}
              </div>
            </Border>
          </div>
        </div>
        <div className="flex flex-col w-full max-[1024px]:gap-y-2">
          <HockeyRinkVision
            forwardLineup={selectedForwardLineup}
            defenseLineup={selectedDefenderLineup}
            goalieLineup={selectedGoalieLineup}
            rosterMap={phlTeamRosterMap || {}}
            team={selectedTeam!!}
            league={SimPHL}
            primaryColor={teamColors.One}
            accentColor={teamColors.Two}
            onPlayerClick={activatePlayerModal}
          />
          <Border
            direction="col"
            classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 items-start justify-between"
            styles={{
              borderColor: teamColors.One,
              backgroundColor: backgroundColor,
            }}
          >
            <div className="flex flex-col gap-y-6 w-full divide-y divide-white/10">
              {phlTeamRosterMap && (
                <div className="w-full pt-6 first:pt-0">
                  <HockeyLineBlock
                    lineCategory={selectedForwardLine}
                    lineIdx={forwardLineIdx}
                    lineup={selectedForwardLineup}
                    rosterMap={phlTeamRosterMap}
                    rosterOptions={phlTeamRosterOptions!}
                    zoneCategory={zoneCategory}
                    league={SimPHL}
                    ChangeLineupValue={ChangeLineupValue}
                    ChangePlayerInput={ChangePlayerInput}
                    activatePlayer={activatePlayerModal}
                    canModify={isUserTeam}
                  />
                </div>
              )}
              {phlTeamRosterMap && (
                <div className="w-full pt-6 first:pt-0">
                  <HockeyLineBlock
                    lineCategory={selectedDefenderLine}
                    lineIdx={defenderLineIdx}
                    lineup={selectedDefenderLineup}
                    rosterMap={phlTeamRosterMap}
                    rosterOptions={phlTeamRosterOptions!}
                    zoneCategory={zoneCategory}
                    league={SimPHL}
                    ChangeLineupValue={ChangeLineupValue}
                    ChangePlayerInput={ChangePlayerInput}
                    activatePlayer={activatePlayerModal}
                    canModify={isUserTeam}
                  />
                </div>
              )}
              {phlTeamRosterMap && (
                <div className="w-full pt-6 first:pt-0">
                  <HockeyLineBlock
                    lineCategory={selectedGoalieLine}
                    lineIdx={goalieLineIdx}
                    lineup={selectedGoalieLineup}
                    rosterMap={phlTeamRosterMap}
                    rosterOptions={phlTeamRosterOptions!}
                    zoneCategory={zoneCategory}
                    league={SimPHL}
                    ChangeLineupValue={ChangeLineupValue}
                    ChangePlayerInput={ChangePlayerInput}
                    activatePlayer={activatePlayerModal}
                    canModify={isUserTeam}
                  />
                </div>
              )}
              {phlTeamRosterMap && showShootout && (
                <div className="w-full pt-6 first:pt-0">
                  <div className="flex flex-row w-full justify-start items-center space-x-2 mb-3">
                    <Text variant="h6" classes="flex">
                      {LineupSO} Players
                    </Text>
                  </div>
                  <div className="grid grid-cols-1 max-[541px]:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 space-4 px-4 w-full">
                    {[1, 2, 3, 4, 5, 6].map((x) => (
                      <ShootoutPlayer
                        league={SimPHL}
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
                        canModify={isUserTeam}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Border>
        </div>
      </div>
    </>
  );
};
