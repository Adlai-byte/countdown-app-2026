/**
 * Truth or Dare - Party Edition
 */

export type Intensity = 'light' | 'medium' | 'spicy';

export interface TruthOrDareItem {
  id: string;
  type: 'truth' | 'dare';
  text: string;
  intensity: Intensity;
}

export const TRUTHS: TruthOrDareItem[] = [
  // Light
  { id: 't-l1', type: 'truth', text: "What's your most embarrassing New Year's memory?", intensity: 'light' },
  { id: 't-l2', type: 'truth', text: "What's the silliest resolution you've ever made?", intensity: 'light' },
  { id: 't-l3', type: 'truth', text: 'What was your favorite moment of this year?', intensity: 'light' },
  { id: 't-l4', type: 'truth', text: 'What song do you secretly love but pretend to hate?', intensity: 'light' },
  { id: 't-l5', type: 'truth', text: "What's your go-to karaoke song?", intensity: 'light' },
  { id: 't-l6', type: 'truth', text: "What's the last thing you searched on your phone?", intensity: 'light' },
  { id: 't-l7', type: 'truth', text: "What's your guilty pleasure TV show?", intensity: 'light' },
  { id: 't-l8', type: 'truth', text: 'If you could have dinner with anyone, who would it be?', intensity: 'light' },
  { id: 't-l9', type: 'truth', text: "What's the most childish thing you still do?", intensity: 'light' },
  { id: 't-l10', type: 'truth', text: 'What was your worst fashion phase?', intensity: 'light' },
  // Medium
  { id: 't-m1', type: 'truth', text: "What's a secret you've never told anyone here?", intensity: 'medium' },
  { id: 't-m2', type: 'truth', text: 'Who in this room would you swap lives with for a day?', intensity: 'medium' },
  { id: 't-m3', type: 'truth', text: "What's your biggest regret from this year?", intensity: 'medium' },
  { id: 't-m4', type: 'truth', text: 'What white lie have you told recently?', intensity: 'medium' },
  { id: 't-m5', type: 'truth', text: 'Who was your first crush?', intensity: 'medium' },
  { id: 't-m6', type: 'truth', text: "What's the most trouble you've ever been in?", intensity: 'medium' },
  { id: 't-m7', type: 'truth', text: "What's something you pretend to understand but don't?", intensity: 'medium' },
  { id: 't-m8', type: 'truth', text: "What's the most embarrassing thing in your search history?", intensity: 'medium' },
  { id: 't-m9', type: 'truth', text: 'Have you ever blamed someone else for something you did?', intensity: 'medium' },
  { id: 't-m10', type: 'truth', text: "What's the biggest lie you've told a parent?", intensity: 'medium' },
  // Spicy
  { id: 't-s1', type: 'truth', text: 'Who in this room are you most attracted to?', intensity: 'spicy' },
  { id: 't-s2', type: 'truth', text: "What's your most embarrassing romantic story?", intensity: 'spicy' },
  { id: 't-s3', type: 'truth', text: 'Have you ever had a crush on a friend\'s partner?', intensity: 'spicy' },
  { id: 't-s4', type: 'truth', text: "What's the craziest thing you've done for love?", intensity: 'spicy' },
  { id: 't-s5', type: 'truth', text: "What's your biggest turn-off?", intensity: 'spicy' },
  { id: 't-s6', type: 'truth', text: 'Have you ever been caught in a lie by someone here?', intensity: 'spicy' },
  { id: 't-s7', type: 'truth', text: "What's something you've never admitted to anyone?", intensity: 'spicy' },
  { id: 't-s8', type: 'truth', text: "What's the most rebellious thing you've ever done?", intensity: 'spicy' },
  { id: 't-s9', type: 'truth', text: 'Who here do you think has the most secrets?', intensity: 'spicy' },
  { id: 't-s10', type: 'truth', text: "What's your most unpopular opinion?", intensity: 'spicy' },
];

