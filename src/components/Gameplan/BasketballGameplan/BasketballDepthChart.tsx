import { FC, Fragment, useMemo, useState } from "react";
import {
  CollegeLineup,
  CollegePlayer,
  NBALineup,
  NBAPlayer,
} from "../../../models/basketballModels";
import { League, SimCBB } from "../../../_constants/constants";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Modal } from "../../../_design/Modal";
import { Text } from "../../../_design/Typography";
import { getCBBLetterGrade } from "../../../_utility/getLetterGrade";
import { getYear } from "../../../_utility/getYear";
import { getRatingBgColor } from "../FootballGameplan/Utils/GameplanPlayerUtils";
import {
  getPriorityCBBAttributes,
  getPriorityNBAAttributes,
} from "../../Team/TeamPageUtils";
import PlayerPicture from "../../../_utility/usePlayerFaces";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { getRatingColor } from "../FootballGameplan/Utils/UIUtils";

type BasketballPlayer = CollegePlayer | NBAPlayer;
type Lineup = CollegeLineup | NBALineup;
type StringKey = "FirstStringID" | "SecondStringID" | "ThirdStringID";

const stringSlots: { key: StringKey; label: string; abbreviation: string }[] = [
  { key: "FirstStringID", label: "1", abbreviation: "FS" },
  { key: "SecondStringID", label: "2", abbreviation: "SS" },
  { key: "ThirdStringID", label: "3", abbreviation: "TS" },
];

const statColumns = [
  "AGI",
  "INS",
  "MID",
  "3PT",
  "FT",
  "BH",
  "STL",
  "REB",
  "BLK",
  "INT D",
  "PER D",
];

interface BasketballDepthChartProps {
  selectedPositionIndex: number;
  lineupFormation: string[];
  selectedTeamLineups: Lineup[];
  selectedRosterMap: Record<number, BasketballPlayer>;
  selectedTeamRoster: BasketballPlayer[];
  team: any;
  league: League;
  canModify: boolean;
  ChangeLineupInput: (
    playerID: number,
    key: string,
    value: number,
    index: number,
  ) => void;
  SwapLineupPlayers: (
    index: number,
    firstKey: string,
    secondKey: string,
  ) => void;
}

const displayRating = (
  player: BasketballPlayer,
  value: number,
  league: League,
) => (league === SimCBB ? getCBBLetterGrade(value, player.Year) : value);
const overallBadgeClass = (
  overall: number | string,
  player: BasketballPlayer,
  league: League,
) => {
  if (league === SimCBB) return getRatingBgColor(overall);
  if (player.Overall >= 40) return "bg-[#00ACC9]";
  if (player.Overall >= 35) return "bg-[#00A666]";
  if (player.Overall >= 30) return "bg-[#D7C12C]";
  if (player.Overall >= 25) return "bg-[#F18831]";
  return "bg-[#AC2B27]";
};

const overallTextClass = (
  overall: number | string,
  player: BasketballPlayer,
  league: League,
) => {
  if (league === SimCBB) return getRatingColor(overall, league);
  if (player.Overall >= 40) return "text-[#00ACC9]";
  if (player.Overall >= 35) return "text-[#00A666]";
  if (player.Overall >= 30) return "text-[#D7C12C]";
  if (player.Overall >= 25) return "text-[#F18831]";
  return "text-[#AC2B27]";
};

const attributeTextClass = (value: number | string, league: League) => {
  if (league === SimCBB) return getRatingColor(value, league);
  if (typeof value !== "number") return "text-white";
  if (value >= 40) return "text-[#00ACC9]";
  if (value >= 35) return "text-[#00A666]";
  if (value >= 30) return "text-[#D7C12C]";
  if (value >= 25) return "text-[#F18831]";
  return "text-[#AC2B27]";
};

const eligibleForPosition = (player: BasketballPlayer, position: string) =>
  position === "G"
    ? player.Position === "G" || player.Position === "F"
    : position === "C"
      ? player.Position === "C" || player.Position === "F"
      : true;

