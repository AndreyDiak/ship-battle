// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { EmailAuthProvider, getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA6Uq0qug6mEPP8fWKm9OLvintv-l-tZOA",
  authDomain: "ship-battle-online.firebaseapp.com",
  projectId: "ship-battle-online",
  storageBucket: "ship-battle-online.appspot.com",
  messagingSenderId: "191631376677",
  appId: "1:191631376677:web:6f35a5dfa0a7528a2cdacc",
  measurementId: "G-JCYH1LRLVT"
};

// Initialize Firebase
const app = !getApps().length
 ? initializeApp(firebaseConfig)
 : getApp();

const db = getFirestore()
const auth = getAuth();
// providers..
const googleProvider = new GoogleAuthProvider()
const emailProvider = new EmailAuthProvider();
// const analytics = getAnalytics(app);

export { db, auth, googleProvider, emailProvider };

