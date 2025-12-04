import { FC } from "react";
import { Border } from "../../_design/Borders";
import { Text } from "../../_design/Typography";
import {
  League,
  SimCFB,
  SimNFL,
  SimCHL,
  SimPHL,
  MAX_TEAM_INFO_COLUMNS,
  MAX_TEAM_PHL_INFO_COLUMNS,
  SimNBA,
} from "../../_constants/constants";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { darkenColor } from "../../_utility/getDarkerColor";
import { getLogo } from "../../_utility/getLogo";
import { Logo } from "../../_design/Logo";
import { useResponsive } from "../../_hooks/useMobile";
import { Button } from "../../_design/Buttons";
import { Bell, ChatBubble, CheckCircle } from "../../_design/Icons";

interface TeamInfoProps {
  id?: number;
  TeamName?: string;
  Team?: any;
  Owner?: string;
  Coach?: string;
  GM?: string;
  Scout?: string;
  Marketing?: string;
  Conference?: string;
  Division?: string;
  Roster?: any;
  TeamProfile?: any;
  Arena?: string;
  Capacity?: number;
  isPro: boolean;
  Capsheet?: any;
  League: League;
  ts: any;
  backgroundColor?: string;
  headerColor?: string;
  borderColor?: string;
  isRetro?: boolean;
  isUserTeam?: boolean;
  openTradeModal?: () => void;
  openProposeTradeModal?: () => void;
  draftPickCount?: number;
}

export const TeamInfo: FC<TeamInfoProps> = ({
  isPro,
  id,
  TeamName = "",
  Team,
  isUserTeam,
  Owner = "None",
  Coach = "None",
  GM = "None",
  Scout = "None",
  Marketing = "None",
  TeamProfile,
  Division,
  Conference = "",
  Arena = "",
  Capacity = 0,
  Capsheet = "",
  League,
  Roster,
  ts,
  backgroundColor,
  headerColor,
  borderColor,
  isRetro = false,
  openTradeModal,
  openProposeTradeModal,
  draftPickCount = 0,
}) => {
  const sectionBg = darkenColor("#1f2937", -5);
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const logo = getLogo(League, id!!, isRetro);
  const { isMobile } = useResponsive();
  return (
    <Border
      direction="row"
      classes="w-full p-4 justify-around gap-x-4"
      styles={{
        backgroundColor,
        borderColor: headerColor,
      }}
    >
      <div className="w-full grid grid-cols-1 min-[769px]:grid-cols-2 min-[1025px]:grid-cols-4 lg:gap-y-0 md:gap-y-4 gap-x-4">
        <div className="flex flex-row justify-center items-center p-2 pt-6 gap-x-4">
          <div
            className="max-w-[10rem] 5xl:max-w-[12rem] h-[7.5rem] items-center justify-center rounded-lg border-2"
            style={{ backgroundColor: sectionBg, borderColor: headerColor }}
          >
            <Logo
              url={logo}
              variant="large"
              containerClass="p-4 items-center justify-center h-full"
            />
          </div>
          <div className="flex flex-col justify-center pb-2">
            <Text variant="h5" classes={`${textColorClass}`}>
              {TeamName}
            </Text>
            <Text variant="small" classes={`${textColorClass} mb-2`}>
              {Conference} Conference
            </Text>
            {Division && Division.length > 0 && (
              <Text variant="xs" classes={`${textColorClass}`}>
                {Division}
              </Text>
            )}
            <TeamGrades
              Team={Team}
              backgroundColor={sectionBg}
              gradeColor={backgroundColor}
              borderColor={headerColor}
            />
          </div>
        </div>
        {!isMobile && (
          <div className="flex flex-col gap-2 justify-center items-center gap-x-2">
            <FrontOfficeInfo
              owner={Owner}
              gm={GM}
              coach={Coach}
              scout={Scout}
              isPro={isPro}
              marketing={Marketing}
              borderColor={headerColor}
              backgroundColor={sectionBg}
              lineColor={borderColor}
            />
          </div>
        )}
        {!isMobile && (
          <div
            className="flex flex-col justify-start items-start px-4 py-6 rounded-lg border-2"
            style={{ borderColor: headerColor, backgroundColor: sectionBg }}
          >
            <AdditionalTeamInfo
              league={League}
              arena={Arena}
              roster={Roster}
              capacity={Capacity}
              textColorClass={textColorClass}
              borderColor={headerColor}
              backgroundColor={backgroundColor}
              isPro={isPro}
              isUserTeam={isUserTeam}
              openTradeModal={openTradeModal}
              openProposeTradeModal={openProposeTradeModal}
              draftPickCount={draftPickCount}
              teamProfile={TeamProfile}
              lineColor={borderColor}
            />
          </div>
        )}
        {!isMobile && (
          <div className="flex flex-col items-center justify-center gap-x-2">
            {isPro && (
              <CapsheetInfo
                capsheet={Capsheet}
                ts={ts}
                league={League}
                borderColor={headerColor}
                backgroundColor={sectionBg}
              />
            )}
            {!isPro && (
              <TeamBreakdown
                TeamProfile={TeamProfile}
                ts={ts}
                league={League}
                backgroundColor={sectionBg}
                borderColor={headerColor}
                lineColor={borderColor}
              />
            )}
          </div>
        )}
      </div>
    </Border>
  );
};

