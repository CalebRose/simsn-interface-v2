import { FC } from "react";
import { StatsPageProps } from "../StatsPage";
import { useFootballStats } from "./useFootballStatsPage";
import { useResponsive } from "../../../_hooks/useMobile";
import { useModal } from "../../../_hooks/useModal";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { ActionModal } from "../../Common/ActionModal";
import { StatsSidebar } from "../Common/StatsSidebar";
import { Border } from "../../../_design/Borders";
import { Help1, navyBlueColor, SimCFB } from "../../../_constants/constants";
import { Text } from "../../../_design/Typography";
import { CategoryDropdown } from "../../Recruiting/Common/RecruitingCategoryDropdown";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { FootballStatsTable } from "./FootballStatsTable";
import { ToggleSwitch } from "../../../_design/Inputs";
import { StatsPageHelpModal } from "../Common/StatsPageHelpModal";

export const FootballStatsPage: FC<StatsPageProps> = ({ league }) => {
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
    footballStatsType,
    statsView,
    gameType,
    currentPage,
    leagueOptions,
    SelectLeagueOption,
    goToPreviousPage,
    goToNextPage,
    handleCloseModal,
    ChangeStatsType,
    ChangeFBStatsType,
    ChangeGameType,
    ChangeStatsView,
    handlePlayerModal,
    SelectConferenceOptions,
    SelectTeamOptions,
    SelectWeekOption,
    SelectSeasonOption,
    Search,
    Export,
  } = useFootballStats();
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
          ChangeFBStatsType={ChangeFBStatsType}
          footballStatsType={footballStatsType}
          HandleHelpModal={helpModal.handleOpenModal}
          weekOptions={weekOptions}
          seasonOptions={seasonOptions}
          SelectWeekOption={SelectWeekOption}
          SelectSeasonOption={SelectSeasonOption}
          Search={Search}
          Export={Export}
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
              {league === SimCFB && (
                <CategoryDropdown
                  label="League"
                  options={leagueOptions}
                  change={SelectLeagueOption}
                  isMulti={false}
                  isMobile={isMobile}
                />
              )}
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
              <FootballStatsTable
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
                footballStatsType={footballStatsType}
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
