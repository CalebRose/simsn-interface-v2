import { FC, useCallback, useMemo } from "react";
import { SingleValue } from "react-select";
import { SelectDropdown } from "../../../_design/Select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { Button } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { Info } from "../../../_design/Icons";
import { useResponsive } from "../../../_hooks/useMobile";
import { League, Zone } from "../../../_constants/constants";
import {
  CollegeLineup,
  CollegePlayer,
  ProfessionalLineup,
  ProfessionalPlayer,
} from "../../../models/hockeyModels";
import {
  getGoalieAttributeDisplay,
  getFullAttributeDisplay,
  getFullAttributeLabels,
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
  canModify?: boolean;
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
  canModify = true,
}) => {
  const { isMobile } = useResponsive();
  const isGoalieLine = lineup.LineType === 3;
  const slotDefs = isGoalieLine
    ? goalieSlotDefs
    : lineup.LineType === 2
      ? defenseSlotDefs
      : forwardSlotDefs;

  const attributeLabels = !canModify
    ? getFullAttributeLabels(isGoalieLine)
    : isGoalieLine
      ? ["Agility", "Strength", "Goalie Vision", "Goalkeeping", "Stamina"]
      : getZoneAttributeLabels(zoneCategory);

  const gridTemplateColumns = `2.5rem minmax(220px,1fr) repeat(${attributeLabels.length}, 6rem)${
    !canModify || isGoalieLine ? "" : ` repeat(${zoneInputList.length}, 5.5rem)`
  }`;

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
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
            isMobile
            gridTemplateColumns={gridTemplateColumns}
            ChangeState={ChangeState}
            ChangePlayerInput={ChangePlayerInput}
            activatePlayer={activatePlayer}
            canModify={canModify}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="w-max min-w-205">
        <div
          className="grid w-max items-end gap-2 border-b border-slate-600 px-3 pb-2 text-center text-xs font-semibold text-slate-300"
          style={{ gridTemplateColumns, minWidth: "100%" }}
        >
          <span>#</span>
          <span className="text-left">Player</span>
          {attributeLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
          {canModify &&
            !isGoalieLine &&
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
              canModify={canModify}
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
  isMobile?: boolean;
  gridTemplateColumns: string;
  ChangeState: (value: number, property: string) => void;
  ChangePlayerInput: (playerID: number, key: string, value: number) => void;
  activatePlayer: (player: HockeyPlayer) => void;
  canModify?: boolean;
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
  isMobile,
  gridTemplateColumns,
  ChangeState,
  ChangePlayerInput,
  activatePlayer,
  canModify = true,
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
    ? !canModify
      ? getFullAttributeDisplay(player, league)
      : isGoalieLine
        ? getGoalieAttributeDisplay(player, league)
        : getZoneAttributeDisplay(zoneCategory, player, league)
    : attributeLabels.map((label) => ({ label, value: "—" }));

  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: "32px",
      fontSize: "0.8rem",
      backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
      borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
      color: "#ffffff",
      boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
      borderRadius: "8px",
      width: "100%",
      minWidth: "0",
    }),
    singleValue: (base: any) => ({
      ...base,
      fontSize: "0.8rem",
      color: "#fff",
    }),
    placeholder: (base: any) => ({
      ...base,
      fontSize: "0.8rem",
      color: "#fff",
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "#1a202c",
      borderRadius: "8px",
    }),
    menuList: (base: any) => ({
      ...base,
      backgroundColor: "#1a202c",
      padding: "0",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
      color: "#fff",
      cursor: "pointer",
    }),
  };

  const playerSelect = canModify ? (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      {player && (
        <Button classes="shrink-0" onClick={() => activatePlayer(player)}>
          <Info />
        </Button>
      )}
      <div className="min-w-0 flex-1">
        <SelectDropdown
          value={selectedOption}
          onChange={GetValue}
          options={options}
          placeholder={placeholder}
          styles={selectStyles}
        />
      </div>
    </div>
  ) : (
    <div className="min-w-0 flex-1 truncate text-left text-sm font-semibold">
      {player
        ? `${player.Position} ${player.FirstName} ${player.LastName}`
        : "Unassigned"}
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2 rounded-lg bg-slate-800/70 p-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="shrink-0 rounded bg-black/40 px-2 py-1 text-xs font-bold">
            {slot.label}
          </span>
          {playerSelect}
        </div>
        {attributeDisplay.length > 0 && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 border-t border-slate-700 pt-2 text-xs">
            {attributeDisplay.map((attr) => (
              <div
                key={attr.label}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-slate-400">{attr.label}</span>
                <span className="font-semibold">{attr.value}</span>
              </div>
            ))}
          </div>
        )}
        {canModify && !isGoalieLine && zoneInputList.length > 0 && (
          <div className="grid grid-cols-2 gap-2 border-t border-slate-700 pt-2">
            {zoneInputList.map((input) => (
              <label key={input.key} className="flex flex-col gap-0.5 text-xs">
                <span className="text-slate-400">{input.label}</span>
                <input
                  aria-label={`${input.label} for ${placeholder}`}
                  type="number"
                  name={input.key}
                  disabled={!player}
                  value={player ? ((player as any)[input.key] as number) : 0}
                  onChange={ChangeInput}
                  className="w-full rounded border border-slate-500 bg-black px-1.5 py-1 text-center text-sm text-white disabled:opacity-60"
                />
              </label>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="grid w-max items-center gap-2 rounded-lg bg-slate-800/70 p-3 text-center text-sm"
      style={{ gridTemplateColumns, minWidth: "100%" }}
    >
      <strong>{slot.label}</strong>
      {playerSelect}
      {attributeDisplay.map((attr) => (
        <Text key={attr.label} variant="small" classes="font-semibold">
          {attr.value}
        </Text>
      ))}
      {canModify &&
        !isGoalieLine &&
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
