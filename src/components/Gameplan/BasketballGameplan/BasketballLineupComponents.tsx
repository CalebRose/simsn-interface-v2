import { ChangeEvent, FC, useCallback, useMemo } from "react";
import { CollegeLineup, CollegePlayer, NBALineup, NBAPlayer } from "../../../models/basketballModels";
import { Text } from "../../../_design/Typography";
import { SimCBB } from "../../../_constants/constants";
import { getCBBLetterGrade } from "../../../_utility/getLetterGrade";
import { Input } from "../../../_design/Inputs";
import { SelectDropdown } from "../../../_design/Select";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { useLeagueStore } from "../../../context/LeagueContext";
import { getRatingBgColor } from "../FootballGameplan/Utils/GameplanPlayerUtils";

interface BasketballLineupProps {
  selectedTeamLineups: CollegeLineup[] | NBALineup[];
  index: number;
  selectedRosterMap: Record<number, CollegePlayer | NBAPlayer>;
  selectedTeamRoster: CollegePlayer[] | NBAPlayer[];
  position: string;
  selectedString: string;
  selectedStringAbbr: string;
  ChangeLineupInput: (playerID: number, key: string, value: number, idx: number) => void;
  playerOptions: { label: string; value: string }[];
  canModify: boolean;
}

const allocationList = ["InsideProportion", "MidProportion", "ThreeProportion", "Minutes"];
const allocationLabel: Record<string, string> = { Minutes: "Usage", InsideProportion: "Inside", MidProportion: "Midrange", ThreeProportion: "3 Point" };

export const BasketballLineup: FC<BasketballLineupProps> = ({ selectedTeamLineups, index, selectedRosterMap, position, selectedString, selectedStringAbbr, ChangeLineupInput, playerOptions, canModify }) => {
  const lineup = selectedTeamLineups[index];
  const id = lineup ? lineup[`${selectedString}StringID`] : -1;
  const positionLabel = position === "G" ? index + 1 : position === "F" ? index - 1 : 1;
  const totalInput = lineup ? lineup[`${selectedStringAbbr}InsideProportion`] + lineup[`${selectedStringAbbr}MidProportion`] + lineup[`${selectedStringAbbr}ThreeProportion`] : 0;
  const playerKey = `${selectedString}StringID`;
  const eligiblePlayerOptions = useMemo(() => playerOptions.filter((option) => {
    const candidateID = Number(option.value);
    if (!candidateID) return true;

    const assignedElsewhereInFirstString = selectedString === "First" && selectedTeamLineups.some(
      (otherLineup, otherIndex) => otherIndex !== index && otherLineup.FirstStringID === candidateID,
    );
    const assignedToAnotherStringInThisSlot = ["FirstStringID", "SecondStringID", "ThirdStringID"].some(
      (stringKey) => stringKey !== playerKey && lineup[stringKey] === candidateID,
    );

    return !assignedElsewhereInFirstString && !assignedToAnotherStringInThisSlot;
  }), [index, lineup, playerKey, playerOptions, selectedString, selectedTeamLineups]);
  const changeInput = useCallback((event: ChangeEvent<HTMLInputElement>) => ChangeLineupInput(id, event.target.name, Number(event.target.value), index), [ChangeLineupInput, id, index]);

  if (!lineup) return null;

  return (
    <div className="grid grid-cols-1 items-center gap-3 rounded-lg border border-slate-600 bg-slate-800/70 p-3 xl:grid-cols-[3.5rem_minmax(18rem,1fr)_minmax(22rem,1.2fr)]">
      <div className="flex items-center justify-center"><span className="rounded-md bg-black/75 px-3 py-2 text-sm font-bold text-white">{position}{positionLabel}</span></div>
      <BasketballLineupPlayerCard id={id} rosterMap={selectedRosterMap} playerOptions={eligiblePlayerOptions} ChangeLineupInput={ChangeLineupInput} lineupString={playerKey} idx={index} canModify={canModify} />
      <div className="flex flex-col gap-2">
        <Text variant="small" classes="text-left font-semibold">Shot Allocation: {totalInput}%</Text>
        {canModify && <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {allocationList.map((key) => <Input type="number" key={key} label={allocationLabel[key]} name={`${selectedStringAbbr}${key}`} value={lineup[`${selectedStringAbbr}${key}`] as number} onChange={changeInput} classes="w-14 min-w-0 justify-self-end px-1.5 py-1 text-center text-sm" />)}
        </div>}
      </div>
    </div>
  );
};

