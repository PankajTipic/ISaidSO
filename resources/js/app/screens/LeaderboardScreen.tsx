
// import { useState, useEffect } from 'react';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
// import { LevelBadge } from '@/app/components/LevelBadge';
// import { MobileNav } from '@/app/components/MobileNav';
// import { TopNav } from '@/app/components/TopNav';
// import { Trophy, Target } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { toast } from 'sonner';
// import { getAuth } from '@/util/api';
// import { useAppSelector } from '@/app/store/hooks';

// export function LeaderboardScreen() {
//   const [selectedTab, setSelectedTab] = useState('global');
//   const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Get current user from Redux auth store
//   const currentUser = useAppSelector((state) => state.auth.user);
//   const currentUserId = currentUser?.id;

//   useEffect(() => {
//     const fetchLeaderboard = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // Pass location_scope to API
//         const rawData = await getAuth(`/api/leaderboard?location_scope=${selectedTab}`);
//         // Adjust for potential nested data depending on pagination/response wrap
//         const data = Array.isArray(rawData) ? rawData : rawData.data ?? [];

//         // We use .score as per UserScore model.
//         // Backend already sorts by total_score desc, but we can keep client-side sort as fallback
//         const sorted = data.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));

//         setLeaderboardData(sorted);
//       } catch (err: any) {
//         console.error('Leaderboard fetch error:', err);
//         setError(err.message || 'Failed to load leaderboard');
//         toast.error('Could not load leaderboard');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLeaderboard();
//   }, [selectedTab]);

//   const getRankMedal = (rank: number) => {
//     if (rank === 1) return '🥇';
//     if (rank === 2) return '🥈';
//     if (rank === 3) return '🥉';
//     return null;
//   };

//   const getRankColor = (rank: number) => {
//     if (rank === 1) return '#fbbf24';
//     if (rank === 2) return '#9ca3af';
//     if (rank === 3) return '#d97706';
//     return '#6b7280';
//   };

//   // Top 3 for podium
//   const topThree = leaderboardData.slice(0, 3);
//   // All users for the list (including top 3 again — that's how your original mock did it)
//   const fullList = leaderboardData;

//   return (
//     <div className="min-h-screen bg-background pb-24 md:pb-6">
//       <TopNav />

//       {/* Main Content */}
//       <div className="max-w-4xl mx-auto px-4 py-6">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold flex items-center gap-2">
//             <Trophy size={32} className="text-[#fbbf24]" />
//             Leaderboard
//           </h1>
//           <p className="text-muted-foreground mt-2">
//             Rankings based on scores earned from correct predictions
//           </p>
//         </div>

//         {/* Tabs */}
//         <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
//           <TabsList className="glass-card w-full justify-start">
//             <TabsTrigger value="global">Global</TabsTrigger>
//             <TabsTrigger value="country">Country</TabsTrigger>
//             <TabsTrigger value="city">City</TabsTrigger>
//           </TabsList>
//         </Tabs>

//         {loading ? (
//           <div className="text-center py-12">
//             <p className="text-muted-foreground animate-pulse">Loading leaderboard...</p>
//           </div>
//         ) : error ? (
//           <div className="text-center py-12 text-red-400">
//             <p>{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
//             >
//               Retry
//             </button>
//           </div>
//         ) : leaderboardData.length === 0 ? (
//           <div className="text-center py-12 text-muted-foreground">
//             <p>No rankings yet — be the first to earn points!</p>
//           </div>
//         ) : (
//           <>
//             {/* Top 3 Podium */}
//             <motion.div
//               className="glass-card rounded-2xl p-6 mb-6"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//             >
//               <div className="flex items-end justify-center gap-4 md:gap-8 mb-6">
//                 {/* 2nd Place */}
//                 {topThree[1] && (
//                   <div className="flex flex-col items-center flex-1">
//                     <Avatar className="w-16 h-16 md:w-20 md:h-20 mb-2 ring-4 ring-[#9ca3af]/50">
//                       <AvatarImage src={topThree[1].user?.avatar_url} alt={topThree[1].user?.name} />
//                       <AvatarFallback>{topThree[1].user?.name?.[0] || '?'}</AvatarFallback>
//                     </Avatar>
//                     <div className="text-4xl md:text-5xl mb-2">🥈</div>
//                     <p className="font-medium text-sm md:text-base text-center mb-1 truncate max-w-full">
//                       {topThree[1].user?.name || 'Anonymous'}
//                     </p>
//                     <LevelBadge level={1} size="sm" showTooltip={false} />
//                     <p className="text-xs md:text-sm text-muted-foreground mt-1">
//                       {topThree[1].score || 0} pts
//                     </p>
//                   </div>
//                 )}

