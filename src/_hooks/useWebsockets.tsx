import { useEffect, useState } from "react";
import { Timestamp as FBTimeStamp } from "../models/footballModels";
import { Timestamp as BKTimestamp } from "../models/basketballModels";
import { Timestamp as HKTimestamp } from "../models/hockeyModels";
import { Timestamp as BaseballTimestamp } from "../models/baseball/baseballModels";
import { useAuthStore } from "../context/AuthContext";
import {
  SimBBA,
  SimFBA,
  SimHCK,
  SimMLB,
  SimCollegeBaseball,
} from "../_constants/constants";

const isTimestampMessage = (
  value: unknown,
): value is Record<
  string,
  FBTimeStamp | BKTimestamp | HKTimestamp | BaseballTimestamp
> & { ID: number } =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  "ID" in value &&
  typeof value.ID === "number";

export const useWebSockets = (url: string, sport: string) => {
  const { currentUser, isLoading } = useAuthStore();
  const [cfb_Timestamp, setCFB_Timestamp] = useState<FBTimeStamp | null>(null);
  const [cbb_Timestamp, setCBB_Timestamp] = useState<BKTimestamp | null>(null);
  const [hck_Timestamp, setHCK_Timestamp] = useState<HKTimestamp | null>(null);
  const [baseball_Timestamp, setBaseball_Timestamp] =
    useState<BaseballTimestamp | null>(null);

  useEffect(() => {
    if (isLoading || !currentUser) return;

    let socket: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let retryDelay = 1000;
    let closedByEffect = false;

    const clearRetry = () => {
      if (retryTimer !== null) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
    };

    const connect = () => {
      if (
        closedByEffect ||
        socket?.readyState === WebSocket.CONNECTING ||
        socket?.readyState === WebSocket.OPEN
      ) {
        return;
      }

      clearRetry();
      console.log(`Initializing ${sport} WebSocket...`);

      try {
        socket = new WebSocket(url);
      } catch (error) {
        console.error(`${sport} WebSocket failed to initialize:`, error);
        scheduleReconnect();
        return;
      }

      const currentSocket = socket;
      currentSocket.onopen = () => {
        console.log(`${sport} WebSocket connected`);
        retryDelay = 1000;
      };
      currentSocket.onmessage = (event: MessageEvent) => {
        let data: FBTimeStamp | BKTimestamp | HKTimestamp | BaseballTimestamp;
        try {
          data = JSON.parse(event.data);
        } catch (error) {
          console.error(`${sport} WebSocket received invalid JSON:`, error);
          return;
        }

        if (!isTimestampMessage(data)) {
          console.error(`${sport} WebSocket received an invalid timestamp`);
          return;
        }

        if (sport === SimFBA) {
          const ts = data as FBTimeStamp;
          setCFB_Timestamp(ts);
        } else if (sport === SimBBA) {
          setCBB_Timestamp(data as BKTimestamp);
        } else if (sport === SimHCK) {
          setHCK_Timestamp(data as HKTimestamp);
        } else if (sport === SimMLB || sport === SimCollegeBaseball) {
          setBaseball_Timestamp(data as BaseballTimestamp);
        }
      };
      currentSocket.onerror = (error) =>
        console.error(`${sport} WebSocket error:`, error);
      currentSocket.onclose = () => {
        console.log(`${sport} WebSocket connection closed`);
        if (socket === currentSocket) socket = null;
        if (!closedByEffect) scheduleReconnect();
      };
    };

    const scheduleReconnect = () => {
      if (closedByEffect || retryTimer !== null) return;

      const jitter = Math.random() * retryDelay * 0.2;
      const delay = retryDelay + jitter;
      retryDelay = Math.min(retryDelay * 2, 30_000);
      retryTimer = setTimeout(() => {
        retryTimer = null;
        connect();
      }, delay);
    };

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        (!socket || socket.readyState === WebSocket.CLOSED)
      ) {
        connect();
      }
    };

    connect();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      closedByEffect = true;
      clearRetry();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      socket?.close();
      socket = null;
    };
  }, [currentUser, isLoading, sport, url]);

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
