import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Border } from "../../_design/Borders";
import { Logo } from "../../_design/Logo";
import { getLaxLogoUrl, LaxPlayer, LaxScheduleResponse, LaxTeam } from "../../_services/lacrosseService";
import routes from "../../_constants/routes";
import { claxScheduleKey, claxStatsKey, useSimLAXStore } from "../../context/SimLAXContext";
import { LacrossePlayerFace } from "./CollegeLacrossePlayerModal";

type StatRow=Record<string,string|number|null>;

const readableText=(color:string) => {
  const hex=color.replace("#","");
  if(hex.length!==6)return "#ffffff";
  const [r,g,b]=[0,2,4].map((offset)=>parseInt(hex.slice(offset,offset+2),16));
  return (r*299+g*587+b*114)/1000>150?"#111827":"#ffffff";
};

export const CollegeLacrosseDashboard=({team}:{team:LaxTeam})=>{
  const navigate=useNavigate();
  const {claxSchedules,claxRosters,claxStatistics}=useSimLAXStore();
  const schedule=claxSchedules[claxScheduleKey(team.id)];
  const roster=claxRosters[team.id]?.players??[];
  const fieldStats:StatRow[]=schedule?claxStatistics[claxStatsKey(schedule.selectedSeason,undefined,"field","player")]?.rows??[]:[];
  const goalieStats:StatRow[]=schedule?claxStatistics[claxStatsKey(schedule.selectedSeason,undefined,"goalie","player")]?.rows??[]:[];
  const scheduleScrollRef=useRef<HTMLDivElement>(null);
  const primary=team.colors.primary||"#2563eb";
  const heading={backgroundColor:primary,color:readableText(primary)};
  const conference=team.conference?.abbreviation||team.conference?.name||"Conference";
  const orderedGames=[...(schedule?.games||[])].sort((a,b)=>
    Number(a.gameContext!=="preseason")-Number(b.gameContext!=="preseason")||a.week-b.week||a.id-b.id);
  const nextGameIndex=orderedGames.findIndex((game)=>game.status!=="Final");
  const dashboardGame=orderedGames[nextGameIndex>=0?nextGameIndex:orderedGames.length-1];
  const yourStanding=schedule?.standings.find((standing)=>standing.team.id===team.id);
  const opponentStanding=schedule?.conferenceStandings.flatMap((group)=>group.standings).find((standing)=>standing.team.id===dashboardGame?.opponent.id)
    || schedule?.standings.find((standing)=>standing.team.id===dashboardGame?.opponent.id);
  const gameType=dashboardGame ? (()=>{
    if(dashboardGame.gameContext==="preseason")return "Preseason Game";
    const type=dashboardGame.gameType.toLowerCase();
    if(type.includes("conference tournament"))return "Conference Tournament";
    if(type.includes("national tournament")||type.includes("championship"))return "National Tournament";
    return dashboardGame.isConferenceGame?"Conference Game":"Non-Conference Game";
  })() : "";
  const isFinal=dashboardGame?.status==="Final"&&dashboardGame.homeScore!==undefined&&dashboardGame.awayScore!==undefined;
  const yourScore=dashboardGame?(dashboardGame.isHome?dashboardGame.homeScore:dashboardGame.awayScore):undefined;
  const opponentScore=dashboardGame?(dashboardGame.isHome?dashboardGame.awayScore:dashboardGame.homeScore):undefined;
  const won=isFinal&&Number(yourScore)>Number(opponentScore);
  useEffect(()=>{
    const container=scheduleScrollRef.current;
    if(!container||nextGameIndex<0)return;
    requestAnimationFrame(()=>{
      const card=container.firstElementChild as HTMLElement|null;
      if(!card)return;
      const gap=parseFloat(getComputedStyle(container).gap)||8;
      container.scrollTo({left:Math.max(0,nextGameIndex-3)*(card.offsetWidth+gap),behavior:"auto"});
    });
  },[team.id,nextGameIndex,orderedGames.length]);
  const teamFieldStats=fieldStats.filter((row)=>Number(row.teamId)===team.id);
  const teamGoalieStats=goalieStats.filter((row)=>Number(row.teamId)===team.id);
  const goalsLeader=[...teamFieldStats].sort((a,b)=>Number(b.goals)-Number(a.goals)||Number(b.points)-Number(a.points))[0];
  const pointsLeader=[...teamFieldStats].sort((a,b)=>Number(b.points)-Number(a.points)||Number(b.goals)-Number(a.goals))[0];
  const goalieLeader=[...teamGoalieStats].sort((a,b)=>Number(b.savePercentage)-Number(a.savePercentage)||Number(b.saves)-Number(a.saves))[0];
  return <div>
    {schedule&&orderedGames.length>0&&<div className="relative mb-3 flex w-full items-center">
      <button type="button" aria-label="Scroll schedule left" onClick={()=>scheduleScrollRef.current?.scrollBy({left:-304,behavior:"smooth"})} className="absolute left-0 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-white hover:bg-slate-700">&lt;</button>
      <div ref={scheduleScrollRef} className="flex w-full gap-2 overflow-x-auto px-8 py-1">
        {orderedGames.map((game,index)=>{
          const final=game.status==="Final"&&game.homeScore!==undefined&&game.awayScore!==undefined;
          const teamScore=game.isHome?game.homeScore:game.awayScore;
          const opposingScore=game.isHome?game.awayScore:game.homeScore;
          const gameWon=final&&Number(teamScore)>Number(opposingScore);
          const gameLost=final&&Number(teamScore)<Number(opposingScore);
          const next=index===nextGameIndex;
          const opponentRecord=schedule.conferenceStandings.flatMap((group)=>group.standings).find((standing)=>standing.team.id===game.opponent.id)
            ||schedule.standings.find((standing)=>standing.team.id===game.opponent.id);
          const prefix=game.isNeutral||game.isHome?"vs":"@";
          const scheme=gameWon?"border-green-500 bg-green-950/30":gameLost?"border-red-500 bg-red-950/30":"border-slate-600 bg-slate-800/70";
          return <div key={game.id} className={`flex w-36 shrink-0 flex-col items-center rounded-lg border-2 px-2 py-1.5 text-center ${scheme}`} style={next?{borderColor:primary,boxShadow:`0 0 0 1px ${primary}`} : undefined}>
            <span className="text-[0.65rem] text-slate-400">{game.gameContext==="preseason"?"Pre Wk":"Wk"} {game.week}</span>
            <div className="my-0.5 flex h-9 w-10 items-center justify-center"><Logo url={getLaxLogoUrl(game.opponent.logoFileName)} variant="tiny" containerClass="items-center justify-center"/></div>
            <span className="text-xs font-semibold">{prefix} {game.opponent.abbreviation||game.opponent.name}</span>
            <span className="text-[0.65rem] text-slate-400">({opponentRecord?.totalWins||0}-{opponentRecord?.totalLosses||0})</span>
            {final?<div className="mt-0.5 flex flex-col items-center"><span className={`text-sm font-bold ${gameWon?"text-green-400":gameLost?"text-red-400":""}`}>{teamScore} - {opposingScore}</span><span className={`mt-0.5 rounded-sm px-1.5 text-[0.55rem] font-bold text-white ${gameWon?"bg-green-600":gameLost?"bg-red-600":"bg-slate-500"}`}>{gameWon?"W":gameLost?"L":"T"}</span></div>:<span className={`mt-1 text-[0.65rem] ${next?"font-bold text-blue-400":"text-slate-500"}`}>{next?"NEXT":"—"}</span>}
          </div>;
        })}
      </div>
      <button type="button" aria-label="Scroll schedule right" onClick={()=>scheduleScrollRef.current?.scrollBy({left:304,behavior:"smooth"})} className="absolute right-0 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-white hover:bg-slate-700">&gt;</button>
    </div>}
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
    <Border classes="h-fit overflow-hidden p-4" styles={{borderColor:primary}}>
      <h2 className="rounded px-4 py-2 text-center text-xl font-bold" style={heading}>{conference} Standings</h2>
      {!schedule?<div className="p-5 text-center text-slate-400">Loading standings...</div>:<div className="mt-4 overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr className="border-y-2 border-slate-300"><th className="px-2 py-3 text-left">Rank</th><th className="px-2 py-3 text-left">Team</th><th className="px-2 py-3 text-center">C.W</th><th className="px-2 py-3 text-center">C.L</th><th className="px-2 py-3 text-center">T.W</th><th className="px-2 py-3 text-center">T.L</th></tr></thead><tbody>{schedule.standings.map((standing)=><tr key={standing.team.id} className={`border-b border-slate-600 odd:bg-slate-900/20 even:bg-slate-800/40 ${standing.team.id===team.id?"font-bold":""}`}><td className="px-2 py-3">{standing.rank}</td><td className="px-2 py-3"><div className="flex items-center gap-2"><Logo url={getLaxLogoUrl(standing.team.logoFileName)} variant="tiny"/><span>{standing.team.abbreviation||standing.team.name}</span></div></td><td className="px-2 py-3 text-center">{standing.conferenceWins}</td><td className="px-2 py-3 text-center">{standing.conferenceLosses}</td><td className="px-2 py-3 text-center">{standing.totalWins}</td><td className="px-2 py-3 text-center">{standing.totalLosses}</td></tr>)}</tbody></table></div>}
    </Border>
    <div className="space-y-4" aria-label="SimLAX dashboard center column">
      <Border classes="h-fit overflow-hidden p-4" styles={{borderColor:primary}}>
        <h2 className="rounded px-4 py-2 text-center text-xl font-bold" style={heading}>Next Game</h2>
        {!schedule?<div className="p-5 text-center text-slate-400">Loading matchup...</div>:!dashboardGame?<div className="p-8 text-center text-slate-400">No game is scheduled.</div>:<div className="mt-4 flex flex-col items-center border-t-4 border-double border-slate-300 bg-slate-950/35 px-5 py-5 text-center">
          <div className="grid w-full max-w-md grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] items-center justify-center gap-3">
            <DashboardTeam team={schedule.team} standing={yourStanding}/>
            <div className="flex h-full items-center justify-center font-bold">{dashboardGame.isHome?"VS":"AT"}</div>
            <DashboardTeam team={dashboardGame.opponent} standing={opponentStanding}/>
          </div>
          {isFinal&&<div className={`mt-5 text-xl font-bold ${won?"text-green-500":"text-red-500"}`}>{yourScore} - {opponentScore}</div>}
          <div className={`${isFinal?"mt-1":"mt-5"} font-semibold`}>{dashboardGame.gameContext==="preseason"?"Preseason Week":"Week"} {dashboardGame.week}</div>
          <div>{gameType}</div>
          <button type="button" onClick={()=>navigate(routes.CLAX_LINEUPS)} className="mt-4 rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Gameplan</button>
        </div>}
      </Border>
    </div>
    <div className="space-y-4" aria-label="SimLAX dashboard right column">
      <Border classes="h-fit overflow-hidden p-4" styles={{borderColor:primary}}>
        <h2 className="rounded px-4 py-2 text-center text-xl font-bold" style={heading}>Quick Links</h2>
        <div className="mt-4 grid grid-cols-6 gap-2 border-t-2 border-slate-300 pt-4">
          <QuickLink label="Roster" onClick={()=>navigate(`/clax/team/${team.id}`)}/>
          <QuickLink label="Lineup" onClick={()=>navigate(`/clax/lineups/${team.id}`)}/>
          <QuickLink label="Recruit" onClick={()=>navigate(routes.CLAX_RECRUITING)}/>
          <QuickLink label="Schedule" onClick={()=>navigate(routes.CLAX_SCHEDULE)}/>
          <QuickLink label="Stats" onClick={()=>navigate(routes.CLAX_STATISTICS)}/>
          <QuickLink label="News" onClick={()=>navigate(routes.NEWS)}/>
        </div>
      </Border>
      <Border classes="h-fit overflow-hidden p-4" styles={{borderColor:primary}}>
        <h2 className="rounded px-4 py-2 text-center text-xl font-bold" style={heading}>Team Statistics</h2>
        <div className="mt-4 space-y-3 border-t-2 border-slate-300 pt-4">
          <LeaderCard title="Goals Leader" row={goalsLeader} player={roster.find((item)=>item.id===Number(goalsLeader?.playerId))} team={team} lines={goalsLeader?[`${Number(goalsLeader.goals)} Goals`,`${Number(goalsLeader.assists)} Assists`,`${Number(goalsLeader.points)} Points`]:[]}/>
          <LeaderCard title="Points Leader" row={pointsLeader} player={roster.find((item)=>item.id===Number(pointsLeader?.playerId))} team={team} lines={pointsLeader?[`${Number(pointsLeader.goals)} Goals`,`${Number(pointsLeader.assists)} Assists`,`${Number(pointsLeader.points)} Points`]:[]}/>
          <LeaderCard title="Goalie Leader" row={goalieLeader} player={roster.find((item)=>item.id===Number(goalieLeader?.playerId))} team={team} lines={goalieLeader?[`${Number(goalieLeader.saves)} Saves`,`${Number(goalieLeader.goalsAllowed)} Goals Allowed`,`${Number(goalieLeader.savePercentage).toFixed(2)}% Save Percentage`]:[]}/>
        </div>
      </Border>
    </div>
    </div>
  </div>;
};

const DashboardTeam=({team,standing}:{team:LaxTeam;standing?:LaxScheduleResponse["standings"][number]})=><div className="flex min-w-0 flex-col items-center text-center"><div className="flex h-16 w-20 items-center justify-center"><Logo url={getLaxLogoUrl(team.logoFileName)} variant="large" containerClass="items-center justify-center"/></div><div className="mt-2 whitespace-nowrap font-bold">{team.abbreviation||team.name} <span className="font-normal text-slate-300">({standing?.totalWins||0}-{standing?.totalLosses||0})</span></div><div className="w-full truncate text-xs text-slate-300">HC {team.coach||"None"}</div></div>;
const QuickLink=({label,onClick}:{label:string;onClick:()=>void})=><button type="button" onClick={onClick} className="min-w-0 rounded bg-blue-600 px-1.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700">{label}</button>;
const LeaderCard=({title,row,player,team,lines}:{title:string;row?:StatRow;player?:LaxPlayer;team:LaxTeam;lines:string[]})=><div className="grid min-h-[124px] grid-cols-[107px_minmax(0,1fr)] items-stretch gap-4 rounded border p-2" style={{borderColor:team.colors.primary||"#2563eb"}}><div className="flex items-center justify-center">{player?<LacrossePlayerFace player={player} team={team} size="dashboard"/>:<div className="flex h-[108px] w-[91px] items-center justify-center rounded bg-slate-700 text-xs text-slate-400">No player</div>}</div><div className="flex min-w-0 flex-col justify-center text-center"><h3 className="border-b border-slate-300 pb-1 text-lg font-bold">{title}</h3>{row?<><div className="mt-1 font-semibold">{String(row.position||player?.position||"")} {String(row.firstName||"")} {String(row.lastName||"")}</div>{lines.map((line)=><div key={line} className="mt-1">{line}</div>)}</>:<div className="mt-4 text-slate-400">No statistics available</div>}</div></div>;
