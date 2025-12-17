// Firebase configuration for BraiBit
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCg9fqUiVz67uSbUgrbj4Z3T0XdZvK5F6Q",
  authDomain: "braibit-ies-braille.firebaseapp.com",
  projectId: "braibit-ies-braille",
  storageBucket: "braibit-ies-braille.firebasestorage.app",
  messagingSenderId: "620579083812",
  appId: "1:620579083812:web:912898c8d88b973274eab1",
  measurementId: "G-J82FSSHQ0S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
