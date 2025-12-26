import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, X, Shuffle, MessageCircle, Zap, Flame, Snowflake } from 'lucide-react';
import { Card, Button, Modal } from '@/components/ui';
import { getRandomChallenge, type Intensity, type TruthOrDareItem } from '@/data/truthOrDare';
import { useConfetti } from '@/hooks/useConfetti';

export function TruthOrDare() {
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<TruthOrDareItem | null>(null);
  const [intensity, setIntensity] = useState<Intensity>('light');
  const [isSpinning, setIsSpinning] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const { fireSmall } = useConfetti();

  const addPlayer = useCallback(() => {
    if (newPlayerName.trim() && !players.includes(newPlayerName.trim())) {
      setPlayers((prev) => [...prev, newPlayerName.trim()]);
      setNewPlayerName('');
    }
  }, [newPlayerName, players]);

  const removePlayer = (name: string) => {
    setPlayers((prev) => prev.filter((p) => p !== name));
    if (currentPlayer === name) {
      setCurrentPlayer(null);
      setChallenge(null);
    }
  };

  const spinForPlayer = useCallback(() => {
    if (players.length === 0) return;

    setIsSpinning(true);
    setChallenge(null);

    // Spin animation
    let spins = 0;
    const maxSpins = 15 + Math.floor(Math.random() * 10);
    const interval = setInterval(() => {
      setCurrentPlayer(players[Math.floor(Math.random() * players.length)]);
      spins++;

      if (spins >= maxSpins) {
        clearInterval(interval);
        const finalPlayer = players[Math.floor(Math.random() * players.length)];
        setCurrentPlayer(finalPlayer);
        setIsSpinning(false);
        fireSmall();
      }
    }, 100 + spins * 10); // Gradually slow down
  }, [players, fireSmall]);

  const selectChallenge = (type: 'truth' | 'dare') => {
    const newChallenge = getRandomChallenge(type, intensity);
    setChallenge(newChallenge);
    fireSmall();
  };

  const nextRound = () => {
    setCurrentPlayer(null);
    setChallenge(null);
    spinForPlayer();
  };

  const intensityOptions: { value: Intensity; label: string; icon: React.ElementType; color: string }[] = [
    { value: 'light', label: 'Light', icon: Snowflake, color: 'text-cyan' },
    { value: 'medium', label: 'Medium', icon: Flame, color: 'text-orange-500' },
    { value: 'spicy', label: 'Spicy', icon: Zap, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Player Management */}
      <Card variant="glass" className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-purple" />
            <span className="font-medium text-text-primary">Players ({players.length})</span>
          </div>
          <Button variant="ghost" onClick={() => setShowAddPlayer(true)} className="text-sm">
            <Plus size={16} className="mr-1" />
            Add
          </Button>
        </div>

        {players.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-4">
            Add at least 2 players to start!
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {players.map((player) => (
              <motion.div
                key={player}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`
                  flex items-center gap-1 px-3 py-1 rounded-full text-sm
                  ${currentPlayer === player ? 'bg-purple text-white' : 'bg-surface-elevated text-text-secondary'}
                `}
              >
                <span>{player}</span>
                <button
                  onClick={() => removePlayer(player)}
                  className="hover:text-magenta transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Intensity Selector */}
      <div className="flex gap-2">
        {intensityOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setIntensity(option.value)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2 rounded-xl
              font-medium text-sm transition-all
              ${intensity === option.value
                ? 'bg-purple text-white'
                : 'bg-surface-elevated text-text-muted hover:text-text-secondary'}
            `}
          >
            <option.icon size={16} className={intensity === option.value ? 'text-white' : option.color} />
            {option.label}
          </button>
        ))}
      </div>

      {/* Game Area */}
      <Card variant="glass" className="text-center py-8">
        <AnimatePresence mode="wait">
          {!currentPlayer ? (
            // Ready to Spin
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Shuffle size={48} className="mx-auto text-text-muted" />
              <p className="text-text-secondary">
                {players.length < 2
                  ? 'Add at least 2 players to start'
                  : 'Spin to select a player!'}
              </p>
              <Button
                variant="primary"
                onClick={spinForPlayer}
                disabled={players.length < 2 || isSpinning}
              >
                <Shuffle size={18} className="mr-2" />
                Spin!
              </Button>
            </motion.div>
          ) : !challenge ? (
            // Player Selected - Choose Truth or Dare
            <motion.div
              key="choose"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-6"
            >
              <motion.div
                animate={isSpinning ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.2, repeat: isSpinning ? Infinity : 0 }}
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple to-magenta flex items-center justify-center text-3xl text-white font-bold">
                  {currentPlayer.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold text-text-primary mt-3">
                  {currentPlayer}
                </h3>
              </motion.div>

              {!isSpinning && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-text-secondary">Choose your fate!</p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="secondary"
                      onClick={() => selectChallenge('truth')}
                      className="px-6 bg-cyan/20 hover:bg-cyan/30 text-cyan"
                    >
                      <MessageCircle size={18} className="mr-2" />
                      Truth
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => selectChallenge('dare')}
                      className="px-6 bg-magenta/20 hover:bg-magenta/30 text-magenta"
                    >
                      <Zap size={18} className="mr-2" />
                      Dare
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            // Challenge Displayed
            <motion.div
              key="challenge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center gap-2">
                <span className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${challenge.type === 'truth' ? 'bg-cyan/20 text-cyan' : 'bg-magenta/20 text-magenta'}
                `}>
                  {challenge.type === 'truth' ? 'TRUTH' : 'DARE'}
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-surface-elevated">
                <p className="text-lg text-text-primary">{challenge.text}</p>
              </div>

              <p className="text-sm text-text-muted">
                {currentPlayer}, complete your {challenge.type}!
              </p>

              <Button variant="primary" onClick={nextRound}>
                <Shuffle size={18} className="mr-2" />
                Next Player
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Add Player Modal */}
      <Modal isOpen={showAddPlayer} onClose={() => setShowAddPlayer(false)}>
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-text-primary">Add Player</h3>
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
            placeholder="Enter name..."
            className="w-full px-4 py-3 bg-surface-elevated rounded-xl border border-border focus:border-purple focus:outline-none text-text-primary"
            autoFocus
          />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowAddPlayer(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={() => { addPlayer(); setShowAddPlayer(false); }} className="flex-1">
              Add Player
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
