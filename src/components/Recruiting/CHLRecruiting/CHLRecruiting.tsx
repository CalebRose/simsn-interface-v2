import { useSimHCKStore } from "../../../context/SimHockeyContext";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { useCHLRecruiting } from "./useCHLRecruiting";
import { Border } from "../../../_design/Borders";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { RecruitingSideBar } from "../Common/RecruitingSideBar";
import {
  Attributes,
  CountryOptions,
  Help1,
  HockeyArchetypeOptions,
  HockeyPositionOptions,
  Potentials,
  Preferences,
  Overview,
  RecruitingRankings,
  RecruitingTeamBoard,
  SimCHL,
  StarOptions,
  StatusOptions,
  navyBlueColor,
  RecruitingClassView,
} from "../../../_constants/constants";
import { CategoryDropdown } from "../Common/RecruitingCategoryDropdown";
import { RecruitTable } from "../Common/RecruitTable";
import { ActionModal } from "../../Common/ActionModal";
import { useResponsive } from "../../../_hooks/useMobile";
import { TeamRankingsTable } from "../Common/TeamRankingsTable";
import { RecruitProfileTable } from "../Common/RecruitProfileTable";
import { useModal } from "../../../_hooks/useModal";
import { RecruitingHelpModal } from "../Common/RecruitingHelpModal";
import { RecruitingAISettingsModal } from "../Common/RecruitingAISettingsModal";
import { useLoadMessage } from "../../../_hooks/useLoadMessage";
import { CHLRecruitLockedMessages } from "../../../_constants/loadMessages";
import { RecruitingClassTable } from "../Common/RecruitingClassTable";

export const CHLRecruiting = () => {
  const hkStore = useSimHCKStore();
  const {
    recruitProfiles,
    chlTeam,
    chlTeamMap,
    addRecruitToBoard,
    removeRecruitFromBoard,
    chlTeamOptions,
    chlConferenceOptions,
    updatePointsOnRecruit,
    toggleScholarship,
    scoutCrootAttribute,
    SaveRecruitingBoard,
    SaveAIRecruitingSettings,
    ExportCHLRecruits,
  } = hkStore;
  const {
    teamProfile,
    recruitMap,
    recruitingCategory,
    updateRecruitingCategory,
    isModalOpen,
    handleCloseModal,
    regionOptions,
    SelectArchetypeOptions,
    SelectCountryOption,
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
    offensiveSystemsInformation,
    defensiveSystemsInformation,
  } = useCHLRecruiting();
  const teamColors = useTeamColors(
    chlTeam?.ColorOne,
    chlTeam?.ColorTwo,
    chlTeam?.ColorThree
  );
  const { isMobile } = useResponsive();
  const helpModal = useModal();
  const aiSettingsModal = useModal();
  const lockMessage = useLoadMessage(CHLRecruitLockedMessages, 5000);
  const recruitsExport = async () => {
    await ExportCHLRecruits();
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
          addPlayerToBoard={addRecruitToBoard}
          removePlayerFromBoard={removeRecruitFromBoard}
          toggleScholarship={toggleScholarship}
          attribute={attribute}
          scoutAttribute={scoutCrootAttribute}
        />
      )}
      <RecruitingHelpModal
        isOpen={helpModal.isModalOpen}
        onClose={helpModal.handleCloseModal}
        league={SimCHL}
        modalAction={Help1}
      />
      <RecruitingAISettingsModal
        isOpen={aiSettingsModal.isModalOpen}
        onClose={aiSettingsModal.handleCloseModal}
        league={SimCHL}
        teamProfile={teamProfile}
        SaveSettings={SaveAIRecruitingSettings}
      />
      <div className="grid grid-flow-row grid-auto-rows-auto w-full h-full max-[1024px]:grid-cols-1 max-[1024px]:gap-y-2 grid-cols-[2fr_10fr] max-[1024px]:gap-x-1 gap-x-2 mb-2">
        <RecruitingSideBar
          Team={chlTeam!!}
          TeamProfile={teamProfile!!}
          teamColors={teamColors}
          league={SimCHL}
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
                <Button
                  type="button"
                  variant={
                    recruitingCategory === RecruitingRankings
                      ? "success"
                      : "secondary"
                  }
                  onClick={() => updateRecruitingCategory(RecruitingRankings)}
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
                  onClick={() => updateRecruitingCategory(RecruitingClassView)}
                >
                  Class
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
                <div className="flex flex-row w-full gap-x-6 justify-center sm:justify-normal">
                  <div className="flex flex-col">
                    <Text variant="h6" classes="text-nowrap">
                      AI Active
                    </Text>
                    <Text variant="body">
                      {teamProfile?.IsAI ? "Yes" : "No"}
                    </Text>
                  </div>
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
                      teamProfile!.SpentPoints <= 50 ? "primary" : "warning"
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
                  teamMap={chlTeamMap}
                  category={tableViewType}
                  league={SimCHL}
                  team={chlTeam}
                  openModal={openModal}
                  isMobile={isMobile}
                  recruitOnBoardMap={recruitOnBoardMap}
                  currentPage={currentPage}
                  offensiveSystemsInformation={offensiveSystemsInformation}
                  defensiveSystemsInformation={defensiveSystemsInformation}
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
                  recruitProfiles={recruitProfiles}
                  recruitMap={recruitMap}
                  teamMap={chlTeamMap}
                  team={chlTeam}
                  league={SimCHL}
                  category={tableViewType}
                  isMobile={isMobile}
                  ChangeInput={updatePointsOnRecruit}
                  openModal={openModal}
                  setAttribute={setAttribute}
                  offensiveSystemsInformation={offensiveSystemsInformation}
                  defensiveSystemsInformation={defensiveSystemsInformation}
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
                    options={chlConferenceOptions}
                    change={SelectConferences}
                    isMulti={true}
                    isMobile={isMobile}
                  />
                  <CategoryDropdown
                    label="Teams"
                    options={chlTeamOptions}
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
                  colorOne={teamColors.One}
                  colorTwo={teamColors.Two}
                  colorThree={teamColors.Three}
                  teamProfiles={teamRankList}
                  teamMap={chlTeamMap}
                  team={chlTeam}
                  league={SimCHL}
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
                    options={chlTeamOptions}
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
                  teamMap={chlTeamMap!!}
                  team={chlTeam}
                  league={SimCHL}
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
