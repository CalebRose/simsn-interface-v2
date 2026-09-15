import { useEffect, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../_design/Buttons";
import { Border } from "../../_design/Borders";
import { PageContainer } from "../../_design/Container";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import routes from "../../_constants/routes";
import { LacrosseAdminService, LacrosseService, LaxGameplan, LaxLineupAssignment, LaxPlayer, LaxTeam, getLaxLogoUrl } from "../../_services/lacrosseService";
import { useAuthStore } from "../../context/AuthContext";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { CollegeLacrossePlayerModal, LacrossePlayerFace } from "./CollegeLacrossePlayerModal";
import { getLacrosseGradeColor, getLacrosseYearAbbreviation } from "./lacrosseFormatting";

type Position = "Attack" | "Midfield" | "Defense" | "Goalie";
type LineupTab = "FOGO" | Position;
type LineupSortKey = "player" | "depth" | "starter" | "longShot" | "usage" | "FO" | "SPD" | "HND" | "PAS" | "SHP" | "SHA" | "BC" | "SC" | "GB" | "GV" | "IQ" | "STA";
type SortDirection = "asc" | "desc";
const positions: Position[] = ["Attack", "Midfield", "Defense", "Goalie"];
const lineupTabs: LineupTab[] = ["FOGO", ...positions];
const paceOptions = ["Very Slow", "Slow", "Balanced", "Fast", "Very Fast"];
const offensiveStyleOptions = ["Traditional", "Motion", "Possession", "Quick Strike", "Perimeter", "Inside-Out"];
const defensiveStyleOptions = ["Man-to-Man", "Zone"];
const defaultGameplan = (teamId: number): LaxGameplan => ({
  teamId,
  pace: "Balanced",
  offensiveStyle: "Traditional",
  defensiveStyle: "Man-to-Man",
  preserveTimeouts: false,
  trigger2Enabled: false,
  trigger2Value: 3,
  trigger3Enabled: false,
  trigger3Value: undefined,
  trigger3Exhaustion: 75,
  trigger4Enabled: false,
  trigger4Value: 70,
});
const starterCounts: Record<Position, number> = { Attack: 3, Midfield: 3, Defense: 3, Goalie: 1 };
const midfieldRoleLabels: Record<string, string> = { Offense: "Offensive", Defense: "Defensive", "Two-way": "Two-Way" };
const errorText = (error: unknown) => error instanceof Error ? error.message : "The SimLAX API could not be reached.";
const positionAbbreviations: Record<Position, string> = { Attack: "Atk", Midfield: "Mid", Defense: "Def", Goalie: "G" };
const gradeSortValues: Record<string, number> = { "A+": 13, A: 12, "A-": 11, "B+": 10, B: 9, "B-": 8, "C+": 7, C: 6, "C-": 5, "D+": 4, D: 3, "D-": 2, F: 1 };
const lineupAttributeColumns: Array<{ label: string; title: string; value: (player: LaxPlayer) => string | number }> = [
  { label: "SPD", title: "Speed", value: (player) => player.grades.speed },
  { label: "HND", title: "Handling", value: (player) => player.grades.handling },
  { label: "PAS", title: "Passing", value: (player) => player.grades.passing },
  { label: "SHP", title: "Shooting Power", value: (player) => player.grades.shotPower },
  { label: "SHA", title: "Shooting Accuracy", value: (player) => player.grades.shotAccuracy },
  { label: "BC", title: "Body Checking", value: (player) => player.grades.bodyCheck },
  { label: "SC", title: "Stick Checking", value: (player) => player.grades.stickCheck },
  { label: "GB", title: "Goalie Blocking", value: (player) => player.grades.goalieBlocking },
  { label: "GV", title: "Goalie Vision", value: (player) => player.grades.goalieVision },
  { label: "IQ", title: "IQ", value: (player) => player.grades.laxiq },
  { label: "STA", title: "Stamina", value: (player) => player.ratings.stamina },
];
const fogoAttributeColumns: Array<{ label: string; title: string; value: (player: LaxPlayer) => string | number }> = [
  { label: "FO", title: "Faceoff", value: (player) => player.grades.faceoff },
  { label: "SPD", title: "Speed", value: (player) => player.grades.speed },
  { label: "HND", title: "Handling", value: (player) => player.grades.handling },
  { label: "PAS", title: "Passing", value: (player) => player.grades.passing },
  { label: "IQ", title: "IQ", value: (player) => player.grades.laxiq },
  { label: "STA", title: "Stamina", value: (player) => player.ratings.stamina },
];
const shotPreferencePresets = [
  { label: "Mostly Inside", long: 10 },
  { label: "More Inside", long: 30 },
  { label: "Balanced", long: 50 },
  { label: "More Outside", long: 70 },
  { label: "Mostly Outside", long: 90 },
] as const;
const nearestShotPreference = (longShotProportion?: number) => shotPreferencePresets.reduce((nearest, candidate) => {
  const value = longShotProportion ?? 50;
  const nearestDistance = Math.abs(nearest.long - value);
  const candidateDistance = Math.abs(candidate.long - value);
  if (candidateDistance < nearestDistance) return candidate;
  if (candidateDistance === nearestDistance && Math.abs(candidate.long - 50) < Math.abs(nearest.long - 50)) return candidate;
  return nearest;
}, shotPreferencePresets[2]);

const GameplanToggle = ({ checked, onChange, label, color }: { checked: boolean; onChange: (checked: boolean) => void; label: string; color: string }) => <button
  type="button"
  role="switch"
  aria-checked={checked}
  aria-label={label}
  onClick={() => onChange(!checked)}
  className="relative h-6 w-11 shrink-0 rounded-full border border-slate-400 transition-colors"
  style={{ backgroundColor: checked ? color : "#475569" }}
>
  <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" style={{ left: "3px", transform: checked ? "translateX(19px)" : "translateX(0)" }} />
</button>;

const StarterCard = ({ player, team, onClick }: { player: LaxPlayer; team: LaxTeam; onClick: () => void }) => {
  const primary = team.colors.primary || "#172554";
  const secondary = team.colors.secondary || "#ffffff";
  return <button
    onClick={onClick}
    className={`relative z-20 flex flex-col items-center justify-between rounded-lg border-2 p-2 text-center shadow-lg transition-transform hover:scale-[1.02] ${getTextColorBasedOnBg(primary)}`}
    style={{ backgroundColor: primary, borderColor: secondary, width: "132px", minHeight: "142px" }}
  >
    <span className="absolute left-0 top-0 rounded-br-md px-1.5 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: "rgba(0,0,0,.85)" }}>
      {positionAbbreviations[player.position as Position]}
    </span>
    <span className="absolute right-0 top-0 rounded-bl-md px-1.5 py-0.5 text-xs font-bold" style={{ backgroundColor: "rgba(0,0,0,.85)", color: getLacrosseGradeColor(player.grades.overall) }}>
      {player.grades.overall}
    </span>
    <span className="absolute right-0 top-6 rounded-l-md px-1.5 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: "rgba(0,0,0,.85)" }}>
      {getLacrosseYearAbbreviation(player.year)}
    </span>
    <div className="mt-3"><LacrossePlayerFace player={player} team={team} size="small" /></div>
    <span className="w-full leading-tight">
      <strong className="block text-xs">{player.firstName}</strong>
      <strong className="block truncate text-sm">{player.lastName}</strong>
    </span>
  </button>;
};

const normalize = (player: LaxPlayer): LaxPlayer => {
  const shotPreference = nearestShotPreference(player.roster.longShotProportion);
  return {
    ...player,
    roster: {
      ...player.roster,
      usage: player.roster.usage,
      longShotProportion: player.position === "Goalie" ? undefined : shotPreference.long,
      closeShotProportion: player.position === "Goalie" ? undefined : 100 - shotPreference.long,
      midfieldRole: player.position === "Midfield" ? (midfieldRoleLabels[player.roster.midfieldRole || ""] || player.roster.midfieldRole || "Two-Way") : undefined,
    },
  };
};

const lineupStateKey = (lineupPlayers: LaxPlayer[]) => JSON.stringify(
  [...lineupPlayers]
    .sort((a, b) => a.id - b.id)
    .map((player) => ({
      playerId: player.id,
      isStarter: player.roster.isStarter,
      starterSlot: player.roster.starterSlot ?? null,
      midfieldRole: player.position === "Midfield" ? player.roster.midfieldRole ?? null : null,
      fogoDepth: player.roster.fogoDepth ?? null,
      fogoStrategy: player.roster.fogoStrategy ?? null,
      usage: player.roster.usage ?? null,
      longShotProportion: player.position === "Goalie" ? null : player.roster.longShotProportion ?? null,
      closeShotProportion: player.position === "Goalie" ? null : player.roster.closeShotProportion ?? null,
    })),
);

export const CollegeLacrosseLineupsPage = () => {
  const { teamId } = useParams<{ teamId?: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { currentUser } = useAuthStore();
  const [teams, setTeams] = useState<LaxTeam[]>([]);
  const [ownedTeam, setOwnedTeam] = useState<LaxTeam | null>(null);
  const [team, setTeam] = useState<LaxTeam | null>(null);
  const [players, setPlayers] = useState<LaxPlayer[]>([]);
  const [savedPlayers, setSavedPlayers] = useState<LaxPlayer[]>([]);
  const [position, setPosition] = useState<LineupTab>("Attack");
  const [addPlayerId, setAddPlayerId] = useState("");
  const [sortKey, setSortKey] = useState<LineupSortKey>("player");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [profile, setProfile] = useState<LaxPlayer | null>(null);
  const [gameplan, setGameplan] = useState<LaxGameplan | null>(null);
  const [savedGameplan, setSavedGameplan] = useState<LaxGameplan | null>(null);
  const [aiControl, setAiControl] = useState(false);
  const [aiControlSaving, setAiControlSaving] = useState(false);
  const [timeoutsExpanded, setTimeoutsExpanded] = useState(false);
  const [gameplanSaving, setGameplanSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    let cancelled = false;
    LacrosseAdminService.getStatus()
      .then((status) => { if (!cancelled) setIsAdmin(status.isAdmin); })
      .catch(() => { if (!cancelled) setIsAdmin(false); });
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  useEffect(() => {
    let cancelled = false;
    setAdminMode(false);
    setLoading(true);
    Promise.all([
      LacrosseService.getTeams(),
      currentUser?.id ? LacrosseService.getUserTeam(currentUser.id) : Promise.resolve(null),
    ]).then(([response, mine]) => {
      if (cancelled) return;
      setTeams(response.teams);
      setOwnedTeam(mine);
      const requested = Number(teamId);
      const selected = Number.isInteger(requested) && requested > 0 ? requested : mine?.id;
      if (!selected) throw new Error("You do not currently coach a SimCLAX team. Select a team from Available Teams first.");
      return Promise.all([
        LacrosseService.getRoster(selected),
        mine?.id === selected
          ? LacrosseService.getGameplan(selected).catch(() => defaultGameplan(selected))
          : Promise.resolve(null),
      ]);
    }).then((result) => {
      if (!result || cancelled) return;
      const [roster, loadedGameplan] = result;
      const normalized = roster.players.map(normalize);
      setTeam(roster.team); setPlayers(normalized); setSavedPlayers(normalized);
      setAiControl(roster.aiControl);
      setLoadError("");
      setGameplan(loadedGameplan); setSavedGameplan(loadedGameplan);
    }).catch((reason) => !cancelled && setLoadError(errorText(reason)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [currentUser?.id, teamId]);

  const isOwner = Boolean(team && ownedTeam?.id === team.id);
  const canEdit = isOwner || (isAdmin && adminMode);
  const options = useMemo(() => teams.map((item) => ({ value: String(item.id), label: `${item.name} | ${item.abbreviation || "—"}` })), [teams]);
  const selectedOption = team ? options.find((item) => item.value === String(team.id)) : null;
  const starters = players.filter((player) => player.roster.isStarter).sort((a, b) => (a.roster.starterSlot || 99) - (b.roster.starterSlot || 99));
  const positionPlayers = players.filter((player) => position === "FOGO"
    ? player.position === "Midfield" && player.roster.fogoDepth != null
    : player.position === position && player.roster.usage != null).sort((a, b) => {
    const starterOrder = position === "FOGO" ? 0 : Number(b.roster.isStarter) - Number(a.roster.isStarter);
    if (starterOrder) return starterOrder;
    if (sortKey === "starter") return `${a.lastName}, ${a.firstName}`.localeCompare(`${b.lastName}, ${b.firstName}`);
    let aValue: string | number;
    let bValue: string | number;
    if (sortKey === "player") {
      aValue = `${a.lastName}, ${a.firstName}`; bValue = `${b.lastName}, ${b.firstName}`;
    } else if (sortKey === "depth") {
      aValue = a.roster.fogoDepth ?? Number.MAX_SAFE_INTEGER; bValue = b.roster.fogoDepth ?? Number.MAX_SAFE_INTEGER;
    } else if (sortKey === "longShot") {
      aValue = a.roster.longShotProportion ?? 0; bValue = b.roster.longShotProportion ?? 0;
    } else if (sortKey === "usage") {
      aValue = a.roster.usage ?? 0; bValue = b.roster.usage ?? 0;
    } else {
      const attribute = [...lineupAttributeColumns, ...fogoAttributeColumns].find((item) => item.label === sortKey)!;
      aValue = attribute.value(a); bValue = attribute.value(b);
    }
    const comparison = typeof aValue === "string" && typeof bValue === "string"
      ? ((gradeSortValues[aValue] != null && gradeSortValues[bValue] != null) ? gradeSortValues[aValue] - gradeSortValues[bValue] : aValue.localeCompare(bValue))
      : Number(aValue) - Number(bValue);
    return sortDirection === "asc" ? comparison : -comparison;
  });
  const visibleAttributeColumns = position === "FOGO" ? fogoAttributeColumns : position === "Goalie"
    ? lineupAttributeColumns
    : lineupAttributeColumns.filter((attribute) => attribute.label !== "GB" && attribute.label !== "GV");
  const availablePlayers = players.filter((player) => position === "FOGO"
    ? player.position === "Midfield" && player.roster.fogoDepth == null
    : player.position === position && player.roster.usage == null).sort((a, b) => b.ratings.overall - a.ratings.overall);
  const lineupError = positions.every((item) => players.filter((player) => player.position === item && player.roster.isStarter).length >= starterCounts[item])
    && players.filter((player) => player.roster.fogoDepth != null).length >= 2
    ? ""
    : "Lineup incomplete — assign 3 Attack, 3 Midfield, 3 Defense, 1 Goalie, and at least 2 faceoff players.";
  const valid = !lineupError;
  const hasLineupChanges = lineupStateKey(players) !== lineupStateKey(savedPlayers);

  const updatePlayer = (id: number, changes: Partial<LaxPlayer["roster"]>) => setPlayers((current) => current.map((player) => player.id === id ? { ...player, roster: { ...player.roster, ...changes } } : player));
  const updateGameplan = (changes: Partial<LaxGameplan>) => setGameplan((current) => current ? { ...current, ...changes } : current);
  const changeSort = (key: LineupSortKey) => {
    if (key === "starter") {
      setSortKey("starter");
      setSortDirection("desc");
      return;
    }
    if (sortKey === key) return setSortDirection((current) => current === "asc" ? "desc" : "asc");
    setSortKey(key);
    setSortDirection(key === "player" || key === "depth" ? "asc" : "desc");
  };
  const sortIndicator = (key: LineupSortKey) => sortKey === key ? (sortDirection === "asc" ? " ↑" : " ↓") : "";
  const toggleStarter = (player: LaxPlayer) => {
    if (!canEdit) return;
    if (player.roster.isStarter) return updatePlayer(player.id, { isStarter: false, starterSlot: undefined });
    const used = players.filter((item) => item.position === player.position && item.roster.isStarter).map((item) => item.roster.starterSlot || 0);
    const next = Array.from({ length: starterCounts[player.position as Position] }, (_, index) => index + 1).find((slot) => !used.includes(slot));
    if (!next) return enqueueSnackbar(`${player.position} already has the required number of starters.`, { variant: "warning", autoHideDuration: 4000 });
    updatePlayer(player.id, { isStarter: true, starterSlot: next });
  };
  const addPlayer = () => {
    if (!canEdit) return;
    const playerId = Number(addPlayerId);
    if (!playerId) return;
    if (position === "FOGO") {
      const nextDepth = Math.max(0, ...players.map((player) => player.roster.fogoDepth || 0)) + 1;
      updatePlayer(playerId, { fogoDepth: nextDepth, fogoStrategy: "get_off" });
    } else {
      updatePlayer(playerId, { usage: 5, longShotProportion: position === "Goalie" ? undefined : 50, closeShotProportion: position === "Goalie" ? undefined : 50 });
    }
    setAddPlayerId("");
  };
  const changeFogoDepth = (playerId: number, nextDepth: number) => {
    if (!canEdit) return;
    setPlayers((current) => {
      const selected = current.find((player) => player.id === playerId);
      const previousDepth = selected?.roster.fogoDepth;
      if (previousDepth == null || previousDepth === nextDepth) return current;
      return current.map((player) => {
        if (player.id === playerId) return { ...player, roster: { ...player.roster, fogoDepth: nextDepth } };
        if (player.roster.fogoDepth === nextDepth) return { ...player, roster: { ...player.roster, fogoDepth: previousDepth } };
        return player;
      });
    });
  };
  const removePlayer = (player: LaxPlayer) => {
    if (!canEdit) return;
    if (position === "FOGO") {
      setPlayers((current) => {
        const cleared = current.map((item) => item.id === player.id ? { ...item, roster: { ...item.roster, fogoDepth: undefined, fogoStrategy: undefined } } : item);
        const remaining = cleared.filter((item) => item.roster.fogoDepth != null).sort((a, b) => (a.roster.fogoDepth || 0) - (b.roster.fogoDepth || 0));
        const depths = new Map(remaining.map((item, index) => [item.id, index + 1]));
        return cleared.map((item) => depths.has(item.id) ? { ...item, roster: { ...item.roster, fogoDepth: depths.get(item.id) } } : item);
      });
      return;
    }
    updatePlayer(player.id, { isStarter: false, starterSlot: undefined, usage: undefined });
  };
  const autoSet = async () => {
    if (!team || !canEdit) return;
    setSaving(true);
    try {
      const response = await LacrosseService.autoLineup(team.id, adminMode);
      const normalized = response.players.map(normalize);
      setPlayers(normalized); setSavedPlayers(normalized); setAiControl(response.aiControl);
      enqueueSnackbar("AI lineup generated and saved.", { variant: "success", autoHideDuration: 4000 });
    } catch (reason) { enqueueSnackbar(errorText(reason), { variant: "error", autoHideDuration: 5000 }); } finally { setSaving(false); }
  };
  const changeAiControl = async (enabled: boolean) => {
    if (!team || !canEdit) return;
    setAiControlSaving(true);
    try {
      const response = await LacrosseService.setAiControl(team.id, enabled, adminMode);
      const normalized = response.players.map(normalize);
      setAiControl(response.aiControl); setPlayers(normalized); setSavedPlayers(normalized);
      enqueueSnackbar(enabled ? "AI Control enabled. The lineup will be regenerated by the weekly AI job." : "AI Control disabled. Your saved lineup will remain under manual control.", { variant: "success", autoHideDuration: 4500 });
    } catch (reason) { enqueueSnackbar(errorText(reason), { variant: "error", autoHideDuration: 5000 }); } finally { setAiControlSaving(false); }
  };
  const save = async () => {
    if (!team || !canEdit) return;
    if (lineupError) return enqueueSnackbar(lineupError, { variant: "error", autoHideDuration: 5000 });
    setSaving(true);
    try {
      const assignments: LaxLineupAssignment[] = players.map((player) => ({
        playerId: player.id, isStarter: player.roster.isStarter, starterSlot: player.roster.starterSlot,
        midfieldRole: player.position === "Midfield" ? player.roster.midfieldRole : undefined,
        fogoDepth: player.roster.fogoDepth, fogoStrategy: player.roster.fogoStrategy,
        usage: player.roster.usage, longShotProportion: player.position === "Goalie" ? undefined : player.roster.longShotProportion,
        closeShotProportion: player.position === "Goalie" ? undefined : player.roster.closeShotProportion,
      }));
      const response = await LacrosseService.saveLineup(team.id, assignments, adminMode);
      const normalized = response.players.map(normalize);
      setPlayers(normalized); setSavedPlayers(normalized);
      enqueueSnackbar("Lineup saved!", { variant: "success", autoHideDuration: 3000 });
    } catch (reason) { enqueueSnackbar(errorText(reason), { variant: "error", autoHideDuration: 5000 }); } finally { setSaving(false); }
  };
  const saveGameplan = async () => {
    if (!team || !gameplan || !canEdit) return;
    setGameplanSaving(true);
    try {
      const { teamId: _teamId, ...payload } = gameplan;
      const response = await LacrosseService.saveGameplan(team.id, payload, adminMode);
      setGameplan(response); setSavedGameplan(response);
      enqueueSnackbar("Gameplan saved!", { variant: "success", autoHideDuration: 3000 });
    } catch (reason) { enqueueSnackbar(errorText(reason), { variant: "error", autoHideDuration: 5000 }); } finally { setGameplanSaving(false); }
  };
  const enterAdminMode = async () => {
    if (!team || !isAdmin || isOwner) return;
    setSaving(true);
    try {
      const loadedGameplan = await LacrosseService.getGameplan(team.id, true);
      setGameplan(loadedGameplan);
      setSavedGameplan(loadedGameplan);
      setAdminMode(true);
      enqueueSnackbar(`Admin mode enabled for ${team.name}.`, { variant: "warning", autoHideDuration: 4000 });
    } catch (reason) {
      enqueueSnackbar(errorText(reason), { variant: "error", autoHideDuration: 5000 });
    } finally {
      setSaving(false);
    }
  };
  const exitAdminMode = () => {
    setPlayers(savedPlayers);
    setGameplan(savedGameplan);
    setAdminMode(false);
    enqueueSnackbar("Admin mode exited. Unsaved changes were discarded.", { variant: "info", autoHideDuration: 4000 });
  };

  return <PageContainer direction="col" isLoading={loading} title="Lineups">
    {!team && loadError && <Border classes="p-4 text-center text-red-500">{loadError}</Border>}
    {team && <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-80"><SelectDropdown options={options} value={selectedOption} placeholder="Select a team..." onChange={(option) => option && navigate(routes.CLAX_LINEUPS.replace(":teamId?", option.value))} /></div>
        <Button size="sm" onClick={() => navigate(routes.CLAX_TEAM.replace(":teamId?", String(team.id)))}>Roster</Button>
        {isAdmin && !isOwner && <Button size="sm" variant={adminMode ? "danger" : undefined} disabled={saving} onClick={adminMode ? exitAdminMode : () => void enterAdminMode()}>{adminMode ? "Exit Admin" : "Enter Admin"}</Button>}
        {canEdit && <div className="flex gap-2 sm:ml-auto"><Button size="sm" onClick={() => { setPlayers(savedPlayers); setGameplan(savedGameplan); enqueueSnackbar("Unsaved changes reset.", { variant: "info", autoHideDuration: 3000 }); }}>Reset</Button><Button size="sm" disabled={saving} onClick={autoSet}>{saving ? "Working..." : "Auto"}</Button><Button size="sm" disabled={!valid || saving || !hasLineupChanges} onClick={save}>{saving ? "Saving..." : "Save"}</Button></div>}
      </div>
      {adminMode && !isOwner && <Border classes="p-3 text-center font-semibold text-amber-300" styles={{ borderColor: team.colors.secondary || team.colors.primary }}>Admin Mode — you are editing {team.name}'s live lineup and gameplan.</Border>}
      {lineupError && <Border classes="p-3 text-center font-semibold text-amber-400" styles={{ borderColor: team.colors.secondary || team.colors.primary }}>{lineupError}</Border>}

      <Border classes="overflow-hidden p-4" styles={{ borderColor: team.colors.primary }}>
        <h2 className="mb-3 text-lg font-bold">Starting Lineup</h2>
        <div className="relative overflow-hidden rounded-xl border-2" style={{ borderColor: team.colors.primary || "#2563eb", backgroundColor: "#00a848" }}>
          <div className="relative min-h-[540px] p-5 pb-8">
            <div className="pointer-events-none absolute z-0" style={{ left: "25%", top: 0, bottom: 0, borderLeft: "3px solid rgba(255,255,255,.9)" }} />
            <div className="pointer-events-none absolute z-0" style={{ left: "25%", top: "50%", width: "9rem", height: "9rem", transform: "translate(-50%, -50%)", borderRadius: "9999px", border: "3px solid rgba(255,255,255,.9)" }} />
            <div className="relative z-10 grid min-h-[500px] grid-cols-1 gap-5 md:grid-cols-4">
              {positions.map((item) => <div key={item} className="flex flex-col items-center">
                <h3 className="mb-4 rounded bg-black/35 px-3 py-1 text-center font-bold text-white drop-shadow">{item}</h3>
                <div className={`relative flex w-full flex-1 flex-col items-center justify-around gap-3 ${item === "Goalie" ? "py-28" : ""}`}>
                  {item === "Goalie" && <svg
                    className="pointer-events-none absolute z-10"
                    style={{ left: "calc(50% + 66px)", top: "50%", width: "130px", height: "130px", transform: "translateY(-50%)" }}
                    viewBox="0 0 130 130"
                    aria-hidden="true"
                  >
                    <defs>
                      <pattern id={`goal-net-${team.id}`} width="14" height="14" patternUnits="userSpaceOnUse">
                        <path d="M-3 3 L3 -3 M-3 17 L17 -3 M11 17 L17 11" fill="none" stroke="white" strokeWidth="2" />
                        <path d="M-3 11 L3 17 M-3 -3 L17 17 M11 -3 L17 3" fill="none" stroke="white" strokeWidth="2" />
                      </pattern>
                    </defs>
                    <polygon points="8,8 8,122 120,65" fill={`url(#goal-net-${team.id})`} stroke="#f97316" strokeWidth="8" strokeLinejoin="round" />
                  </svg>}
                  {starters.filter((player) => player.position === item).map((player) => <StarterCard key={player.id} player={player} team={team} onClick={() => setProfile(player)} />)}
                </div>
              </div>)}
            </div>
          </div>
          <div className={`relative flex min-h-20 items-center justify-center border-t-2 px-24 ${getTextColorBasedOnBg(team.colors.primary || "#172554")}`} style={{ backgroundColor: team.colors.primary || "#172554", borderColor: team.colors.secondary || "#ffffff" }}>
            <div style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)" }}><Logo url={getLaxLogoUrl(team.logoFileName)} variant="normal" /></div>
            <strong className="text-center text-2xl tracking-widest md:text-4xl">{team.name.toUpperCase()}</strong>
            <div style={{ position: "absolute", right: "1.25rem", top: "50%", transform: "translateY(-50%)" }}><Logo url={getLaxLogoUrl(team.logoFileName)} variant="normal" /></div>
          </div>
        </div>
      </Border>

      {canEdit && gameplan && <Border classes="p-4" styles={{ borderColor: team.colors.primary }}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-left">Gameplan</h2>
            <p className="text-sm opacity-75 text-left">Set the team settings and management.</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 rounded bg-slate-800/70 px-3 text-sm font-semibold">
              <GameplanToggle label="AI Control" checked={aiControl} onChange={changeAiControl} color={team.colors.primary || "#2563eb"} />
              <span>{aiControlSaving ? "Updating..." : "AI Control"}</span>
            </div>
            <Button size="sm" onClick={() => setTimeoutsExpanded((current) => !current)}>Timeout Strategy {timeoutsExpanded ? "▴" : "▾"}</Button>
            <Button size="sm" disabled={gameplanSaving} onClick={saveGameplan}>{gameplanSaving ? "Saving..." : "Save Gameplan"}</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="text-sm font-semibold">Pace
            <select value={gameplan.pace || "Balanced"} onChange={(event) => updateGameplan({ pace: event.target.value })} className="mt-1 w-full rounded border border-slate-500 bg-slate-900 px-3 py-2 font-normal">
              {paceOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Offensive Style
            <select value={gameplan.offensiveStyle || "Traditional"} onChange={(event) => updateGameplan({ offensiveStyle: event.target.value })} className="mt-1 w-full rounded border border-slate-500 bg-slate-900 px-3 py-2 font-normal">
              {offensiveStyleOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Defensive Style
            <select value={gameplan.defensiveStyle || "Man-to-Man"} onChange={(event) => updateGameplan({ defensiveStyle: event.target.value })} className="mt-1 w-full rounded border border-slate-500 bg-slate-900 px-3 py-2 font-normal">
              {defensiveStyleOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        </div>
        {timeoutsExpanded && <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-600 pt-4 lg:grid-cols-4">
          <div className="flex min-h-24 items-center gap-3 rounded bg-slate-800/70 p-3 text-sm font-semibold">
            <GameplanToggle label="Preserve final timeout" checked={gameplan.preserveTimeouts} onChange={(checked) => updateGameplan({ preserveTimeouts: checked })} color={team.colors.primary || "#2563eb"} />
            <span>Preserve final timeout<div className="mt-1 text-xs font-normal opacity-70">Hold the last timeout until late in a half or overtime.</div></span>
          </div>
          <div className="min-h-24 rounded bg-slate-800/70 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold"><GameplanToggle label="Enable trailing threshold" checked={gameplan.trigger2Enabled} onChange={(checked) => updateGameplan({ trigger2Enabled: checked })} color={team.colors.primary || "#2563eb"} />Trailing threshold</div>
            <label className="mt-2 flex items-center gap-2 text-sm">Call when behind by <input disabled={!gameplan.trigger2Enabled} type="number" min="1" max="99" value={gameplan.trigger2Value} onChange={(event) => updateGameplan({ trigger2Value: Number(event.target.value) })} className="w-16 rounded border border-slate-500 bg-slate-900 p-2 text-center" /> goals</label>
          </div>
          <div className="min-h-24 rounded bg-slate-800/70 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold"><GameplanToggle label="Enable player exhaustion timeout" checked={gameplan.trigger3Enabled} onChange={(checked) => updateGameplan({ trigger3Enabled: checked })} color={team.colors.primary || "#2563eb"} />Player exhaustion</div>
            <div className="mt-2 flex gap-2">
              <select aria-label="Monitored player" disabled={!gameplan.trigger3Enabled} value={gameplan.trigger3Value ?? ""} onChange={(event) => updateGameplan({ trigger3Value: event.target.value ? Number(event.target.value) : undefined })} className="min-w-0 flex-1 rounded border border-slate-500 bg-slate-900 px-2 py-2 text-sm"><option value="">Select player...</option>{players.map((player) => <option key={player.id} value={player.id}>{player.firstName} {player.lastName}</option>)}</select>
              <label className="flex items-center text-sm"><input aria-label="Player exhaustion percentage" disabled={!gameplan.trigger3Enabled} type="number" min="0" max="100" value={gameplan.trigger3Exhaustion} onChange={(event) => updateGameplan({ trigger3Exhaustion: Number(event.target.value) })} className="w-16 rounded border border-slate-500 bg-slate-900 p-2 text-center" />%</label>
            </div>
          </div>
          <div className="min-h-24 rounded bg-slate-800/70 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold"><GameplanToggle label="Enable team exhaustion timeout" checked={gameplan.trigger4Enabled} onChange={(checked) => updateGameplan({ trigger4Enabled: checked })} color={team.colors.primary || "#2563eb"} />Team exhaustion</div>
            <label className="mt-2 flex items-center gap-2 text-sm">Call at <input disabled={!gameplan.trigger4Enabled} type="number" min="0" max="100" value={gameplan.trigger4Value} onChange={(event) => updateGameplan({ trigger4Value: Number(event.target.value) })} className="w-16 rounded border border-slate-500 bg-slate-900 p-2 text-center" />% average</label>
          </div>
        </div>}
      </Border>}

      <section>
        <h2 className="text-xl font-bold">Lineup management</h2>
        <p className="mb-3 opacity-80">Add and remove players, and their usage priority and strategies.</p>
        <Border classes="p-4" styles={{ borderColor: team.colors.primary }}>
          <nav className="mb-4 flex flex-wrap gap-2">
            {lineupTabs.map((item) => <Button key={item} size="sm" isSelected={position === item} onClick={() => { setPosition(item); setAddPlayerId(""); setSortKey(item === "FOGO" ? "depth" : "player"); setSortDirection("asc"); }}>{item}</Button>)}
          </nav>
          <div className="min-w-0">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <h3 className="text-lg font-bold">{position} depth chart ({positionPlayers.length})</h3>
                {canEdit && <div className="flex gap-2 sm:ml-auto">
                  <select value={addPlayerId} onChange={(event) => setAddPlayerId(event.target.value)} className="min-w-52 rounded border border-slate-500 bg-slate-900 px-3 py-2">
                    <option value="">{availablePlayers.length ? "Select a roster player..." : "All players added"}</option>
                    {availablePlayers.map((player) => <option key={player.id} value={player.id}>{player.firstName} {player.lastName}</option>)}
                  </select>
                  <Button size="sm" disabled={!addPlayerId} onClick={addPlayer}>+ Add</Button>
                </div>}
              </div>
              <div className="overflow-x-auto">
              <div className="mb-1 hidden items-end gap-2 px-3 text-xs font-semibold opacity-80 sm:grid" style={{ minWidth: position === "FOGO" ? "900px" : position === "Goalie" ? "1400px" : position === "Midfield" ? "1420px" : "1280px", gridTemplateColumns: position === "FOGO" ? "36px minmax(240px, 1fr) repeat(6, 58px) 86px 140px 38px" : position === "Goalie" ? "36px minmax(240px, 1fr) repeat(11, 58px) 96px 86px 38px" : position === "Midfield" ? "36px minmax(240px, 1fr) repeat(9, 58px) 96px 126px 130px 86px 38px" : "36px minmax(240px, 1fr) repeat(9, 58px) 96px 126px 86px 38px" }}>
                <span />
                <button type="button" onClick={() => changeSort("player")} className="text-left font-semibold" style={{ background: "transparent", border: 0 }}>Player{sortIndicator("player")}</button>
                {visibleAttributeColumns.map((attribute) => <button type="button" key={attribute.label} onClick={() => changeSort(attribute.label as LineupSortKey)} className="whitespace-nowrap text-center font-semibold" title={`Sort by ${attribute.title}`} style={{ background: "transparent", border: 0 }}>{attribute.label}{sortIndicator(attribute.label as LineupSortKey)}</button>)}
                {position === "FOGO" ? <><button type="button" onClick={() => changeSort("depth")} className="whitespace-nowrap text-center font-semibold" style={{ background: "transparent", border: 0 }}>Depth{sortIndicator("depth")}</button><span className="text-center">Strategy</span></> : <>
                  <button type="button" onClick={() => changeSort("starter")} className="whitespace-nowrap text-center font-semibold" style={{ background: "transparent", border: 0 }}>Starter{sortIndicator("starter")}</button>
                  {position !== "Goalie" && <button type="button" onClick={() => changeSort("longShot")} className="whitespace-nowrap text-center font-semibold" style={{ background: "transparent", border: 0 }}>Shot Preference{sortIndicator("longShot")}</button>}
                  {position === "Midfield" && <span className="text-center">Role</span>}
                </>}
                {position !== "FOGO" && <button type="button" onClick={() => changeSort("usage")} className="whitespace-nowrap text-center font-semibold" style={{ background: "transparent", border: 0 }}>Usage{sortIndicator("usage")}</button>}
                <span />
              </div>
              <div className="space-y-2">
                {positionPlayers.map((player, index) => <div key={player.id} className="rounded bg-slate-800/70 p-3">
                  <div className="grid items-center gap-2" style={{ minWidth: position === "FOGO" ? "900px" : position === "Goalie" ? "1400px" : position === "Midfield" ? "1420px" : "1280px", gridTemplateColumns: position === "FOGO" ? "36px minmax(240px, 1fr) repeat(6, 58px) 86px 140px 38px" : position === "Goalie" ? "36px minmax(240px, 1fr) repeat(11, 58px) 96px 86px 38px" : position === "Midfield" ? "36px minmax(240px, 1fr) repeat(9, 58px) 96px 126px 130px 86px 38px" : "36px minmax(240px, 1fr) repeat(9, 58px) 96px 126px 86px 38px" }}>
                    <strong className="text-blue-400">{index + 1}</strong>
                    <div className="text-left">
                      <span>{player.archetype} {positionAbbreviations[player.position as Position]} </span>
                      <strong className="cursor-pointer hover:text-[#fcd53f]" onClick={() => setProfile(player)}>{player.firstName} {player.lastName}</strong>
                      <span>, </span><em>{getLacrosseYearAbbreviation(player.year)}</em>
                      <span className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-lg font-bold leading-none text-white" style={{ backgroundColor: getLacrosseGradeColor(player.grades.overall), WebkitTextStroke: "0.5px black", textShadow: "0 1px 1px black" }}>{player.grades.overall}</span>
                    </div>
                    {visibleAttributeColumns.map((attribute) => {
                      const value = attribute.value(player);
                      return <span key={attribute.label} className="text-center font-bold" title={attribute.title} style={{ color: typeof value === "string" ? getLacrosseGradeColor(value) : undefined }}>{value}</span>;
                    })}
                    {position === "FOGO" ? <><select aria-label={`FOGO depth for ${player.firstName} ${player.lastName}`} disabled={!canEdit} value={player.roster.fogoDepth ?? ""} onChange={(event) => changeFogoDepth(player.id, Number(event.target.value))} className="rounded border border-slate-500 bg-slate-900 px-2 py-2 text-center text-sm">{positionPlayers.map((_, depthIndex) => <option key={depthIndex + 1} value={depthIndex + 1}>{depthIndex + 1}</option>)}</select><select disabled={!canEdit} value={player.roster.fogoStrategy || "get_off"} onChange={(event) => updatePlayer(player.id, { fogoStrategy: event.target.value })} className="rounded border border-slate-500 bg-slate-900 px-3 py-2 text-sm"><option value="get_off">Get off</option><option value="stay_on">Stay on</option></select></> : <><div className="flex justify-center">
                      <button
                        type="button"
                        disabled={!canEdit}
                        onClick={() => toggleStarter(player)}
                        title={player.roster.isStarter ? "Remove starter designation" : "Designate as starter"}
                        aria-label={player.roster.isStarter ? `Remove ${player.firstName} ${player.lastName} as a starter` : `Designate ${player.firstName} ${player.lastName} as a starter`}
                        aria-pressed={player.roster.isStarter}
                        className="rounded p-1 transition-transform hover:scale-110 disabled:cursor-default disabled:opacity-70"
                        style={{ background: "transparent", border: "none", boxShadow: "none" }}
                      >
                        <svg width="38" height="38" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="m12 2.5 2.86 5.8 6.4.93-4.63 4.51 1.09 6.38L12 17.11l-5.72 3.01 1.09-6.38-4.63-4.51 6.4-.93L12 2.5Z"
                            fill={player.roster.isStarter ? (team.colors.primary || "#2563eb") : "transparent"}
                            stroke={team.colors.secondary || "#ffffff"}
                            strokeWidth="0.9"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                    {position !== "Goalie" && <select aria-label={`Shot preference for ${player.firstName} ${player.lastName}`} disabled={!canEdit} value={nearestShotPreference(player.roster.longShotProportion).long} onChange={(event) => { const long = Number(event.target.value); updatePlayer(player.id, { longShotProportion: long, closeShotProportion: 100 - long }); }} className="w-full rounded border border-slate-500 bg-slate-900 px-2 py-2 text-sm">{shotPreferencePresets.map((preset) => <option key={preset.long} value={preset.long}>{preset.label}</option>)}</select>}
                    {position === "Midfield" && <select aria-label={`Role for ${player.firstName} ${player.lastName}`} disabled={!canEdit} value={player.roster.midfieldRole || "Two-Way"} onChange={(event) => updatePlayer(player.id, { midfieldRole: event.target.value })} className="rounded border border-slate-500 bg-slate-900 px-2 py-2 text-sm"><option value="Two-Way">Two-Way</option><option value="Offensive">Offense</option><option value="Defensive">Defense</option></select>}</>}
                    {position !== "FOGO" && <input aria-label={`Usage for ${player.firstName} ${player.lastName}`} disabled={!canEdit} type="number" min="1" max="10" value={player.roster.usage ?? ""} onChange={(event) => updatePlayer(player.id, { usage: Number(event.target.value) })} className="w-full rounded border border-slate-500 bg-slate-900 p-2 text-center text-sm" />}
                    {canEdit && <Button size="xs" variant="danger" title={`Remove ${player.firstName} ${player.lastName} from the lineup`} onClick={() => removePlayer(player)}>×</Button>}
                  </div>
                </div>)}
                {!positionPlayers.length && <div className="p-6 text-center opacity-70">No {position.toLowerCase()} players are currently in the lineup.</div>}
              </div>
              </div>
          </div>
        </Border>
      </section>
    </div>}
    <CollegeLacrossePlayerModal player={profile} team={team} onClose={() => setProfile(null)} />
  </PageContainer>;
};
