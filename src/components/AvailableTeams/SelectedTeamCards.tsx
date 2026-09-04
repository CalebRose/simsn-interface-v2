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
import { useAuthStore } from "../../context/AuthContext";
import { useCallback, useMemo, useState } from "react";

// ✅ Types
interface SelectedTeamCardProps {
  league: string;
  selectedTeam?: any;
  retro: boolean | undefined;
  data: any;
  sentRequest?: boolean;
  sendRequest?: (dto: any) => void;
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
        <div className="h-31.25 flex flex-col">
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
  const { currentUser } = useAuthStore();

  const userName = useMemo(() => {
    return currentUser?.username || "";
  }, [currentUser]);

  const [discordUsername, setDiscordUsername] = useState("");
  const [howMuchTimeAnswer, setHowMuchTimeAnswer] = useState("");
  const [howDidYouHearAboutSimSN, setHowDidYouHearAboutSimSN] = useState("");
  const [communityReference, setCommunityReference] = useState("");
  const [aboutYourself, setAboutYourself] = useState("");

  const isBaseball = league === SimMLB || league === SimCollegeBaseball;
  const primaryBaseballTeam = isBaseball
    ? getPrimaryBaseballTeam(selectedTeam)
    : undefined;
  const teamID = isBaseball
    ? (primaryBaseballTeam?.team_id ?? selectedTeam?.id)
    : selectedTeam?.ID;
  const logo = getLogo(league as League, teamID, retro);
  const disable = isTeamDisabled(selectedTeam, league);
  const colorOne = isBaseball
    ? primaryBaseballTeam?.color_one || ""
    : selectedTeam.ColorOne || "";
  const colorTwo = isBaseball
    ? primaryBaseballTeam?.color_two || ""
    : selectedTeam.ColorTwo || "";
  const colorThree = isBaseball
    ? primaryBaseballTeam?.color_three || ""
    : selectedTeam.ColorThree || "";
  const teamColors = useTeamColors(colorOne, colorTwo, colorThree);
  const backgroundColor = !disable ? teamColors.One : "#4B5563";
  const borderColor = !disable ? teamColors.Two : "#4B5563";
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const teamLabel =
    selectedTeam && GetTeamLabel(league as League, selectedTeam);
  const conferenceLabel = isBaseball
    ? primaryBaseballTeam?.conference || ""
    : selectedTeam.Conference || "";

  // All three required fields must be non-empty before submission is allowed
  const canSubmit = useMemo(
    () =>
      howMuchTimeAnswer.trim().length > 0 &&
      howDidYouHearAboutSimSN.trim().length > 0 &&
      aboutYourself.trim().length > 0,
    [howMuchTimeAnswer, howDidYouHearAboutSimSN, aboutYourself],
  );

