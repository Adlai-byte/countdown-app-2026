/**
 * NYE Bingo Data
 */

export interface BingoItem {
  id: string;
  text: string;
  emoji: string;
}

export const BINGO_ITEMS: BingoItem[] = [
  { id: 'b1', text: 'Countdown', emoji: '\u23f0' },
  { id: 'b2', text: 'Champagne Pop', emoji: '\ud83c\udf7e' },
  { id: 'b3', text: 'Fireworks', emoji: '\ud83c\udf86' },
  { id: 'b4', text: 'Resolution', emoji: '\ud83c\udfaf' },
  { id: 'b5', text: 'Midnight Kiss', emoji: '\ud83d\udc8b' },
  { id: 'b6', text: 'Party Hat', emoji: '\ud83e\udd73' },
  { id: 'b7', text: 'Confetti', emoji: '\ud83c\udf89' },
  { id: 'b8', text: 'Sparklers', emoji: '\u2728' },
  { id: 'b9', text: 'Ball Drop', emoji: '\ud83d\udd2e' },
  { id: 'b10', text: 'Cheers!', emoji: '\ud83e\udd42' },
  { id: 'b11', text: 'Dance Party', emoji: '\ud83d\udd7a' },
  { id: 'b12', text: 'Photo Booth', emoji: '\ud83d\udcf8' },
  { id: 'b13', text: 'Glitter', emoji: '\ud83c\udf1f' },
  { id: 'b14', text: 'Balloon', emoji: '\ud83c\udf88' },
  { id: 'b15', text: 'Noisemaker', emoji: '\ud83d\udce3' },
  { id: 'b16', text: 'Streamer', emoji: '\ud83c\udf80' },
  { id: 'b17', text: 'Fancy Dress', emoji: '\ud83d\udc57' },
  { id: 'b18', text: 'Good Luck', emoji: '\ud83c\udf40' },
  { id: 'b19', text: 'Fresh Start', emoji: '\ud83c\udf05' },
  { id: 'b20', text: 'Auld Lang Syne', emoji: '\ud83c\udfb6' },
  { id: 'b21', text: 'Toast', emoji: '\ud83c\udf7b' },
  { id: 'b22', text: 'Memories', emoji: '\ud83d\udcdd' },
  { id: 'b23', text: 'Friends', emoji: '\ud83d\udc6f' },
  { id: 'b24', text: 'Family', emoji: '\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66' },
  { id: 'b25', text: 'Gratitude', emoji: '\ud83d\ude4f' },
  { id: 'b26', text: 'Dreams', emoji: '\ud83d\udcad' },
  { id: 'b27', text: 'Goals', emoji: '\ud83c\udfc6' },
  { id: 'b28', text: 'Adventure', emoji: '\ud83c\udf0d' },
  { id: 'b29', text: 'Love', emoji: '\u2764\ufe0f' },
  { id: 'b30', text: 'Joy', emoji: '\ud83d\ude0a' },
  { id: 'b31', text: 'Peace', emoji: '\u262e\ufe0f' },
  { id: 'b32', text: 'Health', emoji: '\ud83d\udcaa' },
  { id: 'b33', text: 'Wealth', emoji: '\ud83d\udcb0' },
  { id: 'b34', text: 'Success', emoji: '\ud83d\ude80' },
  { id: 'b35', text: 'Laughter', emoji: '\ud83d\ude02' },
  { id: 'b36', text: 'Music', emoji: '\ud83c\udfb5' },
  { id: 'b37', text: 'Selfie', emoji: '\ud83e\udd33' },
  { id: 'b38', text: 'Hug', emoji: '\ud83e\udd17' },
  { id: 'b39', text: 'Wish', emoji: '\ud83c\udf20' },
  { id: 'b40', text: 'Celebration', emoji: '\ud83c\udf8a' },
];

export const FREE_SPACE: BingoItem = {
  id: 'free',
  text: 'FREE',
  emoji: '\u2b50',
};

export function generateBingoCard(): BingoItem[] {
  // Shuffle all items
  const shuffled = [...BINGO_ITEMS].sort(() => Math.random() - 0.5);
  // Take first 24 items (5x5 grid - 1 for free space)
  const selected = shuffled.slice(0, 24);
  // Insert free space in the middle (index 12)
  selected.splice(12, 0, FREE_SPACE);
  return selected;
}

export function checkBingo(marked: Set<string>, grid: BingoItem[]): boolean {
  // Check rows
  for (let row = 0; row < 5; row++) {
    let rowComplete = true;
    for (let col = 0; col < 5; col++) {
      const item = grid[row * 5 + col];
      if (!marked.has(item.id) && item.id !== 'free') {
        rowComplete = false;
        break;
      }
    }
    if (rowComplete) return true;
  }

  // Check columns
  for (let col = 0; col < 5; col++) {
    let colComplete = true;
    for (let row = 0; row < 5; row++) {
      const item = grid[row * 5 + col];
      if (!marked.has(item.id) && item.id !== 'free') {
        colComplete = false;
        break;
      }
    }
    if (colComplete) return true;
  }

  // Check diagonals
  let diag1Complete = true;
  let diag2Complete = true;
  for (let i = 0; i < 5; i++) {
    const item1 = grid[i * 5 + i];
    const item2 = grid[i * 5 + (4 - i)];
    if (!marked.has(item1.id) && item1.id !== 'free') diag1Complete = false;
    if (!marked.has(item2.id) && item2.id !== 'free') diag2Complete = false;
  }

  return diag1Complete || diag2Complete;
}
