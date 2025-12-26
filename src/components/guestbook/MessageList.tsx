import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, MessageSquare, Palette, Clock, User } from 'lucide-react';
import { useGuestbookStore, type GuestMessage } from '@/stores/guestbookStore';
import { Card, Button, Modal } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';

export function MessageList() {
  const { messages, deleteMessage, clearAll } = useGuestbookStore();
  const [selectedMessage, setSelectedMessage] = useState<GuestMessage | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (messages.length === 0) {
    return (
      <Card variant="glass" className="text-center py-12">
        <MessageSquare size={48} className="mx-auto mb-4 text-text-muted" />
        <h3 className="font-medium text-text-primary mb-2">No messages yet</h3>
        <p className="text-sm text-text-muted">
          Be the first to leave a New Year wish!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="text-sm text-magenta hover:text-magenta/80 transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Messages Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.05 } },
        }}
      >
        {messages.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            onView={() => setSelectedMessage(message)}
            onDelete={() => deleteMessage(message.id)}
          />
        ))}
      </motion.div>

      {/* View Message Modal */}
      <Modal isOpen={!!selectedMessage} onClose={() => setSelectedMessage(null)}>
        {selectedMessage && (
          <div className="space-y-4">
            {selectedMessage.type === 'drawing' ? (
              <div className="rounded-xl overflow-hidden">
                <img
                  src={selectedMessage.content}
                  alt="Drawing"
                  className="w-full"
                />
              </div>
            ) : (
              <div className="p-4 bg-surface-elevated rounded-xl">
                <p className="text-text-primary text-lg whitespace-pre-wrap">
                  {selectedMessage.content}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <User size={14} />
                <span>{selectedMessage.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>
                  {formatDistanceToNow(new Date(selectedMessage.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={() => {
                deleteMessage(selectedMessage.id);
                setSelectedMessage(null);
              }}
              className="w-full text-magenta hover:bg-magenta/10"
            >
              <Trash2 size={18} className="mr-2" />
              Delete Message
            </Button>
          </div>
        )}
      </Modal>

      {/* Clear All Confirmation Modal */}
      <Modal isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-magenta/20 flex items-center justify-center">
            <Trash2 size={32} className="text-magenta" />
          </div>
          <h3 className="text-lg font-medium text-text-primary">
            Delete all messages?
          </h3>
          <p className="text-text-secondary">
            This will permanently delete all {messages.length} messages from
            the guest book.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setShowClearConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                clearAll();
                setShowClearConfirm(false);
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

interface MessageCardProps {
  message: GuestMessage;
  onView: () => void;
  onDelete: () => void;
}

function MessageCard({ message, onView, onDelete }: MessageCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ scale: 1.02 }}
      onClick={onView}
      className="cursor-pointer"
    >
      <Card variant="glass" className="relative overflow-hidden group">
        {message.type === 'drawing' ? (
          <div className="aspect-square rounded-lg overflow-hidden mb-3">
            <img
              src={message.content}
              alt="Drawing"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-text-primary line-clamp-4 whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        )}

        {/* Author and time */}
        <div className="flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-1">
            {message.type === 'drawing' ? (
              <Palette size={12} />
            ) : (
              <MessageSquare size={12} />
            )}
            <span className="font-medium truncate max-w-[80px]">
              {message.author}
            </span>
          </div>
          <span>
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        {/* Delete button (appears on hover) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-magenta/50"
        >
          <Trash2 size={14} />
        </button>
      </Card>
    </motion.div>
  );
}
