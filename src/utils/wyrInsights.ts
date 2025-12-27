import type { WYRQuestion } from '@/data/wouldYouRather';

// Question categorization tags
const RISKY_KEYWORDS = [
  'never', 'lose', 'give up', 'without', 'forever', 'only', 'always',
  'million', 'superpower', 'invisible', 'teleport', 'fly', 'read minds',
  'immortal', 'fame', 'fortune', 'celebrity', 'dangerous'
];

const SAFE_KEYWORDS = [
  'comfortable', 'normal', 'regular', 'peaceful', 'calm', 'quiet',
  'steady', 'stable', 'simple', 'easy', 'predictable'
];

const FUNNY_KEYWORDS = [
  'weird', 'awkward', 'embarrass', 'fart', 'burp', 'naked', 'funny',
  'laugh', 'silly', 'ridiculous', 'absurd', 'cringe', 'dance', 'sing',
  'party', 'prank', 'joke', 'crazy', 'wild'
];

const DEEP_KEYWORDS = [
  'love', 'life', 'death', 'memory', 'future', 'past', 'truth',
  'meaning', 'purpose', 'happiness', 'regret', 'wisdom', 'knowledge',
  'forever', 'never', 'always', 'feel', 'understand', 'believe'
];

const PRACTICAL_KEYWORDS = [
  'money', 'million', 'job', 'work', 'house', 'car', 'rich', 'wealthy',
  'career', 'success', 'business', 'practical', 'useful', 'efficient'
];

const ADVENTUROUS_KEYWORDS = [
  'travel', 'fly', 'teleport', 'superpower', 'invisible', 'explore',
  'adventure', 'exotic', 'danger', 'extreme', 'thrill'
];

export interface WYRChoice {
  questionId: string;
  question: WYRQuestion;
  chose: 'a' | 'b';
  optionChosen: string;
  wasRisky: boolean;
  wasFunny: boolean;
  wasDeep: boolean;
  wasPractical: boolean;
  wasAdventurous: boolean;
  agreedWithMajority?: boolean;
}

export interface WYRPlayerStats {
  playerId: string;
  playerName: string;
  avatarEmoji: string;
  avatarColor: string;
  choices: WYRChoice[];
  // Calculated stats
  riskyChoices: number;
  funnyChoices: number;
  deepChoices: number;
  practicalChoices: number;
  adventurousChoices: number;
  majorityAgreements: number;
  totalQuestions: number;
  // Choice pattern stats
  optionACount: number;
  optionBCount: number;
}

export interface PersonalityInsight {
  emoji: string;
  title: string;
  description: string;
  percentage: number;
  color: string;
}

// Check if option text contains keywords
const containsKeywords = (text: string, keywords: string[]): boolean => {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword));
};

// Analyze if an option is risky vs safe
export const isRiskyOption = (optionText: string, otherOption: string): boolean => {
  const riskyScore = RISKY_KEYWORDS.filter(kw => optionText.toLowerCase().includes(kw)).length;
  const safeScore = SAFE_KEYWORDS.filter(kw => optionText.toLowerCase().includes(kw)).length;
  const otherRiskyScore = RISKY_KEYWORDS.filter(kw => otherOption.toLowerCase().includes(kw)).length;

  // Option is risky if it has more risky keywords or other has more safe keywords
  return riskyScore > safeScore || riskyScore > otherRiskyScore;
};

// Check if the CHOSEN option is funny (not the whole question)
export const isFunnyOption = (optionText: string): boolean => {
  return containsKeywords(optionText, FUNNY_KEYWORDS);
};

// Check if the CHOSEN option is deep/philosophical
export const isDeepOption = (optionText: string): boolean => {
  return containsKeywords(optionText, DEEP_KEYWORDS);
};

// Check if the CHOSEN option is practical
export const isPracticalOption = (optionText: string): boolean => {
  return containsKeywords(optionText, PRACTICAL_KEYWORDS);
};

