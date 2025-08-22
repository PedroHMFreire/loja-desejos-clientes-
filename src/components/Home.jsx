// src/components/Home.jsx
import { FaCheckCircle, FaClock, FaTimesCircle, FaPlus } from "react-icons/fa"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { useState, useEffect } from "react"
import Modal from "./Modal"
import { auth, onAuthStateChanged } from "../firebase"
import { addDesejo } from "../utils/syncFirebase"

function nomeCompletoValido(nome) {
  if (!nome) return false
  const partes = nome.trim().split(/\s+/)
  return partes.length >= 2 && partes.every(p => p.length >= 2)
}

const STATUS_COLORS = {
  pendente: "#60a5fa",
  atendido: "#22c55e",
  desistido: "#ef4444"
}

export default function Home({ desejos = [], setDesejos, vendedores = [], lojas = [], categorias = [] }) {
  const [modalAberto, setModalAberto] = useState(false)
  const [msg, setMsg] = useState("")
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
  const [syncError, setSyncError] = useState(false)
  const [uid, setUid] = useState(null)

  // Captura UID corretamente (SDK modular)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setUid(user?.uid || null))
    return unsub
  }, [])

  // Indicadores
  const total = desejos.length
  const pendentes = desejos.filter(d => d.status === "pendente").length
  const atendidos = desejos.filter(d => d.status === "atendido").length
  const desistidos = desejos.filter(d => d.status === "desistido").length
  const valorTotal = desejos.reduce((acc, d) => acc + (parseFloat(d.valor) || 0), 0)

  // Gráficos (com proteção)
  const lojasData = Array.isArray(lojas)
    ? lojas.map(loja => ({
        name: loja.nome,
        value: desejos.filter(d => d.loja === loja.nome).length
      }))
    : []

  const vendedoresData = Array.isArray(vendedores)
    ? vendedores.map(v => ({
        name: v.nome,
        value: desejos.filter(d => d.vendedor === v.nome).length
      }))
    : []

  const statusData = [
    { name: "Pendentes", value: pendentes, color: STATUS_COLORS.pendente },
    { name: "Atendidos", value: atendidos, color: STATUS_COLORS.atendido },
    { name: "Desistências", value: desistidos, color: STATUS_COLORS.desistido }
  ]

  // Modal handlers
  const abrirModal = () => {
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
    setMsg("")
    setModalAberto(true)
  }
  const fecharModal = () => {
    setModalAberto(false)
    setMsg("")
  }
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
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

    try {
      const payload = {
        ...form,
        valor: parseFloat(form.valor) || 0,
        status: "pendente",
        createdAt: Date.now()
        // ⚠️ Não enviar "id" dentro do objeto para não conflitar com a key do Firebase
      }

      // Atualiza UI imediatamente (otimista)
      setDesejos([...desejos, payload])

      // Grava no Firebase (fonte principal)
      if (!uid) throw new Error("Usuário não autenticado")
      await addDesejo(uid, payload)

      setMsg("Desejo cadastrado com sucesso!")
      setTimeout(() => {
        fecharModal()
      }, 800)
    } catch (err) {
      setMsg("Erro ao salvar. Tente novamente.")
      setSyncError(true)
      console.error("Erro ao cadastrar desejo:", err)
    }
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-2 bg-white">
      {/* Botão cadastrar desejo */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <button
          onClick={abrirModal}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded shadow hover:bg-primary/80 transition text-lg font-semibold w-full sm:w-auto"
        >
          <FaPlus /> Cadastrar desejo
        </button>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 mb-6">
        <div className="bg-white rounded shadow p-3 flex flex-col items-center min-w-0">
          <span className="text-gray-500 text-xs sm:text-sm">Total de desejos</span>
          <span className="text-xl sm:text-2xl font-bold text-primary">{total}</span>
        </div>
        <div className="bg-white rounded shadow p-3 flex flex-col items-center min-w-0">
          <span className="text-gray-500 text-xs sm:text-sm flex items-center gap-1">
            <FaClock className="text-blue-400" /> Pendentes
          </span>
          <span className="text-xl sm:text-2xl font-bold text-blue-400">{pendentes}</span>
        </div>
        <div className="bg-white rounded shadow p-3 flex flex-col items-center min-w-0">
          <span className="text-gray-500 text-xs sm:text-sm flex items-center gap-1">
            <FaCheckCircle className="text-green-500" /> Atendidos
          </span>
          <span className="text-xl sm:text-2xl font-bold text-green-500">{atendidos}</span>
        </div>
        <div className="bg-white rounded shadow p-3 flex flex-col items-center min-w-0">
          <span className="text-gray-500 text-xs sm:text-sm flex items-center gap-1">
            <FaTimesCircle className="text-red-500" /> Desistências
          </span>
          <span className="text-xl sm:text-2xl font-bold text-red-500">{desistidos}</span>
        </div>
        <div className="bg-white rounded shadow p-3 flex flex-col items-center min-w-0 col-span-1 lg:col-span-1">
          <span className="text-gray-500 text-xs sm:text-sm">Valor total estimado</span>
          <span className="text-xl sm:text-2xl font-bold text-primary">
            {valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
      </div>

      {/* Gráficos */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-8">
        <div className="bg-white rounded shadow p-3 overflow-x-auto">
          <h2 className="font-semibold mb-2 text-primary">Desejos por loja</h2>
          <div className="min-w-[300px]">
            {lojasData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={lojasData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#60a5fa" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-gray-500">Sem dados de lojas.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded shadow p-3 overflow-x-auto">
          <h2 className="font-semibold mb-2 text-primary">Desejos por vendedor</h2>
          <div className="min-w-[300px]">
            {vendedoresData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={vendedoresData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-gray-500">Sem dados de vendedores.</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded shadow p-3 overflow-x-auto lg:col-span-2">
          <h2 className="font-semibold mb-2 text-primary">Proporção por status</h2>
          <div className="min-w-[300px]">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modal de cadastro de desejo */}
      <Modal isOpen={modalAberto} onClose={fecharModal}>
        <h2 className="text-xl font-bold mb-4">Cadastrar desejo</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            placeholder="Nome e sobrenome do cliente*"
            className="w-full p-2 border rounded"
            required
            minLength={5}
          />
          <input
            name="tel"
            value={form.tel}
            onChange={handleChange}
            placeholder="Telefone (apenas números)*"
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="produto"
            value={form.produto}
            onChange={handleChange}
            placeholder="Produto desejado*"
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="tamanho"
            value={form.tamanho}
            onChange={handleChange}
            placeholder="Tamanho*"
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="valor"
            value={form.valor}
            onChange={handleChange}
            placeholder="Valor*"
            className="w-full p-2 border rounded"
            required
          />
          <select
            name="vendedor"
            value={form.vendedor}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Selecione o vendedor*</option>
            {vendedores.map(v => (
              <option key={v.id || v.nome} value={v.nome}>{v.nome}</option>
            ))}
          </select>
          <select
            name="loja"
            value={form.loja}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Selecione a loja*</option>
            {lojas.map(l => (
              <option key={l.id || l.nome} value={l.nome}>{l.nome}</option>
            ))}
          </select>
          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Selecione a categoria</option>
            {categorias.map(c => (
              <option key={c.id || c.nome} value={c.nome}>{c.nome}</option>
            ))}
          </select>
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <button type="button" onClick={fecharModal} className="px-4 py-2 rounded bg-gray-300 text-gray-700 w-full sm:w-auto">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-primary text-white w-full sm:w-auto">
              Cadastrar
            </button>
          </div>
          {msg && (
            <div className={`text-center ${msg.toLowerCase().includes("sucesso") ? "text-green-600" : "text-red-600"}`}>
              {msg}
            </div>
          )}
          {syncError && (
            <div className="text-yellow-600 text-center mt-2">
              Não foi possível sincronizar com o banco. Seus dados continuam na tela.
            </div>
          )}
        </form>
      </Modal>
    </div>
  )
}
