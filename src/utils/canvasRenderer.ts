import { CapturedShot, FrameOption, FilterDefinition, PhotoboothMode, PlacedSticker } from '../types';
import { getStickerTemplateById } from './stickers';

// Helper to load an image source into HTMLImageElement
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
};

// Helper to convert SVG string to Image
export const loadSvgImage = (svgRaw: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const encoded = encodeURIComponent(svgRaw);
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = `data:image/svg+xml;charset=utf-8,${encoded}`;
  });
};

interface RenderSinglePhotoOptions {
  sourceImg: HTMLImageElement | HTMLVideoElement;
  filter: FilterDefinition;
  isMirrored: boolean;
  stickers: PlacedSticker[];
  targetWidth?: number;
  targetHeight?: number;
}

/**
 * Renders a single captured photo with filters, mirroring, and stickers onto a Canvas
 * preserving exact native aspect ratio of webcam feed (default 4:3 = 1200x900)
 */
export const renderSinglePhotoToCanvas = async ({
  sourceImg,
  filter,
  isMirrored,
  stickers,
  targetWidth = 1200,
  targetHeight = 900,
}: RenderSinglePhotoOptions): Promise<HTMLCanvasElement> => {
  // Determine native dimensions of the camera stream
  let srcW = 1200;
  let srcH = 900;
  if ('videoWidth' in sourceImg && sourceImg.videoWidth) {
    srcW = sourceImg.videoWidth;
    srcH = sourceImg.videoHeight;
  } else if ('naturalWidth' in sourceImg && sourceImg.naturalWidth) {
    srcW = sourceImg.naturalWidth;
    srcH = sourceImg.naturalHeight;
  }

  // Calculate matching canvas dimensions so live preview and capture have identical aspect ratio
  const actualWidth = targetWidth;
  const actualHeight = Math.round(targetWidth / (srcW / srcH));

  const canvas = document.createElement('canvas');
  canvas.width = actualWidth;
  canvas.height = actualHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Fill background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, actualWidth, actualHeight);

  // Draw photo with mirroring and filter
  ctx.save();
  if (isMirrored) {
    ctx.translate(actualWidth, 0);
    ctx.scale(-1, 1);
  }

  if (filter.canvasFilter && filter.canvasFilter !== 'none') {
    try {
      ctx.filter = filter.canvasFilter;
    } catch {
      // browser fallback
    }
  }

  // Draw full frame without cropping since aspect ratios match
  ctx.drawImage(sourceImg, 0, 0, srcW, srcH, 0, 0, actualWidth, actualHeight);
  ctx.restore();

  // Draw overlay color if filter has one
  if (filter.overlayColor) {
    ctx.save();
    if (filter.overlayBlendMode) {
      ctx.globalCompositeOperation = filter.overlayBlendMode;
    }
    ctx.fillStyle = filter.overlayColor;
    ctx.fillRect(0, 0, actualWidth, actualHeight);
    ctx.restore();
  }

  // Draw Stickers
  for (const placed of stickers) {
    const template = getStickerTemplateById(placed.templateId);
    if (!template) continue;

    try {
      const stickerImg = await loadSvgImage(template.svgRaw);
      const stickerW = (template.defaultSize / 400) * actualWidth * placed.scale;
      const stickerH = (stickerImg.naturalHeight / (stickerImg.naturalWidth || 1)) * stickerW;

      const posX = (placed.x / 100) * actualWidth;
      const posY = (placed.y / 100) * actualHeight;

      ctx.save();
      ctx.translate(posX, posY);
      ctx.rotate((placed.rotation * Math.PI) / 180);
      if (placed.isFlipped) {
        ctx.scale(-1, 1);
      }

      ctx.drawImage(stickerImg, -stickerW / 2, -stickerH / 2, stickerW, stickerH);
      ctx.restore();
    } catch {
      // ignore
    }
  }

  return canvas;
};

interface RenderPhotoboothStripOptions {
  shots: CapturedShot[];
  mode: PhotoboothMode;
  frame: FrameOption;
  caption: string;
  showDate: boolean;
  dateText?: string;
  stickers?: PlacedSticker[];
}

/**
 * Render Photobooth Strip where photo cells preserve the exact same aspect ratio
 * and dimensions as the live webcam pictures
 */
