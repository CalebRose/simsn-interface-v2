import { getLogo } from "../../_utility/getLogo";
import { GetTeamLabel } from "../../_helper/teamHelper";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { Logo } from "../../_design/Logo";
import { Text } from "../../_design/Typography";
import { Border, BorderHidden } from "../../_design/Borders";
import { LockIcon } from "../../_design/Icons";
import {
  Coach,
  GM,
  League,
  Marketing,
  Owner,
  Scout,
  SimCBB,
  SimCFB,
  SimCHL,
  SimCollegeBaseball,
  SimMLB,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { useModal } from "../../_hooks/useModal";
import { SelectedTeamModal } from "./SelectedTeamModal";
import { useTeamColors } from "../../_hooks/useTeamColors";
import { getPrimaryBaseballTeam } from "../../_utility/baseballHelpers";

// ✅ Types
interface SelectedTeamCardProps {
  league: string;
  selectedTeam?: any;
  retro: boolean | undefined;
  data: any;
  sentRequest?: boolean;
  sendRequest?: (league: League, team: any, role?: string) => void;
}

const isTeamDisabled = (team: any | undefined, league: string): boolean => {
  if (!team) return false;

  switch (league) {
    case SimCFB:
      return team.Coach !== "AI";
    case SimCBB:
    case SimCHL:
      return team.IsUserCoached || false;
    case SimCollegeBaseball:
      return team.coach != null && team.coach !== "AI" && team.coach.length > 0;
    case SimNFL:
      return team.NFLOwnerName?.length &&
        team.NFLGMName?.length &&
        team.NFLCoachName?.length &&
        team.NFLAssistantName?.length
        ? true
        : false;
    case SimNBA:
      return team.NBAOwnerName?.length &&
        team.NBAGMName?.length &&
        team.NBACoachName?.length &&
        team.NBAAssistantName?.length
        ? true
        : false;
    case SimMLB:
      return team.owner_name?.length &&
        team.gm_name?.length &&
        team.manager_name?.length &&
        team.scout_name?.length
        ? true
        : false;
    default:
      return false;
  }
};

const NoSelectedTeam = () => {
  return (
    <div
      className={`flex flex-col max-h-[80vh] w-full min-[1025px]:h-[70vh] min-[820px]:max-h-[48vh] min-[1025px]:max-h-[75vh] min-[1025px]:mx-4 min-[1025px]:mb-3 rounded-2xl shadow-lg border-2 p-6 bg-white dark:bg-gray-600`}
    >
      <div className="flex flex-col items-center justify-center min-[1025px]:h-full px-6 py-4">
        <div className="h-[125px] flex flex-col">
          <div className="hidden lg:flex flex-row mb-2 text-center justify-between w-[300px]">
            <Text variant="h5" classes="text-white font-semibold">
              Please select a team on the left.
            </Text>
          </div>
          <div className="lg:hidden flex flex-row mb-2 text-center align-middle justify-center w-[300px]">
            <Text variant="body" classes="text-white">
              Please select a team below.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SelectedTeamCard: React.FC<SelectedTeamCardProps> = ({
  league,
  selectedTeam,
  data,
  retro,
  sendRequest,
}) => {
  if (!selectedTeam) {
    return <NoSelectedTeam />;
  }
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const isBaseball = league === SimMLB || league === SimCollegeBaseball;
  const primaryBaseballTeam = isBaseball ? getPrimaryBaseballTeam(selectedTeam) : undefined;
  const teamID = isBaseball ? (primaryBaseballTeam?.team_id ?? selectedTeam?.id) : selectedTeam?.ID;
  const logo = getLogo(league as League, teamID, retro);
  const disable = isTeamDisabled(selectedTeam, league);
  const colorOne = isBaseball ? (primaryBaseballTeam?.color_one || "") : (selectedTeam.ColorOne || "");
  const colorTwo = isBaseball ? (primaryBaseballTeam?.color_two || "") : (selectedTeam.ColorTwo || "");
  const colorThree = isBaseball ? (primaryBaseballTeam?.color_three || "") : (selectedTeam.ColorThree || "");
  const teamColors = useTeamColors(colorOne, colorTwo, colorThree);
  const backgroundColor = !disable ? teamColors.One : "#4B5563";
  const borderColor = !disable ? teamColors.Two : "#4B5563";
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const teamLabel =
    selectedTeam && GetTeamLabel(league as League, selectedTeam);
  const conferenceLabel = isBaseball
    ? (primaryBaseballTeam?.conference || "")
    : (selectedTeam.Conference || "");
  return (
    <div
      className={`flex flex-col max-h-[80vh] w-full min-[1025px]:h-[70vh] min-[820px]:max-h-[48vh] min-[1025px]:max-h-[75vh] min-[1025px]:mx-4 min-[1025px]:mb-3 rounded-2xl shadow-lg border-2 p-6 ${
        !selectedTeam ? "bg-white dark:bg-gray-600" : ""
      } ${disable ? "grayscale" : ""} ${textColorClass}`}
      style={{ backgroundColor, borderColor }}
    >
      <>
        <div className="flex flex-row mb-2 justify-start items-center">
          <div className="">
            <Logo
              url={logo}
              variant="normal"
              classes="h-[8rem] w-[8rem]"
              containerClass="p-4"
            />
          </div>
          <div className="flex-col ml-4">
            <div className="flex-row text-start">
              <div className="flex-col">
                <Text variant="h6" classes="font-semibold">
                  {teamLabel}
                </Text>
              </div>
              <div className="flex-col">
                <Text variant="small" classes="font-semibold text-start">
                  {conferenceLabel}{conferenceLabel ? " Conference" : ""}
                </Text>
              </div>
              {(league === SimCFB || league === SimCBB || league === SimCHL) &&
                selectedTeam.Coach !== "AI" && (
                  <div className="flex-col">
                    <Text variant="small" classes="font-semibold text-start">
                      Coach:{" "}
                      {selectedTeam.Coach?.length > 0
                        ? selectedTeam.Coach
                        : "None"}
                    </Text>
                  </div>
                )}
            </div>
          </div>
          {league === SimNFL && (
            <div className="flex-col self-start md:self-auto mx-2 md:ml-4">
              <div className="flex-row text-start">
                <div className="flex-col">
                  <Text
                    variant="small"
                    classes="font-semibold text-start whitespace-nowrap"
                  >
                    Owner:{" "}
                    {selectedTeam.NFLOwnerName?.length > 0
                      ? selectedTeam.NFLOwnerName
                      : "None"}
                  </Text>
                </div>
                {league === SimNFL && selectedTeam.NFLCoachName !== "AI" && (
                  <div className="flex-col">
                    <Text variant="small" classes="font-semibold text-start">
                      Coach:{" "}
                      {selectedTeam.NFLCoachName?.length > 0
                        ? selectedTeam.NFLCoachName
                        : "None"}
                    </Text>
                  </div>
                )}
                <div className="flex-col">
                  <Text
                    variant="small"
                    classes="font-semibold text-start whitespace-nowrap"
                  >
                    GM:{" "}
                    {selectedTeam.NFLGMName?.length > 0
                      ? selectedTeam.NFLGMName
                      : "None"}
                  </Text>
                </div>

                <div className="flex-col">
                  <Text
                    variant="small"
                    classes="font-semibold text-start whitespace-nowrap"
                  >
                    Scout:{" "}
                    {selectedTeam.NFLAssistantName?.length > 0
                      ? selectedTeam.NFLAssistantName
                      : "None"}
                  </Text>
                </div>
              </div>
            </div>
          )}
          {league === SimNBA && (
            <div className="flex-col self-start md:self-auto mx-2 ml-4">
              <div className="flex-row text-start">
                <div className="flex-col">
                  <Text variant="small" classes="font-semibold text-start">
                    Owner:{" "}
                    {selectedTeam.NBAOwnerName?.length > 0
                      ? selectedTeam.NBAOwnerName
                      : "None"}
                  </Text>
                </div>
                <div className="flex-col">
                  <Text variant="small" classes="font-semibold text-start">
                    GM:{" "}
                    {selectedTeam.NBAGMName?.length > 0
                      ? selectedTeam.NBAGMName
                      : "None"}
                  </Text>
                </div>
                {league === SimNBA && selectedTeam.NBACoachName !== "AI" && (
                  <div className="flex-col">
                    <Text variant="small" classes="font-semibold text-start">
                      Coach:{" "}
                      {selectedTeam.NBACoachName?.length > 0
                        ? selectedTeam.NBACoachName
                        : "None"}
                    </Text>
                  </div>
                )}
                <div className="flex-col">
                  <Text variant="small" classes="font-semibold text-start">
                    Scout:{" "}
                    {selectedTeam.NBAAssistantName?.length > 0
                      ? selectedTeam.NBAAssistantName
                      : "None"}
                  </Text>
                </div>
              </div>
            </div>
          )}
          {league === SimCollegeBaseball &&
            selectedTeam.coach &&
            selectedTeam.coach !== "AI" && (
              <div className="flex-col self-start md:self-auto mx-2 ml-4">
                <div className="flex-row text-start">
                  <Text variant="small" classes="font-semibold text-start">
                    Coach:{" "}
                    {selectedTeam.coach.length > 0
                      ? selectedTeam.coach
                      : "None"}
                  </Text>
                </div>
              </div>
            )}
          {league === SimMLB && (
            <div className="flex-col self-start md:self-auto mx-2 ml-4">
              <div className="flex-row text-start">
                <div className="flex-col">
                  <Text
                    variant="small"
                    classes="font-semibold text-start whitespace-nowrap"
                  >
                    Owner:{" "}
                    {selectedTeam.owner_name?.length > 0
                      ? selectedTeam.owner_name
                      : "None"}
                  </Text>
                </div>
                <div className="flex-col">
                  <Text
                    variant="small"
                    classes="font-semibold text-start whitespace-nowrap"
                  >
                    Manager:{" "}
                    {selectedTeam.manager_name?.length > 0
                      ? selectedTeam.manager_name
                      : "None"}
                  </Text>
                </div>
                <div className="flex-col">
                  <Text
                    variant="small"
                    classes="font-semibold text-start whitespace-nowrap"
                  >
                    GM:{" "}
                    {selectedTeam.gm_name?.length > 0
                      ? selectedTeam.gm_name
                      : "None"}
                  </Text>
                </div>
                <div className="flex-col">
                  <Text
                    variant="small"
                    classes="font-semibold text-start whitespace-nowrap"
                  >
                    Scout:{" "}
                    {selectedTeam.scout_name?.length > 0
                      ? selectedTeam.scout_name
                      : "None"}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </div>
        <Border>
          <div className="flex flex-row gap-4 justify-between sm:relative">
            <div className="flex flex-col">
              <Text
                variant="alternate"
                classes="font-semibold whitespace-nowrap"
              >
                Overall Grade
              </Text>
              <Text variant="small">{selectedTeam.OverallGrade}</Text>
            </div>
            <div className="flex flex-col sm:mx-auto sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2">
              <Text
                variant="alternate"
                classes="font-semibold whitespace-nowrap"
              >
                Offense Grade
              </Text>
              <Text variant="small">{selectedTeam.OffenseGrade}</Text>
            </div>
            <div className="flex flex-col">
              <Text
                variant="alternate"
                classes="font-semibold whitespace-nowrap"
              >
                Defense Grade
              </Text>
              <Text variant="small">{selectedTeam.DefenseGrade}</Text>
            </div>
          </div>
        </Border>
      </>

      {data && league === SimCFB && SelectedCFBTeamCard(data)}
      {data && league === SimCBB && SelectedSimCBBTeamCard(data)}
      {data && league === SimNFL && SelectedSimNFLTeamCard(data)}
      {data && league === SimNBA && SelectedSimNBATeamCard(data)}
      {data && league === SimCHL && SelectedSimCHLTeamCard(data)}
      {data && league === SimPHL && SelectedSimPHLTeamCard(data)}
      {selectedTeam && data && (
        <SelectedTeamModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={`Request ${teamLabel}?`}
          actions={
            <>
              {(league === SimCFB ||
                league === SimCBB ||
                league === SimCHL ||
                league === SimCollegeBaseball) && (
                <Button
                  onClick={() => {
                    sendRequest?.(league, selectedTeam, "");
                    handleCloseModal();
                  }}
                >
                  Confirm
                </Button>
              )}
              {league === SimNFL && (
                <>
                  <Button
                    size="sm"
                    onClick={() => sendRequest?.(league, selectedTeam, "o")}
                    disabled={(selectedTeam.NFLOwnerName?.length ?? 0) > 0}
                  >
                    <Text variant="small">Request Ownership</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => sendRequest?.(league, selectedTeam, "hc")}
                    disabled={(selectedTeam.NFLCoachName?.length ?? 0) > 0}
                  >
                    <Text variant="small">Request Coach</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => sendRequest?.(league, selectedTeam, "gm")}
                    disabled={(selectedTeam.NFLGMName?.length ?? 0) > 0}
                  >
                    <Text variant="small">Request GM</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => sendRequest?.(league, selectedTeam, "a")}
                    disabled={(selectedTeam.NFLAssistantName?.length ?? 0) > 0}
                  >
                    Request Assistant
                  </Button>
                </>
              )}
              {league === SimNBA && (
                <>
                  <Button
                    size="sm"
                    onClick={() => sendRequest?.(league, selectedTeam, "o")}
                    disabled={(selectedTeam.NBAOwnerName?.length ?? 0) > 0}
                  >
                    Request Ownership
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => sendRequest?.(league, selectedTeam, "hc")}
                    disabled={(selectedTeam.NBACoachName?.length ?? 0) > 0}
                  >
                    Request Coach
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => sendRequest?.(league, selectedTeam, "gm")}
                    disabled={(selectedTeam.NBAGMName?.length ?? 0) > 0}
                  >
                    Request GM
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => sendRequest?.(league, selectedTeam, "a")}
                    disabled={(selectedTeam.NBAAssistantName?.length ?? 0) > 0}
                  >
                    Request Assistant
                  </Button>
                </>
              )}
              {league === SimPHL && (
                <ButtonGroup>
                  <Button
                    size="sm"
                    onClick={() => {
                      sendRequest?.(league, selectedTeam, Owner);
                      handleCloseModal();
                    }}
                    disabled={(selectedTeam.Owner?.length ?? 0) > 0}
                  >
                    <Text variant="small">Ownership</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      sendRequest?.(league, selectedTeam, Coach);
                      handleCloseModal();
                    }}
                    disabled={(selectedTeam.Coach?.length ?? 0) > 0}
                  >
                    <Text variant="small">Coach</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      sendRequest?.(league, selectedTeam, GM);
                      handleCloseModal();
                    }}
                    disabled={(selectedTeam.GM?.length ?? 0) > 0}
                  >
                    <Text variant="small">GM</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      sendRequest?.(league, selectedTeam, Scout);
                      handleCloseModal();
                    }}
                    disabled={(selectedTeam.Scout?.length ?? 0) > 0}
                  >
                    <Text variant="small">Assistant</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      sendRequest?.(league, selectedTeam, Marketing);
                      handleCloseModal();
                    }}
                    disabled={(selectedTeam.Marketing?.length ?? 0) > 0}
                  >
                    <Text variant="small">Marketing</Text>
                  </Button>
                </ButtonGroup>
              )}
              {league === SimMLB && (
                <ButtonGroup>
                  <Button
                    size="sm"
                    onClick={() => {
                      sendRequest?.(league, selectedTeam, "o");
                      handleCloseModal();
                    }}
                    disabled={(selectedTeam.owner_name?.length ?? 0) > 0}
                  >
                    <Text variant="small">Ownership</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      sendRequest?.(league, selectedTeam, "mgr");
                      handleCloseModal();
                    }}
                    disabled={(selectedTeam.manager_name?.length ?? 0) > 0}
                  >
                    <Text variant="small">Manager</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      sendRequest?.(league, selectedTeam, "gm");
                      handleCloseModal();
                    }}
                    disabled={(selectedTeam.gm_name?.length ?? 0) > 0}
                  >
                    <Text variant="small">GM</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      sendRequest?.(league, selectedTeam, "sc");
                      handleCloseModal();
                    }}
                    disabled={(selectedTeam.scout_name?.length ?? 0) > 0}
                  >
                    <Text variant="small">Scout</Text>
                  </Button>
                </ButtonGroup>
              )}
            </>
          }
        >
          <Text classes="mb-4 text-start">
            Coaching the {teamLabel} in {league} can be a wonderful experience.
            You will be coaching alongside others users in the{" "}
            {selectedTeam.Conference} Conference,{" "}
            {league === SimCFB &&
              `competing not only for the
            conference championship, but also the opportunity to play in either
            the playoffs or a bowl game.`}
            {league === SimCBB &&
              `competing not only for the
            conference championship, but also the opportunity to play in the post-season tournament, March Madness.`}
            {league === SimNFL &&
              `competing not only for the
            Super Bowl, but to build a dynasty that will last for years.`}
            {league === SimNBA &&
              `competing not only for the Playoffs and to ultimately win The Finals.`}
            {league === SimCHL &&
              `competing not only for the
            conference championship, but also the opportunity to play in the post-season tournament, the Frozen Four.`}
            {league === SimPHL &&
              `competing not only for the
            postseason, but also the opportunity to play for the Stanley Cup.`}
            {league === SimCollegeBaseball &&
              `competing not only for the
            conference championship, but also the opportunity to play in the College World Series.`}
            {league === SimMLB &&
              `competing not only for the
            postseason, but also the opportunity to win the World Series.`}
          </Text>
          <Text classes="mb-6 text-start">
            If at any point you don't know where to start or what to do, please
            reach out to others in our Discord Server. We'd be more than happy
            to help show the ropes so that you can make the most out of your
            team.
          </Text>
          <Text classes="text-start mb-2" variant="danger">
            NOTE: All team requests without an application filled out on our
            forums OR Discord server will be rejected.
          </Text>
          <Text classes="text-start mb-2">
            If you haven't filled out an application, please make sure you've
            registered into{" "}
            <a
              target="_blank"
              href="https://www.simulationsports.net/index.php"
            >
              SimSN
            </a>{" "}
            and go to the{" "}
            <a
              target="_blank"
              href="https://www.simulationsports.net/index.php?forums/job-applications-and-interviews.4/"
            >
              Job Apps Subforum
            </a>{" "}
            to fill out an application.{" "}
          </Text>
          <Text classes="text-start mb-2">
            If you're not sure where to start, please join our{" "}
            <a target="_blank" href="https://discord.gg/q46vwZ83RH">
              Discord server
            </a>{" "}
            and we shall help you there.
          </Text>
          {league === SimCFB && !selectedTeam.IsFBS && (
            <Text classes="text-start mb-2">
              FCS Teams are currently being displayed but are unavailable for
              the 2025 Season.
            </Text>
          )}
        </SelectedTeamModal>
      )}
      {data && (
        <div className="flex flex-row justify-end">
          {!disable ? (
            <Button onClick={handleOpenModal}>Request Team</Button>
          ) : (
            <LockIcon textColorClass={textColorClass} />
          )}
        </div>
      )}
    </div>
  );
};

