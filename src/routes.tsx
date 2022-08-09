import { lazy } from "react";
import { RouteObject } from "react-router-dom";


const Login = lazy(() => import('./pages/login'));
const Dashboard = lazy(() => import('./pages/dashboard'));



export const AppRoutes: RouteObject[] = [

    {
        path: '/',
        element: <Login />
    },
    {
        path: '/dashboard',
        element: <Dashboard />
    }

]