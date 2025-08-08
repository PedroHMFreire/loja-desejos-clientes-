import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-gray-500 text-sm">
        Carregando...
      </div>
    )
  }

  if (!user) return <Navigate to="/login" />
  if (requiredRole && role !== requiredRole) return <Navigate to="/" />

  return children
}