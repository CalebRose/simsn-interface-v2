import { FC, useEffect, useMemo, useState } from "react";
import {
  Cut,
  League,
  ModalAction,
  SimCHL,
  SimPHL,
  SimCFB,
  SimNFL,
  Attributes,
  Potentials,
  Contracts,
  Overview,
  SimCBB,
  SimNBA,
  TradeBlock,
} from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { PageContainer } from "../../_design/Container";
import { useAuthStore } from "../../context/AuthContext";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { TeamInfo } from "./TeamPageComponents";
import {
  CHLRosterTable,
  CFBRosterTable,
  NFLRosterTable,
  PHLRosterTable,
  CBBRosterTable,
  NBARosterTable,
  PHLTradeBlockTable,
} from "./TeamPageTables";
import { SelectDropdown } from "../../_design/Select";
import { SingleValue } from "react-select";
import { SelectOption } from "../../_hooks/useSelectStyles";
import { Button } from "../../_design/Buttons";
import { Text } from "../../_design/Typography";
import { useModal } from "../../_hooks/useModal";
import {
  CollegePlayer as CHLPlayer,
  DraftPick,
  ProfessionalPlayer as PHLPlayer,
  TradeProposal,
} from "../../models/hockeyModels";
import {
  CollegePlayer as CFBPlayer,
  NFLPlayer,
} from "../../models/footballModels";
import { useTeamColors } from "../../_hooks/useTeamColors";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { isBrightColor } from "../../_utility/isBrightColor";
import { ActionModal } from "../Common/ActionModal";
import { useResponsive } from "../../_hooks/useMobile";
import { getPHLShortenedValue } from "../../_utility/getPHLShortenedValue";
import { darkenColor } from "../../_utility/getDarkerColor";
import { useParams } from "react-router-dom";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { CollegePlayer, NBAPlayer } from "../../models/basketballModels";
import { TradeBlockRow } from "./TeamPageTypes";
import {
  ManageTradeModal,
  ProposeTradeModal,
} from "./Common/ManageTradesModal";

interface TeamPageProps {
  league: League;
  ts?: any;
}

export const TeamPage: FC<TeamPageProps> = ({ league }) => {
  const { currentUser } = useAuthStore();
  const leagueStore = useLeagueStore();
  const { selectedLeague, setSelectedLeague, ts } = leagueStore;
  const { chlTeam, phlTeam } = useSimHCKStore();
  const { cfbTeam, nflTeam } = useSimFBAStore();
  const { cbbTeam, nbaTeam } = useSimBBAStore();

  useEffect(() => {
    if (selectedLeague !== league) {
      setSelectedLeague(league);
    }
  }, [selectedLeague]);

  const isLoading = useMemo(() => {
    if (selectedLeague === SimCHL && chlTeam) {
      return false;
    }
    if (selectedLeague === SimPHL && phlTeam) {
      return false;
    }
    if (selectedLeague === SimCFB && cfbTeam) {
      return false;
    }
    if (selectedLeague === SimNFL && nflTeam) {
      return false;
    }
    if (selectedLeague === SimCBB && cbbTeam) {
      return false;
    }
    if (selectedLeague === SimNBA && nbaTeam) {
      return false;
    }
    return true;
  }, [chlTeam, phlTeam, cfbTeam, nflTeam, cbbTeam, nbaTeam, selectedLeague]);
  return (
    <>
      <PageContainer direction="col" isLoading={isLoading} title="Team">
        {selectedLeague === SimCHL && chlTeam && (
          <CHLTeamPage league={league} ts={ts} />
        )}
        {selectedLeague === SimPHL && phlTeam && (
          <PHLTeamPage league={league} ts={ts} />
        )}
        {selectedLeague === SimCFB && cfbTeam && (
          <CFBTeamPage league={league} ts={ts} />
        )}
        {selectedLeague === SimNFL && nflTeam && (
          <NFLTeamPage league={league} ts={ts} />
        )}
        {selectedLeague === SimCBB && cbbTeam && (
          <CBBTeamPage league={league} ts={ts} />
        )}
        {selectedLeague === SimNBA && nbaTeam && (
          <NBATeamPage league={league} ts={ts} />
        )}
      </PageContainer>
    </>
  );
};

