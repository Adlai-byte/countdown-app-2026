import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { PlayerAvatar } from './PlayerAvatar';
import { useMultiplayerStore, AVATAR_COLORS, AVATAR_EMOJIS } from '@/stores/multiplayerStore';
import type { GameType } from '@/services/multiplayer/types';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (gameType: GameType, name: string, color: string, emoji: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  preselectedGame?: GameType;
}

const GAME_OPTIONS: { type: GameType; name: string; emoji: string; minPlayers: number }[] = [
  { type: 'would-you-rather', name: 'Would You Rather', emoji: '🤔', minPlayers: 2 },
  { type: 'truth-or-dare', name: 'Truth or Dare', emoji: '🎭', minPlayers: 2 },
  { type: 'charades', name: 'Charades', emoji: '🎬', minPlayers: 2 },
  { type: 'bingo', name: 'NYE Bingo', emoji: '📋', minPlayers: 2 },
  { type: 'never-have-i-ever', name: 'Never Have I Ever', emoji: '🙅', minPlayers: 2 },
  { type: 'kings', name: 'Kings', emoji: '👑', minPlayers: 3 },
  { type: 'drink-roulette', name: 'Drink Roulette', emoji: '🎰', minPlayers: 2 },
  { type: 'hot-potato', name: 'Hot Potato', emoji: '🥔', minPlayers: 3 },
];

export function CreateRoomModal({
  isOpen,
  onClose,
  onCreate,
  isLoading = false,
  error,
  preselectedGame,
}: CreateRoomModalProps) {
  const { localPlayerName, localAvatarColor, localAvatarEmoji, setLocalPlayerInfo } =
    useMultiplayerStore();

  const [selectedGame, setSelectedGame] = useState<GameType | null>(preselectedGame || null);
  const [name, setName] = useState(localPlayerName);
  const [color, setColor] = useState(localAvatarColor);
  const [emoji, setEmoji] = useState(localAvatarEmoji);
  const [step, setStep] = useState<'game' | 'profile'>(preselectedGame ? 'profile' : 'game');

  const handleGameSelect = (gameType: GameType) => {
    setSelectedGame(gameType);
    setStep('profile');
  };

  const handleCreate = async () => {
    if (!name.trim() || !selectedGame) return;
    setLocalPlayerInfo(name, color, emoji);
    await onCreate(selectedGame, name, color, emoji);
  };

  const handleClose = () => {
    setSelectedGame(preselectedGame || null);
    setStep(preselectedGame ? 'profile' : 'game');
    onClose();
  };

  const selectedGameInfo = GAME_OPTIONS.find((g) => g.type === selectedGame);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-surface rounded-2xl p-6 max-w-md w-full border border-border/50 shadow-xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                <Plus size={20} className="text-gold" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Create Room</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-surface-elevated transition-colors"
            >
              <X size={20} className="text-text-muted" />
            </button>
          </div>

          {step === 'game' ? (
            <>
              {/* Game Selection */}
              <div className="space-y-4">
                <p className="text-sm text-text-secondary text-center">
                  Choose a game to play with friends
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {GAME_OPTIONS.map((game) => (
                    <button
                      key={game.type}
                      onClick={() => handleGameSelect(game.type)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-elevated border border-border hover:border-purple hover:bg-purple/10 transition-all group"
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform">
                        {game.emoji}
                      </span>
                      <span className="text-sm font-medium text-text-primary">{game.name}</span>
                      <span className="text-xs text-text-muted">{game.minPlayers}+ players</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Profile Setup */}
              <div className="space-y-4">
                {selectedGameInfo && (
                  <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-elevated">
                    <span className="text-2xl">{selectedGameInfo.emoji}</span>
                    <span className="font-medium text-text-primary">{selectedGameInfo.name}</span>
                  </div>
                )}

                {/* Avatar Preview */}
                <div className="flex justify-center">
                  <PlayerAvatar emoji={emoji} color={color} size="lg" isHost />
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Your Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={20}
                  />
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Avatar Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {AVATAR_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-8 h-8 rounded-full transition-transform ${
                          color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Emoji Selection */}
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Avatar Emoji</label>
                  <div className="flex gap-2 flex-wrap">
                    {AVATAR_EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setEmoji(e)}
                        className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                          emoji === e
                            ? 'bg-purple/30 ring-2 ring-purple scale-110'
                            : 'bg-surface-elevated hover:bg-border/30'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="flex gap-3">
                  {!preselectedGame && (
                    <Button variant="secondary" onClick={() => setStep('game')} className="flex-1">
                      Back
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    onClick={handleCreate}
                    disabled={!name.trim() || isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Room'
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
