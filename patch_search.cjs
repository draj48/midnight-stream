const fs = require('fs');
let code = fs.readFileSync('src/components/search/SearchView.tsx', 'utf8');

const targetImports = `import { useFocusable } from '../../context/SpatialNavigationContext';`;
const newImports = `import { useFocusable } from '../../context/SpatialNavigationContext';
import { searchMedia } from '../../services/tmdb';
import { MediaItem } from '../../types/media';
import { useState } from 'react';`;

code = code.replace(targetImports, newImports);
code = code.replace(/import React, \{ useRef, useEffect \} from 'react';/, `import React, { useRef, useEffect } from 'react';`);

const targetComponentStart = `export const SearchView: React.FC = () => {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, mediaCatalog } = useApp();
  const inputRef = useRef<HTMLInputElement | null>(null);`;

const newComponentStart = `export const SearchView: React.FC = () => {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, mediaCatalog } = useApp();
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
        const results = await searchMedia(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);`;

code = code.replace(targetComponentStart, newComponentStart);

const targetFilter = `  // Filter media based on query and category
  const filteredItems = mediaCatalog.filter(item => {
    const matchesCategory =
      selectedCategory === 'all' ||
      item.genres.some(g => g.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (selectedCategory === 'movies' && item.type === 'movie') ||
      (selectedCategory === 'shows' && item.type === 'tv');

    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    const matchesTitle = item.title.toLowerCase().includes(q);
    const matchesDescription = item.description.toLowerCase().includes(q);
    const matchesGenre = item.genres.some(g => g.toLowerCase().includes(q));
    const matchesCast = item.cast.some(c => c.toLowerCase().includes(q));
    const matchesDirector = item.director?.toLowerCase().includes(q);
    const matchesTags = item.tags.some(t => t.toLowerCase().includes(q));

    return matchesTitle || matchesDescription || matchesGenre || matchesCast || matchesDirector || matchesTags;
  });`;

const newFilter = `  // Use search results if query exists, otherwise fallback to local catalog filtered by category
  const activeItemsToFilter = searchQuery.trim() ? searchResults : mediaCatalog;

  const filteredItems = activeItemsToFilter.filter(item => {
    const matchesCategory =
      selectedCategory === 'all' ||
      item.genres.some(g => g.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (selectedCategory === 'movies' && item.type === 'movie') ||
      (selectedCategory === 'shows' && item.type === 'tv');

    return matchesCategory;
  });`;

code = code.replace(targetFilter, newFilter);

fs.writeFileSync('src/components/search/SearchView.tsx', code);