export const DARES: TruthOrDareItem[] = [
  // Light
  { id: 'd-l1', type: 'dare', text: 'Do your best impression of another player', intensity: 'light' },
  { id: 'd-l2', type: 'dare', text: 'Sing the chorus of your favorite song', intensity: 'light' },
  { id: 'd-l3', type: 'dare', text: 'Do 10 jumping jacks right now', intensity: 'light' },
  { id: 'd-l4', type: 'dare', text: 'Speak in an accent for the next 3 rounds', intensity: 'light' },
  { id: 'd-l5', type: 'dare', text: 'Let someone draw on your face with a marker', intensity: 'light' },
  { id: 'd-l6', type: 'dare', text: 'Do your best dance move', intensity: 'light' },
  { id: 'd-l7', type: 'dare', text: 'Make up a 30-second rap about New Year', intensity: 'light' },
  { id: 'd-l8', type: 'dare', text: 'Talk without showing your teeth for 2 minutes', intensity: 'light' },
  { id: 'd-l9', type: 'dare', text: 'Do your best celebrity impression', intensity: 'light' },
  { id: 'd-l10', type: 'dare', text: 'Try to lick your elbow', intensity: 'light' },
  // Medium
  { id: 'd-m1', type: 'dare', text: 'Post a silly selfie to your social media story', intensity: 'medium' },
  { id: 'd-m2', type: 'dare', text: 'Call a random contact and sing Happy Birthday', intensity: 'medium' },
  { id: 'd-m3', type: 'dare', text: 'Let the group go through your camera roll for 30 seconds', intensity: 'medium' },
  { id: 'd-m4', type: 'dare', text: 'Do a dramatic reading of your last 5 texts', intensity: 'medium' },
  { id: 'd-m5', type: 'dare', text: 'Let another player post something on your social media', intensity: 'medium' },
  { id: 'd-m6', type: 'dare', text: 'Call your mom and tell her you love her', intensity: 'medium' },
  { id: 'd-m7', type: 'dare', text: 'Give a 1-minute motivational speech', intensity: 'medium' },
  { id: 'd-m8', type: 'dare', text: 'Act out your favorite movie scene silently', intensity: 'medium' },
  { id: 'd-m9', type: 'dare', text: 'Text your crush (or partner) and say "I was thinking about you"', intensity: 'medium' },
  { id: 'd-m10', type: 'dare', text: 'Demonstrate your shower singing routine', intensity: 'medium' },
  // Spicy
  { id: 'd-s1', type: 'dare', text: 'Give a compliment to everyone in the room', intensity: 'spicy' },
  { id: 'd-s2', type: 'dare', text: 'Let someone send a text from your phone (you pick the contact)', intensity: 'spicy' },
  { id: 'd-s3', type: 'dare', text: 'Do a seductive dance to whatever song is playing', intensity: 'spicy' },
  { id: 'd-s4', type: 'dare', text: 'Confess something you\'ve always wanted to tell someone here', intensity: 'spicy' },
  { id: 'd-s5', type: 'dare', text: 'Call an ex and wish them Happy New Year', intensity: 'spicy' },
  { id: 'd-s6', type: 'dare', text: 'Let the group create a dating profile bio for you', intensity: 'spicy' },
  { id: 'd-s7', type: 'dare', text: 'Describe your perfect date in detail', intensity: 'spicy' },
  { id: 'd-s8', type: 'dare', text: 'Give someone in the room a massage for 30 seconds', intensity: 'spicy' },
  { id: 'd-s9', type: 'dare', text: 'Reveal who you would marry in this room', intensity: 'spicy' },
  { id: 'd-s10', type: 'dare', text: 'Share your most romantic text message ever sent', intensity: 'spicy' },
];

export function getRandomTruth(intensity: Intensity): TruthOrDareItem {
  const filtered = TRUTHS.filter((t) => t.intensity === intensity);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function getRandomDare(intensity: Intensity): TruthOrDareItem {
  const filtered = DARES.filter((d) => d.intensity === intensity);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function getRandomChallenge(type: 'truth' | 'dare', intensity: Intensity): TruthOrDareItem {
  return type === 'truth' ? getRandomTruth(intensity) : getRandomDare(intensity);
}
