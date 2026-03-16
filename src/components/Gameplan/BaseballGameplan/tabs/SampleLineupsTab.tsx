import { useState, useEffect, useMemo, useCallback } from "react";
import { Text } from "../../../../_design/Typography";
import { Button, PillButton, ButtonGroup } from "../../../../_design/Buttons";
import { Player, PlayerRatings } from "../../../../models/baseball/baseballModels";
import { DefenseAssignment, DefenseConfig } from "../../../../models/baseball/baseballGameplanModels";
import { BaseballService } from "../../../../_services/baseballService";
import { PositionShortMap, PositionRatingKey } from "../BaseballGameplanConstants";
import { SimulatedLineup, simulateWeekLineups } from "../lineupSimulation";
import { displayValueColor } from "../ratingUtils";

interface SampleLineupsTabProps {
  teamId: number;
  players: Player[];
}

export const SampleLineupsTab = ({ teamId, players }: SampleLineupsTabProps) => {
  const [assignments, setAssignments] = useState<DefenseAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lineups, setLineups] = useState<SimulatedLineup[]>([]);
  const [selectedGame, setSelectedGame] = useState(0);

  // Load defense config (read-only)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const defenseData = await BaseballService.GetDefensePlan(teamId).catch(
          () => ({ assignments: [] } as DefenseConfig),
        );
        if (!cancelled) {
          setAssignments(defenseData.assignments ?? []);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [teamId]);

  // Generate lineups when data loads
  useEffect(() => {
    if (!isLoading && players.length > 0) {
      setLineups(simulateWeekLineups(players, assignments));
    }
  }, [isLoading, players, assignments]);

  const regenerate = useCallback(() => {
    if (players.length > 0) {
      setLineups(simulateWeekLineups(players, assignments));
    }
  }, [players, assignments]);

  const selectedLineup = lineups[selectedGame] ?? null;
  const baselineLineup = lineups[0] ?? null;

  // Compute diffs from Game A
  const diffs = useMemo(() => {
    if (!selectedLineup || !baselineLineup || selectedGame === 0) return [];
    const basePlayerIds = new Set(baselineLineup.starters.map((s) => s.player.id));
    const changes: string[] = [];

    for (const s of selectedLineup.starters) {
      if (!basePlayerIds.has(s.player.id)) {
        const replaced = baselineLineup.starters.find((b) => b.position === s.position);
        if (replaced) {
          changes.push(
            `${PositionShortMap[s.position] ?? s.position}: ${replaced.player.firstname} ${replaced.player.lastname} → ${s.player.firstname} ${s.player.lastname}`,
          );
        } else {
          changes.push(
            `${PositionShortMap[s.position] ?? s.position}: ${s.player.firstname} ${s.player.lastname} (new)`,
          );
        }
      }
    }

    for (const s of selectedLineup.starters) {
      if (basePlayerIds.has(s.player.id)) {
        const base = baselineLineup.starters.find((b) => b.player.id === s.player.id);
        if (base && base.position !== s.position) {
          changes.push(
            `${s.player.firstname} ${s.player.lastname}: ${PositionShortMap[base.position]} → ${PositionShortMap[s.position]}`,
          );
        }
      }
    }

    return changes;
  }, [selectedLineup, baselineLineup, selectedGame]);

  if (isLoading) {
    return <Text variant="body-small" classes="text-gray-400">Loading sample lineups...</Text>;
  }

  if (players.length === 0) {
    return (
      <Text variant="body-small" classes="text-gray-500 dark:text-gray-400">
        No players available for this level.
      </Text>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <Text variant="h5" classes="font-semibold">Sample Lineups</Text>
          <Text variant="small" classes="text-gray-500 dark:text-gray-400">
            Approximate preview of how your depth chart and settings produces lineups. <strong className="text-gray-300">This is an estimate.</strong>
          </Text>
        </div>
        <Button variant="secondaryOutline" size="sm" onClick={regenerate}>
          Regenerate
        </Button>
      </div>

      {/* Game selector */}
      {lineups.length > 0 && (
        <>
          <div className="flex gap-1 mb-4">
            <ButtonGroup>
              {lineups.map((lineup, i) => (
                <PillButton
                  key={i}
                  variant="primaryOutline"
                  isSelected={selectedGame === i}
                  onClick={() => setSelectedGame(i)}
                >
                  <Text variant="small">{lineup.label}</Text>
                </PillButton>
              ))}
            </ButtonGroup>
          </div>

          {/* Lineup table */}
          {selectedLineup && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      <th className="px-3 py-2 text-center w-10 sticky top-0 bg-gray-100 dark:bg-gray-700">#</th>
                      <th className="px-3 py-2 text-left sticky top-0 bg-gray-100 dark:bg-gray-700">Player</th>
                      <th className="px-3 py-2 text-center w-14 sticky top-0 bg-gray-100 dark:bg-gray-700">Pos</th>
                      <th className="px-3 py-2 text-center w-14 sticky top-0 bg-gray-100 dark:bg-gray-700">Rtg</th>
                      <th className="px-3 py-2 text-center w-12 sticky top-0 bg-gray-100 dark:bg-gray-700">Cont</th>
                      <th className="px-3 py-2 text-center w-14 sticky top-0 bg-gray-100 dark:bg-gray-700">Power</th>
                      <th className="px-3 py-2 text-center w-12 sticky top-0 bg-gray-100 dark:bg-gray-700">Eye</th>
                      <th className="px-3 py-2 text-center w-12 sticky top-0 bg-gray-100 dark:bg-gray-700">Disc</th>
                      <th className="px-3 py-2 text-left sticky top-0 bg-gray-100 dark:bg-gray-700">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLineup.starters.map((s, idx) => {
                      const isChanged = selectedGame > 0 && baselineLineup &&
                        !baselineLineup.starters.some(
                          (b) => b.player.id === s.player.id && b.position === s.position,
                        );
                      const ratingKey = PositionRatingKey[s.position] as keyof PlayerRatings;
                      const posRating = s.player.ratings[ratingKey] as number | string | null;
                      const contact = s.player.ratings.contact_display;
                      const power = s.player.ratings.power_display;
                      const eye = s.player.ratings.eye_display;
                      const discipline = s.player.ratings.discipline_display;

                      return (
                        <tr
                          key={s.player.id}
                          className={`${
                            idx % 2 === 0 ? "bg-white dark:bg-gray-800/50" : "bg-gray-50 dark:bg-gray-700/50"
                          } ${isChanged ? "border-l-2 border-l-amber-400" : ""}`}
                        >
                          <td className="px-3 py-2 text-center font-bold">{s.battingSlot}</td>
                          <td className="px-3 py-2 truncate max-w-[180px]">
                            {s.player.firstname} {s.player.lastname}
                          </td>
                          <td className="px-3 py-2 text-center font-medium">
                            {PositionShortMap[s.position] ?? s.position.toUpperCase()}
                          </td>
                          <td className={`px-3 py-2 text-center ${posRating != null ? displayValueColor(posRating) : "text-gray-500 dark:text-gray-400"}`}>
                            {posRating ?? "—"}
                          </td>
                          <td className={`px-3 py-2 text-center ${contact != null ? displayValueColor(contact) : "text-gray-500"}`}>
                            {contact ?? "—"}
                          </td>
                          <td className={`px-3 py-2 text-center ${power != null ? displayValueColor(power) : "text-gray-500"}`}>
                            {power ?? "—"}
                          </td>
                          <td className={`px-3 py-2 text-center ${eye != null ? displayValueColor(eye) : "text-gray-500"}`}>
                            {eye ?? "—"}
                          </td>
                          <td className={`px-3 py-2 text-center ${discipline != null ? displayValueColor(discipline) : "text-gray-500"}`}>
                            {discipline ?? "—"}
                          </td>
                          <td className="px-3 py-2 text-gray-500 dark:text-gray-400 capitalize">
                            {s.role.replace("_", " ")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {selectedLineup.starters.length === 0 && (
                <div className="px-3 py-4 text-center">
                  <Text variant="body-small" classes="text-gray-500 dark:text-gray-400">
                    Configure your defensive depth chart in the Defense & Lineup tab to see sample lineups.
                  </Text>
                </div>
              )}

              {/* Diffs from Game A */}
              {diffs.length > 0 && (
                <div className="mt-3 p-3 rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
                  <Text variant="small" classes="font-semibold mb-1">Differences from {baselineLineup.label}:</Text>
                  <ul className="space-y-0.5">
                    {diffs.map((diff, i) => (
                      <li key={i}>
                        <Text variant="small" classes="text-gray-600 dark:text-gray-300">
                          {diff}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedGame > 0 && diffs.length === 0 && selectedLineup.starters.length > 0 && (
                <div className="mt-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                  <Text variant="small" classes="text-gray-500 dark:text-gray-400">
                    No differences from {baselineLineup.label} — identical lineup.
                  </Text>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
