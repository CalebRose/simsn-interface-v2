import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  Timestamp 
} from "firebase/firestore";
import { firestore } from "../firebase/firebase"; 
import { League, SimCFB } from "../_constants/constants";

// This interface mirrors your Go backend's LiveGameRecord struct 
// found in StreamScheduler.go
export interface LiveFieldGameDoc {
  id: string;
  GameID: number;
  HomeTeamID: number;
  AwayTeamID: number;
  HomeTeam: string;
  AwayTeam: string;
  League: string;
  StreamStartTime: Timestamp;
  StreamEndTime: Timestamp;
  TotalPlays: number;
  IsRevealed: boolean;
  HomeTeamRank: number;
  AwayTeamRank: number;
  Arena: string;
  City: string;
  State: string;
  Country: string;
}

export const useLiveFieldState = (selectedLeague: League) => {
  const [liveGames, setLiveGames] = useState<LiveFieldGameDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Determine the correct collection based on the league selection
    const collectionName = selectedLeague === SimCFB ? "live_cfb_games" : "live_nfl_games";
    
    // Query only games that are currently active/not yet revealed
    const q = query(
      collection(firestore, collectionName), 
      where("IsRevealed", "==", false)
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const games: LiveFieldGameDoc[] = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as LiveFieldGameDoc));
        
        setLiveGames(games);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching live field games:", error);
        setIsLoading(false);
      }
    );

    // Cleanup subscription when the component unmounts
    return () => unsubscribe();
  }, [selectedLeague]);

  return { liveGames, isLoading };
};