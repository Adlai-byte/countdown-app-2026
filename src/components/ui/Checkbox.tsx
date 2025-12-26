import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { box: 'w-5 h-5', icon: 12 },
  md: { box: 'w-6 h-6', icon: 14 },
  lg: { box: 'w-7 h-7', icon: 16 },
};

export function Checkbox({
  checked,
  onChange,
  label,
  size = 'md',
}: CheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <motion.button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          ${sizes[size].box}
          rounded-lg border-2 flex items-center justify-center
          transition-colors duration-200
          ${
            checked
              ? 'bg-gradient-to-r from-purple-500 to-magenta border-transparent'
              : 'border-border bg-surface-elevated group-hover:border-purple-500/50'
          }
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          initial={false}
          animate={{
            scale: checked ? 1 : 0,
            opacity: checked ? 1 : 0,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <Check size={sizes[size].icon} className="text-white" strokeWidth={3} />
        </motion.div>
      </motion.button>
      {label && (
        <span
          className={`
            text-text-primary transition-all duration-200
            ${checked ? 'line-through text-text-muted' : ''}
          `}
        >
          {label}
        </span>
      )}
    </label>
  );
}
