import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAniList } from '../../context/AniListContext';
import { useFocusable } from '../../context/SpatialNavigationContext';

const PlayerContent: React.FC = () => {
  const { playingSession, stopPlayback } = useApp();
  const { isAnime, autoSyncEpisodeProgress, isLoggedIn } = useAniList();
  const [syncedBadge, setSyncedBadge] = useState<string | null>(null);
  
  const backBtn = useFocusable({
    id: 'player-back-btn',
    zoneId: 'player',
    onSelect: () => {
      stopPlayback();
    },
  });

  if (!playingSession || !playingSession.media) return null;

  const { media, episode } = playingSession;
  const isSeries = media.type === 'tv';
  const numericId = media.id.replace('tmdb-', '');
  let iframeSrc = '';

  const seasonNum = episode?.seasonNumber || 1;
  const epNum = episode?.episodeNumber || 1;

  if (isSeries) {
    iframeSrc = `https://pvrplay.online/watch/tv/${numericId}/${seasonNum}/${epNum}`;
  } else {
    iframeSrc = `https://pvrplay.online/watch/movie/${numericId}`;
  }

  // Auto-sync episode progress to AniList if this media is an Anime
  useEffect(() => {
    if (!media || !isAnime(media)) return;

    const totalEps = media.seasons?.reduce((acc, s) => acc + (s.episodes?.length || 0), 0) || 12;
    const currentEpNumber = isSeries ? epNum : 1;

    autoSyncEpisodeProgress(media.title, currentEpNumber, totalEps, media.id);
    setSyncedBadge(`AniList: Synced Ep ${currentEpNumber}`);

    const timer = setTimeout(() => {
      setSyncedBadge(null);
    }, 4500);

    return () => clearTimeout(timer);
  }, [media?.id, epNum, isSeries, media?.title]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="absolute top-6 left-6 z-[110] flex items-center gap-3">
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

        {syncedBadge && isAnime(media) && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0c1626]/90 border border-[#3db4f2]/50 text-white text-xs font-semibold backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="w-4 h-4 rounded bg-[#3db4f2] flex items-center justify-center font-black text-white text-[8px]">
              AL
            </div>
            <span className="text-zinc-200">{syncedBadge}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        )}
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
