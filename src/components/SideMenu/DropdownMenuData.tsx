import { useState } from "react";
import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import routes from "../../_constants/routes";
import { useNavigate } from "react-router-dom";
import { useDeepLink } from "../../context/DeepLinkContext";

// ✅ Types
interface DropdownItem {
  label: string;
  league: League;
  isRoute: boolean;
  route: string;
  toggle: () => void;
  click?: () => void;
}

export const useSideMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { goToTeamPage } = useDeepLink();

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const dropdowns: Record<string, DropdownItem[]> = {
    SimCFB: [
      {
        label: "Team Profile",
        isRoute: true,
        route: routes.CFB_TEAMPROFILE,
        league: SimCFB,
        toggle: () => toggleMenu(),
      },
      {
        label: "Roster",
        isRoute: true,
        route: routes.CFB_TEAM,
        league: SimCFB,
        toggle: () => toggleMenu(),
        click: () => goToTeamPage(SimCFB),
      },
      {
        label: "Gameplan",
        isRoute: true,
        route: routes.CFB_GAMEPLAN,
        league: SimCFB,
        click: () => navigate(routes.CFB_GAMEPLAN),
        toggle: () => toggleMenu(),
      },
      {
        label: "Recruiting",
        isRoute: true,
        route: routes.CFB_RECRUITING,
        league: SimCFB,
        click: () => navigate(routes.CFB_RECRUITING),
        toggle: () => toggleMenu(),
      },
      {
        label: "Statistics",
        isRoute: true,
        route: routes.CFB_STATS,
        league: SimCFB,
        click: () => navigate(routes.CFB_STATS),
        toggle: () => toggleMenu(),
      },
      {
        label: "Schedule",
        isRoute: true,
        route: routes.CFB_SCHEDULE,
        league: SimCFB,
        toggle: () => toggleMenu(),
      },
      {
        label: "Transfer Portal",
        isRoute: true,
        route: routes.CFB_TRANSFER,
        league: SimCFB,
        toggle: () => toggleMenu(),
      },
    ],
    SimNFL: [
      {
        label: "Team",
        isRoute: true,
        route: routes.NFL_TEAM,
        league: SimNFL,
        click: () => goToTeamPage(SimNFL),
        toggle: () => toggleMenu(),
      },
      {
        label: "Gameplan",
        isRoute: true,
        route: routes.NFL_GAMEPLAN,
        league: SimNFL,
        click: () => navigate(routes.NFL_GAMEPLAN),
        toggle: () => toggleMenu(),
      },
      {
        label: "Free Agency",
        isRoute: true,
        route: routes.NFL_FREE_AGENCY,
        league: SimNFL,
        toggle: () => toggleMenu(),
      },
      {
        label: "Statistics",
        isRoute: true,
        route: routes.NFL_STATS,
        league: SimNFL,
        click: () => navigate(routes.NFL_STATS),
        toggle: () => toggleMenu(),
      },
      {
        label: "Schedule",
        isRoute: true,
        route: routes.NFL_SCHEDULE,
        league: SimNFL,
        toggle: () => toggleMenu(),
      },
      {
        label: "Draft Page",
        isRoute: true,
        route: "",
        league: SimNFL,
        toggle: () => toggleMenu(),
      },
    ],
    SimCBB: [
      {
        label: "Team",
        isRoute: true,
        route: routes.CBB_TEAM,
        league: SimCBB,
        click: () => goToTeamPage(SimCBB),
        toggle: () => toggleMenu(),
      },
      {
        label: "Gameplan",
        isRoute: true,
        route: "",
        league: SimCBB,
        toggle: () => toggleMenu(),
      },
      {
        label: "Recruiting",
        isRoute: true,
        route: routes.CBB_RECRUITING,
        league: SimCBB,
        click: () => navigate(routes.CBB_RECRUITING),
        toggle: () => toggleMenu(),
      },
      {
        label: "Statistics",
        isRoute: true,
        route: routes.CBB_STATS,
        league: SimCBB,
        click: () => navigate(routes.CBB_STATS),
        toggle: () => toggleMenu(),
      },
      {
        label: "Schedule",
        isRoute: true,
        route: routes.CBB_SCHEDULE,
        league: SimCBB,
        click: () => navigate(routes.CBB_SCHEDULE),
        toggle: () => toggleMenu(),
      },
      {
        label: "Transfer Portal",
        isRoute: true,
        route: "",
        league: SimCBB,
        toggle: () => toggleMenu(),
      },
    ],
    SimNBA: [
      {
        label: "Team",
        isRoute: true,
        route: routes.NBA_TEAM,
        league: SimNBA,
        click: () => goToTeamPage(SimNBA),
        toggle: () => toggleMenu(),
      },
      {
        label: "Gameplan",
        isRoute: true,
        route: "",
        league: SimNBA,
        toggle: () => toggleMenu(),
      },
      {
        label: "Free Agency",
        isRoute: true,
        route: "",
        league: SimNBA,
        toggle: () => toggleMenu(),
      },
      {
        label: "Statistics",
        isRoute: true,
        route: routes.NBA_STATS,
        league: SimNBA,
        click: () => navigate(routes.NBA_STATS),
        toggle: () => toggleMenu(),
      },
      {
        label: "Schedule",
        isRoute: true,
        route: "",
        league: SimNBA,
        click: () => navigate(routes.NBA_SCHEDULE),
        toggle: () => toggleMenu(),
      },
      {
        label: "Draft Page",
        isRoute: true,
        route: "",
        league: SimNBA,
        toggle: () => toggleMenu(),
      },
    ],
    SimCHL: [
      {
        label: "Team",
        isRoute: true,
        route: routes.CHL_TEAM,
        league: SimCHL,
        click: () => goToTeamPage(SimCHL),
        toggle: () => toggleMenu(),
      },
      {
        label: "Lineup",
        isRoute: true,
        route: routes.CHL_GAMEPLAN,
        league: SimCHL,
        click: () => navigate(routes.CHL_GAMEPLAN),
        toggle: () => toggleMenu(),
      },
      {
        label: "Recruiting",
        isRoute: true,
        route: routes.CHL_RECRUITING,
        league: SimCHL,
        click: () => navigate(routes.CHL_RECRUITING),
        toggle: () => toggleMenu(),
      },
      {
        label: "Schedule",
        isRoute: true,
        route: routes.CHL_SCHEDULE,
        league: SimCHL,
        toggle: () => toggleMenu(),
      },
      {
        label: "Statistics",
        isRoute: true,
        route: routes.CHL_STATS,
        league: SimCHL,
        click: () => navigate(routes.CHL_STATS),
        toggle: () => toggleMenu(),
      },
      {
        label: "Transfer Portal",
        isRoute: true,
        route: "",
        league: SimCHL,
        toggle: () => toggleMenu(),
      },
    ],
    SimPHL: [
      {
        label: "Team",
        isRoute: true,
        route: routes.PHL_TEAM,
        league: SimPHL,
        click: () => goToTeamPage(SimPHL),
        toggle: () => toggleMenu(),
      },
      {
        label: "Lineup",
        isRoute: true,
        route: routes.PHL_GAMEPLAN,
        league: SimPHL,
        click: () => navigate(routes.PHL_GAMEPLAN),
        toggle: () => toggleMenu(),
      },
      {
        label: "Free Agency",
        isRoute: true,
        route: routes.PHL_FREE_AGENCY,
        league: SimPHL,
        click: () => navigate(routes.PHL_FREE_AGENCY),
        toggle: () => toggleMenu(),
      },
      {
        label: "Schedule",
        isRoute: true,
        route: routes.PHL_SCHEDULE,
        league: SimPHL,
        toggle: () => toggleMenu(),
      },
      {
        label: "Statistics",
        isRoute: true,
        route: routes.PHL_STATS,
        league: SimPHL,
        click: () => navigate(routes.PHL_STATS),
        toggle: () => toggleMenu(),
      },
      {
        label: "Draft Page",
        isRoute: true,
        route: "",
        league: SimPHL,
        toggle: () => toggleMenu(),
      },
    ],
  };

  return {
    toggleMenu,
    toggleDropdown,
    dropdowns,
    isOpen,
    isDropdownOpen,
  };
};
