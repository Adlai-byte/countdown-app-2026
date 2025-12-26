// Color Game Data

export interface GameColor {
  id: string;
  name: string;
  hex: string;
  tailwind: string;
}

export const GAME_COLORS: GameColor[] = [
  { id: 'red', name: 'Red', hex: '#ef4444', tailwind: 'bg-red-500' },
  { id: 'blue', name: 'Blue', hex: '#3b82f6', tailwind: 'bg-blue-500' },
  { id: 'green', name: 'Green', hex: '#22c55e', tailwind: 'bg-green-500' },
  { id: 'yellow', name: 'Yellow', hex: '#eab308', tailwind: 'bg-yellow-500' },
  { id: 'purple', name: 'Purple', hex: '#a855f7', tailwind: 'bg-purple-500' },
  { id: 'orange', name: 'Orange', hex: '#f97316', tailwind: 'bg-orange-500' },
  { id: 'pink', name: 'Pink', hex: '#ec4899', tailwind: 'bg-pink-500' },
  { id: 'cyan', name: 'Cyan', hex: '#06b6d4', tailwind: 'bg-cyan-500' },
];

export type GameMode = 'classic' | 'memory' | 'speed';

export interface GameModeConfig {
  id: GameMode;
  name: string;
  description: string;
  emoji: string;
}

export const GAME_MODES: GameModeConfig[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Match the target color',
    emoji: '🎯',
  },
  {
    id: 'memory',
    name: 'Memory',
    description: 'Remember the sequence',
    emoji: '🧠',
  },
  {
    id: 'speed',
    name: 'Speed Run',
    description: 'Beat the clock',
    emoji: '⚡',
  },
];

// Get random colors for the game
export function getRandomColors(count: number, exclude?: string): GameColor[] {
  const available = exclude
    ? GAME_COLORS.filter((c) => c.id !== exclude)
    : [...GAME_COLORS];

  const shuffled = available.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Generate a random sequence for memory mode
export function generateSequence(length: number): GameColor[] {
  const sequence: GameColor[] = [];
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * GAME_COLORS.length);
    sequence.push(GAME_COLORS[randomIndex]);
  }
  return sequence;
}

// Get difficulty settings
export interface DifficultySettings {
  optionCount: number;
  timeLimit: number;
  targetScore: number;
  speedBonus: number;
}

export function getDifficultySettings(level: number): DifficultySettings {
  const baseOptions = 4;
  const maxOptions = 8;

  return {
    optionCount: Math.min(baseOptions + Math.floor(level / 3), maxOptions),
    timeLimit: Math.max(5000 - level * 200, 2000), // 5s down to 2s
    targetScore: 10 + level * 5,
    speedBonus: 100 + level * 20,
  };
}
