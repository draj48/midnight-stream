import React from 'react';
import { SpatialNavigationProvider } from './context/SpatialNavigationContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/navigation/Navbar';
import { TVRemoteWidget } from './components/navigation/TVRemoteWidget';
import { applyTVOptimizations } from './lib/tvOptimizer';
import { HomeView } from './components/views/HomeView';
import { ShowsView } from './components/views/ShowsView';
import { MoviesView } from './components/views/MoviesView';
import { CategoriesView } from './components/views/CategoriesView';
import { MyListView } from './components/views/MyListView';
import { SearchView } from './components/search/SearchView';
import { DetailsModal } from './components/media/DetailsModal';
import { VideoPlayer } from './components/player/VideoPlayer';
import { ProfileModal } from './components/profile/ProfileModal';
import { BackToTop } from './components/navigation/BackToTop';

const MainContent: React.FC = () => {
  const { currentTab, userPreferences } = useApp();

  React.useEffect(() => {
    applyTVOptimizations(userPreferences.lowPowerTVMode);
  }, [userPreferences.lowPowerTVMode]);

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
      <BackToTop focusId="global-main-back-to-top" zoneId="global" threshold={300} />

      {/* Clean Minimal Footer */}
      <footer className="w-full border-t border-zinc-900 bg-black/60 py-8 px-4 sm:px-8 md:px-12 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="MidnightPlay Logo" 
              className="h-7 w-auto max-w-[140px] object-contain select-none"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
            <div style={{ display: 'none' }} className="items-center justify-center">
              <span className="text-lg font-['Permanent_Marker',cursive] text-white">
                MIDNIGHT
              </span>
              <span className="text-lg font-['Permanent_Marker',cursive] text-red-600 ml-0.5">
                PLAY
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-500 text-center sm:text-right">
            © 2026 MidnightPlay. All rights reserved.
          </p>
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
