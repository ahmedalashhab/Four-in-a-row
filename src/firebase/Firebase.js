import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider, signInAnonymously, signInWithPopup, signOut
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import { firebaseConfig } from "./firebaseConfig";


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export const SignInWithGoogle = () => {
  signInWithPopup(auth, provider)
    .catch((error) => {
      // Handle Errors here.
      console.log(error);
    });
};

export const SignOut = () => {
  signOut(auth);
}

export const SignInAnonymously = () => {
  signInAnonymously(auth)
    .catch((error) => {
      // Handle Errors here.
      console.log(error);
    });
};
