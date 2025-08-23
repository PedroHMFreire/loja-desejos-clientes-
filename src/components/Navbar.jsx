import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, role, logout } = useAuth()

  const links = (
  <>
    <Link to="/home" className="block px-3 py-2 rounded hover:bg-primary/80">Home</Link>
    <Link to="/desejos" className="block px-3 py-2 rounded hover:bg-primary/80">Desejos</Link>
  <Link to="/cadastros" className="block px-3 py-2 rounded hover:bg-primary/80">Cadastros</Link>
    {user ? (
      <button onClick={logout} className="block px-3 py-2 rounded hover:bg-primary/80 text-left w-full md:w-auto">Sair</button>
    ) : (
      <Link to="/login" className="block px-3 py-2 rounded hover:bg-primary/80">Login</Link>
    )}
  </>
)

  return (
    <nav className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold">Anote.Ai</Link>
          <div className="hidden md:flex space-x-4">{links}</div>
          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Abrir menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 5.25h16.5m-16.5 6h16.5m-16.5 6h16.5"
              />
            </svg>
          </button>
        </div>
        {open && (
          <div className="md:hidden pb-3 space-y-1">
            {links}
          </div>
        )}
      </div>
    </nav>
  )
}