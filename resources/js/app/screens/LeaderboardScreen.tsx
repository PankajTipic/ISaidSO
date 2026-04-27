
// import { useState, useEffect, useMemo } from 'react';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
// import { MobileNav } from '@/app/components/MobileNav';
// import { TopNav } from '@/app/components/TopNav';
// import { Trophy, TrendingUp } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { toast } from 'sonner';
// import { getAuth } from '@/util/api';
// import { useAppSelector } from '@/app/store/hooks';

// export function LeaderboardScreen() {
//   const [selectedTab, setSelectedTab] = useState('global');
//   const [selectedCategory, setSelectedCategory] = useState<string | number>('All');
//   const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
//   const [userStanding, setUserStanding] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [dbCategories, setDbCategories] = useState<any[]>([]);

//   const currentUser = useAppSelector((state) => state.auth.user);
//   const currentUserId = currentUser?.id;

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await getAuth('/api/fields');
//         const data = res.data ?? res;
//         if (Array.isArray(data)) {
//           setDbCategories(data);
//         } else if (data && Array.isArray(data.data)) {
//           setDbCategories(data.data);
//         }
//       } catch (err) {
//         console.error('Failed to load fields', err);
//       }
//     };
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     const fetchLeaderboard = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const catQuery = selectedCategory !== 'All' ? `&category_id=${selectedCategory}` : '';

//         // Fetch Leaderboard
//         const response = await getAuth(`/api/leaderboard?location_scope=${selectedTab}${catQuery}`);
//         const data = response.data ?? response;
//         const list = Array.isArray(data) ? data : data.data ?? [];

//         // Sanitize accuracy (0–100)
//         const sanitized = list.map((item: any) => ({
//           ...item,
//           accuracy: Math.min(100, Math.max(0, Number(item.accuracy) || 0)),
//         }));

//         setLeaderboardData(sanitized);

//         // Fetch User Standing
//         const standingRes = await getAuth(`/api/leaderboard/my-standing?location_scope=${selectedTab}${catQuery}`);
//         if (standingRes.data) {
//           setUserStanding(standingRes.data);
//         }
//       } catch (err: any) {
//         console.error('Leaderboard fetch error:', err);
//         setError(err.message || 'Failed to load leaderboard');
//         toast.error('Could not load leaderboard');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLeaderboard();
//   }, [selectedTab, selectedCategory]);

//   const getRankMedal = (rank: number) => {
//     if (rank === 1) return '🥇';
//     if (rank === 2) return '🥈';
//     if (rank === 3) return '🥉';
//     return rank;
//   };

//   const getRankColor = (rank: number) => {
//     if (rank === 1) return '#fbbf24';
//     if (rank === 2) return '#9ca3af';
//     if (rank === 3) return '#d97706';
//     return '#6b7280';
//   };

//   const fullList = leaderboardData;

//   return (
//     <div className="min-h-screen bg-background pb-24 md:pb-6">
//       <TopNav />

//       <div className="max-w-4xl mx-auto px-4 py-6">
//         {/* Header */}
//         <div className="mb-6 text-center md:text-left">
//           <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center md:justify-start gap-3">
//             <Trophy size={32} className="text-[#fbbf24]" />
//             Leaderboard
//           </h1>
//         </div>

//         <div className="flex justify-center mb-6">
//           <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full max-w-md">
//             <TabsList className="glass-card w-full max-w-md justify-center rounded-2xl p-1.5">
//               <TabsTrigger
//                 value="global"
//                 className="flex-1 h-10 md:h-11 rounded-xl text-xs md:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted transition-all"
//               >
//                 Global
//               </TabsTrigger>
//               <TabsTrigger
//                 value="country"
//                 className="flex-1 h-10 md:h-11 rounded-xl text-xs md:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted transition-all"
//               >
//                 Country
//               </TabsTrigger>
//               <TabsTrigger
//                 value="city"
//                 className="flex-1 h-10 md:h-11 rounded-xl text-xs md:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted transition-all"
//               >
//                 City
//               </TabsTrigger>
//             </TabsList>
//           </Tabs>
//         </div>

