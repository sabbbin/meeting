import { lazy } from "react";
import { RouteObject } from "react-router-dom";



const Login = lazy(() => import('./pages/login'));
const Dashboard = lazy(() => import('./pages/dashboard'));
const BaseLayout = lazy(() => import('./pages/baseLayout'));
const User = lazy(() => import('./pages/user'));



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
                element: < User />
            },
        ]
    },

]