export const SelectedCFBTeamCard = (data: any) => {
  return (
    <>
      <Border>
        <div className="flex flex-row sm:relative gap-6 justify-between">
          <div className="flex flex-col">
            <Text variant="alternate" classes="font-semibold whitespace-nowrap">
              Overall Record
            </Text>
            <Text variant="small">
              {data.OverallWins} - {data.OverallLosses}
            </Text>
          </div>
          <div className="flex flex-col absolute left-1/2 transform -translate-x-1/2">
            <Text variant="alternate" classes="font-semibold whitespace-nowrap">
              Current Record
            </Text>
            <Text variant="small">
              {data.CurrentSeasonWins} - {data.CurrentSeasonLosses}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="alternate" classes="font-semibold whitespace-nowrap">
              Bowl Record
            </Text>
            <Text variant="small">
              {data.BowlWins}-{data.BowlLosses}
            </Text>
          </div>
        </div>
      </Border>
      <BorderHidden>
        <div className="flex flex-row mb-2 justify-between items-center gap-10">
          <div className="flex flex-col">
            <Text variant="body" classes="font-semibold">
              Conference Championships
            </Text>
            <Text variant="small">
              {data.ConferenceChampionships &&
              data.ConferenceChampionships.length > 0
                ? data.ConferenceChampionships.map(
                    (x: any, i: number) =>
                      `${x}${
                        i < data.ConferenceChampionships.length - 1 ? "," : ""
                      }`
                  )
                : "None"}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="body" classes="font-semibold">
              National Championships
            </Text>
            <Text variant="small">
              {data.NationalChampionships &&
              data.NationalChampionships.length > 0
                ? data.NationalChampionships.map(
                    (x: any, i: number) =>
                      `${x}${
                        i < data.NationalChampionships.length - 1 ? "," : ""
                      }`
                  )
                : "None"}
            </Text>
          </div>
        </div>
      </BorderHidden>
      <Border>
        <div className="flex flex-row mb-2 justify-start items-center">
          <Text variant="alternate" classes="font-semibold">
            Top Players
          </Text>
        </div>
        <div className="flex flex-row sm:justify-between mb-2 gap-1 lg:gap-6">
          {data.TopPlayers.map((x: any) => (
            <div className="flex flex-col">
              <Text variant="xs">
                {x.Position} {x.FirstName} {x.LastName}
              </Text>
              <Text variant="xs">Overall: {x.OverallGrade}</Text>
            </div>
          ))}
        </div>
      </Border>
    </>
  );
};
function SelectedSimNFLTeamCard(data: any) {
  return (
    <>
      <BorderHidden>
        <div className="flex flex-row gap-6 justify-between">
          <div className="flex flex-col">
            <Text variant="body" classes="font-semibold">
              Overall Record
            </Text>
            <Text variant="small">
              {data.OverallWins} - {data.OverallLosses}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="body" classes="font-semibold">
              Current Record
            </Text>
            <Text variant="small">
              {data.CurrentSeasonWins} - {data.CurrentSeasonLosses}
            </Text>
          </div>
          {(data.BowlWins > 0 || data.BowlLosses > 0) && (
            <div className="flex flex-col">
              <Text variant="body" classes="font-semibold">
                Playoff Record
              </Text>
              <Text variant="small">
                {data.BowlWins}-{data.BowlLosses}
              </Text>
            </div>
          )}
        </div>
      </BorderHidden>
      <BorderHidden>
        <div className="flex flex-row mb-2 justify-between items-center gap-10">
          <div className="flex flex-col">
            <Text variant="body" classes="font-semibold">
              Division Titles
            </Text>
            <Text variant="small">
              {data.DivisionTitles && data.DivisionTitles.length > 0
                ? data.DivisionTitles.map(
                    (x: any, i: number) =>
                      `${x}${i < data.DivisionTitles.length - 1 ? "," : ""}`
                  )
                : "None"}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="body" classes="font-semibold">
              Conference Championships
            </Text>
            <Text variant="small">
              {data.ConferenceChampionships &&
              data.ConferenceChampionships.length > 0
                ? data.ConferenceChampionships.map(
                    (x: any, i: number) =>
                      `${x}${
                        i < data.ConferenceChampionships.length - 1 ? "," : ""
                      }`
                  )
                : "None"}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="body" classes="font-semibold">
              Super Bowls
            </Text>
            <Text variant="small">
              {data.NationalChampionships &&
              data.NationalChampionships.length > 0
                ? data.NationalChampionships.map(
                    (x: any, i: number) =>
                      `${x}${
                        i < data.NationalChampionships.length - 1 ? "," : ""
                      }`
                  )
                : "None"}
            </Text>
          </div>
        </div>
      </BorderHidden>
      <Border>
        <div className="flex flex-row mb-2 justify-start items-center">
          <Text variant="alternate" classes="font-semibold">
            Top Players
          </Text>
        </div>
        <div className="flex flex-row sm:justify-between mb-2 gap-1 lg:gap-6">
          {data.TopPlayers.map((x: any) => (
            <div className="flex flex-col">
              <Text variant="xs">
                {x.Position} {x.FirstName} {x.LastName}
              </Text>
              <Text variant="xs">Overall: {x.Overall}</Text>
            </div>
          ))}
        </div>
      </Border>
    </>
  );
}

