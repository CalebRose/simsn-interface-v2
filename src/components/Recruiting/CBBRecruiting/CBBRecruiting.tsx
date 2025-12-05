import {
  BasketballArchetypeOptions,
  BasketballPositionOptions,
  cbbCountryOptions,
  Help1,
  navyBlueColor,
  Overview,
  RecruitingClassView,
  RecruitingRankings,
  RecruitingTeamBoard,
  SimCBB,
  StarOptions,
  StatusOptions,
} from "../../../_constants/constants";
import { CBBRecruitLockedMessages } from "../../../_constants/loadMessages";
import { Border } from "../../../_design/Borders";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { useLoadMessage } from "../../../_hooks/useLoadMessage";
import { useResponsive } from "../../../_hooks/useMobile";
import { useModal } from "../../../_hooks/useModal";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { useSimBBAStore } from "../../../context/SimBBAContext";
import { ActionModal } from "../../Common/ActionModal";
import { RecruitingAISettingsModal } from "../Common/RecruitingAISettingsModal";
import { CategoryDropdown } from "../Common/RecruitingCategoryDropdown";
import { RecruitingClassTable } from "../Common/RecruitingClassTable";
import { RecruitingHelpModal } from "../Common/RecruitingHelpModal";
import { RecruitingSideBar } from "../Common/RecruitingSideBar";
import { RecruitProfileTable } from "../Common/RecruitProfileTable";
import { RecruitTable } from "../Common/RecruitTable";
import { TeamRankingsTable } from "../Common/TeamRankingsTable";
import { useCBBRecruiting } from "./useCBBRecruiting";

