import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate, Link } from "react-router-dom"

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const emailTrim = email.trim().toLowerCase()
    const passTrim = password.trim()

    if (!emailTrim || !passTrim) {
      setError("Informe e-mail e senha.")
      return
    }

    setLoading(true)
    try {
      await login(emailTrim, passTrim)
      // sucesso → manda pra raiz protegida
      navigate("/")
    } catch (err) {
      // Supabase pode retornar "Email not confirmed". Ignorar e mostrar erro genérico.
      if (err?.message && err.message.toLowerCase().includes("email not confirmed")) {
        setError("E-mail ou senha inválidos.")
      } else {
        setError(err.message || "E-mail ou senha inválidos.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-auto flex flex-col items-center justify-start pt-8 bg-gray-100">
      {/* Logomarca */}
      <div className="mb-6">
        <span className="text-4xl font-bold text-primary">Anote.AI</span>
      </div>

      {/* Slogan */}
      <div className="mb-8 text-lg text-gray-700 italic text-center">
        Se anotar, o cliente vai voltar
      </div>

      {/* Formulário de login */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4">
        <input
          type="email"
          placeholder="E-mail"
          className="w-full p-2 border rounded bg-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          inputMode="email"
        />
        <input
          type="password"
          placeholder="Senha"
          className="w-full p-2 border rounded bg-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button
          type="submit"
          className="w-full bg-primary text-white p-2 rounded disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        {error && <div className="text-red-600 text-center">{error}</div>}
      </form>

      {/* Link para cadastro */}
      <div className="mt-6 text-center">
        Ainda não é cadastrado?{" "}
        <Link to="/cadastro" className="text-blue-600 hover:underline">
          Clique aqui
        </Link>
      </div>
    </div>
  )
}