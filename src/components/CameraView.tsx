import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CapturedShot, FilterDefinition, PhotoboothMode, PlacedSticker } from '../types';
import { StickerCanvas } from './StickerCanvas';
import { soundEffects } from '../utils/audio';
import { renderSinglePhotoToCanvas } from '../utils/canvasRenderer';
import {
  Camera,
  RefreshCw,
  Sparkles,
  Upload,
  AlertCircle,
  FlipHorizontal,
  Flame,
  Video,
  Hand,
  Timer,
  RotateCcw,
  Check,
  Heart,
  Volume2,
  VolumeX,
  Image as ImageIcon,
} from 'lucide-react';

interface CameraViewProps {
  filter: FilterDefinition;
  stickers: PlacedSticker[];
  onUpdateStickers: (stickers: PlacedSticker[]) => void;
  selectedStickerId: string | null;
  onSelectSticker: (id: string | null) => void;
  onPhotosCaptured: (shots: CapturedShot[], mode: PhotoboothMode) => void;
  onOpenGallery?: () => void;
  savedCount?: number;
}

export const CameraView: React.FC<CameraViewProps> = ({
  filter,
  stickers,
  onUpdateStickers,
  selectedStickerId,
  onSelectSticker,
  onPhotosCaptured,
  onOpenGallery,
  savedCount,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState<boolean>(false);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Photobooth Mode (4-Cut Life4Cuts Strip vs Single Polaroid)
  const [photoboothMode, setPhotoboothMode] = useState<PhotoboothMode>('strip4');

  // Trigger method: Manual Click vs Auto Timer
  const [shutterTriggerType, setShutterTriggerType] = useState<'manual' | 'timer'>('timer');
  const [timerSeconds, setTimerSeconds] = useState<number>(3); // 3s, 5s, 10s

  // Cute Sound Toggle (for mobile top bar placement)
  const [isMuted, setIsMuted] = useState(soundEffects.isMuted);

  const handleToggleSound = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundEffects.playStickerPop();
    }
  };

  // Animations & countdown
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number | string>(3);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  // Manual shots accumulator
  const [manualShots, setManualShots] = useState<CapturedShot[]>([]);
  const autoShotsAccumulator = useRef<CapturedShot[]>([]);

  // Fallback image
  const [fallbackImage, setFallbackImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalShotsNeeded = photoboothMode === 'single' ? 1 : 4;
  const currentShotNumber = manualShots.length + 1;

  /**
   * Camera initializer with multi-tier fallback (Forces front camera on mobile)
   */
  const requestCameraAccess = useCallback(async (forcedFacing?: 'user' | 'environment', deviceId?: string) => {
    setIsRequestingPermission(true);
    setErrorMessage(null);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Camera access is not supported in this browser. You can upload a photo or use cute avatar selfies!');
      setIsRequestingPermission(false);
      loadSampleSelfie();
      return;
    }

    const targetFacing: 'user' | 'environment' = forcedFacing || cameraFacing;

    // First, try to discover devices and find the front camera if target is user
    let resolvedDeviceId = deviceId;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      if (videoInputs.length > 0) {
        setAvailableDevices(videoInputs);
        if (!resolvedDeviceId) {
          if (targetFacing === 'user') {
            const front = videoInputs.find((d) => {
              const l = (d.label || '').toLowerCase();
              return l.includes('front') || l.includes('user') || l.includes('selfie') || l.includes('facing front');
            });
            if (front) resolvedDeviceId = front.deviceId;
          } else {
            const back = videoInputs.find((d) => {
              const l = (d.label || '').toLowerCase();
              return l.includes('back') || l.includes('rear') || l.includes('environment') || l.includes('facing back');
            });
            if (back) resolvedDeviceId = back.deviceId;
          }
        }
      }
    } catch {
      // ignore
    }

    const constraintCandidates: MediaStreamConstraints[] = [];

    // Priority 1: Exact Device ID if we matched the front/back camera
    if (resolvedDeviceId) {
      constraintCandidates.push({
        video: { deviceId: { exact: resolvedDeviceId } },
        audio: false,
      });
      constraintCandidates.push({
        video: { deviceId: resolvedDeviceId },
        audio: false,
      });
    }

    // Priority 2: Exact facingMode (guarantees front camera on mobile Android & iOS)
    constraintCandidates.push({
      video: { facingMode: { exact: targetFacing } },
      audio: false,
    });

    // Priority 3: Direct facingMode string
    constraintCandidates.push({
      video: { facingMode: targetFacing },
      audio: false,
    });

    // Priority 4: Ideal facingMode (mobile fallback without strict resolution locks)
    constraintCandidates.push({
      video: { facingMode: { ideal: targetFacing } },
      audio: false,
    });

    // Priority 5: Fallback to any camera
    constraintCandidates.push({
      video: true,
      audio: false,
    });

    let stream: MediaStream | null = null;
    let lastError: unknown = null;

    for (const constraints of constraintCandidates) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (stream) {
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play().catch((e) => console.warn('Play prevented:', e));
        };
      }
      setIsCameraActive(true);
      setFallbackImage(null);
      setErrorMessage(null);

      // Inspect active track settings
      try {
        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack?.getSettings?.() || {};

        if (settings.deviceId) {
          setSelectedDeviceId(settings.deviceId);
        } else if (resolvedDeviceId) {
          setSelectedDeviceId(resolvedDeviceId);
        }

        if (settings.facingMode) {
          const actualFacing = settings.facingMode as 'user' | 'environment';
          setCameraFacing(actualFacing);
          setIsMirrored(actualFacing === 'user');
        } else if (targetFacing === 'user') {
          setCameraFacing('user');
          setIsMirrored(true);
        } else {
          setCameraFacing('environment');
          setIsMirrored(false);
        }

        const freshDevices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = freshDevices.filter((d) => d.kind === 'videoinput');
        setAvailableDevices(videoInputs);
      } catch {
        // ignore
      }
    } else {
      setIsCameraActive(false);
      const errName = (lastError as { name?: string })?.name;
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setErrorMessage('Camera blocked! Click the lock 🔒 or camera 📷 icon in your browser URL bar, choose "Allow Camera", then tap "Enable Camera".');
      } else {
        setErrorMessage('Could not connect to front camera. Tap "Flip Lens" or choose your camera in the menu below!');
      }
      loadSampleSelfie();
    }

    setIsRequestingPermission(false);
  }, [cameraFacing]);

  // Load a cute sample selfie with 4:3 aspect ratio
  const loadSampleSelfie = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 1200, 900);
      grad.addColorStop(0, '#fbcfe8');
      grad.addColorStop(0.5, '#f472b6');
      grad.addColorStop(1, '#fda4af');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 900);

      // Girl avatar selfie
      ctx.fillStyle = '#fff1f2';
      ctx.beginPath();
      ctx.arc(600, 440, 180, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#9d174d';
      ctx.beginPath();
      ctx.arc(600, 410, 195, Math.PI * 0.85, Math.PI * 2.15);
      ctx.fill();

      // Bangs
      ctx.beginPath();
      ctx.moveTo(420, 360);
      ctx.quadraticCurveTo(600, 445, 780, 360);
      ctx.quadraticCurveTo(600, 280, 420, 360);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#311020';
      ctx.beginPath();
      ctx.ellipse(530, 430, 22, 30, 0, 0, Math.PI * 2);
      ctx.ellipse(670, 430, 22, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eye highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(538, 422, 9, 0, Math.PI * 2);
      ctx.arc(678, 422, 9, 0, Math.PI * 2);
      ctx.arc(524, 442, 5, 0, Math.PI * 2);
      ctx.arc(664, 442, 5, 0, Math.PI * 2);
      ctx.fill();

      // Blush
      ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
      ctx.beginPath();
      ctx.ellipse(500, 470, 36, 20, 0, 0, Math.PI * 2);
      ctx.ellipse(700, 470, 36, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(600, 465, 26, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

      // Hair Bow
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.ellipse(600, 250, 46, 26, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('♡ PURIKURA SELFIE DEMO ♡', 600, 720);
      ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Decorate with stickers & snap!', 600, 770);

      setFallbackImage(canvas.toDataURL('image/png'));
    }
  };

  useEffect(() => {
    requestCameraAccess();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [requestCameraAccess]);

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (typeof evt.target?.result === 'string') {
        setFallbackImage(evt.target.result);
        setIsCameraActive(false);
        setErrorMessage(null);
        soundEffects.playStickerPop();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFlipCamera = () => {
    soundEffects.playStickerPop();
    const newFacing: 'user' | 'environment' = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(newFacing);
    setIsMirrored(newFacing === 'user');

    // Find matching camera from available devices if we already discovered them
    let targetDeviceId: string | undefined = undefined;
    if (newFacing === 'user') {
      const front = availableDevices.find((d) => {
        const l = (d.label || '').toLowerCase();
        return l.includes('front') || l.includes('user') || l.includes('selfie') || l.includes('facing front');
      });
      if (front) targetDeviceId = front.deviceId;
    } else {
      const back = availableDevices.find((d) => {
        const l = (d.label || '').toLowerCase();
        return l.includes('back') || l.includes('rear') || l.includes('environment') || l.includes('facing back');
      });
      if (back) targetDeviceId = back.deviceId;
    }

    if (targetDeviceId) {
      setSelectedDeviceId(targetDeviceId);
    }
    requestCameraAccess(newFacing, targetDeviceId);
  };

  const handleSelectDevice = (deviceId: string) => {
    soundEffects.playStickerPop();
    setSelectedDeviceId(deviceId);

    const dev = availableDevices.find((d) => d.deviceId === deviceId);
    const label = (dev?.label || '').toLowerCase();
    let facing: 'user' | 'environment' = cameraFacing;
    if (label.includes('front') || label.includes('user') || label.includes('selfie') || label.includes('facing front')) {
      facing = 'user';
      setIsMirrored(true);
    } else if (label.includes('back') || label.includes('rear') || label.includes('environment') || label.includes('facing back')) {
      facing = 'environment';
      setIsMirrored(false);
    }
    setCameraFacing(facing);
    requestCameraAccess(facing, deviceId);
  };

  // Perform single frame capture from video or fallback image
  const captureCurrentFrame = async (): Promise<string> => {
    let source: HTMLVideoElement | HTMLImageElement | null = null;

    if (isCameraActive && videoRef.current) {
      source = videoRef.current;
    } else if (fallbackImage) {
      const img = new Image();
      img.src = fallbackImage;
      await new Promise((res) => {
        img.onload = res;
      });
      source = img;
    } else if (videoRef.current) {
      source = videoRef.current;
    }

    if (!source) throw new Error('No camera or image source available');

    // 4:3 landscape ratio matching the live viewfinder
    const renderedCanvas = await renderSinglePhotoToCanvas({
      sourceImg: source,
      filter,
      isMirrored,
      stickers,
      targetWidth: 1200,
      targetHeight: 900,
    });

    return renderedCanvas.toDataURL('image/png');
  };

  // Manual Click Mode
  const handleManualSnap = async () => {
    soundEffects.playShutter();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 350);

    try {
      const photoData = await captureCurrentFrame();
      const newShot: CapturedShot = {
        id: `shot_${Date.now()}_${manualShots.length + 1}`,
        dataUrl: photoData,
        timestamp: Date.now(),
      };

      const updatedShots = [...manualShots, newShot];
      setManualShots(updatedShots);

      if (updatedShots.length >= totalShotsNeeded) {
        soundEffects.playSparkleChime();
        onPhotosCaptured(updatedShots, photoboothMode);
        setManualShots([]);
      } else {
        soundEffects.playStickerPop();
      }
    } catch (err) {
      console.error('Manual snapshot failed:', err);
    }
  };

  const handleRetakeLastManualShot = () => {
    soundEffects.playStickerPop();
    setManualShots((prev) => prev.slice(0, -1));
  };

  const handleFinishManualEarly = () => {
    if (manualShots.length > 0) {
      soundEffects.playSparkleChime();
      onPhotosCaptured(manualShots, photoboothMode);
      setManualShots([]);
    }
  };

  // Auto Timer Mode
  const handleAutoTimerCapture = async () => {
    if (isCountingDown) return;

    autoShotsAccumulator.current = [];
    setIsCountingDown(true);

    for (let shot = 1; shot <= totalShotsNeeded; shot++) {
      let count = timerSeconds > 0 ? timerSeconds : 3;
      while (count > 0) {
        setCountdownValue(count);
        soundEffects.playCountdown(count);
        await new Promise((r) => setTimeout(r, 1000));
        count--;
      }

      setCountdownValue('SMILE! 💕');
      await new Promise((r) => setTimeout(r, 250));

      soundEffects.playShutter();
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 350);

      try {
        const photoData = await captureCurrentFrame();
        autoShotsAccumulator.current.push({
          id: `shot_${Date.now()}_${shot}`,
          dataUrl: photoData,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.error('Auto snapshot failed:', err);
      }

      if (shot < totalShotsNeeded) {
        setCountdownValue('Next Pose Ready! 🎀');
        await new Promise((r) => setTimeout(r, 1200));
      }
    }

    setIsCountingDown(false);

    if (autoShotsAccumulator.current.length > 0) {
      onPhotosCaptured(autoShotsAccumulator.current, photoboothMode);
    }
  };

  const handleStartCapture = () => {
    if (shutterTriggerType === 'manual') {
      handleManualSnap();
    } else {
      handleAutoTimerCapture();
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* ============================================================== */}
      {/* 1. DESKTOP TOOLBAR (lg and up - 100% UNCHANGED)                 */}
      {/* ============================================================== */}
      <div className="hidden lg:flex w-full items-center justify-between gap-2 mb-2 px-1">
        {/* Strip Layout: 4-Cut vs Single */}
        <div className="flex items-center gap-1 p-1 bg-white/95 backdrop-blur-md rounded-2xl border border-pink-200/90 shadow-sm">
          <button
            onClick={() => {
              soundEffects.playStickerPop();
              setPhotoboothMode('strip4');
              setManualShots([]);
            }}
            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              photoboothMode === 'strip4'
                ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm'
                : 'text-pink-800 hover:text-pink-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>4-Cut Strip</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playStickerPop();
              setPhotoboothMode('single');
              setManualShots([]);
            }}
            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              photoboothMode === 'single'
                ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm'
                : 'text-pink-800 hover:text-pink-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Single Snap</span>
          </button>
        </div>

        {/* Shutter Click Method: Manual vs Auto Timer */}
        <div className="flex items-center gap-1 p-1 bg-white/95 backdrop-blur-md rounded-2xl border border-pink-200/90 shadow-sm">
          <button
            onClick={() => {
              soundEffects.playStickerPop();
              setShutterTriggerType('manual');
            }}
            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              shutterTriggerType === 'manual'
                ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm'
                : 'text-pink-800 hover:text-pink-900'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Manual Click</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playStickerPop();
              setShutterTriggerType('timer');
            }}
            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              shutterTriggerType === 'timer'
                ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm'
                : 'text-pink-800 hover:text-pink-900'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Auto Timer</span>
          </button>

          {shutterTriggerType === 'timer' && (
            <div className="flex items-center gap-0.5 pl-1 border-l border-pink-200">
              {[3, 5, 10].map((sec) => (
                <button
                  key={sec}
                  onClick={() => {
                    soundEffects.playStickerPop();
                    setTimerSeconds(sec);
                  }}
                  className={`px-1.5 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                    timerSeconds === sec
                      ? 'bg-pink-100 text-pink-700'
                      : 'text-slate-500 hover:text-pink-600'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Toolbar: Mirror & Upload */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              soundEffects.playStickerPop();
              setIsMirrored((prev) => !prev);
            }}
            title={isMirrored ? 'Mirrored selfie: ON' : 'Mirrored selfie: OFF'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all shadow-sm cursor-pointer ${
              isMirrored
                ? 'bg-pink-500 text-white border-pink-500'
                : 'bg-white/95 text-pink-700 border-pink-200 hover:bg-pink-50'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            <span>Mirror</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload photo from device"
            className="p-1.5 rounded-xl bg-white/95 text-pink-700 border border-pink-200 hover:bg-pink-50 transition-colors shadow-sm cursor-pointer"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUploadImage}
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MOBILE TOOLBAR (< lg): 2 rows of 2 equal, symmetric boxes   */}
      {/*    (Volume and Gallery moved here as drawn, zero empty space)  */}
      {/* ============================================================== */}
      <div className="flex lg:hidden flex-col w-full gap-2 mb-2">
        {/* Row 1: [ Strip Mode (50%) ]  <--->  [ Volume & Gallery (50%) ] */}
        <div className="w-full grid grid-cols-2 gap-2">
          {/* Box 1 (Left 50%): 4-Cut Strip vs Single Snap */}
          <div className="w-full flex items-center justify-between p-1 bg-white/95 backdrop-blur-md rounded-2xl border border-pink-200/90 shadow-sm">
            <button
              onClick={() => {
                soundEffects.playStickerPop();
                setPhotoboothMode('strip4');
                setManualShots([]);
              }}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                photoboothMode === 'strip4'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm'
                  : 'text-pink-800 hover:text-pink-900'
              }`}
            >
              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">4-Cut Strip</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playStickerPop();
                setPhotoboothMode('single');
                setManualShots([]);
              }}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                photoboothMode === 'single'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm'
                  : 'text-pink-800 hover:text-pink-900'
              }`}
            >
              <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">Single Snap</span>
            </button>
          </div>

          {/* Box 2 (Right 50% - Exactly where user drew green box & arrows): Volume & Gallery */}
          <div className="w-full flex items-center justify-between p-1 bg-white/95 backdrop-blur-md rounded-2xl border border-pink-200/90 shadow-sm gap-1.5">
            {/* Cute Sound Toggle */}
            <button
              onClick={handleToggleSound}
              title={isMuted ? 'Unmute sounds' : 'Mute cute sounds'}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                isMuted
                  ? 'bg-pink-50 text-slate-500 border border-pink-100'
                  : 'bg-pink-100/90 text-pink-700 border border-pink-200'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500 shrink-0" /> : <Volume2 className="w-3.5 h-3.5 text-pink-600 shrink-0" />}
              <span className="truncate">{isMuted ? 'Muted' : 'Sound'}</span>
            </button>

            {/* Saved Gallery Button */}
            <button
              onClick={() => {
                soundEffects.playStickerPop();
                onOpenGallery?.();
              }}
              title="Open Saved Gallery"
              className="flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm hover:from-pink-600 hover:to-rose-500 active:scale-95 transition-all cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Gallery</span>
              {savedCount !== undefined && savedCount > 0 && (
                <span className="px-1 py-0.2 bg-white text-pink-600 font-bold text-[9px] rounded-full">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Row 2: [ Shutter Click / Timer (50%) ]  <--->  [ Mirror & Upload (50%) ] */}
        <div className="w-full grid grid-cols-2 gap-2">
          {/* Box 3 (Left 50%): Manual vs Auto Timer */}
          <div className="w-full flex items-center justify-between p-1 bg-white/95 backdrop-blur-md rounded-2xl border border-pink-200/90 shadow-sm">
            <button
              onClick={() => {
                soundEffects.playStickerPop();
                setShutterTriggerType('manual');
              }}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                shutterTriggerType === 'manual'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm'
                  : 'text-pink-800 hover:text-pink-900'
              }`}
            >
              <Hand className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">Manual</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playStickerPop();
                setShutterTriggerType('timer');
              }}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                shutterTriggerType === 'timer'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm'
                  : 'text-pink-800 hover:text-pink-900'
              }`}
            >
              <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">Auto</span>
            </button>

            {shutterTriggerType === 'timer' && (
              <div className="flex items-center gap-0.5 pl-1 border-l border-pink-200">
                {[3, 5, 10].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      soundEffects.playStickerPop();
                      setTimerSeconds(sec);
                    }}
                    className={`px-1 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${
                      timerSeconds === sec
                        ? 'bg-pink-100 text-pink-700'
                        : 'text-slate-500 hover:text-pink-600'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Box 4 (Right 50%): Mirror Selfie & Upload Photo */}
          <div className="w-full flex items-center justify-between p-1 bg-white/95 backdrop-blur-md rounded-2xl border border-pink-200/90 shadow-sm gap-1.5">
            {/* Mirror Toggle */}
            <button
              onClick={() => {
                soundEffects.playStickerPop();
                setIsMirrored((prev) => !prev);
              }}
              title={isMirrored ? 'Mirrored selfie: ON' : 'Mirrored selfie: OFF'}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                isMirrored
                  ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm'
                  : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
              }`}
            >
              <FlipHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Mirror</span>
            </button>

            {/* Upload Photo */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Upload photo from device"
              className="flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-xl text-[11px] sm:text-xs font-bold bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 transition-colors shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Upload</span>
            </button>
          </div>
        </div>
      </div>

      {/* AUTHENTIC PHOTOBOOTH KIOSK CABINET FRAME */}
      <div className="w-full relative bg-gradient-to-b from-pink-300 via-rose-200 to-pink-300 p-3 sm:p-4 rounded-[2rem] shadow-[0_16px_50px_-15px_rgba(244,114,182,0.45)] border-4 border-pink-100">
        {/* Top Illuminated Marquee with Twinkling Bulbs */}
        <div className="w-full flex items-center justify-between pb-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 shadow-[0_0_8px_#fde047] animate-pulse" />
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 shadow-[0_0_8px_#f472b6]" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_#fb7185] animate-pulse" />
          </div>

          <div className="px-4 py-0.5 rounded-full bg-white/90 border border-pink-300 shadow-inner flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span className="font-heading font-bold text-xs tracking-wider bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent uppercase">
              Purikura Photo Studio
            </span>
            <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-sparkle" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_#fb7185] animate-pulse" />
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 shadow-[0_0_8px_#f472b6]" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 shadow-[0_0_8px_#fde047] animate-pulse" />
          </div>
        </div>

        {/* Viewfinder Window: Explicit 4:3 Aspect Ratio Matching Output Strip Pictures */}
        <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden shadow-inner border-4 border-white/95">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-transform duration-300 ${
              !isCameraActive && fallbackImage ? 'hidden' : 'block'
            }`}
            style={{
              transform: isMirrored ? 'scaleX(-1)' : 'none',
              filter: filter.cssFilter,
            }}
          />

          {!isCameraActive && fallbackImage && (
            <img
              src={fallbackImage}
              alt="Sample preview"
              className="w-full h-full object-cover transition-transform duration-300"
              style={{
                transform: isMirrored ? 'scaleX(-1)' : 'none',
                filter: filter.cssFilter,
              }}
            />
          )}

          {filter.overlayStyle && (
            <div className={`absolute inset-0 pointer-events-none ${filter.overlayStyle}`} />
          )}

          {/* Interactive Animated Stickers Layer */}
          <StickerCanvas
            stickers={stickers}
            onUpdateStickers={onUpdateStickers}
            selectedId={selectedStickerId}
            onSelectSticker={onSelectSticker}
            readOnly={isCountingDown}
          />

          {/* Viewfinder HUD */}
          <div className="absolute inset-3 pointer-events-none border border-white/30 rounded-xl flex flex-col justify-between p-2.5">
            <div className="flex items-center justify-between text-white/90 text-[10px] font-medium tracking-wider">
              <span className="flex items-center gap-1 drop-shadow bg-black/40 px-2 py-0.5 rounded-full">
                <span className={`w-1.5 h-1.5 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                {isCameraActive ? 'LIVE WEBCAM' : 'DEMO'}
              </span>
              <span className="drop-shadow uppercase bg-black/40 px-2 py-0.5 rounded-full">
                {filter.name}
              </span>
            </div>

            <div className="flex items-center justify-between text-white/80 text-[10px]">
              <span className="drop-shadow font-mono bg-black/40 px-2 py-0.5 rounded">
                4:3 RATIO
              </span>
              <span className="drop-shadow font-heading bg-black/40 px-2 py-0.5 rounded">
                {photoboothMode === 'strip4'
                  ? `SHOT ${Math.min(manualShots.length + 1, 4)}/4`
                  : 'POLAROID'}
              </span>
            </div>
          </div>

          {/* Flash */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white pointer-events-none z-50 animate-camera-flash" />
          )}

          {/* Auto Countdown */}
          {isCountingDown && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-40 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-white text-sm font-heading font-bold mb-1 bg-pink-600/90 px-3 py-0.5 rounded-full">
                Pose {autoShotsAccumulator.current.length + 1} of {totalShotsNeeded}
              </span>
              <div className="font-heading text-6xl sm:text-7xl font-bold text-pink-300 drop-shadow-[0_4px_16px_rgba(244,63,94,0.9)] animate-pulse-heart text-center">
                {countdownValue}
              </div>
            </div>
          )}

          {/* Turn On Camera Prompt */}
          {!isCameraActive && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center p-4 text-center text-white">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-500/50 mb-2 animate-bounce-soft">
                <Camera className="w-7 h-7 text-white" />
              </div>

              <h3 className="font-heading text-lg font-bold text-pink-100 mb-0.5">
                Enable Selfie Camera
              </h3>
              <p className="text-[11px] text-pink-200/90 max-w-xs mb-3">
                Tap below to activate your selfie camera for real-time purikura photos!
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => requestCameraAccess()}
                  disabled={isRequestingPermission}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-heading font-bold text-xs shadow-md cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{isRequestingPermission ? 'Connecting...' : 'Turn On Camera 📸'}</span>
                </button>

                <button
                  onClick={loadSampleSelfie}
                  className="px-3.5 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold cursor-pointer"
                >
                  Use Cute Avatar
                </button>
              </div>

              {errorMessage && (
                <div className="mt-3 p-2 bg-rose-950/85 border border-rose-400/40 rounded-xl max-w-sm text-left flex items-start gap-1.5 text-rose-200 text-[10px]">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-300 shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cabinet Console: Manual Progress & Tactile Shutter */}
        <div className="mt-2.5 flex flex-col gap-2">
          {shutterTriggerType === 'manual' && photoboothMode === 'strip4' && (
            <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-pink-200 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-pink-800 font-heading">
                  Photos ({manualShots.length}/4):
                </span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3].map((idx) => {
                    const shot = manualShots[idx];
                    return (
                      <div
                        key={idx}
                        className={`w-7 h-7 rounded-lg border-2 overflow-hidden flex items-center justify-center ${
                          shot
                            ? 'border-pink-500 bg-pink-100'
                            : idx === manualShots.length
                            ? 'border-pink-400 border-dashed bg-pink-50 text-pink-400 animate-pulse'
                            : 'border-slate-200 bg-slate-100 text-slate-300'
                        }`}
                      >
                        {shot ? (
                          <img src={shot.dataUrl} alt={`Shot ${idx + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] font-bold">{idx + 1}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {manualShots.length > 0 && (
                  <button
                    onClick={handleRetakeLastManualShot}
                    className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-bold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retake</span>
                  </button>
                )}

                {manualShots.length > 0 && manualShots.length < 4 && (
                  <button
                    onClick={handleFinishManualEarly}
                    className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-pink-500 text-white text-xs font-bold cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Finish</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Shutter Console */}
          <div className="w-full flex items-center justify-between px-2">
            <button
              onClick={handleFlipCamera}
              title="Flip camera front/back"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-pink-50 text-pink-700 text-xs font-bold border border-pink-200 shadow-md cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Flip Lens</span>
            </button>

            {/* Tactile Shutter Button */}
            <button
              onClick={handleStartCapture}
              disabled={isCountingDown}
              title={shutterTriggerType === 'manual' ? 'Take Photo Now' : 'Start Auto Countdown'}
              className="relative group p-1.5 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-pink-300 shadow-xl shadow-pink-500/50 hover:shadow-pink-500/80 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-white flex flex-col items-center justify-center border-4 border-pink-100 group-hover:scale-102 transition-transform">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex flex-col items-center justify-center text-white shadow-inner">
                  <Camera className="w-5 h-5" />
                  <span className="text-[8px] font-bold uppercase tracking-tight leading-none mt-0.5">
                    {shutterTriggerType === 'manual' ? (photoboothMode === 'strip4' ? `${currentShotNumber}/4` : 'SNAP') : 'AUTO'}
                  </span>
                </div>
              </div>
            </button>

            <div className="flex items-center gap-1">
              {availableDevices.length > 1 ? (
                <select
                  value={selectedDeviceId}
                  onChange={(e) => handleSelectDevice(e.target.value)}
                  className="px-2 py-1 rounded-xl bg-white/95 border border-pink-200 text-xs font-medium text-pink-900 cursor-pointer max-w-[110px] truncate"
                >
                  {availableDevices.map((device, idx) => (
                    <option key={device.deviceId || idx} value={device.deviceId}>
                      {device.label || `Cam ${idx + 1}`}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/95 text-pink-600 text-xs font-bold border border-pink-200 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 animate-sparkle" />
                  <span>{isCameraActive ? 'Ready' : 'Demo'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
