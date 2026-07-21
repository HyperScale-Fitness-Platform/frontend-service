import { createBrowserRouter } from 'react-router';
import Layout from '../components/Layout';
import Login from '../features/Login/Login';
import Register from '../features/register/Register';
import CustomerHomePage from '../features/CustomerHomePage/CustomerHomePage';
import AdminBooking from '../features/Booking/AdminBooking';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminMembership from '../features/AdminMembership/AdminMembership';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: 'customerHomePage',
        element: (
          <ProtectedRoute>
            <CustomerHomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute>
            <AdminBooking />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/membership',
        element: (
          <ProtectedRoute>
            <AdminMembership />
          </ProtectedRoute>
        )
      }
    ],
  },
  { path: 'login', element: <Login /> },
  { path: 'register', element: <Register /> },
]);