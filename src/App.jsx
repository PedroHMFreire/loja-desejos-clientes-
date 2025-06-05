import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Desejos from './components/Desejos';
import Ranking from './components/Ranking';
import Cadastros from './components/Cadastros';
import './styles.css';

function App() {
  const [desejos, setDesejos] = useState(
    JSON.parse(localStorage.getItem('desejos')) || []
  );
  const [vendedores, setVendedores] = useState(
    JSON.parse(localStorage.getItem('vendedores')) || ['Ana', 'João']
  );
  const [lojas, setLojas] = useState(
    JSON.parse(localStorage.getItem('lojas')) || ['Loja Centro', 'Loja Shopping']
  );
  const [categorias, setCategorias] = useState(
    JSON.parse(localStorage.getItem('categorias')) || [
      'Camisetas',
      'Calças',
      'Vestidos',
      'Acessórios',
    ]
  );

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
            element={<Desejos desejos={desejos} setDesejos={setDesejos} vendedores={vendedores} lojas={lojas} />}
          />
          <Route
            path="/ranking"
            element={<Ranking desejos={desejos} />}
          />
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
