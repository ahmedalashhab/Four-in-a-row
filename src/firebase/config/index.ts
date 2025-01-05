import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { get, getDatabase, onValue, ref } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCx7iNOFlLtLweWTWPeWLlwhTv28OgLdLk",
  authDomain: "connect-4-6f744.firebaseapp.com",
  databaseURL:
    "https://connect-4-6f744-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "connect-4-6f744",
  storageBucket: "connect-4-6f744.appspot.com",
  messagingSenderId: "17855025010",
  appId: "1:17855025010:web:69c05efdc20fbdeb3a57eb",
  measurementId: "G-KMJW9VYERN",
};

console.log("Initializing Firebase...");
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Test database connection
const connectedRef = ref(database, ".info/connected");
onValue(connectedRef, (snap) => {
  if (snap.val() === true) {
    console.log("🟢 Successfully connected to Firebase Database");
  } else {
    console.log("🔴 Disconnected from Firebase Database");
  }
});

// Test database access
const testRef = ref(database, "rooms");
get(testRef)
  .then((snapshot) => {
    console.log("🟢 Initial database access test successful");
    console.log("🟢 Current rooms data:", snapshot.val());
  })
  .catch((error) => {
    console.error("🔴 Initial database access test failed:", error);
  });

export { app, auth, database };