function SelectedSimCBBTeamCard(data: any) {
  const postSeasonSuccess =
    data &&
    data.ConferenceChampionships &&
    (data.ConferenceChampionships.length > 0 ||
      data.SweetSixteens.length > 0 ||
      data.EliteEights.length > 0 ||
      data.FinalFours.length > 0 ||
      data.RunnerUps.length > 0 ||
      data.NationalChampionships.length > 0);
  return (
    <>
      <BorderHidden>
        <div className="flex flex-row gap-6 justify-between">
          <div className="flex flex-col">
            <Text variant="body" classes="font-semibold">
              Overall Record
            </Text>
            <Text variant="small">
              {data.OverallWins} - {data.OverallLosses}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="body" classes="font-semibold">
              Current Record
            </Text>
            <Text variant="small">
              {data.CurrentSeasonWins} - {data.CurrentSeasonLosses}
            </Text>
          </div>
          {(data.PlayoffWins > 0 || data.PlayoffLosses > 0) && (
            <div className="flex flex-col">
              <Text variant="body" classes="font-semibold">
                Playoff Record
              </Text>
              <Text variant="small">
                {data.PlayoffWins}-{data.PlayoffLosses}
              </Text>
            </div>
          )}
          {(data.NITWins > 0 || data.NITLosses > 0) && (
            <div className="flex flex-col">
              <Text variant="body" classes="font-semibold">
                NIT Record
              </Text>
              <Text variant="small">
                {data.NITWins}-{data.NITLosses}
              </Text>
            </div>
          )}
          {(data.CBIWins > 0 || data.CBILosses > 0) && (
            <div className="flex flex-col">
              <Text variant="body" classes="font-semibold">
                NIT Record
              </Text>
              <Text variant="small">
                {data.CBIWins}-{data.CBILosses}
              </Text>
            </div>
          )}
        </div>
      </BorderHidden>

      {postSeasonSuccess && (
        <BorderHidden>
          <div className="flex flex-row mb-2 justify-between items-center gap-10">
            {data.ConferenceChampionships &&
              data.ConferenceChampionships.length > 0 && (
                <div className="flex flex-col">
                  <Text variant="body" classes="font-semibold">
                    Conference Championships
                  </Text>
                  <Text variant="small">
                    {data.ConferenceChampionships.map(
                      (x: any, i: number) =>
                        `${x}${
                          i < data.ConferenceChampionships.length - 1
                            ? ", "
                            : ""
                        }`
                    )}
                  </Text>
                </div>
              )}
            {data.SweetSixteens && data.SweetSixteens.length > 0 && (
              <div className="flex flex-col">
                <Text variant="body" classes="font-semibold">
                  Sweet 16s
                </Text>
                <Text variant="small">
                  {data.SweetSixteens.map(
                    (x: any, i: number) =>
                      `${x}${i < data.SweetSixteens.length - 1 ? ", " : ""}`
                  )}
                </Text>
              </div>
            )}
            {data.EliteEights && data.EliteEights.length > 0 && (
              <div className="flex flex-col">
                <Text variant="body" classes="font-semibold">
                  Elite 8s
                </Text>
                <Text variant="small">
                  {data.EliteEights.map(
                    (x: any, i: number) =>
                      `${x}${i < data.EliteEights.length - 1 ? ", " : ""}`
                  )}
                </Text>
              </div>
            )}
            {data.FinalFours && data.FinalFours.length > 0 && (
              <div className="flex flex-col">
                <Text variant="body" classes="font-semibold">
                  Final Fours
                </Text>
                <Text variant="small">
                  {data.FinalFours.map(
                    (x: any, i: number) =>
                      `${x}${i < data.FinalFours.length - 1 ? ", " : ""}`
                  )}
                </Text>
              </div>
            )}
            {data.RunnerUps && data.RunnerUps.length > 0 && (
              <div className="flex flex-col">
                <Text variant="body" classes="font-semibold">
                  National Title Runner Ups
                </Text>
                <Text variant="small">
                  {data.RunnerUps.map(
                    (x: any, i: number) =>
                      `${x}${i < data.RunnerUps.length - 1 ? ", " : ""}`
                  )}
                </Text>
              </div>
            )}
            {data.NationalChampionships &&
              data.NationalChampionships.length > 0 && (
                <div className="flex flex-col">
                  <Text variant="body" classes="font-semibold">
                    National Championships
                  </Text>
                  <Text variant="small">
                    {data.NationalChampionships.map(
                      (x: any, i: number) =>
                        `${x}${
                          i < data.NationalChampionships.length - 1 ? ", " : ""
                        }`
                    )}
                  </Text>
                </div>
              )}
          </div>
        </BorderHidden>
      )}
      {!postSeasonSuccess && (
        <BorderHidden>
          <div className="flex flex-row mb-2 justify-between items-center gap-10">
            <div className="flex flex-col">
              <Text variant="body" classes="font-semibold">
                No Postseason Success
              </Text>
            </div>
          </div>
        </BorderHidden>
      )}
      <Border>
        <div className="flex flex-row mb-2 justify-start items-center">
          <Text variant="alternate" classes="font-semibold">
            Top Players
          </Text>
        </div>
        <div className="flex flex-row sm:justify-between mb-2 gap-1 lg:gap-6">
          {data.TopPlayers.map((x: any) => (
            <div className="flex flex-col">
              <Text variant="xs">
                {x.Position} {x.FirstName} {x.LastName}
              </Text>
              <Text variant="xs">Overall: {x.OverallGrade}</Text>
            </div>
          ))}
        </div>
      </Border>
    </>
  );
}

