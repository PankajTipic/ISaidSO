// import { useState, useEffect } from 'react';
// import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
// import { PredictionCard } from '@/app/components/PredictionCard';
// import { MobileNav } from '@/app/components/MobileNav';
// import { TopNav } from '@/app/components/TopNav';
// import { Plus, TrendingUp } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'motion/react';
// import { toast } from 'sonner';
// import { getAuth } from '@/util/api';
// import { useAppSelector } from '@/app/store/hooks';

// const defaultCategories = [
//   { value: 'trending', label: 'Trending' },
// ];

// export function HomeScreen() {
//   const navigate = useNavigate();
//   const isGuest = useAppSelector((state) => state.auth.isGuest);
//   const [categories, setCategories] = useState<{ value: string, label: string }[]>(defaultCategories);
//   const [selectedCategory, setSelectedCategory] = useState('trending');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [predictions, setPredictions] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchFields = async () => {
//       try {
//         const data = await getAuth('/api/fields');
//         const items = Array.isArray(data) ? data : data.data ?? [];
//         const dynamicCats = items.map((f: any) => ({
//           value: f.fields.toLowerCase(),
//           label: f.fields,
//         }));
//         setCategories([...defaultCategories, ...dynamicCats]);
//       } catch (err) {
//         console.error('Failed to fetch categories:', err);
//       }
//     };
//     fetchFields();
//   }, []);

//   useEffect(() => {
//     const fetchPredictions = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const rawData = await getAuth('/api/predictions');
//         const items = Array.isArray(rawData) ? rawData : rawData.data ?? [];

//         setPredictions(items);
//       } catch (err: any) {
//         console.error('HomeScreen fetch failed:', err);
//         setError(err.message || 'Failed to load predictions');
//         toast.error('Could not load predictions');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPredictions();
//   }, []);

//   const filteredPredictions = predictions.filter((pred) => {
//     const categoryMatch =
//       selectedCategory === 'trending' ||
//       pred?.field?.fields?.toLowerCase() === selectedCategory.toLowerCase();

//     const searchMatch = pred?.questions
//       ?.toLowerCase()
//       .includes(searchQuery.toLowerCase());

//     return categoryMatch && (searchMatch ?? true);
//   });

//   return (
//     <div className="min-h-screen bg-background">
//       <TopNav 
//         showSearch={true} 
//         onSearchChange={setSearchQuery} 
//         searchQuery={searchQuery}
//         categories={categories}
//         predictions={predictions}
//         onCategorySelect={setSelectedCategory}
//       />

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
//         {/* Category Tabs */}
//         <Tabs
//           value={selectedCategory}
//           onValueChange={(v) => setSelectedCategory(v as string)}
//           className="mb-8"
//         >
//           <TabsList className="glass-card w-full justify-start overflow-x-auto scrollbar-hide p-1 bg-muted/50 rounded-2xl h-14">
//             {categories.map((cat) => (
//               <TabsTrigger
//                 key={cat.value}
//                 value={cat.value}
//                 className="rounded-xl h-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary"
//               >
//                 {cat.label}
//               </TabsTrigger>
//             ))}
//           </TabsList>
//         </Tabs>

//         {/* Predictions Grid */}
//         {loading ? (
//           <div className="text-center py-12">
//             <p className="text-muted-foreground animate-pulse">Loading predictions...</p>
//           </div>
//         ) : error ? (
//           <div className="text-center py-12 text-red-500">
//             <p>{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
//             >
//               Retry
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-12">
//             {/* Top Predictions Section */}
//             {filteredPredictions.length > 0 && selectedCategory === 'trending' && (
//               <section className="space-y-6">
//                 <div className="flex items-center justify-between px-1">
//                   <h2 className="text-xl font-black uppercase tracking-tighter text-foreground flex items-center gap-2">
//                     <TrendingUp className="text-primary" size={24} />
//                     Top Predictions
//                     <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full ml-2 font-black italic">HOT</span>
//                   </h2>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {[...filteredPredictions]
//                     .sort((a, b) => (b.answers_count || 0) - (a.answers_count || 0))
//                     .slice(0, 3)
//                     .map((prediction, index) => (
//                       <motion.div
//                         key={`top-${prediction.id}`}
//                         initial={{ opacity: 0, scale: 0.95 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ delay: index * 0.1 }}
//                         className="relative"
//                       >
//                         <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-lg rotate-12 uppercase tracking-widest border border-white/20">
//                           #{index + 1}
//                         </div>
//                         <PredictionCard prediction={prediction} />
//                       </motion.div>
//                     ))}
//                 </div>
//                 <div className="h-px bg-border/40 w-full pt-4" />
//               </section>
//             )}

