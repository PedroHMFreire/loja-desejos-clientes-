import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Login pelo Firebase Auth e carrega ambienteId do usuário
      await login(email, password)
      setLoading(false)
      navigate('/home')
    } catch (err) {
      setLoading(false)
      setError('E-mail ou senha inválidos.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-8 bg-gray-100">
      {/* Logomarca */}
      <div className="mb-6">
        <span className="text-4xl font-bold text-primary">Anot.AI</span>
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
          onChange={e => setEmail(e.target.value)}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Senha"
          className="w-full p-2 border rounded bg-white"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button type="submit" className="w-full bg-primary text-white p-2 rounded" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        {error && <div className="text-red-600 text-center">{error}</div>}
      </form>
      {/* Link para cadastro */}
      <div className="mt-6 text-center">
        Ainda não é cadastrado?{' '}
        <Link to="/cadastro" className="text-blue-600 hover:underline">
          Clique aqui
        </Link>
      </div>
    </div>
  )
}