// Check if the CHOSEN option is adventurous
export const isAdventurousOption = (optionText: string): boolean => {
  return containsKeywords(optionText, ADVENTUROUS_KEYWORDS);
};

// Analyze a single choice - based on the SPECIFIC option chosen
export const analyzeChoice = (
  question: WYRQuestion,
  chose: 'a' | 'b',
  majorityVote?: 'a' | 'b'
): Omit<WYRChoice, 'playerId'> => {
  const optionChosen = chose === 'a' ? question.optionA : question.optionB;
  const otherOption = chose === 'a' ? question.optionB : question.optionA;

  return {
    questionId: question.id,
    question,
    chose,
    optionChosen,
    // All of these analyze the CHOSEN option, making results unique per player
    wasRisky: isRiskyOption(optionChosen, otherOption),
    wasFunny: isFunnyOption(optionChosen),
    wasDeep: isDeepOption(optionChosen),
    wasPractical: isPracticalOption(optionChosen),
    wasAdventurous: isAdventurousOption(optionChosen),
    agreedWithMajority: majorityVote ? chose === majorityVote : undefined,
  };
};

// Calculate player stats from choices
export const calculatePlayerStats = (
  playerId: string,
  playerName: string,
  avatarEmoji: string,
  avatarColor: string,
  choices: WYRChoice[]
): WYRPlayerStats => {
  const riskyChoices = choices.filter(c => c.wasRisky).length;
  const funnyChoices = choices.filter(c => c.wasFunny).length;
  const deepChoices = choices.filter(c => c.wasDeep).length;
  const practicalChoices = choices.filter(c => c.wasPractical).length;
  const adventurousChoices = choices.filter(c => c.wasAdventurous).length;
  const majorityAgreements = choices.filter(c => c.agreedWithMajority).length;
  const optionACount = choices.filter(c => c.chose === 'a').length;
  const optionBCount = choices.filter(c => c.chose === 'b').length;

  return {
    playerId,
    playerName,
    avatarEmoji,
    avatarColor,
    choices,
    riskyChoices,
    funnyChoices,
    deepChoices,
    practicalChoices,
    adventurousChoices,
    majorityAgreements,
    totalQuestions: choices.length,
    optionACount,
    optionBCount,
  };
};

