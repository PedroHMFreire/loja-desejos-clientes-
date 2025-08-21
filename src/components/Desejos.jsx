// src/components/Desejos.jsx
import { useState, useEffect, useMemo, useRef } from "react"
import { FaEdit, FaTrash, FaWhatsapp, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa"
import { saveToLocalStorage, loadFromLocalStorage } from "../utils/localStorage"
import { syncToFirebase } from "../utils/syncFirebase"
import { auth, db, ref, get } from "../firebase"

// ---------- Helpers ----------
function gerarLinkWhatsapp(nome, tel, produto, vendedor) {
  const msg = `Oi, ${sanitize(nome)}!\n\nSeu desejo é uma ordem! E já começamos a trabalhar para atendê-lo o quanto antes!\n\nProduto desejado: ${sanitize(produto)}\nVendedor responsável: ${sanitize(vendedor)}`
  return `https://wa.me/55${tel.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`
}
function nomeCompletoValido(nome) {
  if (!nome) return false
  const partes = nome.trim().split(/\s+/)
  return partes.length >= 2 && partes.every(p => p.length >= 2)
}
function sanitize(str) {
  return String(str).replace(/[<>]/g, "")
}
const nextStatus = { pendente: "atendido", atendido: "desistido", desistido: "pendente" }
const statusIcon = {
  pendente: <FaClock className="text-blue-400" />,
  atendido: <FaCheckCircle className="text-green-500" />,
  desistido: <FaTimesCircle className="text-red-500" />
}

// ---------- UID seguro (não altera sua lógica de login) ----------
function getUidSafe() {
  try {
    const viaAuth = auth?.currentUser?.uid
    if (viaAuth) return viaAuth

    if (typeof window !== "undefined") {
      const API_KEY = "AIzaSyB3Epc580YmJDIxERO31njrBrYqnYcdeBo"
      const KEY_OFFICIAL = `firebase:authUser:${API_KEY}:[DEFAULT]`
      const KEY_FALLBACK = `firebase:authUser:anotesante-default-rtdb:[DEFAULT]`

      const rawOfficial = localStorage.getItem(KEY_OFFICIAL)
      if (rawOfficial) {
        const parsed = JSON.parse(rawOfficial)
        if (parsed?.uid) return parsed.uid
      }
      const rawFallback = localStorage.getItem(KEY_FALLBACK)
      if (rawFallback) {
        const parsed = JSON.parse(rawFallback)
        if (parsed?.uid) return parsed.uid
      }
    }
  } catch {}
  return null
}

// ---------- Hash simples para detectar mudanças ----------
const hash = (obj) => {
  try {
    const s = JSON.stringify(obj)
    let h = 5381
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i)
    return (h >>> 0).toString(16)
  } catch {
    return Math.random().toString(16).slice(2)
  }
}

// ---------- Merge local x remoto ----------
function mergeDesejos(localArr = [], remoteArr = []) {
  const byId = new Map()
  for (const it of localArr) byId.set(it.id, it)
  for (const r of remoteArr) {
    const l = byId.get(r.id)
    if (!l) {
      byId.set(r.id, r)
    } else {
      const tL = l.updatedAt || Number(l.id) || 0
      const tR = r.updatedAt || Number(r.id) || 0
      byId.set(r.id, tR > tL ? r : l)
    }
  }
  return Array.from(byId.values())
}

