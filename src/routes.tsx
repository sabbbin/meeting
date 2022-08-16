import { lazy } from "react";
import { RouteObject } from "react-router-dom";




const Login = lazy(() => import('./pages/login'));
const Dashboard = lazy(() => import('./pages/dashboard'));
const BaseLayout = lazy(() => import('./pages/baseLayout'));
const UserTable = lazy(() => import('./Tables/userTable'));
const AgendaTable = lazy(() => import('./Tables/agendaTable'));



export const AppRoutes: RouteObject[] = [

    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/',
        element: <BaseLayout />,
        children: [
            {
                path: '/dashboard',
                element: <Dashboard />
            },
            {
                path: '/userTable',
                element: < UserTable />
            },
            {
                path: '/agendaTable',
                element: < AgendaTable />
            },
        ]
    },

]