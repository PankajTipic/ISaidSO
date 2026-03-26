import { Outlet, useLocation } from 'react-router-dom';
import { TopNav } from '@/app/components/TopNav';  // adjust path
import { useAppSelector } from '@/app/store/hooks';

export default function AppLayout() {
    const location = useLocation();
    const user = useAppSelector(state => state.auth.user);

    // Hide navbar in these cases:
    // 1. User is admin
    // 2. Currently on /admin or /admin/anything
    const isAdminUser = user?.role?.toLowerCase() === 'admin';
    const isAdminRoute = location.pathname.startsWith('/admin');

    const showTopNav = !isAdminUser && !isAdminRoute;

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Only show normal navbar for regular users & non-admin pages */}
            {showTopNav && <TopNav />}

            {/* Main content – add padding-top if navbar is shown */}
            <main className={showTopNav ? 'pt-16 md:pt-20' : 'pt-0'}>
                <Outlet />
            </main>

            {/* You can add footer, modals, etc. here */}
        </div>
    );
}