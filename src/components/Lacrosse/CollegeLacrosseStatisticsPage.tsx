import { useEffect, useMemo, useState } from "react";
import { Border } from "../../_design/Borders";
import { Button } from "../../_design/Buttons";
import { PageContainer } from "../../_design/Container";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import { getLaxLogoUrl, LaxStatisticsCategory, LaxStatisticsResponse, LaxStatisticsType } from "../../_services/lacrosseService";
import { claxStatsKey, useSimLAXStore } from "../../context/SimLAXContext";
import { getLacrosseYearAbbreviation } from "./lacrosseFormatting";

type Row = LaxStatisticsResponse["rows"][number];
type StatsView = "season" | "week";
type Column = { key:string; label:string; title:string; align?:"left"|"center"; format?:(value:Row[string])=>string };
const seasonYear=(season:number, years?:Record<number,number>)=>years?.[season]??2025+season;
const errorText=(error:unknown)=>error instanceof Error?error.message:"The SimLAX statistics service could not be reached.";
const number=(value:Row[string])=>value==null?"—":String(value);
const percent=(value:Row[string])=>value==null?"—":`${Number(value).toFixed(2)}%`;
const PAGE_SIZE=50;

const columnsFor=(category:LaxStatisticsCategory,type:LaxStatisticsType):Column[]=>{
  const team:Column={key:"team",label:"Team",title:"Team",align:"left"};
  const name:Column={key:"name",label:"Name",title:"Player Name",align:"left"};
  const position:Column={key:"position",label:"Pos",title:"Position",align:"left"};
  const archetype:Column={key:"archetype",label:"Archetype",title:"Archetype",align:"left"};
  const year:Column={key:"year",label:"Year",title:"Academic Year",format:(value)=>getLacrosseYearAbbreviation(Number(value))};
  if(type==="player"&&category==="field")return [team,name,position,archetype,year,{key:"gamesPlayed",label:"GP",title:"Games Played"},{key:"minutesPlayed",label:"MIN",title:"Minutes Played"},{key:"goals",label:"G",title:"Goals"},{key:"assists",label:"A",title:"Assists"},{key:"points",label:"PTS",title:"Points"},{key:"shots",label:"SH",title:"Shots"},{key:"shotsOnGoal",label:"SOG",title:"Shots on Goal"},{key:"shotPercentage",label:"SH%",title:"Shooting Percentage",format:percent},{key:"groundBalls",label:"GB",title:"Ground Balls"},{key:"causedTurnovers",label:"CT",title:"Caused Turnovers"},{key:"turnovers",label:"TO",title:"Turnovers"},{key:"faceoffsWon",label:"FOW",title:"Faceoffs Won"},{key:"faceoffsTaken",label:"FO",title:"Faceoffs Taken"},{key:"faceoffPercentage",label:"FO%",title:"Faceoff Percentage",format:percent},{key:"blockedShots",label:"BS",title:"Blocked Shots"},{key:"pipes",label:"Pipes",title:"Shots off the Pipe"},{key:"penalties",label:"Pen",title:"Penalties"},{key:"penaltyMinutes",label:"PIM",title:"Penalty Minutes"},{key:"manUpGoals",label:"MUG",title:"Man-Up Goals"},{key:"manDownGoals",label:"MDG",title:"Man-Down Goals"}];
  if(type==="player")return [team,name,archetype,year,{key:"gamesPlayed",label:"GP",title:"Games Played"},{key:"minutesPlayed",label:"MIN",title:"Minutes Played"},{key:"saves",label:"SV",title:"Saves"},{key:"goalsAllowed",label:"GA",title:"Goals Allowed"},{key:"savePercentage",label:"SV%",title:"Save Percentage",format:percent},{key:"outletAttempts",label:"Outlet Att.",title:"Goalie Outlet Attempts"},{key:"outletsCompleted",label:"Outlet Comp.",title:"Goalie Outlets Completed"},{key:"outletTurnovers",label:"Outlet TO",title:"Goalie Outlet Turnovers"}];
  if(category==="field")return [team,{key:"gamesPlayed",label:"GP",title:"Games Played"},{key:"goals",label:"G",title:"Goals"},{key:"assists",label:"A",title:"Assists"},{key:"points",label:"PTS",title:"Points"},{key:"shots",label:"SH",title:"Shots"},{key:"shotsOnGoal",label:"SOG",title:"Shots on Goal"},{key:"shotPercentage",label:"SH%",title:"Shooting Percentage",format:percent},{key:"groundBalls",label:"GB",title:"Ground Balls"},{key:"causedTurnovers",label:"CT",title:"Caused Turnovers"},{key:"turnovers",label:"TO",title:"Turnovers"},{key:"faceoffsWon",label:"FOW",title:"Faceoffs Won"},{key:"faceoffsTaken",label:"FO",title:"Faceoffs Taken"},{key:"faceoffPercentage",label:"FO%",title:"Faceoff Percentage",format:percent},{key:"successfulClears",label:"CLR",title:"Successful Clears"},{key:"clearAttempts",label:"CLR Att.",title:"Clear Attempts"},{key:"clearPercentage",label:"CLR%",title:"Clear Percentage",format:percent},{key:"possessions",label:"Poss.",title:"Possessions"},{key:"penalties",label:"Pen",title:"Penalties"},{key:"penaltyMinutes",label:"PIM",title:"Penalty Minutes"},{key:"manUpGoals",label:"MUG",title:"Man-Up Goals"},{key:"manUpOpportunities",label:"MUO",title:"Man-Up Opportunities"}];
  return [team,{key:"gamesPlayed",label:"GP",title:"Games Played"},{key:"saves",label:"SV",title:"Saves"},{key:"goalsAllowed",label:"GA",title:"Goals Allowed"},{key:"savePercentage",label:"SV%",title:"Save Percentage",format:percent},{key:"outletAttempts",label:"Outlet Att.",title:"Goalie Outlet Attempts"},{key:"outletsCompleted",label:"Outlet Comp.",title:"Goalie Outlets Completed"},{key:"outletTurnovers",label:"Outlet TO",title:"Goalie Outlet Turnovers"}];
};

