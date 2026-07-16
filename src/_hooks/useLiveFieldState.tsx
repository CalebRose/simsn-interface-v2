import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import { SimCFB } from "../_constants/constants"; // Ensure this path is correct

export const useLiveFieldState = (league: string) => {
  const [liveGames, setLiveGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!league) {
      setLiveGames([]);
      setIsLoading(false);
      return;
    }

    const collectionName =
      league === SimCFB ? "live_cfb_games" : "live_nfl_games";

    const q = query(collection(firestore, collectionName));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const incoming = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Only update state when the set of game IDs actually changes so
        // downstream effects that depend on this array don't re-run on every
        // snapshot heartbeat.
        setLiveGames((prev) => {
          const prevIds = prev.map((g) => g.id).join(",");
          const nextIds = incoming.map((g) => g.id).join(",");
          return prevIds === nextIds ? prev : incoming;
        });
        setIsLoading(false);
      },
      (error) => {
        console.error("useLiveFieldState: Firestore error:", error);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [league]);

  return { liveGames, isLoading };
};
