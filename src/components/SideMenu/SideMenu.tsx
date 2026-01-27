import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { AuthService } from "../../_services/auth";
import { getLogo } from "../../_utility/getLogo";
import routes from "../../_constants/routes";
import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { SideMenuItem } from "../../_design/SideMenuItem";
import { NavDropdown, NavDropdownItem } from "../../_design/DropdownList";
import { useAuthStore } from "../../context/AuthContext";
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
  const { isOpen, isDropdownOpen, toggleMenu, toggleDropdown, dropdowns } =
    useSideMenu();
  const { isDesktop } = useResponsive();
  const [processing, setProcessing] = useState(false);
  const { baseColor } = useBackgroundColor();
  const textColor = getTextColorBasedOnBg(baseColor);
  const navigate = useNavigate();
  // ✅ Generate logos based on current user
  const { cfbLogo, nflLogo, cbbLogo, nbaLogo, chlLogo, phlLogo, logo } =
    useMemo(() => {
      let cfbLogo = "";
      let nflLogo = "";
      let cbbLogo = "";
      let nbaLogo = "";
      let chlLogo = "";
      let phlLogo = "";
      let logo = "";

      if (currentUser) {
        const {
          teamId,
          NFLTeamID,
          cbb_id,
          NBATeamID,
          CHLTeamID,
          PHLTeamID,
          isRetro,
          DefaultLeague,
        } = currentUser;

        if (teamId) {
          cfbLogo = getLogo(SimCFB, teamId, isRetro);
        }
        if (NFLTeamID) {
          nflLogo = getLogo(SimNFL, NFLTeamID, isRetro);
        }
        if (cbb_id) {
          cbbLogo = getLogo(SimCBB, cbb_id, isRetro);
        }
        if (NBATeamID) {
          nbaLogo = getLogo(SimNBA, NBATeamID, isRetro);
        }
        if (CHLTeamID) {
          chlLogo = getLogo(SimCHL, CHLTeamID, isRetro);
        }
        if (PHLTeamID) {
          phlLogo = getLogo(SimPHL, PHLTeamID, isRetro);
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
          default:
            // Fallback priority if DefaultLeague is not defined
            logo =
              cfbLogo ||
              nflLogo ||
              cbbLogo ||
              nbaLogo ||
              chlLogo ||
              phlLogo ||
              "";
            break;
        }
      }

      return { cfbLogo, nflLogo, cbbLogo, nbaLogo, chlLogo, phlLogo, logo };
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
                      {currentUser.roleID === "Admin" && (
                        <NavDropdownItem
                          label="Admin"
                          isRoute={true}
                          route="/admin"
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
