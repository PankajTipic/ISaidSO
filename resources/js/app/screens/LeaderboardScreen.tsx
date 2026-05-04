

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

//         const response = await getAuth(`/api/leaderboard?location_scope=${selectedTab}${catQuery}`);
//         const data = response.data ?? response;
//         const list = Array.isArray(data) ? data : data.data ?? [];

//         const sanitized = list.map((item: any) => ({
//           ...item,
//           accuracy: Math.min(100, Math.max(0, Number(item.accuracy) || 0)),
//         }));

//         setLeaderboardData(sanitized);

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
//     <div className="min-h-screen bg-background pb-20 md:pb-6">
//       <TopNav />

//       <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6">

//         {/* Header */}
//         <div className="mb-4 md:mb-6 text-center md:text-left">
//           <h1 className="text-2xl md:text-4xl font-bold flex items-center justify-center md:justify-start gap-2">
//             <Trophy size={24} className="text-[#fbbf24] md:hidden" />
//             <Trophy size={32} className="text-[#fbbf24] hidden md:block" />
//             Leaderboard
//           </h1>
//         </div>

//         {/* Tab Switcher */}
//         <div className="flex justify-center mb-4 md:mb-6">
//           <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full max-w-md">
//             <TabsList className="glass-card w-full max-w-md justify-center rounded-xl md:rounded-2xl p-1">
//               <TabsTrigger
//                 value="global"
//                 className="flex-1 h-8 md:h-11 rounded-lg md:rounded-xl text-xs md:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted transition-all"
//               >
//                 Global
//               </TabsTrigger>
//               <TabsTrigger
//                 value="country"
//                 className="flex-1 h-8 md:h-11 rounded-lg md:rounded-xl text-xs md:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted transition-all"
//               >
//                 Country
//               </TabsTrigger>
//               <TabsTrigger
//                 value="city"
//                 className="flex-1 h-8 md:h-11 rounded-lg md:rounded-xl text-xs md:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-muted transition-all"
//               >
//                 City
//               </TabsTrigger>
//             </TabsList>
//           </Tabs>
//         </div>

//         {/* Category Filter */}
//         {dbCategories.length > 0 && (
//           <div className="flex overflow-x-auto hide-scrollbar gap-1.5 md:gap-2 pb-2 mb-4 md:mb-6 justify-start md:justify-center">
//             <button
//               onClick={() => setSelectedCategory('All')}
//               className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
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
//                 className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
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

//         {/* User Standing Card */}
//         {userStanding && (
//           <motion.div
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             className="mb-4 md:mb-6"
//           >
//             {userStanding.total_predictions > 0 ? (
//               <div className="rounded-2xl md:rounded-[2rem] border border-white/20 p-3.5 md:p-6 shadow-2xl flex items-center justify-between bg-gradient-to-br from-[#a855f7] via-[#8b5cf6] to-[#7c3aed] text-white relative overflow-hidden group">
//                 <div className="absolute -right-4 -top-4 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
//                 <div className="absolute -left-4 -bottom-4 w-24 h-24 md:w-32 md:h-32 bg-black/10 rounded-full blur-2xl" />

//                 <div className="flex items-center gap-3 md:gap-6 relative z-10">
//                   {/* Rank Badge */}
//                   <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white shadow-inner flex items-center justify-center text-[#8b5cf6] font-black text-sm md:text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
//                     {userStanding.rank ? `#${userStanding.rank}` : '?'}
//                   </div>
//                   <div>
//                     <p className="text-[9px] md:text-xs uppercase font-black text-white/80 leading-none mb-1 tracking-[0.15em]">
//                       {userStanding.rank ? 'Your Global Standing' : 'Ranking in Progress'}
//                     </p>
//                     <h2 className="font-black text-sm md:text-2xl text-white tracking-tight leading-tight">
//                       {userStanding.rank
//                         ? `Ranked #${userStanding.rank} Globally`
//                         : `${10 - userStanding.total_predictions} more for ranking`}
//                     </h2>
//                   </div>
//                 </div>

//                 <div className="text-right relative z-10 ml-2">
//                   <p className="text-2xl md:text-4xl font-black text-white leading-none tracking-tighter">
//                     {userStanding.score}
//                   </p>
//                   <p className="text-[9px] md:text-xs text-white/80 font-black mt-1 uppercase tracking-widest">
//                     Weighted Pts
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               <div className="rounded-2xl md:rounded-[2rem] border border-white/20 p-3.5 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-[#a855f7] via-[#8b5cf6] to-[#7c3aed] text-white relative overflow-hidden group gap-3 md:gap-0">
//                 <div className="absolute -right-4 -top-4 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
//                 <div className="absolute -left-4 -bottom-4 w-24 h-24 md:w-32 md:h-32 bg-black/10 rounded-full blur-2xl" />

//                 <div className="flex items-center gap-3 md:gap-6 relative z-10 w-full md:w-auto">
//                   <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white shadow-inner flex items-center justify-center text-[#8b5cf6] group-hover:scale-105 transition-transform flex-shrink-0">
//                     <TrendingUp size={22} strokeWidth={3} className="md:hidden" />
//                     <TrendingUp size={32} strokeWidth={3} className="hidden md:block" />
//                   </div>
//                   <div className="text-left flex-1">
//                     <h2 className="font-black text-sm md:text-xl text-white leading-tight mb-0.5">
//                       Start your prediction journey to get ranked
//                     </h2>
//                     <p className="text-[9px] md:text-xs text-white/80 font-bold uppercase tracking-wider">
//                       Make your first prediction to be ranked
//                     </p>
//                   </div>
//                 </div>

//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => window.location.href = '/'}
//                   className="relative z-10 w-full md:w-auto px-5 py-2 md:px-6 md:py-3 bg-white text-[#8b5cf6] rounded-xl font-bold text-xs md:text-sm shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
//                 >
//                   Start Predicting
//                 </motion.button>
//               </div>
//             )}
//           </motion.div>
//         )}

