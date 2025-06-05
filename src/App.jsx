/* src/App.jsx */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Desejos from './components/Desejos'
import Ranking from './components/Ranking'
import Cadastros from './components/Cadastros'
import { db, ref, onValue, set } from './firebase'

function App() {
  const [desejos, setDesejos] = useState([])
  const [vendedores, setVendedores] = useState([])
  const [lojas, setLojas] = useState([])
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    onValue(ref(db, 'desejos'), snapshot => {
      const data = snapshot.val() || {}
      const array = Object.entries(data).map(([id, value]) => ({ id, ...value }))
      setDesejos(array)
    })
    onValue(ref(db, 'vendedores'), snapshot => {
      const data = snapshot.val() || {}
      const array = Object.entries(data).map(([id, value]) => ({ id, ...value }))
      setVendedores(array)
    })
    onValue(ref(db, 'lojas'), snapshot => {
      const data = snapshot.val() || {}
      const array = Object.entries(data).map(([id, value]) => ({ id, ...value }))
      setLojas(array)
    })
    onValue(ref(db, 'categorias'), snapshot => {
      const data = snapshot.val() || {}
      const array = Object.entries(data).map(([id, value]) => ({ id, ...value }))
      setCategorias(array)
    })
  }, [])

  return (
    <Router>
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home desejos={desejos} setDesejos={setDesejos} vendedores={vendedores} lojas={lojas} categorias={categorias} />} />
          <Route path="/desejos" element={<Desejos desejos={desejos} setDesejos={setDesejos} />} />
          <Route path="/ranking" element={<Ranking desejos={desejos} />} />
          <Route path="/cadastros" element={<Cadastros vendedores={vendedores} setVendedores={setVendedores} lojas={lojas} setLojas={setLojas} categorias={categorias} setCategorias={setCategorias} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
