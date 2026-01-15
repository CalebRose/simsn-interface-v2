import React, {
  createContext,
  useContext,
  ReactNode,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Timestamp as BaseballTimestamp,
  BaseballOrganization,
  BaseballRosters,
} from "../models/baseballModels";
import { useAuthStore } from "./AuthContext";
import { BaseballService } from "../_services/baseballService";
import { useEffect, useState } from "react";
import { useWebSockets } from "../_hooks/useWebsockets";
import { baseball_ws } from "../_constants/urls";
import { SimMLB } from "../_constants/constants";

// ✅ Define Context Interface
interface SimBaseballContextProps {
  organizations: BaseballOrganization[] | null;
  collegeOrganization?: BaseballOrganization | null;
  mlbOrganization?: BaseballOrganization | null;
  isCollegeOrgLoading?: boolean;
  isMlbOrgLoading?: boolean;
  baseball_Timestamp: BaseballTimestamp | null;
  isLoading?: boolean;
}

// ✅ Initial Default Context
const defaultContext: SimBaseballContextProps = {
  organizations: null,
  collegeOrganization: null,
  mlbOrganization: null,
  isCollegeOrgLoading: false,
  isMlbOrgLoading: false,
  baseball_Timestamp: null,
  isLoading: false,
};

// ✅ Create Context
export const SimBaseballContext =
  createContext<SimBaseballContextProps>(defaultContext);

// ✅ Define Props for the Provider
interface SimBaseballProviderProps {
  children: ReactNode;
}

// ✅ Provider Component
export const SimBaseballProvider: React.FC<SimBaseballProviderProps> = ({
  children,
}) => {
  const { currentUser } = useAuthStore();
  const isFetching = useRef(false);
  const [organizations, setOrganizations] = useState<BaseballOrganization[]>(
    []
  );

  const [rosters, setRosters] = useState<BaseballRosters[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { baseball_Timestamp, setBaseball_Timestamp } = useWebSockets(
    baseball_ws,
    SimMLB
  );

  const mlbOrganization = useMemo(() => {
    if (!currentUser || !organizations) return null;
    return organizations.find((o) => o.id === currentUser.MLBOrgID) || null;
  }, [currentUser, organizations]);

  // Load data when user logs in
  useEffect(() => {
    getBaseballOrgData();
  }, []);

  useEffect(() => {
    if (currentUser && !isFetching.current) {
      isFetching.current = true;
      // Landing page bootstrap function call here
    }
  }, [currentUser]);

  const getBaseballOrgData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Call the service → which calls the backend
      const orgs = await BaseballService.GetAllOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      console.error("Failed to load organizations", error);
    }
    setIsLoading(false);
  }, []);

  // Empty bootstrap functions for later implementation
  const getFaceData = useCallback(async () => {}, []);

  const getBootstrapLandingData = useCallback(async () => {}, []);

  const getBootstrapRosterData = useCallback(async () => {}, []);

  const getBootstrapScheduleData = useCallback(async () => {}, []);

  const getBootstrapFreeAgencyData = useCallback(async () => {}, []);

  const getBootstrapRecruitingData = useCallback(async () => {}, []);

  const getBootstrapPortalData = useCallback(async () => {}, []);

  const getBootstrapStatsData = useCallback(async () => {}, []);

  return (
    <SimBaseballContext.Provider
      value={{
        organizations: organizations, // Add real data later
        collegeOrganization: null, // Add real data later
        mlbOrganization: mlbOrganization, // Add real data later
        isCollegeOrgLoading: false,
        isMlbOrgLoading: isLoading,
        baseball_Timestamp,
        isLoading: isLoading,
      }}
    >
      {children}
    </SimBaseballContext.Provider>
  );
};

// ✅ Custom Hook for Context Usage with Safety Check
export const useSimBaseballStore = (): SimBaseballContextProps => {
  const context = useContext(SimBaseballContext);
  if (!context) {
    throw new Error(
      "useSimBaseballStore must be used within a SimBaseballProvider"
    );
  }
  return context;
};