//         {/* States: Loading / Error / Empty */}
//         {loading ? (
//           <div className="text-center py-12">
//             <p className="text-muted-foreground animate-pulse text-base md:text-lg">Loading leaderboard...</p>
//           </div>
//         ) : error ? (
//           <div className="text-center py-12 text-red-400">
//             <p className="text-base md:text-lg">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl text-sm md:text-lg"
//             >
//               Retry
//             </button>
//           </div>
//         ) : leaderboardData.length === 0 ? (
//           <div className="text-center py-12 text-muted-foreground px-4">
//             <p className="text-base mb-1 italic">No rankings yet</p>
//             <p className="text-xs md:text-sm opacity-70">Need 10+ predictions and 5+ avg votes to qualify.</p>
//           </div>
//         ) : (
//           <motion.div
//             className="space-y-2 md:space-y-4"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//           >
//             {fullList.map((entry, index) => {
//               const rank = selectedCategory === 'All' ? (entry.rank || index + 1) : index + 1;
//               const medal = getRankMedal(rank);
//               const rankColor = getRankColor(rank);
//               const isCurrentUser = entry.user_id === currentUserId;

//               return (
//                 <motion.div
//                   key={entry.user_id}
//                   className={`glass-card rounded-xl md:rounded-2xl p-2.5 md:p-4 flex items-center gap-2.5 md:gap-4 transition-all ${
//                     isCurrentUser ? 'ring-2 ring-[#a855f7] bg-gradient-to-r from-[#a855f711] to-transparent' : ''
//                   }`}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: index * 0.03 }}
//                 >
//                   {/* Rank */}
//                   <div className="flex items-center justify-center w-7 h-7 md:w-10 md:h-10 flex-shrink-0 rounded-full bg-muted border border-border">
//                     {typeof medal === 'string' ? (
//                       <span className="text-base md:text-2xl">{medal}</span>
//                     ) : (
//                       <span className="text-xs md:text-xl font-bold" style={{ color: rankColor }}>
//                         {rank}
//                       </span>
//                     )}
//                   </div>

//                   {/* Avatar */}
//                   <Avatar className="w-8 h-8 md:w-12 md:h-12 border border-white/10 flex-shrink-0">
//                     <AvatarImage src={entry.user?.avatar_url} alt={entry.user?.name} />
//                     <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs md:text-base">
//                       {entry.user?.name?.[0] || '?'}
//                     </AvatarFallback>
//                   </Avatar>

//                   {/* User Info */}
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-1.5">
//                       <p className="font-bold text-xs md:text-base truncate leading-tight">
//                         {entry.user?.name || 'Anonymous User'}
//                       </p>
//                       {isCurrentUser && (
//                         <span className="text-[9px] md:text-xs px-1.5 py-0.5 rounded-full bg-[#a855f7]/20 text-[#a855f7] font-black uppercase flex-shrink-0">
//                           You
//                         </span>
//                       )}
//                     </div>
//                     <p className="text-[9px] md:text-xs text-muted-foreground font-medium truncate mt-0.5">
//                       {entry.accuracy?.toFixed(1)}% Acc • {entry.total_predictions} Preds
//                     </p>
//                   </div>

//                   {/* Score */}
//                   <div className="flex flex-col items-end text-right min-w-[48px] md:min-w-[60px] flex-shrink-0">
//                     <div className="flex items-center gap-1">
//                       <TrendingUp size={11} className="text-[#a855f7] md:hidden" />
//                       <TrendingUp size={14} className="text-[#a855f7] hidden md:block" />
//                       <span className="font-black text-base md:text-2xl text-foreground leading-none">
//                         {entry.score}
//                       </span>
//                     </div>
//                     <div className="text-[8px] md:text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">
//                       Pts
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </motion.div>
//         )}
//       </div>

//       {/* Desktop Fixed Standing Footer */}
//       {/* {userStanding && (
//         <div className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 z-30 px-4 w-full max-w-2xl">
//           <motion.div
//             initial={{ y: 50, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             className="rounded-2xl border border-white/20 p-4 shadow-2xl flex items-center justify-between bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white"
//           >
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
//       )} */}

//       <MobileNav />
//     </div>
//   );
// }










// import { useState, useEffect } from 'react';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
// import { MobileNav } from '@/app/components/MobileNav';
// import { TopNav } from '@/app/components/TopNav';
// import {
//   Trophy,
//   TrendingUp,
//   Search,
//   Calendar,
//   ArrowUpDown,
//   Download,
//   Globe,
//   Users,
//   Activity,
//   ChevronDown,
//   ChevronRight,
//   MapPin,
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
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
//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showAccuracyInfo, setShowAccuracyInfo] = useState(false);
//   const [period, setPeriod] = useState('all-time'); // '30-days', '90-days', 'all-time'
//   const [sortBy, setSortBy] = useState('score');
//   const [totalCount, setTotalCount] = useState(0);
//   const itemsPerPage = 7;

//   const currentUser = useAppSelector((state) => state.auth.user);
//   const currentUserId = currentUser?.id;

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await getAuth('/api/fields');
//         const data = res.data ?? res;
//         if (Array.isArray(data)) setDbCategories(data);
//         else if (data && Array.isArray(data.data)) setDbCategories(data.data);
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
//         setCurrentPage(1);
//         const catQuery = selectedCategory !== 'All' ? `&category_id=${selectedCategory}` : '';
//         const periodQuery = `&period=${period}`;
        
//         const response = await getAuth(`/api/leaderboard?location_scope=${selectedTab}${catQuery}${periodQuery}`);
//         const data = response.data ?? response;
//         const list = Array.isArray(data) ? data : data.data ?? [];
        
//         if (data.total) setTotalCount(data.total);
//         else setTotalCount(list.length);

//         const sanitized = list.map((item: any) => ({
//           ...item,
//           accuracy: Math.min(100, Math.max(0, Number(item.accuracy) || 0)),
//         }));
//         setLeaderboardData(sanitized);
        
