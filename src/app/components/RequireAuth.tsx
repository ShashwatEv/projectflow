import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RequireAuth() {
  // 1. Get 'session' and 'loading' from context (not isAuthenticated)
  const { session, loading } = useAuth(); 
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 2. Check if session is null. If it is, the user is NOT logged in.
  if (!session) {
    // Redirect them to the /login page (root path '/')
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 3. If session exists, render the protected page
  return <Outlet />;
}