const CHLTeamPage = ({ league, ts }: TeamPageProps) => {
  const { teamId } = useParams<{ teamId?: string }>();
  const { currentUser } = useAuthStore();
  const hkStore = useSimHCKStore();
  const {
    chlTeam,
    chlTeamMap,
    chlRosterMap,
    chlTeamOptions,
    chlStandingsMap,
    teamProfileMap,
    cutCHLPlayer,
    redshirtPlayer,
    promisePlayer,
  } = hkStore;
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalAction, setModalAction] = useState<ModalAction>(Cut);
  const [modalPlayer, setModalPlayer] = useState<CHLPlayer | null>(null);
  const [selectedTeam, setSelectedTeam] = useState(() => {
    if (teamId) {
      const id = Number(teamId);
      return chlTeamMap[id];
    }
    return chlTeam;
  });
  const [category, setCategory] = useState(Overview);
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree
  );
  let backgroundColor = "#1f2937";
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }
  const { isMobile } = useResponsive();

  const secondaryBorderColor = teamColors.Three;
  const selectedRoster = useMemo(() => {
    if (selectedTeam) {
      return chlRosterMap[selectedTeam.ID];
    }
  }, [chlRosterMap, selectedTeam]);

  const selectedTeamProfile = useMemo(() => {
    if (selectedTeam && teamProfileMap) {
      return teamProfileMap[selectedTeam.ID];
    }
    return null;
  }, [teamProfileMap, selectedTeam]);

  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = chlTeamMap[value];
    setSelectedTeam(nextTeam);
    setCategory(Overview);
  };

  const openModal = (action: ModalAction, player: CHLPlayer) => {
    handleOpenModal();
    setModalAction(action);
    setModalPlayer(player);
  };

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
          cutPlayer={cutCHLPlayer}
          redshirtPlayer={redshirtPlayer}
          promisePlayer={promisePlayer}
        />
      )}
      <div className="flex flex-row lg:flex-col w-full max-[450px]:max-w-full">
        <TeamInfo
          id={selectedTeam?.ID}
          isRetro={currentUser?.isRetro}
          League={league}
          Team={selectedTeam}
          ts={ts}
          isPro={false}
          Roster={selectedRoster}
          TeamProfile={selectedTeamProfile}
          TeamName={`${selectedTeam?.TeamName} ${selectedTeam?.Mascot}`}
          Coach={selectedTeam?.Coach}
          Conference={selectedTeam?.Conference}
          Arena={selectedTeam?.Arena}
          Capacity={selectedTeam?.ArenaCapacity}
          backgroundColor={backgroundColor}
          headerColor={headerColor}
          borderColor={borderColor}
        />
      </div>
      <div className="flex flex-row md:flex-col w-full">
        <Border
          direction="row"
          classes="w-full p-2 gap-x-2"
          styles={{
            backgroundColor: backgroundColor,
            borderColor: headerColor,
          }}
        >
          <div className="flex w-full">
            <SelectDropdown
              options={chlTeamOptions}
              onChange={selectTeamOption}
            />
          </div>
          <div className="flex flex-row gap-x-1 sm:gap-x-4">
            {!isMobile && (
              <Button
                size="sm"
                isSelected={category === Overview}
                onClick={() => setCategory(Overview)}
              >
                <Text variant="small">Overview</Text>
              </Button>
            )}
            {!isMobile && (
              <Button
                size="sm"
                isSelected={category === Attributes}
                onClick={() => setCategory(Attributes)}
              >
                <Text variant="small">Attributes</Text>
              </Button>
            )}
            {!isMobile && (
              <Button
                size="sm"
                disabled={selectedTeam?.ID !== chlTeam?.ID}
                isSelected={category === Potentials}
                onClick={() => setCategory(Potentials)}
              >
                <Text variant="small">Potentials</Text>
              </Button>
            )}
            <Button variant="primary" size="sm">
              <Text variant="small">Export</Text>
            </Button>
          </div>
        </Border>
      </div>
      {selectedRoster && (
        <Border
          classes="px-2 min-[320px]:w-[95vw] min-[700px]:min-w-full overflow-x-auto max-[400px]:h-[60vh] max-[500px]:h-[55vh] h-[50vh]"
          styles={{
            backgroundColor: backgroundColor,
            borderColor: headerColor,
          }}
        >
          <CHLRosterTable
            team={selectedTeam}
            roster={selectedRoster}
            category={category}
            backgroundColor={backgroundColor}
            headerColor={headerColor}
            borderColor={borderColor}
            openModal={openModal}
            disable={selectedTeam!.ID !== chlTeam!.ID}
          />
        </Border>
      )}
    </>
  );
};

