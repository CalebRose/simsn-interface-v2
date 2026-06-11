import { FC, useMemo } from "react";
import {
  CollegeLineup,
  CollegePlayer,
  NBALineup,
  NBAPlayer,
} from "../../../models/basketballModels";
import { Text } from "../../../_design/Typography";
import PlayerPicture from "../../../_utility/usePlayerFaces";
import { SimCBB } from "../../../_constants/constants";
import {
  getCBBLetterGrade,
  getCBBOverall,
} from "../../../_utility/getLetterGrade";

interface BasketballLineupProps {
  selectedTeamLineups: CollegeLineup[] | NBALineup[];
  index: number;
  selectedRosterMap: Record<number, CollegePlayer | NBAPlayer>;
  selectedTeamRoster: CollegePlayer[] | NBAPlayer[];
  position: string;
  selectedString: string;
  selectedStringAbbr: string;
  selectedTeam: any;
}

export const BasketballLineup: FC<BasketballLineupProps> = ({
  selectedTeamLineups,
  index,
  selectedRosterMap,
  selectedTeamRoster,
  position,
  selectedString,
  selectedStringAbbr,
  selectedTeam,
}) => {
  const lineup = useMemo(() => {
    if (!selectedTeamLineups || selectedTeamLineups.length <= index) {
      return null;
    }
    return selectedTeamLineups[index];
  }, [selectedTeamLineups, index]);
  if (!lineup) {
    return null;
  }

  const id = lineup[selectedString + "StringID"];

  return (
    <div className="flex flex-col">
      <div key={index} className="flex flex-col items-center">
        <Text variant="body-small">{position}</Text>
      </div>
      <BasketballLineupPlayerCard
        id={id}
        rosterMap={selectedRosterMap}
        team={selectedTeam}
      />
    </div>
  );
};

interface BasketballLineupPlayerCardProps {
  id: number;
  rosterMap: Record<number, CollegePlayer | NBAPlayer>;
  team: any;
}

const BasketballLineupPlayerCard: FC<BasketballLineupPlayerCardProps> = ({
  id,
  rosterMap,
  team,
}) => {
  const player = rosterMap[id];
  if (!player) {
    return null;
  }
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center h-24 w-24 sm:h-32 sm:w-32 px-5 rounded-lg border-2 bg-white">
        <PlayerPicture
          playerID={id}
          player={player}
          team={team}
          league={SimCBB}
        />
      </div>
      <Text variant="body-small">
        {player.FirstName} {player.LastName}
      </Text>
      <Text variant="body-small">
        Overall: {getCBBLetterGrade(player.Overall, player.Year)}
      </Text>
      <Text variant="body-small">
        Inside: {getCBBLetterGrade(player.InsideShooting, player.Year)}
      </Text>
      <Text variant="body-small">
        Middle: {getCBBLetterGrade(player.MidRangeShooting, player.Year)}
      </Text>
      <Text variant="body-small">
        3pt: {getCBBLetterGrade(player.ThreePointShooting, player.Year)}
      </Text>
      <Text variant="body-small">
        Ballwork: {getCBBLetterGrade(player.Ballwork, player.Year)}
      </Text>
      <Text variant="body-small">
        Agility: {getCBBLetterGrade(player.Agility, player.Year)}
      </Text>
    </div>
  );
};
