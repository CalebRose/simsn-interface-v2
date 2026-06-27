import { FC, useCallback, useMemo } from "react";
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
import { Input } from "../../../_design/Inputs";
import { SelectDropdown } from "../../../_design/Select";
import { CSSObjectWithLabel, SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";

interface BasketballLineupProps {
  selectedTeamLineups: CollegeLineup[] | NBALineup[];
  index: number;
  selectedRosterMap: Record<number, CollegePlayer | NBAPlayer>;
  selectedTeamRoster: CollegePlayer[] | NBAPlayer[];
  position: string;
  selectedString: string;
  selectedStringAbbr: string;
  selectedTeam: any;
  ChangeLineupInput: (
    playerID: number,
    key: string,
    value: number,
    idx: number,
  ) => void;
  playerOptions: { label: string; value: string }[];
  canModify: boolean;
}

const allocationList = [
  "Minutes",
  "InsideProportion",
  "MidProportion",
  "ThreeProportion",
];

export const BasketballLineup: FC<BasketballLineupProps> = ({
  selectedTeamLineups,
  index,
  selectedRosterMap,
  selectedTeamRoster,
  position,
  selectedString,
  selectedStringAbbr,
  selectedTeam,
  ChangeLineupInput,
  playerOptions,
  canModify,
}) => {
  const lineup = useMemo(() => {
    if (!selectedTeamLineups || selectedTeamLineups.length <= index) {
      return null;
    }
    return selectedTeamLineups[index];
  }, [selectedTeamLineups, index]);

  const id = lineup ? lineup[selectedString + "StringID"] : -1;

  const ChangeInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log({ id, name: event.target.name, value: event.target.value });
      ChangeLineupInput(
        id,
        event.target.name,
        Number(event.target.value),
        index,
      );
    },
    [ChangeLineupInput, id, index],
  );

  if (!lineup) return <></>;

  return (
    <div className="flex flex-col">
      <div key={index} className="flex flex-col items-center">
        <Text variant="body-small">{position}</Text>
      </div>
      <BasketballLineupPlayerCard
        id={id}
        rosterMap={selectedRosterMap}
        team={selectedTeam}
        playerOptions={playerOptions}
        ChangeLineupInput={ChangeLineupInput}
        lineupString={selectedString + "StringID"}
        idx={index}
        canModify={canModify}
      />
      <div className="space-y-2">
        {allocationList.map((x) => {
          const label = (() => {
            switch (x) {
              case "Minutes":
                return "Minutes";
              case "InsideProportion":
                return "Inside Proportion";
              case "MidProportion":
                return "Mid Proportion";
              case "ThreeProportion":
                return "Three Proportion";
              default:
                return x;
            }
          })();

          const key = `${selectedStringAbbr}${x}`;
          if (!canModify) return <></>;
          return (
            <Input
              type="number"
              key={x}
              label={label}
              name={key}
              value={lineup[key] as number}
              onChange={ChangeInput}
              disabled={!canModify}
              classes="text-center mr-2"
            />
          );
        })}
      </div>
    </div>
  );
};

interface BasketballLineupPlayerCardProps {
  id: number;
  idx: number;
  rosterMap: Record<number, CollegePlayer | NBAPlayer>;
  team: any;
  playerOptions: { label: string; value: string }[];
  ChangeLineupInput: (
    id: number,
    name: string,
    value: number,
    idx: number,
  ) => void;
  lineupString: string;
  canModify: boolean;
}

