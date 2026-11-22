import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  reload,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { doc, getDocFromServer, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

function getOwnAuthUser(uid: string) {
  const user = getAuth().currentUser;
  if (!user || user.uid !== uid || !user.email) {
    throw new Error("Your session has changed. Please sign in again.");
  }
  return { user, email: user.email };
}

export async function refreshAccountEmail(uid: string): Promise<string> {
  const { user } = getOwnAuthUser(uid);
  await reload(user);
  const email = getOwnAuthUser(uid).email;

  const userRef = doc(firestore, "users", uid);
  const profile = await getDocFromServer(userRef);
  if (!profile.exists()) {
    throw new Error("Your user profile could not be found.");
  }
  if (profile.data().email !== email) {
    await user.getIdToken(true);
    getOwnAuthUser(uid);
    await updateDoc(userRef, { email });
  }
  return email;
}

export async function requestEmailChange(
  uid: string,
  newEmail: string,
  password: string,
): Promise<void> {
  const { user, email } = getOwnAuthUser(uid);
  const credential = EmailAuthProvider.credential(email, password);
  await reauthenticateWithCredential(user, credential);
  getOwnAuthUser(uid);
  await verifyBeforeUpdateEmail(user, newEmail);
}
