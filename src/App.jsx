import { RouterProvider } from 'react-router';
import { router } from './routes/AppRoutes';
import { connectSocket } from './features/Community/socket.js';

connectSocket();

export default function App() {

  return (
    <RouterProvider router={router} />
  );

}