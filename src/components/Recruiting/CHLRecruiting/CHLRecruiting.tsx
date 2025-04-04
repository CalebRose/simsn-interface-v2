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
  HockeyArchetypeOptions,
  HockeyPositionOptions,
  Preferences,
  RecruitingOverview,
  RecruitingRankings,
  RecruitingTeamBoard,
  SimCHL,
  StarOptions,
  StatusOptions,
} from "../../../_constants/constants";
import { RecruitingCategoryDropdown } from "../Common/RecruitingCategoryDropdown";
import { RecruitTable } from "../Common/RecruitTable";
import { ActionModal } from "../../Common/ActionModal";
import { useMobile } from "../../../_hooks/useMobile";

export const CHLRecruiting = () => {
  const hkStore = useSimHCKStore();
  const { recruits, teamProfileMap, chlTeam, chlTeamMap } = hkStore;
  const {
    teamProfile,
    recruitMap,
    recruitingCategory,
    setRecruitingCategory,
    isModalOpen,
    handleOpenModal,
    handleCloseModal,
    regionOptions,
    SelectArchetypeOptions,
    SelectCountryOption,
    SelectPositionOptions,
    SelectRegionOptions,
    country,
    SelectStarOptions,
    SelectStatusOptions,
    tableViewType,
    setTableViewType,
    pagedRecruits,
    goToPreviousPage,
    goToNextPage,
    currentPage,
    totalPages,
    openModal,
    modalAction,
    modalPlayer,
  } = useCHLRecruiting();
  const teamColors = useTeamColors(
    chlTeam?.ColorOne,
    chlTeam?.ColorTwo,
    chlTeam?.ColorThree
  );
  const [isMobile] = useMobile();

  /* 
        Will also need to add player profiles to bootstrap call.
        Likely won't need to do double-wrapped call because of recruit mapping

        There will likely be several select handles.
        Overall Grade
        Stars
        State
        Position
        Archetype
        Status

        Will also likely need a Recruiting Action Modal
        - Toggle Scholarship
        - Remove player from Board
        - Recruit Info Card
        - Saving Team Board

        We will also need to come up with categories that we will allow users to toggle.
        - Viewing Overall Attributes
        - Recruit Preferences

        Might also help with having a left-side section to detail team recruiting info

        This is for the overview alone.
    */
  return (
    <>
      {modalPlayer && (
        <ActionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          playerID={modalPlayer.ID}
          playerLabel={`${modalPlayer.Position} ${modalPlayer.Archetype} ${modalPlayer.FirstName} ${modalPlayer.LastName}`}
          teamID={modalPlayer.TeamID}
          league={SimCHL}
          modalAction={modalAction}
          player={modalPlayer}
        />
      )}
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
                backgroundColor: teamColors.One,
                borderColor: teamColors.Two,
              }}
            >
              <ButtonGroup classes="sm:flex sm:flex-auto sm:flex-1">
                <Button
                  type="button"
                  variant={
                    recruitingCategory === RecruitingOverview
                      ? "success"
                      : "secondary"
                  }
                  onClick={() => setRecruitingCategory(RecruitingOverview)}
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
                backgroundColor: teamColors.One,
                borderColor: teamColors.Two,
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
                  <Button type="button" variant="primary">
                    Help
                  </Button>
                  <Button type="button" variant="primary">
                    Settings
                  </Button>
                  <Button type="button" variant="primary">
                    Save
                  </Button>
                </ButtonGroup>
              </div>
            </Border>
          </div>
          {recruitingCategory === RecruitingOverview && (
            <>
              <Border
                direction="row"
                classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 items-center justify-center"
                styles={{
                  backgroundColor: teamColors.One,
                  borderColor: teamColors.Two,
                }}
              >
                <div className="flex flex-row flex-wrap gap-x-1 sm:gap-x-2 gap-y-2 px-2 w-full">
                  <RecruitingCategoryDropdown
                    label="Positions"
                    options={HockeyPositionOptions}
                    change={SelectPositionOptions}
                    isMulti={true}
                    isMobile={isMobile}
                  />
                  <RecruitingCategoryDropdown
                    label="Archetype"
                    options={HockeyArchetypeOptions}
                    change={SelectArchetypeOptions}
                    isMulti={true}
                    isMobile={isMobile}
                  />
                  <RecruitingCategoryDropdown
                    label="Country"
                    options={CountryOptions}
                    change={SelectCountryOption}
                    isMulti={false}
                    isMobile={isMobile}
                  />
                  {regionOptions.length > 0 && (
                    <RecruitingCategoryDropdown
                      label="Region"
                      options={regionOptions}
                      change={SelectRegionOptions}
                      isMulti={false}
                      isMobile={isMobile}
                    />
                  )}
                  <RecruitingCategoryDropdown
                    label="Stars"
                    options={StarOptions}
                    change={SelectStarOptions}
                    isMulti={true}
                    isMobile={isMobile}
                  />
                  <RecruitingCategoryDropdown
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
                  backgroundColor: teamColors.One,
                  borderColor: teamColors.Two,
                }}
              >
                <RecruitTable
                  croots={pagedRecruits}
                  colorOne={teamColors.One}
                  colorTwo={teamColors.Two}
                  colorThree={teamColors.Three}
                  teamMap={chlTeamMap}
                  category={tableViewType}
                  league={SimCHL}
                  team={chlTeam}
                  openModal={openModal}
                  isMobile={isMobile}
                />
                <div className="flex flex-row justify-center py-2">
                  <ButtonGroup>
                    <Button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 0}
                    >
                      Prev
                    </Button>
                    <Text variant="body-small" className="flex items-center">
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
        </div>
      </div>
    </>
  );
};
