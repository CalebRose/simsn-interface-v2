import { useMemo } from "react";
import {
  Attributes,
  CountryOptions,
  HockeyArchetypeOptions,
  HockeyPositionOptions,
  navyBlueColor,
  Overview,
  Potentials,
  Preferences,
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

export const HCKTransferPortal = () => {
  const hkStore = useSimHCKStore();
  const {
    chlTeam,
    addTransferPlayerToBoard,
    removeTransferPlayerFromBoard,
    createPromise,
    cancelPromise,
    exportTransferPortalPlayers,
    saveTransferPortalBoard,
    chlRosterMap,
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
  return (
    <>
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
          addPlayerToBoard={addTransferPlayerToBoard}
          removePlayerFromBoard={removeTransferPlayerFromBoard}
          attribute={attribute}
        />
      )}
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
                backgroundColor: navyBlueColor,
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
                backgroundColor: navyBlueColor,
              }}
            >
              <div className="sm:grid sm:grid-cols-2 w-full">
                <div className="flex flex-row w-full gap-x-2 justify-center sm:justify-normal">
                  <div className="flex flex-col">
                    <Text variant="h6" classes="text-nowrap">
                      Weekly Points
                    </Text>
                    <Text variant="body">
                      {teamProfile?.SpentPoints} of {teamProfile?.WeeklyPoints}
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
                  backgroundColor: navyBlueColor,
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
                </div>
              </Border>
              <Border
                direction="col"
                classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 max-h-[50vh] overflow-y-auto"
                styles={{
                  borderColor: teamColors.One,
                  backgroundColor: navyBlueColor,
                }}
              >
                <TransferPlayerTable
                  players={filteredPlayers}
                  colorOne={teamColors.TextColorOne}
                  colorTwo={teamColors.TextColorTwo}
                  colorThree={teamColors.TextColorThree}
                  teamMap={{}}
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
                  backgroundColor: navyBlueColor,
                }}
              >
                Profile table here
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
                  backgroundColor: navyBlueColor,
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
