import { GetCall, GetExportCall, PostBase64Call, PostCall, PUTCall } from "../_helper/fetchHelper";
const base = import.meta.env.VITE_SIMLAX_API_URL?.trim().replace(/\/+$/, "");
if (!base) {
  throw new Error("VITE_SIMLAX_API_URL must be configured for SimLAX.");
}
const apiOrigin = base.replace(/\/api\/v1\/?$/, "");
export const getLaxLogoUrl = (fileName?: string) =>
  fileName ? `${apiOrigin}/static/team-logos/${encodeURIComponent(fileName)}` : "";
export const getLaxConferenceLogoUrl = (abbreviation?: string) =>
  abbreviation ? `${apiOrigin}/static/conference-logos/${encodeURIComponent(abbreviation)}.png` : "";
const scheduleUrl = (teamId?:number,season?:number) => {
  const params=new URLSearchParams();
  if(teamId)params.set("team_id",String(teamId));
  if(season)params.set("season",String(season));
  return `${base}/schedule?${params}`;
};
export interface LaxTeam { id:number; name:string; nickname:string; abbreviation?:string; city:string; state?:string; venue?:string; coach?:string; logoFileName?:string; jerseyStyle?:string; conference?:{id:number;name:string;abbreviation?:string}; colors:{primary?:string;secondary?:string;tertiary?:string}; isUserControlled:boolean }
export interface LaxPreviewPlayer { id:number; firstName:string; lastName:string; position:string; overall:number; overallGrade:string }
export interface LaxTeamPreview { team:LaxTeam; topPlayers:LaxPreviewPlayer[]; overallGrade?:string; offenseGrade?:string; defenseGrade?:string; overallWins:number; overallLosses:number; currentWins:number; currentLosses:number; conferenceChampionshipYears:number[]; nationalChampionshipYears:number[] }
export interface LaxPlayer { id:number; firstName:string; lastName:string; position:string; archetype:string; age:number; year:number; state?:string; country:string; stars:number; ratings:{overall:number;speed:number;faceoff:number;shotPower:number;shotAccuracy:number;passing:number;handling:number;bodyCheck:number;stickCheck:number;goalieBlocking:number;goalieVision:number;laxiq:number;stamina:number}; grades:{overall:string;potential:string;speed:string;faceoff:string;shotPower:string;shotAccuracy:string;passing:string;handling:string;bodyCheck:string;stickCheck:string;goalieBlocking:string;goalieVision:string;laxiq:string}; injury:{injuryRating:number;isInjured:boolean;name?:string;injuryType?:string;recoveryWeeks?:number}; faceData:Record<string,unknown>; roster:{position:string;isStarter:boolean;starterSlot?:number;midfieldRole?:string;fogoDepth?:number;fogoStrategy?:string;usage?:number;longShotProportion?:number;closeShotProportion?:number} }
export interface LaxGameplan { teamId:number; pace?:string; defensiveStyle?:string; offensiveStyle?:string; preserveTimeouts:boolean; trigger2Enabled:boolean; trigger2Value:number; trigger3Enabled:boolean; trigger3Value?:number; trigger3Exhaustion:number; trigger4Enabled:boolean; trigger4Value:number }
export interface LaxClaim { id:number; teamId:number; league:"college"; status:"pending"|"approved"|"rejected"|"withdrawn" }
export interface LaxLineupAssignment { playerId:number; isStarter:boolean; starterSlot?:number; midfieldRole?:string; fogoDepth?:number; fogoStrategy?:string; usage?:number; longShotProportion?:number; closeShotProportion?:number }
export interface LaxRosterResponse { team:LaxTeam; players:LaxPlayer[]; aiControl:boolean }
export type LaxGameContext="preseason"|"regular_season";
export interface LaxScheduleGame { id:number;season:number;week:number;gameType:string;gameContext:LaxGameContext;status:string;isHome:boolean;isConferenceGame:boolean;conferenceAbbreviation?:string;opponent:LaxTeam;homeScore?:number;awayScore?:number;homeSeed?:number;awaySeed?:number;gameName?:string;isNeutral:boolean }
export type LaxScheduleRequestStatus="pending_receiver"|"pending_admin"|"approved"|"denied_receiver"|"denied_admin"|"superseded"|"cancelled";
export interface LaxScheduleRequest { id:number;season:number;week:number;gameContext:LaxGameContext;sendingTeam:LaxTeam;receivingTeam:LaxTeam;homeTeamId:number;awayTeamId:number;status:LaxScheduleRequestStatus;receiverIsAi:boolean;createdAt:string }
export interface LaxTentativeGame { requestId:number;season:number;week:number;gameContext:LaxGameContext;status:LaxScheduleRequestStatus;isHome:boolean;opponent:LaxTeam }
export interface LaxStanding { rank:number;team:LaxTeam;conferenceWins:number;conferenceLosses:number;totalWins:number;totalLosses:number }
export interface LaxConferenceStandings { conference:{id:number;name:string;abbreviation?:string};standings:LaxStanding[] }
export interface LaxTournamentGame { id:number;week:number;tournamentRound:number;bracketSlot:number;gameName?:string;status:string;homeTeam:LaxTeam;awayTeam:LaxTeam;homeSeed:number;awaySeed:number;homeScore?:number;awayScore?:number }
export interface LaxConferenceTournamentBracket { conference:{id:number;name:string;abbreviation?:string};roundCount:number;games:LaxTournamentGame[] }
export interface LaxConferenceTournamentBracketsResponse { season:number;brackets:LaxConferenceTournamentBracket[] }
export interface LaxNationalTournamentBracketResponse { season:number;roundCount:number;games:LaxTournamentGame[] }
export interface LaxScheduleResponse { team:LaxTeam;seasons:number[];seasonYears:Record<number,number>;selectedSeason:number;currentWeek:number;seasonPhase:string;preseasonEnabled:boolean;preseasonGamesPerTeam:number;preseasonSchedulingOpen:boolean;regularSeasonSchedulingOpen:boolean;hasConferenceTournament:boolean;hasNationalTournament:boolean;games:LaxScheduleGame[];tentativeGames:LaxTentativeGame[];receivedRequests:LaxScheduleRequest[];standings:LaxStanding[];conferenceStandings:LaxConferenceStandings[] }
export interface LaxTeamBoxScore { team:LaxTeam;period1:number;period2:number;period3:number;period4:number;overtime:number;finalScore:number;shots:number;shotsOnGoal:number;groundBalls:number;causedTurnovers:number;turnovers:number;faceoffsTaken:number;faceoffsWon:number;saves:number;penalties:number;penaltyMinutes:number;manUpOpportunities:number;manUpGoals:number;clearAttempts:number;successfulClears:number }
export interface LaxPlayerBoxScore { playerId:number;teamId:number;firstName:string;lastName:string;position:string;minutesPlayed:number;goals:number;assists:number;points:number;shots:number;shotsOnGoal:number;groundBalls:number;causedTurnovers:number;turnovers:number;faceoffsTaken:number;faceoffsWon:number;saves:number;goalsAllowed:number;penalties:number;penaltyMinutes:number;fouledOut:boolean }
export interface LaxGameBoxScore { gameId:number;season:number;week:number;gameContext:LaxGameContext;status:string;home:LaxTeamBoxScore;away:LaxTeamBoxScore;players:LaxPlayerBoxScore[] }
export interface LaxPlayByPlayEvent { id:number;playNumber:number;homeTeamScore:number;awayTeamScore:number;possessionNumber?:number;period:number;timeRemaining:number;shotClockRemaining:number;playDuration:number;possessionTeamId?:number;actionTeamId?:number;actionType:string;outcomeType?:string;primaryPlayerId?:number;secondaryPlayerId?:number;defendingPlayerId?:number;isGoal:boolean;isInjury:boolean;isPenalty:boolean;playRemark:string;fieldPos:string;fieldArea:string;fieldX?:number;fieldY?:number }
export interface LaxGamePlayByPlay { gameId:number;seasonId:number;seasonYear:number;week:number;status:string;homeTeamId:number;awayTeamId:number;homeTeamScore?:number;awayTeamScore?:number;plays:LaxPlayByPlayEvent[] }
export interface LaxWeeklyGame { id:number;season:number;week:number;gameContext:LaxGameContext;status:string;homeTeam:LaxTeam;awayTeam:LaxTeam;homeScore?:number;awayScore?:number;gameName?:string;isNeutral:boolean;isConferenceGame:boolean;isCt:boolean;isNt:boolean }
export interface LaxWeeklyScheduleResponse { season:number;week:number;games:LaxWeeklyGame[] }
export const LacrosseService={
 getTeams:()=>GetCall<{teams:LaxTeam[]}>(`${base}/teams?league=college`),
 getPreview:(id:number)=>GetCall<LaxTeamPreview>(`${base}/teams/${id}/preview?league=college`),
 getRoster:(id:number)=>GetCall<LaxRosterResponse>(`${base}/teams/${id}/roster?league=college`),
 saveLineup:(id:number,assignments:LaxLineupAssignment[],adminMode=false)=>PostCall<{assignments:LaxLineupAssignment[]},LaxRosterResponse>(`${base}/teams/${id}/lineup?admin_mode=${adminMode}`,{assignments}),
 autoLineup:(id:number,adminMode=false)=>PostCall<Record<string,never>,LaxRosterResponse>(`${base}/teams/${id}/lineup/auto?admin_mode=${adminMode}`,{}),
 setAiControl:(id:number,enabled:boolean,adminMode=false)=>PostCall<{enabled:boolean},LaxRosterResponse>(`${base}/teams/${id}/lineup/ai-control?admin_mode=${adminMode}`,{enabled}),
 getGameplan:(id:number,adminMode=false)=>GetCall<LaxGameplan>(`${base}/teams/${id}/gameplan?league=college&admin_mode=${adminMode}`),
 saveGameplan:(id:number,gameplan:Omit<LaxGameplan,"teamId">,adminMode=false)=>PostCall<Omit<LaxGameplan,"teamId">,LaxGameplan>(`${base}/teams/${id}/gameplan?admin_mode=${adminMode}`,gameplan),
 getMyClaim:()=>GetCall<LaxClaim|null>(`${base}/team-claims/me?league=college`),
 getUserTeam:(firebaseUid:string)=>GetCall<LaxTeam|null>(`${base}/team-claims/user/${encodeURIComponent(firebaseUid)}/team`),
 getSchedule:(teamId?:number,season?:number)=>GetCall<LaxScheduleResponse>(scheduleUrl(teamId,season)),
 getGameBoxScore:(gameId:number)=>GetCall<LaxGameBoxScore>(`${base}/schedule/games/${gameId}/box-score`),
 getGamePlayByPlay:(gameId:number)=>GetCall<LaxGamePlayByPlay>(`${base}/schedule/games/${gameId}/play-by-play`),
 getWeeklySchedule:(season:number,week:number)=>GetCall<LaxWeeklyScheduleResponse>(`${base}/schedule/weekly?season=${season}&week=${week}`),
 getConferenceTournamentBrackets:(season:number)=>GetCall<LaxConferenceTournamentBracketsResponse>(`${base}/schedule/conference-tournaments?season=${season}`),
 getNationalTournamentBracket:(season:number)=>GetCall<LaxNationalTournamentBracketResponse>(`${base}/schedule/national-tournament?season=${season}`),
 getAvailableOpponents:(teamId:number,season:number,week:number,gameContext:LaxGameContext="regular_season")=>GetCall<LaxTeam[]>(`${base}/schedule/available-opponents?team_id=${teamId}&season=${season}&week=${week}&game_context=${gameContext}`),
 sendScheduleRequest:(season:number,week:number,receivingTeamId:number,venue:"home"|"away",gameContext:LaxGameContext="regular_season")=>PostCall<{season:number;week:number;receiving_team_id:number;venue:"home"|"away";game_context:LaxGameContext},LaxScheduleRequest>(`${base}/schedule/requests`,{season,week,receiving_team_id:receivingTeamId,venue,game_context:gameContext}),
 acceptScheduleRequest:(requestId:number)=>PostCall<Record<string,never>,LaxScheduleRequest>(`${base}/schedule/requests/${requestId}/accept`,{}),
 denyScheduleRequest:(requestId:number)=>PostCall<Record<string,never>,LaxScheduleRequest>(`${base}/schedule/requests/${requestId}/deny`,{}),
 cutPlayer:(teamId:number,playerId:number)=>PostCall<Record<string,never>,{status:"cut";player_id:number}>(`${base}/teams/${teamId}/players/${playerId}/cut`,{}),
 requestTeam:(id:number,coachName:string)=>PostCall<{league:"college";team_id:number;coach_name:string},LaxClaim>(`${base}/team-claims`,{league:"college",team_id:id,coach_name:coachName}),
 quitTeam:()=>PostCall<Record<string,never>,{status:string;teamId:number}>(`${base}/team-claims/quit`,{}),
};

