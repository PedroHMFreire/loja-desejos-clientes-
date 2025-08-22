// utils/syncFirebase.js
import { db, ref, push, set, update, remove } from "../firebase"

/**
 * 🔧 Compat: mantém a API antiga usada por Home/Cadastros/Ranking.
 * Grava "data" exatamente no caminho "path".
 */
export async function syncToFirebase(path, data) {
  return set(ref(db, path), data)
}

/** ===========================
 *  CRUD específico de DESEJOS
 *  =========================== */

// Adiciona um desejo novo (gera key automática)
export async function addDesejo(uid, desejo) {
  if (!uid) throw new Error("UID ausente")
  const desejoRef = push(ref(db, `users/${uid}/desejos`))
  await set(desejoRef, desejo)
  return desejoRef.key
}

// Atualiza um desejo existente
export async function updateDesejo(uid, id, desejo) {
  if (!uid || !id) throw new Error("UID ou ID ausente")
  await update(ref(db, `users/${uid}/desejos/${id}`), desejo)
}

// Remove um desejo
export async function deleteDesejo(uid, id) {
  if (!uid || !id) throw new Error("UID ou ID ausente")
  await remove(ref(db, `users/${uid}/desejos/${id}`))
}
