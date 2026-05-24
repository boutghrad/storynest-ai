import { create } from "zustand";

// =============================================================================
// TypeScript Interfaces — All data types for the StoryNest AI platform
// =============================================================================

/** User roles within the platform */
export type UserRole = "parent" | "teacher" | "admin" | "child";

/** Available app views / pages */
export type AppView =
  | "landing"
  | "dashboard"
  | "reader"
  | "admin"
  | "teacher"
  | "parent"
  | "pricing"
  | "story-create";

/** Theme options */
export type Theme = "light" | "dark" | "system";

/** Story genres — aligned with STORY_GENRES constant */
export type StoryGenre =
  | "adventure"
  | "fantasy"
  | "bedtime"
  | "educational"
  | "friendship"
  | "mystery"
  | "scifi"
  | "fairy-tale"
  | "animal"
  | "comedy";

/** Age groups — aligned with AGE_GROUPS constant */
export type AgeGroup = "2-4" | "4-6" | "6-8" | "8-10" | "10-12";

/** Supported story languages */
export type StoryLanguage = "en" | "es" | "fr" | "de" | "zh" | "ja" | "ko" | "pt";

/** Narration voice IDs — aligned with NARRATION_VOICES constant */
export type NarrationVoice =
  | "storyteller"
  | "adventurer"
  | "whisperer"
  | "cheerleader"
  | "professor"
  | "dreamer";

/** Subscription plan IDs */
export type SubscriptionPlanId = "free" | "pro" | "family" | "teacher";

/** Moderation status for stories */
export type ModerationStatus = "pending" | "approved" | "rejected";

// =============================================================================
// Data Models
// =============================================================================

/** Authenticated user profile */
export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: UserRole;
  subscription?: SubscriptionPlanId;
  credits?: number;
  createdAt?: string;
}

/** A single story page with text and optional illustration */
export interface StoryPage {
  pageNumber: number;
  text: string;
  illustrationUrl?: string;
  illustrationPrompt?: string;
}

/** A complete generated story */
export interface Story {
  id: string;
  title: string;
  content: string;
  pages: StoryPage[];
  ageGroup: AgeGroup;
  genre: StoryGenre;
  moral?: string;
  characters: StoryCharacter[];
  language: StoryLanguage;
  includeIllustrations: boolean;
  includeNarration: boolean;
  narrationVoice?: NarrationVoice;
  coverImageUrl?: string;
  readingTimeMinutes?: number;
  createdAt: string;
  updatedAt: string;
  authorId?: string;
  moderationStatus?: ModerationStatus;
}

/** A character within a story */
export interface StoryCharacter {
  name: string;
  description: string;
  traits: string[];
}

/** A story saved to a user's library */
export interface SavedStory {
  id: string;
  storyId: string;
  story: Story;
  folder: string;
  isFavorite: boolean;
  lastReadPage?: number;
  readCount: number;
  savedAt: string;
}

/** Story generation progress tracking */
export interface GenerationProgress {
  step: string;
  progress: number;
}

/** Form state for story creation */
export interface StoryForm {
  title: string;
  ageGroup: AgeGroup | "";
  genre: StoryGenre | "";
  moral: string;
  characters: StoryCharacter[];
  language: StoryLanguage;
  includeIllustrations: boolean;
  includeNarration: boolean;
}

/** Library filter options */
export interface LibraryFilter {
  genre: StoryGenre | "";
  ageGroup: AgeGroup | "";
  search: string;
}

/** Admin dashboard statistics */
export interface AdminStats {
  totalUsers: number;
  totalStories: number;
  revenue: number;
  activeSubscriptions: number;
}

// =============================================================================
// Slice State & Action Types
// =============================================================================

// ----- App Slice -----
interface AppState {
  currentView: AppView;
  isSidebarOpen: boolean;
  theme: Theme;
}

interface AppActions {
  setView: (view: AppView) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
}

export type AppSlice = AppState & AppActions;

