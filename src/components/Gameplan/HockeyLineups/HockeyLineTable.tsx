import { FC, useCallback, useMemo } from "react";
import { SingleValue } from "react-select";
import { SelectDropdown } from "../../../_design/Select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { Button } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { Info } from "../../../_design/Icons";
import { League, Zone } from "../../../_constants/constants";
import {
  CollegeLineup,
  CollegePlayer,
  ProfessionalLineup,
  ProfessionalPlayer,
} from "../../../models/hockeyModels";
import {
  getGoalieAttributeDisplay,
  getZoneAttributeDisplay,
  getZoneAttributeLabels,
} from "./lineupHelper";

type HockeyPlayer = CollegePlayer | ProfessionalPlayer;
type HockeyLineup = CollegeLineup | ProfessionalLineup;

type LineupPositionKey =
  | "CenterID"
  | "Forward1ID"
  | "Forward2ID"
  | "Defender1ID"
  | "Defender2ID"
  | "GoalieID";

type RosterOptionsKey =
  | "centerOptions"
  | "forwardOptions"
  | "defenderOptions"
  | "goalieOptions";

interface LineSlotDef {
  key: LineupPositionKey;
  label: string;
  optionsKey: RosterOptionsKey;
}

const forwardSlotDefs: LineSlotDef[] = [
  { key: "CenterID", label: "C", optionsKey: "centerOptions" },
  { key: "Forward1ID", label: "LW", optionsKey: "forwardOptions" },
  { key: "Forward2ID", label: "RW", optionsKey: "forwardOptions" },
];
const defenseSlotDefs: LineSlotDef[] = [
  { key: "Defender1ID", label: "LD", optionsKey: "defenderOptions" },
  { key: "Defender2ID", label: "RD", optionsKey: "defenderOptions" },
];
const goalieSlotDefs: LineSlotDef[] = [
  { key: "GoalieID", label: "G", optionsKey: "goalieOptions" },
];

export interface HockeyRosterOptions {
  centerOptions: SelectOption[];
  forwardOptions: SelectOption[];
  defenderOptions: SelectOption[];
  goalieOptions: SelectOption[];
  shootoutOptions: SelectOption[];
}

interface HockeyLineTableProps {
  lineup: HockeyLineup;
  rosterMap: Record<number, HockeyPlayer>;
  rosterOptions: HockeyRosterOptions;
  zoneCategory: Zone;
  zoneInputList: { label: string; key: string }[];
  league: League;
  ChangeState: (value: number, property: string) => void;
  ChangePlayerInput: (playerID: number, key: string, value: number) => void;
  activatePlayer: (player: HockeyPlayer) => void;
}

