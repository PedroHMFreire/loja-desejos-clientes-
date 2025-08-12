/* src/App.jsx */
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useState, useEffect } from "react"
import Navbar from "./components/Navbar"
import Home from "./components/Home"
import Desejos from "./components/Desejos"
import Cadastros from "./components/Cadastros"
import Login from "./components/Login"
import ProtectedRoute from "./components/ProtectedRoute"
import CadastroAmbiente from "./components/CadastroAmbiente"
import { db, ref, onValue } from "./firebase.js"
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

  // Listeners em tempo real por usuário
  useEffect(() => {
    if (!user) {
      setDesejos([])
      setVendedores([])
      setLojas([])
      setCategorias([])
      return
    }

    const base = `users/${user.uid}`

    const unsubDesejos = onValue(ref(db, `${base}/desejos`), snap => {
      setDesejos(toArray(snap.val()))
    })

    const unsubVendedores = onValue(ref(db, `${base}/vendedores`), snap => {
      setVendedores(toArray(snap.val()))
    })

    const unsubLojas = onValue(ref(db, `${base}/lojas`), snap => {
      setLojas(toArray(snap.val()))
    })

    const unsubCategorias = onValue(ref(db, `${base}/categorias`), snap => {
      setCategorias(toArray(snap.val()))
    })

    return () => {
      unsubDesejos()
      unsubVendedores()
      unsubLojas()
      unsubCategorias()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-lg text-gray-500">Carregando...</span>
      </div>
    )
  }

  return (
    <Router>
      <Navbar />
      <div className="p-4">
        <Routes>
          {/* Login e Cadastro públicos */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<CadastroAmbiente onCadastro={() => (window.location.href = "/")} />} />

          {/* Raiz protegida leva ao Home */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home
                  desejos={desejos}
                  setDesejos={setDesejos}
                  vendedores={vendedores}
                  lojas={lojas}
                  categorias={categorias}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/desejos"
            element={
              <ProtectedRoute>
                <Desejos
                  desejos={desejos}
                  setDesejos={setDesejos}
                  vendedores={vendedores}
                  lojas={lojas}
                  categorias={categorias}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cadastros"
            element={
              <ProtectedRoute requiredRole="gerente">
                <Cadastros />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}