//         const standingRes = await getAuth(`/api/leaderboard/my-standing?location_scope=${selectedTab}${catQuery}${periodQuery}`);
//         if (standingRes.data) setUserStanding(standingRes.data);
//       } catch (err: any) {
//         console.error('Leaderboard fetch error:', err);
//         setError(err.message || 'Failed to load leaderboard');
//         toast.error('Could not load leaderboard');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchLeaderboard();
//   }, [selectedTab, selectedCategory, period]);

//   const getRankMedal = (rank: number) => {
//     if (rank === 1) return '🥇';
//     if (rank === 2) return '🥈';
//     if (rank === 3) return '🥉';
//     return null;
//   };

//   const filteredList = [...leaderboardData]
//     .filter((entry) =>
//       entry.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
//     )
//     .sort((a, b) => {
//       if (sortBy === 'accuracy') return (b.accuracy || 0) - (a.accuracy || 0);
//       if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
//       if (sortBy === 'predictions') return (b.total_predictions || 0) - (a.total_predictions || 0);
//       return 0;
//     });

//   const totalPages = Math.ceil(filteredList.length / itemsPerPage);
//   const paginatedList = filteredList.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const networkStats = {
//     totalActiveUsers: totalCount,
//     avgAccuracy: leaderboardData.length > 0
//       ? (leaderboardData.reduce((sum, e) => sum + (Number(e.accuracy) || 0), 0) / leaderboardData.length).toFixed(1)
//       : '0.0',
//     totalPredictions: leaderboardData.length > 0
//       ? leaderboardData.reduce((sum, e) => sum + (Number(e.total_predictions) || 0), 0).toLocaleString()
//       : '0',
//   };

//   const TABS = [
//     { value: 'global', label: 'Global' },
//     { value: 'country', label: 'Country' },
//     { value: 'city', label: 'City' },
//   ];

//   return (
//     <div className="min-h-screen bg-[#f8f8f6] dark:bg-[#0f0f0f] pb-20 md:pb-0">
//       <TopNav />

//       <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">

//         {/* ── Header ── */}
//         <div className="mb-6">
//           <div className="flex items-start justify-between flex-wrap gap-3">
//             <div>
//               <h1 className="flex items-center gap-2.5 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
//                 <Trophy size={26} className="text-[#a855f7]" />
//                 Leaderboard
//               </h1>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                 The world's top predictors. Ranked by their total points and performance over the last 30 days.
//               </p>
//             </div>

//             {/* Scope badge */}
//             {/* <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm">
//               <Globe size={13} className="text-[#a855f7]" />
//               {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Scope
//               <span className="text-gray-400">•</span>
//               Last 30 Days
//               <ChevronDown size={12} className="text-gray-400" />
//             </div> */}
//           </div>
//         </div>

//         {/* ── Tab + Controls Row ── */}
//         <div className="flex flex-wrap items-center gap-3 mb-5">
//           {/* Tab Switcher */}
//           <div className="flex items-center gap-0.5 p-1 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm">
//             {TABS.map((tab) => (
//               <button
//                 key={tab.value}
//                 onClick={() => setSelectedTab(tab.value)}
//                 className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
//                   selectedTab === tab.value
//                     ? 'bg-[#a855f7] text-white shadow'
//                     : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
//                 }`}
//               >
//                 {tab.label}
//               </button>
//             ))}
//           </div>

//           {/* Search */}
//           <div className="flex items-center gap-2 flex-1 min-w-[180px] px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm">
//             <Search size={14} className="text-gray-400 flex-shrink-0" />
//             <input
//               type="text"
//               placeholder="Find a predictor..."
//               value={searchQuery}
//               onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
//               className="bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none w-full"
//             />
//           </div>

//           {/* Controls */}
//           <div className="flex items-center gap-2 ml-auto">
//             <div className="relative group/filter">
//               <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition">
//                 <Calendar size={13} />
//                 {period === 'all-time' ? 'All Time' : period === '30-days' ? 'Last 30 Days' : 'Last 90 Days'}
//                 <ChevronDown size={11} className="text-gray-400" />
//               </button>
//               <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-50 opacity-0 invisible group-hover/filter:opacity-100 group-hover/filter:visible transition-all p-1">
//                 {['30-days', '90-days', 'all-time'].map((p) => (
//                   <button
//                     key={p}
//                     onClick={() => setPeriod(p)}
//                     className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold ${period === p ? 'bg-[#a855f7] text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
//                   >
//                     {p === 'all-time' ? 'All Time' : p === '30-days' ? 'Last 30 Days' : 'Last 90 Days'}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="relative group/sort">
//               <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition">
//                 <ArrowUpDown size={13} />
//                 Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
//                 <ChevronDown size={11} className="text-gray-400" />
//               </button>
//               <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-50 opacity-0 invisible group-hover/sort:opacity-100 group-hover/sort:visible transition-all p-1">
//                 {['accuracy', 'score', 'predictions'].map((s) => (
//                   <button
//                     key={s}
//                     onClick={() => setSortBy(s)}
//                     className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold ${sortBy === s ? 'bg-[#a855f7] text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
//                   >
//                     {s.charAt(0).toUpperCase() + s.slice(1)}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* <button className="p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition">
//               <Download size={14} />
//             </button> */}
//           </div>
//         </div>

//         {/* ── Category Filter ── */}
//         {dbCategories.length > 0 && (
//           <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 mb-5">
//             {['All', ...dbCategories].map((cat) => {
//               const isAll = cat === 'All';
//               const id = isAll ? 'All' : (cat as any).id;
//               const label = isAll ? 'All Categories' : (cat as any).fields;
//               return (
//                 <button
//                   key={id}
//                   onClick={() => setSelectedCategory(id)}
//                   className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
//                     selectedCategory == id
//                       ? 'bg-[#a855f7] text-white border-[#a855f7] shadow-md shadow-[#a855f7]/20'
//                       : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#a855f7]/40'
//                   }`}
//                 >
//                   {label}
//                 </button>
//               );
//             })}
//           </div>
//         )}

