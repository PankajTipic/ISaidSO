// import { useState } from 'react';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
// import { PredictionCard } from '@/app/components/PredictionCard';
// import { MobileNav } from '@/app/components/MobileNav';
// import { TopNav } from '@/app/components/TopNav';
// import { mockPredictions, currentUser } from '@/app/data/mockData';
// import { Category } from '@/app/types';
// import { Plus } from 'lucide-react';
// import { useNavigate } from 'react-router';
// import { motion } from 'motion/react';

// const categories: { value: Category; label: string }[] = [
//   { value: 'trending', label: 'Trending' },
//   { value: 'politics', label: 'Politics' },
//   { value: 'sports', label: 'Sports' },
//   { value: 'finance', label: 'Finance' },
//   { value: 'education', label: 'Education' },
//   { value: 'entertainment', label: 'Entertainment' },
// ];

// export function HomeScreen() {
//   const navigate = useNavigate();
//   const [selectedCategory, setSelectedCategory] = useState<Category>('trending');
//   const [searchQuery, setSearchQuery] = useState('');

//   const filteredPredictions = mockPredictions.filter((pred) => {
//     const categoryMatch = selectedCategory === 'trending' || pred.category === selectedCategory;
//     const searchMatch = pred.text.toLowerCase().includes(searchQuery.toLowerCase());
//     return categoryMatch && searchMatch;
//   });

//   return (
//     <div className="min-h-screen bg-background">
//       <TopNav showSearch={true} onSearchChange={setSearchQuery} searchQuery={searchQuery} />

//       {/* Main Content */}
//       <div className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-6">
//         {/* Category Tabs */}
//         <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as Category)} className="mb-6">
//           <TabsList className="glass-card w-full justify-start overflow-x-auto scrollbar-hide">
//             {categories.map((cat) => (
//               <TabsTrigger
//                 key={cat.value}
//                 value={cat.value}
//                 className="data-[state=active]:bg-[#a855f7]/20 data-[state=active]:text-[#a855f7]"
//               >
//                 {cat.label}
//               </TabsTrigger>
//             ))}
//           </TabsList>
//         </Tabs>

//         {/* Predictions Grid */}
//         <motion.div
//           className="space-y-4"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.3 }}
//         >
//           {filteredPredictions.map((prediction, index) => (
//             <motion.div
//               key={prediction.id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.05 }}
//             >
//               <PredictionCard prediction={prediction} />
//             </motion.div>
//           ))}

//           {filteredPredictions.length === 0 && (
//             <div className="text-center py-12">
//               <p className="text-muted-foreground">No predictions found</p>
//             </div>
//           )}
//         </motion.div>
//       </div>

//       {/* Floating Create Button - Mobile Only */}
//       <button
//         onClick={() => navigate('/create')}
//         className="md:hidden fixed bottom-20 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-40 transition-transform hover:scale-110"
//         style={{
//           background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
//           boxShadow: '0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(168, 85, 247, 0.3)',
//         }}
//       >
//         <Plus size={28} className="text-white" />
//       </button>






//       <MobileNav />
//     </div>
//   );
// }


















// import { useState, useEffect } from 'react';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
// import { PredictionCard } from '@/app/components/PredictionCard';
// import { MobileNav } from '@/app/components/MobileNav';
// import { TopNav } from '@/app/components/TopNav';
// import { Plus } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { toast } from 'sonner';
// import { formatDistanceToNow } from 'date-fns'; // make sure this import exists

// const categories = [
//   { value: 'trending', label: 'Trending' },
//   { value: 'politics', label: 'Politics' },
//   { value: 'sports', label: 'Sports' },
//   { value: 'finance', label: 'Finance' },
//   { value: 'education', label: 'Education' },
//   { value: 'entertainment', label: 'Entertainment' },
// ];

// export function HomeScreen() {
//   const navigate = useNavigate();
//   const [selectedCategory, setSelectedCategory] = useState('trending');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [predictions, setPredictions] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchPredictions = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const url = '/api/public-questions'; // adjust if your route is different (e.g. /public-questions)

//         const res = await fetch(url, {
//           headers: {
//             'Accept': 'application/json',
//           },
//           credentials: 'include', // keep only if using cookie-based auth
//         });

//         if (!res.ok) {
//           const text = await res.text();
//           let msg = text;
//           try {
//             const json = await res.json();
//             msg = json.message || json.error || text;
//           } catch {}
//           throw new Error(`Server error ${res.status}: ${msg.substring(0, 150)}`);
//         }

//         const data = await res.json();
//         const items = Array.isArray(data) ? data : data.data ?? data ?? [];

//         console.log("Raw predictions from API:", items);
//         if (items.length > 0) {
//           console.log("First prediction keys:", Object.keys(items[0]));
//           console.log("First created_at:", items[0]?.created_at);
//         }

