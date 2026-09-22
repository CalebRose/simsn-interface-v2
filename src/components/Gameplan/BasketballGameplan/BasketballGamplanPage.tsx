import { useMemo, useState } from "react";
import { Border } from "../../../_design/Borders";
import { Button, ButtonGrid } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { useBackgroundColor } from "../../../_hooks/useBackgroundColor";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { useBasketballGameplan } from "./useBasketballGameplan";
import { TeamLabel } from "../../Common/Labels";
import { CategoryDropdown } from "../../Recruiting/Common/RecruitingCategoryDropdown";
import { useResponsive } from "../../../_hooks/useMobile";
import { BasketballLineup } from "./BasketballLineupComponents";
import { BasketballCourtVision } from "./BasketballCourtVision";
import { Input } from "../../../_design/Inputs";
import { Modal } from "../../../_design/Modal";
import { CBBPlayerInfoModalBody, NBAPlayerInfoModalBody } from "../../Common/Modals";
import { SimCBB } from "../../../_constants/constants";
import { CollegePlayer, NBAPlayer } from "../../../models/basketballModels";

interface ModeOption {
  label: string;
  value: number;
}

const ModeButtonGroup = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: ModeOption[];
  value: number;
  onChange: (value: number) => void;
}) => (
  <div className="flex flex-col gap-y-1">
    <Text variant="h6" classes="text-start mb-1">
      {label}
    </Text>
    <div className="flex w-full gap-x-1" role="group" aria-label={label}>
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={value === option.value ? "primary" : "secondary"}
          size="sm"
          classes="flex-1"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  </div>
);

