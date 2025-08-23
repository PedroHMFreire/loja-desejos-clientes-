import { supabase } from '../supabaseClient'

// Cadastro de usuário
export async function signUp({ email, password, nome, telefone }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { autoConfirm: true }
  })
  if (error) throw error
  // Salva dados extras na tabela usuarios
  if (data?.user) {
    await supabase.from('usuarios').insert({
      id: data.user.id,
      nome,
      email,
      telefone
    })
  }
  return data?.user
}

// Login
export async function signIn({ email, password }) {
  const { user, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return user
}

// Logout
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Obter usuário logado
export function getCurrentUser() {
  return supabase.auth.getUser()
}
