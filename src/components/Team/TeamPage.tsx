import { FC, useEffect, useMemo, useState } from "react";
import {
  Cut,
  League,
  ModalAction,
  SimCHL,
  SimPHL,
  SimCFB,
  SimNFL,
  Attributes
} from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { PageContainer } from "../../_design/Container";
import { useAuthStore } from "../../context/AuthContext";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { CapsheetInfo, TeamInfo } from "./TeamPageComponents";
import { CHLRosterTable, CFBRosterTable, NFLRosterTable, PHLRosterTable } from "./TeamPageTables";
import { SelectDropdown } from "../../_design/Select";
import { SingleValue } from "react-select";
import { SelectOption } from "../../_hooks/useSelectStyles";
import { Button } from "../../_design/Buttons";
import { Text } from "../../_design/Typography";
import { useModal } from "../../_hooks/useModal";
import {
  CollegePlayer as CHLPlayer,
  ProfessionalPlayer as PHLPlayer,
} from "../../models/hockeyModels";
import {
  CollegePlayer,
  NFLPlayer,
} from "../../models/footballModels"
import { useTeamColors } from "../../_hooks/useTeamColors";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { isBrightColor } from "../../_utility/isBrightColor";
import { ActionModal } from "../Common/ActionModal";

interface TeamPageProps {
  league: League;
  ts: any;
}

export const TeamPage: FC<TeamPageProps> = ({ league }) => {
  const { currentUser } = useAuthStore();
  const leagueStore = useLeagueStore();
  const { selectedLeague, setSelectedLeague, ts } = leagueStore;
  const { chlTeam, phlTeam } = useSimHCKStore();
  const { cfbTeam, nflTeam } = useSimFBAStore();

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
    return true;
  }, [chlTeam, phlTeam, cfbTeam, nflTeam, selectedLeague]);
  return (
    <>
      <PageContainer direction="col" isLoading={isLoading} title="Team">
        {selectedLeague === SimCHL && chlTeam && <CHLTeamPage league={league} ts={ts} />}
        {selectedLeague === SimPHL && phlTeam && <PHLTeamPage league={league} ts={ts}  />}
        {selectedLeague === SimCFB && cfbTeam && <CFBTeamPage league={league} ts={ts}  />}
        {selectedLeague === SimNFL && nflTeam && <NFLTeamPage league={league} ts={ts}  />}
      </PageContainer>
    </>
  );
};

const CHLTeamPage = ({ league, ts }: TeamPageProps) => {
  const { currentUser } = useAuthStore();
  const hkStore = useSimHCKStore();
  const {
    chlTeam,
    chlTeamMap,
    chlRosterMap,
    chlTeamOptions,
    chlStandingsMap,
    cutCHLPlayer,
    redshirtPlayer,
    promisePlayer,
  } = hkStore;
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalAction, setModalAction] = useState<ModalAction>(Cut);
  const [modalPlayer, setModalPlayer] = useState<CHLPlayer | null>(null);
  const [selectedTeam, setSelectedTeam] = useState(chlTeam);
  const [category, setCategory] = useState(Attributes);
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree
  );
  let backgroundColor = teamColors.One;
  let borderColor = teamColors.Two;

  if (isBrightColor(backgroundColor)) {
    [backgroundColor, borderColor] = [borderColor, backgroundColor];
  }

  const secondaryBorderColor = teamColors.Three;
  const selectedRoster = useMemo(() => {
    if (selectedTeam) {
      return chlRosterMap[selectedTeam.ID];
    }
  }, [chlRosterMap, selectedTeam]);
  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = chlTeamMap[value];
    setSelectedTeam(nextTeam);
    setCategory(Attributes);
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
          ts={ts}
          isPro={false}
          TeamName={`${selectedTeam?.TeamName} ${selectedTeam?.Mascot}`}
          Coach={selectedTeam?.Coach}
          Conference={selectedTeam?.Conference}
          Arena={selectedTeam?.Arena}
          Capacity={selectedTeam?.ArenaCapacity}
          colorOne={backgroundColor}
          colorTwo={borderColor}
        />
      </div>
      <div className="flex flex-row md:flex-col w-full">
        <Border
          direction="row"
          classes="w-full p-2 gap-x-2"
          styles={{
            backgroundColor: backgroundColor,
            borderColor,
          }}
        >
          <div className="flex w-full">
            <SelectDropdown
              options={chlTeamOptions}
              onChange={selectTeamOption}
            />
          </div>
          <div className="flex flex-row gap-x-1 sm:gap-x-4">
            <Button
              size="sm"
              isSelected={category === "Attributes"}
              onClick={() => setCategory("Attributes")}
            >
              <Text variant="small">Attributes</Text>
            </Button>
            <Button
              size="sm"
              disabled={selectedTeam?.ID !== chlTeam?.ID}
              isSelected={category === "Potentials"}
              onClick={() => setCategory("Potentials")}
            >
              <Text variant="small">Potentials</Text>
            </Button>
            <Button variant="primary" size="sm">
              <Text variant="small">Export</Text>
            </Button>
          </div>
        </Border>
      </div>
      {selectedRoster && (
        <Border
          classes="px-2 lg:w-full min-[320px]:w-[95vw] min-[700px]:w-[775px] overflow-x-auto max-[400px]:h-[60vh] max-[500px]:h-[55vh] h-[60vh]"
          styles={{
            backgroundColor: backgroundColor,
            borderColor,
          }}
        >
          <CHLRosterTable
            team={selectedTeam}
            roster={selectedRoster}
            category={category}
            colorOne={teamColors.One}
            colorTwo={teamColors.Two}
            openModal={openModal}
          />
        </Border>
      )}
    </>
  );
};

