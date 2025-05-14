import { useState, useEffect, useCallback, useMemo } from "react";
import { FirebaseApp, initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc as firestoreDoc,
  updateDoc,
  onSnapshot,
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  WithFieldValue,
} from "firebase/firestore";
import { firebaseConfig } from "../firebase-config";

let firebaseApp: FirebaseApp;
const config = firebaseConfig();

if (!getApps().length) {
  firebaseApp = initializeApp(config);
} else {
  firebaseApp = getApp();
}
export const firestore = getFirestore(firebaseApp);
export default firebaseApp;

// Firestore converter for type safety
const converter = <T extends DocumentData>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: WithFieldValue<T>): DocumentData => data, // Serialize
  fromFirestore: (snapshot) => snapshot.data() as T, // Deserialize
});

export const useFirestore = <T extends DocumentData>(
  collectionName: string,
  docName: string
): [T | null, (newData: Partial<T>) => Promise<void>, boolean] => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the Firestore document reference
  const docRef = useMemo<DocumentReference<T>>(
    () =>
      firestoreDoc(firestore, collectionName, docName).withConverter(
        converter<T>()
      ),
    [collectionName, docName]
  );

  // Listen for real-time updates to the document
  useEffect(() => {
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setData(doc.data() as T);
      } else {
        setData(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [docRef]);

  // Update the document with new data
  const updateData = useCallback(
    async (newData: Partial<T>): Promise<void> => {
      try {
        await updateDoc(docRef, newData as WithFieldValue<T>);
      } catch (error) {
        console.error("Error updating document:", error);
      }
    },
    [docRef]
  );

  return [data, updateData, isLoading];
};
