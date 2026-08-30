import React, { useState, useEffect } from 'react';
import {  Search, Bell, Tv, Film, MonitorPlay, Sparkles, Check, ChevronDown, Radio , User, Settings } from 'lucide-react';
import { useApp, MainViewTab } from '../../context/AppContext';
import { useFocusable, useSpatialNavigation } from '../../context/SpatialNavigationContext';

export const Navbar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    currentProfile,
    setIsProfileModalOpen,
    unreadNotificationCount,
    isNotificationsOpen,
    setIsNotificationsOpen,
  } = useApp();

  const { isRemoteOverlayVisible, setIsRemoteOverlayVisible, isTVMode } = useSpatialNavigation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Nav Items focusables
  const homeBtn = useFocusable({
    id: 'nav-home',
    zoneId: 'nav',
    onSelect: () => setCurrentTab('home'),
  });

  const showsBtn = useFocusable({
    id: 'nav-shows',
    zoneId: 'nav',
    onSelect: () => setCurrentTab('shows'),
  });

  const moviesBtn = useFocusable({
    id: 'nav-movies',
    zoneId: 'nav',
    onSelect: () => setCurrentTab('movies'),
  });

  const categoriesBtn = useFocusable({
    id: 'nav-categories',
    zoneId: 'nav',
    onSelect: () => setCurrentTab('categories'),
  });

  const myListBtn = useFocusable({
    id: 'nav-mylist',
    zoneId: 'nav',
    onSelect: () => setCurrentTab('my-list'),
  });

  const searchBtn = useFocusable({
    id: 'nav-search',
    zoneId: 'nav',
    onSelect: () => setCurrentTab('search'),
  });

  const remoteBtn = useFocusable({
    id: 'nav-remote-toggle',
    zoneId: 'nav',
    onSelect: () => setIsRemoteOverlayVisible(!isRemoteOverlayVisible),
  });

  const profileBtn = useFocusable({
    id: 'nav-profile',
    zoneId: 'nav',
    onSelect: () => setIsProfileModalOpen(true),
  });

  const navTabs: { id: MainViewTab; label: string; focusable: typeof homeBtn }[] = [
    { id: 'home', label: 'Home', focusable: homeBtn },
    { id: 'shows', label: 'TV Shows', focusable: showsBtn },
    { id: 'movies', label: 'Movies', focusable: moviesBtn },
    { id: 'categories', label: 'Categories', focusable: categoriesBtn },
    { id: 'my-list', label: 'My List', focusable: myListBtn },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0a0a0c]/95 backdrop-blur-md shadow-2xl py-3 border-b border-zinc-800/40'
          : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent py-5'
      }`}
    >
      <div className="w-full px-4 sm:px-8 md:px-12 flex items-center justify-between">
        {/* Left Side: Logo & Main Navigation */}
        <div className="flex items-center gap-6 lg:gap-10">
          {/* Brand Logo */}
          <button
            id="brand-logo"
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2 text-left cursor-pointer group focus:outline-none"
            aria-label="MidnightPlay Home"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-900/50 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-extrabold tracking-wider font-['Cinzel',serif] text-red-500 drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]">
                MIDNIGHT<span className="text-zinc-100 font-sans font-black">PLAY</span>
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2" aria-label="Main Navigation">
            {navTabs.map(tab => {
              const isActive = currentTab === tab.id;
              const isFocused = tab.focusable.isFocused;

              return (
                <button
                  key={tab.id}
                  ref={tab.focusable.ref}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isFocused
                      ? 'bg-white text-zinc-950 scale-105 shadow-lg shadow-white/20 font-bold ring-2 ring-white'
                      : isActive
                      ? 'bg-zinc-800/90 text-white shadow-inner font-bold'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40'
                  }`}
                  data-focused={isFocused}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Actions, Search, TV Remote helper & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* TV Remote Simulation Button */}
          <button
            ref={remoteBtn.ref}
            onClick={() => setIsRemoteOverlayVisible(!isRemoteOverlayVisible)}
            title="Toggle TV D-Pad Remote Simulation"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              remoteBtn.isFocused
                ? 'bg-white text-zinc-950 scale-105 ring-2 ring-white'
                : isRemoteOverlayVisible
                ? 'bg-red-500/20 border-red-500/60 text-red-300'
                : 'bg-zinc-900/80 border-zinc-700/60 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
            data-focused={remoteBtn.isFocused}
          >
            <Tv className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span className="hidden lg:inline">Virtual Remote</span>
          </button>

          {/* Search Button */}
          <button
            ref={searchBtn.ref}
            onClick={() => setCurrentTab('search')}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-2 text-sm transition-all cursor-pointer ${
              searchBtn.isFocused
                ? 'bg-white text-zinc-950 scale-105 ring-2 ring-white'
                : currentTab === 'search'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
            }`}
            aria-label="Search movies and series"
            data-focused={searchBtn.isFocused}
          >
            <Search className="w-4 h-4" />
            <span className="hidden xl:inline text-xs font-medium">Search</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <span className="font-bold text-sm text-white">Notifications</span>
                  <span className="text-xs text-zinc-400">3 new releases</span>
                </div>
                <div className="mt-3 space-y-2.5">
                  <div className="flex items-start gap-3 p-2 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 transition-colors cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">New Episode: Quantum Protocol</p>
                      <p className="text-[11px] text-zinc-400">Season 2, Episode 1 is now available in 4K HDR.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 transition-colors cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">Now Trending: Neon Odyssey 2088</p>
                      <p className="text-[11px] text-zinc-400">Ranked #1 in Sci-Fi this week.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Switcher */}
          <button
            ref={profileBtn.ref}
            onClick={() => setIsProfileModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              profileBtn.isFocused
                ? 'bg-white text-zinc-950 scale-105 ring-2 ring-white'
                : 'bg-zinc-900/80 border border-zinc-700/60 hover:bg-zinc-800 text-zinc-200'
            }`}
            data-focused={profileBtn.isFocused}
            aria-label="Settings"
          >
            <User className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold hidden md:inline">Guest</span>
            <Settings className="w-3.5 h-3.5 text-zinc-400 ml-1" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-zinc-800/50 mt-3 pt-2 px-2 bg-black/60 backdrop-blur-md">
        {navTabs.map(tab => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`text-xs py-1.5 px-2 font-medium transition-colors ${
                isActive ? 'text-red-500 font-bold border-b-2 border-red-500' : 'text-zinc-400'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