export const CollegeLacrosseStatisticsPage=()=>{
  const {claxTeams:teams,refreshClaxTeams,claxStatistics,refreshClaxStatistics}=useSimLAXStore();
  const [statsKey,setStatsKey]=useState(claxStatsKey(undefined,undefined,"field","player"));
  const response=claxStatistics[statsKey]??null;
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [view,setView]=useState<StatsView>("season");
  const [category,setCategory]=useState<LaxStatisticsCategory>("field");
  const [statsType,setStatsType]=useState<LaxStatisticsType>("player");
  const [season,setSeason]=useState<number>();
  const [week,setWeek]=useState(1);
  const [sortKey,setSortKey]=useState("goals");
  const [ascending,setAscending]=useState(false);
  const [page,setPage]=useState(1);
  const [teamFilter,setTeamFilter]=useState("");
  const [conferenceFilter,setConferenceFilter]=useState("");

  const load=async(nextCategory=category,nextType=statsType)=>{
    setLoading(true);
    try{const selectedWeek=view==="week"?week:undefined;const data=await refreshClaxStatistics(season,selectedWeek,nextCategory,nextType);setStatsKey(claxStatsKey(season,selectedWeek,nextCategory,nextType));setSeason(data.selectedSeason);setPage(1);setError("");}
    catch(reason){setError(errorText(reason));}
    finally{setLoading(false);}
  };
  useEffect(()=>{void load();void refreshClaxTeams();},[refreshClaxTeams]);
  const chooseCategory=(next:LaxStatisticsCategory)=>{setCategory(next);setSortKey(next==="goalie"?"savePercentage":"goals");setAscending(false);void load(next,statsType);};
  const chooseType=(next:LaxStatisticsType)=>{setStatsType(next);setSortKey(category==="goalie"?"savePercentage":"goals");setAscending(false);void load(category,next);};
  const columns=useMemo(()=>columnsFor(category,statsType),[category,statsType]);
  const teamById=useMemo(()=>new Map(teams.map((item)=>[item.id,item])),[teams]);
  const filteredRows=useMemo(()=>(response?.rows||[]).filter((row)=>{
    const rowTeam=teamById.get(Number(row.teamId));
    return (!teamFilter||String(row.teamId)===teamFilter)&&(!conferenceFilter||String(rowTeam?.conference?.id||"")===conferenceFilter);
  }),[response?.rows,teamById,teamFilter,conferenceFilter]);
  const rows=useMemo(()=>[...filteredRows].sort((a,b)=>{const left=sortKey==="name"?`${a.lastName||""}, ${a.firstName||""}`:a[sortKey];const right=sortKey==="name"?`${b.lastName||""}, ${b.firstName||""}`:b[sortKey];const comparison=typeof left==="number"&&typeof right==="number"?left-right:String(left??"").localeCompare(String(right??""));return ascending?comparison:-comparison;}),[filteredRows,sortKey,ascending]);
  const pageCount=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));
  const visibleRows=rows.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
  const sort=(key:string)=>{if(sortKey===key)setAscending((current)=>!current);else{setSortKey(key);setAscending(false);}};
  const exportStats=()=>{
    const csv=[columns.map((column)=>column.title),...rows.map((row)=>columns.map((column)=>column.key==="name"?`${row.firstName||""} ${row.lastName||""}`.trim():row[column.key]??""))].map((row)=>row.map((value)=>`"${String(value).replaceAll('"','""')}"`).join(",")).join("\n");
    const url=URL.createObjectURL(new Blob([`\uFEFF${csv}`],{type:"text/csv;charset=utf-8"}));const link=document.createElement("a");link.href=url;link.download=`clax_statistics_${seasonYear(season||response?.selectedSeason||1,response?.seasonYears)}_${view}${view==="week"?`_${week}`:""}_${category}_${statsType}.csv`;link.click();URL.revokeObjectURL(url);
  };
  const primary=response?.team.colors.primary||"#2563eb";
  const seasonOptions=(response?.seasons||[]).map((item)=>({value:String(item),label:String(seasonYear(item,response?.seasonYears))}));
  const weekOptions=Array.from({length:14},(_,index)=>({value:String(index+1),label:`Week ${index+1}`}));
  const teamOptions=teams.map((item)=>({value:String(item.id),label:`${item.name} | ${item.abbreviation||"—"}`}));
  const conferenceOptions=[...new Map(teams.filter((item)=>item.conference).map((item)=>[item.conference!.id,{value:String(item.conference!.id),label:`${item.conference!.name} | ${item.conference!.abbreviation||"—"}`}])).values()].sort((a,b)=>a.label.localeCompare(b.label));
  return <PageContainer direction="col" isLoading={loading&&!response} title="Statistics">
    {error&&<Border classes="mb-3 p-3 text-red-400">{error}</Border>}
    {response&&<div className="grid grid-cols-1 gap-3 lg:grid-cols-[300px_minmax(0,1fr)]">
      <Border classes="h-fit p-4 lg:sticky lg:top-3" styles={{borderColor:primary}}>
        <h2 className="rounded px-3 py-2 text-center text-xl font-bold text-white" style={{backgroundColor:primary}}>{response.team.name} {response.team.nickname}</h2>
        <div className="py-3 text-center text-lg font-semibold">{response.team.conference?.abbreviation||"Independent"}</div>
        <SidebarHeader color={primary}>Actions</SidebarHeader>
        <label className="mt-3 block min-w-0 text-center text-sm font-semibold">Season<div className="mt-2 min-w-0"><SelectDropdown options={seasonOptions} value={seasonOptions.find((item)=>item.value===String(season))||null} placeholder="Select season..." onChange={(option)=>option&&setSeason(Number(option.value))} styles={{container:(base)=>({...base,width:"100%",minWidth:0,maxWidth:"100%"}),control:(base,state)=>({...base,backgroundColor:state.isFocused?"#2d3748":"#1a202c",borderColor:state.isFocused?"#4A90E2":"#4A5568",color:"#fff",width:"100%",minWidth:0,maxWidth:"100%"})}}/></div></label>
        {view==="week"&&<label className="mt-3 block min-w-0 text-center text-sm font-semibold">Week<div className="mt-2 min-w-0"><SelectDropdown options={weekOptions} value={weekOptions.find((item)=>item.value===String(week))||null} placeholder="Select week..." onChange={(option)=>option&&setWeek(Number(option.value))} styles={{container:(base)=>({...base,width:"100%",minWidth:0,maxWidth:"100%"}),control:(base,state)=>({...base,backgroundColor:state.isFocused?"#2d3748":"#1a202c",borderColor:state.isFocused?"#4A90E2":"#4A5568",color:"#fff",width:"100%",minWidth:0,maxWidth:"100%"})}}/></div></label>}
        <div className="mt-3 flex justify-center gap-2"><Button size="xs" onClick={()=>void load()}>Search</Button><Button size="xs" onClick={exportStats}>Export</Button></div>
        <SidebarHeader color={primary}>Stats View</SidebarHeader><div className="flex justify-center gap-2"><Choice selected={view==="week"} onClick={()=>setView("week")}>Week</Choice><Choice selected={view==="season"} onClick={()=>setView("season")}>Season</Choice></div>
        <SidebarHeader color={primary}>Stats Category</SidebarHeader><div className="flex justify-center gap-2"><Choice selected={category==="field"} onClick={()=>chooseCategory("field")}>Field</Choice><Choice selected={category==="goalie"} onClick={()=>chooseCategory("goalie")}>Goalie</Choice></div>
        <SidebarHeader color={primary}>Stats Type</SidebarHeader><div className="flex justify-center gap-2"><Choice selected={statsType==="player"} onClick={()=>chooseType("player")}>Player</Choice><Choice selected={statsType==="team"} onClick={()=>chooseType("team")}>Team</Choice></div>
      </Border>
      <main className="min-w-0 space-y-3"><Border classes="flex flex-row flex-wrap items-end justify-start gap-8 p-4" styles={{borderColor:primary}}><label className="w-60 min-w-0 text-left text-sm font-semibold">Teams<SelectDropdown options={teamOptions} value={teamOptions.find((item)=>item.value===teamFilter)||null} placeholder="All teams" isClearable onChange={(option)=>{setTeamFilter(option?.value||"");setPage(1);}} styles={{container:(base)=>({...base,width:"15rem",minWidth:0,maxWidth:"15rem",textAlign:"left"}),control:(base,state)=>({...base,backgroundColor:state.isFocused?"#2d3748":"#1a202c",borderColor:state.isFocused?"#4A90E2":"#4A5568",color:"#fff",width:"15rem",minWidth:"15rem",maxWidth:"15rem",textAlign:"left"}),valueContainer:(base)=>({...base,textAlign:"left"}),input:(base)=>({...base,color:"#fff",textAlign:"left"}),singleValue:(base)=>({...base,color:"#fff",textAlign:"left"}),placeholder:(base)=>({...base,color:"#A0AEC0",textAlign:"left"})}}/></label><label className="w-60 min-w-0 text-left text-sm font-semibold">Conferences<SelectDropdown options={conferenceOptions} value={conferenceOptions.find((item)=>item.value===conferenceFilter)||null} placeholder="All conferences" isClearable onChange={(option)=>{setConferenceFilter(option?.value||"");setPage(1);}} styles={{container:(base)=>({...base,width:"15rem",minWidth:0,maxWidth:"15rem",textAlign:"left"}),control:(base,state)=>({...base,backgroundColor:state.isFocused?"#2d3748":"#1a202c",borderColor:state.isFocused?"#4A90E2":"#4A5568",color:"#fff",width:"15rem",minWidth:"15rem",maxWidth:"15rem",textAlign:"left"}),valueContainer:(base)=>({...base,textAlign:"left"}),input:(base)=>({...base,color:"#fff",textAlign:"left"}),singleValue:(base)=>({...base,color:"#fff",textAlign:"left"}),placeholder:(base)=>({...base,color:"#A0AEC0",textAlign:"left"})}}/></label></Border>
      <Border classes="min-w-0 overflow-hidden" styles={{borderColor:primary}}><div className="overflow-x-auto"><table className="w-full min-w-[1100px] border-collapse text-sm"><thead><tr className="border-b border-slate-500"><th aria-label="Team logo" className="w-14 px-2 py-3"/>{columns.map((column)=><th key={column.key} title={column.title} role="button" tabIndex={0} onClick={()=>sort(column.key)} onKeyDown={(event)=>{if(event.key==="Enter"||event.key===" ")sort(column.key);}} className={`cursor-pointer select-none whitespace-nowrap px-3 py-3 ${column.align==="left"?"text-left":"text-center"}`}>{column.label}{sortKey===column.key?(ascending?" ↑":" ↓"):""}</th>)}</tr></thead><tbody>{visibleRows.map((row,index)=><tr key={`${row.playerId||row.teamId}-${index}`} className="border-b border-slate-700 odd:bg-slate-900/20 even:bg-slate-800/40"><td className="w-14 px-2 py-2"><div className="flex w-10 justify-center"><Logo url={getLaxLogoUrl(String(row.logoFileName||""))} variant="small"/></div></td>{columns.map((column)=><td key={column.key} className={`whitespace-nowrap px-3 py-2 ${column.align==="left"?"text-left":"text-center"}`}>{column.key==="team"?String(row.team||""):column.key==="name"?`${row.firstName||""} ${row.lastName||""}`:(column.format||number)(row[column.key])}</td>)}</tr>)}</tbody></table>{!rows.length&&<div className="p-8 text-center opacity-70">No statistics are available for these filters.</div>}</div>{rows.length>0&&<div className="flex items-center justify-center gap-3 border-t border-slate-600 p-3"><Button size="sm" disabled={page===1} onClick={()=>setPage((current)=>current-1)}>Prev</Button><span>Page {page} of {pageCount}</span><Button size="sm" disabled={page===pageCount} onClick={()=>setPage((current)=>current+1)}>Next</Button></div>}</Border></main>
    </div>}
  </PageContainer>;
};

const SidebarHeader=({color,children}:{color:string;children:string})=><h3 className="mb-2 mt-4 rounded px-3 py-1.5 text-center text-sm font-bold text-white" style={{backgroundColor:color}}>{children}</h3>;
const Choice=({selected,onClick,children}:{selected:boolean;onClick:()=>void;children:string})=><button type="button" onClick={onClick} className={`min-w-16 rounded px-2 py-1 text-xs font-semibold text-white ${selected?"bg-green-600":"bg-slate-600 hover:bg-slate-500"}`}>{children}</button>;
