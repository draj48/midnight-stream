import React, { useState } from 'react';
import { Bookmark, Plus, Film, Trash2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MediaCard } from '../media/MediaCard';

export const MyListView: React.FC = () => {
  const { watchlist, getWatchlistMediaItems, setCurrentTab } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  const savedMedia = getWatchlistMediaItems();

  const filteredMedia = filterType === 'all'
    ? savedMedia
    : savedMedia.filter(m => m.type === filterType);

  return (
    <div className="pt-28 md:pt-24 pb-24 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto min-h-screen">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-red-500 fill-current" />
            <span>My Watchlist</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {savedMedia.length} titles saved to your personal library
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All ({savedMedia.length})
          </button>
          <button
            onClick={() => setFilterType('movie')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'movie' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Movies ({savedMedia.filter(m => m.type === 'movie').length})
          </button>
          <button
            onClick={() => setFilterType('tv')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'tv' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            TV Series ({savedMedia.filter(m => m.type === 'tv').length})
          </button>
        </div>
      </div>

      {/* Grid or Empty state */}
      {filteredMedia.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {filteredMedia.map((item, idx) => (
            <div key={item.id} className="flex justify-center">
              <MediaCard
                media={item}
                rowIndex={Math.floor(idx / 4)}
                colIndex={idx % 4}
                variant="landscape"
                rowId="my-list"
                layout="grid"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-500">
            <Bookmark className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-bold text-zinc-200">Your Watchlist is empty</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Explore movies and TV shows, and click the "+" button or use the remote OK button to save titles for later.
          </p>
          <button
            onClick={() => setCurrentTab('home')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <span>Browse Trending Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