const PHLTeamPage = ({ league, ts }: TeamPageProps) => {
  const { currentUser } = useAuthStore();
  const hkStore = useSimHCKStore();
  const {
    phlTeam,
    phlTeamMap,
    phlTeamOptions,
    proRosterMap: phlRosterMap,
    capsheetMap: phlCapsheetMap,
    proStandingsMap: phlStandingsMap,
    proContractMap: phlContractMap,
    proExtensionMap: phlExtensionMap,
    cutPHLPlayer
  } = hkStore;
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalAction, setModalAction] = useState<ModalAction>(Cut);
  const [modalPlayer, setModalPlayer] = useState<PHLPlayer | null>(
    null
  );
  const [selectedTeam, setSelectedTeam] = useState(phlTeam);
  const [category, setCategory] = useState("Attributes");
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree
  );
  let backgroundColor = teamColors.One;
  console.log(backgroundColor)
  let borderColor = teamColors.Two;
  if (isBrightColor(backgroundColor)) {
    [backgroundColor, borderColor] = [borderColor, backgroundColor];
  }
  const secondaryBorderColor = teamColors.Three;
  const textColorClass = teamColors.TextColorOne;
  const selectedRoster = useMemo(() => {
    if (selectedTeam) {
      return phlRosterMap[selectedTeam.ID];
    }
  }, [phlRosterMap, selectedTeam]);
  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = phlTeamMap[value];
    setSelectedTeam(nextTeam);
    setCategory("Attributes");
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

  return (
    <>
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
        />
      )}
      <div className="flex flex-row lg:flex-col w-full max-[450px]:max-w-full">
      <TeamInfo
          id={selectedTeam?.ID}
          isRetro={currentUser?.isRetro}
          Roster={selectedRoster}
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
          colorOne={backgroundColor}
          colorTwo={borderColor}
        />
      </div>
      <div className="flex flex-row md:flex-col w-full">
        <Border
          direction="row"
          classes="w-full p-2 gap-x-2"
          styles={{
            backgroundColor: backgroundColor,
            borderColor,
          }}
        >
          <div className="flex w-full">
            <SelectDropdown
              options={phlTeamOptions}
              onChange={selectTeamOption}
            />
          </div>
          <div className="flex flex-row gap-x-1 sm:gap-x-4">
            <Button
              size="sm"
              isSelected={category === "Attributes"}
              onClick={() => setCategory("Attributes")}
            >
              <Text variant="small">Attributes</Text>
            </Button>
            <Button
              size="sm"
              disabled={selectedTeam?.ID !== phlTeam?.ID}
              isSelected={category === "Potentials"}
              onClick={() => setCategory("Potentials")}
            >
              <Text variant="small">Potentials</Text>
            </Button>
            <Button variant="primary" size="sm">
              <Text variant="small">Export</Text>
            </Button>
          </div>
        </Border>
      </div>
      <Border
        classes="px-2 lg:w-full min-[320px]:w-[95vw] min-[700px]:w-[775px] overflow-x-auto max-[400px]:h-[60vh] max-[500px]:h-[55vh] h-[60vh]"
        styles={{
          backgroundColor: backgroundColor,
          borderColor,
        }}
      >
        <PHLRosterTable
            roster={selectedRoster}
            team={selectedTeam}
            category={category}
            colorOne={teamColors.One}
            colorTwo={teamColors.Two}
            openModal={openModal}
          />
      </Border>
    </>
  );
};

