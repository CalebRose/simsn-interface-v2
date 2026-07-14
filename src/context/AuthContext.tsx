import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { CurrentUser, useCurrentUser } from "../_hooks/useCurrentUser";
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
import { getLogo } from "../_utility/getLogo";

// ✅ Define Auth Context Props
interface AuthContextProps {
  authId: string;
  setAuthId: (id: string) => void;
  currentUser: CurrentUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser | null>>;
  viewMode: string;
  setViewMode: (mode: string) => void;
  isLoading: boolean;
  isCFBUser: boolean;
  isNFLUser: boolean;
  isCBBUser: boolean;
  isNBAUser: boolean;
  isCHLUser: boolean;
  isPHLUser: boolean;
  isDarkMode: boolean;
  isModerator: boolean;
  isSubscriber: boolean;
  defaultLogo: string;
  cfbLogo: string;
  nflLogo: string;
  cbbLogo: string;
  nbaLogo: string;
  chlLogo: string;
  phlLogo: string;
  collegeBaseballLogo: string;
  mlbLogo: string;
}

// ✅ Initial Context Values
const defaultAuthContext: AuthContextProps = {
  authId: "",
  setAuthId: () => {},
  currentUser: null,
  setCurrentUser: () => {},
  viewMode: "dark",
  setViewMode: () => {},
  isLoading: true,
  isCFBUser: false,
  isNFLUser: false,
  isCBBUser: false,
  isCHLUser: false,
  isNBAUser: false,
  isPHLUser: false,
  isDarkMode: true,
  isModerator: false,
  isSubscriber: false,
  defaultLogo: "",
  cfbLogo: "",
  nflLogo: "",
  cbbLogo: "",
  nbaLogo: "",
  chlLogo: "",
  phlLogo: "",
  collegeBaseballLogo: "",
  mlbLogo: "",
};

// ✅ Create Auth Context
export const AuthContext = createContext<AuthContextProps>(defaultAuthContext);

