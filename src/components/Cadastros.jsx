import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaDownload, FaSearch } from 'react-icons/fa'

function exportToCSV(data, campos, filename) {
  const csvRows = [
    campos.map(c => `"${c.label}"`).join(','),
    ...data.map(item => campos.map(c => `"${item[c.nome] || ''}"`).join(','))
  ]
  const csv = csvRows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

function CadastroSimples({ titulo, campos, lista, setLista }) {
  const [form, setForm] = useState({})
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [msg, setMsg] = useState('')
  const [busca, setBusca] = useState('')
  const [showConfirm, setShowConfirm] = useState({ show: false, id: null })
  const ITENS_POR_PAGINA = 8
  const [pagina, setPagina] = useState(1)

  // Filtro de busca
  const listaFiltrada = lista.filter(e =>
    campos.some(c =>
      (e[c.nome] || '').toLowerCase().includes(busca.toLowerCase())
    )
  )

  // Paginação
  const totalPaginas = Math.ceil(listaFiltrada.length / ITENS_POR_PAGINA)
  const itensPagina = listaFiltrada.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA)

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setMsg('')
  }

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleSubmit = e => {
    e.preventDefault()
    // Validação: todos os campos obrigatórios
    if (campos.some(c => !form[c.nome])) {
      setMsg('Preencha todos os campos.')
      return
    }
    // Validação de duplicidade
    if (lista.some(e => campos.every(c => (e[c.nome] || '').toLowerCase() === (form[c.nome] || '').toLowerCase()))) {
      setMsg('Já existe um item com esse nome.')
      return
    }
    const novoItem = { ...form, id: Date.now().toString() }
    setLista([...lista, novoItem])
    setForm({})
    setMsg('Adicionado com sucesso!')
    setTimeout(() => setMsg(''), 1200)
  }

  const handleDelete = id => {
    setShowConfirm({ show: true, id })
  }

  const confirmDelete = () => {
    setLista(lista.filter(e => e.id !== showConfirm.id))
    setShowConfirm({ show: false, id: null })
  }

  const cancelDelete = () => {
    setShowConfirm({ show: false, id: null })
  }

  const handleEdit = item => {
    setEditId(item.id)
    setEditForm({ ...item })
  }

  const handleSaveEdit = id => {
    // Validação de duplicidade
    if (lista.some(e =>
      e.id !== id &&
      campos.every(c => (e[c.nome] || '').toLowerCase() === (editForm[c.nome] || '').toLowerCase())
    )) {
      setMsg('Já existe um item com esse nome.')
      return
    }
    setLista(lista.map(e => e.id === id ? { ...e, ...editForm } : e))
    setEditId(null)
    setMsg('Editado com sucesso!')
    setTimeout(() => setMsg(''), 1200)
  }

  const handleCancelEdit = () => {
    setEditId(null)
    setEditForm({})
  }

  const handleExport = () => {
    exportToCSV(lista, campos, `${titulo}.csv`)
  }

  return (
    <div className="mb-8 bg-white rounded shadow border-l-4 border-blue-500 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <h2 className="text-lg font-bold text-blue-600 flex items-center gap-2">
          {titulo}
          <span className="ml-2 text-xs text-gray-400">({lista.length})</span>
        </h2>
        <div className="flex gap-2">
          <div className="relative">
            <FaSearch className="absolute left-2 top-2.5 text-gray-400 text-sm" />
            <input
              type="text"
              value={busca}
              onChange={e => { setBusca(e.target.value); setPagina(1) }}
              placeholder="Buscar..."
              className="pl-7 pr-2 py-1 rounded border border-gray-200 bg-gray-100 text-sm focus:outline-primary"
            />
          </div>
          <button
            onClick={handleExport}
            type="button"
            className="flex items-center gap-1 px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs"
            title="Exportar CSV"
          >
            <FaDownload /> Exportar
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-2 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          {campos.map(c => (
            <input
              key={c.nome}
              name={c.nome}
              value={form[c.nome] || ''}
              onChange={handleChange}
              placeholder={c.label}
              className="p-2 bg-gray-100 border border-gray-200 rounded flex-1 focus:outline-primary"
            />
          ))}
          <button
            type="submit"
            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
            title="Adicionar"
          >
            <FaPlus />
            <span className="hidden sm:inline">Adicionar</span>
          </button>
        </div>
        {msg && (
          <div className={`text-center text-sm mt-1 transition-all duration-300 ${msg.includes('sucesso') ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'} border rounded py-1`}>
            {msg}
          </div>
        )}
      </form>
      <ul className="space-y-2 max-h-64 overflow-y-auto">
        {itensPagina.map(e => (
          <li key={e.id} className="bg-gray-50 border border-gray-200 p-3 rounded flex justify-between items-center gap-2">
            {editId === e.id ? (
              <div className="flex-1 flex gap-2">
                {campos.map(c => (
                  <input
                    key={c.nome}
                    name={c.nome}
                    value={editForm[c.nome] || ''}
                    onChange={handleEditChange}
                    className="p-1 bg-white border border-blue-200 rounded text-sm"
                  />
                ))}
                <button onClick={() => handleSaveEdit(e.id)} className="text-green-600 hover:text-green-800 p-1" title="Salvar"><FaSave /></button>
                <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600 p-1" title="Cancelar"><FaTimes /></button>
              </div>
            ) : (
              <>
                <span className="flex-1 truncate">{campos.map(c => e[c.nome]).join(' - ')}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(e)} className="text-blue-500 hover:text-blue-700 p-1" title="Editar"><FaEdit /></button>
                  <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-700 p-1" title="Excluir"><FaTrash /></button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {[...Array(totalPaginas)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPagina(idx + 1)}
              className={`px-2 py-1 rounded text-xs ${pagina === idx + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-blue-700'}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
      {/* Modal de confirmação de exclusão */}
      {showConfirm.show && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow p-6 max-w-xs w-full flex flex-col items-center">
            <FaTrash className="text-red-500 text-3xl mb-2" />
            <p className="mb-4 text-center">Tem certeza que deseja excluir este item?</p>
            <div className="flex gap-2">
              <button onClick={confirmDelete} className="bg-red-500 text-white px-4 py-1 rounded">Excluir</button>
              <button onClick={cancelDelete} className="bg-gray-300 text-gray-700 px-4 py-1 rounded">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CadastroColaborador() {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '' })
  const [msg, setMsg] = useState('')
  const { cadastrarUsuario, user } = useAuth()
  const ambienteId = user?.ambienteId

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setMsg('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.nome || !form.email || !form.telefone || !form.senha) {
      setMsg('Preencha todos os campos.')
      return
    }
    try {
      await cadastrarUsuario({
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        senha: form.senha,
        role: 'colaborador',
        ambienteId
      })
      setMsg('Colaborador cadastrado com sucesso!')
      setForm({ nome: '', email: '', telefone: '', senha: '' })
      setTimeout(() => setMsg(''), 1200)
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <div className="mb-8 bg-white rounded shadow border-l-4 border-blue-500 p-4">
      <h2 className="text-lg font-bold text-blue-600 flex items-center gap-2">
        Colaboradores
      </h2>
      <form onSubmit={handleSubmit} className="grid gap-2 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            placeholder="Nome do colaborador"
            className="p-2 bg-gray-100 border border-gray-200 rounded flex-1 focus:outline-primary"
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="E-mail"
            className="p-2 bg-gray-100 border border-gray-200 rounded flex-1 focus:outline-primary"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
            placeholder="Telefone"
            className="p-2 bg-gray-100 border border-gray-200 rounded flex-1 focus:outline-primary"
          />
          <input
            name="senha"
            type="password"
            value={form.senha}
            onChange={handleChange}
            placeholder="Senha"
            className="p-2 bg-gray-100 border border-gray-200 rounded flex-1 focus:outline-primary"
          />
        </div>
        <button type="submit" className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition mt-2">
          <FaPlus /> <span className="hidden sm:inline">Adicionar colaborador</span>
        </button>
        {msg && (
          <div className={`text-center text-sm mt-1 transition-all duration-300 ${msg.includes('sucesso') ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'} border rounded py-1`}>
            {msg}
          </div>
        )}
      </form>
    </div>
  )
}

export default function Cadastros({ vendedores, setVendedores, lojas, setLojas, categorias, setCategorias }) {
  return (
    <div className="max-w-2xl mx-auto mt-8 px-2">
      <CadastroSimples
        titulo="Vendedores"
        campos={[{ nome: 'nome', label: 'Nome do vendedor' }]}
        lista={vendedores}
        setLista={setVendedores}
      />
      <CadastroSimples
        titulo="Lojas"
        campos={[{ nome: 'nome', label: 'Nome da loja' }]}
        lista={lojas}
        setLista={setLojas}
      />
      <CadastroSimples
        titulo="Categorias"
        campos={[{ nome: 'nome', label: 'Nome da categoria' }]}
        lista={categorias}
        setLista={setCategorias}
      />
    </div>
  )
}