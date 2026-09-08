import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Server } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useFocusable } from '../../context/SpatialNavigationContext';

interface StreamServer {
  id: string;
  name: string;
  badge?: string;
  getUrl: (numericId: string, isSeries: boolean, season: number, episode: number) => string;
}

const STREAM_SERVERS: StreamServer[] = [
  {
    id: 'pvrplay',
    name: 'Server 1 (PVR)',
    badge: 'Multi-Audio',
    getUrl: (id, isSeries, s, e) =>
      isSeries
        ? `https://pvrplay.online/watch/tv/${id}/${s}/${e}`
        : `https://pvrplay.online/watch/movie/${id}`,
  },
  {
    id: 'vidsrc-cc',
    name: 'Server 2 (Fast)',
    badge: 'HD Clean',
    getUrl: (id, isSeries, s, e) =>
      isSeries
        ? `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`
        : `https://vidsrc.cc/v2/embed/movie/${id}`,
  },
  {
    id: 'autoembed',
    name: 'Server 3 (Auto)',
    badge: 'Direct',
    getUrl: (id, isSeries, s, e) =>
      isSeries
        ? `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`
        : `https://player.autoembed.cc/embed/movie/${id}`,
  },
  {
    id: 'embed2',
    name: 'Server 4 (Backup)',
    badge: 'Mirror',
    getUrl: (id, isSeries, s, e) =>
      isSeries
        ? `https://2embed.cc/embedtv/${id}&s=${s}&e=${e}`
        : `https://2embed.cc/embed/${id}`,
  },
];

const PlayerContent: React.FC = () => {
  const { playingSession, stopPlayback, saveProgress } = useApp();
  const [selectedServerId, setSelectedServerId] = useState<string>('pvrplay');
  
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

  const seasonNum = episode?.seasonNumber || 1;
  const epNum = episode?.episodeNumber || 1;

  const currentServer =
    STREAM_SERVERS.find((s) => s.id === selectedServerId) || STREAM_SERVERS[0];
  const iframeSrc = currentServer.getUrl(numericId, isSeries, seasonNum, epNum);

  // Record watched media in Continue Watching
  useEffect(() => {
    if (!media) return;
    
    // Save progress on mount (only attach episode info if it is truly a TV series)
    const tvEpisode = isSeries
      ? episode || {
          id: `ep-${epNum}`,
          seasonNumber: seasonNum,
          episodeNumber: epNum,
          title: `Episode ${epNum}`,
          duration: '24m',
        }
      : undefined;

    saveProgress(media, 0, 0, tvEpisode);
  }, [media?.id, seasonNum, epNum, isSeries, episode]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="absolute top-5 left-6 right-6 z-[110] flex items-center justify-between pointer-events-none">
        {/* Left: Back button & Sync Badges */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            ref={backBtn.ref}
            onClick={stopPlayback}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
              backBtn.isFocused
                ? 'bg-white text-black scale-110 ring-4 ring-white shadow-xl'
                : 'bg-black/60 text-white hover:bg-black/80 border border-white/10'
            }`}
            data-focused={backBtn.isFocused}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold text-sm">Back</span>
          </button>
        </div>

        {/* Right: Server Switcher */}
        <div className="relative pointer-events-auto">
          <div className="flex items-center gap-1.5 p-1 bg-black/70 backdrop-blur-md border border-white/15 rounded-xl shadow-2xl">
            <div className="flex items-center gap-1.5 px-2 py-1 text-zinc-400 text-xs font-medium border-r border-white/10 hidden sm:flex">
              <Server className="w-3.5 h-3.5 text-red-500" />
              <span>Server:</span>
            </div>
            {STREAM_SERVERS.map((server) => {
              const isSelected = server.id === selectedServerId;
              return (
                <button
                  key={server.id}
                  onClick={() => setSelectedServerId(server.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(229,9,20,0.6)]'
                      : 'text-zinc-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={`Switch to ${server.name}`}
                >
                  <span>{server.name.replace('Server ', 'S')}</span>
                  {server.badge && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-semibold hidden md:inline ${
                        isSelected
                          ? 'bg-black/30 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {server.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <iframe
        key={iframeSrc}
        src={iframeSrc}
        className="w-full h-full border-none"
        allowFullScreen
        allow="autoplay; fullscreen; encrypted-media"
      ></iframe>
    </div>
  );
};

export const VideoPlayer: React.FC = () => {
  const { playingSession } = useApp();
  if (!playingSession) return null;
  return <PlayerContent />;
};
