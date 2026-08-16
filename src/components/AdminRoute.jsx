import { Navigate, useLocation } from 'react-router';
import { getCurrentUser } from '../utils/auth';

export default function AdminRoute({ children }) {
  const location = useLocation();
  const user = getCurrentUser();

  if (!user) {
    // send them to login, but remember where they were trying to go
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== 'admin') {
    // logged in, but not an admin — send them to the customer home
    return <Navigate to="/customerHomePage" replace />;
  }

  return children;
}