export interface LaxAdminClaim { id:number; teamId:number; teamName:string; firebaseUid:string; applicantEmail?:string; applicantName?:string; status:string }
export type LaxAdminRole="admin"|"super_admin";
export interface LaxAdmin { id:number; email:string; role:LaxAdminRole; isActive:boolean }
export interface LaxAdminStatus { isAdmin:boolean; role:LaxAdminRole; capabilities:string[] }
export interface LaxAdminConference { id:number; name:string; abbreviation:string }
export interface LaxAdminCollegeTeam { id:number; team:string; nickname:string; abbreviation:string; whtLogo:boolean; city:string; state:string; conferenceId:number; conferenceName:string; arena?:string; colorOne?:string; colorTwo?:string; colorThree?:string; jerseyStyle?:string; logoFileName:string; rosterCount:number }
export interface LaxAdminCollegeTeamDirectory { teams:LaxAdminCollegeTeam[]; conferences:LaxAdminConference[] }
export interface LaxAdminCollegeTeamWrite { team:string; nickname:string; abbreviation:string; whtLogo:boolean; city:string; state:string; conferenceId:number; arena:string; colorOne:string; colorTwo:string; colorThree?:string; jerseyStyle:string }
export interface LaxAdminCollegeTeamRosterGeneration { teamId:number; teamName:string; playerCount:number; oneStarPlayers:number; twoStarPlayers:number }
interface LaxAdminCollegeTeamApiWrite { team:string; nickname:string; abbreviation:string; wht_logo:boolean; city:string; state:string; conference_id:number; arena:string; color_one:string; color_two:string; color_three?:string; jersey_style:string }
const teamWritePayload = (team: LaxAdminCollegeTeamWrite): LaxAdminCollegeTeamApiWrite => ({
 team:team.team,nickname:team.nickname,abbreviation:team.abbreviation,wht_logo:team.whtLogo,city:team.city,state:team.state,
 conference_id:team.conferenceId,arena:team.arena,color_one:team.colorOne,color_two:team.colorTwo,
 color_three:team.colorThree || undefined,jersey_style:team.jerseyStyle,
});
export interface LaxCoachedTeam { teamId:number; teamName:string; coach:string; firebaseUid:string; applicantEmail?:string; lastActivityAt?:string }
export interface LaxBadNoodle { teamId:number; teamName:string; abbreviation:string; coach:string; email?:string; reasons:string[]; lastActivityAt?:string; lastRecruitingActivityAt?:string; lastRecruitingWeek?:number; inactiveRecruitingWeeks:number; lineupFailureCount:number }
export interface LaxScheduledJob { key:string; name:string; enabled:boolean; lastRunAt?:string; lastStatus?:"running"|"success"|"failed"; lastMessage?:string; lastRunBy?:string }
export interface LaxScheduleGenerationStatus { season:number;pendingRequests:number;stage1Games:number;stage2Games:number;stage3Games:number;stage3Ready:boolean;message?:string }
export interface LaxPreseasonTeamStatus { teamId:number;teamName:string;abbreviation:string;scheduledGames:number }
export interface LaxPreseasonStatus { season:number;phase:string;decisionMade:boolean;enabled?:boolean;gamesPerTeam?:number;schedulingClosed:boolean;pendingRequests:number;scheduledGames:number;teamsBelowLimit:LaxPreseasonTeamStatus[];canGenerateRemaining:boolean;canCloseScheduling:boolean;message?:string }
export interface LaxGameSimulationStatus { season:number;week:number;officialSeason:number;officialWeek:number;officialOffseason:boolean;canEndSeason:boolean;scheduledGames:number;simulatedGames:number;finalGames:number;running:boolean;completedGames:number;failedGames:number;message?:string;failures:Array<{game_id:number;home:string;away:string;error:string}> }
export interface LaxWeekAdvanceStatus { season:number;previousWeek:number;week:number;message:string;offseason:boolean }
export interface LaxRosterLimitTeam { teamId:number;teamName:string;abbreviation:string;rosterCount:number;isUserCoached:boolean }
export interface LaxOffseasonSummary { season:number;phase:string;transferPortalStatus:string;earlyDeclarationsStatus:string;progressionsStatus:string;graduationsStatus:string;recruitEnrollmentStatus:string;remainingRecruitsStatus:string;walkonGenerationStatus:string;cutsStatus:string;canRunProgressions:boolean;canRunGraduations:boolean;canRunRecruitEnrollment:boolean;canAssignRemainingRecruits:boolean;canGenerateWalkons:boolean;canRunCuts:boolean;canStartNewSeason:boolean;playerCount:number;totalAttributeGain:number;averageAttributeGain:number;averageOverallChange:number;unchangedOverall:number;maximumOverallChange:number;alreadyRun:boolean;graduationCount:number;graduationLineupAssignments:number;graduationsAlreadyRun:boolean;enrollmentCount:number;recruitEnrollmentAlreadyRun:boolean;remainingRecruitsAssigned:number;remainingRecruitSlots:number;remainingRecruitCandidates:number;priorityRecruitCandidates:number;remainingRecruitsAlreadyRun:boolean;walkonsNeeded:number;underLimitTeams:number;walkonsAlreadyRun:boolean;cutCount:number;cutsAlreadyRun:boolean;overLimitTeams:LaxRosterLimitTeam[];leftoverRecruits:number;newRecruitCount:number;message?:string }
export interface LaxSeasonRolloverResult { previousSeason:number;season:number;week:number;classKey:string;leftoverRecruitsRemoved:number;recruitsGenerated:number;message:string }
export interface LaxConferenceTournamentTeam { teamId:number;teamName:string;abbreviation:string;conferenceWins:number;conferenceLosses:number;totalWins:number;totalLosses:number;goalDifferential:number;seed?:number }
export interface LaxConferenceTournamentRound { roundNumber:number;name:string;isNeutral:boolean }
export interface LaxConferenceTournament { conferenceId:number;conferenceName:string;conferenceAbbreviation:string;teamCount:number;roundCount:number;confirmed:boolean;rounds:LaxConferenceTournamentRound[];teams:LaxConferenceTournamentTeam[] }
export interface LaxConferenceTournamentStatus { season:number;allConfirmed:boolean;conferences:LaxConferenceTournament[] }
export interface LaxNationalTournamentTeam { teamId:number;teamName:string;abbreviation:string;conferenceAbbreviation:string;totalWins:number;totalLosses:number;goalDifferential:number;automaticQualifier:boolean;seed?:number }
export interface LaxNationalTournament { season:number;teamCount:number;roundCount:number;confirmed:boolean;selectionReady:boolean;rounds:LaxConferenceTournamentRound[];teams:LaxNationalTournamentTeam[] }
export interface LaxRecruitLeader { teamId:number; teamName:string; abbreviation:string; logoFileName?:string; totalPoints:number; scholarship:boolean; prediction:string }
export interface LaxRecruit { id:number; firstName:string; lastName:string; position:string; archetype:string; stars:number; state?:string; country:string; overall:string; potential:string; signingExpectation:string; status:string; recruitStatus:string; committedTeamId?:number; committedTeamName?:string; committedTeamAbbreviation?:string; leaders:LaxRecruitLeader[]; faceData:Record<string,unknown>; onBoard:boolean }
export interface LaxBoardRecruit extends LaxRecruit { boardId:number; currentWeekPoints:number; totalPoints:number; scholarship:boolean; scholarshipRevoked:boolean; isLocked:boolean }
export interface LaxRecruitingRosterCount { position:string; freshman:number; sophomore:number; junior:number; senior:number; fifthYear:number; total:number }
export interface LaxRecruitingAISettings { enabled:boolean; starMin:number; starMax:number; pointsMin:number; pointsMax:number }
export interface LaxRecruitingTeamInfo { teamId:number; schoolName:string; abbreviation:string; recruiter:string; state:string; primaryColor:string; weeklyPoints:number; spentPoints:number; maxScholarships:number; spotsRemaining:number; aiSettings:LaxRecruitingAISettings; rosterCounts:LaxRecruitingRosterCount[] }
export interface LaxRecruitingOverview { batchId:number; classKey:string; team:LaxRecruitingTeamInfo; recruits:LaxRecruit[] }
export interface LaxRecruitingBoard { team:LaxRecruitingTeamInfo; recruits:LaxBoardRecruit[] }
export interface LaxRecruitingRanking { rank:number; teamId:number; team:string; logoFileName?:string; coach:string; conference:string; signees:number; fiveStars:number; fourStars:number; threeStars:number; score:number }
export interface LaxRecruitingRankings { batchId:number; classKey:string; rankings:LaxRecruitingRanking[] }
export type LaxStatisticsCategory = "field" | "goalie";
export type LaxStatisticsType = "player" | "team";
export interface LaxStatisticsResponse { team:LaxTeam; seasons:number[]; seasonYears:Record<number,number>; selectedSeason:number; selectedWeek?:number; statsView:"season"|"week"; statsCategory:LaxStatisticsCategory; statsType:LaxStatisticsType; rows:Array<Record<string,string|number|null>> }
export interface LaxPlayerCareerStatRow { season?:number; teamId?:number; teamAbbreviation?:string; gamesPlayed:number; goals:number; assists:number; points:number; shootingPercentage?:number; groundBalls:number; causedTurnovers:number; turnovers:number; faceoffPercentage?:number; saves:number; goalsAllowed:number; savePercentage?:number; outletAttempts:number; outletsCompleted:number; outletTurnovers:number }
export interface LaxPlayerCareerStatistics { playerId:number; category:LaxStatisticsCategory; seasonYears:Record<number,number>; seasons:LaxPlayerCareerStatRow[]; career:LaxPlayerCareerStatRow }
export interface LaxNewsItem { id:number;week:number;season:number;league:string;teamId?:number;messageType:string;message:string;createdAt:string }
export interface LaxNewsResponse { currentSeason:number;currentWeek:number;team:LaxTeam|null;teams:LaxTeam[];news:LaxNewsItem[] }
export const LacrosseAdminService={
 getStatus:()=>GetCall<LaxAdminStatus>(`${base}/admin/status`),
 getClaims:()=>GetCall<LaxAdminClaim[]>(`${base}/admin/claims`),
 getAdmins:()=>GetCall<LaxAdmin[]>(`${base}/admin/administrators`),
 getCollegeTeams:()=>GetCall<LaxAdminCollegeTeamDirectory>(`${base}/admin/college-teams`),
 createCollegeTeam:(team:LaxAdminCollegeTeamWrite)=>PostCall<LaxAdminCollegeTeamApiWrite,LaxAdminCollegeTeam>(`${base}/admin/college-teams`,teamWritePayload(team)),
 updateCollegeTeam:(teamId:number,team:LaxAdminCollegeTeamWrite)=>PUTCall<LaxAdminCollegeTeamApiWrite,LaxAdminCollegeTeam>(`${base}/admin/college-teams/${teamId}`,teamWritePayload(team)),
 uploadCollegeTeamLogo:(teamId:number,imageBase64:string)=>PostBase64Call<LaxAdminCollegeTeam>(`${base}/admin/college-teams/${teamId}/logo`,imageBase64),
 generateCollegeTeamRoster:(teamId:number)=>PostCall<Record<string,never>,LaxAdminCollegeTeamRosterGeneration>(`${base}/admin/college-teams/${teamId}/generate-roster`,{}),
 getCoachedTeams:()=>GetCall<LaxCoachedTeam[]>(`${base}/admin/teams`),
 getBadNoodles:()=>GetCall<LaxBadNoodle[]>(`${base}/admin/bad-noodles`),
 getAiLineupJob:()=>GetCall<LaxScheduledJob>(`${base}/admin/jobs/college-ai-lineups`),
 setAiLineupJob:(enabled:boolean)=>PostCall<{enabled:boolean},LaxScheduledJob>(`${base}/admin/jobs/college-ai-lineups`,{enabled}),
 runAiLineupJob:()=>PostCall<Record<string,never>,LaxScheduledJob>(`${base}/admin/jobs/college-ai-lineups/run`,{}),
 getAiRecruitingJob:()=>GetCall<LaxScheduledJob>(`${base}/admin/jobs/college-ai-recruiting`),
 setAiRecruitingJob:(enabled:boolean)=>PostCall<{enabled:boolean},LaxScheduledJob>(`${base}/admin/jobs/college-ai-recruiting`,{enabled}),
 runAiRecruitingJob:()=>PostCall<Record<string,never>,LaxScheduledJob>(`${base}/admin/jobs/college-ai-recruiting/run`,{}),
 getRecruitingSyncJob:()=>GetCall<LaxScheduledJob>(`${base}/admin/jobs/college-recruiting-sync`),
 setRecruitingSyncJob:(enabled:boolean)=>PostCall<{enabled:boolean},LaxScheduledJob>(`${base}/admin/jobs/college-recruiting-sync`,{enabled}),
 runRecruitingSyncJob:()=>PostCall<Record<string,never>,LaxScheduledJob>(`${base}/admin/jobs/college-recruiting-sync/run`,{}),
 getSimulateWeekJob:()=>GetCall<LaxScheduledJob>(`${base}/admin/jobs/college-simulate-week`),
 setSimulateWeekJob:(enabled:boolean)=>PostCall<{enabled:boolean},LaxScheduledJob>(`${base}/admin/jobs/college-simulate-week`,{enabled}),
 getPublishResultsJob:()=>GetCall<LaxScheduledJob>(`${base}/admin/jobs/college-publish-results`),
 setPublishResultsJob:(enabled:boolean)=>PostCall<{enabled:boolean},LaxScheduledJob>(`${base}/admin/jobs/college-publish-results`,{enabled}),
 getAdvanceWeekJob:()=>GetCall<LaxScheduledJob>(`${base}/admin/jobs/college-advance-week`),
 setAdvanceWeekJob:(enabled:boolean)=>PostCall<{enabled:boolean},LaxScheduledJob>(`${base}/admin/jobs/college-advance-week`,{enabled}),
 getScheduleRequests:()=>GetCall<LaxScheduleRequest[]>(`${base}/admin/schedule-requests`),
 getScheduleGenerationStatus:()=>GetCall<LaxScheduleGenerationStatus>(`${base}/admin/schedule-generation`),
 getPreseason:()=>GetCall<LaxPreseasonStatus>(`${base}/admin/preseason`),
 decidePreseason:(enabled:boolean,gamesPerTeam:number)=>PostCall<{enabled:boolean;games_per_team:number},LaxPreseasonStatus>(`${base}/admin/preseason/decision`,{enabled,games_per_team:gamesPerTeam}),
 generateRemainingPreseason:()=>PostCall<Record<string,never>,LaxPreseasonStatus>(`${base}/admin/preseason/generate-remaining`,{}),
 closePreseason:()=>PostCall<Record<string,never>,LaxPreseasonStatus>(`${base}/admin/preseason/close`,{}),
 completePreseason:()=>PostCall<Record<string,never>,LaxPreseasonStatus>(`${base}/admin/preseason/complete`,{}),
 runScheduleStage1:()=>PostCall<Record<string,never>,LaxScheduleGenerationStatus>(`${base}/admin/schedule-generation/stage-1`,{}),
 runScheduleStage3:()=>PostCall<Record<string,never>,LaxScheduleGenerationStatus>(`${base}/admin/schedule-generation/stage-3`,{}),
 getGameSimulationStatus:(season?:number,week?:number,gameContext:LaxGameContext="regular_season")=>GetCall<LaxGameSimulationStatus>(`${base}/admin/game-simulation${season&&week?`?season=${season}&week=${week}&game_context=${gameContext}`:""}`),
 preflightGameWeek:(season:number,week:number,gameContext:LaxGameContext="regular_season")=>PostCall<{season:number;week:number;game_context:LaxGameContext},LaxGameSimulationStatus>(`${base}/admin/game-simulation/preflight`,{season,week,game_context:gameContext}),
 runGameWeek:(season:number,week:number,gameContext:LaxGameContext="regular_season")=>PostCall<{season:number;week:number;game_context:LaxGameContext},LaxGameSimulationStatus>(`${base}/admin/game-simulation/run`,{season,week,game_context:gameContext}),
 publishGameWeek:(season:number,week:number,gameContext:LaxGameContext="regular_season")=>PostCall<{season:number;week:number;game_context:LaxGameContext},LaxGameSimulationStatus>(`${base}/admin/game-simulation/publish`,{season,week,game_context:gameContext}),
 advanceGameWeek:(season:number,week:number)=>PostCall<{season:number;week:number},LaxWeekAdvanceStatus>(`${base}/admin/game-simulation/advance-week`,{season,week}),
 endGameSeason:(season:number,week:number)=>PostCall<{season:number;week:number},LaxWeekAdvanceStatus>(`${base}/admin/game-simulation/end-season`,{season,week}),
 getOffseason:()=>GetCall<LaxOffseasonSummary>(`${base}/admin/offseason`),
 skipOffseasonPhase:()=>PostCall<Record<string,never>,LaxOffseasonSummary>(`${base}/admin/offseason/skip-current-phase`,{}),
 previewProgressions:()=>PostCall<Record<string,never>,LaxOffseasonSummary>(`${base}/admin/offseason/progressions/preview`,{}),
 exportProgressionPreview:()=>GetExportCall<Blob>(`${base}/admin/offseason/progressions/export-preview`,"blob"),
 runProgressions:()=>PostCall<Record<string,never>,LaxOffseasonSummary>(`${base}/admin/offseason/progressions/run`,{}),
 runGraduations:()=>PostCall<Record<string,never>,LaxOffseasonSummary>(`${base}/admin/offseason/graduations/run`,{}),
 runRecruitEnrollment:()=>PostCall<Record<string,never>,LaxOffseasonSummary>(`${base}/admin/offseason/recruit-enrollment/run`,{}),
 runWalkonGeneration:()=>PostCall<Record<string,never>,LaxOffseasonSummary>(`${base}/admin/offseason/walkons/run`,{}),
 runRemainingRecruitAssignment:()=>PostCall<Record<string,never>,LaxOffseasonSummary>(`${base}/admin/offseason/remaining-recruits/run`,{}),
 runRosterCuts:()=>PostCall<Record<string,never>,LaxOffseasonSummary>(`${base}/admin/offseason/cuts/run`,{}),
 startNewSeason:(recruitCount:number)=>PostCall<{recruit_count:number},LaxSeasonRolloverResult>(`${base}/admin/offseason/start-new-season`,{recruit_count:recruitCount}),
 getConferenceTournaments:()=>GetCall<LaxConferenceTournamentStatus>(`${base}/admin/conference-tournaments`),
 saveConferenceTournament:(conferenceId:number,teamCount:number,teamIds:number[],neutralRounds:boolean[])=>PUTCall<{team_count:number;team_ids:number[];neutral_rounds:boolean[]},LaxConferenceTournamentStatus>(`${base}/admin/conference-tournaments/${conferenceId}`,{team_count:teamCount,team_ids:teamIds,neutral_rounds:neutralRounds}),
 confirmConferenceTournament:(conferenceId:number,teamCount:number,teamIds:number[],neutralRounds:boolean[])=>PostCall<{team_count:number;team_ids:number[];neutral_rounds:boolean[]},LaxConferenceTournamentStatus>(`${base}/admin/conference-tournaments/${conferenceId}/confirm`,{team_count:teamCount,team_ids:teamIds,neutral_rounds:neutralRounds}),
 getNationalTournament:()=>GetCall<LaxNationalTournament>(`${base}/admin/national-tournament`),
 saveNationalTournament:(teamCount:number,teamIds:number[],neutralRounds:boolean[])=>PUTCall<{team_count:number;team_ids:number[];neutral_rounds:boolean[]},LaxNationalTournament>(`${base}/admin/national-tournament`,{team_count:teamCount,team_ids:teamIds,neutral_rounds:neutralRounds}),
 confirmNationalTournament:(teamCount:number,teamIds:number[],neutralRounds:boolean[])=>PostCall<{team_count:number;team_ids:number[];neutral_rounds:boolean[]},LaxNationalTournament>(`${base}/admin/national-tournament/confirm`,{team_count:teamCount,team_ids:teamIds,neutral_rounds:neutralRounds}),
 approveScheduleRequest:(requestId:number)=>PostCall<Record<string,never>,LaxScheduleRequest>(`${base}/admin/schedule-requests/${requestId}/approve`,{}),
 denyScheduleRequest:(requestId:number)=>PostCall<Record<string,never>,LaxScheduleRequest>(`${base}/admin/schedule-requests/${requestId}/deny`,{}),
 approve:(id:number)=>PostCall<Record<string,never>,LaxAdminClaim>(`${base}/admin/claims/${id}/approve`,{}),
 reject:(id:number)=>PostCall<Record<string,never>,{status:string}>(`${base}/admin/claims/${id}/reject`,{}),
 removeCoach:(teamId:number)=>PostCall<Record<string,never>,{status:string;teamId:number}>(`${base}/admin/teams/${teamId}/remove-coach`,{}),
 designate:(email:string)=>PostCall<{email:string},LaxAdmin>(`${base}/admin/administrators`,{email}),
 removeAdmin:(adminId:number)=>PostCall<Record<string,never>,{status:string;adminId:number}>(`${base}/admin/administrators/${adminId}/remove`,{}),
};

