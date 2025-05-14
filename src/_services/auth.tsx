import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  User,
} from "firebase/auth";
import {
  getFirestore,
  doc as firestoreDoc,
  setDoc,
  onSnapshot,
  DocumentData,
  DocumentReference,
} from "firebase/firestore";
import firebaseApp from "../firebase/firebase";

const fireStore = getFirestore(firebaseApp);

// 🔑 Define types for return values
interface AuthResponse {
  status: boolean;
  message: string;
}

interface UserProfile {
  data: DocumentData;
  user: User;
}

// 🔥 AuthService Object with Typed Methods
export const AuthService: {
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<AuthResponse>;
  user: boolean | User;
  getProfile: (hard?: boolean) => Promise<UserProfile | false>;
  logout: () => Promise<AuthResponse>;
  login: (email: string, password: string) => Promise<AuthResponse>;
} = {
  user: false,

  // Register new user
  register: async (
    username: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    const fauth = getAuth();

    return new Promise<AuthResponse>((resolve) => {
      createUserWithEmailAndPassword(fauth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          const uid = user.uid;
          if (!fauth.currentUser) {
            resolve({ status: false, message: "User creation failed." });
            return;
          }

          await updateProfile(fauth.currentUser, {
            displayName: username,
          });
          try {
            await setDoc(firestoreDoc(fireStore, "users", user.uid), {
              username,
              email: user.email,
              createdAt: new Date(),
            });
          } catch (firestoreError: any) {
            console.error("Failed to write user profile:", firestoreError);
          }
          localStorage.setItem("userId", uid);
          resolve({ status: true, message: "Registered successfully." });
        })
        .catch((error) => {
          let message = "Something went wrong.";
          if (error.code === "auth/email-already-in-use") {
            message = "Email already used.";
          }
          resolve({ status: false, message });
        });
    });
  },

  // Get user profile from Firestore
  getProfile: (hard = false): Promise<UserProfile | false> => {
    return new Promise<UserProfile | false>((res) => {
      const fauth = getAuth();

      fauth.onAuthStateChanged((user) => {
        if (user) {
          const userRef: DocumentReference<DocumentData> = firestoreDoc(
            fireStore,
            `users`,
            user.uid
          );

          onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
              res({ data: doc.data(), user });
            } else {
              res(false);
            }
          });
        } else {
          res(false);
        }
      });
    });
  },

  // Logout the user
  logout: async (): Promise<AuthResponse> => {
    const fauth = getAuth();
    return new Promise<AuthResponse>((resolve) => {
      fauth
        .signOut()
        .then(() => {
          localStorage.removeItem("userId");
          resolve({ status: true, message: "Logged out successfully." });
        })
        .catch(() => {
          resolve({ status: false, message: "Logout failed." });
        });
    });
  },

  // Login user with email and password
  login: (email: string, password: string): Promise<AuthResponse> => {
    const fauth = getAuth();
    return new Promise<AuthResponse>((resolve) => {
      signInWithEmailAndPassword(fauth, email, password)
        .then((userCredential) => {
          if (userCredential.user) {
            localStorage.setItem("userId", userCredential.user.uid);
            resolve({ status: true, message: "Login successful." });
          } else {
            resolve({
              status: false,
              message: "Incorrect email or password.",
            });
          }
        })
        .catch(() => {
          resolve({
            status: false,
            message: "Incorrect email or password.",
          });
        });
    });
  },
};
