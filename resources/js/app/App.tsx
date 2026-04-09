import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/routes';
import { Toaster } from '@/app/components/ui/sonner';
import { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { checkAuthStatus } from './modules/auth/authSlice';

import { DevGuard } from './components/DevGuard';

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check auth status on app load
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return (
    <>
      <DevGuard>
        <RouterProvider router={router} />
      </DevGuard>
      <Toaster />
    </>
  );
}
