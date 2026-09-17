import { FormEvent, useEffect, useState } from "react";
import { Border } from "../../_design/Borders";
import { PageContainer } from "../../_design/Container";
import {
  LacrosseAdminService,
  LaxAdmin,
  LaxAdminClaim,
  LaxCoachedTeam,
  LaxBadNoodle,
  LaxScheduledJob,
  LaxScheduleGenerationStatus,
  LaxGameSimulationStatus,
  LaxScheduleRequest,
  LaxConferenceTournamentStatus,
  LaxNationalTournament,
  LaxOffseasonSummary,
  LaxPreseasonStatus,
  LaxAdminCollegeTeam,
  LaxAdminCollegeTeamDirectory,
  LaxAdminCollegeTeamWrite,
  getLaxLogoUrl,
} from "../../_services/lacrosseService";
import { useSimLAXStore } from "../../context/SimLAXContext";
import { RemoveUserModal } from "../AvailableTeams/RemoveUserModal";
import { getLacrosseSeasonYear } from "./lacrosseFormatting";

const detail = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "The SimLAX admin service could not be reached.";

const activityAge = (value?: string) => {
  if (!value) return "No recorded activity";
  const elapsedMs = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return "Just now";
  const hours = Math.floor(elapsedMs / 3_600_000);
  if (hours < 1) return "Less than an hour ago";
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const formatJobRunTime = (value?: string) => {
  if (!value) return "Never";
  const utcValue = /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`;
  return new Date(utcValue).toLocaleString();
};

interface CollegeLacrosseAdminPageProps {
  embedded?: boolean;
}

type AdminTab = "applications" | "users" | "schedules" | "tournaments" | "nationalTournament" | "teams" | "offseason" | "preseason" | "cron" | "admins";

const adminTabs: Array<{ id: AdminTab; label: string }> = [
  { id: "applications", label: "Applications" },
  { id: "cron", label: "Cron" },
  { id: "offseason", label: "Offseason" },
  { id: "preseason", label: "Preseason" },
  { id: "schedules", label: "Schedules" },
  { id: "tournaments", label: "Conference Tournaments" },
  { id: "nationalTournament", label: "National Tournaments" },
  { id: "teams", label: "Teams" },
  { id: "users", label: "Users" },
  { id: "admins", label: "Admins" },
];

const blankTeamForm = (conferenceId = 0): LaxAdminCollegeTeamWrite => ({
  team: "", nickname: "", abbreviation: "", whtLogo: false, city: "", state: "", conferenceId,
  arena: "", colorOne: "#000000", colorTwo: "#FFFFFF", colorThree: "", jerseyStyle: "football",
});

const teamFormFrom = (team: LaxAdminCollegeTeam): LaxAdminCollegeTeamWrite => ({
  team: team.team, nickname: team.nickname, abbreviation: team.abbreviation, whtLogo: team.whtLogo,
  city: team.city, state: team.state === "Ohio" ? "OH" : team.state, conferenceId: team.conferenceId, arena: team.arena || "",
  colorOne: team.colorOne || "#000000", colorTwo: team.colorTwo || "#FFFFFF",
  colorThree: team.colorThree || "", jerseyStyle: team.jerseyStyle || "football",
});

const US_STATE_CODES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

export const CollegeLacrosseAdminPage = ({
  embedded = false,
}: CollegeLacrosseAdminPageProps) => {
  const { laxAdminStatus: access, laxAdminChecked, refreshClaxTeams, refreshClaxTeam } = useSimLAXStore();
  const [claims, setClaims] = useState<LaxAdminClaim[]>([]);
  const [claimBusy, setClaimBusy] = useState<number>();
  const [admins, setAdmins] = useState<LaxAdmin[]>([]);
  const [coachedTeams, setCoachedTeams] = useState<LaxCoachedTeam[]>([]);
  const [badNoodles, setBadNoodles] = useState<LaxBadNoodle[]>([]);
  const [removingTeam, setRemovingTeam] = useState<LaxCoachedTeam>();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [aiJob, setAiJob] = useState<LaxScheduledJob>();
  const [aiRecruitingJob, setAiRecruitingJob] = useState<LaxScheduledJob>();
  const [recruitingSyncJob, setRecruitingSyncJob] = useState<LaxScheduledJob>();
  const [simulateWeekJob, setSimulateWeekJob] = useState<LaxScheduledJob>();
  const [publishResultsJob, setPublishResultsJob] = useState<LaxScheduledJob>();
  const [advanceWeekJob, setAdvanceWeekJob] = useState<LaxScheduledJob>();
  const [jobBusy, setJobBusy] = useState(false);
  const [jobError, setJobError] = useState("");
  const [recruitingJobError, setRecruitingJobError] = useState("");
  const [recruitingSyncError, setRecruitingSyncError] = useState("");
  const [gameAutomationError, setGameAutomationError] = useState("");
  const [scheduleRequests, setScheduleRequests] = useState<LaxScheduleRequest[]>([]);
  const [scheduleRequestBusy, setScheduleRequestBusy] = useState<number>();
  const [scheduleGeneration, setScheduleGeneration] = useState<LaxScheduleGenerationStatus>();
  const [scheduleGenerationBusy, setScheduleGenerationBusy] = useState<1|3>();
  const [scheduleGenerationError, setScheduleGenerationError] = useState("");
  const [gameSimulation, setGameSimulation] = useState<LaxGameSimulationStatus>();
  const [gameSeason, setGameSeason] = useState(1);
  const [gameWeek, setGameWeek] = useState(1);
  const [gameBusy, setGameBusy] = useState<"preflight"|"run"|"publish"|"advance"|"offseason">();
  const [gameNotice, setGameNotice] = useState("");
  const [gameError, setGameError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("applications");
  const [tournaments, setTournaments] = useState<LaxConferenceTournamentStatus>();
  const [selectedConferenceId, setSelectedConferenceId] = useState<number>();
  const [tournamentTeamCount, setTournamentTeamCount] = useState(4);
  const [tournamentTeamIds, setTournamentTeamIds] = useState<number[]>([]);
  const [tournamentNeutralRounds, setTournamentNeutralRounds] = useState<boolean[]>([]);
  const [tournamentBusy, setTournamentBusy] = useState<"save"|"confirm">();
  const [tournamentError, setTournamentError] = useState("");
  const [nationalTournament,setNationalTournament]=useState<LaxNationalTournament>();
  const [nationalTeamCount,setNationalTeamCount]=useState(16);
  const [nationalTeamIds,setNationalTeamIds]=useState<number[]>([]);
  const [nationalNeutralRounds,setNationalNeutralRounds]=useState<boolean[]>([]);
  const [nationalBusy,setNationalBusy]=useState<"save"|"confirm">();
  const [nationalError,setNationalError]=useState("");
  const [offseason,setOffseason]=useState<LaxOffseasonSummary>();
  const [newRecruitCount,setNewRecruitCount]=useState("");
  const [offseasonBusy,setOffseasonBusy]=useState<"skip"|"preview"|"export"|"run"|"graduate"|"enroll"|"remaining"|"walkons"|"cuts"|"rollover">();
  const [offseasonError,setOffseasonError]=useState("");
  const [preseason,setPreseason]=useState<LaxPreseasonStatus>();
  const [preseasonEnabled,setPreseasonEnabled]=useState(true);
  const [preseasonGames,setPreseasonGames]=useState(2);
  const [preseasonBusy,setPreseasonBusy]=useState<"decision"|"generate"|"close"|"complete">();
  const [preseasonError,setPreseasonError]=useState("");
  const [teamDirectory,setTeamDirectory]=useState<LaxAdminCollegeTeamDirectory>();
  const [teamMode,setTeamMode]=useState<"create"|"edit">("edit");
  const [selectedTeamId,setSelectedTeamId]=useState<number>();
  const [teamSearch,setTeamSearch]=useState("");
  const [teamForm,setTeamForm]=useState<LaxAdminCollegeTeamWrite>(blankTeamForm());
  const [teamLogo,setTeamLogo]=useState<File>();
  const [teamBusy,setTeamBusy]=useState(false);
  const [teamNotice,setTeamNotice]=useState("");
  const [teamError,setTeamError]=useState("");
  const [rosterGenerationBusy,setRosterGenerationBusy]=useState(false);

  const refresh = async () => {
    try {
      const [claimRows, adminRows, teamRows, noodleRows, job, recruitingJob, syncJob, simulateJob, publishJob, advanceJob, pendingScheduleRequests, generationStatus, currentGameState, tournamentStatus, nationalStatus, offseasonStatus, preseasonStatus] = await Promise.all([
        LacrosseAdminService.getClaims(),
        LacrosseAdminService.getAdmins(),
        LacrosseAdminService.getCoachedTeams(),
        LacrosseAdminService.getBadNoodles(),
        LacrosseAdminService.getAiLineupJob(),
        LacrosseAdminService.getAiRecruitingJob(),
        LacrosseAdminService.getRecruitingSyncJob(),
        LacrosseAdminService.getSimulateWeekJob(),
        LacrosseAdminService.getPublishResultsJob(),
        LacrosseAdminService.getAdvanceWeekJob(),
        LacrosseAdminService.getScheduleRequests(),
        LacrosseAdminService.getScheduleGenerationStatus(),
        LacrosseAdminService.getGameSimulationStatus(),
        LacrosseAdminService.getConferenceTournaments(),
        LacrosseAdminService.getNationalTournament(),
        LacrosseAdminService.getOffseason(),
        LacrosseAdminService.getPreseason().catch((reason)=>{
          if(detail(reason).toLowerCase().includes("not found"))return null;
          throw reason;
        }),
      ]);
      setClaims(claimRows);
      setAdmins(adminRows);
      setCoachedTeams(teamRows);
      setBadNoodles(noodleRows);
      setAiJob(job);
      setAiRecruitingJob(recruitingJob);
      setRecruitingSyncJob(syncJob);
      setSimulateWeekJob(simulateJob);
      setPublishResultsJob(publishJob);
      setAdvanceWeekJob(advanceJob);
      setScheduleRequests(pendingScheduleRequests);
      setScheduleGeneration(generationStatus);
      setGameSeason(currentGameState.officialSeason);
      setGameWeek(currentGameState.officialWeek);
      setGameSimulation(currentGameState);
      setTournaments(tournamentStatus);
      setNationalTournament(nationalStatus);
      setOffseason(offseasonStatus);
      setPreseason(preseasonStatus||undefined);
      if(preseasonStatus?.decisionMade){setPreseasonEnabled(Boolean(preseasonStatus.enabled));setPreseasonGames(preseasonStatus.gamesPerTeam||1);}
      setSelectedConferenceId((current) => current ?? tournamentStatus.conferences[0]?.conferenceId);
      setError("");
    } catch (reason) {
      setError(detail(reason));
    }
  };

  const runPreseasonAction=async(action:"decision"|"generate"|"close"|"complete")=>{
    setPreseasonBusy(action);setPreseasonError("");
    try{
      const result=action==="decision"?await LacrosseAdminService.decidePreseason(preseasonEnabled,preseasonEnabled?preseasonGames:0):action==="generate"?await LacrosseAdminService.generateRemainingPreseason():action==="close"?await LacrosseAdminService.closePreseason():await LacrosseAdminService.completePreseason();
      setPreseason(result);
    }catch(reason){setPreseasonError(detail(reason));}finally{setPreseasonBusy(undefined);}
  };

  useEffect(() => {
    if (laxAdminChecked && access?.isAdmin) void refresh();
  }, [laxAdminChecked, access?.isAdmin]);

  const loadTeamDirectory = async () => {
    const result = await LacrosseAdminService.getCollegeTeams();
    setTeamDirectory(result);
    return result;
  };

  useEffect(() => {
    if (!access || activeTab !== "teams") return;
    void loadTeamDirectory().catch((reason) => setTeamError(detail(reason)));
  }, [access, activeTab]);

  const selectTeamForEditing = (teamId: number) => {
    const team = teamDirectory?.teams.find((row) => row.id === teamId);
    if (!team) return;
    setTeamMode("edit"); setSelectedTeamId(team.id); setTeamSearch(`${team.team} · ${team.abbreviation}`); setTeamForm(teamFormFrom(team));
    setTeamLogo(undefined); setTeamNotice(""); setTeamError("");
  };

  const startTeamCreate = () => {
    setTeamMode("create"); setSelectedTeamId(undefined); setTeamSearch("");
    setTeamForm(blankTeamForm(teamDirectory?.conferences[0]?.id || 0));
    setTeamLogo(undefined); setTeamNotice(""); setTeamError("");
  };

  const saveTeam = async (event: FormEvent) => {
    event.preventDefault();
    setTeamBusy(true); setTeamNotice(""); setTeamError("");
    try {
      const saved = teamMode === "create"
        ? await LacrosseAdminService.createCollegeTeam(teamForm)
        : await LacrosseAdminService.updateCollegeTeam(selectedTeamId!, teamForm);
      if (teamLogo) {
        const imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("The logo could not be read."));
          reader.onerror = () => reject(new Error("The logo could not be read."));
          reader.readAsDataURL(teamLogo);
        });
        await LacrosseAdminService.uploadCollegeTeamLogo(saved.id, imageBase64);
      }
      const directory = await loadTeamDirectory();
      void refreshClaxTeams();
      void refreshClaxTeam();
      const updated = directory.teams.find((row) => row.id === saved.id) || saved;
      setTeamMode("edit"); setSelectedTeamId(saved.id); setTeamSearch(`${updated.team} · ${updated.abbreviation}`); setTeamForm(teamFormFrom(updated)); setTeamLogo(undefined);
      setTeamNotice(teamLogo ? "Team saved and logo uploaded." : "Team saved.");
    } catch (reason) { setTeamError(detail(reason)); }
    finally { setTeamBusy(false); }
  };

  const generateTeamRoster = async () => {
    const team = teamDirectory?.teams.find((row) => row.id === selectedTeamId);
    if (!team || team.rosterCount > 0 || rosterGenerationBusy) return;
    if (!window.confirm(`Generate a complete 48-player, AI-controlled roster for ${team.team}? Every player will be randomly rated at one or two stars. This cannot be regenerated from this screen.`)) return;
    setRosterGenerationBusy(true); setTeamNotice(""); setTeamError("");
    try {
      const result = await LacrosseAdminService.generateCollegeTeamRoster(team.id);
      await loadTeamDirectory();
      setTeamNotice(`${result.playerCount}-player roster created: ${result.oneStarPlayers} one-star and ${result.twoStarPlayers} two-star players.`);
    } catch (reason) { setTeamError(detail(reason)); }
    finally { setRosterGenerationBusy(false); }
  };

  const selectedTournament = tournaments?.conferences.find((conference)=>conference.conferenceId===selectedConferenceId);
  const selectedAdminTeam = teamDirectory?.teams.find((team)=>team.id===selectedTeamId);
  useEffect(()=>{
    if(!selectedTournament)return;
    setTournamentTeamCount(selectedTournament.teamCount);
    setTournamentTeamIds(selectedTournament.teams.filter((team)=>team.seed).sort((a,b)=>(a.seed||0)-(b.seed||0)).map((team)=>team.teamId));
    setTournamentNeutralRounds(selectedTournament.rounds.map((round)=>round.isNeutral));
    setTournamentError("");
  },[selectedTournament?.conferenceId,selectedTournament?.confirmed]);

  const selectTournamentTeam=(teamId:number)=>{
    if(selectedTournament?.confirmed)return;
    setTournamentTeamIds((current)=>current.includes(teamId)?current.filter((id)=>id!==teamId):current.length<tournamentTeamCount?[...current,teamId]:current);
  };
  const moveTournamentTeam=(index:number,direction:-1|1)=>setTournamentTeamIds((current)=>{
    const target=index+direction;
    if(target<0||target>=current.length)return current;
    const next=[...current]; [next[index],next[target]]=[next[target],next[index]]; return next;
  });
  const changeTournamentSize=(count:number)=>{
    setTournamentTeamCount(count);
    setTournamentTeamIds((current)=>{
      if(current.length>=count)return current.slice(0,count);
      const available=(selectedTournament?.teams||[]).map((team)=>team.teamId).filter((id)=>!current.includes(id));
      return [...current,...available.slice(0,count-current.length)];
    });
    setTournamentNeutralRounds(Array.from({length:Math.ceil(Math.log2(count))},()=>true));
  };
  const persistTournament=async(confirm:boolean)=>{
    if(!selectedTournament||tournamentTeamIds.length!==tournamentTeamCount)return;
    if(confirm&&!window.confirm(`Confirm the ${selectedTournament.conferenceName} tournament field and create its Week 15 games?`))return;
    setTournamentBusy(confirm?"confirm":"save"); setTournamentError("");
    try{
      const result=confirm
        ?await LacrosseAdminService.confirmConferenceTournament(selectedTournament.conferenceId,tournamentTeamCount,tournamentTeamIds,tournamentNeutralRounds)
        :await LacrosseAdminService.saveConferenceTournament(selectedTournament.conferenceId,tournamentTeamCount,tournamentTeamIds,tournamentNeutralRounds);
      setTournaments(result);
    }catch(reason){setTournamentError(detail(reason));}
    finally{setTournamentBusy(undefined);}
  };
  useEffect(()=>{
    if(!nationalTournament)return;
    setNationalTeamCount(nationalTournament.teamCount);
    setNationalTeamIds(nationalTournament.teams.filter((team)=>team.seed).sort((a,b)=>(a.seed||0)-(b.seed||0)).map((team)=>team.teamId));
    setNationalNeutralRounds(nationalTournament.rounds.map((round)=>round.isNeutral));
    setNationalError("");
  },[nationalTournament]);
  useEffect(()=>{
    if(!access||activeTab!=="nationalTournament")return;
    let cancelled=false;
    LacrosseAdminService.getNationalTournament()
      .then((result)=>{if(!cancelled)setNationalTournament(result);})
      .catch((reason)=>{if(!cancelled)setNationalError(detail(reason));});
    return()=>{cancelled=true;};
  },[access,activeTab]);
  const selectNationalTeam=(teamId:number)=>{
    if(nationalTournament?.confirmed)return;
    const team=nationalTournament?.teams.find((row)=>row.teamId===teamId);
    if(team?.automaticQualifier)return;
    setNationalTeamIds((current)=>current.includes(teamId)?current.filter((id)=>id!==teamId):current.length<nationalTeamCount?[...current,teamId]:current);
  };
  const moveNationalTeam=(index:number,direction:-1|1)=>setNationalTeamIds((current)=>{
    const target=index+direction;if(target<0||target>=current.length)return current;
    const next=[...current];[next[index],next[target]]=[next[target],next[index]];return next;
  });
  const changeNationalSize=(count:number)=>{
    setNationalTeamCount(count);
    setNationalTeamIds((current)=>{
      const automatic=(nationalTournament?.teams||[]).filter((team)=>team.automaticQualifier).map((team)=>team.teamId);
      const retained=[...automatic,...current.filter((id)=>!automatic.includes(id))].slice(0,count);
      const available=(nationalTournament?.teams||[]).map((team)=>team.teamId).filter((id)=>!retained.includes(id));
      return [...retained,...available.slice(0,count-retained.length)];
    });
    setNationalNeutralRounds(Array.from({length:Math.ceil(Math.log2(count))},()=>true));
  };
  const persistNationalTournament=async(confirm:boolean)=>{
    if(!nationalTournament||nationalTeamIds.length!==nationalTeamCount)return;
    if(confirm&&!window.confirm(`Confirm the ${nationalTeamCount}-team national tournament field and create the first-round games?`))return;
    setNationalBusy(confirm?"confirm":"save");setNationalError("");
    try{
      const result=confirm?await LacrosseAdminService.confirmNationalTournament(nationalTeamCount,nationalTeamIds,nationalNeutralRounds):await LacrosseAdminService.saveNationalTournament(nationalTeamCount,nationalTeamIds,nationalNeutralRounds);
      setNationalTournament(result);
      if(confirm)setGameSimulation(await LacrosseAdminService.getGameSimulationStatus(gameSeason,gameWeek));
    }catch(reason){setNationalError(detail(reason));}finally{setNationalBusy(undefined);}
  };

  useEffect(() => {
    if (!access || (activeTab !== "cron" && activeTab !== "preseason")) return;
    let cancelled = false;
    const load = async () => {
      try {
        const result = await LacrosseAdminService.getGameSimulationStatus(gameSeason, gameWeek, activeTab==="preseason"?"preseason":"regular_season");
        if (!cancelled) {
          setGameSimulation(result);
          setGameError("");
        }
      } catch (reason) {
        if (!cancelled) setGameError(detail(reason));
      }
    };
    void load();
    const timer = window.setInterval(() => {
      if (gameSimulation?.running) void load();
    }, 3000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [access, activeTab, gameSeason, gameWeek, gameSimulation?.running]);

  const preflightGameWeek = async () => {
    setGameBusy("preflight"); setGameError("");
    try { setGameSimulation(await LacrosseAdminService.preflightGameWeek(gameSeason, gameWeek, activeTab==="preseason"?"preseason":"regular_season")); }
    catch (reason) { setGameError(detail(reason)); }
    finally { setGameBusy(undefined); }
  };

  const runGameWeek = async () => {
    if (!window.confirm(`Simulate every Scheduled game in Season ${gameSeason}, Week ${gameWeek}? Results will remain hidden until they are published.`)) return;
    setGameBusy("run"); setGameError("");
    try { setGameSimulation(await LacrosseAdminService.runGameWeek(gameSeason, gameWeek, activeTab==="preseason"?"preseason":"regular_season")); }
    catch (reason) { setGameError(detail(reason)); }
    finally { setGameBusy(undefined); }
  };

  const publishGameWeek = async () => {
    if (!window.confirm(`Publish all simulated results for Season ${gameSeason}, Week ${gameWeek}? Scores, standings, and box scores will become public.`)) return;
    setGameBusy("publish"); setGameError("");
    try { setGameSimulation(await LacrosseAdminService.publishGameWeek(gameSeason, gameWeek, activeTab==="preseason"?"preseason":"regular_season")); }
    catch (reason) { setGameError(detail(reason)); }
    finally { setGameBusy(undefined); }
  };

  const advanceGameWeek = async () => {
    if (!window.confirm(`Advance the official CLAX calendar from Week ${gameWeek} to Week ${gameWeek+1}?`)) return;
    setGameBusy("advance"); setGameError(""); setGameNotice("");
    try {
      const result=await LacrosseAdminService.advanceGameWeek(gameSeason,gameWeek);
      setGameNotice(result.message); setGameWeek(result.week); setGameSimulation(undefined);
      setNationalTournament(await LacrosseAdminService.getNationalTournament());
      if(result.offseason)setOffseason(await LacrosseAdminService.getOffseason());
    } catch (reason) { setGameError(detail(reason)); }
    finally { setGameBusy(undefined); }
  };

  const endGameSeason = async () => {
    if (!window.confirm(`End the ${getLacrosseSeasonYear(gameSeason)} season and enter the offseason?`)) return;
    setGameBusy("offseason"); setGameError(""); setGameNotice("");
    try {
      const result=await LacrosseAdminService.endGameSeason(gameSeason,gameWeek);
      setGameNotice(result.message); setGameSimulation(undefined);
      setOffseason(await LacrosseAdminService.getOffseason());
    } catch (reason) { setGameError(detail(reason)); }
    finally { setGameBusy(undefined); }
  };

  const skipOffseasonPhase=async()=>{
    if(!offseason||offseasonBusy)return;
    const label=offseason.phase==="transfer_portal"?"Transfer Portal":"Early Declarations";
    if(!window.confirm(`Skip ${label} for Season ${getLacrosseSeasonYear(offseason.season)}?`))return;
    setOffseasonBusy("skip");setOffseasonError("");
    try{setOffseason(await LacrosseAdminService.skipOffseasonPhase());}
    catch(reason){setOffseasonError(detail(reason));}finally{setOffseasonBusy(undefined);}
  };
  const previewPlayerProgressions=async()=>{
    setOffseasonBusy("preview");setOffseasonError("");
    try{setOffseason(await LacrosseAdminService.previewProgressions());}
    catch(reason){setOffseasonError(detail(reason));}finally{setOffseasonBusy(undefined);}
  };
  const exportPlayerProgressionPreview=async()=>{
    setOffseasonBusy("export");setOffseasonError("");
    try{await LacrosseAdminService.exportProgressionPreview();}
    catch(reason){setOffseasonError(detail(reason));}finally{setOffseasonBusy(undefined);}
  };
  const runPlayerProgressions=async()=>{
    if(!offseason||!window.confirm(`Run and permanently apply Season ${getLacrosseSeasonYear(offseason.season)} player progressions? This can only run once.`))return;
    setOffseasonBusy("run");setOffseasonError("");
    try{setOffseason(await LacrosseAdminService.runProgressions());}
    catch(reason){setOffseasonError(detail(reason));}finally{setOffseasonBusy(undefined);}
  };
  const runGraduations=async()=>{
    if(!offseason||!window.confirm(`Graduate ${offseason.graduationCount} year-6 players? They will be moved out of college_players and into the professional draft-eligible pool, and removed from all college lineups.`))return;
    setOffseasonBusy("graduate");setOffseasonError("");
    try{setOffseason(await LacrosseAdminService.runGraduations());}
    catch(reason){setOffseasonError(detail(reason));}finally{setOffseasonBusy(undefined);}
  };
  const runRecruitEnrollment=async()=>{
    if(!offseason||!window.confirm(`Enroll ${offseason.enrollmentCount} committed recruits as freshmen? Their recruiting records will be archived and they will be removed from the active recruit pool.`))return;
    setOffseasonBusy("enroll");setOffseasonError("");
    try{setOffseason(await LacrosseAdminService.runRecruitEnrollment());}
    catch(reason){setOffseasonError(detail(reason));}finally{setOffseasonBusy(undefined);}
  };
  const runWalkonGeneration=async()=>{
    if(!offseason||!window.confirm(`Generate ${offseason.walkonsNeeded} walk-ons for ${offseason.underLimitTeams} under-limit teams? This will permanently add enough freshmen to bring each NCAA roster to 48 players.`))return;
    setOffseasonBusy("walkons");setOffseasonError("");
    try{setOffseason(await LacrosseAdminService.runWalkonGeneration());}
    catch(reason){setOffseasonError(detail(reason));}finally{setOffseasonBusy(undefined);}
  };
  const runRemainingRecruitAssignment=async()=>{
    if(!offseason||!window.confirm(`Replace existing generated walk-ons and assign up to ${offseason.remainingRecruitSlots} unsigned recruits to teams with roster space? Teams that previously assigned points to a recruit receive priority.`))return;
    setOffseasonBusy("remaining");setOffseasonError("");
    try{setOffseason(await LacrosseAdminService.runRemainingRecruitAssignment());}
    catch(reason){setOffseasonError(detail(reason));}finally{setOffseasonBusy(undefined);}
  };
  const runRosterCuts=async()=>{
    if(!offseason||!window.confirm("Cut the lowest-overall players from every AI-coached roster above 48 players? User-coached teams will remain listed until their coaches make their own cuts."))return;
    setOffseasonBusy("cuts");setOffseasonError("");
    try{setOffseason(await LacrosseAdminService.runRosterCuts());}
    catch(reason){setOffseasonError(detail(reason));}finally{setOffseasonBusy(undefined);}
  };
  const startNewSeason=async()=>{
    const recruitCount=Number(newRecruitCount);
    if(!offseason||!/^[1-9]\d{2,3}$/.test(newRecruitCount)){setOffseasonError("Recruit count must be a 3- or 4-digit integer.");return;}
    if(!window.confirm(`Start the ${getLacrosseSeasonYear(offseason.season+1)} season? This will remove ${offseason.leftoverRecruits} unsigned recruits from the old class, generate ${recruitCount} new recruits, and advance the official season. This can only run once.`))return;
    setOffseasonBusy("rollover");setOffseasonError("");
    try{const result=await LacrosseAdminService.startNewSeason(recruitCount);window.alert(result.message);await refresh();}
    catch(reason){setOffseasonError(detail(reason));}finally{setOffseasonBusy(undefined);}
  };

  const decide = async (id: number, approve: boolean) => {
    if (claimBusy !== undefined) return;
    setClaimBusy(id);
    setError("");
    try {
      if (approve) await LacrosseAdminService.approve(id);
      else await LacrosseAdminService.reject(id);
      if (approve) {
        void refreshClaxTeams();
        void refreshClaxTeam();
      }
      // Remove the completed application immediately, then refresh only the
      // data affected by this decision. A failure in an unrelated admin panel
      // must not leave a successfully handled application visible.
      setClaims((current) => current.filter((claim) => claim.id !== id));
      const [claimRows, teamRows, noodleRows] = await Promise.all([
        LacrosseAdminService.getClaims(),
        LacrosseAdminService.getCoachedTeams(),
        LacrosseAdminService.getBadNoodles(),
      ]);
      setClaims(claimRows);
      setCoachedTeams(teamRows);
      setBadNoodles(noodleRows);
    } catch (reason) {
      setError(detail(reason));
    } finally {
      setClaimBusy(undefined);
    }
  };

  const decideScheduleRequest = async (id:number, approve:boolean) => {
    setScheduleRequestBusy(id);
    try {
      if(approve) await LacrosseAdminService.approveScheduleRequest(id);
      else await LacrosseAdminService.denyScheduleRequest(id);
      await refresh();
    } catch(reason) {
      setError(detail(reason));
    } finally {
      setScheduleRequestBusy(undefined);
    }
  };

  const runScheduleStage = async (stage:1|3) => {
    if(scheduleGenerationBusy)return;
    setScheduleGenerationBusy(stage);
    setScheduleGenerationError("");
    try {
      const result=stage===1
        ?await LacrosseAdminService.runScheduleStage1()
        :await LacrosseAdminService.runScheduleStage3();
      setScheduleGeneration(result);
      await refresh();
    } catch(reason) {
      setScheduleGenerationError(detail(reason));
    } finally {
      setScheduleGenerationBusy(undefined);
    }
  };

  const add = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await LacrosseAdminService.designate(email);
      setEmail("");
      await refresh();
    } catch (reason) {
      setError(detail(reason));
    }
  };

  const removeAdmin = async (admin: LaxAdmin) => {
    try {
      await LacrosseAdminService.removeAdmin(admin.id);
      await refresh();
    } catch (reason) {
      setError(detail(reason));
    }
  };

  const removeCoach = async () => {
    if (!removingTeam) return;
    try {
      await LacrosseAdminService.removeCoach(removingTeam.teamId);
      void refreshClaxTeams();
      void refreshClaxTeam();
      setRemovingTeam(undefined);
      await refresh();
    } catch (reason) {
      setError(detail(reason));
    }
  };

  const toggleAiJob = async () => {
    if (!aiJob || jobBusy) return;
    setJobBusy(true);
    setJobError("");
    try {
      setAiJob(await LacrosseAdminService.setAiLineupJob(!aiJob.enabled));
    } catch (reason) {
      setJobError(detail(reason));
    } finally {
      setJobBusy(false);
    }
  };

  const runAiJob = async () => {
    if (jobBusy) return;
    setJobBusy(true);
    setJobError("");
    try {
      const result = await LacrosseAdminService.runAiLineupJob();
      setAiJob(result);
      if (result.lastStatus === "failed") setJobError(result.lastMessage || "The AI lineup job failed.");
    } catch (reason) {
      setJobError(detail(reason));
    } finally {
      setJobBusy(false);
    }
  };

  const toggleAiRecruitingJob = async () => {
    if (!aiRecruitingJob || jobBusy) return;
    setJobBusy(true);
    setRecruitingJobError("");
    try {
      setAiRecruitingJob(await LacrosseAdminService.setAiRecruitingJob(!aiRecruitingJob.enabled));
    } catch (reason) {
      setRecruitingJobError(detail(reason));
    } finally {
      setJobBusy(false);
    }
  };

  const runAiRecruitingJob = async () => {
    if (jobBusy) return;
    setJobBusy(true);
    setRecruitingJobError("");
    try {
      const result = await LacrosseAdminService.runAiRecruitingJob();
      setAiRecruitingJob(result);
      if (result.lastStatus === "failed") setRecruitingJobError(result.lastMessage || "The AI recruiting job failed.");
    } catch (reason) {
      setRecruitingJobError(detail(reason));
    } finally {
      setJobBusy(false);
    }
  };

  const toggleRecruitingSyncJob = async () => {
    if (!recruitingSyncJob || jobBusy) return;
    setJobBusy(true);
    setRecruitingSyncError("");
    try {
      setRecruitingSyncJob(await LacrosseAdminService.setRecruitingSyncJob(!recruitingSyncJob.enabled));
    } catch (reason) {
      setRecruitingSyncError(detail(reason));
    } finally {
      setJobBusy(false);
    }
  };

  const runRecruitingSyncJob = async () => {
    if (jobBusy) return;
    setJobBusy(true);
    setRecruitingSyncError("");
    try {
      const result = await LacrosseAdminService.runRecruitingSyncJob();
      setRecruitingSyncJob(result);
      if (result.lastStatus === "failed") setRecruitingSyncError(result.lastMessage || "The weekly recruiting sync failed.");
    } catch (reason) {
      setRecruitingSyncError(detail(reason));
    } finally {
      setJobBusy(false);
    }
  };

  const toggleGameAutomationJob = async (
    job: LaxScheduledJob | undefined,
    save: (enabled: boolean) => Promise<LaxScheduledJob>,
    update: (job: LaxScheduledJob) => void,
  ) => {
    if (!job || jobBusy) return;
    setJobBusy(true);
    setGameAutomationError("");
    try {
      update(await save(!job.enabled));
    } catch (reason) {
      setGameAutomationError(detail(reason));
    } finally {
      setJobBusy(false);
    }
  };

  const tournamentAdvanceBlock=gameWeek===14&&!tournaments?.allConfirmed
    ?"Week 15 is locked until every conference tournament is confirmed."
    :nationalTournament?.selectionReady&&!nationalTournament.confirmed
      ?`Week ${gameWeek+1} is locked until the National Tournament field is confirmed.`
      :"";
  const canEndSeason=Boolean(gameSimulation?.canEndSeason)&&gameSimulation?.officialSeason===gameSeason&&gameSimulation?.officialWeek===gameWeek;
  const advanceWeekDisabled=Boolean(gameBusy)||Boolean(gameSimulation?.running)||Boolean(gameSimulation?.officialOffseason)||canEndSeason||gameSimulation?.officialSeason!==gameSeason||gameSimulation?.officialWeek!==gameWeek||!gameSimulation?.finalGames||Boolean(gameSimulation?.scheduledGames)||Boolean(gameSimulation?.simulatedGames)||Boolean(tournamentAdvanceBlock);
  const gameWeekOptionCount=Math.max(20,gameWeek,gameSimulation?.officialWeek||1);
  const nationalTournamentSizes=Array.from({length:Math.max(1,(nationalTournament?.teams.length||4)-3)},(_,index)=>index+4);
  const conferenceConfirmationBlocked=!gameSimulation||gameSimulation.officialWeek!==14||Boolean(gameSimulation.scheduledGames)||Boolean(gameSimulation.simulatedGames)||!gameSimulation.finalGames;
  const preseasonSchedulingOpen=preseason?.phase==="preseason_scheduling"&&!preseason.schedulingClosed;
  const preseasonDecisionLocked=!preseasonSchedulingOpen||Boolean(preseason?.scheduledGames)||Boolean(preseason?.pendingRequests);
  const conferenceConfirmationMessage=gameSimulation?.officialWeek!==14
    ?"Conference tournaments can only be confirmed during Week 14."
    :gameSimulation?.scheduledGames
      ?`Week 14 must be simulated and published first. ${gameSimulation.scheduledGames} game${gameSimulation.scheduledGames===1?" is":"s are"} still scheduled.`
      :gameSimulation?.simulatedGames
        ?`Week 14 results must be published first. ${gameSimulation.simulatedGames} game${gameSimulation.simulatedGames===1?" is":"s are"} awaiting publication.`
        :!gameSimulation?.finalGames?"Week 14 has no published results yet.":"";

  const content = (
    <>
      {error && <Border classes="p-4 mb-4 text-red-600">{error}</Border>}
      {access && (
        <>
          <Border classes="p-4 mb-4">
            <strong>{access.role === "super_admin" ? "Super Admin" : "Admin"}</strong>
            <div className="text-sm opacity-70">
              Operational access: team requests, CRON jobs, manual games, and designated scripts.
            </div>
          </Border>
          <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-600" role="tablist" aria-label="SimCLAX admin sections">
            {adminTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-4 py-3 font-semibold transition-colors ${activeTab === tab.id ? "border-[#fcd53f] text-[#fcd53f]" : "border-transparent opacity-70 hover:opacity-100"}`}
              >
                {tab.label}
                {tab.id === "applications" && claims.length > 0 && <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">{claims.length}</span>}
                {tab.id === "users" && badNoodles.length > 0 && <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">{badNoodles.length}</span>}
                {tab.id === "schedules" && scheduleRequests.length > 0 && <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs text-black">{scheduleRequests.length}</span>}
              </button>
            ))}
          </div>
          {activeTab === "teams" && <Border classes="p-4 mb-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-slate-600 pb-4">
              <div><h2 className="text-xl font-semibold">College Teams</h2><p className="text-sm opacity-70">Create a team with database defaults for every unlisted field, or edit a team’s identity, conference, colors, and logo.</p></div>
              <div className="flex gap-2"><button type="button" onClick={startTeamCreate} className={`rounded px-4 py-2 font-semibold ${teamMode==="create"?"bg-green-600 text-white":"bg-slate-700"}`}>Create Team</button><button type="button" disabled={!teamDirectory?.teams.length} onClick={()=>teamDirectory?.teams[0]&&selectTeamForEditing(teamDirectory.teams[0].id)} className={`rounded px-4 py-2 font-semibold ${teamMode==="edit"?"bg-blue-600 text-white":"bg-slate-700"}`}>Edit Team</button></div>
            </div>
            {access.role!=="super_admin" ? <p className="rounded border border-amber-600 bg-amber-950/30 p-3 text-amber-200">Only a Super Admin can create or change teams.</p> : !teamDirectory ? <p>Loading teams…</p> : <form onSubmit={(event)=>void saveTeam(event)} className="space-y-5">
              {teamMode==="edit" && <label className="block max-w-xl font-semibold">Team to edit<input list="college-team-options" value={teamSearch} placeholder="Search by team name or abbreviation" onChange={(event)=>{const value=event.target.value;setTeamSearch(value);const team=teamDirectory.teams.find((row)=>`${row.team} · ${row.abbreviation}`===value);if(team)selectTeamForEditing(team.id);}} className="mt-1 block w-full rounded border border-slate-500 bg-slate-950 px-3 py-2 font-normal"/><datalist id="college-team-options">{teamDirectory.teams.map((team)=><option key={team.id} value={`${team.team} · ${team.abbreviation}`}/>)}</datalist></label>}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <label className="font-semibold">Team<input required value={teamForm.team} onChange={(event)=>setTeamForm({...teamForm,team:event.target.value})} className="mt-1 block w-full rounded border border-slate-500 bg-slate-950 px-3 py-2 font-normal" /></label>
                <label className="font-semibold">Nickname<input required value={teamForm.nickname} onChange={(event)=>setTeamForm({...teamForm,nickname:event.target.value})} className="mt-1 block w-full rounded border border-slate-500 bg-slate-950 px-3 py-2 font-normal" /></label>
                <label className="font-semibold">Abbreviation<input required maxLength={10} value={teamForm.abbreviation} onChange={(event)=>setTeamForm({...teamForm,abbreviation:event.target.value})} className="mt-1 block w-full rounded border border-slate-500 bg-slate-950 px-3 py-2 font-normal" /></label>
                <label className="font-semibold">City<input required value={teamForm.city} onChange={(event)=>setTeamForm({...teamForm,city:event.target.value})} className="mt-1 block w-full rounded border border-slate-500 bg-slate-950 px-3 py-2 font-normal" /></label>
                <label className="font-semibold">State<select required value={teamForm.state} onChange={(event)=>setTeamForm({...teamForm,state:event.target.value})} className="mt-1 block w-full rounded border border-slate-500 bg-slate-950 px-3 py-2 font-normal"><option value="" disabled>Select a state</option>{US_STATE_CODES.map((state)=><option key={state} value={state}>{state}</option>)}</select></label>
                <label className="font-semibold">Conference<select required value={teamForm.conferenceId||""} onChange={(event)=>setTeamForm({...teamForm,conferenceId:Number(event.target.value)})} className="mt-1 block w-full rounded border border-slate-500 bg-slate-950 px-3 py-2 font-normal"><option value="" disabled>Select a conference</option>{teamDirectory.conferences.map((conference)=><option key={conference.id} value={conference.id}>{conference.name} · {conference.abbreviation}</option>)}</select></label>
                <label className="font-semibold md:col-span-2">Arena<input required value={teamForm.arena} onChange={(event)=>setTeamForm({...teamForm,arena:event.target.value})} className="mt-1 block w-full rounded border border-slate-500 bg-slate-950 px-3 py-2 font-normal" /></label>
                <label className="font-semibold">Jersey Style<input required value={teamForm.jerseyStyle} onChange={(event)=>setTeamForm({...teamForm,jerseyStyle:event.target.value})} className="mt-1 block w-full rounded border border-slate-500 bg-slate-950 px-3 py-2 font-normal" /></label>
                {[{label:"Color One",key:"colorOne" as const,required:true},{label:"Color Two",key:"colorTwo" as const,required:true},{label:"Color Three",key:"colorThree" as const,required:false}].map(({label,key,required})=><label key={key} className="font-semibold">{label}{!required&&<span className="font-normal opacity-70"> (optional)</span>}<span className="mt-1 flex items-center gap-2 rounded border border-slate-500 bg-slate-950 px-2 py-1"><input type="color" required={required} value={teamForm[key]||"#000000"} onChange={(event)=>setTeamForm({...teamForm,[key]:event.target.value})} className="h-8 w-12 cursor-pointer bg-transparent"/><span className="font-mono text-sm font-normal">{teamForm[key]||"None"}</span></span></label>)}
              </div>
              <div className="rounded border border-slate-600 p-4"><div className="flex flex-wrap items-center gap-4"><div><h3 className="font-semibold">Team logo</h3><p className="text-sm opacity-70">PNG only, up to 5 MB. It will be saved as <code>{teamForm.team || "Team"}{teamForm.whtLogo?"_WHT":""}.png</code>.</p></div><label className="flex items-center gap-3 font-semibold">White logo version<button type="button" role="switch" aria-checked={teamForm.whtLogo} onClick={()=>setTeamForm({...teamForm,whtLogo:!teamForm.whtLogo})} className={`relative h-6 w-11 rounded-full ${teamForm.whtLogo?"bg-green-600":"bg-slate-600"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${teamForm.whtLogo?"left-6":"left-1"}`}/></button><span className="text-sm font-normal opacity-75">{teamForm.whtLogo?"Yes · _WHT":"No"}</span></label>{teamMode==="edit"&&selectedTeamId&&<img src={getLaxLogoUrl(`${teamForm.team}${teamForm.whtLogo?"_WHT":""}.png`)} alt="Current team logo" className="h-14 w-14 object-contain"/>}<input type="file" accept="image/png" onChange={(event)=>setTeamLogo(event.target.files?.[0])} className="text-sm" /></div>{teamLogo&&<p className="mt-2 text-sm text-green-300">Ready to upload: {teamLogo.name}</p>}</div>
              {teamMode==="edit"&&selectedAdminTeam&&<div className="rounded border border-slate-600 p-4"><h3 className="font-semibold">Starting roster</h3><p className="mt-1 text-sm opacity-70">{selectedAdminTeam.rosterCount===0?"This team has no players yet.":`${selectedAdminTeam.rosterCount} player${selectedAdminTeam.rosterCount===1?"":"s"} already assigned.`}</p>{selectedAdminTeam.rosterCount===0&&<button type="button" disabled={rosterGenerationBusy} onClick={()=>void generateTeamRoster()} className="mt-3 rounded bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700 disabled:opacity-50">{rosterGenerationBusy?"Generating roster…":"Generate 1–2 Star Roster"}</button>}<p className="mt-2 text-xs opacity-60">Generation creates 48 players, a complete AI lineup, and a default gameplan. It never overwrites an existing roster.</p></div>}
              <div className="flex flex-wrap items-center gap-3"><button type="submit" disabled={teamBusy || (teamMode==="edit"&&!selectedTeamId)} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{teamBusy?"Saving…":teamMode==="create"?"Create Team":"Save Team"}</button>{teamMode==="edit"&&<button type="button" onClick={startTeamCreate} className="rounded bg-slate-700 px-4 py-2 font-semibold">Create Another Team</button>}</div>
              {teamNotice&&<p className="rounded border border-green-700 bg-green-950/30 p-3 text-green-300">{teamNotice}</p>}{teamError&&<p className="rounded border border-red-700 bg-red-950/30 p-3 text-red-300">{teamError}</p>}
            </form>}
          </Border>}
          {activeTab === "users" && <Border classes="p-4 mb-6">
            <section className="mb-6">
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-xl font-semibold">Bad Noodles</h2>
                {badNoodles.length > 0 && <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-sm font-bold text-white">{badNoodles.length}</span>}
              </div>
              {badNoodles.length === 0 ? <p className="rounded border border-green-700 bg-green-950/30 p-3 text-green-300">No coached teams currently need attention.</p> : (
                <div className="overflow-x-auto rounded border border-red-800">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-red-950/40"><tr><th className="p-3 text-left">Team</th><th className="p-3 text-left">Coach</th><th className="p-3 text-left">Why they need attention</th><th className="p-3 text-left">Last recorded activity</th><th className="p-3 text-center">Action</th></tr></thead>
                    <tbody>{badNoodles.map((noodle)=><tr key={noodle.teamId} className="border-t border-slate-700 align-top"><td className="p-3 font-semibold">{noodle.teamName} | {noodle.abbreviation}</td><td className="p-3"><div>{noodle.coach}</div>{noodle.email&&<div className="opacity-70">{noodle.email}</div>}</td><td className="p-3"><ul className="list-disc space-y-1 pl-5">{noodle.reasons.map((reason)=><li key={reason}>{reason}</li>)}</ul></td><td className="p-3"><div>{activityAge(noodle.lastActivityAt)}</div>{noodle.lastRecruitingActivityAt&&<div className="mt-1 opacity-70">Recruiting: {activityAge(noodle.lastRecruitingActivityAt)}</div>}</td><td className="p-3 text-center"><button className="rounded bg-red-700 px-3 py-2 font-semibold text-white hover:bg-red-800" type="button" onClick={()=>setRemovingTeam(coachedTeams.find((team)=>team.teamId===noodle.teamId))}>Remove Coach</button></td></tr>)}</tbody>
                  </table>
                </div>
              )}
            </section>
            <h2 className="mb-3 border-t border-slate-600 pt-5 text-xl font-semibold">All coached teams</h2>
            {coachedTeams.length === 0 ? (
              <p>No teams currently have an approved coach.</p>
            ) : (
              coachedTeams.map((team) => (
                <div key={team.teamId} className="flex items-center justify-between gap-3 border-t py-3">
                  <div>
                    <strong>{team.teamName}</strong>
                    <div className="text-sm opacity-70">Coach: {team.coach}</div>
                    <div className="text-sm opacity-70">Last active: {activityAge(team.lastActivityAt)}</div>
                  </div>
                  <button
                    className="rounded bg-red-700 px-4 py-2 text-white hover:bg-red-800"
                    type="button"
                    onClick={() => setRemovingTeam(team)}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </Border>}
          {activeTab === "tournaments" && tournaments && <Border classes="p-4 mb-6">
            {conferenceConfirmationBlocked&&<div className="mb-4 rounded border border-amber-600 bg-amber-950/30 p-3 text-sm text-amber-300">{conferenceConfirmationMessage}</div>}
            <div className="flex flex-wrap gap-2 border-b border-slate-600 pb-4">
              {tournaments.conferences.map((conference)=><button key={conference.conferenceId} type="button" onClick={()=>setSelectedConferenceId(conference.conferenceId)} className={`flex items-center gap-2 rounded px-3 py-2 font-semibold ${conference.conferenceId===selectedConferenceId?"bg-blue-600 text-white":"bg-slate-700"}`}><span className={conference.confirmed?"text-green-400":"text-red-400"}>{conference.confirmed?"✓":"✕"}</span>{conference.conferenceAbbreviation}</button>)}
            </div>
            {selectedTournament&&<>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div><h2 className="text-xl font-semibold">{selectedTournament.conferenceName} Tournament</h2><p className="text-sm opacity-70">Fixed bracket · higher seed hosts · {selectedTournament.roundCount} round{selectedTournament.roundCount===1?"":"s"}</p></div>
                <label className="text-sm font-semibold">Tournament teams<select disabled={selectedTournament.confirmed} value={tournamentTeamCount} onChange={(event)=>changeTournamentSize(Number(event.target.value))} className="ml-2 rounded border border-slate-500 bg-slate-950 px-3 py-2">{Array.from({length:selectedTournament.teams.length-1},(_,index)=>index+2).map((count)=><option key={count} value={count}>{count}</option>)}</select></label>
              </div>
              <div className="mt-4 overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr className="border-b border-slate-400"><th className="p-2 text-center">Selected</th><th className="p-2 text-center">Seed</th><th className="p-2 text-left">Team</th><th className="p-2 text-center">Conference</th><th className="p-2 text-center">Overall</th><th className="p-2 text-center">Goal Differential</th><th className="p-2 text-center">Order</th></tr></thead><tbody>{selectedTournament.teams.map((team)=>{const seed=tournamentTeamIds.indexOf(team.teamId)+1;return <tr key={team.teamId} className="border-b border-slate-700"><td className="p-2 text-center"><input type="checkbox" checked={seed>0} disabled={selectedTournament.confirmed||(!seed&&tournamentTeamIds.length>=tournamentTeamCount)} onChange={()=>selectTournamentTeam(team.teamId)}/></td><td className="p-2 text-center font-bold">{seed||"—"}</td><td className="p-2 text-left">{team.teamName} | {team.abbreviation}</td><td className="p-2 text-center">{team.conferenceWins}-{team.conferenceLosses}</td><td className="p-2 text-center">{team.totalWins}-{team.totalLosses}</td><td className="p-2 text-center">{team.goalDifferential>0?"+":""}{team.goalDifferential}</td><td className="p-2 text-center">{seed>0&&!selectedTournament.confirmed&&<span className="inline-flex gap-1"><button type="button" disabled={seed===1} onClick={()=>moveTournamentTeam(seed-1,-1)} className="rounded bg-slate-700 px-2 py-1 disabled:opacity-30">↑</button><button type="button" disabled={seed===tournamentTeamIds.length} onClick={()=>moveTournamentTeam(seed-1,1)} className="rounded bg-slate-700 px-2 py-1 disabled:opacity-30">↓</button></span>}</td></tr>})}</tbody></table></div>
              <div className="mt-5 border-t border-slate-600 pt-4"><h3 className="mb-3 font-semibold">Round Venues</h3><div className="flex flex-wrap gap-5">{Array.from({length:Math.ceil(Math.log2(tournamentTeamCount))},(_,index)=>{const names=["Final","Semifinals","Quarterfinals","First Round"];const roundCount=Math.ceil(Math.log2(tournamentTeamCount));const name=names[Math.min(3,roundCount-index-1)];const neutral=tournamentNeutralRounds[index]??true;return <label key={`${name}-${index}`} className="flex items-center gap-3"><span>{name}</span><button type="button" role="switch" aria-checked={neutral} disabled={selectedTournament.confirmed} onClick={()=>setTournamentNeutralRounds((current)=>current.map((value,roundIndex)=>roundIndex===index?!value:value))} className={`relative h-6 w-11 rounded-full ${neutral?"bg-green-600":"bg-slate-600"} disabled:opacity-60`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${neutral?"left-6":"left-1"}`}/></button><span className="text-sm opacity-75">{neutral?"Neutral site":"Higher seed hosts"}</span></label>})}</div></div>
              <div className="mt-4 flex items-center justify-end gap-3"><span className={`mr-auto font-semibold ${selectedTournament.confirmed?"text-green-400":"text-amber-400"}`}>{selectedTournament.confirmed?"Tournament confirmed":"Awaiting confirmation"}</span>{!selectedTournament.confirmed&&<><button type="button" disabled={Boolean(tournamentBusy)||tournamentTeamIds.length!==tournamentTeamCount} onClick={()=>void persistTournament(false)} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-40">{tournamentBusy==="save"?"Saving...":"Save Draft"}</button><button type="button" title={conferenceConfirmationBlocked?conferenceConfirmationMessage:undefined} disabled={Boolean(tournamentBusy)||tournamentTeamIds.length!==tournamentTeamCount||conferenceConfirmationBlocked} onClick={()=>void persistTournament(true)} className="rounded bg-green-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{tournamentBusy==="confirm"?"Confirming...":"Confirm Tournament"}</button></>}</div>
              {tournamentError&&<div className="mt-4 rounded border border-red-600 bg-red-950/40 p-3 text-sm text-red-400">{tournamentError}</div>}
            </>}
          </Border>}
          {activeTab === "nationalTournament" && nationalTournament && <Border classes="p-4 mb-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-600 pb-4">
              <div><h2 className="text-xl font-semibold">National Tournament</h2><p className="text-sm opacity-70">Conference champions automatically qualify. Rankings default to overall wins, then goal differential.</p></div>
              <label className="text-sm font-semibold">Tournament teams<select disabled={nationalTournament.confirmed} value={nationalTeamCount} onChange={(event)=>changeNationalSize(Number(event.target.value))} className="ml-2 rounded border border-slate-500 bg-slate-950 px-3 py-2">{nationalTournamentSizes.map((count)=><option key={count} value={count} disabled={count<nationalTournament.teams.filter((team)=>team.automaticQualifier).length}>{count}</option>)}</select></label>
            </div>
            <div className="mt-4 overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr className="border-b border-slate-400"><th className="p-2 text-center">Selected</th><th className="p-2 text-center">Seed</th><th className="p-2 text-left">Team</th><th className="p-2 text-center">Conference</th><th className="p-2 text-center">Overall</th><th className="p-2 text-center">Goal Differential</th><th className="p-2 text-center">Qualifier</th><th className="p-2 text-center">Order</th></tr></thead><tbody>{nationalTournament.teams.map((team)=>{const seed=nationalTeamIds.indexOf(team.teamId)+1;return <tr key={team.teamId} className="border-b border-slate-700"><td className="p-2 text-center"><input type="checkbox" checked={seed>0} disabled={nationalTournament.confirmed||team.automaticQualifier||(!seed&&nationalTeamIds.length>=nationalTeamCount)} onChange={()=>selectNationalTeam(team.teamId)}/></td><td className="p-2 text-center font-bold">{seed||"—"}</td><td className="p-2 text-left">{team.teamName} | {team.abbreviation}</td><td className="p-2 text-center">{team.conferenceAbbreviation}</td><td className="p-2 text-center">{team.totalWins}-{team.totalLosses}</td><td className="p-2 text-center">{team.goalDifferential>0?"+":""}{team.goalDifferential}</td><td className="p-2 text-center">{team.automaticQualifier?<span className="font-semibold text-green-400">Conference Champion</span>:"At-Large"}</td><td className="p-2 text-center">{seed>0&&!nationalTournament.confirmed&&<span className="inline-flex gap-1"><button type="button" disabled={seed===1} onClick={()=>moveNationalTeam(seed-1,-1)} className="rounded bg-slate-700 px-2 py-1 disabled:opacity-30">↑</button><button type="button" disabled={seed===nationalTeamIds.length} onClick={()=>moveNationalTeam(seed-1,1)} className="rounded bg-slate-700 px-2 py-1 disabled:opacity-30">↓</button></span>}</td></tr>})}</tbody></table></div>
            <div className="mt-5 border-t border-slate-600 pt-4"><h3 className="mb-3 font-semibold">Round Venues</h3><div className="flex flex-wrap gap-5">{Array.from({length:Math.ceil(Math.log2(nationalTeamCount))},(_,index)=>{const count=Math.ceil(Math.log2(nationalTeamCount));const remaining=count-index-1;const name=remaining===0?"Final":remaining===1?"Semifinals":remaining===2?"Quarterfinals":index===0?"First Round":`Round of ${2**(remaining+1)}`;const neutral=nationalNeutralRounds[index]??true;return <label key={`${name}-${index}`} className="flex items-center gap-3"><span>{name}</span><button type="button" role="switch" aria-checked={neutral} disabled={nationalTournament.confirmed} onClick={()=>setNationalNeutralRounds((current)=>current.map((value,round)=>round===index?!value:value))} className={`relative h-6 w-11 rounded-full ${neutral?"bg-green-600":"bg-slate-600"} disabled:opacity-60`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${neutral?"left-6":"left-1"}`}/></button><span className="text-sm opacity-75">{neutral?"Neutral site":"Higher seed hosts"}</span></label>})}</div></div>
            <div className="mt-4 flex items-center justify-end gap-3"><span className={`mr-auto font-semibold ${nationalTournament.confirmed?"text-green-400":"text-amber-400"}`}>{nationalTournament.confirmed?"Tournament confirmed":"Awaiting confirmation"}</span>{!nationalTournament.confirmed&&<><button type="button" disabled={Boolean(nationalBusy)||nationalTeamIds.length!==nationalTeamCount} onClick={()=>void persistNationalTournament(false)} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-40">{nationalBusy==="save"?"Saving...":"Save Draft"}</button><button type="button" disabled={Boolean(nationalBusy)||nationalTeamIds.length!==nationalTeamCount} onClick={()=>void persistNationalTournament(true)} className="rounded bg-green-600 px-4 py-2 font-semibold text-white disabled:opacity-40">{nationalBusy==="confirm"?"Confirming...":"Confirm Tournament"}</button></>}</div>
            {nationalError&&<div className="mt-4 rounded border border-red-600 bg-red-950/40 p-3 text-sm text-red-400">{nationalError}</div>}
          </Border>}
          {activeTab === "offseason" && offseason && <Border classes="p-4 mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-600 pb-4">
              <div><h2 className="text-xl font-semibold">College Offseason · {getLacrosseSeasonYear(offseason.season)}</h2><p className="mt-1 text-sm opacity-70">Complete each phase in order. Player potential grades remain unchanged.</p></div>
              <div className="rounded bg-slate-800 px-4 py-2 text-sm"><span className="opacity-70">Current phase:</span> <strong>{offseason.phase.replaceAll("_"," ").replace(/\b\w/g,(letter)=>letter.toUpperCase())}</strong></div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
              {[['Transfer Portal',offseason.transferPortalStatus],['Early Declarations',offseason.earlyDeclarationsStatus],['Player Progressions',offseason.progressionsStatus],['Graduate Players',offseason.graduationsStatus],['Assign Signed Recruits',offseason.recruitEnrollmentStatus],['Assign Remaining Recruits',offseason.remainingRecruitsStatus],['Generate Walk-ons',offseason.walkonGenerationStatus],['Cut Players',offseason.cutsStatus]].map(([label,status])=><div key={label} className="rounded border border-slate-600 p-3"><div className="font-semibold">{label}</div><div className={`mt-1 text-sm ${status==='completed'?'text-green-400':status==='skipped'?'text-amber-400':status==='waiting'?'text-amber-400':'opacity-70'}`}>{status}</div></div>)}
            </div>
            {(offseason.phase==="transfer_portal"||offseason.phase==="early_declarations")&&<div className="mt-5 flex items-center justify-between gap-4 rounded border border-amber-700 bg-amber-950/20 p-4"><div><strong>{offseason.phase==="transfer_portal"?"Transfer Portal":"Early Declarations"}</strong><p className="text-sm opacity-75">This phase is available in the offseason workflow but is being skipped for the inaugural season.</p></div><button type="button" disabled={Boolean(offseasonBusy)} onClick={()=>void skipOffseasonPhase()} className="rounded bg-amber-700 px-4 py-2 font-semibold text-white disabled:opacity-40">{offseasonBusy==="skip"?"Skipping...":"Skip Phase"}</button></div>}
            {(offseason.phase==="progressions"||offseason.alreadyRun)&&<div className="mt-5 rounded border border-slate-600 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">Run Progressions</h3><p className="text-sm opacity-70">Includes first through fifth-year rostered players. Age and year increase after ratings are calculated.</p></div><div className="flex flex-wrap gap-2"><button type="button" disabled={Boolean(offseasonBusy)||!offseason.canRunProgressions} onClick={()=>void previewPlayerProgressions()} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-40">{offseasonBusy==="preview"?"Calculating...":"Preview Progressions"}</button><button type="button" disabled={Boolean(offseasonBusy)||!offseason.canRunProgressions} onClick={()=>void exportPlayerProgressionPreview()} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-40">{offseasonBusy==="export"?"Exporting...":"Export Preview"}</button><button type="button" disabled={Boolean(offseasonBusy)||!offseason.canRunProgressions} onClick={()=>void runPlayerProgressions()} className="rounded bg-green-700 px-4 py-2 font-semibold text-white disabled:opacity-40">{offseasonBusy==="run"?"Running...":offseason.alreadyRun?"Progressions Complete":"Run Progressions"}</button></div></div>
              {offseason.playerCount>0&&<div className="mt-4 grid grid-cols-2 gap-3 text-center md:grid-cols-5"><div><div className="text-xl font-bold">{offseason.playerCount}</div><div className="text-xs opacity-70">Players</div></div><div><div className="text-xl font-bold">{offseason.totalAttributeGain}</div><div className="text-xs opacity-70">Attribute Points</div></div><div><div className="text-xl font-bold">{offseason.averageAttributeGain.toFixed(2)}</div><div className="text-xs opacity-70">Average Attribute Gain</div></div><div><div className="text-xl font-bold">{offseason.averageOverallChange.toFixed(2)}</div><div className="text-xs opacity-70">Average Overall Change</div></div><div><div className="text-xl font-bold">{offseason.maximumOverallChange}</div><div className="text-xs opacity-70">Largest Overall Change</div></div></div>}
              {offseason.message&&<div className="mt-4 text-sm text-green-400">{offseason.message}</div>}
            </div>}
            {(offseason.phase==="graduations"||offseason.graduationsAlreadyRun)&&<div className="mt-5 rounded border border-slate-600 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">Graduate Players</h3><p className="text-sm opacity-70">Moves year-6 players from college_players into the professional draft-eligible pool and removes their college lineup assignments. Historical statistics remain available.</p></div><button type="button" disabled={Boolean(offseasonBusy)||!offseason.canRunGraduations} onClick={()=>void runGraduations()} className="rounded bg-green-700 px-4 py-2 font-semibold text-white disabled:opacity-40">{offseasonBusy==="graduate"?"Graduating...":offseason.graduationsAlreadyRun?"Graduations Complete":`Graduate ${offseason.graduationCount} Players`}</button></div>
              {!offseason.graduationsAlreadyRun&&<div className="mt-4 grid grid-cols-2 gap-3 text-center"><div><div className="text-xl font-bold">{offseason.graduationCount}</div><div className="text-xs opacity-70">Eligible Graduates</div></div><div><div className="text-xl font-bold">{offseason.graduationLineupAssignments}</div><div className="text-xs opacity-70">Lineup Assignments Removed</div></div></div>}
            </div>}
            {(offseason.phase==="recruit_enrollment"||offseason.recruitEnrollmentAlreadyRun)&&<div className="mt-5 rounded border border-slate-600 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">Enroll Recruiting Class</h3><p className="text-sm opacity-70">Archives committed recruits for recruiting history, adds them to their college rosters as freshmen, and removes them from the active recruit pool.</p></div><button type="button" disabled={Boolean(offseasonBusy)||!offseason.canRunRecruitEnrollment} onClick={()=>void runRecruitEnrollment()} className="rounded bg-green-700 px-4 py-2 font-semibold text-white disabled:opacity-40">{offseasonBusy==="enroll"?"Enrolling...":offseason.recruitEnrollmentAlreadyRun?"Enrollment Complete":`Enroll ${offseason.enrollmentCount} Recruits`}</button></div>
              <div className="mt-4 text-center"><div className="text-xl font-bold">{offseason.enrollmentCount}</div><div className="text-xs opacity-70">Committed Recruits</div></div>
            </div>}
            {(offseason.phase==="recruit_assignment"||offseason.remainingRecruitsAlreadyRun)&&<div className="mt-5 rounded border border-slate-600 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">Assign Remaining Recruits</h3><p className="text-sm opacity-70">Fills roster vacancies with unsigned recruits before creating walk-ons. Existing recruiting points receive priority; remaining openings are filled randomly with positional needs considered.</p></div><button type="button" disabled={Boolean(offseasonBusy)||!offseason.canAssignRemainingRecruits} onClick={()=>void runRemainingRecruitAssignment()} className="rounded bg-green-700 px-4 py-2 font-semibold text-white disabled:opacity-40">{offseasonBusy==="remaining"?"Assigning...":offseason.remainingRecruitsAlreadyRun?"Assignments Complete":`Assign ${offseason.remainingRecruitSlots} Recruits`}</button></div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center"><div><div className="text-xl font-bold">{offseason.remainingRecruitSlots}</div><div className="text-xs opacity-70">Roster Openings</div></div><div><div className="text-xl font-bold">{offseason.remainingRecruitCandidates}</div><div className="text-xs opacity-70">Unsigned Recruits</div></div><div><div className="text-xl font-bold">{offseason.priorityRecruitCandidates}</div><div className="text-xs opacity-70">With Prior Interest</div></div></div>
            </div>}
            {(offseason.phase==="walkon_generation"||offseason.walkonsAlreadyRun)&&<div className="mt-5 rounded border border-slate-600 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">Generate Walk-ons</h3><p className="text-sm opacity-70">Fills every active NCAA roster below 48 players. Walk-ons are freshmen, age 18, and display as 0-star players. Scott County and Tates Creek are excluded.</p></div><button type="button" disabled={Boolean(offseasonBusy)||!offseason.canGenerateWalkons} onClick={()=>void runWalkonGeneration()} className="rounded bg-green-700 px-4 py-2 font-semibold text-white disabled:opacity-40">{offseasonBusy==="walkons"?"Generating...":offseason.walkonsAlreadyRun?"Walk-ons Complete":`Generate ${offseason.walkonsNeeded} Walk-ons`}</button></div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center"><div><div className="text-xl font-bold">{offseason.walkonsNeeded}</div><div className="text-xs opacity-70">Walk-ons Generated / Needed</div></div><div><div className="text-xl font-bold">{offseason.underLimitTeams}</div><div className="text-xs opacity-70">Teams Below 48</div></div></div>
            </div>}
            {(offseason.phase==="cuts"||offseason.cutsAlreadyRun)&&<div className="mt-5 rounded border border-slate-600 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">Cut Players</h3><p className="text-sm opacity-70">AI teams automatically release their lowest-overall players until they reach 48. User-coached teams must make their own cuts from the roster page.</p></div><button type="button" disabled={Boolean(offseasonBusy)||!offseason.canRunCuts} onClick={()=>void runRosterCuts()} className="rounded bg-green-700 px-4 py-2 font-semibold text-white disabled:opacity-40">{offseasonBusy==="cuts"?"Cutting...":offseason.cutsAlreadyRun&&offseason.overLimitTeams.length===0?"Cuts Complete":"Run AI Cuts"}</button></div>
              <div className="mt-4"><div className="mb-2 text-sm font-semibold">Teams above the 48-player limit</div>{offseason.overLimitTeams.length===0?<div className="text-sm text-green-400">No teams are over the roster limit.</div>:<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-600"><th className="p-2 text-left">Team</th><th className="p-2 text-center">Roster</th><th className="p-2 text-center">Control</th><th className="p-2 text-center">Cuts Needed</th></tr></thead><tbody>{offseason.overLimitTeams.map((team)=><tr key={team.teamId} className="border-b border-slate-700"><td className="p-2">{team.teamName} | {team.abbreviation}</td><td className="p-2 text-center font-bold">{team.rosterCount}</td><td className="p-2 text-center">{team.isUserCoached?"User":"AI"}</td><td className="p-2 text-center">{team.rosterCount-48}</td></tr>)}</tbody></table></div>}</div>
            </div>}
            {offseason.phase==="season_rollover"&&<div className="mt-5 rounded border border-green-700 bg-green-950/20 p-4">
              <div className="flex flex-wrap items-end justify-between gap-4"><div><h3 className="font-semibold">Start New Season</h3><p className="text-sm opacity-75">Advances to {getLacrosseSeasonYear(offseason.season+1)}, removes the prior class's unsigned recruits and their active recruiting records, then creates and initializes the new recruiting class.</p><div className="mt-2 text-sm"><strong>{offseason.leftoverRecruits}</strong> old recruits removed</div><label className="mt-3 block w-48 text-sm font-semibold">New recruits<input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4} value={newRecruitCount} placeholder={String(offseason.newRecruitCount)} onChange={(event)=>setNewRecruitCount(event.target.value.replace(/\D/g,"").slice(0,4))} className="mt-1 w-full rounded border border-slate-500 bg-slate-900 px-3 py-2 font-normal text-white"/><span className="mt-1 block text-xs font-normal opacity-70">Enter a 3- or 4-digit integer.</span></label></div><button type="button" disabled={Boolean(offseasonBusy)||!offseason.canStartNewSeason||!/^[1-9]\d{2,3}$/.test(newRecruitCount)} onClick={()=>void startNewSeason()} className="rounded bg-green-700 px-5 py-2 font-semibold text-white disabled:opacity-40">{offseasonBusy==="rollover"?"Starting Season...":`Start ${getLacrosseSeasonYear(offseason.season+1)} Season`}</button></div>
            </div>}
            {offseasonError&&<div className="mt-4 rounded border border-red-600 bg-red-950/40 p-3 text-sm text-red-400">{offseasonError}</div>}
          </Border>}
          {activeTab === "cron" && aiJob && <Border classes="p-4 mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{aiJob.name}</h2>
                <div className="mt-1 text-sm opacity-70">Weekly AI generation for every uncoached team and coached teams with AI Control enabled.</div>
                <div className="mt-2 text-sm">
                  <strong>Last run:</strong> {formatJobRunTime(aiJob.lastRunAt)}
                  {aiJob.lastRunBy && <> by {aiJob.lastRunBy}</>}
                </div>
                {aiJob.lastMessage && <div className={`mt-1 text-sm ${aiJob.lastStatus === "failed" ? "text-red-500" : aiJob.lastStatus === "success" ? "text-green-500" : "text-amber-400"}`}>{aiJob.lastMessage}</div>}
                {jobError && <div className="mt-2 rounded border border-red-600 bg-red-950/40 p-3 text-sm text-red-400"><strong>Manual run error:</strong> {jobError}</div>}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={aiJob.enabled}
                  aria-label="Toggle College AI Lineups scheduled job"
                  disabled={jobBusy}
                  onClick={() => void toggleAiJob()}
                  className={`relative h-7 w-12 rounded-full border transition-colors ${aiJob.enabled ? "border-green-400 bg-green-600" : "border-slate-400 bg-slate-600"}`}
                >
                  <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${aiJob.enabled ? "translate-x-5" : "translate-x-0"}`} />
                </button>
                <strong>{aiJob.enabled ? "Enabled" : "Disabled"}</strong>
                <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50" type="button" disabled={jobBusy} onClick={() => void runAiJob()}>{jobBusy ? "Running..." : "Run Now"}</button>
              </div>
            </div>
          </Border>}
          {activeTab === "cron" && aiRecruitingJob && <Border classes="p-4 mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{aiRecruitingJob.name}</h2>
                <div className="mt-1 text-sm opacity-70">Weekly board, scholarship, and point allocation for every uncoached team and coached teams with AI Recruiting enabled.</div>
                <div className="mt-2 text-sm">
                  <strong>Last run:</strong> {formatJobRunTime(aiRecruitingJob.lastRunAt)}
                  {aiRecruitingJob.lastRunBy && <> by {aiRecruitingJob.lastRunBy}</>}
                </div>
                {aiRecruitingJob.lastMessage && <div className={`mt-1 text-sm ${aiRecruitingJob.lastStatus === "failed" ? "text-red-500" : aiRecruitingJob.lastStatus === "success" ? "text-green-500" : "text-amber-400"}`}>{aiRecruitingJob.lastMessage}</div>}
                {recruitingJobError && <div className="mt-2 rounded border border-red-600 bg-red-950/40 p-3 text-sm text-red-400"><strong>Manual run error:</strong> {recruitingJobError}</div>}
              </div>
              <div className="flex items-center gap-3">
                <button type="button" role="switch" aria-checked={aiRecruitingJob.enabled} aria-label="Toggle College AI Recruiting scheduled job" disabled={jobBusy} onClick={() => void toggleAiRecruitingJob()} className={`relative h-7 w-12 rounded-full border transition-colors ${aiRecruitingJob.enabled ? "border-green-400 bg-green-600" : "border-slate-400 bg-slate-600"}`}>
                  <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${aiRecruitingJob.enabled ? "translate-x-5" : "translate-x-0"}`} />
                </button>
                <strong>{aiRecruitingJob.enabled ? "Enabled" : "Disabled"}</strong>
                <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50" type="button" disabled={jobBusy} onClick={() => void runAiRecruitingJob()}>{jobBusy ? "Running..." : "Run Now"}</button>
              </div>
            </div>
          </Border>}
          {activeTab === "cron" && recruitingSyncJob && <Border classes="p-4 mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{recruitingSyncJob.name}</h2>
                <div className="mt-1 text-sm opacity-70">Resolves the next recruiting week after AI allocation completes. Each week can only be processed once.</div>
                <div className="mt-2 text-sm"><strong>Last run:</strong> {formatJobRunTime(recruitingSyncJob.lastRunAt)}{recruitingSyncJob.lastRunBy && <> by {recruitingSyncJob.lastRunBy}</>}</div>
                {recruitingSyncJob.lastMessage && <div className={`mt-1 text-sm ${recruitingSyncJob.lastStatus === "failed" ? "text-red-500" : recruitingSyncJob.lastStatus === "success" ? "text-green-500" : "text-amber-400"}`}>{recruitingSyncJob.lastMessage}</div>}
                {recruitingSyncError && <div className="mt-2 rounded border border-red-600 bg-red-950/40 p-3 text-sm text-red-400"><strong>Manual run error:</strong> {recruitingSyncError}</div>}
              </div>
              <div className="flex items-center gap-3">
                <button type="button" role="switch" aria-checked={recruitingSyncJob.enabled} aria-label="Toggle College Recruiting Weekly Sync scheduled job" disabled={jobBusy} onClick={() => void toggleRecruitingSyncJob()} className={`relative h-7 w-12 rounded-full border transition-colors ${recruitingSyncJob.enabled ? "border-green-400 bg-green-600" : "border-slate-400 bg-slate-600"}`}><span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${recruitingSyncJob.enabled ? "translate-x-5" : "translate-x-0"}`} /></button>
                <strong>{recruitingSyncJob.enabled ? "Enabled" : "Disabled"}</strong>
                <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50" type="button" disabled={jobBusy} onClick={() => void runRecruitingSyncJob()}>{jobBusy ? "Running..." : "Run Now"}</button>
              </div>
            </div>
          </Border>}
          {activeTab === "cron" && simulateWeekJob && publishResultsJob && advanceWeekJob && <Border classes="p-4 mb-6">
            <h2 className="text-xl font-semibold">College Game Automation</h2>
            <div className="mt-1 text-sm opacity-70">Each phase has its own independent scheduled-job switch. No operating-system cron entries are installed in this development environment.</div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {[
                {job: simulateWeekJob, save: LacrosseAdminService.setSimulateWeekJob, update: setSimulateWeekJob},
                {job: publishResultsJob, save: LacrosseAdminService.setPublishResultsJob, update: setPublishResultsJob},
                {job: advanceWeekJob, save: LacrosseAdminService.setAdvanceWeekJob, update: setAdvanceWeekJob},
              ].map(({job, save, update}) => <div key={job.key} className="rounded border border-slate-600 p-3">
                <div className="flex items-center justify-between gap-3">
                  <strong>{job.name}</strong>
                  <div className="flex items-center gap-2">
                    <button type="button" role="switch" aria-checked={job.enabled} aria-label={`Toggle ${job.name} scheduled job`} disabled={jobBusy} onClick={() => void toggleGameAutomationJob(job, save, update)} className={`relative h-7 w-12 rounded-full border transition-colors ${job.enabled ? "border-green-400 bg-green-600" : "border-slate-400 bg-slate-600"}`}><span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${job.enabled ? "translate-x-5" : "translate-x-0"}`} /></button>
                    <span className="text-sm font-semibold">{job.enabled ? "Enabled" : "Disabled"}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs opacity-70"><strong>Last run:</strong> {formatJobRunTime(job.lastRunAt)}{job.lastRunBy && <> by {job.lastRunBy}</>}</div>
                {job.lastMessage && <div className={`mt-1 text-xs ${job.lastStatus === "failed" ? "text-red-500" : job.lastStatus === "success" ? "text-green-500" : "text-amber-400"}`}>{job.lastMessage}</div>}
              </div>)}
            </div>
            {gameAutomationError && <div className="mt-3 rounded border border-red-600 bg-red-950/40 p-3 text-sm text-red-400"><strong>Automation setting error:</strong> {gameAutomationError}</div>}
          </Border>}
          {activeTab === "cron" && <Border classes="p-4 mb-6">
            <h2 className="text-xl font-semibold">College Game Simulation</h2>
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <label className="text-sm font-semibold">Season<select value={gameSeason} onChange={(event)=>setGameSeason(Number(event.target.value))} disabled={gameSimulation?.running} className="mt-1 block rounded border border-slate-500 bg-slate-950 px-3 py-2">{Array.from({length:20},(_,index)=>index+1).map((season)=><option key={season} value={season}>{getLacrosseSeasonYear(season)}</option>)}</select></label>
              <label className="text-sm font-semibold">Week<select value={gameWeek} onChange={(event)=>setGameWeek(Number(event.target.value))} disabled={gameSimulation?.running} className="mt-1 block rounded border border-slate-500 bg-slate-950 px-3 py-2">{Array.from({length:gameWeekOptionCount},(_,index)=>index+1).map((week)=><option key={week} value={week}>Week {week}</option>)}</select></label>
              <button type="button" disabled={Boolean(gameBusy)||gameSimulation?.running} onClick={()=>void preflightGameWeek()} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{gameBusy==="preflight"?"Checking...":"Preflight Week"}</button>
              <button type="button" disabled={Boolean(gameBusy)||gameSimulation?.running||!gameSimulation?.scheduledGames} onClick={()=>void runGameWeek()} className="rounded bg-amber-700 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{gameSimulation?.running||gameBusy==="run"?"Simulating Week...":"Simulate Week"}</button>
              <button type="button" disabled={Boolean(gameBusy)||gameSimulation?.running||!gameSimulation?.simulatedGames||Boolean(gameSimulation?.scheduledGames)} onClick={()=>void publishGameWeek()} className="rounded bg-green-700 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{gameBusy==="publish"?"Publishing...":"Publish Results"}</button>
              <button type="button" disabled={advanceWeekDisabled} title={gameSimulation?.officialOffseason?"The season is already in the offseason.":tournamentAdvanceBlock||undefined} onClick={()=>void advanceGameWeek()} className="rounded bg-indigo-700 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{gameBusy==="advance"?"Advancing...":gameSimulation?.officialOffseason?"Offseason Started":"Advance Week"}</button>
              <button type="button" disabled={Boolean(gameBusy)||!canEndSeason} title={canEndSeason?"The national championship is final and every game is complete.":"Available after the National Tournament Final is published and no unfinished games remain."} onClick={()=>void endGameSeason()} className="rounded bg-purple-700 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{gameBusy==="offseason"?"Entering Offseason...":"Enter Offseason"}</button>
            </div>
            {gameSimulation&&<div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded bg-slate-800 p-3 text-center"><strong className="block text-2xl">{gameSimulation.scheduledGames}</strong><span className="text-sm opacity-70">Scheduled</span></div>
              <div className="rounded bg-slate-800 p-3 text-center"><strong className="block text-2xl">{gameSimulation.simulatedGames}</strong><span className="text-sm opacity-70">Simulated</span></div>
              <div className="rounded bg-slate-800 p-3 text-center"><strong className="block text-2xl">{gameSimulation.finalGames}</strong><span className="text-sm opacity-70">Final</span></div>
              <div className="rounded bg-slate-800 p-3 text-center"><strong className="block text-2xl">{gameSimulation.completedGames}</strong><span className="text-sm opacity-70">Completed This Run</span></div>
              <div className="rounded bg-slate-800 p-3 text-center"><strong className={`block text-2xl ${gameSimulation.failedGames?"text-red-400":""}`}>{gameSimulation.failedGames}</strong><span className="text-sm opacity-70">Failed This Run</span></div>
            </div>}
            {gameSimulation?.message&&<div className="mt-4 text-sm">{gameSimulation.message}</div>}
            {gameSimulation&&<div className="mt-2 text-sm opacity-70">Official calendar: Season {getLacrosseSeasonYear(gameSimulation.officialSeason)}, Week {gameSimulation.officialWeek}</div>}
            {tournamentAdvanceBlock&&gameSimulation?.officialSeason===gameSeason&&gameSimulation?.officialWeek===gameWeek&&<div className="mt-3 rounded border border-amber-600 bg-amber-950/30 p-3 text-sm text-amber-300">{tournamentAdvanceBlock}</div>}
            {gameNotice&&<div className="mt-4 rounded border border-green-600 bg-green-950/40 p-3 text-sm text-green-300">{gameNotice}</div>}
            {gameSimulation?.failures.map((failure)=><div key={failure.game_id} className="mt-2 rounded border border-red-600 bg-red-950/40 p-3 text-sm text-red-300">Game {failure.game_id} ({failure.home} vs {failure.away}): {failure.error}</div>)}
            {gameError&&<div className="mt-4 rounded border border-red-600 bg-red-950/40 p-3 text-sm text-red-400">{gameError}</div>}
          </Border>}
          {activeTab === "preseason" && !preseason&&<Border classes="p-4 mb-6"><h2 className="text-xl font-semibold">Preseason</h2><p className="mt-2 text-amber-300">Preseason controls will become available after the SimLAX API update is deployed.</p></Border>}
          {activeTab === "preseason" && preseason&&<Border classes="p-4 mb-6">
            <h2 className="text-xl font-semibold">Preseason</h2>
            <p className="mt-1 text-sm opacity-70">Optional exhibition games for testing and familiarization. Results and box scores remain available, but preseason games do not count toward records, statistics, progression, awards, or postseason qualification.</p>
            {preseasonSchedulingOpen&&<div className="mt-5 rounded border border-slate-600 p-4">
              <div className="flex flex-wrap items-end gap-4">
                <label className="text-sm font-semibold">Hold preseason games?<select value={preseasonEnabled?"yes":"no"} onChange={(event)=>setPreseasonEnabled(event.target.value==="yes")} disabled={Boolean(preseasonBusy)||preseasonDecisionLocked} className="mt-1 block rounded border border-slate-500 bg-slate-950 px-3 py-2"><option value="yes">Yes</option><option value="no">No</option></select></label>
                {preseasonEnabled&&<label className="text-sm font-semibold">Games per team<select value={preseasonGames} onChange={(event)=>setPreseasonGames(Number(event.target.value))} disabled={Boolean(preseasonBusy)||preseasonDecisionLocked} className="mt-1 block rounded border border-slate-500 bg-slate-950 px-3 py-2">{Array.from({length:6},(_,index)=>index+1).map((count)=><option key={count} value={count}>{count}</option>)}</select></label>}
                <button type="button" disabled={Boolean(preseasonBusy)||preseasonDecisionLocked} onClick={()=>void runPreseasonAction("decision")} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-40">{preseasonBusy==="decision"?"Saving...":"Save Decision"}</button>
              </div>
            </div>}
            {!preseasonSchedulingOpen&&<div className="mt-5 rounded border border-slate-600 bg-slate-900/40 p-4 text-sm text-slate-300">{preseason.phase==="preseason"?"Preseason scheduling is locked. Scheduled exhibition games can still be simulated and published below.":"Preseason controls are locked because the season has advanced beyond preseason scheduling."}</div>}
            {preseason.decisionMade&&<div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded bg-slate-800 p-3 text-center"><strong className="block text-2xl">{preseason.enabled?"Yes":"No"}</strong><span className="text-sm opacity-70">Enabled</span></div><div className="rounded bg-slate-800 p-3 text-center"><strong className="block text-2xl">{preseason.gamesPerTeam||0}</strong><span className="text-sm opacity-70">Games per Team</span></div><div className="rounded bg-slate-800 p-3 text-center"><strong className="block text-2xl">{preseason.scheduledGames}</strong><span className="text-sm opacity-70">Scheduled Games</span></div><div className="rounded bg-slate-800 p-3 text-center"><strong className="block text-2xl">{preseason.pendingRequests}</strong><span className="text-sm opacity-70">Pending Challenges</span></div></div>}
            {preseason.enabled&&preseason.teamsBelowLimit.length>0&&<div className="mt-5 rounded border border-slate-600 p-4"><h3 className="font-semibold">Teams below the limit ({preseason.teamsBelowLimit.length})</h3><div className="mt-2 max-h-48 overflow-y-auto text-sm">{preseason.teamsBelowLimit.map((team)=><div key={team.teamId} className="flex justify-between border-t border-slate-700 py-2"><span>{team.teamName} | {team.abbreviation}</span><span>{team.scheduledGames} / {preseason.gamesPerTeam}</span></div>)}</div></div>}
            <div className="mt-5 flex flex-wrap gap-3">
              {preseason.canGenerateRemaining&&<button type="button" disabled={Boolean(preseasonBusy)||preseason.pendingRequests>0} onClick={()=>void runPreseasonAction("generate")} className="rounded bg-green-700 px-4 py-2 font-semibold text-white disabled:opacity-40">{preseasonBusy==="generate"?"Generating...":"Generate Remaining Games"}</button>}
              {preseason.canCloseScheduling&&<button type="button" disabled={Boolean(preseasonBusy)} onClick={()=>void runPreseasonAction("close")} className="rounded bg-amber-700 px-4 py-2 font-semibold text-white disabled:opacity-40">{preseasonBusy==="close"?"Closing...":"Close Preseason Scheduling"}</button>}
            </div>
            {preseason.phase==="preseason"&&<div className="mt-5 rounded border border-slate-600 p-4"><h3 className="font-semibold">Run Preseason Games</h3><div className="mt-3 flex flex-wrap items-end gap-3"><label className="text-sm font-semibold">Preseason Week<select value={gameWeek} onChange={(event)=>{const week=Number(event.target.value);setGameWeek(week);setGameError("");void LacrosseAdminService.getGameSimulationStatus(preseason.season,week,"preseason").then(setGameSimulation).catch((reason)=>setGameError(detail(reason)));}} className="mt-1 block rounded border border-slate-500 bg-slate-950 px-3 py-2">{Array.from({length:preseason.gamesPerTeam||1},(_,index)=>index+1).map((week)=><option key={week} value={week}>Week {week}</option>)}</select></label><button type="button" disabled={Boolean(gameBusy)||gameSimulation?.running} onClick={()=>void preflightGameWeek()} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-40">Preflight</button><button type="button" disabled={Boolean(gameBusy)||gameSimulation?.running||!gameSimulation?.scheduledGames} onClick={()=>void runGameWeek()} className="rounded bg-amber-700 px-4 py-2 font-semibold text-white disabled:opacity-40">Simulate</button><button type="button" disabled={Boolean(gameBusy)||gameSimulation?.running||!gameSimulation?.simulatedGames||Boolean(gameSimulation?.scheduledGames)} onClick={()=>void publishGameWeek()} className="rounded bg-green-700 px-4 py-2 font-semibold text-white disabled:opacity-40">Publish Results</button></div><div className="mt-3 text-sm opacity-70">{gameSimulation?.scheduledGames||0} scheduled · {gameSimulation?.simulatedGames||0} simulated · {gameSimulation?.finalGames||0} final</div>{gameSimulation?.message&&<div className="mt-3 text-sm">{gameSimulation.message}</div>}{gameSimulation?.failures.slice(0,5).map((failure)=><div key={failure.game_id} className="mt-2 rounded border border-red-600 bg-red-950/40 p-3 text-sm text-red-300">Game {failure.game_id} ({failure.home} vs {failure.away}): {failure.error}</div>)}{gameSimulation&&gameSimulation.failures.length>5&&<div className="mt-2 text-sm text-red-300">And {gameSimulation.failures.length-5} more invalid games.</div>}{gameError&&<div className="mt-3 rounded border border-red-600 bg-red-950/40 p-3 text-sm text-red-400">{gameError}</div>}<button type="button" disabled={Boolean(preseasonBusy)} onClick={()=>void runPreseasonAction("complete")} className="mt-4 rounded bg-indigo-700 px-4 py-2 font-semibold text-white disabled:opacity-40">{preseasonBusy==="complete"?"Finishing...":"Complete Preseason"}</button></div>}
            {preseason.message&&<div className="mt-4 rounded border border-green-600 bg-green-950/40 p-3 text-sm text-green-300">{preseason.message}</div>}
            {preseasonError&&<div className="mt-4 rounded border border-red-600 bg-red-950/40 p-3 text-sm text-red-400">{preseasonError}</div>}
          </Border>}
          {activeTab === "schedules" && scheduleGeneration&&<Border classes="p-4 mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">College Schedule Generation</h2>
                <div className="mt-1 text-sm opacity-70">Season {scheduleGeneration.season}: Stage 1 has {scheduleGeneration.stage1Games} games, Stage 2 has {scheduleGeneration.stage2Games}, and Stage 3 has {scheduleGeneration.stage3Games}.</div>
                {scheduleGeneration.pendingRequests>0&&<div className="mt-2 text-sm text-amber-400">Stage 3 is unavailable while {scheduleGeneration.pendingRequests} game request{scheduleGeneration.pendingRequests===1?"":"s"} remain pending.</div>}
                {scheduleGeneration.message&&<div className="mt-2 text-sm text-green-500">{scheduleGeneration.message}</div>}
                {scheduleGenerationError&&<div className="mt-2 rounded border border-red-600 bg-red-950/40 p-3 text-sm text-red-400"><strong>Schedule generation error:</strong> {scheduleGenerationError}</div>}
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" disabled={Boolean(scheduleGenerationBusy)} onClick={()=>void runScheduleStage(1)} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{scheduleGenerationBusy===1?"Running Stage 1...":"Run Stage 1"}</button>
                <button type="button" disabled={Boolean(scheduleGenerationBusy)||!scheduleGeneration.stage3Ready} onClick={()=>void runScheduleStage(3)} className="rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40">{scheduleGenerationBusy===3?"Running Stage 3...":"Run Stage 3"}</button>
              </div>
            </div>
          </Border>}
          {activeTab === "schedules" && <Border classes="p-4 mb-6">
            <h2 className="mb-3 text-xl font-semibold">Pending Non-Conference Games</h2>
            {scheduleRequests.length===0?<p>No games are awaiting admin approval.</p>:scheduleRequests.map((request)=><div key={request.id} className="flex flex-col gap-3 border-t py-3 md:flex-row md:items-center md:justify-between">
              <div><strong>{getLacrosseSeasonYear(request.season)} · {request.gameContext==="preseason"?"Preseason ":""}Week {request.week}</strong><div className="text-sm opacity-80">{request.homeTeamId===request.sendingTeam.id?request.sendingTeam.name:request.receivingTeam.name} vs {request.awayTeamId===request.sendingTeam.id?request.sendingTeam.name:request.receivingTeam.name}</div></div>
              <div className="flex gap-2"><button type="button" disabled={scheduleRequestBusy===request.id} onClick={()=>void decideScheduleRequest(request.id,true)} className="rounded bg-green-600 px-4 py-2 font-semibold text-white disabled:opacity-50">Approve</button><button type="button" disabled={scheduleRequestBusy===request.id} onClick={()=>void decideScheduleRequest(request.id,false)} className="rounded bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-50">Deny</button></div>
            </div>)}
          </Border>}
          {activeTab === "applications" && <Border classes="p-4">
              <h2 className="mb-3 text-xl font-semibold">Coaching Requests</h2>
              {claims.length === 0 ? (
                <p>No pending requests.</p>
              ) : (
                claims.map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between gap-3 border-t py-3">
                    <div>
                      <strong>{claim.teamName}</strong>
                      <div className="text-sm opacity-70">{claim.applicantName || claim.applicantEmail || claim.firebaseUid}</div>
                    </div>
                    <div className="flex gap-3">
                      <button className="rounded bg-green-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={claimBusy !== undefined} onClick={() => void decide(claim.id, true)}>{claimBusy === claim.id ? "Working..." : "Accept"}</button>
                      <button className="rounded bg-red-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={claimBusy !== undefined} onClick={() => void decide(claim.id, false)}>{claimBusy === claim.id ? "Working..." : "Deny"}</button>
                    </div>
                  </div>
                ))
              )}
            </Border>}
            {activeTab === "admins" && <Border classes="p-4">
              <h2 className="mb-3 text-xl font-semibold">SimLAX administrators</h2>
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between gap-3 border-t py-3">
                  <div><strong>{admin.email}</strong><div className="text-sm opacity-70">{admin.role === "super_admin" ? "Super Admin" : "Admin"}</div></div>
                  {access.role === "super_admin" && admin.role !== "super_admin" && <button type="button" onClick={() => void removeAdmin(admin)} className="rounded bg-red-700 px-4 py-2 text-white hover:bg-red-800">Remove</button>}
                </div>
              ))}
              {access.role === "super_admin" && (
                <form className="mt-4 flex gap-2" onSubmit={add}>
                  <input className="min-w-0 flex-1 border p-2 text-black" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Verified account email" />
                  <button className="border px-4" type="submit">Appoint Admin</button>
                </form>
              )}
            </Border>}
        </>
      )}
      <RemoveUserModal
        isOpen={Boolean(removingTeam)}
        onClose={() => setRemovingTeam(undefined)}
        title={`Remove coach from ${removingTeam?.teamName || "team"}?`}
        actions={
          <div className="flex gap-3">
            <button className="border px-4 py-2" type="button" onClick={() => setRemovingTeam(undefined)}>Cancel</button>
            <button className="rounded bg-red-700 px-4 py-2 text-white hover:bg-red-800" type="button" onClick={() => void removeCoach()}>Remove Coach</button>
          </div>
        }
      >
        <p className="mb-4 text-start">
          This releases the team immediately. The removed coach will need to apply again to coach this or another team.
        </p>
        <p className="text-start">Are you sure you want to continue?</p>
      </RemoveUserModal>
    </>
  );

  if (embedded) return <div className="w-full">{content}</div>;
  return <PageContainer direction="col" title="SimLAX Admin Portal">{content}</PageContainer>;
};
