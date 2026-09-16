import { useEffect, useState } from "react";
import { StylesConfig } from "react-select";
import { Border } from "../../_design/Borders";
import { Button } from "../../_design/Buttons";
import { PageContainer } from "../../_design/Container";
import { Logo } from "../../_design/Logo";
import { InformationCircle } from "../../_design/Icons";
import { SelectDropdown } from "../../_design/Select";
import { SelectOption } from "../../_hooks/useSelectStyles";
import { getLaxConferenceLogoUrl, getLaxLogoUrl, LacrosseService } from "../../_services/lacrosseService";
import { claxScheduleKey, useSimLAXStore } from "../../context/SimLAXContext";
import { exportToCsv } from "../../_utility/csvExport";
import { getLacrosseSeasonYear } from "./lacrosseFormatting";
import { CollegeLacrosseScheduleRequestModal } from "./CollegeLacrosseScheduleRequestModal";
import { CollegeLacrosseBoxScoreModal } from "./CollegeLacrosseBoxScoreModal";
import { CollegeLacrosseWeeklyGames } from "./CollegeLacrosseWeeklyGames";
import { CollegeLacrosseConferenceTournamentBracket } from "./CollegeLacrosseConferenceTournamentBracket";

const readableText=(color:string) => {
  const hex=color.replace("#","");
  if(hex.length!==6)return "#ffffff";
  const [r,g,b]=[0,2,4].map((offset)=>parseInt(hex.slice(offset,offset+2),16));
  return (r*299+g*587+b*114)/1000>150?"#111827":"#ffffff";
};
const detail=(error:unknown)=>error instanceof Error?error.message:"The SimLAX schedule could not be reached.";