//         setPredictions(items);
//       } catch (err: any) {
//         console.error('[HomeScreen] Fetch failed:', err);
//         setError(err.message || 'Failed to load predictions');
//         toast.error('Could not load predictions');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPredictions();
//   }, []);

//   const filtered = predictions.filter((pred: any) => {
//     const matchesCategory =
//       selectedCategory === 'trending' ||
//       pred?.field?.fields?.toLowerCase() === selectedCategory.toLowerCase();

//     const matchesSearch = (pred?.questions || '')
//       .toLowerCase()
//       .includes(searchQuery.toLowerCase());

//     return matchesCategory && matchesSearch;
//   });

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-muted-foreground animate-pulse">Loading predictions...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
//         <div className="text-center">
//           <p className="text-red-400 text-lg font-medium mb-2">Something went wrong</p>
//           <p className="text-muted-foreground">{error}</p>
//         </div>
//         <button
//           onClick={() => window.location.reload()}
//           className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 transition"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background pb-24 md:pb-6">
//       <TopNav
//         showSearch={true}
//         onSearchChange={setSearchQuery}
//         searchQuery={searchQuery}
//       />

//       <div className="max-w-5xl mx-auto px-4 py-6">
//         <Tabs
//           value={selectedCategory}
//           onValueChange={setSelectedCategory}
//           className="mb-6"
//         >
//           <TabsList className="glass-card w-full justify-start overflow-x-auto scrollbar-hide">
//             {categories.map((cat) => (
//               <TabsTrigger
//                 key={cat.value}
//                 value={cat.value}
//                 className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
//               >
//                 {cat.label}
//               </TabsTrigger>
//             ))}
//           </TabsList>
//         </Tabs>

//         <motion.div
//           className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.4 }}
//         >
//           {filtered.map((pred: any, i: number) => (
//             <motion.div
//               key={pred.id || `pred-${i}`}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: i * 0.06 }}
//             >
//               <PredictionCard prediction={pred} />
//             </motion.div>
//           ))}

//           {filtered.length === 0 && (
//             <div className="col-span-full text-center py-20 text-muted-foreground">
//               <p className="text-lg">No predictions found</p>
//               <p className="mt-2">Try changing the category or search term</p>
//             </div>
//           )}
//         </motion.div>
//       </div>

//       {/* Floating create button - mobile */}
//       <button
//         onClick={() => navigate('/create')}
//         className="md:hidden fixed bottom-20 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110"
//         style={{
//           background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
//           boxShadow: '0 10px 25px rgba(168, 85, 247, 0.4)',
//         }}
//       >
//         <Plus size={28} className="text-white" />
//       </button>

//       <MobileNav />
//     </div>
//   );
// }















import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { PredictionCard } from '@/app/components/PredictionCard';
import { MobileNav } from '@/app/components/MobileNav';
import { TopNav } from '@/app/components/TopNav';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const defaultCategories = [
  { value: 'trending', label: 'Trending' },
];


export function HomeScreen() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{ value: string, label: string }[]>(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await fetch('/api/fields', {
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.data ?? [];
          const dynamicCats = items.map((f: any) => ({
            value: f.fields.toLowerCase(),
            label: f.fields,
          }));
          setCategories([...defaultCategories, ...dynamicCats]);
        }
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

        const res = await fetch('/api/public-questions', {
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status} - ${text.substring(0, 120)}`);
        }

        const data = await res.json();
        const items = Array.isArray(data) ? data : data.data ?? [];

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

  const filteredPredictions = predictions.filter((pred) => {
    const categoryMatch =
      selectedCategory === 'trending' ||
      pred?.field?.fields?.toLowerCase() === selectedCategory.toLowerCase();

    const searchMatch = pred?.questions
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    return categoryMatch && (searchMatch ?? true);
  });

  return (
    <div className="min-h-screen bg-background">
      <TopNav showSearch={true} onSearchChange={setSearchQuery} searchQuery={searchQuery} />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {/* Category Tabs */}
        <Tabs
          value={selectedCategory}
          onValueChange={(v) => setSelectedCategory(v as string)}
          className="mb-6"
        >
          <TabsList className="glass-card w-full justify-start overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="data-[state=active]:bg-[#a855f7]/20 data-[state=active]:text-[#a855f7]"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Predictions Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground animate-pulse">Loading predictions...</p>
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
        ) : (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredPredictions.map((prediction, index) => (
              <motion.div
                key={prediction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PredictionCard prediction={prediction} />
              </motion.div>
            ))}

            {filteredPredictions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No predictions found</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Floating Create Button - Mobile Only */}
      <button
        onClick={() => navigate('/create')}
        className="md:hidden fixed bottom-20 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-40 transition-transform hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
          boxShadow: '0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(168, 85, 247, 0.3)',
        }}
      >
        <Plus size={28} className="text-white" />
      </button>

      <MobileNav />
    </div>
  );
}