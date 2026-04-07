import { Route } from "react-router-dom";
import { AuthGuard } from "../guards/AuthGuards";
import { Home } from "../components/Home/Home";
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
import { CollegeRosterBreakdownPage } from "../components/Team/baseball/CollegeRosterBreakdownPage";
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
import { PlayoffBracketPage } from "../components/SpecialEvents/BaseballEvents/PlayoffBracketPage";
import { AllStarGamePage } from "../components/SpecialEvents/BaseballEvents/AllStarGamePage";
import { WBCPage } from "../components/SpecialEvents/BaseballEvents/WBCPage";
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
import { ForumCategoryPage } from "../components/Forum/ForumCategoryPage";
import { ThreadPage } from "../components/Forum/ThreadPage";
import { CreateThreadPage } from "../components/Forum/CreateThreadPage";
import { EditPostPage } from "../components/Forum/EditPostPage";

// Will Add More Pages here for authorized users (Logged in)
export const AuthRoutes = [
  <Route
    key="Home"
    path={routes.HOME}
    element={
      <AuthGuard>
        <Home />
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
    key="NBA Team"
    path={routes.NBA_TEAM}
    element={
      <AuthGuard>
        <TeamPage league={SimNBA} />
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
        <BaseballTeamPage league={SimCollegeBaseball} />
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Team"
    path={routes.MLB_TEAM}
    element={
      <AuthGuard>
        <BaseballTeamPage league={SimMLB} />
      </AuthGuard>
    }
  />,
  <Route
    key="College Baseball Roster Breakdown"
    path={routes.COLLEGE_BASEBALL_FINANCIALS}
    element={
      <AuthGuard>
        <CollegeRosterBreakdownPage />
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Financials"
    path={routes.MLB_FINANCIALS}
    element={
      <AuthGuard>
        <BaseballFinancialsPage league={SimMLB} />
      </AuthGuard>
    }
  />,
  <Route
    key="College Baseball Gameplan"
    path={routes.COLLEGE_BASEBALL_GAMEPLAN}
    element={
      <AuthGuard>
        <BaseballGameplanPage league={SimCollegeBaseball} />
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Gameplan"
    path={routes.MLB_GAMEPLAN}
    element={
      <AuthGuard>
        <BaseballGameplanPage league={SimMLB} />
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Trades"
    path={routes.MLB_TRADES}
    element={
      <AuthGuard>
        <BaseballTradePage league={SimMLB} />
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Free Agency"
    path={routes.MLB_FREE_AGENCY}
    element={
      <AuthGuard>
        <BaseballFreeAgencyPage league={SimMLB} />
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Pro Scouting"
    path={routes.MLB_PRO_SCOUTING}
    element={
      <AuthGuard>
        <BaseballProScoutingPage league={SimMLB} />
      </AuthGuard>
    }
  />,
  <Route
    key="MLB INTAM Scouting"
    path={routes.MLB_INTAM_SCOUTING}
    element={
      <AuthGuard>
        <BaseballIntamScoutingPage league={SimMLB} />
      </AuthGuard>
    }
  />,
  <Route
    key="College Baseball Recruiting"
    path={routes.COLLEGE_BASEBALL_RECRUITING}
    element={
      <AuthGuard>
        <BaseballRecruitingPage league={SimCollegeBaseball} />
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Schedule"
    path={routes.MLB_SCHEDULE}
    element={
      <AuthGuard>
        <MLBSchedulePage />
      </AuthGuard>
    }
  />,
  <Route
    key="College Baseball Schedule"
    path={routes.COLLEGE_BASEBALL_SCHEDULE}
    element={
      <AuthGuard>
        <CollegeBaseballSchedulePage />
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Stats"
    path={routes.MLB_STATS}
    element={
      <AuthGuard>
        <BaseballStatsPage league={SimMLB} />
      </AuthGuard>
    }
  />,
  <Route
    key="College Baseball Stats"
    path={routes.COLLEGE_BASEBALL_STATS}
    element={
      <AuthGuard>
        <BaseballStatsPage league={SimCollegeBaseball} />
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Injuries"
    path={routes.MLB_INJURIES}
    element={
      <AuthGuard>
        <BaseballInjuryPage league={SimMLB} />
      </AuthGuard>
    }
  />,
  <Route
    key="College Baseball Injuries"
    path={routes.COLLEGE_BASEBALL_INJURIES}
    element={
      <AuthGuard>
        <BaseballInjuryPage league={SimCollegeBaseball} />
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Playoffs"
    path={routes.MLB_PLAYOFFS}
    element={
      <AuthGuard>
        <PlayoffBracketPage league={SimMLB} />
      </AuthGuard>
    }
  />,
  <Route
    key="College Baseball Playoffs"
    path={routes.COLLEGE_BASEBALL_PLAYOFFS}
    element={
      <AuthGuard>
        <PlayoffBracketPage league={SimCollegeBaseball} />
      </AuthGuard>
    }
  />,
  <Route
    key="MLB All-Star Game"
    path={routes.MLB_ALLSTAR}
    element={
      <AuthGuard>
        <AllStarGamePage />
      </AuthGuard>
    }
  />,
  <Route
    key="MLB WBC"
    path={routes.MLB_WBC}
    element={
      <AuthGuard>
        <WBCPage />
      </AuthGuard>
    }
  />,
  <Route
    key="MLB Draft"
    path={routes.MLB_DRAFT_ROOM}
    element={
      <AuthGuard>
        <DraftPage league={SimMLB} />
      </AuthGuard>
    }
  />,
  <Route
    key="MLB IFA"
    path={routes.MLB_IFA}
    element={
      <AuthGuard>
        <BaseballIFAPage league={SimMLB} />
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
];
