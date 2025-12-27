import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Crown, HelpCircle, Trophy } from 'lucide-react';
import { Card, Button, Modal } from '@/components/ui';
import { drawCard, KINGS_RULES, type KingsRule } from '@/data/drinkingGames';
import { useConfetti } from '@/hooks/useConfetti';
import { useRoom } from '@/hooks/multiplayer';
import { PlayerAvatar, GameLeaderboard, type LeaderboardPlayer } from '@/components/multiplayer';

const CARD_SUITS = ['♠️', '♥️', '♦️', '♣️'];
const CARD_COLORS: Record<string, string> = {
  '♠️': 'text-gray-800',
  '♣️': 'text-gray-800',
  '♥️': 'text-red-500',
  '♦️': 'text-red-500',
};

interface KingsGameState {
  currentCard: KingsRule | null;
  currentSuit: string;
  kingsDrawn: number;
  lastKingDrawerId: string | null;
  turnOrder: string[];
  currentTurnIndex: number;
  isDrawing: boolean;
  drawnCardsCount: number;
  playerScores: Record<string, number>;
}

export function Kings() {
  const {
    room,
    players: roomPlayers,
    currentPlayer,
    isHost,
    updateGameState,
  } = useRoom();

  const isMultiplayer = room?.status === 'playing' && room?.game_type === 'kings';

  // Local state for solo play
  const [localCurrentCard, setLocalCurrentCard] = useState<KingsRule | null>(null);
  const [localCurrentSuit, setLocalCurrentSuit] = useState<string>('');
  const [localKingsDrawn, setLocalKingsDrawn] = useState(0);
  const [localShowRules, setLocalShowRules] = useState(false);
  const [localIsDrawing, setLocalIsDrawing] = useState(false);

  const { fireSmall, fireCelebration } = useConfetti();

  // Get game state
  const gameState = room?.game_state as KingsGameState | undefined;
  const connectedPlayers = roomPlayers.filter(p => p.is_connected);

  // Derived state
  const currentCard = isMultiplayer ? gameState?.currentCard : localCurrentCard;
  const currentSuit = isMultiplayer ? (gameState?.currentSuit || '') : localCurrentSuit;
  const kingsDrawn = isMultiplayer ? (gameState?.kingsDrawn || 0) : localKingsDrawn;
  const isDrawing = isMultiplayer ? (gameState?.isDrawing || false) : localIsDrawing;
  const playerScores = gameState?.playerScores || {};

  // Current turn player
  const currentTurnPlayer = isMultiplayer && gameState?.turnOrder
    ? connectedPlayers.find(p => p.id === gameState.turnOrder[gameState.currentTurnIndex || 0])
    : null;

  const isMyTurn = isMultiplayer
    ? currentPlayer?.id === currentTurnPlayer?.id
    : true;

  // Last King drawer
  const lastKingDrawer = isMultiplayer && gameState?.lastKingDrawerId
    ? connectedPlayers.find(p => p.id === gameState.lastKingDrawerId)
    : null;

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
      // Shuffle player order
      const shuffled = [...connectedPlayers].sort(() => Math.random() - 0.5);
      updateGameState({
        currentCard: null,
        currentSuit: '',
        kingsDrawn: 0,
        lastKingDrawerId: null,
        turnOrder: shuffled.map(p => p.id),
        currentTurnIndex: 0,
        isDrawing: false,
        drawnCardsCount: 0,
        playerScores: {},
      });
    }
  }, [isMultiplayer, isHost, gameState?.turnOrder?.length, connectedPlayers]);

  const draw = useCallback(async () => {
    if (isMultiplayer) {
      if (!isMyTurn && !isHost) return;

      // Start drawing animation
      await updateGameState({
        ...gameState,
        isDrawing: true,
      });

      // Draw after animation
      setTimeout(async () => {
        const card = drawCard();
        const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)];

        const newKingsDrawn = card.card === 'K' ? kingsDrawn + 1 : kingsDrawn;
        const drawerId = currentTurnPlayer?.id || currentPlayer?.id;

        // Update scores
        const newScores = { ...playerScores };
        if (drawerId) {
          newScores[drawerId] = (newScores[drawerId] || 0) + 1;
        }

        // Move to next player
        const nextIndex = ((gameState?.currentTurnIndex || 0) + 1) % (gameState?.turnOrder?.length || 1);

        await updateGameState({
          ...gameState,
          currentCard: card,
          currentSuit: suit,
          kingsDrawn: newKingsDrawn,
          lastKingDrawerId: card.card === 'K' ? drawerId : gameState?.lastKingDrawerId,
          currentTurnIndex: nextIndex,
          isDrawing: false,
          drawnCardsCount: (gameState?.drawnCardsCount || 0) + 1,
          playerScores: newScores,
        });

        if (card.card === 'K' && newKingsDrawn === 4) {
          fireCelebration();
        } else {
          fireSmall();
        }
      }, 300);
    } else {
      setLocalIsDrawing(true);

      setTimeout(() => {
        const card = drawCard();
        const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)];
        setLocalCurrentCard(card);
        setLocalCurrentSuit(suit);
        setLocalIsDrawing(false);

        if (card.card === 'K') {
          const newKingsCount = localKingsDrawn + 1;
          setLocalKingsDrawn(newKingsCount);
          if (newKingsCount === 4) {
            fireCelebration();
          } else {
            fireSmall();
          }
        } else {
          fireSmall();
        }
      }, 300);
    }
  }, [isMultiplayer, isMyTurn, isHost, gameState, kingsDrawn, currentTurnPlayer, currentPlayer, playerScores, fireSmall, fireCelebration, localKingsDrawn]);

  const resetGame = async () => {
    if (isMultiplayer) {
      if (!isHost) return;

      const shuffled = [...connectedPlayers].sort(() => Math.random() - 0.5);
      await updateGameState({
        currentCard: null,
        currentSuit: '',
        kingsDrawn: 0,
        lastKingDrawerId: null,
        turnOrder: shuffled.map(p => p.id),
        currentTurnIndex: 0,
        isDrawing: false,
        drawnCardsCount: 0,
        playerScores: {},
      });
    } else {
      setLocalCurrentCard(null);
      setLocalCurrentSuit('');
      setLocalKingsDrawn(0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Kings Counter */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Crown size={20} className="text-gold" />
          <span className="text-text-primary font-medium">
            Kings: {kingsDrawn}/4
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setLocalShowRules(true)} className="text-sm">
            <HelpCircle size={16} className="mr-1" />
            Rules
          </Button>
          {(!isMultiplayer || isHost) && (
            <Button variant="ghost" onClick={resetGame} className="text-sm">
              <RotateCcw size={16} className="mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

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
              {isMyTurn ? "Your turn to draw!" : `${currentTurnPlayer.name}'s turn`}
            </span>
          </div>
        </Card>
      )}

      {/* Multiplayer Leaderboard */}
      {isMultiplayer && leaderboardPlayers.length > 0 && (gameState?.drawnCardsCount || 0) > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Trophy size={14} className="text-gold" />
            <span>Cards Drawn</span>
          </div>
          <GameLeaderboard players={leaderboardPlayers} compact />
        </div>
      )}

      {/* Kings Progress */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            animate={i <= kingsDrawn ? { scale: [1, 1.2, 1] } : {}}
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center text-lg
              ${i <= kingsDrawn
                ? 'bg-gradient-to-br from-gold to-yellow-600 text-white'
                : 'bg-surface-elevated text-text-muted'}
            `}
          >
            👑
          </motion.div>
        ))}
      </div>

      {/* Card Display */}
      <Card variant="glass" className="py-8">
        <div className="flex justify-center">
          <AnimatePresence mode="wait">
            {isDrawing ? (
              <motion.div
                key="drawing"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 180 }}
                className="w-32 h-44 rounded-xl bg-gradient-to-br from-purple to-magenta flex items-center justify-center"
              >
                <span className="text-4xl text-white">?</span>
              </motion.div>
            ) : currentCard ? (
              <motion.div
                key={`${currentCard.card}-${currentSuit}`}
                initial={{ rotateY: 180, scale: 0.8 }}
                animate={{ rotateY: 0, scale: 1 }}
                className="w-32 h-44 rounded-xl bg-white shadow-xl flex flex-col items-center justify-between p-3"
              >
                <div className={`self-start text-2xl font-bold ${CARD_COLORS[currentSuit]}`}>
                  {currentCard.card}
                  <span className="text-lg ml-1">{currentSuit}</span>
                </div>
                <div className="text-4xl">{currentCard.emoji}</div>
                <div className={`self-end text-2xl font-bold rotate-180 ${CARD_COLORS[currentSuit]}`}>
                  {currentCard.card}
                  <span className="text-lg ml-1">{currentSuit}</span>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="deck"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                whileHover={isMyTurn || !isMultiplayer ? { scale: 1.05 } : {}}
                whileTap={isMyTurn || !isMultiplayer ? { scale: 0.95 } : {}}
                onClick={isMyTurn || !isMultiplayer ? draw : undefined}
                disabled={isMultiplayer && !isMyTurn && !isHost}
                className={`
                  w-32 h-44 rounded-xl bg-gradient-to-br from-purple to-magenta flex items-center justify-center shadow-xl
                  ${isMultiplayer && !isMyTurn && !isHost ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className="text-white text-lg font-medium">
                  {isMultiplayer && !isMyTurn ? 'Wait...' : 'Tap to Draw'}
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Current Rule */}
        {currentCard && !isDrawing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center px-4"
          >
            <h3 className="text-xl font-bold text-text-primary mb-2">
              {currentCard.name}
            </h3>
            <p className="text-text-secondary">
              {currentCard.rule}
            </p>

            {currentCard.card === 'K' && kingsDrawn === 4 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-4 space-y-2"
              >
                <p className="text-xl font-bold text-gold">
                  🍺 DRINK THE KING'S CUP! 🍺
                </p>
                {isMultiplayer && lastKingDrawer && (
                  <div className="flex items-center justify-center gap-2">
                    <PlayerAvatar
                      emoji={lastKingDrawer.avatar_emoji}
                      color={lastKingDrawer.avatar_color}
                      size="sm"
                    />
                    <span className="text-magenta font-bold">
                      {lastKingDrawer.name} must drink!
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </Card>

      {/* Draw Button */}
      {currentCard && !isDrawing && (
        <Button
          variant="primary"
          onClick={draw}
          disabled={isMultiplayer && !isMyTurn && !isHost}
          className="w-full"
        >
          {isMultiplayer && !isMyTurn
            ? `Waiting for ${currentTurnPlayer?.name}...`
            : 'Draw Next Card'}
        </Button>
      )}

      {/* Rules Modal */}
      <Modal isOpen={localShowRules} onClose={() => setLocalShowRules(false)}>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Crown size={24} className="text-gold" />
            Kings Rules
          </h3>

          <div className="space-y-3">
            {KINGS_RULES.map((rule) => (
              <div key={rule.card} className="flex gap-3 p-3 bg-surface-elevated rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-gray-800 shrink-0">
                  {rule.card}
                </div>
                <div>
                  <p className="font-medium text-text-primary flex items-center gap-2">
                    <span>{rule.emoji}</span>
                    {rule.name}
                  </p>
                  <p className="text-sm text-text-secondary">{rule.rule}</p>
                </div>
              </div>
            ))}
          </div>

          <Button variant="primary" onClick={() => setLocalShowRules(false)} className="w-full">
            Got it!
          </Button>
        </div>
      </Modal>
    </div>
  );
}
