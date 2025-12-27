import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Wine, Users, Zap, Shield, Trophy } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { getRandomRouletteOption, type RouletteOption } from '@/data/drinkingGames';
import { useConfetti } from '@/hooks/useConfetti';
import { useRoom } from '@/hooks/multiplayer';
import { PlayerAvatar, GameLeaderboard, type LeaderboardPlayer } from '@/components/multiplayer';
import useSound from 'use-sound';

const SPIN_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3';
const RESULT_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3';

interface DrinkRouletteGameState {
  currentSpinnerId: string | null;
  isSpinning: boolean;
  result: RouletteOption | null;
  rotation: number;
  turnOrder: string[];
  currentTurnIndex: number;
  spinCount: number;
  playerScores: Record<string, number>;
  // Sync params for animation
  spinStartRotation?: number;
  spinTargetRotation?: number;
  spinStartTime?: number;
  pendingResult?: RouletteOption;
}

export function DrinkRoulette() {
  const {
    room,
    players: roomPlayers,
    currentPlayer,
    isHost,
    updateGameState,
  } = useRoom();

  const isMultiplayer = room?.status === 'playing' && room?.game_type === 'drink-roulette';

  // Local state for solo play
  const [localResult, setLocalResult] = useState<RouletteOption | null>(null);
  const [localIsSpinning, setLocalIsSpinning] = useState(false);
  const [localRotation, setLocalRotation] = useState(0);

  // Animated rotation for multiplayer (smooth local animation)
  const [animatedRotation, setAnimatedRotation] = useState(0);

  const spinRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { fireSmall, fireCelebration } = useConfetti();

  const [playSpin] = useSound(SPIN_SOUND, { volume: 0.3 });
  const [playResult] = useSound(RESULT_SOUND, { volume: 0.4 });

  // Get game state
  const gameState = room?.game_state as DrinkRouletteGameState | undefined;
  const connectedPlayers = roomPlayers.filter(p => p.is_connected);

  // Derived state
  const result = isMultiplayer ? gameState?.result : localResult;
  const isSpinning = isMultiplayer ? (gameState?.isSpinning || false) : localIsSpinning;
  // Use animated rotation during spin, final rotation when idle
  const rotation = isMultiplayer
    ? (gameState?.isSpinning ? animatedRotation : (gameState?.rotation || 0))
    : localRotation;
  const playerScores = gameState?.playerScores || {};

  // Current turn player
  const currentTurnPlayer = isMultiplayer && gameState?.turnOrder
    ? connectedPlayers.find(p => p.id === gameState.turnOrder[gameState.currentTurnIndex || 0])
    : null;

  const isMyTurn = isMultiplayer
    ? currentPlayer?.id === currentTurnPlayer?.id
    : true;

  // Leaderboard data
  const leaderboardPlayers = useMemo((): LeaderboardPlayer[] => {
    if (!isMultiplayer) return [];

    return connectedPlayers.map(player => ({
      playerId: player.id,
      playerName: player.name,
      avatarEmoji: player.avatar_emoji,
      avatarColor: player.avatar_color,
      score: playerScores[player.id] || 0,
      isCurrentPlayer: player.id === currentPlayer?.id,
    }));
  }, [isMultiplayer, connectedPlayers, playerScores, currentPlayer?.id]);

  // Initialize game for multiplayer
  useEffect(() => {
    if (isMultiplayer && isHost && !gameState?.turnOrder?.length) {
      const shuffled = [...connectedPlayers].sort(() => Math.random() - 0.5);
      updateGameState({
        currentSpinnerId: null,
        isSpinning: false,
        result: null,
        rotation: 0,
        turnOrder: shuffled.map(p => p.id),
        currentTurnIndex: 0,
        spinCount: 0,
        playerScores: {},
      });
    }
  }, [isMultiplayer, isHost, gameState?.turnOrder?.length, connectedPlayers]);

  // Sync animated rotation with final rotation when not spinning
  useEffect(() => {
    if (isMultiplayer && !gameState?.isSpinning && gameState?.rotation !== undefined) {
      setAnimatedRotation(gameState.rotation);
    }
  }, [isMultiplayer, gameState?.isSpinning, gameState?.rotation]);

  // Synced spin animation - runs on ALL clients when isSpinning is true
  useEffect(() => {
    if (!isMultiplayer || !gameState?.isSpinning) return;

    const { spinStartRotation, spinTargetRotation, spinStartTime, pendingResult } = gameState;
    if (spinStartRotation === undefined || spinTargetRotation === undefined || !spinStartTime) return;

    const spinDuration = 3000;

    // Start the animation interval
    if (spinRef.current === null) {
      playSpin();

      spinRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - spinStartTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const newRotation = spinStartRotation + (spinTargetRotation - spinStartRotation) * eased;

        // Update local animated rotation for smooth display
        setAnimatedRotation(newRotation);

        if (progress >= 1) {
          if (spinRef.current) {
            clearInterval(spinRef.current);
            spinRef.current = null;
          }

          // Only the spinner finalizes the result
          if (isMyTurn && pendingResult) {
            const newScores = { ...playerScores };
            if (currentPlayer?.id) {
              newScores[currentPlayer.id] = (newScores[currentPlayer.id] || 0) + 1;
            }

            const nextIndex = ((gameState.currentTurnIndex || 0) + 1) % (gameState.turnOrder?.length || 1);

            updateGameState({
              ...gameState,
              isSpinning: false,
              result: pendingResult,
              rotation: spinTargetRotation,
              currentTurnIndex: nextIndex,
              spinCount: (gameState.spinCount || 0) + 1,
              playerScores: newScores,
              pendingResult: undefined,
              spinStartRotation: undefined,
              spinTargetRotation: undefined,
              spinStartTime: undefined,
            });

            playResult();
            if (pendingResult.type === 'safe') {
              fireCelebration();
            } else {
              fireSmall();
            }
          }
        }
      }, 16);
    }

    return () => {
      if (spinRef.current) {
        clearInterval(spinRef.current);
        spinRef.current = null;
      }
    };
  }, [isMultiplayer, gameState?.isSpinning, gameState?.spinStartTime]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'drink': return <Wine size={24} className="text-purple" />;
      case 'dare': return <Zap size={24} className="text-yellow-500" />;
      case 'safe': return <Shield size={24} className="text-green-500" />;
      case 'group': return <Users size={24} className="text-pink-500" />;
      default: return <Wine size={24} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'drink': return 'from-purple to-magenta';
      case 'dare': return 'from-yellow-500 to-orange-500';
      case 'safe': return 'from-green-500 to-emerald-500';
      case 'group': return 'from-pink-500 to-rose-500';
      default: return 'from-purple to-magenta';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'drink': return { text: 'DRINK', color: 'bg-purple/20 text-purple' };
      case 'dare': return { text: 'DARE', color: 'bg-yellow-500/20 text-yellow-500' };
      case 'safe': return { text: 'SAFE', color: 'bg-green-500/20 text-green-500' };
      case 'group': return { text: 'GROUP', color: 'bg-pink-500/20 text-pink-500' };
      default: return { text: 'DRINK', color: 'bg-purple/20 text-purple' };
    }
  };

  const spin = useCallback(async () => {
    if (isSpinning) return;

    if (isMultiplayer) {
      // Only the current turn player can spin (strict turn-based)
      if (!isMyTurn) return;

      const startRotation = rotation;
      const targetRotation = startRotation + 1440 + Math.random() * 720;
      const option = getRandomRouletteOption(); // Pre-determine result for sync

      // Start spinning - include target rotation and result in state for sync
      await updateGameState({
        ...gameState,
        isSpinning: true,
        result: null,
        currentSpinnerId: currentPlayer?.id,
        // Store spin params so all clients animate the same
        spinStartRotation: startRotation,
        spinTargetRotation: targetRotation,
        spinStartTime: Date.now(),
        pendingResult: option,
      });

      playSpin();
    } else {
      setLocalIsSpinning(true);
      setLocalResult(null);
      playSpin();

      let currentRotation = localRotation;
      const targetRotation = currentRotation + 1440 + Math.random() * 720;

      const spinDuration = 3000;
      const startTime = Date.now();

      spinRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const newRotation = currentRotation + (targetRotation - currentRotation) * eased;

        setLocalRotation(newRotation);

        if (progress >= 1) {
          if (spinRef.current) {
            clearInterval(spinRef.current);
          }
          setLocalIsSpinning(false);

          const option = getRandomRouletteOption();
          setLocalResult(option);
          playResult();

          if (option.type === 'safe') {
            fireCelebration();
          } else {
            fireSmall();
          }
        }
      }, 16);
    }
  }, [isSpinning, isMultiplayer, isMyTurn, isHost, rotation, gameState, currentTurnPlayer, currentPlayer, playerScores, playSpin, playResult, fireSmall, fireCelebration, localRotation]);

  const reset = async () => {
    if (isMultiplayer) {
      if (!isHost) return;
      await updateGameState({
        ...gameState,
        result: null,
      });
    } else {
      setLocalResult(null);
      setLocalRotation(0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Multiplayer Turn Indicator */}
      {isMultiplayer && currentTurnPlayer && (
        <Card variant="glass" className="p-3">
          <div className="flex items-center justify-center gap-2">
            <PlayerAvatar
              emoji={currentTurnPlayer.avatar_emoji}
              color={currentTurnPlayer.avatar_color}
              size="sm"
              isHost={currentTurnPlayer.is_host}
            />
            <span className="font-medium">
              {isMyTurn ? "Your turn to spin!" : `${currentTurnPlayer.name}'s turn`}
            </span>
          </div>
        </Card>
      )}

      {/* Multiplayer Leaderboard */}
      {isMultiplayer && leaderboardPlayers.length > 0 && (gameState?.spinCount || 0) > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Trophy size={14} className="text-gold" />
            <span>Spins</span>
          </div>
          <GameLeaderboard players={leaderboardPlayers} compact />
        </div>
      )}

      {/* Wheel */}
      <Card variant="glass" className="py-8">
        <div className="relative flex flex-col items-center">
          {/* Pointer */}
          <div className="absolute top-0 z-10">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-gold" />
          </div>

          {/* Spinning Wheel */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 0 }}
            className="w-48 h-48 rounded-full bg-gradient-conic from-purple via-magenta via-gold via-cyan via-green to-purple relative shadow-xl"
            style={{
              background: `conic-gradient(
                #8b5cf6 0deg 45deg,
                #ec4899 45deg 90deg,
                #f59e0b 90deg 135deg,
                #22c55e 135deg 180deg,
                #06b6d4 180deg 225deg,
                #8b5cf6 225deg 270deg,
                #ec4899 270deg 315deg,
                #f59e0b 315deg 360deg
              )`,
            }}
          >
            {/* Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center shadow-lg">
                {isSpinning ? (
                  <motion.span
                    animate={{ rotate: -rotation }}
                    className="text-2xl"
                  >
                    🎰
                  </motion.span>
                ) : (
                  <span className="text-2xl">🎰</span>
                )}
              </div>
            </div>

            {/* Segments - positioned around the wheel */}
            {['🍷', '🎯', '🛡️', '👥', '🍺', '⚡', '🎉', '🥂'].map((emoji, i) => {
              const angle = i * 45 + 22.5;
              const radians = (angle - 90) * (Math.PI / 180);
              const radius = 70;
              const x = Math.cos(radians) * radius;
              const y = Math.sin(radians) * radius;
              return (
                <div
                  key={i}
                  className="absolute text-xl"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  }}
                >
                  {emoji}
                </div>
              );
            })}
          </motion.div>

          {/* Spin Button */}
          <motion.button
            whileHover={isMyTurn || !isMultiplayer ? { scale: 1.05 } : {}}
            whileTap={isMyTurn || !isMultiplayer ? { scale: 0.95 } : {}}
            onClick={spin}
            disabled={isSpinning || (isMultiplayer && !isMyTurn)}
            className={`
              mt-6 px-8 py-3 rounded-full font-bold text-white
              bg-gradient-to-r from-purple to-magenta
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg shadow-purple/30
            `}
          >
            {isSpinning
              ? 'Spinning...'
              : isMultiplayer && !isMyTurn
                ? `${currentTurnPlayer?.name}'s turn`
                : 'SPIN!'}
          </motion.button>
        </div>
      </Card>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card variant="glass" className={`p-6 bg-gradient-to-br ${getTypeColor(result.type)} bg-opacity-20`}>
              <div className="text-center space-y-4">
                {/* Type Badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getTypeBadge(result.type).color}`}>
                  {getTypeBadge(result.type).text}
                </span>

                {/* Icon */}
                <div className="flex justify-center">
                  {getTypeIcon(result.type)}
                </div>

                {/* Result Text */}
                <p className="text-xl font-bold text-text-primary">
                  {result.text}
                </p>

                {/* Intensity */}
                <div className="flex justify-center gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i <= result.intensity ? 'bg-gold' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Button */}
      {result && (!isMultiplayer || isHost) && (
        <Button variant="ghost" onClick={reset} className="w-full">
          <RotateCcw size={18} className="mr-2" />
          Clear Result
        </Button>
      )}

      {/* Instructions */}
      <Card variant="glass" className="p-4">
        <h4 className="font-medium text-text-primary mb-2">How to Play:</h4>
        <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
          <li>Take turns spinning the wheel</li>
          <li>Follow the result - drink, dare, or celebrate!</li>
          <li>Group challenges affect everyone</li>
          <li>Safe means you're off the hook!</li>
        </ul>
      </Card>
    </div>
  );
}
