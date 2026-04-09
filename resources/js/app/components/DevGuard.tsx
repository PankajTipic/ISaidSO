import React, { useState, useEffect, useCallback } from 'react';
import { DeveloperLoginScreen } from '@/app/screens/DeveloperLoginScreen';

interface DevGuardProps {
  children: React.ReactNode;
}

const checkDevAuth = () => sessionStorage.getItem('dev_auth_verified') === 'true';

export const DevGuard: React.FC<DevGuardProps> = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const recheck = useCallback(() => {
    setIsAuthorized(checkDevAuth());
  }, []);

  useEffect(() => {
    // Initial check
    setIsAuthorized(checkDevAuth());

    // Listen to cross-tab storage changes
    window.addEventListener('storage', recheck);

    // Listen to same-tab logout event (dispatched by clearAuthData)
    window.addEventListener('dev-auth-cleared', recheck);

    return () => {
      window.removeEventListener('storage', recheck);
      window.removeEventListener('dev-auth-cleared', recheck);
    };
  }, [recheck]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return <DeveloperLoginScreen onVerified={() => setIsAuthorized(true)} />;
  }

  return <>{children}</>;
};