// ✅ Define Props for the Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authId, setAuthId] = useState<string>("");
  const [currentUser, setCurrentUser, isLoading] = useCurrentUser();
  const [viewMode, setViewMode] = useState<string>(() => {
    // Safari-safe localStorage access with extensive compatibility checks
    if (typeof window === "undefined") {
      return "dark";
    }

    try {
      // Check if localStorage exists and is accessible (Safari private mode issue)
      if (!window.localStorage) {
        return "dark";
      }

      // Test localStorage functionality (Safari can throw on access)
      const testKey = "__test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);

      // Now safely get the theme
      const theme = localStorage.getItem("theme");
      return theme || "dark";
    } catch (error) {
      // Safari private browsing mode or other localStorage issues
      console.warn("localStorage unavailable (Safari private mode?):", error);
      return "dark";
    }
  });

  // Apply theme to HTML element when viewMode changes
  useEffect(() => {
    if (typeof window !== "undefined" && document.documentElement) {
      // Remove all theme classes first
      document.documentElement.classList.remove(
        "light",
        "dark",
        "red",
        "blue",
        "sage",
        "purple",
        "gold",
        "steel",
        "grey",
        "teal",
        "oceanblue",
        "castleton",
        "deepsea",
      );
      // Add the current theme class
      document.documentElement.classList.add(viewMode);

      // Also save to localStorage safely
      try {
        if (window.localStorage) {
          localStorage.setItem("theme", viewMode);
        }
      } catch (error) {
        console.warn("Could not save theme to localStorage:", error);
      }
    }
  }, [viewMode]);

  // Apply initial theme on mount
  useEffect(() => {
    if (typeof window !== "undefined" && document.documentElement) {
      // Remove all theme classes first
      document.documentElement.classList.remove(
        "light",
        "dark",
        "red",
        "blue",
        "sage",
        "purple",
        "gold",
        "steel",
        "grey",
        "teal",
        "oceanblue",
        "castleton",
        "deepsea",
      );
      // Add the current theme class
      document.documentElement.classList.add(viewMode);
    }
  }, []);

  const isCFBUser = useMemo(() => {
    if (currentUser && currentUser.teamId) {
      return currentUser.teamId > 0;
    }
    return false;
  }, [currentUser]);

  const isNFLUser = useMemo(() => {
    if (currentUser && currentUser.NFLTeamID) {
      return currentUser.NFLTeamID > 0;
    }
    return false;
  }, [currentUser]);

  const isCBBUser = useMemo(() => {
    if (currentUser && currentUser.cbb_id) {
      return currentUser.cbb_id > 0;
    }
    return false;
  }, [currentUser]);

  const isNBAUser = useMemo(() => {
    if (currentUser && currentUser.NBATeamID) {
      return currentUser.NBATeamID > 0;
    }
    return false;
  }, [currentUser]);

  const isCHLUser = useMemo(() => {
    if (currentUser && currentUser.CHLTeamID) {
      return currentUser.CHLTeamID > 0;
    }
    return false;
  }, [currentUser]);

  const isPHLUser = useMemo(() => {
    if (currentUser && currentUser.PHLTeamID) {
      return currentUser.PHLTeamID > 0;
    }
    return false;
  }, [currentUser]);

  const isDarkMode = useMemo(() => {
    if (viewMode === "light") {
      return false;
    } else if (viewMode === "grey") {
      return false;
    }
    return true;
  }, [viewMode]);

  const isModerator = useMemo(() => {
    if (currentUser) {
      const isAdmin = currentUser.roleID?.toLocaleLowerCase() === "admin";
      const isCommissioner =
        typeof currentUser.roleID === "string" &&
        currentUser.roleID.toLocaleLowerCase().includes("commissioner");
      return isAdmin || isCommissioner;
    }
    return false;
  }, [currentUser]);

  const isSubscriber = useMemo(() => {
    return currentUser?.IsSubscribed || false;
  }, [currentUser]);

  const {
    cfbLogo,
    nflLogo,
    cbbLogo,
    nbaLogo,
    chlLogo,
    phlLogo,
    collegeBaseballLogo,
    mlbLogo,
    defaultLogo,
  } = useMemo(() => {
    let cfbLogo = "";
    let nflLogo = "";
    let cbbLogo = "";
    let nbaLogo = "";
    let chlLogo = "";
    let phlLogo = "";
    let collegeBaseballLogo = "";
    let mlbLogo = "";
    let defaultLogo = "";

    if (currentUser) {
      const {
        teamId,
        NFLTeamID,
        cbb_id,
        NBATeamID,
        CHLTeamID,
        PHLTeamID,
        CollegeBaseballOrgID,
        MLBOrgID,
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
      if (CollegeBaseballOrgID) {
        collegeBaseballLogo = getLogo(
          SimCollegeBaseball,
          CollegeBaseballOrgID,
          IsRetro,
        );
      }
      if (MLBOrgID) {
        mlbLogo = getLogo(SimMLB, MLBOrgID, IsRetro);
      }

      switch (DefaultLeague) {
        case SimCFB:
          defaultLogo = cfbLogo;
          break;
        case SimNFL:
          defaultLogo = nflLogo;
          break;
        case SimCBB:
          defaultLogo = cbbLogo;
          break;
        case SimNBA:
          defaultLogo = nbaLogo;
          break;
        case SimCHL:
          defaultLogo = chlLogo;
          break;
        case SimPHL:
          defaultLogo = phlLogo;
          break;
        case SimCollegeBaseball:
          defaultLogo = collegeBaseballLogo;
          break;
        case SimMLB:
          defaultLogo = mlbLogo;
          break;
        default:
          // Fallback priority if DefaultLeague is not defined
          defaultLogo =
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
      defaultLogo,
    };
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        authId,
        setAuthId,
        currentUser,
        setCurrentUser,
        viewMode,
        setViewMode,
        isLoading,
        isCBBUser,
        isCFBUser,
        isCHLUser,
        isNBAUser,
        isNFLUser,
        isPHLUser,
        isDarkMode,
        isModerator,
        isSubscriber,
        defaultLogo,
        cfbLogo,
        nflLogo,
        cbbLogo,
        nbaLogo,
        chlLogo,
        phlLogo,
        collegeBaseballLogo,
        mlbLogo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom Hook for Using the Auth Store
export const useAuthStore = (): AuthContextProps => {
  const store = useContext(AuthContext);
  if (!store) {
    throw new Error("useAuthStore must be used within an AuthProvider");
  }
  return store;
};
