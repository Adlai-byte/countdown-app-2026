import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Library, Trash2 } from 'lucide-react';
import { CardEditor } from '@/components/resolutions/CardEditor';
import { ResolutionCard } from '@/components/resolutions/ResolutionCard';
import { useResolutionStore } from '@/stores/resolutionStore';
import { Card, Button, Modal } from '@/components/ui';

type TabType = 'create' | 'gallery';

export function ResolutionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const { resolutions, deleteResolution, clearAll } = useResolutionStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const tabs: { id: TabType; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'create', label: 'Create', icon: Sparkles },
    { id: 'gallery', label: 'My Cards', icon: Library, badge: resolutions.length },
  ];

  return (
    <div className="flex-1 pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1
            className="text-2xl font-bold text-text-primary"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Resolution Cards
          </h1>
          <p className="text-text-secondary">
            Create beautiful cards for your 2026 goals
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 p-1 bg-surface rounded-xl"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg
                font-medium text-sm transition-all relative
                ${
                  activeTab === tab.id
                    ? 'bg-purple text-white'
                    : 'text-text-muted hover:text-text-secondary'
                }
              `}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`
                    absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center
                    text-xs font-bold rounded-full
                    ${activeTab === tab.id ? 'bg-gold text-background' : 'bg-purple text-white'}
                  `}
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'create' && <CardEditor />}
            {activeTab === 'gallery' && (
              <div className="space-y-4">
                {resolutions.length === 0 ? (
                  <Card variant="glass" className="text-center py-12">
                    <Library size={48} className="mx-auto mb-4 text-text-muted" />
                    <h3 className="font-medium text-text-primary mb-2">
                      No resolution cards yet
                    </h3>
                    <p className="text-sm text-text-muted mb-4">
                      Create your first resolution card to get started!
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => setActiveTab('create')}
                    >
                      <Sparkles size={18} className="mr-2" />
                      Create Card
                    </Button>
                  </Card>
                ) : (
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-text-secondary">
                        {resolutions.length} card{resolutions.length !== 1 ? 's' : ''}
                      </p>
                      <button
                        onClick={() => setShowClearConfirm(true)}
                        className="text-sm text-magenta hover:text-magenta/80 transition-colors"
                      >
                        Clear all
                      </button>
                    </div>

                    {/* Cards Grid */}
                    <motion.div
                      className="grid grid-cols-2 gap-4"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: { transition: { staggerChildren: 0.05 } },
                      }}
                    >
                      {resolutions.map((resolution) => (
                        <ResolutionCard
                          key={resolution.id}
                          resolution={resolution}
                          onDelete={deleteResolution}
                        />
                      ))}
                    </motion.div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Clear All Confirmation Modal */}
        <Modal isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)}>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-magenta/20 flex items-center justify-center">
              <Trash2 size={32} className="text-magenta" />
            </div>
            <h3 className="text-lg font-medium text-text-primary">
              Delete all resolution cards?
            </h3>
            <p className="text-text-secondary">
              This will permanently delete all {resolutions.length} cards.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  clearAll();
                  setShowClearConfirm(false);
                }}
                className="flex-1 bg-magenta hover:bg-magenta/90"
              >
                Delete All
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
