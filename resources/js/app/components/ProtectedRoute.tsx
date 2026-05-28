import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';

export const ProtectedRoute = () => {
    const { isAuthenticated, isAuthChecking, isGuest, user } = useAppSelector((state) => state.auth);
    const location = useLocation();

    if (isAuthChecking) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    // Guest users can only access /home and /about
    if (isGuest) {
        const guestAllowedRoutes = ['/home', '/about'];
        if (!guestAllowedRoutes.includes(location.pathname)) {
            return <Navigate to="/home" replace />;
        }
        return <Outlet />;
    }

    // Check if profile is completed
    if (!user?.is_profile_completed) {
        const allowedRoutes = ['/profile-setup', '/username-setup'];
        if (!allowedRoutes.includes(location.pathname)) {
            return <Navigate to="/profile-setup" replace />;
        }
    } else {
        if (location.pathname === '/profile-setup') {
            return <Navigate to="/home" replace />;
        }
    }

    return <Outlet />;
};
