import { useEffect, useRef, useState } from "react";
import { display } from "facesjs";
import { Button } from "../../_design/Buttons";
import { Logo } from "../../_design/Logo";
import { getLaxLogoUrl, LacrosseStatisticsService, LaxPlayer, LaxPlayerCareerStatistics, LaxTeam } from "../../_services/lacrosseService";
import { ProfileTeamCardModal } from "../Profile/ProfileTeamCardModal";
import { getLacrosseSeasonYear, getLacrosseYearAbbreviation } from "./lacrosseFormatting";

interface CollegeLacrossePlayerModalProps {
  player: LaxPlayer | null;
  team: LaxTeam | null;
  onClose: () => void;
}


export const LacrossePlayerFace = ({ player, team, size = "large" }: { player: LaxPlayer; team: LaxTeam; size?: "small" | "dashboard" | "large" }) => {
  const faceRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!faceRef.current || !player.faceData) return;
    const colors: [string, string, string] = [team.colors.primary || "#111827", team.colors.secondary || "#ffffff", team.colors.tertiary || "#6b7280"];
    faceRef.current.innerHTML = "";
    try {
      display(faceRef.current, { ...player.faceData, teamColors: colors, jersey: { id: team.jerseyStyle || "hockey" } } as any);
      faceRef.current.querySelector("svg")?.setAttribute("preserveAspectRatio", "xMidYMid meet");
    } catch { faceRef.current.innerHTML = ""; }
  }, [player, team]);
  const dimensions=size==="small"?"h-12 w-12":size==="dashboard"?"h-[108px] w-[91px] px-3":"h-32 w-32";
  return <div ref={faceRef} className={`${dimensions} shrink-0 overflow-hidden rounded border bg-white [&_svg]:h-full [&_svg]:w-full`} />;
};

export const CollegeLacrossePlayerModal = ({ player, team, onClose }: CollegeLacrossePlayerModalProps) => {
  const [tab, setTab] = useState<"attributes" | "stats">("attributes");
  const [stats,setStats]=useState<LaxPlayerCareerStatistics>();
  const [statsLoading,setStatsLoading]=useState(false);
  const [statsError,setStatsError]=useState("");
  useEffect(() => { if (player) { setTab("attributes"); setStats(undefined); setStatsError(""); } }, [player?.id]);
  useEffect(()=>{
    if(tab!=="stats"||!player||stats||statsLoading)return;
    setStatsLoading(true);
    LacrosseStatisticsService.getPlayerCareer(player.id).then((result)=>{setStats(result);setStatsError("");}).catch((error)=>setStatsError(error instanceof Error?error.message:"Player statistics could not be loaded.")).finally(()=>setStatsLoading(false));
  },[tab,player?.id,stats,statsLoading]);

  return <ProfileTeamCardModal
    isOpen={Boolean(player && team)}
    onClose={onClose}
    title={player ? `${player.id} ${player.position} ${player.archetype} ${player.firstName} ${player.lastName}` : "Player Profile"}
    maxWidth="max-w-5xl"
    actions={<Button onClick={onClose}>Close</Button>}
  >
    {player && team && <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-[150px_1fr]">
        <div className="flex flex-col items-center gap-3">
          <LacrossePlayerFace player={player} team={team} />
          <Logo url={getLaxLogoUrl(team.logoFileName)} variant="normal" />
          <span className="text-center text-sm font-semibold">{team.abbreviation || team.name}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
          <div><strong className="block">Hometown</strong>{[player.state, player.country].filter(Boolean).join(", ")}</div>
          <div><strong className="block">Year</strong>{getLacrosseYearAbbreviation(player.year)}</div>
          <div><strong className="block">Age</strong>{player.age}</div>
          <div><strong className="block">Position</strong>{player.position}</div>
          <div><strong className="block">Archetype</strong>{player.archetype}</div>
          <div><strong className="block">Overall</strong>{player.grades.overall}</div>
          <div><strong className="block">Potential</strong>{player.grades.potential}</div>
          <div><strong className="block">Stars</strong><span className="text-yellow-400">{"★".repeat(player.stars)}</span></div>
        </div>
      </div>
      <div>
        <div className="flex gap-5 border-b pb-3">
          <span className={`cursor-pointer text-sm ${tab === "attributes" ? "text-blue-400" : "text-gray-400 hover:text-gray-200"}`} onClick={() => setTab("attributes")}>Attributes</span>
          <span className={`cursor-pointer text-sm ${tab === "stats" ? "text-blue-400" : "text-gray-400 hover:text-gray-200"}`} onClick={() => setTab("stats")}>Stats</span>
        </div>
        {tab === "attributes" ? <div className="mt-3 grid grid-cols-2 gap-5 text-center sm:grid-cols-3">
          <div><strong className="block">Speed</strong>{player.grades.speed}</div>
          <div><strong className="block">Handling</strong>{player.grades.handling}</div>
          <div><strong className="block">Passing</strong>{player.grades.passing}</div>
          <div><strong className="block">Shooting</strong><div className="mt-1 grid grid-cols-2 gap-3"><div><span className="block">{player.grades.shotPower}</span><span className="text-xs opacity-70">Power</span></div><div><span className="block">{player.grades.shotAccuracy}</span><span className="text-xs opacity-70">Accuracy</span></div></div></div>
          <div><strong className="block">Checking</strong><div className="mt-1 grid grid-cols-2 gap-3"><div><span className="block">{player.grades.bodyCheck}</span><span className="text-xs opacity-70">Body</span></div><div><span className="block">{player.grades.stickCheck}</span><span className="text-xs opacity-70">Stick</span></div></div></div>
          <div><strong className="block">Goalie</strong><div className="mt-1 grid grid-cols-2 gap-3"><div><span className="block">{player.grades.goalieBlocking}</span><span className="text-xs opacity-70">Block</span></div><div><span className="block">{player.grades.goalieVision}</span><span className="text-xs opacity-70">Vision</span></div></div></div>
          <div><strong className="block">Faceoff</strong>{player.grades.faceoff}</div>
          <div><strong className="block">IQ</strong>{player.grades.laxiq}</div>
          <div><strong className="block">Stamina</strong>{player.ratings.stamina}</div>
        </div> : <PlayerCareerStats stats={stats} loading={statsLoading} error={statsError}/>} 
      </div>
    </div>}
  </ProfileTeamCardModal>;
};

