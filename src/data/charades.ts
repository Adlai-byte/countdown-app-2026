/**
 * Charades Words and Categories
 */

export interface CharadesWord {
  id: string;
  word: string;
  category: CharadesCategory;
  difficulty: 'easy' | 'medium' | 'hard';
}

export type CharadesCategory = 'nye' | 'movies' | 'actions' | 'animals' | 'celebrities';

export const CHARADES_CATEGORIES: { id: CharadesCategory; name: string; emoji: string }[] = [
  { id: 'nye', name: 'New Year', emoji: '\ud83c\udf89' },
  { id: 'movies', name: 'Movies', emoji: '\ud83c\udfac' },
  { id: 'actions', name: 'Actions', emoji: '\ud83c\udfad' },
  { id: 'animals', name: 'Animals', emoji: '\ud83d\udc3b' },
  { id: 'celebrities', name: 'Celebrities', emoji: '\u2b50' },
];

export const CHARADES_WORDS: CharadesWord[] = [
  // New Year
  { id: 'nye-1', word: 'Popping champagne', category: 'nye', difficulty: 'easy' },
  { id: 'nye-2', word: 'Counting down', category: 'nye', difficulty: 'easy' },
  { id: 'nye-3', word: 'Watching fireworks', category: 'nye', difficulty: 'easy' },
  { id: 'nye-4', word: 'Making a resolution', category: 'nye', difficulty: 'medium' },
  { id: 'nye-5', word: 'Midnight kiss', category: 'nye', difficulty: 'easy' },
  { id: 'nye-6', word: 'Wearing a party hat', category: 'nye', difficulty: 'easy' },
  { id: 'nye-7', word: 'Throwing confetti', category: 'nye', difficulty: 'easy' },
  { id: 'nye-8', word: 'Ball drop', category: 'nye', difficulty: 'medium' },
  { id: 'nye-9', word: 'Dancing at a party', category: 'nye', difficulty: 'easy' },
  { id: 'nye-10', word: 'Making a toast', category: 'nye', difficulty: 'easy' },
  { id: 'nye-11', word: 'Blowing a noisemaker', category: 'nye', difficulty: 'easy' },
  { id: 'nye-12', word: 'Writing in a diary', category: 'nye', difficulty: 'medium' },
  { id: 'nye-13', word: 'Hugging at midnight', category: 'nye', difficulty: 'easy' },
  { id: 'nye-14', word: 'Taking a selfie', category: 'nye', difficulty: 'easy' },
  { id: 'nye-15', word: 'Singing Auld Lang Syne', category: 'nye', difficulty: 'hard' },

  // Movies
  { id: 'mov-1', word: 'Titanic', category: 'movies', difficulty: 'easy' },
  { id: 'mov-2', word: 'Star Wars', category: 'movies', difficulty: 'easy' },
  { id: 'mov-3', word: 'The Lion King', category: 'movies', difficulty: 'easy' },
  { id: 'mov-4', word: 'Frozen', category: 'movies', difficulty: 'easy' },
  { id: 'mov-5', word: 'Jaws', category: 'movies', difficulty: 'easy' },
  { id: 'mov-6', word: 'Harry Potter', category: 'movies', difficulty: 'easy' },
  { id: 'mov-7', word: 'The Avengers', category: 'movies', difficulty: 'medium' },
  { id: 'mov-8', word: 'Spider-Man', category: 'movies', difficulty: 'easy' },
  { id: 'mov-9', word: 'Finding Nemo', category: 'movies', difficulty: 'easy' },
  { id: 'mov-10', word: 'Jurassic Park', category: 'movies', difficulty: 'medium' },
  { id: 'mov-11', word: 'The Matrix', category: 'movies', difficulty: 'medium' },
  { id: 'mov-12', word: 'Ghostbusters', category: 'movies', difficulty: 'medium' },
  { id: 'mov-13', word: 'E.T.', category: 'movies', difficulty: 'easy' },
  { id: 'mov-14', word: 'Forrest Gump', category: 'movies', difficulty: 'medium' },
  { id: 'mov-15', word: 'Home Alone', category: 'movies', difficulty: 'easy' },

  // Actions
  { id: 'act-1', word: 'Brushing teeth', category: 'actions', difficulty: 'easy' },
  { id: 'act-2', word: 'Cooking breakfast', category: 'actions', difficulty: 'easy' },
  { id: 'act-3', word: 'Playing guitar', category: 'actions', difficulty: 'easy' },
  { id: 'act-4', word: 'Swimming', category: 'actions', difficulty: 'easy' },
  { id: 'act-5', word: 'Skateboarding', category: 'actions', difficulty: 'medium' },
  { id: 'act-6', word: 'Taking a shower', category: 'actions', difficulty: 'easy' },
  { id: 'act-7', word: 'Reading a book', category: 'actions', difficulty: 'easy' },
  { id: 'act-8', word: 'Surfing', category: 'actions', difficulty: 'medium' },
  { id: 'act-9', word: 'Bowling', category: 'actions', difficulty: 'easy' },
  { id: 'act-10', word: 'Painting a picture', category: 'actions', difficulty: 'easy' },
  { id: 'act-11', word: 'Doing yoga', category: 'actions', difficulty: 'easy' },
  { id: 'act-12', word: 'Taking a selfie', category: 'actions', difficulty: 'easy' },
  { id: 'act-13', word: 'Riding a horse', category: 'actions', difficulty: 'medium' },
  { id: 'act-14', word: 'Flying a kite', category: 'actions', difficulty: 'easy' },
  { id: 'act-15', word: 'Juggling', category: 'actions', difficulty: 'medium' },

  // Animals
  { id: 'ani-1', word: 'Elephant', category: 'animals', difficulty: 'easy' },
  { id: 'ani-2', word: 'Monkey', category: 'animals', difficulty: 'easy' },
  { id: 'ani-3', word: 'Penguin', category: 'animals', difficulty: 'easy' },
  { id: 'ani-4', word: 'Kangaroo', category: 'animals', difficulty: 'easy' },
  { id: 'ani-5', word: 'Snake', category: 'animals', difficulty: 'easy' },
  { id: 'ani-6', word: 'Giraffe', category: 'animals', difficulty: 'easy' },
  { id: 'ani-7', word: 'Chicken', category: 'animals', difficulty: 'easy' },
  { id: 'ani-8', word: 'Butterfly', category: 'animals', difficulty: 'medium' },
  { id: 'ani-9', word: 'Gorilla', category: 'animals', difficulty: 'easy' },
  { id: 'ani-10', word: 'Octopus', category: 'animals', difficulty: 'medium' },
  { id: 'ani-11', word: 'Crocodile', category: 'animals', difficulty: 'medium' },
  { id: 'ani-12', word: 'Flamingo', category: 'animals', difficulty: 'medium' },
  { id: 'ani-13', word: 'Crab', category: 'animals', difficulty: 'easy' },
  { id: 'ani-14', word: 'Sloth', category: 'animals', difficulty: 'medium' },
  { id: 'ani-15', word: 'Peacock', category: 'animals', difficulty: 'medium' },

  // Celebrities
  { id: 'cel-1', word: 'Taylor Swift', category: 'celebrities', difficulty: 'easy' },
  { id: 'cel-2', word: 'Michael Jackson', category: 'celebrities', difficulty: 'easy' },
  { id: 'cel-3', word: 'Beyonce', category: 'celebrities', difficulty: 'medium' },
  { id: 'cel-4', word: 'Elvis Presley', category: 'celebrities', difficulty: 'easy' },
  { id: 'cel-5', word: 'Cristiano Ronaldo', category: 'celebrities', difficulty: 'easy' },
  { id: 'cel-6', word: 'Oprah Winfrey', category: 'celebrities', difficulty: 'medium' },
  { id: 'cel-7', word: 'Marilyn Monroe', category: 'celebrities', difficulty: 'medium' },
  { id: 'cel-8', word: 'Michael Jordan', category: 'celebrities', difficulty: 'easy' },
  { id: 'cel-9', word: 'Madonna', category: 'celebrities', difficulty: 'medium' },
  { id: 'cel-10', word: 'Arnold Schwarzenegger', category: 'celebrities', difficulty: 'medium' },
  { id: 'cel-11', word: 'Tom Cruise', category: 'celebrities', difficulty: 'easy' },
  { id: 'cel-12', word: 'Lady Gaga', category: 'celebrities', difficulty: 'easy' },
  { id: 'cel-13', word: 'The Rock', category: 'celebrities', difficulty: 'easy' },
  { id: 'cel-14', word: 'Donald Duck', category: 'celebrities', difficulty: 'easy' },
  { id: 'cel-15', word: 'Mickey Mouse', category: 'celebrities', difficulty: 'easy' },
];

export function getWordsByCategory(category: CharadesCategory): CharadesWord[] {
  return CHARADES_WORDS.filter((w) => w.category === category);
}

export function getRandomWord(category?: CharadesCategory): CharadesWord {
  const words = category ? getWordsByCategory(category) : CHARADES_WORDS;
  return words[Math.floor(Math.random() * words.length)];
}

export function getRandomWords(count: number, category?: CharadesCategory): CharadesWord[] {
  const words = category ? getWordsByCategory(category) : CHARADES_WORDS;
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
