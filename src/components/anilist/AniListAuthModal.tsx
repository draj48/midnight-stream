import React, { useState } from 'react';
import { X, ExternalLink, LogIn, Key, Sparkles, CheckCircle2, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { useAniList } from '../../context/AniListContext';
import { getAniListOAuthUrl } from '../../services/anilist';

export const AniListAuthModal: React.FC = () => {
  const {
    isLoggedIn,
    user,
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginWithToken,
    loginDemo,
    logout,
    autoSyncEnabled,
    setAutoSyncEnabled,
  } = useAniList();

  const [tokenInput, setTokenInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleOAuthLogin = () => {
    // Open AniList OAuth URL in popup or new tab
    const url = getAniListOAuthUrl();
    window.open(url, '_blank', 'width=600,height=700');
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setErrorMsg('Please paste your AniList access token.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    const res = await loginWithToken(tokenInput.trim());
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to authenticate with AniList.');
    } else {
      setTokenInput('');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-[#0a0f18] border border-[#3db4f2]/40 rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(61,180,242,0.25)] max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3db4f2] flex items-center justify-center font-black text-white text-sm shadow-md shadow-[#3db4f2]/40">
              AL
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                AniList Sync
              </h2>
              <span className="text-xs text-zinc-400">Track your anime watching progress</span>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close AniList Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isLoggedIn && user ? (
          /* Logged In View */
          <div className="py-5 space-y-5">
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center gap-4">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#3db4f2] shadow-md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </div>
                <h3 className="text-base font-bold text-white truncate">{user.name}</h3>
                {user.siteUrl && (
                  <a
                    href={user.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#3db4f2] hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <span>View AniList Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Stats */}
            {user.stats && (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-zinc-900/70 p-3 rounded-xl border border-zinc-800">
                  <div className="text-base font-black text-white font-mono">{user.stats.animeCount}</div>
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">Anime</div>
                </div>
                <div className="bg-zinc-900/70 p-3 rounded-xl border border-zinc-800">
                  <div className="text-base font-black text-[#3db4f2] font-mono">{user.stats.episodesWatched}</div>
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">Episodes</div>
                </div>
                <div className="bg-zinc-900/70 p-3 rounded-xl border border-zinc-800">
                  <div className="text-base font-black text-emerald-400 font-mono">
                    {Math.round(user.stats.minutesWatched / 60)}h
                  </div>
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">Hours</div>
                </div>
              </div>
            )}

            {/* Auto-Sync Setting Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <div>
                <div className="text-xs font-bold text-white">Auto-Sync During Playback</div>
                <div className="text-[11px] text-zinc-400">Updates episode number when playing video</div>
              </div>
              <button
                onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  autoSyncEnabled ? 'bg-[#3db4f2]' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    autoSyncEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Disconnect Button */}
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-900/50 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect AniList</span>
            </button>
          </div>
        ) : (
          /* Not Logged In - Login Methods */
          <div className="py-5 space-y-5">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Connect your AniList account to automatically track episodes, add anime to your Watchlist / Planning, and sync ratings.
            </p>

            {/* Method 1: Official OAuth Login */}
            <button
              onClick={handleOAuthLogin}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-[#3db4f2] hover:bg-[#32a2dd] text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#3db4f2]/25 cursor-pointer hover:scale-[1.02]"
            >
              <LogIn className="w-4 h-4" />
              <span>Login with AniList (OAuth)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-zinc-800 w-full" />
              <span className="bg-[#0a0f18] px-3 text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                Or Enter Token
              </span>
            </div>

            {/* Method 2: Token Input */}
            <form onSubmit={handleTokenSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#3db4f2]" />
                    AniList Access Token
                  </span>
                  <a
                    href="https://anilist.co/settings/developer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#3db4f2] hover:underline flex items-center gap-1"
                  >
                    <span>Get Token</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </label>
                <input
                  type="text"
                  placeholder="Paste AniList token or Bearer token..."
                  value={tokenInput}
                  onChange={e => setTokenInput(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#3db4f2]"
                />
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 p-2 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Connecting...' : 'Authorize Token'}
              </button>
            </form>

            <div className="border-t border-zinc-800/80 pt-3">
              <div className="text-[11px] text-zinc-400 text-center mb-2">Want to try without signing in?</div>
              <button
                onClick={() => loginDemo()}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-[#3db4f2]/50 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#3db4f2]" />
                <span>Quick Demo Otaku Profile (1-Click)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
