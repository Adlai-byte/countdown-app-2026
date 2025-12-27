import { motion, AnimatePresence } from 'framer-motion';
import { UserMinus, Crown, Users } from 'lucide-react';
import { PlayerAvatar } from './PlayerAvatar';
import type { Player } from '@/services/multiplayer/types';

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: string | null;
  isHost?: boolean;
  maxPlayers?: number;
  onKickPlayer?: (playerId: string) => void;
  onTransferHost?: (playerId: string) => void;
  compact?: boolean;
}

export function PlayerList({
  players,
  currentPlayerId,
  isHost = false,
  maxPlayers = 12,
  onKickPlayer,
  onTransferHost,
  compact = false,
}: PlayerListProps) {
  const connectedCount = players.filter((p) => p.is_connected).length;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-text-secondary text-sm">
          <Users size={14} />
          <span>{connectedCount}/{maxPlayers}</span>
        </div>
        <div className="flex -space-x-2">
          {players.slice(0, 5).map((player) => (
            <PlayerAvatar
              key={player.id}
              emoji={player.avatar_emoji}
              color={player.avatar_color}
              isHost={player.is_host}
              isConnected={player.is_connected}
              size="sm"
            />
          ))}
          {players.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center text-xs text-text-secondary">
              +{players.length - 5}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
          <Users size={16} />
          Players ({connectedCount}/{maxPlayers})
        </h3>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {players.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`
                flex items-center justify-between p-2 rounded-lg
                ${player.id === currentPlayerId ? 'bg-purple/10 border border-purple/30' : 'bg-surface-elevated'}
                ${!player.is_connected ? 'opacity-60' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <PlayerAvatar
                  emoji={player.avatar_emoji}
                  color={player.avatar_color}
                  isHost={player.is_host}
                  isConnected={player.is_connected}
                  size="md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-text-primary">
                      {player.name}
                    </span>
                    {player.id === currentPlayerId && (
                      <span className="text-xs text-purple-light">(You)</span>
                    )}
                  </div>
                  {!player.is_connected && (
                    <span className="text-xs text-yellow-500">Reconnecting...</span>
                  )}
                </div>
              </div>

              {/* Host actions */}
              {isHost && player.id !== currentPlayerId && (
                <div className="flex items-center gap-1">
                  {onTransferHost && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onTransferHost(player.id)}
                      className="p-2 rounded-full hover:bg-gold/20 text-text-muted hover:text-gold transition-colors"
                      title="Make host"
                    >
                      <Crown size={16} />
                    </motion.button>
                  )}
                  {onKickPlayer && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onKickPlayer(player.id)}
                      className="p-2 rounded-full hover:bg-red-500/20 text-text-muted hover:text-red-500 transition-colors"
                      title="Kick player"
                    >
                      <UserMinus size={16} />
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
