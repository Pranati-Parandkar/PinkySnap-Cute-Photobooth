import React, { useState } from 'react';
import { PlacedSticker, StickerCategory } from '../types';
import { STICKER_TEMPLATES, getStickerTemplateById } from '../utils/stickers';
import { soundEffects } from '../utils/audio';
import {
  Sparkles,
  Trash2,
  Wand2,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  Copy,
  ZoomIn,
  ZoomOut,
  Check,
  Layers,
  X,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Move,
} from 'lucide-react';

interface StickerSidebarProps {
  stickers: PlacedSticker[];
  onUpdateStickers: (stickers: PlacedSticker[]) => void;
  selectedId: string | null;
  onSelectSticker: (id: string | null) => void;
  onAddSticker: (templateId: string) => void;
  onClearStickers: () => void;
  onAddCutePreset: () => void;
}

const CATEGORIES: { id: StickerCategory | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '🌟' },
  { id: 'hearts', label: 'Hearts', emoji: '💖' },
  { id: 'sparkles', label: 'Sparkles', emoji: '✨' },
  { id: 'bows', label: 'Bows', emoji: '🎀' },
  { id: 'sweets', label: 'Sweets', emoji: '🍓' },
  { id: 'words', label: 'Words', emoji: '💬' },
  { id: 'mascots', label: 'Animals', emoji: '🐰' },
];

