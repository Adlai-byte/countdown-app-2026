/**
 * Would You Rather Questions - NYE Edition
 */

export interface WYRQuestion {
  id: string;
  optionA: string;
  optionB: string;
  category: 'fun' | 'deep' | 'nye';
}

export const WYR_QUESTIONS: WYRQuestion[] = [
  // NYE Themed
  {
    id: 'nye-1',
    optionA: 'Celebrate New Year on a tropical beach',
    optionB: 'Celebrate in Times Square, NYC',
    category: 'nye',
  },
  {
    id: 'nye-2',
    optionA: 'Have the power to redo any moment from last year',
    optionB: 'Have the power to see one day of next year',
    category: 'nye',
  },
  {
    id: 'nye-3',
    optionA: 'Stay up until 3 AM partying',
    optionB: 'Go to bed early and wake up for sunrise',
    category: 'nye',
  },
  {
    id: 'nye-4',
    optionA: 'Have unlimited champagne for the night',
    optionB: 'Have unlimited fireworks to set off yourself',
    category: 'nye',
  },
  {
    id: 'nye-5',
    optionA: 'Kiss a stranger at midnight',
    optionB: 'Give a heartfelt speech to everyone',
    category: 'nye',
  },
  {
    id: 'nye-6',
    optionA: 'Achieve all your resolutions but forget them by February',
    optionB: 'Remember all resolutions but only achieve half',
    category: 'nye',
  },
  {
    id: 'nye-7',
    optionA: 'Host the party at your place',
    optionB: 'Be a guest at the biggest party in town',
    category: 'nye',
  },
  {
    id: 'nye-8',
    optionA: 'Have your 2027 be exactly like 2026',
    optionB: 'Have 2026 be completely unpredictable',
    category: 'nye',
  },
  // Fun Questions
  {
    id: 'fun-1',
    optionA: 'Only be able to whisper for a year',
    optionB: 'Only be able to shout for a year',
    category: 'fun',
  },
  {
    id: 'fun-2',
    optionA: 'Have a personal chef',
    optionB: 'Have a personal driver',
    category: 'fun',
  },
  {
    id: 'fun-3',
    optionA: 'Be famous for something embarrassing',
    optionB: 'Never be recognized for your achievements',
    category: 'fun',
  },
  {
    id: 'fun-4',
    optionA: 'Always have to skip everywhere',
    optionB: 'Always have to walk backward',
    category: 'fun',
  },
  {
    id: 'fun-5',
    optionA: 'Have a rewind button for your life',
    optionB: 'Have a pause button for your life',
    category: 'fun',
  },
  {
    id: 'fun-6',
    optionA: 'Be able to talk to animals',
    optionB: 'Speak all human languages fluently',
    category: 'fun',
  },
  {
    id: 'fun-7',
    optionA: 'Have unlimited first class flights',
    optionB: 'Have unlimited free food for life',
    category: 'fun',
  },
  {
    id: 'fun-8',
    optionA: 'Be able to fly but only 3 feet high',
    optionB: 'Be invisible but sneeze constantly',
    category: 'fun',
  },
  // Deep Questions
  {
    id: 'deep-1',
    optionA: 'Know the date of your death',
    optionB: 'Know the cause of your death',
    category: 'deep',
  },
  {
    id: 'deep-2',
    optionA: 'Be the smartest person alive',
    optionB: 'Be the happiest person alive',
    category: 'deep',
  },
  {
    id: 'deep-3',
    optionA: 'Live 100 years in the past',
    optionB: 'Live 100 years in the future',
    category: 'deep',
  },
  {
    id: 'deep-4',
    optionA: 'Have one wish granted today',
    optionB: 'Have three wishes granted in 10 years',
    category: 'deep',
  },
  {
    id: 'deep-5',
    optionA: 'Know the truth about everything',
    optionB: 'Be blissfully ignorant but happy',
    category: 'deep',
  },
  {
    id: 'deep-6',
    optionA: 'Have more time',
    optionB: 'Have more money',
    category: 'deep',
  },
  {
    id: 'deep-7',
    optionA: 'Change the past',
    optionB: 'See the future',
    category: 'deep',
  },
  {
    id: 'deep-8',
    optionA: 'Be remembered for 1000 years',
    optionB: 'Live for 1000 years but be forgotten',
    category: 'deep',
  },
];

export function getRandomWYRQuestions(count: number = 10): WYRQuestion[] {
  const shuffled = [...WYR_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getWYRQuestionsByCategory(category: WYRQuestion['category']): WYRQuestion[] {
  return WYR_QUESTIONS.filter((q) => q.category === category);
}
