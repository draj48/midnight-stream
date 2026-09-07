import React from 'react';
import { HeroBanner } from '../media/HeroBanner';
import { ContentRow } from '../media/ContentRow';
import { ContinueWatchingRow } from '../media/ContinueWatchingRow';
import { useApp } from '../../context/AppContext';

export const HomeView: React.FC = () => {
  const { mediaCatalog, continueWatchingList } = useApp();

  const top10Items = mediaCatalog.filter(m => m.isTop10).sort((a, b) => (a.top10Rank || 99) - (b.top10Rank || 99));
  const trendingItems = mediaCatalog.filter(m => m.isTrending);
  const movieItems = mediaCatalog.filter(m => m.type === 'movie');
  const showItems = mediaCatalog.filter(m => m.type === 'tv');
  const scifiItems = mediaCatalog.filter(m => m.genres.includes('Sci-Fi'));
  const actionItems = mediaCatalog.filter(m => m.genres.includes('Action'));
  const animeItems = mediaCatalog.filter(m => m.genres.includes('Anime'));

  return (
    <div className="pb-24">
      {/* Hero Featured Banner */}
      {top10Items.length > 0 && <HeroBanner items={top10Items.slice(0, 5)} />}

      {/* Rows Container framed nicely below Hero Card */}
      <div className="relative z-20 max-w-[1550px] mx-auto space-y-3 sm:space-y-6 pt-2 sm:pt-4">
        {/* Dedicated Continue Watching Row */}
        {continueWatchingList.length > 0 && (
          <ContinueWatchingRow items={continueWatchingList} rowIndex={0} />
        )}

        {/* Top 10 in World Today */}
        <ContentRow
          id="top-10"
          title="Top 10 Streaming Today"
          subtitle="Most watched movies & series worldwide"
          items={top10Items}
          variant="rank"
          rowIndex={1}
        />

        {/* Trending Now */}
        <ContentRow
          id="trending-now"
          title="Trending Now"
          subtitle="Viral hits and audience favorites"
          items={trendingItems}
          variant="landscape"
          rowIndex={2}
        />

        {/* Popular Movies */}
        <ContentRow
          id="popular-movies"
          title="Blockbuster Movies"
          subtitle="Full-length cinematic epics"
          items={movieItems}
          variant="portrait"
          rowIndex={3}
        />

        {/* Binge-Worthy TV Shows */}
        <ContentRow
          id="binge-shows"
          title="Binge-Worthy TV Series"
          subtitle="Multi-season sagas and episodic dramas"
          items={showItems}
          variant="landscape"
          rowIndex={4}
        />

        {/* Sci-Fi & Cyberpunk */}
        <ContentRow
          id="scifi-picks"
          title="Sci-Fi & Cyberpunk"
          subtitle="Futuristic worlds, AI anomalies & spacetime mysteries"
          items={scifiItems}
          variant="landscape"
          rowIndex={5}
        />

        {/* Action & Adventure */}
        <ContentRow
          id="action-picks"
          title="Action & Adrenaline"
          subtitle="High-octane blockbusters & tactical heists"
          items={actionItems}
          variant="portrait"
          rowIndex={6}
        />

        {/* Anime & Animation */}
        <ContentRow
          id="anime-picks"
          title="Masterclass Anime & Animation"
          subtitle="Award-winning hand-crafted animation"
          items={animeItems}
          variant="landscape"
          rowIndex={7}
        />

      </div>
    </div>
  );
};
