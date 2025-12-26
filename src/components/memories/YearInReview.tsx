import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar, Image, X, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, Button, Modal } from '@/components/ui';
import { useConfetti } from '@/hooks/useConfetti';

interface Memory {
  id: string;
  imageUrl: string;
  caption: string;
  month: number;
  year: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function YearInReview() {
  const [memories, setMemories] = useState<Memory[]>(() => {
    const saved = localStorage.getItem('yearInReview2024');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [slideshowMode, setSlideshowMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [newMemory, setNewMemory] = useState({ imageUrl: '', caption: '', month: new Date().getMonth() });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fireCelebration } = useConfetti();

  const saveMemories = (updatedMemories: Memory[]) => {
    localStorage.setItem('yearInReview2024', JSON.stringify(updatedMemories));
    setMemories(updatedMemories);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewMemory((prev) => ({ ...prev, imageUrl: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const addMemory = () => {
    if (!newMemory.imageUrl) return;

    const memory: Memory = {
      id: Date.now().toString(),
      imageUrl: newMemory.imageUrl,
      caption: newMemory.caption,
      month: newMemory.month,
      year: 2024,
    };

    saveMemories([...memories, memory].sort((a, b) => a.month - b.month));
    setNewMemory({ imageUrl: '', caption: '', month: new Date().getMonth() });
    setShowAddModal(false);
    fireCelebration();
  };

  const deleteMemory = (id: string) => {
    saveMemories(memories.filter((m) => m.id !== id));
  };

  const startSlideshow = () => {
    if (memories.length === 0) return;
    setCurrentSlide(0);
    setSlideshowMode(true);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % memories.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + memories.length) % memories.length);
  };

  // Group memories by month
  const memoriesByMonth = memories.reduce((acc, memory) => {
    if (!acc[memory.month]) acc[memory.month] = [];
    acc[memory.month].push(memory);
    return acc;
  }, {} as Record<number, Memory[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">2024 in Review</h2>
          <p className="text-text-secondary">Your year in memories</p>
        </div>
        <div className="flex gap-2">
          {memories.length > 0 && (
            <Button variant="secondary" onClick={startSlideshow}>
              <Play size={18} className="mr-2" />
              Slideshow
            </Button>
          )}
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} className="mr-2" />
            Add Memory
          </Button>
        </div>
      </div>

      {/* Timeline */}
      {memories.length === 0 ? (
        <Card variant="glass" className="p-8 text-center">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-xl font-bold text-text-primary mb-2">No memories yet</h3>
          <p className="text-text-secondary mb-4">
            Add your favorite moments from 2024!
          </p>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} className="mr-2" />
            Add Your First Memory
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {MONTHS.map((monthName, monthIndex) => {
            const monthMemories = memoriesByMonth[monthIndex];
            if (!monthMemories) return null;

            return (
              <motion.div
                key={monthIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: monthIndex * 0.05 }}
              >
                {/* Month Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple to-magenta flex items-center justify-center">
                    <Calendar size={18} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">{monthName}</h3>
                </div>

                {/* Memories Grid */}
                <div className="grid grid-cols-2 gap-3 pl-12">
                  {monthMemories.map((memory) => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <Card padding="none" className="overflow-hidden">
                        <img
                          src={memory.imageUrl}
                          alt={memory.caption}
                          className="w-full aspect-square object-cover"
                        />
                        {memory.caption && (
                          <div className="p-2 bg-surface-elevated">
                            <p className="text-xs text-text-secondary line-clamp-2">
                              {memory.caption}
                            </p>
                          </div>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => deleteMemory(memory.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {memories.length > 0 && (
        <Card variant="glass" className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-purple">{memories.length}</p>
              <p className="text-xs text-text-muted">Memories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gold">{Object.keys(memoriesByMonth).length}</p>
              <p className="text-xs text-text-muted">Months</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan">2024</p>
              <p className="text-xs text-text-muted">Year</p>
            </div>
          </div>
        </Card>
      )}

      {/* Add Memory Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-text-primary">Add Memory</h3>

          {/* Image Upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative aspect-video rounded-xl border-2 border-dashed
              flex items-center justify-center cursor-pointer
              ${newMemory.imageUrl
                ? 'border-purple'
                : 'border-border hover:border-purple/50'}
            `}
          >
            {newMemory.imageUrl ? (
              <>
                <img
                  src={newMemory.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewMemory((prev) => ({ ...prev, imageUrl: '' }));
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <div className="text-center">
                <Image size={32} className="mx-auto text-text-muted mb-2" />
                <p className="text-sm text-text-secondary">Tap to upload photo</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Month Selector */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">Month</label>
            <select
              value={newMemory.month}
              onChange={(e) => setNewMemory((prev) => ({ ...prev, month: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 bg-surface-elevated rounded-xl border border-border focus:border-purple focus:outline-none text-text-primary"
            >
              {MONTHS.map((month, i) => (
                <option key={i} value={i}>{month}</option>
              ))}
            </select>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">Caption (optional)</label>
            <input
              type="text"
              value={newMemory.caption}
              onChange={(e) => setNewMemory((prev) => ({ ...prev, caption: e.target.value }))}
              placeholder="What happened?"
              className="w-full px-4 py-3 bg-surface-elevated rounded-xl border border-border focus:border-purple focus:outline-none text-text-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={addMemory}
              disabled={!newMemory.imageUrl}
              className="flex-1"
            >
              Add Memory
            </Button>
          </div>
        </div>
      </Modal>

      {/* Slideshow Modal */}
      <AnimatePresence>
        {slideshowMode && memories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            {/* Close Button */}
            <button
              onClick={() => setSlideshowMode(false)}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-10"
            >
              <X size={24} />
            </button>

            {/* Navigation */}
            <button
              onClick={prevSlide}
              className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 z-10"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 z-10"
            >
              <ChevronRight size={24} />
            </button>

            {/* Slide */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="max-w-2xl w-full px-8"
              >
                <img
                  src={memories[currentSlide].imageUrl}
                  alt={memories[currentSlide].caption}
                  className="w-full rounded-2xl shadow-2xl"
                />
                <div className="mt-4 text-center">
                  <p className="text-white/60 text-sm">
                    {MONTHS[memories[currentSlide].month]} 2024
                  </p>
                  {memories[currentSlide].caption && (
                    <p className="text-white text-lg mt-2">
                      {memories[currentSlide].caption}
                    </p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {memories.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentSlide ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
