import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { firestore } from '../firebase/firebase'; 
import { SimCFB } from '../_constants/constants'; // Ensure this path is correct

export const useLiveFieldState = (league: string) => {
  const [liveGames, setLiveGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Hook: Effect triggered for league:", league);
    
    if (!league) {
      setLiveGames([]);
      setIsLoading(false);
      return;
    }

    // Fixed: Compare against the constant SimCFB
    const collectionName = league === SimCFB ? 'live_cfb_games' : 'live_nfl_games';
    console.log("Hook: Querying collection:", collectionName);

    const q = query(collection(firestore, collectionName));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const games = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      console.log("Hook: Firestore Data Loaded:", games);
      setLiveGames(games);
      setIsLoading(false);
    }, (error) => {
      console.error("Hook: Firestore Error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [league]);

  return { liveGames, isLoading };
};