// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD0jPDHXUFuAYriYHyzaQWVxrB-QQhvuSQ",
    authDomain: "rfwin-bingo.firebaseapp.com",
    projectId: "rfwin-bingo",
    storageBucket: "rfwin-bingo.firebasestorage.app",
    messagingSenderId: "984820122189",
    appId: "1:984820122189:web:3f01ecbb1d8ef3b3db5204",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// Automatically sign in users anonymously
signInAnonymously(auth).catch(console.error);
