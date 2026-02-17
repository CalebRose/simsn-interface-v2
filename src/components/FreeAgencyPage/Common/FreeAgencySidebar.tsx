import { FC } from "react";
import {
  ProCapsheet,
  ProfessionalTeam,
  Timestamp as HCKTimestamp,
} from "../../../models/hockeyModels";
import {
  NFLCapsheet,
  NFLTeam,
  Timestamp as FBATimestamp,
} from "../../../models/footballModels";
import {
  NBACapsheet,
  NBATeam,
  Timestamp as BBATimestamp,
} from "../../../models/basketballModels";
import { League, SimNBA, SimNFL, SimPHL } from "../../../_constants/constants";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { CapsheetInfo } from "../../Team/TeamPageComponents";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { TeamLabel } from "../../Common/Labels";
import { useBackgroundColor } from "../../../_hooks/useBackgroundColor";

interface FreeAgencySideBarProps {
  Capsheet: ProCapsheet | NFLCapsheet | NBACapsheet;
  AdjCapsheet: ProCapsheet | NFLCapsheet | NBACapsheet;
  Team: ProfessionalTeam | NFLTeam | NBATeam;
  teamColors: any;
  league: League;
  ts: HCKTimestamp | FBATimestamp | BBATimestamp;
}

export const FreeAgencySidebar: FC<FreeAgencySideBarProps> = ({
  Capsheet,
  AdjCapsheet,
  Team,
  teamColors,
  league,
  ts,
}) => {
  const { backgroundColor } = useBackgroundColor();
  const headerTextColorClass = getTextColorBasedOnBg(teamColors.One);
  let teamLabel = "";
  let coach = "";
  let season1 = 2025;
  let season2 = 2025;
  let season3 = 2025;
  let season4 = 2025;
  let season5 = 2025;
  let owner = "";
  let gm = "";
  let scout = "";
  switch (league) {
    case SimPHL:
      const tp = Capsheet as ProCapsheet;
      const t = Team as ProfessionalTeam;
      const tsp = ts as HCKTimestamp;
      season1 = tsp.Season;
      season2 = tsp.Season + 1;
      season3 = tsp.Season + 2;
      season4 = tsp.Season + 3;
      season5 = tsp.Season + 4;
      teamLabel = t.TeamName;
      owner = t.Owner;
      gm = t.GM;
      scout = t.Scout;
      coach = t.Coach;
      break;
    case SimNBA:
      const nbaTeam = Team as NBATeam;
      const tsb = ts as BBATimestamp;
      season1 = tsb.Season;
      season2 = tsb.Season + 1;
      season3 = tsb.Season + 2;
      season4 = tsb.Season + 3;
      season5 = tsb.Season + 4;
      teamLabel = nbaTeam.Team;
      owner = nbaTeam.NBAOwnerName;
      gm = nbaTeam.NBAGMName;
      coach = nbaTeam.NBACoachName;
      scout = nbaTeam.NBAAssistantName;
      break;
    case SimNFL:
      break;
    default:
      break;
  }
  return (
    <div className="flex flex-col w-full h-full max-[1024px]:gap-y-2">
      <Border
        direction="col"
        classes="w-full max-[1024px]:px-2 max-[1024px]:pb-4 px-4 py-2 h-full items-center justify-start"
        styles={{
          borderColor: teamColors.One,
          backgroundColor: backgroundColor,
        }}
      >
        <div className="flex flex-col gap-x-2 flex-wrap w-full text-start mb-4">
          <TeamLabel
            team={teamLabel}
            backgroundColor={teamColors.One}
            borderColor={teamColors.One}
            headerTextColorClass={headerTextColorClass}
          />
          <Text variant="body-small">Owner: {owner}</Text>
          {gm.length > 0 && <Text variant="body-small">GM: {gm}</Text>}
          {coach.length > 0 && <Text variant="body-small">Coach: {coach}</Text>}
          {scout.length > 0 && <Text variant="body-small">Scout: {scout}</Text>}
          <Text variant="body-small">State: {Team?.State}</Text>
        </div>
        <div
          className="w-full mb-1 rounded-md text-center"
          style={{
            backgroundColor: teamColors.One,
            borderColor: teamColors.One,
          }}
        >
          <Text
            variant="body-small"
            className={`font-semibold rounded-md py-1 mb-1 mt-1 ${headerTextColorClass}`}
          >
            Capsheet
          </Text>
        </div>
        <div className="mb-2">
          <CapsheetInfo
            ts={ts as HCKTimestamp}
            capsheet={Capsheet}
            league={league}
            backgroundColor={teamColors.Three}
            borderColor={teamColors.Two}
            textColorClass={teamColors.TextColorThree}
          />
        </div>
        <div className="flex flex-col">
          {AdjCapsheet.UpdatedAt !== Capsheet.UpdatedAt && (
            <>
              <div
                className="w-full mb-1 rounded-md text-center"
                style={{
                  backgroundColor: teamColors.One,
                  borderColor: teamColors.One,
                }}
              >
                <Text
                  variant="body-small"
                  className={`font-semibold py-1 mb-1 mt-1 ${headerTextColorClass}`}
                >
                  Adj. Capsheet After Offers
                </Text>
              </div>
              <CapsheetInfo
                ts={ts as HCKTimestamp}
                capsheet={AdjCapsheet}
                league={league}
                backgroundColor={teamColors.Three}
                borderColor={teamColors.Two}
                textColorClass={teamColors.TextColorThree}
              />
            </>
          )}
        </div>
      </Border>
    </div>
  );
};
