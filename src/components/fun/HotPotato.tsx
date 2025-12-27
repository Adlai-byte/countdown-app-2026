import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Flame, Bomb, Trophy, Users, Crown, Skull } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useConfetti } from '@/hooks/useConfetti';
import { useRoom } from '@/hooks/multiplayer';
import { PlayerAvatar, GameLeaderboard, type LeaderboardPlayer } from '@/components/multiplayer';
import useSound from 'use-sound';

const TICK_SOUND = 'https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3';
const EXPLOSION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/1684/1684-preview.mp3';
const PASS_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3';

interface HotPotatoGameState {
  isRunning: boolean;
  hasExploded: boolean;
  currentHolderId: string | null;
  startTime: number | null;
  duration: number; // HIDDEN from clients - 10-30 seconds
  timeLeft: number; // Synced countdown (hidden in last 5s)
  passHistory: { from: string; to: string; timestamp: number }[];
  eliminatedPlayerIds: string[];
  roundsPlayed: number;
  playerStats: Record<string, { passes: number; caughtCount: number; survivalRounds: number }>;
  gameMode: 'elimination' | 'points'; // elimination removes players, points just counts
}

export function HotPotato() {
  const {
    room,
    players: roomPlayers,
    currentPlayer,
    isHost,
    updateGameState,
  } = useRoom();

  const isMultiplayer = room?.status === 'playing' && room?.game_type === 'hot-potato';

  // Local state for solo play
  const [localIsRunning, setLocalIsRunning] = useState(false);
  const [localHasExploded, setLocalHasExploded] = useState(false);
  const [localTimeLeft, setLocalTimeLeft] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const explosionTimeRef = useRef<number>(0);
  const { fireCelebration, fireSmall } = useConfetti();

  const [playTick] = useSound(TICK_SOUND, { volume: 0.3 });
  const [playExplosion] = useSound(EXPLOSION_SOUND, { volume: 0.5 });
  const [playPass] = useSound(PASS_SOUND, { volume: 0.4 });

  // Get game state
  const gameState = room?.game_state as HotPotatoGameState | undefined;
  const connectedPlayers = roomPlayers.filter(p => p.is_connected);

  // Derived state
  const isRunning = isMultiplayer ? (gameState?.isRunning || false) : localIsRunning;
  const hasExploded = isMultiplayer ? (gameState?.hasExploded || false) : localHasExploded;
  const timeLeft = isMultiplayer ? (gameState?.timeLeft ?? null) : localTimeLeft;
  const playerStats = gameState?.playerStats || {};
  const eliminatedPlayerIds = gameState?.eliminatedPlayerIds || [];

  // Current holder
  const currentHolder = isMultiplayer && gameState?.currentHolderId
    ? connectedPlayers.find(p => p.id === gameState.currentHolderId)
    : null;

  const isHolding = isMultiplayer
    ? currentPlayer?.id === gameState?.currentHolderId
    : true; // Solo player always holds it

  // Active players (not eliminated)
  const activePlayers = isMultiplayer
    ? connectedPlayers.filter(p => !eliminatedPlayerIds.includes(p.id))
    : [];

  // Players available to pass to (active, not self)
  const passablePlayers = activePlayers.filter(p => p.id !== currentPlayer?.id);

  // Leaderboard data
  const leaderboardPlayers = useMemo((): LeaderboardPlayer[] => {
    if (!isMultiplayer) return [];

    return connectedPlayers.map(player => {
      const stats = playerStats[player.id] || { passes: 0, caughtCount: 0, survivalRounds: 0 };
      return {
        playerId: player.id,
        playerName: player.name,
        avatarEmoji: player.avatar_emoji,
        avatarColor: player.avatar_color,
        score: gameState?.gameMode === 'elimination' ? stats.survivalRounds : -stats.caughtCount, // Negative for "times caught"
        isCurrentPlayer: player.id === currentPlayer?.id,
        stats: {
          passes: stats.passes,
          caught: stats.caughtCount,
        },
      };
    });
  }, [isMultiplayer, connectedPlayers, playerStats, eliminatedPlayerIds, currentPlayer?.id, gameState?.gameMode]);

  // Initialize game for multiplayer
  useEffect(() => {
    if (isMultiplayer && isHost && !gameState?.playerStats) {
      updateGameState({
        isRunning: false,
        hasExploded: false,
        currentHolderId: null,
        startTime: null,
        duration: 0,
        timeLeft: 0,
        passHistory: [],
        eliminatedPlayerIds: [],
        roundsPlayed: 0,
        playerStats: {},
        gameMode: 'points',
      });
    }
  }, [isMultiplayer, isHost, gameState?.playerStats]);

  // Timer countdown for multiplayer (host runs the timer)
  useEffect(() => {
    if (!isMultiplayer) return;
    if (!isHost) return;
    if (!isRunning) return;

    const currentTimeLeft = gameState?.timeLeft ?? 0;

    if (currentTimeLeft <= 0) {
      handleExplosion();
      return;
    }

    timerRef.current = setTimeout(async () => {
      await updateGameState({
        ...gameState,
        timeLeft: currentTimeLeft - 1,
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isMultiplayer, isHost, isRunning, gameState?.timeLeft]);

  // Play tick sound for last 5 seconds
  useEffect(() => {
    if (isRunning && timeLeft !== null && timeLeft <= 5 && timeLeft > 0) {
      playTick();
    }
  }, [isRunning, timeLeft, playTick]);

  // Local timer for solo play
  useEffect(() => {
    if (isMultiplayer) return;
    if (!localIsRunning || localTimeLeft === null) return;

    if (localTimeLeft <= 0) {
      setLocalIsRunning(false);
      setLocalHasExploded(true);
      playExplosion();
      fireCelebration();
      return;
    }

    if (localTimeLeft <= 5) {
      playTick();
    }

    timerRef.current = setTimeout(() => {
      setLocalTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isMultiplayer, localIsRunning, localTimeLeft, playTick, playExplosion, fireCelebration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Generate random time between 10-30 seconds
  const generateRandomTime = useCallback(() => {
    return Math.floor(Math.random() * 21) + 10; // 10-30 seconds
  }, []);

  const startGame = useCallback(async () => {
    const duration = generateRandomTime();

    if (isMultiplayer) {
      if (!isHost) return;

      // Pick random starting player from active players
      const startingPlayer = activePlayers[Math.floor(Math.random() * activePlayers.length)];

      await updateGameState({
        ...gameState,
        isRunning: true,
        hasExploded: false,
        currentHolderId: startingPlayer?.id || connectedPlayers[0]?.id,
        startTime: Date.now(),
        duration,
        timeLeft: duration,
        passHistory: [],
      });
    } else {
      explosionTimeRef.current = duration;
      setLocalTimeLeft(duration);
      setLocalIsRunning(true);
      setLocalHasExploded(false);
    }
  }, [generateRandomTime, isMultiplayer, isHost, gameState, activePlayers, connectedPlayers]);

  const handleExplosion = useCallback(async () => {
    if (!isMultiplayer) return;
    if (!isHost) return;

    const holderId = gameState?.currentHolderId;
    const newStats = { ...playerStats };
    const newEliminated = [...eliminatedPlayerIds];

    // Update caught player stats
    if (holderId) {
      if (!newStats[holderId]) {
        newStats[holderId] = { passes: 0, caughtCount: 0, survivalRounds: 0 };
      }
      newStats[holderId].caughtCount += 1;

      // Eliminate player in elimination mode
      if (gameState?.gameMode === 'elimination') {
        newEliminated.push(holderId);
      }
    }

    // Update survival rounds for non-caught players
    activePlayers.forEach(player => {
      if (player.id !== holderId) {
        if (!newStats[player.id]) {
          newStats[player.id] = { passes: 0, caughtCount: 0, survivalRounds: 0 };
        }
        newStats[player.id].survivalRounds += 1;
      }
    });

    await updateGameState({
      ...gameState,
      isRunning: false,
      hasExploded: true,
      timeLeft: 0,
      playerStats: newStats,
      eliminatedPlayerIds: newEliminated,
      roundsPlayed: (gameState?.roundsPlayed || 0) + 1,
    });

    playExplosion();
    fireCelebration();
  }, [isMultiplayer, isHost, gameState, playerStats, eliminatedPlayerIds, activePlayers, playExplosion, fireCelebration]);

  const handlePass = useCallback(async (targetPlayerId: string) => {
    if (!isMultiplayer) return;
    if (!isHolding) return;
    if (!isRunning) return;
    if (eliminatedPlayerIds.includes(targetPlayerId)) return;

    const newStats = { ...playerStats };
    if (currentPlayer?.id) {
      if (!newStats[currentPlayer.id]) {
        newStats[currentPlayer.id] = { passes: 0, caughtCount: 0, survivalRounds: 0 };
      }
      newStats[currentPlayer.id].passes += 1;
    }

    const newHistory = [
      ...(gameState?.passHistory || []),
      { from: currentPlayer?.id || '', to: targetPlayerId, timestamp: Date.now() },
    ];

    await updateGameState({
      ...gameState,
      currentHolderId: targetPlayerId,
      passHistory: newHistory,
      playerStats: newStats,
    });

    playPass();
    fireSmall();
  }, [isMultiplayer, isHolding, isRunning, currentPlayer, gameState, playerStats, eliminatedPlayerIds, playPass, fireSmall]);

  const resetGame = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (isMultiplayer) {
      if (!isHost) return;

      await updateGameState({
        ...gameState,
        isRunning: false,
        hasExploded: false,
        currentHolderId: null,
        timeLeft: 0,
      });
    } else {
      setLocalIsRunning(false);
      setLocalHasExploded(false);
      setLocalTimeLeft(null);
    }
  }, [isMultiplayer, isHost, gameState]);

  const resetFullGame = useCallback(async () => {
    if (!isMultiplayer || !isHost) return;

    await updateGameState({
      isRunning: false,
      hasExploded: false,
      currentHolderId: null,
      startTime: null,
      duration: 0,
      timeLeft: 0,
      passHistory: [],
      eliminatedPlayerIds: [],
      roundsPlayed: 0,
      playerStats: {},
      gameMode: gameState?.gameMode || 'points',
    });
  }, [isMultiplayer, isHost, gameState?.gameMode]);

  // Check if game is over (elimination mode)
  const remainingPlayers = activePlayers.length;
  const gameOver = isMultiplayer && gameState?.gameMode === 'elimination' && remainingPlayers <= 1 && (gameState?.roundsPlayed || 0) > 0;
  const winner = gameOver ? activePlayers[0] : null;

  // Show time or hidden
  const showTime = timeLeft !== null && timeLeft > 5;

  return (
    <div className="space-y-6">
      {/* Multiplayer Players Status */}
      {isMultiplayer && !isRunning && !hasExploded && (
        <div className="flex flex-wrap gap-2 justify-center">
          {connectedPlayers.map((player) => {
            const isEliminated = eliminatedPlayerIds.includes(player.id);
            const stats = playerStats[player.id];
            return (
              <div
                key={player.id}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
                  isEliminated
                    ? 'bg-red-500/20 text-red-400 line-through'
                    : 'bg-surface-elevated text-text-muted'
                }`}
              >
                <PlayerAvatar
                  emoji={player.avatar_emoji}
                  color={player.avatar_color}
                  size="xs"
                  isHost={player.is_host}
                />
                <span>{player.name}</span>
                {stats && <span className="text-gold">({stats.caughtCount}💥)</span>}
                {isEliminated && <Skull size={12} className="text-red-400" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Multiplayer Leaderboard */}
      {isMultiplayer && leaderboardPlayers.length > 0 && (gameState?.roundsPlayed || 0) > 0 && !isRunning && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Trophy size={14} className="text-gold" />
            <span>{gameState?.gameMode === 'elimination' ? 'Survival' : 'Times Caught'}</span>
          </div>
          <GameLeaderboard
            players={leaderboardPlayers}
            compact
            statLabels={{ passes: 'passes', caught: 'caught' }}
          />
        </div>
      )}

      {/* Game Over - Winner */}
      {gameOver && winner && (
        <Card variant="glass" className="p-6 bg-gold/10 border border-gold/30">
          <div className="text-center space-y-3">
            <Crown size={48} className="text-gold mx-auto" />
            <h3 className="text-2xl font-bold text-gold">Winner!</h3>
            <div className="flex items-center justify-center gap-2">
              <PlayerAvatar
                emoji={winner.avatar_emoji}
                color={winner.avatar_color}
                size="lg"
              />
              <span className="text-xl font-bold text-text-primary">{winner.name}</span>
            </div>
            {isHost && (
              <Button variant="primary" onClick={resetFullGame} className="mt-4">
                <RotateCcw size={18} className="mr-2" />
                New Game
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Game Area */}
      {!gameOver && (
        <Card variant="glass" className="text-center py-8">
          <AnimatePresence mode="wait">
            {!isRunning && !hasExploded ? (
              // Start State
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="space-y-6"
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Flame size={48} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Hot Potato</h3>
                  <p className="text-text-secondary text-sm">
                    {isMultiplayer
                      ? 'Pass the potato to others! When it explodes, you lose!'
                      : 'Pass the phone around! When it explodes, you\'re out!'}
                  </p>
                </div>

                {isMultiplayer && activePlayers.length > 0 && (
                  <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
                    <Users size={16} />
                    <span>{activePlayers.length} players active</span>
                  </div>
                )}

                {(!isMultiplayer || isHost) && (
                  <Button
                    variant="primary"
                    onClick={startGame}
                    disabled={isMultiplayer && activePlayers.length < 2}
                    className="px-8"
                  >
                    <Play size={20} className="mr-2" />
                    Start Round
                  </Button>
                )}
                {isMultiplayer && !isHost && (
                  <p className="text-sm text-text-muted">Waiting for host to start...</p>
                )}
              </motion.div>
            ) : isRunning ? (
              // Running State
              <motion.div
                key="running"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="space-y-6"
              >
                {/* Current Holder */}
                {isMultiplayer && currentHolder && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <PlayerAvatar
                      emoji={currentHolder.avatar_emoji}
                      color={currentHolder.avatar_color}
                      size="sm"
                    />
                    <span className="font-bold text-orange-400">
                      {isHolding ? 'You have the potato!' : `${currentHolder.name} has it!`}
                    </span>
                  </div>
                )}

                {/* Animated Bomb */}
                <motion.div
                  animate={{
                    scale: timeLeft !== null && timeLeft <= 5 ? [1, 1.1, 1] : 1,
                    rotate: timeLeft !== null && timeLeft <= 3 ? [-5, 5, -5] : 0,
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: timeLeft !== null && timeLeft <= 5 ? Infinity : 0,
                  }}
                  className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center shadow-lg relative ${
                    isHolding
                      ? 'bg-gradient-to-br from-red-500 to-orange-600 shadow-red-500/50'
                      : 'bg-gradient-to-br from-gray-600 to-gray-700 shadow-gray-500/30'
                  }`}
                >
                  <Bomb size={64} className="text-white" />

                  {/* Fuse Animation */}
                  <motion.div
                    className="absolute -top-4 left-1/2 -translate-x-1/2"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                  >
                    <div className="w-3 h-6 bg-gradient-to-t from-orange-500 to-yellow-400 rounded-full" />
                  </motion.div>

                  {/* Glow Effect */}
                  {timeLeft !== null && timeLeft <= 5 && isHolding && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-red-500/50"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                <div>
                  <h3 className="text-2xl font-bold text-red-500 mb-2">
                    {isHolding ? 'PASS IT QUICK!' : 'Watch out!'}
                  </h3>
                  {showTime && timeLeft !== null ? (
                    <p className="text-4xl font-bold text-text-primary">
                      {timeLeft}s
                    </p>
                  ) : (
                    <motion.p
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                      className="text-2xl font-bold text-red-500"
                    >
                      ???
                    </motion.p>
                  )}
                </div>

                {/* Pass Buttons - Only shown to holder */}
                {isMultiplayer && isHolding && passablePlayers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-text-muted">Tap to pass:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {passablePlayers.map(player => (
                        <motion.button
                          key={player.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePass(player.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium shadow-lg shadow-orange-500/30"
                        >
                          <PlayerAvatar
                            emoji={player.avatar_emoji}
                            color={player.avatar_color}
                            size="xs"
                          />
                          <span>{player.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Waiting message for non-holders */}
                {isMultiplayer && !isHolding && (
                  <p className="text-sm text-text-muted">
                    Hope they pass it to someone else...
                  </p>
                )}
              </motion.div>
            ) : (
              // Exploded State
              <motion.div
                key="exploded"
                initial={{ opacity: 0, scale: 1.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-lg relative overflow-hidden"
                >
                  {/* Explosion particles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        x: Math.cos((i * Math.PI) / 4) * 80,
                        y: Math.sin((i * Math.PI) / 4) * 80,
                      }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="absolute w-4 h-4 rounded-full bg-orange-500"
                    />
                  ))}
                  <span className="text-5xl">💥</span>
                </motion.div>

                <div>
                  <h3 className="text-3xl font-bold text-red-500 mb-2">
                    BOOM!
                  </h3>
                  {isMultiplayer && currentHolder ? (
                    <div className="flex items-center justify-center gap-2">
                      <PlayerAvatar
                        emoji={currentHolder.avatar_emoji}
                        color={currentHolder.avatar_color}
                        size="sm"
                      />
                      <span className="text-text-secondary">
                        {isHolding ? 'You got caught!' : `${currentHolder.name} got caught!`}
                      </span>
                    </div>
                  ) : (
                    <p className="text-text-secondary">
                      You got caught with the potato!
                    </p>
                  )}
                </div>

                {(!isMultiplayer || isHost) && (
                  <div className="flex gap-3 justify-center">
                    <Button variant="ghost" onClick={resetGame}>
                      Done
                    </Button>
                    <Button variant="primary" onClick={startGame} className="px-8">
                      <RotateCcw size={20} className="mr-2" />
                      Next Round
                    </Button>
                  </div>
                )}
                {isMultiplayer && !isHost && (
                  <p className="text-sm text-text-muted">Waiting for host...</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Instructions */}
      <Card variant="glass" className="p-4">
        <h4 className="font-medium text-text-primary mb-2">How to Play:</h4>
        <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
          {isMultiplayer ? (
            <>
              <li>Host starts the round with a random player</li>
              <li>If you have the potato, tap someone to pass it!</li>
              <li>The timer is 10-30 seconds (hidden in last 5s)</li>
              <li>Whoever holds it when it explodes loses!</li>
            </>
          ) : (
            <>
              <li>Press Start and pass the phone around</li>
              <li>The timer is random (10-30 seconds)</li>
              <li>Last 5 seconds are hidden!</li>
              <li>Whoever holds it when it explodes loses!</li>
            </>
          )}
        </ol>
      </Card>
    </div>
  );
}
