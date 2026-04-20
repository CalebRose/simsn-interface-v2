import { FC, memo } from "react";
import { Text } from "../../../../../_design/Typography";
import { Border } from "../../../../../_design/Borders";
import { ratingColor, gradeColor } from "../../baseballColorConfig";
import { AttrRow } from "../sections/AttrRow";
import type { ScoutingPlayerResponse } from "../../../../../models/baseball/baseballScoutingModels";
import type { VisibilityContext } from "../../../../../models/baseball/baseballModels";
import {
  BATTING_ATTRS,
  RUNNING_ATTRS,
  FIELDING_ATTRS,
  CATCHER_ATTRS,
  PITCHING_ATTRS,
  PITCH_SUB_LABELS,
  PEER_COMPARISON_NOTE,
} from "../utils/attributeGroups";

interface AttributesTabProps {
  pool?: string;
  letterGrades?: Record<string, string>;
  attributes?: Record<string, number>;
  ptype: string;
  bio: ScoutingPlayerResponse["bio"];
  visibilityContext?: VisibilityContext;
  displayFormat?: string;
  unlocked?: string[];
}

/** Renders a group of AttrRows with a title */
const AttrGroup: FC<{
  title: string;
  attrs: { key: string; label: string }[];
  letterGrades?: Record<string, string>;
  attributes?: Record<string, number>;
  isHidden: boolean;
  isFuzzed: boolean;
  dimmed?: boolean;
}> = ({ title, attrs, letterGrades, attributes, isHidden, isFuzzed, dimmed }) => (
  <div className={dimmed ? "opacity-50" : undefined}>
    <Text variant="xs" classes="font-semibold text-gray-400 mb-1">
      {title}
    </Text>
    <div className="space-y-0.5">
      {attrs.map((attr) => (
        <AttrRow
          key={attr.key}
          attrKey={attr.key}
          label={attr.label}
          letterGrades={letterGrades}
          attributes={attributes}
          isHidden={isHidden}
          isFuzzed={isFuzzed}
        />
      ))}
    </div>
  </div>
);

