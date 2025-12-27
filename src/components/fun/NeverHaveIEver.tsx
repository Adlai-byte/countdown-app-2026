import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Wine, Sparkles, Check, X, Crown, Trophy } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { getRandomNeverHaveIEver, type NeverHaveIEverItem } from '@/data/drinkingGames';
import { useConfetti } from '@/hooks/useConfetti';
import { useRoom } from '@/hooks/multiplayer';
import { PlayerAvatar, GameLeaderboard, type LeaderboardPlayer } from '@/components/multiplayer';

type Category = 'mild' | 'medium' | 'spicy' | 'all';

interface NHIEGameState {
  category: Category;
  currentItem: NeverHaveIEverItem | null;
  usedItemIds: string[];
  responses: Record<string, boolean>; // playerId -> true (I have) / false (Never have I)
  revealResponses: boolean;
  roundsPlayed: number;
  playerScores: Record<string, number>; // Track "I have" count per player
}

export function NeverHaveIEver() {
  const {
    room,
    players,
    currentPlayer,
    isHost,
    updateGameState,
  } = useRoom();

  const isMultiplayer = room?.status === 'playing' && room?.game_type === 'never-have-i-ever';

  // Local state for solo play
  const [localCategory, setLocalCategory] = useState<Category>('all');
  const [localCurrentItem, setLocalCurrentItem] = useState<NeverHaveIEverItem | null>(null);

  const { fireSmall } = useConfetti();

  // Get game state
  const gameState = room?.game_state as NHIEGameState | undefined;
  const category = isMultiplayer ? (gameState?.category || 'all') : localCategory;
  const currentItem = isMultiplayer ? gameState?.currentItem : localCurrentItem;
  const responses = gameState?.responses || {};
  const revealResponses = gameState?.revealResponses || false;
  const playerScores = gameState?.playerScores || {};

  // Connected players
  const connectedPlayers = players.filter(p => p.is_connected);

  // Check if current player has responded
  const hasResponded = isMultiplayer
    ? (currentPlayer?.id ? responses[currentPlayer.id] !== undefined : false)
    : false;

  // Check if all players have responded
  const allResponded = isMultiplayer
    ? connectedPlayers.every(p => responses[p.id] !== undefined)
    : false;

  // Show responses when revealed or all responded
  const showResponses = isMultiplayer ? (revealResponses || allResponded) : false;

  // Calculate counts
  const iHaveCount = Object.values(responses).filter(r => r === true).length;
  const neverCount = Object.values(responses).filter(r => r === false).length;

  // Get players who have done it (must drink)
  const playersWhoHave = isMultiplayer
    ? players.filter(p => responses[p.id] === true)
    : [];

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
      stats: {
        drinks: playerScores[player.id] || 0,
      },
    }));
  }, [isMultiplayer, connectedPlayers, playerScores, currentPlayer?.id]);

  const categories: { id: Category; name: string; emoji: string; color: string }[] = [
    { id: 'all', name: 'All', emoji: '🎲', color: 'bg-purple' },
    { id: 'mild', name: 'Mild', emoji: '😇', color: 'bg-green-500' },
    { id: 'medium', name: 'Medium', emoji: '😏', color: 'bg-yellow-500' },
    { id: 'spicy', name: 'Spicy', emoji: '🔥', color: 'bg-red-500' },
  ];

  // Initialize game for multiplayer
  useEffect(() => {
    if (isMultiplayer && isHost && !gameState?.currentItem) {
      updateGameState({
        category: 'all',
        currentItem: null,
        usedItemIds: [],
        responses: {},
        revealResponses: false,
        roundsPlayed: 0,
        playerScores: {},
      });
    }
  }, [isMultiplayer, isHost, gameState?.currentItem]);

  const handleCategoryChange = async (newCategory: Category) => {
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

  const getNext = useCallback(async () => {
    const cat = category === 'all' ? undefined : category;
    const newItem = getRandomNeverHaveIEver(cat);

    if (isMultiplayer) {
      if (!isHost) return;

      // Update scores from previous round
      const newScores = { ...playerScores };
      Object.entries(responses).forEach(([playerId, response]) => {
        if (response === true) {
          newScores[playerId] = (newScores[playerId] || 0) + 1;
        }
      });

      await updateGameState({
        ...gameState,
        currentItem: newItem,
        usedItemIds: [...(gameState?.usedItemIds || []), newItem.id],
        responses: {},
        revealResponses: false,
        roundsPlayed: (gameState?.roundsPlayed || 0) + 1,
        playerScores: newScores,
      });
    } else {
      setLocalCurrentItem(newItem);
    }
    fireSmall();
  }, [category, isMultiplayer, isHost, gameState, playerScores, responses, fireSmall]);

  const handleResponse = async (response: boolean) => {
    if (!isMultiplayer || !currentPlayer || hasResponded) return;

    const newResponses = {
      ...responses,
      [currentPlayer.id]: response,
    };

    await updateGameState({
      ...gameState,
      responses: newResponses,
    });

    if (response) {
      fireSmall();
    }
  };

  const handleRevealResponses = async () => {
    if (!isMultiplayer || !isHost) return;
    await updateGameState({
      ...gameState,
      revealResponses: true,
    });
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'mild': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'spicy': return 'text-red-500';
      default: return 'text-purple';
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Selector */}
      <Card variant="glass" className="p-4">
        <p className="text-sm text-text-secondary mb-3">
          {isMultiplayer && !isHost ? 'Intensity:' : 'Select Intensity:'}
        </p>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              disabled={isMultiplayer && !isHost}
              className={`
                flex-1 flex flex-col items-center gap-1 py-2 rounded-xl
                text-sm transition-all
                ${category === cat.id
                  ? `${cat.color} text-white`
                  : 'bg-surface-elevated text-text-secondary hover:text-text-primary'}
                ${isMultiplayer && !isHost ? 'cursor-default opacity-75' : ''}
              `}
            >
              <span>{cat.emoji}</span>
              <span className="text-xs">{cat.name}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Multiplayer Leaderboard */}
      {isMultiplayer && leaderboardPlayers.length > 0 && (gameState?.roundsPlayed || 0) > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Trophy size={14} className="text-gold" />
            <span>Most Drinks</span>
          </div>
          <GameLeaderboard
            players={leaderboardPlayers}
            compact
            statLabels={{ drinks: 'drinks' }}
          />
        </div>
      )}

      {/* Player Status (Multiplayer) */}
      {isMultiplayer && currentItem && (
        <div className="flex flex-wrap gap-2 justify-center">
          {connectedPlayers.map((player) => {
            const playerResponse = responses[player.id];
            const hasAnswered = playerResponse !== undefined;
            return (
              <div
                key={player.id}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
                  hasAnswered
                    ? showResponses
                      ? playerResponse
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                      : 'bg-purple/20 text-purple-light'
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
                {hasAnswered && (
                  showResponses ? (
                    playerResponse ? <Wine size={12} /> : <Check size={12} />
                  ) : (
                    <Check size={12} />
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Main Card */}
      <Card variant="glass" className="py-8 text-center">
        <AnimatePresence mode="wait">
          {!currentItem ? (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="text-6xl mb-4">🍷</div>
              <h3 className="text-xl font-bold text-text-primary">
                Never Have I Ever
              </h3>
              <p className="text-text-secondary text-sm px-4">
                {isMultiplayer
                  ? "Everyone responds, then see who has to drink!"
                  : "Drink if you HAVE done it!"}
              </p>
              {(!isMultiplayer || isHost) && (
                <Button variant="primary" onClick={getNext} className="px-8">
                  <Sparkles size={18} className="mr-2" />
                  Start Game
                </Button>
              )}
              {isMultiplayer && !isHost && (
                <p className="text-sm text-text-muted">Waiting for host to start...</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 px-4"
            >
              {/* Category Badge */}
              <div className={`text-sm font-medium ${getCategoryColor(currentItem.category)}`}>
                {currentItem.category.toUpperCase()}
              </div>

              {/* Statement */}
              <div className="py-6 px-4 rounded-2xl bg-surface-elevated">
                <p className="text-xl font-medium text-text-primary leading-relaxed">
                  {currentItem.text}
                </p>
              </div>

              {/* Multiplayer Response Buttons */}
              {isMultiplayer && !hasResponded && (
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => handleResponse(true)}
                    className="flex-1 max-w-[150px] bg-red-500/20 hover:bg-red-500/30 border-red-500/50"
                  >
                    <Wine size={18} className="mr-2" />
                    I Have
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleResponse(false)}
                    className="flex-1 max-w-[150px] bg-green-500/20 hover:bg-green-500/30 border-green-500/50"
                  >
                    <X size={18} className="mr-2" />
                    Never
                  </Button>
                </div>
              )}

              {/* Waiting Message */}
              {isMultiplayer && hasResponded && !showResponses && (
                <Card variant="glass" className="p-3">
                  <p className="text-sm text-text-muted">
                    Waiting for others... ({Object.keys(responses).length}/{connectedPlayers.length})
                  </p>
                </Card>
              )}

              {/* Results Display */}
              {isMultiplayer && showResponses && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Stats */}
                  <div className="flex justify-center gap-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{iHaveCount}</div>
                      <div className="text-xs text-text-muted">Drink!</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{neverCount}</div>
                      <div className="text-xs text-text-muted">Safe</div>
                    </div>
                  </div>

                  {/* Players who have */}
                  {playersWhoHave.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-red-400 font-medium flex items-center justify-center gap-2">
                        <Wine size={14} />
                        Must Drink:
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {playersWhoHave.map(p => (
                          <span key={p.id} className="text-xs bg-red-500/20 px-2 py-1 rounded-full text-red-300">
                            {p.avatar_emoji} {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Instructions (Solo) */}
              {!isMultiplayer && (
                <p className="text-text-muted text-sm flex items-center justify-center gap-2">
                  <Wine size={16} />
                  Drink if you have!
                </p>
              )}

              {/* Host Controls */}
              {isMultiplayer && isHost && (
                <div className="space-y-2">
                  {hasResponded && !allResponded && !showResponses && (
                    <Button variant="secondary" onClick={handleRevealResponses} className="w-full">
                      <Crown size={18} className="mr-2" />
                      Reveal Responses Early
                    </Button>
                  )}
                  {showResponses && (
                    <Button variant="primary" onClick={getNext} className="w-full">
                      <RotateCcw size={18} className="mr-2" />
                      Next Statement
                    </Button>
                  )}
                </div>
              )}

              {/* Non-host waiting */}
              {isMultiplayer && !isHost && showResponses && (
                <Card variant="glass" className="p-3">
                  <p className="text-sm text-text-muted">Waiting for host to continue...</p>
                </Card>
              )}

              {/* Solo Next Button */}
              {!isMultiplayer && (
                <Button variant="primary" onClick={getNext} className="px-8">
                  <RotateCcw size={18} className="mr-2" />
                  Next Statement
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Instructions */}
      <Card variant="glass" className="p-4">
        <h4 className="font-medium text-text-primary mb-2">How to Play:</h4>
        <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
          <li>Read the statement out loud</li>
          {isMultiplayer ? (
            <>
              <li>Everyone responds secretly</li>
              <li>Those who HAVE done it must drink!</li>
              <li>See who's been naughty...</li>
            </>
          ) : (
            <>
              <li>If you HAVE done it, take a drink!</li>
              <li>If you haven't, you're safe</li>
              <li>Be honest... or don't!</li>
            </>
          )}
        </ul>
      </Card>
    </div>
  );
}
