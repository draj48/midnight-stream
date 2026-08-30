import React from 'react';
import { HeroBanner } from '../media/HeroBanner';
import { ContentRow } from '../media/ContentRow';
import { useApp } from '../../context/AppContext';

export const MoviesView: React.FC = () => {
  const { mediaCatalog } = useApp();

  const movies = mediaCatalog.filter(m => m.type === 'movie');
  const heroMovie = movies.find(m => m.id === 'm-2') || movies[0];

  const actionMovies = movies.filter(m => m.genres.includes('Action'));
  const scifiMovies = movies.filter(m => m.genres.includes('Sci-Fi'));
  const animeMovies = movies.filter(m => m.genres.includes('Anime') || m.genres.includes('Family'));
  const docMovies = movies.filter(m => m.genres.includes('Documentary'));

  return (
    <div className="pb-24">
      {/* Movies Hero */}
      {movieItems.length > 0 && <HeroBanner items={movieItems.slice(0, 5)} />}

      <div className="relative z-20 -mt-16 sm:-mt-20 md:-mt-24 space-y-2">
        <ContentRow
          id="movies-spotlight"
          title="Spotlight Feature Films"
          subtitle="Cinematic blockbusters in 4K HDR"
          items={movies}
          variant="portrait"
          rowIndex={0}
        />

        <ContentRow
          id="movies-action"
          title="Action & Adrenaline"
          subtitle="Tactical espionage and high-speed heists"
          items={actionMovies}
          variant="landscape"
          rowIndex={1}
        />

        <ContentRow
          id="movies-scifi"
          title="Space & Mind-Bending Sci-Fi"
          subtitle="Deep wormholes, time dilation & cybernetics"
          items={scifiMovies}
          variant="landscape"
          rowIndex={2}
        />

        <ContentRow
          id="movies-family"
          title="Animated & Family Favorites"
          subtitle="Magical journeys and heartwarming stories"
          items={animeMovies}
          variant="portrait"
          rowIndex={3}
        />

        <ContentRow
          id="movies-doc"
          title="Award-Winning Documentaries"
          subtitle="Exploration of the Mariana Trench & nature"
          items={docMovies}
          variant="landscape"
          rowIndex={4}
        />
      </div>
    </div>
  );
};
