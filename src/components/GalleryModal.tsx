import React from 'react';
import { SavedPhotoStrip } from '../types';
import { soundEffects } from '../utils/audio';
import { X, Download, Trash2, Heart, Sparkles, Image as ImageIcon } from 'lucide-react';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedStrips: SavedPhotoStrip[];
  onDeleteStrip: (id: string) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  savedStrips,
  onDeleteStrip,
}) => {
  if (!isOpen) return null;

  const handleDownload = (strip: SavedPhotoStrip) => {
    soundEffects.playSparkleChime();
    const link = document.createElement('a');
    link.download = `PinkySnap_${strip.timestamp}.png`;
    link.href = strip.dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-pink-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100 bg-pink-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-sm">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-pink-900 leading-tight">
                My Photo Scrapbook
              </h2>
              <p className="text-xs text-pink-600">
                {savedStrips.length} {savedStrips.length === 1 ? 'memory' : 'memories'} saved
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playStickerPop();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white hover:bg-pink-100 text-slate-500 hover:text-pink-600 flex items-center justify-center border border-pink-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          {savedStrips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-pink-400 mb-3">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="font-heading text-base font-semibold text-slate-700 mb-1">
                Your scrapbook is empty!
              </h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Snap some cute photos in the booth with animated stickers and save them here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {savedStrips.map((strip) => {
                const dateStr = new Date(strip.timestamp).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div
                    key={strip.id}
                    className="group relative bg-pink-50/40 rounded-2xl p-3 border border-pink-100/80 hover:border-pink-300 shadow-sm hover:shadow-md transition-all flex flex-col items-center"
                  >
                    {/* Thumbnail preview */}
                    <div className="w-full flex items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-inner border border-pink-100">
                      <img
                        src={strip.dataUrl}
                        alt="Saved photo strip"
                        className="max-h-64 object-contain rounded-lg group-hover:scale-101 transition-transform"
                      />
                    </div>

                    {/* Metadata */}
                    <div className="w-full mt-2.5 flex items-center justify-between text-xs px-1">
                      <div>
                        <p className="font-handwriting text-base font-bold text-pink-900 truncate max-w-[130px]">
                          {strip.caption || 'Sweet Memory'}
                        </p>
                        <p className="text-[10px] text-pink-500">{dateStr}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDownload(strip)}
                          title="Download photo"
                          className="p-1.5 rounded-lg bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            soundEffects.playStickerPop();
                            onDeleteStrip(strip.id);
                          }}
                          title="Delete from scrapbook"
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
