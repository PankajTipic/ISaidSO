import { Home, TrendingUp, Users, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function DesktopSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: TrendingUp, label: 'Leaderboard', path: '/leaderboard' },
    { icon: Users, label: 'Groups', path: '/groups' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 h-screen glass-card border-r border-border/50 p-6 fixed left-0 top-0">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#06b6d4] bg-clip-text text-transparent">
          I Said So
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Predict. Vote. Prove it.</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, #a855f722 0%, #a855f711 100%)'
                  : 'transparent',
              }}
            >
              <Icon
                size={20}
                style={{
                  color: isActive ? '#a855f7' : '#9ca3af',
                  strokeWidth: isActive ? 2.5 : 2
                }}
              />
              <span
                className="font-medium"
                style={{ color: isActive ? '#a855f7' : '#9ca3af' }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          © 2026 I Said So
        </p>
      </div>
    </div>
  );
}