const pct=(value?:number)=>value==null?"—":`${value.toFixed(2)}%`;
const PlayerCareerStats=({stats,loading,error}:{stats?:LaxPlayerCareerStatistics;loading:boolean;error:string})=>{
  if(loading)return <div className="p-8 text-center text-gray-400">Loading statistics...</div>;
  if(error)return <div className="p-8 text-center text-red-400">{error}</div>;
  if(!stats||stats.seasons.length===0)return <div className="p-8 text-center text-gray-400">No completed-game statistics are available.</div>;
  const goalie=stats.category==="goalie";
  const headers=goalie?["Season","Team","GP","SV","GA","SV%","Outlet Att.","Outlet Comp.","Outlet TO"]:["Season","Team","GP","G","A","PTS","SH%","GB","CT","TO","FO%"];
  const displayYear=(season:number)=>stats.seasonYears?.[season]??getLacrosseSeasonYear(season);
  const cells=(row:LaxPlayerCareerStatistics["career"],career=false)=>goalie
    ?[career?"Career":displayYear(row.season||1),career?"—":row.teamAbbreviation,row.gamesPlayed,row.saves,row.goalsAllowed,pct(row.savePercentage),row.outletAttempts,row.outletsCompleted,row.outletTurnovers]
    :[career?"Career":displayYear(row.season||1),career?"—":row.teamAbbreviation,row.gamesPlayed,row.goals,row.assists,row.points,pct(row.shootingPercentage),row.groundBalls,row.causedTurnovers,row.turnovers,pct(row.faceoffPercentage)];
  return <div className="mt-3 overflow-x-auto"><table className="w-full border-collapse whitespace-nowrap text-xs sm:text-sm"><thead><tr className="border-b border-slate-400">{headers.map((header)=><th key={header} title={header==="SV"?"Saves":header==="GA"?"Goals Against":header==="SH%"?"Shooting Percentage":header==="FO%"?"Faceoff Percentage":header==="CT"?"Caused Turnovers":header==="TO"?"Turnovers":header} className="px-2 py-2 text-center first:text-left">{header}</th>)}</tr></thead><tbody>{stats.seasons.map((row,index)=><tr key={`${row.season}-${row.teamId}-${index}`} className="border-b border-slate-700">{cells(row).map((value,cell)=><td key={cell} className="px-2 py-2 text-center first:text-left">{value??"—"}</td>)}</tr>)}<tr className="border-y-2 border-slate-400 font-bold">{cells(stats.career,true).map((value,cell)=><td key={cell} className="px-2 py-2 text-center first:text-left">{value??"—"}</td>)}</tr></tbody></table></div>;
};
