import { FC } from "react";
import {
  ADay,
  BDay,
  CDay,
  DDay,
  DEFENSE,
  FootballStatsType,
  GameDay,
  League,
  navyBlueColor,
  OFFENSE,
  OLINE,
  OVERALL,
  PASSING,
  PLAYER_VIEW,
  RECEIVING,
  RETURN,
  RUSHING,
  SEASON_VIEW,
  SimCFB,
  SimCHL,
  SimNFL,
  SimPHL,
  SPECIAL_TEAMS,
  StatsType,
  StatsView,
  TEAM_VIEW,
  WEEK_VIEW,
} from "../../../_constants/constants";
import {
  CollegeTeam as CHLTeam,
  ProfessionalTeam as PHLTeam,
  Timestamp as HCKTimestamp,
} from "../../../models/hockeyModels";
import { Text } from "../../../_design/Typography";
import { TeamLabel } from "../../Common/Labels";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { Border } from "../../../_design/Borders";
import { SelectDropdown } from "../../../_design/Select";
import { CategoryDropdown } from "../../Recruiting/Common/RecruitingCategoryDropdown";
import { useResponsive } from "../../../_hooks/useMobile";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { CollegeTeam, NFLTeam } from "../../../models/footballModels";

interface StatsSidebarProps {
  team: CHLTeam | PHLTeam | CollegeTeam | NFLTeam;
  teamColors: any;
  league: League;
  statsView: StatsView;
  statsType: StatsType;
  footballStatsType?: FootballStatsType;
  weekOptions: { label: string; value: string }[];
  seasonOptions: { label: string; value: string }[];
  gameDay?: GameDay;
  changeGameDay?: (day: GameDay) => void;
  SelectWeekOption: (opts: any) => void;
  SelectSeasonOption: (opts: any) => void;
  ChangeStatsView: (newView: StatsView) => void;
  ChangeStatsType: (newView: StatsType) => void;
  ChangeFBStatsType?: (newStatsType: FootballStatsType) => void;
  HandleHelpModal: () => void;
  Search: () => Promise<void>;
  Export: () => Promise<void>;
  // ts: HCKTimestamp;
}

