import React, { useState, useEffect, useRef } from 'react';
import { CapturedShot, FrameOption, PhotoboothMode, PlacedSticker, SavedPhotoStrip } from '../types';
import { FRAME_OPTIONS, getFrameById } from '../utils/frames';
import { renderPhotoboothStrip } from '../utils/canvasRenderer';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Heart,
  Calendar,
  Type,
  LayoutGrid,
  Columns,
  Square,
  BookmarkPlus,
} from 'lucide-react';

interface PhotoStripEditorProps {
  shots: CapturedShot[];
  initialMode: PhotoboothMode;
  onRetake: () => void;
  onSaveToGallery: (strip: SavedPhotoStrip) => void;
  filterName: string;
}

export const PhotoStripEditor: React.FC<PhotoStripEditorProps> = ({
  shots,
  initialMode,
  onRetake,
  onSaveToGallery,
  filterName,
}) => {
  const [currentMode, setCurrentMode] = useState<PhotoboothMode>(initialMode);
  const [selectedFrameId, setSelectedFrameId] = useState<string>('soft_pink');
  const [caption, setCaption] = useState<string>('sweet memories ♡');
  const [showDate, setShowDate] = useState<boolean>(true);
  const [renderedImageUrl, setRenderedImageUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(true);
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [hasSaved, setHasSaved] = useState<boolean>(false);

  const selectedFrame = getFrameById(selectedFrameId);

  // Trigger re-render whenever layout, frame, or caption changes
  useEffect(() => {
    let isCancelled = false;
    setIsRendering(true);

    const generateStrip = async () => {
      try {
        const url = await renderPhotoboothStrip({
          shots,
          mode: currentMode,
          frame: selectedFrame,
          caption,
          showDate,
        });
        if (!isCancelled) {
          setRenderedImageUrl(url);
          setIsRendering(false);
        }
      } catch (err) {
        console.error('Strip generation error:', err);
        if (!isCancelled) setIsRendering(false);
      }
    };

    const timer = setTimeout(generateStrip, 80);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [shots, currentMode, selectedFrame, caption, showDate]);

  // Download high-res PNG with celebratory confetti
  const handleDownload = () => {
    if (!renderedImageUrl) return;

    soundEffects.playSparkleChime();

    // Trigger sweet confetti burst
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f472b6', '#fb7185', '#fda4af', '#fbcfe8', '#fef08a'],
    });

    const link = document.createElement('a');
    link.download = `PinkySnap_${currentMode}_${Date.now()}.png`;
    link.href = renderedImageUrl;
    link.click();

    // Auto-save to gallery
    if (!hasSaved) {
      handleSave();
    }
  };

  // Copy to clipboard
  const handleCopyToClipboard = async () => {
    if (!renderedImageUrl) return;
    try {
      soundEffects.playStickerPop();
      const response = await fetch(renderedImageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    } catch {
      // Fallback
      handleDownload();
    }
  };

  // Save to in-app gallery
  const handleSave = () => {
    if (!renderedImageUrl || hasSaved) return;
    soundEffects.playStickerPop();
    const newStrip: SavedPhotoStrip = {
      id: `strip_${Date.now()}`,
      timestamp: Date.now(),
      dataUrl: renderedImageUrl,
      mode: currentMode,
      caption,
      filterName,
      frameName: selectedFrame.name,
    };
    onSaveToGallery(newStrip);
    setHasSaved(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-12">
      {/* Left Column: Strip Preview Viewport */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-md bg-white rounded-3xl p-4 shadow-xl border border-pink-100 flex flex-col items-center">
          {/* Top cute badge */}
          <div className="w-full flex items-center justify-between text-xs text-pink-600 mb-3 font-semibold px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Photo Strip</span>
            </span>
            <span className="text-slate-400">High-Res Print Quality</span>
          </div>

          {/* Rendered Image Preview */}
          <div className="relative max-h-[70vh] overflow-y-auto rounded-2xl flex items-center justify-center bg-pink-50/50 p-2 shadow-inner border border-pink-100/80">
            {isRendering ? (
              <div className="flex flex-col items-center justify-center p-12 text-pink-600 gap-3">
                <Sparkles className="w-8 h-8 animate-sparkle" />
                <span className="font-heading text-sm font-semibold">Developing your cute photos...</span>
              </div>
            ) : renderedImageUrl ? (
              <img
                src={renderedImageUrl}
                alt="Photobooth strip"
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-md transition-all"
              />
            ) : null}
          </div>

          {/* Quick Action Buttons below preview */}
          <div className="w-full grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-heading font-semibold text-sm shadow-md shadow-pink-300 hover:from-pink-600 hover:to-rose-500 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Save Photo</span>
            </button>

            <button
              onClick={handleCopyToClipboard}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-heading font-semibold text-sm border border-pink-200 active:scale-95 transition-all cursor-pointer"
            >
              {hasCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Image</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Customization Sidebar */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Layout Format Selection */}
        <div className="bg-white/85 backdrop-blur-md rounded-3xl p-4 border border-pink-100 shadow-sm">
          <label className="block text-xs font-bold text-pink-800 uppercase tracking-wider mb-2 font-heading">
            Strip Layout
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                soundEffects.playStickerPop();
                setCurrentMode('strip4');
              }}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all cursor-pointer ${
                currentMode === 'strip4'
                  ? 'bg-pink-50 border-pink-400 text-pink-700 shadow-sm'
                  : 'bg-white hover:bg-pink-50/50 border-slate-200 text-slate-600'
              }`}
            >
              <Columns className="w-5 h-5" />
              <span className="text-xs font-semibold">4-Cut Strip</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playStickerPop();
                setCurrentMode('grid4');
              }}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all cursor-pointer ${
                currentMode === 'grid4'
                  ? 'bg-pink-50 border-pink-400 text-pink-700 shadow-sm'
                  : 'bg-white hover:bg-pink-50/50 border-slate-200 text-slate-600'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="text-xs font-semibold">2×2 Grid</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playStickerPop();
                setCurrentMode('single');
              }}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all cursor-pointer ${
                currentMode === 'single'
                  ? 'bg-pink-50 border-pink-400 text-pink-700 shadow-sm'
                  : 'bg-white hover:bg-pink-50/50 border-slate-200 text-slate-600'
              }`}
            >
              <Square className="w-5 h-5" />
              <span className="text-xs font-semibold">Polaroid</span>
            </button>
          </div>
        </div>

        {/* Frame Color & Pattern Theme */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 border border-pink-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-pink-800 uppercase tracking-wider font-heading">
              Frame Backgrounds ({FRAME_OPTIONS.length})
            </label>
            <span className="text-[10px] font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">
              Dark & Pastel Styles
            </span>
          </div>

          {/* Dark Girly Category Header */}
          <p className="text-[11px] font-bold text-rose-900 mb-1.5 flex items-center gap-1 font-heading">
            <span>🖤</span>
            <span>Dark Girly & Gothic Coquette:</span>
          </p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {FRAME_OPTIONS.filter((f) =>
              [
                'midnight_cherry',
                'goth_velvet_black',
                'dark_berry_wine',
                'midnight_sparkle',
                'dark_leopard_noir',
                'espresso_rose',
                'dark_emerald_coquette',
                'vampire_lace',
                'mauve_twilight',
              ].includes(f.id)
            ).map((frame) => {
              const isSelected = selectedFrameId === frame.id;
              return (
                <button
                  key={frame.id}
                  onClick={() => {
                    soundEffects.playStickerPop();
                    setSelectedFrameId(frame.id);
                  }}
                  className={`flex flex-col items-center p-2 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-pink-500 ring-2 ring-pink-400 shadow-md bg-pink-50/50'
                      : 'border-slate-200 hover:border-pink-300 bg-white/70'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full border-2 border-white/80 shadow-md mb-1 ${frame.bgClass}`}
                  />
                  <span className="text-[9px] font-bold text-slate-800 truncate w-full text-center">
                    {frame.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Cute Pastels Category Header */}
          <p className="text-[11px] font-bold text-pink-800 mb-1.5 flex items-center gap-1 font-heading">
            <span>🎀</span>
            <span>Cute Pastels & Y2K:</span>
          </p>
          <div className="grid grid-cols-4 gap-2">
            {FRAME_OPTIONS.filter((f) =>
              [
                'soft_pink',
                'strawberry_milk',
                'cherry_blossom',
                'checker_pink',
                'holographic',
                'coquette_bows',
                'pastel_lilac',
                'retro_polaroid',
              ].includes(f.id)
            ).map((frame) => {
              const isSelected = selectedFrameId === frame.id;
              return (
                <button
                  key={frame.id}
                  onClick={() => {
                    soundEffects.playStickerPop();
                    setSelectedFrameId(frame.id);
                  }}
                  className={`flex flex-col items-center p-2 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-pink-500 ring-2 ring-pink-400 shadow-md bg-pink-50/50'
                      : 'border-slate-200 hover:border-pink-300 bg-white/70'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full border-2 border-white/80 shadow-sm mb-1 ${frame.bgClass}`}
                  />
                  <span className="text-[9px] font-bold text-slate-800 truncate w-full text-center">
                    {frame.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Caption & Date Stamp Options */}
        <div className="bg-white/85 backdrop-blur-md rounded-3xl p-4 border border-pink-100 shadow-sm space-y-3">
          <label className="block text-xs font-bold text-pink-800 uppercase tracking-wider font-heading">
            Caption & Date
          </label>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1 font-medium">
              <Type className="w-3.5 h-3.5 text-pink-500" />
              <span>Handwritten Caption</span>
            </div>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. cute besties 💕"
              maxLength={36}
              className="w-full px-3.5 py-2 rounded-xl bg-pink-50/50 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm font-handwriting text-lg text-pink-900"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-pink-500" />
              <span>Include Date Stamp</span>
            </label>
            <input
              type="checkbox"
              checked={showDate}
              onChange={(e) => {
                soundEffects.playStickerPop();
                setShowDate(e.target.checked);
              }}
              className="w-4 h-4 rounded text-pink-500 focus:ring-pink-400 border-pink-300"
            />
          </div>
        </div>

        {/* Bottom Auxiliary Buttons (Retake, Save) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEffects.playStickerPop();
              onRetake();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl bg-white hover:bg-pink-50 text-pink-700 font-semibold text-xs border border-pink-200 shadow-sm transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Photos</span>
          </button>

          <button
            onClick={handleSave}
            disabled={hasSaved}
            className={`flex items-center gap-1.5 py-2.5 px-4 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
              hasSaved
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white hover:bg-pink-50 text-pink-700 border-pink-200'
            }`}
          >
            {hasSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved to Gallery</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Save to Gallery</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
