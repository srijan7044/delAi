import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "delai-4672d.firebaseapp.com",
  projectId: "delai-4672d",
  storageBucket: "delai-4672d.firebasestorage.app",
  messagingSenderId: "679012055492",
  appId: "1:679012055492:web:a95ebf7636b222439ccc91"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export {auth , provider}

