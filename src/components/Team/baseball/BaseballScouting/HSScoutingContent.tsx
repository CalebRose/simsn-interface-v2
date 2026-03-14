import { FC, useCallback, useEffect, useState } from "react";
import { Text } from "../../../../_design/Typography";
import { Border } from "../../../../_design/Borders";
import { PillButton } from "../../../../_design/Buttons";
import { BaseballService } from "../../../../_services/baseballService";
import {
  ScoutingPlayerResponse,
  ScoutingBudget,
} from "../../../../models/baseball/baseballScoutingModels";
import type { RecruitingPlayerDetail } from "../../../../models/baseball/baseballRecruitingModels";
import { SCOUTING_ACTION_LABELS, SCOUTING_ACTION_COSTS, getHSClassYear } from "../../../../_utility/baseballHelpers";

// ── Grade color (consistent with BaseballRosterTable) ──
const gradeColor = (grade: string): string => {
  if (grade.startsWith("A")) return "text-green-600 dark:text-green-400";
  if (grade.startsWith("B")) return "text-blue-600 dark:text-blue-400";
  if (grade.startsWith("C")) return "text-yellow-600 dark:text-yellow-400";
  if (grade.startsWith("D")) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
};

// ── Potential display groups by player type ──
const POS_POTENTIAL_GROUPS = [
  { title: "Batting", keys: [
    { key: "contact_pot", label: "Contact" },
    { key: "power_pot", label: "Power" },
    { key: "eye_pot", label: "Eye" },
    { key: "discipline_pot", label: "Discipline" },
  ]},
  { title: "Speed / Base", keys: [
    { key: "speed_pot", label: "Speed" },
    { key: "baserunning_pot", label: "Baserunning" },
    { key: "basereaction_pot", label: "Base React" },
  ]},
  { title: "Fielding", keys: [
    { key: "fieldcatch_pot", label: "Catch" },
    { key: "fieldreact_pot", label: "React" },
    { key: "fieldspot_pot", label: "Spot" },
    { key: "throwpower_pot", label: "Throw Pow" },
    { key: "throwacc_pot", label: "Throw Acc" },
  ]},
  { title: "Catching", keys: [
    { key: "catchframe_pot", label: "Framing" },
    { key: "catchsequence_pot", label: "Sequence" },
  ]},
];

const PITCH_POTENTIAL_GROUPS = [
  { title: "Pitching", keys: [
    { key: "pendurance_pot", label: "Endurance" },
    { key: "pgencontrol_pot", label: "Control" },
    { key: "pthrowpower_pot", label: "Velocity" },
    { key: "psequencing_pot", label: "Sequencing" },
    { key: "pickoff_pot", label: "Pickoff" },
  ]},
  { title: "Athletic", keys: [
    { key: "speed_pot", label: "Speed" },
    { key: "baserunning_pot", label: "Baserunning" },
  ]},
];

// ── Scouting action progression for HS players ──
const HS_ACTION_PROGRESSION: { action: string; prereq?: string }[] = [
  { action: "hs_report" },
  { action: "recruit_potential_fuzzed", prereq: "hs_report" },
  { action: "recruit_potential_precise", prereq: "recruit_potential_fuzzed" },
];

// ═══════════════════════════════════════════════
// Main content component
// ═══════════════════════════════════════════════

interface HSScoutingContentProps {
  player: ScoutingPlayerResponse;
  orgId: number;
  leagueYearId: number;
  scoutingBudget: ScoutingBudget | null;
  isUnlocking: boolean;
  onUnlock: (actionType: string) => void;
}

