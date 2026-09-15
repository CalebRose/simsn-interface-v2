import { useEffect, useMemo, useState } from "react";
import { StylesConfig } from "react-select";
import { Button } from "../../_design/Buttons";
import { SelectDropdown } from "../../_design/Select";
import { SelectOption } from "../../_hooks/useSelectStyles";
import { LacrosseService, LaxGameContext, LaxScheduleGame, LaxTeam, LaxTentativeGame } from "../../_services/lacrosseService";
import { ProfileTeamCardModal } from "../Profile/ProfileTeamCardModal";

type VenueChoice = "home" | "away";

interface CollegeLacrosseScheduleRequestModalProps {
  week: number | null;
  season: number;
  gameContext: LaxGameContext;
  team: LaxTeam;
  games: LaxScheduleGame[];
  tentativeGames: LaxTentativeGame[];
  onClose: () => void;
  onSent: () => void;
}

export const CollegeLacrosseScheduleRequestModal = ({ week, season, gameContext, team, games, tentativeGames, onClose, onSent }:CollegeLacrosseScheduleRequestModalProps) => {
  const [venue,setVenue]=useState<VenueChoice>("home");
  const [opponentId,setOpponentId]=useState<string>();
  const [availableTeams,setAvailableTeams]=useState<LaxTeam[]>([]);
  const [loadingOpponents,setLoadingOpponents]=useState(false);
  const [opponentError,setOpponentError]=useState("");
  const [sending,setSending]=useState(false);
  const [sendError,setSendError]=useState("");
  useEffect(()=>{
    if(week===null)return;
    let active=true;
    setVenue("home");setOpponentId(undefined);setLoadingOpponents(true);setOpponentError("");setSendError("");
    LacrosseService.getAvailableOpponents(team.id,season,week,gameContext).then((opponents)=>{if(active)setAvailableTeams(opponents.filter((candidate)=>candidate.id!==team.id));}).catch(()=>{if(active){setAvailableTeams([]);setOpponentError("Available opponents could not be loaded.");}}).finally(()=>{if(active)setLoadingOpponents(false);});
    return ()=>{active=false;};
  },[gameContext,season,team.id,week]);
  const opponentOptions=useMemo(()=>availableTeams.map((candidate)=>({value:String(candidate.id),label:`${candidate.name} | ${candidate.abbreviation}`})),[availableTeams]);
  const opponentSelectStyles:StylesConfig<SelectOption,false>={
    control:(provided,state)=>({...provided,width:"100%",maxWidth:"none",backgroundColor:state.isFocused?"#2d3748":"#1a202c",borderColor:state.isFocused?"#4A90E2":"#4A5568",boxShadow:state.isFocused?"0 0 0 1px #4A90E2":"none"}),
    valueContainer:(provided)=>({...provided,justifyContent:"center"}),
    input:(provided)=>({...provided,color:"#ffffff",textAlign:"center"}),
    placeholder:(provided)=>({...provided,color:"#A0AEC0",textAlign:"center"}),
    singleValue:(provided)=>({...provided,color:"#ffffff",textAlign:"center"}),
  };
  const contextGames=games.filter((game)=>game.gameContext===gameContext);
  const contextTentative=tentativeGames.filter((game)=>game.gameContext===gameContext);
  const confirmedHome=contextGames.filter((game)=>game.isHome).length;
  const confirmedAway=contextGames.length-confirmedHome;
  const pendingHome=contextTentative.filter((game)=>game.isHome).length;
  const pendingAway=contextTentative.length-pendingHome;
  const send=async()=>{if(!opponentId||week===null)return;setSending(true);setSendError("");try{await LacrosseService.sendScheduleRequest(season,week,Number(opponentId),venue,gameContext);onSent();onClose();}catch(error){setSendError(error instanceof Error?error.message:"The challenge could not be sent.");}finally{setSending(false);}};
  return <ProfileTeamCardModal
    isOpen={week!==null}
    onClose={onClose}
    title={`Request a ${gameContext==="preseason"?"Preseason ":""}Week ${week || ""} Game`}
    actions={<><Button variant="secondary" disabled={sending} onClick={onClose}>Cancel</Button><Button disabled={!opponentId||sending} onClick={()=>void send()}>{sending?"Sending...":"Send"}</Button></>}
  >
    <div className="space-y-6">
      <div className="text-center text-lg font-bold">{team.name}</div>
      <div className="flex justify-center gap-3" role="group" aria-label="Requested game location">
        <button type="button" onClick={()=>setVenue("home")} className={`min-w-20 rounded border px-5 py-2 text-lg font-bold ${venue==="home"?"border-green-400 bg-green-600 text-white":"border-slate-500 bg-transparent"}`} aria-pressed={venue==="home"}>vs</button>
        <button type="button" onClick={()=>setVenue("away")} className={`min-w-20 rounded border px-5 py-2 text-lg font-bold ${venue==="away"?"border-blue-400 bg-blue-600 text-white":"border-slate-500 bg-transparent"}`} aria-pressed={venue==="away"}>@</button>
      </div>
      <div className="w-full"><label className="mb-2 block text-center font-semibold">Opponent</label><SelectDropdown isSearchable isLoading={loadingOpponents} isDisabled={loadingOpponents} styles={opponentSelectStyles} options={opponentOptions} value={opponentOptions.find((option)=>option.value===opponentId)} placeholder={loadingOpponents?"Loading available teams...":"Search available teams..."} noOptionsMessage={()=>"No available opponents"} onChange={(option)=>setOpponentId(option?.value)} />{opponentError&&<div className="mt-2 text-center text-sm text-red-500">{opponentError}</div>}</div>
      {sendError&&<div className="text-center text-sm text-red-500">{sendError}</div>}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="rounded border border-slate-500 p-3"><strong className="block text-lg">Home Games</strong><span>{confirmedHome} confirmed</span><span className="block opacity-60">{pendingHome} pending</span></div>
        <div className="rounded border border-slate-500 p-3"><strong className="block text-lg">Away Games</strong><span>{confirmedAway} confirmed</span><span className="block opacity-60">{pendingAway} pending</span></div>
      </div>
    </div>
  </ProfileTeamCardModal>;
};
