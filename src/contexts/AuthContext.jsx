import { createContext, useContext, useEffect, useState } from "react"
import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  db,
  ref,
  set,
  get,
} from "../firebase.js"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)       // usuário do Firebase Auth
  const [profile, setProfile] = useState(null) // dados extras (users/{uid}/profile)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  // Observa sessão de login (login/logout/refresh) e carrega o perfil
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        if (!u) {
          setUser(null)
          setProfile(null)
          setRole(null)
          setLoading(false)
          return
        }
        setUser(u)

        // carrega profile do usuário
        const snap = await get(ref(db, `users/${u.uid}/profile`))
        const prof = snap.exists() ? snap.val() : null
        setProfile(prof)
        setRole(prof?.role || "gerente")
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  // Login
  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
    // estados serão atualizados pelo onAuthStateChanged
  }

  // Logout
  const logout = async () => {
    await signOut(auth)
    // estados serão limpos pelo onAuthStateChanged
  }

  // Cadastro de usuário (cria Auth + profile em users/{uid}/profile)
  const cadastrarUsuario = async ({ nome, email, telefone, senha, role = "gerente" }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, senha)
    const uid = cred.user.uid

    await set(ref(db, `users/${uid}/profile`), {
      uid,
      nome,
      email,
      telefone,
      role,
      createdAt: Date.now(),
    })

    // não faz login automático aqui; quem controla é a tela chamadora
    return { uid, nome, email, telefone, role }
  }

  const value = {
    user,         // objeto do Firebase Auth (tem uid, email, etc.)
    profile,      // { nome, telefone, role, ... } de users/{uid}/profile
    role,
    loading,
    login,
    logout,
    cadastrarUsuario,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)