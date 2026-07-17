import { createBrowserRouter, RouterProvider } from 'react-router';
import Login from './features/Login/Login';
import Register from './features/register/Register';
import CustomerHomePage from './features/CustomerHomePage/CustomerHomePage';

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
    path: 'customerHomePage',
    element: <CustomerHomePage />
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}