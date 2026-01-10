import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Tes vraies clés récupérées sur la console
const firebaseConfig = {
  apiKey: "AIzaSyAoea_4NbNvKDJ-nE_5PSXCrN5Ou7ZpEHM",
  authDomain: "lost-and-found-bd5f1.firebaseapp.com",
  projectId: "lost-and-found-bd5f1",
  storageBucket: "lost-and-found-bd5f1.firebasestorage.app",
  messagingSenderId: "515873190686",
  appId: "1:515873190686:web:458acd23c45f318a994f0f",
  measurementId: "G-KN5679TPMS"
};

console.log('Configuration Firebase:', firebaseConfig);

// 1. Initialiser Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase initialisé:', app);

// 2. Initialiser l'authentification
const auth = getAuth(app);
console.log('Auth initialisé:', auth);

// 3. Initialiser la base de données Firestore
const db = getFirestore(app);
console.log('Firestore initialisé:', db);

// 4. Exporter les services pour les utiliser dans tes pages
export { auth, db };
export default app;