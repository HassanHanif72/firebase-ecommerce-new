import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAYfDDXAvkOUx7phyBL-jEUTDiVTxdAIN8",
    authDomain: "ecommmerce-web.firebaseapp.com",
    projectId: "ecommmerce-web",
    storageBucket: "ecommmerce-web.firebasestorage.app",
    messagingSenderId: "861342873270",
    appId: "1:861342873270:web:65b9f91c4a2a5beab4d817"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, signInWithEmailAndPassword, onAuthStateChanged, signOut, db, collection, addDoc, getDocs };