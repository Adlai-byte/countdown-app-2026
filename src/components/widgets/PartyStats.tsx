import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Gamepad2, Music, MessageSquare, Trophy, TrendingUp, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui';

interface Stats {
  photosTaken: number;
  gamesPlayed: number;
  songsVoted: number;
  messagesLeft: number;
  confettiLaunched: number;
  toastsMade: number;
}

const STORAGE_KEY = 'partyStats2026';

// This hook can be imported by other components to track stats
export function usePartyStats() {
  const [stats, setStats] = useState<Stats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      photosTaken: 0,
      gamesPlayed: 0,
      songsVoted: 0,
      messagesLeft: 0,
      confettiLaunched: 0,
      toastsMade: 0,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  const incrementStat = (key: keyof Stats) => {
    setStats((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  };

  const resetStats = () => {
    setStats({
      photosTaken: 0,
      gamesPlayed: 0,
      songsVoted: 0,
      messagesLeft: 0,
      confettiLaunched: 0,
      toastsMade: 0,
    });
  };

  return { stats, incrementStat, resetStats };
}

export function PartyStats() {
  const { stats, resetStats } = usePartyStats();

  const statItems = [
    { key: 'photosTaken', label: 'Photos', icon: Camera, color: 'text-pink-500', value: stats.photosTaken },
    { key: 'gamesPlayed', label: 'Games', icon: Gamepad2, color: 'text-purple', value: stats.gamesPlayed },
    { key: 'songsVoted', label: 'Votes', icon: Music, color: 'text-cyan', value: stats.songsVoted },
    { key: 'messagesLeft', label: 'Messages', icon: MessageSquare, color: 'text-green-500', value: stats.messagesLeft },
    { key: 'confettiLaunched', label: 'Confetti', icon: Trophy, color: 'text-gold', value: stats.confettiLaunched },
    { key: 'toastsMade', label: 'Toasts', icon: TrendingUp, color: 'text-orange-500', value: stats.toastsMade },
  ];

  const totalActivity = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <Card variant="glass" className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <TrendingUp className="text-gold" size={20} />
          Party Stats
        </h3>
        <button
          onClick={resetStats}
          className="p-1.5 rounded-full hover:bg-surface-elevated transition-colors text-text-muted"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Total Activity */}
      <div className="text-center mb-4 p-3 bg-gradient-to-r from-purple/20 to-magenta/20 rounded-xl">
        <motion.p
          key={totalActivity}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-3xl font-bold text-gold"
        >
          {totalActivity}
        </motion.p>
        <p className="text-xs text-text-muted">Total Activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.key}
              whileHover={{ scale: 1.05 }}
              className="text-center p-2 rounded-lg bg-surface-elevated"
            >
              <Icon size={18} className={`mx-auto mb-1 ${item.color}`} />
              <motion.p
                key={item.value}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="text-lg font-bold text-text-primary"
              >
                {item.value}
              </motion.p>
              <p className="text-[10px] text-text-muted">{item.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Encouragement */}
      <div className="mt-4 text-center">
        <p className="text-xs text-text-muted">
          {totalActivity === 0
            ? "🎉 Start celebrating to see your stats!"
            : totalActivity < 10
            ? "🔥 You're just getting started!"
            : totalActivity < 50
            ? "🚀 Party animal in the making!"
            : "👑 You're the life of the party!"}
        </p>
      </div>
    </Card>
  );
}
