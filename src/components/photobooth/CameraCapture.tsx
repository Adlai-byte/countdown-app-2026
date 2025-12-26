import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, SwitchCamera, X } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { usePhotoBoothStore } from '@/stores/photoBoothStore';
import { PhotoEditor } from './PhotoEditor';
import { CaptureModeSelector } from './CaptureModeSelector';
import { MultiShotProgress } from './MultiShotProgress';
import { StickerSelector } from './StickerSelector';
import { StickerOverlay } from './StickerOverlay';
import { Button, Card } from '@/components/ui';
import { composePhotoStrip, composeCollage } from '@/utils/photoComposer';
import { createAnimatedGif } from '@/utils/gifGenerator';

export function CameraCapture() {
  const {
    videoRef,
    canvasRef,
    isStreaming,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    facingMode,
  } = useCamera();

  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    selectedFilter,
    selectedFrame,
    selectedSticker,
    captureMode,
    currentSession,
    addPhoto,
    startSession,
    addShotToSession,
    completeSession,
    cancelSession,
  } = usePhotoBoothStore();

  // Update video dimensions when streaming
  useEffect(() => {
    if (!isStreaming || !videoRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current && videoRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setVideoDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isStreaming, videoRef]);

  const handleCapture = () => {
    if (captureMode === 'single') {
      setCountdown(3);
    } else {
      // Start multi-shot session
      startSession();
      setCountdown(3);
    }
  };

  // Process completed session
  const processSession = useCallback(async () => {
    if (!currentSession || currentSession.shots.length !== currentSession.totalShots) {
      return;
    }

    setIsProcessing(true);

    try {
      let finalImage: string;

      switch (currentSession.mode) {
        case 'strip':
          finalImage = await composePhotoStrip(currentSession.shots);
          break;
        case 'collage':
          finalImage = await composeCollage(currentSession.shots);
          break;
        case 'gif':
          finalImage = await createAnimatedGif(currentSession.shots);
          break;
        default:
          finalImage = currentSession.shots[0];
      }

      setCapturedPhoto(finalImage);
      completeSession(finalImage);
    } catch (err) {
      console.error('Failed to process session:', err);
      cancelSession();
    } finally {
      setIsProcessing(false);
    }
  }, [currentSession, completeSession, cancelSession]);

  // Countdown ticker - only handles the countdown display
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Capture logic - triggers when countdown reaches 0
  useEffect(() => {
    if (countdown !== 0) return;

    // Capture the photo
    const photo = capturePhoto();
    if (photo) {
      if (captureMode === 'single' || !currentSession) {
        // Single mode - go directly to editor
        setCapturedPhoto(photo);
      } else {
        // Multi-shot mode - add to session
        addShotToSession(photo);
      }
    }
    setCountdown(null);
  }, [countdown, capturePhoto, captureMode, currentSession, addShotToSession]);

  // Continue multi-shot capture - watches shots.length for changes
  useEffect(() => {
    if (!currentSession) return;
    if (countdown !== null) return; // Don't trigger during countdown

    const shotsTaken = currentSession.shots.length;

    // If we have shots but need more, trigger next capture
    if (shotsTaken > 0 && shotsTaken < currentSession.totalShots) {
      const delay = captureMode === 'gif' ? 1 : 2;
      const timer = setTimeout(() => setCountdown(delay), 500);
      return () => clearTimeout(timer);
    }
  }, [currentSession?.shots.length, currentSession?.totalShots, captureMode, countdown]);

  // Check if session is complete and process it
  useEffect(() => {
    if (currentSession &&
        currentSession.shots.length === currentSession.totalShots &&
        !isProcessing) {
      processSession();
    }
  }, [currentSession?.shots.length, currentSession?.totalShots, isProcessing, processSession]);

  const handleSave = () => {
    if (capturedPhoto) {
      // If it was a single shot, add it now (multi-shot already added via completeSession)
      if (captureMode === 'single') {
        addPhoto({
          dataUrl: capturedPhoto,
          filter: selectedFilter,
          frame: selectedFrame,
        });
      }
      setCapturedPhoto(null);
    }
  };

  const handleDownload = () => {
    if (capturedPhoto) {
      const link = document.createElement('a');
      link.download = `photobooth-${captureMode}-${Date.now()}.png`;
      link.href = capturedPhoto;
      link.click();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    cancelSession();
  };

  const handleCancelSession = () => {
    cancelSession();
    setCountdown(null);
  };

  if (capturedPhoto) {
    return (
      <PhotoEditor
        photoUrl={capturedPhoto}
        onSave={handleSave}
        onDownload={handleDownload}
        onRetake={handleRetake}
      />
    );
  }

  const isCapturing = countdown !== null || currentSession?.isCapturing;

  return (
    <div className="space-y-4">
      {/* Mode Selector - only show when not capturing */}
      {!isCapturing && !isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <CaptureModeSelector />
          <StickerSelector />
        </motion.div>
      )}

      {/* Multi-shot Progress */}
      {currentSession && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <MultiShotProgress />
        </motion.div>
      )}

      {/* Camera Preview */}
      <Card padding="none" className="overflow-hidden relative aspect-[3/4]">
        <div ref={containerRef} className="absolute inset-0">
        {!isStreaming && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface">
            <Camera size={48} className="text-text-muted mb-4" />
            <Button onClick={startCamera}>Start Camera</Button>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface p-6 text-center">
            <X size={48} className="text-magenta mb-4" />
            <p className="text-text-secondary mb-4">{error}</p>
            <Button onClick={startCamera}>Try Again</Button>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`
            w-full h-full object-cover
            ${facingMode === 'user' ? 'scale-x-[-1]' : ''}
            ${!isStreaming ? 'hidden' : ''}
          `}
        />

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Countdown overlay */}
        <AnimatePresence>
          {countdown !== null && countdown > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50"
            >
              <motion.span
                key={countdown}
                initial={{ opacity: 0, scale: 2 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-8xl font-bold text-gold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {countdown}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/70"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-purple border-t-transparent rounded-full mb-4"
              />
              <p className="text-white font-medium">Creating your {captureMode}...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera switch button */}
        {isStreaming && !isCapturing && (
          <button
            onClick={switchCamera}
            className="absolute top-4 right-4 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <SwitchCamera size={24} />
          </button>
        )}

        {/* Shot indicator during multi-shot */}
        {currentSession && currentSession.mode !== 'single' && (
          <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-black/70 text-white font-medium">
            Shot {currentSession.currentShot + 1} of {currentSession.totalShots}
          </div>
        )}

        {/* Sticker Overlay */}
        {isStreaming && selectedSticker !== 'none' && (
          <StickerOverlay
            stickerId={selectedSticker}
            containerWidth={videoDimensions.width}
            containerHeight={videoDimensions.height}
            constraintsRef={containerRef}
          />
        )}
        </div>
      </Card>

      {/* Controls */}
      {isStreaming && !isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-4"
        >
          {currentSession?.isCapturing ? (
            <Button variant="secondary" onClick={handleCancelSession}>
              Cancel
            </Button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCapture}
              disabled={countdown !== null}
              className={`
                w-20 h-20 rounded-full flex items-center justify-center
                bg-gradient-to-br from-purple via-magenta to-gold
                shadow-lg shadow-purple/30
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                <Camera size={32} className="text-purple" />
              </div>
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Mode hint */}
      {isStreaming && !currentSession && !isProcessing && (
        <div className="text-center text-sm text-text-muted">
          {captureMode === 'single' && 'Tap to capture a single photo'}
          {captureMode === 'strip' && 'Tap to capture 4 photos for a strip'}
          {captureMode === 'collage' && 'Tap to capture 4 photos for a collage'}
          {captureMode === 'gif' && 'Tap to capture 8 frames for a filmstrip'}
        </div>
      )}

      {/* Stop camera button */}
      {isStreaming && !currentSession && (
        <div className="flex justify-center">
          <button
            onClick={stopCamera}
            className="text-text-muted text-sm hover:text-text-secondary"
          >
            Stop Camera
          </button>
        </div>
      )}
    </div>
  );
}
