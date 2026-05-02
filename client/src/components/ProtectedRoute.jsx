import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth();

  console.log('ProtectedRoute check:', { user: !!user, profile, requiredRole, loading });

  if (loading) {
    return <LoadingSpinner size="large" text="Loading..." fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    console.log('Role check failed:', { requiredRole, userRole: profile?.role, profile });
    return <Navigate to={profile?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  console.log('Role check passed, rendering children');
  return children;
}