// Generate personality insights from stats
export const generateInsights = (stats: WYRPlayerStats): PersonalityInsight[] => {
  const insights: PersonalityInsight[] = [];
  const total = stats.totalQuestions;

  if (total === 0) return insights;

  // Risk Taker vs Play Safe
  const riskyPercent = Math.round((stats.riskyChoices / total) * 100);
  if (riskyPercent >= 70) {
    insights.push({
      emoji: '🎲',
      title: 'Risk Taker',
      description: `You chose the daring option ${stats.riskyChoices}/${total} times!`,
      percentage: riskyPercent,
      color: '#f97316', // orange
    });
  } else if (riskyPercent <= 30) {
    insights.push({
      emoji: '🛡️',
      title: 'Play It Safe',
      description: `You prefer the cautious choice ${total - stats.riskyChoices}/${total} times`,
      percentage: 100 - riskyPercent,
      color: '#22c55e', // green
    });
  } else {
    insights.push({
      emoji: '⚖️',
      title: 'Balanced',
      description: `You weigh risks carefully - ${riskyPercent}% adventurous`,
      percentage: 50,
      color: '#8b5cf6', // purple
    });
  }

  // Crowd Follower vs Rebel (only for multiplayer)
  if (stats.choices.some(c => c.agreedWithMajority !== undefined)) {
    const majorityPercent = Math.round((stats.majorityAgreements / total) * 100);
    if (majorityPercent >= 70) {
      insights.push({
        emoji: '👥',
        title: 'Team Player',
        description: `You agreed with the group ${majorityPercent}% of the time`,
        percentage: majorityPercent,
        color: '#3b82f6', // blue
      });
    } else if (majorityPercent <= 30) {
      insights.push({
        emoji: '🦄',
        title: 'Unique Thinker',
        description: `You march to your own beat - ${100 - majorityPercent}% rebel!`,
        percentage: 100 - majorityPercent,
        color: '#ec4899', // pink
      });
    } else {
      insights.push({
        emoji: '🎭',
        title: 'Independent Mind',
        description: `Sometimes with the crowd, sometimes against`,
        percentage: 50,
        color: '#14b8a6', // teal
      });
    }
  }

  // Fun-Loving (based on funny option choices)
  const funnyPercent = Math.round((stats.funnyChoices / total) * 100);
  if (stats.funnyChoices >= 3) {
    insights.push({
      emoji: '🎉',
      title: 'Life of the Party',
      description: `You chose ${stats.funnyChoices} wild/funny options!`,
      percentage: funnyPercent,
      color: '#fbbf24', // yellow
    });
  }

  // Deep Thinker (based on deep option choices)
  const deepPercent = Math.round((stats.deepChoices / total) * 100);
  if (stats.deepChoices >= 3) {
    insights.push({
      emoji: '🤔',
      title: 'Deep Thinker',
      description: `You chose ${stats.deepChoices} meaningful options`,
      percentage: deepPercent,
      color: '#6366f1', // indigo
    });
  }

  // Adventurous Spirit (based on adventurous option choices)
  const adventurousPercent = Math.round((stats.adventurousChoices / total) * 100);
  if (stats.adventurousChoices >= 3) {
    insights.push({
      emoji: '🚀',
      title: 'Adventure Seeker',
      description: `${stats.adventurousChoices} options involved travel/powers!`,
      percentage: adventurousPercent,
      color: '#06b6d4', // cyan
    });
  }

  // Practical Mind (based on practical option choices)
  const practicalPercent = Math.round((stats.practicalChoices / total) * 100);
  if (stats.practicalChoices >= 3) {
    insights.push({
      emoji: '💼',
      title: 'Practical Mind',
      description: `You chose ${stats.practicalChoices} practical/money-smart options`,
      percentage: practicalPercent,
      color: '#84cc16', // lime
    });
  }

  // Option preference (A vs B bias)
  const aPercent = Math.round((stats.optionACount / total) * 100);
  if (aPercent >= 70) {
    insights.push({
      emoji: '🅰️',
      title: 'First Instinct',
      description: `You picked option A ${aPercent}% of the time!`,
      percentage: aPercent,
      color: '#f472b6', // pink
    });
  } else if (aPercent <= 30) {
    insights.push({
      emoji: '🅱️',
      title: 'Second Thoughts',
      description: `You picked option B ${100 - aPercent}% of the time!`,
      percentage: 100 - aPercent,
      color: '#a78bfa', // violet
    });
  }

  return insights;
};

