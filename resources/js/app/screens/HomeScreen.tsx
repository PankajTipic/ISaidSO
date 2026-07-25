
import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { PredictionCard } from '@/app/components/PredictionCard';
import { MobileNav } from '@/app/components/MobileNav';
import { TopNav } from '@/app/components/TopNav';
import { Plus, TrendingUp, Flame, Sparkles, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { getAuth } from '@/util/api';
import { useAppSelector } from '@/app/store/hooks';

const defaultCategories = [
  { value: 'trending', label: 'Trending' },
  { value: 'my_predictions', label: 'My Predictions' },
];

export function HomeScreen() {
  const navigate = useNavigate();
  const isGuest = useAppSelector((state) => state.auth.isGuest);
  const currentUser = useAppSelector((state) => state.auth.user);
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
    let categoryMatch = false;
    if (selectedCategory === 'trending') {
      categoryMatch = true;
    } else if (selectedCategory === 'my_predictions') {
      const predUserId = pred?.user_id ?? pred?.user?.id;
      categoryMatch = currentUser?.id ? (Number(predUserId) === Number(currentUser.id)) : false;
    } else {
      categoryMatch = pred?.field?.fields?.toLowerCase() === selectedCategory.toLowerCase();
    }
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
              {categories.slice(0, 3).map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="
                    flex-shrink-0 whitespace-nowrap
                    px-3.5 py-1.5 rounded-full
                    text-xs font-bold
                    transition-all border
                    bg-white dark:bg-white/5
                    border-gray-200 dark:border-white/10
                    text-gray-600 dark:text-gray-400
                    hover:border-[#a855f7]/40
                    data-[state=active]:bg-[#a855f7]
                    data-[state=active]:text-white
                    data-[state=active]:border-[#a855f7]
                    data-[state=active]:shadow-md
                    data-[state=active]:shadow-[#a855f7]/20
                    ring-0 focus-visible:ring-0 focus-visible:outline-none
                    flex items-center gap-1.5
                  "
                >
                  {cat.value === 'trending' && (
                    <Flame
                      size={14}
                      className="data-[state=active]:text-primary-foreground text-orange-500"
                    />
                  )}
                  {cat.value === 'my_predictions' && (
                    <User
                      size={14}
                      className="data-[state=active]:text-primary-foreground text-purple-500"
                    />
                  )}
                  {cat.label}
                </TabsTrigger>
              ))}

              {categories.length > 3 && (
                <div className="relative flex-shrink-0 ml-1">
                  <select
                    className={`
                      appearance-none
                      whitespace-nowrap
                      ${categories.slice(3).some(c => c.value === selectedCategory) ? 'px-3.5 py-1.5 pr-7 rounded-full text-xs font-bold' : 'w-8 h-8 rounded-full text-transparent px-0'}
                      transition-all border
                      focus:outline-none focus:ring-0
                      cursor-pointer
                      ${categories.slice(3).some(c => c.value === selectedCategory) 
                        ? 'bg-[#a855f7] text-white border-[#a855f7] shadow-md shadow-[#a855f7]/20' 
                        : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-[#a855f7]/40'
                      }
                    `}
                    value={categories.slice(3).some(c => c.value === selectedCategory) ? selectedCategory : ''}
                    onChange={(e) => {
                      if(e.target.value) {
                        setSelectedCategory(e.target.value);
                      }
                    }}
                  >
                    <option value="" disabled hidden></option>
                    {categories.slice(3).map(cat => (
                      <option key={cat.value} value={cat.value} className="text-gray-900 bg-white text-xs">{cat.label}</option>
                    ))}
                  </select>
                  <div className={`absolute inset-y-0 ${categories.slice(3).some(c => c.value === selectedCategory) ? 'right-2' : 'inset-x-0 mx-auto justify-center'} flex items-center pointer-events-none ${categories.slice(3).some(c => c.value === selectedCategory) ? 'text-white' : 'text-gray-500'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              )}
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
                    flex-shrink-0 whitespace-nowrap
                    px-3.5 py-1.5 rounded-full
                    text-xs font-bold
                    transition-all border

                    bg-white dark:bg-white/5
                    border-gray-200 dark:border-white/10
                    text-gray-600 dark:text-gray-400

                    hover:border-[#a855f7]/40

                    data-[state=active]:bg-[#a855f7]
                    data-[state=active]:text-white
                    data-[state=active]:border-[#a855f7]
                    data-[state=active]:shadow-md
                    data-[state=active]:shadow-[#a855f7]/20

                    ring-0 focus-visible:ring-0 focus-visible:outline-none
                    flex items-center gap-1.5
                  "
                >
                  {cat.value === 'trending' && (
                    <Flame size={13} className="inline text-orange-500" />
                  )}
                  {cat.value === 'my_predictions' && (
                    <User size={13} className="inline text-purple-500" />
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

              {/* ── TOP PREDICTIONS section (only shown on Trending tab) ── */}
              {topPredictions.length > 0 && (
                <section className="space-y-3 md:space-y-5">
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

              {/* ── MAIN FORECASTS section ── */}
              <section className="space-y-3 md:space-y-5">

                <div className="flex items-center gap-2 px-0.5">
                  {selectedCategory === 'my_predictions' ? (
                    <User size={18} className="text-purple-500 flex-shrink-0" />
                  ) : (
                    <Sparkles size={18} className="text-primary flex-shrink-0" />
                  )}
                  <h2 className="text-[17px] md:text-xl font-bold text-foreground leading-snug">
                    {selectedCategory === 'my_predictions'
                      ? 'My Predictions'
                      : selectedCategory === 'trending'
                      ? 'Latest Forecasts'
                      : `${categories.find(c => c.value === selectedCategory)?.label || ''} Predictions`}
                  </h2>
                  {latestPredictions.length > 0 && (
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
                      {selectedCategory === 'my_predictions' ? (
                        isGuest ? (
                          <>
                            <User size={36} className="text-muted-foreground/50 mb-1" />
                            <p className="text-[16px] font-semibold text-foreground/80">
                              Please log in to view your predictions
                            </p>
                            <button
                              onClick={() => navigate('/auth')}
                              className="mt-2 px-5 py-2 text-[14px] font-bold bg-[#a855f7] text-white rounded-full shadow hover:bg-[#9333ea] transition-all"
                            >
                              Log In / Sign Up
                            </button>
                          </>
                        ) : (
                          <>
                            <User size={36} className="text-muted-foreground/50 mb-1" />
                            <p className="text-[16px] font-semibold text-foreground/80">
                              You haven't created any predictions yet
                            </p>
                            <p className="text-[14px] text-muted-foreground text-center">
                              Create your first prediction (public or private) now!
                            </p>
                            <button
                              onClick={() => navigate('/create')}
                              className="mt-2 px-5 py-2 text-[14px] font-bold bg-[#a855f7] text-white rounded-full shadow hover:bg-[#9333ea] transition-all flex items-center gap-1.5"
                            >
                              <Plus size={16} /> Create Prediction
                            </button>
                          </>
                        )
                      ) : (
                        <>
                          <p className="text-[16px] font-semibold text-foreground/70">
                            No predictions found
                          </p>
                          <p className="text-[14px] text-muted-foreground text-center">
                            Try a different category or search term
                          </p>
                        </>
                      )}
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





