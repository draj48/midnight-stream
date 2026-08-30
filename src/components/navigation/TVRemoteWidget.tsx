import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CornerDownLeft,
  Undo2,
  Home,
  Play,
  Volume2,
  VolumeX,
  X,
  Tv,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useSpatialNavigation } from '../../context/SpatialNavigationContext';
import { useApp } from '../../context/AppContext';

export const TVRemoteWidget: React.FC = () => {
  const {
    isRemoteOverlayVisible,
    setIsRemoteOverlayVisible,
    navigate,
    triggerSelect,
    triggerBack,
    activeFocusId,
    activeZone,
  } = useSpatialNavigation();

  const { setCurrentTab, playingSession, startPlayback, stopPlayback, mediaCatalog } = useApp();
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isRemoteOverlayVisible) return null;

  return (
    <aside
      aria-label="Virtual TV Remote Control"
      className="fixed bottom-6 right-6 z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="bg-zinc-950/95 backdrop-blur-2xl border-2 border-zinc-700/80 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-4 w-72 text-zinc-100 flex flex-col items-center select-none ring-1 ring-white/10">
        {/* Remote Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-red-500" /> Smart TV Remote
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title={isMinimized ? 'Expand' : 'Collapse'}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsRemoteOverlayVisible(false)}
              className="p-1 rounded-md text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
              title="Close Remote"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Active focus telemetry bar */}
            <div className="w-full mt-2.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 text-[11px] font-mono text-zinc-400 truncate flex items-center justify-between">
              <span className="text-zinc-500">FOCUS:</span>
              <span className="text-red-400 font-bold truncate max-w-[170px]">{activeFocusId || 'none'}</span>
            </div>

            {/* D-Pad Controller */}
            <div className="my-5 relative w-44 h-44 flex items-center justify-center">
              {/* Outer Ring Background */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-zinc-700 shadow-inner" />

              {/* Up Button */}
              <button
                onClick={() => navigate('UP')}
                aria-label="Remote Up"
                className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-10 rounded-t-2xl bg-zinc-800 hover:bg-zinc-700 active:bg-red-600 text-zinc-200 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95"
              >
                <ChevronUp className="w-6 h-6" />
              </button>

              {/* Down Button */}
              <button
                onClick={() => navigate('DOWN')}
                aria-label="Remote Down"
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-10 rounded-b-2xl bg-zinc-800 hover:bg-zinc-700 active:bg-red-600 text-zinc-200 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95"
              >
                <ChevronDown className="w-6 h-6" />
              </button>

              {/* Left Button */}
              <button
                onClick={() => navigate('LEFT')}
                aria-label="Remote Left"
                className="absolute left-1 top-1/2 -translate-y-1/2 w-10 h-12 rounded-l-2xl bg-zinc-800 hover:bg-zinc-700 active:bg-red-600 text-zinc-200 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Right Button */}
              <button
                onClick={() => navigate('RIGHT')}
                aria-label="Remote Right"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-12 rounded-r-2xl bg-zinc-800 hover:bg-zinc-700 active:bg-red-600 text-zinc-200 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* OK / Select Center Button */}
              <button
                onClick={triggerSelect}
                aria-label="Remote OK Select"
                className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 hover:brightness-110 active:scale-90 text-white font-bold text-xs shadow-[0_0_15px_rgba(220,38,38,0.6)] flex flex-col items-center justify-center transition-all border border-red-400/40"
              >
                <span>OK</span>
              </button>
            </div>

            {/* Function Buttons Row: Back, Home, Play */}
            <div className="w-full grid grid-cols-3 gap-2 mt-1">
              <button
                onClick={triggerBack}
                title="Back / Return (Escape / Backspace)"
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-zinc-850 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 active:bg-zinc-700 text-zinc-300 hover:text-white transition-all active:scale-95"
              >
                <Undo2 className="w-4 h-4 text-rose-400" />
                <span className="text-[10px] font-semibold">BACK</span>
              </button>

              <button
                onClick={() => setCurrentTab('home')}
                title="Go Home"
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 active:bg-zinc-700 text-zinc-300 hover:text-white transition-all active:scale-95"
              >
                <Home className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-semibold">HOME</span>
              </button>

              <button
                onClick={() => {
                  if (playingSession) {
                    stopPlayback();
                  } else {
                    startPlayback(mediaCatalog[0]);
                  }
                }}
                title={playingSession ? 'Stop Video' : 'Quick Play'}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 active:bg-zinc-700 text-zinc-300 hover:text-white transition-all active:scale-95"
              >
                <Play className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-semibold">{playingSession ? 'STOP' : 'PLAY'}</span>
              </button>
            </div>

            {/* Keyboard shortcut guide */}
            <div className="w-full mt-3 pt-2.5 border-t border-zinc-800/80 text-[10px] text-zinc-400 text-center space-y-1">
              <p className="text-zinc-500 font-semibold">Keyboard Controls Enabled:</p>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">↑↓←→</kbd>
                <span className="text-zinc-600">•</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">Enter</kbd>
                <span className="text-zinc-600">•</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">Esc/Back</kbd>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