export const HockeyLineTable: FC<HockeyLineTableProps> = ({
  lineup,
  rosterMap,
  rosterOptions,
  zoneCategory,
  zoneInputList,
  league,
  ChangeState,
  ChangePlayerInput,
  activatePlayer,
}) => {
  const isGoalieLine = lineup.LineType === 3;
  const slotDefs = isGoalieLine
    ? goalieSlotDefs
    : lineup.LineType === 2
      ? defenseSlotDefs
      : forwardSlotDefs;

  const attributeLabels = isGoalieLine
    ? ["Agility", "Strength", "Goalie Vision", "Goalkeeping", "Stamina"]
    : getZoneAttributeLabels(zoneCategory);

  const gridTemplateColumns = `2.5rem minmax(220px,1fr) repeat(${attributeLabels.length}, 6rem)${
    isGoalieLine ? "" : ` repeat(${zoneInputList.length}, 5.5rem)`
  }`;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-205">
        <div
          className="grid items-end gap-2 border-b border-slate-600 px-3 pb-2 text-center text-xs font-semibold text-slate-300"
          style={{ gridTemplateColumns }}
        >
          <span>#</span>
          <span className="text-left">Player</span>
          {attributeLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
          {!isGoalieLine &&
            zoneInputList.map((input) => (
              <span key={input.key}>{input.label}</span>
            ))}
        </div>
        <div className="space-y-2 pt-2">
          {slotDefs.map((slot) => (
            <HockeyLineRow
              key={slot.key}
              slot={slot}
              lineup={lineup}
              rosterMap={rosterMap}
              options={rosterOptions[slot.optionsKey]}
              zoneCategory={zoneCategory}
              zoneInputList={zoneInputList}
              attributeLabels={attributeLabels}
              league={league}
              isGoalieLine={isGoalieLine}
              gridTemplateColumns={gridTemplateColumns}
              ChangeState={ChangeState}
              ChangePlayerInput={ChangePlayerInput}
              activatePlayer={activatePlayer}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface HockeyLineRowProps {
  slot: LineSlotDef;
  lineup: HockeyLineup;
  rosterMap: Record<number, HockeyPlayer>;
  options: SelectOption[];
  zoneCategory: Zone;
  zoneInputList: { label: string; key: string }[];
  attributeLabels: string[];
  league: League;
  isGoalieLine: boolean;
  gridTemplateColumns: string;
  ChangeState: (value: number, property: string) => void;
  ChangePlayerInput: (playerID: number, key: string, value: number) => void;
  activatePlayer: (player: HockeyPlayer) => void;
}

const HockeyLineRow: FC<HockeyLineRowProps> = ({
  slot,
  lineup,
  rosterMap,
  options,
  zoneCategory,
  zoneInputList,
  attributeLabels,
  league,
  isGoalieLine,
  gridTemplateColumns,
  ChangeState,
  ChangePlayerInput,
  activatePlayer,
}) => {
  const playerID = (lineup as unknown as Record<LineupPositionKey, number>)[
    slot.key
  ];
  const player = rosterMap[playerID];

  const selectedOption = useMemo(
    () => options.find((opt) => Number(opt.value) === playerID) || null,
    [options, playerID],
  );

  const placeholder = player
    ? `${player.Position} ${player.FirstName} ${player.LastName}`
    : "None";

  const GetValue = useCallback(
    (opts: SingleValue<SelectOption>) => {
      if (opts) ChangeState(Number(opts.value), slot.key);
    },
    [ChangeState, slot.key],
  );

  const ChangeInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      ChangePlayerInput(
        playerID,
        event.target.name,
        Number(event.target.value),
      );
    },
    [ChangePlayerInput, playerID],
  );

  const attributeDisplay = player
    ? isGoalieLine
      ? getGoalieAttributeDisplay(player, league)
      : getZoneAttributeDisplay(zoneCategory, player, league)
    : attributeLabels.map((label) => ({ label, value: "—" }));

  return (
    <div
      className="grid items-center gap-2 rounded-lg bg-slate-800/70 p-3 text-center text-sm"
      style={{ gridTemplateColumns }}
    >
      <strong>{slot.label}</strong>
      <div className="flex items-center gap-2 text-left">
        {player && (
          <Button classes="shrink-0" onClick={() => activatePlayer(player)}>
            <Info />
          </Button>
        )}
        <SelectDropdown
          value={selectedOption}
          onChange={GetValue}
          options={options}
          placeholder={placeholder}
          styles={{
            control: (base, state) => ({
              ...base,
              minHeight: "32px",
              fontSize: "0.8rem",
              backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
              borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
              color: "#ffffff",
              boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
              borderRadius: "8px",
              width: "100%",
              minWidth: "12rem",
            }),
            singleValue: (base) => ({
              ...base,
              fontSize: "0.8rem",
              color: "#fff",
            }),
            placeholder: (base) => ({
              ...base,
              fontSize: "0.8rem",
              color: "#fff",
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: "#1a202c",
              borderRadius: "8px",
            }),
            menuList: (base) => ({
              ...base,
              backgroundColor: "#1a202c",
              padding: "0",
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
              color: "#fff",
              cursor: "pointer",
            }),
          }}
        />
      </div>
      {attributeDisplay.map((attr) => (
        <Text key={attr.label} variant="small" classes="font-semibold">
          {attr.value}
        </Text>
      ))}
      {!isGoalieLine &&
        zoneInputList.map((input) => (
          <input
            key={input.key}
            aria-label={`${input.label} for ${placeholder}`}
            type="number"
            name={input.key}
            disabled={!player}
            value={player ? ((player as any)[input.key] as number) : 0}
            onChange={ChangeInput}
            className="w-16 justify-self-center rounded border border-slate-500 bg-black px-1.5 py-1 text-center text-sm text-white disabled:opacity-60"
          />
        ))}
    </div>
  );
};
