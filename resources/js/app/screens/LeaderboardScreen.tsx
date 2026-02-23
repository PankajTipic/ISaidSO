// import { useState } from 'react';
// import { MobileNav } from '@/app/components/MobileNav';
// import { TopNav } from '@/app/components/TopNav';
// import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
// import { LevelBadge } from '@/app/components/LevelBadge';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
// import { mockUsers } from '@/app/data/mockData';
// import { Trophy, Target } from 'lucide-react';
// import { motion } from 'motion/react';

// export function LeaderboardScreen() {
//   const [selectedTab, setSelectedTab] = useState('global');

//   // Sort users by rank score
//   const sortedUsers = [...mockUsers].sort((a, b) => b.rankScore - a.rankScore);

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
//             Rankings based on prediction accuracy and consistency
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

//         {/* Top 3 Podium */}
//         <motion.div
//           className="glass-card rounded-2xl p-6 mb-6"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           <div className="flex items-end justify-center gap-4 mb-6">
//             {/* 2nd Place */}
//             {sortedUsers[1] && (
//               <div className="flex flex-col items-center flex-1">
//                 <Avatar className="w-16 h-16 mb-2 ring-4 ring-[#9ca3af]/50">
//                   <AvatarImage src={sortedUsers[1].avatar} alt={sortedUsers[1].username} />
//                   <AvatarFallback>{sortedUsers[1].username[0]}</AvatarFallback>
//                 </Avatar>
//                 <div className="text-4xl mb-2">🥈</div>
//                 <p className="font-medium text-sm text-center mb-1">{sortedUsers[1].username}</p>
//                 <LevelBadge level={sortedUsers[1].level} size="sm" showTooltip={false} />
//                 <p className="text-xs text-muted-foreground mt-1">{sortedUsers[1].accuracy.toFixed(1)}%</p>
//                 <p className="text-sm font-bold text-[#9ca3af] mt-1">{sortedUsers[1].rankScore}</p>
//               </div>
//             )}

//             {/* 1st Place */}
//             {sortedUsers[0] && (
//               <div className="flex flex-col items-center flex-1">
//                 <Avatar className="w-20 h-20 mb-2 ring-4 ring-[#fbbf24]/50">
//                   <AvatarImage src={sortedUsers[0].avatar} alt={sortedUsers[0].username} />
//                   <AvatarFallback>{sortedUsers[0].username[0]}</AvatarFallback>
//                 </Avatar>
//                 <div className="text-5xl mb-2">🥇</div>
//                 <p className="font-medium text-center mb-1">{sortedUsers[0].username}</p>
//                 <LevelBadge level={sortedUsers[0].level} size="sm" showTooltip={false} />
//                 <p className="text-xs text-muted-foreground mt-1">{sortedUsers[0].accuracy.toFixed(1)}%</p>
//                 <p className="font-bold text-[#fbbf24] mt-1">{sortedUsers[0].rankScore}</p>
//               </div>
//             )}

//             {/* 3rd Place */}
//             {sortedUsers[2] && (
//               <div className="flex flex-col items-center flex-1">
//                 <Avatar className="w-16 h-16 mb-2 ring-4 ring-[#d97706]/50">
//                   <AvatarImage src={sortedUsers[2].avatar} alt={sortedUsers[2].username} />
//                   <AvatarFallback>{sortedUsers[2].username[0]}</AvatarFallback>
//                 </Avatar>
//                 <div className="text-4xl mb-2">🥉</div>
//                 <p className="font-medium text-sm text-center mb-1">{sortedUsers[2].username}</p>
//                 <LevelBadge level={sortedUsers[2].level} size="sm" showTooltip={false} />
//                 <p className="text-xs text-muted-foreground mt-1">{sortedUsers[2].accuracy.toFixed(1)}%</p>
//                 <p className="text-sm font-bold text-[#d97706] mt-1">{sortedUsers[2].rankScore}</p>
//               </div>
//             )}
//           </div>
//         </motion.div>