//         {/* ── User Standing & Quick Stats (Mobile Top / Desktop Top) ── */}
//         <div className="mb-6 space-y-4">
//           {userStanding && (
//             <motion.div
//               initial={{ y: 20, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               className="relative overflow-hidden group"
//             >
//               {userStanding.total_predictions > 0 ? (
//                 <div className="rounded-[1.5rem] md:rounded-[2rem] border border-white/20 p-4 md:p-6 shadow-2xl flex items-center justify-between bg-gradient-to-br from-[#a855f7] via-[#8b5cf6] to-[#7c3aed] text-white relative overflow-hidden">
//                   <div className="absolute -right-4 -top-4 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
//                   <div className="absolute -left-4 -bottom-4 w-24 h-24 md:w-32 md:h-32 bg-black/10 rounded-full blur-2xl" />

//                   <div className="flex items-center gap-3 md:gap-6 relative z-10">
//                     {/* Rank Badge */}
//                     <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white shadow-inner flex items-center justify-center text-[#8b5cf6] font-black text-sm md:text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
//                       {userStanding.rank ? `#${userStanding.rank}` : '?'}
//                     </div>
//                     <div>
//                       <p className="text-[9px] md:text-xs uppercase font-black text-white/80 leading-none mb-1 tracking-[0.15em]">
//                         {userStanding.rank ? 'Your Current Standing' : 'Ranking in Progress'}
//                       </p>
//                       <h2 className="font-black text-sm md:text-2xl text-white tracking-tight leading-tight">
//                         {userStanding.rank
//                           ? `Ranked #${userStanding.rank} ${selectedTab === 'global' ? 'Globally' : selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}`
//                           : `${10 - userStanding.total_predictions} more for ranking`}
//                       </h2>
//                     </div>
//                   </div>

//                   <div className="text-right relative z-10 ml-2">
//                     <p className="text-2xl md:text-4xl font-black text-white leading-none tracking-tighter">
//                       {userStanding.score || '0'}
//                     </p>
//                     <p className="text-[9px] md:text-xs text-white/80 font-black mt-1 uppercase tracking-widest">
//                       Points
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="rounded-[1.5rem] md:rounded-[2rem] border border-white/20 p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-[#a855f7] via-[#8b5cf6] to-[#7c3aed] text-white relative overflow-hidden group gap-3 md:gap-0">
//                   <div className="absolute -right-4 -top-4 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
//                   <div className="absolute -left-4 -bottom-4 w-24 h-24 md:w-32 md:h-32 bg-black/10 rounded-full blur-2xl" />

//                   <div className="flex items-center gap-3 md:gap-6 relative z-10 w-full md:w-auto">
//                     <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white shadow-inner flex items-center justify-center text-[#8b5cf6] group-hover:scale-105 transition-transform flex-shrink-0">
//                       <TrendingUp size={22} strokeWidth={3} className="md:hidden" />
//                       <TrendingUp size={32} strokeWidth={3} className="hidden md:block" />
//                     </div>
//                     <div className="text-left flex-1">
//                       <h2 className="font-black text-sm md:text-xl text-white leading-tight mb-0.5">
//                         Start your prediction journey to get ranked
//                       </h2>
//                       <p className="text-[9px] md:text-xs text-white/80 font-bold uppercase tracking-wider">
//                         Make your first prediction to be ranked
//                       </p>
//                     </div>
//                   </div>

//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => (window.location.href = '/')}
//                     className="relative z-10 w-full md:w-auto px-5 py-2 md:px-6 md:py-3 bg-white text-[#8b5cf6] rounded-xl font-bold text-xs md:text-sm shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
//                   >
//                     Start Predicting
//                   </motion.button>
//                 </div>
//               )}
//             </motion.div>
//           )}

//           {/* Quick Stats for Mobile */}
//           <div className="md:hidden grid grid-cols-3 gap-2">
//             {[
//               { label: 'Active Users', value: networkStats.totalActiveUsers.toLocaleString(), icon: <Users size={13} /> },
//               { label: 'Avg Accuracy', value: `${networkStats.avgAccuracy}%`, icon: <Globe size={13} /> },
//               { label: 'Predictions', value: networkStats.totalPredictions, icon: <Activity size={13} /> },
//             ].map((stat) => (
//               <div key={stat.label} className="rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3 text-center">
//                 <div className="flex items-center justify-center gap-1 text-[#a855f7] mb-1">
//                   {stat.icon}
//                 </div>
//                 <p className="font-black text-sm text-gray-900 dark:text-white">{stat.value}</p>
//                 <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide mt-0.5">{stat.label}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ── Main 2-Column Layout ── */}
//         <div className="flex gap-5 items-start">

//           {/* ── Left: Leaderboard List ── */}
//           <div className="flex-1 min-w-0">
//             {loading ? (
//               <div className="space-y-3">
//                 {[...Array(5)].map((_, i) => (
//                   <div key={i} className="h-16 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 animate-pulse" />
//                 ))}
//               </div>
//             ) : error ? (
//               <div className="text-center py-16">
//                 <p className="text-red-400 mb-4">{error}</p>
//                 <button
//                   onClick={() => window.location.reload()}
//                   className="px-5 py-2 bg-[#a855f7] text-white rounded-xl text-sm font-semibold"
//                 >
//                   Retry
//                 </button>
//               </div>
//             ) : filteredList.length === 0 ? (
//               <div className="text-center py-16 text-gray-400">
//                 <p className="italic mb-1">No rankings yet</p>
//                 <p className="text-xs">Need 10+ predictions and 5+ avg votes to qualify.</p>
//               </div>
//             ) : (
//               <>
//                 <motion.div className="space-y-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//                   {paginatedList.map((entry, index) => {
//                     const rank = selectedCategory === 'All' ? (entry.rank || ((currentPage - 1) * itemsPerPage + index + 1)) : ((currentPage - 1) * itemsPerPage + index + 1);
//                     const medal = getRankMedal(rank);
//                     const isCurrentUser = entry.user_id === currentUserId;

