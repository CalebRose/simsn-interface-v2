import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "../../../../_design/Modal";
import { Text } from "../../../../_design/Typography";
import { Border } from "../../../../_design/Borders";
import { ButtonGroup, PillButton } from "../../../../_design/Buttons";
import { Button } from "../../../../_design/Buttons";
import { Tab, TabGroup } from "../../../../_design/Tabs";
import { BaseballService } from "../../../../_services/baseballService";
import {
  ScoutingPlayerResponse,
  ScoutingBudget,
  ScoutingActionRequest,
  ScoutingActionType,
} from "../../../../models/baseball/baseballScoutingModels";
import { VisibilityContext } from "../../../../models/baseball/baseballModels";
import { InjuryHistoryItem, PlayerStatsResponse } from "../../../../models/baseball/baseballStatsModels";
import { ratingColor, gradeColor } from "../baseballColorConfig";
import { SCOUTING_ACTION_LABELS, SCOUTING_ACTION_COSTS, getClassYear } from "../../../../_utility/baseballHelpers";
import { useSnackbar } from "notistack";
import { HSScoutingContent } from "./HSScoutingContent";
import PlayerPicture from "../../../../_utility/usePlayerFaces";
import { useSimBaseballStore } from "../../../../context/SimBaseballContext";
import { SimMLB, SimCollegeBaseball } from "../../../../_constants/constants";
import { League } from "../../../../_constants/constants";
import { getLogo } from "../../../../_utility/getLogo";
import { Logo } from "../../../../_design/Logo";
import { useAuthStore } from "../../../../context/AuthContext";

// ── Attribute display names ──
const BATTING_ATTRS = [
  { key: "contact", label: "Contact" },
  { key: "power", label: "Power" },
  { key: "eye", label: "Eye" },
  { key: "discipline", label: "Discipline" },
];
const RUNNING_ATTRS = [
  { key: "speed", label: "Speed" },
  { key: "baserunning", label: "Baserunning" },
  { key: "basereaction", label: "Base React" },
];
const FIELDING_ATTRS = [
  { key: "fieldcatch", label: "Catch" },
  { key: "fieldreact", label: "React" },
  { key: "fieldspot", label: "Spot" },
  { key: "throwpower", label: "Throw Pow" },
  { key: "throwacc", label: "Throw Acc" },
];
const CATCHER_ATTRS = [
  { key: "catchframe", label: "Framing" },
  { key: "catchsequence", label: "Sequence" },
];
const PITCHING_ATTRS = [
  { key: "pendurance", label: "Endurance" },
  { key: "pgencontrol", label: "Control" },
  { key: "pthrowpower", label: "Velocity" },
  { key: "psequencing", label: "Sequencing" },
  { key: "pickoff", label: "Pickoff" },
];

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

interface BaseballScoutingModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: number;
  orgId: number;
  leagueYearId: number;
  scoutingBudget: ScoutingBudget | null;
  onBudgetChanged: () => void;
  league: string;
}

