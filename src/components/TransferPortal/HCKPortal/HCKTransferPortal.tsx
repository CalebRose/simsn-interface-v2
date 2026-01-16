import { useMemo } from "react";
import {
  Attributes,
  CountryOptions,
  Help1,
  HockeyArchetypeOptions,
  HockeyPositionOptions,
  Overview,
  Potentials,
  Preferences,
  Promises,
  RecruitingTeamBoard,
  SimCHL,
  StarOptions,
} from "../../../_constants/constants";
import { CHLRecruitLockedMessages } from "../../../_constants/loadMessages";
import { useLoadMessage } from "../../../_hooks/useLoadMessage";
import { useResponsive } from "../../../_hooks/useMobile";
import { useModal } from "../../../_hooks/useModal";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import { ActionModal } from "../../Common/ActionModal";
import { TransferPortalSideBar } from "../Common/TransferPortalSideBar";
import { useHCKTransferPortal } from "./useHCKTransferPortal";
import { Text } from "../../../_design/Typography";
import { Border } from "../../../_design/Borders";
import { Button, ButtonGrid, ButtonGroup } from "../../../_design/Buttons";
import { CategoryDropdown } from "../../Recruiting/Common/RecruitingCategoryDropdown";
import { TransferPlayerTable } from "../Common/TransferPlayerTable";
import { TransferPortalProfileTable } from "../Common/TransferProfileTable";
import { PortalHelpModal } from "../../Recruiting/Common/RecruitingHelpModal";
import { PromiseModal } from "../../Common/PromiseModal";
import { useBackgroundColor } from "../../../_hooks/useBackgroundColor";

