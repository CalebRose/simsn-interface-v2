import { useState, useEffect, useCallback, useMemo } from "react";
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
import { fireBaseAppPromise, getFirestoreInstance } from "../firebase-config";

const getFirebaseApp = async () => {
  return await fireBaseAppPromise;
};

// Firestore converter for type safety
const converter = <T extends DocumentData>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: WithFieldValue<T>): DocumentData => data, // Serialize
  fromFirestore: (snapshot) => snapshot.data() as T, // Deserialize
});

export function useFirestore<T>(collection: string, id: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: () => void;
    (async () => {
      const firestore = await getFirestoreInstance();
      const ref = firestoreDoc(firestore, collection, id);
      unsub = onSnapshot(ref, (snap) => {
        setData(snap.exists() ? (snap.data() as T) : null);
        setLoading(false);
      });
    })();
    return () => unsub?.();
  }, [collection, id]);

  const updateData = async (newData: Partial<T>) => {
    const firestore = await getFirestoreInstance();
    const ref = firestoreDoc(firestore, collection, id);
    await updateDoc(ref, newData);
  };

  return [data, updateData, isLoading] as const;
}
