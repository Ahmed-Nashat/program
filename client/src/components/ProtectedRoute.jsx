import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wrap any route that requires login: <ProtectedRoute><Dashboard /></ProtectedRoute>
// Optionally restrict by role: <ProtectedRoute allowedRoles={['admin']}>...
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Don't make any redirect decision until we've actually checked /auth/me —
  // otherwise a logged-in user gets bounced to /login for a split second
  // on every page refresh.
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
