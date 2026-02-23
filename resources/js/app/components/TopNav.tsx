import { useState } from 'react';
import { Home, TrendingUp, Users, User, Bell, Search, Moon, Sun, Menu, X, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { currentUser } from '@/app/data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { useAppSelector } from '@/app/store/hooks';

interface TopNavProps {
  showSearch?: boolean;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export function TopNav({ showSearch = false, onSearchChange, searchQuery = '' }: TopNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: TrendingUp, label: 'Leaderboard', path: '/leaderboard' },
    { icon: Users, label: 'Groups', path: '/groups' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: User, label: 'About', path: '/about' },
  ];

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Main Nav Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Desktop Nav */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <button
                onClick={() => navigate('/home')}
                className="flex items-center gap-2 shrink-0"
              >
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#06b6d4] bg-clip-text text-transparent">
                  I Said So
                </h1>
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                          ? 'bg-gradient-to-r from-[#a855f7]/20 to-[#ec4899]/10 text-[#a855f7]'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        }`}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="glass rounded-full"
                  onClick={toggleTheme}
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="glass rounded-full relative"
                >
                  <Bell size={18} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-neon-pink rounded-full"></span>
                </Button>

                <Button
                  className="ml-2 rounded-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] hover:opacity-90"
                  onClick={() => navigate('/create')}
                >
                  <Plus size={18} className="mr-1" />
                  Create
                </Button>

                <Avatar
                  className="w-9 h-9 cursor-pointer ml-2 ring-2 ring-[#a855f7]/30 hover:ring-[#a855f7]/60 transition-all"
                  onClick={() => navigate('/profile')}
                >
                  <AvatarImage src={user?.avatar_url || user?.avatar || currentUser.avatar} alt={user?.username || currentUser.username} />
                  <AvatarFallback>{(user?.username || currentUser.username)[0]}</AvatarFallback>
                </Avatar>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden glass rounded-full"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>

          {/* Search Bar (if enabled) */}
          {showSearch && (
            <div className="mt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  type="text"
                  placeholder="Search predictions..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10 glass-card"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden fixed top-[64px] left-0 right-0 z-40 glass-card border-b border-border/50 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {/* Profile Section */}
              <div
                className="flex items-center gap-3 p-3 rounded-lg glass-card cursor-pointer hover:bg-accent/50"
                onClick={() => {
                  navigate('/profile');
                  setMobileMenuOpen(false);
                }}
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user?.avatar_url || user?.avatar || currentUser.avatar} alt={user?.username || currentUser.username} />
                  <AvatarFallback>{(user?.username || currentUser.username)[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user?.username || currentUser.username}</p>
                  <p className="text-sm text-muted-foreground">Level {currentUser.level} • {currentUser.accuracy}% accurate</p>
                </div>
              </div>

              {/* Nav Items */}
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                        ? 'bg-gradient-to-r from-[#a855f7]/20 to-[#ec4899]/10 text-[#a855f7]'
                        : 'text-muted-foreground hover:bg-accent/50'
                      }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}

              {/* Mobile Actions */}
              <div className="pt-2 mt-2 border-t border-border/50 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={toggleTheme}
                >
                  {isDark ? <Sun size={18} className="mr-3" /> : <Moon size={18} className="mr-3" />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </Button>

                <Button
                  className="w-full bg-gradient-to-r from-[#a855f7] to-[#ec4899]"
                  onClick={() => {
                    navigate('/create');
                    setMobileMenuOpen(false);
                  }}
                >
                  <Plus size={18} className="mr-2" />
                  Create Prediction
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
