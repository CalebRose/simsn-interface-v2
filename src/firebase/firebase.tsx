import { useState, useEffect, useCallback, useMemo } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc as firestoreDoc,
  collection,
  updateDoc,
  deleteDoc,
  onSnapshot,
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  WithFieldValue,
} from "firebase/firestore";
import { firebaseConfig } from "../firebase-config";

const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);

// Firestore converter for type safety
const converter = <T extends DocumentData>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: WithFieldValue<T>): DocumentData => data, // Serialize
  fromFirestore: (snapshot) => snapshot.data() as T, // Deserialize
});

export const useFirestore = <T extends DocumentData>(
  collectionName: string,
  docName: string,
): [T | null, (newData: Partial<T>) => Promise<void>, boolean] => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the Firestore document reference
  const docRef = useMemo<DocumentReference<T>>(
    () =>
      firestoreDoc(firestore, collectionName, docName).withConverter(
        converter<T>(),
      ),
    [collectionName, docName],
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
    [docRef],
  );

  return [data, updateData, isLoading];
};

export const useFirestoreCollection = <T extends DocumentData>(
  collectionName: string,
): [
  (T & { id: string })[] | null,
  {
    update: (id: string, data: Partial<T>) => Promise<void>;
    remove: (id: string) => Promise<void>;
  },
  boolean,
  Error | null,
] => {
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const collectionRef = useMemo(
    () => collection(firestore, collectionName).withConverter(converter<T>()),
    [collectionName],
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(docs);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [collectionRef]);

  const update = useCallback(
    async (id: string, newData: Partial<T>): Promise<void> => {
      try {
        await updateDoc(
          firestoreDoc(firestore, collectionName, id),
          newData as DocumentData,
        );
      } catch (err) {
        console.error("Error updating document:", err);
        throw err;
      }
    },
    [collectionName],
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteDoc(firestoreDoc(firestore, collectionName, id));
      } catch (err) {
        console.error("Error deleting document:", err);
        throw err;
      }
    },
    [collectionName],
  );

  return [data, { update, remove }, isLoading, error];
};