// Generate fun facts from stats
export const generateFunFacts = (stats: WYRPlayerStats, allPlayersStats?: WYRPlayerStats[]): string[] => {
  const facts: string[] = [];
  const total = stats.totalQuestions;

  if (total === 0) return facts;

  // Use pre-calculated A/B counts
  if (stats.optionACount > stats.optionBCount + 3) {
    facts.push(`You picked Option A ${stats.optionACount} times - first instinct rules!`);
  } else if (stats.optionBCount > stats.optionACount + 3) {
    facts.push(`You picked Option B ${stats.optionBCount} times - second thoughts win!`);
  }

  // Streak analysis
  let maxStreak = 0;
  let currentStreak = 0;
  let lastChoice: 'a' | 'b' | null = null;

  for (const choice of stats.choices) {
    if (choice.chose === lastChoice) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
      lastChoice = choice.chose;
    }
  }

  if (maxStreak >= 4) {
    facts.push(`Longest streak: ${maxStreak} same-side choices in a row!`);
  }

  // Category preferences
  const categories = stats.choices.reduce((acc, c) => {
    acc[c.question.category] = (acc[c.question.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categories)
    .sort(([, a], [, b]) => b - a)[0];

  if (topCategory && topCategory[1] >= 3) {
    facts.push(`Favorite category: ${topCategory[0]} (${topCategory[1]} questions)`);
  }

  // Multiplayer comparisons
  if (allPlayersStats && allPlayersStats.length > 1) {
    const mostRisky = allPlayersStats.reduce((prev, curr) =>
      curr.riskyChoices > prev.riskyChoices ? curr : prev
    );

    if (mostRisky.playerId === stats.playerId && stats.riskyChoices > 5) {
      facts.push(`You were the biggest risk-taker in the group!`);
    }

    // Count disagreements with group
    const disagreements = stats.choices.filter(c => c.agreedWithMajority === false).length;
    if (disagreements >= 4) {
      facts.push(`You disagreed with the group ${disagreements} times - bold!`);
    }
  }

  return facts;
};

// Get overall personality type - uses multiple factors for variety
export const getPersonalityType = (stats: WYRPlayerStats): { emoji: string; name: string; description: string } => {
  const total = stats.totalQuestions;
  if (total === 0) {
    return { emoji: '🎭', name: 'The Mystery', description: 'Play more to discover your personality!' };
  }

  const riskyPercent = (stats.riskyChoices / total) * 100;
  const adventurousPercent = (stats.adventurousChoices / total) * 100;
  const practicalPercent = (stats.practicalChoices / total) * 100;
  const funnyPercent = (stats.funnyChoices / total) * 100;
  const deepPercent = (stats.deepChoices / total) * 100;
  const aPercent = (stats.optionACount / total) * 100;
  const majorityPercent = stats.choices.some(c => c.agreedWithMajority !== undefined)
    ? (stats.majorityAgreements / total) * 100
    : 50;

  // Check for dominant traits first (more unique)
  if (adventurousPercent >= 50) {
    return {
      emoji: '🌍',
      name: 'The Explorer',
      description: 'Always seeking adventure and new experiences!'
    };
  }

  if (practicalPercent >= 50) {
    return {
      emoji: '💎',
      name: 'The Strategist',
      description: 'Smart and practical - you know what matters!'
    };
  }

  if (funnyPercent >= 60) {
    return {
      emoji: '🎪',
      name: 'The Entertainer',
      description: 'Life is a party and you are the host!'
    };
  }

  if (deepPercent >= 60) {
    return {
      emoji: '📚',
      name: 'The Philosopher',
      description: 'Deep thinker who ponders life\'s big questions!'
    };
  }

  // A/B preference personalities
  if (aPercent >= 80) {
    return {
      emoji: '⚡',
      name: 'The Quick Draw',
      description: 'You trust your gut - first choice is best choice!'
    };
  }

  if (aPercent <= 20) {
    return {
      emoji: '🔮',
      name: 'The Contrarian',
      description: 'You see what others miss - second options rule!'
    };
  }

  // Original quadrant-based personalities
  if (riskyPercent >= 60 && majorityPercent >= 60) {
    return {
      emoji: '🌟',
      name: 'The Trendsetter',
      description: 'Adventurous AND agreeable - you lead the pack!'
    };
  } else if (riskyPercent >= 60 && majorityPercent < 40) {
    return {
      emoji: '🚀',
      name: 'The Maverick',
      description: 'A bold risk-taker who charts their own course!'
    };
  } else if (riskyPercent < 40 && majorityPercent >= 60) {
    return {
      emoji: '🤝',
      name: 'The Diplomat',
      description: 'Thoughtful and harmonious - you value consensus!'
    };
  } else if (riskyPercent < 40 && majorityPercent < 40) {
    return {
      emoji: '🦉',
      name: 'The Sage',
      description: 'Careful and independent - wisdom guides you!'
    };
  } else {
    return {
      emoji: '🎭',
      name: 'The Wildcard',
      description: 'Unpredictable and versatile - every choice is a new adventure!'
    };
  }
};
