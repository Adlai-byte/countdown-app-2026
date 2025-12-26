import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, Copy, Check, X, Image } from 'lucide-react';
import { generateCountdownWidget, shareWidget, downloadWidget } from '@/utils/widgetGenerator';
import { Button } from '@/components/ui';

interface CountdownWidgetProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownWidget({ days, hours, minutes, seconds }: CountdownWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateCountdownWidget(
        { days, hours, minutes, seconds },
        { theme: 'gradient', showSeconds: true }
      );
      setPreviewUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate widget:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    handleGenerate();
  };

  const handleShare = async () => {
    if (!previewUrl) return;

    const result = await shareWidget(previewUrl);
    if (result.method === 'clipboard') {
      setShareStatus('Copied to clipboard!');
    } else if (result.method === 'download') {
      setShareStatus('Downloaded!');
    } else {
      setShareStatus('Shared!');
    }

    setTimeout(() => setShareStatus(null), 2000);
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    downloadWidget(previewUrl);
    setShareStatus('Downloaded!');
    setTimeout(() => setShareStatus(null), 2000);
  };

  const handleCopy = async () => {
    if (!previewUrl) return;

    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setShareStatus('Copied to clipboard!');
    } catch {
      setShareStatus('Copy not supported');
    }

    setTimeout(() => setShareStatus(null), 2000);
  };

  return (
    <>
      {/* Share Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-elevated hover:bg-border/30 text-text-secondary transition-colors"
      >
        <Share2 size={18} />
        <span className="text-sm font-medium">Share Countdown</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto"
            >
              <div className="bg-surface rounded-2xl p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <Image size={20} className="text-purple" />
                    Share Countdown
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-surface-elevated transition-colors"
                  >
                    <X size={20} className="text-text-muted" />
                  </button>
                </div>

                {/* Preview */}
                <div className="relative rounded-xl overflow-hidden bg-surface-elevated mb-4">
                  {isGenerating ? (
                    <div className="aspect-[8/5] flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-10 h-10 border-3 border-purple border-t-transparent rounded-full"
                      />
                    </div>
                  ) : previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Countdown Widget Preview"
                      className="w-full aspect-[8/5] object-contain"
                    />
                  ) : (
                    <div className="aspect-[8/5] flex items-center justify-center text-text-muted">
                      Generating preview...
                    </div>
                  )}
                </div>

                {/* Status Message */}
                <AnimatePresence>
                  {shareStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2 mb-4 text-green-400"
                    >
                      <Check size={18} />
                      <span className="text-sm font-medium">{shareStatus}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleShare}
                    disabled={!previewUrl || isGenerating}
                    className="flex-1"
                  >
                    <Share2 size={18} className="mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCopy}
                    disabled={!previewUrl || isGenerating}
                    className="flex-1"
                  >
                    <Copy size={18} className="mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleDownload}
                    disabled={!previewUrl || isGenerating}
                    className="flex-1"
                  >
                    <Download size={18} className="mr-2" />
                    Save
                  </Button>
                </div>

                {/* Regenerate */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full mt-4 text-sm text-text-muted hover:text-text-secondary transition-colors disabled:opacity-50"
                >
                  Regenerate with current time
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
