import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Users, ThumbsUp, Crown, Check, BarChart3 } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { getRandomWYRQuestions, type WYRQuestion } from '@/data/wouldYouRather';
import { useConfetti } from '@/hooks/useConfetti';
import { useRoom } from '@/hooks/multiplayer';
import { PlayerAvatar } from '@/components/multiplayer';
import { WYRSummary } from './WYRSummary';
import {
  analyzeChoice,
  calculatePlayerStats,
  type WYRChoice,
  type WYRPlayerStats,
} from '@/utils/wyrInsights';

interface WYRChoiceRecord {
  questionId: string;
  question: WYRQuestion;
  votes: Record<string, 'a' | 'b'>;
  majorityVote: 'a' | 'b' | null;
}

interface WYRGameState {
  questions: WYRQuestion[];
  currentIndex: number;
  votes: Record<string, 'a' | 'b'>; // playerId -> vote
  revealVotes: boolean;
  choiceHistory: WYRChoiceRecord[]; // Track all choices for summary
  showSummary: boolean;
}

export function WouldYouRather() {
  const {
    room,
    players,
    currentPlayer,
    isHost,
    updateGameState,
  } = useRoom();

  const isMultiplayer = room?.status === 'playing' && room?.game_type === 'would-you-rather';

  // Local state for solo play
  const [localQuestions, setLocalQuestions] = useState<WYRQuestion[]>(() => getRandomWYRQuestions(10));
  const [localIndex, setLocalIndex] = useState(0);
  const [localVotes, setLocalVotes] = useState<{ a: number; b: number }>({ a: 0, b: 0 });
  const [localHasVoted, setLocalHasVoted] = useState(false);
  const [localChoiceHistory, setLocalChoiceHistory] = useState<WYRChoiceRecord[]>([]);
  const [localShowSummary, setLocalShowSummary] = useState(false);
  const [localPlayerChoice, setLocalPlayerChoice] = useState<'a' | 'b' | null>(null);

  const { fireSmall, fireCelebration } = useConfetti();

  // Get game state from room or local state
  const gameState = room?.game_state as WYRGameState | undefined;

  const questions = isMultiplayer ? (gameState?.questions || []) : localQuestions;
  const currentIndex = isMultiplayer ? (gameState?.currentIndex || 0) : localIndex;
  const currentQuestion = questions[currentIndex];
  const choiceHistory = isMultiplayer ? (gameState?.choiceHistory || []) : localChoiceHistory;
  const showSummary = isMultiplayer ? (gameState?.showSummary || false) : localShowSummary;

  // Calculate votes for multiplayer
  const multiplayerVotes = gameState?.votes || {};
  const votesA = Object.values(multiplayerVotes).filter(v => v === 'a').length;
  const votesB = Object.values(multiplayerVotes).filter(v => v === 'b').length;

  // Check if current player has voted
  const hasVoted = isMultiplayer
    ? (currentPlayer?.id ? !!multiplayerVotes[currentPlayer.id] : false)
    : localHasVoted;

  // Check if all players have voted
  const connectedPlayers = players.filter(p => p.is_connected);
  const allVoted = isMultiplayer
    ? connectedPlayers.every(p => multiplayerVotes[p.id])
    : hasVoted;

  // Show votes when revealed (host triggers) or all voted
  const showVotes = isMultiplayer ? (gameState?.revealVotes || allVoted) : hasVoted;

  // Calculate percentages
  const totalVotes = isMultiplayer ? (votesA + votesB) : (localVotes.a + localVotes.b);
  const percentA = totalVotes > 0 ? Math.round(((isMultiplayer ? votesA : localVotes.a) / totalVotes) * 100) : 50;
  const percentB = totalVotes > 0 ? Math.round(((isMultiplayer ? votesB : localVotes.b) / totalVotes) * 100) : 50;

  // Calculate player stats for summary
  const playerStats = useMemo((): WYRPlayerStats | null => {
    if (!currentPlayer) return null;

    const choices: WYRChoice[] = choiceHistory.map(record => {
      const playerVote = record.votes[currentPlayer.id];
      if (!playerVote) return null;

      const analysis = analyzeChoice(
        record.question,
        playerVote,
        record.majorityVote || undefined
      );

      return {
        ...analysis,
        questionId: record.questionId,
        question: record.question,
        chose: playerVote,
        optionChosen: playerVote === 'a' ? record.question.optionA : record.question.optionB,
      };
    }).filter((c): c is WYRChoice => c !== null);

    return calculatePlayerStats(
      currentPlayer.id,
      currentPlayer.name,
      currentPlayer.avatar_emoji,
      currentPlayer.avatar_color,
      choices
    );
  }, [choiceHistory, currentPlayer]);

  // Calculate all players stats for comparison
  const allPlayersStats = useMemo((): WYRPlayerStats[] => {
    if (!isMultiplayer) return [];

    return connectedPlayers.map(player => {
      const choices: WYRChoice[] = choiceHistory.map(record => {
        const playerVote = record.votes[player.id];
        if (!playerVote) return null;

        const analysis = analyzeChoice(
          record.question,
          playerVote,
          record.majorityVote || undefined
        );

        return {
          ...analysis,
          questionId: record.questionId,
          question: record.question,
          chose: playerVote,
          optionChosen: playerVote === 'a' ? record.question.optionA : record.question.optionB,
        };
      }).filter((c): c is WYRChoice => c !== null);

      return calculatePlayerStats(
        player.id,
        player.name,
        player.avatar_emoji,
        player.avatar_color,
        choices
      );
    });
  }, [isMultiplayer, choiceHistory, connectedPlayers]);

  // Initialize game state when host starts (only once)
  useEffect(() => {
    if (isMultiplayer && isHost && !gameState?.questions?.length) {
      const newQuestions = getRandomWYRQuestions(10);
      updateGameState({
        questions: newQuestions,
        currentIndex: 0,
        votes: {},
        revealVotes: false,
        choiceHistory: [],
        showSummary: false,
      });
    }
  }, [isMultiplayer, isHost, gameState?.questions?.length]);

  const handleVote = async (option: 'a' | 'b') => {
    if (hasVoted) return;

    if (isMultiplayer && currentPlayer) {
      // Multiplayer vote - update game state
      const newVotes = {
        ...multiplayerVotes,
        [currentPlayer.id]: option,
      };
      await updateGameState({
        ...gameState,
        votes: newVotes,
      });
    } else {
      // Local vote
      setLocalVotes((prev) => ({
        ...prev,
        [option]: prev[option] + 1,
      }));
      setLocalHasVoted(true);
      setLocalPlayerChoice(option);
    }
    fireSmall();
  };

  const handleNext = useCallback(async () => {
    const isLastQuestion = currentIndex >= questions.length - 1;

    if (isMultiplayer) {
      // Only host can advance in multiplayer
      if (!isHost) return;

      // Determine majority vote
      const majorityVote = votesA > votesB ? 'a' : votesB > votesA ? 'b' : null;

      // Record this question's choices
      const newHistoryRecord: WYRChoiceRecord = {
        questionId: currentQuestion.id,
        question: currentQuestion,
        votes: { ...multiplayerVotes },
        majorityVote,
      };

      const newHistory = [...choiceHistory, newHistoryRecord];

      if (isLastQuestion) {
        // Show summary after 10 questions
        fireCelebration();
        await updateGameState({
          ...gameState,
          choiceHistory: newHistory,
          showSummary: true,
        });
      } else {
        await updateGameState({
          ...gameState,
          currentIndex: currentIndex + 1,
          votes: {},
          revealVotes: false,
          choiceHistory: newHistory,
        });
      }
    } else {
      // Local next
      const majorityVote = localVotes.a > localVotes.b ? 'a' : localVotes.b > localVotes.a ? 'b' : null;

      const newHistoryRecord: WYRChoiceRecord = {
        questionId: currentQuestion.id,
        question: currentQuestion,
        votes: localPlayerChoice ? { 'local': localPlayerChoice } : {},
        majorityVote,
      };

      setLocalChoiceHistory(prev => [...prev, newHistoryRecord]);

      if (isLastQuestion) {
        fireCelebration();
        setLocalShowSummary(true);
      } else {
        setLocalIndex((prev) => prev + 1);
        setLocalVotes({ a: 0, b: 0 });
        setLocalHasVoted(false);
        setLocalPlayerChoice(null);
      }
    }
  }, [isMultiplayer, isHost, currentIndex, questions.length, gameState, currentQuestion, multiplayerVotes, votesA, votesB, choiceHistory, localVotes, localPlayerChoice, fireCelebration]);

  const handleRevealVotes = async () => {
    if (!isMultiplayer || !isHost) return;
    await updateGameState({
      ...gameState,
      revealVotes: true,
    });
  };

  const handlePlayAgain = async () => {
    if (isMultiplayer) {
      if (!isHost) return;

      const newQuestions = getRandomWYRQuestions(10);
      await updateGameState({
        questions: newQuestions,
        currentIndex: 0,
        votes: {},
        revealVotes: false,
        choiceHistory: [],
        showSummary: false,
      });
    } else {
      setLocalQuestions(getRandomWYRQuestions(10));
      setLocalIndex(0);
      setLocalVotes({ a: 0, b: 0 });
      setLocalHasVoted(false);
      setLocalChoiceHistory([]);
      setLocalShowSummary(false);
      setLocalPlayerChoice(null);
    }
  };

  const handleCloseSummary = async () => {
    if (isMultiplayer) {
      if (!isHost) return;
      await updateGameState({
        ...gameState,
        showSummary: false,
      });
    } else {
      setLocalShowSummary(false);
    }
  };

  // Get players who voted for each option
  const playersVotedA = isMultiplayer
    ? players.filter(p => multiplayerVotes[p.id] === 'a')
    : [];
  const playersVotedB = isMultiplayer
    ? players.filter(p => multiplayerVotes[p.id] === 'b')
    : [];

  // Show summary modal
  if (showSummary && playerStats) {
    return (
      <WYRSummary
        playerStats={playerStats}
        allPlayersStats={allPlayersStats}
        onPlayAgain={handlePlayAgain}
        onClose={handleCloseSummary}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <Card variant="glass" className="p-8 text-center">
        <p className="text-text-secondary">Loading questions...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-purple" />
          <span className="text-sm text-text-secondary">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isMultiplayer && (
            <span className="text-xs px-2 py-1 rounded-full bg-purple/20 text-purple-light">
              {Object.keys(multiplayerVotes).length}/{connectedPlayers.length} voted
            </span>
          )}
          <span className="text-xs px-2 py-1 rounded-full bg-surface-elevated text-text-muted capitalize">
            {currentQuestion.category}
          </span>
        </div>
      </div>

      {/* Multiplayer Players Status */}
      {isMultiplayer && (
        <div className="flex flex-wrap gap-2 justify-center">
          {connectedPlayers.map((player) => {
            const playerVoted = !!multiplayerVotes[player.id];
            return (
              <div
                key={player.id}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
                  playerVoted
                    ? 'bg-green-500/20 text-green-400'
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
                {playerVoted && <Check size={12} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Question */}
      <Card variant="glass" className="text-center py-4">
        <h3 className="text-lg font-bold text-gold mb-1">Would You Rather...</h3>
      </Card>

      {/* Options */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Option A */}
            <motion.button
              whileHover={{ scale: hasVoted ? 1 : 1.02 }}
              whileTap={{ scale: hasVoted ? 1 : 0.98 }}
              onClick={() => handleVote('a')}
              disabled={hasVoted}
              className={`
                w-full p-6 rounded-2xl text-left transition-all relative overflow-hidden
                ${hasVoted ? 'cursor-default' : 'cursor-pointer'}
                ${showVotes ? 'bg-cyan/20 border-2 border-cyan' : 'bg-gradient-to-r from-cyan/30 to-cyan/10 hover:from-cyan/40 hover:to-cyan/20'}
              `}
            >
              {showVotes && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentA}%` }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-y-0 left-0 bg-cyan/30"
                />
              )}
              <div className="relative z-10 flex items-start gap-3">
                <span className="text-2xl font-bold text-cyan">A</span>
                <div className="flex-1">
                  <p className="text-text-primary font-medium">{currentQuestion.optionA}</p>
                  {showVotes && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <p className="text-sm text-cyan mt-2 font-bold">
                        {percentA}% ({isMultiplayer ? votesA : localVotes.a} vote{(isMultiplayer ? votesA : localVotes.a) !== 1 ? 's' : ''})
                      </p>
                      {isMultiplayer && playersVotedA.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {playersVotedA.map(p => (
                            <span key={p.id} className="text-xs bg-cyan/20 px-2 py-0.5 rounded-full">
                              {p.avatar_emoji} {p.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
                {showVotes && (isMultiplayer ? votesA > votesB : localVotes.a > localVotes.b) && (
                  <ThumbsUp size={20} className="text-cyan" />
                )}
              </div>
            </motion.button>

            {/* VS Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-lg font-bold text-gold">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Option B */}
            <motion.button
              whileHover={{ scale: hasVoted ? 1 : 1.02 }}
              whileTap={{ scale: hasVoted ? 1 : 0.98 }}
              onClick={() => handleVote('b')}
              disabled={hasVoted}
              className={`
                w-full p-6 rounded-2xl text-left transition-all relative overflow-hidden
                ${hasVoted ? 'cursor-default' : 'cursor-pointer'}
                ${showVotes ? 'bg-magenta/20 border-2 border-magenta' : 'bg-gradient-to-r from-magenta/30 to-magenta/10 hover:from-magenta/40 hover:to-magenta/20'}
              `}
            >
              {showVotes && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentB}%` }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-y-0 left-0 bg-magenta/30"
                />
              )}
              <div className="relative z-10 flex items-start gap-3">
                <span className="text-2xl font-bold text-magenta">B</span>
                <div className="flex-1">
                  <p className="text-text-primary font-medium">{currentQuestion.optionB}</p>
                  {showVotes && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <p className="text-sm text-magenta mt-2 font-bold">
                        {percentB}% ({isMultiplayer ? votesB : localVotes.b} vote{(isMultiplayer ? votesB : localVotes.b) !== 1 ? 's' : ''})
                      </p>
                      {isMultiplayer && playersVotedB.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {playersVotedB.map(p => (
                            <span key={p.id} className="text-xs bg-magenta/20 px-2 py-0.5 rounded-full">
                              {p.avatar_emoji} {p.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
                {showVotes && (isMultiplayer ? votesB > votesA : localVotes.b > localVotes.a) && (
                  <ThumbsUp size={20} className="text-magenta" />
                )}
              </div>
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      {isMultiplayer ? (
        <div className="space-y-3">
          {/* Host: Reveal votes button if not all voted yet */}
          {isHost && hasVoted && !allVoted && !showVotes && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button variant="secondary" onClick={handleRevealVotes} className="w-full">
                <Crown size={18} className="mr-2" />
                Reveal Votes Early
              </Button>
            </motion.div>
          )}

          {/* Host: Next question button */}
          {isHost && showVotes && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button variant="primary" onClick={handleNext} className="w-full">
                {currentIndex < questions.length - 1 ? (
                  <>
                    <RefreshCw size={18} className="mr-2" />
                    Next Question
                  </>
                ) : (
                  <>
                    <BarChart3 size={18} className="mr-2" />
                    View Results
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Non-host waiting message */}
          {!isHost && showVotes && (
            <Card variant="glass" className="p-3 text-center">
              <p className="text-sm text-text-muted">Waiting for host to continue...</p>
            </Card>
          )}

          {/* Waiting for votes message */}
          {hasVoted && !showVotes && (
            <Card variant="glass" className="p-3 text-center">
              <p className="text-sm text-text-muted">
                Waiting for others to vote... ({Object.keys(multiplayerVotes).length}/{connectedPlayers.length})
              </p>
            </Card>
          )}
        </div>
      ) : (
        // Local mode: Show next button after voting
        hasVoted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button variant="primary" onClick={handleNext} className="w-full">
              {currentIndex < questions.length - 1 ? (
                <>
                  <RefreshCw size={18} className="mr-2" />
                  Next Question
                </>
              ) : (
                <>
                  <BarChart3 size={18} className="mr-2" />
                  View Results
                </>
              )}
            </Button>
          </motion.div>
        )
      )}

      {/* Instructions */}
      <p className="text-xs text-center text-text-muted">
        {isMultiplayer
          ? "Vote on your choice, then see what everyone picked!"
          : "Everyone votes, then discuss your choices!"
        }
      </p>
    </div>
  );
}
