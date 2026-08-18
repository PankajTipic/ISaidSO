export interface CategoryPlaceholderMap {
  prediction: string;
  poll: string;
}

const CATEGORY_PLACEHOLDERS: Record<string, CategoryPlaceholderMap> = {
  sports: {
    prediction: "e.g. Will India win the T20 World Cup final?",
    poll: "e.g. Who is the best player in this season's IPL?",
  },
  politics: {
    prediction: "e.g. Will the upcoming tax reform bill pass in parliament?",
    poll: "e.g. Which political party do you think will win the upcoming election?",
  },
  finance: {
    prediction: "e.g. Will Bitcoin cross $100,000 before December?",
    poll: "e.g. Where are you planning to invest your savings this year?",
  },
  technology: {
    prediction: "e.g. Will GPT-5 be released by OpenAI before Q4?",
    poll: "e.g. Which smartphone OS do you prefer for productivity?",
  },
  entertainment: {
    prediction: "e.g. Will the new blockbuster movie cross $1 Billion at the box office?",
    poll: "e.g. What was the best movie released this month?",
  },
  education: {
    prediction: "e.g. Will national entrance exam cutoffs increase this year?",
    poll: "e.g. Which study method works best for exam preparation?",
  },
  health: {
    prediction: "e.g. Will the new vaccine candidate complete phase 3 trials by July?",
    poll: "e.g. How many hours of exercise do you get per week?",
  },
  weather: {
    prediction: "e.g. Will it rain in Mumbai on Independence Day?",
    poll: "e.g. What is your favorite season of the year?",
  },
  gaming: {
    prediction: "e.g. Will GTA 6 be released in Q3 of next year?",
    poll: "e.g. What is your favorite gaming platform of all time?",
  },
};

/**
 * Returns a dynamic question example placeholder based on the selected category name.
 * Automatically updates when category is changed.
 */
export function getCategoryPlaceholder(
  categoryName?: string | null,
  type: 'prediction' | 'poll' = 'prediction'
): string {
  if (!categoryName || !categoryName.trim()) {
    return type === 'prediction'
      ? 'Write your bold prediction... (e.g. Will electric vehicle sales double by next year?)'
      : 'What would you like to ask? (e.g. Which major global event are you most excited about?)';
  }

  const nameLower = categoryName.toLowerCase().trim();

  if (
    nameLower.includes('sport') ||
    nameLower.includes('cricket') ||
    nameLower.includes('football') ||
    nameLower.includes('soccer') ||
    nameLower.includes('ipl') ||
    nameLower.includes('match')
  ) {
    return CATEGORY_PLACEHOLDERS.sports[type];
  }
  if (
    nameLower.includes('politic') ||
    nameLower.includes('election') ||
    nameLower.includes('gov') ||
    nameLower.includes('minister')
  ) {
    return CATEGORY_PLACEHOLDERS.politics[type];
  }
  if (
    nameLower.includes('finan') ||
    nameLower.includes('crypto') ||
    nameLower.includes('stock') ||
    nameLower.includes('market') ||
    nameLower.includes('busin') ||
    nameLower.includes('econ') ||
    nameLower.includes('money') ||
    nameLower.includes('trade')
  ) {
    return CATEGORY_PLACEHOLDERS.finance[type];
  }
  if (
    nameLower.includes('tech') ||
    nameLower.includes('ai') ||
    nameLower.includes('software') ||
    nameLower.includes('code') ||
    nameLower.includes('gadget') ||
    nameLower.includes('computer')
  ) {
    return CATEGORY_PLACEHOLDERS.technology[type];
  }
  if (
    nameLower.includes('entertain') ||
    nameLower.includes('movie') ||
    nameLower.includes('cinema') ||
    nameLower.includes('film') ||
    nameLower.includes('music') ||
    nameLower.includes('show') ||
    nameLower.includes('series')
  ) {
    return CATEGORY_PLACEHOLDERS.entertainment[type];
  }
  if (
    nameLower.includes('educat') ||
    nameLower.includes('study') ||
    nameLower.includes('school') ||
    nameLower.includes('college') ||
    nameLower.includes('acad') ||
    nameLower.includes('exam')
  ) {
    return CATEGORY_PLACEHOLDERS.education[type];
  }
  if (
    nameLower.includes('health') ||
    nameLower.includes('medic') ||
    nameLower.includes('scien') ||
    nameLower.includes('pharma') ||
    nameLower.includes('doctor')
  ) {
    return CATEGORY_PLACEHOLDERS.health[type];
  }
  if (
    nameLower.includes('weather') ||
    nameLower.includes('climat') ||
    nameLower.includes('rain') ||
    nameLower.includes('monsoon')
  ) {
    return CATEGORY_PLACEHOLDERS.weather[type];
  }
  if (
    nameLower.includes('game') ||
    nameLower.includes('gaming') ||
    nameLower.includes('esport')
  ) {
    return CATEGORY_PLACEHOLDERS.gaming[type];
  }

  // Dynamic fallback for any custom category name
  return type === 'prediction'
    ? `Write your prediction for ${categoryName}... (e.g. What will happen in ${categoryName} this year?)`
    : `What would you like to ask about ${categoryName}?`;
}
