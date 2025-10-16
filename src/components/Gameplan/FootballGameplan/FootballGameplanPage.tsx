import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import { useAuthStore } from "../../../context/AuthContext";
import { DepthChartService } from "../../../_services/depthChartService";
import {
  CollegeGameplan as CFBGameplan,
  CollegePlayer as CFBPlayer,
  CollegeTeamDepthChart as CFBDepthChart,
  CollegeDepthChartPosition as CFBDepthChartPosition,
  NFLGameplan,
  NFLPlayer,
  NFLDepthChart,
  NFLDepthChartPosition,
} from "../../../models/footballModels";
import { Border } from "../../../_design/Borders";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import {
  SimCFB,
  SimNFL,
  Gameplan,
  DepthChart,
  AdminRole,
} from "../../../_constants/constants";
import { Text } from "../../../_design/Typography";
import { Input, ToggleSwitch } from "../../../_design/Inputs";
import { SelectDropdown } from "../../../_design/Select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { SingleValue } from "react-select";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { useResponsive } from "../../../_hooks/useMobile";
import PlayerPicture from "../../../_utility/usePlayerFaces";
import DepthChartCard from "./Common/DepthChartCard";
import DepthChartView from "./DepthChart/DepthChartView";
import GameplanView from "./Gameplan/GameplanView";
import { GameplanData } from "./Gameplan/GameplanHelper";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import UnsavedChangesModal from "./Common/UnsavedChangesModal";

