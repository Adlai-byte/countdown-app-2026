import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2, Share2, Image } from 'lucide-react';
import { usePhotoBoothStore } from '@/stores/photoBoothStore';
import type { Photo, FilterType } from '@/stores/photoBoothStore';
import { Button, Card, Modal } from '@/components/ui';

const FILTERS: Record<FilterType, string> = {
  none: '',
  warm: 'sepia(0.3) saturate(1.3)',
  cool: 'saturate(0.9) hue-rotate(10deg)',
  vintage: 'sepia(0.5) contrast(1.1)',
  sparkle: 'brightness(1.1) contrast(1.1)',
};

export function PhotoGallery() {
  const { photos, deletePhoto, clearPhotos } = usePhotoBoothStore();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDownload = (photo: Photo) => {
    const link = document.createElement('a');
    link.download = `photobooth-${photo.id}.png`;
    link.href = photo.dataUrl;
    link.click();
  };

  const handleShare = async (photo: Photo) => {
    try {
      // Convert data URL to blob
      const response = await fetch(photo.dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'photobooth.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My New Year Photo',
          text: 'Check out my photo from the New Year Photo Booth!',
          files: [file],
        });
      } else {
        // Fallback: copy to clipboard or download
        handleDownload(photo);
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleDelete = (id: string) => {
    deletePhoto(id);
    setSelectedPhoto(null);
  };

  if (photos.length === 0) {
    return (
      <Card variant="glass" className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-elevated flex items-center justify-center">
          <Image size={40} className="text-text-muted" />
        </div>
        <h3 className="font-medium text-text-primary mb-2">No photos yet</h3>
        <p className="text-sm text-text-muted">
          Capture or upload photos to see them here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with clear button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {photos.length} photo{photos.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-sm text-magenta hover:text-magenta/80"
        >
          Clear all
        </button>
      </div>

      {/* Photo Grid */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: { staggerChildren: 0.05 },
          },
        }}
      >
        {photos.map((photo) => (
          <motion.div
            key={photo.id}
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1 },
            }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedPhoto(photo)}
            className="aspect-[3/4] rounded-xl overflow-hidden cursor-pointer relative group"
          >
            <img
              src={photo.dataUrl}
              alt="Photo"
              className="w-full h-full object-cover"
              style={{ filter: FILTERS[photo.filter] }}
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(photo);
                }}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30"
              >
                <Download size={20} className="text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(photo.id);
                }}
                className="p-2 rounded-full bg-white/20 hover:bg-magenta/50"
              >
                <Trash2 size={20} className="text-white" />
              </button>
            </div>

            {/* Date badge */}
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/50 text-xs text-white">
              {new Date(photo.createdAt).toLocaleDateString()}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Photo Detail Modal */}
      <Modal isOpen={!!selectedPhoto} onClose={() => setSelectedPhoto(null)}>
        {selectedPhoto && (
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-xl overflow-hidden">
              <img
                src={selectedPhoto.dataUrl}
                alt="Photo"
                className="w-full h-full object-cover"
                style={{ filter: FILTERS[selectedPhoto.filter] }}
              />
            </div>

            <div className="text-center text-sm text-text-muted">
              {new Date(selectedPhoto.createdAt).toLocaleString()}
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => handleDelete(selectedPhoto.id)}
                className="flex-1"
              >
                <Trash2 size={18} className="mr-2" />
                Delete
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleShare(selectedPhoto)}
                className="flex-1"
              >
                <Share2 size={18} className="mr-2" />
                Share
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDownload(selectedPhoto)}
                className="flex-1"
              >
                <Download size={18} className="mr-2" />
                Save
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Clear All Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-magenta/20 flex items-center justify-center">
            <Trash2 size={32} className="text-magenta" />
          </div>
          <h3 className="text-lg font-medium text-text-primary">
            Delete all photos?
          </h3>
          <p className="text-text-secondary">
            This action cannot be undone. All {photos.length} photos will be permanently deleted.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                clearPhotos();
                setShowDeleteConfirm(false);
              }}
              className="flex-1 bg-magenta hover:bg-magenta/90"
            >
              Delete All
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
