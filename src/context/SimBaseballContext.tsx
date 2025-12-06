import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Timestamp as BaseballTimestamp,
  BaseballOrganization,
  BaseballTeam,
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
  // useRef to prevent multiple fetches
  const isFetching = useRef(false);
  // useState hooks for data that may update more often
  const [organizations, setOrganizations] = useState<BaseballOrganization[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const { baseball_Timestamp, setBaseball_Timestamp } = useWebSockets(
    baseball_ws,
    SimMLB
  );

  /*
    // useMemo hooks
  */

  // When the organization data loads, find the user's org
  // I suggest using useMemo for derived data like this, in the event that we're not updating or setting the data as often
  // Meaning, any data that is derived from state or props that doesn't need to trigger a re-render should be memoized
  // This improves performance by avoiding unnecessary calculations on each render
  // I suggest using SimFBAContext.tsx as a reference for how we're using useMemo, useEffect, and useCallback :)
  console.log({ organizations });
  const mlbOrganization = useMemo(() => {
    if (!currentUser || !organizations) return null;
    return organizations.find((o) => o.id === currentUser.MLBOrgID) || null;
  }, [currentUser, organizations]);

  /*
    // useEffects for fetching data on mount + bootstrap
  */

  // Load team data on mount.
  useEffect(() => {
    getBaseballOrgData();
  }, []);

  useEffect(() => {
    if (currentUser && !isFetching.current) {
      isFetching.current = true;
      // Landing page bootstrap function call here
    }
  }, [currentUser]);

  /*
    // useCallbacks for functions
  */
  // Callback function for fetching organization data
  // Setting up function outside of useEffect to avoid re-creation on each render
  // But also so that we can use it elsewhere if needed :)
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
        organizations: null, // Add real data later
        collegeOrganization: null, // Add real data later
        mlbOrganization: null, // Add real data later
        isCollegeOrgLoading: false,
        isMlbOrgLoading: false,
        baseball_Timestamp,
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
