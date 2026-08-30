import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useFocusable } from '../../context/SpatialNavigationContext';

const PlayerContent: React.FC = () => {
  const { playingSession, stopPlayback } = useApp();
  
  const backBtn = useFocusable({
    id: 'player-back-btn',
    zoneId: 'player',
    onSelect: () => {
      stopPlayback();
    },
  });

  if (!playingSession) return null;

  const { media, episode } = playingSession;
  const isSeries = media.type === 'tv';
  const numericId = media.id.replace('tmdb-', '');
  let iframeSrc = '';

  if (isSeries) {
    const seasonNum = episode?.seasonNumber || 1;
    const epNum = episode?.episodeNumber || 1;
    iframeSrc = `https://pvrplay.online/watch/tv/${numericId}/${seasonNum}/${epNum}`;
  } else {
    iframeSrc = `https://pvrplay.online/watch/movie/${numericId}`;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="absolute top-6 left-6 z-[110]">
        <button
          ref={backBtn.ref}
          onClick={stopPlayback}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
            backBtn.isFocused
              ? 'bg-white text-black scale-110 ring-4 ring-white shadow-xl'
              : 'bg-black/40 text-white hover:bg-black/60 border border-white/10'
          }`}
          data-focused={backBtn.isFocused}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-sm">Back</span>
        </button>
      </div>

      <iframe
        src={iframeSrc}
        className="w-full h-full border-none"
        allowFullScreen
        allow="autoplay; fullscreen"
      ></iframe>
    </div>
  );
};

export const VideoPlayer: React.FC = () => {
  const { playingSession } = useApp();
  if (!playingSession) return null;
  return <PlayerContent />;
};