export const BasketballDepthChart: FC<BasketballDepthChartProps> = ({
  selectedPositionIndex,
  lineupFormation,
  selectedTeamLineups,
  selectedRosterMap,
  selectedTeamRoster,
  team,
  league,
  canModify,
  ChangeLineupInput,
  SwapLineupPlayers,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAttributes, setShowAttributes] = useState(false);
  const [targetKey, setTargetKey] = useState<StringKey | null>(null);
  const lineup = selectedTeamLineups[selectedPositionIndex];
  const position = lineupFormation[selectedPositionIndex];
  const slotLabel = `${position}${position === "G" ? selectedPositionIndex + 1 : position === "F" ? selectedPositionIndex - 1 : 1}`;

  const availablePlayers = useMemo(
    () =>
      selectedTeamRoster.filter((player) => {
        if (!eligibleForPosition(player, position)) return false;
        const usedInFirstElsewhere =
          targetKey === "FirstStringID" &&
          selectedTeamLineups.some(
            (other, index) =>
              index !== selectedPositionIndex &&
              other.FirstStringID === player.ID,
          );
        const alreadyAssignedToThisPosition =
          lineup && stringSlots.some((slot) => lineup[slot.key] === player.ID);
        return !usedInFirstElsewhere && !alreadyAssignedToThisPosition;
      }),
    [
      lineup,
      position,
      selectedPositionIndex,
      selectedTeamLineups,
      selectedTeamRoster,
      targetKey,
    ],
  );

  const openModal = () => {
    setTargetKey(null);
    setShowAttributes(false);
    setIsModalOpen(true);
  };
  const selectSlot = (key: StringKey) => {
    if (!targetKey) setTargetKey(key);
    else if (targetKey === key) setTargetKey(null);
    else {
      SwapLineupPlayers(selectedPositionIndex, targetKey, key);
      setTargetKey(null);
    }
  };
  const selectAvailablePlayer = (player: BasketballPlayer) => {
    if (!targetKey || !lineup) return;
    ChangeLineupInput(
      lineup[targetKey],
      targetKey,
      player.ID,
      selectedPositionIndex,
    );
    setTargetKey(null);
  };

  if (!lineup) return null;

  return (
    <>
      <div className="mb-3 flex w-full items-center gap-3">
        <div className="text-left">
          <Text variant="h5" classes="text-left font-semibold">
            {slotLabel} Depth Chart
          </Text>
        </div>
        {canModify && (
          <Button size="sm" classes="ml-auto" onClick={openModal}>
            Swap
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-330">
          <div className="grid grid-cols-[2rem_minmax(220px,1fr)_2.5rem_repeat(11,3.25rem)_repeat(5,4.75rem)] items-end gap-2 border-b border-slate-600 px-3 pb-2 text-center text-xs font-semibold text-slate-300">
            <span>#</span>
            <span className="text-left">Player</span>
            <span>OVR</span>
            {statColumns.map((label) => (
              <span key={label}>{label}</span>
            ))}
            <span>Inside</span>
            <span>Midrange</span>
            <span>3 Pt</span>
            <span>Shot Total</span>
            <span>Usage</span>
          </div>
          <div className="space-y-2 pt-2">
            {stringSlots.map((slot) => (
              <DepthRow
                key={slot.key}
                label={slot.label}
                player={selectedRosterMap[lineup[slot.key]]}
                playerID={lineup[slot.key]}
                lineup={lineup}
                abbreviation={slot.abbreviation}
                team={team}
                league={league}
                canModify={canModify}
                lineupIndex={selectedPositionIndex}
                ChangeLineupInput={ChangeLineupInput}
              />
            ))}
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Manage ${slotLabel} Depth Chart`}
        maxWidth="max-w-6xl"
      >
        <div className="mb-4 flex items-center justify-center gap-3 rounded-lg bg-slate-800/70 p-3">
          <Text variant="body" classes="font-semibold">
            View:
          </Text>
          <ButtonGroup>
            <Button
              size="xs"
              isSelected={!showAttributes}
              onClick={() => setShowAttributes(false)}
            >
              Player Cards
            </Button>
            <Button
              size="xs"
              isSelected={showAttributes}
              onClick={() => setShowAttributes(true)}
            >
              Attributes
            </Button>
          </ButtonGroup>
        </div>
        <div className="max-h-[70vh] space-y-6 overflow-y-auto">
          <div>
            <Text variant="h5" classes="mb-3 font-semibold">
              Current Position Levels ↕
            </Text>
            <div className="mb-3 rounded-lg bg-[#23439b] p-3 text-center text-sm text-slate-200">
              {targetKey
                ? `${slotLabel} ${stringSlots.find((slot) => slot.key === targetKey)?.label} selected. Choose another level to swap, or choose an eligible player.`
                : "Select a position level or an available player to begin swapping."}
            </div>
            <div
              className={`grid gap-3 ${showAttributes ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"}`}
            >
              {stringSlots.map((slot) => (
                <ModalPlayerCard
                  key={slot.key}
                  player={selectedRosterMap[lineup[slot.key]]}
                  level={`${slotLabel}-${slot.label}S`}
                  selected={targetKey === slot.key}
                  showAttributes={showAttributes}
                  team={team}
                  league={league}
                  onClick={() => selectSlot(slot.key)}
                  onRemove={
                    canModify &&
                    slot.key === "ThirdStringID" &&
                    lineup[slot.key]
                      ? () => {
                          ChangeLineupInput(
                            lineup[slot.key],
                            slot.key,
                            0,
                            selectedPositionIndex,
                          );
                          setTargetKey(null);
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
          <div>
            <Text variant="h5" classes="mb-3 font-semibold">
              Available Players
            </Text>
            <div
              className={`grid gap-3 ${showAttributes ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"}`}
            >
              {availablePlayers.map((player) => (
                <ModalPlayerCard
                  key={player.ID}
                  player={player}
                  showAttributes={showAttributes}
                  team={team}
                  league={league}
                  onClick={() => selectAvailablePlayer(player)}
                />
              ))}
            </div>
            {!availablePlayers.length && (
              <Text variant="body" classes="py-8 text-center text-slate-400">
                No available players for this position.
              </Text>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

const DepthRow: FC<{
  label: string;
  player?: BasketballPlayer;
  playerID: number;
  lineup: Lineup;
  abbreviation: string;
  team: any;
  league: League;
  canModify: boolean;
  lineupIndex: number;
  ChangeLineupInput: (
    playerID: number,
    key: string,
    value: number,
    index: number,
  ) => void;
}> = ({
  label,
  player,
  playerID,
  lineup,
  abbreviation,
  team,
  league,
  canModify,
  lineupIndex,
  ChangeLineupInput,
}) => {
  if (!player)
    return (
      <div className="grid grid-cols-[2rem_1fr] gap-2 rounded-lg bg-slate-800/70 p-3">
        <strong>{label}</strong>
        <span className="text-slate-400">Empty</span>
      </div>
    );
  const values = [
    player.Agility,
    player.InsideShooting,
    player.MidRangeShooting,
    player.ThreePointShooting,
    player.FreeThrow,
    player.Ballwork,
    player.Stealing,
    player.Rebounding,
    player.Blocking,
    player.InteriorDefense,
    player.PerimeterDefense,
  ];
  const overall = displayRating(player, player.Overall, league);
  const year =
    league === SimCBB
      ? getYear(
          (player as CollegePlayer).Year,
          (player as CollegePlayer).IsRedshirt,
        )
      : `${(player as NBAPlayer).Year || 0} Exp`;
  const allocationKeys = [
    "InsideProportion",
    "MidProportion",
    "ThreeProportion",
    "Minutes",
  ];
  const shotTotal =
    lineup[`${abbreviation}InsideProportion`] +
    lineup[`${abbreviation}MidProportion`] +
    lineup[`${abbreviation}ThreeProportion`];
  return (
    <div className="grid grid-cols-[2rem_minmax(220px,1fr)_2.5rem_repeat(11,3.25rem)_repeat(5,4.75rem)] items-center gap-2 rounded-lg bg-slate-800/70 p-3 text-center text-sm">
      <strong>{label}</strong>
      <div className="text-left">
        <span>
          {player.Archetype} {player.Position}{" "}
        </span>
        <strong>
          {player.FirstName} {player.LastName}
        </strong>
        <span>
          , <em>{year}</em>
        </span>
      </div>
      <span
        className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-white ${overallBadgeClass(overall, player, league)}`}
        style={{
          WebkitTextStroke: "0.5px black",
          textShadow: "0 1px 1px black",
        }}
      >
        {overall}
      </span>
      {values.map((value, index) => (
        <strong key={index}>{displayRating(player, value, league)}</strong>
      ))}
      {allocationKeys.map((key) => (
        <Fragment key={key}>
          {key === "Minutes" && (
            <strong
              className={
                shotTotal === 100 ? "text-green-400" : "text-amber-400"
              }
            >
              {shotTotal}%
            </strong>
          )}
          <input
            aria-label={`${key} for ${player.FirstName} ${player.LastName}`}
            disabled={!canModify}
            type="number"
            value={lineup[`${abbreviation}${key}`] as number}
            onChange={(event) =>
              ChangeLineupInput(
                playerID,
                `${abbreviation}${key}`,
                Number(event.target.value),
                lineupIndex,
              )
            }
            className="w-14 justify-self-center rounded border border-slate-500 bg-black px-1.5 py-1 text-center text-sm text-white disabled:opacity-60"
          />
        </Fragment>
      ))}
    </div>
  );
};

const ModalPlayerCard: FC<{
  player?: BasketballPlayer;
  level?: string;
  selected?: boolean;
  showAttributes: boolean;
  team: any;
  league: League;
  onClick: () => void;
  onRemove?: () => void;
}> = ({
  player,
  level,
  selected,
  showAttributes,
  team,
  league,
  onClick,
  onRemove,
}) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    }}
    className={`relative cursor-pointer select-none text-left transition-transform hover:scale-[1.02] ${selected ? "animate-pulse rounded-lg ring-2 ring-blue-400" : ""}`}
  >
    {!player ? (
      <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-slate-500 bg-slate-800/70 text-slate-400">
        Empty
      </div>
    ) : showAttributes ? (
      <AttributeCard player={player} team={team} league={league} />
    ) : (
      <PlayerCard player={player} team={team} league={league} />
    )}
    {level && (
      <>
        <span className="absolute -left-1 -top-2 rounded-full bg-blue-500 px-1.5 py-1 text-xs font-bold text-white">
          {level}
        </span>
        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-sm bg-blue-500 px-2 py-1 text-xs font-semibold text-white">
          {selected ? "SELECTED" : "SWAP"}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            className="absolute -bottom-3 right-0 rounded-sm bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-500"
          >
            Remove
          </button>
        )}
      </>
    )}
  </div>
);

const PlayerCard: FC<{
  player: BasketballPlayer;
  team: any;
  league: League;
}> = ({ player, team, league }) => {
  const overall = displayRating(player, player.Overall, league);
  const primary = team?.ColorOne || "#1e3a8a";
  const accent = team?.ColorThree || "#ffffff";
  const textColor = getTextColorBasedOnBg(primary);
  return (
    <div
      className="relative h-40 overflow-hidden rounded-lg border-2 border-black p-2 text-center"
      style={{ backgroundColor: primary, backgroundSize: "4px 4px" }}
    >
      <span className="absolute left-0 top-0 rounded-br-md bg-black/80 px-1 py-0.5 text-xs font-bold text-white">
        {player.Position}
      </span>
      <span
        className={`absolute right-0 top-0 rounded-bl-md bg-black/80 px-1 py-0.5 text-xs font-bold ${overallTextClass(overall, player, league)}`}
      >
        {overall}
      </span>
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="mx-auto mt-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white [&_svg]:h-full [&_svg]:w-full">
          <PlayerPicture
            playerID={player.ID}
            player={player}
            team={team}
            league={league}
            classes="h-full w-full"
          />
        </div>
        <div className="px-1">
          <strong
            className={`block truncate text-xs ${textColor}`}
            style={{
              textShadow: textColor.includes("white")
                ? "1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black"
                : "1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white",
            }}
          >
            {player.FirstName}
          </strong>
          <strong
            className={`block truncate text-xs ${textColor}`}
            style={{
              textShadow: textColor.includes("white")
                ? "1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black"
                : "1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white",
            }}
          >
            {player.LastName}
          </strong>
          <span
            className={`mt-1 block rounded-lg bg-black/55 px-1 py-0.5 text-xs font-semibold ${textColor}`}
          >
            {player.Archetype}
          </span>
        </div>
      </div>
    </div>
  );
};

const AttributeCard: FC<{
  player: BasketballPlayer;
  team: any;
  league: League;
}> = ({ player, team, league }) => {
  const attributes =
    league === SimCBB
      ? getPriorityCBBAttributes(player as CollegePlayer)
      : getPriorityNBAAttributes(player as NBAPlayer);
  const primary = team?.ColorOne || "#1e3a8a";
  const textColor = getTextColorBasedOnBg(primary);
  const overall = displayRating(player, player.Overall, league);
  const abbreviations: Record<string, string> = {
    Agility: "AGI",
    "Inside Shooting": "INS",
    "Mid Range Shooting": "MID",
    "MidRange Shooting": "MID",
    "3pt Shooting": "3PT",
    "Free Throw": "FT",
    Ballwork: "BH",
    Stealing: "STL",
    Rebounding: "REB",
    Blocking: "BLK",
    "Int. Defense": "INT D",
    "Per. Defense": "PER D",
  };
  return (
    <div
      className="relative h-52 overflow-hidden rounded-lg border-2 border-black p-2"
      style={{ backgroundColor: primary }}
    >
      <span className="absolute left-1 top-1 rounded-sm bg-black/85 px-1.5 py-0.5 text-xs font-bold text-white">
        {player.Position}
      </span>
      <span
        className={`absolute right-1 top-1 rounded-sm bg-black/85 px-1.5 py-0.5 text-xs font-bold ${overallTextClass(overall, player, league)}`}
      >
        {overall}
      </span>
      <div
        className={`absolute left-10 right-10 top-1 text-center text-xs ${textColor}`}
        style={{
          textShadow: textColor.includes("white")
            ? "1px 1px 0 black, -1px -1px 0 black"
            : "1px 1px 0 white, -1px -1px 0 white",
        }}
      >
        <strong className="block truncate">{player.FirstName}</strong>
        <strong className="block truncate">{player.LastName}</strong>
      </div>
      <div className="mt-10 grid grid-cols-4 gap-1 text-center text-[10px]">
        {attributes.slice(0, 11).map((attribute) => (
          <span key={attribute.label} className="rounded-sm bg-black/70 p-1">
            <span className="block text-[9px] font-semibold text-slate-100">
              {abbreviations[attribute.label] || attribute.label}
            </span>
            <strong
              className={`text-xs ${attributeTextClass(attribute.value, league)}`}
              style={{
                WebkitTextStroke: "0.3px black",
                textShadow: "0 1px 1px black",
              }}
            >
              {attribute.value}
            </strong>
          </span>
        ))}
      </div>
    </div>
  );
};
