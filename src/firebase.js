// src/firebase.js
import { initializeApp } from "firebase/app"
import { getDatabase, ref, push, onValue, remove, set } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyB3Epc580YmJDIxERO31njrBrYqnYcdeBo",
  authDomain: "anotesante.firebaseapp.com",
  databaseURL: "https://anotesante-default-rtdb.firebaseio.com",
  projectId: "anotesante",
  storageBucket: "anotesante.firebasestorage.app",
  messagingSenderId: "367190716781",
  appId: "1:367190716781:web:ff5042989b01758ce72a64"
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

export { db, ref, push, onValue, remove, set }
