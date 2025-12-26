import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image } from 'lucide-react';
import { usePhotoBoothStore } from '@/stores/photoBoothStore';
import { PhotoEditor } from './PhotoEditor';
import { Card } from '@/components/ui';

export function PhotoUpload() {
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedFilter, selectedFrame, addPhoto } = usePhotoBoothStore();

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedPhoto(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleSave = () => {
    if (uploadedPhoto) {
      addPhoto({
        dataUrl: uploadedPhoto,
        filter: selectedFilter,
        frame: selectedFrame,
      });
      setUploadedPhoto(null);
    }
  };

  const handleDownload = () => {
    if (uploadedPhoto) {
      const link = document.createElement('a');
      link.download = `photobooth-${Date.now()}.png`;
      link.href = uploadedPhoto;
      link.click();
    }
  };

  const handleClear = () => {
    setUploadedPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (uploadedPhoto) {
    return (
      <PhotoEditor
        photoUrl={uploadedPhoto}
        onSave={handleSave}
        onDownload={handleDownload}
        onRetake={handleClear}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          aspect-[3/4] rounded-2xl border-2 border-dashed cursor-pointer
          flex flex-col items-center justify-center gap-4
          transition-colors
          ${
            isDragging
              ? 'border-gold bg-gold/10'
              : 'border-border hover:border-purple bg-surface'
          }
        `}
      >
        <motion.div
          animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center
            ${isDragging ? 'bg-gold/20' : 'bg-purple/20'}
          `}
        >
          {isDragging ? (
            <Image size={40} className="text-gold" />
          ) : (
            <Upload size={40} className="text-purple-light" />
          )}
        </motion.div>

        <div className="text-center px-4">
          <p className="font-medium text-text-primary mb-1">
            {isDragging ? 'Drop your photo here' : 'Upload a photo'}
          </p>
          <p className="text-sm text-text-muted">
            Drag and drop or click to browse
          </p>
        </div>

        <div className="flex gap-2 text-xs text-text-muted">
          <span className="px-2 py-1 bg-surface-elevated rounded">JPG</span>
          <span className="px-2 py-1 bg-surface-elevated rounded">PNG</span>
          <span className="px-2 py-1 bg-surface-elevated rounded">WEBP</span>
        </div>
      </motion.div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Tips */}
      <Card variant="glass">
        <h3 className="font-medium text-text-primary mb-2 flex items-center gap-2">
          <span className="text-gold">*</span>
          Tips for great photos
        </h3>
        <ul className="text-sm text-text-secondary space-y-1">
          <li>* Use well-lit photos for best results</li>
          <li>* Portrait orientation works best</li>
          <li>* Apply filters and frames to celebrate!</li>
        </ul>
      </Card>
    </div>
  );
}
