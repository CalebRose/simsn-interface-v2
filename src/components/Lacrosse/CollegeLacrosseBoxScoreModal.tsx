import { Fragment, useEffect, useMemo, useState } from "react";
import { Logo } from "../../_design/Logo";
import { Modal } from "../../_design/Modal";
import { getLaxLogoUrl, LacrosseService, LaxGameBoxScore, LaxGamePlayByPlay, LaxPlayerBoxScore, LaxTeamBoxScore } from "../../_services/lacrosseService";
import { exportToCsv } from "../../_utility/csvExport";

const pct=(made:number,attempts:number)=>attempts?`${((made/attempts)*100).toFixed(1)}%`:"—";
const teamName=(team:LaxTeamBoxScore)=>team.team.abbreviation||team.team.name;

type PlayerColumn={label:string;value:(player:LaxPlayerBoxScore)=>string|number};

const playerName=(player:LaxPlayerBoxScore)=>`${player.firstName} ${player.lastName}${player.fouledOut?" (FO)":""}`;
const minutes=(value:number)=>Number(value).toFixed(1);
const compactNumber=(value:number)=>Number.isInteger(Number(value))?String(Number(value)):String(Number(value));
const readableText=(color:string) => {
  const hex=color.replace("#","");
  if(hex.length!==6)return "#ffffff";
  const [r,g,b]=[0,2,4].map((offset)=>parseInt(hex.slice(offset,offset+2),16));
  return (r*299+g*587+b*114)/1000>155?"#111827":"#ffffff";
};
const actionLabel=(value:string)=>value.split("_").map((part)=>part?part[0].toUpperCase()+part.slice(1).toLowerCase():part).join(" ");

const TeamPlayerTable=({team,players,columns}:{team:LaxTeamBoxScore;players:LaxPlayerBoxScore[];columns:PlayerColumn[]})=><div className="min-w-0">
  <h3 className="mb-2 flex items-center gap-2 font-bold"><Logo url={getLaxLogoUrl(team.team.logoFileName)} variant="tiny"/>{teamName(team)}</h3>
  <div className="overflow-x-auto"><table className="w-full min-w-[520px] border-collapse text-xs"><thead><tr className="border-b-2 border-slate-500">{columns.map((column)=><th key={column.label} className={`px-2 py-2 ${column.label==="Player"?"text-left":"text-center"}`}>{column.label}</th>)}</tr></thead><tbody>{players.length?players.map((player)=><tr key={player.playerId} className="border-b border-slate-600">{columns.map((column)=><td key={column.label} className={`px-2 py-2 ${column.label==="Player"?"text-left font-semibold":"text-center"}`}>{column.value(player)}</td>)}</tr>):<tr><td colSpan={columns.length} className="px-2 py-3 text-center italic opacity-50">No players recorded</td></tr>}</tbody></table></div>
</div>;

const PlayerSection=({title,away,home,players,columns,filter}:{title:string;away:LaxTeamBoxScore;home:LaxTeamBoxScore;players:LaxPlayerBoxScore[];columns:PlayerColumn[];filter:(player:LaxPlayerBoxScore)=>boolean})=><section>
  <h2 className="mb-3 border-b border-slate-500 pb-2 text-center text-xl font-bold">{title}</h2>
  <div className="grid gap-6 lg:grid-cols-2"><TeamPlayerTable team={away} players={players.filter((player)=>player.teamId===away.team.id&&filter(player))} columns={columns}/><TeamPlayerTable team={home} players={players.filter((player)=>player.teamId===home.team.id&&filter(player))} columns={columns}/></div>
</section>;

const faceoffColumns:PlayerColumn[]=[
  {label:"Player",value:playerName},{label:"FO",value:player=>player.faceoffsTaken},{label:"FOW",value:player=>player.faceoffsWon},
  {label:"FOL",value:player=>player.faceoffsTaken-player.faceoffsWon},{label:"FO%",value:player=>pct(player.faceoffsWon,player.faceoffsTaken)},
];
const fieldColumns:PlayerColumn[]=[
  {label:"Player",value:playerName},{label:"MP",value:player=>minutes(player.minutesPlayed)},{label:"G",value:player=>player.goals},
  {label:"A",value:player=>player.assists},{label:"SH",value:player=>player.shots},{label:"SOG",value:player=>player.shotsOnGoal},
  {label:"GB",value:player=>player.groundBalls},{label:"CT",value:player=>player.causedTurnovers},{label:"TO",value:player=>player.turnovers},
  {label:"PEN",value:player=>player.penalties},{label:"PIM",value:player=>compactNumber(player.penaltyMinutes)},
];
const goalieColumns:PlayerColumn[]=[
  {label:"Player",value:playerName},{label:"MP",value:player=>minutes(player.minutesPlayed)},
  {label:"Shots Faced",value:player=>player.saves+player.goalsAllowed},{label:"SV",value:player=>player.saves},
  {label:"GA",value:player=>player.goalsAllowed},{label:"SV%",value:player=>pct(player.saves,player.saves+player.goalsAllowed)},
];

