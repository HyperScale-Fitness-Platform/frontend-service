import { Navigate, useLocation } from 'react-router';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('customerToken');
  const location = useLocation();

  if (!token) {
    // send them to login, but remember where they were trying to go
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}