export default function Desejos({ desejos, setDesejos, vendedores, lojas, categorias }) {
  // Normalizações de props
  desejos = Array.isArray(desejos) ? desejos : []
  vendedores = Array.isArray(vendedores) ? vendedores : []
  lojas = Array.isArray(lojas) ? lojas : []
  categorias = Array.isArray(categorias) ? categorias : []

  const [form, setForm] = useState({
    nome: "", tel: "", produto: "", tamanho: "", valor: "",
    vendedor: "", loja: "", categoria: ""
  })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [msg, setMsg] = useState("")
  const [showConfirm, setShowConfirm] = useState({ show: false, id: null })
  const [syncError, setSyncError] = useState(false)
  const [uid, setUid] = useState(null)

  // Refs para controle do backup
  const lastSentHashRef = useRef(null)
  const debounceRef = useRef(null)
  const retryCountRef = useRef(0)

  // 1) Carrega do LocalStorage na primeira montagem (local-first)
  useEffect(() => {
    const local = loadFromLocalStorage("desejos") || []
    if (Array.isArray(local) && local.length > 0) {
      setDesejos(local)
      lastSentHashRef.current = null // força primeiro backup
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2) Captura UID (sem alterar login)
  useEffect(() => {
    setUid(getUidSafe())
  }, [])

  // 3) Sempre salvar local ANTES de qualquer backup (local-first)
  useEffect(() => {
    saveToLocalStorage("desejos", desejos)
  }, [desejos])

  // 4) Backup automático no Firebase com debounce + retry (array inteiro)
  useEffect(() => {
    if (!uid) return
    const currentHash = hash(desejos)
    if (currentHash === lastSentHashRef.current) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        await syncToFirebase(`users/${uid}/desejos`, desejos)
        lastSentHashRef.current = currentHash
        retryCountRef.current = 0
        setSyncError(false)
      } catch (e) {
        setSyncError(true)
        const attempts = Math.min(retryCountRef.current + 1, 5)
        retryCountRef.current = attempts
        const delay = Math.pow(2, attempts - 1) * 1000
        setTimeout(() => {
          lastSentHashRef.current = null
          setDesejos(prev => [...prev]) // força novo ciclo
        }, delay)
      }
    }, 400)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desejos, uid])

  // 5) Backup também quando voltar a ficar online
  useEffect(() => {
    if (typeof window === "undefined") return
    const onOnline = () => {
      if (!uid) return
      lastSentHashRef.current = null
      setDesejos(prev => [...prev])
    }
    window.addEventListener("online", onOnline)
    return () => window.removeEventListener("online", onOnline)
  }, [uid, setDesejos])

  // 6) Ao ter uid, ler do Firebase uma vez e mesclar com o local (para ver desejos dos outros)
  useEffect(() => {
    if (!uid) return
    ;(async () => {
      try {
        const snap = await get(ref(db, `users/${uid}/desejos`))
        const remoteRaw = snap.exists() ? snap.val() : []
        const remote = Array.isArray(remoteRaw) ? remoteRaw : Object.values(remoteRaw || {})
        if (remote.length === 0) return
        setDesejos(prev => {
          const merged = mergeDesejos(prev, remote)
          saveToLocalStorage("desejos", merged)
          return merged
        })
      } catch (e) {
        // se falhar leitura, segue com o local
        console.warn("Leitura de backup falhou (usando local):", e?.code || e)
      }
    })()
  }, [uid, setDesejos])

  // 7) (Opcional) Atualiza quando a aba voltar ao foco (traz o que outros cadastraram)
  useEffect(() => {
    if (typeof window === "undefined" || !uid) return
    const onFocus = async () => {
      try {
        const snap = await get(ref(db, `users/${uid}/desejos`))
        const remoteRaw = snap.exists() ? snap.val() : []
        const remote = Array.isArray(remoteRaw) ? remoteRaw : Object.values(remoteRaw || {})
        if (remote.length === 0) return
        setDesejos(prev => {
          const merged = mergeDesejos(prev, remote)
          saveToLocalStorage("desejos", merged)
          return merged
        })
      } catch {}
    }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [uid, setDesejos])

  // --------- Lista memoizada ---------
  const desejosMemo = useMemo(() => desejos.map(item => ({
    ...item,
    status: item.status || "pendente"
  })), [desejos])

  // --------- Handlers ---------
  const handleChange = e => {
    let value = e.target.value
    if (e.target.name === "valor") value = value.replace(/[^0-9.,]/g, "")
    setForm({ ...form, [e.target.name]: value })
  }
  const handleEditChange = e => {
    let value = e.target.value
    if (e.target.name === "valor") value = value.replace(/[^0-9.,]/g, "")
    setEditForm({ ...editForm, [e.target.name]: value })
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!nomeCompletoValido(form.nome)) {
      setMsg("Digite o nome e sobrenome do cliente (mínimo 2 letras cada).")
      return
    }
    if (!form.tel || !form.produto || !form.tamanho || !form.valor || !form.vendedor || !form.loja) {
      setMsg("Preencha todos os campos obrigatórios.")
      return
    }
    const novoDesejo = {
      ...form,
      nome: sanitize(form.nome),
      produto: sanitize(form.produto),
      vendedor: sanitize(form.vendedor),
      loja: sanitize(form.loja),
      categoria: sanitize(form.categoria),
      valor: form.valor.replace(",", "."),
      id: Date.now().toString(),
      status: "pendente",
      updatedAt: Date.now()
    }
    setDesejos([...desejos, novoDesejo]) // local-first (backup em paralelo)
    setForm({
      nome: "", tel: "", produto: "", tamanho: "", valor: "",
      vendedor: "", loja: "", categoria: ""
    })
    setMsg("Desejo cadastrado com sucesso!")
    setTimeout(() => setMsg(""), 3500)
  }

  const handleEdit = item => {
    setEditId(item.id)
    setEditForm(item)
  }

  const handleEditSubmit = e => {
    e.preventDefault()
    if (!nomeCompletoValido(editForm.nome)) {
      setMsg("Digite o nome e sobrenome do cliente (mínimo 2 letras cada).")
      return
    }
    const atualizado = {
      ...editForm,
      nome: sanitize(editForm.nome),
      produto: sanitize(editForm.produto),
      vendedor: sanitize(editForm.vendedor),
      loja: sanitize(editForm.loja),
      categoria: sanitize(editForm.categoria),
      valor: editForm.valor.replace(",", "."),
      id: editId,
      updatedAt: Date.now()
    }
    setDesejos(desejos.map(d => d.id === editId ? atualizado : d))
    setEditId(null)
    setEditForm({})
    setMsg("Desejo atualizado!")
    setTimeout(() => setMsg(""), 3500)
  }

  const handleStatus = id => {
    setDesejos(desejos.map(d =>
      d.id === id ? { ...d, status: nextStatus[d.status] || "pendente", updatedAt: Date.now() } : d
    ))
    setMsg("Status atualizado!")
    setTimeout(() => setMsg(""), 2500)
  }

  const handleDelete = id => setShowConfirm({ show: true, id })
  const confirmDelete = () => {
    setDesejos(desejos.filter(d => d.id !== showConfirm.id))
    setShowConfirm({ show: false, id: null })
    setMsg("Desejo excluído!")
    setTimeout(() => setMsg(""), 3500)
  }
  const cancelDelete = () => setShowConfirm({ show: false, id: null })

  // --------- UI ---------
  return (
    <div className="max-w-2xl mx-auto mt-8 px-2 w-full">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Desejos dos Clientes (Local-first + Backup + Merge)</h2>

      {/* Debug opcional */}
      <div className="text-xs text-gray-500 mb-2">
        UID: <b>{uid || "—"}</b>
      </div>

      <form onSubmit={editId ? handleEditSubmit : handleSubmit} className="grid gap-2 mb-4">
        <div className="flex flex-col gap-2">
          <input name="nome" value={editId ? (editForm.nome || "") : form.nome} onChange={editId ? handleEditChange : handleChange} placeholder="Nome completo" className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full text-base" />
          <input name="tel" value={editId ? (editForm.tel || "") : form.tel} onChange={editId ? handleEditChange : handleChange} placeholder="Telefone" className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full text-base" />
          <input name="produto" value={editId ? (editForm.produto || "") : form.produto} onChange={editId ? handleEditChange : handleChange} placeholder="Produto desejado" className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full text-base" />
          <input name="tamanho" value={editId ? (editForm.tamanho || "") : form.tamanho} onChange={editId ? handleEditChange : handleChange} placeholder="Tamanho" className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full text-base" />
          <input name="valor" value={editId ? (editForm.valor || "") : form.valor} onChange={editId ? handleEditChange : handleChange} placeholder="Valor" className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full text-base" inputMode="decimal" />

          <select name="vendedor" value={editId ? (editForm.vendedor || "") : form.vendedor} onChange={editId ? handleEditChange : handleChange} className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full text-base">
            <option value="">Selecione o vendedor</option>
            {vendedores.map(v => (
              <option key={v.id || v.nome} value={v.nome}>{v.nome}</option>
            ))}
          </select>

          <select name="loja" value={editId ? (editForm.loja || "") : form.loja} onChange={editId ? handleEditChange : handleChange} className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full text-base">
            <option value="">Selecione a loja</option>
            {lojas.map(loja => (
              <option key={loja.id || loja.nome} value={loja.nome}>{loja.nome}</option>
            ))}
          </select>

          <select name="categoria" value={editId ? (editForm.categoria || "") : form.categoria} onChange={editId ? handleEditChange : handleChange} className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full text-base">
            <option value="">Selecione a categoria</option>
            {categorias.map(c => (
              <option key={c.id || c.nome} value={c.nome}>{c.nome}</option>
            ))}
          </select>

          <button type="submit" className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition text-base w-full">
            {editId ? "Salvar" : "Adicionar"}
          </button>
        </div>
      </form>

      {msg && (
        <div className={`text-center py-2 rounded transition ${msg.includes("sucesso") ? "text-green-600 bg-green-50" : msg.includes("atualizado") ? "text-blue-600 bg-blue-50" : "text-red-600 bg-red-50"}`}>
          {msg}
        </div>
      )}
      {syncError && (
        <div className="text-yellow-600 text-center mt-2">
          Não foi possível sincronizar com o backup. Seus dados estão salvos localmente.
        </div>
      )}

      <ul className="space-y-2">
        {desejosMemo.map(item => {
          const status = item.status || "pendente"
          return (
            <li key={item.id} className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-gray-50 rounded p-2 border-l-4" style={{ borderColor: status === 'atendido' ? '#22c55e' : status === 'pendente' ? '#60a5fa' : '#ef4444' }}>
              <div className="flex-1 text-base flex flex-wrap items-center gap-2">
                <span className="font-bold">{item.nome}</span>
                <span>{item.produto}</span>
                <span>{item.loja}</span>
                <span>{item.vendedor}</span>
                <span>{item.valor}</span>
                <span>{item.categoria}</span>
                <a href={gerarLinkWhatsapp(item.nome, item.tel, item.produto, item.vendedor)} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="ml-2">
                  <FaWhatsapp className="text-green-500 text-xl hover:scale-110 transition" />
                </a>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0 items-center">
                <button
                  onClick={() => handleStatus(item.id)}
                  title={status.charAt(0).toUpperCase() + status.slice(1)}
                  className={`p-2 rounded transition border ${status === 'atendido' ? 'bg-green-100 border-green-400' : status === 'pendente' ? 'bg-blue-100 border-blue-400' : 'bg-red-100 border-red-400'}`}
                >
                  {statusIcon[status]}
                </button>
                <button onClick={() => handleEdit(item)} className="p-2 rounded bg-yellow-400 hover:bg-yellow-500 text-white transition" title="Editar">
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded bg-red-500 hover:bg-red-600 text-white transition" title="Excluir">
                  <FaTrash />
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {showConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow p-6 w-full max-w-xs">
            <p className="mb-4 text-center text-lg">Deseja realmente excluir?</p>
            <div className="flex gap-2 justify-center">
              <button onClick={confirmDelete} className="bg-red-500 text-white px-4 py-2 rounded">Sim</button>
              <button onClick={cancelDelete} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Não</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}