export const CollegeLacrosseBoxScoreModal=({gameId,onClose}:{gameId:number|null;onClose:()=>void})=>{
  const [box,setBox]=useState<LaxGameBoxScore>();
  const [playByPlay,setPlayByPlay]=useState<LaxGamePlayByPlay>();
  const [showPlayByPlay,setShowPlayByPlay]=useState(false);
  const [playByPlayLoading,setPlayByPlayLoading]=useState(false);
  const [playByPlayError,setPlayByPlayError]=useState("");
  const [error,setError]=useState("");
  useEffect(()=>{setBox(undefined);setPlayByPlay(undefined);setShowPlayByPlay(false);setPlayByPlayError("");setError("");if(gameId===null)return;LacrosseService.getGameBoxScore(gameId).then(setBox).catch((reason)=>setError(reason instanceof Error?reason.message:"The box score could not be loaded."));},[gameId]);
  useEffect(()=>{if(!showPlayByPlay||gameId===null||playByPlay)return;setPlayByPlayLoading(true);setPlayByPlayError("");LacrosseService.getGamePlayByPlay(gameId).then(setPlayByPlay).catch((reason)=>setPlayByPlayError(reason instanceof Error?reason.message:"The play-by-play could not be loaded.")).finally(()=>setPlayByPlayLoading(false));},[gameId,playByPlay,showPlayByPlay]);
  const stats:[string,(team:LaxTeamBoxScore)=>string|number][]=[
    ["Shots",team=>team.shots],["Shots on Goal",team=>team.shotsOnGoal],["Ground Balls",team=>team.groundBalls],
    ["Faceoffs",team=>`${team.faceoffsWon}/${team.faceoffsTaken} (${pct(team.faceoffsWon,team.faceoffsTaken)})`],
    ["Clears",team=>`${team.successfulClears}/${team.clearAttempts} (${pct(team.successfulClears,team.clearAttempts)})`],
    ["Turnovers",team=>team.turnovers],["Saves",team=>team.saves],
    ["Penalties",team=>`${team.penalties} / ${team.penaltyMinutes} min`],["Man-Up",team=>`${team.manUpGoals}/${team.manUpOpportunities}`],
  ];
  const teamLabels=useMemo(()=>{if(!box)return new Map<number,string>();return new Map([[box.home.team.id,teamName(box.home)],[box.away.team.id,teamName(box.away)]]);},[box]);
  const exportPlayerBoxScore=()=>{
    if(!box)return;
    exportToCsv(`${box.gameId}_${teamName(box.away)}_vs_${teamName(box.home)}_box_score.csv`,
      ["Game ID","Team","Player ID","Player","Position","Minutes","Goals","Assists","Points","Shots","Shots on Goal","Ground Balls","Caused Turnovers","Turnovers","Faceoffs","Faceoffs Won","Saves","Goals Allowed","Penalties","Penalty Minutes","Fouled Out"],
      box.players.map((player)=>[
        box.gameId, player.teamId===box.home.team.id?teamName(box.home):teamName(box.away), player.playerId, playerName(player), player.position,
        minutes(player.minutesPlayed), player.goals, player.assists, player.points, player.shots, player.shotsOnGoal,
        player.groundBalls, player.causedTurnovers, player.turnovers, player.faceoffsTaken, player.faceoffsWon,
        player.saves, player.goalsAllowed, player.penalties, player.penaltyMinutes, player.fouledOut?"Yes":"No",
      ]));
  };
  const exportPlayByPlay=()=>{
    if(!playByPlay||!box)return;
    const homeLabel=teamName(box.home);
    const awayLabel=teamName(box.away);
    const fieldLabel=(value:string)=>value.replace(/_/g," ").replace(/\b\w/g,(letter)=>letter.toUpperCase());
    exportToCsv(`${playByPlay.gameId}_${awayLabel}_vs_${homeLabel}_play_by_play.csv`,
      ["Play #",`${homeLabel} Score`,`${awayLabel} Score`,"Quarter","Time Remaining","Shot Clock","Possession","Play Duration","Action","Outcome","Play Narration","Field","Primary Player ID","Secondary Player ID","Defender ID","is_goal","is_injury","in_penalty","field_x","field_y"],
      playByPlay.plays.map((play)=>[
        play.playNumber,play.homeTeamScore,play.awayTeamScore,play.period,play.timeRemaining,play.shotClockRemaining,
        play.possessionTeamId?teamLabels.get(play.possessionTeamId)||"": "",play.playDuration,actionLabel(play.actionType),
        play.outcomeType?actionLabel(play.outcomeType):"",play.playRemark,fieldLabel(play.fieldArea),play.primaryPlayerId??"",
        play.secondaryPlayerId??"",play.defendingPlayerId??"",play.isGoal?1:0,play.isInjury?1:0,play.isPenalty?1:0,
        play.fieldX??"",play.fieldY??"",
      ]));
  };
  const playByPlayView=showPlayByPlay&&playByPlay;
  return <Modal isOpen={gameId!==null} onClose={onClose} title={box?`${teamName(box.away)} vs ${teamName(box.home)} ${showPlayByPlay?"Play By Play":"Box Score"}`:"Box Score"} maxWidth="max-w-7xl">
    {error?<div className="p-8 text-center text-red-500">{error}</div>:!box?<div className="p-8 text-center">Loading box score…</div>:<div className="space-y-7">
      <div className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center justify-center gap-4"><Logo url={getLaxLogoUrl(box.away.team.logoFileName)} variant="large"/><div className="text-left"><div className="text-xl font-bold">{box.away.team.name}</div><div>{box.away.team.nickname}</div></div><div className={`text-6xl font-bold ${box.away.finalScore>box.home.finalScore?"text-green-500":"text-red-500"}`}>{box.away.finalScore}</div></div>
        <div className="text-center"><div className="font-bold uppercase">Final</div><table className="mt-2 text-center text-sm"><thead><tr><th/><th className="px-2">1</th><th className="px-2">2</th><th className="px-2">3</th><th className="px-2">4</th>{(box.home.overtime>0||box.away.overtime>0)&&<th className="px-2">OT</th>}<th className="px-2">T</th></tr></thead><tbody>{[box.away,box.home].map((team)=><tr key={team.team.id}><th className="pr-3 text-left">{teamName(team)}</th><td>{team.period1}</td><td>{team.period2}</td><td>{team.period3}</td><td>{team.period4}</td>{(box.home.overtime>0||box.away.overtime>0)&&<td>{team.overtime}</td>}<td className="font-bold">{team.finalScore}</td></tr>)}</tbody></table></div>
        <div className="flex items-center justify-center gap-4"><div className={`text-6xl font-bold ${box.home.finalScore>box.away.finalScore?"text-green-500":"text-red-500"}`}>{box.home.finalScore}</div><div className="text-right"><div className="text-xl font-bold">{box.home.team.name}</div><div>{box.home.team.nickname}</div></div><Logo url={getLaxLogoUrl(box.home.team.logoFileName)} variant="large"/></div>
      </div>
      <div className="flex items-center justify-center gap-3 border-y border-slate-600 py-3"><button type="button" onClick={showPlayByPlay?exportPlayByPlay:exportPlayerBoxScore} disabled={showPlayByPlay&&!playByPlay} title={showPlayByPlay?"Export play by play":"Export player box score"} className="rounded bg-blue-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">Export</button><button type="button" role="switch" aria-checked={showPlayByPlay} onClick={()=>setShowPlayByPlay((enabled)=>!enabled)} className={`relative h-6 w-11 rounded-full transition-colors ${showPlayByPlay?"bg-green-600":"bg-slate-500"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${showPlayByPlay?"left-6":"left-1"}`}/></button><span className="font-semibold">{showPlayByPlay?"Play by Play":"Box Score"}</span></div>
      {playByPlayView?<div className="rounded bg-slate-900/40 p-4"><div className="max-h-[55vh] overflow-auto"><table className="w-full min-w-[960px] border-collapse text-xs"><thead className="sticky top-0 bg-slate-800"><tr className="border-b-2 border-slate-500"><th className="px-2 py-2 text-left">Period</th><th className="px-2 py-2 text-left">Clock</th><th className="px-2 py-2 text-left">Shot</th><th className="px-2 py-2 text-center">{teamName(box.home)}</th><th className="px-2 py-2 text-center">{teamName(box.away)}</th><th className="px-2 py-2 text-left">Possession</th><th className="px-2 py-2 text-center">Action</th><th className="px-2 py-2 text-left">Play</th><th className="px-2 py-2 text-left">Field</th></tr></thead><tbody>{playByPlay.plays.map((play,index)=>{const previous=playByPlay.plays[index-1];const shotClockViolation=play.playRemark.toLowerCase().includes("shot clock violation");const goalTeam=play.actionTeamId===box.home.team.id?box.home.team:play.actionTeamId===box.away.team.id?box.away.team:undefined;const goalColor=goalTeam?.colors.primary;const fieldAreaLabel=play.fieldArea.replace(/_/g," ").replace(/\b\w/g,(letter)=>letter.toUpperCase());const rowStyle=play.isGoal?{backgroundColor:goalColor||"#166534",color:readableText(goalColor||"#166534")} : play.isPenalty?{backgroundColor:"rgba(234,179,8,0.18)"}:shotClockViolation?{backgroundColor:"rgba(220,38,38,0.18)"}:undefined;return <Fragment key={play.id}>{previous&&previous.period!==play.period&&<tr aria-hidden="true"><td colSpan={9} className="h-2 bg-black p-0"/></tr>}<tr className={`border-b border-slate-700 ${play.isGoal?"font-semibold":""}`} style={rowStyle}><td className="px-2 py-2">{play.period>4?`OT${play.period-4}:`:`Q${play.period}`}</td><td className="whitespace-nowrap px-2 py-2">{Math.floor(play.timeRemaining/60)}:{String(Math.floor(play.timeRemaining%60)).padStart(2,"0")}</td><td className="px-2 py-2">{Number(play.shotClockRemaining).toFixed(1)}</td><td className="px-2 py-2 text-center font-semibold">{play.homeTeamScore}</td><td className="px-2 py-2 text-center font-semibold">{play.awayTeamScore}</td><td className="px-2 py-2">{play.possessionTeamId?teamLabels.get(play.possessionTeamId)||"—":"—"}</td><td className="whitespace-nowrap px-2 py-2 text-center">{actionLabel(play.actionType)}</td><td className="min-w-[360px] px-2 py-2">{play.playRemark}</td><td className="px-2 py-2">{fieldAreaLabel}</td></tr></Fragment>})}</tbody></table></div></div>:showPlayByPlay&&playByPlayLoading?<div className="p-8 text-center">Loading play by play…</div>:showPlayByPlay&&playByPlayError?<div className="p-8 text-center text-red-500">{playByPlayError}</div>:<><div className="rounded bg-slate-900/40 p-4"><h3 className="mb-3 text-center text-lg font-bold">Team Statistics</h3><table className="mx-auto w-full max-w-3xl text-sm"><thead><tr><th>{teamName(box.away)}</th><th/><th>{teamName(box.home)}</th></tr></thead><tbody>{stats.map(([label,value])=><tr key={label} className="border-b border-slate-600"><td className="py-2 text-center font-semibold">{value(box.away)}</td><th className="py-2 text-center">{label}</th><td className="py-2 text-center font-semibold">{value(box.home)}</td></tr>)}</tbody></table></div>
      <PlayerSection title="Faceoff" away={box.away} home={box.home} players={box.players} columns={faceoffColumns} filter={(player)=>player.faceoffsTaken>0}/>
      <PlayerSection title="Attack" away={box.away} home={box.home} players={box.players} columns={fieldColumns} filter={(player)=>player.position==="Attack"}/>
      <PlayerSection title="Midfield" away={box.away} home={box.home} players={box.players} columns={fieldColumns} filter={(player)=>player.position==="Midfield"}/>
      <PlayerSection title="Defense" away={box.away} home={box.home} players={box.players} columns={fieldColumns} filter={(player)=>player.position==="Defense"}/>
      <PlayerSection title="Goalie" away={box.away} home={box.home} players={box.players} columns={goalieColumns} filter={(player)=>player.position==="Goalie"}/></>}
    </div>}
  </Modal>;
};
