import { createBrowserRouter, RouterProvider } from 'react-router';
import Login from './features/Login/Login';
import Register from './features/register/Register';
import CustomerHomePage from './features/CustomerHomePage/CustomerHomePage';
import MembershipPlans from "./features/Membership/MembershipPlans";
import ManageMembership from "./features/Membership/ManageMembership";
import Occupancy from "./features/Occupancy/Occupancy";
import PTPackages from "./features/PTPackages/PTPackages";
import Booking from "./features/Booking/Booking";

const router = createBrowserRouter([
  {
    path: 'login',
    element: <Login />
  },
  {
    path: 'register',
    element: <Register />
  },
  {
    path: '/customerHomePage',
    element: <CustomerHomePage />
  },
  {
    path: '/membership',
    element: <MembershipPlans />
  },

  {
    path: "/manage-membership",
    element: <ManageMembership />
  },
  {
    path: "/occupancy",
    element: <Occupancy />
  },
  {
    path: "/pt-packages",
    element: <PTPackages />
  },
  {
    path: "/booking",
    element: <Booking />
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
