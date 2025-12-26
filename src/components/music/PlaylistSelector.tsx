import { motion } from 'framer-motion';
import { Check, Music } from 'lucide-react';
import type { Playlist } from '@/data/playlists';

interface PlaylistSelectorProps {
  playlists: Playlist[];
  currentPlaylistId: string;
  onSelect: (playlistId: string) => void;
}

export function PlaylistSelector({
  playlists,
  currentPlaylistId,
  onSelect,
}: PlaylistSelectorProps) {
  return (
    <div className="space-y-2">
      {playlists.map((playlist, index) => {
        const isSelected = playlist.id === currentPlaylistId;

        return (
          <motion.button
            key={playlist.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(playlist.id)}
            className={`
              w-full flex items-center gap-3 p-3 rounded-xl transition-all
              ${
                isSelected
                  ? 'bg-purple/20 border border-purple'
                  : 'bg-surface-elevated hover:bg-border/30 border border-transparent'
              }
            `}
          >
            <div
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${
                  isSelected
                    ? 'bg-purple'
                    : 'bg-gradient-to-br from-surface-elevated to-border'
                }
              `}
            >
              <Music size={18} className={isSelected ? 'text-white' : 'text-text-muted'} />
            </div>

            <div className="flex-1 text-left">
              <p
                className={`font-medium ${
                  isSelected ? 'text-purple-light' : 'text-text-primary'
                }`}
              >
                {playlist.name}
              </p>
              <p className="text-xs text-text-muted">{playlist.description}</p>
            </div>

            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-purple flex items-center justify-center"
              >
                <Check size={14} className="text-white" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