export const StickerSidebar: React.FC<StickerSidebarProps> = ({
  stickers,
  onUpdateStickers,
  selectedId,
  onSelectSticker,
  onAddSticker,
  onClearStickers,
  onAddCutePreset,
}) => {
  const [activeCategory, setActiveCategory] = useState<StickerCategory | 'all'>('all');

  const selectedSticker = stickers.find((s) => s.id === selectedId);
  const selectedTemplate = selectedSticker ? getStickerTemplateById(selectedSticker.templateId) : null;

  const filteredStickers =
    activeCategory === 'all'
      ? STICKER_TEMPLATES
      : STICKER_TEMPLATES.filter((s) => s.category === activeCategory);

  // Resize & Tilt handlers
  const handleScaleChange = (scale: number) => {
    if (!selectedId) return;
    onUpdateStickers(
      stickers.map((s) => (s.id === selectedId ? { ...s, scale: Number(scale.toFixed(2)) } : s))
    );
  };

  const handleTiltChange = (rotation: number) => {
    if (!selectedId) return;
    onUpdateStickers(
      stickers.map((s) => (s.id === selectedId ? { ...s, rotation: Math.round(rotation) } : s))
    );
  };

  const handleTiltBy = (deltaDeg: number) => {
    if (!selectedSticker) return;
    soundEffects.playStickerPop();
    const newRot = Math.round((selectedSticker.rotation + deltaDeg) % 360);
    handleTiltChange(newRot);
  };

  const handleScaleBy = (multiplier: number) => {
    if (!selectedSticker) return;
    soundEffects.playStickerPop();
    const newScale = Math.max(0.35, Math.min(3.2, selectedSticker.scale * multiplier));
    handleScaleChange(newScale);
  };

  // Move / Nudge sticker in 4 directions
  const handleNudge = (deltaXPercent: number, deltaYPercent: number) => {
    if (!selectedSticker) return;
    soundEffects.playStickerPop();
    onUpdateStickers(
      stickers.map((s) =>
        s.id === selectedId
          ? {
              ...s,
              x: Math.max(3, Math.min(97, s.x + deltaXPercent)),
              y: Math.max(3, Math.min(97, s.y + deltaYPercent)),
            }
          : s
      )
    );
  };

  const handleFlip = () => {
    if (!selectedId) return;
    soundEffects.playStickerPop();
    onUpdateStickers(
      stickers.map((s) => (s.id === selectedId ? { ...s, isFlipped: !s.isFlipped } : s))
    );
  };

  const handleDuplicate = () => {
    if (!selectedSticker) return;
    soundEffects.playStickerPop();
    const newSticker: PlacedSticker = {
      ...selectedSticker,
      id: `placed_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      x: Math.min(92, selectedSticker.x + 6),
      y: Math.min(92, selectedSticker.y + 6),
    };
    onUpdateStickers([...stickers, newSticker]);
    onSelectSticker(newSticker.id);
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    soundEffects.playStickerPop();
    onUpdateStickers(stickers.filter((s) => s.id !== selectedId));
    onSelectSticker(null);
  };

  const handleRemoveStickerById = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playStickerPop();
    onUpdateStickers(stickers.filter((s) => s.id !== id));
    if (selectedId === id) {
      onSelectSticker(null);
    }
  };

  return (
    <aside className="w-full h-full flex flex-col bg-white/95 backdrop-blur-md border border-pink-200/90 rounded-3xl p-3 shadow-md overflow-hidden">
      {/* 1. PERSISTENT EDIT PANEL (Stays active until user clicks Done / Move On) */}
      {selectedSticker && selectedTemplate && (
        <div className="bg-pink-50/95 border-2 border-pink-300 rounded-2xl p-2.5 mb-2 shrink-0 shadow-sm animate-fadeIn">
          {/* Header with Done / Move On */}
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-pink-200/80">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 flex items-center justify-center">
                {selectedTemplate.renderSvg(22)}
              </div>
              <span className="font-heading text-xs font-bold text-pink-900 truncate max-w-[110px]">
                {selectedTemplate.name}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleDeleteSelected}
                title="Remove sticker immediately"
                className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playStickerPop();
                  onSelectSticker(null);
                }}
                title="Done with this sticker"
                className="flex items-center gap-0.5 px-2.5 py-0.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-[10px] font-bold cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Done</span>
              </button>
            </div>
          </div>

          {/* Move / Reposition Nudge Pad */}
          <div className="flex items-center justify-between bg-white rounded-xl p-1.5 border border-pink-200 mb-2">
            <span className="text-[11px] font-bold text-pink-900 flex items-center gap-1">
              <Move className="w-3 h-3 text-pink-500" />
              <span>Move:</span>
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleNudge(-5, 0)}
                title="Move Left"
                className="p-1 rounded bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleNudge(5, 0)}
                title="Move Right"
                className="p-1 rounded bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold cursor-pointer"
              >
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleNudge(0, -5)}
                title="Move Up"
                className="p-1 rounded bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold cursor-pointer"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleNudge(0, 5)}
                title="Move Down"
                className="p-1 rounded bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold cursor-pointer"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Size Slider */}
          <div className="space-y-1 mb-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-pink-900">
              <span>Size ({Math.round(selectedSticker.scale * 100)}%):</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleScaleBy(0.85)}
                  title="Make smaller"
                  className="p-1 rounded bg-white border border-pink-200 text-pink-700 hover:bg-pink-100 cursor-pointer"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleScaleBy(1.15)}
                  title="Make bigger"
                  className="p-1 rounded bg-white border border-pink-200 text-pink-700 hover:bg-pink-100 cursor-pointer"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.8"
              step="0.05"
              value={selectedSticker.scale}
              onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
              className="w-full accent-pink-500 cursor-pointer h-1.5 bg-pink-200 rounded-lg"
            />
          </div>

          {/* Tilt Slider */}
          <div className="space-y-1 mb-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-pink-900">
              <span>Tilt ({selectedSticker.rotation}°):</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleTiltBy(-15)}
                  title="Tilt -15°"
                  className="px-1.5 py-0.5 rounded bg-white border border-pink-200 text-pink-700 text-[10px] font-bold cursor-pointer"
                >
                  -15°
                </button>
                <button
                  onClick={() => handleTiltBy(15)}
                  title="Tilt +15°"
                  className="px-1.5 py-0.5 rounded bg-white border border-pink-200 text-pink-700 text-[10px] font-bold cursor-pointer"
                >
                  +15°
                </button>
                <button
                  onClick={() => handleTiltChange(0)}
                  title="Straighten upright"
                  className="px-1.5 py-0.5 rounded bg-white border border-pink-200 text-pink-700 text-[10px] font-bold cursor-pointer"
                >
                  0°
                </button>
              </div>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="5"
              value={selectedSticker.rotation}
              onChange={(e) => handleTiltChange(parseInt(e.target.value, 10))}
              className="w-full accent-pink-500 cursor-pointer h-1.5 bg-pink-200 rounded-lg"
            />
          </div>

          {/* Quick Flip & Copy */}
          <div className="flex items-center gap-1 pt-1 border-t border-pink-200">
            <button
              onClick={handleFlip}
              className="flex-1 flex items-center justify-center gap-1 py-1 rounded-xl bg-white border border-pink-200 text-pink-800 text-[11px] font-bold hover:bg-pink-100 cursor-pointer"
            >
              <FlipHorizontal className="w-3 h-3" />
              <span>Flip</span>
            </button>
            <button
              onClick={handleDuplicate}
              className="flex-1 flex items-center justify-center gap-1 py-1 rounded-xl bg-white border border-pink-200 text-pink-800 text-[11px] font-bold hover:bg-pink-100 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. STICKERS ON PHOTO MANAGER (Instant Removal At Any Instant!) */}
      {stickers.length > 0 && (
        <div className="bg-pink-50/60 border border-pink-200/90 rounded-2xl p-2 mb-2 shrink-0">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-bold text-pink-900 flex items-center gap-1 font-heading">
              <Layers className="w-3 h-3 text-pink-500" />
              <span>On Webcam ({stickers.length}):</span>
            </span>

            <button
              onClick={onClearStickers}
              title="Remove all stickers from photo"
              className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
            >
              Remove All
            </button>
          </div>

          {/* Placed Stickers with direct instant trash button */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {stickers.map((s) => {
              const tmpl = getStickerTemplateById(s.templateId);
              if (!tmpl) return null;
              const isCurrent = selectedId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSticker(s.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[11px] font-medium shrink-0 cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                      : 'bg-white text-slate-700 border-pink-200 hover:border-pink-400'
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    {tmpl.renderSvg(16)}
                  </div>
                  <span className="truncate max-w-[70px]">{tmpl.name}</span>
                  {/* Instant Remove Button */}
                  <button
                    onClick={(e) => handleRemoveStickerById(s.id, e)}
                    title="Remove this sticker immediately"
                    className={`ml-0.5 p-0.5 rounded-full hover:scale-120 transition-transform ${
                      isCurrent ? 'text-white hover:bg-white/20' : 'text-rose-500 hover:bg-rose-100'
                    }`}
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. CATALOG HEADER */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-pink-100 px-1 shrink-0">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <h2 className="font-heading text-sm font-bold text-pink-900 leading-tight">
            Sticker Catalog
          </h2>
        </div>

        <button
          onClick={() => {
            soundEffects.playSparkleChime();
            onAddCutePreset();
          }}
          title="Auto-style selfie with blush, bow, and stars!"
          className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          <Wand2 className="w-3 h-3" />
          <span>Magic Look</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-1 shrink-0 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                soundEffects.playStickerPop();
                setActiveCategory(cat.id);
              }}
              className={`flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'bg-pink-50/80 text-pink-700/80 hover:bg-pink-100 hover:text-pink-900'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stickers Grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2 pr-0.5 no-scrollbar">
        {filteredStickers.map((sticker) => {
          return (
            <button
              key={sticker.id}
              onClick={() => {
                soundEffects.playStickerPop();
                onAddSticker(sticker.id);
              }}
              className="flex flex-col items-center justify-center p-2 rounded-2xl bg-pink-50/50 hover:bg-pink-100/80 border border-pink-100 hover:border-pink-300 hover:scale-105 active:scale-95 transition-all cursor-pointer group aspect-square shadow-2xs"
              title={`Add ${sticker.name}`}
            >
              <div className="w-10 h-10 flex items-center justify-center group-hover:rotate-6 transition-transform">
                {sticker.renderSvg(38)}
              </div>
              <span className="text-[9px] font-bold text-pink-900/80 truncate w-full text-center mt-1">
                {sticker.name}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
