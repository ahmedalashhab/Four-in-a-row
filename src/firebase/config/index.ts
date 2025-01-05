import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { get, getDatabase, onValue, ref } from "firebase/database";
import { debugError, debugLog } from "../../utils/debug";

export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

debugLog("FIREBASE", "Initializing Firebase...");
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Test database connection
const connectedRef = ref(database, ".info/connected");
onValue(connectedRef, (snap) => {
  if (snap.val() === true) {
    debugLog("FIREBASE", "Successfully connected to Firebase Database");
  } else {
    debugError("FIREBASE", "Disconnected from Firebase Database");
  }
});

// Test database access
const testRef = ref(database, "rooms");
get(testRef)
  .then((snapshot) => {
    debugLog("FIREBASE", "Initial database access test successful");
    debugLog("FIREBASE", "Current rooms data", snapshot.val());
  })
  .catch((error) => {
    debugError("FIREBASE", "Initial database access test failed", error);
  });

export { app, auth, database };
