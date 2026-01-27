import { useEffect, useRef, useState } from "react";
import { Timestamp as FBTimeStamp } from "../models/footballModels";
import { Timestamp as BKTimestamp } from "../models/basketballModels";
import { Timestamp as HKTimestamp } from "../models/hockeyModels";
import { Timestamp as BaseballTimestamp } from "../models/baseballModels";
import { useAuthStore } from "../context/AuthContext";
import { SimBBA, SimFBA, SimHCK, SimMLB, SimCollegeBaseball } from "../_constants/constants";

export const useWebSockets = (url: string, sport: string) => {
  const { currentUser, isLoading } = useAuthStore();
  const tsWS = useRef<WebSocket | null>(null);
  const wsInitializedRef = useRef(false);
  const [cfb_Timestamp, setCFB_Timestamp] = useState<FBTimeStamp | null>(null);
  const [cbb_Timestamp, setCBB_Timestamp] = useState<BKTimestamp | null>(null);
  const [hck_Timestamp, setHCK_Timestamp] = useState<HKTimestamp | null>(null);
  const [baseball_Timestamp, setBaseball_Timestamp] = useState<BaseballTimestamp | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!currentUser) return;
    if (wsInitializedRef.current) return;
    wsInitializedRef.current = true;

    const initializeWebSockets = async () => {
      if (cfb_Timestamp && sport === SimFBA) return;
      if (cbb_Timestamp && sport === SimBBA) return;
      if (hck_Timestamp && sport === SimHCK) return;
      if (baseball_Timestamp && sport === SimMLB) return;
      if (baseball_Timestamp && sport === SimCollegeBaseball) return;
      console.log("Initializing " + sport + " WebSocket...");
      tsWS.current = new WebSocket(url);

      tsWS.current.onopen = () => console.log(sport + " WebSocket connected");
      tsWS.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (sport === SimFBA) {
          setCFB_Timestamp(data);
        } else if (sport === SimBBA) {
          setCBB_Timestamp(data);
        } else if (sport === SimHCK) {
          setHCK_Timestamp(data);
        } else if (sport === SimMLB) {
          setBaseball_Timestamp(data);
        } else if (sport === SimCollegeBaseball) {
          setBaseball_Timestamp(data);
        }
      };
      tsWS.current.onerror = (error) =>
        console.error(sport + " WebSocket error:", error);
      tsWS.current.onclose = () =>
        console.log(sport + " WebSocket connection closed");
    };

    initializeWebSockets();

    // Cleanup both WebSocket connections on unmount
    return () => {
      if (tsWS.current) {
        tsWS.current.close();
        tsWS.current = null;
      }
      wsInitializedRef.current = false;
    };
  }, [isLoading, currentUser]);

  return {
    cfb_Timestamp,
    cbb_Timestamp,
    hck_Timestamp,
    baseball_Timestamp,
    setCFB_Timestamp,
    setCBB_Timestamp,
    setHCK_Timestamp,
    setBaseball_Timestamp,
  };
};
