import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Copy, Check, Share2, Download } from 'lucide-react';
import { Card, Button } from '@/components/ui';

export function PartyQRCode() {
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  // Get the current URL or use a custom invite URL
  const partyUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteMessage = encodeURIComponent("Join my New Year's Eve party! 🎉🥂");

  useEffect(() => {
    // Generate QR code using free API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(partyUrl)}&bgcolor=1a1a2e&color=ffd700`;
    setQrUrl(qrApiUrl);
  }, [partyUrl]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(partyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "New Year's Eve Party Invite",
          text: "Join my New Year's Eve party! 🎉🥂",
          url: partyUrl,
        });
      } catch {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = 'nye-party-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card variant="glass" className="p-4">
      <div className="text-center">
        <h3 className="text-lg font-bold text-text-primary flex items-center justify-center gap-2 mb-4">
          <QrCode className="text-gold" size={20} />
          Share Party
        </h3>

        {/* QR Code */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block p-4 bg-white rounded-2xl mb-4"
        >
          {qrUrl ? (
            <img
              src={qrUrl}
              alt="Party QR Code"
              className="w-40 h-40"
            />
          ) : (
            <div className="w-40 h-40 flex items-center justify-center">
              <QrCode size={64} className="text-gray-300 animate-pulse" />
            </div>
          )}
        </motion.div>

        <p className="text-sm text-text-secondary mb-4">
          Scan to join the party!
        </p>

        {/* URL Display */}
        <div className="bg-surface-elevated rounded-xl p-3 mb-4 flex items-center gap-2">
          <span className="text-xs text-text-muted flex-1 truncate">
            {partyUrl}
          </span>
          <button
            onClick={copyLink}
            className="p-1.5 rounded-lg hover:bg-border/50 transition-colors"
          >
            {copied ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <Copy size={16} className="text-text-muted" />
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={downloadQR} className="flex-1">
            <Download size={16} className="mr-2" />
            Save QR
          </Button>
          <Button variant="primary" onClick={shareLink} className="flex-1">
            <Share2 size={16} className="mr-2" />
            Share
          </Button>
        </div>

        {/* Social Share Links */}
        <div className="mt-4 flex justify-center gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${inviteMessage}&url=${encodeURIComponent(partyUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-surface-elevated hover:bg-border/50 transition-colors"
          >
            <span className="text-lg">𝕏</span>
          </a>
          <a
            href={`https://wa.me/?text=${inviteMessage}%20${encodeURIComponent(partyUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-surface-elevated hover:bg-border/50 transition-colors"
          >
            <span className="text-lg">💬</span>
          </a>
          <a
            href={`mailto:?subject=NYE Party Invite&body=${inviteMessage}%20${encodeURIComponent(partyUrl)}`}
            className="p-2 rounded-full bg-surface-elevated hover:bg-border/50 transition-colors"
          >
            <span className="text-lg">📧</span>
          </a>
        </div>
      </div>
    </Card>
  );
}