interface BasketballLineupPlayerCardProps {
  id: number;
  idx: number;
  rosterMap: Record<number, CollegePlayer | NBAPlayer>;
  playerOptions: { label: string; value: string }[];
  ChangeLineupInput: (id: number, name: string, value: number, idx: number) => void;
  lineupString: string;
  canModify: boolean;
}

const BasketballLineupPlayerCard: FC<BasketballLineupPlayerCardProps> = ({ id, idx, rosterMap, playerOptions, ChangeLineupInput, lineupString, canModify }) => {
  const { selectedLeague } = useLeagueStore();
  const player = rosterMap[id];
  const selectedOption = useMemo(() => playerOptions.find((option) => Number(option.value) === player?.ID) || null, [player, playerOptions]);
  const changePlayer = useCallback((option: SingleValue<SelectOption>) => { if (option && player) ChangeLineupInput(player.ID, lineupString, Number(option.value), idx); }, [ChangeLineupInput, idx, lineupString, player]);
  const placeholder = player ? `${player.ID} ${player.Position} ${player.FirstName} ${player.LastName}` : "Select a player";
  const rating = (value: number) => selectedLeague === SimCBB ? getCBBLetterGrade(value, player?.Year || 1) : value;
  const overall = player ? rating(player.Overall) : "";
  const overallBadgeClass = selectedLeague === SimCBB
    ? getRatingBgColor(overall)
    : player && player.Overall >= 40
      ? "bg-[#00ACC9]"
      : player && player.Overall >= 35
        ? "bg-[#00A666]"
        : player && player.Overall >= 30
          ? "bg-[#D7C12C]"
          : player && player.Overall >= 25
            ? "bg-[#F18831]"
            : "bg-[#AC2B27]";
  const primaryAttributes = player ? [
    ["INS", rating(player.InsideShooting)],
    ["MID", rating(player.MidRangeShooting)],
    ["3PT", rating(player.ThreePointShooting)],
    ["INT D", rating(player.InteriorDefense)],
    ["PER D", rating(player.PerimeterDefense)],
  ] : [];
  const secondaryAttributes = player ? [
    ["AGI", rating(player.Agility)],
    ["FT", rating(player.FreeThrow)],
    ["BH", rating(player.Ballwork)],
    ["STL", rating(player.Stealing)],
    ["REB", rating(player.Rebounding)],
    ["BLK", rating(player.Blocking)],
  ] : [];

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(15rem,1fr)_2.5rem_repeat(5,3.5rem)]">
      <div className="min-w-0">
        <SelectDropdown value={selectedOption} onChange={changePlayer} options={playerOptions} isDisabled={!canModify} placeholder={placeholder} />
        {player && <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-200">
          {secondaryAttributes.map(([label, value]) => <span key={label}>{label} <strong>{value}</strong></span>)}
        </div>}
      </div>
      {player && <>
        <div
          className={`mx-auto flex h-9 w-9 items-center justify-center self-start rounded-full text-sm font-bold text-white ${overallBadgeClass}`}
          title="Overall rating"
          style={{ WebkitTextStroke: "0.5px black", textShadow: "0 1px 1px black" }}
        >
          {overall}
        </div>
        {primaryAttributes.map(([label, value]) => <div key={label} className="flex flex-col items-center justify-start text-xs">
          <span className="whitespace-nowrap text-slate-300">{label}</span>
          <strong className="mt-1 text-sm">{value}</strong>
        </div>)}
      </>}
    </div>
  );
};
