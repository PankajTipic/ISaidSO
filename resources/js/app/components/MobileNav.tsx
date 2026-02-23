import { Home, TrendingUp, Users, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: TrendingUp, label: 'Leaderboard', path: '/leaderboard' },
    { icon: Users, label: 'Groups', path: '/groups' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden z-50">
      <div className="glass-card border-t border-border/50 rounded-t-3xl px-4 py-3 safe-area-inset-bottom">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200"
                style={{
                  background: isActive ? 'linear-gradient(135deg, #a855f722 0%, #a855f711 100%)' : 'transparent',
                }}
              >
                <Icon
                  size={22}
                  style={{
                    color: isActive ? '#a855f7' : '#9ca3af',
                    strokeWidth: isActive ? 2.5 : 2
                  }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: isActive ? '#a855f7' : '#9ca3af' }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}