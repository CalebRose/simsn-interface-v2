import { FC } from "react";
import { Player, PlayerRatings, DisplayValue } from "../../../models/baseball/baseballModels";
import { ratingColor, gradeColor, staminaColor } from "../../Team/baseball/baseballColorConfig";

export { ratingColor, staminaColor };

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
        {text}
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

// ── StaminaChip — shows current fatigue level (text badge) ──────────
export const StaminaChip: FC<{ player: Player }> = ({ player }) => {
  const stam = player.stamina ?? 100;
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-semibold bg-gray-700/50 ${staminaColor(stam)}`}>
      Stam: {stam}
    </span>
  );
};

// ── StaminaBar — graphical bar showing stamina fill level ───────────

const staminaBarColor = (v: number): string => {
  if (v >= 90) return "bg-green-500";
  if (v >= 70) return "bg-green-400";
  if (v >= 50) return "bg-yellow-500";
  if (v >= 30) return "bg-orange-500";
  return "bg-red-500";
};

export const StaminaBar: FC<{ player: Player; label?: string }> = ({ player, label }) => {
  const stam = player.stamina ?? 100;
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-gray-400 shrink-0">{label}</span>}
      <div className="flex-1 h-3 rounded-full bg-gray-700 overflow-hidden min-w-[60px]">
        <div
          className={`h-full rounded-full transition-all ${staminaBarColor(stam)}`}
          style={{ width: `${stam}%` }}
        />
      </div>
      <span className={`text-xs font-semibold w-6 text-right ${staminaColor(stam)}`}>{stam}</span>
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
