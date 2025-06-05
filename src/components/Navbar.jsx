import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-[#f97316] p-4 flex gap-4">
      <Link to="/" className="font-bold text-white">Home</Link>
      <Link to="/desejos" className="text-white">Desejos</Link>
      <Link to="/ranking" className="text-white">Ranking</Link>
      <Link to="/cadastros" className="text-white">Cadastros</Link>
    </nav>
  )
}
