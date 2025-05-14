import { useEffect, useState } from "react";
import { doc as firestoreDoc, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { fireBaseAppPromise, getFirestoreInstance } from "../firebase-config";

// ✅ Define Current User Type
export interface CurrentUser {
  id: string;
  username: string;
  teamId?: number;
  NFLTeamID?: number;
  cbb_id?: number;
  NBATeamID?: number;
  CHLTeamID?: number;
  PHLTeamID?: number;
  isRetro?: boolean;
  roleID: string | null;
  email: string;
  DefaultLeague: string | null;
}
type UseCurrentUserReturn = [
  CurrentUser | null,
  React.Dispatch<React.SetStateAction<CurrentUser | null>>,
  boolean
];

export const useCurrentUser = (): UseCurrentUserReturn => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubAuth: () => void;
    (async () => {
      const app = await fireBaseAppPromise;
      const auth = getAuth(app);

      unsubAuth = onAuthStateChanged(auth, (user) => {
        if (!user) {
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }
        getFirestoreInstance().then((firestore) => {
          const userRef = firestoreDoc(firestore, "users", user.uid);
          const unsubSnap = onSnapshot(userRef, (snap) => {
            setCurrentUser(snap.exists() ? (snap.data() as any) : null);
            setIsLoading(false);
            unsubSnap();
          });
        });
      });
    })();

    return () => {
      unsubAuth?.();
    };
  }, []);

  return [currentUser, setCurrentUser, isLoading];
};
