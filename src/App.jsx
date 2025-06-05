import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Desejos from './components/Desejos';
import Ranking from './components/Ranking';
import Cadastros from './components/Cadastros';
import './styles.css';

function App() {
  const [desejos, setDesejos] = useState(() => {
    const saved = localStorage.getItem('desejos');
    return saved ? JSON.parse(saved) : [];
  });
  const [vendedores, setVendedores] = useState(() => {
    const saved = localStorage.getItem('vendedores');
    return saved ? JSON.parse(saved) : [];
  });
  const [lojas, setLojas] = useState(() => {
    const saved = localStorage.getItem('lojas');
    return saved ? JSON.parse(saved) : [];
  });
  const [categorias, setCategorias] = useState(() => {
    const saved = localStorage.getItem('categorias');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('desejos', JSON.stringify(desejos));
    localStorage.setItem('vendedores', JSON.stringify(vendedores));
    localStorage.setItem('lojas', JSON.stringify(lojas));
    localStorage.setItem('categorias', JSON.stringify(categorias));
  }, [desejos, vendedores, lojas, categorias]);

  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <h1 className="text-4xl sm:text-5xl font-bold text-orange-500 text-center py-4">
          ANOTÊ
        </h1>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <Home
                desejos={desejos}
                setDesejos={setDesejos}
                vendedores={vendedores}
                lojas={lojas}
                categorias={categorias}
              />
            }
          />
          <Route
            path="/desejos"
            element={
              <Desejos desejos={desejos} setDesejos={setDesejos} vendedores={vendedores} lojas={lojas} />
            }
          />
          <Route path="/ranking" element={<Ranking desejos={desejos} />} />
          <Route
            path="/cadastros"
            element={
              <Cadastros
                vendedores={vendedores}
                setVendedores={setVendedores}
                lojas={lojas}
                setLojas={setLojas}
                categorias={categorias}
                setCategorias={setCategorias}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
