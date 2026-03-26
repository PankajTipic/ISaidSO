import React from 'react';
import { Search, Hash, Target } from 'lucide-react';

interface SearchSuggestionsProps {
  isVisible: boolean;
  query: string;
  categories: { value: string; label: string }[];
  predictions: any[];
  onCategorySelect: (category: string) => void;
  onPredictionSelect: (predictionId: string | number) => void;
  onClose: () => void;
  isMobileOverlay?: boolean;
}

export function SearchSuggestions({
  isVisible,
  query,
  categories,
  predictions,
  onCategorySelect,
  onPredictionSelect,
  onClose,
  isMobileOverlay = false
}: SearchSuggestionsProps) {
  if (!isVisible || !query.trim()) return null;

  const filteredCategories = categories.filter((cat) =>
    cat.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPredictions = predictions.filter((pred) =>
    pred.questions?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const hasResults = filteredCategories.length > 0 || filteredPredictions.length > 0;

  return (
    <div
      className={
        isMobileOverlay
          ? "w-full bg-white min-h-full"
          : "absolute top-full left-0 mt-3 z-50 bg-white border border-border shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] rounded-3xl overflow-hidden min-w-[420px] max-w-[600px] max-h-[550px] overflow-y-auto ring-1 ring-black/5"
      }
    >
      {!hasResults ? (
        <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
            <Search className="text-muted-foreground/30" size={28} />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">No matches found</p>
            <p className="text-sm">We couldn't find anything for "{query}"</p>
          </div>
        </div>
      ) : (
        <div className={`flex flex-col ${isMobileOverlay ? 'pb-20' : ''}`}>
          {/* Categories Section */}
          {filteredCategories.length > 0 && (
            <div className="p-5 border-b border-border/40 bg-muted/5">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-primary mb-4 px-1">
                <Hash size={12} className="stroke-[3]" />
                Categories
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => onCategorySelect(cat.value)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-primary hover:text-white text-foreground text-xs font-bold transition-all border border-border/80 hover:border-primary shadow-sm active:scale-95"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Predictions Section */}
          {filteredPredictions.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-primary flex items-center gap-2">
                <Target size={12} className="stroke-[3]" />
                Predictions
              </div>
              <div className="space-y-1 pb-2">
                {filteredPredictions.map((pred) => (
                  <button
                    key={pred.id}
                    onClick={() => onPredictionSelect(pred.id)}
                    className="w-full text-left px-4 py-4 rounded-2xl hover:bg-primary/5 transition-all flex items-start gap-4 group active:bg-primary/10"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                      <Search size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-semibold text-foreground line-clamp-2 leading-relaxed mb-1.5 group-hover:text-primary transition-colors">
                        {pred.questions}
                      </p>
                      {pred.field && (
                        <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground uppercase font-black tracking-wider">
                          {pred.field.fields}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
