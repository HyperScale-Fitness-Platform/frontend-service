import { createBrowserRouter } from 'react-router';
import Layout from '../components/Layout';
import Login from '../features/Login/Login';
import Register from '../features/register/Register';
import CustomerHomePage from '../features/CustomerHomePage/CustomerHomePage';
import MembershipPlans from '../features/Membership/MembershipPlans';
import ManageMembership from '../features/Membership/ManageMembership';
import Occupancy from '../features/Occupancy/Occupancy';
import PTPackages from '../features/PTPackages/PTPackages';
import Booking from '../features/Booking/Booking';
import Payment from '../features/Payment/Payment';
import AdminBooking from '../features/Admin/AdminBooking/AdminBooking';
import ClassesPage from '../features/Admin/AdminBooking/ClassesPage';
import TrainerManagement from '../features/Admin/TrainerManagement/TrainerManagement'
import AdminMembership from '../features/Admin/AdminMembership/AdminMembership';
import CustomerRoute from '../components/CustomerRoute';
import AdminRoute from '../components/AdminRoute';
import CustomerManagement from '../features/Admin/CustomerManagement/CustomerManagement';
import AdminOccupancy from '../features/Admin/OccupancyManagement/OccupancyManagement';
import ThreadsManagement from '../features/Admin/ThreadsManagement/ThreadsManagement';
import Community from "../features/Community/Community";
import Chat from "../features/Chat/Chat";
import TrainerChats from "../features/Chat/TrainerChats";
// import CommunityModeration from "../features/Admin/CommunityModeration/CommunityModeration";

export const router = createBrowserRouter([

    {
        element: <Layout />,

        children: [

            {
                path: 'customerHomePage',

                element: (
                    <CustomerRoute>
                        <CustomerHomePage />
                    </CustomerRoute>
                ),
            },


            {
                path: 'booking',

                element: (
                    <CustomerRoute>
                        <Booking />
                    </CustomerRoute>
                ),
            },


            {
                path: 'membership',

                element: (
                    <CustomerRoute>
                        <MembershipPlans />
                    </CustomerRoute>
                ),
            },


            {
                path: 'manage-membership',

                element: (
                    <CustomerRoute>
                        <ManageMembership />
                    </CustomerRoute>
                ),
            },

            {
                path: "community",
                element: (
                    <CustomerRoute>
                        <Community />
                    </CustomerRoute>
                ),
            },

            {
                path: 'chat/:otherUserId',

                element: (
                    <CustomerRoute>
                        <Chat />
                    </CustomerRoute>
                ),
            },
            {
                path: 'trainer/chats',

                element: (
                    <CustomerRoute>
                        <TrainerChats />
                    </CustomerRoute>
                ),
            },


            {
                path: 'occupancy',

                element: (
                    <CustomerRoute>
                        <Occupancy />
                    </CustomerRoute>
                ),
            },


            {
                path: 'pt-packages',

                element: (
                    <CustomerRoute>
                        <PTPackages />
                    </CustomerRoute>
                ),
            },


            {
                path: 'payments',

                element: (
                    <CustomerRoute>
                        <Payment />
                    </CustomerRoute>
                ),
            },


            {
                path: 'admin/booking',

                element: (
                    <AdminRoute>
                        <AdminBooking />
                    </AdminRoute>
                ),
            },

            {
                path: 'admin',

                element: (
                    <AdminRoute>
                        <AdminBooking />
                    </AdminRoute>
                ),
            },

            {
                path: 'admin/classes',

                element: (
                    <AdminRoute>
                        <ClassesPage />
                    </AdminRoute>
                ),
            },

            {
                path: 'admin/membership',

                element: (
                    <AdminRoute>
                        <AdminMembership />
                    </AdminRoute>
                ),
            },
            {
                path: 'admin/trainer',

                element: (
                    <AdminRoute>
                        <TrainerManagement />
                    </AdminRoute>
                ),
            },
            {
                path: 'admin/customer',
                element: (
                    <AdminRoute>
                        <CustomerManagement />
                    </AdminRoute>
                ),
            },
            {
                path: 'admin/occupancy',
                element: (
                    <AdminRoute>
                        <AdminOccupancy />
                    </AdminRoute>
                ),
            },
            {
                path: 'admin/threads',
                element: (
                    <AdminRoute>
                        <ThreadsManagement />
                    </AdminRoute>
                ),
            },
            // {
            //     path: "admin/community",
            //     element: (
            //         <CustomerRoute>
            //             <CommunityModeration />
            //         </CustomerRoute>
            //     )
            // },

        ],

    },


    {
        path: 'login',

        element: <Login />,
    },


    {
        path: 'register',

        element: <Register />,
    },

]);