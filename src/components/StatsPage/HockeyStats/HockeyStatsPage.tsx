import { FC } from "react";
import { StatsPageProps } from "../StatsPage";
import { useHockeyStats } from "./useHockeyStatsPage";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { ActionModal } from "../../Common/ActionModal";
import { Border } from "../../../_design/Borders";
import { Help1, navyBlueColor } from "../../../_constants/constants";
import { StatsSidebar } from "../Common/StatsSidebar";
import { useModal } from "../../../_hooks/useModal";
import { CategoryDropdown } from "../../Recruiting/Common/RecruitingCategoryDropdown";
import { useResponsive } from "../../../_hooks/useMobile";
import { ToggleSwitch } from "../../../_design/Inputs";
import { Text } from "../../../_design/Typography";
import { HockeyStatsTable } from "./HockeyStatsTable";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { StatsPageHelpModal } from "../Common/StatsPageHelpModal";

export const HockeyStatsPage: FC<StatsPageProps> = ({ league }) => {
  const {
    team,
    teamMap,
    modalAction,
    modalPlayer,
    isModalOpen,
    playerMap,
    filteredStats,
    weekOptions,
    seasonOptions,
    teamOptions,
    conferenceOptions,
    totalPages,
    statsType,
    statsView,
    gameType,
    viewGoalieStats,
    gameDay,
    currentPage,
    ChangeGameDay,
    ChangeGoalieView,
    goToPreviousPage,
    goToNextPage,
    handleCloseModal,
    ChangeStatsType,
    ChangeGameType,
    ChangeStatsView,
    handlePlayerModal,
    SelectConferenceOptions,
    SelectTeamOptions,
    SelectWeekOption,
    SelectSeasonOption,
    Search,
    Export,
  } = useHockeyStats();
  const { isMobile, isDesktop } = useResponsive();
  const helpModal = useModal();
  const teamColors = useTeamColors(
    team?.ColorOne,
    team?.ColorTwo,
    team?.ColorThree
  );
  return (
    <>
      {modalPlayer && (
        <ActionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          playerID={modalPlayer.ID}
          playerLabel={`${modalPlayer.Position} ${modalPlayer.Archetype} ${modalPlayer.FirstName} ${modalPlayer.LastName}`}
          league={league}
          teamID={modalPlayer.PreviousTeamID}
          modalAction={modalAction}
          player={modalPlayer}
        />
      )}
      <StatsPageHelpModal
        isOpen={helpModal.isModalOpen}
        onClose={helpModal.handleCloseModal}
        league={league}
        modalAction={Help1}
      />
      <div className="grid grid-flow-row grid-auto-rows-auto w-full h-full max-[1024px]:grid-cols-1 max-[1024px]:gap-y-2 grid-cols-[minmax(200px,2fr)_10fr] max-[1024px]:gap-x-1 gap-x-2 mb-2">
        <StatsSidebar
          team={team!!}
          teamColors={teamColors}
          league={league}
          statsView={statsView}
          statsType={statsType}
          ChangeStatsView={ChangeStatsView}
          ChangeStatsType={ChangeStatsType}
          HandleHelpModal={helpModal.handleOpenModal}
          weekOptions={weekOptions}
          seasonOptions={seasonOptions}
          SelectWeekOption={SelectWeekOption}
          SelectSeasonOption={SelectSeasonOption}
          Search={Search}
          Export={Export}
          gameDay={gameDay}
          changeGameDay={ChangeGameDay}
        />
        <div className="flex flex-col w-full max-[1024px]:gap-y-2">
          <div className="flex flex-col sm:flex-row gap-x-2">
            <Border
              direction="row"
              classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 items-center justify-start gap-x-8 flex-col lg:flex-row"
              styles={{
                borderColor: teamColors.One,
                backgroundColor: navyBlueColor,
              }}
            >
              <div className="flex flex-col">
                <Text variant="h4">Goalie Stats</Text>
                <ToggleSwitch
                  checked={viewGoalieStats}
                  onChange={ChangeGoalieView}
                />
              </div>
              {!isDesktop && (
                <div className="flex flex-row gap-x-2">
                  <CategoryDropdown
                    label="Teams"
                    options={teamOptions}
                    change={SelectTeamOptions}
                    isMulti={true}
                    isMobile={isMobile}
                  />
                  <CategoryDropdown
                    label="Conferences"
                    options={conferenceOptions}
                    change={SelectConferenceOptions}
                    isMulti={true}
                    isMobile={isMobile}
                  />
                </div>
              )}
              {isDesktop && (
                <>
                  <CategoryDropdown
                    label="Teams"
                    options={teamOptions}
                    change={SelectTeamOptions}
                    isMulti={true}
                    isMobile={isMobile}
                  />
                  <CategoryDropdown
                    label="Conferences"
                    options={conferenceOptions}
                    change={SelectConferenceOptions}
                    isMulti={true}
                    isMobile={isMobile}
                  />
                </>
              )}
            </Border>
          </div>
          <div className="flex flex-col">
            <Border
              direction="col"
              classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 items-center justify-start gap-x-8 overflow-y-auto max-h-[50vh] md:max-h-[70vh]"
              styles={{
                borderColor: teamColors.One,
                backgroundColor: navyBlueColor,
              }}
            >
              <HockeyStatsTable
                team={team}
                teamMap={teamMap}
                teamColors={teamColors}
                playerMap={playerMap}
                league={league}
                isMobile={isMobile}
                openModal={handlePlayerModal}
                stats={filteredStats}
                statsType={statsType}
                statsView={statsView}
                isGoalie={viewGoalieStats}
                currentPage={currentPage}
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
          </div>
        </div>
      </div>
    </>
  );
};
