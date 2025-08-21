import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { auth } from "../firebase.js"
import { saveToLocalStorage, loadFromLocalStorage } from "../utils/localStorage"
import { syncToFirebase } from "../utils/syncFirebase"

export default function CadastroAmbiente({ onCadastro }) {
  const [form, setForm] = useState({
    nomeGerente: "",
    email: "",
    telefone: "",
    senha: "",
    nomeAmbiente: ""
  })
  const [msg, setMsg] = useState("")
  const { cadastrarUsuario, login } = useAuth()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg("")

    const { nomeGerente, email, telefone, senha, nomeAmbiente } = form
    if (!nomeGerente || !email || !telefone || !senha || !nomeAmbiente) {
      setMsg("Preencha todos os campos.")
      return
    }

    try {
      // 1) Cria o usuário (Auth + /usuarios/{uid} se sua função fizer isso)
      await cadastrarUsuario({
        nome: nomeGerente,
        email,
        telefone,
        senha,
        role: "gerente",
        ambienteId: nomeAmbiente // usa nomeAmbiente como id local
      })

      // 2) Login automático
      await login(email, senha)

      // 3) Garante UID do usuário autenticado
      const uid = auth.currentUser?.uid
      if (!uid) {
        setMsg("Não foi possível obter o usuário após o login.")
        return
      }

      // 4) Salva o ambiente localmente
      const ambiente = {
        id: uid,
        nome: nomeAmbiente,
        gerenteEmail: email,
        telefone,
        criadoEm: Date.now()
      }
  saveToLocalStorage('ambiente', ambiente)

  // Sincroniza sempre que ambiente muda
  syncToFirebase(`users/${uid}/ambiente`, ambiente).catch(() => {})

      setMsg("Cadastro realizado! Redirecionando...")
      setTimeout(() => {
        onCadastro?.()
      }, 1000)
    } catch (err) {
      setMsg(err?.message || "Erro ao cadastrar.")
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Cadastro da Corporação</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="nomeAmbiente"
          value={form.nomeAmbiente}
          onChange={handleChange}
          placeholder="Nome da corporação"
          className="w-full p-2 border rounded"
        />
        <input
          name="nomeGerente"
          value={form.nomeGerente}
          onChange={handleChange}
          placeholder="Nome do gerente"
          className="w-full p-2 border rounded"
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="E-mail"
          className="w-full p-2 border rounded"
        />
        <input
          name="telefone"
          value={form.telefone}
          onChange={handleChange}
          placeholder="Telefone"
          className="w-full p-2 border rounded"
        />
        <input
          name="senha"
          type="password"
          value={form.senha}
          onChange={handleChange}
          placeholder="Senha"
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-primary text-white p-2 rounded">
          Cadastrar
        </button>
        {msg && (
          <div
            className={`text-center ${
              msg.toLowerCase().includes("realizado") || msg.toLowerCase().includes("sucesso")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {msg}
          </div>
        )}
      </form>
    </div>
  )
}
