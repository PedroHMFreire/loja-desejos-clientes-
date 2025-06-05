import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Desejos from './components/Desejos'
import Ranking from './components/Ranking'
import Cadastros from './components/Cadastros'

function App() {
  return (
    <Router>
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/desejos" element={<Desejos />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/cadastros" element={<Cadastros />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