export const renderPhotoboothStrip = async ({
  shots,
  mode,
  frame,
  caption,
  showDate,
  dateText,
  stickers = [],
}: RenderPhotoboothStripOptions): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Load all shot images
  const loadedShots: HTMLImageElement[] = [];
  for (const shot of shots) {
    const img = await loadImage(shot.dataUrl);
    loadedShots.push(img);
  }

  if (loadedShots.length === 0) {
    throw new Error('No photos captured yet');
  }

  // Calculate the EXACT aspect ratio of the live webcam photos
  const firstShot = loadedShots[0];
  const photoAspectRatio = firstShot.naturalWidth / firstShot.naturalHeight;

  if (mode === 'single') {
    // Single Polaroid: photo slot matches the exact webcam aspect ratio
    const photoW = 840;
    const photoH = Math.round(photoW / photoAspectRatio);
    const margin = 48;
    const bottomBanner = 180;
    const canvasW = photoW + margin * 2;
    const canvasH = photoH + margin + bottomBanner;

    canvas.width = canvasW;
    canvas.height = canvasH;

    drawFrameBackground(ctx, canvasW, canvasH, frame);

    const photoX = margin;
    const photoY = margin;
    ctx.save();
    roundRect(ctx, photoX, photoY, photoW, photoH, 18);
    ctx.clip();
    ctx.drawImage(loadedShots[0], 0, 0, loadedShots[0].naturalWidth, loadedShots[0].naturalHeight, photoX, photoY, photoW, photoH);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = frame.borderColor;
    ctx.lineWidth = 4;
    roundRect(ctx, photoX, photoY, photoW, photoH, 18);
    ctx.stroke();
    ctx.restore();

    drawBottomStripMeta(ctx, canvasW, photoY + photoH + 20, bottomBanner - 20, caption, showDate, dateText, frame);
    await drawStickersOnCanvas(ctx, stickers, canvasW, canvasH);

    return canvas.toDataURL('image/png');
  } else if (mode === 'grid4') {
    // 2x2 Grid Layout: each cell matches exact webcam aspect ratio
    const cellW = 500;
    const cellH = Math.round(cellW / photoAspectRatio);
    const margin = 44;
    const gap = 28;
    const bottomBanner = 160;

    const canvasW = margin * 2 + cellW * 2 + gap;
    const canvasH = margin + cellH * 2 + gap + bottomBanner;

    canvas.width = canvasW;
    canvas.height = canvasH;

    drawFrameBackground(ctx, canvasW, canvasH, frame);

    const positions = [
      { x: margin, y: margin },
      { x: margin + cellW + gap, y: margin },
      { x: margin, y: margin + cellH + gap },
      { x: margin + cellW + gap, y: margin + cellH + gap },
    ];

    for (let i = 0; i < 4; i++) {
      const img = loadedShots[i % loadedShots.length];
      const pos = positions[i];
      ctx.save();
      roundRect(ctx, pos.x, pos.y, cellW, cellH, 18);
      ctx.clip();
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, pos.x, pos.y, cellW, cellH);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = frame.borderColor;
      ctx.lineWidth = 4;
      roundRect(ctx, pos.x, pos.y, cellW, cellH, 18);
      ctx.stroke();
      ctx.restore();
    }

    drawBottomStripMeta(ctx, canvasW, margin + cellH * 2 + gap + 15, bottomBanner - 15, caption, showDate, dateText, frame);
    await drawStickersOnCanvas(ctx, stickers, canvasW, canvasH);

    return canvas.toDataURL('image/png');
  } else {
    // Classic 4-Cut Vertical Strip: each slot matches exact webcam aspect ratio
    const photoW = 600;
    const photoH = Math.round(photoW / photoAspectRatio);
    const margin = 42;
    const gap = 24;
    const bottomBanner = 180;
    const count = Math.min(4, loadedShots.length || 4);

    const canvasW = photoW + margin * 2;
    const canvasH = margin + count * photoH + (count - 1) * gap + bottomBanner;

    canvas.width = canvasW;
    canvas.height = canvasH;

    drawFrameBackground(ctx, canvasW, canvasH, frame);

    for (let i = 0; i < count; i++) {
      const img = loadedShots[i % loadedShots.length];
      const photoX = margin;
      const photoY = margin + i * (photoH + gap);

      ctx.save();
      roundRect(ctx, photoX, photoY, photoW, photoH, 16);
      ctx.clip();
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, photoX, photoY, photoW, photoH);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = frame.borderColor;
      ctx.lineWidth = 4;
      roundRect(ctx, photoX, photoY, photoW, photoH, 16);
      ctx.stroke();
      ctx.restore();
    }

    const startMetaY = margin + count * photoH + (count - 1) * gap + 15;
    drawBottomStripMeta(ctx, canvasW, startMetaY, bottomBanner - 15, caption, showDate, dateText, frame);
    await drawStickersOnCanvas(ctx, stickers, canvasW, canvasH);

    return canvas.toDataURL('image/png');
  }
};

