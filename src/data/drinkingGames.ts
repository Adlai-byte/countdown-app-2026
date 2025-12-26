// Drinking Games Data

// Never Have I Ever
export interface NeverHaveIEverItem {
  id: string;
  text: string;
  category: 'mild' | 'medium' | 'spicy';
}

export const NEVER_HAVE_I_EVER: NeverHaveIEverItem[] = [
  // Mild
  { id: 'nhie1', text: "Never have I ever stayed up until midnight on New Year's Eve", category: 'mild' },
  { id: 'nhie2', text: "Never have I ever made a New Year's resolution", category: 'mild' },
  { id: 'nhie3', text: "Never have I ever broken a New Year's resolution within a week", category: 'mild' },
  { id: 'nhie4', text: "Never have I ever watched the ball drop in Times Square (on TV)", category: 'mild' },
  { id: 'nhie5', text: "Never have I ever sung Auld Lang Syne", category: 'mild' },
  { id: 'nhie6', text: "Never have I ever had champagne on New Year's", category: 'mild' },
  { id: 'nhie7', text: "Never have I ever worn a silly New Year's hat", category: 'mild' },
  { id: 'nhie8', text: "Never have I ever used a noisemaker at midnight", category: 'mild' },
  { id: 'nhie9', text: "Never have I ever watched fireworks on New Year's", category: 'mild' },
  { id: 'nhie10', text: "Never have I ever fallen asleep before midnight on NYE", category: 'mild' },

  // Medium
  { id: 'nhie11', text: "Never have I ever kissed someone at midnight", category: 'medium' },
  { id: 'nhie12', text: "Never have I ever been to a New Year's party I regretted", category: 'medium' },
  { id: 'nhie13', text: "Never have I ever texted an ex on New Year's", category: 'medium' },
  { id: 'nhie14', text: "Never have I ever been hungover on January 1st", category: 'medium' },
  { id: 'nhie15', text: "Never have I ever cried on New Year's Eve", category: 'medium' },
  { id: 'nhie16', text: "Never have I ever gotten lost on New Year's Eve", category: 'medium' },
  { id: 'nhie17', text: "Never have I ever spent New Year's alone", category: 'medium' },
  { id: 'nhie18', text: "Never have I ever hosted a New Year's party", category: 'medium' },
  { id: 'nhie19', text: "Never have I ever worn the same outfit twice on NYE", category: 'medium' },
  { id: 'nhie20', text: "Never have I ever made a drunk New Year's resolution", category: 'medium' },

  // Spicy
  { id: 'nhie21', text: "Never have I ever kissed a stranger at midnight", category: 'spicy' },
  { id: 'nhie22', text: "Never have I ever started the new year in someone else's bed", category: 'spicy' },
  { id: 'nhie23', text: "Never have I ever done something on NYE I couldn't remember", category: 'spicy' },
  { id: 'nhie24', text: "Never have I ever sent a regrettable text on NYE", category: 'spicy' },
  { id: 'nhie25', text: "Never have I ever confessed feelings on New Year's", category: 'spicy' },
];

// Kings / Ring of Fire Rules
export interface KingsRule {
  card: string;
  name: string;
  rule: string;
  emoji: string;
}

export const KINGS_RULES: KingsRule[] = [
  { card: 'A', name: 'Waterfall', rule: 'Everyone drinks! Start with the drawer, each person can only stop when the person before them stops.', emoji: '🌊' },
  { card: '2', name: 'You', rule: 'Pick someone to drink', emoji: '👉' },
  { card: '3', name: 'Me', rule: 'You drink', emoji: '🙋' },
  { card: '4', name: 'Floor', rule: 'Last person to touch the floor drinks', emoji: '⬇️' },
  { card: '5', name: 'Guys', rule: 'All guys drink', emoji: '👨' },
  { card: '6', name: 'Chicks', rule: 'All ladies drink', emoji: '👩' },
  { card: '7', name: 'Heaven', rule: 'Last person to point up drinks', emoji: '☝️' },
  { card: '8', name: 'Mate', rule: 'Pick a drinking buddy - when one drinks, both drink', emoji: '🤝' },
  { card: '9', name: 'Rhyme', rule: 'Say a word, go around rhyming. First to fail drinks', emoji: '📝' },
  { card: '10', name: 'Categories', rule: 'Pick a category, go around naming items. First to fail drinks', emoji: '📋' },
  { card: 'J', name: 'Rule Master', rule: 'Make a rule everyone must follow. Breakers drink', emoji: '👑' },
  { card: 'Q', name: 'Question Master', rule: 'If anyone answers your question, they drink', emoji: '❓' },
  { card: 'K', name: 'King', rule: 'Pour into the center cup. 4th King drinks it all!', emoji: '🍺' },
];

// Drink Roulette options
export interface RouletteOption {
  id: string;
  text: string;
  type: 'drink' | 'dare' | 'safe' | 'group';
  intensity: number; // 1-3
}

export const ROULETTE_OPTIONS: RouletteOption[] = [
  { id: 'r1', text: 'Take a sip', type: 'drink', intensity: 1 },
  { id: 'r2', text: 'Take 2 sips', type: 'drink', intensity: 1 },
  { id: 'r3', text: 'Finish your drink!', type: 'drink', intensity: 3 },
  { id: 'r4', text: 'Safe! No drinking', type: 'safe', intensity: 1 },
  { id: 'r5', text: 'Everyone drinks!', type: 'group', intensity: 2 },
  { id: 'r6', text: 'Do a silly dance', type: 'dare', intensity: 1 },
  { id: 'r7', text: 'Make a toast', type: 'dare', intensity: 1 },
  { id: 'r8', text: 'Compliment everyone', type: 'dare', intensity: 1 },
  { id: 'r9', text: 'Person to your left drinks', type: 'drink', intensity: 1 },
  { id: 'r10', text: 'Person to your right drinks', type: 'drink', intensity: 1 },
  { id: 'r11', text: 'Youngest person drinks', type: 'drink', intensity: 1 },
  { id: 'r12', text: 'Oldest person drinks', type: 'drink', intensity: 1 },
  { id: 'r13', text: 'Tell a joke or drink', type: 'dare', intensity: 1 },
  { id: 'r14', text: 'Do 5 jumping jacks', type: 'dare', intensity: 1 },
  { id: 'r15', text: 'Speak in an accent until your next turn', type: 'dare', intensity: 2 },
  { id: 'r16', text: 'Take a shot!', type: 'drink', intensity: 3 },
  { id: 'r17', text: 'Waterfall! Everyone drinks', type: 'group', intensity: 3 },
  { id: 'r18', text: 'Swap drinks with someone', type: 'dare', intensity: 1 },
  { id: 'r19', text: 'Skip! Pass to next player', type: 'safe', intensity: 1 },
  { id: 'r20', text: 'Share your NYE resolution', type: 'dare', intensity: 1 },
];

// Helper functions
export function getRandomNeverHaveIEver(category?: 'mild' | 'medium' | 'spicy'): NeverHaveIEverItem {
  const filtered = category
    ? NEVER_HAVE_I_EVER.filter((item) => item.category === category)
    : NEVER_HAVE_I_EVER;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function getRandomRouletteOption(): RouletteOption {
  return ROULETTE_OPTIONS[Math.floor(Math.random() * ROULETTE_OPTIONS.length)];
}

export function drawCard(): KingsRule {
  return KINGS_RULES[Math.floor(Math.random() * KINGS_RULES.length)];
}
