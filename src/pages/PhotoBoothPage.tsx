import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Images } from 'lucide-react';
import { CameraCapture } from '@/components/photobooth/CameraCapture';
import { PhotoUpload } from '@/components/photobooth/PhotoUpload';
import { PhotoGallery } from '@/components/photobooth/PhotoGallery';
import { usePhotoBoothStore } from '@/stores/photoBoothStore';

type TabType = 'camera' | 'upload' | 'gallery';

export function PhotoBoothPage() {
  const [activeTab, setActiveTab] = useState<TabType>('camera');
  const photos = usePhotoBoothStore((state) => state.photos);

  const tabs = [
    { id: 'camera' as const, label: 'Camera', icon: Camera },
    { id: 'upload' as const, label: 'Upload', icon: Upload },
    { id: 'gallery' as const, label: 'Gallery', icon: Images, badge: photos.length },
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
            Photo Booth
          </h1>
          <p className="text-text-secondary">
            Capture memories with New Year filters
          </p>
        </motion.div>

        {/* Tab Selector */}
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
                  {tab.badge > 9 ? '9+' : tab.badge}
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
            {activeTab === 'camera' && <CameraCapture />}
            {activeTab === 'upload' && <PhotoUpload />}
            {activeTab === 'gallery' && <PhotoGallery />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
