import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Music, Music2, Play, Pause, ChevronUp, Minimize2 } from 'lucide-react';
import { MusicPlayer } from './MusicPlayer';
import { SpotifyEmbed } from './SpotifyEmbed';
import { useSettingsStore } from '@/stores/settingsStore';
import { SPOTIFY_PLAYLISTS, DEFAULT_PLAYLIST } from '@/data/playlists';

export function MusicToggle() {
  const {
    musicEnabled,
    currentPlaylistId,
    musicPlayerPosition,
    musicPlayerMode,
    setMusicPlayerPosition,
    setMusicPlayerMode,
    setMusicEnabled,
  } = useSettingsStore();

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const constraintsRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Get current playlist name
  const activePlaylist =
    SPOTIFY_PLAYLISTS.find((p) => p.id === currentPlaylistId) || DEFAULT_PLAYLIST;

  // Update window size for drag constraints
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate initial position (bottom-right if no saved position)
  const getInitialPosition = () => {
    if (musicPlayerPosition) {
      return musicPlayerPosition;
    }
    return {
      x: windowSize.width - 80,
      y: windowSize.height - 160,
    };
  };

  const handleDragEnd = (_: never, info: { point: { x: number; y: number } }) => {
    // Constrain position within viewport
    const newX = Math.max(16, Math.min(info.point.x, windowSize.width - 80));
    const newY = Math.max(16, Math.min(info.point.y, windowSize.height - 160));
    setMusicPlayerPosition({ x: newX, y: newY });
  };

  const handleClick = () => {
    if (musicPlayerMode === 'collapsed') {
      // If music is enabled, go to mini mode, otherwise go to expanded
      if (musicEnabled) {
        setMusicPlayerMode('mini');
      } else {
        setMusicPlayerMode('expanded');
      }
    } else if (musicPlayerMode === 'mini') {
      setMusicPlayerMode('expanded');
    }
  };

  const handleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMusicPlayerMode('mini');
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMusicPlayerMode('collapsed');
  };

  const togglePlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMusicEnabled(!musicEnabled);
  };

  const position = getInitialPosition();
  const isExpanded = musicPlayerMode === 'expanded';
  const isMini = musicPlayerMode === 'mini' && musicEnabled;

  return (
    <>
      {/* Drag Constraints Container */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-40" />

      {/* Draggable Player */}
      <motion.div
        drag
        dragControls={dragControls}
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        initial={false}
        animate={{
          x: position.x - (isMini ? 100 : 28), // Adjust for width difference
          y: position.y - 28,
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`
          fixed z-40 cursor-grab active:cursor-grabbing
          ${isMini ? 'pointer-events-auto' : ''}
        `}
        style={{ touchAction: 'none' }}
      >
        <AnimatePresence mode="wait">
          {isMini ? (
            // Mini Player Mode - Pill with playlist name and controls
            <motion.div
              key="mini"
              initial={{ width: 56, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 56, opacity: 0 }}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-purple to-magenta shadow-lg shadow-purple/30"
            >
              {/* Music Icon with Bars */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                <Music2 size={18} className="text-white" />
                <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['4px', '10px', '4px'] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-0.5 bg-white/40 rounded-full"
                    />
                  ))}
                </div>
              </div>

              {/* Playlist Name */}
              <span className="text-white text-sm font-medium max-w-[120px] truncate">
                {activePlaylist.name}
              </span>

              {/* Play/Pause Button */}
              <button
                onClick={togglePlayback}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                {musicEnabled ? (
                  <Pause size={16} className="text-white" />
                ) : (
                  <Play size={16} className="text-white ml-0.5" />
                )}
              </button>

              {/* Expand Button */}
              <button
                onClick={handleClick}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <ChevronUp size={16} className="text-white" />
              </button>

              {/* Minimize Button */}
              <button
                onClick={handleMinimize}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <Minimize2 size={14} className="text-white" />
              </button>
            </motion.div>
          ) : (
            // Collapsed Mode - Icon Button
            <motion.div
              key="collapsed"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`
                w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors
                ${
                  musicEnabled
                    ? 'bg-gradient-to-br from-purple to-magenta shadow-purple/30'
                    : 'bg-surface-elevated border border-border shadow-black/20'
                }
              `}
            >
              {musicEnabled ? (
                <div className="relative">
                  <Music2 size={24} className="text-white" />
                  <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ['8px', '16px', '8px'] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        className="w-1 bg-white/30 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <Music size={24} className="text-text-muted" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Hidden Spotify Embed - Always mounted when music is enabled to prevent stopping */}
      {musicEnabled && !isExpanded && (
        <div className="fixed -left-[9999px] -top-[9999px] w-0 h-0 overflow-hidden pointer-events-none">
          <SpotifyEmbed
            playlistId={currentPlaylistId || DEFAULT_PLAYLIST.id}
            height={80}
          />
        </div>
      )}

      {/* Music Player Modal */}
      <MusicPlayer
        isOpen={isExpanded}
        onClose={() => setMusicPlayerMode(musicEnabled ? 'mini' : 'collapsed')}
        onCollapse={handleCollapse}
      />
    </>
  );
}
