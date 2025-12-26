import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, RefreshCw, ExternalLink, Calendar, Maximize2 } from 'lucide-react';
import { Card, Button, Modal } from '@/components/ui';
import { fetchNasaApod, type NasaApod } from '@/services/partyApi';

export function SpacePicture() {
  const [apod, setApod] = useState<NasaApod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const loadApod = async () => {
    setLoading(true);
    setError(false);

    try {
      const data = await fetchNasaApod();
      setApod(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApod();
  }, []);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Rocket className="text-cyan" />
            Space Today
          </h2>
          <p className="text-sm text-text-secondary">NASA Astronomy Picture of the Day</p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadApod} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <Card variant="glass" className="p-8">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-5xl inline-block"
            >
              🌍
            </motion.div>
            <p className="text-text-secondary mt-4">Fetching from NASA...</p>
          </div>
        </Card>
      ) : error ? (
        <Card variant="glass" className="p-8 text-center">
          <div className="text-5xl mb-4">🛸</div>
          <h3 className="text-lg font-bold text-text-primary mb-2">Houston, we have a problem</h3>
          <p className="text-text-secondary mb-4">Couldn't reach NASA servers</p>
          <Button variant="primary" onClick={loadApod}>
            <RefreshCw size={18} className="mr-2" />
            Try Again
          </Button>
        </Card>
      ) : apod && (
        <>
          <Card variant="glass" padding="none" className="overflow-hidden">
            {/* Image/Video */}
            {apod.media_type === 'video' ? (
              <div className="aspect-video">
                <iframe
                  src={apod.url}
                  title={apod.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="relative group">
                <img
                  src={apod.url}
                  alt={apod.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <button
                    onClick={() => setShowFullscreen(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-3 rounded-full bg-white/20 backdrop-blur-sm"
                  >
                    <Maximize2 size={24} className="text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="p-4 space-y-3">
              <h3 className="text-lg font-bold text-text-primary">{apod.title}</h3>

              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Calendar size={14} />
                <span>{formatDate(apod.date)}</span>
                {apod.copyright && (
                  <>
                    <span>•</span>
                    <span>© {apod.copyright}</span>
                  </>
                )}
              </div>

              <p className="text-sm text-text-secondary line-clamp-4">
                {apod.explanation}
              </p>

              {apod.hdurl && (
                <a
                  href={apod.hdurl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-cyan hover:underline"
                >
                  <ExternalLink size={14} />
                  View HD Image
                </a>
              )}
            </div>
          </Card>

          {/* Space Facts */}
          <Card variant="glass" className="p-4">
            <h4 className="text-sm font-medium text-text-primary mb-3">🌟 NYE Space Fun Facts</h4>
            <ul className="text-sm text-text-secondary space-y-2">
              <li>• Earth travels ~67,000 mph around the Sun</li>
              <li>• We travel ~584 million miles each year!</li>
              <li>• At midnight, we'll be at a new point in space</li>
              <li>• The stars you see are years in the past</li>
            </ul>
          </Card>

          {/* API Credit */}
          <Card variant="glass" className="p-3 text-center">
            <p className="text-xs text-text-muted">
              Powered by NASA Open APIs
            </p>
          </Card>

          {/* Fullscreen Modal */}
          <Modal isOpen={showFullscreen} onClose={() => setShowFullscreen(false)}>
            <div className="space-y-4">
              <img
                src={apod.hdurl || apod.url}
                alt={apod.title}
                className="w-full rounded-xl"
              />
              <h3 className="text-lg font-bold text-text-primary">{apod.title}</h3>
              <p className="text-sm text-text-secondary max-h-[200px] overflow-y-auto">
                {apod.explanation}
              </p>
              <Button variant="ghost" onClick={() => setShowFullscreen(false)} className="w-full">
                Close
              </Button>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