// ----- Auth Slice -----
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export type AuthSlice = AuthState & AuthActions;

// ----- Story Slice -----
interface StoryState {
  currentStory: Story | null;
  stories: Story[];
  isGenerating: boolean;
  generationProgress: GenerationProgress;
  storyForm: StoryForm;
}

interface StoryActions {
  setCurrentStory: (story: Story | null) => void;
  setStories: (stories: Story[]) => void;
  addStory: (story: Story) => void;
  removeStory: (storyId: string) => void;
  updateStory: (storyId: string, updates: Partial<Story>) => void;
  setGenerating: (isGenerating: boolean) => void;
  updateProgress: (progress: GenerationProgress) => void;
  updateStoryForm: (updates: Partial<StoryForm>) => void;
  resetStoryForm: () => void;
}

export type StorySlice = StoryState & StoryActions;

// ----- Library Slice -----
interface LibraryState {
  savedStories: SavedStory[];
  folders: string[];
  filter: LibraryFilter;
}

interface LibraryActions {
  setSavedStories: (stories: SavedStory[]) => void;
  addSavedStory: (story: SavedStory) => void;
  removeSavedStory: (id: string) => void;
  setFolders: (folders: string[]) => void;
  addFolder: (folder: string) => void;
  removeFolder: (folder: string) => void;
  setFilter: (filter: Partial<LibraryFilter>) => void;
  resetFilter: () => void;
  toggleFavorite: (id: string) => void;
}

export type LibrarySlice = LibraryState & LibraryActions;

// ----- Reader Slice -----
interface ReaderState {
  isFullscreen: boolean;
  currentPage: number;
  totalPages: number;
  isNarrating: boolean;
  narrationSpeed: number;
  currentVoice: NarrationVoice;
}

interface ReaderActions {
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setFullscreen: (fullscreen: boolean) => void;
  toggleFullscreen: () => void;
  toggleNarration: () => void;
  setSpeed: (speed: number) => void;
  setVoice: (voice: NarrationVoice) => void;
  setTotalPages: (total: number) => void;
  resetReader: () => void;
}

export type ReaderSlice = ReaderState & ReaderActions;

// ----- Admin Slice -----
interface AdminState {
  stats: AdminStats;
  moderationQueue: Story[];
  selectedTab: string;
}

interface AdminActions {
  setStats: (stats: Partial<AdminStats>) => void;
  setModerationQueue: (stories: Story[]) => void;
  removeFromModerationQueue: (storyId: string) => void;
  updateModerationStatus: (storyId: string, status: ModerationStatus) => void;
  setSelectedTab: (tab: string) => void;
}

export type AdminSlice = AdminState & AdminActions;

// =============================================================================
// Combined Store Type
// =============================================================================

export type AppStore = AppSlice & AuthSlice & StorySlice & LibrarySlice & ReaderSlice & AdminSlice;

// =============================================================================
// Default Values
// =============================================================================

const DEFAULT_STORY_FORM: StoryForm = {
  title: "",
  ageGroup: "",
  genre: "",
  moral: "",
  characters: [],
  language: "en",
  includeIllustrations: true,
  includeNarration: false,
};

const DEFAULT_LIBRARY_FILTER: LibraryFilter = {
  genre: "",
  ageGroup: "",
  search: "",
};

const DEFAULT_ADMIN_STATS: AdminStats = {
  totalUsers: 0,
  totalStories: 0,
  revenue: 0,
  activeSubscriptions: 0,
};

const DEFAULT_GENERATION_PROGRESS: GenerationProgress = {
  step: "",
  progress: 0,
};

const DEFAULT_READER_STATE: Pick<ReaderState, "isFullscreen" | "currentPage" | "totalPages" | "isNarrating" | "narrationSpeed" | "currentVoice"> = {
  isFullscreen: false,
  currentPage: 1,
  totalPages: 1,
  isNarrating: false,
  narrationSpeed: 1,
  currentVoice: "storyteller",
};