//         {/* Category Filter */}
//         {dbCategories.length > 0 && (
//           <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 mb-6 justify-start md:justify-center">
//             <button
//               onClick={() => setSelectedCategory('All')}
//               className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
//                 selectedCategory === 'All'
//                   ? 'bg-[#a855f7] text-white shadow-lg shadow-[#a855f7]/30'
//                   : 'glass-card text-muted-foreground hover:bg-muted/50'
//               }`}
//             >
//               All Categories
//             </button>
//             {dbCategories.map(cat => (
//               <button
//                 key={cat.id}
//                 onClick={() => setSelectedCategory(cat.id)}
//                 className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
//                   selectedCategory === cat.id 
//                     ? 'bg-[#a855f7] text-white shadow-lg shadow-[#a855f7]/30' 
//                     : 'glass-card text-muted-foreground hover:bg-muted/50'
//                 }`}
//               >
//                 {cat.fields}
//               </button>
//             ))}
//           </div>
//         )}


//         {/* User Info */}
//         {/* User Info / Your Standing Area */}
//         {userStanding && (
//           <motion.div
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             className="mb-6"
//           >
//             {userStanding.total_predictions > 0 ? (
//               /* Case 1: User has made predictions (Ranked or In Progress) */
//               <div className="rounded-[2rem] border border-white/20 p-5 md:p-6 shadow-2xl flex items-center justify-between bg-gradient-to-br from-[#a855f7] via-[#8b5cf6] to-[#7c3aed] text-white relative overflow-hidden group">
//                 {/* Decorative Background Elements */}
//                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
//                 <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

//                 <div className="flex items-center gap-4 md:gap-6 relative z-10">
//                   <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white shadow-inner flex items-center justify-center text-[#8b5cf6] font-black text-xl md:text-2xl transform revolve-3d group-hover:scale-105 transition-transform">
//                     {userStanding.rank ? `#${userStanding.rank}` : '?'}
//                   </div>
//                   <div>
//                     <p className="text-[10px] md:text-xs uppercase font-black text-white/80 leading-none mb-1.5 tracking-[0.2em]">
//                       {userStanding.rank ? 'Your Global Standing' : 'Ranking in Progress'}
//                     </p>
//                     <h2 className="font-black text-xl md:text-2xl text-white tracking-tight">
//                       {userStanding.rank
//                         ? `Ranked #${userStanding.rank} Globally`
//                         : `${10 - userStanding.total_predictions} more for ranking`}
//                     </h2>
//                   </div>
//                 </div>

//                 <div className="text-right relative z-10">
//                   <p className="text-3xl md:text-4xl font-black text-white leading-none tracking-tighter">
//                     {userStanding.score}
//                   </p>
//                   <p className="text-[10px] md:text-xs text-white/80 font-black mt-2 uppercase tracking-widest">
//                     Weighted Pts
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               /* Case 2: User has 0 predictions - "Start your journey" CTA */
//               <div className="rounded-[2rem] border border-white/20 p-5 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-[#a855f7] via-[#8b5cf6] to-[#7c3aed] text-white relative overflow-hidden group gap-4 md:gap-0">
//                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
//                 <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

//                 <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full md:w-auto">
//                   <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white shadow-inner flex items-center justify-center text-[#8b5cf6] group-hover:scale-105 transition-transform flex-shrink-0">
//                     <TrendingUp size={32} strokeWidth={3} />
//                   </div>
//                   <div className="text-left flex-1">
//                     <h2 className="font-black text-lg md:text-xl text-white leading-tight mb-1">
//                       Start your prediction journey if you want to vote
//                     </h2>
//                     <p className="text-[10px] md:text-xs text-white/80 font-bold uppercase tracking-wider">
//                       Make your first prediction to be ranked
//                     </p>
//                   </div>
//                 </div>
                
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => window.location.href = '/'}
//                   className="relative z-10 w-full md:w-auto px-6 py-3 bg-white text-[#8b5cf6] rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
//                 >
//                   Start Predicting
//                 </motion.button>
//               </div>
//             )}
//           </motion.div>
//         )}


