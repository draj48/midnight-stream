import React from 'react';
import { X, Check, Tv, Sliders, Volume2, Shield, Trash2, UserPlus, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
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

  const closeBtn = useFocusable({
    id: 'profile-close-btn',
    zoneId: 'modal-profile',
    onSelect: () => setIsProfileModalOpen(false),
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
                  <p className="text-zinc-400 text-[11px]">Adjust edge padding for 4K / OLED TV overscan compensation.</p>
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
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    userPreferences.includeMature ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
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
