import { useState, useEffect, useMemo, useCallback } from "react";
import { Text } from "../../../../_design/Typography";
import { Button, PillButton, ButtonGroup } from "../../../../_design/Buttons";
import { SelectOption } from "../../../../_hooks/useSelectStyles";
import { Player, PlayerRatings, DisplayValue } from "../../../../models/baseball/baseballModels";
import {
  PlayerStrategy,
  PlateApproach,
  PitchingApproach,
  BaserunningApproach,
  UsagePreference,
  PullTendency,
} from "../../../../models/baseball/baseballGameplanModels";
import { BaseballService } from "../../../../_services/baseballService";
import { displayLevel } from "../../../../_utility/baseballHelpers";
import {
  PlateApproachOptions,
  PitchingApproachOptions,
  BaserunningApproachOptions,
  UsagePreferenceOptions,
  PullTendencyOptions,
  BATTING_DISPLAY_ATTRS,
  SP_DISPLAY_ATTRS,
  RP_DISPLAY_ATTRS,
} from "../BaseballGameplanConstants";
import { ratingColor, displayValueColor, PlayerAttributeRow, PitchOverallChips, StaminaBar } from "../ratingUtils";
import { Tooltip } from "../playerDropdownUtils";

interface PlayerStrategyTabProps {
  orgId: number;
  players: Player[];
  levelLabel: string;
}

const DEFAULT_STRATEGY: Omit<PlayerStrategy, "org_id" | "player_id"> = {
  id: null,
  plate_approach: "normal",
  pitching_approach: "normal",
  baserunning_approach: "normal",
  usage_preference: "normal",
  stealfreq: 1.87,
  pickofffreq: 1.0,
  pitchchoices: [3, 3, 3, 3, 3],
  pitchpull: null,
  pulltend: null,
};

// Position rating keys to check for best position badge
const POSITION_RATING_KEYS: { key: keyof PlayerRatings; label: string }[] = [
  { key: "c_rating", label: "C" },
  { key: "fb_rating", label: "1B" },
  { key: "sb_rating", label: "2B" },
  { key: "tb_rating", label: "3B" },
  { key: "ss_rating", label: "SS" },
  { key: "lf_rating", label: "LF" },
  { key: "cf_rating", label: "CF" },
  { key: "rf_rating", label: "RF" },
  { key: "dh_rating", label: "DH" },
  { key: "sp_rating", label: "SP" },
  { key: "rp_rating", label: "RP" },
];

// Pitch OVR rating keys for the weight UI
const PITCH_OVR_KEYS: (keyof PlayerRatings)[] = [
  "pitch1_ovr", "pitch2_ovr", "pitch3_ovr", "pitch4_ovr", "pitch5_ovr",
];

// Athletic/baserunning attributes for the player summary card
const ATHLETIC_DISPLAY_ATTRS: { key: keyof PlayerRatings; label: string }[] = [
  { key: "speed_display", label: "Speed" },
  { key: "baserunning_display", label: "BsRun" },
  { key: "basereaction_display", label: "BsRct" },
];

// ── Preset definitions ──

const STEAL_PRESETS = [
  { label: "None", value: 0 },
  { label: "Some", value: 0.95 },
  { label: "Normal", value: 1.87 },
  { label: "More", value: 3.8 },
  { label: "Frequent", value: 6 },
];

const PICKOFF_PRESETS = [
  { label: "None", value: 0 },
  { label: "Some", value: 0.5 },
  { label: "Normal", value: 1 },
  { label: "More", value: 2 },
  { label: "Frequent", value: 5 },
];

