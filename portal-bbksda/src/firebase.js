import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAP7Hzjdfe8Am2nR8FZTkGjuQZBuIZ_XS0",
  authDomain: "portal-satwa-riau.firebaseapp.com",
  projectId: "portal-satwa-riau",
  storageBucket: "portal-satwa-riau.firebasestorage.app",
  messagingSenderId: "489548139703",
  appId: "1:489548139703:web:2503455c8bd02c78355132",
  measurementId: "G-PXJ1HNK0KZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);