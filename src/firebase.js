// src/firebase.js
import { initializeApp } from "firebase/app"
import {
  getDatabase, ref, set, push, get, remove, onValue
} from "firebase/database"
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword
} from "firebase/auth"

// ⚠️ Confira se estes valores batem com o seu Console Firebase (Projeto > Configurações > Seu app Web)
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
const auth = getAuth(app)

// ---------- DIAGNÓSTICO ----------
/**
 * Faz um push e, em seguida, um get no seu Realtime DB.
 * - Se houver usuário logado, usa: users/{uid}/__diagnostic/{autoId}
 * - Caso contrário, usa: __diagnostic_public/{timestamp}
 * Loga todos os passos no console.
 */
export async function diagnosticTest() {
  try {
    const uid = auth.currentUser?.uid
    const basePath = uid ? `users/${uid}/__diagnostic` : `__diagnostic_public`
    const node = uid ? `users/${uid}` : `__diagnostic_public`
    console.info("[Diag] Iniciando diagnóstico…")
    console.info("[Diag] Project ID:", app.options.projectId)
    console.info("[Diag] Database URL:", app.options.databaseURL)
    console.info("[Diag] Auth uid:", uid || "(sem login)")

    // grava
    const targetRef = ref(db, `${basePath}`)
    const payload = { ok: true, t: Date.now(), via: "diagnosticTest" }
    const pushRes = await push(targetRef, payload)
    console.info("[Diag] Push OK. Key:", pushRes.key)

    // lê de volta do nó pai
    const snap = await get(ref(db, basePath))
    console.info("[Diag] Read exists?", snap.exists())
    if (snap.exists()) {
      const val = snap.val()
      const keys = Object.keys(val)
      console.info(`[Diag] Registros lidos em "${basePath}":`, keys.length, keys.slice(-3))
    }

    // leitura de verificação extra (quando logado) no nó raiz do usuário
    if (uid) {
      const userSnap = await get(ref(db, node))
      console.info("[Diag] user root exists?", userSnap.exists())
    }

    console.info("[Diag] Finalizado com sucesso ✅")
    return true
  } catch (err) {
    console.error("[Diag] Falhou ❌", err)
    return false
  }
}

// Disponibiliza atalho global para facilitar testes no console (dev e prod)
if (typeof window !== "undefined") {
  // chama: window.fbDiag()
  window.fbDiag = diagnosticTest
}

// Exports centralizados
export {
  app,
  db, ref, set, push, get, remove, onValue,
  auth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword
}
