import React, { useState, useMemo } from "react";
import {
  CollegePlayer as CFBPlayer,
  NFLPlayer,
} from "../../../../models/footballModels";
import PositionSlot from "./PositionSlot";
import { SimCFB, SimNFL } from "../../../../_constants/constants";
import { Text } from "../../../../_design/Typography";
import { FormationMap, Formation } from "../Constants/GameplanConstants";
import { Button } from "../../../../_design/Buttons";
import {
  getFormationLayout,
  getDefensiveFormationLayout,
  getDefensiveLinePositions,
  getFormationType,
  shouldRenderPosition,
} from "./FormationViewHelper";
import { ArrowRight, ArrowLeft } from "../../../../_design/Icons";
import { getLogo } from "../../../../_utility/getLogo";
import { Logo } from "../../../../_design/Logo";

interface FormationViewProps {
  formationType: "offense" | "defense" | "specialteams";
  players: (CFBPlayer | NFLPlayer)[];
  depthChart: any;
  team: any;
  league: typeof SimCFB | typeof SimNFL;
  gameplan?: any;
  borderColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  borderTextColor?: string;
  openModal: (player: CFBPlayer | NFLPlayer) => void;
}

const FormationView: React.FC<FormationViewProps> = ({
  formationType,
  players,
  depthChart,
  team,
  league,
  gameplan,
  borderColor,
  backgroundColor,
  accentColor,
  borderTextColor,
  openModal,
}) => {
  const [currentFormationIndex, setCurrentFormationIndex] = useState(0);
  const formationBoardClasses =
    "relative mx-auto w-full max-w-[80vw] min-h-160 bg-linear-to-b from-green-600 via-green-500 to-green-600 rounded-lg overflow-hidden border-2";
  const logo = getLogo(league, team.ID, false);
  const availableFormations = useMemo(() => {
    if (formationType === "offense") {
      const offensiveScheme =
        gameplan?.OffensiveScheme || team?.TeamGameplan?.OffensiveScheme;

      if (!offensiveScheme) {
        return [];
      }

      const schemeData = FormationMap[offensiveScheme];
      return schemeData?.Formations || [];
    } else if (formationType === "defense") {
      const defensiveScheme =
        gameplan?.DefensiveScheme || team?.TeamGameplan?.DefensiveScheme;

      if (!defensiveScheme) {
        return [];
      }

      const schemeData = FormationMap[defensiveScheme];
      return schemeData?.Formations || [];
    }

    return [];
  }, [
    formationType,
    gameplan?.OffensiveScheme,
    team?.TeamGameplan?.OffensiveScheme,
    gameplan?.DefensiveScheme,
    team?.TeamGameplan?.DefensiveScheme,
  ]);

  const currentFormation = availableFormations[currentFormationIndex] || null;
  const defensiveScheme =
    gameplan?.DefensiveScheme || team?.TeamGameplan?.DefensiveScheme;
  const formationLayout = currentFormation
    ? formationType === "defense"
      ? getDefensiveFormationLayout(currentFormation, defensiveScheme)
      : getFormationLayout(currentFormation)
    : null;

  const handlePreviousFormation = () => {
    setCurrentFormationIndex((prev) =>
      prev === 0 ? availableFormations.length - 1 : prev - 1,
    );
  };

  const handleNextFormation = () => {
    setCurrentFormationIndex((prev) =>
      prev === availableFormations.length - 1 ? 0 : prev + 1,
    );
  };

  const getOffenseFormation = () => (
    <div className="space-y-4 w-[80vw]">
      {availableFormations.length > 1 && currentFormation && (
        <div
          className="flex items-center space-x-4 p-1 rounded-lg border-2 justify-center"
          style={{ backgroundColor: backgroundColor, borderColor: borderColor }}
        >
          <div className="flex w-1/2 justify-between items-center">
            <Button
              onClick={handlePreviousFormation}
              variant="secondary"
              size="sm"
              classes="text-white hover:bg-gray-700 transition-colors h-1/2"
            >
              <ArrowLeft />
            </Button>
            <div className="text-center">
              <Text variant="h4" classes="text-white font-semibold">
                {currentFormation.name}
              </Text>
              <Text variant="small" classes="text-gray-300">
                {currentFormationIndex + 1} of {availableFormations.length}
              </Text>
            </div>
            <Button
              onClick={handleNextFormation}
              variant="secondary"
              size="sm"
              classes="text-white hover:bg-gray-700 transition-colors h-1/2"
            >
              <ArrowRight />
            </Button>
          </div>
        </div>
      )}

      <div className={formationBoardClasses} style={{ borderColor }}>
        <div className="relative min-h-160 w-full">
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-px bg-white opacity-30"
                style={{ top: `${8 + i * 8}%` }}
              />
            ))}
          </div>

          <div
            className="absolute inset-0 grid grid-rows-12 p-2"
            style={{ gridTemplateColumns: "repeat(14, minmax(0.5, 1fr))" }}
          >
            {formationLayout?.positions.map((positionData) => {
              if (
                !positionData.shouldRender ||
                !shouldRenderPosition(
                  positionData.position,
                  currentFormation,
                  formationType,
                )
              ) {
                return null;
              }

              const positionType = positionData.position.replace(/\d+$/, "");
              const positionLevel = parseInt(
                positionData.position.match(/\d+$/)?.[0] || "1",
              );

              if (
                ["LT1", "LG1", "C1", "RG1", "RT1"].includes(
                  positionData.position,
                )
              ) {
                return null;
              }
              return (
                <div
                  key={positionData.position}
                  className={`flex justify-center`}
                  style={{
                    gridColumnStart: positionData.col,
                    gridRowStart: positionData.row,
                  }}
                >
                  <PositionSlot
                    position={positionType}
                    positionLevels={positionType === "WR" ? 4 : 1}
                    players={players}
                    depthChart={depthChart}
                    team={team}
                    league={league}
                    size="md"
                    label={positionData.position}
                    startingLevel={positionLevel}
                    showBackupBelow={positionData.showBackup}
                    openModal={openModal}
                    backgroundColor={backgroundColor}
                  />
                </div>
              );
            })}
            <div
              className="flex justify-center items-center gap-1"
              style={{ gridColumnStart: 5, gridColumnEnd: 10, gridRowStart: 3 }}
            >
              {["LT1", "LG1", "C1", "RG1", "RT1"].map((position) => {
                const positionType = position.replace(/\d+$/, "");
                return (
                  <PositionSlot
                    key={position}
                    position={positionType}
                    positionLevels={1}
                    players={players}
                    depthChart={depthChart}
                    team={team}
                    league={league}
                    size="md"
                    label={position}
                    showBackupBelow={false}
                    openModal={openModal}
                    backgroundColor={backgroundColor}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <div
          className="relative flex items-center justify-between w-full h-16 px-4 border-t-2"
          style={{ backgroundColor: borderColor, borderColor: accentColor }}
        >
          <Logo url={logo} />
          <Text
            variant="h1"
            classes={`uppercase ${borderTextColor}`}
            style={{
              textShadow: borderTextColor?.includes("white")
                ? "1.5px 1.5px 0 black, -1.5px -1.5px 0 black, 1.5px -1.5px 0 black, -1.5px 1.5px 0 black"
                : "1.5px 1.5px 0 white, -1.5px -1.5px 0 white, 1.5px -1.5px 0 white, -1.5px 1.5px 0 white",
            }}
          >
            {league === SimCFB ? team.TeamName : team.Mascot}
          </Text>
          <Logo url={logo} />
        </div>
      </div>
    </div>
  );

  const getDefenseFormation = () => (
    <div className="space-y-4 w-[80vw]">
      {availableFormations.length > 1 && currentFormation && (
        <div
          className="flex items-center space-x-4 p-1 rounded-lg border-2 justify-center"
          style={{ backgroundColor: backgroundColor, borderColor: borderColor }}
        >
          <div className="flex w-1/2 justify-between items-center">
            <Button
              onClick={handlePreviousFormation}
              variant="secondary"
              size="sm"
              classes="text-white hover:bg-gray-700 transition-colors h-1/2"
            >
              <ArrowLeft />
            </Button>
            <div className="text-center">
              <Text variant="h4" classes="text-white font-semibold">
                {currentFormation.name}
              </Text>
              <Text variant="small" classes="text-gray-300">
                {currentFormationIndex + 1} of {availableFormations.length}
              </Text>
            </div>
            <Button
              onClick={handleNextFormation}
              variant="secondary"
              size="sm"
              classes="text-white hover:bg-gray-700 transition-colors h-1/2"
            >
              <ArrowRight />
            </Button>
          </div>
        </div>
      )}

      <div className={formationBoardClasses} style={{ borderColor }}>
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-px bg-white opacity-30"
              style={{ top: `${8 + i * 8}%` }}
            />
          ))}
        </div>

        <div
          className="absolute grid inset-0 grid-rows-12 p-2"
          style={{ gridTemplateColumns: "repeat(14, minmax(0.5, 1fr))" }}
        >
          {formationLayout?.positions.map((positionData) => {
            if (
              !positionData.shouldRender ||
              !shouldRenderPosition(
                positionData.position,
                currentFormation,
                formationType,
              )
            ) {
              return null;
            }

            const positionType = positionData.position.replace(/\d+$/, "");
            const positionLevel = parseInt(
              positionData.position.match(/\d+$/)?.[0] || "1",
            );

            return (
              <div
                key={positionData.position}
                className={`flex justify-center`}
                style={{
                  gridColumnStart: positionData.col,
                  gridRowStart: positionData.row,
                }}
              >
                <PositionSlot
                  position={positionType}
                  positionLevels={
                    positionType === "CB"
                      ? 5
                      : positionType === "MLB"
                        ? 4
                        : positionType === "DT"
                          ? 4
                          : 2
                  }
                  players={players}
                  depthChart={depthChart}
                  team={team}
                  league={league}
                  size="md"
                  label={positionData.position}
                  startingLevel={positionLevel}
                  showBackupBelow={false}
                  openModal={openModal}
                  backgroundColor={backgroundColor}
                />
              </div>
            );
          })}
          {currentFormation && (
            <div
              className="flex justify-center items-center gap-1"
              style={{
                gridColumnStart: 5,
                gridColumnEnd: 10,
                gridRowStart: 11,
              }}
            >
              {getDefensiveLinePositions(currentFormation, defensiveScheme).map(
                (position) => {
                  const positionType = position.replace(/\d+$/, "");
                  const positionLevel = parseInt(
                    position.match(/\d+$/)?.[0] || "1",
                  );
                  return (
                    <PositionSlot
                      key={position}
                      position={positionType}
                      positionLevels={positionType === "DT" ? 4 : 2}
                      players={players}
                      depthChart={depthChart}
                      team={team}
                      league={league}
                      size="md"
                      label={position}
                      startingLevel={positionLevel}
                      showBackupBelow={false}
                      openModal={openModal}
                      backgroundColor={backgroundColor}
                    />
                  );
                },
              )}
            </div>
          )}
          <div
            className="row-start-1 row-span-2 rounded-lg bg-black/75 col-[1/span_14] w-full border-2"
            style={{ backgroundColor: borderColor, borderColor: accentColor }}
          >
            <div className="flex items-center justify-between w-full h-full px-4">
              <Logo url={logo} />
              <Text
                variant="h1"
                classes={`uppercase ${borderTextColor}`}
                style={{
                  textShadow: borderTextColor?.includes("white")
                    ? "1.5px 1.5px 0 black, -1.5px -1.5px 0 black, 1.5px -1.5px 0 black, -1.5px 1.5px 0 black"
                    : "1.5px 1.5px 0 white, -1.5px -1.5px 0 white, 1.5px -1.5px 0 white, -1.5px 1.5px 0 white",
                }}
              >
                {league === SimCFB ? team.TeamName : team.Mascot}
              </Text>
              <Logo url={logo} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const getSpecialTeamsFormation = () => (
    <div className="space-y-4 w-[80vw]">
      <div className={formationBoardClasses} style={{ borderColor }}>
        <div className="relative min-h-160">
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-px bg-white opacity-30"
                style={{ top: `${8 + i * 8}%` }}
              />
            ))}
          </div>

          <div className="relative flex flex-col min-h-160 p-4 gap-6">
            {/* STU section — cards wrap freely across the full board width */}
            <div className="flex flex-wrap justify-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(
                (level) => (
                  <PositionSlot
                    key={level}
                    position="STU"
                    positionLevels={15}
                    players={players}
                    depthChart={depthChart}
                    team={team}
                    league={league}
                    size="md"
                    label={`STU${level}`}
                    startingLevel={level}
                    showBackupBelow={false}
                    openModal={openModal}
                    backgroundColor={backgroundColor}
                  />
                ),
              )}
            </div>

            {/* Spacer — pushes kickers/returners to the bottom of the field */}
            <div className="flex-1" />

            {/* Bottom row: kickers left, returners right */}
            <div className="flex justify-between items-start px-4 pb-2">
              <div className="flex gap-4">
                <PositionSlot
                  position="FG"
                  positionLevels={1}
                  players={players}
                  depthChart={depthChart}
                  team={team}
                  league={league}
                  size="md"
                  label="FG1"
                  startingLevel={1}
                  showBackupBelow={true}
                  openModal={openModal}
                  backgroundColor={backgroundColor}
                />
                <PositionSlot
                  position="K"
                  positionLevels={1}
                  players={players}
                  depthChart={depthChart}
                  team={team}
                  league={league}
                  size="md"
                  label="K1"
                  startingLevel={1}
                  showBackupBelow={false}
                  openModal={openModal}
                  backgroundColor={backgroundColor}
                />
                <PositionSlot
                  position="P"
                  positionLevels={1}
                  players={players}
                  depthChart={depthChart}
                  team={team}
                  league={league}
                  size="md"
                  label="P1"
                  startingLevel={1}
                  showBackupBelow={false}
                  openModal={openModal}
                  backgroundColor={backgroundColor}
                />
              </div>
              <div className="flex gap-4">
                <PositionSlot
                  position="KR"
                  positionLevels={1}
                  players={players}
                  depthChart={depthChart}
                  team={team}
                  league={league}
                  size="md"
                  label="KR1"
                  startingLevel={1}
                  showBackupBelow={true}
                  openModal={openModal}
                  backgroundColor={backgroundColor}
                />
                <PositionSlot
                  position="PR"
                  positionLevels={1}
                  players={players}
                  depthChart={depthChart}
                  team={team}
                  league={league}
                  size="md"
                  label="PR1"
                  startingLevel={1}
                  showBackupBelow={true}
                  openModal={openModal}
                  backgroundColor={backgroundColor}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  switch (formationType) {
    case "offense":
      return getOffenseFormation();
    case "defense":
      return getDefenseFormation();
    case "specialteams":
      return getSpecialTeamsFormation();
    default:
      return getOffenseFormation();
  }
};

export default FormationView;
