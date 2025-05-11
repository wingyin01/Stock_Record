// Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    deleteDoc,
    query,
    where,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your Firebase configuration values
const firebaseConfig = {
  apiKey: "AIzaSyAD_WY-DP9DD5mI897JRrLMe6NtDvGkF9U",
  authDomain: "stock-record-a1b38.firebaseapp.com",
  projectId: "stock-record-a1b38",
  storageBucket: "stock-record-a1b38.appspot.com",
  messagingSenderId: "229034022183",
  appId: "1:229034022183:web:2d1243e8a44b8be2f94502",
  measurementId: "G-757DCZCRLS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Set persistent authentication
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

export { 
    auth, 
    db, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    query,
    where,
    updateDoc,
    googleProvider,
    signInWithPopup
}; 