interface TeamDropdownSectionProps {
  teamOptions: { label: string; value: string }[];
  selectTeamOption: () => void;
  export: () => Promise<void>;
}

export const TeamDropdownSection: FC<TeamDropdownSectionProps> = ({}) => {
  return <></>;
};

export const CapsheetInfo = ({
  capsheet,
  ts,
  league,
  backgroundColor,
  borderColor,
  textColorClass,
}: any) => {
  const isNFL = league === SimNFL;
  const rows = [1, 2, 3, 4, 5].map((yearOffset) => {
    const year = ts.Season + (yearOffset - 1);
    const salaryKey = `Y${yearOffset}Salary`;
    const bonusKey = `Y${yearOffset}Bonus`;
    const deadCapKey = `Y${yearOffset}CapHit`;
    const capspaceKey = `Y${yearOffset}Capspace`;
    const salary = capsheet[salaryKey] || 0;
    const bonus = isNFL ? capsheet[bonusKey] || 0 : 0;
    const deadCap = capsheet[deadCapKey] || 0;
    const capSpace = ts[capspaceKey] || 0;
    const space = capSpace - salary - bonus - deadCap;
    return { year, salary, bonus, space };
  });

  return (
    <div
      className="flex w-full h-[100%] border-2 rounded-lg py-5 flex-row"
      style={{ borderColor, backgroundColor }}
    >
      {capsheet && (
        <div className="table-fixed w-full">
          <div className="table-header-group w-full">
            <div className="table-row">
              <div className="table-cell w-[9em] font-semibold">
                <Text variant="body-small" classes={`${textColorClass}`}>
                  Year
                </Text>
              </div>
              {isNFL && (
                <div className="table-cell w-[9em] font-semibold">
                  <Text variant="body-small" classes={`${textColorClass}`}>
                    Bonus
                  </Text>
                </div>
              )}
              <div className="table-cell w-[9em] font-semibold">
                <Text variant="body-small" classes={`${textColorClass}`}>
                  Salary
                </Text>
              </div>
              <div className="table-cell w-[9em] font-semibold">
                <Text variant="body-small" classes={`${textColorClass}`}>
                  Space
                </Text>
              </div>
            </div>
          </div>
          <div className="table-row-group">
            {rows.map(({ year, salary, bonus, space }) => (
              <div key={year} className="table-row">
                <div className="table-cell">
                  <Text variant="xs" classes={`${textColorClass}`}>
                    {year}
                  </Text>
                </div>
                {isNFL && (
                  <div className="table-cell">
                    <Text variant="xs" classes={`${textColorClass}`}>
                      {bonus.toFixed(2)}
                    </Text>
                  </div>
                )}
                <div className="table-cell">
                  <Text variant="xs" classes={`${textColorClass}`}>
                    {salary.toFixed(2)}
                  </Text>
                </div>
                <div className="table-cell">
                  <Text variant="xs" classes={`${textColorClass}`}>
                    {space.toFixed(2)}
                  </Text>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <Text variant="xs" classes={`${textColorClass} font-semibold`}>
              {`Dead Cap: ${capsheet.Y1CapHit.toFixed(2)}`}
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};

export const TeamBreakdown = ({
  TeamProfile,
  ts,
  league,
  backgroundColor,
  borderColor,
  lineColor,
  textColorClass,
}: any) => {
  const notHockey = league !== SimCHL && league !== SimPHL;
  return (
    <div
      className="flex flex-col w-full h-[100%] border-2 rounded-lg py-5"
      style={{ borderColor, backgroundColor }}
    >
      {TeamProfile && notHockey && (
        <div className="flex flex-row w-full pb-2 px-1">
          <div className="flex flex-col items-center w-full">
            <Text
              variant="body-small"
              classes={`${textColorClass} font-semibold`}
            >
              Offensive Scheme
            </Text>
            <Text variant="xs" classes={`${textColorClass}`}>
              {TeamProfile.OffensiveScheme || "N/A"}
            </Text>
          </div>
          <div className="flex flex-col items-center w-full">
            <Text
              variant="body-small"
              classes={`${textColorClass} font-semibold`}
            >
              Defensive Scheme
            </Text>
            <Text variant="xs" classes={`${textColorClass}`}>
              {TeamProfile.DefensiveScheme || "N/A"}
            </Text>
          </div>
        </div>
      )}
      {notHockey && (
        <div
          className="flex w-[90%] self-center border-t"
          style={{ borderColor: lineColor }}
        />
      )}
      {TeamProfile && ts && (
        <div
          className="flex flex-col w-full border-t border-dotted pt-1 px-1"
          style={{ borderColor }}
        >
          <Text
            variant="body-small"
            classes={`${textColorClass} font-semibold pb-1`}
          >
            Incoming Croots
          </Text>
          <div className="flex flex-row">
            <div
              className="flex flex-col items-center w-full border-r-2 pr-1"
              style={{ borderColor }}
            >
              <Text variant="xs" classes={`${textColorClass} text-small`}>
                ⭐⭐⭐
              </Text>
              <Text
                variant="xs"
                classes={`${textColorClass} font-semibold text-small`}
              >
                {TeamProfile.ThreeStars || "0"}
              </Text>
            </div>
            <div className="flex flex-col items-center px-4">
              <Text variant="xs" classes={`${textColorClass} text-small`}>
                ⭐⭐⭐⭐
              </Text>
              <Text
                variant="xs"
                classes={`${textColorClass} font-semibold text-small`}
              >
                {TeamProfile.FourStars || "0"}
              </Text>
            </div>
            <div
              className="flex flex-col items-center w-full border-l-2 pl-1"
              style={{ borderColor }}
            >
              <Text variant="xs" classes={`${textColorClass} text-small`}>
                ⭐⭐⭐⭐⭐
              </Text>
              <Text
                variant="xs"
                classes={`${textColorClass} font-semibold text-small`}
              >
                {TeamProfile.FiveStars || "0"}
              </Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const FrontOfficeInfo = ({
  backgroundColor,
  borderColor,
  textColorClass,
  lineColor,
  league,
  owner,
  coach,
  gm,
  scout,
  marketing,
  isPro,
}: any) => {
  const personnelRoles = isPro
    ? [
        { role: "Owner", value: owner },
        { role: "GM", value: gm },
        { role: "Coach", value: coach },
        { role: "Assistant", value: scout },
        ...(league === SimPHL ? [{ role: "Marketing", value: marketing }] : []),
      ].filter(({ value }) => value)
    : [{ role: "Coach", value: coach || "AI" }];

  const vacancies = isPro
    ? [
        { role: "Owner", value: owner },
        { role: "GM", value: gm },
        { role: "Coach", value: coach },
        { role: "Assistant", value: scout },
        ...(league === SimPHL ? [{ role: "Marketing", value: marketing }] : []),
      ]
        .filter(({ value }) => !value)
        .map(({ role }) => role)
        .join(", ") || "None"
    : !coach || coach === "AI"
    ? "Coach"
    : "None";

  const filledPersonnel = [...personnelRoles];
  while (
    (league !== SimPHL && filledPersonnel.length < MAX_TEAM_INFO_COLUMNS) ||
    (league === SimPHL && filledPersonnel.length < MAX_TEAM_PHL_INFO_COLUMNS)
  ) {
    filledPersonnel.push({ role: "", value: "" });
  }

  return (
    <div
      className="flex w-full h-full py-5 px-4 border-2 rounded-lg flex-row"
      style={{ borderColor, backgroundColor }}
    >
      <div className="table-fixed w-full">
        <div className="table-header-group">
          <div className="table-row">
            <div className="table-cell w-[5em] font-semibold text-left">
              <Text variant="body-small" classes={`${textColorClass}`}>
                User
              </Text>
            </div>
            {filledPersonnel.map(({ value }, idx) => (
              <div key={`user-${idx}`} className="table-cell text-left w-[6em]">
                <Text variant="xs" classes={`${textColorClass}`}>
                  {value || "-"}
                </Text>
              </div>
            ))}
          </div>
          <div className="table-row">
            <div className="table-cell font-semibold text-left">
              <Text variant="body-small" classes={`${textColorClass}`}>
                Role
              </Text>
            </div>
            {filledPersonnel.map(({ role }, idx) => (
              <div key={`role-${idx}`} className="table-cell text-left w-[6em]">
                <Text variant="xs" classes={`${textColorClass}`}>
                  {role || "-"}
                </Text>
              </div>
            ))}
          </div>
        </div>
        <div
          className="flex my-2 border-t"
          style={{ borderColor: lineColor }}
        />
        <div className="table-row-group">
          {vacancies && (
            <div
              className="table-row border-t"
              style={{ borderColor: lineColor, borderTopWidth: "2px" }}
            >
              <div className="table-cell w-[6em] text-left">
                <Text variant="xs" classes={`${textColorClass}`}>
                  Vacancies
                </Text>
              </div>
              <div className="table-cell text-left">
                <Text variant="xs" classes={`${textColorClass}`}>
                  {vacancies}
                </Text>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const RosterInfo = ({
  backgroundColor,
  borderColor,
  league,
  roster,
  isPro,
  textColorClass,
}: any) => {
  const totalPlayers = roster?.length || 0;
  const specialPlayersCount =
    roster?.filter((player: any) => {
      if (isPro) {
        if (league === SimNFL) {
          return player?.IsPracticeSquad || false;
        }
        if (league === SimPHL) {
          return player?.IsAffiliatePlayer || false;
        }
      } else {
        return player?.IsRedshirting || false;
      }
    }).length || 0;
  const activeRoster = totalPlayers - specialPlayersCount;

  return (
    <div className="flex gap-4">
      <div className="flex justify-center items-center gap-2">
        <Text variant="xs" classes={`${textColorClass} font-semibold`}>
          Active Roster:
        </Text>
        <Text variant="xs" classes={`${textColorClass}`}>
          {activeRoster}
        </Text>
      </div>
      <div className="flex items-center gap-2">
        <Text variant="xs" classes={`${textColorClass} font-semibold`}>
          {isPro
            ? league === SimNFL
              ? "Practice Squad:"
              : league === SimPHL
              ? "Reserves:"
              : "Unknown"
            : "Redshirts"}
        </Text>
        <Text variant="xs" classes={`${textColorClass}`}>
          {specialPlayersCount}
        </Text>
      </div>
    </div>
  );
};

export const AdditionalTeamInfo = ({
  backgroundColor,
  borderColor,
  arena,
  capacity,
  league,
  roster,
  isPro,
  textColorClass,
  isUserTeam = true,
  openTradeModal,
  openProposeTradeModal,
  draftPickCount,
  teamProfile,
  lineColor,
}: any) => {
  const { isMobile, isDesktop, isTablet } = useResponsive();
  const home = league === SimCFB || league === SimNFL ? "Stadium" : "Arena";
  const totalPlayers = roster?.length || 0;
  const specialPlayersCount =
    roster?.filter((player: any) => {
      if (isPro) {
        if (league === SimNFL) {
          return player?.IsPracticeSquad || false;
        }
        if (league === SimPHL) {
          return player?.IsAffiliatePlayer || false;
        }
      } else {
        return player?.IsRedshirting || false;
      }
    }).length || 0;

  const injuryReserveCount =
    roster?.filter((player: any) => {
      if (isPro) {
        if (league === SimNFL) {
          return player?.InjuryReserve || false;
        }
      } else {
        return false;
      }
    }).length || 0;

  const tradeBlockCount =
    roster?.filter((player: any) => {
      if (isPro) {
        if (league === SimNFL) {
          return player?.IsOnTradeBlock || false;
        }
        if (league === SimPHL) {
          return player?.IsOnTradeBlock || false;
        }
        if (league === SimNBA) {
          return player?.IsOnTradeBlock || false;
        }
      } else {
        return false;
      }
    }).length || 0;
  const activeRoster = totalPlayers - specialPlayersCount - injuryReserveCount;

  return (
    <>
      <div className="grid grid-cols-4 gap-x-2 space-x-4 mb-2">
        <div className="flex flex-col">
          <Text variant="small" classes={`${textColorClass} font-semibold`}>
            {`${home}`}
          </Text>
          <Text variant="xs" classes={`${textColorClass}`}>
            {arena}
          </Text>
        </div>
        <div className="flex flex-col">
          <Text variant="small" classes={`${textColorClass} font-semibold`}>
            Capacity
          </Text>
          <Text variant="xs" classes={`${textColorClass}`}>
            {capacity}
          </Text>
        </div>
        <div className="flex flex-col text-nowrap">
          <Text variant="small" classes={`${textColorClass} font-semibold`}>
            Active Roster
          </Text>
          <Text variant="xs" classes={`${textColorClass}`}>
            {activeRoster}
          </Text>
        </div>
        <div className="flex flex-col">
          <Text variant="small" classes={`${textColorClass} font-semibold`}>
            {isPro
              ? league === SimNFL
                ? "Practice Squad"
                : league === SimPHL
                ? "Reserves"
                : "Unknown"
              : "Redshirts"}
          </Text>
          <Text variant="xs" classes={`${textColorClass}`}>
            {specialPlayersCount}
          </Text>
        </div>
      </div>
      {league === SimCFB && teamProfile && (
        <div className="flex flex-col w-full">
          <div
            className="flex my-1 border-t"
            style={{ borderColor: lineColor }}
          />
          <TeamAffinities
            teamProfile={teamProfile}
            textColorClass={textColorClass}
          />
        </div>
      )}
      {isPro && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-2 space-x-4">
          <div className="flex flex-col text-nowrap">
            <Text
              variant="small"
              classes={`${textColorClass} font-semibold text-left`}
            >
              Tradeable Players
            </Text>
            <Text variant="xs" classes={`${textColorClass}`}>
              {tradeBlockCount}
            </Text>
          </div>
          <div className="flex flex-col text-nowrap">
            <Text variant="small" classes={`${textColorClass} font-semibold`}>
              Draft Picks
            </Text>
            <Text variant="xs" classes={`${textColorClass}`}>
              {draftPickCount}
            </Text>
          </div>
          <div className="flex flex-col items-center text-nowrap">
            <Text variant="small" classes={`${textColorClass} font-semibold`}>
              Manage Trades
            </Text>
            <Button size="sm" disabled={!isUserTeam} onClick={openTradeModal}>
              <Bell />
            </Button>
          </div>
          <div className="flex flex-col items-center text-nowrap">
            <Text variant="small" classes={`${textColorClass} font-semibold`}>
              Propose Trade
            </Text>
            <Button
              size="sm"
              classes="text-center justify-center"
              disabled={isUserTeam}
              onClick={openProposeTradeModal}
            >
              <ChatBubble />
            </Button>
          </div>
          <div className="flex flex-col"></div>
        </div>
      )}
    </>
  );
};

export const TeamGrades = ({
  backgroundColor,
  gradeColor,
  borderColor,
  league,
  Team,
}: any) => {
  return (
    <div
      className="flex items-center w-full justify-center gap-5 p-2 mx-2 sm:p-0 sm:pt-1 flex-shrink-1 rounded-lg border-2"
      style={{ backgroundColor, borderColor }}
    >
      {Team && (
        <div className="flex flex-col py-1 items-center">
          <div
            className={`flex items-center justify-center 
                          size-6 md:size-8 rounded-full border-2`}
            style={{ borderColor, backgroundColor: gradeColor }}
          >
            <Text variant="xs" classes={`font-semibold text-center`}>
              {Team.OverallGrade ? Team.OverallGrade : "-"}
            </Text>
          </div>
          <Text
            variant="xs"
            classes={`font-semibold 
                    whitespace-nowrap`}
          >
            OVR
          </Text>
        </div>
      )}
      {Team && (
        <div className="flex flex-col py-1 items-center">
          <div
            className={`flex items-center justify-center 
                          size-6 md:size-8 rounded-full border-2`}
            style={{ borderColor, backgroundColor: gradeColor }}
          >
            <Text variant="xs" classes={`font-semibold`}>
              {Team.OffenseGrade ? Team.OffenseGrade : "-"}
            </Text>
          </div>
          <Text
            variant="xs"
            classes={`font-semibold 
                    whitespace-nowrap`}
          >
            OFF
          </Text>
        </div>
      )}
      {Team && (
        <div className="flex flex-col py-1 items-center">
          <div
            className={`flex items-center justify-center 
                          size-6 md:size-8 rounded-full border-2`}
            style={{ borderColor, backgroundColor: gradeColor }}
          >
            <Text variant="xs" classes={`font-semibold text-center`}>
              {Team.DefenseGrade ? Team.DefenseGrade : "-"}
            </Text>
          </div>
          <Text
            variant="xs"
            classes={`font-semibold 
                    whitespace-nowrap`}
          >
            DEF
          </Text>
        </div>
      )}
      {Team && Team.SpecialTeamsGrade && (
        <div className="flex flex-col py-1 items-center">
          <div
            className={`flex items-center justify-center 
                          size-6 md:size-8 rounded-full border-2`}
            style={{ borderColor, backgroundColor: gradeColor }}
          >
            <Text variant="xs" classes={`font-semibold`}>
              {Team.SpecialTeamsGrade ? Team.SpecialTeamsGrade : "-"}
            </Text>
          </div>
          <Text
            variant="xs"
            classes={`font-semibold 
                    whitespace-nowrap`}
          >
            STU
          </Text>
        </div>
      )}
    </div>
  );
};

interface TeamAffinitiesProps {
  teamProfile: any;
  textColorClass: string;
}

const AFFINITY_CONFIG = [
  { key: "AcademicsAffinity", label: "Academics" },
  { key: "FrontrunnerAffinity", label: "Frontrunner" },
  { key: "LargeCrowdsAffinity", label: "Large Crowds" },
  { key: "ReligionAffinity", label: "Religion" },
  { key: "ServiceAffinity", label: "Service" },
  { key: "SmallSchoolAffinity", label: "Small School" },
  { key: "SmallTownAffinity", label: "Small Town" },
  { key: "BigCityAffinity", label: "Big City" },
  { key: "MediaSpotlightAffinity", label: "Media" },
  { key: "RisingStarsAffinity", label: "Rising Stars" },
];

export const TeamAffinities: FC<TeamAffinitiesProps> = ({
  teamProfile,
  textColorClass,
}) => {
  const activeAffinities = AFFINITY_CONFIG.filter(
    (affinity) => teamProfile[affinity.key]
  );

  if (activeAffinities.length === 0) {
    return null;
  }

  return (
    <div className="mb-2">
      <Text
        variant="body-small"
        classes={`${textColorClass} font-semibold pb-1 block text-start`}
      >
        Affinities
      </Text>
      <div className="flex flex-wrap gap-x-1">
        {activeAffinities.map(({ key, label }, index) => (
          <Text key={key} variant="small" classes={`${textColorClass}`}>
            {label}
            {index < activeAffinities.length - 1 ? "," : ""}
          </Text>
        ))}
      </div>
    </div>
  );
};
