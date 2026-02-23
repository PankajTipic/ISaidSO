import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';

export const ProtectedRoute = () => {
    const { isAuthenticated, isAuthChecking, user } = useAppSelector((state) => state.auth);
    const location = useLocation();

    if (isAuthChecking) {
        // Or a loading spinner
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    // Check if profile is completed
    // Assuming 1 means completed, 0 means not completed (or boolean equivalent)
    if (!user?.is_profile_completed) {
        // If profile is not completed, they can only access /profile-setup or /username-setup
        // Preventing infinite redirect loop
        const allowedRoutes = ['/profile-setup', '/username-setup'];
        if (!allowedRoutes.includes(location.pathname)) {
            return <Navigate to="/profile-setup" replace />;
        }
    } else {
        // If profile IS completed, they shouldn't be on profile-setup usually,
        // but we might want to allow them to edit profile?
        // For now, let's just enforce that incomplete profiles MUST go to setup.
        // And if they are complete, and try to go to setup, maybe redirect to home?
        // User didn't ask for that specifically, but "go to home screen if 1" implies it.
        if (location.pathname === '/profile-setup') {
            return <Navigate to="/home" replace />;
        }
    }

    return <Outlet />;
};
