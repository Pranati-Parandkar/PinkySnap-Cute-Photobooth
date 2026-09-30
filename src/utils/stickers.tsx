import React from 'react';
import { StickerTemplate } from '../types';

export const STICKER_TEMPLATES: StickerTemplate[] = [
  // --- HEARTS & BLUSH ---
  {
    id: 'heart_flutter',
    name: 'Fluttering Hearts',
    category: 'hearts',
    animation: 'pulse',
    defaultSize: 80,
    renderSvg: (size: number) => (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M50 82s-30-18.4-38.2-30.8C4.5 40 7 24 20.8 17.5 32 12.2 44.5 19 50 25.5c5.5-6.5 18-13.3 29.2-8 13.8 6.5 16.3 22.5 9 33.7C80 63.6 50 82 50 82z"
          fill="url(#heart-grad)"
          stroke="#fff"
          strokeWidth="3.5"
          filter="drop-shadow(0 4px 8px rgba(244, 63, 94, 0.4))"
        />
        <circle cx="36" cy="32" r="5" fill="#fff" opacity="0.8" />
        <circle cx="43" cy="24" r="2.5" fill="#fff" opacity="0.9" />
        <path d="M78 18l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="#fef08a" />
        <defs>
          <linearGradient id="heart-grad" x1="20" y1="15" x2="80" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fb7185" />
            <stop offset="1" stopColor="#e11d48" />
          </linearGradient>
        </defs>
      </svg>
    ),
    svgRaw: `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hg" x1="20" y1="15" x2="80" y2="85" gradientUnits="userSpaceOnUse">
          <stop stop-color="#fb7185" />
          <stop offset="1" stop-color="#e11d48" />
        </linearGradient>
      </defs>
      <path d="M50 82s-30-18.4-38.2-30.8C4.5 40 7 24 20.8 17.5 32 12.2 44.5 19 50 25.5c5.5-6.5 18-13.3 29.2-8 13.8 6.5 16.3 22.5 9 33.7C80 63.6 50 82 50 82z" fill="url(#hg)" stroke="#fff" stroke-width="4"/>
      <circle cx="36" cy="32" r="5" fill="#fff" opacity="0.8" />
      <circle cx="43" cy="24" r="2.5" fill="#fff" opacity="0.9" />
      <path d="M78 18l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="#fef08a" />
    </svg>`,
  },
  {
    id: 'blush_cheeks',
    name: 'Kawaii Blush',
    category: 'hearts',
    animation: 'pulse',
    defaultSize: 110,
    renderSvg: (size: number) => (
      <svg width={size} height={size * 0.45} viewBox="0 0 160 70" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left cheek blush */}
        <ellipse cx="35" cy="35" rx="30" ry="18" fill="url(#blush-l)" opacity="0.85" />
        <path d="M22 28l5 14M33 24l5 18M44 28l5 14" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
        <circle cx="50" cy="25" r="3" fill="#fff" opacity="0.9" />
        
        {/* Right cheek blush */}
        <ellipse cx="125" cy="35" rx="30" ry="18" fill="url(#blush-r)" opacity="0.85" />
        <path d="M112 28l5 14M123 24l5 18M134 28l5 14" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
        <circle cx="140" cy="25" r="3" fill="#fff" opacity="0.9" />

        <defs>
          <radialGradient id="blush-l" cx="0.5" cy="0.5" r="0.5">
            <stop stopColor="#fb7185" stopOpacity="0.8" />
            <stop offset="1" stopColor="#fb7185" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="blush-r" cx="0.5" cy="0.5" r="0.5">
            <stop stopColor="#fb7185" stopOpacity="0.8" />
            <stop offset="1" stopColor="#fb7185" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    ),
    svgRaw: `<svg width="160" height="70" viewBox="0 0 160 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bl" cx="0.5" cy="0.5" r="0.5">
          <stop stop-color="#fb7185" stop-opacity="0.8" />
          <stop offset="1" stop-color="#fb7185" stop-opacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="35" cy="35" rx="30" ry="18" fill="url(#bl)" opacity="0.85" />
      <path d="M22 28l5 14M33 24l5 18M44 28l5 14" stroke="#f43f5e" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="125" cy="35" rx="30" ry="18" fill="url(#bl)" opacity="0.85" />
      <path d="M112 28l5 14M123 24l5 18M134 28l5 14" stroke="#f43f5e" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
  },

  // --- BOWS & COQUETTE ---
  {
    id: 'coquette_bow',
    name: 'Silk Pink Bow',
    category: 'bows',
    animation: 'wiggle',
    defaultSize: 95,
    renderSvg: (size: number) => (
      <svg width={size} height={size * 0.8} viewBox="0 0 120 95" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Tails */}
        <path
          d="M50 50c-6 16-16 32-28 40 10-6 16-18 20-30M70 50c6 16 16 32 28 40-10-6-16-18-20-30"
          fill="#f472b6"
          stroke="#fff"
          strokeWidth="3"
        />
        {/* Left loop */}
        <path
          d="M60 45C45 20 15 15 12 35c-3 20 28 22 48 10z"
          fill="url(#bow-grad)"
          stroke="#fff"
          strokeWidth="3.5"
          filter="drop-shadow(0 3px 6px rgba(236,72,153,0.3))"
        />
        <path d="M25 32c8 2 20 6 30 10" stroke="#fbcfe8" strokeWidth="2" strokeLinecap="round" />
        {/* Right loop */}
        <path
          d="M60 45C75 20 105 15 108 35c3 20-28 22-48 10z"
          fill="url(#bow-grad)"
          stroke="#fff"
          strokeWidth="3.5"
          filter="drop-shadow(0 3px 6px rgba(236,72,153,0.3))"
        />
        <path d="M95 32c-8 2-20 6-30 10" stroke="#fbcfe8" strokeWidth="2" strokeLinecap="round" />
        {/* Center knot */}
        <ellipse cx="60" cy="45" rx="12" ry="11" fill="#ec4899" stroke="#fff" strokeWidth="3.5" />
        <ellipse cx="58" cy="42" rx="4" ry="3" fill="#fff" opacity="0.6" />
        <defs>
          <linearGradient id="bow-grad" x1="10" y1="20" x2="110" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f472b6" />
            <stop offset="1" stopColor="#fb7185" />
          </linearGradient>
        </defs>
      </svg>
    ),
    svgRaw: `<svg width="120" height="95" viewBox="0 0 120 95" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="10" y1="20" x2="110" y2="50" gradientUnits="userSpaceOnUse">
          <stop stop-color="#f472b6" />
          <stop offset="1" stop-color="#fb7185" />
        </linearGradient>
      </defs>
      <path d="M50 50c-6 16-16 32-28 40 10-6 16-18 20-30M70 50c6 16 16 32 28 40-10-6-16-18-20-30" fill="#f472b6" stroke="#fff" stroke-width="3"/>
      <path d="M60 45C45 20 15 15 12 35c-3 20 28 22 48 10z" fill="url(#bg)" stroke="#fff" stroke-width="4"/>
      <path d="M60 45C75 20 105 15 108 35c3 20-28 22-48 10z" fill="url(#bg)" stroke="#fff" stroke-width="4"/>
      <ellipse cx="60" cy="45" rx="12" ry="11" fill="#ec4899" stroke="#fff" stroke-width="4" />
      <ellipse cx="58" cy="42" rx="4" ry="3" fill="#fff" opacity="0.7" />
    </svg>`,
  },
  {
    id: 'bunny_ears',
    name: 'Bunny Ears',
    category: 'mascots',
    animation: 'wiggle',
    defaultSize: 110,
    renderSvg: (size: number) => (
      <svg width={size} height={size * 0.9} viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left ear */}
        <path d="M35 90 C15 70 8 30 24 10 C38 -4 48 30 45 90 Z" fill="#fff" stroke="#f472b6" strokeWidth="4" />
        <path d="M33 75 C22 60 18 32 28 18 C37 8 41 35 39 75 Z" fill="#fbcfe8" />
        {/* Right ear */}
        <path d="M75 90 C95 70 102 30 86 10 C72 -4 62 30 65 90 Z" fill="#fff" stroke="#f472b6" strokeWidth="4" />
        <path d="M77 75 C88 60 92 32 82 18 C73 8 69 35 71 75 Z" fill="#fbcfe8" />
        {/* Center tiny bow */}
        <circle cx="55" cy="85" r="6" fill="#f43f5e" stroke="#fff" strokeWidth="2" />
        <ellipse cx="46" cy="84" rx="7" ry="5" fill="#fb7185" stroke="#fff" strokeWidth="2" />
        <ellipse cx="64" cy="84" rx="7" ry="5" fill="#fb7185" stroke="#fff" strokeWidth="2" />
      </svg>
    ),
    svgRaw: `<svg width="110" height="100" viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M35 90 C15 70 8 30 24 10 C38 -4 48 30 45 90 Z" fill="#fff" stroke="#f472b6" stroke-width="4" />
      <path d="M33 75 C22 60 18 32 28 18 C37 8 41 35 39 75 Z" fill="#fbcfe8" />
      <path d="M75 90 C95 70 102 30 86 10 C72 -4 62 30 65 90 Z" fill="#fff" stroke="#f472b6" stroke-width="4" />
      <path d="M77 75 C88 60 92 32 82 18 C73 8 69 35 71 75 Z" fill="#fbcfe8" />
      <circle cx="55" cy="85" r="6" fill="#f43f5e" stroke="#fff" stroke-width="2" />
      <ellipse cx="46" cy="84" rx="7" ry="5" fill="#fb7185" stroke="#fff" stroke-width="2" />
      <ellipse cx="64" cy="84" rx="7" ry="5" fill="#fb7185" stroke="#fff" stroke-width="2" />
    </svg>`,
  },
  {
    id: 'kitty_whiskers',
    name: 'Kitty Whiskers',
    category: 'mascots',
    animation: 'wiggle',
    defaultSize: 120,
    renderSvg: (size: number) => (
      <svg width={size} height={size * 0.45} viewBox="0 0 140 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left whiskers */}
        <path d="M48 24 C30 20 12 18 2 16 M49 32 C30 32 15 35 4 38 M50 39 C34 44 20 52 8 60" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
        {/* Right whiskers */}
        <path d="M92 24 C110 20 128 18 138 16 M91 32 C110 32 125 35 136 38 M90 39 C106 44 120 52 132 60" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
        {/* Pink nose */}
        <path d="M64 26 C64 22 76 22 76 26 C76 33 70 36 70 36 C70 36 64 33 64 26 Z" fill="#f43f5e" stroke="#fff" strokeWidth="2" />
        {/* Mouth */}
        <path d="M70 36 C67 44 60 44 57 40 M70 36 C73 44 80 44 83 40" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    svgRaw: `<svg width="140" height="60" viewBox="0 0 140 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M48 24 C30 20 12 18 2 16 M49 32 C30 32 15 35 4 38 M50 39 C34 44 20 52 8 60" stroke="#f43f5e" stroke-width="3" stroke-linecap="round" />
      <path d="M92 24 C110 20 128 18 138 16 M91 32 C110 32 125 35 136 38 M90 39 C106 44 120 52 132 60" stroke="#f43f5e" stroke-width="3" stroke-linecap="round" />
      <path d="M64 26 C64 22 76 22 76 26 C76 33 70 36 70 36 C70 36 64 33 64 26 Z" fill="#f43f5e" stroke="#fff" stroke-width="2" />
      <path d="M70 36 C67 44 60 44 57 40 M70 36 C73 44 80 44 83 40" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round" />
    </svg>`,
  },

  // --- SPARKLES & STARS ---
  {
    id: 'sparkle_kira',
    name: 'Kira Sparkle Cluster',
    category: 'sparkles',
    animation: 'sparkle',
    defaultSize: 85,
    renderSvg: (size: number) => (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main Star */}
        <path
          d="M50 10 Q50 45 15 50 Q50 55 50 90 Q50 55 85 50 Q50 45 50 10 Z"
          fill="url(#star-gold)"
          stroke="#fff"
          strokeWidth="3"
        />
        <circle cx="50" cy="50" r="7" fill="#fff" />
        {/* Small pink star */}
        <path d="M22 20 Q22 28 14 30 Q22 32 22 40 Q22 32 30 30 Q22 28 22 20 Z" fill="#f472b6" stroke="#fff" strokeWidth="1.5" />
        {/* Bottom star */}
        <path d="M75 65 Q75 73 67 75 Q75 77 75 85 Q75 77 83 75 Q75 73 75 65 Z" fill="#67e8f9" stroke="#fff" strokeWidth="1.5" />
        <circle cx="78" cy="24" r="3" fill="#fef08a" />
        <circle cx="25" cy="75" r="2.5" fill="#f472b6" />
        <defs>
          <linearGradient id="star-gold" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fef08a" />
            <stop offset="0.5" stopColor="#fde047" />
            <stop offset="1" stopColor="#f472b6" />
          </linearGradient>
        </defs>
      </svg>
    ),
    svgRaw: `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sg" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stop-color="#fef08a" />
          <stop offset="0.5" stop-color="#fde047" />
          <stop offset="1" stop-color="#f472b6" />
        </linearGradient>
      </defs>
      <path d="M50 10 Q50 45 15 50 Q50 55 50 90 Q50 55 85 50 Q50 45 50 10 Z" fill="url(#sg)" stroke="#fff" stroke-width="4"/>
      <circle cx="50" cy="50" r="7" fill="#fff" />
      <path d="M22 20 Q22 28 14 30 Q22 32 22 40 Q22 32 30 30 Q22 28 22 20 Z" fill="#f472b6" stroke="#fff" stroke-width="2" />
      <path d="M75 65 Q75 73 67 75 Q75 77 75 85 Q75 77 83 75 Q75 73 75 65 Z" fill="#67e8f9" stroke="#fff" stroke-width="2" />
    </svg>`,
  },
  {
    id: 'single_star',
    name: 'Kawaii Twinkle',
    category: 'sparkles',
    animation: 'sparkle',
    defaultSize: 55,
    renderSvg: (size: number) => (
      <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M30 5 Q30 26 9 30 Q30 34 30 55 Q30 34 51 30 Q30 26 30 5 Z"
          fill="#fff"
          stroke="#f472b6"
          strokeWidth="3.5"
        />
        <circle cx="30" cy="30" r="4.5" fill="#f43f5e" />
      </svg>
    ),
    svgRaw: `<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 5 Q30 26 9 30 Q30 34 30 55 Q30 34 51 30 Q30 26 30 5 Z" fill="#fff" stroke="#f472b6" stroke-width="4"/>
      <circle cx="30" cy="30" r="4.5" fill="#f43f5e" />
    </svg>`,
  },
  {
    id: 'tiara_crown',
    name: 'Princess Tiara',
    category: 'bows',
    animation: 'float',
    defaultSize: 90,
    renderSvg: (size: number) => (
      <svg width={size} height={size * 0.6} viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10 50 Q50 55 90 50 L84 26 L65 40 L50 12 L35 40 L16 26 Z"
          fill="url(#tiara-grad)"
          stroke="#fff"
          strokeWidth="3"
        />
        <circle cx="50" cy="14" r="5" fill="#f43f5e" stroke="#fff" strokeWidth="1.5" />
        <circle cx="16" cy="27" r="4" fill="#ec4899" stroke="#fff" strokeWidth="1.5" />
        <circle cx="84" cy="27" r="4" fill="#ec4899" stroke="#fff" strokeWidth="1.5" />
        <circle cx="50" cy="36" r="3.5" fill="#fff" />
        <defs>
          <linearGradient id="tiara-grad" x1="10" y1="15" x2="90" y2="55" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fef08a" />
            <stop offset="0.6" stopColor="#fbcfe8" />
            <stop offset="1" stopColor="#f472b6" />
          </linearGradient>
        </defs>
      </svg>
    ),
    svgRaw: `<svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tg" x1="10" y1="15" x2="90" y2="55" gradientUnits="userSpaceOnUse">
          <stop stop-color="#fef08a" />
          <stop offset="0.6" stop-color="#fbcfe8" />
          <stop offset="1" stop-color="#f472b6" />
        </linearGradient>
      </defs>
      <path d="M10 50 Q50 55 90 50 L84 26 L65 40 L50 12 L35 40 L16 26 Z" fill="url(#tg)" stroke="#fff" stroke-width="3"/>
      <circle cx="50" cy="14" r="5" fill="#f43f5e" stroke="#fff" stroke-width="2" />
      <circle cx="16" cy="27" r="4" fill="#ec4899" stroke="#fff" stroke-width="2" />
      <circle cx="84" cy="27" r="4" fill="#ec4899" stroke="#fff" stroke-width="2" />
    </svg>`,
  },

  // --- SWEETS & TREATS ---
  {
    id: 'sweet_cherries',
    name: 'Glossy Cherries',
    category: 'sweets',
    animation: 'wiggle',
    defaultSize: 80,
    renderSvg: (size: number) => (
      <svg width={size} height={size} viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Leaf */}
        <path d="M48 20 C60 10 75 14 78 26 C68 28 55 26 48 20 Z" fill="#86efac" stroke="#fff" strokeWidth="2.5" />
        {/* Stems */}
        <path d="M30 55 C35 35 42 22 48 20 C54 24 58 35 62 55" stroke="#4ade80" strokeWidth="3.5" strokeLinecap="round" />
        {/* Left cherry */}
        <circle cx="30" cy="62" r="18" fill="url(#cherry-grad)" stroke="#fff" strokeWidth="3" />
        <ellipse cx="24" cy="55" rx="5" ry="3.5" fill="#fff" opacity="0.8" transform="rotate(-30 24 55)" />
        {/* Right cherry */}
        <circle cx="62" cy="62" r="18" fill="url(#cherry-grad)" stroke="#fff" strokeWidth="3" />
        <ellipse cx="56" cy="55" rx="5" ry="3.5" fill="#fff" opacity="0.8" transform="rotate(-30 56 55)" />
        <defs>
          <linearGradient id="cherry-grad" x1="15" y1="45" x2="45" y2="75" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fb7185" />
            <stop offset="0.5" stopColor="#e11d48" />
            <stop offset="1" stopColor="#9f1239" />
          </linearGradient>
        </defs>
      </svg>
    ),
    svgRaw: `<svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cg" x1="15" y1="45" x2="45" y2="75" gradientUnits="userSpaceOnUse">
          <stop stop-color="#fb7185" />
          <stop offset="0.5" stop-color="#e11d48" />
          <stop offset="1" stop-color="#9f1239" />
        </linearGradient>
      </defs>
      <path d="M48 20 C60 10 75 14 78 26 C68 28 55 26 48 20 Z" fill="#86efac" stroke="#fff" stroke-width="2.5" />
      <path d="M30 55 C35 35 42 22 48 20 C54 24 58 35 62 55" stroke="#4ade80" stroke-width="3.5" stroke-linecap="round" />
      <circle cx="30" cy="62" r="18" fill="url(#cg)" stroke="#fff" stroke-width="3" />
      <circle cx="62" cy="62" r="18" fill="url(#cg)" stroke="#fff" stroke-width="3" />
      <ellipse cx="24" cy="55" rx="5" ry="3.5" fill="#fff" opacity="0.8" transform="rotate(-30 24 55)" />
      <ellipse cx="56" cy="55" rx="5" ry="3.5" fill="#fff" opacity="0.8" transform="rotate(-30 56 55)" />
    </svg>`,
  },
  {
    id: 'strawberry_cake',
    name: 'Strawberry Cake',
    category: 'sweets',
    animation: 'float',
    defaultSize: 85,
    renderSvg: (size: number) => (
      <svg width={size} height={size * 0.9} viewBox="0 0 90 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cake slice base */}
        <path d="M12 55 L78 55 L82 72 L8 72 Z" fill="#fbcfe8" stroke="#fff" strokeWidth="2.5" />
        <path d="M10 38 L80 38 L78 55 L12 55 Z" fill="#fdf2f8" stroke="#fff" strokeWidth="2.5" />
        {/* Jam stripe */}
        <line x1="11" y1="46" x2="79" y2="46" stroke="#f43f5e" strokeWidth="3" />
        {/* Cream top dollops */}
        <circle cx="22" cy="38" r="8" fill="#fff" />
        <circle cx="37" cy="36" r="8" fill="#fff" />
        <circle cx="53" cy="36" r="8" fill="#fff" />
        <circle cx="68" cy="38" r="8" fill="#fff" />
        {/* Strawberry on top */}
        <path d="M45 10 C38 10 32 20 38 30 C45 38 45 38 45 38 C45 38 45 38 52 30 C58 20 52 10 45 10 Z" fill="#e11d48" stroke="#fff" strokeWidth="2" />
        <circle cx="42" cy="20" r="1.5" fill="#fef08a" />
        <circle cx="48" cy="22" r="1.5" fill="#fef08a" />
        <circle cx="45" cy="27" r="1.5" fill="#fef08a" />
        <path d="M41 12 C45 6 45 6 49 12" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    svgRaw: `<svg width="90" height="80" viewBox="0 0 90 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 55 L78 55 L82 72 L8 72 Z" fill="#fbcfe8" stroke="#fff" stroke-width="2.5" />
      <path d="M10 38 L80 38 L78 55 L12 55 Z" fill="#fdf2f8" stroke="#fff" stroke-width="2.5" />
      <line x1="11" y1="46" x2="79" y2="46" stroke="#f43f5e" stroke-width="3" />
      <circle cx="22" cy="38" r="8" fill="#fff" />
      <circle cx="37" cy="36" r="8" fill="#fff" />
      <circle cx="53" cy="36" r="8" fill="#fff" />
      <circle cx="68" cy="38" r="8" fill="#fff" />
      <path d="M45 10 C38 10 32 20 38 30 C45 38 45 38 45 38 C45 38 45 38 52 30 C58 20 52 10 45 10 Z" fill="#e11d48" stroke="#fff" stroke-width="2" />
      <circle cx="42" cy="20" r="1.5" fill="#fef08a" />
      <circle cx="48" cy="22" r="1.5" fill="#fef08a" />
      <circle cx="45" cy="27" r="1.5" fill="#fef08a" />
    </svg>`,
  },
  {
    id: 'boba_milk_tea',
    name: 'Pink Boba Milk Tea',
    category: 'sweets',
    animation: 'wiggle',
    defaultSize: 80,
    renderSvg: (size: number) => (
      <svg width={size} height={size * 1.1} viewBox="0 0 70 85" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Straw */}
        <line x1="42" y1="5" x2="33" y2="35" stroke="#f472b6" strokeWidth="7" strokeLinecap="round" />
        {/* Lid */}
        <ellipse cx="35" cy="25" rx="25" ry="7" fill="#fff" stroke="#f472b6" strokeWidth="3" />
        {/* Cup */}
        <path d="M14 26 L22 76 C23 79 47 79 48 76 L56 26 Z" fill="url(#boba-tea)" stroke="#fff" strokeWidth="3" />
        {/* Pearls */}
        <circle cx="28" cy="68" r="4.5" fill="#4c0519" />
        <circle cx="40" cy="70" r="4.5" fill="#4c0519" />
        <circle cx="34" cy="62" r="4.5" fill="#4c0519" />
        <circle cx="46" cy="63" r="4.5" fill="#4c0519" />
        {/* Heart logo */}
        <path d="M35 48 c-3-4-8-2-8 2 0 4 8 8 8 8s8-4 8-8c0-4-5-6-8-2z" fill="#fff" opacity="0.8" />
        <defs>
          <linearGradient id="boba-tea" x1="14" y1="26" x2="56" y2="76" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fbcfe8" />
            <stop offset="1" stopColor="#f472b6" />
          </linearGradient>
        </defs>
      </svg>
    ),
    svgRaw: `<svg width="70" height="85" viewBox="0 0 70 85" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bt" x1="14" y1="26" x2="56" y2="76" gradientUnits="userSpaceOnUse">
          <stop stop-color="#fbcfe8" />
          <stop offset="1" stop-color="#f472b6" />
        </linearGradient>
      </defs>
      <line x1="42" y1="5" x2="33" y2="35" stroke="#f472b6" stroke-width="7" stroke-linecap="round" />
      <ellipse cx="35" cy="25" rx="25" ry="7" fill="#fff" stroke="#f472b6" stroke-width="3" />
      <path d="M14 26 L22 76 C23 79 47 79 48 76 L56 26 Z" fill="url(#bt)" stroke="#fff" stroke-width="3" />
      <circle cx="28" cy="68" r="4.5" fill="#4c0519" />
      <circle cx="40" cy="70" r="4.5" fill="#4c0519" />
      <circle cx="34" cy="62" r="4.5" fill="#4c0519" />
      <circle cx="46" cy="63" r="4.5" fill="#4c0519" />
    </svg>`,
  },

  // --- KAWAII WORDS & STAMPS ---
  {
    id: 'badge_kawaii',
    name: 'KAWAII Stamp',
    category: 'words',
    animation: 'pulse',
    defaultSize: 110,
    renderSvg: (size: number) => (
      <svg width={size} height={size * 0.45} viewBox="0 0 140 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="130" height="50" rx="25" fill="#ec4899" stroke="#fff" strokeWidth="4" />
        <rect x="9" y="9" width="122" height="42" rx="21" fill="#fdf2f8" />
        <text
          x="70"
          y="37"
          fontFamily="Fredoka, cursive, sans-serif"
          fontWeight="bold"
          fontSize="24"
          fill="#db2777"
          textAnchor="middle"
          letterSpacing="2"
        >
          KAWAII
        </text>
        <circle cx="22" cy="30" r="4" fill="#fb7185" />
        <circle cx="118" cy="30" r="4" fill="#fb7185" />
      </svg>
    ),
    svgRaw: `<svg width="140" height="60" viewBox="0 0 140 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="130" height="50" rx="25" fill="#ec4899" stroke="#fff" stroke-width="4" />
      <rect x="9" y="9" width="122" height="42" rx="21" fill="#fdf2f8" />
      <text x="70" y="37" font-family="sans-serif" font-weight="bold" font-size="24" fill="#db2777" text-anchor="middle" letter-spacing="2">KAWAII</text>
      <circle cx="22" cy="30" r="4" fill="#fb7185" />
      <circle cx="118" cy="30" r="4" fill="#fb7185" />
    </svg>`,
  },
  {
    id: 'badge_sweet',
    name: 'SWEET Badge',
    category: 'words',
    animation: 'wiggle',
    defaultSize: 100,
    renderSvg: (size: number) => (
      <svg width={size} height={size * 0.55} viewBox="0 0 120 65" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10 32 C10 16 26 10 60 10 C94 10 110 16 110 32 C110 48 94 54 60 54 C26 54 10 48 10 32 Z"
          fill="url(#sweet-bg)"
          stroke="#fff"
          strokeWidth="3.5"
        />
        <text
          x="60"
          y="39"
          fontFamily="Fredoka, cursive, sans-serif"
          fontWeight="bold"
          fontSize="22"
          fill="#fff"
          textAnchor="middle"
          letterSpacing="1.5"
        >
          SWEET♡
        </text>
        <defs>
          <linearGradient id="sweet-bg" x1="10" y1="10" x2="110" y2="54" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f43f5e" />
            <stop offset="1" stopColor="#fb7185" />
          </linearGradient>
        </defs>
      </svg>
    ),
    svgRaw: `<svg width="120" height="65" viewBox="0 0 120 65" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="swb" x1="10" y1="10" x2="110" y2="54" gradientUnits="userSpaceOnUse">
          <stop stop-color="#f43f5e" />
          <stop offset="1" stop-color="#fb7185" />
        </linearGradient>
      </defs>
      <path d="M10 32 C10 16 26 10 60 10 C94 10 110 16 110 32 C110 48 94 54 60 54 C26 54 10 48 10 32 Z" fill="url(#swb)" stroke="#fff" stroke-width="4"/>
      <text x="60" y="39" font-family="sans-serif" font-weight="bold" font-size="22" fill="#fff" text-anchor="middle" letter-spacing="1.5">SWEET♡</text>
    </svg>`,
  },
  {
    id: 'badge_angel',
    name: 'ANGEL Badge',
    category: 'words',
    animation: 'float',
    defaultSize: 110,
    renderSvg: (size: number) => (
      <svg width={size} height={size * 0.55} viewBox="0 0 130 65" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left wing */}
        <path d="M35 32 C20 22 5 22 2 35 C10 42 25 38 35 35 Z" fill="#fff" stroke="#fbcfe8" strokeWidth="2.5" />
        {/* Right wing */}
        <path d="M95 32 C110 22 125 22 128 35 C120 42 105 38 95 35 Z" fill="#fff" stroke="#fbcfe8" strokeWidth="2.5" />
        {/* Center pill */}
        <rect x="25" y="15" width="80" height="35" rx="17.5" fill="#fdf2f8" stroke="#f472b6" strokeWidth="3" />
        {/* Halo */}
        <ellipse cx="65" cy="11" rx="18" ry="4" stroke="#fef08a" strokeWidth="2.5" fill="none" />
        <text
          x="65"
          y="38"
          fontFamily="Fredoka, cursive, sans-serif"
          fontWeight="bold"
          fontSize="18"
          fill="#db2777"
          textAnchor="middle"
          letterSpacing="1.5"
        >
          ANGEL
        </text>
      </svg>
    ),
    svgRaw: `<svg width="130" height="65" viewBox="0 0 130 65" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M35 32 C20 22 5 22 2 35 C10 42 25 38 35 35 Z" fill="#fff" stroke="#fbcfe8" stroke-width="2.5" />
      <path d="M95 32 C110 22 125 22 128 35 C120 42 105 38 95 35 Z" fill="#fff" stroke="#fbcfe8" stroke-width="2.5" />
      <rect x="25" y="15" width="80" height="35" rx="17.5" fill="#fdf2f8" stroke="#f472b6" stroke-width="3" />
      <ellipse cx="65" cy="11" rx="18" ry="4" stroke="#fef08a" stroke-width="3" fill="none" />
      <text x="65" y="38" font-family="sans-serif" font-weight="bold" font-size="18" fill="#db2777" text-anchor="middle" letter-spacing="1.5">ANGEL</text>
    </svg>`,
  },
  {
    id: 'badge_100cutie',
    name: '100% CUTIE',
    category: 'words',
    animation: 'pulse',
    defaultSize: 105,
    renderSvg: (size: number) => (
      <svg width={size} height={size * 0.55} viewBox="0 0 130 70" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="120" height="60" rx="16" fill="#fff" stroke="#f43f5e" strokeWidth="4" />
        <rect x="9" y="9" width="112" height="52" rx="12" fill="#ffe4e6" />
        <text
          x="65"
          y="32"
          fontFamily="Fredoka, cursive, sans-serif"
          fontWeight="bold"
          fontSize="14"
          fill="#f43f5e"
          textAnchor="middle"
        >
          ★ 100% ★
        </text>
        <text
          x="65"
          y="52"
          fontFamily="Fredoka, cursive, sans-serif"
          fontWeight="bold"
          fontSize="18"
          fill="#be123c"
          textAnchor="middle"
          letterSpacing="1"
        >
          CUTIE
        </text>
      </svg>
    ),
    svgRaw: `<svg width="130" height="70" viewBox="0 0 130 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="120" height="60" rx="16" fill="#fff" stroke="#f43f5e" stroke-width="4" />
      <rect x="9" y="9" width="112" height="52" rx="12" fill="#ffe4e6" />
      <text x="65" y="32" font-family="sans-serif" font-weight="bold" font-size="14" fill="#f43f5e" text-anchor="middle">★ 100% ★</text>
      <text x="65" y="52" font-family="sans-serif" font-weight="bold" font-size="18" fill="#be123c" text-anchor="middle" letter-spacing="1">CUTIE</text>
    </svg>`,
  },

  // --- FLOWERS & FAIRY ---
  {
    id: 'flower_sakura',
    name: 'Sakura Blossom',
    category: 'hearts',
    animation: 'sparkle',
    defaultSize: 75,
    renderSvg: (size: number) => (
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* 5 Petals */}
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <path
            key={i}
            d="M40 40 C32 20 28 8 40 4 C52 8 48 20 40 40 Z"
            fill="url(#sakura-grad)"
            stroke="#fff"
            strokeWidth="2"
            transform={`rotate(${angle} 40 40)`}
          />
        ))}
        <circle cx="40" cy="40" r="7" fill="#fef08a" stroke="#fff" strokeWidth="2" />
        <defs>
          <linearGradient id="sakura-grad" x1="30" y1="5" x2="50" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fbcfe8" />
            <stop offset="1" stopColor="#f472b6" />
          </linearGradient>
        </defs>
      </svg>
    ),
    svgRaw: `<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sg2" x1="30" y1="5" x2="50" y2="40" gradientUnits="userSpaceOnUse">
          <stop stop-color="#fbcfe8" />
          <stop offset="1" stop-color="#f472b6" />
        </linearGradient>
      </defs>
      <g>
        <path d="M40 40 C32 20 28 8 40 4 C52 8 48 20 40 40 Z" fill="url(#sg2)" stroke="#fff" stroke-width="2" transform="rotate(0 40 40)"/>
        <path d="M40 40 C32 20 28 8 40 4 C52 8 48 20 40 40 Z" fill="url(#sg2)" stroke="#fff" stroke-width="2" transform="rotate(72 40 40)"/>
        <path d="M40 40 C32 20 28 8 40 4 C52 8 48 20 40 40 Z" fill="url(#sg2)" stroke="#fff" stroke-width="2" transform="rotate(144 40 40)"/>
        <path d="M40 40 C32 20 28 8 40 4 C52 8 48 20 40 40 Z" fill="url(#sg2)" stroke="#fff" stroke-width="2" transform="rotate(216 40 40)"/>
        <path d="M40 40 C32 20 28 8 40 4 C52 8 48 20 40 40 Z" fill="url(#sg2)" stroke="#fff" stroke-width="2" transform="rotate(288 40 40)"/>
      </g>
      <circle cx="40" cy="40" r="7" fill="#fef08a" stroke="#fff" stroke-width="2" />
    </svg>`,
  },
  {
    id: 'fairy_butterfly',
    name: 'Fairy Butterfly',
    category: 'sparkles',
    animation: 'float',
    defaultSize: 85,
    renderSvg: (size: number) => (
      <svg width={size} height={size * 0.8} viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left top wing */}
        <path d="M50 40 C38 12 12 10 8 30 C5 45 28 50 50 40 Z" fill="url(#bf-left)" stroke="#fff" strokeWidth="2.5" />
        {/* Left bottom wing */}
        <path d="M50 40 C35 48 20 62 25 72 C32 78 45 60 50 40 Z" fill="#fbcfe8" stroke="#fff" strokeWidth="2.5" />
        {/* Right top wing */}
        <path d="M50 40 C62 12 88 10 92 30 C95 45 72 50 50 40 Z" fill="url(#bf-right)" stroke="#fff" strokeWidth="2.5" />
        {/* Right bottom wing */}
        <path d="M50 40 C65 48 80 62 75 72 C68 78 55 60 50 40 Z" fill="#fbcfe8" stroke="#fff" strokeWidth="2.5" />
        {/* Body */}
        <ellipse cx="50" cy="40" rx="3" ry="14" fill="#ec4899" />
        <line x1="50" y1="28" x2="44" y2="18" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="28" x2="56" y2="18" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
        <defs>
          <linearGradient id="bf-left" x1="10" y1="20" x2="50" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a5f3fc" />
            <stop offset="1" stopColor="#f472b6" />
          </linearGradient>
          <linearGradient id="bf-right" x1="90" y1="20" x2="50" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a5f3fc" />
            <stop offset="1" stopColor="#f472b6" />
          </linearGradient>
        </defs>
      </svg>
    ),
    svgRaw: `<svg width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bfl" x1="10" y1="20" x2="50" y2="40" gradientUnits="userSpaceOnUse">
          <stop stop-color="#a5f3fc" />
          <stop offset="1" stop-color="#f472b6" />
        </linearGradient>
        <linearGradient id="bfr" x1="90" y1="20" x2="50" y2="40" gradientUnits="userSpaceOnUse">
          <stop stop-color="#a5f3fc" />
          <stop offset="1" stop-color="#f472b6" />
        </linearGradient>
      </defs>
      <path d="M50 40 C38 12 12 10 8 30 C5 45 28 50 50 40 Z" fill="url(#bfl)" stroke="#fff" stroke-width="2.5" />
      <path d="M50 40 C35 48 20 62 25 72 C32 78 45 60 50 40 Z" fill="#fbcfe8" stroke="#fff" stroke-width="2.5" />
      <path d="M50 40 C62 12 88 10 92 30 C95 45 72 50 50 40 Z" fill="url(#bfr)" stroke="#fff" stroke-width="2.5" />
      <path d="M50 40 C65 48 80 62 75 72 C68 78 55 60 50 40 Z" fill="#fbcfe8" stroke="#fff" stroke-width="2.5" />
      <ellipse cx="50" cy="40" rx="3" ry="14" fill="#ec4899" />
    </svg>`,
  },
  {
    id: 'bear_paws',
    name: 'Bear Paws',
    category: 'mascots',
    animation: 'wiggle',
    defaultSize: 85,
    renderSvg: (size: number) => (
      <svg width={size} height={size * 0.8} viewBox="0 0 90 75" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main pad */}
        <ellipse cx="45" cy="48" rx="22" ry="17" fill="#fff" stroke="#f472b6" strokeWidth="3" />
        <ellipse cx="45" cy="48" rx="14" ry="10" fill="#fbcfe8" />
        {/* 4 Toe pads */}
        <circle cx="25" cy="24" r="7" fill="#fff" stroke="#f472b6" strokeWidth="2.5" />
        <circle cx="25" cy="24" r="4.5" fill="#fbcfe8" />

        <circle cx="38" cy="17" r="7.5" fill="#fff" stroke="#f472b6" strokeWidth="2.5" />
        <circle cx="38" cy="17" r="5" fill="#fbcfe8" />

        <circle cx="52" cy="17" r="7.5" fill="#fff" stroke="#f472b6" strokeWidth="2.5" />
        <circle cx="52" cy="17" r="5" fill="#fbcfe8" />

        <circle cx="65" cy="24" r="7" fill="#fff" stroke="#f472b6" strokeWidth="2.5" />
        <circle cx="65" cy="24" r="4.5" fill="#fbcfe8" />
      </svg>
    ),
    svgRaw: `<svg width="90" height="75" viewBox="0 0 90 75" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="45" cy="48" rx="22" ry="17" fill="#fff" stroke="#f472b6" stroke-width="3" />
      <ellipse cx="45" cy="48" rx="14" ry="10" fill="#fbcfe8" />
      <circle cx="25" cy="24" r="7" fill="#fff" stroke="#f472b6" stroke-width="2.5" />
      <circle cx="25" cy="24" r="4.5" fill="#fbcfe8" />
      <circle cx="38" cy="17" r="7.5" fill="#fff" stroke="#f472b6" stroke-width="2.5" />
      <circle cx="38" cy="17" r="5" fill="#fbcfe8" />
      <circle cx="52" cy="17" r="7.5" fill="#fff" stroke="#f472b6" stroke-width="2.5" />
      <circle cx="52" cy="17" r="5" fill="#fbcfe8" />
      <circle cx="65" cy="24" r="7" fill="#fff" stroke="#f472b6" stroke-width="2.5" />
      <circle cx="65" cy="24" r="4.5" fill="#fbcfe8" />
    </svg>`,
  },
];

export const getStickerTemplateById = (id: string): StickerTemplate | undefined => {
  return STICKER_TEMPLATES.find((s) => s.id === id);
};