//                 {/* 1st Place */}
//                 {topThree[0] && (
//                   <div className="flex flex-col items-center flex-1">
//                     <Avatar className="w-20 h-20 md:w-24 md:h-24 mb-2 ring-4 ring-[#fbbf24]/50">
//                       <AvatarImage src={topThree[0].user?.avatar_url} />
//                       <AvatarFallback>{topThree[0].user?.name?.[0] || '?'}</AvatarFallback>
//                     </Avatar>
//                     <div className="text-5xl md:text-6xl mb-2">🥇</div>
//                     <p className="font-medium text-base md:text-lg text-center mb-1 truncate max-w-full">
//                       {topThree[0].user?.name || 'Anonymous'}
//                     </p>
//                     <LevelBadge level={1} size="sm" showTooltip={false} />
//                     <p className="text-sm md:text-base text-muted-foreground mt-1">
//                       {topThree[0].score || 0} pts
//                     </p>
//                   </div>
//                 )}

//                 {/* 3rd Place */}
//                 {topThree[2] && (
//                   <div className="flex flex-col items-center flex-1">
//                     <Avatar className="w-16 h-16 md:w-20 md:h-20 mb-2 ring-4 ring-[#d97706]/50">
//                       <AvatarImage src={topThree[2].user?.avatar_url} />
//                       <AvatarFallback>{topThree[2].user?.name?.[0] || '?'}</AvatarFallback>
//                     </Avatar>
//                     <div className="text-4xl md:text-5xl mb-2">🥉</div>
//                     <p className="font-medium text-sm md:text-base text-center mb-1 truncate max-w-full">
//                       {topThree[2].user?.name || 'Anonymous'}
//                     </p>
//                     <LevelBadge level={1} size="sm" showTooltip={false} />
//                     <p className="text-xs md:text-sm text-muted-foreground mt-1">
//                       {topThree[2].score || 0} pts
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </motion.div>

//             {/* Full Leaderboard List - All Users */}
//             <motion.div
//               className="space-y-3"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.2 }}
//             >
//               {fullList.map((userPoint, index) => {
//                 const rank = index + 1;
//                 const medal = getRankMedal(rank);
//                 const rankColor = getRankColor(rank);
//                 const isCurrentUser = userPoint.user_id === currentUserId;

//                 return (
//                   <motion.div
//                     key={userPoint.id}
//                     className={`glass-card rounded-2xl p-4 transition-all ${isCurrentUser ? 'ring-2 ring-[#a855f7]' : ''
//                       }`}
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: index * 0.05 }}
//                     style={{
//                       background: isCurrentUser
//                         ? 'linear-gradient(135deg, #a855f722 0%, #a855f711 100%)'
//                         : undefined,
//                     }}
//                   >
//                     <div className="flex items-center gap-4">
//                       {/* Rank */}
//                       <div className="flex items-center justify-center w-10 h-10 flex-shrink-0">
//                         {medal ? (
//                           <span className="text-3xl">{medal}</span>
//                         ) : (
//                           <span className="text-xl font-bold" style={{ color: rankColor }}>
//                             {rank}
//                           </span>
//                         )}
//                       </div>

//                       {/* Avatar */}
//                       <Avatar className="w-12 h-12">
//                         <AvatarImage src={userPoint.user?.avatar_url} alt={userPoint.user?.name} />
//                         <AvatarFallback>{userPoint.user?.name?.[0] || '?'}</AvatarFallback>
//                       </Avatar>

//                       {/* User Info */}
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center gap-2 mb-1">
//                           <p className="font-medium truncate">
//                             {userPoint.user?.name || 'Anonymous'}
//                           </p>
//                           {isCurrentUser && (
//                             <span className="text-xs px-2 py-0.5 rounded-full bg-[#a855f7]/20 text-[#a855f7]">
//                               You
//                             </span>
//                           )}
//                         </div>
//                         <LevelBadge level={1} size="sm" showTooltip={false} />
//                       </div>

