import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { formatShortcut, GLOBAL_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import { FocusTrap } from '@/components/accessibility/FocusTrap';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { category: 'Navigation', items: [
    { ...GLOBAL_SHORTCUTS.NAVIGATE_HOME },
    { ...GLOBAL_SHORTCUTS.NAVIGATE_PHOTO },
    { ...GLOBAL_SHORTCUTS.NAVIGATE_MEMES },
    { ...GLOBAL_SHORTCUTS.NAVIGATE_FUN },
    { ...GLOBAL_SHORTCUTS.NAVIGATE_GUEST },
    { ...GLOBAL_SHORTCUTS.NAVIGATE_GOALS },
    { ...GLOBAL_SHORTCUTS.NAVIGATE_SETTINGS },
  ]},
  { category: 'Actions', items: [
    { ...GLOBAL_SHORTCUTS.TOGGLE_CONFETTI },
    { ...GLOBAL_SHORTCUTS.SHOW_SHORTCUTS },
    { ...GLOBAL_SHORTCUTS.ESCAPE },
  ]},
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
          >
            <FocusTrap active={isOpen}>
              <div className="bg-surface rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple to-magenta flex items-center justify-center">
                      <Keyboard size={20} className="text-white" />
                    </div>
                    <h2 id="shortcuts-title" className="text-lg font-bold text-text-primary">
                      Keyboard Shortcuts
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-surface-elevated transition-colors"
                    aria-label="Close"
                  >
                    <X size={20} className="text-text-muted" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                  {shortcuts.map((section) => (
                    <div key={section.category} className="mb-6 last:mb-0">
                      <h3 className="text-sm font-medium text-text-muted mb-3">
                        {section.category}
                      </h3>
                      <div className="space-y-2">
                        {section.items.map((shortcut) => (
                          <div
                            key={shortcut.key}
                            className="flex items-center justify-between p-2 rounded-lg bg-surface-elevated/50"
                          >
                            <span className="text-text-secondary text-sm">
                              {shortcut.description}
                            </span>
                            <kbd className="px-2 py-1 rounded bg-border/50 text-text-primary text-xs font-mono">
                              {formatShortcut(shortcut)}
                            </kbd>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border/50 bg-surface-elevated/30">
                  <p className="text-xs text-text-muted text-center">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-border/50 text-text-secondary font-mono">Esc</kbd> to close
                  </p>
                </div>
              </div>
            </FocusTrap>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
