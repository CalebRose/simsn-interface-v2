import { useState, useEffect, useMemo, useCallback } from "react";
import { Text } from "../../../../_design/Typography";
import { Button, PillButton, ButtonGroup } from "../../../../_design/Buttons";
import { SelectDropdown } from "../../../../_design/Select";
import { SelectOption } from "../../../../_hooks/useSelectStyles";
import { Player, PlayerRatings } from "../../../../models/baseball/baseballModels";
import {
  PlayerStrategy,
  PlateApproach,
  PitchingApproach,
  BaserunningApproach,
  UsagePreference,
  PullTendency,
} from "../../../../models/baseball/baseballGameplanModels";
import { BaseballService } from "../../../../_services/baseballService";
import { useAuthStore } from "../../../../context/AuthContext";
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
import { ratingColor, displayValueColor, PlayerAttributeRow, PitchOverallChips } from "../ratingUtils";

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
  pitchchoices: [1, 1, 1, 1, 1],
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

export const PlayerStrategyTab = ({ orgId, players, levelLabel }: PlayerStrategyTabProps) => {
  const { currentUser } = useAuthStore();
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
    if (!editing || !selectedPlayerId || !currentUser) return;
    setIsSaving(true);
    setMessage("");
    try {
      const dto = { ...editing, user_id: Number(currentUser.id) || 0 };
      const saved = await BaseballService.SavePlayerStrategy(orgId, selectedPlayerId, dto);
      setStrategies((prev) => {
        const idx = prev.findIndex((s) => s.player_id === selectedPlayerId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [...prev, saved];
      });
      setEditing(saved);
      setMessage("Saved successfully");
    } catch {
      setMessage("Failed to save");
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(""), 3000);
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
      <Text variant="h5" classes="font-semibold mb-3">
        Player Settings — {displayLevel(levelLabel)}
      </Text>

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
                    <Text variant="small" classes={message.includes("Failed") ? "text-red-400" : "text-green-400"}>
                      {message}
                    </Text>
                  )}
                  <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>

              {/* Attribute summary card */}
              <div className="p-3 mb-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
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
                    <span className="text-xs font-semibold">OVR: {selectedPlayer.displayovr}</span>
                  )}
                </div>
                {/* Batting ratings row */}
                <PlayerAttributeRow player={selectedPlayer} attributes={BATTING_DISPLAY_ATTRS} />
                {/* Pitching ratings row */}
                <PlayerAttributeRow player={selectedPlayer} attributes={SP_DISPLAY_ATTRS} />
                {/* Position rating chips */}
                <div className="flex flex-wrap gap-1">
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
                {/* Pitch overalls */}
                <PitchOverallChips player={selectedPlayer} />
              </div>

              {/* ── At the Plate ── */}
              <SectionHeader color="blue">At the Plate</SectionHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <FieldRow label="Plate Approach">
                  <SelectDropdown
                    options={PlateApproachOptions}
                    value={PlateApproachOptions.find((o) => o.value === editing.plate_approach) ?? null}
                    onChange={(opt) => {
                      if (opt) updateEditing({ plate_approach: (opt as SelectOption).value as PlateApproach });
                    }}
                  />
                </FieldRow>

                <FieldRow label="Steal Freq (0-100)">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={editing.stealfreq}
                    onChange={(e) => updateEditing({ stealfreq: parseFloat(e.target.value) || 0 })}
                    className="w-24 px-2 py-1 text-sm border rounded bg-black text-white border-gray-500"
                  />
                </FieldRow>
              </div>

              {/* ── On the Mound ── */}
              <SectionHeader color="red">On the Mound</SectionHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                <FieldRow label="Pitching Approach">
                  <SelectDropdown
                    options={PitchingApproachOptions}
                    value={PitchingApproachOptions.find((o) => o.value === editing.pitching_approach) ?? null}
                    onChange={(opt) => {
                      if (opt) updateEditing({ pitching_approach: (opt as SelectOption).value as PitchingApproach });
                    }}
                  />
                </FieldRow>

                <FieldRow label="Usage Preference">
                  <SelectDropdown
                    options={UsagePreferenceOptions}
                    value={UsagePreferenceOptions.find((o) => o.value === editing.usage_preference) ?? null}
                    onChange={(opt) => {
                      if (opt) updateEditing({ usage_preference: (opt as SelectOption).value as UsagePreference });
                    }}
                  />
                </FieldRow>

                <FieldRow label="Pickoff Freq (0-100)">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={editing.pickofffreq}
                    onChange={(e) => updateEditing({ pickofffreq: parseFloat(e.target.value) || 0 })}
                    className="w-24 px-2 py-1 text-sm border rounded bg-black text-white border-gray-500"
                  />
                </FieldRow>

                <FieldRow label="Pull at Pitch #">
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={editing.pitchpull ?? ""}
                    onChange={(e) =>
                      updateEditing({ pitchpull: e.target.value ? Number(e.target.value) : null })
                    }
                    className="w-24 px-2 py-1 text-sm border rounded bg-black text-white border-gray-500"
                    placeholder="Default"
                  />
                </FieldRow>

                <FieldRow label="Pull Tendency">
                  <SelectDropdown
                    options={[{ value: "", label: "Default" }, ...PullTendencyOptions]}
                    value={
                      editing.pulltend
                        ? PullTendencyOptions.find((o) => o.value === editing.pulltend) ?? null
                        : { value: "", label: "Default" }
                    }
                    onChange={(opt) => {
                      const val = (opt as SelectOption)?.value;
                      updateEditing({ pulltend: val ? (val as PullTendency) : null });
                    }}
                  />
                </FieldRow>
              </div>

              {/* Pitch selection weights */}
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
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <Text variant="small" classes="text-gray-400 w-28 truncate">{name}</Text>
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
                              className="w-16 px-2 py-1 text-sm border rounded bg-black text-white border-gray-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* ── On the Bases ── */}
              <SectionHeader color="green">On the Bases</SectionHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FieldRow label="Baserunning Approach">
                  <SelectDropdown
                    options={BaserunningApproachOptions}
                    value={BaserunningApproachOptions.find((o) => o.value === editing.baserunning_approach) ?? null}
                    onChange={(opt) => {
                      if (opt) updateEditing({ baserunning_approach: (opt as SelectOption).value as BaserunningApproach });
                    }}
                  />
                </FieldRow>
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
  <div className="space-y-1">
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
