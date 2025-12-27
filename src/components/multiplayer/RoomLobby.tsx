import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, LogOut, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { RoomCodeDisplay } from './RoomCodeDisplay';
import { PlayerList } from './PlayerList';
import type { Room, Player, GameType } from '@/services/multiplayer/types';

interface RoomLobbyProps {
  room: Room;
  players: Player[];
  currentPlayer: Player | null;
  isHost: boolean;
  onStartGame: () => Promise<void>;
  onLeaveRoom: () => Promise<void>;
  onKickPlayer?: (playerId: string) => Promise<void>;
  onTransferHost?: (playerId: string) => Promise<void>;
  isStarting?: boolean;
}

const GAME_INFO: Record<GameType, { name: string; emoji: string; minPlayers: number; description: string }> = {
  'would-you-rather': {
    name: 'Would You Rather',
    emoji: '🤔',
    minPlayers: 2,
    description: 'Vote on hypothetical dilemmas with your friends',
  },
  'truth-or-dare': {
    name: 'Truth or Dare',
    emoji: '🎭',
    minPlayers: 2,
    description: 'Take turns choosing truth or dare challenges',
  },
  charades: {
    name: 'Charades',
    emoji: '🎬',
    minPlayers: 2,
    description: 'Act out words without speaking while others guess',
  },
  bingo: {
    name: 'NYE Bingo',
    emoji: '📋',
    minPlayers: 2,
    description: 'Mark off squares as NYE events happen',
  },
  'never-have-i-ever': {
    name: 'Never Have I Ever',
    emoji: '🙅',
    minPlayers: 2,
    description: 'Learn fun facts about your friends',
  },
  kings: {
    name: 'Kings',
    emoji: '👑',
    minPlayers: 3,
    description: 'Classic card drinking game with rules',
  },
  'drink-roulette': {
    name: 'Drink Roulette',
    emoji: '🎰',
    minPlayers: 2,
    description: 'Spin the wheel and follow the challenge',
  },
  'hot-potato': {
    name: 'Hot Potato',
    emoji: '🥔',
    minPlayers: 3,
    description: 'Pass the potato before time runs out!',
  },
};

export function RoomLobby({
  room,
  players,
  currentPlayer,
  isHost,
  onStartGame,
  onLeaveRoom,
  onKickPlayer,
  onTransferHost,
  isStarting = false,
}: RoomLobbyProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  const gameInfo = room.game_type ? GAME_INFO[room.game_type] : null;
  const connectedPlayers = players.filter((p) => p.is_connected);
  const minPlayersRequired = gameInfo?.minPlayers || 2;
  const canStart = connectedPlayers.length >= minPlayersRequired;

  const handleLeave = async () => {
    setIsLeaving(true);
    try {
      await onLeaveRoom();
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with Game Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {gameInfo && (
            <div className="flex flex-col items-center gap-2 mb-4">
              <span className="text-5xl">{gameInfo.emoji}</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{gameInfo.name}</h1>
              <p className="text-sm text-text-secondary">{gameInfo.description}</p>
            </div>
          )}
        </motion.div>

        {/* Room Code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <RoomCodeDisplay code={room.code} />
        </motion.div>

        {/* Player List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface rounded-2xl p-4 sm:p-6 border border-border/50"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-purple-light" />
            <h2 className="text-lg font-semibold text-text-primary">
              Players ({connectedPlayers.length})
            </h2>
            {connectedPlayers.length < minPlayersRequired && (
              <span className="text-xs text-text-muted ml-auto">
                Need {minPlayersRequired - connectedPlayers.length} more
              </span>
            )}
          </div>

          <PlayerList
            players={players}
            currentPlayerId={currentPlayer?.id}
            isHost={isHost}
            onKickPlayer={onKickPlayer}
            onTransferHost={onTransferHost}
          />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {isHost ? (
            <>
              <Button
                variant="primary"
                onClick={onStartGame}
                disabled={!canStart || isStarting}
                className="w-full py-4 text-lg"
              >
                {isStarting ? (
                  <>
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    Starting...
                  </>
                ) : !canStart ? (
                  <>
                    <Users size={20} className="mr-2" />
                    Waiting for {minPlayersRequired - connectedPlayers.length} more player
                    {minPlayersRequired - connectedPlayers.length > 1 ? 's' : ''}
                  </>
                ) : (
                  <>
                    <Play size={20} className="mr-2" />
                    Start Game
                  </>
                )}
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleLeave}
                  disabled={isLeaving}
                  className="flex-1"
                >
                  {isLeaving ? (
                    <Loader2 size={18} className="mr-2 animate-spin" />
                  ) : (
                    <LogOut size={18} className="mr-2" />
                  )}
                  Leave Room
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-surface-elevated rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-text-secondary">
                  <Loader2 size={18} className="animate-spin" />
                  <span>Waiting for host to start the game...</span>
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={handleLeave}
                disabled={isLeaving}
                className="w-full"
              >
                {isLeaving ? (
                  <Loader2 size={18} className="mr-2 animate-spin" />
                ) : (
                  <LogOut size={18} className="mr-2" />
                )}
                Leave Room
              </Button>
            </>
          )}
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-text-muted"
        >
          <p>Share the room code with friends to let them join!</p>
        </motion.div>
      </div>
    </div>
  );
}