//             {/* Regular Feed */}
//             <section className="space-y-6">
//               <div className="flex items-center justify-between px-1">
//                 <h2 className="text-xl font-black uppercase tracking-tighter text-foreground flex items-center gap-2">
//                   <Plus className="text-primary rotate-45" size={24} />
//                   Latest Forecasts
//                 </h2>
//               </div>
//               <motion.div
//                 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 {filteredPredictions
//                   .filter((p, i) => !(selectedCategory === 'trending' && [...filteredPredictions].sort((a, b) => (b.answers_count || 0) - (a.answers_count || 0)).slice(0, 3).some(top => top.id === p.id)))
//                   .map((prediction, index) => (
//                     <motion.div
//                       key={prediction.id}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: index * 0.05 }}
//                     >
//                       <PredictionCard prediction={prediction} />
//                     </motion.div>
//                   ))}

//                 {filteredPredictions.length === 0 && (
//                   <div className="col-span-full text-center py-20">
//                     <p className="text-muted-foreground text-lg">No predictions found</p>
//                     <p className="text-muted-foreground/60 text-sm mt-1">Try a different category or search term</p>
//                   </div>
//                 )}
//               </motion.div>
//             </section>
//           </div>
//         )}
//       </div>

//       {/* Floating Create Button - Mobile Only */}
//       {!isGuest && (
//         <button
//           onClick={() => navigate('/create')}
//           className="md:hidden fixed bottom-20 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-40 transition-transform hover:scale-110"
//           style={{
//             background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
//             boxShadow: '0 10px 25px rgba(168, 85, 247, 0.25)',
//           }}
//         >
//           <Plus size={28} className="text-white" />
//         </button>
//       )}

//       <MobileNav />
//     </div>
//   );
// }















// import { useState, useEffect } from 'react';
// import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
// import { PredictionCard } from '@/app/components/PredictionCard';
// import { MobileNav } from '@/app/components/MobileNav';
// import { TopNav } from '@/app/components/TopNav';
// import { Plus, TrendingUp } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'motion/react';
// import { toast } from 'sonner';
// import { getAuth } from '@/util/api';
// import { useAppSelector } from '@/app/store/hooks';

// const defaultCategories = [
//   { value: 'trending', label: 'Trending' },
// ];

// export function HomeScreen() {
//   const navigate = useNavigate();
//   const isGuest = useAppSelector((state) => state.auth.isGuest);
//   const [categories, setCategories] = useState<{ value: string, label: string }[]>(defaultCategories);
//   const [selectedCategory, setSelectedCategory] = useState('trending');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [predictions, setPredictions] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchFields = async () => {
//       try {
//         const data = await getAuth('/api/fields');
//         const items = Array.isArray(data) ? data : data.data ?? [];
//         const dynamicCats = items.map((f: any) => ({
//           value: f.fields.toLowerCase(),
//           label: f.fields,
//         }));
//         setCategories([...defaultCategories, ...dynamicCats]);
//       } catch (err) {
//         console.error('Failed to fetch categories:', err);
//       }
//     };
//     fetchFields();
//   }, []);

//   useEffect(() => {
//     const fetchPredictions = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const rawData = await getAuth('/api/predictions');
//         const items = Array.isArray(rawData) ? rawData : rawData.data ?? [];
//         setPredictions(items);
//       } catch (err: any) {
//         console.error('HomeScreen fetch failed:', err);
//         setError(err.message || 'Failed to load predictions');
//         toast.error('Could not load predictions');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPredictions();
//   }, []);

//   const topPredictions = selectedCategory === 'trending'
//     ? [...predictions]
//         .sort((a, b) => (b.answers_count || 0) - (a.answers_count || 0))
//         .slice(0, 3)
//     : [];

//   const topIds = new Set(topPredictions.map((p) => p.id));

//   const filteredPredictions = predictions.filter((pred) => {
//     const categoryMatch =
//       selectedCategory === 'trending' ||
//       pred?.field?.fields?.toLowerCase() === selectedCategory.toLowerCase();
//     const searchMatch = pred?.questions
//       ?.toLowerCase()
//       .includes(searchQuery.toLowerCase());
//     return categoryMatch && (searchMatch ?? true);
//   });