//         {/* Full Leaderboard */}
//         <motion.div
//           className="space-y-3"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.2 }}
//         >
//           {sortedUsers.map((user, index) => {
//             const rank = index + 1;
//             const medal = getRankMedal(rank);
//             const rankColor = getRankColor(rank);
//             const isCurrentUser = user.id === mockUsers[0].id;

//             return (
//               <motion.div
//                 key={user.id}
//                 className={`glass-card rounded-2xl p-4 transition-all ${
//                   isCurrentUser ? 'ring-2 ring-[#a855f7]' : ''
//                 }`}
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: index * 0.05 }}
//                 style={{
//                   background: isCurrentUser
//                     ? 'linear-gradient(135deg, #a855f722 0%, #a855f711 100%)'
//                     : undefined,
//                 }}
//               >
//                 <div className="flex items-center gap-4">
//                   {/* Rank */}
//                   <div className="flex items-center justify-center w-10 h-10 flex-shrink-0">
//                     {medal ? (
//                       <span className="text-3xl">{medal}</span>
//                     ) : (
//                       <span className="text-xl font-bold" style={{ color: rankColor }}>
//                         {rank}
//                       </span>
//                     )}
//                   </div>

//                   {/* Avatar */}
//                   <Avatar className="w-12 h-12">
//                     <AvatarImage src={user.avatar} alt={user.username} />
//                     <AvatarFallback>{user.username[0]}</AvatarFallback>
//                   </Avatar>

//                   {/* User Info */}
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 mb-1">
//                       <p className="font-medium truncate">{user.username}</p>
//                       {isCurrentUser && (
//                         <span className="text-xs px-2 py-0.5 rounded-full bg-[#a855f7]/20 text-[#a855f7]">
//                           You
//                         </span>
//                       )}
//                     </div>
//                     <LevelBadge level={user.level} size="sm" showTooltip={false} />
//                   </div>

//                   {/* Stats */}
//                   <div className="flex flex-col items-end gap-1">
//                     <div className="flex items-center gap-1">
//                       <Trophy size={14} className="text-[#fbbf24]" />
//                       <span className="font-bold">{user.rankScore}</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Target size={14} className="text-[#10b981]" />
//                       <span className="text-sm text-[#10b981]">{user.accuracy.toFixed(1)}%</span>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             );
//           })}
//         </motion.div>

//         {/* Info Card */}
//         <div className="glass-card rounded-2xl p-4 mt-6">
//           <p className="text-sm text-center text-muted-foreground">
//             Rankings are calculated based on <span className="font-bold text-foreground">accuracy</span>,{' '}
//             <span className="font-bold text-foreground">consistency</span>, and{' '}
//             <span className="font-bold text-foreground">number of predictions</span>.
//             <br />
//             Voting does not affect your rank!
//           </p>
//         </div>
//       </div>

//       <MobileNav />
//     </div>
//   );
// }











