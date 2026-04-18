import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  const [wasAuthenticated, setWasAuthenticated] = useState(isAuthenticated)

  useEffect(() => {
    if (!loading) {
      if (wasAuthenticated && !isAuthenticated) {
        sessionStorage.setItem('session_expired', 'true')
      }
      setWasAuthenticated(isAuthenticated)
    }
  }, [isAuthenticated, loading, wasAuthenticated])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    const isExpired = sessionStorage.getItem('session_expired') === 'true'
    return (
      <Navigate
        to={`/login${isExpired ? '?expired=true' : ''}`}
        state={{ from: location }}
        replace
      />
    )
  }

  return <Outlet />
}
