import { useState, useEffect } from "react"
import Modal from "./Modal"
import { FaWhatsapp, FaEdit, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa"

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

export default function Desejos({ desejos, setDesejos, vendedores, lojas, categorias }) {
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [aba, setAba] = useState(lojas[0]?.nome || "")
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

  const lojasUnicas = getLojasUnicas(desejos, lojas)

  useEffect(() => {
    if ((aba === "" || !lojasUnicas.includes(aba)) && lojasUnicas.length > 0) {
      setAba(lojasUnicas[0])
    }
    // eslint-disable-next-line
  }, [lojasUnicas])

  // Alterna status: pendente -> atendido -> desistido -> pendente ...
  const alternarStatus = id => {
    setDesejos(desejos.map(d => {
      if (d.id !== id) return d
      const next =
        d.status === "pendente"
          ? "atendido"
          : d.status === "atendido"
          ? "desistido"
          : "pendente"
      return { ...d, status: next }
    }))
  }

  const abrirModal = (desejo = null) => {
    setEditando(desejo)
    setForm(
      desejo
        ? { ...desejo }
        : {
            nome: "",
            tel: "",
            produto: "",
            tamanho: "",
            valor: "",
            vendedor: "",
            loja: aba || lojasUnicas[0] || "",
            categoria: ""
          }
    )
    setMsg("")
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setEditando(null)
    setMsg("")
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!nomeCompletoValido(form.nome)) {
      setMsg("Digite o nome e sobrenome do cliente (mínimo 2 letras cada).")
      return
    }
    if (
      !form.tel ||
      !form.produto ||
      !form.tamanho ||
      !form.valor ||
      !form.vendedor ||
      !form.loja
    ) {
      setMsg("Preencha todos os campos obrigatórios.")
      return
    }
    if (editando) {
      setDesejos(desejos.map(d => (d.id === editando.id ? { ...form, id: editando.id, status: d.status || "pendente" } : d)))
      setMsg("Desejo atualizado com sucesso!")
    } else {
      setDesejos([
        ...desejos,
        { ...form, id: Date.now().toString(), status: "pendente" }
      ])
      setMsg("Desejo cadastrado com sucesso!")
    }
    setTimeout(() => {
      fecharModal()
    }, 800)
  }

  const handleEdit = desejo => {
    abrirModal(desejo)
  }

  const desejosPorLoja = loja =>
    desejos.filter(d => d.loja === loja)

  return (
    <div className="max-w-5xl mx-auto mt-8 px-2">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-primary">Desejos dos Clientes</h1>
        <button
          onClick={() => abrirModal()}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition w-full sm:w-auto"
        >
          Cadastrar desejo
        </button>
      </div>
      {/* Abas de lojas */}
      <div className="flex flex-wrap gap-2 mb-4">
        {lojasUnicas.map(loja => (
          <button
            key={loja}
            onClick={() => setAba(loja)}
            className={`px-4 py-2 rounded-t ${aba === loja ? "bg-primary text-white" : "bg-gray-200 text-gray-700"} transition`}
          >
            {loja}
          </button>
        ))}
      </div>
      {/* Tabela de desejos */}
      <div className="bg-white rounded-b shadow p-2 sm:p-4 overflow-x-auto">
        {desejosPorLoja(aba).length === 0 ? (
          <div className="text-center text-gray-500 py-8">Nenhum desejo cadastrado para esta loja.</div>
        ) : (
          <table className="w-full border rounded overflow-hidden text-sm sm:text-base">
            <thead>
              <tr className="bg-primary/10">
                <th className="p-2">Cliente</th>
                <th className="p-2">Produto</th>
                <th className="p-2">Telefone</th>
                <th className="p-2">Tamanho</th>
                <th className="p-2">Valor</th>
                <th className="p-2">Vendedor</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {desejosPorLoja(aba).map(desejo => (
                <tr key={desejo.id} className="hover:bg-primary/5 transition">
                  <td className="p-2 break-words">{desejo.nome}</td>
                  <td className="p-2 break-words">{desejo.produto}</td>
                  <td className="p-2 break-words">{desejo.tel}</td>
                  <td className="p-2 break-words">{desejo.tamanho}</td>
                  <td className="p-2 break-words">{desejo.valor}</td>
                  <td className="p-2 break-words">{desejo.vendedor}</td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => alternarStatus(desejo.id)}
                      title={
                        desejo.status === "atendido"
                          ? "Marcar como desistido"
                          : desejo.status === "desistido"
                          ? "Marcar como pendente"
                          : "Marcar como atendido"
                      }
                      className="focus:outline-none"
                    >
                      {desejo.status === "atendido" ? (
                        <FaCheckCircle className="text-green-500 text-lg" />
                      ) : desejo.status === "desistido" ? (
                        <FaTimesCircle className="text-red-500 text-lg" />
                      ) : (
                        <FaClock className="text-gray-400 text-lg" />
                      )}
                    </button>
                  </td>
                  <td className="p-2 flex gap-2">
                    <button
                      title="Editar"
                      onClick={() => handleEdit(desejo)}
                      className="p-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                      <FaEdit />
                    </button>
                    <a
                      href={gerarLinkWhatsapp(desejo.nome, desejo.tel, desejo.produto, desejo.vendedor)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="WhatsApp"
                      className="p-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-500"
                    >
                      <FaWhatsapp />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Modal de cadastro/edição */}
      <Modal isOpen={modalAberto} onClose={fecharModal}>
        <h2 className="text-xl font-bold mb-4">{editando ? "Editar desejo" : "Cadastrar desejo"}</h2>
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
            {lojasUnicas.map(l => (
              <option key={l} value={l}>{l}</option>
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
            <button type="button" onClick={fecharModal} className="px-4 py-2 rounded bg-gray-300 text-gray-700 w-full sm:w-auto">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-primary text-white w-full sm:w-auto">{editando ? "Salvar" : "Cadastrar"}</button>
          </div>
          {msg && <div className={`text-center ${msg.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>{msg}</div>}
        </form>
      </Modal>
    </div>
  )
}