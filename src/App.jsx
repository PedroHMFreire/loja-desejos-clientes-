import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Desejos from './components/Desejos';
import Ranking from './components/Ranking';
import Cadastros from './components/Cadastros';
import './styles.css';
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <h1 className="text-4xl sm:text-5xl font-bold text-orange-500 text-center py-4">
          ANOTÊ
        </h1>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/desejos" element={<Desejos />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/cadastros" element={<Cadastros />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;
