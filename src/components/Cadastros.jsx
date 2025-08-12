import { useState } from "react"
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa"

function CadastroSimples({ titulo, campos, lista, setLista }) {
  const [form, setForm] = useState({})
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [msg, setMsg] = useState('')
  const [showConfirm, setShowConfirm] = useState({ show: false, id: null })

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (campos.some(c => !form[c.nome])) {
      setMsg('Preencha todos os campos.')
      return
    }
    setLista([...lista, { ...form, id: Date.now().toString() }])
    setForm({})
    setMsg('Cadastro realizado com sucesso!')
    setTimeout(() => setMsg(''), 2000)
  }

  const handleEdit = item => {
    setEditId(item.id)
    setEditForm(item)
  }

  const handleEditSubmit = e => {
    e.preventDefault()
    setLista(lista.map(l => l.id === editId ? { ...editForm } : l))
    setEditId(null)
    setEditForm({})
    setMsg('Cadastro atualizado!')
    setTimeout(() => setMsg(''), 2000)
  }

  const handleDelete = id => {
    setShowConfirm({ show: true, id })
  }

  const confirmDelete = () => {
    setLista(lista.filter(l => l.id !== showConfirm.id))
    setShowConfirm({ show: false, id: null })
    setMsg('Cadastro excluído!')
    setTimeout(() => setMsg(''), 2000)
  }

  const cancelDelete = () => {
    setShowConfirm({ show: false, id: null })
  }

  return (
    <div className="mb-4 bg-white rounded shadow border-l-4 border-blue-500 p-2 w-full">
      <h2 className="text-xl font-bold mb-2 text-blue-700">{titulo}</h2>
      <form onSubmit={editId ? handleEditSubmit : handleSubmit} className="grid gap-2 mb-2">
        <div className="flex flex-col gap-2">
          {campos.map(c => (
            <input
              key={c.nome}
              name={c.nome}
              value={editId ? editForm[c.nome] || '' : form[c.nome] || ''}
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
        <div className={`text-center py-2 rounded transition ${msg.includes('sucesso') ? 'text-green-600 bg-green-50' : msg.includes('atualizado') ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'}`}>
          {msg}
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

export default function Cadastros({ vendedores, setVendedores, lojas, setLojas, categorias, setCategorias }) {
  const camposVendedores = [
    { nome: "nome", label: "Nome" }
  ]
  const camposLojas = [
    { nome: "nome", label: "Nome" },
    { nome: "endereco", label: "Endereço" }
  ]
  const camposCategorias = [
    { nome: "nome", label: "Nome" }
  ]

  return (
    <div className="max-w-2xl mx-auto mt-8 px-2 w-full">
      <CadastroSimples titulo="Vendedores" campos={camposVendedores} lista={vendedores} setLista={setVendedores} />
      <CadastroSimples titulo="Lojas" campos={camposLojas} lista={lojas} setLista={setLojas} />
      <CadastroSimples titulo="Categorias" campos={camposCategorias} lista={categorias} setLista={setCategorias} />
    </div>
  )
}