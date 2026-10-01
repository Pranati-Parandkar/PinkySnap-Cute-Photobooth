import React, { useState } from 'react';
import { FilterDefinition, FilterId } from '../types';
import { PHOTO_FILTERS } from '../utils/filters';
import { soundEffects } from '../utils/audio';
import { Sparkles, Wand2 } from 'lucide-react';

interface FilterSidebarProps {
  currentFilterId: FilterId;
  onSelectFilter: (filterId: FilterId) => void;
}

type FilterGenre = 'all' | 'dreamy_faded' | 'vintage_digicam' | 'y2k_cyber' | 'cute_pastel';

const GENRE_TAGS: { id: FilterGenre; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '🌟' },
  { id: 'dreamy_faded', label: 'Dreamy & Faded', emoji: '☁️' },
  { id: 'vintage_digicam', label: 'Vintage / Digicam', emoji: '📷' },
  { id: 'y2k_cyber', label: 'Y2K Cyber', emoji: '🪩' },
  { id: 'cute_pastel', label: 'Cute Pastel', emoji: '🎀' },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  currentFilterId,
  onSelectFilter,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<FilterGenre>('all');

  const filteredPresets = PHOTO_FILTERS.filter((f) => {
    if (selectedGenre === 'all') return true;
    if (selectedGenre === 'dreamy_faded') {
      return [
        'dreamy_angel_aura',
        'faded_polaroid',
        'milky_lavender_haze',
        'faded_blush_matte',
        'cloud_nine_mist',
        'vintage_peach_glow',
        'ethereal_moonlight',
        'dreamy_soft',
        'grainy_lofi',
      ].includes(f.id);
    }
    if (selectedGenre === 'vintage_digicam') {
      return [
        'digicam_2000',
        'grainy_vintage_35mm',
        'digicam_flash',
        'retro_vhs_tape',
        'grainy_lofi',
        'grainy_noir',
        'film_90s',
        'vintage_rose',
        'faded_polaroid',
      ].includes(f.id);
    }
    if (selectedGenre === 'y2k_cyber') {
      return [
        'cyber_y2k',
        'y2k_cyber_pink',
        'vintage_gal_purikura',
        'tokyo_harajuku',
        'digicam_flash',
      ].includes(f.id);
    }
    if (selectedGenre === 'cute_pastel') {
      return [
        'pink_bubblegum',
        'dreamy_soft',
        'sparkle_blush',
        'sweet_peach',
        'normal',
      ].includes(f.id);
    }
    return true;
  });

  return (
    <aside className="w-full h-full flex flex-col bg-white/95 backdrop-blur-md border border-pink-200/90 rounded-3xl p-2 sm:p-3 shadow-md overflow-hidden">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-pink-100 px-1 shrink-0">
        <div className="flex items-center gap-1.5">
          <Wand2 className="w-4 h-4 text-pink-500" />
          <h2 className="font-heading text-sm font-bold text-pink-900 leading-tight">
            Filters
          </h2>
        </div>
        <span className="text-[10px] font-semibold text-pink-500 bg-pink-100/80 px-2 py-0.5 rounded-full">
          25 Presets
        </span>
      </div>

      {/* Genre Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-1 shrink-0 no-scrollbar">
        {GENRE_TAGS.map((genre) => {
          const isActive = selectedGenre === genre.id;
          return (
            <button
              key={genre.id}
              onClick={() => {
                soundEffects.playStickerPop();
                setSelectedGenre(genre.id);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'bg-pink-50 text-pink-700/80 hover:bg-pink-100'
              }`}
            >
              <span>{genre.emoji}</span>
              <span>{genre.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Presets Vertical Scrollable List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 no-scrollbar">
        {filteredPresets.map((filter) => {
          const isSelected = filter.id === currentFilterId;
          return (
            <button
              key={filter.id}
              onClick={() => {
                soundEffects.playStickerPop();
                onSelectFilter(filter.id);
              }}
              className={`w-full flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 rounded-2xl transition-all cursor-pointer text-left ${
                isSelected
                  ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-md shadow-pink-200 scale-[1.01]'
                  : 'bg-pink-50/60 hover:bg-pink-100/80 text-slate-700 border border-pink-100/80'
              }`}
            >
              {/* Filter Emoji Box */}
              <div
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-sm sm:text-base shrink-0 shadow-inner ${
                  isSelected ? 'bg-white/20 border border-white/40' : 'bg-white border border-pink-200'
                }`}
              >
                <span>{filter.emoji}</span>
              </div>

              {/* Title & Tagline */}
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] sm:text-xs font-bold truncate leading-tight ${isSelected ? 'text-white' : 'text-pink-950'}`}>
                  {filter.name}
                </p>
                <p className={`text-[9px] sm:text-[10px] truncate ${isSelected ? 'text-pink-100' : 'text-pink-600/80'}`}>
                  {filter.tagline}
                </p>
              </div>

              {isSelected && (
                <Sparkles className="w-3.5 h-3.5 text-white animate-sparkle shrink-0 mr-1" />
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
