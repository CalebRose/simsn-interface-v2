import { CSSProperties, useEffect, useMemo, useState } from "react";
import { StylesConfig } from "react-select";
import { Border } from "../../_design/Borders";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import { SelectOption } from "../../_hooks/useSelectStyles";
import { getLaxLogoUrl, LacrosseService, LaxConferenceTournamentBracket, LaxTournamentGame } from "../../_services/lacrosseService";

interface Props { season:number;defaultConferenceId?:number;tournamentType?:"conference"|"national";primary:string;headerStyle:CSSProperties;onBoxScore:(gameId:number)=>void }

const roundName=(roundCount:number,round:number)=>{
  const remaining=roundCount-round;
  if(remaining===0)return "Final";
  if(remaining===1)return "Semifinals";
  if(remaining===2)return "Quarterfinals";
  return "First Round";
};

const TeamEntry=({game,home}:{game:LaxTournamentGame;home:boolean})=>{
  const team=home?game.homeTeam:game.awayTeam;
  const seed=home?game.homeSeed:game.awaySeed;
  const score=home?game.homeScore:game.awayScore;
  return <div className="grid grid-cols-[22px_30px_minmax(0,1fr)_30px] items-center gap-2 px-3 py-2">
    <span className="text-xs font-semibold text-slate-400">{seed}</span>
    <Logo url={getLaxLogoUrl(team.logoFileName)} variant="tiny"/>
    <span className="truncate font-semibold">{team.abbreviation||team.name}</span>
    <span className="text-right font-bold">{game.status==="Final"?score:""}</span>
  </div>;
};

export const CollegeLacrosseConferenceTournamentBracket=({season,defaultConferenceId,tournamentType="conference",primary,headerStyle,onBoxScore}:Props)=>{
  const [brackets,setBrackets]=useState<LaxConferenceTournamentBracket[]>([]);
  const [conferenceId,setConferenceId]=useState<number>();
  const [error,setError]=useState("");
  useEffect(()=>{
    const request=tournamentType==="national"
      ?LacrosseService.getNationalTournamentBracket(season).then((response):LaxConferenceTournamentBracket[]=>[{conference:{id:0,name:"National",abbreviation:"National"},roundCount:response.roundCount,games:response.games}])
      :LacrosseService.getConferenceTournamentBrackets(season).then((response)=>response.brackets);
    request.then((response)=>{setBrackets(response);const preferred=response.find((bracket)=>bracket.conference.id===defaultConferenceId);setConferenceId(tournamentType==="national"?0:preferred?.conference.id??response[0]?.conference.id);setError("");}).catch((reason)=>setError(reason instanceof Error?reason.message:"The tournament bracket could not be reached."));
  },[season,defaultConferenceId,tournamentType]);
  const bracket=useMemo(()=>brackets.find((item)=>item.conference.id===conferenceId),[brackets,conferenceId]);
  const options=brackets.map((item)=>({value:String(item.conference.id),label:`${item.conference.name} | ${item.conference.abbreviation||item.conference.name}`}));
  const selectStyles:StylesConfig<SelectOption,false>={control:(provided,state)=>({...provided,minHeight:"44px",backgroundColor:state.isFocused?"#2d3748":"#1a202c",borderColor:state.isFocused?primary:"#4A5568",boxShadow:state.isFocused?`0 0 0 1px ${primary}`:"none",borderRadius:"8px"})};
  return <Border classes="min-h-[720px] overflow-visible p-4 lg:col-span-2" styles={{borderColor:primary}}>
    <h2 className="rounded px-4 py-2 text-center text-xl font-bold" style={headerStyle}>{tournamentType==="national"?"National Tournament":`${bracket?.conference.name||"Conference"} Tournament`}</h2>
    {tournamentType==="conference"&&<div className="mx-auto mt-4 max-w-md"><SelectDropdown isSearchable styles={selectStyles} options={options} value={options.find((option)=>option.value===String(conferenceId))} placeholder="Select Conference..." onChange={(option)=>setConferenceId(option?Number(option.value):undefined)}/></div>}
    {error&&<div className="mt-4 text-center text-red-500">{error}</div>}
    {bracket&&<div className="mt-6 min-h-[600px] overflow-x-auto overflow-y-visible pb-3"><div className="grid min-h-[560px] min-w-[760px] gap-8" style={{gridTemplateColumns:`repeat(${bracket.roundCount}, minmax(210px, 1fr))`}}>
      {Array.from({length:bracket.roundCount},(_,index)=>index+1).map((round)=>{
        const games=bracket.games.filter((game)=>game.tournamentRound===round).sort((a,b)=>a.bracketSlot-b.bracketSlot);
        const spacing=Math.max(16,Math.pow(2,round-1)*48);
        return <section key={round}><h3 className="mb-4 text-center font-bold">{roundName(bracket.roundCount,round)}</h3><div className="flex h-full flex-col justify-around" style={{gap:`${spacing}px`,paddingTop:`${(Math.pow(2,round-1)-1)*36}px`,paddingBottom:`${(Math.pow(2,round-1)-1)*36}px`}}>{games.map((game)=><button key={game.id} type="button" disabled={game.status!=="Final"} onClick={()=>onBoxScore(game.id)} className="overflow-hidden rounded border border-slate-500 bg-slate-800 text-left disabled:cursor-default"><TeamEntry game={game} home/><div className="border-t border-slate-600"/><TeamEntry game={game} home={false}/></button>)}</div></section>;
      })}
    </div></div>}
  </Border>;
};
