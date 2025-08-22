import { useState, useEffect } from "react"
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa"
import { useAuth } from "../contexts/AuthContext"
import { addToLocalStorage, loadFromLocalStorage, updateInLocalStorage, removeFromLocalStorage, saveToLocalStorage } from "../utils/localStorage"
import { syncToFirebase } from "../utils/syncFirebase"

function CadastroSimples({ titulo, campos, tipo, uid }) {
  const [form, setForm] = useState({})
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [msg, setMsg] = useState("")
  const [showConfirm, setShowConfirm] = useState({ show: false, id: null })
  const [lista, setLista] = useState([])
  const [syncError, setSyncError] = useState(false)

  // 🔧 helper: envia o snapshot atual para o Firebase
  const syncBackup = async (data) => {
    if (!uid) return
    try {
      await syncToFirebase(`users/${uid}/${tipo}`, data) // grava exatamente o que está em "data"
      setSyncError(false)
    } catch (e) {
      console.warn("[Cadastros] Falha no backup:", e)
      setSyncError(true)
    }
  }

  // Carregar do Local Storage. Se vazio, buscar do Firebase.
  useEffect(() => {
    const local = loadFromLocalStorage(tipo)
    if (local && local.length > 0) {
      setLista(local)
    } else if (uid) {
      import("../firebase.js").then(({ db, ref, get }) => {
        get(ref(db, `users/${uid}/${tipo}`)).then(snap => {
          if (snap.exists()) {
            const dados = snap.val() || []
            // suporta tanto objeto {id: item} quanto array
            const listaBanco = Array.isArray(dados)
              ? dados.map((item, idx) => ({ id: item?.id ?? String(idx), ...item }))
              : Object.entries(dados).map(([id, item]) => ({ id, ...item }))

            setLista(listaBanco)
            saveToLocalStorage(tipo, listaBanco)
          } else {
            setLista([])
          }
        }).catch(err => {
          console.warn("[Cadastros] Falha ao ler do Firebase:", err)
        })
      })
    }
  }, [uid, tipo])

  // Sincroniza sempre que a lista muda (inclusive quando esvazia)
  useEffect(() => {
    if (!uid) return
    syncBackup(lista)
  }, [lista, uid]) // tipo é fixo por instância

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handleEditChange = e => setEditForm({ ...editForm, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    if (campos.some(c => !form[c.nome])) {
      setMsg("Preencha todos os campos.")
      return
    }
    const novoItem = { ...form, id: Date.now().toString() }
    const listaAtualizada = addToLocalStorage(tipo, novoItem)
    setLista(listaAtualizada)
    setForm({})
    setMsg("Cadastro realizado com sucesso!")
    setTimeout(() => setMsg(""), 2000)
  }

  const handleEdit = item => {
    setEditId(item.id)
    setEditForm(item)
  }

  const handleEditSubmit = async e => {
    e.preventDefault()
    if (campos.some(c => !editForm[c.nome])) {
      setMsg("Preencha todos os campos.")
      return
    }
    const listaAtualizada = updateInLocalStorage(tipo, editId, editForm)
    setLista(listaAtualizada)
    setEditId(null)
    setEditForm({})
    setMsg("Cadastro atualizado!")
    setTimeout(() => setMsg(""), 2000)
    // syncBackup já será chamado pelo useEffect([lista])
  }

  const handleDelete = id => setShowConfirm({ show: true, id })

  const confirmDelete = async () => {
    const listaAtualizada = removeFromLocalStorage(tipo, showConfirm.id)
    setLista(listaAtualizada)
    setShowConfirm({ show: false, id: null })
    setMsg("Cadastro excluído!")
    setTimeout(() => setMsg(""), 2000)
    // syncBackup já será chamado pelo useEffect([lista])
  }

  const cancelDelete = () => setShowConfirm({ show: false, id: null })

  return (
    <div className="mb-4 bg-white rounded shadow border-l-4 border-blue-500 p-2 w-full">
      <h2 className="text-xl font-bold mb-2 text-blue-700">{titulo}</h2>

      <form onSubmit={editId ? handleEditSubmit : handleSubmit} className="grid gap-2 mb-2">
        <div className="flex flex-col gap-2">
          {campos.map(c => (
            <input
              key={c.nome}
              name={c.nome}
              value={editId ? (editForm[c.nome] || "") : (form[c.nome] || "")}
              onChange={editId ? handleEditChange : handleChange}
              placeholder={c.label}
              className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full focus:outline-primary text-base"
            />
          ))}
          <button
            type="submit"
            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition text-base w-full"
            title={editId ? "Salvar" : "Adicionar"}
          >
            <FaPlus />
            <span className="inline">{editId ? "Salvar" : "Adicionar"}</span>
          </button>
        </div>
      </form>

      {msg && (
        <div className={`text-center py-2 rounded transition ${
          msg.includes("sucesso") ? "text-green-600 bg-green-50"
          : msg.includes("atualizado") ? "text-blue-600 bg-blue-50"
          : "text-red-600 bg-red-50"
        }`}>
          {msg}
        </div>
      )}
      {syncError && (
        <div className="text-yellow-600 text-center mt-2">
          Não foi possível sincronizar com o backup. Seus dados estão salvos localmente.
        </div>
      )}

      <ul className="space-y-2">
        {lista.map(item => (
          <li key={item.id} className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-gray-50 rounded p-2">
            <div className="flex-1 text-base">
              {campos.map(c => (
                <span key={c.nome} className="mr-2">{item[c.nome]}</span>
              ))}
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => handleEdit(item)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded text-base"
                title="Editar"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-base"
                title="Excluir"
              >
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
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

export default function Cadastros() {
  const { user, loading } = useAuth()

  const camposVendedores = [{ nome: "nome", label: "Nome" }]
  const camposLojas = [
    { nome: "nome", label: "Nome" },
    { nome: "endereco", label: "Endereço" }
  ]
  const camposCategorias = [{ nome: "nome", label: "Nome" }]

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Carregando…</div>
  }
  if (!user) {
    return <div className="p-6 text-center text-red-600">Faça login para acessar os cadastros.</div>
  }

  const uid = user.uid

  return (
    <div className="max-w-2xl mx-auto mt-8 px-2 w-full">
      <CadastroSimples titulo="Vendedores" campos={camposVendedores} tipo="vendedores" uid={uid} />
      <CadastroSimples titulo="Lojas" campos={camposLojas} tipo="lojas" uid={uid} />
      <CadastroSimples titulo="Categorias" campos={camposCategorias} tipo="categorias" uid={uid} />
    </div>
  )
}