export const BaseballScoutingModal: FC<BaseballScoutingModalProps> = ({
  isOpen,
  onClose,
  playerId,
  orgId,
  leagueYearId,
  scoutingBudget,
  onBudgetChanged,
  league,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { allTeams } = useSimBaseballStore();
  const { currentUser } = useAuthStore();
  const [player, setPlayer] = useState<ScoutingPlayerResponse | null>(null);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>("Attributes");

  // Injury history (lazy-loaded)
  const [injuryHistory, setInjuryHistory] = useState<InjuryHistoryItem[]>([]);
  const [injuryLoading, setInjuryLoading] = useState(false);

  // Fetch player detail on open
  useEffect(() => {
    if (!isOpen || !playerId) return;
    let cancelled = false;
    setIsLoadingPlayer(true);
    setSelectedTab("Attributes");
    BaseballService.GetScoutedPlayer(playerId, orgId, leagueYearId)
      .then((data) => {
        if (!cancelled) setPlayer(data);
      })
      .catch((err) => {
        if (!cancelled) enqueueSnackbar(err?.message || "Failed to load player", { variant: "error" });
      })
      .finally(() => { if (!cancelled) setIsLoadingPlayer(false); });
    return () => { cancelled = true; };
  }, [isOpen, playerId, orgId, leagueYearId]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setPlayer(null);
      setInjuryHistory([]);
    }
  }, [isOpen]);

  // Lazy-load injury history
  useEffect(() => {
    if (selectedTab !== "Injuries" || !playerId) return;
    let cancelled = false;
    setInjuryLoading(true);
    BaseballService.GetInjuryHistory({ player_id: playerId })
      .then((data) => { if (!cancelled) setInjuryHistory(data.events); })
      .catch(() => { if (!cancelled) setInjuryHistory([]); })
      .finally(() => { if (!cancelled) setInjuryLoading(false); });
    return () => { cancelled = true; };
  }, [selectedTab, playerId]);

  const handleUnlock = useCallback(async (actionType: string) => {
    setIsUnlocking(true);
    try {
      const dto: ScoutingActionRequest = {
        org_id: orgId,
        league_year_id: leagueYearId,
        player_id: playerId,
        action_type: actionType as ScoutingActionType,
      };
      const res = await BaseballService.PerformScoutingAction(dto);
      if (res.status === "unlocked") {
        enqueueSnackbar(`Unlocked! (${res.points_spent} pts spent, ${res.points_remaining} remaining)`, { variant: "success", autoHideDuration: 3000 });
      } else {
        enqueueSnackbar("Already unlocked", { variant: "info", autoHideDuration: 2000 });
      }
      onBudgetChanged();
      // Re-fetch player with updated visibility
      const updated = await BaseballService.GetScoutedPlayer(playerId, orgId, leagueYearId);
      setPlayer(updated);
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Scouting action failed", { variant: "error", autoHideDuration: 4000 });
    }
    setIsUnlocking(false);
  }, [orgId, leagueYearId, playerId, onBudgetChanged, enqueueSnackbar]);

  // Resolve team for PlayerPicture — use the player's org, not the viewer's
  const team = useMemo(() => {
    if (!player?.bio || !allTeams || allTeams.length === 0) return null;
    const playerOrgId = player.bio.org_id;
    if (!playerOrgId) return null;
    return allTeams.find((t) => t.org_id === playerOrgId) ?? null;
  }, [allTeams, player?.bio]);

  const teamLogo = useMemo(() => {
    if (!team) return "";
    return getLogo(
      league === SimMLB ? SimMLB : SimCollegeBaseball,
      team.team_id,
      currentUser?.isRetro,
    );
  }, [team, league, currentUser?.isRetro]);

  if (!isOpen) return null;

  const bio = player?.bio;
  const vis = player?.visibility;
  const isCollege = league === SimCollegeBaseball;

  const actionCosts = SCOUTING_ACTION_COSTS;
  const actionLabels = SCOUTING_ACTION_LABELS;

  const heightDisplay = (inches: number) => {
    const ft = Math.floor(inches / 12);
    const rem = inches % 12;
    return `${ft}'${rem}"`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bio ? `#${bio.id} ${bio.firstname} ${bio.lastname}` : "Loading..."}
      maxWidth="max-w-2xl"
      actions={
        <ButtonGroup>
          <Button size="sm" variant="danger" onClick={onClose}>
            <Text variant="small">Close</Text>
          </Button>
        </ButtonGroup>
      }
    >
      {isLoadingPlayer || !player ? (
        <div className="flex items-center justify-center py-12">
          <Text variant="body" classes="text-gray-500 dark:text-gray-400">Loading player data...</Text>
        </div>
      ) : vis?.pool === "hs" ? (
        <HSScoutingContent
          player={player}
          orgId={orgId}
          leagueYearId={leagueYearId}
          scoutingBudget={scoutingBudget}
          isUnlocking={isUnlocking}
          onUnlock={handleUnlock}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {/* ── Always-visible Header: Face + Bio ── */}
          <div className="flex gap-4">
            {/* Player Face + Team Logo */}
            <div className="flex flex-col items-center shrink-0">
              <div className="flex items-center justify-center h-[6rem] w-[6rem] sm:h-[8rem] sm:w-[8rem] px-5 rounded-lg border-2 bg-white">
                <PlayerPicture
                  playerID={playerId}
                  league={league as League}
                  team={team}
                />
              </div>
              {team && (
                <Logo
                  url={teamLogo}
                  label={team.team_abbrev ?? ""}
                  classes="h-[3rem] max-h-[3rem]"
                  containerClass="p-1"
                  textClass="text-small"
                />
              )}
            </div>

            {/* Bio Grid */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                <BioField label="Age" value={String(bio!.age)} />
                <BioField label="Type" value={bio!.ptype} />
                <BioField label="Area" value={bio!.area} />
                <BioField label="Height" value={heightDisplay(bio!.height)} />
                <BioField label="Weight" value={`${bio!.weight} lbs`} />
                <BioField label="Bats / Throws" value={`${bio!.bat_hand ?? "—"} / ${bio!.pitch_hand ?? "—"}`} />
                <BioField label="Durability" value={bio!.durability} />
                <BioField label="Injury Risk" value={bio!.injury_risk} />
                <BioField label="Origin" value={bio!.intorusa === "usa" ? "USA" : "International"} />
              </div>
              {/* Pitches */}
              {(bio!.pitch1_name || bio!.pitch2_name) && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {[bio!.pitch1_name, bio!.pitch2_name, bio!.pitch3_name, bio!.pitch4_name, bio!.pitch5_name]
                    .filter(Boolean)
                    .map((name, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">
                        {name}
                      </span>
                    ))}
                </div>
              )}
              {/* Contract/Year summary line */}
              {player.contract && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {isCollege ? (
                    <span>
                      {getClassYear(player.contract).label || "—"} (Year {player.contract.current_year} of {player.contract.years})
                      {player.contract.is_extension && <span className="ml-1 text-yellow-600 dark:text-yellow-400">(Redshirt)</span>}
                    </span>
                  ) : (
                    <span>
                      Contract: Yr {player.contract.current_year} of {player.contract.years}
                      {player.contract.current_year_detail?.base_salary != null && (
                        <span className="ml-1">
                          — ${player.contract.current_year_detail.base_salary.toLocaleString()}
                        </span>
                      )}
                      {player.contract.on_ir && (
                        <span className="ml-1 text-red-600 dark:text-red-400 font-semibold">IL</span>
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Scouting Actions (always visible when available) ── */}
          {vis && (vis.available_actions.length > 0 || vis.unlocked.length > 0) && (
            <Border classes="p-3">
              <Text variant="small" classes="font-semibold mb-2">Scouting Actions</Text>
              <div className="flex gap-2 flex-wrap">
                {vis.unlocked.map((action) => (
                  <PillButton key={action} variant="primaryOutline" disabled>
                    <Text variant="small" classes="text-gray-400 line-through">
                      {actionLabels[action] ?? action} ✓
                    </Text>
                  </PillButton>
                ))}
                {vis.available_actions.map((action) => (
                  <PillButton
                    key={action}
                    variant="primaryOutline"
                    disabled={isUnlocking || (scoutingBudget != null && scoutingBudget.remaining_points < (actionCosts[action] ?? 0))}
                    onClick={() => handleUnlock(action)}
                  >
                    <Text variant="small">
                      {actionLabels[action] ?? action} ({actionCosts[action] ?? "?"} pts)
                    </Text>
                  </PillButton>
                ))}
              </div>
              {scoutingBudget && (
                <Text variant="xs" classes="text-gray-400 mt-1">
                  Budget: {scoutingBudget.remaining_points} / {scoutingBudget.total_points} pts remaining
                </Text>
              )}
            </Border>
          )}

          {/* ── Tab Bar ── */}
          <TabGroup classes="mb-0">
            <Tab label="Attributes" selected={selectedTab === "Attributes"} setSelected={setSelectedTab} />
            <Tab label="Potentials" selected={selectedTab === "Potentials"} setSelected={setSelectedTab} />
            <Tab label="Contract" selected={selectedTab === "Contract"} setSelected={setSelectedTab} />
            <Tab label="Injuries" selected={selectedTab === "Injuries"} setSelected={setSelectedTab} />
            <Tab label="Statistics" selected={selectedTab === "Statistics"} setSelected={setSelectedTab} />
          </TabGroup>

          {/* ── Tab Content ── */}
          {selectedTab === "Attributes" && (
            <AttributesTab
              pool={vis?.pool}
              letterGrades={player.letter_grades}
              attributes={player.attributes}
              ptype={bio?.ptype ?? "Position"}
              bio={bio!}
              visibilityContext={player.visibility_context}
              displayFormat={player.display_format}
            />
          )}

          {selectedTab === "Potentials" && (
            <PotentialsTab
              potentials={player.potentials}
              ptype={bio?.ptype ?? "Position"}
              visibilityContext={player.visibility_context}
              displayFormat={player.display_format}
            />
          )}

          {selectedTab === "Contract" && (
            <ContractTab
              contract={player.contract}
              isCollege={isCollege}
            />
          )}

          {selectedTab === "Injuries" && (
            <InjuriesTab
              injuryHistory={injuryHistory}
              injuryLoading={injuryLoading}
            />
          )}

          {selectedTab === "Statistics" && (
            <StatisticsTab player={player} />
          )}
        </div>
      )}
    </Modal>
  );
};

// ═══════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════
// Attributes Tab
// ═══════════════════════════════════════════════════

interface AttributesTabProps {
  pool?: string;
  letterGrades?: Record<string, string>;
  attributes?: Record<string, number>;
  ptype: string;
  bio: ScoutingPlayerResponse["bio"];
  visibilityContext?: VisibilityContext;
  displayFormat?: string;
}

const AttributesTab: FC<AttributesTabProps> = ({
  pool,
  letterGrades,
  attributes,
  ptype,
  bio,
  visibilityContext,
  displayFormat,
}) => {
  const hasLetterGrades = letterGrades && Object.keys(letterGrades).length > 0;
  const hasNumeric = attributes && Object.keys(attributes).length > 0;
  const isHidden = displayFormat === "hidden" || (pool === "hs" && !displayFormat);
  const isFuzzed = visibilityContext ? !visibilityContext.attributes_precise : false;

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
  const groups = isPitcher
    ? [
        { title: "Pitching", attrs: PITCHING_ATTRS },
        { title: "Athletic", attrs: RUNNING_ATTRS },
      ]
    : [
        { title: "Batting", attrs: BATTING_ATTRS },
        { title: "Running", attrs: RUNNING_ATTRS },
        { title: "Fielding", attrs: FIELDING_ATTRS },
        { title: "Catching", attrs: CATCHER_ATTRS },
      ];

  const pitchSlots = isPitcher
    ? [1, 2, 3, 4, 5].filter((i) => bio[`pitch${i}_name` as keyof typeof bio])
    : [];

  return (
    <Border classes="p-3">
      <Text variant="small" classes="font-semibold mb-2">
        Attributes
        {hasNumeric && hasLetterGrades && (
          <span className="text-xs text-gray-400 font-normal ml-1">(Grade / Numeric)</span>
        )}
      </Text>
      {isFuzzed && (
        <Text variant="xs" classes="text-gray-400 mb-2">Estimated values — scout for precise data</Text>
      )}
      {!isFuzzed && hasNumeric && (
        <Text variant="xs" classes="text-green-600 dark:text-green-400 mb-2">Precise</Text>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {groups.map((group) => (
          <div key={group.title}>
            <Text variant="xs" classes="font-semibold text-gray-400 mb-1">{group.title}</Text>
            <div className="space-y-0.5">
              {group.attrs.map((attr) => (
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
        ))}
      </div>

      {/* Pitch sub-abilities for pitchers */}
      {pitchSlots.length > 0 && (
        <div className="mt-3">
          <Text variant="xs" classes="font-semibold text-gray-400 mb-1">Pitches</Text>
          <div className="space-y-2">
            {pitchSlots.map((slot) => {
              const pitchName = bio[`pitch${slot}_name` as keyof typeof bio] as string;
              const ovrKey = `pitch${slot}_ovr`;
              const ovr = attributes?.[`${ovrKey}_display`];
              const subKeys = ["pacc", "pcntrl", "pbrk", "consist"];
              return (
                <div key={slot} className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Text variant="xs" classes="font-semibold">{pitchName}</Text>
                    {ovr != null && (
                      <span className={`text-xs font-semibold ${ratingColor(ovr)}`}>
                        OVR: {ovr.toFixed(0)}
                      </span>
                    )}
                    {!ovr && letterGrades?.[ovrKey] && (
                      <span className={`text-xs font-semibold ${gradeColor(letterGrades[ovrKey])}`}>
                        OVR: {letterGrades[ovrKey]}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {subKeys.map((sub) => {
                      const key = `pitch${slot}_${sub}`;
                      return (
                        <AttrRow
                          key={key}
                          attrKey={key}
                          label={sub === "pacc" ? "Acc" : sub === "pcntrl" ? "Ctrl" : sub === "pbrk" ? "Break" : "Cons"}
                          letterGrades={letterGrades}
                          attributes={attributes}
                          isHidden={isHidden}
                          isFuzzed={isFuzzed}
                          compact
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Border>
  );
};

// ═══════════════════════════════════════════════════
// Potentials Tab
// ═══════════════════════════════════════════════════

interface PotentialsTabProps {
  potentials?: Record<string, string | null>;
  ptype: string;
  visibilityContext?: VisibilityContext;
  displayFormat?: string;
}

const PotentialsTab: FC<PotentialsTabProps> = ({
  potentials,
  ptype,
  visibilityContext,
  displayFormat,
}) => {
  const hasPotentials = potentials && Object.keys(potentials).length > 0;
  const isHidden = displayFormat === "hidden";
  const potFuzzed = visibilityContext ? !visibilityContext.potentials_precise : false;

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
        <Text variant="xs" classes="text-gray-400">No potential data available.</Text>
      </Border>
    );
  }

  const isPitcher = ptype === "Pitcher";
  const groups = isPitcher ? PITCH_POTENTIAL_GROUPS : POS_POTENTIAL_GROUPS;

  return (
    <Border classes="p-3">
      <Text variant="small" classes="font-semibold mb-2">Potentials</Text>
      {potFuzzed && (
        <Text variant="xs" classes="text-gray-400 mb-2">Estimated values — scout for precise data</Text>
      )}
      {!potFuzzed && hasPotentials && (
        <Text variant="xs" classes="text-green-600 dark:text-green-400 mb-2">Precise</Text>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {groups.map((group) => (
          <div key={group.title}>
            <Text variant="xs" classes="font-semibold text-gray-400 mb-1">{group.title}</Text>
            <div className="space-y-0.5">
              {group.keys.map(({ key, label }) => {
                const val = potentials[key];
                if (val == null) return null;
                return (
                  <div key={key} className="flex justify-between text-xs py-0.5">
                    <span className="text-gray-400">{label}</span>
                    {val === "?" ? (
                      <span className="text-gray-500">?</span>
                    ) : (
                      <span className={`font-semibold ${gradeColor(val)}`}>
                        {val}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pitch potentials for pitchers */}
      {isPitcher && (() => {
        const pitchPotKeys = Object.keys(potentials).filter((k) => /^pitch\d+_.*_pot$/.test(k));
        if (pitchPotKeys.length === 0) return null;
        // Group by pitch slot
        const slots = new Map<number, { key: string; sub: string; val: string | null }[]>();
        for (const k of pitchPotKeys) {
          const match = k.match(/^pitch(\d+)_(.+)_pot$/);
          if (!match) continue;
          const slot = parseInt(match[1]);
          if (!slots.has(slot)) slots.set(slot, []);
          slots.get(slot)!.push({ key: k, sub: match[2], val: potentials[k] });
        }
        return (
          <div className="mt-3">
            <Text variant="xs" classes="font-semibold text-gray-400 mb-1">Pitch Potentials</Text>
            <div className="space-y-1">
              {Array.from(slots.entries()).map(([slot, subs]) => (
                <div key={slot} className="grid grid-cols-4 gap-1">
                  {subs.map(({ key, sub, val }) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-400 capitalize">{sub}</span>
                      {val == null || val === "?" ? (
                        <span className="text-gray-500">?</span>
                      ) : (
                        <span className={`font-semibold ${gradeColor(val)}`}>
                          {val}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </Border>
  );
};

// ═══════════════════════════════════════════════════
// Contract Tab
// ═══════════════════════════════════════════════════

const ContractTab: FC<{ contract?: any; isCollege: boolean }> = ({ contract, isCollege }) => {
  if (!contract) {
    return (
      <Border classes="p-3">
        <Text variant="xs" classes="text-gray-400">No contract data available.</Text>
      </Border>
    );
  }

  const fmt = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  if (isCollege) {
    const classYear = getClassYear(contract);
    return (
      <Border classes="p-3">
        <Text variant="small" classes="font-semibold mb-3">Eligibility</Text>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">Class</Text>
            <Text variant="small">{classYear.label || "—"}</Text>
          </div>
          <div className="flex flex-col">
            <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">Year</Text>
            <Text variant="small">{contract.current_year} of {contract.years}</Text>
          </div>
          {contract.is_extension && (
            <div className="flex flex-col">
              <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">Redshirt</Text>
              <Text variant="small" classes="text-yellow-600 dark:text-yellow-400">Yes</Text>
            </div>
          )}
        </div>
      </Border>
    );
  }

  // MLB contract
  const salary = contract.current_year_detail?.base_salary;
  const salaryDisplay = salary != null ? fmt(salary) : "—";
  const bonusDisplay = contract.bonus ? fmt(contract.bonus) : "—";

  return (
    <Border classes="p-3">
      <Text variant="small" classes="font-semibold mb-3">Contract</Text>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">Term</Text>
          <Text variant="small">Yr {contract.current_year} of {contract.years}</Text>
        </div>
        <div className="flex flex-col">
          <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">Salary</Text>
          <Text variant="small">{salaryDisplay}</Text>
        </div>
        {contract.bonus > 0 && (
          <div className="flex flex-col">
            <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">Bonus</Text>
            <Text variant="small">{bonusDisplay}</Text>
          </div>
        )}
        {contract.on_ir && (
          <div className="flex flex-col">
            <Text variant="body" classes="mb-1 whitespace-nowrap font-semibold">IL Status</Text>
            <Text variant="small" classes="text-red-600 dark:text-red-400 font-semibold">On IL</Text>
          </div>
        )}
      </div>
    </Border>
  );
};

// ═══════════════════════════════════════════════════
// Injuries Tab
// ═══════════════════════════════════════════════════

const InjuriesTab: FC<{ injuryHistory: InjuryHistoryItem[]; injuryLoading: boolean }> = ({
  injuryHistory,
  injuryLoading,
}) => {
  if (injuryLoading) {
    return (
      <Border classes="p-3">
        <Text variant="small" classes="text-gray-400 py-4 text-center">Loading injury history...</Text>
      </Border>
    );
  }

  if (injuryHistory.length === 0) {
    return (
      <Border classes="p-3">
        <Text variant="small" classes="text-gray-400 py-4 text-center">No injury history found.</Text>
      </Border>
    );
  }

  return (
    <Border classes="p-3">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
            <th className="px-2 py-1 text-left">Injury</th>
            <th className="px-2 py-1 text-center">Assigned</th>
            <th className="px-2 py-1 text-center">Remaining</th>
            <th className="px-2 py-1 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {injuryHistory.map((evt) => (
            <tr key={evt.event_id} className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-2 py-1.5">{evt.injury_name}</td>
              <td className="px-2 py-1.5 text-center">{evt.weeks_assigned}w</td>
              <td className="px-2 py-1.5 text-center">
                <span className={evt.weeks_remaining > 0 ? "text-red-600 dark:text-red-400 font-semibold" : "text-green-600 dark:text-green-400"}>
                  {evt.weeks_remaining > 0 ? `${evt.weeks_remaining}w` : "Healed"}
                </span>
              </td>
              <td className="px-2 py-1.5 text-gray-500">{evt.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Border>
  );
};

// ═══════════════════════════════════════════════════
// Statistics Tab
// ═══════════════════════════════════════════════════

const StatisticsTab: FC<{ player: ScoutingPlayerResponse }> = ({ player }) => {
  const hasGenerated = player.generated_stats;
  const hasCounting = player.counting_stats;
  const hasReport = player.text_report;

  // Fallback: fetch from GetPlayerStats when scouting endpoint doesn't include stats
  const [fallbackStats, setFallbackStats] = useState<PlayerStatsResponse | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  useEffect(() => {
    if (hasGenerated || hasCounting) return;
    let cancelled = false;
    setFallbackLoading(true);
    BaseballService.GetPlayerStats(player.bio.id, {})
      .then((data) => { if (!cancelled) setFallbackStats(data); })
      .catch(() => { if (!cancelled) setFallbackStats(null); })
      .finally(() => { if (!cancelled) setFallbackLoading(false); });
    return () => { cancelled = true; };
  }, [player.bio.id, hasGenerated, hasCounting]);

  const hasFallback = fallbackStats && (
    (fallbackStats.batting?.length ?? 0) > 0 ||
    (fallbackStats.pitching?.length ?? 0) > 0 ||
    (fallbackStats.fielding?.length ?? 0) > 0
  );

  if (!hasGenerated && !hasCounting && !hasReport && !hasFallback && !fallbackLoading) {
    return (
      <Border classes="p-3">
        <Text variant="xs" classes="text-gray-400">No statistics available.</Text>
      </Border>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Text Report */}
      {hasReport && (
        <Border classes="p-3">
          <Text variant="small" classes="font-semibold mb-2">Scout Report</Text>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {player.text_report!.batting && <ReportCard title="Batting" text={player.text_report!.batting} />}
            {player.text_report!.fielding && <ReportCard title="Fielding" text={player.text_report!.fielding} />}
            {player.text_report!.pitching && <ReportCard title="Pitching" text={player.text_report!.pitching} />}
            {player.text_report!.athletic && <ReportCard title="Athletic" text={player.text_report!.athletic} />}
          </div>
        </Border>
      )}

      {/* Generated Stats */}
      {hasGenerated && (
        <Border classes="p-3">
          <Text variant="small" classes="font-semibold mb-2">Season Stats</Text>
          {player.generated_stats!.batting && <GeneratedBattingSection stats={player.generated_stats!.batting} />}
          {player.generated_stats!.fielding && <GeneratedFieldingSection stats={player.generated_stats!.fielding} />}
          {player.generated_stats!.pitching && <GeneratedPitchingSection stats={player.generated_stats!.pitching} />}
        </Border>
      )}

      {/* Counting Stats (INTAM) */}
      {hasCounting && (
        <Border classes="p-3">
          <Text variant="small" classes="font-semibold mb-2">Stats</Text>
          {player.counting_stats!.batting && <GeneratedBattingSection stats={player.counting_stats!.batting} />}
          {player.counting_stats!.fielding && <GeneratedFieldingSection stats={player.counting_stats!.fielding} />}
          {player.counting_stats!.pitching && <GeneratedPitchingSection stats={player.counting_stats!.pitching} />}
        </Border>
      )}

      {/* Fallback: stats from GetPlayerStats endpoint */}
      {fallbackLoading && (
        <Border classes="p-3">
          <Text variant="xs" classes="text-gray-400">Loading statistics...</Text>
        </Border>
      )}
      {!hasGenerated && !hasCounting && hasFallback && fallbackStats && (
        <Border classes="p-3">
          <Text variant="small" classes="font-semibold mb-2">Season Stats</Text>
          {fallbackStats.batting.length > 0 && (
            <div className="mb-3">
              <Text variant="xs" classes="font-semibold text-gray-400 mb-1">Batting</Text>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-gray-400 border-b dark:border-gray-600">
                    <th className="px-2 py-1 text-center">Year</th><th className="px-2 py-1 text-center">Team</th>
                    <th className="px-2 py-1 text-center">G</th><th className="px-2 py-1 text-center">AB</th>
                    <th className="px-2 py-1 text-center">H</th><th className="px-2 py-1 text-center">HR</th>
                    <th className="px-2 py-1 text-center">RBI</th><th className="px-2 py-1 text-center">BB</th>
                    <th className="px-2 py-1 text-center">SO</th><th className="px-2 py-1 text-center">SB</th>
                    <th className="px-2 py-1 text-center">AVG</th><th className="px-2 py-1 text-center">OBP</th>
                  </tr></thead>
                  <tbody>
                    {fallbackStats.batting.map((s, i) => (
                      <tr key={i} className="border-b dark:border-gray-700">
                        <td className="px-2 py-1 text-center">{s.league_year_id}</td>
                        <td className="px-2 py-1 text-center">{s.team_abbrev}</td>
                        <td className="px-2 py-1 text-center">{s.g}</td><td className="px-2 py-1 text-center">{s.ab}</td>
                        <td className="px-2 py-1 text-center">{s.h}</td><td className="px-2 py-1 text-center">{s.hr}</td>
                        <td className="px-2 py-1 text-center">{s.rbi}</td><td className="px-2 py-1 text-center">{s.bb}</td>
                        <td className="px-2 py-1 text-center">{s.so}</td><td className="px-2 py-1 text-center">{s.sb}</td>
                        <td className="px-2 py-1 text-center font-semibold">{s.avg}</td>
                        <td className="px-2 py-1 text-center font-semibold">{s.obp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {fallbackStats.pitching.length > 0 && (
            <div className="mb-3">
              <Text variant="xs" classes="font-semibold text-gray-400 mb-1">Pitching</Text>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-gray-400 border-b dark:border-gray-600">
                    <th className="px-2 py-1 text-center">Year</th><th className="px-2 py-1 text-center">Team</th>
                    <th className="px-2 py-1 text-center">G</th><th className="px-2 py-1 text-center">GS</th>
                    <th className="px-2 py-1 text-center">W</th><th className="px-2 py-1 text-center">L</th>
                    <th className="px-2 py-1 text-center">SV</th><th className="px-2 py-1 text-center">IP</th>
                    <th className="px-2 py-1 text-center">SO</th><th className="px-2 py-1 text-center">BB</th>
                    <th className="px-2 py-1 text-center">ERA</th><th className="px-2 py-1 text-center">WHIP</th>
                  </tr></thead>
                  <tbody>
                    {fallbackStats.pitching.map((s, i) => (
                      <tr key={i} className="border-b dark:border-gray-700">
                        <td className="px-2 py-1 text-center">{s.league_year_id}</td>
                        <td className="px-2 py-1 text-center">{s.team_abbrev}</td>
                        <td className="px-2 py-1 text-center">{s.g}</td><td className="px-2 py-1 text-center">{s.gs}</td>
                        <td className="px-2 py-1 text-center">{s.w}</td><td className="px-2 py-1 text-center">{s.l}</td>
                        <td className="px-2 py-1 text-center">{s.sv}</td><td className="px-2 py-1 text-center">{s.ip}</td>
                        <td className="px-2 py-1 text-center">{s.so}</td><td className="px-2 py-1 text-center">{s.bb}</td>
                        <td className="px-2 py-1 text-center font-semibold">{s.era}</td>
                        <td className="px-2 py-1 text-center font-semibold">{s.whip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {fallbackStats.fielding.length > 0 && (
            <div className="mb-3">
              <Text variant="xs" classes="font-semibold text-gray-400 mb-1">Fielding</Text>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-gray-400 border-b dark:border-gray-600">
                    <th className="px-2 py-1 text-center">Year</th><th className="px-2 py-1 text-center">Team</th>
                    <th className="px-2 py-1 text-center">Pos</th><th className="px-2 py-1 text-center">G</th>
                    <th className="px-2 py-1 text-center">INN</th><th className="px-2 py-1 text-center">PO</th>
                    <th className="px-2 py-1 text-center">A</th><th className="px-2 py-1 text-center">E</th>
                  </tr></thead>
                  <tbody>
                    {fallbackStats.fielding.map((s, i) => (
                      <tr key={i} className="border-b dark:border-gray-700">
                        <td className="px-2 py-1 text-center">{s.league_year_id}</td>
                        <td className="px-2 py-1 text-center">{s.team_abbrev}</td>
                        <td className="px-2 py-1 text-center">{s.pos}</td><td className="px-2 py-1 text-center">{s.g}</td>
                        <td className="px-2 py-1 text-center">{s.inn}</td><td className="px-2 py-1 text-center">{s.po}</td>
                        <td className="px-2 py-1 text-center">{s.a}</td><td className="px-2 py-1 text-center">{s.e}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Border>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════
// Shared atomic components
// ═══════════════════════════════════════════════════

// Single attribute row: shows label + grade/numeric
const AttrRow: FC<{
  attrKey: string;
  label: string;
  letterGrades?: Record<string, string>;
  attributes?: Record<string, number>;
  isHidden?: boolean;
  isFuzzed?: boolean;
  compact?: boolean;
}> = ({ attrKey, label, letterGrades, attributes, isHidden, isFuzzed, compact }) => {
  const grade = letterGrades?.[attrKey];
  const numeric = attributes?.[`${attrKey}_display`];

  const cls = compact ? "flex justify-between text-xs" : "flex justify-between text-xs py-0.5";
  // Hidden display format: attributes not yet scouted
  if (isHidden && !grade && numeric == null) {
    return (
      <div className={cls}>
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-500">?</span>
      </div>
    );
  }

  return (
    <div className={cls}>
      <span className="text-gray-400">{label}</span>
      <span className="flex gap-1.5">
        {grade && <span className={`font-semibold ${gradeColor(grade)}`}>{grade}</span>}
        {numeric != null && (
          <span className={`${ratingColor(numeric)} ${grade ? "text-gray-300" : "font-semibold"}`}>
            {grade ? `(${numeric.toFixed(0)})` : `${numeric.toFixed(0)}`}
          </span>
        )}
        {!grade && numeric == null && <span className="text-gray-500">?</span>}
      </span>
    </div>
  );
};

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
