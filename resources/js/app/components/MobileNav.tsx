// import { Home, TrendingUp, Users, User, MoreHorizontal } from 'lucide-react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAppSelector } from '@/app/store/hooks';
// import { toast } from 'sonner';
// import { useState } from 'react';

// export function MobileNav() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const isGuest = useAppSelector((state) => state.auth.isGuest);
//   const [showMore, setShowMore] = useState(false);

//   const navItems = [
//     { icon: Home, label: 'Home', path: '/home' },
//     { icon: TrendingUp, label: 'Leaderboard', path: '/leaderboard' },
//     { icon: Users, label: 'Groups', path: '/groups' },
//     { icon: User, label: 'Profile', path: '/profile' },
//     { icon: MoreHorizontal, label: 'More', path: '/more' },
//   ].filter(item => !(isGuest && item.label === 'Leaderboard'));

//   return (
//     <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 bg-background/95">
//       <div className="glass-card border-t border-border/50 rounded-t-3xl px-4 py-3 safe-area-inset-bottom">
//         <div className="flex items-center justify-around">
//           {navItems.map((item) => {
//             const isActive = location.pathname === item.path;
//             const Icon = item.icon;

//             return (
//               <button
//                 key={item.path}
//                 // onClick={() => {
//                 //   if (isGuest && item.label === 'Profile') {
//                 //     toast.info('Please log in to view your profile', {
//                 //       action: { label: 'Log In', onClick: () => navigate('/auth') }
//                 //     });
//                 //     return;
//                 //   }
//                 //   navigate(item.path);
//                 // }}

//                 onClick={() => {
//   if (item.label === "More") {
//     setShowMore(true);
//     return;
//   }

//   if (isGuest && item.label === 'Profile') {
//     toast.info('Please log in to view your profile', {
//       action: { label: 'Log In', onClick: () => navigate('/auth') }
//     });
//     return;
//   }

//   navigate(item.path);
// }}

//                 className="lg:hidden flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200"
//                 style={{
//                   background: isActive ? 'linear-gradient(135deg, #a855f722 0%, #a855f711 100%)' : 'transparent',
//                 }}
//               >
//                 <Icon
//                   size={22}
//                   style={{
//                     color: isActive ? '#a855f7' : '#9ca3af',
//                     strokeWidth: isActive ? 2.5 : 2
//                   }}
//                 />
//                 <span
//                   className="text-xs font-medium"
//                   style={{ color: isActive ? '#a855f7' : '#9ca3af' }}
//                 >
//                   {item.label}
//                 </span>
//               </button>
//             );
//           })}
//         </div>
//       </div>


// {showMore && (
//   <div className="fixed inset-0 z-[60] bg-black/40 md:hidden">
//     <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6">
      
//       <h3 className="font-semibold text-lg mb-4">More</h3>

//       <button
//         onClick={() => {
//           navigate('/about');
//           setShowMore(false);
//         }}
//         className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-muted"
//       >
//         <User size={20} />
//         About Us
//       </button>

//       <button
//         onClick={() => setShowMore(false)}
//         className="w-full mt-4 text-sm text-muted-foreground"
//       >
//         Close
//       </button>

//     </div>
//   </div>
// )}


//     </div>
//   );
// }













import { Home, TrendingUp, Users, User, MoreHorizontal, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { getAuth } from '@/util/api';

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isGuest = useAppSelector((state) => state.auth.isGuest);
  const [showMore, setShowMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (isGuest) return;
    try {
      const res = await getAuth('/api/notifications');
      setUnreadCount(res.unreadCount || 0);
    } catch (e) {
      console.error('Failed to fetch unread count', e);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [isGuest]);

  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: TrendingUp, label: 'Leaderboard', path: '/leaderboard' },
    { icon: Users, label: 'Groups', path: '/groups' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: MoreHorizontal, label: 'More', path: '/more' },
  ].filter(item => !(isGuest && item.label === 'Leaderboard'));

  return (
    <>
      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 bg-background/95">
        <div className="glass-card border-t border-border/50 rounded-t-3xl px-2 py-2 safe-area-inset-bottom">
          
          {/* CHANGE HERE */}
          <div className="grid grid-cols-5 items-center">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    if (item.label === "More") {
                      setShowMore(true);
                      return;
                    }

                    if (isGuest && item.label === 'Profile') {
                      toast.info('Please log in to view your profile', {
                        action: { label: 'Log In', onClick: () => navigate('/auth') }
                      });
                      return;
                    }

                    navigate(item.path);
                  }}
                  className="flex flex-col items-center gap-1 py-2 rounded-xl"
                >
                    <div className="relative">
                      <Icon
                        size={22}
                        style={{
                          color: isActive ? '#a855f7' : '#9ca3af',
                          strokeWidth: isActive ? 2.5 : 2
                        }}
                      />
                      {item.label === 'More' && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-background"></span>
                      )}
                    </div>
                  <span
                    className="text-[11px] font-medium"
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

      {/* More Sheet */}
      {showMore && (
        <div 
          className="fixed inset-0 z-[100] bg-black/40 md:hidden"
          onClick={() => setShowMore(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6"
            onClick={(e)=> e.stopPropagation()}
          >
            <h3 className="font-semibold text-lg mb-4">More</h3>

            <button
              onClick={() => {
                navigate('/notifications');
                setShowMore(false);
              }}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <Bell size={20} />
                <span>Notifications</span>
              </div>
              {unreadCount > 0 && (
                <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                navigate('/about');
                setShowMore(false);
              }}
              className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-muted"
            >
              <User size={20} />
              About Us
            </button>
          </div>
        </div>
      )}
    </>
  );
}