//                       {/* Points / Score */}
//                       <div className="flex flex-col items-end gap-1">
//                         <div className="flex items-center gap-1">
//                           <Trophy size={14} className="text-[#fbbf24]" />
//                           <span className="font-bold">{userPoint.score || 0}</span>
//                         </div>
//                       </div>
//                     </div>
//                   </motion.div>
//                 );
//               })}
//             </motion.div>

//             {/* Info Card */}
//             <div className="glass-card rounded-2xl p-4 mt-6">
//               <p className="text-sm text-center text-muted-foreground">
//                 Rankings are calculated based on <span className="font-bold text-foreground">score</span> from correct predictions.
//                 <br />
//                 Higher scores = better rank!
//               </p>
//             </div>
//           </>
//         )}
//       </div>

//       <MobileNav />
//     </div>
//   );
// }













import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { MobileNav } from '@/app/components/MobileNav';
import { TopNav } from '@/app/components/TopNav';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getAuth } from '@/util/api';
import { useAppSelector } from '@/app/store/hooks';

export function LeaderboardScreen() {
  const [selectedTab, setSelectedTab] = useState('global');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useAppSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAuth(`/api/leaderboard?location_scope=${selectedTab}`);
        const data = Array.isArray(response) ? response : response.data ?? [];

        // Sanitize accuracy (0–100) and score
        const sanitized = data.map((item: any) => ({
          ...item,
          accuracy: Math.min(100, Math.max(0, Number(item.accuracy) || 0)),
          score: Number(item.score) || 0,
        }));

        // Sort: score desc → accuracy desc
        const sorted = sanitized.sort((a: any, b: any) => {
          if (b.score !== a.score) return b.score - a.score;
          return b.accuracy - a.accuracy;
        });

        setLeaderboardData(sorted);
      } catch (err: any) {
        console.error('Leaderboard fetch error:', err);
        setError(err.message || 'Failed to load leaderboard');
        toast.error('Could not load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedTab]);

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

  const topThree = leaderboardData.slice(0, 3);
  const fullList = leaderboardData;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <TopNav />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center md:justify-start gap-3">
            <Trophy size={32} className="text-[#fbbf24]" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Rankings based on total score from correct predictions
          </p>
        </div>

        {/* Tabs */}
        {/* <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="glass-card w-full justify-center md:justify-start flex-wrap gap-2">
            <TabsTrigger value="global" className="flex-1 md:flex-none">Global</TabsTrigger>
            <TabsTrigger value="country" className="flex-1 md:flex-none">Country</TabsTrigger>
            <TabsTrigger value="city" className="flex-1 md:flex-none">City</TabsTrigger>
          </TabsList>
        </Tabs> */}

        <div className="flex justify-center mb-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full max-w-md">
            <TabsList className="glass-card w-full max-w-md justify-center rounded-2xl p-1.5">
              <TabsTrigger 
                value="global" 
                className="flex-1 h-10 md:h-11 rounded-xl text-xs md:text-sm font-medium data-[state=active]:bg-white/15 data-[state=active]:text-white hover:bg-white/5 transition-all"
              >
                Global
              </TabsTrigger>
              <TabsTrigger 
                value="country" 
                className="flex-1 h-10 md:h-11 rounded-xl text-xs md:text-sm font-medium data-[state=active]:bg-white/15 data-[state=active]:text-white hover:bg-white/5 transition-all"
              >
                Country
              </TabsTrigger>
              <TabsTrigger 
                value="city" 
                className="flex-1 h-10 md:h-11 rounded-xl text-xs md:text-sm font-medium data-[state=active]:bg-white/15 data-[state=active]:text-white hover:bg-white/5 transition-all"
              >
                City
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground animate-pulse text-lg">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-400">
            <p className="text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-8 py-3 bg-primary text-white rounded-xl text-lg"
            >
              Retry
            </button>
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No rankings yet — be the first to earn points!</p>
          </div>
        ) : (
          <>
            {/* Podium - Top 3 */}
            <motion.div
              className="glass-card rounded-2xl p-5 md:p-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6 md:gap-10">
                {/* 2nd Place */}
                {topThree[1] && (
                  <div className="flex flex-col items-center w-full md:w-auto">
                    <Avatar className="w-20 h-20 md:w-24 md:h-24 mb-3 ring-4 ring-gray-500/40">
                      <AvatarImage src={topThree[1].user?.avatar_url} alt={topThree[1].user?.name} />
                      <AvatarFallback>{topThree[1].user?.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="text-5xl md:text-6xl mb-2">🥈</div>
                    <p className="font-bold text-lg md:text-xl text-center mb-1 truncate max-w-[180px]">
                      {topThree[1].user?.name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {topThree[1].score || 0} pts • {topThree[1].accuracy?.toFixed(1) || 0}%
                    </p>
                  </div>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                  <div className="flex flex-col items-center w-full md:w-auto order-first md:order-none">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 mb-3 ring-4 ring-yellow-500/50">
                      <AvatarImage src={topThree[0].user?.avatar_url} alt={topThree[0].user?.name} />
                      <AvatarFallback>{topThree[0].user?.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="text-6xl md:text-7xl mb-2">🥇</div>
                    <p className="font-bold text-xl md:text-2xl text-center mb-1 truncate max-w-[220px]">
                      {topThree[0].user?.name || 'Anonymous'}
                    </p>
                    <p className="text-base text-muted-foreground">
                      {topThree[0].score || 0} pts • {topThree[0].accuracy?.toFixed(1) || 0}%
                    </p>
                  </div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <div className="flex flex-col items-center w-full md:w-auto">
                    <Avatar className="w-20 h-20 md:w-24 md:h-24 mb-3 ring-4 ring-amber-700/40">
                      <AvatarImage src={topThree[2].user?.avatar_url} alt={topThree[2].user?.name} />
                      <AvatarFallback>{topThree[2].user?.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="text-5xl md:text-6xl mb-2">🥉</div>
                    <p className="font-bold text-lg md:text-xl text-center mb-1 truncate max-w-[180px]">
                      {topThree[2].user?.name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {topThree[2].score || 0} pts • {topThree[2].accuracy?.toFixed(1) || 0}%
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Full Leaderboard List */}
            <motion.div
              className="space-y-3 md:space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {fullList.map((entry, index) => {
                const rank = index + 1;
                const medal = getRankMedal(rank);
                const rankColor = getRankColor(rank);
                const isCurrentUser = entry.user_id === currentUserId;

                return (
                  <motion.div
                    key={entry.user_id}
                    className={`glass-card rounded-xl md:rounded-2xl p-4 flex items-center gap-3 md:gap-4 transition-all ${
                      isCurrentUser ? 'ring-2 ring-[#a855f7] bg-gradient-to-r from-[#a855f711] to-transparent' : ''
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 flex-shrink-0 rounded-full bg-black/40 border border-white/10">
                      {medal ? (
                        <span className="text-xl md:text-2xl">{medal}</span>
                      ) : (
                        <span className="text-base md:text-xl font-bold" style={{ color: rankColor }}>
                          {rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <Avatar className="w-10 h-10 md:w-12 md:h-12">
                      <AvatarImage src={entry.user?.avatar_url} alt={entry.user?.name} />
                      <AvatarFallback>{entry.user?.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm md:text-base truncate">
                          {entry.user?.name || 'Anonymous'}
                        </p>
                        {isCurrentUser && (
                          <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-[#a855f7]/20 text-[#a855f7]">
                            You
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score & Accuracy */}
                    <div className="flex flex-col items-end text-right">
                      <div className="flex items-center gap-1.5">
                        <Trophy size={14} className="text-[#fbbf24]" />
                        <span className="font-bold text-base md:text-lg">
                          {entry.score || 0}
                        </span>
                      </div>
                      <div className="text-[11px] md:text-xs text-muted-foreground">
                        {entry.accuracy?.toFixed(1) || 0}%
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Footer Info */}
            <div className="glass-card rounded-2xl p-4 mt-8 text-center text-sm text-muted-foreground">
              Rankings are based on <span className="font-bold text-foreground">total score</span> from correct predictions.  
              Higher score = better rank!
            </div>
          </>
        )}
      </div>

      <MobileNav />
    </div>
  );
}