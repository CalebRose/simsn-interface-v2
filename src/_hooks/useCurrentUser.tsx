import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import firebaseApp, { firestore } from "../firebase/firebase";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

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
    const auth = getAuth(firebaseApp);

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (user: User | null) => {
        if (user) {
          try {
            const userRef = doc(firestore, "users", user.uid);
            const unsubscribeSnapshot = onSnapshot(userRef, (docSnapshot) => {
              if (docSnapshot.exists()) {
                setCurrentUser(docSnapshot.data() as CurrentUser);
              } else {
                setCurrentUser(null);
              }
              setIsLoading(false);
            });

            return () => unsubscribeSnapshot();
          } catch (err) {
            console.error("Failed to fetch user profile:", err);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null); // Logged out
        }

        setIsLoading(false);
      }
    );

    return () => unsubscribeAuth();
  }, []);

  return [currentUser, setCurrentUser, isLoading];
};