const PHLTeamPage = ({ league, ts }: TeamPageProps) => {
  const { teamId } = useParams<{ teamId?: string }>();
  const { currentUser } = useAuthStore();
  const hkStore = useSimHCKStore();
  const {
    phlTeam,
    phlTeams,
    phlTeamMap,
    phlTeamOptions,
    proRosterMap: phlRosterMap,
    capsheetMap: phlCapsheetMap,
    proStandingsMap: phlStandingsMap,
    proContractMap: phlContractMap,
    proExtensionMap: phlExtensionMap,
    tradeProposalsMap,
    tradePreferencesMap,
    phlDraftPickMap,
    cutPHLPlayer,
    affiliatePlayer,
    PlacePHLPlayerOnTradeBlock,
  } = hkStore;
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalAction, setModalAction] = useState<ModalAction>(Cut);
  const [modalPlayer, setModalPlayer] = useState<PHLPlayer | null>(null);
  const [selectedTeam, setSelectedTeam] = useState(() => {
    if (teamId) {
      const id = Number(teamId);
      return phlTeamMap[id];
    }
    return phlTeam;
  });
  const [category, setCategory] = useState(Overview);
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree
  );
  let backgroundColor = "#1f2937";
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }
  const secondaryBorderColor = teamColors.Three;
  const textColorClass = teamColors.TextColorOne;
  const { isMobile, isTablet } = useResponsive();

  const selectedRoster = useMemo(() => {
    if (selectedTeam) {
      return phlRosterMap[selectedTeam.ID];
    }
  }, [phlRosterMap, selectedTeam]);

  const draftPicks = useMemo(() => {
    if (!selectedTeam || !phlDraftPickMap) return [];
    return phlDraftPickMap[selectedTeam.ID];
  }, [selectedTeam, phlDraftPickMap]);

  const teamTradeBlock = useMemo(() => {
    const roster = phlRosterMap[phlTeam!.ID];
    const tradeBlockSet: TradeBlockRow[] = [];
    const tradeBlockPlayers = roster?.filter((player) => player.IsOnTradeBlock);
    if (tradeBlockPlayers) {
      for (let i = 0; i < tradeBlockPlayers!.length; i++) {
        const player = tradeBlockPlayers![i];
        const contract = phlContractMap![player.ID];
        const block: TradeBlockRow = {
          id: player.ID,
          player: player,
          name: `${player.FirstName} ${player.LastName}`,
          position: player.Position,
          arch: player.Archetype,
          year: player.Year.toString(),
          overall: player.Overall.toString(),
          draftRound: "N/A",
          draftPick: "N/A",
          value: contract.ContractValue.toString(),
          isPlayer: true,
        };
        tradeBlockSet.push(block);
      }
    }
    const userTeamPicks = phlDraftPickMap[phlTeam!.ID];
    if (userTeamPicks) {
      for (let i = 0; i < userTeamPicks.length; i++) {
        const pick = userTeamPicks[i];
        const block: TradeBlockRow = {
          id: pick.ID,
          pick: pick,
          name: `N/A`,
          position: "N/A",
          arch: "N/A",
          year: pick.Season.toString(),
          overall: "N/A",
          draftRound: pick.DraftRound.toString(),
          draftPick: pick.DraftNumber.toString(),
          value: pick.DraftValue.toString(),
          isPlayer: false,
          season: pick.Season,
        };
        tradeBlockSet.push(block);
      }
    }
    return tradeBlockSet;
  }, [phlRosterMap, phlTeam, phlDraftPickMap, phlContractMap]);

  const selectedTeamTradeBlock = useMemo(() => {
    const tradeBlockSet: TradeBlockRow[] = [];
    const tradeBlockPlayers = selectedRoster?.filter(
      (player) => player.IsOnTradeBlock
    );
    if (tradeBlockPlayers) {
      for (let i = 0; i < tradeBlockPlayers!.length; i++) {
        const player = tradeBlockPlayers![i];
        const contract = phlContractMap![player.ID];
        const block: TradeBlockRow = {
          id: player.ID,
          player: player,
          name: `${player.FirstName} ${player.LastName}`,
          position: player.Position,
          arch: player.Archetype,
          year: player.Year.toString(),
          overall: player.Overall.toString(),
          draftRound: "N/A",
          draftPick: "N/A",
          value: contract.ContractValue.toString(),
          isPlayer: true,
        };
        tradeBlockSet.push(block);
      }
    }
    if (draftPicks) {
      for (let i = 0; i < draftPicks.length; i++) {
        const pick = draftPicks[i];
        const block: TradeBlockRow = {
          id: pick.ID,
          pick: pick,
          name: `N/A`,
          position: "N/A",
          arch: "N/A",
          year: pick.Season.toString(),
          overall: "N/A",
          draftRound: pick.DraftRound.toString(),
          draftPick: pick.DraftNumber.toString(),
          value: pick.DraftValue.toString(),
          isPlayer: false,
          season: pick.Season,
        };
        tradeBlockSet.push(block);
      }
    }
    return tradeBlockSet;
  }, [selectedRoster, draftPicks, phlContractMap]);

  const receivedProposals = useMemo(() => {
    const proposals: TradeProposal[] = [];
    for (let i = 0; i < phlTeams.length; i++) {
      const team = phlTeams[i];
      const proposalsList = tradeProposalsMap[team.ID];
      if (proposalsList) {
        for (let j = 0; j < proposalsList.length; j++) {
          const proposal = proposalsList[j];
          if (proposal.RecepientTeamID === phlTeam!.ID) {
            proposals.push(proposal);
          }
        }
      }
    }
    return proposals;
  }, [phlTeam, phlTeams, tradeProposalsMap]);

  const rosterContracts = useMemo(() => {
    if (!selectedRoster || !phlContractMap) return null;

    return selectedRoster
      .map((player) => {
        const contract = phlContractMap[player.ID];
        if (!contract) return null;

        return {
          ...contract,
          Y1BaseSalary: getPHLShortenedValue(contract.Y1BaseSalary),
          Y2BaseSalary: getPHLShortenedValue(contract.Y2BaseSalary),
          Y3BaseSalary: getPHLShortenedValue(contract.Y3BaseSalary),
          Y4BaseSalary: getPHLShortenedValue(contract.Y4BaseSalary),
          Y5BaseSalary: getPHLShortenedValue(contract.Y5BaseSalary),
          convertValues: contract.convertValues,
        };
      })
      .filter((contract) => contract !== null);
  }, [selectedRoster, phlContractMap]);

  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = phlTeamMap[value];
    setSelectedTeam(nextTeam);
    setCategory(Overview);
  };

  const openModal = (action: ModalAction, player: PHLPlayer) => {
    handleOpenModal();
    setModalAction(action);
    setModalPlayer(player);
  };

  const capsheetMap = useMemo(() => {
    if (selectedTeam && phlCapsheetMap) {
      return phlCapsheetMap[selectedTeam.ID];
    }
    return null;
  }, [phlCapsheetMap, selectedTeam]);

  const playerContract = useMemo(() => {
    if (modalPlayer && phlContractMap) {
      return phlContractMap[modalPlayer.ID];
    }
  }, [phlContractMap, modalPlayer]);

  const manageTradesModal = useModal();
  const proposeTradeModal = useModal();

  return (
    <>
      <ManageTradeModal
        isOpen={manageTradesModal.isModalOpen}
        onClose={manageTradesModal.handleCloseModal}
        team={phlTeam!!}
        league={SimPHL}
        sentTradeProposals={tradeProposalsMap[phlTeam!.ID]}
        receivedTradeProposals={receivedProposals}
      />
      <ProposeTradeModal
        isOpen={proposeTradeModal.isModalOpen}
        onClose={proposeTradeModal.handleCloseModal}
        userTeam={phlTeam!!}
        recipientTeam={selectedTeam!!}
        league={SimPHL}
        userTradeBlock={teamTradeBlock}
        otherTeamTradeBlock={selectedTeamTradeBlock}
        userCapSheet={phlCapsheetMap[phlTeam!.ID]}
        recipientCapSheet={phlCapsheetMap[selectedTeam!.ID]}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        ts={ts}
      />
      {modalPlayer && (
        <ActionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          contract={playerContract}
          playerID={modalPlayer.ID}
          playerLabel={`${modalPlayer.Position} ${modalPlayer.Archetype} ${modalPlayer.FirstName} ${modalPlayer.LastName}`}
          teamID={modalPlayer.TeamID}
          league={SimPHL}
          modalAction={modalAction}
          player={modalPlayer}
          cutPlayer={cutPHLPlayer}
          affiliatePlayer={affiliatePlayer}
          tradeBlockPlayer={PlacePHLPlayerOnTradeBlock}
        />
      )}
      <div className="flex flex-row lg:flex-col w-full max-[450px]:max-w-full">
        <TeamInfo
          id={selectedTeam?.ID}
          isRetro={currentUser?.isRetro}
          Roster={selectedRoster}
          Team={selectedTeam}
          isUserTeam={selectedTeam!.ID === phlTeam!.ID}
          League={league}
          ts={ts}
          isPro={true}
          TeamName={`${selectedTeam?.TeamName} ${selectedTeam?.Mascot}`}
          Coach={selectedTeam?.Coach}
          Owner={selectedTeam?.Owner}
          GM={selectedTeam?.GM}
          Scout={selectedTeam?.Scout}
          Capsheet={capsheetMap}
          Conference={selectedTeam?.Conference}
          Arena={selectedTeam?.Arena}
          Capacity={selectedTeam?.ArenaCapacity}
          backgroundColor={backgroundColor}
          headerColor={headerColor}
          borderColor={borderColor}
          openTradeModal={manageTradesModal.handleOpenModal}
          openProposeTradeModal={proposeTradeModal.handleOpenModal}
        />
      </div>
      <div className="flex flex-row md:flex-col w-full">
        <Border
          direction="row"
          classes="w-full p-2 gap-x-2"
          styles={{
            backgroundColor: backgroundColor,
            borderColor: headerColor,
          }}
        >
          <div className="flex w-full">
            <SelectDropdown
              options={phlTeamOptions}
              onChange={selectTeamOption}
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                  borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
                  color: "#ffffff",
                  width: "15rem",
                  maxWidth: "300px",
                  padding: "0.3rem",
                  boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: "#1a202c",
                  borderRadius: "8px",
                }),
                menuList: (provided) => ({
                  ...provided,
                  backgroundColor: "#1a202c",
                  padding: "0",
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                  color: "#ffffff",
                  padding: "10px",
                  cursor: "pointer",
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "#ffffff",
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: "#ffffff",
                }),
              }}
            />
          </div>
          <div className="flex flex-row gap-x-1 sm:gap-x-4">
            {!isMobile && (
              <Button
                size="sm"
                isSelected={category === Overview}
                onClick={() => setCategory(Overview)}
              >
                <Text variant="small">Overview</Text>
              </Button>
            )}
            {!isMobile && (
              <Button
                size="sm"
                isSelected={category === Contracts}
                onClick={() => setCategory(Contracts)}
              >
                <Text variant="small">Contracts</Text>
              </Button>
            )}
            {!isMobile && (
              <Button
                size="sm"
                isSelected={category === Attributes}
                onClick={() => setCategory(Attributes)}
              >
                <Text variant="small">Attributes</Text>
              </Button>
            )}
            {!isMobile && (
              <Button
                size="sm"
                disabled={selectedTeam?.ID !== phlTeam?.ID}
                isSelected={category === Potentials}
                onClick={() => setCategory(Potentials)}
              >
                <Text variant="small">Potentials</Text>
              </Button>
            )}
            {!isMobile && !isTablet && (
              <Button
                size="sm"
                disabled={selectedTeam?.ID !== phlTeam?.ID}
                isSelected={category === TradeBlock}
                onClick={() => setCategory(TradeBlock)}
                classes="w-[8rem]"
              >
                <Text variant="small">Trade Block</Text>
              </Button>
            )}
            <Button variant="primary" size="sm">
              <Text variant="small">Export</Text>
            </Button>
          </div>
        </Border>
      </div>
      <Border
        classes="px-2 min-[320px]:w-[95vw] min-[700px]:min-w-full overflow-x-auto max-[400px]:h-[60vh] max-[500px]:h-[55vh] h-[50vh]"
        styles={{
          backgroundColor: backgroundColor,
          borderColor: headerColor,
        }}
      >
        {category !== TradeBlock && (
          <PHLRosterTable
            roster={selectedRoster}
            contracts={rosterContracts}
            ts={ts}
            team={selectedTeam}
            category={category}
            backgroundColor={backgroundColor}
            headerColor={headerColor}
            borderColor={borderColor}
            openModal={openModal}
            disable={selectedTeam!.ID !== phlTeam!.ID}
          />
        )}
        {category === TradeBlock && (
          <PHLTradeBlockTable
            roster={selectedTeamTradeBlock}
            ts={ts}
            team={selectedTeam}
            category={category}
            backgroundColor={backgroundColor}
            headerColor={headerColor}
            borderColor={borderColor}
            openModal={openModal}
            disable={selectedTeam!.ID !== phlTeam!.ID}
          />
        )}
      </Border>
    </>
  );
};

