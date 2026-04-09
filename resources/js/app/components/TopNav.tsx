import { useState, useRef, useEffect } from 'react';
import { Home, TrendingUp, Users, User, Bell, Search, Plus, Menu, X, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { currentUser } from '@/app/data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { useAppSelector } from '@/app/store/hooks';
import { SearchSuggestions } from './SearchSuggestions';

interface TopNavProps {
  showSearch?: boolean;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
  categories?: { value: string; label: string }[];
  predictions?: any[];
  onCategorySelect?: (category: string) => void;
}

export function TopNav({
  showSearch = false,
  onSearchChange,
  searchQuery = '',
  categories = [],
  predictions = [],
  onCategorySelect
}: TopNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isGuest } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Admin check - hide regular nav for admins
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isAdminPage = location.pathname.startsWith('/admin');

  // Lock body scroll when search is expanded on mobile
  useEffect(() => {
    if (isSearchExpanded && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSearchExpanded]);

  // Handle click outside to collapse search (for desktop)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        if (!searchQuery) {
          setIsSearchExpanded(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);

  if (isAdmin || isAdminPage) {
    return null;
  }

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: TrendingUp, label: 'Leaderboard', path: '/leaderboard' },
    { icon: Users, label: 'Groups', path: '/groups' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: User, label: 'About', path: '/about' },
  ].filter(item => !(isGuest && item.label === 'Leaderboard'));

  return (
    <>
      <div className="sticky top-0 z-50 bg-background border-b border-border/50 md:glass-card md:bg-background/95 backdrop-blur-sm shadow-sm md:shadow-none">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Desktop Nav */}
            <div className={`flex items-center gap-8 transition-opacity duration-300 ${isSearchExpanded ? 'hidden md:flex opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <button
                onClick={() => navigate('/home')}
                className="flex items-center gap-2 shrink-0"
              >
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#06b6d4] bg-clip-text text-transparent">
                  I Said So
                </h1>
              </button>

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

            {/* Desktop Search Center */}
            {showSearch && (
              <div className="hidden md:flex flex-1 justify-center max-w-xl" ref={searchContainerRef}>
                <div className="relative w-full flex justify-end">
                  <AnimatePresence mode="wait">
                    {!isSearchExpanded ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSearchExpanded(true)}
                        className="rounded-full h-10 w-10 flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Search size={20} className="text-muted-foreground" />
                      </Button>
                    ) : (
                      <motion.div
                        initial={{ width: 40, opacity: 0 }}
                        animate={{ width: '100%', opacity: 1 }}
                        exit={{ width: 40, opacity: 0 }}
                        className="flex items-center w-full"
                      >
                        <div className="relative w-full">
                          <Input
                            autoFocus
                            type="text"
                            placeholder="Search everything..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            className="w-full pl-10 pr-10 h-10 bg-muted/50 rounded-full border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-sm font-medium transition-all shadow-sm"
                          />
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                          {searchQuery && (
                            <button 
                              onClick={() => onSearchChange?.('')}
                              className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                            >
                              <X size={14} />
                            </button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSearchExpanded(false)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <X size={16} />
                          </Button>

                          <SearchSuggestions
                            isVisible={isSearchExpanded}
                            query={searchQuery}
                            categories={categories}
                            predictions={predictions}
                            onCategorySelect={(cat) => {
                              onCategorySelect?.(cat);
                              setIsSearchExpanded(false);
                            }}
                            onPredictionSelect={(pid) => {
                              navigate(`/prediction/${pid}`);
                              setIsSearchExpanded(false);
                            }}
                            onClose={() => setIsSearchExpanded(false)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Right Actions */}
            <div className={`flex items-center gap-2 transition-all duration-300 ${isSearchExpanded ? 'md:hidden' : 'flex'}`}>
              {/* Mobile Search Trigger */}
              {showSearch && (
                <div className="md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchExpanded(true)}
                    className="rounded-full h-10 w-10 flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <Search size={20} className="text-muted-foreground" />
                  </Button>
                </div>
              )}

              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="icon" className="glass rounded-full relative h-10 w-10">
                  <Bell size={18} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
                </Button>

                {!isGuest && (
                  <Button
                    className="ml-2 rounded-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] hover:opacity-90 shadow-lg shadow-purple-500/20"
                    onClick={() => navigate('/create')}
                  >
                    <Plus size={18} className="mr-1" />
                    Create
                  </Button>
                )}

                <Avatar
                  className={`w-9 h-9 cursor-pointer ml-2 ring-2 ring-[#a855f7]/30 hover:ring-[#a855f7]/60 transition-all ${isGuest ? 'blur-[3px]' : ''}`}
                  onClick={() => navigate(isGuest ? '/auth' : '/profile')}
                >
                  <AvatarImage src={user?.avatar_url || user?.avatar || currentUser.avatar} alt={user?.username || currentUser.username} />
                  <AvatarFallback>{(user?.username || currentUser.username)?.[0] || '?'}</AvatarFallback>
                </Avatar>
              </div>

              {/* Mobile Menu Button */}
              {/* {!isGuest && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`lg:hidden glass rounded-full h-10 w-10 ${isSearchExpanded ? 'hidden' : 'flex'}`}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </Button>
              )} */}
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown (moved inside for correct positioning) */}
        {/* <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden absolute top-full left-0 right-0 z-40 bg-background border-b border-border shadow-2xl overflow-hidden"
            >
              <div className="p-4 space-y-2 max-h-[80vh] overflow-y-auto">
                <div
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border cursor-pointer hover:bg-accent/50 mb-2"
                  onClick={() => {
                    navigate('/profile');
                    setMobileMenuOpen(false);
                  }}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user?.avatar_url || user?.avatar || currentUser.avatar} alt={user?.username || currentUser.username} />
                    <AvatarFallback>{(user?.username || currentUser.username)?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className={`font-semibold text-foreground ${isGuest ? 'blur-[4px] select-none' : ''}`}>{user?.username || currentUser.username}</p>
                    <p className="text-xs text-muted-foreground">Level {currentUser.level} • {currentUser.accuracy}% accurate</p>
                  </div>
                </div>

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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                        ? 'bg-gradient-to-r from-[#a855f7]/20 to-[#ec4899]/10 text-[#a855f7]'
                        : 'text-muted-foreground hover:bg-muted/50'
                        }`}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  );
                })}

                <div className="pt-2 mt-2 border-t border-border/50">
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-[#a855f7] to-[#ec4899] shadow-lg shadow-purple-500/20"
                    onClick={() => {
                      navigate('/create');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Plus size={18} className="mr-2" />
                    Create New
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence> */}
      </div>

      {/* ==================== FULL SCREEN MOBILE SEARCH OVERLAY ==================== */}
      <AnimatePresence>
        {isSearchExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-white flex flex-col md:hidden"
          >
            {/* Mobile Search Header */}
            <div className="flex items-center h-16 px-4 border-b border-border/60 bg-white shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSearchExpanded(false)} 
                className="rounded-full h-10 w-10 hover:bg-muted/50 mr-3"
              >
                <ArrowLeft size={24} className="text-foreground" />
              </Button>

              <div className="relative flex-1">
                <Input
                  autoFocus
                  type="text"
                  placeholder="Search everything..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full pl-4 pr-10 h-11 bg-muted/50 rounded-2xl border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-base font-medium shadow-sm"
                />
                {searchQuery && (
                  <button 
                    onClick={() => onSearchChange?.('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground bg-muted/80 rounded-full"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSearchExpanded(false)} 
                className="rounded-full h-10 w-10 hover:bg-muted/50 ml-2"
              >
                <X size={22} className="text-muted-foreground" />
              </Button>
            </div>

            {/* Scrollable Search Suggestions Area */}
            <div className="flex-1 overflow-y-auto bg-white">
              {searchQuery.trim() ? (
                <SearchSuggestions
                  isVisible={true}
                  query={searchQuery}
                  categories={categories}
                  predictions={predictions}
                  isMobileOverlay={true}
                  onCategorySelect={(cat) => {
                    onCategorySelect?.(cat);
                    setIsSearchExpanded(false);
                    onSearchChange?.('');
                  }}
                  onPredictionSelect={(pid) => {
                    navigate(`/prediction/${pid}`);
                    setIsSearchExpanded(false);
                    onSearchChange?.('');
                  }}
                  onClose={() => setIsSearchExpanded(false)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-20 h-20 rounded-full bg-muted/40 flex items-center justify-center mb-6">
                    <Search size={48} className="text-muted-foreground/30" />
                  </div>
                  <p className="text-2xl font-semibold text-foreground mb-2">What are you looking for?</p>
                  <p className="text-muted-foreground max-w-[260px]">
                    Search predictions, categories, or users
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}