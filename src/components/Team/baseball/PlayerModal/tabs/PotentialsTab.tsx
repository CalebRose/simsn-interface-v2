import { FC, memo } from "react";
import { Text } from "../../../../../_design/Typography";
import { Border } from "../../../../../_design/Borders";
import { gradeColor } from "../../baseballColorConfig";
import type { ScoutingPlayerResponse } from "../../../../../models/baseball/baseballScoutingModels";
import type { VisibilityContext } from "../../../../../models/baseball/baseballModels";
import {
  POS_PRIMARY_POTENTIAL_GROUPS,
  POS_FIELDING_POTENTIAL_GROUP,
  POS_CATCHING_POTENTIAL_GROUP,
  PITCH_PRIMARY_POTENTIAL_GROUPS,
  PITCH_SECONDARY_POTENTIAL_GROUPS,
  POS_SECONDARY_POTENTIAL_GROUPS,
  PITCH_SUB_LABELS,
  PEER_COMPARISON_NOTE,
} from "../utils/attributeGroups";

interface PotentialsTabProps {
  potentials?: Record<string, string | null>;
  ptype: string;
  bio: ScoutingPlayerResponse["bio"];
  visibilityContext?: VisibilityContext;
  displayFormat?: string;
}

/** Renders a group of potential key/value rows */
const PotGroup: FC<{
  title: string;
  keys: { key: string; label: string }[];
  potentials: Record<string, string | null>;
  dimmed?: boolean;
}> = ({ title, keys, potentials, dimmed }) => (
  <div className={dimmed ? "opacity-50" : undefined}>
    <Text variant="xs" classes="font-semibold text-gray-400 mb-1">
      {title}
    </Text>
    <div className="space-y-0.5">
      {keys.map(({ key, label }) => {
        const val = potentials[key];
        if (val == null) return null;
        return (
          <div key={key} className="flex justify-between text-xs py-0.5">
            <span className="text-gray-400">{label}</span>
            {val === "?" ? (
              <span className="text-gray-500">?</span>
            ) : (
              <span className={`font-semibold ${gradeColor(val)}`}>{val}</span>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

/** Renders a single pitch's potentials in a column layout with pitch name */
const PitchPotCard: FC<{
  pitchName: string;
  subs: { key: string; sub: string; val: string | null }[];
  ovrKey: string;
  potentials: Record<string, string | null>;
}> = ({ pitchName, subs, ovrKey, potentials }) => {
  const ovrVal = potentials[`${ovrKey}_pot`];

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
      <div className="flex items-center gap-2 mb-1">
        <Text variant="xs" classes="font-semibold">
          {pitchName}
        </Text>
        {ovrVal != null && ovrVal !== "?" && (
          <span className={`text-xs font-semibold ${gradeColor(ovrVal)}`}>
            OVR: {ovrVal}
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        {subs.map(({ key, sub, val }) => (
          <div key={key} className="flex justify-between text-xs py-0.5">
            <span className="text-gray-400">
              {PITCH_SUB_LABELS[sub] ?? sub}
            </span>
            {val == null || val === "?" ? (
              <span className="text-gray-500">?</span>
            ) : (
              <span className={`font-semibold ${gradeColor(val)}`}>{val}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const PotentialsTab: FC<PotentialsTabProps> = memo(
  ({ potentials, ptype, bio, visibilityContext, displayFormat }) => {
    const hasPotentials = potentials && Object.keys(potentials).length > 0;
    const isHidden = displayFormat === "hidden";
    const potFuzzed = !(visibilityContext?.potentials_precise === true);

    if (isHidden && !hasPotentials) {
      return (
        <Border classes="p-3">
          <Text variant="xs" classes="text-gray-400">
            Potentials are hidden. Use scouting actions to unlock information.
          </Text>
        </Border>
      );
    }

    if (!hasPotentials) {
      return (
        <Border classes="p-3">
          <Text variant="xs" classes="text-gray-400">
            No potential data available.
          </Text>
        </Border>
      );
    }

    const isPitcher = ptype === "Pitcher";

    // Primary potential groups
    const primaryGroups = isPitcher
      ? PITCH_PRIMARY_POTENTIAL_GROUPS
      : POS_PRIMARY_POTENTIAL_GROUPS;

    // Secondary (cross-role) potential groups
    // For pitchers, fielding is also peer-compared so it goes in secondary
    const secondaryGroups = isPitcher
      ? [
          ...PITCH_SECONDARY_POTENTIAL_GROUPS,
          POS_FIELDING_POTENTIAL_GROUP,
          POS_CATCHING_POTENTIAL_GROUP,
        ]
      : POS_SECONDARY_POTENTIAL_GROUPS;

    // Fielding — only for position players
    const fieldingGroups = isPitcher
      ? []
      : [POS_FIELDING_POTENTIAL_GROUP, POS_CATCHING_POTENTIAL_GROUP];

    // Build pitch potential cards for all players
    const pitchPotSlots: {
      slot: number;
      pitchName: string;
      subs: { key: string; sub: string; val: string | null }[];
    }[] = [];

    const pitchPotKeys = Object.keys(potentials).filter((k) =>
      /^pitch\d+_.*_pot$/.test(k),
    );
    if (pitchPotKeys.length > 0) {
      const slotMap = new Map<
        number,
        { key: string; sub: string; val: string | null }[]
      >();
      for (const k of pitchPotKeys) {
        const match = k.match(/^pitch(\d+)_(.+)_pot$/);
        if (!match) continue;
        const slot = parseInt(match[1]);
        // Skip the ovr key — we display it in the header
        if (match[2] === "ovr") continue;
        if (!slotMap.has(slot)) slotMap.set(slot, []);
        slotMap
          .get(slot)!
          .push({ key: k, sub: match[2], val: potentials[k] });
      }

      // Build slots for pitches 1-5, matching order and using bio pitch names
      for (let i = 1; i <= 5; i++) {
        const pitchName = bio[`pitch${i}_name` as keyof typeof bio] as string;
        if (!pitchName) continue;
        const subs = slotMap.get(i) ?? [];
        if (subs.length > 0) {
          pitchPotSlots.push({ slot: i, pitchName, subs });
        }
      }
    }

    return (
      <div className="flex flex-col gap-3">
        {/* Primary Role Potentials */}
        <Border classes="p-3">
          <Text variant="small" classes="font-semibold mb-2">
            {isPitcher ? "Pitching" : "Player"} Potentials
          </Text>
          {potFuzzed && (
            <Text variant="xs" classes="text-gray-400 mb-2">
              Estimated values — scout for precise data
            </Text>
          )}
          {!potFuzzed && hasPotentials && (
            <Text
              variant="xs"
              classes="text-green-600 dark:text-green-400 mb-2"
            >
              Precise
            </Text>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {primaryGroups.map((group) => (
              <PotGroup
                key={group.title}
                title={group.title}
                keys={group.keys}
                potentials={potentials}
              />
            ))}
          </div>

          {/* Pitch potentials in column layout with pitch names (pitchers only — primary) */}
          {isPitcher && pitchPotSlots.length > 0 && (
            <div className="mt-3">
              <Text variant="xs" classes="font-semibold text-gray-400 mb-1">
                Pitch Potentials
              </Text>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pitchPotSlots.map(({ slot, pitchName, subs }) => (
                  <PitchPotCard
                    key={slot}
                    pitchName={pitchName}
                    subs={subs}
                    ovrKey={`pitch${slot}`}
                    potentials={potentials}
                  />
                ))}
              </div>
            </div>
          )}
        </Border>

        {/* Fielding — position players only */}
        {fieldingGroups.length > 0 && (
          <Border classes="p-3">
            <Text variant="small" classes="font-semibold mb-2">
              Fielding Potentials
            </Text>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fieldingGroups.map((group) => (
                <PotGroup
                  key={group.title}
                  title={group.title}
                  keys={group.keys}
                  potentials={potentials}
                />
              ))}
            </div>
          </Border>
        )}

        {/* Secondary (cross-role) Potentials — dimmed with disclaimer */}
        <Border classes="p-3 border-dashed">
          <Text variant="small" classes="font-semibold mb-1 opacity-60">
            {isPitcher ? "Position / Fielding" : "Pitching"} Potentials
          </Text>
          <Text
            variant="xs"
            classes="text-gray-400 dark:text-gray-500 mb-2 italic"
          >
            {PEER_COMPARISON_NOTE}
          </Text>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {secondaryGroups.map((group) => (
              <PotGroup
                key={group.title}
                title={group.title}
                keys={group.keys}
                potentials={potentials}
                dimmed
              />
            ))}
          </div>

          {/* Pitch potentials for position players (secondary/dimmed) */}
          {!isPitcher && pitchPotSlots.length > 0 && (
            <div className="mt-3 opacity-50">
              <Text variant="xs" classes="font-semibold text-gray-400 mb-1">
                Pitch Potentials
              </Text>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pitchPotSlots.map(({ slot, pitchName, subs }) => (
                  <PitchPotCard
                    key={slot}
                    pitchName={pitchName}
                    subs={subs}
                    ovrKey={`pitch${slot}`}
                    potentials={potentials}
                  />
                ))}
              </div>
            </div>
          )}
        </Border>
      </div>
    );
  },
);