const CFBTeamPage = ({ league, ts }: TeamPageProps) => {
  const { teamId } = useParams<{ teamId?: string }>();

  const { currentUser } = useAuthStore();
  const fbStore = useSimFBAStore();
  const {
    cfbTeam,
    cfbTeamMap,
    cfbRosterMap,
    cfbTeamOptions,
    teamProfileMap,
    cutCFBPlayer,
    redshirtPlayer,
    promisePlayer,
  } = fbStore;
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalAction, setModalAction] = useState<ModalAction>(Cut);
  const [modalPlayer, setModalPlayer] = useState<CFBPlayer | null>(null);
  const [selectedTeam, setSelectedTeam] = useState(() => {
    if (teamId && cfbTeamMap) {
      const id = Number(teamId);
      return cfbTeamMap[id];
    }
    return cfbTeam;
  });
  const [category, setCategory] = useState(Overview);
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree
  );
  let backgroundColor = "#1f2937";
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }
  const { isDesktop } = useResponsive();

  const selectedRoster = useMemo(() => {
    if (selectedTeam && cfbRosterMap) {
      return cfbRosterMap[selectedTeam.ID];
    }
    return null;
  }, [cfbRosterMap, selectedTeam]);

  const selectedTeamProfile = useMemo(() => {
    if (selectedTeam && teamProfileMap) {
      return teamProfileMap[selectedTeam.ID];
    }
    return null;
  }, [teamProfileMap, selectedTeam]);

  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = cfbTeamMap ? cfbTeamMap[value] : null;
    setSelectedTeam(nextTeam);
    setCategory(Overview);
  };

  const openModal = (action: ModalAction, player: CFBPlayer) => {
    handleOpenModal();
    setModalAction(action);
    setModalPlayer(player);
  };

  return (
    <>
      {modalPlayer && (
        <ActionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          playerID={modalPlayer.ID}
          playerLabel={`${modalPlayer.Position} ${modalPlayer.Archetype} ${modalPlayer.FirstName} ${modalPlayer.LastName}`}
          teamID={modalPlayer.TeamID}
          league={SimCFB}
          modalAction={modalAction}
          player={modalPlayer}
          cutPlayer={cutCFBPlayer}
          redshirtPlayer={redshirtPlayer}
          promisePlayer={promisePlayer}
        />
      )}
      <div className="flex flex-row lg:flex-col w-full max-[450px]:max-w-full">
        <TeamInfo
          id={selectedTeam?.ID}
          isRetro={currentUser?.isRetro}
          League={league}
          ts={ts}
          Roster={selectedRoster}
          Team={selectedTeam}
          TeamProfile={selectedTeamProfile}
          isPro={false}
          TeamName={`${selectedTeam?.TeamName} ${selectedTeam?.Mascot}`}
          Coach={selectedTeam?.Coach}
          Conference={selectedTeam?.Conference}
          Arena={selectedTeam?.Stadium}
          Capacity={selectedTeam?.StadiumCapacity}
          backgroundColor={backgroundColor}
          headerColor={headerColor}
          borderColor={borderColor}
        />
      </div>
      <div className="flex flex-row md:flex-col w-full">
        <Border
          direction="row"
          classes="w-full p-2 gap-x-2"
          styles={{
            backgroundColor: backgroundColor,
            borderColor: headerColor,
          }}
        >
          <div className="flex w-full">
            <SelectDropdown
              options={cfbTeamOptions}
              onChange={selectTeamOption}
            />
          </div>
          <div className="flex flex-row gap-x-1 sm:gap-x-4">
            {isDesktop && (
              <Button
                size="sm"
                isSelected={category === Overview}
                onClick={() => setCategory(Overview)}
              >
                <Text variant="small">Overview</Text>
              </Button>
            )}
            {isDesktop && (
              <Button
                size="sm"
                isSelected={category === Attributes}
                onClick={() => setCategory(Attributes)}
              >
                <Text variant="small">Attributes</Text>
              </Button>
            )}
            <Button variant="primary" size="sm">
              <Text variant="small">Export</Text>
            </Button>
          </div>
        </Border>
      </div>
      {selectedRoster && (
        <Border
          classes="px-2 min-[320px]:w-[95vw] min-[700px]:min-w-full overflow-x-auto max-[400px]:h-[60vh] max-[500px]:h-[55vh] max-[769px]:h-[70vh] h-[50vh]"
          styles={{
            backgroundColor: backgroundColor,
            borderColor: headerColor,
          }}
        >
          <CFBRosterTable
            roster={selectedRoster}
            team={selectedTeam}
            category={category}
            backgroundColor={backgroundColor}
            headerColor={headerColor}
            borderColor={borderColor}
            openModal={openModal}
            disable={selectedTeam!.ID !== cfbTeam!.ID}
          />
        </Border>
      )}
    </>
  );
};