export const CollegeLacrosseSchedulePage=()=>{
  const {claxTeams:teams,refreshClaxTeams,claxSchedules,refreshClaxSchedule}=useSimLAXStore();
  const [scheduleKey,setScheduleKey]=useState(claxScheduleKey());
  const schedule=claxSchedules[scheduleKey];
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [requestWeek,setRequestWeek]=useState<number|null>(null);
  const [requestActionId,setRequestActionId]=useState<number>();
  const [view,setView]=useState<"overview"|"preseason"|"standings"|"conferenceTournament"|"nationalTournament">("overview");
  const [boxScoreGameId,setBoxScoreGameId]=useState<number|null>(null);
  const [weeklyGames,setWeeklyGames]=useState(false);
  const [selectedWeek,setSelectedWeek]=useState(1);
  const load=async(teamId?:number,season?:number)=>{try{await refreshClaxSchedule(teamId,season);setScheduleKey(claxScheduleKey(teamId,season));setError("");}catch(reason){setError(detail(reason));}};
  useEffect(()=>{void refreshClaxTeams();},[refreshClaxTeams]);
  useEffect(()=>{void load().finally(()=>setLoading(false));},[]);
  useEffect(()=>{if((view==="conferenceTournament"&&!schedule?.hasConferenceTournament)||(view==="nationalTournament"&&!schedule?.hasNationalTournament))setView("overview");},[schedule?.hasConferenceTournament,schedule?.hasNationalTournament,view]);
  const primary=schedule?.team.colors.primary||"#2563eb";
  const headerStyle={backgroundColor:primary,color:readableText(primary)};
  const record=schedule?.standings.find((standing)=>standing.team.id===schedule.team.id);
  const teamOptions=teams.map((team)=>({value:String(team.id),label:`${team.name} | ${team.abbreviation}`}));
  const seasonOptions=schedule?.seasons.map((season)=>({value:String(season),label:String(schedule.seasonYears?.[season]??getLacrosseSeasonYear(season))}))||[];
  const lastScheduledWeek=Math.max(20,schedule?.currentWeek||1,...(schedule?.games.map((game)=>game.week)||[1]));
  const weekOptions=Array.from({length:lastScheduledWeek},(_,index)=>({value:String(index+1),label:`Week ${index+1}`}));
  const scheduleSelectStyles:StylesConfig<SelectOption,false>={control:(provided,state)=>({...provided,minHeight:"48px",width:"100%",maxWidth:"none",backgroundColor:state.isFocused?"#2d3748":"#1a202c",borderColor:state.isFocused?"#4A90E2":"#4A5568",boxShadow:state.isFocused?"0 0 0 1px #4A90E2":"none",borderRadius:"8px"})};
  const exportWeeklyGames=async()=>{
    if(!weeklyGames||!schedule)return;
    const response=await LacrosseService.getWeeklySchedule(schedule.selectedSeason,selectedWeek);
    exportToCsv(`${schedule.seasonYears?.[schedule.selectedSeason]??schedule.selectedSeason}_Week_${selectedWeek}_games_export.csv`,
      ["League","Game Context","Week","Home Team Abbreviation","Home Score","Away Team Abbreviation","Away Score","Home Coach","Away Coach","Game Title","Neutral Site","Conference Game","Conference Tournament","National Tournament"],
      response.games.map((game)=>[
        "CLAX",game.gameContext==="preseason"?"Preseason":"Regular Season",game.week,game.homeTeam.abbreviation||game.homeTeam.name,game.homeScore??"",
        game.awayTeam.abbreviation||game.awayTeam.name,game.awayScore??"",game.homeTeam.coach||"",game.awayTeam.coach||"",
        game.gameName||"",game.isNeutral?"Y":"N",game.isConferenceGame?"Y":"N",game.isCt?"Y":"N",game.isNt?"Y":"N",
      ]));
  };
  const requestContext=view==="preseason"?"preseason":"regular_season";
  const visibleGames=schedule?.games.filter((game)=>view==="conferenceTournament"?game.gameType==="Conference Tournament":view==="nationalTournament"?game.gameType==="National Tournament":view==="preseason"?game.gameContext==="preseason":game.gameContext==="regular_season")||[];
  const displayedWeeks=Array.from({length:Math.max(view==="overview"?14:view==="preseason"?(schedule?.preseasonGamesPerTeam||0):0,...(visibleGames.map((game)=>game.week)||[0]))},(_,index)=>index+1);
  const decideRequest=async(requestId:number,accept:boolean)=>{setRequestActionId(requestId);setError("");try{if(accept)await LacrosseService.acceptScheduleRequest(requestId);else await LacrosseService.denyScheduleRequest(requestId);await load(schedule?.team.id,schedule?.selectedSeason);}catch(reason){setError(detail(reason));}finally{setRequestActionId(undefined);}};
  return <PageContainer direction="col" isLoading={loading} title="Schedule">
    {error&&<Border classes="p-4 text-center text-red-500">{error}</Border>}
    {schedule&&<div className="grid grid-cols-1 gap-4 lg:grid-cols-[420px_minmax(0,1fr)_minmax(0,1fr)]">
      <Border classes="h-fit p-4" styles={{borderColor:primary}}>
        <div className="mb-4 grid grid-cols-2 gap-2"><button type="button" onClick={()=>{setView("overview");setWeeklyGames(false);}} className={`rounded px-3 py-2 font-semibold text-white ${view==="overview"?"bg-green-600":"bg-slate-600 hover:bg-slate-500"}`}>Overview</button>{schedule.preseasonEnabled&&<button type="button" onClick={()=>{setView("preseason");setWeeklyGames(false);}} className={`rounded px-3 py-2 font-semibold text-white ${view==="preseason"?"bg-green-600":"bg-slate-600 hover:bg-slate-500"}`}>Preseason</button>}<button type="button" onClick={()=>{setView("standings");setWeeklyGames(false);}} className={`rounded px-3 py-2 font-semibold text-white ${view==="standings"?"bg-green-600":"bg-slate-600 hover:bg-slate-500"}`}>Standings</button>{schedule.hasConferenceTournament&&<button type="button" onClick={()=>{setView("conferenceTournament");setWeeklyGames(false);}} className={`rounded px-3 py-2 font-semibold text-white ${view==="conferenceTournament"?"bg-green-600":"bg-slate-600 hover:bg-slate-500"}`}>Conference Tournament</button>}{schedule.hasNationalTournament&&<button type="button" onClick={()=>{setView("nationalTournament");setWeeklyGames(false);}} className={`rounded px-3 py-2 font-semibold text-white ${view==="nationalTournament"?"bg-green-600":"bg-slate-600 hover:bg-slate-500"}`}>National Tournament</button>}</div>
        <label className="mb-5 flex cursor-pointer items-center justify-center gap-3"><button type="button" role="switch" aria-checked={weeklyGames} onClick={()=>{if(!weeklyGames)setSelectedWeek(schedule.currentWeek);setWeeklyGames((enabled)=>!enabled);setView("overview");}} className={`relative h-6 w-11 rounded-full transition-colors ${weeklyGames?"bg-green-600":"bg-slate-500"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${weeklyGames?"left-6":"left-1"}`}/></button><span className="font-semibold">Weekly Games</span></label>
        <div className="-mt-3 mb-5 text-center"><button type="button" onClick={()=>void exportWeeklyGames()} disabled={!weeklyGames} className="rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">Export</button></div>
        {weeklyGames?<div className="text-center font-semibold">Week<div className="mt-2"><SelectDropdown isSearchable styles={scheduleSelectStyles} options={weekOptions} value={weekOptions.find((option)=>option.value===String(selectedWeek))} placeholder="Select Week..." onChange={(option)=>{if(option)setSelectedWeek(Number(option.value));}} /></div></div>:<div className="text-center font-semibold">Teams<div className="mt-2"><SelectDropdown isSearchable styles={scheduleSelectStyles} options={teamOptions} value={teamOptions.find((option)=>option.value===String(schedule.team.id))} placeholder="Select Team..." onChange={(option)=>{if(option)void load(Number(option.value),schedule.selectedSeason);}} /></div></div>}
        <div className="mt-5 text-center font-semibold">Seasons<div className="mt-2"><SelectDropdown isSearchable styles={scheduleSelectStyles} options={seasonOptions} value={seasonOptions.find((option)=>option.value===String(schedule.selectedSeason))} placeholder="Select Season..." onChange={(option)=>{if(option)void load(schedule.team.id,Number(option.value));}} /></div></div>
        {(schedule.receivedRequests||[]).length>0&&<div className="mt-6 border-t border-slate-600 pt-4"><h3 className="mb-3 text-center text-lg font-bold">Received Challenges</h3>{schedule.receivedRequests.map((request)=><div key={request.id} className="mb-3 rounded border border-slate-500 p-3"><div className="text-sm font-semibold opacity-70">Week {request.week} · Challenge From</div><div className="my-2 font-bold">{request.homeTeamId===schedule.team.id?"vs":"@"} {request.sendingTeam.name}</div><div className="flex gap-2"><Button size="sm" variant="success" disabled={requestActionId===request.id} onClick={()=>void decideRequest(request.id,true)}>Accept</Button><Button size="sm" variant="danger" disabled={requestActionId===request.id} onClick={()=>void decideRequest(request.id,false)}>Deny</Button></div></div>)}</div>}
      </Border>
      {view==="conferenceTournament"?<CollegeLacrosseConferenceTournamentBracket season={schedule.selectedSeason} defaultConferenceId={schedule.team.conference?.id} primary={primary} headerStyle={headerStyle} onBoxScore={setBoxScoreGameId}/>:view==="nationalTournament"?<CollegeLacrosseConferenceTournamentBracket season={schedule.selectedSeason} tournamentType="national" primary={primary} headerStyle={headerStyle} onBoxScore={setBoxScoreGameId}/>:view!=="standings"?(weeklyGames?<CollegeLacrosseWeeklyGames season={schedule.selectedSeason} week={selectedWeek} primary={primary} headerStyle={headerStyle} onBoxScore={setBoxScoreGameId}/>:<><Border classes="overflow-hidden p-4" styles={{borderColor:primary}}>
        <h2 className="rounded px-4 py-2 text-center text-xl font-bold" style={headerStyle}>{view==="preseason"?`${schedule.team.abbreviation||schedule.team.name} Preseason`:`${schedule.team.abbreviation||schedule.team.name} (${record?.totalWins||0}-${record?.totalLosses||0}) Schedule`}</h2>
        <div className="mt-4 overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr className="border-b-2"><th className="px-2 py-3 text-center">Week</th><th className="px-2 py-3 text-center" aria-label="Conference"/><th className="px-2 py-3 text-center">Opponent</th><th className="px-2 py-3 text-center">Result</th><th aria-label="Box score"/></tr></thead><tbody>{displayedWeeks.flatMap((week)=>{
          const games=visibleGames.filter((game)=>game.week===week);
          const tentative=(view==="overview"||view==="preseason")?(schedule.tentativeGames||[]).filter((game)=>game.week===week&&game.gameContext===requestContext):[];
          const schedulingOpen=view==="preseason"?schedule.preseasonSchedulingOpen:view==="overview"&&schedule.regularSeasonSchedulingOpen;
          if(games.length===0&&tentative.length===0&&schedulingOpen)return [<tr key={`open-${requestContext}-${week}`} className="border-b border-slate-600 odd:bg-slate-900/20 even:bg-slate-800/40"><td className="px-2 py-3 font-semibold">{week}</td><td colSpan={2} className="px-2 py-3 text-center"><a href={`#request-week-${week}`} onClick={(event)=>{event.preventDefault();setRequestWeek(week);}} className="italic opacity-50 transition-colors hover:text-[#fcd53f] hover:opacity-100">OPEN</a></td><td/><td/></tr>];
          if(games.length===0&&tentative.length===0)return [];
          if(games.length>0)return games.map((game)=>{
            const homeCellStyle=game.isHome?headerStyle:undefined;
            const isFinal=game.status==="Final"&&game.homeScore!==undefined&&game.awayScore!==undefined;
            const yourScore=game.isHome?game.homeScore:game.awayScore;
            const theirScore=game.isHome?game.awayScore:game.homeScore;
            const won=isFinal&&Number(yourScore)>Number(theirScore);
            return <tr key={game.id} className="border-b border-slate-600 odd:bg-slate-900/20 even:bg-slate-800/40"><td className="px-2 py-3 font-semibold" style={homeCellStyle}>{game.week}</td><td className="px-2 py-3 text-center" style={homeCellStyle}>{game.isConferenceGame&&game.conferenceAbbreviation?<img src={getLaxConferenceLogoUrl(game.conferenceAbbreviation)} className="mx-auto h-8 w-12 object-contain" alt={`${game.conferenceAbbreviation} logo`}/>:null}</td><td className="px-2 py-3" style={homeCellStyle}><div className="flex items-center gap-2"><span className="font-bold">{game.isHome?"vs":"@"}</span><Logo url={getLaxLogoUrl(game.opponent.logoFileName)} variant="tiny"/><span className="font-semibold">{game.opponent.abbreviation||game.opponent.name}</span></div>{game.gameName&&<div className="mt-1 text-xs opacity-70">{game.gameName}{game.isNeutral?" · Neutral Site":""}</div>}</td><td className={`px-2 py-3 text-center font-semibold ${isFinal?(won?"text-green-500":"text-red-500"):""}`}>{isFinal?`${yourScore} - ${theirScore}`:game.status==="Scheduled"?"TBC":game.status}</td><td className="px-2 py-3 text-center">{isFinal&&<button type="button" onClick={()=>setBoxScoreGameId(game.id)} className="inline-flex bg-transparent p-0 align-middle opacity-80 hover:opacity-100" title="View box score" aria-label="View box score"><InformationCircle textColorClass="text-slate-300"/></button>}</td></tr>;
          });
          return tentative.map((game)=>{const homeCellStyle=game.isHome?headerStyle:undefined;return <tr key={`request-${game.requestId}`} className="border-b border-slate-600 opacity-50 odd:bg-slate-900/20 even:bg-slate-800/40"><td className="px-2 py-3 font-semibold" style={homeCellStyle}>{game.week}</td><td className="px-2 py-3" style={homeCellStyle}/><td className="px-2 py-3" style={homeCellStyle}><div className="flex items-center gap-2"><span className="font-bold">{game.isHome?"vs":"@"}</span><Logo url={getLaxLogoUrl(game.opponent.logoFileName)} variant="tiny"/><span className="font-semibold">{game.opponent.abbreviation||game.opponent.name}</span></div></td><td/><td/></tr>;});
        })}</tbody></table></div>
      </Border>
      <Border classes="overflow-hidden p-4" styles={{borderColor:primary}}>
        <h2 className="rounded px-4 py-2 text-center text-xl font-bold" style={headerStyle}>{schedule.team.conference?.name||"Conference"} Standings</h2>
        <div className="mt-4 overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr className="border-b-2"><th className="px-2 py-3 text-left">Rank</th><th className="px-2 py-3 text-left">Team</th><th className="px-2 py-3 text-center">C.W</th><th className="px-2 py-3 text-center">C.L</th><th className="px-2 py-3 text-center">T.W</th><th className="px-2 py-3 text-center">T.L</th></tr></thead><tbody>{schedule.standings.map((standing)=><tr key={standing.team.id} className={`border-b border-slate-600 ${standing.team.id===schedule.team.id?"font-bold":""}`}><td className="px-2 py-3">{standing.rank}</td><td className="px-2 py-3"><div className="flex items-center gap-2"><Logo url={getLaxLogoUrl(standing.team.logoFileName)} variant="tiny"/><span>{standing.team.abbreviation||standing.team.name}</span></div></td><td className="px-2 py-3 text-center">{standing.conferenceWins}</td><td className="px-2 py-3 text-center">{standing.conferenceLosses}</td><td className="px-2 py-3 text-center">{standing.totalWins}</td><td className="px-2 py-3 text-center">{standing.totalLosses}</td></tr>)}</tbody></table></div>
      </Border></>):<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-2">{schedule.conferenceStandings.map((conferenceGroup)=><Border key={conferenceGroup.conference.id} classes="h-fit overflow-hidden p-4" styles={{borderColor:primary}}>
        <h2 className="rounded px-4 py-2 text-center text-xl font-bold" style={headerStyle}>{conferenceGroup.conference.name} Standings</h2>
        <div className="mt-4 overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr className="border-b-2"><th className="px-2 py-3 text-left">Rank</th><th className="px-2 py-3 text-left">Team</th><th className="px-2 py-3 text-center">C.W</th><th className="px-2 py-3 text-center">C.L</th><th className="px-2 py-3 text-center">T.W</th><th className="px-2 py-3 text-center">T.L</th></tr></thead><tbody>{conferenceGroup.standings.map((standing)=><tr key={standing.team.id} className={`border-b border-slate-600 ${standing.team.id===schedule.team.id?"font-bold":""}`}><td className="px-2 py-3">{standing.rank}</td><td className="px-2 py-3"><div className="flex items-center gap-2"><Logo url={getLaxLogoUrl(standing.team.logoFileName)} variant="tiny"/><span>{standing.team.abbreviation||standing.team.name}</span></div></td><td className="px-2 py-3 text-center">{standing.conferenceWins}</td><td className="px-2 py-3 text-center">{standing.conferenceLosses}</td><td className="px-2 py-3 text-center">{standing.totalWins}</td><td className="px-2 py-3 text-center">{standing.totalLosses}</td></tr>)}</tbody></table></div>
      </Border>)}</div>}
    </div>}
    {schedule&&<CollegeLacrosseScheduleRequestModal week={requestWeek} season={schedule.selectedSeason} gameContext={requestContext} team={schedule.team} games={schedule.games} tentativeGames={schedule.tentativeGames||[]} onClose={()=>setRequestWeek(null)} onSent={()=>void load(schedule.team.id,schedule.selectedSeason)}/>} 
    <CollegeLacrosseBoxScoreModal gameId={boxScoreGameId} onClose={()=>setBoxScoreGameId(null)}/>
  </PageContainer>;
};
