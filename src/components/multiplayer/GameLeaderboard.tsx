import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Award, Crown } from 'lucide-react';
import { Card } from '@/components/ui';
import { PlayerAvatar } from './PlayerAvatar';

export interface LeaderboardPlayer {
  playerId: string;
  playerName: string;
  avatarEmoji: string;
  avatarColor: string;
  score: number;
  wins?: number;
  streak?: number;
  isCurrentPlayer?: boolean;
  stats?: Record<string, number | string>;
}

interface GameLeaderboardProps {
  players: LeaderboardPlayer[];
  sortBy?: 'score' | 'wins' | 'streak';
  title?: string;
  showStats?: boolean;
  compact?: boolean;
  maxVisible?: number;
  statLabels?: Record<string, string>;
}

const rankIcons = ['🥇', '🥈', '🥉'];

export function GameLeaderboard({
  players,
  sortBy = 'score',
  title = 'Leaderboard',
  showStats = false,
  compact = false,
  maxVisible = 10,
  statLabels = {},
}: GameLeaderboardProps) {
  // Sort players
  const sortedPlayers = [...players].sort((a, b) => {
    const aVal = a[sortBy] ?? 0;
    const bVal = b[sortBy] ?? 0;
    return bVal - aVal;
  });

  const visiblePlayers = sortedPlayers.slice(0, maxVisible);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {visiblePlayers.map((player, index) => (
          <motion.div
            key={player.playerId}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`
              flex items-center gap-1.5 px-2 py-1 rounded-full text-xs
              ${player.isCurrentPlayer ? 'bg-gold/20 border border-gold/50' : 'bg-surface-elevated'}
            `}
          >
            <span className="font-bold">
              {index < 3 ? rankIcons[index] : `${index + 1}.`}
            </span>
            <PlayerAvatar
              emoji={player.avatarEmoji}
              color={player.avatarColor}
              size="xs"
            />
            <span className="max-w-[60px] truncate">{player.playerName}</span>
            <span className="font-bold text-gold">{player.score}</span>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <Card variant="glass" className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gold/10 to-purple/10 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-gold" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <span className="text-xs text-text-muted">
          {players.length} player{players.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Player List */}
      <div className="divide-y divide-border/30">
        <AnimatePresence>
          {visiblePlayers.map((player, index) => (
            <motion.div
              key={player.playerId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-center gap-3 px-4 py-3
                ${player.isCurrentPlayer ? 'bg-gold/10' : ''}
                ${index === 0 ? 'bg-gradient-to-r from-gold/5 to-transparent' : ''}
              `}
            >
              {/* Rank */}
              <div className="w-8 text-center">
                {index < 3 ? (
                  <span className="text-xl">{rankIcons[index]}</span>
                ) : (
                  <span className="text-lg font-bold text-text-muted">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <PlayerAvatar
                  emoji={player.avatarEmoji}
                  color={player.avatarColor}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span
                      className={`font-medium truncate ${
                        player.isCurrentPlayer ? 'text-gold' : ''
                      }`}
                    >
                      {player.playerName}
                    </span>
                    {player.isCurrentPlayer && (
                      <span className="text-xs text-gold">(You)</span>
                    )}
                    {index === 0 && (
                      <Crown size={14} className="text-gold ml-1" />
                    )}
                  </div>

                  {/* Stats Row */}
                  {showStats && player.stats && (
                    <div className="flex gap-2 mt-0.5">
                      {Object.entries(player.stats).map(([key, value]) => (
                        <span
                          key={key}
                          className="text-xs text-text-muted"
                        >
                          {statLabels[key] || key}: {value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Score & Badges */}
              <div className="flex items-center gap-3">
                {/* Streak Badge */}
                {player.streak && player.streak >= 3 && (
                  <div className="flex items-center gap-1 text-orange-400">
                    <TrendingUp size={14} />
                    <span className="text-xs font-bold">{player.streak}</span>
                  </div>
                )}

                {/* Wins Badge */}
                {player.wins && player.wins > 0 && (
                  <div className="flex items-center gap-1 text-cyan">
                    <Award size={14} />
                    <span className="text-xs font-bold">{player.wins}</span>
                  </div>
                )}

                {/* Main Score */}
                <div className="text-right">
                  <span className="text-xl font-bold text-gold">
                    {player.score}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show more indicator */}
      {players.length > maxVisible && (
        <div className="px-4 py-2 text-center text-xs text-text-muted bg-surface">
          +{players.length - maxVisible} more player{players.length - maxVisible !== 1 ? 's' : ''}
        </div>
      )}
    </Card>
  );
}

// Utility to create leaderboard player from game data
export function createLeaderboardPlayer(
  playerId: string,
  playerName: string,
  avatarEmoji: string,
  avatarColor: string,
  score: number,
  options?: {
    wins?: number;
    streak?: number;
    isCurrentPlayer?: boolean;
    stats?: Record<string, number | string>;
  }
): LeaderboardPlayer {
  return {
    playerId,
    playerName,
    avatarEmoji,
    avatarColor,
    score,
    ...options,
  };
}
