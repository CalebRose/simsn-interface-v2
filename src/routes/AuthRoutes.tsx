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
  SimNBA,
  SimNFL,
  SimPHL,
} from "../_constants/constants";
import { GameplanPage } from "../components/Gameplan/GameplanPage";
import { RecruitingPage } from "../components/Recruiting/RecruitingPage";
import { SchedulePage } from "../components/Schedule/SchedulePage";
import { FreeAgencyPage } from "../components/FreeAgencyPage/FreeAgencyPage";
import { StatsPage } from "../components/StatsPage/StatsPage";
import { TeamProfilePage } from "../components/TeamProfile/TeamProfile";
import { TransferPortalPage } from "../components/TransferPortal/TransferPortal";
import { NewsPage } from "../components/News/NewsPage";

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
];
