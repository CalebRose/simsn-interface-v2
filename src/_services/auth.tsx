import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
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
import { firebaseConfig } from "../firebase-config";
import { refreshAccountEmail } from "./accountSettings";

const firebaseApp = initializeApp(firebaseConfig);
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

const passwordResetMessage =
  "If an account exists for that email, you'll receive a password reset link shortly.";

// 🔥 AuthService Object with Typed Methods
export const AuthService: {
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<AuthResponse>;
  user: boolean | User;
  getProfile: (hard?: boolean) => Promise<UserProfile | false>;
  logout: () => Promise<AuthResponse>;
  login: (email: string, password: string) => Promise<AuthResponse>;
  resetPassword: (email: string) => Promise<AuthResponse>;
} = {
  user: false,

  // Register new user
  register: async (
    username: string,
    email: string,
    password: string,
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
              usernameLower: username.toLowerCase(),
              email: user.email,
              createdAt: new Date(),
              newCFBUserCustomCrootBenefit: true,
              newCBBUserCustomCrootBenefit: true,
              newCHLUserCustomCrootBenefit: true,
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
            user.uid,
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
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const fauth = getAuth();
    try {
      const { user } = await signInWithEmailAndPassword(fauth, email, password);
      localStorage.setItem("userId", user.uid);
      try {
        await refreshAccountEmail(user.uid);
      } catch (error) {
        console.error("Failed to sync account email:", error);
        return {
          status: true,
          message:
            "Login successful, but your profile email could not be synchronized. Open Account Settings to retry.",
        };
      }
      return { status: true, message: "Login successful." };
    } catch {
      return { status: false, message: "Incorrect email or password." };
    }
  },

  resetPassword: async (email: string): Promise<AuthResponse> => {
    try {
      await sendPasswordResetEmail(getAuth(), email);
      return { status: true, message: passwordResetMessage };
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "auth/user-not-found"
      ) {
        return { status: true, message: passwordResetMessage };
      }

      console.error("Password reset error:", error);
      return {
        status: false,
        message: "Unable to send a password reset email. Please try again.",
      };
    }
  },
};
