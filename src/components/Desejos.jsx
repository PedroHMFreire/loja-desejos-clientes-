import { useState, useEffect } from "react"
import { FaEdit, FaTrash } from "react-icons/fa"
import { db, ref, set, push, get, remove } from "../firebase"
import { useAuth } from "../contexts/AuthContext"
import { onValue } from "../firebase" // certifique-se que está importando

function getLojasUnicas(desejos, lojas) {
  const nomesLojas = lojas.map(l => l.nome)
  const lojasDesejos = [...new Set(desejos.map(d => d.loja).filter(Boolean))]
  return Array.from(new Set([...nomesLojas, ...lojasDesejos]))
}

function gerarLinkWhatsapp(nome, tel, produto, vendedor) {
  const msg = `Oi, ${nome}!

Seu desejo é uma ordem! E já começamos a trabalhar para atendê-lo o quanto antes!

Abaixo os detalhes. Qualquer coisa é só chamar!

Produto desejado: ${produto}
Vendedor responsável: ${vendedor}`

  return `https://wa.me/55${tel.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`
}

function nomeCompletoValido(nome) {
  if (!nome) return false
  const partes = nome.trim().split(/\s+/)
  return partes.length >= 2 && partes.every(p => p.length >= 2)
}

export default function Desejos({ vendedores, lojas, categorias }) {
  const { ambienteId } = useAuth()
  const [desejos, setDesejos] = useState([])
  const [form, setForm] = useState({
    nome: "",
    tel: "",
    produto: "",
    tamanho: "",
    valor: "",
    vendedor: "",
    loja: "",
    categoria: ""
  })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [msg, setMsg] = useState("")
  const [showConfirm, setShowConfirm] = useState({ show: false, id: null })

  // Carregar desejos do Firebase ao entrar
  useEffect(() => {
  if (!ambienteId) return
  const desejosRef = ref(db, `ambientes/${ambienteId}/desejos`)
  const unsubscribe = onValue(desejosRef, snap => {
    if (snap.exists()) {
      const dados = snap.val()
      const listaBanco = Object.entries(dados).map(([id, item]) => ({ ...item, id }))
      setDesejos(listaBanco)
    } else {
      setDesejos([])
    }
  })
  return () => unsubscribe()
}, [ambienteId])

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!nomeCompletoValido(form.nome)) {
      setMsg("Digite o nome e sobrenome do cliente (mínimo 2 letras cada).")
      return
    }
    if (!form.tel || !form.produto || !form.tamanho || !form.valor || !form.vendedor || !form.loja) {
      setMsg("Preencha todos os campos obrigatórios.")
      return
    }
    const novoRef = push(ref(db, `ambientes/${ambienteId}/desejos`))
    await set(novoRef, { ...form })
    setForm({
      nome: "",
      tel: "",
      produto: "",
      tamanho: "",
      valor: "",
      vendedor: "",
      loja: "",
      categoria: ""
    })
    setMsg("Desejo cadastrado com sucesso!")
    setTimeout(() => setMsg(""), 2000)
    // Recarrega lista
    const snap = await get(ref(db, `ambientes/${ambienteId}/desejos`))
    if (snap.exists()) {
      const dados = snap.val()
      const listaBanco = Object.entries(dados).map(([id, item]) => ({ ...item, id }))
      setDesejos(listaBanco)
    }
  }

  const handleEdit = item => {
    setEditId(item.id)
    setEditForm(item)
  }

  const handleEditSubmit = async e => {
    e.preventDefault()
    await set(ref(db, `ambientes/${ambienteId}/desejos/${editId}`), { ...editForm })
    setEditId(null)
    setEditForm({})
    setMsg("Desejo atualizado!")
    setTimeout(() => setMsg(""), 2000)
    // Recarrega lista
    const snap = await get(ref(db, `ambientes/${ambienteId}/desejos`))
    if (snap.exists()) {
      const dados = snap.val()
      const listaBanco = Object.entries(dados).map(([id, item]) => ({ ...item, id }))
      setDesejos(listaBanco)
    }
  }

  const handleDelete = id => {
    setShowConfirm({ show: true, id })
  }

  const confirmDelete = async () => {
    await remove(ref(db, `ambientes/${ambienteId}/desejos/${showConfirm.id}`))
    setShowConfirm({ show: false, id: null })
    setMsg("Desejo excluído!")
    setTimeout(() => setMsg(""), 2000)
    // Recarrega lista
    const snap = await get(ref(db, `ambientes/${ambienteId}/desejos`))
    if (snap.exists()) {
      const dados = snap.val()
      const listaBanco = Object.entries(dados).map(([id, item]) => ({ ...item, id }))
      setDesejos(listaBanco)
    } else {
      setDesejos([])
    }
  }

  const cancelDelete = () => {
    setShowConfirm({ show: false, id: null })
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 px-2 w-full">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Desejos dos Clientes</h2>
      <form onSubmit={editId ? handleEditSubmit : handleSubmit} className="grid gap-2 mb-4">
        <div className="flex flex-col gap-2">
          <input name="nome" value={editId ? editForm.nome || "" : form.nome} onChange={editId ? handleEditChange : handleChange} placeholder="Nome completo" className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full text-base" />
          <input name="tel" value={editId ? editForm.tel || "" : form.tel} onChange={editId ? handleEditChange : handleChange} placeholder="Telefone" className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full text-base" />
          <input name="produto" value={editId ? editForm.produto || "" : form.produto} onChange={editId ? handleEditChange : handleChange} placeholder="Produto desejado" className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full text-base" />
          <input name="tamanho" value={editId ? editForm.tamanho || "" : form.tamanho} onChange={editId ? handleEditChange : handleChange} placeholder="Tamanho" className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full text-base" />
          <input name="valor" value={editId ? editForm.valor || "" : form.valor} onChange={editId ? handleEditChange : handleChange} placeholder="Valor" className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full text-base" />
          <select name="vendedor" value={editId ? editForm.vendedor || "" : form.vendedor} onChange={editId ? handleEditChange : handleChange} className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full text-base">
            <option value="">Selecione o vendedor</option>
            {vendedores.map(v => (
              <option key={v.id || v.nome} value={v.nome}>{v.nome}</option>
            ))}
          </select>
          <select name="loja" value={editId ? editForm.loja || "" : form.loja} onChange={editId ? handleEditChange : handleChange} className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full text-base">
            <option value="">Selecione a loja</option>
            {getLojasUnicas(desejos, lojas).map(loja => (
              <option key={loja} value={loja}>{loja}</option>
            ))}
          </select>
          <select name="categoria" value={editId ? editForm.categoria || "" : form.categoria} onChange={editId ? handleEditChange : handleChange} className="p-3 h-12 bg-gray-100 border border-gray-200 rounded w-full text-base">
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
      <ul className="space-y-2">
        {desejos.map(item => (
          <li key={item.id} className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-gray-50 rounded p-2">
            <div className="flex-1 text-base">
              <span className="mr-2 font-bold">{item.nome}</span>
              <span className="mr-2">{item.produto}</span>
              <span className="mr-2">{item.loja}</span>
              <span className="mr-2">{item.vendedor}</span>
              <span className="mr-2">{item.valor}</span>
              <span className="mr-2">{item.categoria}</span>
              <a href={gerarLinkWhatsapp(item.nome, item.tel, item.produto, item.vendedor)} target="_blank" rel="noopener noreferrer" className="text-green-600 underline ml-2">WhatsApp</a>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button onClick={() => handleEdit(item)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded text-base" title="Editar">
                <FaEdit />
              </button>
              <button onClick={() => handleDelete(item.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-base" title="Excluir">
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {/* Confirmação de exclusão */}
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