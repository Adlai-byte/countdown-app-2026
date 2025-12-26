import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ThumbsUp,
  Music2,
  X,
  Search,
  Trash2,
  Crown,
  Sparkles,
} from 'lucide-react';
import { Card, Button, Modal } from '@/components/ui';
import { PARTY_SONGS, GENRE_LABELS, type PartySong } from '@/data/partySongs';
import { useConfetti } from '@/hooks/useConfetti';

interface QueuedSong {
  id: string;
  song: PartySong;
  votes: number;
  requestedBy: string;
  votedBy: string[];
}

const STORAGE_KEY = 'partyPlaylistQueue';

export function PartyPlaylist() {
  const [queue, setQueue] = useState<QueuedSong[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<PartySong['genre'] | 'all'>('all');
  const [guestName, setGuestName] = useState(() => {
    return localStorage.getItem('partyGuestName') || '';
  });
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'add' | 'vote'; songId?: string } | null>(null);
  const { fireCelebration } = useConfetti();

  // Save queue to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  }, [queue]);

  // Save guest name
  useEffect(() => {
    if (guestName) {
      localStorage.setItem('partyGuestName', guestName);
    }
  }, [guestName]);

  const ensureGuestName = (action: { type: 'add' | 'vote'; songId?: string }) => {
    if (!guestName) {
      setPendingAction(action);
      setShowNamePrompt(true);
      return false;
    }
    return true;
  };

  const handleNameSubmit = () => {
    if (guestName.trim()) {
      setShowNamePrompt(false);
      if (pendingAction) {
        if (pendingAction.type === 'add') {
          setShowAddModal(true);
        } else if (pendingAction.type === 'vote' && pendingAction.songId) {
          voteSong(pendingAction.songId);
        }
        setPendingAction(null);
      }
    }
  };

  const addSong = (song: PartySong) => {
    if (!ensureGuestName({ type: 'add' })) return;

    // Check if song is already in queue
    const exists = queue.some((q) => q.song.id === song.id);
    if (exists) {
      // Just vote for it instead
      const existing = queue.find((q) => q.song.id === song.id);
      if (existing && !existing.votedBy.includes(guestName)) {
        voteSong(existing.id);
      }
      setShowAddModal(false);
      return;
    }

    const queuedSong: QueuedSong = {
      id: Date.now().toString(),
      song,
      votes: 1,
      requestedBy: guestName,
      votedBy: [guestName],
    };

    setQueue((prev) => [...prev, queuedSong].sort((a, b) => b.votes - a.votes));
    setShowAddModal(false);
    fireCelebration();
  };

  const voteSong = (queueId: string) => {
    if (!ensureGuestName({ type: 'vote', songId: queueId })) return;

    setQueue((prev) =>
      prev
        .map((q) => {
          if (q.id === queueId && !q.votedBy.includes(guestName)) {
            return {
              ...q,
              votes: q.votes + 1,
              votedBy: [...q.votedBy, guestName],
            };
          }
          return q;
        })
        .sort((a, b) => b.votes - a.votes)
    );
  };

  const removeSong = (queueId: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== queueId));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const hasVoted = (queueId: string) => {
    const item = queue.find((q) => q.id === queueId);
    return item?.votedBy.includes(guestName) ?? false;
  };

  // Filter songs for add modal
  const filteredSongs = PARTY_SONGS.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || song.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const genres: (PartySong['genre'] | 'all')[] = ['all', 'nye', 'pop', 'hiphop', 'electronic', 'rock', 'throwback'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Music2 className="text-purple" />
            Party Queue
          </h2>
          <p className="text-sm text-text-secondary">
            Vote for your favorite songs!
          </p>
        </div>
        <div className="flex gap-2">
          {queue.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearQueue}>
              <Trash2 size={16} />
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (ensureGuestName({ type: 'add' })) {
                setShowAddModal(true);
              }
            }}
          >
            <Plus size={16} className="mr-1" />
            Request
          </Button>
        </div>
      </div>

      {/* Guest Name Display */}
      {guestName && (
        <Card variant="glass" className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-gold" />
            <span className="text-sm text-text-secondary">Voting as:</span>
            <span className="text-sm font-medium text-text-primary">{guestName}</span>
          </div>
          <button
            onClick={() => {
              setGuestName('');
              localStorage.removeItem('partyGuestName');
            }}
            className="text-xs text-text-muted hover:text-text-secondary"
          >
            Change
          </button>
        </Card>
      )}

      {/* Queue */}
      {queue.length === 0 ? (
        <Card variant="glass" className="p-8 text-center">
          <div className="text-5xl mb-3">🎵</div>
          <h3 className="text-lg font-bold text-text-primary mb-2">Queue is empty</h3>
          <p className="text-text-secondary mb-4">
            Be the first to request a song!
          </p>
          <Button
            variant="primary"
            onClick={() => {
              if (ensureGuestName({ type: 'add' })) {
                setShowAddModal(true);
              }
            }}
          >
            <Plus size={18} className="mr-2" />
            Add First Song
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {queue.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <Card
                  variant={index === 0 ? 'default' : 'glass'}
                  className={`p-3 ${index === 0 ? 'ring-2 ring-gold/50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        ${index === 0 ? 'bg-gradient-to-br from-gold to-yellow-500 text-black' : 'bg-surface-elevated text-text-muted'}
                      `}
                    >
                      {index === 0 ? <Crown size={16} /> : index + 1}
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.song.emoji}</span>
                        <span className="font-medium text-text-primary truncate">
                          {item.song.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <span className="truncate">{item.song.artist}</span>
                        <span>•</span>
                        <span>by {item.requestedBy}</span>
                      </div>
                    </div>

                    {/* Vote Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => voteSong(item.id)}
                      disabled={hasVoted(item.id)}
                      className={`
                        flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-colors
                        ${
                          hasVoted(item.id)
                            ? 'bg-purple/20 text-purple cursor-default'
                            : 'bg-surface-elevated hover:bg-purple/20 text-text-secondary hover:text-purple'
                        }
                      `}
                    >
                      <ThumbsUp size={14} className={hasVoted(item.id) ? 'fill-current' : ''} />
                      <span>{item.votes}</span>
                    </motion.button>

                    {/* Delete (only for requester) */}
                    {item.requestedBy === guestName && (
                      <button
                        onClick={() => removeSong(item.id)}
                        className="p-2 text-text-muted hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Stats */}
      {queue.length > 0 && (
        <Card variant="glass" className="p-3">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-xl font-bold text-purple">{queue.length}</p>
              <p className="text-xs text-text-muted">Songs</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gold">
                {queue.reduce((sum, q) => sum + q.votes, 0)}
              </p>
              <p className="text-xs text-text-muted">Total Votes</p>
            </div>
            <div>
              <p className="text-xl font-bold text-cyan">
                {new Set(queue.flatMap((q) => q.votedBy)).size}
              </p>
              <p className="text-xs text-text-muted">Voters</p>
            </div>
          </div>
        </Card>
      )}

      {/* Add Song Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-text-primary">Request a Song</h3>

          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs..."
              className="w-full pl-10 pr-4 py-3 bg-surface-elevated rounded-xl border border-border focus:border-purple focus:outline-none text-text-primary"
            />
          </div>

          {/* Genre Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                  ${
                    selectedGenre === genre
                      ? 'bg-purple text-white'
                      : 'bg-surface-elevated text-text-secondary hover:bg-border/50'
                  }
                `}
              >
                {genre === 'all' ? 'All' : GENRE_LABELS[genre].name}
              </button>
            ))}
          </div>

          {/* Song List */}
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {filteredSongs.map((song) => {
              const inQueue = queue.some((q) => q.song.id === song.id);
              return (
                <motion.button
                  key={song.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addSong(song)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors
                    ${inQueue ? 'bg-purple/20 border border-purple/30' : 'bg-surface-elevated hover:bg-border/50'}
                  `}
                >
                  <span className="text-2xl">{song.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{song.title}</p>
                    <p className="text-xs text-text-muted truncate">{song.artist}</p>
                  </div>
                  <span
                    className={`
                      text-xs px-2 py-1 rounded-full
                      bg-gradient-to-r ${GENRE_LABELS[song.genre].color} text-white
                    `}
                  >
                    {GENRE_LABELS[song.genre].name}
                  </span>
                  {inQueue && (
                    <span className="text-xs text-purple">In Queue</span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <Button variant="ghost" onClick={() => setShowAddModal(false)} className="w-full">
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Name Prompt Modal */}
      <Modal isOpen={showNamePrompt} onClose={() => setShowNamePrompt(false)}>
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-text-primary">What's your name?</h3>
          <p className="text-text-secondary">
            Enter your name to request and vote for songs.
          </p>

          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 bg-surface-elevated rounded-xl border border-border focus:border-purple focus:outline-none text-text-primary"
            onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
            autoFocus
          />

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowNamePrompt(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleNameSubmit}
              disabled={!guestName.trim()}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