// =============================================================================
// Store Definition
// =============================================================================

export const useAppStore = create<AppStore>()((set) => ({
  // =========================================================================
  // App Slice
  // =========================================================================
  currentView: "landing",
  isSidebarOpen: false,
  theme: "system",

  setView: (view) => set({ currentView: view }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setTheme: (theme) => set({ theme }),

  // =========================================================================
  // Auth Slice
  // =========================================================================
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
  setUser: (user) => set({ user, isAuthenticated: true }),
  setLoading: (isLoading) => set({ isLoading }),

  // =========================================================================
  // Story Slice
  // =========================================================================
  currentStory: null,
  stories: [],
  isGenerating: false,
  generationProgress: DEFAULT_GENERATION_PROGRESS,
  storyForm: { ...DEFAULT_STORY_FORM },

  setCurrentStory: (story) => set({ currentStory: story }),
  setStories: (stories) => set({ stories }),
  addStory: (story) =>
    set((state) => ({ stories: [story, ...state.stories] })),
  removeStory: (storyId) =>
    set((state) => ({ stories: state.stories.filter((s) => s.id !== storyId) })),
  updateStory: (storyId, updates) =>
    set((state) => ({
      stories: state.stories.map((s) =>
        s.id === storyId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      ),
      currentStory:
        state.currentStory?.id === storyId
          ? { ...state.currentStory, ...updates, updatedAt: new Date().toISOString() }
          : state.currentStory,
    })),
  setGenerating: (isGenerating) => set({ isGenerating }),
  updateProgress: (generationProgress) => set({ generationProgress }),
  updateStoryForm: (updates) =>
    set((state) => ({
      storyForm: { ...state.storyForm, ...updates },
    })),
  resetStoryForm: () => set({ storyForm: { ...DEFAULT_STORY_FORM } }),

  // =========================================================================
  // Library Slice
  // =========================================================================
  savedStories: [],
  folders: ["All Stories", "Favorites", "Bedtime", "Educational"],
  filter: { ...DEFAULT_LIBRARY_FILTER },

  setSavedStories: (savedStories) => set({ savedStories }),
  addSavedStory: (story) =>
    set((state) => ({ savedStories: [story, ...state.savedStories] })),
  removeSavedStory: (id) =>
    set((state) => ({
      savedStories: state.savedStories.filter((s) => s.id !== id),
    })),
  setFolders: (folders) => set({ folders }),
  addFolder: (folder) =>
    set((state) => ({
      folders: state.folders.includes(folder) ? state.folders : [...state.folders, folder],
    })),
  removeFolder: (folder) =>
    set((state) => ({
      folders: state.folders.filter((f) => f !== folder),
    })),
  setFilter: (filter) =>
    set((state) => ({
      filter: { ...state.filter, ...filter },
    })),
  resetFilter: () => set({ filter: { ...DEFAULT_LIBRARY_FILTER } }),
  toggleFavorite: (id) =>
    set((state) => ({
      savedStories: state.savedStories.map((s) =>
        s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
      ),
    })),

  // =========================================================================
  // Reader Slice
  // =========================================================================
  ...DEFAULT_READER_STATE,

  setPage: (page) => set({ currentPage: page }),
  nextPage: () =>
    set((state) => ({
      currentPage: Math.min(state.currentPage + 1, state.totalPages),
    })),
  prevPage: () =>
    set((state) => ({
      currentPage: Math.max(state.currentPage - 1, 1),
    })),
  setFullscreen: (isFullscreen) => set({ isFullscreen }),
  toggleFullscreen: () =>
    set((state) => ({ isFullscreen: !state.isFullscreen })),
  toggleNarration: () =>
    set((state) => ({ isNarrating: !state.isNarrating })),
  setSpeed: (narrationSpeed) => set({ narrationSpeed }),
  setVoice: (currentVoice) => set({ currentVoice }),
  setTotalPages: (totalPages) => set({ totalPages }),
  resetReader: () => set({ ...DEFAULT_READER_STATE }),

  // =========================================================================
  // Admin Slice
  // =========================================================================
  stats: { ...DEFAULT_ADMIN_STATS },
  moderationQueue: [],
  selectedTab: "overview",

  setStats: (stats) =>
    set((state) => ({
      stats: { ...state.stats, ...stats },
    })),
  setModerationQueue: (moderationQueue) => set({ moderationQueue }),
  removeFromModerationQueue: (storyId) =>
    set((state) => ({
      moderationQueue: state.moderationQueue.filter((s) => s.id !== storyId),
    })),
  updateModerationStatus: (storyId, status) =>
    set((state) => ({
      moderationQueue: state.moderationQueue.map((s) =>
        s.id === storyId ? { ...s, moderationStatus: status } : s
      ),
    })),
  setSelectedTab: (selectedTab) => set({ selectedTab }),
}));

// =============================================================================
// Selector Hooks — Optimized selectors for component consumption
// =============================================================================

/** Select only the app slice state */
export const useAppSlice = () =>
  useAppStore((state) => ({
    currentView: state.currentView,
    isSidebarOpen: state.isSidebarOpen,
    theme: state.theme,
    setView: state.setView,
    toggleSidebar: state.toggleSidebar,
    setSidebarOpen: state.setSidebarOpen,
    setTheme: state.setTheme,
  }));

/** Select only the auth slice state */
export const useAuthSlice = () =>
  useAppStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login: state.login,
    logout: state.logout,
    setUser: state.setUser,
    setLoading: state.setLoading,
  }));

