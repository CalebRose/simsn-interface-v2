import React from "react";
import { useSimBBAStore } from "../../../context/SimBBAContext";
import { useModal } from "../../../_hooks/useModal";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { useBackgroundColor } from "../../../_hooks/useBackgroundColor";
import { useResponsive } from "../../../_hooks/useMobile";
import { OfferModal } from "../../Common/OfferModal";
import {
  Attributes,
  BasketballArchetypeOptions,
  BasketballPositionOptions,
  Contracts,
  CountryOptions,
  FreeAgent,
  GLeague,
  Help1,
  Overview,
  Preferences,
  SimNBA,
  Waivers,
} from "../../../_constants/constants";
import { ActionModal } from "../../Common/ActionModal";
import { FreeAgencyHelpModal } from "../Common/FreeAgencyHelpModal";
import { FreeAgencySidebar } from "../Common/FreeAgencySidebar";
import { Border } from "../../../_design/Borders";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { FreeAgentTable } from "../Common/FreeAgencyTable";
import { OfferTable } from "../Common/OffersTable";
import { Text } from "../../../_design/Typography";
import { CategoryDropdown } from "../../Recruiting/Common/RecruitingCategoryDropdown";
import { Timestamp } from "../../../models/basketballModels";
import { useNBAFreeAgency } from "./useNBAFreeAgency";

export const NBAFreeAgency = () => {
  const bbStore = useSimBBAStore();
  const {
    nbaTeam,
    cbb_Timestamp,
    nbaTeamMap: proTeamMap,
    SaveFreeAgencyOffer,
    CancelFreeAgencyOffer,
    SaveWaiverWireOffer,
    CancelWaiverWireOffer,
  } = bbStore;
  const {
    teamCapsheet,
    adjustedTeamCapsheet,
    modalAction,
    isModalOpen,
    handleCloseModal,
    freeAgencyCategory,
    handleFreeAgencyCategory,
    goToPreviousPage,
    goToNextPage,
    currentPage,
    totalPages,
    modalPlayer,
    handleFAModal,
    SelectArchetypeOptions,
    SelectPositionOptions,
    SelectRegionOptions,
    country,
    regionOptions,
    filteredFA,
    freeAgentMap,
    waiverPlayerMap,
    teamFreeAgentOffers,
    teamWaiverOffers,
    offerMapByPlayerType,
    teamOfferMap,
    playerType,
    setPlayerType,
    offerAction,
    offerModal,
    tableViewType,
    setTableViewType,
    SelectCountryOption,
    handleOfferModal,
  } = useNBAFreeAgency();
  const { backgroundColor } = useBackgroundColor();
  const { isMobile } = useResponsive();
  const teamColors = useTeamColors(
    nbaTeam?.ColorOne,
    nbaTeam?.ColorTwo,
    nbaTeam?.ColorThree,
  );
  const helpModal = useModal();
  const aiSettingsModal = useModal();

  return (
    <>
      {modalPlayer && (
        <OfferModal
          isOpen={offerModal.isModalOpen}
          capsheet={teamCapsheet}
          onClose={offerModal.handleCloseModal}
          league={SimNBA}
          player={modalPlayer}
          existingOffer={teamOfferMap[modalPlayer.ID]}
          action={offerAction}
          ts={cbb_Timestamp!!}
          confirmOffer={SaveFreeAgencyOffer}
        />
      )}
      {modalPlayer && (
        <ActionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          playerID={modalPlayer.ID}
          playerLabel={`${modalPlayer.Position} ${modalPlayer.Archetype} ${modalPlayer.FirstName} ${modalPlayer.LastName}`}
          league={SimNBA}
          teamID={modalPlayer.PreviousTeamID}
          modalAction={modalAction}
          player={modalPlayer}
          offer={teamOfferMap[modalPlayer.ID]}
          cancelFAOffer={CancelFreeAgencyOffer}
        />
      )}
      <FreeAgencyHelpModal
        isOpen={helpModal.isModalOpen}
        onClose={helpModal.handleCloseModal}
        league={SimNBA}
        modalAction={Help1}
      />
      <div className="grid grid-flow-row grid-auto-rows-auto w-full h-full max-[1024px]:grid-cols-1 max-[1024px]:gap-y-2 grid-cols-[2fr_10fr] max-[1024px]:gap-x-1 gap-x-2 mb-2">
        <FreeAgencySidebar
          Capsheet={teamCapsheet}
          AdjCapsheet={adjustedTeamCapsheet}
          Team={nbaTeam!!}
          teamColors={teamColors}
          league={SimNBA}
          ts={cbb_Timestamp!! as Timestamp}
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
                    freeAgencyCategory === Overview ? "success" : "secondary"
                  }
                  onClick={() => handleFreeAgencyCategory(Overview)}
                >
                  Overview
                </Button>
                <Button
                  type="button"
                  variant={
                    freeAgencyCategory === Contracts ? "success" : "secondary"
                  }
                  onClick={() => handleFreeAgencyCategory(Contracts)}
                >
                  Contracts
                </Button>
              </ButtonGroup>
              {freeAgencyCategory === Overview && (
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
                  <Button
                    type="button"
                    variant={playerType === FreeAgent ? "success" : "secondary"}
                    onClick={() => setPlayerType(FreeAgent)}
                  >
                    Free Agents
                  </Button>
                  <Button
                    type="button"
                    variant={playerType === Waivers ? "success" : "secondary"}
                    onClick={() => setPlayerType(Waivers)}
                  >
                    Waivers
                  </Button>
                  <Button
                    type="button"
                    variant={playerType === GLeague ? "success" : "secondary"}
                    onClick={() => setPlayerType(GLeague)}
                  >
                    {GLeague}
                  </Button>
                </ButtonGroup>
              )}
            </Border>
          </div>
          {freeAgencyCategory !== Contracts && (
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
                <CategoryDropdown
                  label="Country"
                  options={CountryOptions}
                  change={SelectCountryOption}
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
              </div>
            </Border>
          )}
          {freeAgencyCategory === Overview && (
            <Border
              direction="col"
              classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 max-h-[50vh] overflow-y-auto"
              styles={{
                borderColor: teamColors.One,
                backgroundColor: backgroundColor,
              }}
            >
              <FreeAgentTable
                players={filteredFA}
                currentPage={currentPage}
                offersByPlayer={offerMapByPlayerType}
                teamOfferMap={teamOfferMap}
                colorOne={teamColors.One}
                colorTwo={teamColors.Two}
                colorThree={teamColors.Three}
                category={tableViewType}
                team={nbaTeam!!}
                league={SimNBA}
                teamMap={proTeamMap}
                openModal={handleFAModal}
                handleOfferModal={handleOfferModal}
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
          )}
          {freeAgencyCategory === Contracts && (
            <>
              <Border
                direction="col"
                classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 max-h-[50vh] overflow-y-auto"
                styles={{
                  borderColor: teamColors.One,
                  backgroundColor: backgroundColor,
                }}
              >
                <OfferTable
                  offers={teamFreeAgentOffers}
                  playerMap={freeAgentMap}
                  offersByPlayer={offerMapByPlayerType}
                  colorOne={teamColors.One}
                  colorTwo={teamColors.Two}
                  colorThree={teamColors.Three}
                  team={nbaTeam!!}
                  league={SimNBA}
                  teamMap={proTeamMap}
                  openModal={handleFAModal}
                  handleOfferModal={handleOfferModal}
                  isMobile={isMobile}
                  ts={cbb_Timestamp!!}
                />
              </Border>
            </>
          )}
        </div>
      </div>
    </>
  );
};
