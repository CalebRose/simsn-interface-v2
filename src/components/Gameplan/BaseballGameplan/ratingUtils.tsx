import { FC } from "react";
import { Player, PlayerRatings, DisplayValue } from "../../../models/baseball/baseballModels";
import { letterGradeToNumeric } from "../../../_utility/baseballHelpers";

// ── Grade color for letter grades ───────────────────────────────────
const gradeColor = (grade: string): string => {
  const n = letterGradeToNumeric(grade);
  return ratingColor(n);
};

// ── Rating color thresholds (matches BaseballTeamPage) ──────────────
export const ratingColor = (v: number): string => {
  if (v >= 70) return "text-green-600 dark:text-green-400 font-semibold";
  if (v >= 60) return "text-blue-600 dark:text-blue-400";
  if (v >= 50) return "";
  if (v >= 40) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

/** Color for a DisplayValue (number, letter grade string, or null). */
export const displayValueColor = (v: DisplayValue): string => {
  if (v == null) return "text-gray-500";
  if (typeof v === "string") return gradeColor(v);
  return ratingColor(v);
};

// ── RatingChip — small inline badge with color-coded value ──────────
interface RatingChipProps {
  value: DisplayValue;
  label?: string;
  isFuzzed?: boolean;
}

export const RatingChip: FC<RatingChipProps> = ({ value, label, isFuzzed }) => {
  if (value == null) {
    return label ? (
      <span className="inline-flex items-center gap-0.5 text-xs text-gray-500">
        {label}: <span>—</span>
      </span>
    ) : null;
  }
  const text = String(value);
  return (
    <span className="inline-flex items-center gap-0.5 text-xs" title={isFuzzed ? "Estimated" : undefined}>
      {label && <span className="text-gray-400">{label}:</span>}
      <span className={typeof value === "string" ? gradeColor(value) : ratingColor(value)}>
        {isFuzzed ? `~${text}` : text}
      </span>
    </span>
  );
};

// ── PlayerAttributeRow — row of RatingChips for a player ────────────
interface AttrDef {
  key: keyof PlayerRatings;
  label: string;
}

interface PlayerAttributeRowProps {
  player: Player;
  attributes: AttrDef[];
  isFuzzed?: boolean;
}

export const PlayerAttributeRow: FC<PlayerAttributeRowProps> = ({
  player,
  attributes,
  isFuzzed,
}) => {
  const fuzzed = player.visibility_context
    ? !player.visibility_context.attributes_precise
    : isFuzzed;
  return (
    <div className="flex flex-wrap gap-2">
      {attributes.map((attr) => (
        <RatingChip
          key={attr.key}
          label={attr.label}
          value={player.ratings[attr.key] as DisplayValue}
          isFuzzed={fuzzed}
        />
      ))}
    </div>
  );
};

// ── PitchOverallChips — pitch quality indicators ────────────────────
export const PitchOverallChips: FC<{ player: Player }> = ({ player }) => {
  const pitches = [
    { name: player.pitch1_name, ovr: player.ratings.pitch1_ovr },
    { name: player.pitch2_name, ovr: player.ratings.pitch2_ovr },
    { name: player.pitch3_name, ovr: player.ratings.pitch3_ovr },
    { name: player.pitch4_name, ovr: player.ratings.pitch4_ovr },
    { name: player.pitch5_name, ovr: player.ratings.pitch5_ovr },
  ].filter((p) => p.name);

  if (pitches.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {pitches.map((p, i) => (
        <span
          key={i}
          className={`text-xs px-1 py-0.5 rounded bg-gray-700/50 ${
            p.ovr != null ? displayValueColor(p.ovr) : "text-gray-400"
          }`}
          title={p.name ?? undefined}
        >
          {p.name}: {p.ovr ?? "—"}
        </span>
      ))}
    </div>
  );
};
