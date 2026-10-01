import React from 'react';
import { Camera, Sparkles, Volume2, VolumeX, Image as ImageIcon, Heart } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface HeaderProps {
  activeTab: 'camera' | 'strip' | 'gallery';
  setActiveTab: (tab: 'camera' | 'strip' | 'gallery') => void;
  savedCount: number;
  hasPhotos: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  hasPhotos,
}) => {
  const [isMuted, setIsMuted] = React.useState(soundEffects.isMuted);

  const handleToggleSound = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundEffects.playStickerPop();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-pink-100 shadow-[0_2px_12px_rgba(244,114,182,0.08)]">
      <div className="max-w-6xl mx-auto px-4 h-15 flex items-center justify-between">
        {/* Zone 1: Brand title, one line */}
        <div 
          onClick={() => setActiveTab('camera')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-sm shadow-pink-300 group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <span className="font-heading text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent tracking-tight">
            PinkySnap
          </span>
        </div>

        {/* Zone 2: Navigation segmented control */}
        <nav className="flex items-center gap-1.5 p-1 bg-pink-100/70 rounded-full border border-pink-200/60">
          <button
            onClick={() => {
              soundEffects.playStickerPop();
              setActiveTab('camera');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'camera'
                ? 'bg-white text-pink-600 shadow-sm shadow-pink-200'
                : 'text-pink-700/80 hover:text-pink-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Booth</span>
          </button>

          <button
            onClick={() => {
              if (!hasPhotos) return;
              soundEffects.playStickerPop();
              setActiveTab('strip');
            }}
            disabled={!hasPhotos}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'strip'
                ? 'bg-white text-pink-600 shadow-sm shadow-pink-200'
                : hasPhotos
                ? 'text-pink-700/80 hover:text-pink-900'
                : 'text-pink-300 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Decorate & </span>
            <span>Strip</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Sound & Saved Gallery) - Visible on Desktop, Moved to symmetric box on Mobile */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            aria-label="Toggle cute sounds"
            className="w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-600 flex items-center justify-center border border-pink-200/80 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              soundEffects.playStickerPop();
              setActiveTab('gallery');
            }}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white text-xs font-semibold hover:from-pink-600 hover:to-rose-500 shadow-sm shadow-pink-300 transition-all active:scale-95"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gallery</span>
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-white text-pink-600 font-bold text-[10px] rounded-full">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
