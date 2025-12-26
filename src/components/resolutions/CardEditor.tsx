import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download, Share2, Save } from 'lucide-react';
import { CARD_TEMPLATES, generateResolutionCard } from '@/utils/cardComposer';
import { useResolutionStore } from '@/stores/resolutionStore';
import { useConfetti } from '@/hooks/useConfetti';
import { Button } from '@/components/ui';

export function CardEditor() {
  const [text, setText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(CARD_TEMPLATES[0].id);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { addResolution } = useResolutionStore();
  const { fireSmall } = useConfetti();

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    try {
      const dataUrl = await generateResolutionCard(text.trim(), selectedTemplate);
      setPreviewUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate card:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!text.trim() || !previewUrl) return;

    addResolution({
      text: text.trim(),
      templateId: selectedTemplate,
      dataUrl: previewUrl,
    });

    fireSmall();
    setText('');
    setPreviewUrl(null);
  };

  const handleDownload = () => {
    if (!previewUrl) return;

    const link = document.createElement('a');
    link.download = `my-resolution-2026-${Date.now()}.png`;
    link.href = previewUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!previewUrl) return;

    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], 'my-resolution-2026.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'My 2026 Resolution',
          text: 'Check out my New Year resolution!',
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Template Selector */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Choose a Style
        </label>
        <div className="grid grid-cols-3 gap-3">
          {CARD_TEMPLATES.map((template) => (
            <motion.button
              key={template.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedTemplate(template.id);
                setPreviewUrl(null);
              }}
              className={`
                relative p-4 rounded-xl transition-all
                ${selectedTemplate === template.id ? 'ring-2 ring-gold' : ''}
              `}
              style={{
                background: `linear-gradient(135deg, ${template.gradientStart}, ${template.gradientEnd})`,
              }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: template.textColor }}
              >
                {template.name}
              </span>
              {selectedTemplate === template.id && (
                <motion.div
                  layoutId="templateIndicator"
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold flex items-center justify-center"
                >
                  <Sparkles size={12} className="text-background" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Resolution Text */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Your Resolution
        </label>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setPreviewUrl(null);
          }}
          placeholder="In 2026, I will..."
          rows={4}
          maxLength={200}
          className="w-full px-4 py-3 bg-surface-elevated rounded-xl border border-border focus:border-purple focus:outline-none text-text-primary placeholder:text-text-muted resize-none"
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs text-text-muted">{text.length}/200</span>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        variant="secondary"
        onClick={handleGenerate}
        disabled={!text.trim() || isGenerating}
        isLoading={isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          'Generating...'
        ) : (
          <>
            <Sparkles size={18} className="mr-2" />
            Generate Card
          </>
        )}
      </Button>

      {/* Preview */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <img
                src={previewUrl}
                alt="Resolution Card Preview"
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button variant="secondary" onClick={handleShare}>
                <Share2 size={18} className="mr-2" />
                Share
              </Button>
              <Button variant="secondary" onClick={handleDownload}>
                <Download size={18} className="mr-2" />
                Download
              </Button>
              <Button variant="primary" onClick={handleSave}>
                <Save size={18} className="mr-2" />
                Save
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions */}
      {!text && (
        <div className="space-y-2">
          <p className="text-sm text-text-muted">Need inspiration?</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Exercise more',
              'Learn a new skill',
              'Save money',
              'Read more books',
              'Travel somewhere new',
              'Be more mindful',
            ].map((suggestion) => (
              <motion.button
                key={suggestion}
                whileTap={{ scale: 0.95 }}
                onClick={() => setText(`In 2026, I will ${suggestion.toLowerCase()}`)}
                className="px-3 py-1 text-sm rounded-full bg-surface-elevated text-text-secondary hover:bg-border/30 transition-colors"
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
