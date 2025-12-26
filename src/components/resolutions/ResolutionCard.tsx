import { motion } from 'framer-motion';
import { Download, Share2, Trash2 } from 'lucide-react';
import type { Resolution } from '@/stores/resolutionStore';
import { Button } from '@/components/ui';

interface ResolutionCardProps {
  resolution: Resolution;
  onDelete?: (id: string) => void;
}

export function ResolutionCard({ resolution, onDelete }: ResolutionCardProps) {
  const handleDownload = () => {
    if (!resolution.dataUrl) return;

    const link = document.createElement('a');
    link.download = `resolution-2026-${resolution.id.slice(0, 8)}.png`;
    link.href = resolution.dataUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!resolution.dataUrl) return;

    try {
      const response = await fetch(resolution.dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'my-resolution-2026.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'My 2026 Resolution',
          text: resolution.text,
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative"
    >
      {/* Card Image */}
      <div className="rounded-xl overflow-hidden shadow-lg">
        {resolution.dataUrl ? (
          <img
            src={resolution.dataUrl}
            alt={resolution.text}
            className="w-full"
          />
        ) : (
          <div className="aspect-[3/4] bg-surface-elevated flex items-center justify-center p-4">
            <p className="text-text-secondary text-center italic">
              "{resolution.text}"
            </p>
          </div>
        )}
      </div>

      {/* Overlay Actions */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          onClick={handleShare}
          className="bg-white/20 hover:bg-white/30 text-white"
        >
          <Share2 size={18} />
        </Button>
        <Button
          variant="ghost"
          onClick={handleDownload}
          className="bg-white/20 hover:bg-white/30 text-white"
        >
          <Download size={18} />
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            onClick={() => onDelete(resolution.id)}
            className="bg-magenta/50 hover:bg-magenta/70 text-white"
          >
            <Trash2 size={18} />
          </Button>
        )}
      </div>

      {/* Date */}
      <p className="text-xs text-text-muted mt-2 text-center">
        {new Date(resolution.createdAt).toLocaleDateString()}
      </p>
    </motion.div>
  );
}