  const handleClick = useCallback(
    (role: string) => {
      if (sendRequest) {
        const dto = {
          league,
          team: selectedTeam,
          role: role || "o",
          userName,
          discordUsername,
          howMuchTimeAnswer,
          howDidYouHearAboutSimSN,
          communityReference,
          aboutYourself,
        };
        sendRequest(dto);
      }
      handleCloseModal();
    },
    [
      sendRequest,
      league,
      selectedTeam,
      userName,
      discordUsername,
      howMuchTimeAnswer,
      howDidYouHearAboutSimSN,
      communityReference,
      aboutYourself,
    ],
  );

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
              classes="h-32 w-32"
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
                  {conferenceLabel}
                  {conferenceLabel ? " Conference" : ""}
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
          {league === SimPHL && (
            <div className="flex-col self-start md:self-auto mx-2 ml-4">
              <div className="flex-row text-start">
                <div className="flex-col">
                  <Text variant="small" classes="font-semibold text-start">
                    Owner:{" "}
                    {selectedTeam.Owner?.length > 0
                      ? selectedTeam.Owner
                      : "None"}
                  </Text>
                </div>
                <div className="flex-col">
                  <Text variant="small" classes="font-semibold text-start">
                    GM: {selectedTeam.GM?.length > 0 ? selectedTeam.GM : "None"}
                  </Text>
                </div>

                <div className="flex-col">
                  <Text variant="small" classes="font-semibold text-start">
                    Coach:{" "}
                    {selectedTeam.Coach?.length > 0
                      ? selectedTeam.Coach
                      : "None"}
                  </Text>
                </div>
                <div className="flex-col">
                  <Text variant="small" classes="font-semibold text-start">
                    Scout:{" "}
                    {selectedTeam.Assistant?.length > 0
                      ? selectedTeam.Assistant
                      : "None"}
                  </Text>
                </div>
                <div className="flex-col">
                  <Text variant="small" classes="font-semibold text-start">
                    Marketing:{" "}
                    {selectedTeam.Marketing?.length > 0
                      ? selectedTeam.Marketing
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
                <Button onClick={() => handleClick("")} disabled={!canSubmit}>
                  Confirm
                </Button>
              )}
              {league === SimNFL && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleClick("o")}
                    disabled={
                      (selectedTeam.NFLOwnerName?.length ?? 0) > 0 || !canSubmit
                    }
                  >
                    <Text variant="small">Request Ownership</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleClick("hc")}
                    disabled={
                      (selectedTeam.NFLCoachName?.length ?? 0) > 0 || !canSubmit
                    }
                  >
                    <Text variant="small">Request Coach</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleClick("gm")}
                    disabled={
                      (selectedTeam.NFLGMName?.length ?? 0) > 0 || !canSubmit
                    }
                  >
                    <Text variant="small">Request GM</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleClick("a")}
                    disabled={
                      (selectedTeam.NFLAssistantName?.length ?? 0) > 0 ||
                      !canSubmit
                    }
                  >
                    Request Assistant
                  </Button>
                </>
              )}
              {league === SimNBA && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleClick("o")}
                    disabled={
                      (selectedTeam.NBAOwnerName?.length ?? 0) > 0 || !canSubmit
                    }
                  >
                    Request Ownership
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleClick("hc")}
                    disabled={
                      (selectedTeam.NBACoachName?.length ?? 0) > 0 || !canSubmit
                    }
                  >
                    Request Coach
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleClick("gm")}
                    disabled={
                      (selectedTeam.NBAGMName?.length ?? 0) > 0 || !canSubmit
                    }
                  >
                    Request GM
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleClick("a")}
                    disabled={
                      (selectedTeam.NBAAssistantName?.length ?? 0) > 0 ||
                      !canSubmit
                    }
                  >
                    Request Assistant
                  </Button>
                </>
              )}
              {league === SimPHL && (
                <ButtonGroup>
                  <Button
                    size="sm"
                    onClick={() => handleClick("o")}
                    disabled={
                      (selectedTeam.Owner?.length ?? 0) > 0 || !canSubmit
                    }
                  >
                    <Text variant="small">Ownership</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleClick("hc")}
                    disabled={
                      (selectedTeam.Coach?.length ?? 0) > 0 || !canSubmit
                    }
                  >
                    <Text variant="small">Coach</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleClick("gm")}
                    disabled={(selectedTeam.GM?.length ?? 0) > 0 || !canSubmit}
                  >
                    <Text variant="small">GM</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleClick("a")}
                    disabled={
                      (selectedTeam.Scout?.length ?? 0) > 0 || !canSubmit
                    }
                  >
                    <Text variant="small">Assistant</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleClick("m")}
                    disabled={
                      (selectedTeam.Marketing?.length ?? 0) > 0 || !canSubmit
                    }
                  >
                    <Text variant="small">Marketing</Text>
                  </Button>
                </ButtonGroup>
              )}
              {league === SimMLB && (
                <ButtonGroup>
                  <Button
                    size="sm"
                    onClick={() => handleClick("o")}
                    disabled={
                      (selectedTeam.owner_name?.length ?? 0) > 0 || !canSubmit
                    }
                  >
                    <Text variant="small">Ownership</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleClick("mgr")}
                    disabled={
                      (selectedTeam.manager_name?.length ?? 0) > 0 || !canSubmit
                    }
                  >
                    <Text variant="small">Manager</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleClick("gm")}
                    disabled={
                      (selectedTeam.gm_name?.length ?? 0) > 0 || !canSubmit
                    }
                  >
                    <Text variant="small">GM</Text>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleClick("sc")}
                    disabled={
                      (selectedTeam.scout_name?.length ?? 0) > 0 || !canSubmit
                    }
                  >
                    <Text variant="small">Scout</Text>
                  </Button>
                </ButtonGroup>
              )}
            </>
          }
        >
          {currentUser?.teamId === 0 &&
            currentUser.NFLTeamID === 0 &&
            currentUser.CHLTeamID === 0 &&
            currentUser.PHLTeamID === 0 &&
            currentUser.cbb_id === 0 &&
            currentUser.NBATeamID === 0 &&
            (league === SimNFL || league === SimNBA || league === SimPHL) && (
              <>
                <Text variant="small" classes="mb-1 text-start text-yellow-500">
                  Hey! So it looks like you're a brand new user requesting to
                  join one of our pro teams. That's awesome. These leagues are
                  often highly competitive and require a significant amount of
                  teamwork and communication. Our pro leagues are designed to
                  allow multiple users to manage a single team simultaneously in
                  a team effort.
                </Text>
                <Text variant="small" classes="mb-1 text-start text-yellow-500">
                  If this sounds exciting to you, then please continue filling
                  out the application form below. It is also suggested that you
                  get in communication with the owner of the team you're
                  applying for either through our Discord server or using the
                  DM/Inbox system.
                </Text>
                <Text variant="small" classes="mb-4 text-start text-yellow-500">
                  Additionally, it is{" "}
                  <span className="font-semibold italic">
                    highly encouraged
                  </span>{" "}
                  to apply for a college team as well. These are single-user
                  managed, use the same gameplay strategies as the
                  pro-counter-part, and can give you experience that will
                  benefit your time in the pro leagues and across the site.
                </Text>
              </>
            )}
          <Text variant="xs" classes="mb-4 text-start">
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
          {/* ── Application form ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 mb-4 px-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Fields marked{" "}
              <span className="text-red-400 font-semibold">*</span> are required
              before you can submit your request.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discord username. This is completely optional, though we do have
                a Discord server where a lot of the community also interacts.
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                placeholder="e.g. yourname or yourname#0000"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                How much time can you dedicate to your team each week?{" "}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={howMuchTimeAnswer}
                onChange={(e) => setHowMuchTimeAnswer(e.target.value)}
                placeholder="e.g. A few hours per week"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                How did you find out about SimSN?{" "}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={howDidYouHearAboutSimSN}
                onChange={(e) => setHowDidYouHearAboutSimSN(e.target.value)}
                placeholder="e.g. Reddit, a friend, YouTube…"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Do you know anyone in the SimSN community?{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={communityReference}
                onChange={(e) => setCommunityReference(e.target.value)}
                placeholder="List any SimSN usernames"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tell us a bit about yourself{" "}
                <span className="text-red-400">*</span>
              </label>
              <textarea
                value={aboutYourself}
                onChange={(e) => setAboutYourself(e.target.value)}
                placeholder="A short introduction — what you're hoping to get out of SimSN, your sim sports background, etc."
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
          <Text classes="text-start text-sm text-gray-500 dark:text-gray-400">
            If you have questions before applying, visit our{" "}
            <a
              target="_blank"
              href="https://simulationsports.net/forums/welcome/intro-help"
              className="underline hover:text-blue-500"
            >
              Intro / Help subforum
            </a>{" "}
            — we're happy to help get you started.
          </Text>
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
                      }`,
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
                      }`,
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
                      `${x}${i < data.DivisionTitles.length - 1 ? "," : ""}`,
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
                      }`,
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
                      }`,
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
                        }`,
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
                      `${x}${i < data.SweetSixteens.length - 1 ? ", " : ""}`,
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
                      `${x}${i < data.EliteEights.length - 1 ? ", " : ""}`,
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
                      `${x}${i < data.FinalFours.length - 1 ? ", " : ""}`,
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
                      `${x}${i < data.RunnerUps.length - 1 ? ", " : ""}`,
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
                        }`,
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
                      }`,
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
                      }`,
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
        <div className="grid grid-cols-5 mb-2 justify-between items-center gap-10">
          <div className="flex flex-col">
            <Text variant="xs" classes="font-semibold whitespace-nowrap">
              Conference Championships
            </Text>
            <Text variant="xs">
              {data.ConferenceChampionships &&
              data.ConferenceChampionships.length > 0
                ? data.ConferenceChampionships.map(
                    (x: any, i: number) =>
                      `${x}${
                        i < data.ConferenceChampionships.length - 1 ? ", " : ""
                      }`,
                  )
                : "None"}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="xs" classes="font-semibold whitespace-nowrap">
              Playoffs
            </Text>
            <Text variant="xs">
              {data.Playoffs && data.Playoffs.length > 0
                ? data.Playoffs.map(
                    (x: any, i: number) =>
                      `${x}${i < data.Playoffs.length - 1 ? ", " : ""}`,
                  )
                : "None"}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="xs" classes="font-semibold whitespace-nowrap">
              Frozen Fours
            </Text>
            <Text variant="xs">
              {data.FrozenFours && data.FrozenFours.length > 0
                ? data.FrozenFours.map(
                    (x: any, i: number) =>
                      `${x}${i < data.FrozenFours.length - 1 ? ", " : ""}`,
                  )
                : "None"}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="xs" classes="font-semibold whitespace-nowrap">
              National Runner-Ups
            </Text>
            <Text variant="xs">
              {data.RunnerUps && data.RunnerUps.length > 0
                ? data.RunnerUps.map(
                    (x: any, i: number) =>
                      `${x}${i < data.RunnerUps.length - 1 ? ", " : ""}`,
                  )
                : "None"}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text variant="xs" classes="font-semibold whitespace-nowrap">
              National Championships
            </Text>
            <Text variant="xs">
              {data.NationalChampionships &&
              data.NationalChampionships.length > 0
                ? data.NationalChampionships.map(
                    (x: any, i: number) =>
                      `${x}${
                        i < data.NationalChampionships.length - 1 ? ", " : ""
                      }`,
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
                      }`,
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
                      }`,
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