export const SelectedSimNBATeamCard = (data: any) => {
  return (
    <>
      <BorderHidden>
        <div className="flex flex-row gap-6 justify-between">
          <div className="flex flex-col">
            <Text variant="h5">Overall Record</Text>
            <Text variant="small">
              {data.OverallWins} - {data.OverallLosses}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="alternate" classes="font-semibold whitespace-nowrap">
              Current Record
            </Text>
            <Text variant="small">
              {data.CurrentSeasonWins} - {data.CurrentSeasonLosses}
            </Text>
          </div>
          {(data.PlayoffWins > 0 || data.PlayoffLosses > 0) && (
            <div className="flex flex-col">
              <Text
                variant="alternate"
                classes="font-semibold whitespace-nowrap"
              >
                Playoff Record
              </Text>
              <Text variant="small">
                {data.PlayoffWins}-{data.PlayoffLosses}
              </Text>
            </div>
          )}
        </div>
      </BorderHidden>
      <BorderHidden>
        <div className="flex flex-row mb-2 justify-between items-center gap-10">
          <div className="flex flex-col">
            <Text variant="alternate" classes="font-semibold whitespace-nowrap">
              Conference Championships
            </Text>
            <Text variant="small">
              {data.ConferenceChampionships &&
              data.ConferenceChampionships.length > 0
                ? data.ConferenceChampionships.map(
                    (x: any, i: number) =>
                      `${x}${
                        i < data.ConferenceChampionships.length - 1 ? "," : ""
                      }`
                  )
                : "None"}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="alternate" classes="font-semibold whitespace-nowrap">
              Finals Championships
            </Text>
            <Text variant="small">
              {data.NationalChampionships &&
              data.NationalChampionships.length > 0
                ? data.NationalChampionships.map(
                    (x: any, i: number) =>
                      `${x}${
                        i < data.NationalChampionships.length - 1 ? "," : ""
                      }`
                  )
                : "None"}
            </Text>
          </div>
        </div>
      </BorderHidden>
      <BorderHidden>
        <div className="flex flex-row mb-2 justify-start items-center">
          <Text variant="alternate" classes="font-semibold whitespace-nowrap">
            Top Players
          </Text>
        </div>
        <div className="flex flex-row sm:justify-between mb-2 gap-6">
          {data.TopPlayers.map((x: any) => (
            <div className="flex flex-col">
              <Text variant="small">
                {x.Position} {x.FirstName} {x.LastName}
              </Text>
              <Text>Overall: {x.Overall}</Text>
            </div>
          ))}
        </div>
      </BorderHidden>
    </>
  );
};

