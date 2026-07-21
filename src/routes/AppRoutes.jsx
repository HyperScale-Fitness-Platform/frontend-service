import { createBrowserRouter } from 'react-router';
import Layout from '../components/Layout';
import Login from '../features/Login/Login';
import Register from '../features/register/Register';
import CustomerHomePage from '../features/CustomerHomePage/CustomerHomePage';
import AdminBooking from '../features/Booking/AdminBooking';
import ProtectedRoute from '../components/ProtectedRoute';

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
        path: 'admin',
        element: (
          <ProtectedRoute>
            <AdminBooking />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: 'login', element: <Login /> },
  { path: 'register', element: <Register /> },
]);