export const HCKTransferPortal = () => {
  const hkStore = useSimHCKStore();
  const {
    chlTeam,
    addTransferPlayerToBoard,
    removeTransferPlayerFromBoard,
    chlTeamMap,
    chlPlayerMap,
    scoutPortalAttribute,
    updatePointsOnPortalPlayer,
    createPromise,
    cancelPromise,
    exportTransferPortalPlayers,
    saveTransferPortalBoard,
    chlRosterMap,
    teamTransferPortalProfiles,
    collegePromiseMap,
  } = hkStore;
  const {
    teamProfile,
    recruitingCategory,
    transferMap,
    transferOnBoardMap,
    updateRecruitingCategory,
    recruitingLocked,
    isModalOpen,
    handleOpenModal,
    handleCloseModal,
    openModal,
    modalAction,
    modalPlayer,
    regionOptions,
    SelectArchetypeOptions,
    SelectCountryOption,
    SelectPositionOptions,
    SelectRegionOptions,
    country,
    SelectStarOptions,
    tableViewType,
    setTableViewType,
    goToPreviousPage,
    goToNextPage,
    currentPage,
    totalPages,
    filteredPlayers,
    attribute,
    setAttribute,
    promiseModal,
    openPromiseModal,
    currentSpentPoints,
    chlTeamOptions,
    SelectPrevTeamOptions,
  } = useHCKTransferPortal();
  const rosterCount = useMemo(() => {
    if (!chlTeam) {
      return { rosterCount: 0 };
    }
    const rMap: Record<string, number> = {};
    const roster = chlRosterMap[chlTeam.ID];
    for (let i = 0; i < roster.length; i++) {
      const p = roster[i];
      rMap[p.Position] = rMap[p.Position] + 1 || 1;
    }
    return { ...rMap, rosterCount: roster.length };
  }, [chlTeam, chlRosterMap]);
  const { backgroundColor } = useBackgroundColor();
  const teamColors = useTeamColors(
    chlTeam?.ColorOne,
    chlTeam?.ColorTwo,
    chlTeam?.ColorThree
  );
  const { isMobile } = useResponsive();
  const helpModal = useModal();
  const aiSettingsModal = useModal();
  const lockMessage = useLoadMessage(CHLRecruitLockedMessages, 5000);
  const portalExport = async () => {
    await exportTransferPortalPlayers();
  };

  const modalPlayerPromise = useMemo(() => {
    if (!modalPlayer) {
      return null;
    }
    return collegePromiseMap[modalPlayer.ID];
  }, [modalPlayer, collegePromiseMap]);

  return (
    <>
      {modalPlayer && (
        <PromiseModal
          league={SimCHL}
          isOpen={promiseModal.isModalOpen}
          onClose={promiseModal.handleCloseModal}
          player={modalPlayer}
          promise={modalPlayerPromise}
          promisePlayer={createPromise}
        />
      )}
      {modalPlayer && (
        <ActionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          playerID={modalPlayer.ID}
          playerLabel={`${modalPlayer.Position} ${modalPlayer.Archetype} ${modalPlayer.FirstName} ${modalPlayer.LastName}`}
          teamID={chlTeam!.ID}
          league={SimCHL}
          modalAction={modalAction}
          player={modalPlayer}
          scoutAttribute={scoutPortalAttribute}
          addPlayerToBoard={addTransferPlayerToBoard}
          removePlayerFromBoard={removeTransferPlayerFromBoard}
          attribute={attribute}
        />
      )}
      <PortalHelpModal
        isOpen={helpModal.isModalOpen}
        onClose={helpModal.handleCloseModal}
        league={SimCHL}
        modalAction={Help1}
      />
      {/* Add help modals here & setting modals if needed */}
      <div className="grid grid-flow-row grid-auto-rows-auto w-full h-full max-[1024px]:grid-cols-1 max-[1024px]:gap-y-2 grid-cols-[2fr_10fr] max-[1024px]:gap-x-1 gap-x-2 mb-2">
        <TransferPortalSideBar
          teamColors={teamColors}
          Team={chlTeam!!}
          TeamProfile={teamProfile!!}
          league={SimCHL}
          rosterCount={rosterCount}
        />
        <div className="flex flex-col w-full max-[1024px]:gap-y-2">
          <div className="flex flex-col sm:flex-row gap-x-2">
            <Border
              direction="row"
              classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 items-center justify-center gap-x-2"
              styles={{
                borderColor: teamColors.One,
                backgroundColor: backgroundColor,
              }}
            >
              <ButtonGroup classes="sm:flex sm:flex-auto sm:flex-1">
                <Button
                  type="button"
                  variant={
                    recruitingCategory === Overview ? "success" : "secondary"
                  }
                  onClick={() => updateRecruitingCategory(Overview)}
                >
                  Overview
                </Button>
                <Button
                  type="button"
                  variant={
                    recruitingCategory === RecruitingTeamBoard
                      ? "success"
                      : "secondary"
                  }
                  onClick={() => updateRecruitingCategory(RecruitingTeamBoard)}
                >
                  Board
                </Button>
              </ButtonGroup>
              <ButtonGroup classes="sm:flex sm:flex-auto sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant={
                    tableViewType === Attributes ? "success" : "secondary"
                  }
                  onClick={() => setTableViewType(Attributes)}
                >
                  Attributes
                </Button>
                {recruitingCategory === RecruitingTeamBoard && (
                  <Button
                    type="button"
                    variant={
                      tableViewType === Potentials ? "success" : "secondary"
                    }
                    onClick={() => setTableViewType(Potentials)}
                  >
                    Potentials
                  </Button>
                )}
                {recruitingCategory === RecruitingTeamBoard && (
                  <Button
                    type="button"
                    variant={
                      tableViewType === Promises ? "success" : "secondary"
                    }
                    onClick={() => setTableViewType(Promises)}
                  >
                    Promises
                  </Button>
                )}
                <Button
                  type="button"
                  variant={
                    tableViewType === Preferences ? "success" : "secondary"
                  }
                  onClick={() => setTableViewType(Preferences)}
                >
                  Preferences
                </Button>
              </ButtonGroup>
            </Border>
            <Border
              direction="col"
              classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 items-center justify-center gap-x-8"
              styles={{
                borderColor: teamColors.One,
                backgroundColor: backgroundColor,
              }}
            >
              <div className="sm:grid sm:grid-cols-2 w-full">
                <div className="flex flex-row w-full gap-x-2 justify-center sm:justify-normal">
                  <div className="flex flex-col">
                    <Text variant="h6" classes="text-nowrap">
                      Weekly Points
                    </Text>
                    <Text variant="body">
                      {currentSpentPoints} of {teamProfile?.WeeklyPoints}
                    </Text>
                  </div>
                  <div className="flex flex-col">
                    <Text variant="h6" classes="text-nowrap">
                      Scouting Points
                    </Text>
                    <Text variant="body">
                      {teamProfile?.WeeklyScoutingPoints}
                    </Text>
                  </div>
                </div>
                <ButtonGrid classes="w-full justify-center">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={helpModal.handleOpenModal}
                    size="md"
                  >
                    Help
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={portalExport}
                    size="md"
                  >
                    Export
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={aiSettingsModal.handleOpenModal}
                  >
                    Settings
                  </Button>
                  <Button
                    type="button"
                    variant={
                      teamProfile!.SpentPoints <= 50 ? "primary" : "warning"
                    }
                    size="md"
                    onClick={saveTransferPortalBoard}
                    disabled={recruitingLocked}
                  >
                    Save
                  </Button>
                </ButtonGrid>
              </div>
            </Border>
          </div>
          {!recruitingLocked && recruitingCategory === Overview && (
            <>
              <Border
                direction="row"
                classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 items-center justify-center"
                styles={{
                  borderColor: teamColors.One,
                  backgroundColor: backgroundColor,
                }}
              >
                <div className="flex flex-row flex-wrap gap-x-1 sm:gap-x-2 gap-y-2 px-2 w-full">
                  <CategoryDropdown
                    label="Positions"
                    options={HockeyPositionOptions}
                    change={SelectPositionOptions}
                    isMulti={true}
                    isMobile={isMobile}
                  />
                  <CategoryDropdown
                    label="Archetype"
                    options={HockeyArchetypeOptions}
                    change={SelectArchetypeOptions}
                    isMulti={true}
                    isMobile={isMobile}
                  />
                  <CategoryDropdown
                    label="Country"
                    options={CountryOptions}
                    change={SelectCountryOption}
                    isMulti={false}
                    isMobile={isMobile}
                  />
                  {regionOptions.length > 0 && (
                    <CategoryDropdown
                      label="Region"
                      options={regionOptions}
                      change={SelectRegionOptions}
                      isMulti={true}
                      isMobile={isMobile}
                    />
                  )}
                  <CategoryDropdown
                    label="Stars"
                    options={StarOptions}
                    change={SelectStarOptions}
                    isMulti={true}
                    isMobile={isMobile}
                  />
                  <CategoryDropdown
                    label="Prev. Teams"
                    options={chlTeamOptions}
                    change={SelectPrevTeamOptions}
                    isMulti={true}
                    isMobile={isMobile}
                  />
                </div>
              </Border>
              <Border
                direction="col"
                classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 max-h-[50vh] overflow-y-auto"
                styles={{
                  borderColor: teamColors.One,
                  backgroundColor: backgroundColor,
                }}
              >
                <TransferPlayerTable
                  players={filteredPlayers}
                  colorOne={teamColors.TextColorOne}
                  colorTwo={teamColors.TextColorTwo}
                  colorThree={teamColors.TextColorThree}
                  teamMap={chlTeamMap}
                  team={chlTeam}
                  category={tableViewType}
                  openModal={openModal}
                  league={SimCHL}
                  isMobile={isMobile}
                  transferOnBoardMap={transferOnBoardMap}
                  currentPage={currentPage}
                  teamProfile={teamProfile}
                />
                <div className="flex flex-row justify-center py-2">
                  <ButtonGroup>
                    <Button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 0}
                    >
                      Prev
                    </Button>
                    <Text variant="body-small" classes="flex items-center">
                      {currentPage + 1}
                    </Text>
                    <Button
                      onClick={goToNextPage}
                      disabled={currentPage >= totalPages - 1}
                    >
                      Next
                    </Button>
                  </ButtonGroup>
                </div>
              </Border>
            </>
          )}
          {!recruitingLocked && recruitingCategory === RecruitingTeamBoard && (
            <>
              <Border
                direction="col"
                classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 max-h-[50vh] overflow-y-auto"
                styles={{
                  borderColor: teamColors.One,
                  backgroundColor: backgroundColor,
                }}
              >
                <TransferPortalProfileTable
                  colorOne={teamColors.TextColorOne}
                  colorTwo={teamColors.TextColorTwo}
                  colorThree={teamColors.TextColorThree}
                  team={chlTeam}
                  transferPortalProfiles={teamTransferPortalProfiles}
                  playerMap={chlPlayerMap}
                  teamMap={chlTeamMap}
                  league={SimCHL}
                  teamProfile={teamProfile!}
                  isMobile={isMobile}
                  category={tableViewType}
                  openModal={openModal}
                  openPromiseModal={openPromiseModal}
                  setAttribute={setAttribute}
                  ChangeInput={updatePointsOnPortalPlayer}
                />
              </Border>
            </>
          )}
          {recruitingLocked && (
            <>
              <Border
                direction="col"
                classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 items-center justify-center h-[50vh]"
                styles={{
                  borderColor: teamColors.One,
                  backgroundColor: backgroundColor,
                }}
              >
                <Text variant="h2" classes="mb-6">
                  Recruiting Sync is Running!
                </Text>
                <Text variant="h5">{lockMessage}</Text>
              </Border>
            </>
          )}
        </div>
      </div>
    </>
  );
};
