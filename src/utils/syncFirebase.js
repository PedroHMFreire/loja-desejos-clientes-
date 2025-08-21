// utils/syncFirebase.js
import { db, ref, set } from "../firebase"

// Sincroniza um array de dados local com o Firebase
export async function syncToFirebase(path, data) {
  try {
    await set(ref(db, path), data)
    console.log("[SYNC] Dados enviados para Firebase:", path, data)
  } catch (e) {
    console.error("[SYNC] Erro ao enviar para Firebase:", path, e)
  }
}