//                     return (
//                       <motion.div
//                         key={entry.user_id}
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: index * 0.04 }}
//                         className={`group flex items-center gap-3 md:gap-4 px-4 py-3.5 rounded-2xl bg-white dark:bg-white/5 border transition-all hover:shadow-md hover:border-[#a855f7]/30 ${
//                           isCurrentUser
//                             ? 'border-[#a855f7]/50 bg-gradient-to-r from-[#a855f7]/5 to-transparent dark:from-[#a855f7]/10'
//                             : 'border-gray-100 dark:border-white/5'
//                         }`}
//                       >
//                         {/* Rank */}
//                         <div className="w-8 md:w-10 flex items-center justify-center flex-shrink-0">
//                           {medal ? (
//                             <span className="text-xl md:text-2xl">{medal}</span>
//                           ) : (
//                             <span className="text-sm md:text-base font-bold text-gray-400">{rank}</span>
//                           )}
//                         </div>

//                         {/* Avatar */}
//                         <Avatar className="w-9 h-9 md:w-11 md:h-11 flex-shrink-0 ring-2 ring-white dark:ring-black shadow-sm">
//                           <AvatarImage src={entry.user?.avatar_url} />
//                           <AvatarFallback className="bg-[#a855f7]/10 text-[#a855f7] font-bold text-sm">
//                             {entry.user?.name?.[0] || '?'}
//                           </AvatarFallback>
//                         </Avatar>

//                         {/* User Info */}
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-2 flex-wrap">
//                             <p className="font-bold text-sm md:text-base text-gray-900 dark:text-white truncate leading-tight">
//                               {entry.user?.name || 'Anonymous User'}
//                             </p>
//                             {entry.user?.username && (
//                               <span className="text-xs text-gray-400 truncate">@{entry.user.username}</span>
//                             )}
//                             {isCurrentUser && (
//                               <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#a855f7]/15 text-[#a855f7] font-black uppercase flex-shrink-0">
//                                 You
//                               </span>
//                             )}
//                           </div>
//                           {entry.user?.location && (
//                             <div className="flex items-center gap-1 mt-0.5">
//                               <MapPin size={10} className="text-gray-400" />
//                               <p className="text-xs text-gray-400 truncate">{entry.user.location}</p>
//                             </div>
//                           )}
//                         </div>

//                         {/* Score + Predictions */}
//                         <div className="text-right flex-shrink-0">
//                           <div className="flex items-center gap-1 justify-end">
//                             <span className="text-base md:text-xl font-black text-gray-900 dark:text-white">
//                               {entry.score || 0}
//                             </span>
//                             <TrendingUp size={12} className="text-[#a855f7]" />
//                           </div>
//                           <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
//                             {entry.total_predictions} Predictions
//                           </p>
//                           {/* Mini score bar */}
//                           <div className="mt-1.5 w-24 md:w-32 h-1 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden ml-auto">
//                             <div
//                               className="h-full rounded-full bg-[#a855f7]"
//                               style={{ width: `${Math.min(100, (entry.score / 1000) * 100)}%` }}
//                             />
//                           </div>
//                         </div>
//                       </motion.div>
//                     );
//                   })}
//                 </motion.div>

//                 {/* Pagination */}
//                 <div className="flex items-center justify-between mt-5 text-sm text-gray-500 dark:text-gray-400">
//                   <p>
//                     Showing top {(currentPage - 1) * itemsPerPage + 1}–
//                     {Math.min(currentPage * itemsPerPage, filteredList.length)} of{' '}
//                     {filteredList.length.toLocaleString()} predictors
//                   </p>
//                   <div className="flex gap-2">
//                     <button
//                       disabled={currentPage === 1}
//                       onClick={() => setCurrentPage((p) => p - 1)}
//                       className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 font-semibold text-xs disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/10 transition"
//                     >
//                       Previous
//                     </button>
//                     <button
//                       disabled={currentPage === totalPages}
//                       onClick={() => setCurrentPage((p) => p + 1)}
//                       className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 font-semibold text-xs disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/10 transition"
//                     >
//                       Next
//                     </button>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>

//           {/* ── Right Sidebar ── */}
//           <div className="hidden md:flex flex-col gap-4 w-72 flex-shrink-0">