import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { LevelBadge } from '@/app/components/LevelBadge';
import { MobileNav } from '@/app/components/MobileNav';
import { TopNav } from '@/app/components/TopNav';
import { Trophy, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function LeaderboardScreen() {
  const [selectedTab, setSelectedTab] = useState('global');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Replace with real current user ID from your auth system
  const currentUserId = 1;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/points', {
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to load leaderboard: ${res.status} - ${text.substring(0, 120)}`);
        }

        const data = await res.json();

        // Sort by points descending (highest first)
        const sorted = Array.isArray(data)
          ? data.sort((a: any, b: any) => (b.points || 0) - (a.points || 0))
          : [];

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
  }, []);

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#fbbf24';
    if (rank === 2) return '#9ca3af';
    if (rank === 3) return '#d97706';
    return '#6b7280';
  };

  // Top 3 for podium
  const topThree = leaderboardData.slice(0, 3);
  // All users for the list (including top 3 again — that's how your original mock did it)
  const fullList = leaderboardData;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <TopNav />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy size={32} className="text-[#fbbf24]" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Rankings based on points earned from correct predictions
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="glass-card w-full justify-start">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="country" disabled>Country</TabsTrigger>
            <TabsTrigger value="city" disabled>City</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground animate-pulse">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No rankings yet — be the first to earn points!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <motion.div
              className="glass-card rounded-2xl p-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-end justify-center gap-4 md:gap-8 mb-6">
                {/* 2nd Place */}
                {topThree[1] && (
                  <div className="flex flex-col items-center flex-1">
                    <Avatar className="w-16 h-16 md:w-20 md:h-20 mb-2 ring-4 ring-[#9ca3af]/50">
                      <AvatarImage src={topThree[1].user?.avatar_url} alt={topThree[1].user?.name} />
                      <AvatarFallback>{topThree[1].user?.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="text-4xl md:text-5xl mb-2">🥈</div>
                    <p className="font-medium text-sm md:text-base text-center mb-1 truncate max-w-full">
                      {topThree[1].user?.name || 'Anonymous'}
                    </p>
                    <LevelBadge level={1} size="sm" showTooltip={false} />
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {topThree[1].points || 0} pts
                    </p>
                  </div>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                  <div className="flex flex-col items-center flex-1">
                    <Avatar className="w-20 h-20 md:w-24 md:h-24 mb-2 ring-4 ring-[#fbbf24]/50">
                      <AvatarImage src={topThree[0].user?.avatar_url} />
                      <AvatarFallback>{topThree[0].user?.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="text-5xl md:text-6xl mb-2">🥇</div>
                    <p className="font-medium text-base md:text-lg text-center mb-1 truncate max-w-full">
                      {topThree[0].user?.name || 'Anonymous'}
                    </p>
                    <LevelBadge level={1} size="sm" showTooltip={false} />
                    <p className="text-sm md:text-base text-muted-foreground mt-1">
                      {topThree[0].points || 0} pts
                    </p>
                  </div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <div className="flex flex-col items-center flex-1">
                    <Avatar className="w-16 h-16 md:w-20 md:h-20 mb-2 ring-4 ring-[#d97706]/50">
                      <AvatarImage src={topThree[2].user?.avatar_url} />
                      <AvatarFallback>{topThree[2].user?.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="text-4xl md:text-5xl mb-2">🥉</div>
                    <p className="font-medium text-sm md:text-base text-center mb-1 truncate max-w-full">
                      {topThree[2].user?.name || 'Anonymous'}
                    </p>
                    <LevelBadge level={1} size="sm" showTooltip={false} />
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {topThree[2].points || 0} pts
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Full Leaderboard List - All Users */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {fullList.map((userPoint, index) => {
                const rank = index + 1;
                const medal = getRankMedal(rank);
                const rankColor = getRankColor(rank);
                const isCurrentUser = userPoint.user_id === currentUserId;

                return (
                  <motion.div
                    key={userPoint.id}
                    className={`glass-card rounded-2xl p-4 transition-all ${
                      isCurrentUser ? 'ring-2 ring-[#a855f7]' : ''
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      background: isCurrentUser
                        ? 'linear-gradient(135deg, #a855f722 0%, #a855f711 100%)'
                        : undefined,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-10 h-10 flex-shrink-0">
                        {medal ? (
                          <span className="text-3xl">{medal}</span>
                        ) : (
                          <span className="text-xl font-bold" style={{ color: rankColor }}>
                            {rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={userPoint.user?.avatar_url} alt={userPoint.user?.name} />
                        <AvatarFallback>{userPoint.user?.name?.[0] || '?'}</AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">
                            {userPoint.user?.name || 'Anonymous'}
                          </p>
                          {isCurrentUser && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#a855f7]/20 text-[#a855f7]">
                              You
                            </span>
                          )}
                        </div>
                        <LevelBadge level={1} size="sm" showTooltip={false} />
                      </div>

                      {/* Points */}
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1">
                          <Trophy size={14} className="text-[#fbbf24]" />
                          <span className="font-bold">{userPoint.points || 0}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Info Card */}
            <div className="glass-card rounded-2xl p-4 mt-6">
              <p className="text-sm text-center text-muted-foreground">
                Rankings are calculated based on <span className="font-bold text-foreground">points earned</span> from correct predictions.
                <br />
                Higher points = better rank!
              </p>
            </div>
          </>
        )}
      </div>

      <MobileNav />
    </div>
  );
}