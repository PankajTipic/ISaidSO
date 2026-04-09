import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { PredictionCard } from '@/app/components/PredictionCard';
import { MobileNav } from '@/app/components/MobileNav';
import { TopNav } from '@/app/components/TopNav';
import { Plus, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
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
      <TopNav 
        showSearch={true} 
        onSearchChange={setSearchQuery} 
        searchQuery={searchQuery}
        categories={categories}
        predictions={predictions}
        onCategorySelect={setSelectedCategory}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {/* Category Tabs */}
        <Tabs
          value={selectedCategory}
          onValueChange={(v) => setSelectedCategory(v as string)}
          className="mb-8"
        >
          <TabsList className="glass-card w-full justify-start overflow-x-auto scrollbar-hide p-1 bg-muted/50 rounded-2xl h-14">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="rounded-xl h-full px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary"
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
          <div className="text-center py-12 text-red-500">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Top Predictions Section */}
            {filteredPredictions.length > 0 && selectedCategory === 'trending' && (
              <section className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xl font-black uppercase tracking-tighter text-foreground flex items-center gap-2">
                    <TrendingUp className="text-primary" size={24} />
                    Top Predictions
                    <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full ml-2 font-black italic">HOT</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...filteredPredictions]
                    .sort((a, b) => (b.answers_count || 0) - (a.answers_count || 0))
                    .slice(0, 3)
                    .map((prediction, index) => (
                      <motion.div
                        key={`top-${prediction.id}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                      >
                        <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-lg rotate-12 uppercase tracking-widest border border-white/20">
                          #{index + 1}
                        </div>
                        <PredictionCard prediction={prediction} />
                      </motion.div>
                    ))}
                </div>
                <div className="h-px bg-border/40 w-full pt-4" />
              </section>
            )}

            {/* Regular Feed */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-black uppercase tracking-tighter text-foreground flex items-center gap-2">
                  <Plus className="text-primary rotate-45" size={24} />
                  Latest Forecasts
                </h2>
              </div>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {filteredPredictions
                  .filter((p, i) => !(selectedCategory === 'trending' && [...filteredPredictions].sort((a, b) => (b.answers_count || 0) - (a.answers_count || 0)).slice(0, 3).some(top => top.id === p.id)))
                  .map((prediction, index) => (
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
                  <div className="col-span-full text-center py-20">
                    <p className="text-muted-foreground text-lg">No predictions found</p>
                    <p className="text-muted-foreground/60 text-sm mt-1">Try a different category or search term</p>
                  </div>
                )}
              </motion.div>
            </section>
          </div>
        )}
      </div>

      {/* Floating Create Button - Mobile Only */}
      {!isGuest && (
        <button
          onClick={() => navigate('/create')}
          className="md:hidden fixed bottom-20 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-40 transition-transform hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
            boxShadow: '0 10px 25px rgba(168, 85, 247, 0.25)',
          }}
        >
          <Plus size={28} className="text-white" />
        </button>
      )}

      <MobileNav />
    </div>
  );
}