export const CFBGameplanPage = () => {
  const { currentUser } = useAuthStore();
  const fbStore = useSimFBAStore();
  const {
    cfbTeam,
    cfbDepthChartMap,
    cfbRosterMap,
    cfbTeamOptions,
    cfbTeamMap,
    saveCFBDepthChart,
    collegeGameplan: cfbGameplan,
    collegeDepthChart: cfbDepthChart,
    collegeGameplanMap,
    collegeTeamsGames,
    cfb_Timestamp,
  } = fbStore;
  const [category, setCategory] = useState(Gameplan);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);
  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] =
    useState(false);
  const [depthChartHasUnsavedChanges, setDepthChartHasUnsavedChanges] =
    useState(false);
  const [gameplanHasUnsavedChanges, setGameplanHasUnsavedChanges] =
    useState(false);
  const [adminModeEnabled, setAdminModeEnabled] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(cfbTeam);
  const [selectedTeamDepthChart, setSelectedTeamDepthChart] =
    useState<CFBDepthChart | null>(null);

  const teamPlayers = useMemo(() => {
    if (selectedTeam && cfbRosterMap) {
      return cfbRosterMap[selectedTeam.ID] || [];
    }
    return [];
  }, [cfbRosterMap, selectedTeam]);

  const [gameplanData, setGameplanData] = useState<CFBGameplan | null>(null);
  const [depthChartData, setDepthChartData] = useState<any>(null);
  const [isLoadingGameplan, setIsLoadingGameplan] = useState(false);

  useEffect(() => {
    if (selectedTeam && cfbDepthChartMap) {
      const depthChart = cfbDepthChartMap[selectedTeam.ID];
      setSelectedTeamDepthChart(depthChart || null);
    }
  }, [selectedTeam, cfbDepthChartMap]);

  const handleTeamSelection = useCallback(
    (selectedOption: SingleValue<SelectOption>) => {
      if (selectedOption && cfbTeamMap) {
        const teamId = Number(selectedOption.value);
        const team = cfbTeamMap[teamId];
        if (team) {
          setSelectedTeam(team);
          setDepthChartHasUnsavedChanges(false);
          setAdminModeEnabled(false);
        }
      }
    },
    [cfbTeamMap]
  );

  const handleDepthChartUpdate = useCallback(
    (updatedDepthChart: CFBDepthChart) => {},
    []
  );

  const handleGameplanUpdate = useCallback(
    (updatedGameplan: GameplanData) => {},
    []
  );

  const handleCategoryChange = useCallback(
    (newCategory: string) => {
      const currentHasUnsavedChanges =
        category === DepthChart
          ? depthChartHasUnsavedChanges
          : gameplanHasUnsavedChanges;

      if (currentHasUnsavedChanges && newCategory !== category) {
        setPendingCategory(newCategory);
        setIsUnsavedChangesModalOpen(true);
      } else {
        setCategory(newCategory);
      }
    },
    [category, depthChartHasUnsavedChanges, gameplanHasUnsavedChanges]
  );

  const handleConfirmCategoryChange = useCallback(() => {
    if (pendingCategory) {
      setCategory(pendingCategory);
      setPendingCategory(null);
    }
    setIsUnsavedChangesModalOpen(false);
  }, [pendingCategory]);

  const handleCancelCategoryChange = useCallback(() => {
    setPendingCategory(null);
    setIsUnsavedChangesModalOpen(false);
  }, []);

  const opponentTeam = useMemo(() => {
    // Get the latest unplayed game (look up game by weekID)
    if (cfbTeam && collegeTeamsGames && collegeGameplanMap) {
      let nextUnplayedGameIdx = collegeTeamsGames.findIndex(
        (game) =>
          game.WeekID === cfb_Timestamp?.CollegeWeekID && !game.GameComplete
      );
      if (nextUnplayedGameIdx < 0) {
        // Check the next week
        const nextWeekIdx = collegeTeamsGames.findIndex(
          (game) => game.WeekID === (cfb_Timestamp?.CollegeWeekID || 0) + 1
        );
        if (nextWeekIdx < 0) return null;
        nextUnplayedGameIdx = nextWeekIdx;
      }
      const nextGame = collegeTeamsGames[nextUnplayedGameIdx];
      const opponentId =
        nextGame.HomeTeamID === cfbTeam.ID
          ? nextGame.AwayTeamID
          : nextGame.HomeTeamID;
      const opponentGameplan = collegeGameplanMap[opponentId] || null;
      const opponentRoster = cfbRosterMap ? cfbRosterMap[opponentId] || [] : [];
      return { ...opponentGameplan, Players: opponentRoster };
    }
    return null;
  }, [
    cfbTeam,
    collegeTeamsGames,
    cfbRosterMap,
    collegeGameplanMap,
    cfb_Timestamp,
  ]);

  const borderColor = selectedTeam?.ColorOne;
  const backgroundColor = "#1f2937";
  const accentColor = selectedTeam?.ColorTwo;
  const borderTextColor = getTextColorBasedOnBg(borderColor);
  const backgroundTextColor = getTextColorBasedOnBg(backgroundColor);

  return (
    <div className="sm:container w-full sm:mx-auto sm:px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex flex-col 2xl:flex-row justify-center items-center 2xl:space-x-4 space-y-4 2xl:space-y-0 mb-6">
          <ButtonGroup>
            <Button
              variant={category === Gameplan ? "primary" : "secondary"}
              size="md"
              onClick={() => handleCategoryChange(Gameplan)}
            >
              Gameplan
            </Button>
            <Button
              variant={category === DepthChart ? "primary" : "secondary"}
              size="md"
              onClick={() => handleCategoryChange(DepthChart)}
            >
              Depth Chart
            </Button>
          </ButtonGroup>
          {category === DepthChart && cfbTeamOptions && (
            <div className="flex flex-col 2xl:flex-row items-center gap-4">
              <div
                className="2xl:ml-4 w-full 2xl:w-auto"
                style={{ minWidth: "200px", maxWidth: "300px" }}
              >
                <SelectDropdown
                  options={cfbTeamOptions}
                  value={cfbTeamOptions.find(
                    (opt) => opt.value === String(selectedTeam?.ID)
                  )}
                  onChange={handleTeamSelection}
                  placeholder="Select Team"
                  isClearable={false}
                />
              </div>
              {currentUser?.roleID &&
                currentUser.roleID === AdminRole &&
                selectedTeam?.ID !== cfbTeam?.ID && (
                  <div className="flex justify-center items-center gap-2">
                    <ToggleSwitch
                      onChange={(checked) => setAdminModeEnabled(checked)}
                      checked={adminModeEnabled}
                    />
                    <Text variant="small" classes="text-white">
                      Admin Mode
                    </Text>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      <UnsavedChangesModal
        isOpen={isUnsavedChangesModalOpen}
        onClose={handleCancelCategoryChange}
        onConfirm={handleConfirmCategoryChange}
        currentView={category}
        targetView={pendingCategory || ""}
      />

      {category === DepthChart ? (
        <DepthChartView
          players={teamPlayers}
          depthChart={selectedTeamDepthChart || cfbDepthChart}
          team={selectedTeam}
          league={SimCFB}
          gameplan={cfbGameplan}
          onDepthChartUpdate={handleDepthChartUpdate}
          canModify={
            selectedTeam?.ID === cfbTeam?.ID ||
            (currentUser?.roleID === AdminRole && adminModeEnabled)
          }
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          accentColor={accentColor}
          borderTextColor={borderTextColor}
          backgroundTextColor={backgroundTextColor}
          onHasUnsavedChangesChange={setDepthChartHasUnsavedChanges}
        />
      ) : isLoadingGameplan ? (
        <div className="text-center">
          <Text variant="h3" classes="text-white mb-4">
            Loading Gameplan...
          </Text>
        </div>
      ) : cfbGameplan ? (
        <GameplanView
          gameplan={cfbGameplan}
          players={
            cfbRosterMap && cfbTeam ? cfbRosterMap[cfbTeam.ID] || [] : []
          }
          depthChart={cfbDepthChart}
          team={cfbTeam}
          league={SimCFB}
          onGameplanUpdate={handleGameplanUpdate}
          backgroundColor="#1f2937"
          borderColor={cfbTeam?.ColorOne}
          accentColor={cfbTeam?.ColorTwo}
          opponentTeam={opponentTeam}
          borderTextColor={getTextColorBasedOnBg(cfbTeam?.ColorOne)}
          backgroundTextColor={getTextColorBasedOnBg("#1f2937")}
          onHasUnsavedChangesChange={setGameplanHasUnsavedChanges}
        />
      ) : (
        <div className="text-center">
          <Text variant="h3" classes="text-white mb-4">
            No Gameplan Found
          </Text>
          <Text variant="body" classes="text-gray-400">
            Unable to load gameplan data for this team. Please try refreshing
            the page or contact support.
          </Text>
        </div>
      )}
    </div>
  );
};

export const NFLGameplanPage = () => {
  const { teamId } = useParams<{ teamId?: string }>();
  const { currentUser } = useAuthStore();
  const fbStore = useSimFBAStore();
  const {
    nflTeam,
    proTeamMap: nflTeamMap,
    nflTeamOptions,
    nflDepthChartMap,
    proRosterMap: NFLRosterMap,
    nflGameplan,
    nflDepthChart,
    nflGameplanMap,
    proTeamsGames,
    cfb_Timestamp,
  } = fbStore;
  const [category, setCategory] = useState(Gameplan);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);
  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] =
    useState(false);
  const [depthChartHasUnsavedChanges, setDepthChartHasUnsavedChanges] =
    useState(false);
  const [gameplanHasUnsavedChanges, setGameplanHasUnsavedChanges] =
    useState(false);
  const [adminModeEnabled, setAdminModeEnabled] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState(() => {
    if (teamId && nflTeamMap) {
      const id = Number(teamId);
      return nflTeamMap[id];
    }
    return nflTeam;
  });
  const [selectedTeamDepthChart, setSelectedTeamDepthChart] =
    useState<NFLDepthChart | null>(null);

  const selectedTeamPlayers = useMemo(() => {
    if (selectedTeam && NFLRosterMap) {
      return NFLRosterMap[selectedTeam.ID] || [];
    }
    return [];
  }, [NFLRosterMap, selectedTeam]);

  useEffect(() => {
    if (selectedTeam && nflDepthChartMap) {
      const depthChart = nflDepthChartMap[selectedTeam.ID];
      setSelectedTeamDepthChart(depthChart || null);
    }
  }, [selectedTeam, nflDepthChartMap]);

  const handleTeamSelection = useCallback(
    (selectedOption: SingleValue<SelectOption>) => {
      if (selectedOption && nflTeamMap) {
        const teamId = Number(selectedOption.value);
        const team = nflTeamMap[teamId];
        if (team) {
          setSelectedTeam(team);
          setDepthChartHasUnsavedChanges(false);
          setAdminModeEnabled(false);
        }
      }
    },
    [nflTeamMap]
  );

  const borderColor = selectedTeam?.ColorOne;
  const backgroundColor = "#1f2937";
  const accentColor = selectedTeam?.ColorTwo;
  const borderTextColor = getTextColorBasedOnBg(borderColor);
  const backgroundTextColor = getTextColorBasedOnBg(backgroundColor);

  const handleDepthChartUpdate = useCallback(
    (updatedDepthChart: NFLDepthChart) => {},
    []
  );

  const handleGameplanUpdate = useCallback((updatedGameplan: GameplanData) => {
    console.log("NFL Gameplan updated:", updatedGameplan);
  }, []);

  const handleCategoryChange = useCallback(
    (newCategory: string) => {
      const currentHasUnsavedChanges =
        category === DepthChart
          ? depthChartHasUnsavedChanges
          : gameplanHasUnsavedChanges;

      if (currentHasUnsavedChanges && newCategory !== category) {
        setPendingCategory(newCategory);
        setIsUnsavedChangesModalOpen(true);
      } else {
        setCategory(newCategory);
      }
    },
    [category, depthChartHasUnsavedChanges, gameplanHasUnsavedChanges]
  );

  const handleConfirmCategoryChange = useCallback(() => {
    if (pendingCategory) {
      setCategory(pendingCategory);
      setPendingCategory(null);
    }
    setIsUnsavedChangesModalOpen(false);
  }, [pendingCategory]);

  const handleCancelCategoryChange = useCallback(() => {
    setPendingCategory(null);
    setIsUnsavedChangesModalOpen(false);
  }, []);

  const opponentTeam = useMemo(() => {
    // Get the latest unplayed game (look up game by weekID)
    if (nflTeam && proTeamsGames && nflGameplanMap) {
      let nextUnplayedGameIdx = proTeamsGames.findIndex(
        (game) =>
          game.WeekID === cfb_Timestamp?.CollegeWeekID && !game.GameComplete
      );
      if (nextUnplayedGameIdx < 0) {
        // Check the next week
        const nextWeekIdx = proTeamsGames.findIndex(
          (game) => game.WeekID === (cfb_Timestamp?.CollegeWeekID || 0) + 1
        );
        if (nextWeekIdx < 0) return null;
        nextUnplayedGameIdx = nextWeekIdx;
      }
      // STOP. Let me take care of this.
      const nextGame = proTeamsGames[nextUnplayedGameIdx];
      const opponentId =
        nextGame.HomeTeamID === nflTeam.ID
          ? nextGame.AwayTeamID
          : nextGame.HomeTeamID;
      const opponentGameplan = nflGameplanMap[opponentId] || null;
      const opponentRoster = NFLRosterMap ? NFLRosterMap[opponentId] || [] : [];
      return { ...opponentGameplan, Players: opponentRoster };
    }
    return null;
  }, [nflTeam, proTeamsGames, NFLRosterMap, nflGameplanMap, cfb_Timestamp]);

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex flex-col 2xl:flex-row justify-center items-center 2xl:space-x-4 space-y-4 2xl:space-y-0 mb-6">
            <ButtonGroup>
              <Button
                variant={category === Gameplan ? "primary" : "secondary"}
                size="md"
                onClick={() => handleCategoryChange(Gameplan)}
              >
                Gameplan
              </Button>
              <Button
                variant={category === DepthChart ? "primary" : "secondary"}
                size="md"
                onClick={() => handleCategoryChange(DepthChart)}
              >
                Depth Chart
              </Button>
            </ButtonGroup>
            {category === DepthChart && nflTeamOptions && (
              <div className="flex flex-col 2xl:flex-row items-center gap-4">
                <div
                  className="2xl:ml-4 w-full 2xl:w-auto"
                  style={{ minWidth: "200px", maxWidth: "300px" }}
                >
                  <SelectDropdown
                    options={nflTeamOptions}
                    value={nflTeamOptions.find(
                      (opt) => opt.value === String(selectedTeam?.ID)
                    )}
                    onChange={handleTeamSelection}
                    placeholder="Select Team"
                    isClearable={false}
                  />
                </div>
                {currentUser?.roleID &&
                  currentUser.roleID === AdminRole &&
                  selectedTeam?.ID !== nflTeam?.ID && (
                    <div className="flex justify-center items-center gap-2">
                      <ToggleSwitch
                        onChange={(checked) => setAdminModeEnabled(checked)}
                        checked={adminModeEnabled}
                      />
                      <Text variant="small" classes="text-white">
                        Admin Mode
                      </Text>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>

        <UnsavedChangesModal
          isOpen={isUnsavedChangesModalOpen}
          onClose={handleCancelCategoryChange}
          onConfirm={handleConfirmCategoryChange}
          currentView={category}
          targetView={pendingCategory || ""}
        />

        {category === DepthChart ? (
          <DepthChartView
            players={selectedTeamPlayers}
            depthChart={selectedTeamDepthChart || nflDepthChart}
            team={selectedTeam}
            league={SimNFL}
            gameplan={nflGameplan}
            onDepthChartUpdate={handleDepthChartUpdate}
            canModify={
              selectedTeam?.ID === nflTeam?.ID ||
              (currentUser?.roleID === AdminRole && adminModeEnabled)
            }
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            accentColor={accentColor}
            borderTextColor={borderTextColor}
            backgroundTextColor={backgroundTextColor}
            onHasUnsavedChangesChange={setDepthChartHasUnsavedChanges}
          />
        ) : nflGameplan ? (
          <GameplanView
            gameplan={nflGameplan}
            players={
              NFLRosterMap && nflTeam ? NFLRosterMap[nflTeam.ID] || [] : []
            }
            depthChart={nflDepthChart}
            team={nflTeam}
            league={SimNFL}
            onGameplanUpdate={handleGameplanUpdate}
            backgroundColor="#1f2937"
            borderColor={nflTeam?.ColorOne}
            accentColor={nflTeam?.ColorTwo}
            opponentTeam={opponentTeam}
            borderTextColor={getTextColorBasedOnBg(nflTeam?.ColorOne)}
            backgroundTextColor={getTextColorBasedOnBg("#1f2937")}
            onHasUnsavedChangesChange={setGameplanHasUnsavedChanges}
          />
        ) : (
          <div className="text-center">
            <Text variant="h3" classes="text-white mb-4">
              No Gameplan Found
            </Text>
            <Text variant="body" classes="text-gray-400">
              Unable to load gameplan data for this team. Please try refreshing
              the page or contact support.
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};