const NFLTeamPage = ({ league, ts }: TeamPageProps) => {
  const { teamId } = useParams<{ teamId?: string }>();

  const { currentUser } = useAuthStore();
  const fbStore = useSimFBAStore();
  const {
    nflTeam,
    proTeamMap: nflTeamMap,
    proRosterMap: nflRosterMap,
    nflTeamOptions,
    proStandingsMap: nflStandingsMap,
    cutNFLPlayer,
    capsheetMap: nflCapsheetMap,
    proContractMap: nflContractMap,
  } = fbStore;
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalAction, setModalAction] = useState<ModalAction>(Cut);
  const [modalPlayer, setModalPlayer] = useState<NFLPlayer | null>(null);
  const [selectedTeam, setSelectedTeam] = useState(() => {
    if (teamId && nflTeamMap) {
      const id = Number(teamId);
      return nflTeamMap[id];
    }
    return nflTeam;
  });
  const [category, setCategory] = useState(Overview);
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree
  );
  let backgroundColor = "#1f2937";
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }
  const { isDesktop } = useResponsive();
  let darkerBackgroundColor = darkenColor(backgroundColor, -5);

  const selectedRoster = useMemo(() => {
    if (selectedTeam && nflRosterMap) {
      return nflRosterMap[selectedTeam.ID];
    }
    return null;
  }, [nflRosterMap, selectedTeam]);

  const rosterContracts = useMemo(() => {
    if (!selectedRoster || !nflContractMap) return null;

    return selectedRoster
      .map((player) => {
        const contract = nflContractMap[player.ID];
        if (!contract) return null;

        return {
          ...contract,
          Y1Bonus: parseFloat(contract.Y1Bonus.toFixed(2)),
          Y1BaseSalary: parseFloat(contract.Y1BaseSalary.toFixed(2)),
          Y2Bonus: parseFloat(contract.Y2Bonus.toFixed(2)),
          Y2BaseSalary: parseFloat(contract.Y2BaseSalary.toFixed(2)),
          Y3Bonus: parseFloat(contract.Y3Bonus.toFixed(2)),
          Y3BaseSalary: parseFloat(contract.Y3BaseSalary.toFixed(2)),
          Y4Bonus: parseFloat(contract.Y4Bonus.toFixed(2)),
          Y4BaseSalary: parseFloat(contract.Y4BaseSalary.toFixed(2)),
          Y5Bonus: parseFloat(contract.Y5Bonus.toFixed(2)),
          Y5BaseSalary: parseFloat(contract.Y5BaseSalary.toFixed(2)),
          convertValues: contract.convertValues,
        };
      })
      .filter((contract) => contract !== null);
  }, [selectedRoster, nflContractMap]);

  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = nflTeamMap ? nflTeamMap[value] : null;
    setSelectedTeam(nextTeam);
    setCategory(Overview);
  };
  const openModal = (action: ModalAction, player: NFLPlayer) => {
    handleOpenModal();
    setModalAction(action);
    setModalPlayer(player);
  };
  const capsheetMap = useMemo(() => {
    if (selectedTeam && nflCapsheetMap) {
      return nflCapsheetMap[selectedTeam.ID];
    }
    return null;
  }, [nflCapsheetMap, selectedTeam]);

  const playerContract = useMemo(() => {
    if (modalPlayer && nflContractMap) {
      return nflContractMap[modalPlayer.ID];
    }
  }, [nflContractMap, modalPlayer]);

  return (
    <>
      {modalPlayer && (
        <ActionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          playerID={modalPlayer.ID}
          playerLabel={`${modalPlayer.Position} ${modalPlayer.Archetype} ${modalPlayer.FirstName} ${modalPlayer.LastName}`}
          teamID={modalPlayer.TeamID}
          league={SimNFL}
          contract={playerContract}
          modalAction={modalAction}
          player={modalPlayer}
          cutPlayer={cutNFLPlayer}
        />
      )}
      <div className="flex flex-row">
        <TeamInfo
          id={selectedTeam?.ID}
          isRetro={currentUser?.isRetro}
          Roster={selectedRoster}
          Team={selectedTeam}
          League={league}
          ts={ts}
          isPro={true}
          TeamName={`${selectedTeam?.TeamName} ${selectedTeam?.Mascot}`}
          Coach={selectedTeam?.NFLCoachName}
          Owner={selectedTeam?.NFLOwnerName}
          GM={selectedTeam?.NFLGMName}
          Scout={selectedTeam?.NFLAssistantName}
          Capsheet={capsheetMap}
          Conference={selectedTeam?.Conference}
          Arena={selectedTeam?.Stadium}
          Capacity={selectedTeam?.StadiumCapacity}
          backgroundColor={backgroundColor}
          headerColor={headerColor}
          borderColor={borderColor}
        />
      </div>
      <div className="flex flex-row md:flex-col w-full">
        <Border
          direction="row"
          classes="w-full p-2 gap-x-2"
          styles={{
            backgroundColor: backgroundColor,
            borderColor: headerColor,
          }}
        >
          <div className="flex w-full">
            <SelectDropdown
              options={nflTeamOptions}
              onChange={selectTeamOption}
            />
          </div>
          <div className="flex flex-row gap-x-1 sm:gap-x-4 md:gap-x-2">
            {isDesktop && (
              <Button
                size="sm"
                isSelected={category === Overview}
                onClick={() => setCategory(Overview)}
              >
                <Text variant="small">Overview</Text>
              </Button>
            )}
            {isDesktop && (
              <Button
                size="sm"
                isSelected={category === Contracts}
                onClick={() => setCategory(Contracts)}
              >
                <Text variant="small">Contracts</Text>
              </Button>
            )}
            {isDesktop && (
              <Button
                size="sm"
                isSelected={category === Attributes}
                onClick={() => setCategory(Attributes)}
              >
                <Text variant="small">Attributes</Text>
              </Button>
            )}
            <Button variant="primary" size="sm">
              <Text variant="small">Export</Text>
            </Button>
          </div>
        </Border>
      </div>
      {selectedRoster && (
        <Border
          classes="px-2 min-[320px]:min-w-full min-[700px]:min-w-full overflow-x-auto max-[400px]:h-[60vh] max-[500px]:h-[55vh] h-[50vh]"
          styles={{
            backgroundColor: backgroundColor,
            borderColor: headerColor,
          }}
        >
          <NFLRosterTable
            roster={selectedRoster}
            contracts={rosterContracts}
            ts={ts}
            team={selectedTeam}
            category={category}
            backgroundColor={backgroundColor}
            headerColor={headerColor}
            borderColor={borderColor}
            openModal={openModal}
            disable={selectedTeam!.ID !== nflTeam!.ID}
          />
        </Border>
      )}
    </>
  );
};

