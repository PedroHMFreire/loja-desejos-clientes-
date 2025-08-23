import { createContext, useContext, useEffect, useState } from "react"
import {
  signUp,
  signIn,
  signOut,
  getCurrentUser
} from "../utils/supabaseAuth"
import { supabase } from "../supabaseClient"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)       // usuário do Supabase Auth
  const [profile, setProfile] = useState(null) // dados extras (tabela usuarios)
  const [loading, setLoading] = useState(true)

  // Observa sessão de login/logout
  useEffect(() => {
    const getUserAndProfile = async () => {
      setLoading(true)
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }
      setUser(data.user)
      // Busca perfil na tabela usuarios
      const { data: prof } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.user.id)
        .single()
      setProfile(prof || null)
      setLoading(false)
    }
    getUserAndProfile()
    // Listener para mudanças de sessão
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUserAndProfile()
    })
    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  // Login
  const login = async (email, password) => {
    await signIn({ email, password })
    // estados serão atualizados pelo listener
  }

  // Logout
  const logout = async () => {
    await signOut()
    // estados serão limpos pelo listener
  }

  // Cadastro de usuário (cria Auth + perfil na tabela usuarios)
  const cadastrarUsuario = async ({ nome, email, telefone, senha }) => {
    await signUp({ nome, email, telefone, password: senha })
    // estados serão atualizados pelo listener
  }

const value = {
  user,         // objeto do Supabase Auth (tem id, email, etc.)
  profile,      // { nome, telefone, ... } da tabela usuarios
  ambienteId: profile?.ambiente_id || null,
  loading,
  login,
  logout,
  cadastrarUsuario,
}

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)