/**
 * Draws frame background with cute accents
 */
function drawFrameBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: FrameOption
) {
  ctx.fillStyle = frame.canvasBg;
  ctx.fillRect(0, 0, w, h);

  if (frame.id === 'checker_pink') {
    const size = 32;
    ctx.fillStyle = '#fbcfe8';
    for (let y = 0; y < h; y += size) {
      for (let x = 0; x < w; x += size) {
        if ((Math.floor(x / size) + Math.floor(y / size)) % 2 === 0) {
          ctx.fillRect(x, y, size, size);
        }
      }
    }
  }

  if (frame.id === 'holographic') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#fce7f3');
    grad.addColorStop(0.35, '#ede9fe');
    grad.addColorStop(0.7, '#ccfbf1');
    grad.addColorStop(1, '#fbcfe8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  if (frame.id === 'midnight_cherry') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#260410');
    grad.addColorStop(0.5, '#160209');
    grad.addColorStop(1, '#260410');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  if (frame.id === 'midnight_sparkle') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#10081c');
    grad.addColorStop(0.5, '#1c0f30');
    grad.addColorStop(1, '#10081c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  if (frame.id === 'dark_leopard_noir') {
    ctx.fillStyle = '#170f15';
    ctx.fillRect(0, 0, w, h);
    // Draw subtle dark pink leopard spots
    ctx.fillStyle = 'rgba(190, 24, 93, 0.25)';
    for (let py = 20; py < h; py += 70) {
      for (let px = 20; px < w; px += 70) {
        ctx.beginPath();
        ctx.ellipse(px + (py % 40), py, 10, 7, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.strokeStyle = frame.borderColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, w - 6, h - 6);
}

/**
 * Helper to draw rounded rectangle path
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Draw bottom strip branding, cute logo, date stamp, and caption
 */
function drawBottomStripMeta(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  startY: number,
  height: number,
  caption: string,
  showDate: boolean,
  dateText: string | undefined,
  frame: FrameOption
) {
  const centerX = canvasW / 2;
  const isDark = [
    'midnight_cherry',
    'goth_velvet_black',
    'dark_berry_wine',
    'midnight_sparkle',
    'dark_leopard_noir',
    'espresso_rose',
    'dark_emerald_coquette',
    'vampire_lace',
    'mauve_twilight',
    'coquette_bows',
  ].includes(frame.id);

  if (caption && caption.trim().length > 0) {
    ctx.save();
    ctx.fillStyle = isDark ? '#ffffff' : '#be123c';
    ctx.font = 'bold 34px "Caveat", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(caption, centerX, startY + 8);
    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle = isDark ? (frame.borderColor || '#f472b6') : '#db2777';
  ctx.font = 'bold 26px "Fredoka", cursive, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const brandY = startY + (caption ? 54 : 24);
  ctx.fillText('♡ PINKYSNAP BOOTH ♡', centerX, brandY);
  ctx.restore();

  if (showDate) {
    const today = dateText || new Date().toISOString().slice(0, 10).replace(/-/g, '.');
    ctx.save();
    ctx.fillStyle = isDark ? '#fbcfe8' : '#9d174d';
    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(`${today} · CUTE MEMORY`, centerX, brandY + 36);
    ctx.restore();
  }
}

/**
 * Draw stickers on the canvas
 */
async function drawStickersOnCanvas(
  ctx: CanvasRenderingContext2D,
  stickers: PlacedSticker[],
  targetWidth: number,
  targetHeight: number
) {
  for (const placed of stickers) {
    const template = getStickerTemplateById(placed.templateId);
    if (!template) continue;

    try {
      const stickerImg = await loadSvgImage(template.svgRaw);
      const stickerW = (template.defaultSize / 400) * targetWidth * placed.scale;
      const stickerH = (stickerImg.naturalHeight / (stickerImg.naturalWidth || 1)) * stickerW;

      const posX = (placed.x / 100) * targetWidth;
      const posY = (placed.y / 100) * targetHeight;

      ctx.save();
      ctx.translate(posX, posY);
      ctx.rotate((placed.rotation * Math.PI) / 180);
      if (placed.isFlipped) {
        ctx.scale(-1, 1);
      }

      ctx.drawImage(stickerImg, -stickerW / 2, -stickerH / 2, stickerW, stickerH);
      ctx.restore();
    } catch {
      // ignore
    }
  }
}