const CBBTeamPage = ({ league, ts }: TeamPageProps) => {
  const { teamId } = useParams<{ teamId?: string }>();

  const { currentUser } = useAuthStore();
  const bbStore = useSimBBAStore();
  const {
    cbbTeam,
    cbbTeamMap,
    cbbRosterMap,
    cbbTeamOptions,
    teamProfileMap,
    cutCBBPlayer,
    redshirtPlayer,
    promisePlayer,
  } = bbStore;
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalAction, setModalAction] = useState<ModalAction>(Cut);
  const [modalPlayer, setModalPlayer] = useState<CollegePlayer | null>(null);
  const [selectedTeam, setSelectedTeam] = useState(() => {
    if (teamId && cbbTeamMap) {
      const id = Number(teamId);
      return cbbTeamMap[id];
    }
    return cbbTeam;
  });
  const [category, setCategory] = useState(Overview);
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree
  );
  let backgroundColor = "#1f2937";
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }
  const { isDesktop } = useResponsive();

  const selectedRoster = useMemo(() => {
    if (selectedTeam && cbbRosterMap) {
      return cbbRosterMap[selectedTeam.ID];
    }
    return null;
  }, [cbbRosterMap, selectedTeam]);

  const selectedTeamProfile = useMemo(() => {
    if (selectedTeam && teamProfileMap) {
      return teamProfileMap[selectedTeam.ID];
    }
    return null;
  }, [teamProfileMap, selectedTeam]);

  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = cbbTeamMap ? cbbTeamMap[value] : null;
    setSelectedTeam(nextTeam);
    setCategory(Overview);
  };

  const openModal = (action: ModalAction, player: CollegePlayer) => {
    handleOpenModal();
    setModalAction(action);
    setModalPlayer(player);
  };

  return (
    <>
      {modalPlayer && (
        <ActionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          playerID={modalPlayer.ID}
          playerLabel={`${modalPlayer.Position} ${modalPlayer.Archetype} ${modalPlayer.FirstName} ${modalPlayer.LastName}`}
          teamID={modalPlayer.TeamID}
          league={SimCBB}
          modalAction={modalAction}
          player={modalPlayer}
          cutPlayer={cutCBBPlayer}
          redshirtPlayer={redshirtPlayer}
          promisePlayer={promisePlayer}
        />
      )}
      <div className="flex flex-row lg:flex-col w-full max-[450px]:max-w-full">
        <TeamInfo
          id={selectedTeam?.ID}
          isRetro={currentUser?.isRetro}
          League={league}
          ts={ts}
          Roster={selectedRoster}
          Team={selectedTeam}
          TeamProfile={selectedTeamProfile}
          isPro={false}
          TeamName={`${selectedTeam?.Team} ${selectedTeam?.Nickname}`}
          Coach={selectedTeam?.Coach}
          Conference={selectedTeam?.Conference}
          Arena={selectedTeam?.Arena}
          backgroundColor={backgroundColor}
          headerColor={headerColor}
          borderColor={borderColor}
        />
      </div>
      <div className="flex flex-row md:flex-col w-full">
        <Border
          direction="row"
          classes="w-full p-2 gap-x-2"
          styles={{
            backgroundColor: backgroundColor,
            borderColor: headerColor,
          }}
        >
          <div className="flex w-full">
            <SelectDropdown
              options={cbbTeamOptions}
              onChange={selectTeamOption}
            />
          </div>
          <div className="flex flex-row gap-x-1 sm:gap-x-4">
            {isDesktop && (
              <Button
                size="sm"
                isSelected={category === Overview}
                onClick={() => setCategory(Overview)}
              >
                <Text variant="small">Overview</Text>
              </Button>
            )}
            {isDesktop && (
              <Button
                size="sm"
                isSelected={category === Attributes}
                onClick={() => setCategory(Attributes)}
              >
                <Text variant="small">Attributes</Text>
              </Button>
            )}
            <Button variant="primary" size="sm">
              <Text variant="small">Export</Text>
            </Button>
          </div>
        </Border>
      </div>
      {selectedRoster && (
        <Border
          classes="px-2 min-[320px]:w-[95vw] min-[700px]:min-w-full overflow-x-auto max-[400px]:h-[60vh] max-[500px]:h-[55vh] max-[769px]:h-[70vh] h-[50vh]"
          styles={{
            backgroundColor: backgroundColor,
            borderColor: headerColor,
          }}
        >
          <CBBRosterTable
            roster={selectedRoster}
            team={selectedTeam}
            category={category}
            backgroundColor={backgroundColor}
            headerColor={headerColor}
            borderColor={borderColor}
            openModal={openModal}
            disable={cbbTeam!.ID !== selectedTeam!.ID}
          />
        </Border>
      )}
    </>
  );
};

