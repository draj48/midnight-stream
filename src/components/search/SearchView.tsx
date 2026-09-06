import React, { useRef, useEffect } from 'react';
import { Search, X, Film, Sparkles, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/mockMedia';
import { MediaCard } from '../media/MediaCard';
import { useFocusable } from '../../context/SpatialNavigationContext';
import { searchMedia } from '../../services/tmdb';
import { MediaItem } from '../../types/media';
import { useState } from 'react';

export const SearchView: React.FC = () => {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, mediaCatalog, userPreferences } = useApp();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchMedia(searchQuery, userPreferences.includeMature);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, userPreferences.includeMature]);

  // Search input focusable
  const searchInputFocus = useFocusable({
    id: 'search-input-field',
    zoneId: 'search-input',
    onSelect: () => {
      inputRef.current?.focus();
    },
  });

  // Use search results if query exists, otherwise fallback to local catalog filtered by category
  const activeItemsToFilter = searchQuery.trim() ? searchResults : mediaCatalog;

  const filteredItems = activeItemsToFilter.filter(item => {
    const matchesCategory =
      selectedCategory === 'all' ||
      item.genres.some(g => g.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (selectedCategory === 'movies' && item.type === 'movie') ||
      (selectedCategory === 'shows' && item.type === 'tv');

    return matchesCategory;
  });

  return (
    <div className="pt-24 pb-20 px-4 sm:px-8 md:px-12 max-w-7xl mx-auto min-h-screen">
      {/* Search Input Bar */}
      <div className="max-w-3xl mx-auto mb-8 space-y-4">
        <div
          ref={searchInputFocus.ref}
          className={`relative flex items-center rounded-2xl bg-zinc-900 border transition-all duration-200 shadow-xl ${
            searchInputFocus.isFocused
              ? 'ring-4 ring-white border-white bg-zinc-850'
              : 'border-zinc-800 focus-within:border-zinc-600'
          }`}
          data-focused={searchInputFocus.isFocused}
        >
          <Search className="w-6 h-6 text-zinc-400 ml-4 shrink-0" />
          <input
            id="search-input-field"
            ref={inputRef}
            type="text"
            placeholder="Search titles, actors, genres, or keywords..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent px-4 py-4 text-base sm:text-lg text-white placeholder:text-zinc-500 focus:outline-none"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-2 mr-3 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Clear Search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                    : 'bg-zinc-900/90 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-800/80">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>{searchQuery ? `Results for "${searchQuery}"` : 'Explore All Titles'}</span>
          {isSearching && <span className="ml-2 w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin inline-block"></span>}
          <span className="text-xs text-zinc-400 font-normal">({filteredItems.length} found)</span>
        </h2>
      </div>

      {/* Results Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item, idx) => (
            <div key={item.id} className="flex justify-center">
              <MediaCard
                media={item}
                rowIndex={Math.floor(idx / 4)}
                colIndex={idx % 4}
                variant="landscape"
                rowId="search-results"
                layout="grid"
              />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-24 space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-500">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-200">No results found for "{searchQuery}"</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Try searching for a different movie, actor, TV show, or explore popular categories above.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
