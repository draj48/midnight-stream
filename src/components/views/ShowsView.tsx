import React from 'react';
import { HeroBanner } from '../media/HeroBanner';
import { ContentRow } from '../media/ContentRow';
import { useApp } from '../../context/AppContext';

export const ShowsView: React.FC = () => {
  const { mediaCatalog } = useApp();

  const tvShows = mediaCatalog.filter(m => m.type === 'tv');
  const heroShow = tvShows[0] || mediaCatalog[0];

  const scifiShows = tvShows.filter(m => m.genres.includes('Sci-Fi'));
  const dramaShows = tvShows.filter(m => m.genres.includes('Drama') || m.genres.includes('Fantasy'));
  const animeShows = tvShows.filter(m => m.genres.includes('Anime'));
  const thrillerShows = tvShows.filter(m => m.genres.includes('Thriller') || m.genres.includes('Crime'));

  return (
    <div className="pb-24">
      {/* Shows Hero */}
      {tvShows.length > 0 && <HeroBanner items={tvShows.slice(0, 5)} />}

      <div className="relative z-20 -mt-16 sm:-mt-20 md:-mt-24 space-y-2">
        <ContentRow
          id="tv-trending"
          title="Trending TV Series"
          subtitle="Top streamed television worldwide"
          items={tvShows}
          variant="landscape"
          rowIndex={0}
        />

        <ContentRow
          id="tv-scifi"
          title="Sci-Fi & Cyberpunk Series"
          subtitle="Quantum paradoxes & futuristic thrillers"
          items={scifiShows}
          variant="landscape"
          rowIndex={1}
        />

        <ContentRow
          id="tv-drama"
          title="Epic Fantasy & Period Dramas"
          subtitle="Dynastic sagas and elemental battles"
          items={dramaShows}
          variant="portrait"
          rowIndex={2}
        />

        <ContentRow
          id="tv-anime"
          title="Anime Series"
          subtitle="Weekly episodes in Japanese audio & English CC"
          items={animeShows}
          variant="landscape"
          rowIndex={3}
        />

        <ContentRow
          id="tv-crime"
          title="Crime & Cyber Heist Series"
          subtitle="Underground cartels and corporate intrigue"
          items={thrillerShows}
          variant="landscape"
          rowIndex={4}
        />
      </div>
    </div>
  );
};
