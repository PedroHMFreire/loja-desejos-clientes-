import { useState, useEffect, useMemo } from "react"
import { FaEdit, FaTrash, FaWhatsapp, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa"
import { saveToLocalStorage, loadFromLocalStorage } from "../utils/localStorage"
import { addDesejo, updateDesejo, deleteDesejo } from "../utils/syncFirebase"
import { auth, db, ref, onValue, onAuthStateChanged } from "../firebase"

function gerarLinkWhatsapp(nome, tel, produto, vendedor) {
  const msg = `Oi, ${sanitize(nome)}!\n\nSeu desejo é uma ordem!\n\nProduto: ${sanitize(produto)}\nVendedor: ${sanitize(vendedor)}`
  return `https://wa.me/55${tel.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`
}
function nomeCompletoValido(nome) {
  if (!nome) return false
  const partes = nome.trim().split(/\s+/)
  return partes.length >= 2 && partes.every(p => p.length >= 2)
}
function sanitize(str) { return String(str).replace(/[<>]/g, "") }

const nextStatus = { pendente: "atendido", atendido: "desistido", desistido: "pendente" }
const statusIcon = {
  pendente: <FaClock className="text-blue-400" />,
  atendido: <FaCheckCircle className="text-green-500" />,
  desistido: <FaTimesCircle className="text-red-500" />
}

export default function Desejos({ vendedores, lojas, categorias }) {
  const [desejos, setDesejos] = useState([])
  const [form, setForm] = useState({ nome: "", tel: "", produto: "", tamanho: "", valor: "", vendedor: "", loja: "", categoria: "" })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [msg, setMsg] = useState("")
  const [showConfirm, setShowConfirm] = useState({ show: false, id: null })
  const [uid, setUid] = useState(null)

  // 1) Captura UID (usuário logado)
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      setUid(user?.uid || null)
    })
    return unsub
  }, [])

  // 2) Ouve os desejos direto do Firebase (e salva em cache local)
  useEffect(() => {
    if (!uid) return
    const r = ref(db, `users/${uid}/desejos`)
    const unsub = onValue(r, snap => {
      if (snap.exists()) {
        const data = snap.val()
        const arr = Object.entries(data).map(([id, val]) => ({ id, ...val }))
        setDesejos(arr)
        saveToLocalStorage("desejos", arr)
      } else {
        setDesejos([])
      }
    })
    return () => unsub()
  }, [uid])

  // 3) Carrega cache local antes da leitura remota (melhora experiência)
  useEffect(() => {
    const local = loadFromLocalStorage("desejos") || []
    if (local.length > 0) setDesejos(local)
  }, [])

  // --------- Lista memoizada ---------
  const desejosMemo = useMemo(() => desejos.map(item => ({
    ...item, status: item.status || "pendente"
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

  const handleSubmit = async e => {
    e.preventDefault()
    if (!nomeCompletoValido(form.nome)) { setMsg("Digite nome e sobrenome."); return }
    if (!form.tel || !form.produto || !form.tamanho || !form.valor || !form.vendedor || !form.loja) {
      setMsg("Preencha todos os campos obrigatórios."); return
    }
    const novo = {
      ...form,
      nome: sanitize(form.nome),
      produto: sanitize(form.produto),
      vendedor: sanitize(form.vendedor),
      loja: sanitize(form.loja),
      categoria: sanitize(form.categoria),
      valor: form.valor.replace(",", "."),
      status: "pendente",
      updatedAt: Date.now()
    }
    if (uid) await addDesejo(uid, novo)
    setForm({ nome: "", tel: "", produto: "", tamanho: "", valor: "", vendedor: "", loja: "", categoria: "" })
    setMsg("Desejo cadastrado com sucesso!")
    setTimeout(() => setMsg(""), 3000)
  }

  const handleEdit = item => { setEditId(item.id); setEditForm(item) }
  const handleEditSubmit = async e => {
    e.preventDefault()
    if (!nomeCompletoValido(editForm.nome)) { setMsg("Digite nome e sobrenome."); return }
    const atualizado = { ...editForm, updatedAt: Date.now() }
    if (uid) await updateDesejo(uid, editId, atualizado)
    setEditId(null); setEditForm({})
    setMsg("Desejo atualizado!")
    setTimeout(() => setMsg(""), 3000)
  }

  const handleStatus = async id => {
    const alvo = desejos.find(d => d.id === id)
    if (!alvo) return
    const atualizado = { ...alvo, status: nextStatus[alvo.status] || "pendente", updatedAt: Date.now() }
    if (uid) await updateDesejo(uid, id, atualizado)
  }

  const handleDelete = id => setShowConfirm({ show: true, id })
  const confirmDelete = async () => {
    if (uid && showConfirm.id) await deleteDesejo(uid, showConfirm.id)
    setShowConfirm({ show: false, id: null })
  }
  const cancelDelete = () => setShowConfirm({ show: false, id: null })

  // --------- UI ---------
  return (
    <div className="max-w-2xl mx-auto mt-8 px-2 w-full">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Desejos dos Clientes</h2>

      <form onSubmit={editId ? handleEditSubmit : handleSubmit} className="grid gap-2 mb-4">
        <div className="flex flex-col gap-2">
          <input name="nome" value={editId ? (editForm.nome || "") : form.nome} onChange={editId ? handleEditChange : handleChange} placeholder="Nome completo" className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full" />
          <input name="tel" value={editId ? (editForm.tel || "") : form.tel} onChange={editId ? handleEditChange : handleChange} placeholder="Telefone" className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full" />
          <input name="produto" value={editId ? (editForm.produto || "") : form.produto} onChange={editId ? handleEditChange : handleChange} placeholder="Produto desejado" className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full" />
          <input name="tamanho" value={editId ? (editForm.tamanho || "") : form.tamanho} onChange={editId ? handleEditChange : handleChange} placeholder="Tamanho" className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full" />
          <input name="valor" value={editId ? (editForm.valor || "") : form.valor} onChange={editId ? handleEditChange : handleChange} placeholder="Valor" className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full" inputMode="decimal" />

          <select name="vendedor" value={editId ? (editForm.vendedor || "") : form.vendedor} onChange={editId ? handleEditChange : handleChange} className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full">
            <option value="">Selecione o vendedor</option>
            {vendedores?.map(v => (<option key={v.id || v.nome} value={v.nome}>{v.nome}</option>))}
          </select>

          <select name="loja" value={editId ? (editForm.loja || "") : form.loja} onChange={editId ? handleEditChange : handleChange} className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full">
            <option value="">Selecione a loja</option>
            {lojas?.map(l => (<option key={l.id || l.nome} value={l.nome}>{l.nome}</option>))}
          </select>

          <select name="categoria" value={editId ? (editForm.categoria || "") : form.categoria} onChange={editId ? handleEditChange : handleChange} className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full">
            <option value="">Selecione a categoria</option>
            {categorias?.map(c => (<option key={c.id || c.nome} value={c.nome}>{c.nome}</option>))}
          </select>

          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            {editId ? "Salvar" : "Adicionar"}
          </button>
        </div>
      </form>

      {msg && <div className="text-center py-2 text-green-600">{msg}</div>}

      <ul className="space-y-2">
        {desejosMemo.map(item => {
          const status = item.status || "pendente"
          return (
            <li key={item.id} className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-gray-50 rounded p-2 border-l-4"
                style={{ borderColor: status === 'atendido' ? '#22c55e' : status === 'pendente' ? '#60a5fa' : '#ef4444' }}>
              <div className="flex-1 text-base flex flex-wrap items-center gap-2">
                <span className="font-bold">{item.nome}</span>
                <span>{item.produto}</span>
                <span>{item.loja}</span>
                <span>{item.vendedor}</span>
                <span>{item.valor}</span>
                <span>{item.categoria}</span>
                <a href={gerarLinkWhatsapp(item.nome, item.tel, item.produto, item.vendedor)} target="_blank" rel="noreferrer" className="ml-2">
                  <FaWhatsapp className="text-green-500 text-xl" />
                </a>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleStatus(item.id)} className="p-2 rounded border">{statusIcon[status]}</button>
                <button onClick={() => handleEdit(item)} className="p-2 rounded bg-yellow-400 text-white"><FaEdit /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded bg-red-500 text-white"><FaTrash /></button>
              </div>
            </li>
          )
        })}
      </ul>

      {showConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded p-6">
            <p className="mb-4">Deseja realmente excluir?</p>
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