import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { db, ref, set } from "../firebase"

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

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.nomeGerente || !form.email || !form.telefone || !form.senha || !form.nomeAmbiente) {
      setMsg("Preencha todos os campos.")
      return
    }
    try {
      // Gera um ambienteId único
      const ambienteId = Date.now().toString()
      // Cria o gerente
      const gerente = {
        nome: form.nomeGerente,
        email: form.email,
        telefone: form.telefone,
        senha: form.senha,
        role: "gerente",
        ambienteId
      }
      // Cria o ambiente
      const ambiente = {
        id: ambienteId,
        nome: form.nomeAmbiente,
        gerenteEmail: gerente.email
      }

      // Cadastro do usuário no Firebase Auth e Database
      await cadastrarUsuario(gerente)

      // Salva o ambiente no Firebase Database vinculado ao ambienteId
      await set(ref(db, `ambientes/${ambienteId}`), ambiente)

      // Salva ambienteId no localStorage para uso posterior
      localStorage.setItem("ldc_ambiente", JSON.stringify(ambiente))
      localStorage.setItem("ldc_ambienteId", ambienteId)

      // Login automático após cadastro
      await login(form.email, form.senha)
      setMsg("Cadastro realizado! Redirecionando...")
      setTimeout(() => {
        if (onCadastro) onCadastro()
      }, 1000)
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Cadastro da Corporação</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="nomeAmbiente" value={form.nomeAmbiente} onChange={handleChange} placeholder="Nome da corporação" className="w-full p-2 border rounded" />
        <input name="nomeGerente" value={form.nomeGerente} onChange={handleChange} placeholder="Nome do gerente" className="w-full p-2 border rounded" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="E-mail" className="w-full p-2 border rounded" />
        <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="Telefone" className="w-full p-2 border rounded" />
        <input name="senha" type="password" value={form.senha} onChange={handleChange} placeholder="Senha" className="w-full p-2 border rounded" />
        <button type="submit" className="w-full bg-primary text-white p-2 rounded">Cadastrar</button>
        {msg && <div className={`text-center ${msg.includes('sucesso') || msg.includes('realizado') ? 'text-green-600' : 'text-red-600'}`}>{msg}</div>}
      </form>
    </div>
  )
}