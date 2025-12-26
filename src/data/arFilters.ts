/**
 * AR Filter Definitions
 */

export interface ARFilter {
  id: string;
  name: string;
  type: 'hat' | 'glasses' | 'crown' | 'headband' | 'mask';
  // Positioning relative to face landmarks
  anchor: 'forehead' | 'eyes' | 'nose' | 'mouth' | 'fullface';
  // Offset from anchor point (percentage of face size)
  offsetY: number;
  // Scale relative to face width
  scale: number;
  // Filter color for rendering (or use SVG)
  color?: string;
  // Emoji to use for simple rendering
  emoji?: string;
}

export const AR_FILTERS: ARFilter[] = [
  {
    id: 'none',
    name: 'None',
    type: 'hat',
    anchor: 'forehead',
    offsetY: 0,
    scale: 1,
  },
  {
    id: 'party-hat',
    name: 'Party Hat',
    type: 'hat',
    anchor: 'forehead',
    offsetY: -0.8,
    scale: 0.6,
    emoji: '\ud83e\udd73', // Party face emoji as placeholder
    color: '#9333ea',
  },
  {
    id: 'nye-glasses',
    name: '2026 Glasses',
    type: 'glasses',
    anchor: 'eyes',
    offsetY: 0,
    scale: 1.2,
    emoji: '\ud83d\udd76\ufe0f',
    color: '#ffd700',
  },
  {
    id: 'crown',
    name: 'NYE Crown',
    type: 'crown',
    anchor: 'forehead',
    offsetY: -0.7,
    scale: 0.8,
    emoji: '\ud83d\udc51',
    color: '#ffd700',
  },
  {
    id: 'tiara',
    name: 'Sparkle Tiara',
    type: 'headband',
    anchor: 'forehead',
    offsetY: -0.5,
    scale: 0.7,
    emoji: '\ud83d\udc78',
    color: '#ec4899',
  },
  {
    id: 'stars-headband',
    name: 'Star Headband',
    type: 'headband',
    anchor: 'forehead',
    offsetY: -0.6,
    scale: 0.8,
    emoji: '\u2b50',
    color: '#ffd700',
  },
  {
    id: 'champagne-mask',
    name: 'Champagne',
    type: 'mask',
    anchor: 'mouth',
    offsetY: 0.3,
    scale: 0.5,
    emoji: '\ud83c\udf7e',
    color: '#ffd700',
  },
];

export function getFilterById(id: string): ARFilter | undefined {
  return AR_FILTERS.find((f) => f.id === id);
}
