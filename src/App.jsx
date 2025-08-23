/* src/App.jsx */
// ...existing code...
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Navbar from "./components/Navbar"
import Ranking from "./components/Ranking"
import Home from "./components/Home"
import Desejos from "./components/Desejos"
import Cadastros from "./components/Cadastros"
import Login from "./components/Login"
import ProtectedRoute from "./components/ProtectedRoute"
import CadastroAmbiente from "./components/CadastroAmbiente"
import { getDesejos, getCadastros } from "./utils/supabaseCrud"
import { useAuth } from "./contexts/AuthContext"

function toArray(obj) {
  if (!obj || typeof obj !== "object") return []
  return Object.entries(obj).map(([id, v]) => ({ id, ...v }))
}

export default function App() {
  const { user, role, loading } = useAuth()

  const [desejos, setDesejos] = useState([])
  const [vendedores, setVendedores] = useState([])
  const [lojas, setLojas] = useState([])
  const [categorias, setCategorias] = useState([])

  // Carrega dados do Supabase após login
  useEffect(() => {
    if (!user) {
      setDesejos([])
      setVendedores([])
      setLojas([])
      setCategorias([])
      return
    }
    const uid = user.id
    getDesejos(uid)
      .then(data => setDesejos(data))
      .catch(() => setDesejos([]))
    getCadastros(uid, "vendedores")
      .then(data => setVendedores(data))
      .catch(() => setVendedores([]))
    getCadastros(uid, "lojas")
      .then(data => setLojas(data))
      .catch(() => setLojas([]))
    getCadastros(uid, "categorias")
      .then(data => setCategorias(data))
      .catch(() => setCategorias([]))
  }, [user])

  return (
    <Router>
      <Navbar />
      <div className="p-4">
        <Routes>
          {/* Login e Cadastro públicos */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<CadastroAmbiente onCadastro={() => (window.location.href = "/")} />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home
                desejos={desejos}
                setDesejos={setDesejos}
                vendedores={vendedores}
                lojas={lojas}
                categorias={categorias}
              />
            </ProtectedRoute>
          } />
          <Route path="/desejos" element={
            <ProtectedRoute>
              <Desejos
                desejos={desejos}
                setDesejos={setDesejos}
                vendedores={vendedores}
                lojas={lojas}
                categorias={categorias}
              />
            </ProtectedRoute>
          } />
          <Route path="/cadastros" element={
            <ProtectedRoute>
              <Cadastros />
            </ProtectedRoute>
          } />
          <Route path="/ranking" element={
            <ProtectedRoute>
              <Ranking desejos={desejos} />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  )
}