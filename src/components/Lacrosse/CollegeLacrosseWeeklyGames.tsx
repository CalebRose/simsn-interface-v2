import { useEffect, useState } from "react";
import { Border } from "../../_design/Borders";
import { InformationCircle } from "../../_design/Icons";
import { Logo } from "../../_design/Logo";
import { getLaxLogoUrl, LacrosseService, LaxWeeklyGame } from "../../_services/lacrosseService";

export const CollegeLacrosseWeeklyGames=({season,week,primary,headerStyle,onBoxScore}:{season:number;week:number;primary:string;headerStyle:React.CSSProperties;onBoxScore:(gameId:number)=>void})=>{
  const [games,setGames]=useState<LaxWeeklyGame[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  useEffect(()=>{setLoading(true);setError("");LacrosseService.getWeeklySchedule(season,week).then((response)=>setGames(response.games)).catch((reason)=>setError(reason instanceof Error?reason.message:"Weekly games could not be loaded.")).finally(()=>setLoading(false));},[season,week]);
  return <Border classes="overflow-hidden p-4 lg:col-span-2" styles={{borderColor:primary}}>
    <h2 className="rounded px-4 py-2 text-center text-xl font-bold" style={headerStyle}>Week {week} Games</h2>
    {loading?<div className="p-8 text-center">Loading weekly games…</div>:error?<div className="p-8 text-center text-red-500">{error}</div>:<div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-sm"><thead><tr className="border-b-2"><th className="px-3 py-3 text-center">Week</th><th className="px-3 py-3 text-left">Home</th><th className="px-3 py-3 text-left">Away</th><th className="px-3 py-3 text-center">Result</th><th className="px-3 py-3 text-center">Box Score</th></tr></thead><tbody>{games.length?games.map((game)=>{const isFinal=game.status==="Final"&&game.homeScore!==undefined&&game.awayScore!==undefined;return <tr key={game.id} className="border-b border-slate-600 odd:bg-slate-900/20 even:bg-slate-800/40"><td className="px-3 py-3 text-center font-semibold">{game.week}</td><td className="px-3 py-3"><div className="flex items-center gap-2"><Logo url={getLaxLogoUrl(game.homeTeam.logoFileName)} variant="tiny"/><span className="font-semibold">{game.homeTeam.name}</span></div></td><td className="px-3 py-3"><div className="flex items-center gap-2"><Logo url={getLaxLogoUrl(game.awayTeam.logoFileName)} variant="tiny"/><span className="font-semibold">{game.awayTeam.name}</span></div></td><td className="px-3 py-3 text-center font-semibold">{isFinal?`${game.homeScore} - ${game.awayScore}`:game.status==="Scheduled"?"TBC":game.status}</td><td className="px-3 py-3 text-center">{isFinal&&<button type="button" onClick={()=>onBoxScore(game.id)} className="inline-flex bg-transparent p-0 align-middle opacity-80 hover:opacity-100" title="View box score" aria-label="View box score"><InformationCircle textColorClass="text-slate-300"/></button>}</td></tr>}):<tr><td colSpan={5} className="p-8 text-center italic opacity-60">No games are scheduled for Week {week}.</td></tr>}</tbody></table></div>}
  </Border>;
};
