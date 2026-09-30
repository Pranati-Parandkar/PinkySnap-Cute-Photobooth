import React, { useRef, useEffect, useCallback } from 'react';
import { PlacedSticker } from '../types';
import { getStickerTemplateById } from '../utils/stickers';
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  Trash2,
  Copy,
  Maximize2,
  ZoomIn,
  ZoomOut,
  X,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface StickerCanvasProps {
  stickers: PlacedSticker[];
  onUpdateStickers: (stickers: PlacedSticker[]) => void;
  selectedId: string | null;
  onSelectSticker: (id: string | null) => void;
  readOnly?: boolean;
}

export const StickerCanvas: React.FC<StickerCanvasProps> = ({
  stickers,
  onUpdateStickers,
  selectedId,
  onSelectSticker,
  readOnly = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickersRef = useRef<PlacedSticker[]>(stickers);
  stickersRef.current = stickers;

  // Drag interaction state ref to prevent stale closures and event drops
  const dragRef = useRef<{
    isDragging: boolean;
    type: 'move' | 'scale' | 'rotate';
    stickerId: string;
    startClientX: number;
    startClientY: number;
    initialX: number;
    initialY: number;
    initialScale: number;
    initialRotation: number;
    centerX: number;
    centerY: number;
    containerRect: DOMRect | null;
  } | null>(null);

  const selectedSticker = stickers.find((s) => s.id === selectedId);

  // Global window pointer move and up handlers so drag never drops
  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || !drag.isDragging || !drag.containerRect) return;
      e.preventDefault();

      const rect = drag.containerRect;

      if (drag.type === 'move') {
        const deltaX = e.clientX - drag.startClientX;
        const deltaY = e.clientY - drag.startClientY;

        const deltaPercentX = (deltaX / rect.width) * 100;
        const deltaPercentY = (deltaY / rect.height) * 100;

        const nextX = Math.max(3, Math.min(97, drag.initialX + deltaPercentX));
        const nextY = Math.max(3, Math.min(97, drag.initialY + deltaPercentY));

        onUpdateStickers(
          stickersRef.current.map((s) => (s.id === drag.stickerId ? { ...s, x: nextX, y: nextY } : s))
        );
      } else if (drag.type === 'scale') {
        const deltaX = e.clientX - drag.startClientX;
        const deltaY = e.clientY - drag.startClientY;
        const distanceDelta = (deltaX + deltaY) / 130;
        const nextScale = Math.max(0.35, Math.min(3.2, Number((drag.initialScale + distanceDelta).toFixed(2))));

        onUpdateStickers(
          stickersRef.current.map((s) => (s.id === drag.stickerId ? { ...s, scale: nextScale } : s))
        );
      } else if (drag.type === 'rotate') {
        const currentAngle = Math.atan2(e.clientY - drag.centerY, e.clientX - drag.centerX);
        const startAngle = Math.atan2(drag.startClientY - drag.centerY, drag.startClientX - drag.centerX);
        const deltaDeg = ((currentAngle - startAngle) * 180) / Math.PI;

        const nextRot = Math.round((drag.initialRotation + deltaDeg) % 360);
        onUpdateStickers(
          stickersRef.current.map((s) => (s.id === drag.stickerId ? { ...s, rotation: nextRot } : s))
        );
      }
    };

    const handleWindowPointerUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove, { passive: false });
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [onUpdateStickers]);

  // Start Move on Pointer Down
  const handleStartMove = (e: React.PointerEvent, sticker: PlacedSticker) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();

    onSelectSticker(sticker.id);

    const rect = containerRef.current?.getBoundingClientRect() || null;
    dragRef.current = {
      isDragging: true,
      type: 'move',
      stickerId: sticker.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      initialX: sticker.x,
      initialY: sticker.y,
      initialScale: sticker.scale,
      initialRotation: sticker.rotation,
      centerX: 0,
      centerY: 0,
      containerRect: rect,
    };
  };

  // Start Corner Scale
  const handleStartScale = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedSticker || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    dragRef.current = {
      isDragging: true,
      type: 'scale',
      stickerId: selectedSticker.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      initialX: selectedSticker.x,
      initialY: selectedSticker.y,
      initialScale: selectedSticker.scale,
      initialRotation: selectedSticker.rotation,
      centerX: 0,
      centerY: 0,
      containerRect: rect,
    };
  };

  // Start Corner Rotate
  const handleStartRotate = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedSticker || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + (selectedSticker.x / 100) * rect.width;
    const centerY = rect.top + (selectedSticker.y / 100) * rect.height;

    dragRef.current = {
      isDragging: true,
      type: 'rotate',
      stickerId: selectedSticker.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      initialX: selectedSticker.x,
      initialY: selectedSticker.y,
      initialScale: selectedSticker.scale,
      initialRotation: selectedSticker.rotation,
      centerX,
      centerY,
      containerRect: rect,
    };
  };

  // Nudge Move in 4 directions
  const handleNudge = (id: string, deltaXPercent: number, deltaYPercent: number, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playStickerPop();
    onUpdateStickers(
      stickersRef.current.map((s) =>
        s.id === id
          ? {
              ...s,
              x: Math.max(3, Math.min(97, s.x + deltaXPercent)),
              y: Math.max(3, Math.min(97, s.y + deltaYPercent)),
            }
          : s
      )
    );
  };

  // Instant Delete Handler
  const handleDeleteSticker = (id: string, e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    soundEffects.playStickerPop();
    onUpdateStickers(stickersRef.current.filter((s) => s.id !== id));
    if (selectedId === id) {
      onSelectSticker(null);
    }
  };

  // Flip sticker
  const handleFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playStickerPop();
    onUpdateStickers(
      stickersRef.current.map((s) => (s.id === id ? { ...s, isFlipped: !s.isFlipped } : s))
    );
  };

  // Duplicate sticker
  const handleDuplicate = (sticker: PlacedSticker, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playStickerPop();
    const newSticker: PlacedSticker = {
      ...sticker,
      id: `placed_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      x: Math.min(90, sticker.x + 6),
      y: Math.min(90, sticker.y + 6),
    };
    onUpdateStickers([...stickersRef.current, newSticker]);
    onSelectSticker(newSticker.id);
  };

  // Tilt by delta
  const handleTiltBy = (id: string, deltaDeg: number, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playStickerPop();
    onUpdateStickers(
      stickersRef.current.map((s) => (s.id === id ? { ...s, rotation: Math.round((s.rotation + deltaDeg) % 360) } : s))
    );
  };

  // Scale by factor
  const handleScaleBy = (id: string, factor: number, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playStickerPop();
    onUpdateStickers(
      stickersRef.current.map((s) =>
        s.id === id
          ? { ...s, scale: Math.max(0.35, Math.min(3.2, Number((s.scale * factor).toFixed(2)))) }
          : s
      )
    );
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-auto overflow-hidden z-20 select-none touch-none"
    >
      {stickers.map((sticker) => {
        const template = getStickerTemplateById(sticker.templateId);
        if (!template) return null;

        const isSelected = selectedId === sticker.id && !readOnly;
        const baseSize = template.defaultSize * sticker.scale;

        let animClass = '';
        if (template.animation === 'float') animClass = 'animate-float';
        if (template.animation === 'wiggle') animClass = 'animate-wiggle';
        if (template.animation === 'pulse') animClass = 'animate-pulse-heart';
        if (template.animation === 'sparkle') animClass = 'animate-sparkle';

        return (
          <div
            key={sticker.id}
            onPointerDown={(e) => handleStartMove(e, sticker)}
            style={{
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
              transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
              width: `${baseSize}px`,
              height: `${baseSize}px`,
            }}
            className="absolute cursor-move flex items-center justify-center group touch-none"
          >
            {/* SVG Graphic */}
            <div
              className={`w-full h-full flex items-center justify-center pointer-events-none transition-transform ${animClass}`}
              style={{
                transform: sticker.isFlipped ? 'scaleX(-1)' : 'none',
              }}
            >
              {template.renderSvg(baseSize)}
            </div>

            {/* Persistent Red "✕" Button on Selected Sticker */}
            {isSelected && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => handleDeleteSticker(sticker.id, e)}
                title="Remove sticker immediately"
                aria-label="Remove sticker"
                className="pointer-events-auto absolute -top-4 -right-4 w-8 h-8 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-2xl flex items-center justify-center font-bold border-2 border-white hover:scale-120 active:scale-95 transition-transform cursor-pointer z-50"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            )}

            {/* Selected Sticker Bounding Box & Live Options (Stays until Done/Move On) */}
            {isSelected && (
              <div className="absolute -inset-3.5 border-2 border-dashed border-pink-400 rounded-2xl pointer-events-none shadow-sm">
                {/* 1. Top Rotation Handle */}
                <button
                  onPointerDown={handleStartRotate}
                  title="Drag to tilt / rotate"
                  aria-label="Rotate sticker"
                  className="pointer-events-auto absolute -top-5 left-1/2 -translate-x-1/2 w-9 h-9 bg-white text-pink-600 rounded-full shadow-lg flex items-center justify-center hover:bg-pink-50 border-2 border-pink-400 cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95 transition-transform"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* 2. Bottom-Right Resize Handle */}
                <button
                  onPointerDown={handleStartScale}
                  title="Drag to resize"
                  aria-label="Resize sticker"
                  className="pointer-events-auto absolute -bottom-4 -right-4 w-9 h-9 bg-gradient-to-tr from-pink-500 to-rose-400 text-white rounded-full shadow-lg flex items-center justify-center hover:from-pink-600 hover:to-rose-500 border-2 border-white cursor-nwse-resize hover:scale-110 active:scale-95 transition-transform"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* 3. Floating Quick Options Ribbon (PERSISTENT: Tilt, Scale, Nudge, Done) */}
                <div
                  onPointerDown={(e) => e.stopPropagation()}
                  className="pointer-events-auto absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-xl border border-pink-200/90 whitespace-nowrap z-50"
                >
                  {/* Quick Tilt */}
                  <button
                    onClick={(e) => handleTiltBy(sticker.id, -15, e)}
                    title="Tilt left 15°"
                    className="p-1.5 rounded-full hover:bg-pink-100 text-pink-700 flex items-center gap-0.5 text-[10px] font-bold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>-15°</span>
                  </button>
                  <button
                    onClick={(e) => handleTiltBy(sticker.id, 15, e)}
                    title="Tilt right 15°"
                    className="p-1.5 rounded-full hover:bg-pink-100 text-pink-700 flex items-center gap-0.5 text-[10px] font-bold"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>+15°</span>
                  </button>

                  <div className="w-[1px] h-3.5 bg-pink-200 mx-0.5" />

                  {/* Quick Scale */}
                  <button
                    onClick={(e) => handleScaleBy(sticker.id, 0.85, e)}
                    title="Smaller"
                    className="p-1.5 rounded-full hover:bg-pink-100 text-pink-700"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleScaleBy(sticker.id, 1.2, e)}
                    title="Bigger"
                    className="p-1.5 rounded-full hover:bg-pink-100 text-pink-700"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-[1px] h-3.5 bg-pink-200 mx-0.5" />

                  {/* Nudge Buttons */}
                  <div className="flex items-center gap-0.5 bg-pink-50 rounded-lg p-0.5">
                    <button
                      onClick={(e) => handleNudge(sticker.id, -4, 0, e)}
                      title="Nudge left"
                      className="p-1 rounded hover:bg-pink-200 text-pink-700"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleNudge(sticker.id, 4, 0, e)}
                      title="Nudge right"
                      className="p-1 rounded hover:bg-pink-200 text-pink-700"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleNudge(sticker.id, 0, -4, e)}
                      title="Nudge up"
                      className="p-1 rounded hover:bg-pink-200 text-pink-700"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleNudge(sticker.id, 0, 4, e)}
                      title="Nudge down"
                      className="p-1 rounded hover:bg-pink-200 text-pink-700"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="w-[1px] h-3.5 bg-pink-200 mx-0.5" />

                  {/* Flip */}
                  <button
                    onClick={(e) => handleFlip(sticker.id, e)}
                    title="Flip horizontally"
                    className="p-1.5 rounded-full hover:bg-pink-100 text-pink-700"
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={(e) => handleDuplicate(sticker, e)}
                    title="Duplicate sticker"
                    className="p-1.5 rounded-full hover:bg-pink-100 text-pink-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Trash */}
                  <button
                    onClick={(e) => handleDeleteSticker(sticker.id, e)}
                    title="Remove sticker"
                    className="p-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Done / Move on */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEffects.playStickerPop();
                      onSelectSticker(null);
                    }}
                    title="Done editing this sticker"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-[11px] font-bold ml-1 shadow-sm"
                  >
                    <Check className="w-3 h-3" />
                    <span>Done</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
