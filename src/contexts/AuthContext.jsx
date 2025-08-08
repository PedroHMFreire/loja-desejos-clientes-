import { createContext, useContext, useEffect, useState } from 'react'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { db, ref, set, get } from "../firebase" // Certifique-se que get está exportado em firebase.js

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [ambienteId, setAmbienteId] = useState(null)

  // Firebase Auth instance
  const auth = getAuth()

  // Login usando Firebase Auth
  const login = async (email, password) => {
    setLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Busca dados do gerente no Firebase Database
      const usuarioSnap = await get(ref(db, `usuarios/${email.replace(/\./g, "_")}`))
      if (!usuarioSnap.exists()) throw new Error("Usuário não encontrado no banco")
      const usuario = usuarioSnap.val()

      setUser(usuario)
      setRole(usuario.role)
      setAmbienteId(usuario.ambienteId)
      localStorage.setItem('ldc_user', JSON.stringify(usuario))
      localStorage.setItem('ldc_role', usuario.role)
      localStorage.setItem('ldc_ambienteId', usuario.ambienteId)
      setLoading(false)
      return usuario
    } catch (err) {
      setLoading(false)
      throw err
    }
  }

  // Logout usando Firebase Auth
  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setRole(null)
    setAmbienteId(null)
    localStorage.removeItem('ldc_user')
    localStorage.removeItem('ldc_role')
    localStorage.removeItem('ldc_ambienteId')
  }

  // Cadastro de novo usuário (gerente/corporação)
  // Cria usuário no Firebase Auth e salva dados no Database
  const cadastrarUsuario = async (novoUsuario) => {
    // Cria usuário no Auth
    const userCredential = await createUserWithEmailAndPassword(auth, novoUsuario.email, novoUsuario.senha)
    const firebaseUser = userCredential.user
    // Salva dados do gerente no Database
    await set(ref(db, `usuarios/${novoUsuario.email.replace(/\./g, "_")}`), novoUsuario)
    return novoUsuario
  }

  // Efeito para manter user/role sincronizados com localStorage
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('ldc_user'))
    setUser(usuario)
    setRole(localStorage.getItem('ldc_role') || null)
    setAmbienteId(localStorage.getItem('ldc_ambienteId') || null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      role,
      ambienteId,
      loading,
      login,
      logout,
      cadastrarUsuario
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)