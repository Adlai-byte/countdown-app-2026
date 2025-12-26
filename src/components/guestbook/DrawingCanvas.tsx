import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eraser, RotateCcw, Save, Palette } from 'lucide-react';
import { useGuestbookStore } from '@/stores/guestbookStore';
import { useConfetti } from '@/hooks/useConfetti';
import { Button } from '@/components/ui';

const COLORS = [
  '#ffffff', // White
  '#ffd700', // Gold
  '#9333ea', // Purple
  '#ec4899', // Magenta
  '#06b6d4', // Cyan
  '#22c55e', // Green
  '#f97316', // Orange
  '#ef4444', // Red
];

const BRUSH_SIZES = [4, 8, 12, 20];

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1]);
  const [authorName, setAuthorName] = useState('');
  const [hasDrawn, setHasDrawn] = useState(false);
  const { addMessage } = useGuestbookStore();
  const { fireSmall } = useConfetti();

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();

    // Set canvas size
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Set background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw placeholder text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = '16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Draw your New Year wish here!', rect.width / 2, rect.height / 2);
  }, []);

  const getCoordinates = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      let clientX: number, clientY: number;

      if ('touches' in e) {
        if (e.touches.length === 0) return null;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    []
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const coords = getCoordinates(e);
      if (!coords) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d')!;
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);
      setHasDrawn(true);
    },
    [getCoordinates]
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;

      const coords = getCoordinates(e);
      if (!coords) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d')!;
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    },
    [isDrawing, color, brushSize, getCoordinates]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = '16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Draw your New Year wish here!', rect.width / 2, rect.height / 2);

    setHasDrawn(false);
  }, []);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !authorName.trim()) return;

    const dataUrl = canvas.toDataURL('image/png');

    addMessage({
      type: 'drawing',
      content: dataUrl,
      author: authorName.trim(),
    });

    fireSmall();
    clearCanvas();
    setAuthorName('');
  }, [authorName, addMessage, fireSmall, clearCanvas]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden border-2 border-border">
        <canvas
          ref={canvasRef}
          className="w-full touch-none cursor-crosshair"
          style={{ height: '300px' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {/* Clear button overlay */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={clearCanvas}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <RotateCcw size={18} />
        </motion.button>
      </div>

      {/* Color Picker */}
      <div className="flex items-center gap-3">
        <Palette size={18} className="text-text-muted" />
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <motion.button
              key={c}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                color === c ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Brush Size */}
      <div className="flex items-center gap-3">
        <Eraser size={18} className="text-text-muted" />
        <div className="flex gap-2">
          {BRUSH_SIZES.map((size) => (
            <motion.button
              key={size}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setBrushSize(size)}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                brushSize === size
                  ? 'bg-purple text-white'
                  : 'bg-surface-elevated text-text-muted hover:bg-border/30'
              }`}
            >
              <div
                className="rounded-full bg-current"
                style={{ width: size, height: size }}
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Author Name */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Sign Your Drawing
        </label>
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name..."
          maxLength={50}
          className="w-full px-4 py-3 bg-surface-elevated rounded-xl border border-border focus:border-purple focus:outline-none text-text-primary placeholder:text-text-muted"
        />
      </div>

      {/* Save Button */}
      <Button
        variant="primary"
        onClick={handleSave}
        disabled={!hasDrawn || !authorName.trim()}
        className="w-full"
      >
        <Save size={18} className="mr-2" />
        Save Drawing
      </Button>
    </motion.div>
  );
}
