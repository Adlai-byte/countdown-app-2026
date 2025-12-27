import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Share2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui';

interface RoomCodeDisplayProps {
  code: string;
  showQR?: boolean;
  compact?: boolean;
}

export function RoomCodeDisplay({ code, showQR = true, compact = false }: RoomCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const roomUrl = `${window.location.origin}?join=${code}`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareRoom = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my NYE Party!',
          text: `Join my New Year's Eve party! Room code: ${code}`,
          url: roomUrl,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-secondary">Room:</span>
        <button
          onClick={copyCode}
          className="font-mono font-bold text-gold hover:text-gold-light transition-colors flex items-center gap-1"
        >
          {code}
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Room code display */}
      <div className="bg-surface-elevated rounded-xl p-4 text-center">
        <p className="text-sm text-text-secondary mb-2">Room Code</p>
        <div className="flex items-center justify-center gap-2">
          <span
            className="font-mono text-3xl font-bold tracking-wider text-gold"
            style={{ letterSpacing: '0.2em' }}
          >
            {code}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={copyCode}
          className="flex-1"
        >
          {copied ? (
            <>
              <Check size={16} className="mr-2 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy size={16} className="mr-2" />
              Copy Code
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          onClick={shareRoom}
          className="flex-1"
        >
          <Share2 size={16} className="mr-2" />
          Share
        </Button>

        {showQR && (
          <Button
            variant="secondary"
            onClick={() => setShowQRModal(true)}
          >
            <QrCode size={16} />
          </Button>
        )}
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-text-primary text-center mb-4">
                Scan to Join
              </h3>

              <div className="bg-white rounded-xl p-4 mb-4">
                <QRCodeSVG
                  value={roomUrl}
                  size={200}
                  level="H"
                  includeMargin
                  className="w-full h-auto"
                />
              </div>

              <p className="text-center text-text-secondary text-sm mb-4">
                Room Code: <span className="font-mono font-bold text-gold">{code}</span>
              </p>

              <Button
                variant="secondary"
                onClick={() => setShowQRModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
