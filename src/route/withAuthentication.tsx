import { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';


export interface RequireAuthenticationProps {
    loginPath?: string;
}

export function RequireAuthentication({
    children,
    loginPath = '/login',
}: PropsWithChildren<RequireAuthenticationProps>) {
    let accessToken = localStorage.getItem('access_token')


    if (accessToken)

        return <>{children}</>;

    return <Navigate to={loginPath} replace />;

}

export default RequireAuthentication;