//   const latestPredictions = filteredPredictions.filter((p) => !topIds.has(p.id));

//   return (
//     <div className="min-h-screen bg-background">
//       <TopNav
//         showSearch={true}
//         onSearchChange={setSearchQuery}
//         searchQuery={searchQuery}
//         categories={categories}
//         predictions={predictions}
//         onCategorySelect={setSelectedCategory}
//       />

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-2 py-2 pb-20 md:px-4 md:py-6 md:pb-6">

//         {/* Category Tabs */}
//         <Tabs
//           value={selectedCategory}
//           onValueChange={(v) => setSelectedCategory(v as string)}
//           className="mb-2 md:mb-8"
//         >
//           <TabsList className="glass-card w-full justify-start overflow-x-auto scrollbar-hide p-0.5 bg-muted/50 rounded-lg md:rounded-2xl h-8 md:h-14">
//             {categories.map((cat) => (
//               <TabsTrigger
//                 key={cat.value}
//                 value={cat.value}
//                 className="rounded-md md:rounded-xl h-full px-2.5 md:px-6 text-[10px] md:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary whitespace-nowrap"
//               >
//                 {cat.label}
//               </TabsTrigger>
//             ))}
//           </TabsList>
//         </Tabs>

//         {/* Predictions Grid */}
//         {loading ? (
//           <div className="text-center py-8">
//             <p className="text-muted-foreground text-xs animate-pulse">Loading predictions...</p>
//           </div>
//         ) : error ? (
//           <div className="text-center py-8 text-red-500">
//             <p className="text-xs">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="mt-2 px-4 py-1 text-xs bg-primary text-white rounded-lg"
//             >
//               Retry
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-2 md:space-y-12">

//             {/* Top Predictions Section */}
//             {topPredictions.length > 0 && (
//               <section className="space-y-1 md:space-y-6">
//                 <div className="flex items-center px-0.5">
//                   <h2 className="text-[10px] md:text-xl font-black uppercase tracking-tighter text-foreground flex items-center gap-1">
//                     <TrendingUp className="text-primary" size={11} />
//                     Top Predictions
//                     <span className="bg-primary/10 text-primary text-[8px] px-1 py-0.5 rounded-full ml-1 font-black italic">HOT</span>
//                   </h2>
//                 </div>
//                 <div className="flex flex-col gap-0.5 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
//                   {topPredictions.map((prediction, index) => (
//                     <motion.div
//                       key={`top-${prediction.id}`}
//                       initial={{ opacity: 0, scale: 0.95 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{ delay: index * 0.1 }}
//                       className="relative w-full"
//                     >
//                       <div className="absolute -top-1 -right-1 z-10 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-lg rotate-12 uppercase tracking-widest border border-white/20">
//                         #{index + 1}
//                       </div>
//                       <PredictionCard prediction={prediction} />
//                     </motion.div>
//                   ))}
//                 </div>
//                 <div className="h-px bg-border/40 w-full" />
//               </section>
//             )}

//             {/* Latest Forecasts Section */}
//             <section className="space-y-1 md:space-y-6">
//               <div className="flex items-center px-0.5">
//                 <h2 className="text-[10px] md:text-xl font-black uppercase tracking-tighter text-foreground flex items-center gap-1">
//                   <Plus className="text-primary rotate-45" size={11} />
//                   Latest Forecasts
//                 </h2>
//               </div>
//               <motion.div
//                 className="flex flex-col gap-0.5 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 {latestPredictions.map((prediction, index) => (
//                   <motion.div
//                     key={prediction.id}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: index * 0.05 }}
//                     className="w-full"
//                   >
//                     <PredictionCard prediction={prediction} />
//                   </motion.div>
//                 ))}

//                 {filteredPredictions.length === 0 && (
//                   <div className="col-span-full text-center py-8">
//                     <p className="text-muted-foreground text-xs">No predictions found</p>
//                     <p className="text-muted-foreground/60 text-[10px] mt-0.5">Try a different category or search term</p>
//                   </div>
//                 )}
//               </motion.div>
//             </section>

//           </div>
//         )}
//       </div>

//       {/* Floating Create Button - Mobile Only */}
//       {!isGuest && (
//         <button
//           onClick={() => navigate('/create')}
//           className="md:hidden fixed bottom-20 right-4 w-11 h-11 rounded-full flex items-center justify-center shadow-2xl z-40 transition-transform hover:scale-110 active:scale-95"
//           style={{
//             background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
//             boxShadow: '0 8px 20px rgba(168, 85, 247, 0.3)',
//           }}
//         >
//           <Plus size={20} className="text-white" />
//         </button>
//       )}