export const HSScoutingContent: FC<HSScoutingContentProps> = ({
  player,
  orgId,
  leagueYearId,
  scoutingBudget,
  isUnlocking,
  onUnlock,
}) => {
  const bio = player.bio;
  const vis = player.visibility;
  const potentials = player.potentials;
  const potFuzzed = player.visibility_context ? !player.visibility_context.potentials_precise : true;
  const isPitcher = bio.ptype === "Pitcher";
  const cls = getHSClassYear(bio.age);

  // ── Recruiting detail (fetched in parallel) ──
  const [recruitDetail, setRecruitDetail] = useState<RecruitingPlayerDetail | null>(null);
  useEffect(() => {
    if (!leagueYearId) return;
    BaseballService.GetRecruitingPlayer(bio.id, leagueYearId, orgId)
      .then(setRecruitDetail)
      .catch(() => {});
  }, [bio.id, leagueYearId, orgId]);

  const heightDisplay = `${Math.floor(bio.height / 12)}'${bio.height % 12}"`;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Card 1: Player Header ── */}
      <Border classes="p-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs rounded font-semibold ${isPitcher ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}>
                {isPitcher ? "Pitcher" : "Position"}
              </span>
              <span className="text-sm text-gray-400">{cls.label} ({bio.age})</span>
            </div>
          </div>
          {recruitDetail && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500 text-sm">{"★".repeat(recruitDetail.star_rating)}</span>
              <span className="text-gray-600 text-sm">{"★".repeat(5 - recruitDetail.star_rating)}</span>
              <span className="text-xs text-gray-400 ml-1">#{recruitDetail.rank_overall}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm">
          <BioField label="Height" value={heightDisplay} />
          <BioField label="Weight" value={`${bio.weight} lbs`} />
          <BioField label="B/T" value={`${bio.bat_hand ?? "—"}/${bio.pitch_hand ?? "—"}`} />
          <BioField label="Area" value={bio.area} />
          <BioField label="City" value={bio.city} />
          <BioField label="Durability" value={bio.durability} />
          <BioField label="Injury Risk" value={bio.injury_risk} />
          <BioField label="Origin" value={bio.intorusa === "usa" ? "USA" : "International"} />
        </div>

        {/* Pitch repertoire */}
        {isPitcher && (bio.pitch1_name || bio.pitch2_name) && (
          <div className="mt-2 flex flex-wrap gap-1">
            {[bio.pitch1_name, bio.pitch2_name, bio.pitch3_name, bio.pitch4_name, bio.pitch5_name]
              .filter(Boolean)
              .map((name, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-medium">
                  {name}
                </span>
              ))}
          </div>
        )}
      </Border>

      {/* ── Card 2: Scouting Actions (progression) ── */}
      <Border classes="p-3">
        <Text variant="small" classes="font-semibold mb-2">Scouting Actions</Text>
        <div className="space-y-2">
          {HS_ACTION_PROGRESSION.map(({ action, prereq }) => {
            const isUnlocked = vis?.unlocked.includes(action);
            const isAvailable = vis?.available_actions.includes(action);
            const isLocked = !isUnlocked && !isAvailable;
            const cost = SCOUTING_ACTION_COSTS[action] ?? 0;
            const label = SCOUTING_ACTION_LABELS[action] ?? action;
            const canAfford = scoutingBudget ? scoutingBudget.remaining_points >= cost : true;

            return (
              <div key={action} className={`flex items-center justify-between px-3 py-2 rounded ${
                isUnlocked ? "bg-green-50 dark:bg-green-900/20" :
                isAvailable ? "bg-gray-50 dark:bg-gray-700/50" :
                "bg-gray-50 dark:bg-gray-800/50 opacity-50"
              }`}>
                <div className="flex items-center gap-2">
                  {isUnlocked ? (
                    <span className="text-green-500 text-sm">&#10003;</span>
                  ) : (
                    <span className="text-gray-400 text-sm">&#9675;</span>
                  )}
                  <span className="text-sm font-medium">{label}</span>
                  {!isUnlocked && <span className="text-xs text-gray-400">({cost} pts)</span>}
                </div>
                {isAvailable && (
                  <PillButton
                    variant="primaryOutline"
                    disabled={isUnlocking || !canAfford}
                    onClick={() => onUnlock(action)}
                  >
                    <Text variant="small">Scout</Text>
                  </PillButton>
                )}
                {isLocked && prereq && (
                  <span className="text-xs text-gray-400">Requires: {SCOUTING_ACTION_LABELS[prereq] ?? prereq}</span>
                )}
              </div>
            );
          })}
        </div>
        {scoutingBudget && (
          <Text variant="xs" classes="text-gray-400 mt-2">
            Budget: {scoutingBudget.remaining_points} / {scoutingBudget.total_points} pts remaining
          </Text>
        )}
      </Border>

      {/* ── Card 3: Scout Report ── */}
      {player.text_report && (
        <Border classes="p-3">
          <Text variant="small" classes="font-semibold mb-2">Scout Report</Text>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {player.text_report.batting && <ReportCard title="Batting" text={player.text_report.batting} />}
            {player.text_report.fielding && <ReportCard title="Fielding" text={player.text_report.fielding} />}
            {player.text_report.pitching && <ReportCard title="Pitching" text={player.text_report.pitching} />}
            {player.text_report.athletic && <ReportCard title="Athletic" text={player.text_report.athletic} />}
          </div>
        </Border>
      )}

      {/* ── Card 4: Potentials Grid ── */}
      {potentials && Object.values(potentials).some((v) => v != null) && (
        <Border classes="p-3">
          <Text variant="small" classes="font-semibold mb-2">
            Potentials
            {potFuzzed && <span className="text-xs text-yellow-500 font-normal ml-1">(~ = estimated)</span>}
          </Text>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(isPitcher ? PITCH_POTENTIAL_GROUPS : POS_POTENTIAL_GROUPS).map((group) => {
              const visibleKeys = group.keys.filter((k) => potentials[k.key] != null);
              if (visibleKeys.length === 0) return null;
              return (
                <div key={group.title}>
                  <Text variant="xs" classes="font-semibold text-gray-400 mb-1">{group.title}</Text>
                  <div className="space-y-0.5">
                    {visibleKeys.map(({ key, label }) => {
                      const val = potentials[key];
                      if (!val || val === "?") {
                        return (
                          <div key={key} className="flex justify-between text-xs py-0.5">
                            <span className="text-gray-400">{label}</span>
                            <span className="text-gray-500">?</span>
                          </div>
                        );
                      }
                      return (
                        <div key={key} className="flex justify-between text-xs py-0.5">
                          <span className="text-gray-400">{label}</span>
                          <span className={`font-semibold ${gradeColor(val)}`}>
                            {potFuzzed ? "~" : ""}{val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pitch repertoire (names only, no sub-abilities for HS) */}
          {isPitcher && (bio.pitch1_name || bio.pitch2_name) && (
            <div className="mt-3">
              <Text variant="xs" classes="font-semibold text-gray-400 mb-1">Pitch Repertoire</Text>
              <div className="flex flex-wrap gap-1">
                {[bio.pitch1_name, bio.pitch2_name, bio.pitch3_name, bio.pitch4_name, bio.pitch5_name]
                  .filter(Boolean)
                  .map((name, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-medium">
                      {name}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </Border>
      )}

      {/* ── Card 5: Generated Stats ── */}
      {player.generated_stats && (
        <Border classes="p-3">
          <Text variant="small" classes="font-semibold mb-2">Season Stats</Text>
          {player.generated_stats.batting && <GeneratedBattingSection stats={player.generated_stats.batting} />}
          {player.generated_stats.fielding && <GeneratedFieldingSection stats={player.generated_stats.fielding} />}
          {player.generated_stats.pitching && <GeneratedPitchingSection stats={player.generated_stats.pitching} />}
        </Border>
      )}

      {/* ── Card 6: Recruiting Info ── */}
      {recruitDetail && (
        <Border classes="p-3">
          <Text variant="small" classes="font-semibold mb-2">Recruiting</Text>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm">
            <BioField label="Star Rating" value={`${"★".repeat(recruitDetail.star_rating)} (${recruitDetail.star_rating})`} />
            <BioField label="Overall Rank" value={`#${recruitDetail.rank_overall}`} />
            <BioField label="Position Rank" value={`#${recruitDetail.rank_by_ptype}`} />
            <BioField label="Your Investment" value={`${recruitDetail.your_investment} pts`} />
            <div>
              <span className="text-gray-400 text-xs">Interest: </span>
              <span className={`text-xs font-semibold ${
                recruitDetail.interest_gauge === "Very High" ? "text-green-500" :
                recruitDetail.interest_gauge === "High" ? "text-blue-500" :
                recruitDetail.interest_gauge === "Medium" ? "text-yellow-500" :
                "text-gray-400"
              }`}>
                {recruitDetail.interest_gauge}
              </span>
            </div>
            <BioField label="Competitors" value={String(recruitDetail.competitor_count)} />
          </div>
          {recruitDetail.commitment && (
            <div className="mt-2 px-3 py-1.5 rounded bg-gray-50 dark:bg-gray-700/50 text-sm">
              Committed to <span className="font-semibold">{recruitDetail.commitment.org_abbrev}</span> in week {recruitDetail.commitment.week_committed}
            </div>
          )}
        </Border>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════

const BioField: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <span className="text-gray-400 text-xs">{label}: </span>
    <span className="dark:text-white">{value}</span>
  </div>
);

const ReportCard: FC<{ title: string; text: string }> = ({ title, text }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
    <Text variant="xs" classes="font-semibold mb-1">{title}</Text>
    <Text variant="xs" classes="text-gray-600 dark:text-gray-300">{text}</Text>
  </div>
);

// ── Generated Stats sub-components ──

const StatPair: FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="text-center">
    <div className="text-xs text-gray-400">{label}</div>
    <div className="text-sm font-medium">{typeof value === "number" ? (value % 1 !== 0 ? value.toFixed(3).replace(/^0/, "") : value) : value}</div>
  </div>
);

const GeneratedBattingSection: FC<{ stats: any }> = ({ stats }) => (
  <div className="mb-2">
    <Text variant="xs" classes="font-semibold text-gray-400 mb-1">Batting</Text>
    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
      <StatPair label="G" value={stats.games} />
      <StatPair label="AB" value={stats.at_bats} />
      <StatPair label="H" value={stats.hits} />
      <StatPair label="HR" value={stats.home_runs} />
      <StatPair label="RBI" value={stats.rbi} />
      <StatPair label="AVG" value={stats.avg} />
      <StatPair label="OBP" value={stats.obp} />
      <StatPair label="SLG" value={stats.slg} />
    </div>
  </div>
);

const GeneratedFieldingSection: FC<{ stats: any }> = ({ stats }) => (
  <div className="mb-2">
    <Text variant="xs" classes="font-semibold text-gray-400 mb-1">Fielding</Text>
    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
      <StatPair label="G" value={stats.games} />
      <StatPair label="PO" value={stats.putouts} />
      <StatPair label="A" value={stats.assists} />
      <StatPair label="E" value={stats.errors} />
      <StatPair label="FLD%" value={stats.fielding_pct} />
    </div>
  </div>
);

const GeneratedPitchingSection: FC<{ stats: any }> = ({ stats }) => (
  <div className="mb-2">
    <Text variant="xs" classes="font-semibold text-gray-400 mb-1">Pitching</Text>
    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
      <StatPair label="W" value={stats.wins} />
      <StatPair label="L" value={stats.losses} />
      <StatPair label="ERA" value={stats.era?.toFixed(2)} />
      <StatPair label="K" value={stats.strikeouts} />
      <StatPair label="BB" value={stats.walks} />
      <StatPair label="IP" value={stats.innings_pitched?.toFixed(1) ?? "—"} />
      <StatPair label="WHIP" value={stats.whip?.toFixed(2)} />
      <StatPair label="SV" value={stats.saves} />
    </div>
  </div>
);
