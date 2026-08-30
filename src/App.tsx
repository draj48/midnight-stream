import React from 'react';
import { SpatialNavigationProvider } from './context/SpatialNavigationContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/navigation/Navbar';
import { TVRemoteWidget } from './components/navigation/TVRemoteWidget';
import { HomeView } from './components/views/HomeView';
import { ShowsView } from './components/views/ShowsView';
import { MoviesView } from './components/views/MoviesView';
import { CategoriesView } from './components/views/CategoriesView';
import { MyListView } from './components/views/MyListView';
import { SearchView } from './components/search/SearchView';
import { DetailsModal } from './components/media/DetailsModal';
import { VideoPlayer } from './components/player/VideoPlayer';
import { ProfileModal } from './components/profile/ProfileModal';
import { Tv, Monitor, Smartphone, Globe, ShieldCheck, Film } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentTab, userPreferences } = useApp();

  return (
    <div
      className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col selection:bg-red-600 selection:text-white"
      style={{
        paddingLeft: userPreferences.tvSafeMargin ? `${userPreferences.tvSafeMargin}%` : undefined,
        paddingRight: userPreferences.tvSafeMargin ? `${userPreferences.tvSafeMargin}%` : undefined,
      }}
    >
      {/* Top Navigation */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {currentTab === 'home' && <HomeView />}
        {currentTab === 'shows' && <ShowsView />}
        {currentTab === 'movies' && <MoviesView />}
        {currentTab === 'categories' && <CategoriesView />}
        {currentTab === 'my-list' && <MyListView />}
        {currentTab === 'search' && <SearchView />}
      </main>

      {/* Overlays and Modals */}
      <DetailsModal />
      <VideoPlayer />
      <ProfileModal />
      <TVRemoteWidget />

      {/* Cinematic Platform Footer */}
      <footer className="w-full border-t border-zinc-800/80 bg-zinc-950/90 py-12 px-4 sm:px-8 md:px-12 mt-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Row: Device badges */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center shadow-md">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="font-['Cinzel',serif] font-bold text-lg text-white">
                MIDNIGHT<span className="text-red-500">PLAY</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                <Tv className="w-3.5 h-3.5 text-red-500" />
                <span>Smart TV (Tizen / webOS / Android TV)</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
                <span>Desktop (4K HDR)</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mobile & Tablet</span>
              </span>
            </div>
          </div>

          {/* Links & Disclaimer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-zinc-400">
            <div className="space-y-2">
              <h5 className="font-bold text-zinc-200">Browse</h5>
              <ul className="space-y-1.5">
                <li><span className="hover:text-white cursor-pointer">4K Ultra HD</span></li>
                <li><span className="hover:text-white cursor-pointer">Dolby Atmos Audio</span></li>
                <li><span className="hover:text-white cursor-pointer">MidnightPlay Originals</span></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="font-bold text-zinc-200">Supported TV Remotes</h5>
              <ul className="space-y-1.5">
                <li><span className="hover:text-white cursor-pointer">Samsung Tizen Smart Remote</span></li>
                <li><span className="hover:text-white cursor-pointer">LG webOS Magic Remote</span></li>
                <li><span className="hover:text-white cursor-pointer">Google TV / Android TV D-Pad</span></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="font-bold text-zinc-200">Playback & Privacy</h5>
              <ul className="space-y-1.5">
                <li><span className="hover:text-white cursor-pointer">Overscan Safe Zone</span></li>
                <li><span className="hover:text-white cursor-pointer">Subtitles & Closed Captions</span></li>
                <li><span className="hover:text-white cursor-pointer">Local State Persistence</span></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="font-bold text-zinc-200">Vercel Deployment</h5>
              <ul className="space-y-1.5">
                <li><span className="hover:text-white cursor-pointer">Edge CDN Compatible</span></li>
                <li><span className="hover:text-white cursor-pointer">Static & Full-Stack Ready</span></li>
                <li><span className="hover:text-white cursor-pointer">Vercel Production Optimized</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Hotkeys helper */}
          <div className="pt-4 border-t border-zinc-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
            <p>© 2026 MidnightPlay Inc. Built for Smart TV browsers, Desktop, and Mobile.</p>
            <p className="flex items-center gap-2">
              <span>D-Pad Navigation:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">Arrows</kbd>
              <span>•</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">Enter</kbd>
              <span>•</span>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">Esc/Back</kbd>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <SpatialNavigationProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </SpatialNavigationProvider>
  );
}