/** Select only the story slice state */
export const useStorySlice = () =>
  useAppStore((state) => ({
    currentStory: state.currentStory,
    stories: state.stories,
    isGenerating: state.isGenerating,
    generationProgress: state.generationProgress,
    storyForm: state.storyForm,
    setCurrentStory: state.setCurrentStory,
    setStories: state.setStories,
    addStory: state.addStory,
    removeStory: state.removeStory,
    updateStory: state.updateStory,
    setGenerating: state.setGenerating,
    updateProgress: state.updateProgress,
    updateStoryForm: state.updateStoryForm,
    resetStoryForm: state.resetStoryForm,
  }));

/** Select only the library slice state */
export const useLibrarySlice = () =>
  useAppStore((state) => ({
    savedStories: state.savedStories,
    folders: state.folders,
    filter: state.filter,
    setSavedStories: state.setSavedStories,
    addSavedStory: state.addSavedStory,
    removeSavedStory: state.removeSavedStory,
    setFolders: state.setFolders,
    addFolder: state.addFolder,
    removeFolder: state.removeFolder,
    setFilter: state.setFilter,
    resetFilter: state.resetFilter,
    toggleFavorite: state.toggleFavorite,
  }));

/** Select only the reader slice state */
export const useReaderSlice = () =>
  useAppStore((state) => ({
    isFullscreen: state.isFullscreen,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    isNarrating: state.isNarrating,
    narrationSpeed: state.narrationSpeed,
    currentVoice: state.currentVoice,
    setPage: state.setPage,
    nextPage: state.nextPage,
    prevPage: state.prevPage,
    setFullscreen: state.setFullscreen,
    toggleFullscreen: state.toggleFullscreen,
    toggleNarration: state.toggleNarration,
    setSpeed: state.setSpeed,
    setVoice: state.setVoice,
    setTotalPages: state.setTotalPages,
    resetReader: state.resetReader,
  }));

/** Select only the admin slice state */
export const useAdminSlice = () =>
  useAppStore((state) => ({
    stats: state.stats,
    moderationQueue: state.moderationQueue,
    selectedTab: state.selectedTab,
    setStats: state.setStats,
    setModerationQueue: state.setModerationQueue,
    removeFromModerationQueue: state.removeFromModerationQueue,
    updateModerationStatus: state.updateModerationStatus,
    setSelectedTab: state.setSelectedTab,
  }));