export const CBBRecruiting = () => {
  const bbStore = useSimBBAStore();
  const {
    cbbTeam,
    cbbTeamMap,
    cbbTeamOptions,
    cbbConferenceOptions,
    addRecruitToBoard,
    removeRecruitFromBoard,
    toggleScholarship,
    updatePointsOnRecruit,
    SaveRecruitingBoard,
    SaveAIRecruitingSettings,
    ExportCBBRecruits,
  } = bbStore;

  const {
    teamProfile,
    sortedCrootProfiles,
    recruitMap,
    recruitingCategory,
    setRecruitingCategory,
    isModalOpen,
    handleCloseModal,
    regionOptions,
    SelectArchetypeOptions,
    SelectPositionOptions,
    SelectRegionOptions,
    SelectStarOptions,
    SelectStatusOptions,
    tableViewType,
    setTableViewType,
    filteredRecruits,
    goToPreviousPage,
    goToNextPage,
    currentPage,
    totalPages,
    openModal,
    modalAction,
    modalPlayer,
    recruitOnBoardMap,
    teamRankList,
    SelectConferences,
    SelectTeams,
    attribute,
    setAttribute,
    recruitingLocked,
    filteredClass,
    SelectClass,
    country,
    SelectCountryOptions,
  } = useCBBRecruiting();

  const { isMobile } = useResponsive();
  const teamColors = useTeamColors(
    cbbTeam?.ColorOne,
    cbbTeam?.ColorTwo,
    cbbTeam?.ColorThree
  );
  const helpModal = useModal();
  const aiSettingsModal = useModal();
  const lockMessage = useLoadMessage(CBBRecruitLockedMessages, 5000);
  const recruitsExport = async () => {
    await ExportCBBRecruits();
  };

  return (
    <>
      {modalPlayer && (
        <ActionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          playerID={modalPlayer.ID}
          playerLabel={`${modalPlayer.Position} ${modalPlayer.Archetype} ${modalPlayer.FirstName} ${modalPlayer.LastName}`}
          teamID={cbbTeam!.ID}
          league={SimCBB}
          modalAction={modalAction}
          player={modalPlayer}
          attribute={attribute}
          addPlayerToBoard={addRecruitToBoard}
          removePlayerFromBoard={removeRecruitFromBoard}
          toggleScholarship={toggleScholarship}
        />
      )}
      <RecruitingHelpModal
        isOpen={helpModal.isModalOpen}
        onClose={helpModal.handleCloseModal}
        league={SimCBB}
        modalAction={Help1}
      />
      {teamProfile && (
        <RecruitingAISettingsModal
          isOpen={aiSettingsModal.isModalOpen}
          onClose={aiSettingsModal.handleCloseModal}
          league={SimCBB}
          teamProfile={teamProfile}
          SaveSettings={SaveAIRecruitingSettings}
        />
      )}
      <div className="grid grid-flow-row grid-auto-rows-auto w-full h-full max-[1024px]:grid-cols-1 max-[1024px]:gap-y-2 grid-cols-[2fr_10fr] max-[1024px]:gap-x-1 gap-x-2 mb-2">
        {teamProfile && (
          <RecruitingSideBar
            Team={cbbTeam!!}
            TeamProfile={teamProfile!!}
            teamColors={teamColors}
            league={SimCBB}
          />
        )}
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
                  onClick={() => setRecruitingCategory(Overview)}
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
                  onClick={() => setRecruitingCategory(RecruitingTeamBoard)}
                >
                  Board
                </Button>
                <Button
                  type="button"
                  variant={
                    recruitingCategory === RecruitingRankings
                      ? "success"
                      : "secondary"
                  }
                  onClick={() => setRecruitingCategory(RecruitingRankings)}
                >
                  Rankings
                </Button>
                <Button
                  type="button"
                  variant={
                    recruitingCategory === RecruitingClassView
                      ? "success"
                      : "secondary"
                  }
                  onClick={() => setRecruitingCategory(RecruitingClassView)}
                >
                  Class
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
                <div className="flex flex-row w-full gap-x-6 justify-center sm:justify-normal">
                  <div className="flex flex-col">
                    <Text
                      variant="body-small"
                      classes="text-nowrap font-semibold"
                    >
                      AI Active
                    </Text>
                    <Text variant="body-small">
                      {teamProfile?.IsAI ? "Yes" : "No"}
                    </Text>
                  </div>
                  <div className="flex flex-col">
                    <Text
                      variant="body-small"
                      classes="text-nowrap font-semibold"
                    >
                      Weekly Points
                    </Text>
                    <Text variant="body-small">
                      {teamProfile?.SpentPoints} of {teamProfile?.WeeklyPoints}
                    </Text>
                  </div>
                </div>
                <ButtonGroup classes="flex flex-row w-full justify-center sm:justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={helpModal.handleOpenModal}
                    size="sm"
                  >
                    Help
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={recruitsExport}
                    size="sm"
                  >
                    Export
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={aiSettingsModal.handleOpenModal}
                  >
                    Settings
                  </Button>
                  <Button
                    type="button"
                    variant={
                      teamProfile && teamProfile!.SpentPoints <= 50
                        ? "primary"
                        : "warning"
                    }
                    size="sm"
                    onClick={SaveRecruitingBoard}
                    disabled={recruitingLocked}
                  >
                    Save
                  </Button>
                </ButtonGroup>
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
                    options={BasketballPositionOptions}
                    change={SelectPositionOptions}
                    isMulti={true}
                    isMobile={isMobile}
                  />
                  <CategoryDropdown
                    label="Archetype"
                    options={BasketballArchetypeOptions}
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
                    label="Country"
                    options={cbbCountryOptions}
                    change={SelectCountryOptions}
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
                    label="Status"
                    options={StatusOptions}
                    change={SelectStatusOptions}
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
                <RecruitTable
                  croots={filteredRecruits}
                  colorOne={teamColors.One}
                  colorTwo={teamColors.Two}
                  colorThree={teamColors.Three}
                  teamMap={cbbTeamMap}
                  category={tableViewType}
                  league={SimCBB}
                  team={cbbTeam}
                  openModal={openModal}
                  isMobile={isMobile}
                  recruitOnBoardMap={recruitOnBoardMap}
                  currentPage={currentPage}
                  teamProfile={teamProfile!!}
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
                <RecruitProfileTable
                  colorOne={teamColors.One}
                  colorTwo={teamColors.Two}
                  colorThree={teamColors.Three}
                  recruitProfiles={sortedCrootProfiles}
                  recruitMap={recruitMap}
                  teamMap={cbbTeamMap}
                  team={cbbTeam}
                  league={SimCBB}
                  category={tableViewType}
                  isMobile={isMobile}
                  ChangeInput={updatePointsOnRecruit}
                  openModal={openModal}
                  setAttribute={setAttribute}
                  teamProfile={teamProfile!!}
                />
              </Border>
            </>
          )}
          {!recruitingLocked && recruitingCategory === RecruitingRankings && (
            <>
              <Border
                direction="row"
                classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 items-center justify-center"
                styles={{
                  borderColor: teamColors.One,
                  backgroundColor: navyBlueColor,
                }}
              >
                <div className="flex flex-row flex-nowrap gap-x-1 sm:gap-x-2 gap-y-2 px-2 w-full">
                  <CategoryDropdown
                    label="Conferences"
                    options={cbbConferenceOptions}
                    change={SelectConferences}
                    isMulti={true}
                    isMobile={isMobile}
                  />
                  <CategoryDropdown
                    label="Teams"
                    options={cbbTeamOptions}
                    change={SelectTeams}
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
                <TeamRankingsTable
                  colorOne={navyBlueColor}
                  colorTwo={teamColors.Two}
                  colorThree={teamColors.Three}
                  teamProfiles={teamRankList}
                  teamMap={cbbTeamMap}
                  team={cbbTeam}
                  league={SimCBB}
                  isMobile={isMobile}
                />
              </Border>
            </>
          )}
          {!recruitingLocked && recruitingCategory === RecruitingClassView && (
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
                    label="Team"
                    options={cbbTeamOptions}
                    change={SelectClass}
                    isMobile={isMobile}
                    isMulti={false}
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
                <RecruitingClassTable
                  colorOne={teamColors.One}
                  colorTwo={teamColors.Two}
                  colorThree={teamColors.Three}
                  crootingClass={filteredClass}
                  openModal={openModal}
                  teamMap={cbbTeamMap!!}
                  team={cbbTeam}
                  league={SimCBB}
                  isMobile={isMobile}
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
