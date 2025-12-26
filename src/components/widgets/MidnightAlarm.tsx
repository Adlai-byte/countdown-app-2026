import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Volume2, VolumeX, Clock } from 'lucide-react';
import { Card, Button } from '@/components/ui';

interface AlarmSettings {
  enabled: boolean;
  sound: 'chime' | 'fireworks' | 'celebration' | 'countdown';
  vibrate: boolean;
  preAlarm: boolean; // 10 second warning
}

const SOUNDS = [
  { id: 'chime', name: 'Chime', emoji: '🔔' },
  { id: 'fireworks', name: 'Fireworks', emoji: '🎆' },
  { id: 'celebration', name: 'Celebration', emoji: '🎉' },
  { id: 'countdown', name: 'Countdown', emoji: '⏱️' },
];

export function MidnightAlarm() {
  const [settings, setSettings] = useState<AlarmSettings>(() => {
    const saved = localStorage.getItem('midnightAlarm');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      sound: 'celebration',
      vibrate: true,
      preAlarm: true,
    };
  });

  const [timeUntilMidnight, setTimeUntilMidnight] = useState<string>('');
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Save settings
  useEffect(() => {
    localStorage.setItem('midnightAlarm', JSON.stringify(settings));
  }, [settings]);

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Calculate time until midnight
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilMidnight("It's 2026!");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeUntilMidnight(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeUntilMidnight(`${minutes}m ${seconds}s`);
      } else {
        setTimeUntilMidnight(`${seconds}s`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
    }
  };

  const toggleAlarm = () => {
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const toggleVibrate = () => {
    setSettings((prev) => ({ ...prev, vibrate: !prev.vibrate }));
    // Test vibration
    if (!settings.vibrate && navigator.vibrate) {
      navigator.vibrate(200);
    }
  };

  const togglePreAlarm = () => {
    setSettings((prev) => ({ ...prev, preAlarm: !prev.preAlarm }));
  };

  const setSound = (sound: AlarmSettings['sound']) => {
    setSettings((prev) => ({ ...prev, sound }));
  };

  const testAlarm = () => {
    // Test notification
    if (permission === 'granted') {
      new Notification("🎉 Happy New Year!", {
        body: "It's midnight! Time to celebrate!",
        icon: '/logo.svg',
        tag: 'midnight-alarm-test',
      });
    }

    // Test vibration
    if (settings.vibrate && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  };

  return (
    <Card variant="glass" className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Bell className="text-gold" size={20} />
          Midnight Alarm
        </h3>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleAlarm}
          className={`p-2 rounded-full transition-colors ${
            settings.enabled
              ? 'bg-gradient-to-r from-gold to-yellow-500 text-black'
              : 'bg-surface-elevated text-text-muted'
          }`}
        >
          {settings.enabled ? <Bell size={18} /> : <BellOff size={18} />}
        </motion.button>
      </div>

      {/* Time Until Midnight */}
      <div className="text-center p-4 bg-surface-elevated rounded-xl mb-4">
        <Clock size={20} className="mx-auto text-cyan mb-2" />
        <p className="text-2xl font-bold text-gold">{timeUntilMidnight}</p>
        <p className="text-xs text-text-muted">until midnight</p>
      </div>

      {/* Notification Permission */}
      {permission !== 'granted' && (
        <div className="mb-4 p-3 bg-yellow-500/20 rounded-xl">
          <p className="text-sm text-yellow-400 mb-2">
            Enable notifications for the midnight alarm
          </p>
          <Button variant="primary" size="sm" onClick={requestPermission}>
            Enable Notifications
          </Button>
        </div>
      )}

      {/* Sound Selection */}
      <div className="mb-4">
        <p className="text-sm text-text-muted mb-2">Alarm Sound</p>
        <div className="grid grid-cols-4 gap-2">
          {SOUNDS.map((sound) => (
            <button
              key={sound.id}
              onClick={() => setSound(sound.id as AlarmSettings['sound'])}
              className={`p-2 rounded-lg text-center transition-colors ${
                settings.sound === sound.id
                  ? 'bg-gradient-to-r from-purple to-magenta text-white'
                  : 'bg-surface-elevated text-text-secondary hover:bg-border/50'
              }`}
            >
              <span className="text-xl">{sound.emoji}</span>
              <p className="text-[10px] mt-1">{sound.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-4">
        <button
          onClick={toggleVibrate}
          className="w-full flex items-center justify-between p-3 bg-surface-elevated rounded-xl"
        >
          <div className="flex items-center gap-3">
            {settings.vibrate ? (
              <Volume2 size={18} className="text-cyan" />
            ) : (
              <VolumeX size={18} className="text-text-muted" />
            )}
            <span className="text-sm text-text-primary">Vibration</span>
          </div>
          <div
            className={`w-10 h-6 rounded-full transition-colors ${
              settings.vibrate ? 'bg-cyan' : 'bg-border'
            }`}
          >
            <motion.div
              animate={{ x: settings.vibrate ? 16 : 2 }}
              className="w-5 h-5 mt-0.5 rounded-full bg-white shadow"
            />
          </div>
        </button>

        <button
          onClick={togglePreAlarm}
          className="w-full flex items-center justify-between p-3 bg-surface-elevated rounded-xl"
        >
          <div className="flex items-center gap-3">
            <Clock size={18} className={settings.preAlarm ? 'text-gold' : 'text-text-muted'} />
            <span className="text-sm text-text-primary">10s Warning</span>
          </div>
          <div
            className={`w-10 h-6 rounded-full transition-colors ${
              settings.preAlarm ? 'bg-gold' : 'bg-border'
            }`}
          >
            <motion.div
              animate={{ x: settings.preAlarm ? 16 : 2 }}
              className="w-5 h-5 mt-0.5 rounded-full bg-white shadow"
            />
          </div>
        </button>
      </div>

      {/* Test Button */}
      <Button variant="secondary" onClick={testAlarm} className="w-full">
        Test Alarm
      </Button>
    </Card>
  );
}
