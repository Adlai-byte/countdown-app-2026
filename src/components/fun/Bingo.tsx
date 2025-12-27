import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Play, Pause, Volume2, Trophy } from 'lucide-react';
import { Card, Button, Modal } from '@/components/ui';
import { generateBingoCard, checkBingo, type BingoItem, BINGO_ITEMS } from '@/data/bingo';
import { useConfetti } from '@/hooks/useConfetti';
import { useRoom } from '@/hooks/multiplayer';
import { PlayerAvatar } from '@/components/multiplayer';
import useSound from 'use-sound';

const CALL_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';

interface BingoGameState {
  calledItems: BingoItem[];
  currentCall: BingoItem | null;
  isAutoCalling: boolean;
  winners: { playerId: string; playerName: string }[];
  playerMarkedCounts: Record<string, number>;
}

export function Bingo() {
  const {
    room,
    players: roomPlayers,
    currentPlayer,
    isHost,
    updateGameState,
  } = useRoom();

  const isMultiplayer = room?.status === 'playing' && room?.game_type === 'bingo';

  // Local state - Each player has their OWN card (stored locally, not synced)
  const [grid, setGrid] = useState<BingoItem[]>(() => generateBingoCard());
  const [marked, setMarked] = useState<Set<string>>(new Set(['free']));
  const [localCalledItems, setLocalCalledItems] = useState<BingoItem[]>([]);
  const [localHasWon, setLocalHasWon] = useState(false);
  const [localIsAutoCalling, setLocalIsAutoCalling] = useState(false);
  const [localCurrentCall, setLocalCurrentCall] = useState<BingoItem | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { fireCelebration } = useConfetti();

  const [playCall] = useSound(CALL_SOUND, { volume: 0.5 });

  // Get game state
  const gameState = room?.game_state as BingoGameState | undefined;
  const connectedPlayers = roomPlayers.filter(p => p.is_connected);

  // Derived state - use game state for multiplayer
  const calledItems = isMultiplayer ? (gameState?.calledItems || []) : localCalledItems;
  const currentCall = isMultiplayer ? gameState?.currentCall : localCurrentCall;
  const isAutoCalling = isMultiplayer ? (gameState?.isAutoCalling || false) : localIsAutoCalling;
  const winners = gameState?.winners || [];
  const playerMarkedCounts = gameState?.playerMarkedCounts || {};

  // Check if current player has already won
  const hasWon = isMultiplayer
    ? winners.some(w => w.playerId === currentPlayer?.id)
    : localHasWon;

  // Available items that haven't been called yet
  const availableItems = BINGO_ITEMS.filter(
    (item) => !calledItems.find((c) => c.id === item.id)
  );


  // Initialize game for multiplayer
  useEffect(() => {
    if (isMultiplayer && isHost && !gameState) {
      updateGameState({
        calledItems: [],
        currentCall: null,
        isAutoCalling: false,
        winners: [],
        playerMarkedCounts: {},
      });
    }
  }, [isMultiplayer, isHost, gameState]);

  // Listen for new calls in multiplayer and play sound
  useEffect(() => {
    if (isMultiplayer && currentCall) {
      playCall();
    }
  }, [isMultiplayer, currentCall?.id, playCall]);

  const callNextItem = useCallback(async () => {
    if (availableItems.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const item = availableItems[randomIndex];

    if (isMultiplayer) {
      if (!isHost) return;

      await updateGameState({
        ...gameState,
        currentCall: item,
        calledItems: [...calledItems, item],
      });
    } else {
      setLocalCurrentCall(item);
      setLocalCalledItems((prev) => [...prev, item]);
      playCall();
    }
  }, [availableItems, isMultiplayer, isHost, gameState, calledItems, playCall]);

  // Auto-caller interval (host only in multiplayer)
  useEffect(() => {
    if (isMultiplayer && !isHost) return; // Only host runs auto-caller

    if (isAutoCalling && availableItems.length > 0 && !hasWon) {
      intervalRef.current = setInterval(() => {
        callNextItem();
      }, 5000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoCalling, availableItems.length, hasWon, callNextItem, isMultiplayer, isHost]);

  const toggleMark = async (item: BingoItem) => {
    if (item.id === 'free' || hasWon) return;

    // Check if item has been called
    if (!calledItems.find((c) => c.id === item.id)) return;

    const newMarked = new Set(marked);
    if (marked.has(item.id)) {
      newMarked.delete(item.id);
    } else {
      newMarked.add(item.id);
    }
    setMarked(newMarked);

    // Update marked count for multiplayer
    if (isMultiplayer && currentPlayer) {
      const newCounts = { ...playerMarkedCounts };
      newCounts[currentPlayer.id] = newMarked.size - 1; // Exclude 'free'
      await updateGameState({
        ...gameState,
        playerMarkedCounts: newCounts,
      });
    }

    // Check for win
    if (checkBingo(newMarked, grid)) {
      if (isMultiplayer && currentPlayer) {
        // Add to winners list
        const newWinners = [...winners, { playerId: currentPlayer.id, playerName: currentPlayer.name }];
        await updateGameState({
          ...gameState,
          winners: newWinners,
          isAutoCalling: false,
        });
      } else {
        setLocalHasWon(true);
        setLocalIsAutoCalling(false);
      }
      fireCelebration();
    }
  };

  const resetGame = async () => {
    // Generate new card for this player
    setGrid(generateBingoCard());
    setMarked(new Set(['free']));

    if (isMultiplayer) {
      if (!isHost) return;

      await updateGameState({
        calledItems: [],
        currentCall: null,
        isAutoCalling: false,
        winners: [],
        playerMarkedCounts: {},
      });
    } else {
      setLocalCalledItems([]);
      setLocalCurrentCall(null);
      setLocalHasWon(false);
      setLocalIsAutoCalling(false);
    }
  };

  const toggleAutoCalling = async () => {
    if (isMultiplayer) {
      if (!isHost) return;

      if (!isAutoCalling && availableItems.length > 0) {
        // Start auto-calling immediately with first call
        await callNextItem();
      }
      await updateGameState({
        ...gameState,
        isAutoCalling: !isAutoCalling,
      });
    } else {
      if (!localIsAutoCalling && availableItems.length > 0) {
        callNextItem();
      }
      setLocalIsAutoCalling(!localIsAutoCalling);
    }
  };

  return (
    <div className="space-y-4">
      {/* Multiplayer Players Status */}
      {isMultiplayer && (
        <div className="flex flex-wrap gap-2 justify-center">
          {connectedPlayers.map((player) => {
            const isWinner = winners.some(w => w.playerId === player.id);
            const markedCount = playerMarkedCounts[player.id] || 0;
            return (
              <div
                key={player.id}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
                  isWinner
                    ? 'bg-gold/20 text-gold'
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
                <span className="text-purple-light">({markedCount})</span>
                {isWinner && <Trophy size={12} className="text-gold" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Winners Announcement */}
      {isMultiplayer && winners.length > 0 && (
        <Card variant="glass" className="p-3 bg-gold/10 border border-gold/30">
          <div className="flex items-center justify-center gap-2">
            <Trophy size={18} className="text-gold" />
            <span className="font-bold text-gold">
              {winners.map(w => w.playerName).join(', ')} got BINGO!
            </span>
          </div>
        </Card>
      )}

      {/* Current Call */}
      <Card variant="glass" className="text-center py-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Volume2 size={18} className="text-gold" />
          <span className="text-sm text-text-secondary">Current Call</span>
        </div>
        <AnimatePresence mode="wait">
          {currentCall ? (
            <motion.div
              key={currentCall.id}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-3xl"
            >
              <span className="mr-2">{currentCall.emoji}</span>
              <span className="font-bold text-gold">{currentCall.text}</span>
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-text-muted"
            >
              {isMultiplayer && !isHost
                ? 'Waiting for host to call...'
                : 'Press "Call" or start Auto-Caller'}
            </motion.p>
          )}
        </AnimatePresence>
        <p className="text-xs text-text-muted mt-2">
          {calledItems.length} / {BINGO_ITEMS.length} called
        </p>
      </Card>

      {/* Controls */}
      <div className="flex gap-2">
        {(!isMultiplayer || isHost) && (
          <>
            <Button
              variant="secondary"
              onClick={callNextItem}
              disabled={availableItems.length === 0 || isAutoCalling}
              className="flex-1"
            >
              <Volume2 size={18} className="mr-2" />
              Call
            </Button>
            <Button
              variant={isAutoCalling ? 'primary' : 'secondary'}
              onClick={toggleAutoCalling}
              disabled={availableItems.length === 0}
              className="flex-1"
            >
              {isAutoCalling ? <Pause size={18} className="mr-2" /> : <Play size={18} className="mr-2" />}
              {isAutoCalling ? 'Pause' : 'Auto'}
            </Button>
            <Button variant="ghost" onClick={resetGame}>
              <RotateCcw size={18} />
            </Button>
          </>
        )}
        {isMultiplayer && !isHost && (
          <p className="text-sm text-text-muted text-center w-full py-2">
            {isAutoCalling ? 'Auto-caller is running...' : 'Waiting for host to call items'}
          </p>
        )}
      </div>

      {/* Bingo Grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {grid.map((item, index) => {
          const isMarked = marked.has(item.id);
          const isCalled = calledItems.find((c) => c.id === item.id) || item.id === 'free';

          return (
            <motion.button
              key={`${item.id}-${index}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleMark(item)}
              disabled={!isCalled || hasWon}
              className={`
                aspect-square rounded-lg p-1 flex flex-col items-center justify-center
                transition-all text-center
                ${isMarked
                  ? 'bg-gradient-to-br from-purple to-magenta text-white shadow-lg shadow-purple/30'
                  : isCalled
                    ? 'bg-surface-elevated hover:bg-border/50 text-text-primary'
                    : 'bg-surface opacity-50 text-text-muted cursor-not-allowed'}
              `}
            >
              <span className="text-lg leading-none">{item.emoji}</span>
              <span className="text-[8px] leading-tight mt-0.5 line-clamp-1">{item.text}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Called Items History */}
      <Card variant="glass" className="p-3">
        <p className="text-xs text-text-muted mb-2">Called Items:</p>
        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
          {calledItems.length === 0 ? (
            <span className="text-xs text-text-muted">None yet</span>
          ) : (
            calledItems.map((item) => (
              <span
                key={item.id}
                className={`
                  text-xs px-2 py-0.5 rounded-full
                  ${marked.has(item.id) ? 'bg-purple/30 text-purple' : 'bg-surface-elevated text-text-muted'}
                `}
              >
                {item.emoji}
              </span>
            ))
          )}
        </div>
      </Card>

      {/* Win Modal (Solo only - multiplayer shows banner) */}
      {!isMultiplayer && (
        <Modal isOpen={localHasWon} onClose={resetGame}>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center">
              <Trophy size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gold">BINGO!</h3>
            <p className="text-text-secondary">
              Congratulations! You got 5 in a row!
            </p>
            <Button variant="primary" onClick={resetGame}>
              <RotateCcw size={18} className="mr-2" />
              Play Again
            </Button>
          </motion.div>
        </Modal>
      )}
    </div>
  );
}
