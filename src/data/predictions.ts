export const WHEEL_SEGMENTS = [
  { label: 'Love', color: '#ec4899', prediction: 'Romance blooms in unexpected places. Keep your heart open to new connections!' },
  { label: 'Career', color: '#8b5cf6', prediction: 'A major opportunity awaits. Your hard work will finally pay off this year!' },
  { label: 'Travel', color: '#06b6d4', prediction: 'Adventure calls! Pack your bags for an unforgettable journey in 2026.' },
  { label: 'Wealth', color: '#ffd700', prediction: 'Financial winds blow in your favor. Smart investments lead to prosperity!' },
  { label: 'Health', color: '#22c55e', prediction: 'Vitality is yours! New habits will transform your well-being.' },
  { label: 'Luck', color: '#f97316', prediction: 'Fortune smiles upon you. Unexpected blessings are on the way!' },
  { label: 'Friends', color: '#3b82f6', prediction: 'New friendships form lasting bonds. Your circle expands with joy!' },
  { label: 'Mystery', color: '#a855f7', prediction: 'A delightful surprise awaits around the corner. Stay curious!' },
];

export const SCRATCH_PREDICTIONS = [
  'You will achieve something you thought impossible!',
  'An old dream will finally come true this year.',
  'Someone special will enter your life unexpectedly.',
  'Your creativity will open exciting new doors.',
  'A chance encounter leads to amazing opportunities.',
  'You will inspire others with your courage.',
  'Hidden talents will surface and shine brightly.',
  'A long-awaited message brings wonderful news.',
  'Your kindness creates ripples of positive change.',
  'Adventure awaits just outside your comfort zone!',
  'Financial abundance flows your way this year.',
  'A hobby becomes your greatest passion project.',
];

export function getRandomPrediction(): string {
  return SCRATCH_PREDICTIONS[Math.floor(Math.random() * SCRATCH_PREDICTIONS.length)];
}