export const BasketballGameplanPage = () => {
  const {
    userLineups,
    selectedTeamRoster,
    selectedLeague,
    selectedRosterMap,
    selectedTeamLineups,
    lineupFormation,
    selectedLeagueTeamOptions,
    userTeam,
    selectedTeam,
    SelectTeam,
    viewingUserTeam,
    SelectString,
    selectedString,
    selectedStringAbbr,
    selectedGuardOptions,
    selectedForwardOptions,
    selectedCenterOptions,
    ChangeLineupInput,
    errors,
    totalMinutesAllocated,
    totalInsideProportionWeighted,
    totalMidrangeProportionWeighted,
    totalThreePointProportionWeighted,
    saveLineupChanges,
    pace,
    paceOptions,
    SelectPace,
    SelectOffensiveSystem,
    offensiveSystem,
    offensiveSystemOptions,
    SelectDefensiveSystem,
    defensiveSystem,
    defensiveSystemOptions,
    focusPlayer,
    setFocusPlayer,
    focusOpponentName,
    focusPlayerOptions,
    preserveTimeouts, setPreserveTimeouts,
    foulProtectionMode, setFoulProtectionMode, foulProtectionValue, setFoulProtectionValue,
    opponentLeadEnabled, setOpponentLeadEnabled, opponentLeadValue, setOpponentLeadValue,
    playerExhaustionEnabled, setPlayerExhaustionEnabled, playerExhaustionId, setPlayerExhaustionId,
    playerExhaustionValue, setPlayerExhaustionValue,
    teamExhaustionEnabled, setTeamExhaustionEnabled, teamExhaustionValue, setTeamExhaustionValue,
  } = useBasketballGameplan();
  const { isMobile, isDesktop, isUltraWide } = useResponsive();
  const [modalPlayer, setModalPlayer] = useState<CollegePlayer | NBAPlayer | null>(null);

  const { backgroundColor } = useBackgroundColor();
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne || userTeam?.ColorOne,
    selectedTeam?.ColorTwo || userTeam?.ColorTwo,
    selectedTeam?.ColorThree || userTeam?.ColorThree,
  );
  const headerTextColorClass = getTextColorBasedOnBg(teamColors.One);
  const onOffOptions = useMemo<ModeOption[]>(
    () => [
      { label: "Off", value: 0 },
      { label: "On", value: 1 },
    ],
    [],
  );
  const foulProtectionOptions = useMemo<ModeOption[]>(
    () => [
      { label: "Off", value: 0 },
      { label: "Player", value: 1 },
      { label: "Fouls", value: 2 },
    ],
    [],
  );
  const playerOptions = useMemo(
    () => [
      { label: "Select a player", value: "0" },
      ...selectedTeamRoster.map((player) => ({
        label: `${player.FirstName} ${player.LastName}`,
        value: String(player.ID),
      })),
    ],
    [selectedTeamRoster],
  );
  const foulCountOptions = useMemo(
    () =>
      Array.from({ length: 5 }, (_, index) => ({
        label: String(index + 1),
        value: String(index + 1),
      })),
    [],
  );
  const teamLabel = useMemo(() => {
    if (!selectedTeam) {
      if (userTeam) return userTeam.Team || "";
      return "";
    }
    return selectedTeam.Team || "";
  }, [selectedTeam, userTeam]);

  return (
    <div>
      <div className="grid grid-flow-row grid-auto-rows-auto w-full h-full max-[1024px]:grid-cols-1 max-[1024px]:gap-y-2 grid-cols-[2fr_10fr] max-[1024px]:gap-x-1 gap-x-2 mb-2">
        <div className="flex flex-col w-full h-full max-[1024px]:gap-y-2">
          <Border
            direction="col"
            classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 px-4 py-2 h-full items-center justify-start"
            styles={{
              borderColor: teamColors.One,
              backgroundColor: backgroundColor,
            }}
          >
            <div className="flex flex-col gap-x-2 flex-wrap w-full text-start mb-2">
              <TeamLabel
                team={teamLabel}
                variant="h5"
                backgroundColor={teamColors.One}
                borderColor={teamColors.One}
                headerTextColorClass={headerTextColorClass}
              />

              <CategoryDropdown
                label="Team"
                options={selectedLeagueTeamOptions}
                change={SelectTeam}
                isMulti={false}
                isMobile={isMobile}
              />
            </div>
            {viewingUserTeam && (
              <>
                <div className="flex flex-col gap-x-2 flex-wrap w-full text-start">
                  <Text variant="h6" classes="text-start">
                    Shot Allocations across team
                  </Text>
                </div>
                <div className="flex flex-col gap-x-2 flex-wrap w-full text-start">
                  <Text variant="small" classes="text-start">
                    Inside Weight: {totalInsideProportionWeighted.toFixed(2)}
                  </Text>
                </div>
                <div className="flex flex-col gap-x-2 flex-wrap w-full text-start">
                  <Text variant="small" classes="text-start">
                    Midrange Weight:{" "}
                    {totalMidrangeProportionWeighted.toFixed(2)}
                  </Text>
                </div>
                <div className="flex flex-col gap-x-2 flex-wrap w-full text-start">
                  <Text variant="small" classes="text-start">
                    3pt Weight: {totalThreePointProportionWeighted.toFixed(2)}
                  </Text>
                </div>
                {viewingUserTeam && (
                  <div className="flex flex-col gap-x-2 flex-wrap w-full text-start my-2 space-y-2">
                    <TeamLabel
                      team="Gameplan"
                      variant="h5"
                      backgroundColor={teamColors.One}
                      borderColor={teamColors.One}
                      headerTextColorClass={headerTextColorClass}
                    />
                    <CategoryDropdown
                      label="Pace"
                      value={pace}
                      options={paceOptions}
                      change={SelectPace}
                      isMulti={false}
                      isMobile={isMobile}
                    />
                    <CategoryDropdown
                      label="Offensive System"
                      value={offensiveSystem}
                      options={offensiveSystemOptions}
                      change={SelectOffensiveSystem}
                      isMulti={false}
                      isMobile={isMobile}
                    />
                    <CategoryDropdown
                      label="Defensive System"
                      value={defensiveSystem}
                      options={defensiveSystemOptions}
                      change={SelectDefensiveSystem}
                      isMulti={false}
                      isMobile={isMobile}
                    />
                    {(defensiveSystem === "Man-to-Man" ||
                      defensiveSystem === "Box-and-One Zone") && (
                      <>
                        <Text variant="small" classes="text-start">
                          {focusOpponentName
                            ? `Next Opponent: ${focusOpponentName}`
                            : "Next Opponent: Not scheduled"}
                        </Text>
                        <CategoryDropdown
                          label="Focus Player"
                          value={String(focusPlayer)}
                          options={focusPlayerOptions}
                          selectedOption={focusPlayerOptions.find(
                            (option) => option.value === String(focusPlayer),
                          )}
                          change={(option) =>
                            setFocusPlayer(Number(option.value))
                          }
                          isMulti={false}
                          isMobile={isMobile}
                        />
                      </>
                    )}
                    <ModeButtonGroup
                      label="Preserve Timeouts"
                      value={preserveTimeouts ? 1 : 0}
                      options={onOffOptions}
                      onChange={(value) => setPreserveTimeouts(value === 1)}
                    />
                    <ModeButtonGroup
                      label="Foul Protection"
                      value={foulProtectionMode}
                      options={foulProtectionOptions}
                      onChange={(value) => {
                        setFoulProtectionMode(value);
                        setFoulProtectionValue(0);
                      }}
                    />
                    {foulProtectionMode === 1 && (
                      <CategoryDropdown
                        label="Protected Player"
                        value={String(foulProtectionValue)}
                        options={playerOptions}
                        selectedOption={playerOptions.find(
                          (option) => option.value === String(foulProtectionValue),
                        )}
                        change={(option) =>
                          setFoulProtectionValue(Number(option.value))
                        }
                        isMulti={false}
                        isMobile={isMobile}
                      />
                    )}
                    {foulProtectionMode === 2 && (
                      <CategoryDropdown
                        label="Fouls per Half"
                        value={String(foulProtectionValue)}
                        options={foulCountOptions}
                        change={(option) =>
                          setFoulProtectionValue(Number(option.value))
                        }
                        isMulti={false}
                        isMobile={isMobile}
                      />
                    )}
                    <ModeButtonGroup
                      label="Opponent Lead Timeout"
                      value={opponentLeadEnabled ? 1 : 0}
                      options={onOffOptions}
                      onChange={(value) => setOpponentLeadEnabled(value === 1)}
                    />
                    {opponentLeadEnabled && (
                      <Input
                        label="Opponent Lead (points)"
                        type="number"
                        min={1}
                        max={99}
                        value={opponentLeadValue}
                        onChange={(event) =>
                          setOpponentLeadValue(Number(event.target.value))
                        }
                      />
                    )}
                    <ModeButtonGroup
                      label="Player Exhaustion Timeout"
                      value={playerExhaustionEnabled ? 1 : 0}
                      options={onOffOptions}
                      onChange={(value) => setPlayerExhaustionEnabled(value === 1)}
                    />
                    {playerExhaustionEnabled && (
                      <>
                        <CategoryDropdown
                          label="Monitored Player"
                          value={String(playerExhaustionId)}
                          options={playerOptions}
                          selectedOption={playerOptions.find(
                            (option) =>
                              option.value === String(playerExhaustionId),
                          )}
                          change={(option) =>
                            setPlayerExhaustionId(Number(option.value))
                          }
                          isMulti={false}
                          isMobile={isMobile}
                        />
                        <Input
                          label="Exhaustion"
                          type="number"
                          min={0}
                          max={100}
                          value={playerExhaustionValue}
                          onChange={(event) =>
                            setPlayerExhaustionValue(Number(event.target.value))
                          }
                        />
                      </>
                    )}
                    <ModeButtonGroup
                      label="Team Exhaustion"
                      value={teamExhaustionEnabled ? 1 : 0}
                      options={onOffOptions}
                      onChange={(value) => setTeamExhaustionEnabled(value === 1)}
                    />
                    {teamExhaustionEnabled && (
                      <Input
                        label="Average Exhaustion"
                        type="number"
                        min={0}
                        max={100}
                        value={teamExhaustionValue}
                        onChange={(event) =>
                          setTeamExhaustionValue(Number(event.target.value))
                        }
                      />
                    )}
                  </div>
                )}
                <div className="flex flex-col gap-x-2 flex-wrap w-full text-start my-2">
                  <TeamLabel
                    team="Errors"
                    variant="h5"
                    backgroundColor={teamColors.One}
                    borderColor={teamColors.One}
                    headerTextColorClass={headerTextColorClass}
                  />
                </div>
                <div className="flex flex-col gap-x-2 flex-wrap w-full text-start">
                  {errors.length === 0 && (
                    <Text variant="small" classes="text-start">
                      No errors found.
                    </Text>
                  )}
                  {errors.map((error, index) => (
                    <Text key={index} variant="small" classes="text-start">
                      {error}
                    </Text>
                  ))}
                </div>
              </>
            )}
          </Border>
        </div>
        <div className="flex flex-col w-full max-[1024px]:gap-y-2">
          {(isDesktop || isUltraWide) && (
            <BasketballCourtVision
              lineupFormation={lineupFormation}
              selectedTeamLineups={selectedTeamLineups}
              selectedRosterMap={selectedRosterMap}
              team={selectedTeam}
              league={selectedLeague}
              primaryColor={teamColors.One}
              accentColor={teamColors.Two}
              onPlayerClick={setModalPlayer}
            />
          )}
          <div className="flex flex-col sm:flex-row gap-x-2">
            <Border
              direction="row"
              classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 items-center justify-center gap-x-2"
              styles={{
                borderColor: teamColors.One,
                backgroundColor: backgroundColor,
              }}
            >
              <ButtonGrid classes="sm:flex sm:flex-auto sm:flex-1">
                <Button
                  type="button"
                  variant={selectedString === "First" ? "primary" : "secondary"}
                  onClick={() => SelectString("First")}
                >
                  First
                </Button>
                <Button
                  type="button"
                  variant={
                    selectedString === "Second" ? "primary" : "secondary"
                  }
                  onClick={() => SelectString("Second")}
                >
                  Second
                </Button>
                <Button
                  type="button"
                  variant={selectedString === "Third" ? "primary" : "secondary"}
                  onClick={() => SelectString("Third")}
                >
                  Third
                </Button>
              </ButtonGrid>
            </Border>
            <Border
              direction="col"
              classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 items-center justify-center gap-x-8"
              styles={{
                borderColor: teamColors.One,
                backgroundColor: backgroundColor,
              }}
            >
              <ButtonGrid classes="sm:flex sm:flex-auto sm:flex-1">
                <Button type="button" variant={"secondary"} onClick={() => {}}>
                  AI
                </Button>
                <Button type="button" variant={"primary"} onClick={() => {}}>
                  Help
                </Button>
                <Button
                  type="button"
                  variant={
                    errors.length > 0 || !viewingUserTeam ? "danger" : "success"
                  }
                  onClick={saveLineupChanges}
                  disabled={errors.length > 0 || !viewingUserTeam}
                >
                  Save
                </Button>
              </ButtonGrid>
            </Border>
          </div>
          <Border
            direction="col"
            classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 items-center justify-between"
            styles={{
              borderColor: teamColors.One,
              backgroundColor: backgroundColor,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-5 w-full space-x-4">
              {lineupFormation.map((position, index) => {
                const playerOptions = (() => {
                  if (position === "G") return selectedGuardOptions;
                  if (position === "F") return selectedForwardOptions;
                  if (position === "C") return selectedCenterOptions;
                  return [];
                })();
                return (
                  <BasketballLineup
                    selectedTeamLineups={selectedTeamLineups}
                    index={index}
                    selectedRosterMap={selectedRosterMap}
                    selectedTeamRoster={selectedTeamRoster}
                    position={position}
                    selectedString={selectedString}
                    selectedStringAbbr={selectedStringAbbr}
                    ChangeLineupInput={ChangeLineupInput}
                    playerOptions={playerOptions}
                    canModify={viewingUserTeam}
                  />
                );
              })}
            </div>
          </Border>
        </div>
      </div>
      <Modal
        isOpen={Boolean(modalPlayer)}
        onClose={() => setModalPlayer(null)}
        title={modalPlayer ? `${modalPlayer.Position || ""} ${modalPlayer.FirstName} ${modalPlayer.LastName}`.trim() : ""}
        maxWidth="max-w-4xl"
      >
        {modalPlayer && (selectedLeague === SimCBB ? (
          <CBBPlayerInfoModalBody player={modalPlayer as CollegePlayer} />
        ) : (
          <NBAPlayerInfoModalBody player={modalPlayer as NBAPlayer} />
        ))}
      </Modal>
    </div>
  );
};
