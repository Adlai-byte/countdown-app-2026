import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Pencil, BookOpen } from 'lucide-react';
import { MessageInput } from '@/components/guestbook/MessageInput';
import { DrawingCanvas } from '@/components/guestbook/DrawingCanvas';
import { MessageList } from '@/components/guestbook/MessageList';
import { useGuestbookStore } from '@/stores/guestbookStore';

type TabType = 'write' | 'draw' | 'messages';

export function GuestBookPage() {
  const [activeTab, setActiveTab] = useState<TabType>('write');
  const messageCount = useGuestbookStore((state) => state.messages.length);

  const tabs: { id: TabType; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'write', label: 'Write', icon: MessageSquare },
    { id: 'draw', label: 'Draw', icon: Pencil },
    { id: 'messages', label: 'Messages', icon: BookOpen, badge: messageCount },
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
            Guest Book
          </h1>
          <p className="text-text-secondary">
            Leave a message for the New Year!
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
              <span className="hidden sm:inline">{tab.label}</span>
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
            {activeTab === 'write' && <MessageInput />}
            {activeTab === 'draw' && <DrawingCanvas />}
            {activeTab === 'messages' && <MessageList />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
