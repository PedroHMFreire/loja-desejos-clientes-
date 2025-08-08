import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Desejos from './components/Desejos'
import Cadastros from './components/Cadastros'
import Login from './components/Login'
import ProtectedRoute from './components/ProtectedRoute'
import { db, ref, set, get } from './firebase'
import { useAuth } from './contexts/AuthContext'
import CadastroAmbiente from './components/CadastroAmbiente'

function getAmbienteId() {
  return localStorage.getItem('ldc_ambienteId')
}

function getStorageKey(base) {
  const ambienteId = getAmbienteId()
  return ambienteId ? `${base}_${ambienteId}` : base
}

function App() {
  const { user, loading, ambienteId } = useAuth()

  // Estados dos dados principais
  const [desejos, setDesejos] = useState([])
  const [vendedores, setVendedores] = useState([])
  const [lojas, setLojas] = useState([])
  const [categorias, setCategorias] = useState([])

  // Carrega dados do Firebase ao logar ou trocar de ambiente
  useEffect(() => {
    async function carregarDados() {
      if (!ambienteId) return
      // Busca dados do ambiente no Firebase
      const desejosSnap = await get(ref(db, `ambientes/${ambienteId}/desejos`))
      const vendedoresSnap = await get(ref(db, `ambientes/${ambienteId}/vendedores`))
      const lojasSnap = await get(ref(db, `ambientes/${ambienteId}/lojas`))
      const categoriasSnap = await get(ref(db, `ambientes/${ambienteId}/categorias`))

      setDesejos(desejosSnap.exists() ? desejosSnap.val() : [])
      setVendedores(vendedoresSnap.exists() ? vendedoresSnap.val() : [])
      setLojas(lojasSnap.exists() ? lojasSnap.val() : [])
      setCategorias(categoriasSnap.exists() ? categoriasSnap.val() : [])
    }
    carregarDados()
  }, [ambienteId])

  // Salva no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem(getStorageKey('ldc_desejos'), JSON.stringify(desejos))
  }, [desejos, ambienteId])
  useEffect(() => {
    localStorage.setItem(getStorageKey('ldc_vendedores'), JSON.stringify(vendedores))
  }, [vendedores, ambienteId])
  useEffect(() => {
    localStorage.setItem(getStorageKey('ldc_lojas'), JSON.stringify(lojas))
  }, [lojas, ambienteId])
  useEffect(() => {
    localStorage.setItem(getStorageKey('ldc_categorias'), JSON.stringify(categorias))
  }, [categorias, ambienteId])

  // Backup automático para o Firebase (por ambiente)
  useEffect(() => {
    if (user && ambienteId) set(ref(db, `ambientes/${ambienteId}/desejos`), desejos)
  }, [desejos, user, ambienteId])
  useEffect(() => {
    if (user && ambienteId) set(ref(db, `ambientes/${ambienteId}/vendedores`), vendedores)
  }, [vendedores, user, ambienteId])
  useEffect(() => {
    if (user && ambienteId) set(ref(db, `ambientes/${ambienteId}/lojas`), lojas)
  }, [lojas, user, ambienteId])
  useEffect(() => {
    if (user && ambienteId) set(ref(db, `ambientes/${ambienteId}/categorias`), categorias)
  }, [categorias, user, ambienteId])

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
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={
            <CadastroAmbiente onCadastro={() => window.location.href = "/home"} />
          } />
          <Route path="/home" element={
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
              <Cadastros
                vendedores={vendedores}
                setVendedores={setVendedores}
                lojas={lojas}
                setLojas={setLojas}
                categorias={categorias}
                setCategorias={setCategorias}
              />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App