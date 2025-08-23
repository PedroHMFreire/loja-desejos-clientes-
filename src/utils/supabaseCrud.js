import { supabase } from '../supabaseClient'

// Garante que o usuário existe na tabela usuarios
export async function ensureUsuarioExists(uid, profile = {}) {
  const { data } = await supabase
    .from('usuarios')
    .select('id')
    .eq('id', uid)
    .single()
  if (!data) {
    await supabase.from('usuarios').insert({
      id: uid,
      nome: profile?.nome || '',
      email: profile?.email || '',
      telefone: profile?.telefone || ''
    })
  }
}

// CRUD para vendedores, lojas, categorias, desejos
export async function getCadastros(uid, tipo) {
  // tipo: 'vendedores', 'lojas', 'categorias'
  const { data, error } = await supabase
    .from(tipo)
    .select('*')
    .eq('usuario_id', uid)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function addCadastro(uid, tipo, item) {
  // Neutraliza erro de chave estrangeira para vendedores
  if (tipo === 'vendedores') {
    // Tente buscar dados extras do usuário se necessário
    await ensureUsuarioExists(uid)
  }
  const { data, error } = await supabase
    .from(tipo)
    .insert({ ...item, usuario_id: uid })
    .select()
  if (error) throw error
  return data?.[0]
}

export async function updateCadastro(tipo, id, item) {
  const { data, error } = await supabase
    .from(tipo)
    .update(item)
    .eq('id', id)
    .select()
  if (error) throw error
  return data?.[0]
}

export async function deleteCadastro(tipo, id) {
  const { error } = await supabase
    .from(tipo)
    .delete()
    .eq('id', id)
  if (error) throw error
}

// CRUD para desejos
export async function getDesejos(uid) {
  const { data, error } = await supabase
    .from('desejos')
    .select('*')
    .eq('usuario_id', uid)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function addDesejo(uid, desejo) {
  const { data, error } = await supabase
    .from('desejos')
    .insert({ ...desejo, usuario_id: uid })
    .select()
  if (error) throw error
  return data?.[0]
}

export async function updateDesejo(id, desejo) {
  const { data, error } = await supabase
    .from('desejos')
    .update(desejo)
    .eq('id', id)
    .select()
  if (error) throw error
  return data?.[0]
}

export async function deleteDesejo(id) {
  const { error } = await supabase
    .from('desejos')
    .delete()
    .eq('id', id)
  if (error) throw error
}
