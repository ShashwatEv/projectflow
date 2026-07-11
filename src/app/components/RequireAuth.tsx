import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Fixed import path based on App.tsx

export default function RequireAuth() {
  const { session, loading } = useAuth(); 
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    // 🟢 FIXED: Redirect to '/login', not '/'
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}