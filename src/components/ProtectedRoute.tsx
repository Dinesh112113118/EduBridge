import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/lib/supabase'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && userProfile.role !== requiredRole) {
    // Redirect to appropriate dashboard based on actual role
    const redirectPath = userProfile.role === 'teacher' ? '/teacher' : '/student'
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}