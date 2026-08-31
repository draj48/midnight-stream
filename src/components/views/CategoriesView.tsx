import React, { useState } from 'react';
import { CATEGORIES } from '../../data/mockMedia';
import { useApp } from '../../context/AppContext';
import { MediaCard } from '../media/MediaCard';
import { Sparkles, Film, Flame, Compass, Radio } from 'lucide-react';
import { useFocusable } from '../../context/SpatialNavigationContext';

export const CategoriesView: React.FC = () => {
  const { mediaCatalog } = useApp();
  const [selectedCatId, setSelectedCatId] = useState<string>('all');

  const filteredItems = selectedCatId === 'all'
    ? mediaCatalog
    : mediaCatalog.filter(m =>
        m.genres.some(g => g.toLowerCase().includes(selectedCatId.toLowerCase()))
      );

  return (
    <div className="pt-24 pb-24 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto min-h-screen">
      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Compass className="w-8 h-8 text-red-500" />
          <span>Explore by Category</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Discover handpicked collections across cinema, television, anime, and documentaries.
        </p>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 mb-10">
        {CATEGORIES.map(cat => {
          const isSelected = selectedCatId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[90px] ${
                isSelected
                  ? 'bg-gradient-to-br from-red-600 to-rose-700 border-red-500 text-white shadow-lg shadow-red-950/60 scale-[1.02] ring-2 ring-white'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <span className="font-bold text-sm sm:text-base">{cat.label}</span>
              <span className={`text-[11px] line-clamp-1 ${isSelected ? 'text-zinc-100' : 'text-zinc-500'}`}>
                {cat.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {CATEGORIES.find(c => c.id === selectedCatId)?.label} ({filteredItems.length} Titles)
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 pt-2">
          {filteredItems.map((item, idx) => (
            <div key={item.id} className="flex justify-center">
              <MediaCard
                media={item}
                rowIndex={Math.floor(idx / 4)}
                colIndex={idx % 4}
                variant="landscape"
                rowId={`cat-${selectedCatId}`}
                layout="grid"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