const NBATeamPage = ({ league, ts }: TeamPageProps) => {
  const { teamId } = useParams<{ teamId?: string }>();

  const { currentUser } = useAuthStore();
  const bbStore = useSimBBAStore();
  const {
    nbaTeam,
    nbaTeamMap,
    proRosterMap,
    nbaTeamOptions,
    teamProfileMap,
    cutNBAPlayer,
    proContractMap,
  } = bbStore;
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalAction, setModalAction] = useState<ModalAction>(Cut);
  const [modalPlayer, setModalPlayer] = useState<NBAPlayer | null>(null);
  const [selectedTeam, setSelectedTeam] = useState(() => {
    if (teamId && nbaTeamMap) {
      const id = Number(teamId);
      return nbaTeamMap[id];
    }
    return nbaTeam;
  });
  const [category, setCategory] = useState(Overview);
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree
  );
  let backgroundColor = "#1f2937";
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }
  const { isDesktop } = useResponsive();

  const selectedRoster = useMemo(() => {
    if (selectedTeam && proRosterMap) {
      return proRosterMap[selectedTeam.ID];
    }
    return null;
  }, [proRosterMap, selectedTeam]);

  const selectedTeamProfile = useMemo(() => {
    if (selectedTeam && teamProfileMap) {
      return teamProfileMap[selectedTeam.ID];
    }
    return null;
  }, [teamProfileMap, selectedTeam]);

  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = nbaTeamMap ? nbaTeamMap[value] : null;
    setSelectedTeam(nextTeam);
    setCategory(Overview);
  };

  const openModal = (action: ModalAction, player: NBAPlayer) => {
    handleOpenModal();
    setModalAction(action);
    setModalPlayer(player);
  };

  return (
    <>
      {modalPlayer && (
        <ActionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          playerID={modalPlayer.ID}
          playerLabel={`${modalPlayer.Position} ${modalPlayer.Archetype} ${modalPlayer.FirstName} ${modalPlayer.LastName}`}
          teamID={modalPlayer.TeamID}
          league={SimNBA}
          modalAction={modalAction}
          player={modalPlayer}
          cutPlayer={cutNBAPlayer}
        />
      )}
      <div className="flex flex-row lg:flex-col w-full max-[450px]:max-w-full">
        <TeamInfo
          id={selectedTeam?.ID}
          isRetro={currentUser?.isRetro}
          League={league}
          ts={ts}
          Roster={selectedRoster}
          Team={selectedTeam}
          TeamProfile={selectedTeamProfile}
          isPro={false}
          TeamName={`${selectedTeam?.Team} ${selectedTeam?.Nickname}`}
          Coach={selectedTeam?.NBACoachName}
          Conference={selectedTeam?.Conference}
          Arena={selectedTeam?.Arena}
          backgroundColor={backgroundColor}
          headerColor={headerColor}
          borderColor={borderColor}
        />
      </div>
      <div className="flex flex-row md:flex-col w-full">
        <Border
          direction="row"
          classes="w-full p-2 gap-x-2"
          styles={{
            backgroundColor: backgroundColor,
            borderColor: headerColor,
          }}
        >
          <div className="flex w-full">
            <SelectDropdown
              options={nbaTeamOptions}
              onChange={selectTeamOption}
            />
          </div>
          <div className="flex flex-row gap-x-1 sm:gap-x-4">
            {isDesktop && (
              <Button
                size="sm"
                isSelected={category === Overview}
                onClick={() => setCategory(Overview)}
              >
                <Text variant="small">Overview</Text>
              </Button>
            )}
            {isDesktop && (
              <Button
                size="sm"
                isSelected={category === Attributes}
                onClick={() => setCategory(Attributes)}
              >
                <Text variant="small">Attributes</Text>
              </Button>
            )}
            <Button variant="primary" size="sm">
              <Text variant="small">Export</Text>
            </Button>
          </div>
        </Border>
      </div>
      {selectedRoster && (
        <Border
          classes="px-2 min-[320px]:w-[95vw] min-[700px]:min-w-full overflow-x-auto max-[400px]:h-[60vh] max-[500px]:h-[55vh] max-[769px]:h-[70vh] h-[50vh]"
          styles={{
            backgroundColor: backgroundColor,
            borderColor: headerColor,
          }}
        >
          <NBARosterTable
            roster={selectedRoster}
            team={selectedTeam}
            category={category}
            backgroundColor={backgroundColor}
            headerColor={headerColor}
            borderColor={borderColor}
            openModal={openModal}
            contracts={proContractMap!!}
            ts={ts}
            disable={nbaTeam!.ID !== selectedTeam!.ID}
          />
        </Border>
      )}
    </>
  );
};