/** Renders pitch sub-abilities in a column layout matching PotentialsTab style */
const PitchCard: FC<{
  slot: number;
  pitchName: string;
  letterGrades?: Record<string, string>;
  attributes?: Record<string, number>;
  isHidden: boolean;
  isFuzzed: boolean;
}> = ({ slot, pitchName, letterGrades, attributes, isHidden, isFuzzed }) => {
  const ovrKey = `pitch${slot}_ovr`;
  const ovr = attributes?.[`${ovrKey}_display`] ?? attributes?.[ovrKey];
  const subKeys = ["pacc", "pcntrl", "pbrk", "consist"];

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
      <div className="flex items-center gap-2 mb-1">
        <Text variant="xs" classes="font-semibold">
          {pitchName}
        </Text>
        {ovr != null && (
          <span className={`text-xs font-semibold ${ratingColor(ovr)}`}>
            OVR: {ovr.toFixed(0)}
          </span>
        )}
        {!ovr && letterGrades?.[ovrKey] && (
          <span
            className={`text-xs font-semibold ${gradeColor(letterGrades[ovrKey])}`}
          >
            OVR: {letterGrades[ovrKey]}
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        {subKeys.map((sub) => {
          const key = `pitch${slot}_${sub}`;
          return (
            <AttrRow
              key={key}
              attrKey={key}
              label={PITCH_SUB_LABELS[sub] ?? sub}
              letterGrades={letterGrades}
              attributes={attributes}
              isHidden={isHidden}
              isFuzzed={isFuzzed}
            />
          );
        })}
      </div>
    </div>
  );
};

export const AttributesTab: FC<AttributesTabProps> = memo(
  ({
    pool,
    letterGrades,
    attributes,
    ptype,
    bio,
    visibilityContext,
    displayFormat,
    unlocked = [],
  }) => {
    const hasLetterGrades =
      letterGrades && Object.keys(letterGrades).length > 0;
    const hasNumeric = attributes && Object.keys(attributes).length > 0;
    const isHidden =
      displayFormat === "hidden" || (pool === "hs" && !displayFormat);
    const isPrecise =
      visibilityContext?.attributes_precise === true ||
      displayFormat === "20-80" ||
      unlocked.includes("pro_attrs_precise") ||
      unlocked.includes("draft_attrs_precise");
    const isFuzzed = !isPrecise;

    if (isHidden && !hasLetterGrades && !hasNumeric) {
      return (
        <Border classes="p-3">
          <Text variant="xs" classes="text-gray-400">
            Attributes are hidden. Use scouting actions to unlock information.
          </Text>
        </Border>
      );
    }

    if (!hasLetterGrades && !hasNumeric) return null;

    const isPitcher = ptype === "Pitcher";

    // Primary groups: the player's main role attributes
    const primaryGroups = isPitcher
      ? [{ title: "Pitching", attrs: PITCHING_ATTRS }]
      : [
          { title: "Batting", attrs: BATTING_ATTRS },
          { title: "Running", attrs: RUNNING_ATTRS },
        ];

    // Secondary groups: cross-role attributes (grayed, with disclaimer)
    // For pitchers, fielding is also peer-compared so it goes in secondary
    const secondaryGroups = isPitcher
      ? [
          { title: "Batting", attrs: BATTING_ATTRS },
          { title: "Running", attrs: RUNNING_ATTRS },
          { title: "Fielding", attrs: FIELDING_ATTRS },
          { title: "Catching", attrs: CATCHER_ATTRS },
        ]
      : [{ title: "Pitching", attrs: PITCHING_ATTRS }];

    // Fielding section — only for position players (universal for them)
    const fieldingGroups = isPitcher
      ? []
      : [
          { title: "Fielding", attrs: FIELDING_ATTRS },
          { title: "Catching", attrs: CATCHER_ATTRS },
        ];

    // Pitch slots — all players can have pitches
    const pitchSlots = [1, 2, 3, 4, 5].filter(
      (i) => bio[`pitch${i}_name` as keyof typeof bio],
    );

    return (
      <div className="flex flex-col gap-3">
        {/* Primary Role Attributes */}
        <Border classes="p-3">
          <Text variant="small" classes="font-semibold mb-2">
            {isPitcher ? "Pitching" : "Player"} Attributes
            {hasNumeric && hasLetterGrades && (
              <span className="text-xs text-gray-400 font-normal ml-1">
                (Grade / Numeric)
              </span>
            )}
          </Text>
          {isFuzzed && (
            <Text variant="xs" classes="text-gray-400 mb-2">
              Estimated values — scout for precise data
            </Text>
          )}
          {!isFuzzed && hasNumeric && (
            <Text
              variant="xs"
              classes="text-green-600 dark:text-green-400 mb-2"
            >
              Precise
            </Text>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {primaryGroups.map((group) => (
              <AttrGroup
                key={group.title}
                title={group.title}
                attrs={group.attrs}
                letterGrades={letterGrades}
                attributes={attributes}
                isHidden={isHidden}
                isFuzzed={isFuzzed}
              />
            ))}
          </div>

          {/* Pitch sub-abilities in column layout (pitchers only — primary) */}
          {isPitcher && pitchSlots.length > 0 && (
            <div className="mt-3">
              <Text variant="xs" classes="font-semibold text-gray-400 mb-1">
                Pitches
              </Text>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pitchSlots.map((slot) => {
                  const pitchName = bio[
                    `pitch${slot}_name` as keyof typeof bio
                  ] as string;
                  return (
                    <PitchCard
                      key={slot}
                      slot={slot}
                      pitchName={pitchName}
                      letterGrades={letterGrades}
                      attributes={attributes}
                      isHidden={isHidden}
                      isFuzzed={isFuzzed}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </Border>

        {/* Fielding — position players only */}
        {fieldingGroups.length > 0 && (
          <Border classes="p-3">
            <Text variant="small" classes="font-semibold mb-2">
              Fielding
            </Text>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fieldingGroups.map((group) => (
                <AttrGroup
                  key={group.title}
                  title={group.title}
                  attrs={group.attrs}
                  letterGrades={letterGrades}
                  attributes={attributes}
                  isHidden={isHidden}
                  isFuzzed={isFuzzed}
                />
              ))}
            </div>
          </Border>
        )}

        {/* Secondary (cross-role) Attributes — dimmed with disclaimer */}
        <Border classes="p-3 border-dashed">
          <Text variant="small" classes="font-semibold mb-1 opacity-60">
            {isPitcher ? "Position / Fielding" : "Pitching"} Attributes
          </Text>
          <Text
            variant="xs"
            classes="text-gray-400 dark:text-gray-500 mb-2 italic"
          >
            {PEER_COMPARISON_NOTE}
          </Text>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {secondaryGroups.map((group) => (
              <AttrGroup
                key={group.title}
                title={group.title}
                attrs={group.attrs}
                letterGrades={letterGrades}
                attributes={attributes}
                isHidden={isHidden}
                isFuzzed={isFuzzed}
                dimmed
              />
            ))}
          </div>

          {/* Pitch sub-abilities for position players (secondary/dimmed) */}
          {!isPitcher && pitchSlots.length > 0 && (
            <div className="mt-3 opacity-50">
              <Text variant="xs" classes="font-semibold text-gray-400 mb-1">
                Pitches
              </Text>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pitchSlots.map((slot) => {
                  const pitchName = bio[
                    `pitch${slot}_name` as keyof typeof bio
                  ] as string;
                  return (
                    <PitchCard
                      key={slot}
                      slot={slot}
                      pitchName={pitchName}
                      letterGrades={letterGrades}
                      attributes={attributes}
                      isHidden={isHidden}
                      isFuzzed={isFuzzed}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </Border>
      </div>
    );
  },
);