//       <MobileNav />
//     </div>
//   );
// }















import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { PredictionCard } from '@/app/components/PredictionCard';
import { MobileNav } from '@/app/components/MobileNav';
import { TopNav } from '@/app/components/TopNav';
import { Plus, TrendingUp, Flame, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { getAuth } from '@/util/api';
import { useAppSelector } from '@/app/store/hooks';

const defaultCategories = [
  { value: 'trending', label: 'Trending' },
];

export function HomeScreen() {
  const navigate = useNavigate();
  const isGuest = useAppSelector((state) => state.auth.isGuest);
  const [categories, setCategories] = useState<{ value: string, label: string }[]>(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const data = await getAuth('/api/fields');
        const items = Array.isArray(data) ? data : data.data ?? [];
        const dynamicCats = items.map((f: any) => ({
          value: f.fields.toLowerCase(),
          label: f.fields,
        }));
        setCategories([...defaultCategories, ...dynamicCats]);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchFields();
  }, []);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        setError(null);
        const rawData = await getAuth('/api/predictions');
        const items = Array.isArray(rawData) ? rawData : rawData.data ?? [];
        setPredictions(items);
      } catch (err: any) {
        console.error('HomeScreen fetch failed:', err);
        setError(err.message || 'Failed to load predictions');
        toast.error('Could not load predictions');
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  const topPredictions = selectedCategory === 'trending'
    ? [...predictions]
        .sort((a, b) => (b.answers_count || 0) - (a.answers_count || 0))
        .slice(0, 3)
    : [];

  const topIds = new Set(topPredictions.map((p) => p.id));

  const filteredPredictions = predictions.filter((pred) => {
    const categoryMatch =
      selectedCategory === 'trending' ||
      pred?.field?.fields?.toLowerCase() === selectedCategory.toLowerCase();
    const searchMatch = pred?.questions
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return categoryMatch && (searchMatch ?? true);
  });

  const latestPredictions = filteredPredictions.filter((p) => !topIds.has(p.id));

  return (
    <div className="min-h-screen bg-background">
      <TopNav
        showSearch={true}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        categories={categories}
        predictions={predictions}
        onCategorySelect={setSelectedCategory}
      />

      <div className="max-w-7xl mx-auto px-3 py-3 pb-24 md:px-6 md:py-6 md:pb-8">

        {/* ═══════════════════════════════════════════════
            FILTER TABS
            Mobile  → Instagram Stories chip style
                      15-16px bold, pill shape, scrollable
            Desktop → clean tab bar, 14px semibold
        ═══════════════════════════════════════════════ */}
        <div className="mb-5 md:mb-8">
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as string)}>

            {/* ── MOBILE chip strip ── */}
            <TabsList
              className="
                md:hidden
                w-full h-auto p-0 pb-0.5
                bg-transparent border-0 shadow-none
                flex gap-2 overflow-x-auto scrollbar-hide
                justify-start items-center
              "
            >
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="
                    flex-shrink-0 flex items-center gap-1.5
                    rounded-full
                    h-9 px-4
                    /* ── KEY: 15px matches FB/IG label size exactly ── */
                    text-[15px] font-semibold leading-none
                    whitespace-nowrap tracking-[-0.01em]
                    transition-all duration-200

                    /* unselected pill */
                    bg-muted text-muted-foreground
                    border border-border/50

                    /* selected pill — solid fill like IG active filter */
                    data-[state=active]:bg-primary
                    data-[state=active]:text-primary-foreground
                    data-[state=active]:border-primary
                    data-[state=active]:shadow-sm

                    /* remove default radix ring */
                    ring-0 focus-visible:ring-0 focus-visible:outline-none
                  "
                >
                  {cat.value === 'trending' && (
                    <Flame
                      size={14}
                      className="data-[state=active]:text-primary-foreground"
                    />
                  )}
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── DESKTOP tab bar ── */}
            <TabsList
              className="
                hidden md:flex
                w-full h-12 p-1
                bg-muted/40 border border-border/30
                rounded-2xl gap-1
                overflow-x-auto scrollbar-hide
              "
            >
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="
                    rounded-xl h-full px-5
                    text-sm font-semibold
                    whitespace-nowrap
                    text-muted-foreground
                    transition-all duration-200
                    data-[state=active]:bg-background
                    data-[state=active]:text-foreground
                    data-[state=active]:shadow-sm
                    ring-0 focus-visible:ring-0
                  "
                >
                  {cat.value === 'trending' && (
                    <Flame size={13} className="inline mr-1.5 mb-px text-orange-500" />
                  )}
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

          </Tabs>
        </div>

        {/* ── CONTENT ── */}
        <AnimatePresence mode="wait">

          {/* Loading skeletons */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-2xl bg-muted/50 animate-pulse"
                  style={{ animationDelay: `${i * 60}ms` }}
                />
              ))}
            </motion.div>
          )}

          {/* Error */}
          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-16 gap-3"
            >
              {/* 16px readable error — FB/IG standard body size */}
              <p className="text-[16px] font-semibold text-destructive text-center px-4">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-1 px-5 py-2.5 text-[15px] font-semibold bg-primary text-primary-foreground rounded-full shadow"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Main feed */}
          {!loading && !error && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="space-y-6 md:space-y-12"
            >

              {/* ── TOP PREDICTIONS section ── */}
              {topPredictions.length > 0 && (
                <section className="space-y-3 md:space-y-5">

                  {/* Section header
                      Mobile: 17px bold — same weight/size as FB section labels
                      ("Suggested for you", "Stories from friends") */}
                  <div className="flex items-center gap-2 px-0.5">
                    <TrendingUp size={18} className="text-primary flex-shrink-0" />
                    <h2 className="text-[17px] md:text-xl font-bold text-foreground leading-snug">
                      Top Predictions
                    </h2>
                    <span className="
                      inline-flex items-center gap-1
                      bg-orange-500/12 text-orange-600
                      dark:bg-orange-400/15 dark:text-orange-400
                      text-[12px] font-bold
                      px-2 py-0.5 rounded-full
                      border border-orange-400/25
                    ">
                      <Flame size={10} fill="currentColor" /> HOT
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
                    {topPredictions.map((prediction, index) => (
                      <motion.div
                        key={`top-${prediction.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
                        className="relative w-full"
                      >
                        {/* Rank badge */}
                        <div className="
                          absolute -top-1.5 -right-1.5 z-10
                          w-6 h-6 rounded-full flex items-center justify-center
                          bg-gradient-to-br from-amber-400 to-orange-500
                          text-white text-[11px] font-black
                          shadow-md border-2 border-background
                        ">
                          {index + 1}
                        </div>
                        <PredictionCard prediction={prediction} />
                      </motion.div>
                    ))}
                  </div>

                  <div className="h-px bg-border/40 w-full" />
                </section>
              )}

              {/* ── LATEST FORECASTS section ── */}
              <section className="space-y-3 md:space-y-5">

                <div className="flex items-center gap-2 px-0.5">
                  <Sparkles size={18} className="text-primary flex-shrink-0" />
                  {/* 17px bold — FB/IG section label standard */}
                  <h2 className="text-[17px] md:text-xl font-bold text-foreground leading-snug">
                    Latest Forecasts
                  </h2>
                  {latestPredictions.length > 0 && (
                    /* Count chip — 13px, same as IG notification badge text */
                    <span className="text-[13px] font-medium text-muted-foreground">
                      {latestPredictions.length}
                    </span>
                  )}
                </div>

                <motion.div
                  className="flex flex-col gap-2.5 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  {latestPredictions.map((prediction, index) => (
                    <motion.div
                      key={prediction.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, type: 'spring', stiffness: 280, damping: 22 }}
                      className="w-full"
                    >
                      <PredictionCard prediction={prediction} />
                    </motion.div>
                  ))}

                  {filteredPredictions.length === 0 && (
                    <div className="col-span-full flex flex-col items-center py-16 gap-2">
                      {/* Empty state — FB/IG uses 16-17px for primary message */}
                      <p className="text-[16px] font-semibold text-foreground/70">
                        No predictions found
                      </p>
                      <p className="text-[14px] text-muted-foreground text-center">
                        Try a different category or search term
                      </p>
                    </div>
                  )}
                </motion.div>
              </section>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── FAB — mobile only ── */}
      {!isGuest && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate('/create')}
          className="md:hidden fixed bottom-20 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl z-40"
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
            boxShadow: '0 8px 20px rgba(168, 85, 247, 0.35)',
          }}
        >
          <Plus size={22} className="text-white" strokeWidth={2.5} />
        </motion.button>
      )}

      <MobileNav />
    </div>
  );
}