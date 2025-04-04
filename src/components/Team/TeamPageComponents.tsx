import { FC } from "react";
import { Border } from "../../_design/Borders";
import { Text } from "../../_design/Typography";
import {
  League,
  SimCFB,
  SimNFL,
  SimCHL,
  SimPHL,
} from "../../_constants/constants";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { darkenColor } from "../../_utility/getDarkerColor";
import { getLogo } from "../../_utility/getLogo";
import { Logo } from "../../_design/Logo";
import { useMobile } from "../../_hooks/useMobile";

interface TeamInfoProps {
  id?: number;
  TeamName?: string;
  Owner?: string;
  Coach?: string;
  GM?: string;
  Scout?: string;
  Marketing?: string;
  Conference?: string;
  Division?: string;
  Roster?: any;
  Arena?: string;
  Capacity?: number;
  isPro: boolean;
  Capsheet?: any;
  League: League;
  ts: any;
  colorOne?: string;
  colorTwo?: string;
  isRetro?: boolean;
}

export const TeamInfo: FC<TeamInfoProps> = ({
  isPro,
  id,
  TeamName = "",
  Owner = "None",
  Coach = "None",
  GM = "None",
  Scout = "None",
  Marketing = "None",
  Division,
  Conference = "",
  Arena = "",
  Capacity = 0,
  Capsheet = "",
  League,
  Roster,
  ts,
  colorOne = "",
  colorTwo = "",
  isRetro = false,
}) => {
  const backgroundColor = colorOne;
  const borderColor = colorTwo;
  const darkerBorder = backgroundColor === "#000000" || borderColor === "rgb(0, 0, 0)"
  ? darkenColor(backgroundColor, 5)
  : darkenColor(backgroundColor, -5);
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const logo = getLogo(League, id!!, isRetro);
  const [isMobile] = useMobile();
  return (
    <div className="flex flex-row">
      <Border
        direction="row"
        classes="w-full max-w-full min-w-[95vw] sm:min-w-[70vw] p-8 justify-around"
        styles={{
          backgroundColor,
          borderColor,
        }}
      >            
      {!isMobile && (
        <div className="flex w-1/3 justify-center items-center gap-x-2">
          <FrontOfficeInfo 
            owner={Owner} 
            gm={GM} 
            coach={Coach} 
            scout={Scout} 
            isPro={isPro}
            marketing={Marketing} 
            borderColor={borderColor} 
            backgroundColor={darkerBorder}
            lineColor={backgroundColor}
            textColorClass={textColorClass} />
          <RosterInfo 
            roster={Roster} 
            league={League}
            textColorClass={textColorClass}
            borderColor={borderColor} 
            backgroundColor={darkerBorder}
            isPro={isPro} />
          <StadiumInfo 
            league={League}
            arena={Arena}
            capacity={Capacity}
            textColorClass={textColorClass}
            borderColor={borderColor} 
            backgroundColor={darkerBorder}
            isPro={isPro} />
        </div>
        )}
        <div className="flex flex-col sm:w-1/4 justify-center items-center pb-2">
          <div className="flex flex-col max-w-1/4 p-2">
            <div className="max-w-[6rem] w-[5.5em] h-[5.5rem] rounded-lg border-2"
                  style={{ backgroundColor: darkerBorder, borderColor: borderColor }}>
              <Logo url={logo} 
                    variant="large" />
            </div>
          </div>
          <div className="flex flex-col max-w-1/2">
            <Text variant="h5" 
                  classes={`${textColorClass}`}>
              {TeamName}
            </Text>
            <div className="flex flex-row justify-center">
              <Text variant="body-small" 
                    classes={`${textColorClass}`
                    }>
                {Conference} Conference
              </Text>
              {Division && Division.length > 0 && (
              <Text variant="body-small" 
                    classes={`${textColorClass}`}>
                {Division}
              </Text>
              )}
            </div>
          </div>
        </div>
        {!isMobile && (
        <div className="flex flex-col w-1/3 items-center justify-center gap-x-2">
          {isPro && (
          <CapsheetInfo 
            capsheet={Capsheet} 
            ts={ts} 
            league={League}
            borderColor={borderColor} 
            backgroundColor={darkerBorder} 
          />
          )}
        </div>
        )}
      </Border>
    </div>
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
  capsheet, ts, league, 
  backgroundColor, borderColor, textColorClass }: any) => {
  const isNFL = league === SimNFL;
  const rows = [1, 2, 3, 4, 5].map((yearOffset) => {
    const year = ts.Season + (yearOffset - 1);
    const salaryKey = `Y${yearOffset}Salary`;
    const bonusKey = `Y${yearOffset}Bonus`;
    const capspaceKey = `Y${yearOffset}Capspace`;
    const salary = isNFL
      ? capsheet[salaryKey] || 0
      : (capsheet[salaryKey] || 0) / 1_000_000;
    const bonus = isNFL ? capsheet[bonusKey] || 0 : 0;
    const capSpace = ts[capspaceKey] || 0;
    const space = capSpace - salary - bonus;
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
            <div className="table-cell w-[8em] font-semibold">
              <Text variant="body" 
                    classes={`${textColorClass}`}>
                Year
              </Text>
            </div>
            {isNFL && (
            <div className="table-cell w-[8em] font-semibold">
              <Text variant="body" 
                    classes={`${textColorClass}`}>
                Bonus
              </Text>
            </div>
            )}
            <div className="table-cell w-[8em] font-semibold">
              <Text variant="body" 
                    classes={`${textColorClass}`}>
                Salary
              </Text>
            </div>
            <div className="table-cell w-[8em] font-semibold">
              <Text variant="body" 
                    classes={`${textColorClass}`}>
                Space
              </Text>
            </div>
          </div>
        </div>
        <div className="table-row-group">
          {rows.map(({ year, salary, bonus, space }) => (
          <div key={year} className="table-row">
            <div className="table-cell">
              <Text variant="body-small" 
                    classes={`${textColorClass}`}>
                {year}
              </Text>
            </div>
            {isNFL && (
            <div className="table-cell">
              <Text variant="body-small" 
                    classes={`${textColorClass}`}>
                {bonus.toFixed(2)}
              </Text>
            </div>
            )}
            <div className="table-cell">
              <Text variant="body-small" 
                    classes={`${textColorClass}`}>
                {salary.toFixed(2)}
              </Text>
            </div>
            <div className="table-cell">
              <Text variant="body-small" 
                    classes={`${textColorClass}`}>
                {space.toFixed(2)}
              </Text>
            </div>
          </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
};

export const FrontOfficeInfo = ({ 
  backgroundColor, borderColor, textColorClass, lineColor, 
  league, owner, coach, gm, scout, marketing, isPro 
}: any) => {
  const personnelRoles = isPro
    ? [
        { role: "Owner", 
          value: owner },
        { role: "GM", 
          value: gm },
        { role: "Coach", 
          value: coach },
        { role: "Assistant", 
          value: scout },
        ...(league === SimPHL ? 
          [{ role: "Marketing", 
             value: marketing }] : []),
      ]
        .filter(({ value }) => value)
        .reduce((acc: Record<string, string[]>, { role, value }) => {
          if (!acc[value]) {
            acc[value] = [];
          }
          acc[value].push(role);
          return acc;
        }, {})
    : {
        [coach || "AI"]: ["Coach"],
      };

  const vacancies = isPro
    ? [
        { role: "Owner", 
          value: owner },
        { role: "GM", 
          value: gm },
        { role: "Coach", 
          value: coach },
        { role: "Assistant", 
          value: scout },
        ...(league === SimPHL ? 
          [{ role: "Marketing", 
             value: marketing }] : []),
      ]
        .filter(({ value }) => !value)
        .map(({ role }) => role)
        .join(", ") || "None"
    : !coach || coach === "AI"
    ? "Coach"
    : "None";

  return (
    <div
      className="flex w-[15em] h-[100%] py-5 px-4 border-2 rounded-lg flex-row"
      style={{ borderColor, backgroundColor }}
    >
      <div className="table-fixed w-full">
        <div className="table-header-group">
          <div className="table-row">
            <div className="table-cell w-[6em] font-semibold text-left">
              <Text variant="body-small" 
                    classes={`${textColorClass}`}>
                Role
              </Text>
            </div>
            <div className="table-cell font-semibold text-left">
              <Text variant="body-small" 
                    classes={`${textColorClass}`}>
                Personnel
              </Text>
            </div>
          </div>
        </div>
        <div className="table-row-group">
          {Object.entries(personnelRoles).map(([person, roles]) => (
          <div key={person} 
                className="table-row">
            <div className="table-cell text-left">
              <Text variant="xs" 
                    classes={`${textColorClass}`}>
                {roles.join("/")}
              </Text>
            </div>
            <div className="table-cell text-left">
              <Text variant="xs" 
                    classes={`${textColorClass}`}>
                {person}
              </Text>
            </div>
          </div>
          ))}
        </div>
        <div className="flex my-2 border-t" 
             style={{ borderColor: lineColor }} />
        <div className="table-row-group">
          {vacancies && (
          <div className="table-row border-t" 
                style={{ borderColor: lineColor, borderTopWidth: "2px" }}>
            <div className="table-cell w-[6em] text-left">
              <Text variant="xs" 
                    classes={`${textColorClass}`}>
                Vacancies
              </Text>
            </div>
            <div className="table-cell text-left">
              <Text variant="xs" 
                    classes={`${textColorClass}`}>
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

export const RosterInfo = ({ backgroundColor, borderColor, league, roster, isPro, textColorClass }: any) => {
  const totalPlayers = roster?.length || 0;
  const specialPlayersCount = roster?.filter((player: any) => {
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
    <div
      className="flex flex-col w-[10em] h-[100%] px-2 justify-between py-5 border-2 rounded-lg"
      style={{ borderColor, backgroundColor }}
    >
      <div className="flex flex-col items-center">
        <Text variant="body-small" 
              classes={`${textColorClass} font-semibold`}>
          Active Roster
        </Text>
        <Text variant="xs" 
              classes={`${textColorClass}`}>
          {activeRoster}
        </Text>
      </div>
      <div className="flex flex-col items-center">
        <Text variant="body-small" 
              classes={`${textColorClass} font-semibold`}>
          {isPro ? league === SimNFL ? "Practice Squad" 
                : league === SimPHL ? "Reserves" 
                : "Unknown" 
                : "Redshirts"}
        </Text>
        <Text variant="xs" 
              classes={`${textColorClass}`}>
          {specialPlayersCount}
        </Text>
      </div>
    </div>
  );
};

export const StadiumInfo = ({ backgroundColor, borderColor, arena, capacity, league, textColorClass }: any) => {
  const home = league === SimCFB || league === SimNFL ? "Stadium" : "Arena";
  return (
    <div
      className="flex flex-col w-[12em] h-[100%] px-2 justify-between py-5 border-2 rounded-lg"
      style={{ borderColor, backgroundColor }}
    >
      <div className="flex flex-col items-center">
        <Text variant="body-small" 
              classes={`${textColorClass} font-semibold`}>
          {`${home}`}
        </Text>
        <Text variant="xs" 
              classes={`${textColorClass}`}>
          {arena}
        </Text>
      </div>
      <div className="flex flex-col items-center">
        <Text variant="body-small" 
              classes={`${textColorClass} font-semibold`}>
          Capacity
        </Text>
        <Text variant="xs" 
              classes={`${textColorClass}`}>
          {capacity}
        </Text>
      </div>
    </div>
  );
};