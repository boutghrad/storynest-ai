// ===== Subscription Plans =====
export const SUBSCRIPTION_PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    credits: 5,
    period: "month",
    description: "Get started with a few magical stories each month",
    features: [
      "5 story credits per month",
      "Basic story customization",
      "Text-only stories",
      "Community library access",
    ],
    highlighted: false,
    cta: "Get Started Free",
  },
  {
    id: "pro",
    name: "Pro",
    price: 9.99,
    credits: 50,
    period: "month",
    description: "Perfect for parents who love bedtime stories",
    features: [
      "50 story credits per month",
      "Advanced story customization",
      "AI-generated illustrations",
      "Audio narration",
      "Priority story generation",
      "Export to PDF",
    ],
    highlighted: true,
    cta: "Start Pro Trial",
  },
  {
    id: "family",
    name: "Family",
    price: 19.99,
    credits: 150,
    period: "month",
    description: "Unlimited magic for the whole family",
    features: [
      "150 story credits per month",
      "Full story customization suite",
      "AI-generated illustrations (HD)",
      "Audio narration with multiple voices",
      "Family library for up to 5 children",
      "Print-ready storybooks",
      "Early access to new features",
    ],
    highlighted: false,
    cta: "Start Family Trial",
  },
  {
    id: "teacher",
    name: "Teacher",
    price: 14.99,
    credits: 100,
    period: "month",
    description: "Bring storytelling magic to the classroom",
    features: [
      "100 story credits per month",
      "Educational story templates",
      "Classroom management tools",
      "Batch story generation",
      "Comprehension quizzes",
      "Student progress tracking",
      "Export to PDF & print",
    ],
    highlighted: false,
    cta: "Start Teacher Trial",
  },
] as const;

// ===== Age Groups =====
export const AGE_GROUPS = [
  {
    id: "2-4",
    label: "Toddlers",
    range: "2–4 years",
    description: "Simple words, vivid imagery, and gentle themes",
    icon: "🧒",
  },
  {
    id: "4-6",
    label: "Early Readers",
    range: "4–6 years",
    description: "Short sentences, repetition, and picture-heavy",
    icon: "📖",
  },
  {
    id: "6-8",
    label: "Young Readers",
    range: "6–8 years",
    description: "Longer narratives, chapter-like sections, moral lessons",
    icon: "🌟",
  },
  {
    id: "8-10",
    label: "Growing Readers",
    range: "8–10 years",
    description: "Complex plots, character development, adventure",
    icon: "🚀",
  },
  {
    id: "10-12",
    label: "Pre-Teens",
    range: "10–12 years",
    description: "Sophisticated themes, deeper emotions, multi-arc stories",
    icon: "🎯",
  },
] as const;

// ===== Story Genres =====
export const STORY_GENRES = [
  {
    id: "adventure",
    label: "Adventure",
    icon: "🗺️",
    description: "Exciting journeys and daring quests",
  },
  {
    id: "fantasy",
    label: "Fantasy",
    icon: "🧙",
    description: "Magic, mythical creatures, and enchanted worlds",
  },
  {
    id: "bedtime",
    label: "Bedtime",
    icon: "🌙",
    description: "Calming tales to wind down before sleep",
  },
  {
    id: "educational",
    label: "Educational",
    icon: "🔬",
    description: "Learn science, history, and nature through stories",
  },
  {
    id: "friendship",
    label: "Friendship",
    icon: "🤝",
    description: "Stories about kindness, teamwork, and connection",
  },
  {
    id: "mystery",
    label: "Mystery",
    icon: "🔍",
    description: "Puzzles, clues, and detective adventures",
  },
  {
    id: "scifi",
    label: "Sci-Fi",
    icon: "🛸",
    description: "Space exploration, robots, and future worlds",
  },
  {
    id: "fairy-tale",
    label: "Fairy Tale",
    icon: "🏰",
    description: "Classic fairy tales with modern twists",
  },
  {
    id: "animal",
    label: "Animals",
    icon: "🦁",
    description: "Stories starring lovable animal characters",
  },
  {
    id: "comedy",
    label: "Comedy",
    icon: "😂",
    description: "Silly, laugh-out-loud stories for fun times",
  },
] as const;

// ===== Narration Voices =====
export const NARRATION_VOICES = [
  {
    id: "storyteller",
    label: "The Storyteller",
    description: "Warm, engaging, and expressive — like a favorite grandparent reading aloud",
    tone: "warm",
  },
  {
    id: "adventurer",
    label: "The Adventurer",
    description: "Energetic and dramatic — perfect for action-packed tales",
    tone: "energetic",
  },
  {
    id: "whisperer",
    label: "The Whisperer",
    description: "Soft and soothing — ideal for bedtime and calming stories",
    tone: "calm",
  },
  {
    id: "cheerleader",
    label: "The Cheerleader",
    description: "Bubbly and encouraging — great for younger children",
    tone: "cheerful",
  },
  {
    id: "professor",
    label: "The Professor",
    description: "Clear and articulate — best for educational and science stories",
    tone: "informative",
  },
  {
    id: "dreamer",
    label: "The Dreamer",
    description: "Gentle and imaginative — perfect for fantasy and fairy tales",
    tone: "dreamy",
  },
] as const;

// ===== Default Prompts for Story Generation =====
export const DEFAULT_PROMPTS = {
  storyStarters: [
    "A curious little fox discovers a hidden door in an ancient oak tree…",
    "On the night of the shooting stars, a young inventor makes a wish…",
    "In a cozy village at the edge of the Whispering Woods…",
    "A brave kitten sets off on a journey across the Rainbow Bridge…",
    "When the moon turns blue, something magical always happens…",
    "Deep beneath the ocean waves, a friendly octopus finds a treasure map…",
    "A tiny dragon who's afraid of fire learns an important lesson…",
    "On the first day of spring, the flowers begin to whisper secrets…",
  ],
  characterTemplates: [
    "A curious {animal} named {name} who loves {hobby}",
    "A brave young {profession} with a magical {object}",
    "Twin siblings who discover they can talk to {creature}",
    "A shy {animal} who becomes the hero of {place}",
  ],
  settingTemplates: [
    "An enchanted forest where the trees glow at night",
    "A floating island above the clouds",
    "A cozy treehouse village in the Whispering Woods",
    "An underwater kingdom made of coral and light",
    "A magical library where books come alive",
    "A secret garden that only appears at sunrise",
  ],
  moralThemes: [
    "Kindness is the greatest magic of all",
    "Being different makes you special",
    "Friendship can overcome any challenge",
    "It's okay to ask for help",
    "Courage means being scared but doing it anyway",
    "Sharing makes everything better",
    "Honesty builds trust and friendship",
    "Patience leads to wonderful discoveries",
  ],
} as const;

// ===== App Constants =====
export const APP_CONSTANTS = {
  APP_NAME: "StoryNest AI",
  APP_TAGLINE: "Magical AI Stories for Kids",
  MAX_STORY_LENGTH: 3000,
  MIN_STORY_LENGTH: 200,
  DEFAULT_STORY_LENGTH: 800,
  MAX_CHARACTERS_PER_STORY: 5,
  MAX_ILLUSTRATIONS_PER_STORY: 8,
  WORDS_PER_MINUTE_CHILD: 150,
  MAX_PROMPT_LENGTH: 500,
} as const;
