import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "./firebase";

/**
 * Updates a user's Firestore document by username.
 * @param {string} username - The username of the user to update.
 * @param {object} updateData - The data to update in the user's document.
 */
export const updateUserByUsername = async (
  username: string,
  updateData: any
) => {
  try {
    const userQuery = query(
      collection(firestore, "users"),
      where("username", "==", username)
    );
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      console.error(`No user found with username: ${username}`);
      return false;
    }
    // Update all found documents (in case there are duplicates)
    userSnapshot.forEach(async (docSnapshot) => {
      await updateDoc(doc(firestore, "users", docSnapshot.id), updateData);
    });

    console.log(`Updated Firestore for user: ${username}`);
    return true;
  } catch (error) {
    console.error("Error updating user in Firestore:", error);
    return false;
  }
};
