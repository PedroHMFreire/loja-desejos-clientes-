// utils/localStorage.js

// Salva um array de dados no Local Storage
export function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    // Pode logar erro ou exibir alerta
  }
}

// Lê um array de dados do Local Storage
export function loadFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (e) {
    return []
  }
}

// Remove um item pelo id
export function removeFromLocalStorage(key, id) {
  const data = loadFromLocalStorage(key)
  const filtered = data.filter(item => item.id !== id)
  saveToLocalStorage(key, filtered)
  return filtered
}

// Atualiza um item pelo id
export function updateInLocalStorage(key, id, newItem) {
  const data = loadFromLocalStorage(key)
  const updated = data.map(item => item.id === id ? newItem : item)
  saveToLocalStorage(key, updated)
  return updated
}

// Adiciona um novo item
export function addToLocalStorage(key, newItem) {
  const data = loadFromLocalStorage(key)
  data.push(newItem)
  saveToLocalStorage(key, data)
  return data
}
