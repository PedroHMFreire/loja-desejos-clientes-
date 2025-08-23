import { useState, useEffect, useMemo } from "react"
import { FaEdit, FaTrash, FaWhatsapp, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa"
// ...existing code...
import { getDesejos, addDesejo, updateDesejo, deleteDesejo } from "../utils/supabaseCrud"
import { useAuth } from "../contexts/AuthContext"

function gerarLinkWhatsapp(nome, tel, produto, vendedor) {
  const msg = `Oi, ${sanitize(nome)}! Seu desejo é uma ordem. Nós já estamos trabalhando no seu pedido! Segue abaixo os detalhes! Qualquer dúvida é só me chamar!\n\nProduto: ${sanitize(produto)}\nVendedor: ${sanitize(vendedor)}`
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
  // Função para editar desejo
  const handleEdit = item => {
    setEditId(item.id)
    setEditForm({
      nome: item.nome,
      tel: item.tel,
      produto: item.produto,
      tamanho: item.tamanho,
      valor: String(item.valor),
      vendedor_id: item.vendedor_id,
      loja_id: item.loja_id,
      categoria_id: item.categoria_id || ""
    })
    setModalAberto(true)
  }

  // Função para submit da edição
  const handleEditSubmit = async e => {
    e.preventDefault()
    if (!nomeCompletoValido(editForm.nome)) { setMsg("Digite nome e sobrenome."); return }
    if (!editForm.tel || !editForm.produto || !editForm.tamanho || !editForm.valor || !editForm.vendedor_id || !editForm.loja_id) {
      setMsg("Preencha todos os campos obrigatórios."); return
    }
    const atualizado = {
      nome: sanitize(editForm.nome),
      tel: editForm.tel,
      produto: sanitize(editForm.produto),
      tamanho: editForm.tamanho,
      valor: editForm.valor.replace(",", "."),
      vendedor_id: editForm.vendedor_id,
      loja_id: editForm.loja_id,
      categoria_id: editForm.categoria_id || null
    }
    try {
      await updateDesejo(editId, atualizado)
      const data = await getDesejos(uid)
      setDesejos(data)
      setMsg("Desejo atualizado com sucesso!")
      setModalAberto(false)
      setEditId(null)
      setEditForm({})
    } catch {
      setMsg("Erro ao atualizar desejo.")
    }
    setTimeout(() => setMsg("") , 3000)
  }

  // Função para remover desejo
  const handleDelete = async id => {
    try {
      await deleteDesejo(id)
      const data = await getDesejos(uid)
      setDesejos(data)
      setMsg("Desejo excluído!")
    } catch {
      setMsg("Erro ao excluir desejo.")
    }
    setTimeout(() => setMsg("") , 3000)
  }
  // ...existing code...

  // Handler para alterar status do desejo
  const handleStatus = async id => {
    const alvo = desejos.find(d => d.id === id)
    if (!alvo) return
    // Cria objeto apenas com campos válidos do schema
    const atualizado = {
      nome: alvo.nome,
      tel: alvo.tel,
      produto: alvo.produto,
      tamanho: alvo.tamanho,
      valor: alvo.valor,
      vendedor_id: alvo.vendedor_id,
      loja_id: alvo.loja_id,
      categoria_id: alvo.categoria_id || null,
      status: nextStatus[alvo.status] || "pendente"
    }
    try {
      await updateDesejo(id, atualizado)
      const data = await getDesejos(uid)
      setDesejos(data)
    } catch {
      setMsg("Erro ao atualizar status.")
    }
  }
  // ...existing code...

  // Handler para submit do cadastro de desejo
  const handleSubmit = async e => {
    e.preventDefault()
    if (!nomeCompletoValido(form.nome)) { setMsg("Digite nome e sobrenome."); return }
    if (!form.tel || !form.produto || !form.tamanho || !form.valor || !form.vendedor_id || !form.loja_id) {
      setMsg("Preencha todos os campos obrigatórios."); return
    }
    const novo = {
      nome: sanitize(form.nome),
      tel: form.tel,
      produto: sanitize(form.produto),
      tamanho: form.tamanho,
      valor: form.valor.replace(",", "."),
      vendedor_id: form.vendedor_id,
      loja_id: form.loja_id,
      categoria_id: form.categoria_id || null,
      status: "pendente"
    }
    try {
      const desejo = await addDesejo(uid, novo)
      setDesejos([...desejos, desejo])
      setMsg("Desejo cadastrado com sucesso!")
    } catch {
      setMsg("Erro ao salvar no Supabase.")
    }
    setForm({ nome: "", tel: "", produto: "", tamanho: "", valor: "", vendedor_id: "", loja_id: "", categoria_id: "" })
    setTimeout(() => setMsg("") , 3000)
  }
  // Todos os hooks de estado devem ser inicializados antes de qualquer uso
  const [visibleCount, setVisibleCount] = useState(10)
  const [desejos, setDesejos] = useState([])
  const [form, setForm] = useState({ nome: "", tel: "", produto: "", tamanho: "", valor: "", vendedor_id: "", loja_id: "", categoria_id: "" })
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [showConfirm, setShowConfirm] = useState({ show: false, id: null })
  const [modalAberto, setModalAberto] = useState(false)
  const [filtros, setFiltros] = useState({ nome: '', categoria: '', vendedor: '' })
  const [msg, setMsg] = useState("")
  const { user } = useAuth()
  const uid = user?.id

  // Carregar desejos do Supabase
  useEffect(() => {
    if (!uid) return
    getDesejos(uid)
      .then(data => setDesejos(data))
      .catch(err => {
        setMsg("Erro ao carregar desejos.")
        console.warn("[Desejos] Falha ao ler do Supabase:", err)
      })
  }, [uid])

  // Lista memoizada de desejos filtrados, ordenados e paginados
  const desejosMemo = useMemo(() => desejos
    .map(item => ({
      ...item,
      status: item.status || "pendente",
      vendedor: vendedores.find(v => v.id === item.vendedor_id)?.nome || "",
      loja: lojas.find(l => l.id === item.loja_id)?.nome || "",
      categoria: categorias.find(c => c.id === item.categoria_id)?.nome || ""
    }))
    .filter(item =>
      (!filtros.nome || item.nome.toLowerCase().includes(filtros.nome.toLowerCase())) &&
      (!filtros.categoria || item.categoria === filtros.categoria) &&
      (!filtros.vendedor || item.vendedor === filtros.vendedor)
    )
    .sort((a, b) => {
      const dataA = new Date(a.created_at || a.createdAt || 0)
      const dataB = new Date(b.created_at || b.createdAt || 0)
      return dataB - dataA
    })
    .slice(0, visibleCount)
  , [desejos, vendedores, lojas, categorias, filtros, visibleCount])
  // ...existing code...

  // Handlers para formulário/modal
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

  // Função para abrir o modal de cadastro corretamente
  const abrirModalCadastro = () => {
    setModalAberto(true)
    setEditId(null)
    setForm({ nome: "", tel: "", produto: "", tamanho: "", valor: "", vendedor_id: "", loja_id: "", categoria_id: "" })
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 px-2 w-full">
      {/* Botão cadastrar desejo no topo */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-700">Desejos dos Clientes</h2>
        <button onClick={() => { setModalAberto(true); setEditId(null); setForm({ nome: "", tel: "", produto: "", tamanho: "", valor: "", vendedor_id: "", loja_id: "", categoria_id: "" }) }} className="bg-primary text-white px-4 py-2 rounded shadow font-semibold">
          Cadastrar desejo
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 rounded shadow p-4 mb-4 flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Buscar por nome do cliente"
            className="p-2 border rounded w-full"
            value={filtros.nome}
            onChange={e => setFiltros(f => ({ ...f, nome: e.target.value }))}
          />
          <select
            className="p-2 border rounded w-full"
            value={filtros.categoria}
            onChange={e => setFiltros(f => ({ ...f, categoria: e.target.value }))}
          >
            <option value="">Todas as categorias</option>
            {categorias.map(c => (
              <option key={c.id} value={c.nome}>{c.nome}</option>
            ))}
          </select>
          <select
            className="p-2 border rounded w-full"
            value={filtros.vendedor}
            onChange={e => setFiltros(f => ({ ...f, vendedor: e.target.value }))}
          >
            <option value="">Todos os vendedores</option>
            {vendedores.map(v => (
              <option key={v.id} value={v.nome}>{v.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Modal de cadastro de desejo */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative animate-fade-in">
            <button
              onClick={() => setModalAberto(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              aria-label="Fechar"
              type="button"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Cadastrar desejo</h2>
            <form onSubmit={editId ? handleEditSubmit : handleSubmit} className="space-y-3">
              <input name="nome" value={editId ? (editForm.nome || "") : form.nome} onChange={editId ? handleEditChange : handleChange} placeholder="Nome completo" className="w-full p-2 border rounded" />
              <input name="tel" value={editId ? (editForm.tel || "") : form.tel} onChange={editId ? handleEditChange : handleChange} placeholder="Telefone" className="w-full p-2 border rounded bg-white" />
              <input name="produto" value={editId ? (editForm.produto || "") : form.produto} onChange={editId ? handleEditChange : handleChange} placeholder="Produto desejado" className="w-full p-2 border rounded bg-white" />
              <input name="tamanho" value={editId ? (editForm.tamanho || "") : form.tamanho} onChange={editId ? handleEditChange : handleChange} placeholder="Tamanho" className="w-full p-2 border rounded bg-white" />
              <input name="valor" value={editId ? (editForm.valor || "") : form.valor} onChange={editId ? handleEditChange : handleChange} placeholder="Valor" className="w-full p-2 border rounded bg-white" inputMode="decimal" />
              <select name="vendedor_id" value={editId ? (editForm.vendedor_id || "") : form.vendedor_id} onChange={editId ? handleEditChange : handleChange} className="w-full p-2 border rounded bg-white">
                <option value="">Selecione o vendedor</option>
                {vendedores?.map(v => (<option key={v.id} value={v.id}>{v.nome}</option>))}
              </select>
              <select name="loja_id" value={editId ? (editForm.loja_id || "") : form.loja_id} onChange={editId ? handleEditChange : handleChange} className="w-full p-2 border rounded">
                <option value="">Selecione a loja</option>
                {lojas?.map(l => (<option key={l.id} value={l.id}>{l.nome}</option>))}
              </select>
              <select name="categoria_id" value={editId ? (editForm.categoria_id || "") : form.categoria_id} onChange={editId ? handleEditChange : handleChange} className="w-full p-2 border rounded bg-white">
                <option value="">Selecione a categoria</option>
                {categorias?.map(c => (<option key={c.id} value={c.id}>{c.nome}</option>))}
              </select>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button type="button" onClick={() => setModalAberto(false)} className="px-4 py-2 rounded bg-gray-300 text-gray-700 w-full sm:w-auto">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-primary text-white w-full sm:w-auto">
                  {editId ? "Salvar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {msg && <div className="text-center py-2 text-green-600">{msg}</div>}

      <ul className="space-y-2">
        {desejosMemo.map(item => {
          const status = item.status || "pendente"
          const avatar = item.nome ? item.nome.trim()[0].toUpperCase() : "?"
          // Formata data de registro
          let dataRegistro = ""
          const dataCampo = item.created_at || item.createdAt || item.data || null
          if (dataCampo) {
            const d = new Date(dataCampo)
            dataRegistro = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
          }
          return (
            <li key={item.id} className="bg-white rounded shadow border border-gray-200 px-3 py-2 flex flex-col gap-2 mb-2">
              {/* Linha 1: Avatar, nome, categoria, data */}
              <div className="flex items-center gap-2 w-full">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-primary">
                  {avatar}
                </div>
                <span className="font-bold text-base truncate max-w-[110px]">{item.nome}</span>
                {item.categoria && (
                  <span className="px-2 py-1 rounded bg-gray-100 text-xs font-semibold border border-gray-300">{item.categoria}</span>
                )}
                {dataRegistro && (
                  <span className="text-xs text-gray-500 ml-auto">{dataRegistro}</span>
                )}
              </div>
              {/* Linha 2: Produto, tamanho, vendedor, loja */}
              <div className="flex flex-wrap gap-2 text-xs text-gray-700 pl-12">
                <span><b>Produto:</b> {item.produto}</span>
                <span><b>Tam:</b> {item.tamanho}</span>
                <span><b>Vend:</b> {item.vendedor}</span>
                <span><b>Loja:</b> {item.loja}</span>
              </div>
              {/* Linha 3: Valor, status, botões */}
              <div className="flex items-center justify-between gap-2 pl-12">
                <div className="flex flex-col items-start">
                  <span className="text-base font-bold text-primary">{Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  <span className="text-xs text-gray-500">{statusIcon[status]} {status.charAt(0).toUpperCase() + status.slice(1)}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleStatus(item.id)} className="p-2 rounded border" title="Alterar status">
                    {statusIcon[status]}
                  </button>
                  <button onClick={() => handleEdit(item)} className="p-2 rounded bg-yellow-400 text-white" title="Editar">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded bg-red-500 text-white" title="Excluir">
                    <FaTrash />
                  </button>
                  <a href={gerarLinkWhatsapp(item.nome, item.tel, item.produto, item.vendedor)} target="_blank" rel="noreferrer" className="p-2 rounded bg-green-500 text-white" title="Enviar WhatsApp">
                    <FaWhatsapp />
                  </a>
                </div>
              </div>
            </li>
          )
        })}
        {/* Rolagem infinita: botão para carregar mais */}
        {desejosMemo.length < desejos.length && (
          <div className="flex justify-center my-4">
            <button onClick={() => setVisibleCount(c => c + 10)} className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold shadow">
              Carregar mais desejos
            </button>
          </div>
        )}
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