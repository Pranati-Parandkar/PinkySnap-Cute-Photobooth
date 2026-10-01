/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CapturedShot, FilterId, PhotoboothMode, PlacedSticker, SavedPhotoStrip } from './types';
import { getFilterById } from './utils/filters';
import { Header } from './components/Header';
import { CameraView } from './components/CameraView';
import { FilterSidebar } from './components/FilterSidebar';
import { StickerSidebar } from './components/StickerSidebar';
import { PhotoStripEditor } from './components/PhotoStripEditor';
import { GalleryModal } from './components/GalleryModal';
import { soundEffects } from './utils/audio';
import { Wand2, Camera as CameraIcon, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'camera' | 'strip' | 'gallery'>('camera');
  const [currentFilterId, setCurrentFilterId] = useState<FilterId>('pink_bubblegum');

  // Stickers placed on the camera/photo
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  // Captured photos from session
  const [capturedShots, setCapturedShots] = useState<CapturedShot[]>([]);
  const [capturedMode, setCapturedMode] = useState<PhotoboothMode>('strip4');

  // Scrapbook / Gallery saved strips
  const [savedStrips, setSavedStrips] = useState<SavedPhotoStrip[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Load saved gallery from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pinkysnap_saved_strips');
      if (stored) {
        setSavedStrips(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveToGallery = (strip: SavedPhotoStrip) => {
    setSavedStrips((prev) => {
      const updated = [strip, ...prev];
      try {
        localStorage.setItem('pinkysnap_saved_strips', JSON.stringify(updated.slice(0, 30)));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleDeleteSavedStrip = (id: string) => {
    setSavedStrips((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem('pinkysnap_saved_strips', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Add sticker to canvas
  const handleAddSticker = (templateId: string) => {
    const jitterX = (Math.random() - 0.5) * 16;
    const jitterY = (Math.random() - 0.5) * 16;

    const newSticker: PlacedSticker = {
      id: `placed_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      templateId,
      x: 50 + jitterX,
      y: 50 + jitterY,
      scale: 1.0,
      rotation: Math.round((Math.random() - 0.5) * 14),
      isFlipped: false,
    };

    setStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  // Magic Look preset: auto places cute blush, bow, and stars for selfie posing!
  const handleAddCutePreset = () => {
    const presetStickers: PlacedSticker[] = [
      {
        id: `preset_bow_${Date.now()}`,
        templateId: 'coquette_bow',
        x: 50,
        y: 20,
        scale: 1.15,
        rotation: -2,
        isFlipped: false,
      },
      {
        id: `preset_blush_${Date.now()}`,
        templateId: 'blush_cheeks',
        x: 50,
        y: 54,
        scale: 1.25,
        rotation: 0,
        isFlipped: false,
      },
      {
        id: `preset_sparkle1_${Date.now()}`,
        templateId: 'sparkle_kira',
        x: 20,
        y: 25,
        scale: 0.9,
        rotation: 12,
        isFlipped: false,
      },
      {
        id: `preset_sparkle2_${Date.now()}`,
        templateId: 'single_star',
        x: 82,
        y: 28,
        scale: 1.0,
        rotation: -10,
        isFlipped: false,
      },
      {
        id: `preset_kawaii_${Date.now()}`,
        templateId: 'badge_kawaii',
        x: 76,
        y: 82,
        scale: 0.95,
        rotation: 8,
        isFlipped: false,
      },
    ];

    setStickers((prev) => [...prev, ...presetStickers]);
    setSelectedStickerId(null);
  };

  const handleClearStickers = () => {
    setStickers([]);
    setSelectedStickerId(null);
  };

  // When shots are finished snapping
  const handlePhotosCaptured = (shots: CapturedShot[], mode: PhotoboothMode) => {
    setCapturedShots(shots);
    setCapturedMode(mode);
    setActiveTab('strip');
    soundEffects.playSparkleChime();
  };

  const handleRetake = () => {
    setActiveTab('camera');
  };

  const activeFilter = getFilterById(currentFilterId);

  return (
    <div className="min-h-screen lg:h-screen w-screen overflow-y-auto lg:overflow-hidden bg-pink-leopard flex flex-col font-sans selection:bg-pink-300 selection:text-pink-900 text-slate-800">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'gallery') {
            setIsGalleryOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        savedCount={savedStrips.length}
        hasPhotos={capturedShots.length > 0}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-2 sm:px-3 py-2 overflow-y-auto lg:overflow-hidden flex flex-col">
        {activeTab === 'camera' ? (
          <>
            {/* DESKTOP 3-COLUMN STUDIO LAYOUT (lg and up - UNCHANGED) */}
            <div className="hidden lg:flex flex-1 w-full items-stretch gap-3 overflow-hidden min-h-0">
              {/* Left Column: Aesthetic Filters */}
              <div className="w-64 xl:w-72 shrink-0 h-full">
                <FilterSidebar
                  currentFilterId={currentFilterId}
                  onSelectFilter={setCurrentFilterId}
                />
              </div>

              {/* Center Column: Photobooth Frame & Webcam */}
              <div className="flex-1 min-w-0 h-full flex flex-col items-center justify-center overflow-hidden">
                <div className="w-full max-w-2xl flex flex-col items-center justify-center h-full">
                  <CameraView
                    filter={activeFilter}
                    stickers={stickers}
                    onUpdateStickers={setStickers}
                    selectedStickerId={selectedStickerId}
                    onSelectSticker={setSelectedStickerId}
                    onPhotosCaptured={handlePhotosCaptured}
                  />
                </div>
              </div>

              {/* Right Column: Kawaii Stickers & Edit Controls */}
              <div className="w-76 xl:w-84 shrink-0 h-full">
                <StickerSidebar
                  stickers={stickers}
                  onUpdateStickers={setStickers}
                  selectedId={selectedStickerId}
                  onSelectSticker={setSelectedStickerId}
                  onAddSticker={handleAddSticker}
                  onClearStickers={handleClearStickers}
                  onAddCutePreset={handleAddCutePreset}
                />
              </div>
            </div>

            {/* MOBILE LAYOUT (< lg): Options & Preview on Top, then Divided Filters & Stickers */}
            <div className="flex lg:hidden flex-col w-full gap-3 pb-8">
              {/* 1. Photobooth Options & Live Preview Cabinet (at the top!) */}
              <div className="w-full">
                <CameraView
                  filter={activeFilter}
                  stickers={stickers}
                  onUpdateStickers={setStickers}
                  selectedStickerId={selectedStickerId}
                  onSelectSticker={setSelectedStickerId}
                  onPhotosCaptured={handlePhotosCaptured}
                />
              </div>

              {/* 2. Divided Filters & Stickers Section directly underneath: FILTER | STICKER */}
              <div className="w-full grid grid-cols-2 gap-2 h-[380px] sm:h-[420px]">
                {/* Left Column: FILTER */}
                <div className="h-full overflow-hidden">
                  <FilterSidebar
                    currentFilterId={currentFilterId}
                    onSelectFilter={setCurrentFilterId}
                  />
                </div>

                {/* Right Column: STICKER */}
                <div className="h-full overflow-hidden">
                  <StickerSidebar
                    stickers={stickers}
                    onUpdateStickers={setStickers}
                    selectedId={selectedStickerId}
                    onSelectSticker={setSelectedStickerId}
                    onAddSticker={handleAddSticker}
                    onClearStickers={handleClearStickers}
                    onAddCutePreset={handleAddCutePreset}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Decorate & Photo Strip Editor */
          <div className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto py-2">
            <PhotoStripEditor
              shots={capturedShots}
              initialMode={capturedMode}
              onRetake={handleRetake}
              onSaveToGallery={handleSaveToGallery}
              filterName={activeFilter.name}
            />
          </div>
        )}
      </main>

      {/* Scrapbook Gallery Modal */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        savedStrips={savedStrips}
        onDeleteStrip={handleDeleteSavedStrip}
      />
    </div>
  );
}
