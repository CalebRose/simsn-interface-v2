import { getAuth } from "firebase/auth";

export const getFirebaseIdToken = async (): Promise<string | null> => {
  try {
    const user = getAuth().currentUser;
    return user ? await user.getIdToken() : null;
  } catch (error) {
    console.warn("Unable to obtain Firebase ID token:", error);
    return null;
  }
};
