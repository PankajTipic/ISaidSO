import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';

export const PublicRoute = () => {
    const { isAuthenticated, isAuthChecking } = useAppSelector((state) => state.auth);

    if (isAuthChecking) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />;
};