const BasketballLineupPlayerCard: FC<BasketballLineupPlayerCardProps> = ({
  id,
  idx,
  rosterMap,
  team,
  playerOptions,
  ChangeLineupInput,
  lineupString,
  canModify,
}) => {
  const player = rosterMap[id];

  const selectedOption = useMemo(() => {
    if (!player) return null;
    return playerOptions.find((opt) => Number(opt.value) === player.ID) || null;
  }, [playerOptions, player]);

  const GetValue = useCallback(
    (opts: SingleValue<SelectOption>) => {
      if (opts) {
        ChangeLineupInput(player.ID, lineupString, Number(opts.value), idx);
      }
    },
    [ChangeLineupInput, player, lineupString, idx],
  );

  const placeholder = useMemo(() => {
    if (!player) return "Please select a player";
    return `${player.ID} ${player.Position} ${player.FirstName} ${player.LastName}`;
  }, [player]);

  if (!player) {
    return null;
  }
  return (
    <div className="flex flex-col items-center mb-2 space-y-2">
      <div className="flex items-center justify-center h-24 w-24 sm:h-32 sm:w-32 px-5 rounded-lg border-2 bg-white">
        <PlayerPicture
          playerID={id}
          player={player}
          team={team}
          league={SimCBB}
        />
      </div>
      <SelectDropdown
        value={selectedOption}
        onChange={GetValue}
        options={playerOptions}
        isDisabled={!canModify}
        placeholder={placeholder}
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: "32px", // shorter control
            fontSize: "1.5vh", // smaller text
            backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
            borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
            color: "#ffffff",
            padding: "0.6vh",
            boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
            borderRadius: "8px",
            transition: "all 0.2s ease",
            width: "100%",
          }),
          valueContainer: (base: CSSObjectWithLabel) => ({
            ...base,
            padding: "0 0.6vh", // tighter padding
            width: "10rem",
          }),
          singleValue: (base: CSSObjectWithLabel) => ({
            ...base,
            fontSize: "1.5vh",
            color: "#fff",
          }),
          placeholder: (base: CSSObjectWithLabel) => ({
            ...base,
            fontSize: "1.5vh",
            color: "#fff",
          }),
          option: (base: any, state: { isFocused: any }) => ({
            ...base,
            backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
            color: "#fff",
            padding: "10px",
            cursor: "pointer",
            // etc.
          }),
          menu: (base: CSSObjectWithLabel) => ({
            ...base,
            fontSize: "0.75rem",
            backgroundColor: "#1a202c",
            borderRadius: "8px",
            color: "#fff",
          }),
          menuList: (provided: any) => ({
            ...provided,
            backgroundColor: "#1a202c",
            padding: "0",
            color: "#fff",
          }),
        }}
      />
      <Text variant="body-small">
        Overall:{" "}
        <span className="text-xs">
          {getCBBLetterGrade(player.Overall, player.Year)}
        </span>
      </Text>
      <div className="grid grid-cols-2 space-x-4 space-y-2">
        <Text variant="body-small">
          Inside:{" "}
          <span className="text-xs">
            {getCBBLetterGrade(player.InsideShooting, player.Year)}
          </span>
        </Text>
        <Text variant="body-small">
          Middle:{" "}
          <span className="text-xs">
            {getCBBLetterGrade(player.MidRangeShooting, player.Year)}
          </span>
        </Text>
        <Text variant="body-small">
          3pt:{" "}
          <span className="text-xs">
            {getCBBLetterGrade(player.ThreePointShooting, player.Year)}
          </span>
        </Text>
        <Text variant="body-small">
          Ballwork:{" "}
          <span className="text-xs">
            {getCBBLetterGrade(player.Ballwork, player.Year)}
          </span>
        </Text>
        <Text variant="body-small">
          Agility:{" "}
          <span className="text-xs">
            {getCBBLetterGrade(player.Agility, player.Year)}
          </span>
        </Text>
        <Text variant="body-small">
          Free Throw:{" "}
          <span className="text-xs">
            {getCBBLetterGrade(player.FreeThrow, player.Year)}
          </span>
        </Text>
        <Text variant="body-small">
          Stealing:{" "}
          <span className="text-xs">
            {getCBBLetterGrade(player.Stealing, player.Year)}
          </span>
        </Text>
        <Text variant="body-small">
          Blocking:{" "}
          <span className="text-xs">
            {getCBBLetterGrade(player.Blocking, player.Year)}
          </span>
        </Text>
        <Text variant="body-small">
          Int. Defense:{" "}
          <span className="text-xs">
            {getCBBLetterGrade(player.InteriorDefense, player.Year)}
          </span>
        </Text>
        <Text variant="body-small">
          Per. Defense:{" "}
          <span className="text-xs">
            {getCBBLetterGrade(player.PerimeterDefense, player.Year)}
          </span>
        </Text>
      </div>
    </div>
  );
};
