// DeepLinkContext.tsx
import { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import routes from "../_constants/routes";
import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../_constants/constants";

interface DeepLinkContextProps {
  goToTeamPage: (
    league: League,
    teamId?: number,
    options?: Record<string, string>,
  ) => void;
  goToUserProfile: (username: string) => void;
}

const DeepLinkContext = createContext<DeepLinkContextProps>({
  goToTeamPage: () => {},
  goToUserProfile: () => {},
});

export const DeepLinkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();

  const goToTeamPage = (
    league: League,
    teamId?: number,
    options?: Record<string, string>,
  ) => {
    let path = "";
    if (league === SimCHL) path = routes.CHL_TEAM;
    if (league === SimPHL) path = routes.PHL_TEAM;
    if (league === SimCFB) path = routes.CFB_TEAM;
    if (league === SimNFL) path = routes.NFL_TEAM;
    if (league === SimCBB) path = routes.CBB_TEAM;
    if (league === SimNBA) path = routes.NBA_TEAM;

    if (path.includes(":teamId")) {
      path = path.replace(":teamId?", teamId?.toString() ?? "");
    }

    if (options) {
      const query = new URLSearchParams(options).toString();
      path += `?${query}`;
    }

    navigate(path);
  };

  const goToUserProfile = (username: string) => {
    const path = routes.USER.replace(":username", username);
    navigate(path);
  };

  return (
    <DeepLinkContext.Provider value={{ goToTeamPage, goToUserProfile }}>
      {children}
    </DeepLinkContext.Provider>
  );
};

export const useDeepLink = () => useContext(DeepLinkContext);