const CFBTeamPage = ({ league, ts }: TeamPageProps) => {
  const { currentUser } = useAuthStore();
  const fbStore = useSimFBAStore();
  const {
    cfbTeam,
    cfbTeamMap,
    cfbRosterMap,
    cfbTeamOptions,
    cfbStandingsMap,
    cutCFBPlayer,
    redshirtPlayer,
    promisePlayer,
  } = fbStore;
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalAction, setModalAction] = useState<ModalAction>(Cut);
  const [modalPlayer, setModalPlayer] = useState<CollegePlayer | null>(null);
  const [selectedTeam, setSelectedTeam] = useState(cfbTeam);
  const [category, setCategory] = useState("Attributes");
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree
  );
  let backgroundColor = teamColors.One;
  let borderColor = teamColors.Two;

  if (isBrightColor(backgroundColor)) {
    [backgroundColor, borderColor] = [borderColor, backgroundColor];
  }

  const secondaryBorderColor = teamColors.Three;
  const selectedRoster = useMemo(() => {
    if (selectedTeam && cfbRosterMap) {
      return cfbRosterMap[selectedTeam.ID];
    }
    return null;
  }, [cfbRosterMap, selectedTeam]);
  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = cfbTeamMap ? cfbTeamMap[value] : null;
    setSelectedTeam(nextTeam);
    setCategory("Attributes");
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
          isPro={false}
          TeamName={`${selectedTeam?.TeamName} ${selectedTeam?.Mascot}`}
          Coach={selectedTeam?.Coach}
          Conference={selectedTeam?.Conference}
          Arena={selectedTeam?.Stadium}
          Capacity={selectedTeam?.StadiumCapacity}
          colorOne={backgroundColor}
          colorTwo={borderColor}
        />
      </div>
      <div className="flex flex-row md:flex-col w-full">
        <Border
          direction="row"
          classes="w-full p-2 gap-x-2"
          styles={{
            backgroundColor: backgroundColor,
            borderColor,
          }}
        >
          <div className="flex w-full">
            <SelectDropdown
              options={cfbTeamOptions}
              onChange={selectTeamOption}
            />
          </div>
          <div className="flex flex-row gap-x-4">
            <Button
              size="sm"
              isSelected={category === "Attributes"}
              onClick={() => setCategory("Attributes")}
            >
              <Text variant="small">Attributes</Text>
            </Button>
            <Button variant="primary" size="sm">
              <Text variant="small">Export</Text>
            </Button>
          </div>
        </Border>
      </div>
      {selectedRoster && (
        <Border
          classes="px-2 lg:w-full min-[320px]:w-[95vw] min-[700px]:w-[775px] overflow-x-auto max-[400px]:h-[60vh] max-[500px]:h-[55vh] h-[60vh]"
          styles={{
            backgroundColor: backgroundColor,
            borderColor,
          }}
        >
          <CFBRosterTable
            roster={selectedRoster}
            team={selectedTeam}
            category={category}
            colorOne={teamColors.One}
            colorTwo={teamColors.Two}
            openModal={openModal}
          />
        </Border>
      )}
    </>
  );
};

const NFLTeamPage = ({ league, ts }: TeamPageProps) => {
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
  const [selectedTeam, setSelectedTeam] = useState(nflTeam);
  const [category, setCategory] = useState("Attributes");
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree
  );
  let backgroundColor = teamColors.One;
  let borderColor = teamColors.Two;

  if (isBrightColor(backgroundColor)) {
    [backgroundColor, borderColor] = [borderColor, backgroundColor];
  }

  const secondaryBorderColor = teamColors.Three;
  const selectedRoster = useMemo(() => {
    if (selectedTeam && nflRosterMap) {
      return nflRosterMap[selectedTeam.ID];
    }
    return null;
  }, [nflRosterMap, selectedTeam]);
  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = nflTeamMap ? nflTeamMap[value] : null;
    setSelectedTeam(nextTeam);
    setCategory("Attributes");
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
      <div className="flex flex-row lg:flex-col w-full max-[450px]:max-w-full">
        <TeamInfo
          id={selectedTeam?.ID}
          isRetro={currentUser?.isRetro}
          Roster={selectedRoster}
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
          colorOne={backgroundColor}
          colorTwo={borderColor}
        />
      </div>
      <div className="flex flex-row md:flex-col w-full">
        <Border
          direction="row"
          classes="w-full p-2 gap-x-2"
          styles={{
            backgroundColor: backgroundColor,
            borderColor,
          }}
        >
          <div className="flex w-full">
            <SelectDropdown
              options={nflTeamOptions}
              onChange={selectTeamOption}
            />
          </div>
          <div className="flex flex-row gap-x-4">
            <Button
              size="sm"
              isSelected={category === "Attributes"}
              onClick={() => setCategory("Attributes")}
            >
              <Text variant="small">Attributes</Text>
            </Button>
            <Button variant="primary" size="sm">
              <Text variant="small">Export</Text>
            </Button>
          </div>
        </Border>
      </div>
      {selectedRoster && (
        <Border
          classes="px-2 lg:w-full min-[320px]:w-[95vw] min-[700px]:w-[775px] overflow-x-auto max-[400px]:h-[60vh] max-[500px]:h-[55vh] h-[60vh]"
          styles={{
            backgroundColor: backgroundColor,
            borderColor,
          }}
        >
          <NFLRosterTable
            roster={selectedRoster}
            team={selectedTeam}
            category={category}
            colorOne={teamColors.One}
            colorTwo={teamColors.Two}
            openModal={openModal}
          />
        </Border>
      )}
    </>
  );
};

