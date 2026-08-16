import { Navigate, useLocation } from 'react-router';
import { getCurrentUser } from '../utils/auth';

export default function CustomerRoute({ children }) {
  const location = useLocation();
  const user = getCurrentUser();

  if (!user) {
    // send them to login, but remember where they were trying to go
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role === 'admin') {
    // admins only belong on the admin side of the app
    return <Navigate to="/admin" replace />;
  }

  return children;
}