//             {/* Network Insights */}
//             <div className="rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-5">
//               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
//                 Network Insights
//               </p>
//               <div className="space-y-4">
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 rounded-xl bg-[#a855f7]/10 flex items-center justify-center flex-shrink-0">
//                     <Users size={15} className="text-[#a855f7]" />
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-400 font-medium">Total Active Users</p>
//                     <p className="font-black text-base text-gray-900 dark:text-white">
//                       {networkStats.totalActiveUsers.toLocaleString()}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 rounded-xl bg-[#a855f7]/10 flex items-center justify-center flex-shrink-0">
//                     <Globe size={15} className="text-[#a855f7]" />
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-400 font-medium">Avg. Network Accuracy</p>
//                     <p className="font-black text-base text-gray-900 dark:text-white">{networkStats.avgAccuracy}%</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 rounded-xl bg-[#a855f7]/10 flex items-center justify-center flex-shrink-0">
//                     <Activity size={15} className="text-[#a855f7]" />
//                   </div>
//                   <div>
//                     <p className="text-xs text-gray-400 font-medium">Predictions Made</p>
//                     <p className="font-black text-base text-gray-900 dark:text-white">
//                       {networkStats.totalPredictions}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* How accuracy is calculated */}
//             {/* <div className="rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 overflow-hidden">
//               <button
//                 onClick={() => setShowAccuracyInfo(!showAccuracyInfo)}
//                 className="w-full flex items-center justify-between p-5 text-left"
//               >
//                 <p className="text-sm font-bold text-gray-800 dark:text-white">
//                   How is accuracy calculated?
//                 </p>
//                 <ChevronDown
//                   size={16}
//                   className={`text-gray-400 transition-transform ${showAccuracyInfo ? 'rotate-180' : ''}`}
//                 />
//               </button>
//               <AnimatePresence>
//                 {showAccuracyInfo && (
//                   <motion.div
//                     initial={{ height: 0, opacity: 0 }}
//                     animate={{ height: 'auto', opacity: 1 }}
//                     exit={{ height: 0, opacity: 0 }}
//                     className="overflow-hidden"
//                   >
//                     <div className="px-5 pb-5">
//                       <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
//                         Accuracy is determined by taking the total number of successful predictions divided by the total finalized outcomes within the selected timeframe.
//                       </p>
//                       <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-[#a855f7]/8 dark:bg-[#a855f7]/15">
//                         <div className="w-1.5 h-1.5 rounded-full bg-[#a855f7] mt-1.5 flex-shrink-0" />
//                         <p className="text-xs text-[#a855f7] dark:text-purple-300 font-semibold">
//                           Minimum 5 predictions required for ranking.
//                         </p>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div> */}

//             {/* Footer links */}
//             <div className="text-center space-y-1">
//               <div className="flex flex-wrap justify-center gap-3 text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
//                 <button className="hover:text-gray-600 dark:hover:text-gray-200 transition">Terms of Service</button>
//                 <button className="hover:text-gray-600 dark:hover:text-gray-200 transition">Privacy Policy</button>
//                 <button className="hover:text-gray-600 dark:hover:text-gray-200 transition">Help Center</button>
//               </div>
//               <p className="text-[10px] text-gray-300 dark:text-gray-600">Contact Us</p>
//               <p className="text-[9px] text-gray-300 dark:text-gray-600">
//                 © 2024 | Said So Inc. All rights reserved.
//               </p>
//             </div>
//           </div>
//         </div>

//       </div>

//       <MobileNav />
//     </div>
//   );
// }















import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { MobileNav } from '@/app/components/MobileNav';
import { TopNav } from '@/app/components/TopNav';
import {
  Trophy,
  TrendingUp,
  Search,
  Calendar,
  ArrowUpDown,
  Globe,
  Users,
  Activity,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [period, setPeriod] = useState('all-time'); // '30-days', '90-days', 'all-time'
  const [sortBy, setSortBy] = useState('score');
  const [totalCount, setTotalCount] = useState(0);

  // FIX: Use state-based dropdowns instead of CSS group-hover (broken on mobile/touch)
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const periodDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 7;

  const currentUser = useAppSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(e.target as Node)) {
        setPeriodDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAuth('/api/fields');
        const data = res.data ?? res;
        if (Array.isArray(data)) setDbCategories(data);
        else if (data && Array.isArray(data.data)) setDbCategories(data.data);
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
        setCurrentPage(1);
        const catQuery = selectedCategory !== 'All' ? `&category_id=${selectedCategory}` : '';
        const periodQuery = `&period=${period}`;

        const response = await getAuth(
          `/api/leaderboard?location_scope=${selectedTab}${catQuery}${periodQuery}`
        );
        const data = response.data ?? response;
        const list = Array.isArray(data) ? data : data.data ?? [];

        if (data.total) setTotalCount(data.total);
        else setTotalCount(list.length);

        const sanitized = list.map((item: any) => ({
          ...item,
          accuracy: Math.min(100, Math.max(0, Number(item.accuracy) || 0)),
        }));
        setLeaderboardData(sanitized);

        const standingRes = await getAuth(
          `/api/leaderboard/my-standing?location_scope=${selectedTab}${catQuery}${periodQuery}`
        );
        if (standingRes.data) setUserStanding(standingRes.data);
      } catch (err: any) {
        console.error('Leaderboard fetch error:', err);
        setError(err.message || 'Failed to load leaderboard');
        toast.error('Could not load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  // FIX: Added `sortBy` was missing from deps — but sortBy is client-side only,
  // so we intentionally keep it out of the fetch effect. The fetch effect
  // correctly depends on tab, category, and period only.
  }, [selectedTab, selectedCategory, period]);

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  // FIX: Sort logic corrected — was short-circuiting before 'score' branch ran
  const filteredList = [...leaderboardData]
    .filter((entry) =>
      entry.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'accuracy') return (Number(b.accuracy) || 0) - (Number(a.accuracy) || 0);
      if (sortBy === 'predictions') return (Number(b.total_predictions) || 0) - (Number(a.total_predictions) || 0);
      // Default: 'score'
      return (Number(b.score) || 0) - (Number(a.score) || 0);
    });

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const networkStats = {
    totalActiveUsers: totalCount,
    avgAccuracy:
      leaderboardData.length > 0
        ? (
            leaderboardData.reduce((sum, e) => sum + (Number(e.accuracy) || 0), 0) /
            leaderboardData.length
          ).toFixed(1)
        : '0.0',
    totalPredictions:
      leaderboardData.length > 0
        ? leaderboardData
            .reduce((sum, e) => sum + (Number(e.total_predictions) || 0), 0)
            .toLocaleString()
        : '0',
  };

  const TABS = [
    { value: 'global', label: 'Global' },
    { value: 'country', label: 'Country' },
    { value: 'city', label: 'City' },
  ];

  const periodLabel = (p: string) =>
    p === 'all-time' ? 'All Time' : p === '30-days' ? 'Last 30 Days' : 'Last 90 Days';

  return (
    <div className="min-h-screen bg-[#f8f8f6] dark:bg-[#0f0f0f] pb-20 md:pb-0">
      <TopNav />

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="flex items-center gap-2.5 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                <Trophy size={26} className="text-[#a855f7]" />
                Leaderboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                The world's top predictors. Ranked by their total points and performance over the selected period.
              </p>
            </div>
          </div>
        </div>

        {/* ── Tab + Controls Row ── */}
        <div className="flex items-center gap-1.5 mb-2 w-full">

          {/* Tab Switcher — search icon appended inside on mobile */}
          <div className="flex items-center gap-0.5 p-1 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm flex-shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedTab(tab.value)}
                className={`px-2.5 py-1.5 md:px-4 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedTab === tab.value
                    ? 'bg-[#a855f7] text-white shadow'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
            {/* Search icon button — mobile only */}
            <button
              onClick={() => {
                const next = !mobileSearchOpen;
                setMobileSearchOpen(next);
                if (next) {
                  setTimeout(() => mobileSearchInputRef.current?.focus(), 150);
                } else {
                  setSearchQuery('');
                  setCurrentPage(1);
                }
              }}
              className={`md:hidden ml-0.5 w-7 h-7 flex items-center justify-center rounded-lg transition-all flex-shrink-0 ${
                mobileSearchOpen
                  ? 'bg-[#a855f7] text-white'
                  : 'text-gray-400 hover:text-[#a855f7]'
              }`}
              aria-label="Toggle search"
            >
              <Search size={13} />
            </button>
          </div>

          {/* Desktop search bar (always visible on md+) */}
          <div className="hidden md:flex items-center gap-2 flex-1 min-w-[180px] px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Find a Prediction..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none w-full"
            />
          </div>

          {/* Controls — Period & Sort pushed to right */}
          <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">

            {/* Period Dropdown */}
            <div className="relative" ref={periodDropdownRef}>
              <button
                onClick={() => {
                  setPeriodDropdownOpen((prev) => !prev);
                  setSortDropdownOpen(false);
                }}
                className="flex items-center gap-1 px-2 py-2 md:px-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition"
              >
                <Calendar size={13} className="flex-shrink-0" />
                {/* Desktop: full label. Mobile: hidden, icon only */}
                <span className="hidden md:inline whitespace-nowrap">{periodLabel(period)}</span>
                <ChevronDown
                  size={10}
                  className={`text-gray-400 transition-transform flex-shrink-0 ${periodDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {periodDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-[999] p-1"
                  >
                    {['30-days', '90-days', 'all-time'].map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setPeriod(p);
                          setPeriodDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold ${
                          period === p
                            ? 'bg-[#a855f7] text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      >
                        {periodLabel(p)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => {
                  setSortDropdownOpen((prev) => !prev);
                  setPeriodDropdownOpen(false);
                }}
                className="flex items-center gap-1 px-2 py-2 md:px-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition"
              >
                <ArrowUpDown size={13} className="flex-shrink-0" />
                {/* Desktop: full label. Mobile: hidden, icon only */}
                <span className="hidden md:inline whitespace-nowrap">Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
                <ChevronDown
                  size={10}
                  className={`text-gray-400 transition-transform flex-shrink-0 ${sortDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {sortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-[999] p-1"
                  >
                    {['score', 'accuracy', 'predictions'].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setSortBy(s);
                          setSortDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold ${
                          sortBy === s
                            ? 'bg-[#a855f7] text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Mobile Animated Search Bar (mobile only, toggled by icon) ── */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden md:hidden"
            >
              <div className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-[#a855f7]/40 shadow-sm ring-1 ring-[#a855f7]/20">
                <Search size={14} className="text-[#a855f7] flex-shrink-0" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  placeholder="Find a Prediction..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none flex-1"
                />
                {searchQuery.length > 0 && (
                  <button
                    onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Category Filter ── */}
        {dbCategories.length > 0 && (
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 mb-5">
            {['All', ...dbCategories].map((cat) => {
              const isAll = cat === 'All';
              const id = isAll ? 'All' : (cat as any).id;
              const label = isAll ? 'All Categories' : (cat as any).fields;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedCategory == id
                      ? 'bg-[#a855f7] text-white border-[#a855f7] shadow-md shadow-[#a855f7]/20'
                      : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#a855f7]/40'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* ── User Standing & Quick Stats ── */}
        <div className="mb-6 space-y-4">
          {userStanding && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative overflow-hidden group"
            >
              {userStanding.total_predictions > 0 ? (
                <div className="rounded-[1.5rem] md:rounded-[2rem] border border-white/20 p-4 md:p-6 shadow-2xl flex items-center justify-between bg-gradient-to-br from-[#a855f7] via-[#8b5cf6] to-[#7c3aed] text-white relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                  <div className="absolute -left-4 -bottom-4 w-24 h-24 md:w-32 md:h-32 bg-black/10 rounded-full blur-2xl" />

                  <div className="flex items-center gap-3 md:gap-6 relative z-10">
                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white shadow-inner flex items-center justify-center text-[#8b5cf6] font-black text-sm md:text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                      {userStanding.rank ? `#${userStanding.rank}` : '?'}
                    </div>
                    <div>
                      <p className="text-[9px] md:text-xs uppercase font-black text-white/80 leading-none mb-1 tracking-[0.15em]">
                        {userStanding.rank ? 'Your Current Standing' : 'Ranking in Progress'}
                      </p>
                      <h2 className="font-black text-sm md:text-2xl text-white tracking-tight leading-tight">
                        {userStanding.rank
                          ? `Ranked #${userStanding.rank} ${selectedTab === 'global' ? 'Globally' : selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}`
                          : `${10 - userStanding.total_predictions} more for ranking`}
                      </h2>
                    </div>
                  </div>

                  <div className="text-right relative z-10 ml-2">
                    <p className="text-2xl md:text-4xl font-black text-white leading-none tracking-tighter">
                      {userStanding.score || '0'}
                    </p>
                    <p className="text-[9px] md:text-xs text-white/80 font-black mt-1 uppercase tracking-widest">
                      Points
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.5rem] md:rounded-[2rem] border border-white/20 p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-[#a855f7] via-[#8b5cf6] to-[#7c3aed] text-white relative overflow-hidden group gap-3 md:gap-0">
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
                    onClick={() => (window.location.href = '/')}
                    className="relative z-10 w-full md:w-auto px-5 py-2 md:px-6 md:py-3 bg-white text-[#8b5cf6] rounded-xl font-bold text-xs md:text-sm shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                  >
                    Start Predicting
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* Quick Stats — Mobile */}
          <div className="md:hidden grid grid-cols-3 gap-2">
            {[
              { label: 'Active Users', value: networkStats.totalActiveUsers.toLocaleString(), icon: <Users size={13} /> },
              { label: 'Avg Accuracy', value: `${networkStats.avgAccuracy}%`, icon: <Globe size={13} /> },
              { label: 'Predictions', value: networkStats.totalPredictions, icon: <Activity size={13} /> },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3 text-center"
              >
                <div className="flex items-center justify-center gap-1 text-[#a855f7] mb-1">
                  {stat.icon}
                </div>
                <p className="font-black text-sm text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main 2-Column Layout ── */}
        <div className="flex gap-5 items-start">

          {/* ── Left: Leaderboard List ── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2 bg-[#a855f7] text-white rounded-xl text-sm font-semibold"
                >
                  Retry
                </button>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="italic mb-1">No rankings yet</p>
                <p className="text-xs">Need 10+ predictions and 5+ avg votes to qualify.</p>
              </div>
            ) : (
              <>
                <motion.div className="space-y-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {paginatedList.map((entry, index) => {
                    const rank =
                      selectedCategory === 'All'
                        ? entry.rank || (currentPage - 1) * itemsPerPage + index + 1
                        : (currentPage - 1) * itemsPerPage + index + 1;
                    const medal = getRankMedal(rank);
                    const isCurrentUser = entry.user_id === currentUserId;

                    return (
                      <motion.div
                        key={entry.user_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className={`group flex items-center gap-3 md:gap-4 px-4 py-3.5 rounded-2xl bg-white dark:bg-white/5 border transition-all hover:shadow-md hover:border-[#a855f7]/30 ${
                          isCurrentUser
                            ? 'border-[#a855f7]/50 bg-gradient-to-r from-[#a855f7]/5 to-transparent dark:from-[#a855f7]/10'
                            : 'border-gray-100 dark:border-white/5'
                        }`}
                      >
                        {/* Rank */}
                        <div className="w-8 md:w-10 flex items-center justify-center flex-shrink-0">
                          {medal ? (
                            <span className="text-xl md:text-2xl">{medal}</span>
                          ) : (
                            <span className="text-sm md:text-base font-bold text-gray-400">{rank}</span>
                          )}
                        </div>

                        {/* Avatar */}
                        <Avatar className="w-9 h-9 md:w-11 md:h-11 flex-shrink-0 ring-2 ring-white dark:ring-black shadow-sm">
                          <AvatarImage src={entry.user?.avatar_url} />
                          <AvatarFallback className="bg-[#a855f7]/10 text-[#a855f7] font-bold text-sm">
                            {entry.user?.name?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm md:text-base text-gray-900 dark:text-white truncate leading-tight">
                              {entry.user?.name || 'Anonymous User'}
                            </p>
                            {entry.user?.username && (
                              <span className="text-xs text-gray-400 truncate">
                                @{entry.user.username}
                              </span>
                            )}
                            {isCurrentUser && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#a855f7]/15 text-[#a855f7] font-black uppercase flex-shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          {entry.user?.location && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin size={10} className="text-gray-400" />
                              <p className="text-xs text-gray-400 truncate">{entry.user.location}</p>
                            </div>
                          )}
                        </div>

                        {/* Score + Predictions */}
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-base md:text-xl font-black text-gray-900 dark:text-white">
                              {entry.score || 0}
                            </span>
                            <TrendingUp size={12} className="text-[#a855f7]" />
                          </div>
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                            {entry.total_predictions} Predictions
                          </p>
                          {/* Mini score bar */}
                          <div className="mt-1.5 w-24 md:w-32 h-1 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden ml-auto">
                            <div
                              className="h-full rounded-full bg-[#a855f7]"
                              style={{ width: `${Math.min(100, (entry.score / 1000) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-5 text-sm text-gray-500 dark:text-gray-400">
                  <p>
                    Showing top {(currentPage - 1) * itemsPerPage + 1}–
                    {Math.min(currentPage * itemsPerPage, filteredList.length)} of{' '}
                    {filteredList.length.toLocaleString()} predictors
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 font-semibold text-xs disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/10 transition"
                    >
                      Previous
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 font-semibold text-xs disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/10 transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Right Sidebar (Desktop only) ── */}
          <div className="hidden md:flex flex-col gap-4 w-72 flex-shrink-0">

            {/* Network Insights */}
            <div className="rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                Network Insights
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: <Users size={15} className="text-[#a855f7]" />,
                    label: 'Total Active Users',
                    value: networkStats.totalActiveUsers.toLocaleString(),
                  },
                  {
                    icon: <Globe size={15} className="text-[#a855f7]" />,
                    label: 'Avg. Network Accuracy',
                    value: `${networkStats.avgAccuracy}%`,
                  },
                  {
                    icon: <Activity size={15} className="text-[#a855f7]" />,
                    label: 'Predictions Made',
                    value: networkStats.totalPredictions,
                  },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#a855f7]/10 flex items-center justify-center flex-shrink-0">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                      <p className="font-black text-base text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer links */}
            <div className="text-center space-y-1">
              <div className="flex flex-wrap justify-center gap-3 text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                <button className="hover:text-gray-600 dark:hover:text-gray-200 transition">
                  Terms of Service
                </button>
                <button className="hover:text-gray-600 dark:hover:text-gray-200 transition">
                  Privacy Policy
                </button>
                <button className="hover:text-gray-600 dark:hover:text-gray-200 transition">
                  Help Center
                </button>
              </div>
              <p className="text-[10px] text-gray-300 dark:text-gray-600">Contact Us</p>
              <p className="text-[9px] text-gray-300 dark:text-gray-600">
                © 2024 | Said So Inc. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}