export const LacrosseRecruitingService={
 getOverview:()=>GetCall<LaxRecruitingOverview>(`${base}/recruiting/overview`),
 getBoard:()=>GetCall<LaxRecruitingBoard>(`${base}/recruiting/board`),
 getRankings:()=>GetCall<LaxRecruitingRankings>(`${base}/recruiting/rankings`),
 addToBoard:(recruitId:number)=>PostCall<Record<string,never>,{status:string;recruitId:number}>(`${base}/recruiting/board/${recruitId}`,{}),
 setPoints:(recruitId:number,points:number)=>PostCall<{points:number},{status:string;recruitId:number}>(`${base}/recruiting/board/${recruitId}/points`,{points}),
 savePoints:(allocations:Array<{recruitId:number;points:number}>)=>PUTCall<{allocations:Array<{recruitId:number;points:number}>},{status:string;spentPoints:number}>(`${base}/recruiting/board/points`,{allocations}),
 toggleScholarship:(recruitId:number)=>PostCall<Record<string,never>,{status:string;recruitId:number}>(`${base}/recruiting/board/${recruitId}/scholarship`,{}),
 removeFromBoard:(recruitId:number)=>PostCall<Record<string,never>,{status:string;recruitId:number}>(`${base}/recruiting/board/${recruitId}/remove`,{}),
 saveAiSettings:(settings:LaxRecruitingAISettings)=>PUTCall<LaxRecruitingAISettings,LaxRecruitingAISettings>(`${base}/recruiting/settings/ai`,settings),
};
export const LacrosseStatisticsService={
 get:(season:number|undefined,week:LaxStatisticsResponse["selectedWeek"],category:LaxStatisticsCategory,statsType:LaxStatisticsType)=>{
  const params=new URLSearchParams({category,stats_type:statsType});
  if(season)params.set("season",String(season));
  if(week)params.set("week",String(week));
  return GetCall<LaxStatisticsResponse>(`${base}/statistics?${params}`);
 },
 getPlayerCareer:(playerId:number)=>GetCall<LaxPlayerCareerStatistics>(`${base}/statistics/players/${playerId}/career`),
};
export const LacrosseNewsService={
 get:()=>GetCall<LaxNewsResponse>(`${base}/news`),
};
