export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    id: '1',
    question: 'Which country traditionally celebrates New Year with 12 grapes at midnight?',
    options: ['Italy', 'Spain', 'France', 'Portugal'],
    correctIndex: 1,
    explanation: 'In Spain, people eat 12 grapes at midnight, one for each chime of the clock!',
  },
  {
    id: '2',
    question: 'What color underwear is considered lucky for New Year in some Latin American countries?',
    options: ['Red', 'Blue', 'Yellow', 'Green'],
    correctIndex: 2,
    explanation: 'Yellow underwear is believed to bring good luck and prosperity!',
  },
  {
    id: '3',
    question: 'In which city does the famous Times Square ball drop take place?',
    options: ['Los Angeles', 'Chicago', 'New York City', 'Miami'],
    correctIndex: 2,
    explanation: 'The Times Square Ball Drop in NYC has been a tradition since 1907!',
  },
  {
    id: '4',
    question: 'What is the traditional Scottish New Year celebration called?',
    options: ['Hogmanay', 'Burns Night', 'Highland Fling', 'Ceilidh'],
    correctIndex: 0,
    explanation: 'Hogmanay is the Scottish word for the last day of the year!',
  },
  {
    id: '5',
    question: 'Which song is traditionally sung at midnight on New Year\'s Eve?',
    options: ['Happy Birthday', 'Auld Lang Syne', 'We Wish You a Merry Christmas', 'Jingle Bells'],
    correctIndex: 1,
    explanation: 'Auld Lang Syne was written by Scottish poet Robert Burns in 1788!',
  },
  {
    id: '6',
    question: 'In Denmark, what do people throw at friends\' doors for good luck?',
    options: ['Flowers', 'Coins', 'Unused plates', 'Candy'],
    correctIndex: 2,
    explanation: 'Danes save old dishes to throw at friends\' doors - more pieces mean more luck!',
  },
  {
    id: '7',
    question: 'What do Filipinos believe about round shapes on New Year?',
    options: ['Bad luck', 'Represent coins and prosperity', 'Should be avoided', 'Bring rain'],
    correctIndex: 1,
    explanation: 'Round shapes symbolize coins and are believed to attract wealth!',
  },
  {
    id: '8',
    question: 'What is the first country to ring in the New Year each year?',
    options: ['Japan', 'Australia', 'Kiribati', 'New Zealand'],
    correctIndex: 2,
    explanation: 'The Line Islands of Kiribati are the first to welcome the New Year!',
  },
  {
    id: '9',
    question: 'In Japan, what is the traditional New Year food?',
    options: ['Sushi', 'Ramen', 'Osechi-ryori', 'Tempura'],
    correctIndex: 2,
    explanation: 'Osechi-ryori is a special set of dishes with symbolic meanings!',
  },
  {
    id: '10',
    question: 'What do Brazilians traditionally wear on New Year\'s Eve?',
    options: ['Black', 'Red', 'White', 'Gold'],
    correctIndex: 2,
    explanation: 'Brazilians wear white for peace and to ward off evil spirits!',
  },
];

export function getRandomQuestions(count: number = 5): TriviaQuestion[] {
  const shuffled = [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
