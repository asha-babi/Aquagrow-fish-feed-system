/**
 * ════════════════════════════════════════════════════════════
 *  Aquagrow – FIREBASE CONFIG & INITIALIZATION
 *  Judy Fish Facilities, Gaza Province, Mozambique
 *
 *  Loaded on every page, after the Firebase SDK <script> tags
 *  and before acgrow-database.js / acgrow-app.js.
 * ════════════════════════════════════════════════════════════
 */
const firebaseConfig = {
  apiKey: "AIzaSyDM5XDdgmRLd6dwAQGq3nrZbVVKkqv_RYQ",
  authDomain: "acquagrow-projectt.firebaseapp.com",
  projectId: "acquagrow-projectt",
  storageBucket: "acquagrow-projectt.firebasestorage.app",
  messagingSenderId: "297457752204",
  appId: "1:297457752204:web:f1cc7d96893a10cbc843a9",
  measurementId: "G-ZLH747LPT4"
};

let db = null;
let firebaseReady = false;

try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  firebaseReady = true;

  console.log("✅ Firebase connected successfully.");

  db.collection("test").doc("connection").set({
    status: "Connected",
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    console.log("✅ Firestore test successful.");
  }).catch((error) => {
    console.error("❌ Firestore write failed:", error);
  });

} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
}
