import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBOzaAsS1MWLq6vU50PfOBD1xoIFflDa8E",
  authDomain: "gassistant-83242.firebaseapp.com",
  projectId: "gassistant-83242",
  storageBucket: "gassistant-83242.firebasestorage.app",
  messagingSenderId: "997841212210",
  appId: "1:997841212210:web:b15443df27443bb1587d2b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