//         {loading ? (
//           <div className="text-center py-16">
//             <p className="text-muted-foreground animate-pulse text-lg">Loading leaderboard...</p>
//           </div>
//         ) : error ? (
//           <div className="text-center py-16 text-red-400">
//             <p className="text-lg">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="mt-6 px-8 py-3 bg-primary text-white rounded-xl text-lg"
//             >
//               Retry
//             </button>
//           </div>
//         ) : leaderboardData.length === 0 ? (
//           <div className="text-center py-16 text-muted-foreground px-6">
//             <p className="text-lg mb-2 italic">No rankings yet</p>
//             <p className="text-sm opacity-70">Need 10+ predictions and 5+ avg votes to qualify for the global leaderboard.</p>
//           </div>
//         ) : (
//           <>

//             {/* Full Leaderboard List */}
//             <motion.div
//               className="space-y-3 md:space-y-4"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.2 }}
//             >
//               {fullList.map((entry, index) => {
//                 const rank = selectedCategory === 'All' ? (entry.rank || index + 1) : index + 1;
//                 const medal = getRankMedal(rank);
//                 const rankColor = getRankColor(rank);
//                 const isCurrentUser = entry.user_id === currentUserId;

//                 return (
//                   <motion.div
//                     key={entry.user_id}
//                     className={`glass-card rounded-xl md:rounded-2xl p-4 flex items-center gap-3 md:gap-4 transition-all ${isCurrentUser ? 'ring-2 ring-[#a855f7] bg-gradient-to-r from-[#a855f711] to-transparent' : ''
//                       }`}
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: index * 0.03 }}
//                   >
//                     {/* Rank */}
//                     <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 flex-shrink-0 rounded-full bg-muted border border-border">
//                       {medal ? (
//                         <span className="text-xl md:text-2xl">{medal}</span>
//                       ) : (
//                         <span className="text-base md:text-xl font-bold" style={{ color: rankColor }}>
//                           {rank}
//                         </span>
//                       )}
//                     </div>

//                     {/* Avatar */}
//                     <Avatar className="w-10 h-10 md:w-12 md:h-12 border border-white/10">
//                       <AvatarImage src={entry.user?.avatar_url} alt={entry.user?.name} />
//                       <AvatarFallback className="bg-primary/10 text-primary font-bold">
//                         {entry.user?.name?.[0] || '?'}
//                       </AvatarFallback>
//                     </Avatar>

//                     {/* User Info */}
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2">
//                         <p className="font-bold text-sm md:text-base truncate">
//                           {entry.user?.name || 'Anonymous User'}
//                         </p>
//                         {isCurrentUser && (
//                           <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-[#a855f7]/20 text-[#a855f7] font-black uppercase">
//                             You
//                           </span>
//                         )}
//                       </div>
//                       <p className="text-[10px] text-muted-foreground font-medium truncate">
//                         {entry.accuracy?.toFixed(1)}% Accuracy • {entry.total_predictions} Preds
//                       </p>
//                     </div>

//                     {/* Score Display */}
//                     <div className="flex flex-col items-end text-right min-w-[60px]">
//                       <div className="flex items-center gap-1.5">
//                         <TrendingUp size={14} className="text-[#a855f7]" />
//                         <span className="font-black text-xl md:text-2xl text-foreground">
//                           {entry.score}
//                         </span>
//                       </div>
//                       <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">
//                         Pts
//                       </div>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </motion.div>

//           </>
//         )}
//       </div>

