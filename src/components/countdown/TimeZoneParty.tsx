import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Search, X, Plus, Check, PartyPopper, Clock } from 'lucide-react';
import { CITIES, getCityById, searchCities, sortCitiesByNewYear, type City } from '@/data/timezones';
import { useTimezoneStore } from '@/stores/timezoneStore';
import { useTimezoneCountdown, useTimezoneTime } from '@/hooks/useTimezoneCountdown';
import { useConfetti } from '@/hooks/useConfetti';
import { Card, Button } from '@/components/ui';

export function TimeZoneParty() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedCities, toggleCity, resetToDefaults } = useTimezoneStore();

  // Get selected city objects and sort by countdown
  const cities = useMemo(() => {
    const cityObjects = selectedCities
      .map(id => getCityById(id))
      .filter((city): city is City => city !== undefined);
    return sortCitiesByNewYear(cityObjects);
  }, [selectedCities]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return CITIES;
    return searchCities(searchQuery);
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={20} className="text-purple" />
          <h3 className="font-bold text-text-primary">World Countdown</h3>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
          >
            <Plus size={20} className="text-text-muted" />
          </motion.button>
        </div>
      </div>

      {/* City Cards */}
      {cities.length === 0 ? (
        <Card variant="glass" className="text-center py-8">
          <Globe size={40} className="mx-auto mb-3 text-text-muted" />
          <p className="text-text-secondary mb-4">No cities selected</p>
          <Button variant="secondary" onClick={() => setIsSearchOpen(true)}>
            <Plus size={18} className="mr-2" />
            Add Cities
          </Button>
        </Card>
      ) : (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
          }}
        >
          {cities.map((city) => (
            <CityCountdownCard
              key={city.id}
              city={city}
              onRemove={() => toggleCity(city.id)}
            />
          ))}
        </motion.div>
      )}

      {/* Reset Button */}
      {cities.length > 0 && (
        <button
          onClick={resetToDefaults}
          className="w-full text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          Reset to defaults
        </button>
      )}

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-x-4 bottom-0 z-50 max-w-lg mx-auto"
            >
              <div className="bg-surface rounded-t-2xl p-4 pb-8 max-h-[70vh] flex flex-col">
                {/* Search Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-text-primary">Add Cities</h3>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 rounded-full hover:bg-surface-elevated"
                  >
                    <X size={20} className="text-text-muted" />
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative mb-4">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cities..."
                    className="w-full pl-10 pr-4 py-3 bg-surface-elevated rounded-xl border border-border focus:border-purple focus:outline-none text-text-primary"
                    autoFocus
                  />
                </div>

                {/* City List */}
                <div className="flex-1 overflow-y-auto space-y-2">
                  {searchResults.map((city) => {
                    const isSelected = selectedCities.includes(city.id);
                    return (
                      <motion.button
                        key={city.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleCity(city.id)}
                        className={`
                          w-full flex items-center justify-between p-3 rounded-xl transition-colors
                          ${isSelected ? 'bg-purple/20 border border-purple' : 'bg-surface-elevated hover:bg-border/30'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{city.emoji}</span>
                          <div className="text-left">
                            <p className="font-medium text-text-primary">{city.name}</p>
                            <p className="text-sm text-text-muted">{city.country}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <Check size={20} className="text-purple" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Selected count */}
                <div className="mt-4 text-center text-sm text-text-muted">
                  {selectedCities.length} cities selected
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CityCountdownCardProps {
  city: City;
  onRemove: () => void;
}

function CityCountdownCard({ city, onRemove }: CityCountdownCardProps) {
  const countdown = useTimezoneCountdown(city.timezone);
  const currentTime = useTimezoneTime(city.timezone);
  const { fireSmall } = useConfetti();

  // Trigger confetti when this city hits New Year
  const [hasCelebrated, setHasCelebrated] = useState(false);

  if (countdown.isNewYear && !hasCelebrated) {
    setHasCelebrated(true);
    fireSmall();
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
      }}
    >
      <Card
        variant={countdown.isNewYear ? 'gradient' : 'glass'}
        className={`relative overflow-hidden ${countdown.isNewYear ? 'border-gold' : ''}`}
      >
        {/* Celebrating animation */}
        {countdown.isNewYear && (
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-gold/20 via-magenta/20 to-purple/20"
          />
        )}

        <div className="relative flex items-center justify-between">
          {/* City Info */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">{city.emoji}</span>
            <div>
              <p className="font-bold text-text-primary">{city.name}</p>
              <div className="flex items-center gap-1 text-sm text-text-muted">
                <Clock size={12} />
                <span>{currentTime}</span>
              </div>
            </div>
          </div>

          {/* Countdown or Celebrating */}
          {countdown.isNewYear ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20"
            >
              <PartyPopper size={16} className="text-gold" />
              <span className="font-bold text-gold text-sm">2026!</span>
            </motion.div>
          ) : (
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm font-mono">
                <CountdownUnit value={countdown.days} label="d" />
                <span className="text-text-muted">:</span>
                <CountdownUnit value={countdown.hours} label="h" />
                <span className="text-text-muted">:</span>
                <CountdownUnit value={countdown.minutes} label="m" />
                <span className="text-text-muted">:</span>
                <CountdownUnit value={countdown.seconds} label="s" />
              </div>
            </div>
          )}

          {/* Remove button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="ml-2 p-1 rounded-full hover:bg-surface-elevated transition-colors"
          >
            <X size={16} className="text-text-muted" />
          </button>
        </div>
      </Card>
    </motion.div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <span className="text-text-primary">
      {value.toString().padStart(2, '0')}
      <span className="text-text-muted text-xs">{label}</span>
    </span>
  );
}