export const SelectedSimCHLTeamCard = (data: any) => {
  return (
    <>
      <BorderHidden>
        <div className="flex flex-row sm:relative gap-6 justify-between">
          <div className="flex flex-col">
            <Text variant="alternate" classes="font-semibold whitespace-nowrap">
              Overall Record
            </Text>
            <Text variant="small">
              {data.OverallWins} - {data.OverallLosses}
            </Text>
          </div>
          <div className="flex flex-col absolute left-1/2 transform -translate-x-1/2">
            <Text variant="alternate" classes="font-semibold whitespace-nowrap">
              Current Record
            </Text>
            <Text variant="small">
              {data.CurrentSeasonWins} - {data.CurrentSeasonLosses}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="alternate" classes="font-semibold whitespace-nowrap">
              Postseason Record
            </Text>
            <Text variant="small">
              {data.PostSeasonWins}-{data.PostSeasonLosses}
            </Text>
          </div>
        </div>
      </BorderHidden>
      <BorderHidden>
        <div className="flex flex-row mb-2 justify-between items-center gap-10">
          <div className="flex flex-col">
            <Text variant="alternate" classes="font-semibold whitespace-nowrap">
              Conference Championships
            </Text>
            <Text variant="small">
              {data.ConferenceChampionships &&
              data.ConferenceChampionships.length > 0
                ? data.ConferenceChampionships.map(
                    (x: any, i: number) =>
                      `${x}${
                        i < data.ConferenceChampionships.length - 1 ? "," : ""
                      }`
                  )
                : "None"}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="alternate" classes="font-semibold whitespace-nowrap">
              National Championships
            </Text>
            <Text variant="small">
              {data.NationalChampionships &&
              data.NationalChampionships.length > 0
                ? data.NationalChampionships.map(
                    (x: any, i: number) =>
                      `${x}${
                        i < data.NationalChampionships.length - 1 ? "," : ""
                      }`
                  )
                : "None"}
            </Text>
          </div>
        </div>
      </BorderHidden>
      <BorderHidden>
        <div className="flex flex-row mb-2 justify-start items-center">
          <Text variant="alternate" classes="font-semibold whitespace-nowrap">
            Top Players
          </Text>
        </div>
        <div className="flex flex-row sm:justify-between mb-2 gap-6">
          {data.TopPlayers.map((x: any) => (
            <div className="flex flex-col">
              <Text variant="small">
                {x.Position} {x.FirstName} {x.LastName}
              </Text>
              <Text>Overall: {x.OverallGrade}</Text>
            </div>
          ))}
        </div>
      </BorderHidden>
    </>
  );
};

