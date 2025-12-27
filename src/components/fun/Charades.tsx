import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, SkipForward, Check, RotateCcw, Clock, Award, Users, Trophy, Eye, EyeOff } from 'lucide-react';
import { Card, Button, Modal } from '@/components/ui';
import {
  getRandomWord,
  CHARADES_CATEGORIES,
  type CharadesCategory,
  type CharadesWord,
} from '@/data/charades';
import { useConfetti } from '@/hooks/useConfetti';
import { useRoom } from '@/hooks/multiplayer';
import { PlayerAvatar, GameLeaderboard, type LeaderboardPlayer } from '@/components/multiplayer';
import useSound from 'use-sound';

const TICK_SOUND = 'https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3';
const SUCCESS_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3';

const ROUND_TIME = 60; // seconds

interface CharadesGameState {
  category: CharadesCategory;
  actorId: string | null;
  currentWord: CharadesWord | null;
  roundStartTime: number | null;
  timeLeft: number;
  score: number;
  skipped: number;
  isPlaying: boolean;
  roundComplete: boolean;
  turnOrder: string[];
  currentTurnIndex: number;
  playerScores: Record<string, { correct: number; skipped: number; totalActed: number }>;
  roundsCompleted: number;
}

export function Charades() {
  const {
    room,
    players: roomPlayers,
    currentPlayer,
    isHost,
    updateGameState,
  } = useRoom();

  const isMultiplayer = room?.status === 'playing' && room?.game_type === 'charades';

  // Local state for solo play
  const [localCategory, setLocalCategory] = useState<CharadesCategory>('nye');
  const [localCurrentWord, setLocalCurrentWord] = useState<CharadesWord | null>(null);
  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const [localTimeLeft, setLocalTimeLeft] = useState(ROUND_TIME);
  const [localScore, setLocalScore] = useState(0);
  const [localSkipped, setLocalSkipped] = useState(0);
  const [localRoundComplete, setLocalRoundComplete] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { fireSmall, fireCelebration } = useConfetti();

  const [playTick] = useSound(TICK_SOUND, { volume: 0.2 });
  const [playSuccess] = useSound(SUCCESS_SOUND, { volume: 0.4 });

  // Get game state
  const gameState = room?.game_state as CharadesGameState | undefined;
  const connectedPlayers = roomPlayers.filter(p => p.is_connected);

  // Derived state
  const category = isMultiplayer ? (gameState?.category || 'nye') : localCategory;
  const currentWord = isMultiplayer ? gameState?.currentWord : localCurrentWord;
  const isPlaying = isMultiplayer ? (gameState?.isPlaying || false) : localIsPlaying;
  const timeLeft = isMultiplayer ? (gameState?.timeLeft ?? ROUND_TIME) : localTimeLeft;
  const score = isMultiplayer ? (gameState?.score || 0) : localScore;
  const skipped = isMultiplayer ? (gameState?.skipped || 0) : localSkipped;
  const roundComplete = isMultiplayer ? (gameState?.roundComplete || false) : localRoundComplete;
  const playerScores = gameState?.playerScores || {};

  // Current actor
  const currentActor = isMultiplayer && gameState?.actorId
    ? connectedPlayers.find(p => p.id === gameState.actorId)
    : null;

  const isActor = isMultiplayer
    ? currentPlayer?.id === gameState?.actorId
    : true; // Solo player is always the actor

  // Leaderboard data
  const leaderboardPlayers = useMemo((): LeaderboardPlayer[] => {
    if (!isMultiplayer) return [];

    return connectedPlayers.map(player => {
      const stats = playerScores[player.id] || { correct: 0, skipped: 0, totalActed: 0 };
      return {
        playerId: player.id,
        playerName: player.name,
        avatarEmoji: player.avatar_emoji,
        avatarColor: player.avatar_color,
        score: stats.correct,
        isCurrentPlayer: player.id === currentPlayer?.id,
        stats: {
          acted: stats.totalActed,
          skipped: stats.skipped,
        },
      };
    });
  }, [isMultiplayer, connectedPlayers, playerScores, currentPlayer?.id]);

  // Initialize game for multiplayer
  useEffect(() => {
    if (isMultiplayer && isHost && !gameState?.turnOrder?.length) {
      const shuffled = [...connectedPlayers].sort(() => Math.random() - 0.5);
      updateGameState({
        category: 'nye',
        actorId: null,
        currentWord: null,
        roundStartTime: null,
        timeLeft: ROUND_TIME,
        score: 0,
        skipped: 0,
        isPlaying: false,
        roundComplete: false,
        turnOrder: shuffled.map(p => p.id),
        currentTurnIndex: 0,
        playerScores: {},
        roundsCompleted: 0,
      });
    }
  }, [isMultiplayer, isHost, gameState?.turnOrder?.length, connectedPlayers]);

  // Timer countdown for multiplayer (host runs the timer)
  useEffect(() => {
    if (!isMultiplayer) return;
    if (!isHost) return;
    if (!isPlaying) return;

    if (timeLeft <= 0) {
      handleEndRound();
      return;
    }

    timerRef.current = setInterval(async () => {
      const newTimeLeft = timeLeft - 1;
      await updateGameState({
        ...gameState,
        timeLeft: newTimeLeft,
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isMultiplayer, isHost, isPlaying, timeLeft]);

  // Play tick sound for last 10 seconds
  useEffect(() => {
    if (isPlaying && timeLeft <= 10 && timeLeft > 0) {
      playTick();
    }
  }, [isPlaying, timeLeft, playTick]);

  // Local timer for solo play
  useEffect(() => {
    if (isMultiplayer) return;
    if (!localIsPlaying) return;

    if (localTimeLeft <= 0) {
      endLocalRound();
      return;
    }

    timerRef.current = setInterval(() => {
      setLocalTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isMultiplayer, localIsPlaying, localTimeLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const getNewWord = useCallback(() => {
    return getRandomWord(category);
  }, [category]);

  const handleCategoryChange = async (newCategory: CharadesCategory) => {
    if (isMultiplayer) {
      if (!isHost) return;
      await updateGameState({
        ...gameState,
        category: newCategory,
      });
    } else {
      setLocalCategory(newCategory);
    }
  };

  const startRound = useCallback(async () => {
    const word = getNewWord();

    if (isMultiplayer) {
      if (!isHost) return;

      // Get current actor from turn order
      const actorId = gameState?.turnOrder?.[gameState?.currentTurnIndex || 0];

      await updateGameState({
        ...gameState,
        actorId,
        currentWord: word,
        roundStartTime: Date.now(),
        timeLeft: ROUND_TIME,
        score: 0,
        skipped: 0,
        isPlaying: true,
        roundComplete: false,
      });
    } else {
      setLocalIsPlaying(true);
      setLocalTimeLeft(ROUND_TIME);
      setLocalScore(0);
      setLocalSkipped(0);
      setLocalRoundComplete(false);
      setLocalCurrentWord(word);
    }
  }, [isMultiplayer, isHost, gameState, getNewWord]);

  const handleEndRound = useCallback(async () => {
    if (!isMultiplayer) return;
    if (!isHost) return;

    const actorId = gameState?.actorId;
    const newScores = { ...playerScores };

    if (actorId) {
      if (!newScores[actorId]) {
        newScores[actorId] = { correct: 0, skipped: 0, totalActed: 0 };
      }
      newScores[actorId].correct += score;
      newScores[actorId].skipped += skipped;
      newScores[actorId].totalActed += 1;
    }

    await updateGameState({
      ...gameState,
      isPlaying: false,
      roundComplete: true,
      playerScores: newScores,
      roundsCompleted: (gameState?.roundsCompleted || 0) + 1,
    });

    if (score > 0) {
      fireCelebration();
    }
  }, [isMultiplayer, isHost, gameState, playerScores, score, skipped, fireCelebration]);

  const endLocalRound = useCallback(() => {
    setLocalIsPlaying(false);
    setLocalRoundComplete(true);
    if (localScore > 0) {
      fireCelebration();
    }
  }, [localScore, fireCelebration]);

  const handleCorrect = async () => {
    const newWord = getNewWord();
    playSuccess();
    fireSmall();

    if (isMultiplayer) {
      if (!isActor && !isHost) return;
      await updateGameState({
        ...gameState,
        score: score + 1,
        currentWord: newWord,
      });
    } else {
      setLocalScore((prev) => prev + 1);
      setLocalCurrentWord(newWord);
    }
  };

  const handleSkip = async () => {
    const newWord = getNewWord();

    if (isMultiplayer) {
      if (!isActor && !isHost) return;
      await updateGameState({
        ...gameState,
        skipped: skipped + 1,
        currentWord: newWord,
      });
    } else {
      setLocalSkipped((prev) => prev + 1);
      setLocalCurrentWord(newWord);
    }
  };

  const handleNextActor = async () => {
    if (!isMultiplayer || !isHost) return;

    const nextIndex = ((gameState?.currentTurnIndex || 0) + 1) % (gameState?.turnOrder?.length || 1);

    await updateGameState({
      ...gameState,
      roundComplete: false,
      currentTurnIndex: nextIndex,
      actorId: null,
      currentWord: null,
      isPlaying: false,
      score: 0,
      skipped: 0,
      timeLeft: ROUND_TIME,
    });
  };

  const resetGame = async () => {
    if (isMultiplayer) {
      if (!isHost) return;

      const shuffled = [...connectedPlayers].sort(() => Math.random() - 0.5);
      await updateGameState({
        category: gameState?.category || 'nye',
        actorId: null,
        currentWord: null,
        roundStartTime: null,
        timeLeft: ROUND_TIME,
        score: 0,
        skipped: 0,
        isPlaying: false,
        roundComplete: false,
        turnOrder: shuffled.map(p => p.id),
        currentTurnIndex: 0,
        playerScores: {},
        roundsCompleted: 0,
      });
    } else {
      setLocalRoundComplete(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Multiplayer Players Status */}
      {isMultiplayer && !isPlaying && !roundComplete && (
        <div className="flex flex-wrap gap-2 justify-center">
          {connectedPlayers.map((player) => {
            const isNextActor = player.id === gameState?.turnOrder?.[gameState?.currentTurnIndex || 0];
            const stats = playerScores[player.id];
            return (
              <div
                key={player.id}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
                  isNextActor
                    ? 'bg-purple/20 text-purple-light ring-2 ring-purple'
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
                {stats && <span className="text-gold">({stats.correct})</span>}
                {isNextActor && <span className="text-purple">🎭</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Multiplayer Leaderboard */}
      {isMultiplayer && leaderboardPlayers.length > 0 && (gameState?.roundsCompleted || 0) > 0 && !isPlaying && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Trophy size={14} className="text-gold" />
            <span>Scores</span>
          </div>
          <GameLeaderboard
            players={leaderboardPlayers}
            compact
            statLabels={{ acted: 'rounds', skipped: 'skipped' }}
          />
        </div>
      )}

      {/* Category Selector */}
      {!isPlaying && !roundComplete && (
        <Card variant="glass" className="p-4">
          <p className="text-sm text-text-secondary mb-3">
            {isMultiplayer && !isHost ? 'Category:' : 'Select Category:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {CHARADES_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                disabled={isMultiplayer && !isHost}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl
                  text-sm font-medium transition-all
                  ${category === cat.id
                    ? 'bg-purple text-white'
                    : 'bg-surface-elevated text-text-secondary hover:text-text-primary'}
                  ${isMultiplayer && !isHost ? 'cursor-default opacity-75' : ''}
                `}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Actor Indicator for Multiplayer */}
      {isMultiplayer && !isPlaying && !roundComplete && (
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-center gap-3">
            {gameState?.turnOrder?.[gameState?.currentTurnIndex || 0] && (
              <>
                <PlayerAvatar
                  emoji={connectedPlayers.find(p => p.id === gameState.turnOrder[gameState.currentTurnIndex || 0])?.avatar_emoji || '😀'}
                  color={connectedPlayers.find(p => p.id === gameState.turnOrder[gameState.currentTurnIndex || 0])?.avatar_color || '#8B5CF6'}
                  size="md"
                />
                <div className="text-center">
                  <p className="text-sm text-text-muted">Next Actor</p>
                  <p className="font-bold text-text-primary">
                    {currentPlayer?.id === gameState.turnOrder[gameState.currentTurnIndex || 0]
                      ? "It's your turn!"
                      : connectedPlayers.find(p => p.id === gameState.turnOrder[gameState.currentTurnIndex || 0])?.name}
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Game Area */}
      <Card variant="glass" className="text-center py-8">
        <AnimatePresence mode="wait">
          {!isPlaying && !roundComplete ? (
            // Ready State
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-6xl mb-4">
                {CHARADES_CATEGORIES.find((c) => c.id === category)?.emoji}
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  {CHARADES_CATEGORIES.find((c) => c.id === category)?.name} Charades
                </h3>
                <p className="text-text-secondary text-sm">
                  {isMultiplayer
                    ? isActor || currentPlayer?.id === gameState?.turnOrder?.[gameState?.currentTurnIndex || 0]
                      ? "You're the actor - act out words for others to guess!"
                      : `Watch ${connectedPlayers.find(p => p.id === gameState?.turnOrder?.[gameState?.currentTurnIndex || 0])?.name} act and guess the word!`
                    : 'Act out the word without speaking!'}
                </p>
              </div>
              {(!isMultiplayer || isHost) && (
                <Button variant="primary" onClick={startRound} className="px-8">
                  <Play size={20} className="mr-2" />
                  Start Round
                </Button>
              )}
              {isMultiplayer && !isHost && (
                <p className="text-sm text-text-muted">Waiting for host to start...</p>
              )}
            </motion.div>
          ) : isPlaying && currentWord ? (
            // Playing State
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-6"
            >
              {/* Timer */}
              <div className={`
                flex items-center justify-center gap-2 text-3xl font-bold
                ${timeLeft <= 10 ? 'text-red-500' : 'text-gold'}
              `}>
                <Clock size={28} />
                <motion.span
                  key={timeLeft}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  {formatTime(timeLeft)}
                </motion.span>
              </div>

              {/* Actor indicator */}
              {isMultiplayer && currentActor && (
                <div className="flex items-center justify-center gap-2">
                  <PlayerAvatar
                    emoji={currentActor.avatar_emoji}
                    color={currentActor.avatar_color}
                    size="sm"
                  />
                  <span className="text-sm font-medium">
                    {isActor ? "You're acting!" : `${currentActor.name} is acting`}
                  </span>
                </div>
              )}

              {/* Score */}
              <div className="flex justify-center gap-4 text-sm">
                <span className="text-green-500">
                  <Check size={16} className="inline mr-1" />
                  {score} correct
                </span>
                <span className="text-text-muted">
                  <SkipForward size={16} className="inline mr-1" />
                  {skipped} skipped
                </span>
              </div>

              {/* Word Display - ONLY FOR ACTOR */}
              {isActor ? (
                <motion.div
                  key={currentWord.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="p-8 rounded-2xl bg-gradient-to-br from-purple/20 to-magenta/20 border-2 border-purple"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Eye size={16} className="text-purple" />
                    <p className="text-sm text-text-muted">ACT OUT:</p>
                  </div>
                  <h2 className="text-3xl font-bold text-text-primary">
                    {currentWord.word}
                  </h2>
                  <p className="text-xs text-text-muted mt-2 capitalize">
                    {currentWord.difficulty}
                  </p>
                </motion.div>
              ) : (
                // Guesser view - word is hidden!
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="p-8 rounded-2xl bg-gradient-to-br from-surface-elevated to-surface border-2 border-border"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <EyeOff size={16} className="text-text-muted" />
                    <p className="text-sm text-text-muted">WORD HIDDEN</p>
                  </div>
                  <h2 className="text-2xl font-bold text-text-secondary">
                    Guess what {currentActor?.name} is acting!
                  </h2>
                  <p className="text-sm text-text-muted mt-4 flex items-center justify-center gap-2">
                    <Users size={16} />
                    Shout your guesses out loud!
                  </p>
                </motion.div>
              )}

              {/* Action Buttons - Only for actor (or host) */}
              {(isActor || (isMultiplayer && isHost)) && (
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="secondary"
                    onClick={handleSkip}
                    className="px-6 bg-surface-elevated"
                  >
                    <SkipForward size={18} className="mr-2" />
                    Skip
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCorrect}
                    className="px-6 bg-green-600 hover:bg-green-700"
                  >
                    <Check size={18} className="mr-2" />
                    Correct!
                  </Button>
                </div>
              )}

              {/* Guesser message */}
              {isMultiplayer && !isActor && !isHost && (
                <p className="text-sm text-text-muted">
                  The actor will mark when you guess correctly!
                </p>
              )}
            </motion.div>
          ) : (
            // Round Complete
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </Card>

      {/* Instructions */}
      {!isPlaying && !roundComplete && (
        <Card variant="glass" className="p-4">
          <h4 className="font-medium text-text-primary mb-2">How to Play:</h4>
          <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
            {isMultiplayer ? (
              <>
                <li>The actor sees the word - others don't!</li>
                <li>Actor: Act out the word without speaking</li>
                <li>Guessers: Shout your guesses!</li>
                <li>Actor taps "Correct" when someone gets it</li>
                <li>Get as many as possible in 60 seconds!</li>
              </>
            ) : (
              <>
                <li>Hold the phone so only YOU can see the word</li>
                <li>Act out the word - no speaking or pointing!</li>
                <li>Others guess - tap "Correct" when they get it</li>
                <li>Tap "Skip" if it's too hard (no penalty)</li>
                <li>Get as many as possible in 60 seconds!</li>
              </>
            )}
          </ol>
        </Card>
      )}

      {/* Round Complete Modal */}
      <Modal isOpen={roundComplete} onClose={resetGame}>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center">
            <Award size={40} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary">Round Over!</h3>

          {/* Actor info for multiplayer */}
          {isMultiplayer && currentActor && (
            <div className="flex items-center justify-center gap-2">
              <PlayerAvatar
                emoji={currentActor.avatar_emoji}
                color={currentActor.avatar_color}
                size="sm"
              />
              <span className="text-text-secondary">
                {isActor ? 'Your round' : `${currentActor.name}'s round`}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{score}</p>
              <p className="text-sm text-text-muted">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-text-muted">{skipped}</p>
              <p className="text-sm text-text-muted">Skipped</p>
            </div>
          </div>

          {isMultiplayer ? (
            isHost ? (
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={resetGame}
                  className="flex-1"
                >
                  End Game
                </Button>
                <Button variant="primary" onClick={handleNextActor} className="flex-1">
                  <RotateCcw size={18} className="mr-2" />
                  Next Actor
                </Button>
              </div>
            ) : (
              <p className="text-sm text-text-muted">Waiting for host...</p>
            )
          ) : (
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setLocalRoundComplete(false)}
                className="flex-1"
              >
                Done
              </Button>
              <Button variant="primary" onClick={startRound} className="flex-1">
                <RotateCcw size={18} className="mr-2" />
                Play Again
              </Button>
            </div>
          )}
        </motion.div>
      </Modal>
    </div>
  );
}
