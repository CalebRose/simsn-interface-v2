import { ReactElement } from "react";
import { Navigate, Route } from "react-router-dom";
import { AuthGuard } from "../guards/AuthGuards";
import { RootRoute } from "../components/Home/RootRoute";
import routes from "../_constants/routes";
import { NotFoundPage } from "../components/NotFound/NotFound";
import { AvailableTeams } from "../components/AvailableTeams/AvailableTeams";
import { AdminPage } from "../components/Admin/AdminPage";
import { ProfilePage } from "../components/Profile/ProfilePage";
import { TeamPage } from "../components/Team/TeamPage";
import {
  SimCBB,
  SimCFB,
  SimCHL,
  SimCollegeBaseball,
  SimMLB,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../_constants/constants";
import { BaseballTeamPage } from "../components/Team/baseball/BaseballTeamPage";
import { BaseballFinancialsPage } from "../components/Team/baseball/BaseballFinancialsPage";
import { BaseballGameplanPage } from "../components/Gameplan/BaseballGameplan/BaseballGameplanPage";
import { BaseballTradePage } from "../components/Team/baseball/BaseballTradePage";
import { BaseballFreeAgencyPage } from "../components/Team/baseball/BaseballFreeAgencyPage";
import { BaseballRecruitingPage } from "../components/Team/baseball/BaseballRecruitingPage";
import { BaseballProScoutingPage } from "../components/Team/baseball/BaseballProScoutingPage";
import { BaseballIntamScoutingPage } from "../components/Team/baseball/BaseballIntamScoutingPage";
import { BaseballIFAPage } from "../components/Team/baseball/BaseballIFAPage";
import { MLBSchedulePage } from "../components/Schedule/BaseballSchedule/MLBSchedulePage";
import { CollegeBaseballSchedulePage } from "../components/Schedule/BaseballSchedule/CollegeBaseballSchedulePage";
import { BaseballStatsPage } from "../components/StatsPage/BaseballStats/BaseballStatsPage";
import { BaseballInjuryPage } from "../components/Team/baseball/BaseballInjuryPage";
import { BaseballTrainingCampPage } from "../components/Team/baseball/BaseballTrainingCampPage";
import { PlayoffBracketPage } from "../components/SpecialEvents/BaseballEvents/PlayoffBracketPage";
import { ConferenceTournamentPage } from "../components/SpecialEvents/BaseballEvents/ConferenceTournamentPage";
import { AllStarGamePage } from "../components/SpecialEvents/BaseballEvents/AllStarGamePage";
import { WBCPage } from "../components/SpecialEvents/BaseballEvents/WBCPage";
import { BaseballAwardsPage } from "../components/Team/baseball/Awards/BaseballAwardsPage";
import { BaseballRouteFrame } from "../components/LandingPage/baseballNav";
import { SportUiPage } from "../components/Common/SportUiPage";
import { GameplanPage } from "../components/Gameplan/GameplanPage";
import { RecruitingPage } from "../components/Recruiting/RecruitingPage";
import { SchedulePage } from "../components/Schedule/SchedulePage";
import { FreeAgencyPage } from "../components/FreeAgencyPage/FreeAgencyPage";
import { StatsPage } from "../components/StatsPage/StatsPage";
import { TeamProfilePage } from "../components/TeamProfile/TeamProfile";
import { TransferPortalPage } from "../components/TransferPortal/TransferPortal";
import { NewsPage } from "../components/News/NewsPage";
import { DraftPage } from "../components/Draft/DraftPage";
import { AdminUsersPage } from "../components/AdminUsers/AdminUsersPage";
import { ForumsHomePage } from "../components/Forum/ForumsHomePage";
import { ForumSearchPage } from "../components/Forum/ForumSearchPage";
import { ForumCategoryPage } from "../components/Forum/ForumCategoryPage";
import { ThreadPage } from "../components/Forum/ThreadPage";
import { CreateThreadPage } from "../components/Forum/CreateThreadPage";
import { EditPostPage } from "../components/Forum/EditPostPage";
import { NFLUDFAView } from "../components/NFL/UDFA/NFLUDFAView";
// import { NFLUDFA_LocalTest } from "../components/NFL/UDFA/NFLUDFA_LocalTest";
import LiveRink from "../components/LiveScoreboard/LiveRink/LiveRink";
import LiveField from "../components/LiveScoreboard/LiveField/LiveField";
import { DocumentationMain } from "../components/Documentation/DocumentationMain";
import { LacrossePlaceholderPage } from "../components/Lacrosse/LacrossePlaceholderPage";
import { CollegeLacrosseRosterPage } from "../components/Lacrosse/CollegeLacrosseRosterPage";
import { CollegeLacrosseLineupsPage } from "../components/Lacrosse/CollegeLacrosseLineupsPage";
import { CollegeLacrosseAdminPage } from "../components/Lacrosse/CollegeLacrosseAdminPage";
import { CollegeLacrosseRecruitingPage } from "../components/Lacrosse/CollegeLacrosseRecruitingPage";
import { CollegeLacrosseSchedulePage } from "../components/Lacrosse/CollegeLacrosseSchedulePage";
import { CollegeLacrosseStatisticsPage } from "../components/Lacrosse/CollegeLacrosseStatisticsPage";
import { VolleyballTeamPage } from "../components/Volleyball/VolleyballTeamPage";
import { VolleyballSchedulePage } from "../components/Volleyball/VolleyballSchedulePage";
import { VolleyballMatchPage } from "../components/Volleyball/VolleyballMatchPage";
import { VolleyballHistoryPage } from "../components/Volleyball/VolleyballHistoryPage";
import {
  VolleyballCoachPage,
  VolleyballCoachPersonPage,
  VolleyballApplyPage,
  VolleyballCoachViewPage,
} from "../components/Volleyball/VolleyballCoachPage";
import { VolleyballLineupPage } from "../components/Volleyball/VolleyballLineupPage";
import { VolleyballTacticsPage } from "../components/Volleyball/VolleyballTacticsPage";
import { VolleyballDevelopmentPage } from "../components/Volleyball/VolleyballDevelopmentPage";
import { VolleyballStaffPage } from "../components/Volleyball/VolleyballStaffPage";
import { VolleyballRecruitingPage } from "../components/Volleyball/VolleyballRecruitingPage";
import {
  VolleyballCarouselPage,
  VolleyballFinancesPage,
} from "../components/Volleyball/VolleyballOfficePages";
import {
  VolleyballDraftPage,
  VolleyballFreeAgencyPage,
  VolleyballTradesPage,
} from "../components/Volleyball/VolleyballProPages";
import {
  VolleyballLeagueHome,
  VolleyballPlayerPage,
  VolleyballTeamsPage,
} from "../components/Volleyball/VolleyballLeaguePages";
import {
  VolleyballStatisticsPage,
  VolleyballTopPlaysPage,
} from "../components/Volleyball/VolleyballStatsPages";

// The volleyball pages that exist. The rally path opens the match page; the
// rally viewer itself is still to come.
const volleyballPages: Array<[path: string, page: ReactElement]> = [
  [routes.CVB_STATISTICS, <VolleyballStatisticsPage kind="college" />],
  [routes.PVB_STATISTICS, <VolleyballStatisticsPage kind="pro" />],
  [routes.CVB_TOP_PLAYS, <VolleyballTopPlaysPage kind="college" />],
  [routes.PVB_TOP_PLAYS, <VolleyballTopPlaysPage kind="pro" />],
  [routes.CVB_STAFF, <VolleyballStaffPage kind="college" />],
  [routes.PVB_STAFF, <VolleyballStaffPage kind="pro" />],
  [routes.PVB_FREE_AGENCY, <VolleyballFreeAgencyPage />],
  [routes.PVB_TRADES, <VolleyballTradesPage />],
  [routes.PVB_DRAFT, <VolleyballDraftPage />],
  [routes.CVB_RECRUITING, <VolleyballRecruitingPage market="hs" />],
  [routes.CVB_TRANSFER, <VolleyballRecruitingPage market="portal" />],
  [routes.CVB_CAROUSEL, <VolleyballCarouselPage />],
  [routes.CVB_FINANCES, <VolleyballFinancesPage kind="college" />],
  [routes.PVB_FINANCES, <VolleyballFinancesPage kind="pro" />],
  [routes.CVB_HOME, <VolleyballLeagueHome kind="college" />],
  [routes.CVB_TEAMS, <VolleyballTeamsPage kind="college" />],
  [routes.CVB_TEAM, <VolleyballTeamPage kind="college" />],
  [routes.CVB_SCHEDULE, <VolleyballSchedulePage kind="college" />],
  [routes.CVB_MATCH, <VolleyballMatchPage kind="college" />],
  [routes.CVB_MATCH_RALLY, <VolleyballMatchPage kind="college" />],
  [routes.CVB_HISTORY, <VolleyballHistoryPage kind="college" />],
  [routes.CVB_PLAYER, <VolleyballPlayerPage kind="college" />],
  [routes.CVB_COACH, <VolleyballCoachPage kind="college" />],
  [routes.PVB_COACH, <VolleyballCoachPage kind="pro" />],
  [routes.CVB_COACH_VIEW, <VolleyballCoachViewPage />],
  [routes.CVB_COACH_PERSON, <VolleyballCoachPersonPage />],
  [routes.CVB_APPLY, <VolleyballApplyPage kind="college" />],
  [routes.PVB_APPLY, <VolleyballApplyPage kind="pro" />],
  [routes.CVB_LINEUP, <VolleyballLineupPage kind="college" />],
  [routes.CVB_TACTICS, <VolleyballTacticsPage kind="college" />],
  [routes.CVB_DEVELOPMENT, <VolleyballDevelopmentPage kind="college" />],
  [routes.PVB_LINEUP, <VolleyballLineupPage kind="pro" />],
  [routes.PVB_TACTICS, <VolleyballTacticsPage kind="pro" />],
  [routes.PVB_DEVELOPMENT, <VolleyballDevelopmentPage kind="pro" />],
  [routes.PVB_HOME, <VolleyballLeagueHome kind="pro" />],
  [routes.PVB_TEAMS, <VolleyballTeamsPage kind="pro" />],
  [routes.PVB_TEAM, <VolleyballTeamPage kind="pro" />],
  [routes.PVB_SCHEDULE, <VolleyballSchedulePage kind="pro" />],
  [routes.PVB_MATCH, <VolleyballMatchPage kind="pro" />],
  [routes.PVB_MATCH_RALLY, <VolleyballMatchPage kind="pro" />],
  [routes.PVB_HISTORY, <VolleyballHistoryPage kind="pro" />],
  [routes.PVB_PLAYER, <VolleyballPlayerPage kind="pro" />],
];

// Will Add More Pages here for authorized users (Logged in)
export const AuthRoutes = [
  <Route key="Home" path={routes.HOME} element={<RootRoute />} />,
  <Route
    key="Sport UI"
    path={routes.SPORT_UI}
    element={
      <AuthGuard>
        <SportUiPage />
      </AuthGuard>
    }
  />,
  ...volleyballPages.map(([path, page]) => (
    <Route
      key={`Volleyball ${path}`}
      path={path}
      // Keyed by path so a page starts fresh when the league changes,
      // instead of carrying one league's choices into the other.
      element={<AuthGuard key={path}>{page}</AuthGuard>}
    />
  )),
  <Route
    key="CLAX Home"
    path={routes.CLAX_HOME}
    element={
      <AuthGuard>
        <LacrossePlaceholderPage league="college" page="home" />
      </AuthGuard>
    }
  />,
  <Route
    key="CLAX Teams"
    path={routes.CLAX_TEAMS}
    element={
      <AuthGuard>
        <Navigate to={routes.AVAILABLE_TEAMS} replace />
      </AuthGuard>
    }
  />,
  <Route
    key="CLAX Team"
    path={routes.CLAX_TEAM}
    element={
      <AuthGuard>
        <CollegeLacrosseRosterPage />
      </AuthGuard>
    }
  />,
  <Route
    key="CLAX Lineups"
    path={routes.CLAX_LINEUPS}
    element={
      <AuthGuard>
        <CollegeLacrosseLineupsPage />
      </AuthGuard>
    }
  />,
  <Route
    key="CLAX Recruiting"
    path={routes.CLAX_RECRUITING}
    element={
      <AuthGuard>
        <CollegeLacrosseRecruitingPage />
      </AuthGuard>
    }
  />,
  <Route
    key="CLAX Schedule"
    path={routes.CLAX_SCHEDULE}
    element={
      <AuthGuard>
        <CollegeLacrosseSchedulePage />
      </AuthGuard>
    }
  />,
  <Route
    key="CLAX Statistics"
    path={routes.CLAX_STATISTICS}
    element={
      <AuthGuard>
        <CollegeLacrosseStatisticsPage />
      </AuthGuard>
    }
  />,
  <Route
    key="CLAX Admin"
    path={routes.CLAX_ADMIN}
    element={
      <AuthGuard>
        <CollegeLacrosseAdminPage />
      </AuthGuard>
    }
  />,
  <Route
    key="PLAX Home"
    path={routes.PLAX_HOME}
    element={
      <AuthGuard>
        <LacrossePlaceholderPage league="professional" page="home" />
      </AuthGuard>
    }
  />,
  <Route
    key="PLAX Teams"
    path={routes.PLAX_TEAMS}
    element={
      <AuthGuard>
        <LacrossePlaceholderPage league="professional" page="teams" />
      </AuthGuard>
    }
  />,
  <Route
    key="Available"
    path={routes.AVAILABLE_TEAMS}
    element={
      <AuthGuard>
        <AvailableTeams />
      </AuthGuard>
    }
  />,
  <Route
    key="Admin"
    path={routes.ADMIN}
    element={
      <AuthGuard>
        <AdminPage />
      </AuthGuard>
    }
  />,
  <Route
    key="Users"
    path={routes.USERS}
    element={
      <AuthGuard>
        <AdminUsersPage />
      </AuthGuard>
    }
  />,
  <Route
    key="Profile"
    path={routes.USER}
    element={
      <AuthGuard>
        <ProfilePage />
      </AuthGuard>
    }
  />,
  <Route
    key="Public Profile"
    path={routes.PROFILE}
    element={
      <AuthGuard>
        <ProfilePage />
      </AuthGuard>
    }
  />,
  <Route
    key="CFB Team"
    path={routes.CFB_TEAM}
    element={
      <AuthGuard>
        <TeamPage league={SimCFB} />
      </AuthGuard>
    }
  />,
  <Route
    key="NFL Team"
    path={routes.NFL_TEAM}
    element={
      <AuthGuard>
        <TeamPage league={SimNFL} />
      </AuthGuard>
    }
  />,
  <Route
    key="CFB Gameplan"
    path={routes.CFB_GAMEPLAN}
    element={
      <AuthGuard>
        <GameplanPage league={SimCFB} />
      </AuthGuard>
    }
  />,
  <Route
    key="NFL Gameplan"
    path={routes.NFL_GAMEPLAN}
    element={
      <AuthGuard>
        <GameplanPage league={SimNFL} />
      </AuthGuard>
    }
  />,
  <Route
    key="CBB Team"
    path={routes.CBB_TEAM}
    element={
      <AuthGuard>
        <TeamPage league={SimCBB} />
      </AuthGuard>
    }
  />,
  <Route
    key="CBB Gameplan"
    path={routes.CBB_GAMEPLAN}
    element={
      <AuthGuard>
        <GameplanPage league={SimCBB} />
      </AuthGuard>
    }
  />,
  <Route
    key="NBA Team"
    path={routes.NBA_TEAM}
    element={
      <AuthGuard>
        <TeamPage league={SimNBA} />
      </AuthGuard>
    }
  />,
  <Route
    key="NBA Gameplan"
    path={routes.NBA_GAMEPLAN}
    element={
      <AuthGuard>
        <GameplanPage league={SimNBA} />
      </AuthGuard>
    }
  />,
  <Route
    key="CHL Team"
    path={routes.CHL_TEAM}
    element={
      <AuthGuard>
        <TeamPage league={SimCHL} />
      </AuthGuard>
    }
  />,
  <Route
    key="PHL Team"
    path={routes.PHL_TEAM}
    element={
      <AuthGuard>
        <TeamPage league={SimPHL} />
      </AuthGuard>
    }
  />,
  <Route
    key="CHL Gameplan"
    path={routes.CHL_GAMEPLAN}
    element={
      <AuthGuard>
        <GameplanPage league={SimCHL} />
      </AuthGuard>
    }
  />,
  <Route
    key="PHL Gameplan"
    path={routes.PHL_GAMEPLAN}
    element={
      <AuthGuard>
        <GameplanPage league={SimPHL} />
      </AuthGuard>
    }
  />,
  <Route
    key="CHL Recruiting"
    path={routes.CHL_RECRUITING}
    element={
      <AuthGuard>
        <RecruitingPage league={SimCHL} />
      </AuthGuard>
    }
  />,
  <Route
    key="CBB Recruiting"
    path={routes.CBB_RECRUITING}
    element={
      <AuthGuard>
        <RecruitingPage league={SimCBB} />
      </AuthGuard>
    }
  />,
  <Route
    key="CFB Recruiting"
    path={routes.CFB_RECRUITING}
    element={
      <AuthGuard>
        <RecruitingPage league={SimCFB} />
      </AuthGuard>
    }
  />,
  <Route
    key="CHL Transfer Portal"
    path={routes.CHL_TRANSFER}
    element={
      <AuthGuard>
        <TransferPortalPage league={SimCHL} />
      </AuthGuard>
    }
  />,
  <Route
    key="CFB Transfer Portal"
    path={routes.CFB_TRANSFER}
    element={
      <AuthGuard>
        <TransferPortalPage league={SimCFB} />
      </AuthGuard>
    }
  />,
  <Route
    key="CBB Transfer Portal"
    path={routes.CBB_TRANSFER}
    element={
      <AuthGuard>
        <TransferPortalPage league={SimCBB} />
      </AuthGuard>
    }
  />,
  <Route
    key="CFB Schedule"
    path={routes.CFB_SCHEDULE}
    element={
      <AuthGuard>
        <SchedulePage league={SimCFB} />
      </AuthGuard>
    }
  />,
  <Route
    key="NFL Schedule"
    path={routes.NFL_SCHEDULE}
    element={
      <AuthGuard>
        <SchedulePage league={SimNFL} />
      </AuthGuard>
    }
  />,
  <Route
    key="CHL Schedule"
    path={routes.CHL_SCHEDULE}
    element={
      <AuthGuard>
        <SchedulePage league={SimCHL} />
      </AuthGuard>
    }
  />,
  <Route
    key="PHL Schedule"
    path={routes.PHL_SCHEDULE}
    element={
      <AuthGuard>
        <SchedulePage league={SimPHL} />
      </AuthGuard>
    }
  />,
  <Route
    key="CBB Schedule"
    path={routes.CBB_SCHEDULE}
    element={
      <AuthGuard>
        <SchedulePage league={SimCBB} />
      </AuthGuard>
    }
  />,
  <Route
    key="NBA Schedule"
    path={routes.NBA_SCHEDULE}
    element={
      <AuthGuard>
        <SchedulePage league={SimNBA} />
      </AuthGuard>
    }
  />,
  <Route
    key="PHL Free Agency"
    path={routes.PHL_FREE_AGENCY}
    element={
      <AuthGuard>
        <FreeAgencyPage league={SimPHL} />
      </AuthGuard>
    }
  />,
  <Route
    key="NBA Free Agency"
    path={routes.NBA_FREE_AGENCY}
    element={
      <AuthGuard>
        <FreeAgencyPage league={SimNBA} />
      </AuthGuard>
    }
  />,
  <Route
    key="NFL Free Agency"
    path={routes.NFL_FREE_AGENCY}
    element={
      <AuthGuard>
        <FreeAgencyPage league={SimNFL} />
      </AuthGuard>
    }
  />,
  <Route
    key="NFL UDFA RECRUITING"
    path={routes.NFL_UDFA_RECRUITING}
    element={
      <AuthGuard>
        <NFLUDFAView />
      </AuthGuard>
    }
  />,

  <Route
    key="CFB STATS"
    path={routes.CFB_STATS}
    element={
      <AuthGuard>
        <StatsPage league={SimCFB} />
      </AuthGuard>
    }
  />,
  <Route
    key="CBB STATS"
    path={routes.CBB_STATS}
    element={
      <AuthGuard>
        <StatsPage league={SimCBB} />
      </AuthGuard>
    }
  />,
  <Route
    key="CHL STATS"
    path={routes.CHL_STATS}
    element={
      <AuthGuard>
        <StatsPage league={SimCHL} />
      </AuthGuard>
    }
  />,
  <Route
    key="NFL STATS"
    path={routes.NFL_STATS}
    element={
      <AuthGuard>
        <StatsPage league={SimNFL} />
      </AuthGuard>
    }
  />,
  <Route
    key="NBA STATS"
    path={routes.NBA_STATS}
    element={
      <AuthGuard>
        <StatsPage league={SimNBA} />
      </AuthGuard>
    }
  />,
  <Route
    key="PHL STATS"
    path={routes.PHL_STATS}
    element={
      <AuthGuard>
        <StatsPage league={SimPHL} />
      </AuthGuard>
    }
  />,
  <Route
    key="PHL DRAFT"
    path={routes.PHL_DRAFT_ROOM}
    element={
      <AuthGuard>
        <DraftPage league={SimPHL} />
      </AuthGuard>
    }
  />,
  <Route
    key="NFL DRAFT"
    path={routes.NFL_DRAFT_ROOM}
    element={
      <AuthGuard>
        <DraftPage league={SimNFL} />
      </AuthGuard>
    }
  />,
  <Route
    key="NBA DRAFT"
    path={routes.NBA_DRAFT_ROOM}
    element={
      <AuthGuard>
        <DraftPage league={SimNBA} />
      </AuthGuard>
    }
  />,
  <Route
    key="CFB TEAM PROFILE"
    path={routes.CFB_TEAMPROFILE}
    element={
      <AuthGuard>
        <TeamProfilePage league={SimCFB} />
      </AuthGuard>
    }
  />,
  <Route
    key="NEWSPAGE"
    path={routes.NEWS}
    element={
      <AuthGuard>
        <NewsPage />
      </AuthGuard>
    }
  />,
  <Route
    key="College Baseball Team"
    path={routes.COLLEGE_BASEBALL_TEAM}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimCollegeBaseball}>
          <BaseballTeamPage league={SimCollegeBaseball} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Team"
    path={routes.MLB_TEAM}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimMLB}>
          <BaseballTeamPage league={SimMLB} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Financials"
    path={routes.MLB_FINANCIALS}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimMLB}>
          <BaseballFinancialsPage />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="College Baseball Gameplan"
    path={routes.COLLEGE_BASEBALL_GAMEPLAN}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimCollegeBaseball}>
          <BaseballGameplanPage league={SimCollegeBaseball} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Gameplan"
    path={routes.MLB_GAMEPLAN}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimMLB}>
          <BaseballGameplanPage league={SimMLB} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Trades"
    path={routes.MLB_TRADES}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimMLB}>
          <BaseballTradePage league={SimMLB} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Free Agency"
    path={routes.MLB_FREE_AGENCY}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimMLB}>
          <BaseballFreeAgencyPage league={SimMLB} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Pro Scouting"
    path={routes.MLB_PRO_SCOUTING}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimMLB}>
          <BaseballProScoutingPage league={SimMLB} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="MLB INTAM Scouting"
    path={routes.MLB_INTAM_SCOUTING}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimMLB}>
          <BaseballIntamScoutingPage league={SimMLB} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="College Baseball Recruiting"
    path={routes.COLLEGE_BASEBALL_RECRUITING}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimCollegeBaseball}>
          <BaseballRecruitingPage league={SimCollegeBaseball} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Schedule"
    path={routes.MLB_SCHEDULE}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimMLB}>
          <MLBSchedulePage />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="College Baseball Schedule"
    path={routes.COLLEGE_BASEBALL_SCHEDULE}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimCollegeBaseball}>
          <CollegeBaseballSchedulePage />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Stats"
    path={routes.MLB_STATS}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimMLB}>
          <BaseballStatsPage league={SimMLB} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="College Baseball Stats"
    path={routes.COLLEGE_BASEBALL_STATS}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimCollegeBaseball}>
          <BaseballStatsPage league={SimCollegeBaseball} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Injuries"
    path={routes.MLB_INJURIES}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimMLB}>
          <BaseballInjuryPage league={SimMLB} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="College Baseball Injuries"
    path={routes.COLLEGE_BASEBALL_INJURIES}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimCollegeBaseball}>
          <BaseballInjuryPage league={SimCollegeBaseball} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Training Camp"
    path={routes.MLB_TRAINING_CAMP}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimMLB}>
          <BaseballTrainingCampPage league={SimMLB} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="College Baseball Training Camp"
    path={routes.COLLEGE_BASEBALL_TRAINING_CAMP}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimCollegeBaseball}>
          <BaseballTrainingCampPage league={SimCollegeBaseball} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Playoffs"
    path={routes.MLB_PLAYOFFS}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimMLB}>
          <PlayoffBracketPage league={SimMLB} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="College Baseball Playoffs"
    path={routes.COLLEGE_BASEBALL_PLAYOFFS}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimCollegeBaseball}>
          <PlayoffBracketPage league={SimCollegeBaseball} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="College Baseball Conference Tournament"
    path={routes.COLLEGE_BASEBALL_CONF_TOURNAMENT}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimCollegeBaseball}>
          <ConferenceTournamentPage />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="MLB All-Star Game"
    path={routes.MLB_ALLSTAR}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimMLB}>
          <AllStarGamePage />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Awards"
    path={routes.MLB_AWARDS}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimMLB}>
          <BaseballAwardsPage />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="MLB WBC"
    path={routes.MLB_WBC}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimMLB}>
          <WBCPage />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Draft"
    path={routes.MLB_DRAFT_ROOM}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimMLB}>
          <DraftPage league={SimMLB} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  <Route
    key="MLB IFA"
    path={routes.MLB_IFA}
    element={
      <AuthGuard>
        <BaseballRouteFrame league={SimMLB}>
          <BaseballIFAPage league={SimMLB} />
        </BaseballRouteFrame>
      </AuthGuard>
    }
  />,
  // ─── Forum Routes ─────────────────────────────────────────────────────────
  <Route
    key="Forums Home"
    path={routes.FORUMS}
    element={
      <AuthGuard>
        <ForumsHomePage />
      </AuthGuard>
    }
  />,
  <Route
    key="Forum Search"
    path={routes.FORUM_SEARCH}
    element={
      <AuthGuard>
        <ForumSearchPage />
      </AuthGuard>
    }
  />,
  <Route
    key="Forum Create Thread"
    path={routes.FORUM_CREATE_THREAD}
    element={
      <AuthGuard>
        <CreateThreadPage />
      </AuthGuard>
    }
  />,
  <Route
    key="Forum Thread"
    path={routes.FORUM_THREAD_PARAM}
    element={
      <AuthGuard>
        <ThreadPage />
      </AuthGuard>
    }
  />,
  <Route
    key="Forum Edit Post"
    path={routes.FORUM_EDIT_POST}
    element={
      <AuthGuard>
        <EditPostPage />
      </AuthGuard>
    }
  />,
  <Route
    key="Forum Subforum"
    path={routes.FORUM_SUBFORUM}
    element={
      <AuthGuard>
        <ForumCategoryPage />
      </AuthGuard>
    }
  />,
  <Route
    key="Forum Category"
    path={routes.FORUM_CATEGORY}
    element={
      <AuthGuard>
        <ForumCategoryPage />
      </AuthGuard>
    }
  />,
  //LiveScoreboard Routes
  <Route
    key="Live Rink"
    path={routes.LIVERINK} // Use the constant
    element={
      <AuthGuard>
        <LiveRink />
      </AuthGuard>
    }
  />,
  <Route
    key="Live Field"
    path={routes.LIVEFIELD} // Use the constant
    element={
      <AuthGuard>
        <LiveField />
      </AuthGuard>
    }
  />,
  <Route
    key="Help"
    path={routes.HELP} // Use the constant
    element={
      <AuthGuard>
        <DocumentationMain />
      </AuthGuard>
    }
  />,
];
