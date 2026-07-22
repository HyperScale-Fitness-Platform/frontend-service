import { createBrowserRouter } from 'react-router';
import Layout from '../components/Layout';
import Login from '../features/Login/Login';
import Register from '../features/register/Register';
import CustomerHomePage from '../features/CustomerHomePage/CustomerHomePage';
import MembershipPlans from '../features/Membership/MembershipPlans';
import ManageMembership from '../features/Membership/ManageMembership';
import Occupancy from '../features/Occupancy/Occupancy';
import PTPackages from '../features/PTPackages/PTPackages';
import AdminBooking from '../features/Booking/AdminBooking';
import AdminMembership from '../features/AdminMembership/AdminMembership';
import ProtectedRoute from '../components/ProtectedRoute';


export const router = createBrowserRouter([

  {
    element: <Layout />,

    children: [

      {
        path: '/customerHomePage',

        element: (
          <ProtectedRoute>
            <CustomerHomePage />
          </ProtectedRoute>
        ),

      },


      {
        path: '/membership',

        element: (
          <ProtectedRoute>
            <MembershipPlans />
          </ProtectedRoute>
        ),

      },


      {
        path: '/manage-membership',

        element: (
          <ProtectedRoute>
            <ManageMembership />
          </ProtectedRoute>
        ),

      },


      {
        path: '/occupancy',

        element: (
          <ProtectedRoute>
            <Occupancy />
          </ProtectedRoute>
        ),

      },


      {
        path: '/pt-packages',

        element: (
          <ProtectedRoute>
            <PTPackages />
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
        path: '/admin/membership',

        element: (
          <ProtectedRoute>
            <AdminMembership />
          </ProtectedRoute>
        ),

      },

    ],

  },


  {
    path: '/login',
    element: <Login />,
  },


  {
    path: '/register',
    element: <Register />,
  },


]);