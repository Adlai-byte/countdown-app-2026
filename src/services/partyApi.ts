// Free APIs for party features - No authentication required

// Official Joke API
export interface Joke {
  id: number;
  type: string;
  setup: string;
  punchline: string;
}

export async function fetchRandomJoke(): Promise<Joke> {
  const response = await fetch('https://official-joke-api.appspot.com/random_joke');
  if (!response.ok) throw new Error('Failed to fetch joke');
  return response.json();
}

export async function fetchJokesByType(type: 'general' | 'programming'): Promise<Joke[]> {
  const response = await fetch(`https://official-joke-api.appspot.com/jokes/${type}/ten`);
  if (!response.ok) throw new Error('Failed to fetch jokes');
  return response.json();
}

// Dad Jokes API
export interface DadJoke {
  id: string;
  joke: string;
}

export async function fetchDadJoke(): Promise<DadJoke> {
  const response = await fetch('https://icanhazdadjoke.com/', {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to fetch dad joke');
  return response.json();
}

// Advice Slip API
export interface Advice {
  slip: {
    id: number;
    advice: string;
  };
}

export async function fetchRandomAdvice(): Promise<string> {
  // Add cache buster to avoid cached responses
  const response = await fetch(`https://api.adviceslip.com/advice?t=${Date.now()}`);
  if (!response.ok) throw new Error('Failed to fetch advice');
  const data: Advice = await response.json();
  return data.slip.advice;
}

// Numbers API
export async function fetchNumberFact(number: number): Promise<string> {
  const response = await fetch(`http://numbersapi.com/${number}`);
  if (!response.ok) throw new Error('Failed to fetch number fact');
  return response.text();
}

export async function fetchYearFact(year: number): Promise<string> {
  const response = await fetch(`http://numbersapi.com/${year}/year`);
  if (!response.ok) throw new Error('Failed to fetch year fact');
  return response.text();
}

export async function fetchDateFact(month: number, day: number): Promise<string> {
  const response = await fetch(`http://numbersapi.com/${month}/${day}/date`);
  if (!response.ok) throw new Error('Failed to fetch date fact');
  return response.text();
}

// Bored API
export interface BoredActivity {
  activity: string;
  type: string;
  participants: number;
  price: number;
  link: string;
  key: string;
  accessibility: number;
}

export async function fetchRandomActivity(): Promise<BoredActivity> {
  const response = await fetch('https://www.boredapi.com/api/activity');
  if (!response.ok) throw new Error('Failed to fetch activity');
  return response.json();
}

export async function fetchActivityByParticipants(participants: number): Promise<BoredActivity> {
  const response = await fetch(`https://www.boredapi.com/api/activity?participants=${participants}`);
  if (!response.ok) throw new Error('Failed to fetch activity');
  return response.json();
}

export async function fetchActivityByType(type: string): Promise<BoredActivity> {
  const response = await fetch(`https://www.boredapi.com/api/activity?type=${type}`);
  if (!response.ok) throw new Error('Failed to fetch activity');
  return response.json();
}

// Open Trivia DB
export interface TriviaQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface TriviaResponse {
  response_code: number;
  results: TriviaQuestion[];
}

export async function fetchTriviaQuestions(
  amount: number = 10,
  category?: number,
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<TriviaQuestion[]> {
  let url = `https://opentdb.com/api.php?amount=${amount}`;
  if (category) url += `&category=${category}`;
  if (difficulty) url += `&difficulty=${difficulty}`;
  url += '&type=multiple';

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch trivia');
  const data: TriviaResponse = await response.json();

  if (data.response_code !== 0) {
    throw new Error('No trivia questions available');
  }

  return data.results;
}

// Trivia categories from OpenTDB
export const TRIVIA_CATEGORIES = [
  { id: 9, name: 'General Knowledge' },
  { id: 11, name: 'Film' },
  { id: 12, name: 'Music' },
  { id: 14, name: 'Television' },
  { id: 15, name: 'Video Games' },
  { id: 17, name: 'Science & Nature' },
  { id: 21, name: 'Sports' },
  { id: 22, name: 'Geography' },
  { id: 23, name: 'History' },
  { id: 25, name: 'Art' },
  { id: 26, name: 'Celebrities' },
  { id: 27, name: 'Animals' },
];

// NASA APOD API (free, demo key works for low usage)
export interface NasaApod {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: string;
  title: string;
  url: string;
  copyright?: string;
}

export async function fetchNasaApod(): Promise<NasaApod> {
  // DEMO_KEY works for limited requests
  const response = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
  if (!response.ok) throw new Error('Failed to fetch NASA APOD');
  return response.json();
}

// Quotable API
export interface Quote {
  _id: string;
  content: string;
  author: string;
  tags: string[];
}

export async function fetchRandomQuote(): Promise<Quote> {
  const response = await fetch('https://api.quotable.io/random');
  if (!response.ok) throw new Error('Failed to fetch quote');
  return response.json();
}

export async function fetchQuoteByTag(tag: string): Promise<Quote> {
  const response = await fetch(`https://api.quotable.io/random?tags=${tag}`);
  if (!response.ok) throw new Error('Failed to fetch quote');
  return response.json();
}

// Helper to decode HTML entities from trivia API
export function decodeHtml(html: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