const PITCH_PULL_PRESETS: SelectOption[] = [
  { value: "", label: "Default" },
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

const PITCH_WEIGHT_PRESETS = [
  { label: "None", value: 0 },
  { label: "Less", value: 1 },
  { label: "Normal", value: 3 },
  { label: "More", value: 5 },
];

export const PlayerStrategyTab = ({ orgId, players, levelLabel }: PlayerStrategyTabProps) => {
  const [strategies, setStrategies] = useState<PlayerStrategy[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [editing, setEditing] = useState<PlayerStrategy | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Filtered players
  const filteredPlayers = useMemo(() => {
    return players
      .filter((p) => filterType === "all" || p.ptype === filterType)
      .filter(
        (p) =>
          !searchTerm ||
          `${p.firstname} ${p.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => a.lastname.localeCompare(b.lastname));
  }, [players, filterType, searchTerm]);

  // Load all strategies on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await BaseballService.GetOrgPlayerStrategies(orgId);
        if (!cancelled) {
          setStrategies(data.strategies ?? []);
        }
      } catch {
        // API might not have data yet
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [orgId]);

  const selectPlayer = useCallback(
    (playerId: number) => {
      setSelectedPlayerId(playerId);
      const existing = strategies.find((s) => s.player_id === playerId);
      if (existing) {
        setEditing({ ...existing });
      } else {
        setEditing({
          ...DEFAULT_STRATEGY,
          org_id: orgId,
          player_id: playerId,
        });
      }
      setMessage("");
    },
    [strategies, orgId],
  );

  const selectedPlayer = useMemo(() => {
    return players.find((p) => p.id === selectedPlayerId) ?? null;
  }, [players, selectedPlayerId]);

  const updateEditing = (updates: Partial<PlayerStrategy>) => {
    setEditing((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const handleSave = async () => {
    if (!editing || !selectedPlayerId) return;
    setIsSaving(true);
    setMessage("");
    try {
      const { id: _id, org_id: _oid, player_id: _pid, user_id: _uid, ...payload } = editing;
      const saved = await BaseballService.SavePlayerStrategy(orgId, selectedPlayerId, payload);

      // Merge: keep the user's editing values, but adopt the id/metadata from the response
      // so that future saves are UPDATEs rather than INSERTs.
      const merged: PlayerStrategy = {
        ...editing,
        id: saved.id,
        org_id: saved.org_id ?? orgId,
        player_id: saved.player_id ?? selectedPlayerId,
      };

      setStrategies((prev) => {
        const idx = prev.findIndex((s) => s.player_id === selectedPlayerId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = merged;
          return updated;
        }
        return [...prev, merged];
      });
      setEditing(merged);

      // Detect if the backend returned stale data
      const COMPARE_KEYS: (keyof PlayerStrategy)[] = [
        "plate_approach", "pitching_approach", "baserunning_approach",
        "usage_preference", "stealfreq", "pickofffreq", "pulltend", "pitchpull",
      ];
      const mismatch = COMPARE_KEYS.some((k) => {
        const sent = (payload as any)[k];
        const returned = (saved as any)[k];
        return sent !== returned && !(sent == null && returned == null);
      });
      const pitchMismatch = JSON.stringify(payload.pitchchoices) !== JSON.stringify(saved.pitchchoices);

      if (mismatch || pitchMismatch) {
        console.warn("[PlayerStrategy] Response values differ from sent payload", { sent: payload, returned: saved });
        setMessage("Saved — but server returned different values. Refresh to verify.");
      } else {
        setMessage("Saved successfully");
      }
    } catch (err: any) {
      const detail = err?.message && err.message !== "Failed to fetch"
        ? err.message
        : "Unknown error";
      setMessage(`Failed to save: ${detail}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  // Get the best position rating for player list badges
  const getBestRating = (p: Player): { label: string; value: number | string } | null => {
    if (p.ptype === "Pitcher") {
      const sp = p.ratings.sp_rating;
      if (sp != null) return { label: "SP", value: sp };
      return null;
    }
    let best: { label: string; value: number | string } | null = null;
    for (const { key, label } of POSITION_RATING_KEYS) {
      const val = p.ratings[key] as number | string | null;
      if (val == null) continue;
      if (best === null) {
        best = { label, value: val };
      } else {
        const numVal = typeof val === "string" ? 0 : val;
        const numBest = typeof best.value === "string" ? 0 : best.value;
        if (numVal > numBest) best = { label, value: val };
      }
    }
    return best;
  };

  if (isLoading) {
    return <Text variant="body-small" classes="text-gray-400">Loading player strategies...</Text>;
  }

  return (
    <div>
      <Text variant="h5" classes="font-semibold mb-2">
        Player Settings — {displayLevel(levelLabel)}
      </Text>

      {/* Explainer */}
      <div className="mb-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
        <Text variant="small" classes="text-gray-400 leading-relaxed">
          Configure individual player strategies. Set each player's
          <strong className="text-gray-300"> plate approach </strong> and <strong className="text-gray-300">steal tendency</strong> at the plate,
          <strong className="text-gray-300"> pitching style</strong>, <strong className="text-gray-300">usage preference</strong>,
          and <strong className="text-gray-300">pitch selection weights</strong> on the mound,
          and <strong className="text-gray-300">baserunning aggression</strong> on the bases.
          These settings override the engine defaults for each individual player.
        </Text>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left: Player List */}
        <div className="lg:w-[340px] shrink-0">
          <div className="flex gap-1 mb-2">
            <ButtonGroup>
              <PillButton variant="primaryOutline" isSelected={filterType === "all"} onClick={() => setFilterType("all")}>
                <Text variant="small">All</Text>
              </PillButton>
              <PillButton variant="primaryOutline" isSelected={filterType === "Pitcher"} onClick={() => setFilterType("Pitcher")}>
                <Text variant="small">P</Text>
              </PillButton>
              <PillButton variant="primaryOutline" isSelected={filterType === "Position"} onClick={() => setFilterType("Position")}>
                <Text variant="small">Pos</Text>
              </PillButton>
            </ButtonGroup>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search player..."
            className="w-full mb-2 px-2 py-1 text-sm border rounded bg-black text-white border-gray-500 focus:ring-blue-500"
          />
          <div className="max-h-[50vh] overflow-y-auto border rounded dark:border-gray-600">
            {filteredPlayers.map((p) => {
              const best = getBestRating(p);
              return (
                <button
                  key={p.id}
                  onClick={() => selectPlayer(p.id)}
                  className={`w-full text-left px-3 py-1.5 text-sm border-b dark:border-gray-700 cursor-pointer transition-colors flex items-center justify-between
                    ${p.id === selectedPlayerId
                      ? "bg-blue-50 dark:bg-blue-900/30 font-semibold text-blue-700 dark:text-blue-300"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{p.firstname} {p.lastname}</span>
                    <span className={`text-xs px-1 py-0.5 rounded shrink-0 ${
                      p.ptype === "Pitcher"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    }`}>
                      {p.ptype === "Pitcher" ? "P" : "Pos"}
                    </span>
                  </div>
                  {best && (
                    <span className={`text-xs shrink-0 ml-2 ${displayValueColor(best.value)}`}>
                      {best.label} {best.value}
                    </span>
                  )}
                </button>
              );
            })}
            {filteredPlayers.length === 0 && (
              <div className="px-3 py-2">
                <Text variant="small" classes="text-gray-500">No players found.</Text>
              </div>
            )}
          </div>
        </div>

        {/* Right: Strategy Form */}
        <div className="flex-1 min-w-0">
          {!editing || !selectedPlayer ? (
            <div className="flex items-center justify-center h-40">
              <Text variant="body-small" classes="text-gray-500 dark:text-gray-400">
                Select a player to configure their strategy.
              </Text>
            </div>
          ) : (
            <div>
              {/* Player header + save */}
              <div className="flex items-center justify-between mb-3">
                <Text variant="body" classes="font-semibold">
                  {selectedPlayer.firstname} {selectedPlayer.lastname}
                </Text>
                <div className="flex items-center gap-2">
                  {message && (
                    <Text variant="small" classes={message.includes("Failed") || message.includes("Unable") ? "text-red-400" : "text-green-400"}>
                      {message}
                    </Text>
                  )}
                  <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>

              {/* Attribute summary card */}
              <div className="p-3 mb-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 space-y-2 text-center">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    selectedPlayer.ptype === "Pitcher"
                      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  }`}>
                    {selectedPlayer.ptype}
                  </span>
                  <span className="text-xs text-gray-500">Age {selectedPlayer.age}</span>
                  {selectedPlayer.bat_hand && (
                    <span className="text-xs text-gray-500">Bats: {selectedPlayer.bat_hand}</span>
                  )}
                  {selectedPlayer.pitch_hand && (
                    <span className="text-xs text-gray-500">Throws: {selectedPlayer.pitch_hand}</span>
                  )}
                  {selectedPlayer.displayovr && (
                    <span className={`text-xs font-semibold ${ratingColor(Number(selectedPlayer.displayovr))}`}>OVR: {selectedPlayer.displayovr}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <PlayerAttributeRow player={selectedPlayer} attributes={BATTING_DISPLAY_ATTRS} />
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <PlayerAttributeRow player={selectedPlayer} attributes={ATHLETIC_DISPLAY_ATTRS} />
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <PlayerAttributeRow player={selectedPlayer} attributes={SP_DISPLAY_ATTRS} />
                </div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {POSITION_RATING_KEYS.map(({ key, label }) => {
                    const val = selectedPlayer.ratings[key] as number | string | null;
                    if (val == null) return null;
                    return (
                      <span
                        key={key}
                        className={`text-xs px-1.5 py-0.5 rounded bg-gray-700/50 ${displayValueColor(val)}`}
                      >
                        {label}: {val}
                      </span>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-1 justify-center">
                  <PitchOverallChips player={selectedPlayer} />
                </div>
              </div>

              {/* ── At the Plate ── */}
              <SectionHeader color="blue">At the Plate</SectionHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <Tooltip text="How the player approaches at-bats. Aggressive swings more; Patient works counts; Contact focuses on putting the ball in play; Power sells out for extra bases.">
                  <FieldRow label="Plate Approach">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {PlateApproachOptions.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => updateEditing({ plate_approach: o.value as PlateApproach })}
                          className={`text-xs px-2.5 py-1.5 rounded border transition-colors ${
                            editing.plate_approach === o.value
                              ? "bg-blue-600/20 border-blue-500 text-blue-400"
                              : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                          }`}
                        >{o.label}</button>
                      ))}
                    </div>
                  </FieldRow>
                </Tooltip>

                <Tooltip text="Percentage chance this player attempts steal on a pitch action. League average is around 1.87. 100 would mean every single pitch attempt would have a steal opportunity until scoring or getting thrown out.">
                  <FieldRow label="Steal Frequency">
                    <div className="flex items-center gap-1 mb-1 justify-center">
                      <button
                        onClick={() => updateEditing({ stealfreq: Math.max(0, Math.round((editing.stealfreq - 0.5) * 100) / 100) })}
                        disabled={editing.stealfreq <= 0}
                        className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                      >−</button>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        value={editing.stealfreq}
                        onChange={(e) => updateEditing({ stealfreq: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 text-sm text-center border rounded bg-black text-white border-gray-500"
                      />
                      <button
                        onClick={() => updateEditing({ stealfreq: Math.min(100, Math.round((editing.stealfreq + 0.5) * 100) / 100) })}
                        disabled={editing.stealfreq >= 100}
                        className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                      >+</button>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {STEAL_PRESETS.map((p) => (
                        <button
                          key={p.label}
                          onClick={() => updateEditing({ stealfreq: p.value })}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            editing.stealfreq === p.value
                              ? "bg-blue-600/20 border-blue-500 text-blue-400"
                              : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </FieldRow>
                </Tooltip>
              </div>

              {/* ── On the Mound ── */}
              <SectionHeader color="red">On the Mound</SectionHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                <Tooltip text="How the pitcher approaches at-bats. Aggressive challenges hitters; Finesse nibbles at corners; Power throws heat; Location focuses on spot accuracy.">
                  <FieldRow label="Pitching Approach">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {PitchingApproachOptions.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => updateEditing({ pitching_approach: o.value as PitchingApproach })}
                          className={`text-xs px-2.5 py-1.5 rounded border transition-colors ${
                            editing.pitching_approach === o.value
                              ? "bg-blue-600/20 border-blue-500 text-blue-400"
                              : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                          }`}
                        >{o.label}</button>
                      ))}
                    </div>
                  </FieldRow>
                </Tooltip>

                <Tooltip text="When this player is available. 'Only Fully Rested' waits for full rest; 'Play Tired' allows use on short rest; 'Desperation' uses them regardless. This setting overrides lineup information, so if you want a literal interpretation of lineup, set Desperation">
                  <FieldRow label="Usage Preference">
                    <div className="mb-2">
                      <StaminaBar player={selectedPlayer} label="Current Stamina:" />
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {UsagePreferenceOptions.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => updateEditing({ usage_preference: o.value as UsagePreference })}
                          className={`text-xs px-2.5 py-1.5 rounded border transition-colors ${
                            editing.usage_preference === o.value
                              ? "bg-blue-600/20 border-blue-500 text-blue-400"
                              : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                          }`}
                        >{o.label}</button>
                      ))}
                    </div>
                  </FieldRow>
                </Tooltip>

                <Tooltip text="How often this pitcher throws pickoff attempts. Higher values mean more pickoff throws per baserunner.">
                  <FieldRow label="Pickoff Frequency">
                    <div className="flex items-center gap-1 mb-1 justify-center">
                      <button
                        onClick={() => updateEditing({ pickofffreq: Math.max(0, Math.round((editing.pickofffreq - 0.25) * 100) / 100) })}
                        disabled={editing.pickofffreq <= 0}
                        className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                      >−</button>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        value={editing.pickofffreq}
                        onChange={(e) => updateEditing({ pickofffreq: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 text-sm text-center border rounded bg-black text-white border-gray-500"
                      />
                      <button
                        onClick={() => updateEditing({ pickofffreq: Math.min(100, Math.round((editing.pickofffreq + 0.25) * 100) / 100) })}
                        disabled={editing.pickofffreq >= 100}
                        className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                      >+</button>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {PICKOFF_PRESETS.map((p) => (
                        <button
                          key={p.label}
                          onClick={() => updateEditing({ pickofffreq: p.value })}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            editing.pickofffreq === p.value
                              ? "bg-blue-600/20 border-blue-500 text-blue-400"
                              : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </FieldRow>
                </Tooltip>

                <Tooltip text="The pitch count at which the engine considers pulling this pitcher. Leave as Default to use the team strategy setting.">
                  <FieldRow label="Pull at Pitch #">
                    <div className="flex items-center gap-1 mb-1 justify-center">
                      <button
                        onClick={() => updateEditing({ pitchpull: Math.max(1, (editing.pitchpull ?? 100) - 5) })}
                        disabled={(editing.pitchpull ?? 0) <= 1}
                        className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                      >−</button>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={editing.pitchpull ?? ""}
                        onChange={(e) =>
                          updateEditing({ pitchpull: e.target.value ? Number(e.target.value) : null })
                        }
                        placeholder="Default"
                        className="w-20 px-2 py-1 text-sm text-center border rounded bg-black text-white border-gray-500"
                      />
                      <button
                        onClick={() => updateEditing({ pitchpull: Math.min(200, (editing.pitchpull ?? 100) + 5) })}
                        className="w-8 h-8 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 text-sm font-bold"
                      >+</button>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {PITCH_PULL_PRESETS.map((p) => (
                        <button
                          key={p.label}
                          onClick={() => updateEditing({ pitchpull: p.value ? Number(p.value) : null })}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            String(editing.pitchpull ?? "") === p.value
                              ? "bg-blue-600/20 border-blue-500 text-blue-400"
                              : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </FieldRow>
                </Tooltip>

                <Tooltip text="How quickly the manager pulls this pitcher when they start struggling. 'Quick' pulls earlier; 'Long' gives a longer leash.">
                  <FieldRow label="Pull Tendency">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {[{ value: "", label: "Default" }, ...PullTendencyOptions].map((o) => (
                        <button
                          key={o.value}
                          onClick={() => updateEditing({ pulltend: o.value ? (o.value as PullTendency) : null })}
                          className={`text-xs px-2.5 py-1.5 rounded border transition-colors ${
                            (editing.pulltend ?? "") === o.value
                              ? "bg-blue-600/20 border-blue-500 text-blue-400"
                              : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                          }`}
                        >{o.label}</button>
                      ))}
                    </div>
                  </FieldRow>
                </Tooltip>
              </div>

              {/* Pitch selection weights */}
              <Tooltip text="Control how often each pitch is thrown. Higher weight = more usage. Use the presets to quickly set values.">
                <div className="mb-4">
                  <Text variant="small" classes="font-semibold mb-2">Pitch Selection Weights</Text>
                  {(() => {
                    const pitchNames = [
                      selectedPlayer.pitch1_name,
                      selectedPlayer.pitch2_name,
                      selectedPlayer.pitch3_name,
                      selectedPlayer.pitch4_name,
                      selectedPlayer.pitch5_name,
                    ];
                    const hasPitches = pitchNames.some((n) => !!n);
                    if (!hasPitches) {
                      return (
                        <Text variant="small" classes="text-gray-500 dark:text-gray-400 italic">
                          No pitches assigned to this player.
                        </Text>
                      );
                    }
                    return (
                      <div className="flex flex-col gap-2">
                        {pitchNames.map((name, i) => {
                          if (!name) return null;
                          const ovr = selectedPlayer.ratings[PITCH_OVR_KEYS[i]] as DisplayValue;
                          return (
                            <div key={i} className="flex items-center gap-2 flex-wrap rounded-lg border border-gray-700 bg-gray-800/50 px-2 py-1.5">
                              {/* Pitch name + rating */}
                              <div className="flex items-center gap-1.5 min-w-[120px]">
                                <Text variant="small" classes="text-gray-300 font-medium truncate">{name}</Text>
                                {ovr != null && (
                                  <span className={`text-xs px-1 py-0.5 rounded bg-gray-700/50 font-semibold ${displayValueColor(ovr)}`}>
                                    {ovr}
                                  </span>
                                )}
                              </div>
                              {/* +/- and value */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    const updated = [...editing.pitchchoices];
                                    updated[i] = Math.max(0, (updated[i] ?? 1) - 1);
                                    updateEditing({ pitchchoices: updated });
                                  }}
                                  disabled={(editing.pitchchoices[i] ?? 0) <= 0}
                                  className="w-7 h-7 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                                >−</button>
                                <input
                                  type="number"
                                  min={0}
                                  max={10}
                                  value={editing.pitchchoices[i] ?? 1}
                                  onChange={(e) => {
                                    const updated = [...editing.pitchchoices];
                                    updated[i] = parseInt(e.target.value) || 0;
                                    updateEditing({ pitchchoices: updated });
                                  }}
                                  className="w-12 px-1 py-0.5 text-sm text-center border rounded bg-black text-white border-gray-500"
                                />
                                <button
                                  onClick={() => {
                                    const updated = [...editing.pitchchoices];
                                    updated[i] = Math.min(10, (updated[i] ?? 1) + 1);
                                    updateEditing({ pitchchoices: updated });
                                  }}
                                  disabled={(editing.pitchchoices[i] ?? 0) >= 10}
                                  className="w-7 h-7 flex items-center justify-center rounded bg-gray-700 text-white border border-gray-500 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                                >+</button>
                              </div>
                              {/* Preset buttons */}
                              <div className="flex gap-1">
                                {PITCH_WEIGHT_PRESETS.map((p) => (
                                  <button
                                    key={p.label}
                                    onClick={() => {
                                      const updated = [...editing.pitchchoices];
                                      updated[i] = p.value;
                                      updateEditing({ pitchchoices: updated });
                                    }}
                                    className={`text-xs px-1.5 py-0.5 rounded border transition-colors ${
                                      editing.pitchchoices[i] === p.value
                                        ? "bg-blue-600/20 border-blue-500 text-blue-400"
                                        : "bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600"
                                    }`}
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </Tooltip>

              {/* ── On the Bases ── */}
              <SectionHeader color="green">On the Bases</SectionHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Tooltip text="How aggressively this player runs the bases (separate from stealing). Aggressive takes extra bases and risks outs; Cautious will take extra bases when there's a decent gulf between their footspeed and the defense, and Conservative plays it very safe.">
                  <FieldRow label="Baserunning Approach">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {BaserunningApproachOptions.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => updateEditing({ baserunning_approach: o.value as BaserunningApproach })}
                          className={`text-xs px-2.5 py-1.5 rounded border transition-colors ${
                            editing.baserunning_approach === o.value
                              ? "bg-blue-600/20 border-blue-500 text-blue-400"
                              : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                          }`}
                        >{o.label}</button>
                      ))}
                    </div>
                  </FieldRow>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Small helpers ---

const FieldRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1 text-center">
    <Text variant="small" classes="font-semibold text-gray-400">{label}</Text>
    {children}
  </div>
);

const SectionHeader = ({ color, children }: { color: "blue" | "red" | "green"; children: React.ReactNode }) => {
  const colorMap = {
    blue: "border-blue-500 text-blue-600 dark:text-blue-400",
    red: "border-red-500 text-red-600 dark:text-red-400",
    green: "border-green-500 text-green-600 dark:text-green-400",
  };
  return (
    <div className={`border-l-4 ${colorMap[color]} pl-3 mb-3`}>
      <Text variant="body-small" classes="font-semibold">{children}</Text>
    </div>
  );
};
