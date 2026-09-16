import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Border } from "../../_design/Borders";
import { Button } from "../../_design/Buttons";
import { PageContainer } from "../../_design/Container";
import { ScissorIcon, User } from "../../_design/Icons";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import routes from "../../_constants/routes";
import { LacrosseService, LaxPlayer, LaxTeamPreview, getLaxLogoUrl } from "../../_services/lacrosseService";
import { useSimLAXStore } from "../../context/SimLAXContext";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { ProfileTeamCardModal } from "../Profile/ProfileTeamCardModal";
import { CollegeLacrossePlayerModal } from "./CollegeLacrossePlayerModal";
import { getLacrosseYearAbbreviation } from "./lacrosseFormatting";

type RosterView = "overview" | "attributes";
type SortDirection = "asc" | "desc";
type BaseSortKey = "id" | "name" | "position" | "archetype" | "year" | "stars" | "overall" | "potential" | "healthiness" | "injury" | "cut";
type AttributeSortKey = `grade:${keyof LaxPlayer["grades"]}`;
type SortKey = BaseSortKey | AttributeSortKey;
const errorText = (error: unknown) => error instanceof Error ? error.message : "The SimLAX API could not be reached.";
const attributes: Array<[string, keyof LaxPlayer["grades"], string]> = [
  ["SPD", "speed", "Speed"], ["HND", "handling", "Handling"], ["PAS", "passing", "Passing"], ["SHP", "shotPower", "Shooting Power"],
  ["SHA", "shotAccuracy", "Shooting Accuracy"], ["BC", "bodyCheck", "Body Checking"], ["SC", "stickCheck", "Stick Checking"],
  ["GB", "goalieBlocking", "Goalie Blocking"], ["GV", "goalieVision", "Goalie Vision"], ["IQ", "laxiq", "IQ"],
];
const gradeRank: Record<string, number> = { "A+": 13, A: 12, "A-": 11, "B+": 10, B: 9, "B-": 8, "C+": 7, C: 6, "C-": 5, "D+": 4, D: 3, "D-": 2, F: 1 };
const injuryGrade = (rating: number, year: number) => {
  if (year <= 2) {
    if (rating >= 25) return "A";
    if (rating >= 19) return "B";
    if (rating >= 13) return "C";
    if (rating >= 7) return "D";
    return "F";
  }
  if (rating >= 29) return "A+";
  if (rating >= 27) return "A";
  if (rating >= 25) return "A-";
  if (rating >= 23) return "B+";
  if (rating >= 21) return "B";
  if (rating >= 19) return "B-";
  if (rating >= 17) return "C+";
  if (rating >= 15) return "C";
  if (rating >= 13) return "C-";
  if (rating >= 11) return "D+";
  if (rating >= 9) return "D";
  if (rating >= 7) return "D-";
  return "F";
};
export const CollegeLacrosseRosterPage = () => {
  const { teamId } = useParams<{ teamId?: string }>();
  const navigate = useNavigate();
  const { claxTeam: ownedTeam, claxTeamLoading, claxTeams: teams, claxRosters, laxAdminStatus, refreshClaxTeams, refreshClaxRoster, cutClaxPlayer } = useSimLAXStore();
  const isAdmin = Boolean(laxAdminStatus?.isAdmin);
  const requestedId = Number(teamId);
  const selectedId = Number.isInteger(requestedId) && requestedId > 0 ? requestedId : ownedTeam?.id;
  const team = selectedId ? claxRosters[selectedId]?.team : undefined;
  const players = selectedId ? claxRosters[selectedId]?.players ?? [] : [];
  const [teamGrades, setTeamGrades] = useState<Pick<LaxTeamPreview, "overallGrade" | "offenseGrade" | "defenseGrade">>({});
  const [view, setView] = useState<RosterView>("overview");
  const [cutCandidate, setCutCandidate] = useState<LaxPlayer | null>(null);
  const [profilePlayer, setProfilePlayer] = useState<LaxPlayer | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [cutting, setCutting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { void refreshClaxTeams(); }, [refreshClaxTeams]);

  useEffect(() => {
    if (claxTeamLoading) return;
    let cancelled = false;
    setLoading(true);
    Promise.resolve().then(() => {
      if (!selectedId) throw new Error("You do not currently coach a SimCLAX team. Select a team from Available Teams first.");
      return Promise.all([refreshClaxRoster(selectedId), LacrosseService.getPreview(selectedId)]);
    }).then((result) => {
      if (!result || cancelled) return;
      const [, preview] = result;
      setTeamGrades({ overallGrade: preview.overallGrade, offenseGrade: preview.offenseGrade, defenseGrade: preview.defenseGrade });
      setError("");
    }).catch((reason) => {
      if (!cancelled) setError(errorText(reason));
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [claxTeamLoading, selectedId, refreshClaxRoster]);

  const options = useMemo(() => teams.map((item) => ({
    value: String(item.id),
    label: `${item.name} | ${item.abbreviation || "—"}`,
  })), [teams]);
  const selectedOption = team ? options.find((option) => option.value === String(team.id)) : null;
  const isOwner = Boolean(team && ownedTeam?.id === team.id);
  const primary = team?.colors.primary || "#111827";
  const secondary = team?.colors.secondary || "#2563eb";
  const sortedPlayers = useMemo(() => {
    const valueFor = (player: LaxPlayer): string | number => {
      if (sortKey.startsWith("grade:")) return gradeRank[player.grades[sortKey.slice(6) as keyof LaxPlayer["grades"]]] ?? 0;
      switch (sortKey) {
        case "id": return player.id;
        case "name": return `${player.firstName} ${player.lastName}`;
        case "position": return player.position;
        case "archetype": return player.archetype;
        case "year": return player.year;
        case "stars": return player.stars;
        case "overall": return gradeRank[player.grades.overall] ?? 0;
        case "potential": return gradeRank[player.grades.potential] ?? 0;
        case "healthiness": return player.injury.isInjured ? 0 : 1;
        case "injury": return player.injury.isInjured ? player.injury.name || player.injury.injuryType || "Injured" : "None";
        case "cut": return player.id;
        default: return player.id;
      }
    };
    return [...players].sort((left, right) => {
      const a = valueFor(left);
      const b = valueFor(right);
      const comparison = typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b));
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [players, sortDirection, sortKey]);
  const sortBy = (key: SortKey) => {
    if (sortKey === key) setSortDirection((current) => current === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDirection("asc"); }
  };
  const SortHeader = ({ label, column, centered = false, title }: { label: string; column: SortKey; centered?: boolean; title?: string }) => (
    <th
      className={`cursor-pointer select-none whitespace-nowrap ${centered ? "text-center" : "text-left"}`}
      title={title}
      tabIndex={0}
      role="button"
      onClick={() => sortBy(column)}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") sortBy(column); }}
    >
      {label}{sortKey === column ? sortDirection === "asc" ? " ↑" : " ↓" : ""}
    </th>
  );
  const TeamGradeBadge = ({ label, grade }: { label: string; grade?: string }) => (
    <div className="flex flex-col items-center">
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 text-base font-bold leading-none text-white"
        style={{
          backgroundColor: "#111827",
          borderColor: secondary,
        }}
      >
        {grade || "—"}
      </span>
      <span className="mt-1 text-[11px] font-bold leading-none">{label}</span>
    </div>
  );

  const cutPlayer = async () => {
    if (!team || !cutCandidate) return;
    setCutting(true);
    try {
      await cutClaxPlayer(team.id, cutCandidate.id);
      setCutCandidate(null);
      setError("");
    } catch (reason) {
      setError(errorText(reason));
    } finally {
      setCutting(false);
    }
  };

  const exportRoster = () => {
    if (!team) return;
    const headers = [
      "Team", "Player ID", "First Name", "Last Name", "Position", "Archetype", "Year", "Age", "Stars", "State", "Country", "Overall",
      "Speed", "Handling", "Passing", "Shooting Power", "Shooting Accuracy", "Body Checking", "Stick Checking", "Goalie Blocking", "Goalie Vision", "IQ", "Stamina", "Injury", "Potential",
    ];
    const rows = players.map((player) => [
      team.name,
      player.id,
      player.firstName,
      player.lastName,
      player.position,
      player.archetype,
      getLacrosseYearAbbreviation(player.year),
      player.age,
      player.stars,
      player.state ?? "",
      player.country,
      player.grades.overall,
      player.grades.speed,
      player.grades.handling,
      player.grades.passing,
      player.grades.shotPower,
      player.grades.shotAccuracy,
      player.grades.bodyCheck,
      player.grades.stickCheck,
      player.grades.goalieBlocking,
      player.grades.goalieVision,
      player.grades.laxiq,
      player.ratings.stamina,
      injuryGrade(player.injury.injuryRating, player.year),
      player.grades.potential,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `clax_team_${team.name.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "")}_roster.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer direction="col" isLoading={loading} title="Team">
      {error && <Border classes="mb-3 p-3 text-red-500">{error}</Border>}
      {team && <div className="space-y-3">
        <Border classes={`p-4 ${getTextColorBasedOnBg(primary)}`} styles={{ borderColor: secondary, backgroundColor: primary }}>
          <div className="grid gap-4 lg:grid-cols-[minmax(280px,1.05fr)_minmax(300px,1fr)_minmax(300px,1fr)]">
            <div className="flex items-center gap-4">
              <Logo url={getLaxLogoUrl(team.logoFileName)} variant="large" />
              <div>
                <h2 className="text-xl font-bold">{team.name} {team.nickname}</h2>
                <div>{team.conference?.name || "Independent"}</div>
                <div className="mt-3 flex items-start gap-4">
                  <TeamGradeBadge label="OVR" grade={teamGrades.overallGrade} />
                  <TeamGradeBadge label="OFF" grade={teamGrades.offenseGrade} />
                  <TeamGradeBadge label="DEF" grade={teamGrades.defenseGrade} />
                </div>
              </div>
            </div>
            <Border classes="p-4" styles={{ borderColor: secondary }}>
              <div className="grid grid-cols-[90px_1fr] gap-y-2 text-sm">
                <strong>Coach</strong><span>{team.coach || "None"}</span>
                <strong>Staff</strong><span>None</span>
              </div>
            </Border>
            <Border classes="p-4" styles={{ borderColor: secondary }}>
              <div className="grid grid-cols-2 gap-4 text-center text-sm">
                <div><strong className="block">Venue</strong>{team.venue || "None"}</div>
                <div><strong className="block">Active Roster</strong>{players.length}</div>
              </div>
            </Border>
          </div>
        </Border>

        <div className="flex flex-col gap-3 p-2 sm:flex-row sm:items-center">
          <div className="w-full sm:w-72">
            <SelectDropdown
              options={options}
              value={selectedOption}
              placeholder="Select a team..."
              onChange={(option) => option && navigate(routes.CLAX_TEAM.replace(":teamId?", option.value))}
            />
          </div>
          {(isOwner || isAdmin) && <div className="flex gap-2 sm:ml-2">
                    <Button size="sm" onClick={() => navigate(routes.CLAX_LINEUPS.replace(":teamId", String(team.id)))}>Lineups</Button>
          </div>}
          <div className="flex gap-2 sm:ml-auto">
            <Button size="sm" isSelected={view === "overview"} onClick={() => setView("overview")}>Overview</Button>
            <Button size="sm" isSelected={view === "attributes"} onClick={() => setView("attributes")}>Attributes</Button>
            <Button size="sm" onClick={exportRoster}>Export</Button>
          </div>
        </div>

        <Border classes="overflow-x-auto" styles={{ borderColor: secondary }}>
          <table className={`w-full text-left text-sm ${view === "attributes" ? "min-w-[1400px]" : "min-w-[1000px]"}`}>
            <thead className="border-b border-white/70">
              <tr>
                <SortHeader label="ID" column="id"/><SortHeader label="Name" column="name"/><SortHeader label="Position" column="position"/><SortHeader label="Archetype" column="archetype"/><SortHeader label="Year" column="year" centered/><SortHeader label="Stars" column="stars" centered/><SortHeader label="Overall" column="overall" centered/><SortHeader label="Potential" column="potential" centered/>
                {view === "overview" ? <><SortHeader label="Healthiness" column="healthiness" centered/><SortHeader label="Injury" column="injury" centered/></> : attributes.map(([label, key, title]) => <SortHeader label={label} column={`grade:${key}`} centered title={title} key={label}/>)}
                {isOwner && <SortHeader label="Cut" column="cut" centered/>}
              </tr>
            </thead>
            <tbody>{sortedPlayers.map((player) => <tr key={player.id} className="border-b border-white/10 hover:bg-white/5">
              <td className="p-2">{player.id}</td>
              <td>
                <span
                  className="cursor-pointer font-semibold hover:text-[#fcd53f]"
                  onClick={() => setProfilePlayer(player)}
                >
                  {player.firstName} {player.lastName}
                </span>
              </td>
              <td>{player.position}</td><td>{player.archetype}</td><td className="text-center">{getLacrosseYearAbbreviation(player.year)}</td><td className="text-center">{player.stars}</td>
              <td className="text-center" title={`Rating: ${player.ratings.overall}`}>{player.grades.overall}</td><td className="text-center">{player.grades.potential}</td>
              {view === "overview" ? <>
                <td className="text-center" title={player.injury.isInjured ? "Injured" : "Healthy"}>
                  <User textColorClass={`mx-auto ${player.injury.isInjured ? "text-red-500" : "text-green-500"}`} />
                </td>
                <td className="text-center">{player.injury.isInjured ? player.injury.name || player.injury.injuryType || "Injured" : "None"}</td>
              </> : attributes.map(([label, key]) => <td className="text-center" key={label}>{player.grades[key]}</td>)}
              {isOwner && <td className="p-1 text-center"><Button size="xs" variant="danger" title={`Cut ${player.firstName} ${player.lastName}`} aria-label={`Cut ${player.firstName} ${player.lastName}`} onClick={() => setCutCandidate(player)}><ScissorIcon textColorClass="text-white" /></Button></td>}
            </tr>)}</tbody>
          </table>
          {!players.length && <div className="p-6 text-center opacity-70">This team has no active roster players.</div>}
        </Border>
      </div>}

      <CollegeLacrossePlayerModal player={profilePlayer} team={team || null} onClose={() => setProfilePlayer(null)} />

      <ProfileTeamCardModal
        isOpen={Boolean(cutCandidate)}
        onClose={() => !cutting && setCutCandidate(null)}
        title="Cut Player"
        actions={<><Button variant="secondary" onClick={() => setCutCandidate(null)} disabled={cutting}>Cancel</Button><Button variant="danger" onClick={cutPlayer} disabled={cutting}>{cutting ? "Cutting..." : "Confirm Cut"}</Button></>}
      >
        <p>Cut {cutCandidate?.firstName} {cutCandidate?.lastName}? They will leave this roster and enter the transfer pool. Their player record will not be deleted.</p>
      </ProfileTeamCardModal>
    </PageContainer>
  );
};