//       {/* Floating User Standing Footer */}
//       {/* {userStanding && (
//         <div className="fixed bottom-[72px] left-0 right-0 z-30 px-4 md:hidden">
//           <motion.div 
//             initial={{ y: 50, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             className="max-w-md mx-auto rounded-2xl border border-white/20 p-4 shadow-2xl flex items-center justify-between bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white"
//           >
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#a855f7] font-bold text-lg">
//                 #{userStanding.rank}
//               </div>
//               <div>
//                 <p className="text-[10px] uppercase font-black text-white/70 leading-none mb-1 tracking-wider">Your Standing</p>
//                 <p className="font-bold text-white">Ranked #{userStanding.rank} Globally</p>
//               </div>
//             </div>
//             <div className="text-right">
//               <p className="text-2xl font-black text-white leading-none">{Number(userStanding.accuracy)?.toFixed(1)}%</p>
//               <p className="text-[10px] text-white/70 font-bold mt-1 uppercase tracking-tight">Accuracy</p>
//             </div>
//           </motion.div>
//         </div>
//       )} */}

//       {/* Desktop Fixed Standing (Optional but nice) */}
//       {userStanding && (
//         <div className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-30 px-4 w-full max-w-2xl">
//           <motion.div
//             initial={{ y: 50, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             className="rounded-2xl border border-white/20 p-4 shadow-2xl flex items-center justify-between bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white"
//           >
//             {/* Same content as mobile but wider */}
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#a855f7] font-black text-xl">
//                 #{userStanding.rank}
//               </div>
//               <div>
//                 <p className="text-xs uppercase font-black text-white/70 mb-1 tracking-widest">Your Standing</p>
//                 <p className="text-lg font-bold text-white">You are ranked #{userStanding.rank} in this category</p>
//               </div>
//             </div>
//             <div className="text-right">
//               <p className="text-3xl font-black text-white">{Number(userStanding.accuracy)?.toFixed(1)}%</p>
//               <p className="text-xs text-white/70 font-bold uppercase tracking-wider">Prediction Accuracy</p>
//             </div>
//           </motion.div>
//         </div>
//       )}

//       <MobileNav />
//     </div>
//   );
// }











import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { MobileNav } from '@/app/components/MobileNav';
import { TopNav } from '@/app/components/TopNav';
import { Trophy, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getAuth } from '@/util/api';
import { useAppSelector } from '@/app/store/hooks';

