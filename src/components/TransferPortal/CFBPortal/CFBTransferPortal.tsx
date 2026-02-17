import React, { useMemo } from "react";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import { useResponsive } from "../../../_hooks/useMobile";
import { useBackgroundColor } from "../../../_hooks/useBackgroundColor";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { useModal } from "../../../_hooks/useModal";
import { useLoadMessage } from "../../../_hooks/useLoadMessage";
import { CFBRecruitLockedMessages } from "../../../_constants/loadMessages";
import { PromiseModal } from "../../Common/PromiseModal";
import {
  Attributes,
  FootballArchetypeOptions,
  FootballPositionOptions,
  Help1,
  Overview,
  Preferences,
  Promises,
  RecruitingTeamBoard,
  SimCFB,
  StarOptions,
  YearOptions,
} from "../../../_constants/constants";
import { ActionModal } from "../../Common/ActionModal";
import { PortalHelpModal } from "../../Recruiting/Common/RecruitingHelpModal";
import { TransferPortalSideBar } from "../Common/TransferPortalSideBar";
import { Border } from "../../../_design/Borders";
import { Button, ButtonGrid, ButtonGroup } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { CategoryDropdown } from "../../Recruiting/Common/RecruitingCategoryDropdown";
import { TransferPlayerTable } from "../Common/TransferPlayerTable";
import { TransferPortalProfileTable } from "../Common/TransferProfileTable";
import { useCFBTransferPortal } from "./useCFBTransferPortal";

export const CFBTransferPortal = () => {
  const {
    cfbTeam,
    addTransferPlayerToBoard,
    removeTransferPlayerFromBoard,
    cfbTeamMap,
    updatePointsOnPortalPlayer,
    promisePlayer,
    cancelPromise,
    exportTransferPortalPlayers,
    saveTransferPortalBoard,
    cfbRosterMap,
    teamTransferPortalProfiles,
    collegePromiseMap,
  } = useSimFBAStore();
  const {
    teamProfile,
    portalPlayerMap,
    recruitingCategory,
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
    SelectPositionOptions,
    SelectRegionOptions,
    SelectStarOptions,
    SelectYearOptions,
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
    cfbTeamOptions,
    SelectPrevTeamOptions,
    isPortalOpen,
  } = useCFBTransferPortal();
  const rosterCount = useMemo(() => {
    if (!cfbTeam) {
      return { rosterCount: 0 };
    }
    const rMap: Record<string, number> = {};
    const roster = cfbRosterMap![cfbTeam.ID];
    for (let i = 0; i < roster.length; i++) {
      const p = roster[i];
      rMap[p.Position] = rMap[p.Position] + 1 || 1;
    }
    return { ...rMap, rosterCount: roster.length };
  }, [cfbTeam, cfbRosterMap]);
  const { backgroundColor } = useBackgroundColor();
  const teamColors = useTeamColors(
    cfbTeam?.ColorOne,
    cfbTeam?.ColorTwo,
    cfbTeam?.ColorThree,
  );
  const { isMobile } = useResponsive();
  const helpModal = useModal();
  const aiSettingsModal = useModal();
  const lockMessage = useLoadMessage(CFBRecruitLockedMessages, 5000);
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
          league={SimCFB}
          isOpen={promiseModal.isModalOpen}
          onClose={promiseModal.handleCloseModal}
          player={modalPlayer}
          promise={modalPlayerPromise}
          promisePlayer={promisePlayer}
        />
      )}
      {modalPlayer && (
        <ActionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          playerID={modalPlayer.ID}
          playerLabel={`${modalPlayer.Position} ${modalPlayer.Archetype} ${modalPlayer.FirstName} ${modalPlayer.LastName}`}
          teamID={cfbTeam!.ID}
          league={SimCFB}
          modalAction={modalAction}
          player={modalPlayer}
          addPlayerToBoard={addTransferPlayerToBoard}
          removePlayerFromBoard={removeTransferPlayerFromBoard}
          attribute={attribute}
        />
      )}
      <PortalHelpModal
        isOpen={helpModal.isModalOpen}
        onClose={helpModal.handleCloseModal}
        league={SimCFB}
        modalAction={Help1}
      />
      {/* Add help modals here & setting modals if needed */}
      <div className="grid grid-flow-row grid-auto-rows-auto w-full h-full max-[1024px]:grid-cols-1 max-[1024px]:gap-y-2 grid-cols-[2fr_10fr] max-[1024px]:gap-x-1 gap-x-2 mb-2">
        <TransferPortalSideBar
          teamColors={teamColors}
          Team={cfbTeam!!}
          TeamProfile={teamProfile}
          league={SimCFB}
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
              <div className="sm:grid sm:grid-cols-2 w-full px-6">
                <div className="flex flex-row w-full gap-x-2 justify-center sm:justify-normal">
                  <div className="flex flex-col">
                    <Text variant="h6" classes="text-nowrap">
                      Weekly Points
                    </Text>
                    <Text variant="body">
                      {currentSpentPoints} of {teamProfile?.WeeklyPoints}
                    </Text>
                  </div>
                </div>
                <ButtonGrid classes="w-full justify-center pe-2">
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
                      teamProfile && teamProfile.SpentPoints <= 50
                        ? "primary"
                        : "warning"
                    }
                    size="md"
                    onClick={saveTransferPortalBoard}
                    disabled={recruitingLocked || !isPortalOpen}
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
                    options={FootballPositionOptions}
                    change={SelectPositionOptions}
                    isMulti={true}
                    isMobile={isMobile}
                  />
                  <CategoryDropdown
                    label="Archetype"
                    options={FootballArchetypeOptions}
                    change={SelectArchetypeOptions}
                    isMulti={true}
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
                    label="Year"
                    options={YearOptions}
                    change={SelectYearOptions}
                    isMulti={true}
                    isMobile={isMobile}
                  />
                  <CategoryDropdown
                    label="Stars"
                    options={StarOptions}
                    change={SelectStarOptions}
                    isMulti={true}
                    isMobile={isMobile}
                  />
                  <CategoryDropdown
                    label="Prev. Teams"
                    options={cfbTeamOptions}
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
                  teamMap={cfbTeamMap}
                  team={cfbTeam}
                  category={tableViewType}
                  openModal={openModal}
                  league={SimCFB}
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
                  team={cfbTeam}
                  transferPortalProfiles={teamTransferPortalProfiles}
                  playerMap={portalPlayerMap}
                  teamMap={cfbTeamMap}
                  league={SimCFB}
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
