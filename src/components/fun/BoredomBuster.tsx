import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, RefreshCw, Users, DollarSign, Shuffle, Check } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { fetchRandomActivity, fetchActivityByParticipants, fetchActivityByType, type BoredActivity } from '@/services/partyApi';

const ACTIVITY_TYPES = [
  { id: 'all', name: 'Any', emoji: '🎲' },
  { id: 'social', name: 'Social', emoji: '👥' },
  { id: 'recreational', name: 'Fun', emoji: '🎮' },
  { id: 'relaxation', name: 'Chill', emoji: '😌' },
  { id: 'cooking', name: 'Food', emoji: '🍳' },
  { id: 'music', name: 'Music', emoji: '🎵' },
  { id: 'diy', name: 'DIY', emoji: '🔧' },
];

const PARTICIPANT_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4+' },
];

export function BoredomBuster() {
  const [activity, setActivity] = useState<BoredActivity | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [participants, setParticipants] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);

  const getActivity = async () => {
    setLoading(true);

    try {
      let newActivity: BoredActivity;

      if (selectedType !== 'all') {
        newActivity = await fetchActivityByType(selectedType);
      } else if (participants > 0) {
        newActivity = await fetchActivityByParticipants(participants);
      } else {
        newActivity = await fetchRandomActivity();
      }

      setActivity(newActivity);
    } catch {
      // Fallback activity
      setActivity({
        activity: "Have a dance party in the living room!",
        type: "social",
        participants: 2,
        price: 0,
        link: "",
        key: "fallback",
        accessibility: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = () => {
    if (activity && !completedActivities.includes(activity.key)) {
      setCompletedActivities([...completedActivities, activity.key]);
    }
  };

  const isCompleted = activity && completedActivities.includes(activity.key);

  const getPriceLabel = (price: number): string => {
    if (price === 0) return 'Free!';
    if (price <= 0.3) return 'Low Cost';
    if (price <= 0.6) return 'Medium Cost';
    return 'Higher Cost';
  };

  const getAccessibilityLabel = (acc: number): string => {
    if (acc <= 0.3) return 'Very Easy';
    if (acc <= 0.6) return 'Moderate';
    return 'May Need Prep';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card variant="glass" className="p-4">
        <div className="space-y-4">
          {/* Activity Type */}
          <div>
            <p className="text-sm text-text-muted mb-2">Activity Type</p>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedType === type.id
                      ? 'bg-gradient-to-r from-cyan to-blue-500 text-white'
                      : 'bg-surface-elevated text-text-secondary hover:bg-border/50'
                  }`}
                >
                  {type.emoji} {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div>
            <p className="text-sm text-text-muted mb-2 flex items-center gap-2">
              <Users size={14} />
              Participants
            </p>
            <div className="flex gap-2">
              {PARTICIPANT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setParticipants(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    participants === opt.value
                      ? 'bg-gradient-to-r from-purple to-magenta text-white'
                      : 'bg-surface-elevated text-text-secondary hover:bg-border/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Activity Display */}
      <Card variant="glass" className="p-6 min-h-[200px]">
        <AnimatePresence mode="wait">
          {!activity && !loading ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">💡</div>
              <h3 className="text-lg font-bold text-text-primary mb-2">
                Bored at the party?
              </h3>
              <p className="text-text-secondary">
                Get a fun activity suggestion!
              </p>
            </motion.div>
          ) : loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Shuffle size={48} className="text-cyan mx-auto" />
              </motion.div>
              <p className="text-text-secondary mt-4">Finding something fun...</p>
            </motion.div>
          ) : activity && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-5xl mb-4"
              >
                {isCompleted ? '✅' : '💡'}
              </motion.div>

              <h3 className={`text-xl font-bold mb-4 ${isCompleted ? 'text-green-500 line-through' : 'text-text-primary'}`}>
                {activity.activity}
              </h3>

              {/* Activity Details */}
              <div className="flex justify-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-text-muted">
                  <Users size={14} />
                  <span>{activity.participants} {activity.participants === 1 ? 'person' : 'people'}</span>
                </div>
                <div className="flex items-center gap-1 text-text-muted">
                  <DollarSign size={14} />
                  <span>{getPriceLabel(activity.price)}</span>
                </div>
              </div>

              <p className="text-xs text-text-muted mt-2">
                {getAccessibilityLabel(activity.accessibility)} • {activity.type}
              </p>

              {activity.link && (
                <a
                  href={activity.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cyan hover:underline mt-2 inline-block"
                >
                  Learn more →
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={getActivity}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <RefreshCw size={18} className="mr-2 animate-spin" />
          ) : (
            <Lightbulb size={18} className="mr-2" />
          )}
          {activity ? 'New Activity' : 'Get Activity'}
        </Button>

        {activity && !isCompleted && (
          <Button variant="secondary" onClick={markCompleted}>
            <Check size={18} className="mr-2" />
            Done!
          </Button>
        )}
      </div>

      {/* Completed Count */}
      {completedActivities.length > 0 && (
        <Card variant="glass" className="p-3 text-center">
          <p className="text-sm text-green-500">
            🎉 You've completed {completedActivities.length} {completedActivities.length === 1 ? 'activity' : 'activities'}!
          </p>
        </Card>
      )}

      {/* API Credit */}
      <Card variant="glass" className="p-3 text-center">
        <p className="text-xs text-text-muted">
          Powered by Bored API
        </p>
      </Card>
    </div>
  );
}
