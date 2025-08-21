// utils/syncFirebase.js
import { db, ref, set } from "../firebase"

/**
 * Sincroniza dados (array/objeto) no caminho informado do RTDB.
 * Lança erro para que o chamador possa tratar (exibir aviso).
 */
export async function syncToFirebase(path, data) {
  try {
    await set(ref(db, path), data)
    console.log("[SYNC] Dados enviados para Firebase:", path, data)
  } catch (e) {
    console.error("[SYNC] Erro ao enviar para Firebase:", path, e)
    throw e // importante: deixa o componente saber que falhou
  }
}