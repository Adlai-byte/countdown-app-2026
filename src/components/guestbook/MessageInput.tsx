import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { useGuestbookStore } from '@/stores/guestbookStore';
import { useConfetti } from '@/hooks/useConfetti';
import { Button } from '@/components/ui';

export function MessageInput() {
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addMessage } = useGuestbookStore();
  const { fireSmall } = useConfetti();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !author.trim()) return;

    setIsSubmitting(true);

    // Simulate a brief delay for effect
    await new Promise((resolve) => setTimeout(resolve, 300));

    addMessage({
      type: 'text',
      content: message.trim(),
      author: author.trim(),
    });

    // Celebrate!
    fireSmall();

    // Reset form
    setMessage('');
    setIsSubmitting(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* Author Input */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Your Name
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Enter your name..."
          maxLength={50}
          className="w-full px-4 py-3 bg-surface-elevated rounded-xl border border-border focus:border-purple focus:outline-none text-text-primary placeholder:text-text-muted"
        />
      </div>

      {/* Message Input */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Your Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a wish for the New Year..."
          rows={4}
          maxLength={500}
          className="w-full px-4 py-3 bg-surface-elevated rounded-xl border border-border focus:border-purple focus:outline-none text-text-primary placeholder:text-text-muted resize-none"
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs text-text-muted">{message.length}/500</span>
        </div>
      </div>

      {/* Quick Emojis */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-text-muted">Quick add:</span>
        {['🎉', '🥳', '✨', '🎊', '💫', '🌟', '🍾', '🎆'].map((emoji) => (
          <motion.button
            key={emoji}
            type="button"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setMessage((prev) => prev + emoji)}
            className="text-xl hover:bg-surface-elevated p-1 rounded"
          >
            {emoji}
          </motion.button>
        ))}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        disabled={!message.trim() || !author.trim() || isSubmitting}
        isLoading={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          'Sending...'
        ) : (
          <>
            <Send size={18} className="mr-2" />
            Leave Your Message
          </>
        )}
      </Button>

      {/* Tip */}
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Sparkles size={16} className="text-gold" />
        <span>Your message will be saved to this device</span>
      </div>
    </motion.form>
  );
}
