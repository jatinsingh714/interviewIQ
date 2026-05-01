

import {getAuth, GoogleAuthProvider} from "firebase/auth"
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-ce26b.firebaseapp.com",
  projectId: "interviewiq-ce26b",
  storageBucket: "interviewiq-ce26b.firebasestorage.app",
  messagingSenderId: "926860172988",
  appId: "1:926860172988:web:68cd477e5a512dbe207ab9"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth, provider}
