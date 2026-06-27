import { useMemo } from "react";
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

export const BasketballGameplanPage = () => {
  const {
    userLineups,
    selectedTeamRoster,
    selectedRosterMap,
    selectedTeamLineups,
    lineupFormation,
    cbbTeamOptions,
    nbaTeamOptions,
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
  } = useBasketballGameplan();
  const { isMobile } = useResponsive();

  const { backgroundColor } = useBackgroundColor();
  const teamColors = useTeamColors(
    userTeam?.ColorOne,
    userTeam?.ColorTwo,
    userTeam?.ColorThree,
  );
  const headerTextColorClass = getTextColorBasedOnBg(teamColors.One);
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
                options={cbbTeamOptions}
                change={SelectTeam}
                isMulti={false}
                isMobile={isMobile}
              />
            </div>
          </Border>
        </div>
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
                  onClick={() => {}}
                  disabled={errors.length > 0 || !viewingUserTeam}
                >
                  Save
                </Button>
              </ButtonGrid>
            </Border>
          </div>
          <Border
            direction="row"
            classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 p-4 items-center justify-between"
            styles={{
              borderColor: teamColors.One,
              backgroundColor: backgroundColor,
            }}
          >
            <div className="grid grid-cols-5 w-full space-x-4">
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
                    selectedTeam={selectedTeam}
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
    </div>
  );
};
