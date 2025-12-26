import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface SpotifyEmbedProps {
  playlistId: string;
  height?: number;
}

export function SpotifyEmbed({ playlistId, height = 352 }: SpotifyEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);

  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;

  return (
    <div className="relative rounded-xl overflow-hidden bg-surface-elevated">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-surface-elevated"
        >
          <Loader2 size={32} className="text-purple animate-spin" />
        </motion.div>
      )}
      <iframe
        src={embedUrl}
        width="100%"
        height={height}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        className="rounded-xl"
        style={{ borderRadius: '12px' }}
      />
    </div>
  );
}
