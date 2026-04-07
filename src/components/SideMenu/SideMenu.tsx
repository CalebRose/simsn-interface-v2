import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { AuthService } from "../../_services/auth";
import { getLogo } from "../../_utility/getLogo";
import routes from "../../_constants/routes";
import { useForumStore } from "../../context/ForumContext";
import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimCollegeBaseball,
  SimMLB,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { SideMenuItem } from "../../_design/SideMenuItem";
import { NavDropdown, NavDropdownItem } from "../../_design/DropdownList";
import { useAuthStore } from "../../context/AuthContext";
import { useSimBaseballStore } from "../../context/SimBaseballContext";
import { useSideMenu } from "./DropdownMenuData";
import { simLogos } from "../../_constants/logos";
import { ThemeToggle } from "../Common/ThemeToggle";
import { useResponsive } from "../../_hooks/useMobile";
import { useBackgroundColor } from "../../_hooks/useBackgroundColor";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";

export const SideMenu = ({}) => {
  const {
    currentUser,
    isCBBUser,
    isCFBUser,
    isCHLUser,
    isNBAUser,
    isNFLUser,
    isPHLUser,
  } = useAuthStore();
  const {
    isCollegeBaseballUser,
    isMlbUser,
    collegeOrganization,
    mlbOrganization,
  } = useSimBaseballStore();
  const { isOpen, isDropdownOpen, toggleMenu, toggleDropdown, dropdowns } =
    useSideMenu();
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useForumStore();
  const { isDesktop } = useResponsive();
  const [processing, setProcessing] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown on outside click
  useEffect(() => {
    if (!isNotifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isNotifOpen]);
  const { baseColor } = useBackgroundColor();
  const textColor = getTextColorBasedOnBg(baseColor);
  const navigate = useNavigate();
  // ✅ Generate logos based on current user
  const {
    cfbLogo,
    nflLogo,
    cbbLogo,
    nbaLogo,
    chlLogo,
    phlLogo,
    collegeBaseballLogo,
    mlbLogo,
    logo,
  } = useMemo(() => {
    let cfbLogo = "";
    let nflLogo = "";
    let cbbLogo = "";
    let nbaLogo = "";
    let chlLogo = "";
    let phlLogo = "";
    let collegeBaseballLogo = "";
    let mlbLogo = "";
    let logo = "";

    if (currentUser) {
      const {
        teamId,
        NFLTeamID,
        cbb_id,
        NBATeamID,
        CHLTeamID,
        PHLTeamID,
        IsRetro,
        DefaultLeague,
      } = currentUser;

      if (teamId) {
        cfbLogo = getLogo(SimCFB, teamId, IsRetro);
      }
      if (NFLTeamID) {
        nflLogo = getLogo(SimNFL, NFLTeamID, IsRetro);
      }
      if (cbb_id) {
        cbbLogo = getLogo(SimCBB, cbb_id, IsRetro);
      }
      if (NBATeamID) {
        nbaLogo = getLogo(SimNBA, NBATeamID, IsRetro);
      }
      if (CHLTeamID) {
        chlLogo = getLogo(SimCHL, CHLTeamID, IsRetro);
      }
      if (PHLTeamID) {
        phlLogo = getLogo(SimPHL, PHLTeamID, IsRetro);
      }
      if (collegeOrganization && collegeOrganization.teams) {
        const teamEntries = Object.values(collegeOrganization.teams);
        if (teamEntries.length > 0) {
          collegeBaseballLogo = getLogo(
            SimCollegeBaseball,
            teamEntries[0].team_id,
            IsRetro,
          );
        }
      }
      if (mlbOrganization && mlbOrganization.teams) {
        const mlbTeam = mlbOrganization.teams["mlb"];
        if (mlbTeam) {
          mlbLogo = getLogo(SimMLB, mlbTeam.team_id, IsRetro);
        }
      }

      switch (DefaultLeague) {
        case SimCFB:
          logo = cfbLogo;
          break;
        case SimNFL:
          logo = nflLogo;
          break;
        case SimCBB:
          logo = cbbLogo;
          break;
        case SimNBA:
          logo = nbaLogo;
          break;
        case SimCHL:
          logo = chlLogo;
          break;
        case SimPHL:
          logo = phlLogo;
          break;
        case SimCollegeBaseball:
          logo = collegeBaseballLogo;
          break;
        case SimMLB:
          logo = mlbLogo;
          break;
        default:
          // Fallback priority if DefaultLeague is not defined
          logo =
            cfbLogo ||
            nflLogo ||
            cbbLogo ||
            nbaLogo ||
            chlLogo ||
            phlLogo ||
            mlbLogo ||
            collegeBaseballLogo ||
            "";
          break;
      }
    }

    return {
      cfbLogo,
      nflLogo,
      cbbLogo,
      nbaLogo,
      chlLogo,
      phlLogo,
      collegeBaseballLogo,
      mlbLogo,
      logo,
    };
  }, [currentUser, collegeOrganization, mlbOrganization]);

  const isBanned = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.IsBanned;
  }, [currentUser]);

  const isCommissioner = useMemo(() => {
    if (!currentUser) return false;
    return (
      currentUser.roleID === "Admin" ||
      currentUser.roleID?.includes("Commissioner")
    );
  }, [currentUser]);

  // ✅ Handle Logout
  const logout = async () => {
    setProcessing(true);
    try {
      const data = await AuthService.logout();
      if (data.status) {
        navigate(`/login`);
        enqueueSnackbar(data.message, {
          variant: "success",
          autoHideDuration: 3000,
        });
      }
    } catch (e) {
      enqueueSnackbar("Something went wrong.", {
        variant: "error",
        autoHideDuration: 3000,
      });
    } finally {
      setProcessing(false);
    }
  };

  const navigateToAvailableTeams = () => navigate(routes.AVAILABLE_TEAMS);
  const navigateToNews = () => navigate(routes.NEWS);
  const navigateToHelp = () => navigate(routes.HELP);

  return (
    <>
      {/* ✅ Top Navigation Bar */}
      <nav className="fixed top-0 left-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-3 py-3 lg:px-5 lg:pl-3 flex justify-between items-center">
          {/* Logo and Hamburger Menu */}
          <div className="flex items-center">
            <button
              onClick={toggleMenu}
              disabled={isBanned}
              className="inline-flex items-center p-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" />
              </svg>
            </button>
            <button onClick={() => navigate(routes.HOME)} className="flex ml-2">
              <img
                src={`${simLogos.SimSN_Icon}`}
                className="h-8 mr-3"
                alt="SimSNLogo"
              />
              <span
                className={`self-center text-xl font-semibold sm:text-2xl ${textColor}`}
              >
                SimSN
              </span>
            </button>
          </div>
          {/* User Dropdown */}
          {currentUser && (
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              {isDesktop && <ThemeToggle />}

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  aria-label="Notifications"
                  onClick={() => {
                    setIsNotifOpen((prev) => !prev);
                    if (!isNotifOpen && unreadCount > 0 && currentUser?.id) {
                      markAllNotificationsRead(currentUser.id);
                    }
                  }}
                  className="relative p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                >
                  {/* Bell SVG */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {/* Red dot for unread */}
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-[420px] max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-800">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          className="text-xs text-blue-500 hover:underline"
                          onClick={() =>
                            currentUser?.id &&
                            markAllNotificationsRead(currentUser.id)
                          }
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-400">
                        No notifications
                      </div>
                    ) : (
                      <ul>
                        {notifications.map((notif) => (
                          <li key={notif.id}>
                            <button
                              type="button"
                              className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                notif.isRead ? "opacity-60" : "bg-yellow-500/5"
                              }`}
                              onClick={() => {
                                if (!notif.isRead)
                                  markNotificationRead(notif.id);
                                setIsNotifOpen(false);
                                const destination =
                                  notif.linkTo ??
                                  (notif.threadId
                                    ? `${routes.FORUM_THREAD}/${notif.threadId}`
                                    : null);
                                if (destination) navigate(destination);
                              }}
                            >
                              <p className="text-gray-800 dark:text-gray-100 leading-snug">
                                {notif.message}
                              </p>
                              {!notif.isRead && (
                                <span className="inline-block mt-1 h-1.5 w-1.5 rounded-full bg-yellow-400" />
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* User Avatar Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                >
                  <img
                    className="w-8 h-8 rounded-full"
                    src={logo}
                    alt="User Avatar"
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-48 bg-white rounded-md shadow-lg dark:bg-gray-700">
                    <div className="p-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentUser.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-300">
                        {currentUser.email}
                      </p>
                    </div>
                    <NavDropdown>
                      <NavDropdownItem
                        label="Profile"
                        isRoute={true}
                        route={routes.USER}
                      />
                      {isCommissioner && !isBanned && (
                        <NavDropdownItem
                          label="Admin"
                          isRoute={true}
                          route="/admin"
                        />
                      )}
                      {currentUser.roleID === "Admin" && !isBanned && (
                        <NavDropdownItem
                          label="Users"
                          isRoute={true}
                          route="/users"
                        />
                      )}
                      <NavDropdownItem label="Sign Out" click={logout} />
                    </NavDropdown>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ✅ Sidebar Menu */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } bg-white border-r dark:bg-gray-800 dark:border-gray-700`}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            <SideMenuItem
              label="Dashboard"
              toggle={toggleMenu}
              click={() => navigate(routes.HOME)}
            />
            <SideMenuItem
              label="Forums"
              toggle={toggleMenu}
              click={() => navigate(routes.FORUMS)}
            />
            {isCFBUser && (
              <SideMenuItem
                label={SimCFB}
                logo={cfbLogo}
                dropdown={dropdowns.SimCFB}
                league={SimCFB}
                toggle={toggleMenu}
                isTop
              />
            )}
            {isNFLUser && (
              <SideMenuItem
                label={SimNFL}
                logo={nflLogo}
                dropdown={dropdowns.SimNFL}
                league={SimNFL}
                toggle={toggleMenu}
                isTop
              />
            )}
            {isCBBUser && (
              <SideMenuItem
                label={SimCBB}
                logo={cbbLogo}
                dropdown={dropdowns.SimCBB}
                league={SimCBB}
                toggle={toggleMenu}
                isTop
              />
            )}
            {isNBAUser && (
              <SideMenuItem
                label={SimNBA}
                logo={nbaLogo}
                dropdown={dropdowns.SimNBA}
                league={SimNBA}
                toggle={toggleMenu}
                isTop
              />
            )}
            {isCHLUser && (
              <SideMenuItem
                label={SimCHL}
                logo={chlLogo}
                dropdown={dropdowns.SimCHL}
                league={SimCHL}
                toggle={toggleMenu}
                isTop
              />
            )}
            {isPHLUser && (
              <SideMenuItem
                league={SimPHL}
                label={SimPHL}
                logo={phlLogo}
                dropdown={dropdowns.SimPHL}
                toggle={toggleMenu}
                isTop
              />
            )}
            {isCollegeBaseballUser && (
              <SideMenuItem
                label="SimCBL"
                logo={collegeBaseballLogo}
                dropdown={dropdowns.SimCollegeBaseball}
                league={SimCollegeBaseball}
                toggle={toggleMenu}
                isTop
              />
            )}
            {isMlbUser && (
              <SideMenuItem
                label={SimMLB}
                logo={mlbLogo}
                dropdown={dropdowns.SimMLB}
                league={SimMLB}
                toggle={toggleMenu}
                isTop
              />
            )}
            <SideMenuItem
              click={navigateToAvailableTeams}
              label="Available Teams"
              toggle={toggleMenu}
            />
            <SideMenuItem
              click={navigateToNews}
              label="News"
              toggle={toggleMenu}
            />
            <SideMenuItem
              click={navigateToHelp}
              label="Help"
              toggle={toggleMenu}
            />
          </ul>
        </div>
      </aside>
    </>
  );
};
