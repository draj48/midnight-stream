import React from 'react';
import { X, Check, Tv, Sliders, Volume2, Shield, Trash2, UserPlus, Sparkles, EyeOff, LogIn, ExternalLink, LogOut, CheckCircle2, KeyRound, User as UserIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useAniList } from '../../context/AniListContext';
import { USER_PROFILES } from '../../data/mockMedia';
import { useFocusable } from '../../context/SpatialNavigationContext';

export const ProfileModal: React.FC = () => {
  const {
    isProfileModalOpen,
    setIsProfileModalOpen,
    currentProfile,
    setCurrentProfile,
    userPreferences,
    updateUserPreferences,
  } = useApp();

  const { user, setIsAuthModalOpen } = useAuth();

  const {
    isLoggedIn: isAniListLoggedIn,
    user: anilistUser,
    setIsAuthModalOpen: setAniListAuthModalOpen,
    logout: logoutAniList,
    autoSyncEnabled: anilistAutoSync,
    setAutoSyncEnabled: setAniListAutoSync,
  } = useAniList();

  
  
  const autoPlayToggleBtn = useFocusable({
    id: 'profile-autoplay-toggle',
    zoneId: 'modal-profile',
    onSelect: () => updateUserPreferences({ autoPlayNextEpisode: !userPreferences.autoPlayNextEpisode }),
  });

  
  const clearProgressBtn = useFocusable({
    id: 'profile-clear-progress',
    zoneId: 'modal-profile',
    onSelect: () => {
      localStorage.removeItem('midnightplay_continue_watching_v1');
      window.location.reload();
    },
  });

  const matureToggleBtn = useFocusable({
    id: 'profile-mature-toggle',
    zoneId: 'modal-profile',
    onSelect: () => updateUserPreferences({ includeMature: !userPreferences.includeMature }),
  });

  const nsfwToggleBtn = useFocusable({
    id: 'profile-nsfw-toggle',
    zoneId: 'modal-profile',
    onSelect: () => updateUserPreferences({ nsfwFilter: !userPreferences.nsfwFilter }),
  });

  const nsfwTol30Btn = useFocusable({
    id: 'profile-nsfw-tol-30',
    zoneId: 'modal-profile',
    onSelect: () => updateUserPreferences({ nsfwTolerance: 30 }),
  });

  const nsfwTol50Btn = useFocusable({
    id: 'profile-nsfw-tol-50',
    zoneId: 'modal-profile',
    onSelect: () => updateUserPreferences({ nsfwTolerance: 50 }),
  });

  const nsfwTol100Btn = useFocusable({
    id: 'profile-nsfw-tol-100',
    zoneId: 'modal-profile',
    onSelect: () => updateUserPreferences({ nsfwTolerance: 100 }),
  });

  const tvOptToggleBtn = useFocusable({
    id: 'profile-tv-opt-toggle',
    zoneId: 'modal-profile',
    onSelect: () => updateUserPreferences({ lowPowerTVMode: !userPreferences.lowPowerTVMode }),
  });

  const closeBtn = useFocusable({
    id: 'profile-close-btn',
    zoneId: 'modal-profile',
    onSelect: () => setIsProfileModalOpen(false),
  });

  const authModalBtn = useFocusable({
    id: 'profile-auth-modal-btn',
    zoneId: 'modal-profile',
    onSelect: () => {
      setIsProfileModalOpen(false);
      setIsAuthModalOpen(true);
    },
  });

  if (!isProfileModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <span className="text-xs text-zinc-400">TV Display & Playback Preferences</span>
          </div>

          <button
            ref={closeBtn.ref}
            onClick={() => setIsProfileModalOpen(false)}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              closeBtn.isFocused
                ? 'bg-white text-black scale-110 ring-4 ring-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            data-focused={closeBtn.isFocused}
            aria-label="Close Profile Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account & TV Passcode Pairing Banner */}
        <div className="mt-4 p-4.5 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500 font-bold shrink-0 shadow-inner">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>{user ? `Account: ${user.displayName || user.email}` : 'Sign In / Passcode Login'}</span>
                {user && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                    Active
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {user ? 'Generate 4-digit TV login passcode or manage your account' : 'Log in with Google/Email or enter 4-digit Passcode to sync Watchlist'}
              </p>
            </div>
          </div>
          <button
            ref={authModalBtn.ref}
            onClick={() => {
              setIsProfileModalOpen(false);
              setIsAuthModalOpen(true);
            }}
            data-focused={authModalBtn.isFocused}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-lg ${
              authModalBtn.isFocused
                ? 'bg-white text-zinc-950 scale-105 ring-2 ring-white shadow-white/20'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>{user ? 'TV Passcode / Account' : 'Sign In / Use Passcode'}</span>
          </button>
        </div>



        {/* AniList Integration Section */}
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-[#3db4f2] flex items-center justify-center font-black text-white text-[10px]">
                AL
              </div>
              <span>AniList Sync & Anime Tracker</span>
            </h3>

            {isAniListLoggedIn && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/50">
                <CheckCircle2 className="w-3 h-3" />
                Connected
              </span>
            )}
          </div>

          <div className="bg-zinc-900/80 p-4 rounded-2xl border border-[#3db4f2]/30 space-y-3">
            {isAniListLoggedIn && anilistUser ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={anilistUser.avatarUrl}
                      alt={anilistUser.name}
                      className="w-10 h-10 rounded-xl object-cover border-2 border-[#3db4f2]"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">@{anilistUser.name}</h4>
                      <p className="text-zinc-400 text-[11px]">
                        {anilistUser.stats ? `${anilistUser.stats.animeCount} anime tracked • ${anilistUser.stats.episodesWatched} episodes` : 'AniList Account Connected'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAniListAuthModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => logoutAniList()}
                      className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-900/50 transition-colors cursor-pointer"
                      title="Disconnect AniList"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                  <div>
                    <span className="font-semibold text-zinc-200 block">Auto-Sync Episode Progress</span>
                    <span className="text-zinc-400 text-[11px]">Auto updates watching progress when playing anime</span>
                  </div>
                  <button
                    onClick={() => setAniListAutoSync(!anilistAutoSync)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      anilistAutoSync ? 'bg-[#3db4f2]' : 'bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        anilistAutoSync ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-zinc-200">Connect to AniList</h4>
                  <p className="text-zinc-400 text-[11px]">
                    Track watching episodes, add to Plan to Watch, and sync scores automatically for all anime titles.
                  </p>
                </div>
                <button
                  onClick={() => setAniListAuthModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3db4f2] hover:bg-[#32a2dd] text-white text-xs font-bold transition-all shadow-md shadow-[#3db4f2]/30 cursor-pointer hover:scale-105 shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login to AniList</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TV & Playback Settings */}
        <div className="pt-6 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Tv className="w-4 h-4 text-red-500" />
            <span>TV Display & Playback Preferences</span>
          </h3>

          <div className="space-y-4 text-xs">
            {/* TV Safe Margin Inset (Overscan Adjustment) */}
            <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-zinc-200">TV Safe-Area Inset (Overscan)</h4>
                  <p className="text-zinc-400 text-[11px]">Adjust edge padding for TV overscan compensation.</p>
                </div>
                <span className="font-mono font-bold text-red-400">{userPreferences.tvSafeMargin}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={1}
                value={userPreferences.tvSafeMargin}
                onChange={e => updateUserPreferences({ tvSafeMargin: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-zinc-700 rounded-lg accent-red-600 cursor-pointer"
              />
            </div>

            {/* Linux & Smart TV Hardware Acceleration Mode */}
            <div className="flex items-center justify-between bg-zinc-900/80 p-4 rounded-2xl border border-emerald-900/40">
              <div>
                <h4 className="font-semibold text-zinc-200 flex items-center gap-2">
                  <Tv className="w-4 h-4 text-emerald-400" />
                  Linux Smart TV Hardware Boost (Lag-Free)
                </h4>
                <p className="text-zinc-400 text-[11px]">
                  Optimizes memory, removes heavy blur layers, and enables 60FPS hardware navigation on Linux and low-RAM TVs.
                </p>
              </div>
              <button
                ref={tvOptToggleBtn.ref}
                data-focused={tvOptToggleBtn.isFocused}
                onClick={() => updateUserPreferences({ lowPowerTVMode: !userPreferences.lowPowerTVMode })}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  userPreferences.lowPowerTVMode ? 'bg-emerald-600' : 'bg-zinc-700'
                } ${tvOptToggleBtn.isFocused ? 'ring-4 ring-white ring-offset-2 ring-offset-zinc-950 scale-110' : ''}`}
                aria-label="Toggle Linux Smart TV Boost"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    userPreferences.lowPowerTVMode ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Autoplay next episode toggle */}
            <div className="flex items-center justify-between bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
              <div>
                <h4 className="font-semibold text-zinc-200">Autoplay Next Episode</h4>
                <p className="text-zinc-400 text-[11px]">Automatically launch the next episode during credits.</p>
              </div>
              <button
                ref={autoPlayToggleBtn.ref}
                data-focused={autoPlayToggleBtn.isFocused}
                onClick={() => updateUserPreferences({ autoPlayNextEpisode: !userPreferences.autoPlayNextEpisode })}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  userPreferences.autoPlayNextEpisode ? 'bg-red-600' : 'bg-zinc-700'
                } ${autoPlayToggleBtn.isFocused ? 'ring-4 ring-white ring-offset-2 ring-offset-zinc-950 scale-110' : ''}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    userPreferences.autoPlayNextEpisode ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
            {/* Mature Content (18+) toggle */}
            <div className="flex items-center justify-between bg-zinc-900/80 p-4 rounded-2xl border border-red-900/30">
              <div>
                <h4 className="font-semibold text-zinc-200 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-500" />
                  Mature Content (18+)
                </h4>
                <p className="text-zinc-400 text-[11px]">When ON, mature-rated movies and TV shows will be visible.</p>
              </div>
              <button
                ref={matureToggleBtn.ref}
                data-focused={matureToggleBtn.isFocused}
                onClick={() => updateUserPreferences({ includeMature: !userPreferences.includeMature })}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  userPreferences.includeMature ? 'bg-red-600' : 'bg-zinc-700'
                } ${matureToggleBtn.isFocused ? 'ring-4 ring-white ring-offset-2 ring-offset-zinc-950 scale-110' : ''}`}
                aria-label="Toggle Mature Content"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    userPreferences.includeMature ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* NSFW Filter / Blur Section */}
            <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-zinc-200 flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-amber-500" />
                    NSFW Poster Blur (Safe Mode)
                  </h4>
                  <p className="text-zinc-400 text-[11px]">
                    {userPreferences.nsfwFilter
                      ? 'Default ON: Sexually explicit and adult posters are automatically blurred.'
                      : 'OFF: All posters and cover images are shown without blurring.'}
                  </p>
                </div>
                <button
                  ref={nsfwToggleBtn.ref}
                  data-focused={nsfwToggleBtn.isFocused}
                  onClick={() => updateUserPreferences({ nsfwFilter: !userPreferences.nsfwFilter })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    userPreferences.nsfwFilter ? 'bg-red-600' : 'bg-zinc-700'
                  } ${nsfwToggleBtn.isFocused ? 'ring-4 ring-white ring-offset-2 ring-offset-zinc-950 scale-110' : ''}`}
                  aria-label="Toggle NSFW Filter"
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      userPreferences.nsfwFilter ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Threshold Selection: 30%, 50%, 100% */}
              {userPreferences.nsfwFilter && (
                <div className="pt-3 border-t border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-300">NSFW Filter Threshold / Sensitivity</span>
                    <span className="text-[11px] font-mono font-bold text-amber-400">
                      {userPreferences.nsfwTolerance === 30 && '30% (Strict Filter)'}
                      {userPreferences.nsfwTolerance === 50 && '50% (Balanced)'}
                      {userPreferences.nsfwTolerance === 100 && '100% (Allow All)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      ref={nsfwTol30Btn.ref}
                      data-focused={nsfwTol30Btn.isFocused}
                      onClick={() => updateUserPreferences({ nsfwTolerance: 30 })}
                      className={`py-2 px-2 rounded-xl text-center border transition-all cursor-pointer ${
                        userPreferences.nsfwTolerance === 30
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-500/10'
                          : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                      } ${nsfwTol30Btn.isFocused ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950' : ''}`}
                    >
                      <div className="text-xs font-semibold">30%</div>
                      <div className="text-[10px] text-zinc-400 font-normal mt-0.5">Strict (High)</div>
                    </button>

                    <button
                      ref={nsfwTol50Btn.ref}
                      data-focused={nsfwTol50Btn.isFocused}
                      onClick={() => updateUserPreferences({ nsfwTolerance: 50 })}
                      className={`py-2 px-2 rounded-xl text-center border transition-all cursor-pointer ${
                        userPreferences.nsfwTolerance === 50
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-500/10'
                          : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                      } ${nsfwTol50Btn.isFocused ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950' : ''}`}
                    >
                      <div className="text-xs font-semibold">50%</div>
                      <div className="text-[10px] text-zinc-400 font-normal mt-0.5">Balanced (Standard)</div>
                    </button>

                    <button
                      ref={nsfwTol100Btn.ref}
                      data-focused={nsfwTol100Btn.isFocused}
                      onClick={() => updateUserPreferences({ nsfwTolerance: 100 })}
                      className={`py-2 px-2 rounded-xl text-center border transition-all cursor-pointer ${
                        userPreferences.nsfwTolerance === 100
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-500/10'
                          : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                      } ${nsfwTol100Btn.isFocused ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950' : ''}`}
                    >
                      <div className="text-xs font-semibold">100%</div>
                      <div className="text-[10px] text-zinc-400 font-normal mt-0.5">Allow All</div>
                    </button>
                  </div>

                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    {userPreferences.nsfwTolerance === 30 && '30%: High protection. Aggressively blurs erotic web series, suggestive & lingerie posters.'}
                    {userPreferences.nsfwTolerance === 50 && '50%: Standard protection. Blurs explicit & adult content while keeping regular posters unblurred.'}
                    {userPreferences.nsfwTolerance === 100 && '100%: Permits all posters and media thumbnails without any blurring.'}
                  </p>
                </div>
              )}
            </div>

            {/* Clear Watch History */}
            <div className="flex items-center justify-between bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
              <div>
                <h4 className="font-semibold text-zinc-200">Clear Continue Watching</h4>
                <p className="text-zinc-400 text-[11px]">Reset your saved playback positions and history.</p>
              </div>
              <button
                ref={clearProgressBtn.ref}
                data-focused={clearProgressBtn.isFocused}
                onClick={() => {
                  localStorage.removeItem('midnightplay_continue_watching_v1');
                  window.location.reload();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-red-950 text-red-400 hover:text-red-300 border border-zinc-700 transition-colors cursor-pointer ${clearProgressBtn.isFocused ? 'ring-4 ring-white ring-offset-2 ring-offset-zinc-950' : ''}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="px-6 py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
