import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, X, Shuffle, MessageCircle, Zap, Flame, Snowflake, Trophy } from 'lucide-react';
import { Card, Button, Modal } from '@/components/ui';
import { getRandomChallenge, type Intensity, type TruthOrDareItem } from '@/data/truthOrDare';
import { useConfetti } from '@/hooks/useConfetti';
import { useRoom } from '@/hooks/multiplayer';
import { PlayerAvatar, GameLeaderboard, type LeaderboardPlayer } from '@/components/multiplayer';

interface TruthOrDareGameState {
  intensity: Intensity;
  currentPlayerId: string | null;
  currentChallenge: TruthOrDareItem | null;
  isSpinning: boolean;
  completedRounds: number;
  playerScores: Record<string, { truths: number; dares: number; completed: number }>;
}

export function TruthOrDare() {
  const {
    room,
    players: roomPlayers,
    currentPlayer,
    isHost,
    updateGameState,
  } = useRoom();

  const isMultiplayer = room?.status === 'playing' && room?.game_type === 'truth-or-dare';

  // Local state for solo play
  const [localPlayers, setLocalPlayers] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [localCurrentPlayer, setLocalCurrentPlayer] = useState<string | null>(null);
  const [localChallenge, setLocalChallenge] = useState<TruthOrDareItem | null>(null);
  const [localIntensity, setLocalIntensity] = useState<Intensity>('light');
  const [localIsSpinning, setLocalIsSpinning] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  const { fireSmall } = useConfetti();

  // Get game state
  const gameState = room?.game_state as TruthOrDareGameState | undefined;
  const connectedPlayers = roomPlayers.filter(p => p.is_connected);

  // Derived state
  const players = isMultiplayer ? connectedPlayers : localPlayers.map(name => ({ id: name, name, avatar_emoji: '😀', avatar_color: '#9333ea' }));
  const intensity = isMultiplayer ? (gameState?.intensity || 'light') : localIntensity;
  const isSpinning = isMultiplayer ? (gameState?.isSpinning || false) : localIsSpinning;
  const challenge = isMultiplayer ? gameState?.currentChallenge : localChallenge;
  const currentSelectedPlayer = isMultiplayer
    ? connectedPlayers.find(p => p.id === gameState?.currentPlayerId) || null
    : localCurrentPlayer ? { id: localCurrentPlayer, name: localCurrentPlayer } : null;
  const playerScores = gameState?.playerScores || {};

  // Leaderboard data
  const leaderboardPlayers = useMemo((): LeaderboardPlayer[] => {
    if (!isMultiplayer) return [];

    return connectedPlayers.map(player => {
      const scores = playerScores[player.id] || { truths: 0, dares: 0, completed: 0 };
      return {
        playerId: player.id,
        playerName: player.name,
        avatarEmoji: player.avatar_emoji,
        avatarColor: player.avatar_color,
        score: scores.completed,
        isCurrentPlayer: player.id === currentPlayer?.id,
        stats: {
          truths: scores.truths,
          dares: scores.dares,
        },
      };
    });
  }, [isMultiplayer, connectedPlayers, playerScores, currentPlayer?.id]);

  // Initialize game for multiplayer
  useEffect(() => {
    if (isMultiplayer && isHost && !gameState) {
      updateGameState({
        intensity: 'light',
        currentPlayerId: null,
        currentChallenge: null,
        isSpinning: false,
        completedRounds: 0,
        playerScores: {},
      });
    }
  }, [isMultiplayer, isHost, gameState]);

  const addPlayer = useCallback(() => {
    if (newPlayerName.trim() && !localPlayers.includes(newPlayerName.trim())) {
      setLocalPlayers((prev) => [...prev, newPlayerName.trim()]);
      setNewPlayerName('');
    }
  }, [newPlayerName, localPlayers]);

  const removePlayer = (name: string) => {
    setLocalPlayers((prev) => prev.filter((p) => p !== name));
    if (localCurrentPlayer === name) {
      setLocalCurrentPlayer(null);
      setLocalChallenge(null);
    }
  };

  const handleIntensityChange = async (newIntensity: Intensity) => {
    if (isMultiplayer) {
      if (!isHost) return;
      await updateGameState({
        ...gameState,
        intensity: newIntensity,
      });
    } else {
      setLocalIntensity(newIntensity);
    }
  };

  const spinForPlayer = useCallback(async () => {
    const playerList = isMultiplayer ? connectedPlayers : localPlayers.map(n => ({ id: n, name: n }));
    if (playerList.length === 0) return;

    if (isMultiplayer) {
      if (!isHost) return;

      // Start spinning
      await updateGameState({
        ...gameState,
        isSpinning: true,
        currentChallenge: null,
      });

      // Simulate spin with timeout
      let spins = 0;
      const maxSpins = 15 + Math.floor(Math.random() * 10);
      const spinInterval = setInterval(async () => {
        spins++;
        if (spins >= maxSpins) {
          clearInterval(spinInterval);
          const finalPlayer = playerList[Math.floor(Math.random() * playerList.length)];
          await updateGameState({
            ...gameState,
            currentPlayerId: finalPlayer.id,
            isSpinning: false,
            currentChallenge: null,
          });
          fireSmall();
        } else {
          // Update displayed player during spin
          const randomPlayer = playerList[Math.floor(Math.random() * playerList.length)];
          await updateGameState({
            ...gameState,
            currentPlayerId: randomPlayer.id,
            isSpinning: true,
          });
        }
      }, 100 + spins * 10);
    } else {
      setLocalIsSpinning(true);
      setLocalChallenge(null);

      let spins = 0;
      const maxSpins = 15 + Math.floor(Math.random() * 10);
      const interval = setInterval(() => {
        setLocalCurrentPlayer(localPlayers[Math.floor(Math.random() * localPlayers.length)]);
        spins++;

        if (spins >= maxSpins) {
          clearInterval(interval);
          const finalPlayer = localPlayers[Math.floor(Math.random() * localPlayers.length)];
          setLocalCurrentPlayer(finalPlayer);
          setLocalIsSpinning(false);
          fireSmall();
        }
      }, 100 + spins * 10);
    }
  }, [isMultiplayer, isHost, connectedPlayers, localPlayers, gameState, fireSmall]);

  const selectChallenge = async (type: 'truth' | 'dare') => {
    const newChallenge = getRandomChallenge(type, intensity);

    if (isMultiplayer) {
      // In multiplayer, only host or selected player can choose
      if (!isHost && currentPlayer?.id !== gameState?.currentPlayerId) return;

      await updateGameState({
        ...gameState,
        currentChallenge: newChallenge,
      });
    } else {
      setLocalChallenge(newChallenge);
    }
    fireSmall();
  };

  const completeChallenge = async () => {
    if (isMultiplayer && isHost) {
      // Update scores
      const playerId = gameState?.currentPlayerId;
      const challengeType = gameState?.currentChallenge?.type;

      if (playerId && challengeType) {
        const newScores = { ...playerScores };
        if (!newScores[playerId]) {
          newScores[playerId] = { truths: 0, dares: 0, completed: 0 };
        }
        newScores[playerId].completed++;
        if (challengeType === 'truth') {
          newScores[playerId].truths++;
        } else {
          newScores[playerId].dares++;
        }

        await updateGameState({
          ...gameState,
          playerScores: newScores,
          completedRounds: (gameState?.completedRounds || 0) + 1,
        });
      }
    }
  };

  const nextRound = async () => {
    await completeChallenge();

    if (isMultiplayer) {
      if (!isHost) return;
      await updateGameState({
        ...gameState,
        currentPlayerId: null,
        currentChallenge: null,
        isSpinning: false,
      });
      // Auto-spin for next player
      setTimeout(() => spinForPlayer(), 500);
    } else {
      setLocalCurrentPlayer(null);
      setLocalChallenge(null);
      spinForPlayer();
    }
  };

  const intensityOptions: { value: Intensity; label: string; icon: React.ElementType; color: string }[] = [
    { value: 'light', label: 'Light', icon: Snowflake, color: 'text-cyan' },
    { value: 'medium', label: 'Medium', icon: Flame, color: 'text-orange-500' },
    { value: 'spicy', label: 'Spicy', icon: Zap, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Player Management (Solo only) */}
      {!isMultiplayer && (
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-purple" />
              <span className="font-medium text-text-primary">Players ({localPlayers.length})</span>
            </div>
            <Button variant="ghost" onClick={() => setShowAddPlayer(true)} className="text-sm">
              <Plus size={16} className="mr-1" />
              Add
            </Button>
          </div>

          {localPlayers.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">
              Add at least 2 players to start!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {localPlayers.map((player) => (
                <motion.div
                  key={player}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`
                    flex items-center gap-1 px-3 py-1 rounded-full text-sm
                    ${localCurrentPlayer === player ? 'bg-purple text-white' : 'bg-surface-elevated text-text-secondary'}
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
      )}

      {/* Multiplayer Players Display */}
      {isMultiplayer && (
        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-purple" />
            <span className="font-medium text-text-primary">Players ({connectedPlayers.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {connectedPlayers.map((player) => (
              <div
                key={player.id}
                className={`
                  flex items-center gap-1.5 px-2 py-1 rounded-full text-xs
                  ${gameState?.currentPlayerId === player.id ? 'bg-purple text-white' : 'bg-surface-elevated text-text-muted'}
                `}
              >
                <PlayerAvatar
                  emoji={player.avatar_emoji}
                  color={player.avatar_color}
                  size="xs"
                  isHost={player.is_host}
                />
                <span>{player.name}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Multiplayer Leaderboard */}
      {isMultiplayer && leaderboardPlayers.length > 0 && (gameState?.completedRounds || 0) > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Trophy size={14} className="text-gold" />
            <span>Challenges Completed</span>
          </div>
          <GameLeaderboard
            players={leaderboardPlayers}
            compact
            statLabels={{ truths: 'T', dares: 'D' }}
          />
        </div>
      )}

      {/* Intensity Selector */}
      <div className="flex gap-2">
        {intensityOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleIntensityChange(option.value)}
            disabled={isMultiplayer && !isHost}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2 rounded-xl
              font-medium text-sm transition-all
              ${intensity === option.value
                ? 'bg-purple text-white'
                : 'bg-surface-elevated text-text-muted hover:text-text-secondary'}
              ${isMultiplayer && !isHost ? 'cursor-default opacity-75' : ''}
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
          {!currentSelectedPlayer ? (
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
                  ? isMultiplayer ? 'Waiting for more players...' : 'Add at least 2 players to start'
                  : 'Spin to select a player!'}
              </p>
              {(!isMultiplayer || isHost) && players.length >= 2 && (
                <Button
                  variant="primary"
                  onClick={spinForPlayer}
                  disabled={players.length < 2 || isSpinning}
                >
                  <Shuffle size={18} className="mr-2" />
                  Spin!
                </Button>
              )}
              {isMultiplayer && !isHost && players.length >= 2 && (
                <p className="text-sm text-text-muted">Waiting for host to spin...</p>
              )}
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
                {isMultiplayer && currentSelectedPlayer ? (
                  <div className="flex flex-col items-center">
                    <PlayerAvatar
                      emoji={(currentSelectedPlayer as any).avatar_emoji}
                      color={(currentSelectedPlayer as any).avatar_color}
                      size="lg"
                      isHost={(currentSelectedPlayer as any).is_host}
                    />
                    <h3 className="text-xl font-bold text-text-primary mt-3">
                      {currentSelectedPlayer.name}
                    </h3>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple to-magenta flex items-center justify-center text-3xl text-white font-bold">
                      {currentSelectedPlayer?.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mt-3">
                      {currentSelectedPlayer?.name}
                    </h3>
                  </>
                )}
              </motion.div>

              {!isSpinning && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-text-secondary">
                    {isMultiplayer && currentPlayer?.id === gameState?.currentPlayerId
                      ? 'Your turn! Choose your fate!'
                      : `${currentSelectedPlayer?.name}, choose your fate!`}
                  </p>
                  {/* Show buttons to selected player in multiplayer, or always in solo */}
                  {(!isMultiplayer || currentPlayer?.id === gameState?.currentPlayerId || isHost) && (
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
                  )}
                  {isMultiplayer && currentPlayer?.id !== gameState?.currentPlayerId && !isHost && (
                    <p className="text-sm text-text-muted">
                      Waiting for {currentSelectedPlayer?.name} to choose...
                    </p>
                  )}
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
                {currentSelectedPlayer?.name}, complete your {challenge.type}!
              </p>

              {(!isMultiplayer || isHost) && (
                <Button variant="primary" onClick={nextRound}>
                  <Shuffle size={18} className="mr-2" />
                  Next Player
                </Button>
              )}

              {isMultiplayer && !isHost && (
                <Card variant="glass" className="p-3">
                  <p className="text-sm text-text-muted">Waiting for host to continue...</p>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Add Player Modal (Solo only) */}
      {!isMultiplayer && (
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
      )}
    </div>
  );
}