export function LeaderboardScreen() {
  const [selectedTab, setSelectedTab] = useState('global');
  const [selectedCategory, setSelectedCategory] = useState<string | number>('All');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [userStanding, setUserStanding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  const currentUser = useAppSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAuth('/api/fields');
        const data = res.data ?? res;
        if (Array.isArray(data)) {
          setDbCategories(data);
        } else if (data && Array.isArray(data.data)) {
          setDbCategories(data.data);
        }
      } catch (err) {
        console.error('Failed to load fields', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const catQuery = selectedCategory !== 'All' ? `&category_id=${selectedCategory}` : '';

        const response = await getAuth(`/api/leaderboard?location_scope=${selectedTab}${catQuery}`);
        const data = response.data ?? response;
        const list = Array.isArray(data) ? data : data.data ?? [];

        const sanitized = list.map((item: any) => ({
          ...item,
          accuracy: Math.min(100, Math.max(0, Number(item.accuracy) || 0)),
        }));

        setLeaderboardData(sanitized);

        const standingRes = await getAuth(`/api/leaderboard/my-standing?location_scope=${selectedTab}${catQuery}`);
        if (standingRes.data) {
          setUserStanding(standingRes.data);
        }
      } catch (err: any) {
        console.error('Leaderboard fetch error:', err);
        setError(err.message || 'Failed to load leaderboard');
        toast.error('Could not load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedTab, selectedCategory]);

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#fbbf24';
    if (rank === 2) return '#9ca3af';
    if (rank === 3) return '#d97706';
    return '#6b7280';
  };

  const fullList = leaderboardData;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <TopNav />

      <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6">

        {/* Header */}
        <div className="mb-4 md:mb-6 text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-bold flex items-center justify-center md:justify-start gap-2">
            <Trophy size={24} className="text-[#fbbf24] md:hidden" />
            <Trophy size={32} className="text-[#fbbf24] hidden md:block" />
            Leaderboard
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-4 md:mb-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full max-w-md">
            <TabsList className="glass-card w-full max-w-md justify-center rounded-xl md:rounded-2xl p-1">
              <TabsTrigger
                value="global"
                className="flex-1 h-8 md:h-11 rounded-lg md:rounded-xl text-xs md:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted transition-all"
              >
                Global
              </TabsTrigger>
              <TabsTrigger
                value="country"
                className="flex-1 h-8 md:h-11 rounded-lg md:rounded-xl text-xs md:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted transition-all"
              >
                Country
              </TabsTrigger>
              <TabsTrigger
                value="city"
                className="flex-1 h-8 md:h-11 rounded-lg md:rounded-xl text-xs md:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted transition-all"
              >
                City
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Category Filter */}
        {dbCategories.length > 0 && (
          <div className="flex overflow-x-auto hide-scrollbar gap-1.5 md:gap-2 pb-2 mb-4 md:mb-6 justify-start md:justify-center">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-[#a855f7] text-white shadow-lg shadow-[#a855f7]/30'
                  : 'glass-card text-muted-foreground hover:bg-muted/50'
              }`}
            >
              All Categories
            </button>
            {dbCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#a855f7] text-white shadow-lg shadow-[#a855f7]/30'
                    : 'glass-card text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {cat.fields}
              </button>
            ))}
          </div>
        )}

        {/* User Standing Card */}
        {userStanding && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-4 md:mb-6"
          >
            {userStanding.total_predictions > 0 ? (
              <div className="rounded-2xl md:rounded-[2rem] border border-white/20 p-3.5 md:p-6 shadow-2xl flex items-center justify-between bg-gradient-to-br from-[#a855f7] via-[#8b5cf6] to-[#7c3aed] text-white relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                <div className="absolute -left-4 -bottom-4 w-24 h-24 md:w-32 md:h-32 bg-black/10 rounded-full blur-2xl" />

                <div className="flex items-center gap-3 md:gap-6 relative z-10">
                  {/* Rank Badge */}
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white shadow-inner flex items-center justify-center text-[#8b5cf6] font-black text-sm md:text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                    {userStanding.rank ? `#${userStanding.rank}` : '?'}
                  </div>
                  <div>
                    <p className="text-[9px] md:text-xs uppercase font-black text-white/80 leading-none mb-1 tracking-[0.15em]">
                      {userStanding.rank ? 'Your Global Standing' : 'Ranking in Progress'}
                    </p>
                    <h2 className="font-black text-sm md:text-2xl text-white tracking-tight leading-tight">
                      {userStanding.rank
                        ? `Ranked #${userStanding.rank} Globally`
                        : `${10 - userStanding.total_predictions} more for ranking`}
                    </h2>
                  </div>
                </div>

                <div className="text-right relative z-10 ml-2">
                  <p className="text-2xl md:text-4xl font-black text-white leading-none tracking-tighter">
                    {userStanding.score}
                  </p>
                  <p className="text-[9px] md:text-xs text-white/80 font-black mt-1 uppercase tracking-widest">
                    Weighted Pts
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl md:rounded-[2rem] border border-white/20 p-3.5 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-[#a855f7] via-[#8b5cf6] to-[#7c3aed] text-white relative overflow-hidden group gap-3 md:gap-0">
                <div className="absolute -right-4 -top-4 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                <div className="absolute -left-4 -bottom-4 w-24 h-24 md:w-32 md:h-32 bg-black/10 rounded-full blur-2xl" />

                <div className="flex items-center gap-3 md:gap-6 relative z-10 w-full md:w-auto">
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white shadow-inner flex items-center justify-center text-[#8b5cf6] group-hover:scale-105 transition-transform flex-shrink-0">
                    <TrendingUp size={22} strokeWidth={3} className="md:hidden" />
                    <TrendingUp size={32} strokeWidth={3} className="hidden md:block" />
                  </div>
                  <div className="text-left flex-1">
                    <h2 className="font-black text-sm md:text-xl text-white leading-tight mb-0.5">
                      Start your prediction journey to get ranked
                    </h2>
                    <p className="text-[9px] md:text-xs text-white/80 font-bold uppercase tracking-wider">
                      Make your first prediction to be ranked
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/'}
                  className="relative z-10 w-full md:w-auto px-5 py-2 md:px-6 md:py-3 bg-white text-[#8b5cf6] rounded-xl font-bold text-xs md:text-sm shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                >
                  Start Predicting
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {/* States: Loading / Error / Empty */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground animate-pulse text-base md:text-lg">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">
            <p className="text-base md:text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl text-sm md:text-lg"
            >
              Retry
            </button>
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground px-4">
            <p className="text-base mb-1 italic">No rankings yet</p>
            <p className="text-xs md:text-sm opacity-70">Need 10+ predictions and 5+ avg votes to qualify.</p>
          </div>
        ) : (
          <motion.div
            className="space-y-2 md:space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {fullList.map((entry, index) => {
              const rank = selectedCategory === 'All' ? (entry.rank || index + 1) : index + 1;
              const medal = getRankMedal(rank);
              const rankColor = getRankColor(rank);
              const isCurrentUser = entry.user_id === currentUserId;

              return (
                <motion.div
                  key={entry.user_id}
                  className={`glass-card rounded-xl md:rounded-2xl p-2.5 md:p-4 flex items-center gap-2.5 md:gap-4 transition-all ${
                    isCurrentUser ? 'ring-2 ring-[#a855f7] bg-gradient-to-r from-[#a855f711] to-transparent' : ''
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-7 h-7 md:w-10 md:h-10 flex-shrink-0 rounded-full bg-muted border border-border">
                    {typeof medal === 'string' ? (
                      <span className="text-base md:text-2xl">{medal}</span>
                    ) : (
                      <span className="text-xs md:text-xl font-bold" style={{ color: rankColor }}>
                        {rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="w-8 h-8 md:w-12 md:h-12 border border-white/10 flex-shrink-0">
                    <AvatarImage src={entry.user?.avatar_url} alt={entry.user?.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs md:text-base">
                      {entry.user?.name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-xs md:text-base truncate leading-tight">
                        {entry.user?.name || 'Anonymous User'}
                      </p>
                      {isCurrentUser && (
                        <span className="text-[9px] md:text-xs px-1.5 py-0.5 rounded-full bg-[#a855f7]/20 text-[#a855f7] font-black uppercase flex-shrink-0">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] md:text-xs text-muted-foreground font-medium truncate mt-0.5">
                      {entry.accuracy?.toFixed(1)}% Acc • {entry.total_predictions} Preds
                    </p>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-end text-right min-w-[48px] md:min-w-[60px] flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <TrendingUp size={11} className="text-[#a855f7] md:hidden" />
                      <TrendingUp size={14} className="text-[#a855f7] hidden md:block" />
                      <span className="font-black text-base md:text-2xl text-foreground leading-none">
                        {entry.score}
                      </span>
                    </div>
                    <div className="text-[8px] md:text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">
                      Pts
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Desktop Fixed Standing Footer */}
      {/* {userStanding && (
        <div className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-30 px-4 w-full max-w-2xl">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="rounded-2xl border border-white/20 p-4 shadow-2xl flex items-center justify-between bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#a855f7] font-black text-xl">
                #{userStanding.rank}
              </div>
              <div>
                <p className="text-xs uppercase font-black text-white/70 mb-1 tracking-widest">Your Standing</p>
                <p className="text-lg font-bold text-white">You are ranked #{userStanding.rank} in this category</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-white">{Number(userStanding.accuracy)?.toFixed(1)}%</p>
              <p className="text-xs text-white/70 font-bold uppercase tracking-wider">Prediction Accuracy</p>
            </div>
          </motion.div>
        </div>
      )} */}

      <MobileNav />
    </div>
  );
}