export const StatsSidebar: FC<StatsSidebarProps> = ({
  team,
  teamColors,
  league,
  statsView,
  gameDay,
  changeGameDay,
  ChangeStatsView,
  statsType,
  ChangeStatsType,
  ChangeFBStatsType,
  footballStatsType,
  HandleHelpModal,
  weekOptions,
  seasonOptions,
  SelectWeekOption,
  SelectSeasonOption,
  Search,
  Export,
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const headerTextColorClass = getTextColorBasedOnBg(teamColors.One);
  let teamLabel = "";
  let conferenceLabel = "";
  if (league === SimCHL || league === SimPHL) {
    teamLabel = `${team.TeamName} ${team.Mascot}`;
    conferenceLabel = `${team.Conference} Conference`;
  } else if (league === SimCFB || league === SimNFL) {
    teamLabel = `${team.TeamName} ${team.Mascot}`;
    conferenceLabel = `${team.Conference} Conference`;
  }

  return (
    <>
      <div className="flex flex-col w-full h-full max-[1024px]:gap-y-2 mb-2">
        <Border
          direction="col"
          classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 px-4 py-2 h-full items-center justify-start mb-2"
          styles={{
            borderColor: teamColors.One,
            backgroundColor: navyBlueColor,
          }}
        >
          <div className="flex flex-col gap-x-2 flex-wrap w-full text-start mb-2">
            <TeamLabel
              team={teamLabel}
              backgroundColor={teamColors.One}
              borderColor={teamColors.One}
              headerTextColorClass={headerTextColorClass}
            />
          </div>
          {!isMobile && (
            <div className="flex flex-col gap-x-2 flex-wrap w-full text-start mb-2">
              <Text as="h6">{conferenceLabel}</Text>
            </div>
          )}
          <div
            className="w-full rounded-md text-center my-2 mb-2"
            style={{
              backgroundColor: teamColors.One,
              borderColor: teamColors.One,
            }}
          >
            <Text
              variant="body-small"
              className={`font-semibold rounded-md py-1 my-1 ${headerTextColorClass}`}
            >
              Actions
            </Text>
          </div>
          <div className="md:space-y-2 gap-x-2 md:gap-x-0 mb-2 flex flex-row items-center lg:flex-col">
            {statsView === WEEK_VIEW && (
              <CategoryDropdown
                label="Week"
                options={weekOptions}
                change={SelectWeekOption}
                isMulti={false}
                isMobile={isMobile}
              />
            )}
            <CategoryDropdown
              label="Season"
              options={seasonOptions}
              change={SelectSeasonOption}
              isMulti={false}
              isMobile={isMobile}
            />
            <ButtonGroup classes="mb-4">
              <Button
                size="sm"
                type="button"
                variant="success"
                onClick={Search}
              >
                Search
              </Button>
              <Button
                type="button"
                size="sm"
                variant="warning"
                onClick={Export}
              >
                Export
              </Button>
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={HandleHelpModal}
              >
                Help
              </Button>
            </ButtonGroup>
          </div>
          {isDesktop && (
            <>
              <div
                className="w-full rounded-md text-center mb-2"
                style={{
                  backgroundColor: teamColors.One,
                  borderColor: teamColors.One,
                }}
              >
                <Text
                  variant="body-small"
                  className={`font-semibold rounded-md py-1 mb-1 mt-1 ${headerTextColorClass}`}
                >
                  Stats View
                </Text>
              </div>
              <ButtonGroup
                classes="sm:flex-auto sm:flex-1 mb-2"
                style={{ flexGrow: 0 }}
              >
                <Button
                  type="button"
                  size="sm"
                  variant={statsView === WEEK_VIEW ? "success" : "secondary"}
                  onClick={() => ChangeStatsView(WEEK_VIEW)}
                >
                  Week
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={statsView === SEASON_VIEW ? "success" : "secondary"}
                  onClick={() => ChangeStatsView(SEASON_VIEW)}
                >
                  Season
                </Button>
              </ButtonGroup>
              {(league === SimCFB || league === SimNFL) && (
                <>
                  <div
                    className="w-full rounded-md text-center my-2 mb-2"
                    style={{
                      backgroundColor: teamColors.One,
                      borderColor: teamColors.One,
                    }}
                  >
                    <Text
                      variant="body-small"
                      className={`font-semibold rounded-md py-1 mb-1 mt-1 ${headerTextColorClass}`}
                    >
                      Stat Category
                    </Text>
                  </div>
                  <ButtonGroup
                    classes="flex sm:flex-auto flex-row mb-2 justify-center"
                    style={{ flexGrow: 0 }}
                  >
                    {statsType === PLAYER_VIEW && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === PASSING
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(PASSING)}
                        >
                          Passing
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === RUSHING
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(RUSHING)}
                        >
                          Rushing
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === RECEIVING
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(RECEIVING)}
                        >
                          Receiving
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === DEFENSE
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(DEFENSE)}
                        >
                          Defense
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === OLINE
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(OLINE)}
                        >
                          OLine
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === SPECIAL_TEAMS
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(SPECIAL_TEAMS)}
                        >
                          Special Teams
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === RETURN
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(RETURN)}
                        >
                          Returns
                        </Button>
                      </>
                    )}
                    {statsType === TEAM_VIEW && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === OVERALL
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(OVERALL)}
                        >
                          Overall
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === OFFENSE
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(OFFENSE)}
                        >
                          Offense
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === DEFENSE
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(DEFENSE)}
                        >
                          Defense
                        </Button>
                      </>
                    )}
                  </ButtonGroup>
                </>
              )}
              {league !== SimCFB && league !== SimNFL && (
                <>
                  <div
                    className="w-full rounded-md text-center my-2 mb-2"
                    style={{
                      backgroundColor: teamColors.One,
                      borderColor: teamColors.One,
                    }}
                  >
                    <Text
                      variant="body-small"
                      className={`font-semibold rounded-md py-1 mb-1 mt-1 ${headerTextColorClass}`}
                    >
                      Game Day
                    </Text>
                  </div>
                  <ButtonGroup
                    classes="flex sm:flex-auto flex-row mb-2"
                    style={{ flexGrow: 0 }}
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant={gameDay === ADay ? "success" : "secondary"}
                      onClick={() => changeGameDay!(ADay)}
                    >
                      {ADay}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={gameDay === BDay ? "success" : "secondary"}
                      onClick={() => changeGameDay!(BDay)}
                    >
                      {BDay}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={gameDay === CDay ? "success" : "secondary"}
                      onClick={() => changeGameDay!(CDay)}
                    >
                      {CDay}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={gameDay === DDay ? "success" : "secondary"}
                      onClick={() => changeGameDay!(DDay)}
                    >
                      {DDay}
                    </Button>
                  </ButtonGroup>
                </>
              )}
              <div
                className="w-full rounded-md text-center my-2 mb-2"
                style={{
                  backgroundColor: teamColors.One,
                  borderColor: teamColors.One,
                }}
              >
                <Text
                  variant="body-small"
                  className={`font-semibold rounded-md py-1 mb-1 mt-1 ${headerTextColorClass}`}
                >
                  Stats Type
                </Text>
              </div>
              <ButtonGroup
                classes="flex sm:flex-auto flex-row mb-2"
                style={{ flexGrow: 0 }}
              >
                <Button
                  type="button"
                  size="sm"
                  variant={statsType === PLAYER_VIEW ? "success" : "secondary"}
                  onClick={() => ChangeStatsType(PLAYER_VIEW)}
                >
                  Player
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={statsType === TEAM_VIEW ? "success" : "secondary"}
                  onClick={() => ChangeStatsType(TEAM_VIEW)}
                >
                  Team
                </Button>
              </ButtonGroup>
            </>
          )}
          {isTablet && (
            <>
              <div
                className="w-full rounded-md text-center mb-2"
                style={{
                  backgroundColor: teamColors.One,
                  borderColor: teamColors.One,
                }}
              >
                <Text
                  variant="body-small"
                  className={`font-semibold rounded-md py-1 mb-1 mt-1 ${headerTextColorClass}`}
                >
                  Stats View, Type & GameDay
                </Text>
              </div>
              <div className="flex flex-row gap-x-8">
                <ButtonGroup classes="flex flex-row sm:flex-auto sm:flex-1 mb-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={statsView === WEEK_VIEW ? "success" : "secondary"}
                    onClick={() => ChangeStatsView(WEEK_VIEW)}
                  >
                    Week
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      statsView === SEASON_VIEW ? "success" : "secondary"
                    }
                    onClick={() => ChangeStatsView(SEASON_VIEW)}
                  >
                    Season
                  </Button>
                </ButtonGroup>
                <ButtonGroup classes="flex sm:flex-auto flex-row mb-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      statsType === PLAYER_VIEW ? "success" : "secondary"
                    }
                    onClick={() => ChangeStatsType(PLAYER_VIEW)}
                  >
                    Player
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={statsType === TEAM_VIEW ? "success" : "secondary"}
                    onClick={() => ChangeStatsType(TEAM_VIEW)}
                  >
                    Team
                  </Button>
                </ButtonGroup>
                {(league === SimCFB || league === SimNFL) && (
                  <>
                    <div
                      className="w-full rounded-md text-center my-2 mb-2"
                      style={{
                        backgroundColor: teamColors.One,
                        borderColor: teamColors.One,
                      }}
                    >
                      <Text
                        variant="body-small"
                        className={`font-semibold rounded-md py-1 mb-1 mt-1 ${headerTextColorClass}`}
                      >
                        Stat Category
                      </Text>
                    </div>
                    <ButtonGroup classes="flex sm:flex-auto flex-row mb-2 justify-center">
                      {statsType === PLAYER_VIEW && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant={
                              footballStatsType === PASSING
                                ? "success"
                                : "secondary"
                            }
                            onClick={() => ChangeFBStatsType!(PASSING)}
                          >
                            Passing
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={
                              footballStatsType === RUSHING
                                ? "success"
                                : "secondary"
                            }
                            onClick={() => ChangeFBStatsType!(RUSHING)}
                          >
                            Rushing
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={
                              footballStatsType === RECEIVING
                                ? "success"
                                : "secondary"
                            }
                            onClick={() => ChangeFBStatsType!(RECEIVING)}
                          >
                            Receiving
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={
                              footballStatsType === DEFENSE
                                ? "success"
                                : "secondary"
                            }
                            onClick={() => ChangeFBStatsType!(DEFENSE)}
                          >
                            Defense
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={
                              footballStatsType === OLINE
                                ? "success"
                                : "secondary"
                            }
                            onClick={() => ChangeFBStatsType!(OLINE)}
                          >
                            OLine
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={
                              footballStatsType === SPECIAL_TEAMS
                                ? "success"
                                : "secondary"
                            }
                            onClick={() => ChangeFBStatsType!(SPECIAL_TEAMS)}
                          >
                            Special Teams
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={
                              footballStatsType === RETURN
                                ? "success"
                                : "secondary"
                            }
                            onClick={() => ChangeFBStatsType!(RETURN)}
                          >
                            Returns
                          </Button>
                        </>
                      )}
                      {statsType === TEAM_VIEW && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant={
                              footballStatsType === OVERALL
                                ? "success"
                                : "secondary"
                            }
                            onClick={() => ChangeFBStatsType!(OVERALL)}
                          >
                            Overall
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={
                              footballStatsType === OFFENSE
                                ? "success"
                                : "secondary"
                            }
                            onClick={() => ChangeFBStatsType!(OFFENSE)}
                          >
                            Offense
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={
                              footballStatsType === DEFENSE
                                ? "success"
                                : "secondary"
                            }
                            onClick={() => ChangeFBStatsType!(DEFENSE)}
                          >
                            Defense
                          </Button>
                        </>
                      )}
                    </ButtonGroup>
                  </>
                )}
                {league !== SimCFB && league !== SimNFL && (
                  <>
                    <ButtonGroup classes="flex sm:flex-auto flex-row mb-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={gameDay === ADay ? "success" : "secondary"}
                        onClick={() => changeGameDay!(ADay)}
                      >
                        {ADay}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={gameDay === BDay ? "success" : "secondary"}
                        onClick={() => changeGameDay!(BDay)}
                      >
                        {BDay}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={gameDay === CDay ? "success" : "secondary"}
                        onClick={() => changeGameDay!(CDay)}
                      >
                        {CDay}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={gameDay === DDay ? "success" : "secondary"}
                        onClick={() => changeGameDay!(DDay)}
                      >
                        {DDay}
                      </Button>
                    </ButtonGroup>
                  </>
                )}
              </div>
            </>
          )}
          {isMobile && (
            <>
              <div
                className="w-full rounded-md text-center mb-2"
                style={{
                  backgroundColor: teamColors.One,
                  borderColor: teamColors.One,
                }}
              >
                <Text
                  variant="body-small"
                  className={`font-semibold rounded-md py-1 mb-1 mt-1 ${headerTextColorClass}`}
                >
                  Stats View & Type
                </Text>
              </div>
              <div className="flex flex-row gap-x-4">
                <ButtonGroup classes="flex flex-row sm:flex-auto sm:flex-1 mb-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={statsView === WEEK_VIEW ? "success" : "secondary"}
                    onClick={() => ChangeStatsView(WEEK_VIEW)}
                  >
                    Week
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      statsView === SEASON_VIEW ? "success" : "secondary"
                    }
                    onClick={() => ChangeStatsView(SEASON_VIEW)}
                  >
                    Season
                  </Button>
                </ButtonGroup>
                <ButtonGroup classes="flex sm:flex-auto flex-row mb-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      statsType === PLAYER_VIEW ? "success" : "secondary"
                    }
                    onClick={() => ChangeStatsType(PLAYER_VIEW)}
                  >
                    Player
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={statsType === TEAM_VIEW ? "success" : "secondary"}
                    onClick={() => ChangeStatsType(TEAM_VIEW)}
                  >
                    Team
                  </Button>
                </ButtonGroup>
              </div>
              {(league === SimCFB || league === SimNFL) && (
                <>
                  <div
                    className="w-full rounded-md text-center my-2 mb-2"
                    style={{
                      backgroundColor: teamColors.One,
                      borderColor: teamColors.One,
                    }}
                  >
                    <Text
                      variant="body-small"
                      className={`font-semibold rounded-md py-1 mb-1 mt-1 ${headerTextColorClass}`}
                    >
                      Stat Category
                    </Text>
                  </div>
                  <ButtonGroup classes="flex sm:flex-auto flex-row mb-2 justify-center">
                    {statsType === PLAYER_VIEW && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === PASSING
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(PASSING)}
                        >
                          Passing
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === RUSHING
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(RUSHING)}
                        >
                          Rushing
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === RECEIVING
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(RECEIVING)}
                        >
                          Receiving
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === DEFENSE
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(DEFENSE)}
                        >
                          Defense
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === OLINE
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(OLINE)}
                        >
                          OLine
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === SPECIAL_TEAMS
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(SPECIAL_TEAMS)}
                        >
                          Special Teams
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === RETURN
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(RETURN)}
                        >
                          Returns
                        </Button>
                      </>
                    )}
                    {statsType === TEAM_VIEW && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === OVERALL
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(OVERALL)}
                        >
                          Overall
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === OFFENSE
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(OFFENSE)}
                        >
                          Offense
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            footballStatsType === DEFENSE
                              ? "success"
                              : "secondary"
                          }
                          onClick={() => ChangeFBStatsType!(DEFENSE)}
                        >
                          Defense
                        </Button>
                      </>
                    )}
                  </ButtonGroup>
                </>
              )}
              {league !== SimCFB && league !== SimNFL && (
                <>
                  <div
                    className="w-full rounded-md text-center my-2 mb-2"
                    style={{
                      backgroundColor: teamColors.One,
                      borderColor: teamColors.One,
                    }}
                  >
                    <Text
                      variant="body-small"
                      className={`font-semibold rounded-md py-1 mb-1 mt-1 ${headerTextColorClass}`}
                    >
                      Game Day
                    </Text>
                  </div>
                  <ButtonGroup classes="flex sm:flex-auto flex-row mb-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={gameDay === ADay ? "success" : "secondary"}
                      onClick={() => changeGameDay!(ADay)}
                    >
                      {ADay}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={gameDay === BDay ? "success" : "secondary"}
                      onClick={() => changeGameDay!(BDay)}
                    >
                      {BDay}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={gameDay === CDay ? "success" : "secondary"}
                      onClick={() => changeGameDay!(CDay)}
                    >
                      {CDay}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={gameDay === DDay ? "success" : "secondary"}
                      onClick={() => changeGameDay!(DDay)}
                    >
                      {DDay}
                    </Button>
                  </ButtonGroup>
                </>
              )}
            </>
          )}
        </Border>
      </div>
    </>
  );
};
