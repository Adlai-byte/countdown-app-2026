export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  size: 'small' | 'medium' | 'large';
}

export const photoStickers: Sticker[] = [
  { id: 'none', name: 'None', emoji: '', position: 'top-left', size: 'medium' },
  { id: 'party-hat', name: 'Party Hat', emoji: '🎉', position: 'top-center', size: 'large' },
  { id: 'champagne', name: 'Champagne', emoji: '🍾', position: 'bottom-right', size: 'large' },
  { id: 'fireworks', name: 'Fireworks', emoji: '🎆', position: 'top-right', size: 'large' },
  { id: 'confetti', name: 'Confetti', emoji: '🎊', position: 'top-left', size: 'large' },
  { id: 'sparkles', name: 'Sparkles', emoji: '✨', position: 'top-center', size: 'medium' },
  { id: 'star', name: 'Star', emoji: '⭐', position: 'top-right', size: 'medium' },
  { id: 'hearts', name: 'Hearts', emoji: '💖', position: 'top-center', size: 'large' },
  { id: 'crown', name: 'Crown', emoji: '👑', position: 'top-center', size: 'large' },
  { id: 'glasses', name: 'Cool Glasses', emoji: '😎', position: 'top-center', size: 'large' },
  { id: 'balloon', name: 'Balloon', emoji: '🎈', position: 'top-right', size: 'large' },
  { id: 'trophy', name: 'Trophy', emoji: '🏆', position: 'bottom-center', size: 'large' },
  { id: '2026', name: '2026', emoji: '2️⃣0️⃣2️⃣6️⃣', position: 'bottom-center', size: 'large' },
  { id: 'clinking', name: 'Cheers', emoji: '🥂', position: 'bottom-right', size: 'large' },
  { id: 'disco', name: 'Disco', emoji: '🪩', position: 'top-left', size: 'large' },
];

export function getStickerById(id: string): Sticker | undefined {
  return photoStickers.find(s => s.id === id);
}
