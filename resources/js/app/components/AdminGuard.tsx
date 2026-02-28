// import { Navigate, Outlet } from 'react-router-dom';
// import { useAppSelector } from '@/app/store/hooks';

// export const AdminGuard = () => {
//     const { user, isAuthenticated, isAuthChecking } = useAppSelector((state) => state.auth);

//     if (isAuthChecking) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-background">
//                 <div className="flex flex-col items-center gap-4">
//                     <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
//                     <p className="text-sm font-medium text-muted-foreground animate-pulse">Verifying Administration Access...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (!isAuthenticated || user?.role !== 'admin') {
//         return <Navigate to="/home" replace />;
//     }

//     return <Outlet />;
// };

// AdminGuard.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';

export const AdminGuard = () => {
  const { user, isAuthenticated, isAuthChecking } = useAppSelector((state) => state.auth);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-purple-400 font-medium animate-pulse">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated at all → send to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Authenticated but not admin → send to home
  const isAdmin = (user?.role || '').toLowerCase().trim() === 'admin';

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  // Is admin → render child routes
  return <Outlet />;
};