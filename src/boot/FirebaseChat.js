import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBmch3h8GcEIS2ggdwWuQ8JwmHUvqJF8no",
  authDomain: "tagam-7d162.firebaseapp.com",
  projectId: "tagam-7d162",
  storageBucket: "tagam-7d162.firebasestorage.app",
  messagingSenderId: "85413186790",
  appId: "1:85413186790:web:a7a1c60a65a1ce4c91ff27",
  measurementId: "G-FYCDJ7RW4Z",
};

const firebaseCollectionEnum = {
  chats: "chats",
  driver: "drivers",
  driver_logs: "driver_logs",
  limit: 50,
};

const firebaasApp = initializeApp(firebaseConfig);
const firebaseDb = getFirestore(firebaasApp);

export { firebaseDb, firebaseCollectionEnum };
