import React, { useState, useEffect, useRef } from 'react';
import {
  Bookmark,
  CheckCircle2,
  Clock,
  PlayCircle,
  PauseCircle,
  XCircle,
  Star,
  ExternalLink,
  ChevronDown,
  Sparkles,
  LogIn,
  RotateCcw,
  Check,
  Plus,
  Minus
} from 'lucide-react';
import { MediaItem } from '../../types/media';
import { useAniList } from '../../context/AniListContext';
import { AniListStatus, ANILIST_STATUS_CONFIG } from '../../types/anilist';
import { searchAniListAnime } from '../../services/anilist';

interface AniListTrackerProps {
  media: MediaItem;
}

export const AniListTracker: React.FC<AniListTrackerProps> = ({ media }) => {
  const {
    isLoggedIn,
    user,
    setIsAuthModalOpen,
    getEntry,
    setEntry,
    deleteEntry,
    isAnime,
  } = useAniList();

  // Strict check: DO NOT render for non-anime movies/series (Bollywood, Hollywood, etc.)
  if (!isAnime(media)) {
    return null;
  }

  const [anilistInfo, setAnilistInfo] = useState<{
    id?: number;
    episodes?: number;
    averageScore?: number;
    siteUrl?: string;
  } | null>(null);

  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isScoreMenuOpen, setIsScoreMenuOpen] = useState(false);

  const statusMenuRef = useRef<HTMLDivElement | null>(null);
  const scoreMenuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusMenuRef.current &&
        !statusMenuRef.current.contains(event.target as Node)
      ) {
        setIsStatusMenuOpen(false);
      }
      if (
        scoreMenuRef.current &&
        !scoreMenuRef.current.contains(event.target as Node)
      ) {
        setIsScoreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Derive total episodes from series seasons or fallback
  const totalEpisodes =
    media.seasons?.reduce((acc, s) => acc + (s.episodes?.length || 0), 0) ||
    anilistInfo?.episodes ||
    12;

  const currentEntry = getEntry(media.title, media.id);
  const currentStatus: AniListStatus | null = currentEntry?.status || null;
  const currentProgress: number = currentEntry?.progress ?? 0;
  const currentScore: number = currentEntry?.score ?? 0;

  useEffect(() => {
    let isMounted = true;
    searchAniListAnime(media.title).then(info => {
      if (isMounted && info) {
        setAnilistInfo({
          id: info.id,
          episodes: info.episodes,
          averageScore: info.averageScore,
          siteUrl: info.siteUrl,
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, [media.title]);

  const handleStatusSelect = async (status: AniListStatus) => {
    setIsStatusMenuOpen(false);
    await setEntry(media.title, {
      status,
      mediaId: media.id,
      anilistMediaId: anilistInfo?.id,
      totalEpisodes,
      progress: status === 'COMPLETED' ? totalEpisodes : currentProgress,
    });
  };

  const handleProgressChange = async (delta: number) => {
    const newProgress = Math.max(0, Math.min(totalEpisodes, currentProgress + delta));
    const newStatus: AniListStatus =
      newProgress >= totalEpisodes ? 'COMPLETED' : currentStatus || 'CURRENT';

    await setEntry(media.title, {
      progress: newProgress,
      status: newStatus,
      mediaId: media.id,
      anilistMediaId: anilistInfo?.id,
      totalEpisodes,
    });
  };

  const handleScoreChange = async (score: number) => {
    setIsScoreMenuOpen(false);
    await setEntry(media.title, {
      score,
      mediaId: media.id,
      anilistMediaId: anilistInfo?.id,
      totalEpisodes,
    });
  };

  const handleRemoveFromList = async () => {
    setIsStatusMenuOpen(false);
    await deleteEntry(media.title);
  };

  const statusConfig = currentStatus ? ANILIST_STATUS_CONFIG[currentStatus] : null;

  return (
    <div className="my-6 rounded-2xl relative z-30 p-4 sm:p-5 shadow-[0_10px_35px_rgba(61,180,242,0.15)]">
      {/* Background card layer with contained glow and border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#0c121e]/95 via-[#111c2e]/90 to-[#0c121e]/95 border border-[#3db4f2]/30 backdrop-blur-md -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#3db4f2]/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      </div>

      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#3db4f2] flex items-center justify-center font-black text-white text-xs shadow-md shadow-[#3db4f2]/40 tracking-wider">
            AL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                AniList Tracker
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#3db4f2]/20 text-[#3db4f2] border border-[#3db4f2]/40">
                  Anime Only
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-zinc-400">
              {isLoggedIn
                ? `Synced with @${user?.name}'s AniList library`
                : 'Connect AniList to sync your watch list, episodes & ratings'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {anilistInfo?.siteUrl && (
            <a
              href={anilistInfo.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-[#3db4f2]/20 hover:text-[#3db4f2] text-zinc-400 text-xs font-medium transition-colors border border-zinc-700/50"
            >
              <span>AniList Page</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {!isLoggedIn ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3db4f2] hover:bg-[#32a2dd] text-white text-xs font-bold transition-all shadow-md shadow-[#3db4f2]/30 cursor-pointer hover:scale-105"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login to AniList</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-900/80 border border-zinc-700/60">
              <img
                src={user?.avatarUrl}
                alt={user?.name}
                className="w-5 h-5 rounded-full object-cover border border-[#3db4f2]/50"
              />
              <span className="text-xs font-semibold text-zinc-200 hidden md:inline">
                {user?.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Tracking Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Control 1: Watch Status Selector */}
        <div ref={statusMenuRef} className="relative z-40">
          <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">
            Watch Status
          </label>
          <button
            type="button"
            onClick={() => {
              setIsStatusMenuOpen(!isStatusMenuOpen);
              setIsScoreMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all text-xs font-bold cursor-pointer ${
              statusConfig
                ? `${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`
                : 'bg-zinc-900/90 border-zinc-700/70 text-zinc-300 hover:border-[#3db4f2]/50 hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              {currentStatus === 'CURRENT' && <PlayCircle className="w-4 h-4 text-emerald-400" />}
              {currentStatus === 'PLANNING' && <Clock className="w-4 h-4 text-sky-400" />}
              {currentStatus === 'COMPLETED' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
              {currentStatus === 'PAUSED' && <PauseCircle className="w-4 h-4 text-amber-400" />}
              {currentStatus === 'DROPPED' && <XCircle className="w-4 h-4 text-rose-400" />}
              {currentStatus === 'REPEATING' && <RotateCcw className="w-4 h-4 text-cyan-400" />}
              {!currentStatus && <Bookmark className="w-4 h-4 text-zinc-400" />}
              <span className="truncate">
                {statusConfig ? statusConfig.label : '+ Add to AniList'}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 opacity-70 shrink-0 transition-transform ${isStatusMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Status Dropdown Menu */}
          {isStatusMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-full min-w-[210px] bg-zinc-900 border-2 border-zinc-700 rounded-xl p-1.5 shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
              {(Object.keys(ANILIST_STATUS_CONFIG) as AniListStatus[]).map(statusKey => {
                const conf = ANILIST_STATUS_CONFIG[statusKey];
                const isSelected = currentStatus === statusKey;
                return (
                  <button
                    key={statusKey}
                    type="button"
                    onClick={() => handleStatusSelect(statusKey)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
                      isSelected
                        ? `${conf.bg} ${conf.color}`
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <span>{conf.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}

              {currentStatus && (
                <button
                  type="button"
                  onClick={handleRemoveFromList}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer border-t border-zinc-800 mt-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Remove from List</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Control 2: Episodes Progress Counter */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 mb-1">
            <span>Episode Progress</span>
            <span className="text-zinc-300 font-mono">
              {currentProgress} / {totalEpisodes}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-700/70 rounded-xl p-1">
            <button
              onClick={() => handleProgressChange(-1)}
              disabled={currentProgress <= 0}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 text-white transition-colors cursor-pointer"
              title="Previous Episode"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="flex-1 text-center py-1 text-xs font-bold text-white font-mono">
              Ep {currentProgress} <span className="text-zinc-500 font-normal">/ {totalEpisodes}</span>
            </div>

            <button
              onClick={() => handleProgressChange(1)}
              disabled={currentProgress >= totalEpisodes}
              className="p-1.5 rounded-lg bg-[#3db4f2]/20 hover:bg-[#3db4f2]/40 text-[#3db4f2] disabled:opacity-40 disabled:hover:bg-zinc-800 transition-colors cursor-pointer font-bold"
              title="Next Episode (+1)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Control 3: Rating Score */}
        <div ref={scoreMenuRef} className="relative z-40">
          <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">
            Your Rating (Score)
          </label>
          <button
            type="button"
            onClick={() => {
              setIsScoreMenuOpen(!isScoreMenuOpen);
              setIsStatusMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/70 text-xs font-bold text-zinc-200 hover:border-[#3db4f2]/50 hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Star className={`w-3.5 h-3.5 ${currentScore > 0 ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'}`} />
              <span>{currentScore > 0 ? `${currentScore} / 10` : 'Not Rated'}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 opacity-70 shrink-0 transition-transform ${isScoreMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Score Dropdown Menu */}
          {isScoreMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-zinc-900 border-2 border-zinc-700 rounded-xl p-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] uppercase font-bold text-zinc-400 mb-2 px-1">Select Rating (1-10)</div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleScoreChange(val)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentScore === val
                        ? 'bg-amber-400 text-zinc-950 shadow-md scale-105'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleScoreChange(0)}
                className="w-full mt-2 pt-2 border-t border-zinc-800 text-xs text-zinc-400 hover:text-rose-400 transition-colors text-center cursor-pointer font-medium"
              >
                Clear Rating
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
