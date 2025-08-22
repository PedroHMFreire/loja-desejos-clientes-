// src/firebase.js
import { initializeApp } from "firebase/app"
import {
  getDatabase, ref, set, push, get, remove, update, onValue
} from "firebase/database"
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword
} from "firebase/auth"

// ⚠️ Confira se estes valores estão iguais ao do seu Console Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB3Epc580YmJDIxERO31njrBrYqnYcdeBo",
  authDomain: "anotesante.firebaseapp.com",
  databaseURL: "https://anotesante-default-rtdb.firebaseio.com",
  projectId: "anotesante",
  storageBucket: "anotesante.firebasestorage.app",
  messagingSenderId: "367190716781",
  appId: "1:367190716781:web:ff5042989b01758ce72a64"
}

// Inicializa app
const app = initializeApp(firebaseConfig)
const db = getDatabase(app)
const auth = getAuth(app)

// Exports centrais
export {
  app,
  db,
  ref,
  set,
  push,
  get,
  remove,
  update,
  onValue,
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword
}
