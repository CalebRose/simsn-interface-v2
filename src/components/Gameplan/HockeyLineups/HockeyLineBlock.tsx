import { FC, useMemo } from "react";
import { Text } from "../../../_design/Typography";
import { Input } from "../../../_design/Inputs";
import {
  CollegeLineup,
  CollegePlayer,
  ProfessionalLineup,
  ProfessionalPlayer,
} from "../../../models/hockeyModels";
import {
  DefendingGoalZone,
  League,
  Lineup,
  LineupG1,
  LineupG2,
  Zone,
} from "../../../_constants/constants";
import { getZoneInputList } from "./lineupHelper";
import { HockeyLineTable, HockeyRosterOptions } from "./HockeyLineTable";

type HockeyPlayer = CollegePlayer | ProfessionalPlayer;
type HockeyLineup = CollegeLineup | ProfessionalLineup;

interface HockeyLineBlockProps {
  lineCategory: Lineup;
  lineIdx: number;
  lineup: HockeyLineup;
  rosterMap: Record<number, HockeyPlayer>;
  rosterOptions: HockeyRosterOptions;
  // Shared zone selection (Forward/Defender only); ignored for goalie lines,
  // which always use Defending Goal Zone.
  zoneCategory: Zone;
  league: League;
  ChangeLineupValue: (value: number, key: string, index: number) => void;
  ChangePlayerInput: (playerID: number, key: string, value: number) => void;
  activatePlayer: (player: HockeyPlayer) => void;
}

export const HockeyLineBlock: FC<HockeyLineBlockProps> = ({
  lineCategory,
  lineIdx,
  lineup,
  rosterMap,
  rosterOptions,
  zoneCategory,
  league,
  ChangeLineupValue,
  ChangePlayerInput,
  activatePlayer,
}) => {
  const isGoalieLine = lineCategory === LineupG1 || lineCategory === LineupG2;
  const effectiveZoneCategory = isGoalieLine ? DefendingGoalZone : zoneCategory;
  const zoneInputList = useMemo(
    () => getZoneInputList(effectiveZoneCategory),
    [effectiveZoneCategory],
  );

  const handleZoneTotalChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    ChangeLineupValue(Number(value), name, lineIdx);
  };

  return (
    <div className="w-full">
      <div className="flex flex-row w-full justify-start items-center space-x-2">
        <Text variant="h6" classes="flex">
          {lineCategory} Players
        </Text>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[14rem_1fr] gap-2 w-full pb-3">
        <div className="flex flex-col gap-y-2">
          <Text variant="body-small">
            <strong>{effectiveZoneCategory} Totals</strong>
          </Text>
          {zoneInputList.map((x) => (
            <Input
              key={x.key}
              type="number"
              classes="w-16 text-xs"
              label={x.label}
              name={x.key}
              value={lineup[x.key] as number}
              onChange={handleZoneTotalChange}
            />
          ))}
        </div>
        <HockeyLineTable
          lineup={lineup}
          rosterMap={rosterMap}
          rosterOptions={rosterOptions}
          zoneCategory={effectiveZoneCategory}
          zoneInputList={zoneInputList}
          league={league}
          ChangeState={(value, key) => ChangeLineupValue(value, key, lineIdx)}
          ChangePlayerInput={ChangePlayerInput}
          activatePlayer={activatePlayer}
        />
      </div>
    </div>
  );
};
