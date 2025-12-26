import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music, ChevronDown, Minimize2 } from 'lucide-react';
import { SpotifyEmbed } from './SpotifyEmbed';
import { PlaylistSelector } from './PlaylistSelector';
import { useSettingsStore } from '@/stores/settingsStore';
import { SPOTIFY_PLAYLISTS, DEFAULT_PLAYLIST } from '@/data/playlists';

interface MusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  onCollapse?: (e: React.MouseEvent) => void;
}

export function MusicPlayer({ isOpen, onClose, onCollapse }: MusicPlayerProps) {
  const { currentPlaylistId, setPlaylist, setMusicEnabled } = useSettingsStore();
  const [showPlaylists, setShowPlaylists] = useState(false);

  const activePlaylist =
    SPOTIFY_PLAYLISTS.find((p) => p.id === currentPlaylistId) || DEFAULT_PLAYLIST;

  const handlePlaylistSelect = (playlistId: string) => {
    setPlaylist(playlistId);
    setMusicEnabled(true);
    setShowPlaylists(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Player Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-3xl max-h-[85vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Music size={20} className="text-green-500" />
                </div>
                <div>
                  <h2
                    className="font-bold text-text-primary"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Spotify
                  </h2>
                  <p className="text-sm text-text-muted">
                    New Year Playlists
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onCollapse && (
                  <button
                    onClick={onCollapse}
                    className="p-2 rounded-full hover:bg-surface-elevated transition-colors"
                    title="Minimize to mini player"
                  >
                    <Minimize2 size={20} className="text-text-muted" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-surface-elevated transition-colors"
                >
                  <X size={24} className="text-text-muted" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-8 space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Current Playlist */}
              <button
                onClick={() => setShowPlaylists(!showPlaylists)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-surface-elevated hover:bg-border/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Music size={24} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-text-primary">
                      {activePlaylist.name}
                    </p>
                    <p className="text-sm text-text-muted">
                      {activePlaylist.description}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-text-muted transition-transform ${
                    showPlaylists ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Playlist Selector */}
              <AnimatePresence>
                {showPlaylists && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <PlaylistSelector
                      playlists={SPOTIFY_PLAYLISTS}
                      currentPlaylistId={currentPlaylistId || DEFAULT_PLAYLIST.id}
                      onSelect={handlePlaylistSelect}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Spotify Player */}
              <div className="pt-2">
                <SpotifyEmbed
                  playlistId={currentPlaylistId || DEFAULT_PLAYLIST.id}
                  height={352}
                />
              </div>

              {/* Info */}
              <div className="text-center text-sm text-text-muted pt-2">
                <p>Powered by Spotify</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
