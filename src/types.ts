/**
 * Types for PinkySnap Cute Photobooth
 */

export type FilterId = 
  | 'normal'
  | 'pink_bubblegum'
  | 'dreamy_soft'
  | 'tokyo_harajuku'
  | 'film_90s'
  | 'sparkle_blush'
  | 'sweet_peach'
  | 'vintage_rose'
  | 'cyber_y2k'
  | 'classic_noir'
  | 'digicam_2000'
  | 'grainy_vintage_35mm'
  | 'y2k_cyber_pink'
  | 'retro_vhs_tape'
  | 'digicam_flash'
  | 'vintage_gal_purikura'
  | 'grainy_lofi'
  | 'grainy_noir'
  | 'dreamy_angel_aura'
  | 'faded_polaroid'
  | 'milky_lavender_haze'
  | 'faded_blush_matte'
  | 'cloud_nine_mist'
  | 'vintage_peach_glow'
  | 'ethereal_moonlight';

export interface FilterDefinition {
  id: FilterId;
  name: string;
  tagline: string;
  emoji: string;
  cssFilter: string;
  overlayStyle?: string;
  canvasFilter: string;
  overlayColor?: string; // e.g. rgba(255, 182, 193, 0.15)
  overlayBlendMode?: GlobalCompositeOperation;
}

export type StickerCategory = 
  | 'hearts' 
  | 'sparkles' 
  | 'bows' 
  | 'sweets' 
  | 'words' 
  | 'mascots'
  | 'frames';

export type StickerAnimation = 'float' | 'wiggle' | 'pulse' | 'sparkle' | 'none';

export interface StickerTemplate {
  id: string;
  name: string;
  category: StickerCategory;
  animation: StickerAnimation;
  defaultSize: number; // in pixels
  renderSvg: (size: number) => React.ReactNode;
  svgRaw: string; // for rendering to offscreen canvas
}

export interface PlacedSticker {
  id: string;
  templateId: string;
  x: number; // percentage (0 to 100) relative to photo width
  y: number; // percentage (0 to 100) relative to photo height
  scale: number; // multiplier (e.g. 1.0)
  rotation: number; // degrees
  isFlipped: boolean;
}

export type PhotoboothMode = 'single' | 'strip4' | 'grid4';

export type FrameTheme = 
  | 'soft_pink'
  | 'strawberry_milk'
  | 'cherry_blossom'
  | 'checker_pink'
  | 'holographic'
  | 'coquette_bows'
  | 'pastel_lilac'
  | 'retro_polaroid'
  | 'midnight_cherry'
  | 'goth_velvet_black'
  | 'dark_berry_wine'
  | 'midnight_sparkle'
  | 'dark_leopard_noir'
  | 'espresso_rose'
  | 'dark_emerald_coquette'
  | 'vampire_lace'
  | 'mauve_twilight';

export interface FrameOption {
  id: FrameTheme;
  name: string;
  bgClass: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
  canvasBg: string; // for canvas rendering
}

export interface CapturedShot {
  id: string;
  dataUrl: string;
  timestamp: number;
}

export interface SavedPhotoStrip {
  id: string;
  timestamp: number;
  dataUrl: string;
  mode: PhotoboothMode;
  caption: string;
  filterName: string;
  frameName: string;
}

export interface DoodleStroke {
  color: string;
  size: number;
  points: { x: number; y: number }[]; // percentages (0 to 100)
}
