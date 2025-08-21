/* src/App.jsx */
import { loadFromLocalStorage } from "./utils/localStorage"
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

  // Carrega dados do Local Storage e, se vazio, busca do Firebase após login
  useEffect(() => {
    if (!user) {
      setDesejos([])
      setVendedores([])
      setLojas([])
      setCategorias([])
      return
    }
    // Desejos
    const desejosLocal = loadFromLocalStorage("desejos")
    if (desejosLocal && desejosLocal.length > 0) {
      setDesejos(desejosLocal)
    } else {
      import("./firebase.js").then(({ db, ref, get }) => {
        get(ref(db, `users/${user.uid}/desejos`)).then(snap => {
          if (snap.exists()) {
            const dados = snap.val() || {}
            const listaBanco = Array.isArray(dados)
              ? dados
              : Object.entries(dados).map(([id, item]) => ({ ...item, id }))
            setDesejos(listaBanco)
          } else {
            setDesejos([])
          }
        })
      })
    }
    // Vendedores
    const vendedoresLocal = loadFromLocalStorage("vendedores")
    if (vendedoresLocal && vendedoresLocal.length > 0) {
      setVendedores(vendedoresLocal)
    } else {
      import("./firebase.js").then(({ db, ref, get }) => {
        get(ref(db, `users/${user.uid}/vendedores`)).then(snap => {
          if (snap.exists()) {
            const dados = snap.val() || {}
            const listaBanco = Array.isArray(dados)
              ? dados
              : Object.entries(dados).map(([id, item]) => ({ ...item, id }))
            setVendedores(listaBanco)
          } else {
            setVendedores([])
          }
        })
      })
    }
    // Lojas
    const lojasLocal = loadFromLocalStorage("lojas")
    if (lojasLocal && lojasLocal.length > 0) {
      setLojas(lojasLocal)
    } else {
      import("./firebase.js").then(({ db, ref, get }) => {
        get(ref(db, `users/${user.uid}/lojas`)).then(snap => {
          if (snap.exists()) {
            const dados = snap.val() || {}
            const listaBanco = Array.isArray(dados)
              ? dados
              : Object.entries(dados).map(([id, item]) => ({ ...item, id }))
            setLojas(listaBanco)
          } else {
            setLojas([])
          }
        })
      })
    }
    // Categorias
    const categoriasLocal = loadFromLocalStorage("categorias")
    if (categoriasLocal && categoriasLocal.length > 0) {
      setCategorias(categoriasLocal)
    } else {
      import("./firebase.js").then(({ db, ref, get }) => {
        get(ref(db, `users/${user.uid}/categorias`)).then(snap => {
          if (snap.exists()) {
            const dados = snap.val() || {}
            const listaBanco = Array.isArray(dados)
              ? dados
              : Object.entries(dados).map(([id, item]) => ({ ...item, id }))
            setCategorias(listaBanco)
          } else {
            setCategorias([])
          }
        })
      })
    }
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
            <ProtectedRoute requiredRole="gerente">
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