import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { PlayerAvatar } from './PlayerAvatar';
import { useMultiplayerStore, AVATAR_COLORS, AVATAR_EMOJIS } from '@/stores/multiplayerStore';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string, name: string, color: string, emoji: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function JoinRoomModal({
  isOpen,
  onClose,
  onJoin,
  isLoading = false,
  error,
}: JoinRoomModalProps) {
  const { localPlayerName, localAvatarColor, localAvatarEmoji, setLocalPlayerInfo } =
    useMultiplayerStore();

  const [code, setCode] = useState('');
  const [name, setName] = useState(localPlayerName);
  const [color, setColor] = useState(localAvatarColor);
  const [emoji, setEmoji] = useState(localAvatarEmoji);
  const [step, setStep] = useState<'code' | 'profile'>('code');

  const handleCodeSubmit = () => {
    if (code.length === 6) {
      setStep('profile');
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) return;
    setLocalPlayerInfo(name, color, emoji);
    await onJoin(code, name, color, emoji);
  };

  const handleClose = () => {
    setCode('');
    setStep('code');
    onClose();
  };

  const handleCodeChange = (value: string) => {
    // Only allow alphanumeric, max 6 chars, uppercase
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
    setCode(cleaned);
  };

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
          className="bg-surface rounded-2xl p-6 max-w-sm w-full border border-border/50 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple/20 flex items-center justify-center">
                <Users size={20} className="text-purple-light" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Join Room</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-surface-elevated transition-colors"
            >
              <X size={20} className="text-text-muted" />
            </button>
          </div>

          {step === 'code' ? (
            <>
              {/* Room Code Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Enter 6-digit room code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="ABC123"
                    className="w-full text-center text-3xl font-mono font-bold tracking-[0.3em] py-4 px-4 rounded-xl bg-surface-elevated border border-border focus:border-purple focus:outline-none text-text-primary placeholder:text-text-muted/50"
                    maxLength={6}
                    autoFocus
                  />
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

                <Button
                  variant="primary"
                  onClick={handleCodeSubmit}
                  disabled={code.length !== 6}
                  className="w-full"
                >
                  Continue
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Profile Setup */}
              <div className="space-y-4">
                <p className="text-sm text-text-secondary text-center">
                  Joining room <span className="font-mono font-bold text-gold">{code}</span>
                </p>

                {/* Avatar Preview */}
                <div className="flex justify-center">
                  <PlayerAvatar emoji={emoji} color={color} size="lg" />
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
                  <Button variant="secondary" onClick={() => setStep('code')} className="flex-1">
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleJoin}
                    disabled={!name.trim() || isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Join Room'
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