export const SelectedSimPHLTeamCard = (data: any) => {
  return (
    <>
      <BorderHidden>
        <div className="flex flex-row gap-6 justify-between">
          <div className="flex flex-col">
            <Text variant="alternate" classes="font-semibold whitespace-nowrap">
              Overall Record
            </Text>
            <Text variant="small">
              {data.OverallWins} - {data.OverallLosses}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="alternate" classes="font-semibold whitespace-nowrap">
              Current Record
            </Text>
            <Text variant="small">
              {data.CurrentSeasonWins} - {data.CurrentSeasonLosses}
            </Text>
          </div>
          {(data.PostSeasonWins > 0 || data.PostSeasonLosses > 0) && (
            <div className="flex flex-col">
              <Text
                variant="alternate"
                classes="font-semibold whitespace-nowrap"
              >
                Postseason Record
              </Text>
              <Text variant="small">
                {data.PostSeasonWins}-{data.PostSeasonLosses}
              </Text>
            </div>
          )}
        </div>
      </BorderHidden>
      <BorderHidden>
        <div className="flex flex-row mb-2 justify-between items-center gap-10">
          <div className="flex flex-col">
            <Text variant="alternate" classes="font-semibold whitespace-nowrap">
              Conference Championships
            </Text>
            <Text variant="small">
              {data.ConferenceChampionships &&
              data.ConferenceChampionships.length > 0
                ? data.ConferenceChampionships.map(
                    (x: any, i: number) =>
                      `${x}${
                        i < data.ConferenceChampionships.length - 1 ? "," : ""
                      }`
                  )
                : "None"}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="alternate" classes="font-semibold whitespace-nowrap">
              Stanley Cups
            </Text>
            <Text variant="small">
              {data.NationalChampionships &&
              data.NationalChampionships.length > 0
                ? data.NationalChampionships.map(
                    (x: any, i: number) =>
                      `${x}${
                        i < data.NationalChampionships.length - 1 ? "," : ""
                      }`
                  )
                : "None"}
            </Text>
          </div>
        </div>
      </BorderHidden>
      <BorderHidden>
        <div className="flex flex-row mb-2 justify-start items-center">
          <Text variant="alternate" classes="font-semibold whitespace-nowrap">
            Top Players
          </Text>
        </div>
        <div className="flex flex-row sm:justify-between mb-2 gap-6">
          {data.TopPlayers.map((x: any) => (
            <div className="flex flex-col">
              <Text variant="small">
                {x.Position} {x.FirstName} {x.LastName}
              </Text>
              <Text>Overall: {x.Overall}</Text>
            </div>
          ))}
        </div>
      </BorderHidden>
    </>
  );
};
