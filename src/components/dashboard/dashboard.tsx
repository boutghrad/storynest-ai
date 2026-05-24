'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Zap,
  Clock,
  Heart,
  Bell,
  Sparkles,
  Wand2,
  Palette,
  Volume2,
  Plus,
  X,
  ChevronRight,
  Search,
  Star,
  FolderOpen,
  BookMarked,
  Play,
  Trash2,
  User,
  Feather,
  Crown,
  Cat,
  Bug,
  Ghost,
  TreePine,
  Fish,
  Rabbit,
  Flower2,
  Sun,
  Moon,
  Swords,
  FlaskConical,
  Handshake,
  Search as SearchIcon,
  Rocket,
  Castle,
  Laugh,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStorySlice, useAuthSlice, useLibrarySlice, useAppStore } from '@/stores/app-store'
import { STORY_GENRES, AGE_GROUPS, NARRATION_VOICES } from '@/lib/constants'
import { cn, getAgeGroupLabel, formatNumber } from '@/lib/utils'
import type { StoryGenre, AgeGroup, StoryLanguage, StoryCharacter } from '@/stores/app-store'

// ===== Animation Variants =====
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const tabContentVariants = {
  hidden: { opacity: 0, x: 10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.2 } },
}

// ===== Genre icon mapping =====
const GENRE_ICONS: Record<string, React.ElementType> = {
  adventure: Swords,
  fantasy: Wand2,
  bedtime: Moon,
  educational: FlaskConical,
  friendship: Handshake,
  mystery: SearchIcon,
  scifi: Rocket,
  'fairy-tale': Castle,
  animal: Cat,
  comedy: Laugh,
}

const GENRE_GRADIENTS: Record<string, string> = {
  adventure: 'from-orange-400 to-red-500',
  fantasy: 'from-violet-400 to-purple-500',
  bedtime: 'from-indigo-400 to-blue-500',
  educational: 'from-emerald-400 to-teal-500',
  friendship: 'from-pink-400 to-rose-500',
  mystery: 'from-slate-500 to-gray-600',
  scifi: 'from-cyan-400 to-blue-500',
  'fairy-tale': 'from-amber-400 to-yellow-500',
  animal: 'from-green-400 to-emerald-500',
  comedy: 'from-yellow-400 to-orange-400',
}

// ===== Mapping from form values to API enum values =====
const AGE_GROUP_TO_API: Record<string, string> = {
  '2-4': 'TODDLER',
  '4-6': 'EARLY_CHILD',
  '6-8': 'CHILD',
  '8-10': 'TWEEN',
  '10-12': 'TEEN',
}

const GENRE_TO_API: Record<string, string> = {
  adventure: 'ADVENTURE',
  fantasy: 'FANTASY',
  bedtime: 'BEDTIME',
  educational: 'EDUCATIONAL',
  friendship: 'FABLE',
  mystery: 'MYSTERY',
  scifi: 'SCIENCE_FICTION',
  'fairy-tale': 'FAIRY_TALE',
  animal: 'FABLE',
  comedy: 'HUMOR',
}

// ===== Generation Steps =====
const GENERATION_STEPS = [
  { label: 'Planning your story...', icon: Wand2 },
  { label: 'Writing chapters...', icon: Feather },
  { label: 'Creating scenes...', icon: BookOpen },
  { label: 'Generating illustrations...', icon: Palette },
  { label: 'Adding the finishing touches...', icon: Sparkles },
]

// ===== Moral suggestion chips =====
const MORAL_CHIPS = ['Kindness', 'Courage', 'Honesty', 'Friendship', 'Perseverance', 'Empathy']

// ===== Character templates =====
const CHARACTER_TEMPLATES = [
  { name: 'Brave Child', type: 'Child' as const, personality: ['Brave', 'Curious', 'Kind'], description: 'A courageous young hero ready for adventure' },
  { name: 'Wise Owl', type: 'Animal' as const, personality: ['Wise', 'Patient', 'Gentle'], description: 'An ancient owl full of wisdom and guidance' },
  { name: 'Friendly Dragon', type: 'Magical Creature' as const, personality: ['Friendly', 'Playful', 'Loyal'], description: 'A gentle dragon who loves making new friends' },
]

// ===== Character personality options =====
const PERSONALITY_OPTIONS = [
  'Brave', 'Curious', 'Kind', 'Funny', 'Shy', 'Clever',
  'Gentle', 'Adventurous', 'Creative', 'Loyal', 'Wise', 'Playful',
]

// ===== Language options =====
const LANGUAGES: { id: StoryLanguage; label: string; flag: string }[] = [
  { id: 'en', label: 'English', flag: '🇺🇸' },
  { id: 'es', label: 'Spanish', flag: '🇪🇸' },
  { id: 'fr', label: 'French', flag: '🇫🇷' },
  { id: 'de', label: 'German', flag: '🇩🇪' },
  { id: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { id: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { id: 'ko', label: 'Korean', flag: '🇰🇷' },
  { id: 'pt', label: 'Portuguese', flag: '🇧🇷' },
]

// ===== Mock story data =====
const MOCK_STORIES = [
  {
    id: '1',
    title: 'The Enchanted Forest Adventure',
    genre: 'fantasy' as StoryGenre,
    ageGroup: '6-8' as AgeGroup,
    status: 'published',
    createdAt: '2025-01-15',
    readingTime: 8,
  },
  {
    id: '2',
    title: 'Captain Whiskers and the Pirate Mice',
    genre: 'adventure' as StoryGenre,
    ageGroup: '4-6' as AgeGroup,
    status: 'published',
    createdAt: '2025-01-10',
    readingTime: 5,
  },
  {
    id: '3',
    title: 'Luna\'s Bedtime Dream',
    genre: 'bedtime' as StoryGenre,
    ageGroup: '2-4' as AgeGroup,
    status: 'draft',
    createdAt: '2025-01-08',
    readingTime: 3,
  },
  {
    id: '4',
    title: 'The Mystery of the Missing Cookies',
    genre: 'mystery' as StoryGenre,
    ageGroup: '6-8' as AgeGroup,
    status: 'published',
    createdAt: '2025-01-05',
    readingTime: 10,
  },
]

// ===== Mock library stories =====
const MOCK_LIBRARY_STORIES = [
  { id: 'l1', title: 'The Dragon Who Loved Rainbows', genre: 'fantasy' as StoryGenre, ageGroup: '4-6' as AgeGroup, isFavorite: true, folder: 'Favorites' },
  { id: 'l2', title: 'Counting Stars with Ben', genre: 'educational' as StoryGenre, ageGroup: '2-4' as AgeGroup, isFavorite: false, folder: 'Bedtime' },
  { id: 'l3', title: 'Space Pals: Journey to Mars', genre: 'scifi' as StoryGenre, ageGroup: '8-10' as AgeGroup, isFavorite: true, folder: 'Favorites' },
  { id: 'l4', title: 'The Laughing Giraffe', genre: 'comedy' as StoryGenre, ageGroup: '4-6' as AgeGroup, isFavorite: false, folder: 'All Stories' },
  { id: 'l5', title: 'Whiskers and the Wizard', genre: 'fairy-tale' as StoryGenre, ageGroup: '6-8' as AgeGroup, isFavorite: true, folder: 'Favorites' },
  { id: 'l6', title: 'The Science of Bubbles', genre: 'educational' as StoryGenre, ageGroup: '6-8' as AgeGroup, isFavorite: false, folder: 'Educational' },
]

// =============================================================================
// Dashboard Component
// =============================================================================

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthSlice()
  const {
    stories,
    isGenerating,
    generationProgress,
    storyForm,
    setGenerating,
    updateProgress,
    updateStoryForm,
    addStory,
    resetStoryForm,
  } = useStorySlice()
  const { folders, savedStories, toggleFavorite } = useLibrarySlice()
  const setCurrentStory = useAppStore((s) => s.setCurrentStory)
  const setView = useAppStore((s) => s.setView)

  const [activeTab, setActiveTab] = useState('my-stories')
  const [chapterCount, setChapterCount] = useState(3)
  const [storyLength, setStoryLength] = useState<'short' | 'medium' | 'long'>('medium')
  const [characters, setCharacters] = useState<StoryCharacter[]>([])
  const [notifications] = useState(3)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('All Stories')

  // Generation state
  const [currentGenStep, setCurrentGenStep] = useState(0)
  const eventSourceRef = useRef<EventSource | null>(null)

  const userName = user?.name || 'Storyteller'
  const credits = user?.credits ?? 25

  // ===== SSE Story Generation =====
  const handleGenerateStory = useCallback(async () => {
    if (!storyForm.title || !storyForm.genre || !storyForm.ageGroup) return

    setGenerating(true)
    setCurrentGenStep(0)

    const requestBody = {
      title: storyForm.title,
      ageGroup: AGE_GROUP_TO_API[storyForm.ageGroup] || 'CHILD',
      genre: GENRE_TO_API[storyForm.genre] || 'ADVENTURE',
      moral: storyForm.moral || undefined,
      characters: characters.map(c => ({
        name: c.name,
        description: c.description || c.traits.join(', '),
        role: 'PROTAGONIST' as const,
      })),
      language: storyForm.language,
      includeIllustrations: storyForm.includeIllustrations,
      includeNarration: storyForm.includeNarration,
      chapters: chapterCount,
    }

    try {
      const response = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('Failed to start generation')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''
      let currentEvent = ''
      let currentData = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Parse SSE events from buffer
        const lines = buffer.split('\n')
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            currentData = line.slice(6)
          } else if (line.trim() === '' && currentEvent && currentData) {
            try {
              const parsed = JSON.parse(currentData)

              if (currentEvent === 'progress') {
                updateProgress({ step: parsed.step, progress: parsed.progress })

                // Update current step based on progress
                if (parsed.progress <= 20) setCurrentGenStep(0)
                else if (parsed.progress <= 60) setCurrentGenStep(1)
                else if (parsed.progress <= 75) setCurrentGenStep(2)
                else if (parsed.progress <= 90) setCurrentGenStep(3)
                else setCurrentGenStep(4)
              } else if (currentEvent === 'complete') {
                updateProgress({ step: 'Complete', progress: 100 })
                setCurrentGenStep(4)

                const storyData = parsed.story
                if (storyData) {
                  addStory({
                    id: storyData.id || crypto.randomUUID(),
                    title: storyData.title || storyForm.title,
                    content: JSON.stringify(storyData.chapters || []),
                    pages: [],
                    ageGroup: storyForm.ageGroup,
                    genre: storyForm.genre,
                    moral: storyData.moral || storyForm.moral,
                    characters,
                    language: storyForm.language,
                    includeIllustrations: storyForm.includeIllustrations,
                    includeNarration: storyForm.includeNarration,
                    coverImageUrl: undefined,
                    readingTimeMinutes: storyData.readingTime || 5,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  })
                }

                setTimeout(() => {
                  setGenerating(false)
                  setActiveTab('my-stories')
                }, 1500)
              } else if (currentEvent === 'error') {
                updateProgress({ step: 'Error', progress: 0 })
                setGenerating(false)
              }
            } catch {
              // Ignore parse errors
            }

            currentEvent = ''
            currentData = ''
          }
        }
      }
    } catch (error) {
      console.error('Story generation failed:', error)
      updateProgress({ step: 'Error', progress: 0 })
      setGenerating(false)
    }
  }, [storyForm, characters, chapterCount, setGenerating, updateProgress, addStory])

  // ===== Character management =====
  const addCharacter = useCallback((template?: typeof CHARACTER_TEMPLATES[number]) => {
    if (template) {
      setCharacters(prev => [...prev, {
        name: template.name,
        description: template.description,
        traits: template.personality,
      }])
    } else {
      setCharacters(prev => [...prev, { name: '', description: '', traits: [] }])
    }
  }, [])

  const removeCharacter = useCallback((index: number) => {
    setCharacters(prev => prev.filter((_, i) => i !== index))
  }, [])

  const updateCharacter = useCallback((index: number, updates: Partial<StoryCharacter>) => {
    setCharacters(prev => prev.map((c, i) => i === index ? { ...c, ...updates } : c))
  }, [])

  const togglePersonality = useCallback((charIndex: number, trait: string) => {
    setCharacters(prev => prev.map((c, i) => {
      if (i !== charIndex) return c
      const hasTrait = c.traits.includes(trait)
      return {
        ...c,
        traits: hasTrait ? c.traits.filter(t => t !== trait) : [...c.traits, trait],
      }
    }))
  }, [])

  // ===== Credits calculation =====
  const creditsCost = storyForm.includeIllustrations
    ? (storyForm.includeNarration ? 3 : 2)
    : (storyForm.includeNarration ? 2 : 1)

  // ===== Library filtered stories =====
  const filteredLibrary = MOCK_LIBRARY_STORIES.filter(s => {
    if (selectedFolder !== 'All Stories' && s.folder !== selectedFolder) return false
    if (searchQuery && !s.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // ===== Open story in reader =====
  const openStory = useCallback((story: Record<string, unknown>) => {
    // Build a proper Story object for the reader
    const storyObj = {
      id: String(story.id),
      title: String(story.title || 'Untitled'),
      content: 'content' in story ? String((story as Record<string, unknown>).content) : '',
      pages: 'pages' in story ? ((story as Record<string, unknown>).pages as { pageNumber: number; text: string; illustrationUrl?: string; illustrationPrompt?: string }[]) : [],
      ageGroup: (story.ageGroup as '2-4' | '4-6' | '6-8' | '8-10' | '10-12') || '6-8',
      genre: (story.genre as 'adventure' | 'fantasy' | 'bedtime' | 'educational' | 'friendship' | 'mystery' | 'scifi' | 'fairy-tale' | 'animal' | 'comedy') || 'fantasy',
      moral: story.moral ? String(story.moral) : undefined,
      characters: (story.characters as { name: string; description: string; traits: string[] }[]) || [],
      language: (story.language as 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'pt') || 'en',
      includeIllustrations: Boolean(story.includeIllustrations),
      includeNarration: Boolean(story.includeNarration),
      coverImageUrl: story.coverImageUrl ? String(story.coverImageUrl) : undefined,
      readingTimeMinutes: Number(story.readingTimeMinutes || (story as Record<string, unknown>).readingTime || 5),
      createdAt: String(story.createdAt || new Date().toISOString()),
      updatedAt: String(story.updatedAt || new Date().toISOString()),
    }
    setCurrentStory(storyObj)
    setView('reader')
  }, [setCurrentStory, setView])

  // Cleanup event source on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* ===== Dashboard Header ===== */}
      <header className="sticky top-0 z-40 glass border-b border-amber-200/20 dark:border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Left: Logo + Welcome */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <img src="/storynest-logo.png" alt="StoryNest AI" className="w-7 h-7 rounded-lg" />
                <span className="hidden sm:inline font-bold tracking-tight">
                  <span className="gradient-text">StoryNest</span>
                  <span className="text-foreground ml-0.5">AI</span>
                </span>
              </div>
              <Separator orientation="vertical" className="hidden sm:block h-6" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium">Welcome back, {userName}! ✨</p>
                <p className="text-xs text-muted-foreground">Let&apos;s create something magical today</p>
              </div>
              <p className="sm:hidden text-sm font-medium">Hi, {userName.split(' ')[0]}! ✨</p>
            </div>

            {/* Right: Credits, Notifications, Avatar */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Credits Badge */}
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20 transition-colors px-3 py-1.5 cursor-default"
              >
                <Zap className="w-3.5 h-3.5 mr-1.5 fill-amber-500 text-amber-500" />
                <span className="font-semibold">{credits}</span>
                <span className="ml-1 text-xs opacity-80">credits</span>
              </Badge>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                <Bell className="w-4.5 h-4.5" />
                {notifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </Button>

              {/* Avatar */}
              <Avatar className="h-9 w-9 ring-2 ring-amber-500/30 cursor-pointer hover:ring-amber-500/60 transition-all">
                <AvatarImage src={user?.image || undefined} alt={userName} />
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-sm font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* ===== Left Column: Stats + Tabs ===== */}
          <div className="space-y-6">
            {/* ===== Quick Stats Row ===== */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {[
                { label: 'Stories Created', value: stories.length || 12, icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { label: 'Credits Used', value: 8, icon: Zap, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                { label: 'Reading Time', value: '2.5h', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { label: 'Saved Stories', value: 5, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <motion.div key={stat.label} variants={staggerItem}>
                    <Card className="glass border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={cn('p-2 rounded-xl', stat.bg)}>
                            <Icon className={cn('w-5 h-5', stat.color)} />
                          </div>
                          <div>
                            <p className="text-xl font-bold">{typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* ===== Main Tabs ===== */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="w-full sm:w-auto bg-muted/50 p-1 h-auto flex-wrap gap-1">
                <TabsTrigger value="my-stories" className="gap-1.5 text-xs sm:text-sm">
                  <BookOpen className="w-3.5 h-3.5" /> My Stories
                </TabsTrigger>
                <TabsTrigger value="create" className="gap-1.5 text-xs sm:text-sm">
                  <Sparkles className="w-3.5 h-3.5" /> Create New
                </TabsTrigger>
                <TabsTrigger value="library" className="gap-1.5 text-xs sm:text-sm">
                  <BookMarked className="w-3.5 h-3.5" /> Library
                </TabsTrigger>
                <TabsTrigger value="characters" className="gap-1.5 text-xs sm:text-sm">
                  <User className="w-3.5 h-3.5" /> Characters
                </TabsTrigger>
              </TabsList>

              {/* ===== Tab: My Stories ===== */}
              <TabsContent value="my-stories">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="my-stories"
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {(stories.length > 0 ? stories : MOCK_STORIES).length === 0 ? (
                      /* Empty State */
                      <Card className="glass border-0 shadow-sm">
                        <CardContent className="p-12 text-center">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-violet-100 dark:from-amber-500/10 dark:to-violet-500/10 flex items-center justify-center mb-6">
                              <BookOpen className="w-10 h-10 text-amber-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No Stories Yet</h3>
                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                              Your story collection is empty. Let&apos;s create your first magical adventure!
                            </p>
                            <Button
                              onClick={() => setActiveTab('create')}
                              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
                            >
                              <Sparkles className="w-4 h-4" />
                              Create First Story
                            </Button>
                          </motion.div>
                        </CardContent>
                      </Card>
                    ) : (
                      <motion.div
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        {(stories.length > 0 ? stories : MOCK_STORIES).map((story) => {
                          const genreIcon = GENRE_ICONS[story.genre] || BookOpen
                          const genreGrad = GENRE_GRADIENTS[story.genre] || 'from-amber-400 to-orange-500'
                          const GenreIcon = genreIcon
                          return (
                            <motion.div key={story.id} variants={staggerItem}>
                              <Card className="storybook-card overflow-hidden cursor-pointer group" onClick={() => openStory(story)}>
                                {/* Cover Image Placeholder */}
                                <div className={cn('h-36 bg-gradient-to-br flex items-center justify-center relative', genreGrad)}>
                                  <GenreIcon className="w-12 h-12 text-white/80" />
                                  {/* Decorative circles */}
                                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full border-2 border-white/20" />
                                  <div className="absolute bottom-3 left-3 w-6 h-6 rounded-full border-2 border-white/15" />
                                  {/* Genre badge */}
                                  <Badge className="absolute top-3 left-3 bg-black/20 text-white border-0 backdrop-blur-sm text-xs">
                                    {story.genre}
                                  </Badge>
                                  {/* Status badge */}
                                  <Badge
                                    className={cn(
                                      'absolute bottom-3 right-3 border-0 text-xs',
                                      'status' in story && story.status === 'draft'
                                        ? 'bg-yellow-500/80 text-white'
                                        : 'bg-emerald-500/80 text-white'
                                    )}
                                  >
                                    {'status' in story ? story.status : 'Published'}
                                  </Badge>
                                </div>

                                <CardContent className="p-4">
                                  <h3 className="font-semibold text-sm mb-1.5 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    {story.title}
                                  </h3>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{getAgeGroupLabel(story.ageGroup)}</span>
                                    <span className="opacity-40">•</span>
                                    <span>{story.readingTimeMinutes || ('readingTime' in story ? `${(story as Record<string, unknown>).readingTime} min` : '5 min')}</span>
                                  </div>
                                  <div className="flex items-center justify-between mt-3">
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(story.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openStory(story); }}>
                                        <Play className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                                        <Heart className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )
                        })}
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              {/* ===== Tab: Create New (Story Creation Form) ===== */}
              <TabsContent value="create">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="create"
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-6"
                  >
                    {isGenerating ? (
                      /* ===== Generation Progress ===== */
                      <Card className="glass border-0 shadow-sm overflow-hidden">
                        <CardContent className="p-6 sm:p-10">
                          <div className="text-center mb-8">
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                              className="inline-block mb-4"
                            >
                              <Sparkles className="w-10 h-10 text-amber-500" />
                            </motion.div>
                            <h2 className="text-2xl font-bold mb-2">Creating Your Story</h2>
                            <p className="text-muted-foreground">Our AI is weaving magic into &ldquo;{storyForm.title}&rdquo;</p>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-8">
                            <Progress value={generationProgress.progress} className="h-3 rounded-full" />
                            <p className="text-sm text-muted-foreground mt-2 text-center">
                              {generationProgress.progress}% complete
                            </p>
                          </div>

                          {/* Steps */}
                          <div className="space-y-4 max-w-md mx-auto">
                            {GENERATION_STEPS.map((step, idx) => {
                              const StepIcon = step.icon
                              const isActive = idx === currentGenStep
                              const isCompleted = idx < currentGenStep

                              return (
                                <motion.div
                                  key={step.label}
                                  className={cn(
                                    'flex items-center gap-3 p-3 rounded-xl transition-all duration-500',
                                    isActive && 'bg-amber-500/10 dark:bg-amber-500/5',
                                    isCompleted && 'opacity-60',
                                  )}
                                  animate={isActive ? { x: [0, 4, 0] } : {}}
                                  transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
                                >
                                  <div className={cn(
                                    'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
                                    isCompleted && 'bg-emerald-500/20 text-emerald-500',
                                    isActive && 'bg-amber-500/20 text-amber-500',
                                    !isCompleted && !isActive && 'bg-muted text-muted-foreground',
                                  )}>
                                    {isCompleted ? (
                                      <Check className="w-4 h-4" />
                                    ) : isActive ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <StepIcon className="w-4 h-4" />
                                    )}
                                  </div>
                                  <span className={cn(
                                    'text-sm font-medium',
                                    isActive && 'text-amber-700 dark:text-amber-400',
                                    isCompleted && 'text-emerald-600 dark:text-emerald-400',
                                  )}>
                                    {step.label}
                                  </span>
                                </motion.div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      /* ===== Story Creation Form ===== */
                      <>
                        {/* Section 1: Story Basics */}
                        <Card className="glass border-0 shadow-sm">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <div className="p-1.5 rounded-lg bg-amber-500/10">
                                <BookOpen className="w-4 h-4 text-amber-500" />
                              </div>
                              Story Basics
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-5">
                            {/* Title */}
                            <div>
                              <label className="text-sm font-medium mb-2 block">Story Title</label>
                              <div className="relative">
                                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                  placeholder="Enter a magical title for your story..."
                                  value={storyForm.title}
                                  onChange={(e) => updateStoryForm({ title: e.target.value })}
                                  className="pl-10 h-11 bg-background/50 border-amber-200/40 dark:border-amber-500/15 focus:border-amber-400"
                                />
                              </div>
                            </div>

                            {/* Genre Grid */}
                            <div>
                              <label className="text-sm font-medium mb-3 block">Choose a Genre</label>
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                {STORY_GENRES.map((genre) => {
                                  const GenreIcon = GENRE_ICONS[genre.id] || BookOpen
                                  const isSelected = storyForm.genre === genre.id
                                  return (
                                    <motion.button
                                      key={genre.id}
                                      type="button"
                                      onClick={() => updateStoryForm({ genre: genre.id as StoryGenre })}
                                      className={cn(
                                        'relative p-3 rounded-xl border-2 transition-all duration-200 text-left group',
                                        isSelected
                                          ? 'border-amber-400 dark:border-amber-500/60 bg-amber-500/10 dark:bg-amber-500/5 shadow-md shadow-amber-500/10'
                                          : 'border-border hover:border-amber-300/50 dark:hover:border-amber-500/30 bg-background/50',
                                      )}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">{genre.icon}</span>
                                        <span className={cn(
                                          'text-xs font-medium',
                                          isSelected ? 'text-amber-700 dark:text-amber-400' : 'text-foreground',
                                        )}>
                                          {genre.label}
                                        </span>
                                      </div>
                                      {isSelected && (
                                        <motion.div
                                          className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center"
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ type: 'spring', stiffness: 400 }}
                                        >
                                          <Check className="w-2.5 h-2.5 text-white" />
                                        </motion.div>
                                      )}
                                    </motion.button>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Age Group + Language Row */}
                            <div className="grid sm:grid-cols-2 gap-4">
                              {/* Age Group */}
                              <div>
                                <label className="text-sm font-medium mb-2 block">Age Group</label>
                                <div className="flex flex-wrap gap-2">
                                  {AGE_GROUPS.map((ag) => {
                                    const isSelected = storyForm.ageGroup === ag.id
                                    return (
                                      <motion.button
                                        key={ag.id}
                                        type="button"
                                        onClick={() => updateStoryForm({ ageGroup: ag.id as AgeGroup })}
                                        className={cn(
                                          'px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-all',
                                          isSelected
                                            ? 'border-violet-400 dark:border-violet-500/60 bg-violet-500/10 text-violet-700 dark:text-violet-400'
                                            : 'border-border hover:border-violet-300/50 dark:hover:border-violet-500/30 bg-background/50 text-foreground',
                                        )}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                      >
                                        {ag.icon} {ag.range}
                                      </motion.button>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Language */}
                              <div>
                                <label className="text-sm font-medium mb-2 block">Language</label>
                                <Select
                                  value={storyForm.language}
                                  onValueChange={(val) => updateStoryForm({ language: val as StoryLanguage })}
                                >
                                  <SelectTrigger className="w-full h-10 bg-background/50 border-amber-200/40 dark:border-amber-500/15">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {LANGUAGES.map((lang) => (
                                      <SelectItem key={lang.id} value={lang.id}>
                                        {lang.flag} {lang.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Section 2: Story Details */}
                        <Card className="glass border-0 shadow-sm">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <div className="p-1.5 rounded-lg bg-violet-500/10">
                                <Feather className="w-4 h-4 text-violet-500" />
                              </div>
                              Story Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-5">
                            {/* Moral/Lesson */}
                            <div>
                              <label className="text-sm font-medium mb-2 block">Moral / Lesson</label>
                              <Textarea
                                placeholder="What lesson should the story teach? e.g., 'Kindness is the greatest magic of all'"
                                value={storyForm.moral}
                                onChange={(e) => updateStoryForm({ moral: e.target.value })}
                                className="min-h-[80px] bg-background/50 border-amber-200/40 dark:border-amber-500/15 focus:border-violet-400 resize-none"
                              />
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {MORAL_CHIPS.map((chip) => (
                                  <button
                                    key={chip}
                                    type="button"
                                    onClick={() => updateStoryForm({ moral: storyForm.moral ? `${storyForm.moral}, ${chip}` : chip })}
                                    className="px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-700 dark:text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition-colors"
                                  >
                                    {chip}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Educational Topic */}
                            <div>
                              <label className="text-sm font-medium mb-2 block">Educational Topic <span className="text-muted-foreground font-normal">(optional)</span></label>
                              <Input
                                placeholder="e.g., Solar system, Ocean life, Numbers..."
                                className="bg-background/50 border-amber-200/40 dark:border-amber-500/15 focus:border-violet-400"
                              />
                            </div>

                            {/* Chapters Slider */}
                            <div>
                              <label className="text-sm font-medium mb-3 block">
                                Number of Chapters: <span className="text-amber-600 dark:text-amber-400 font-bold">{chapterCount}</span>
                              </label>
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-muted-foreground">1</span>
                                <Slider
                                  value={[chapterCount]}
                                  onValueChange={([val]) => setChapterCount(val)}
                                  min={1}
                                  max={10}
                                  step={1}
                                  className="flex-1"
                                />
                                <span className="text-xs text-muted-foreground">10</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Section 3: Characters */}
                        <Card className="glass border-0 shadow-sm">
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2 text-lg">
                                <div className="p-1.5 rounded-lg bg-emerald-500/10">
                                  <User className="w-4 h-4 text-emerald-500" />
                                </div>
                                Characters
                              </CardTitle>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addCharacter()}
                                className="border-emerald-300/50 dark:border-emerald-500/30 hover:bg-emerald-500/10"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Character
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Character Templates */}
                            {characters.length === 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-3">Quick start with a template:</p>
                                <div className="flex flex-wrap gap-2">
                                  {CHARACTER_TEMPLATES.map((template) => (
                                    <motion.button
                                      key={template.name}
                                      type="button"
                                      onClick={() => addCharacter(template)}
                                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-200/50 dark:border-emerald-500/20 bg-background/50 hover:bg-emerald-500/10 transition-colors text-xs font-medium"
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      {template.type === 'Child' && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                                      {template.type === 'Animal' && <Cat className="w-3.5 h-3.5 text-emerald-500" />}
                                      {template.type === 'Magical Creature' && <Sparkles className="w-3.5 h-3.5 text-violet-500" />}
                                      {template.name}
                                    </motion.button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Character Cards */}
                            <AnimatePresence>
                              {characters.map((char, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, y: 10, height: 0 }}
                                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                                  exit={{ opacity: 0, y: -10, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="p-4 rounded-xl border border-emerald-200/30 dark:border-emerald-500/15 bg-background/50 space-y-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Character {idx + 1}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeCharacter(idx)}
                                      className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  <div className="grid sm:grid-cols-2 gap-3">
                                    <Input
                                      placeholder="Character name"
                                      value={char.name}
                                      onChange={(e) => updateCharacter(idx, { name: e.target.value })}
                                      className="bg-background/50 h-9 text-sm"
                                    />
                                    <Select
                                      value={char.description ? (CHARACTER_TEMPLATES.find(t => t.name === char.name)?.type || 'Child') : 'Child'}
                                      onValueChange={(val) => {
                                        const typeMap: Record<string, string> = {
                                          Child: 'A brave young character',
                                          Adult: 'A wise grown-up character',
                                          Animal: 'A lovable animal character',
                                          'Magical Creature': 'A magical and enchanting creature',
                                        }
                                        updateCharacter(idx, { description: typeMap[val] || '' })
                                      }}
                                    >
                                      <SelectTrigger className="h-9 text-sm bg-background/50">
                                        <SelectValue placeholder="Type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Child">Child</SelectItem>
                                        <SelectItem value="Adult">Adult</SelectItem>
                                        <SelectItem value="Animal">Animal</SelectItem>
                                        <SelectItem value="Magical Creature">Magical Creature</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Personality chips */}
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1.5">Personality traits:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {PERSONALITY_OPTIONS.map((trait) => {
                                        const isSelected = char.traits.includes(trait)
                                        return (
                                          <button
                                            key={trait}
                                            type="button"
                                            onClick={() => togglePersonality(idx, trait)}
                                            className={cn(
                                              'px-2 py-0.5 rounded-full text-xs font-medium transition-all',
                                              isSelected
                                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/30'
                                                : 'bg-muted text-muted-foreground hover:bg-emerald-500/10',
                                            )}
                                          >
                                            {trait}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>

                            {characters.length === 0 && (
                              <div className="text-center py-6 text-muted-foreground">
                                <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                <p className="text-sm">No characters added yet</p>
                                <p className="text-xs">Add characters or use a template above</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Section 4: Generation Options */}
                        <Card className="glass border-0 shadow-sm">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <div className="p-1.5 rounded-lg bg-rose-500/10">
                                <Wand2 className="w-4 h-4 text-rose-500" />
                              </div>
                              Generation Options
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-5">
                            {/* Illustrations Toggle */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-amber-200/20 dark:border-amber-500/10">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/10">
                                  <Palette className="w-4 h-4 text-amber-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Include Illustrations</p>
                                  <p className="text-xs text-muted-foreground">AI-generated artwork for each scene</p>
                                </div>
                              </div>
                              <Switch
                                checked={storyForm.includeIllustrations}
                                onCheckedChange={(checked) => updateStoryForm({ includeIllustrations: checked })}
                              />
                            </div>

                            {/* Narration Toggle */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-amber-200/20 dark:border-amber-500/10">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-violet-500/10">
                                  <Volume2 className="w-4 h-4 text-violet-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Include Audio Narration</p>
                                  <p className="text-xs text-muted-foreground">Warm AI voice reads the story aloud</p>
                                </div>
                              </div>
                              <Switch
                                checked={storyForm.includeNarration}
                                onCheckedChange={(checked) => updateStoryForm({ includeNarration: checked })}
                              />
                            </div>

                            {/* Narration Voice (conditional) */}
                            <AnimatePresence>
                              {storyForm.includeNarration && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <label className="text-sm font-medium mb-2 block">Narration Voice</label>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {NARRATION_VOICES.map((voice) => (
                                      <motion.button
                                        key={voice.id}
                                        type="button"
                                        onClick={() => updateStoryForm({ narrationVoice: voice.id as StoryCharacter & { narrationVoice?: string } })}
                                        className={cn(
                                          'p-2.5 rounded-xl border-2 text-left transition-all',
                                          storyForm.narrationVoice === voice.id
                                            ? 'border-violet-400 dark:border-violet-500/60 bg-violet-500/10'
                                            : 'border-border hover:border-violet-300/50 dark:hover:border-violet-500/30 bg-background/50',
                                        )}
                                        whileHover={{ scale: 1.02 }}
                                      >
                                        <p className="text-xs font-medium">{voice.label}</p>
                                        <p className="text-[10px] text-muted-foreground line-clamp-1">{voice.tone}</p>
                                      </motion.button>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Story Length */}
                            <div>
                              <label className="text-sm font-medium mb-2 block">Story Length</label>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { id: 'short' as const, label: 'Short', desc: '~3 min', icon: Sun },
                                  { id: 'medium' as const, label: 'Medium', desc: '~8 min', icon: Flower2 },
                                  { id: 'long' as const, label: 'Long', desc: '~15 min', icon: TreePine },
                                ].map((len) => {
                                  const LenIcon = len.icon
                                  const isSelected = storyLength === len.id
                                  return (
                                    <motion.button
                                      key={len.id}
                                      type="button"
                                      onClick={() => setStoryLength(len.id)}
                                      className={cn(
                                        'p-3 rounded-xl border-2 text-center transition-all',
                                        isSelected
                                          ? 'border-amber-400 dark:border-amber-500/60 bg-amber-500/10 dark:bg-amber-500/5'
                                          : 'border-border hover:border-amber-300/50 dark:hover:border-amber-500/30 bg-background/50',
                                      )}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <LenIcon className={cn('w-5 h-5 mx-auto mb-1', isSelected ? 'text-amber-500' : 'text-muted-foreground')} />
                                      <p className="text-xs font-medium">{len.label}</p>
                                      <p className="text-[10px] text-muted-foreground">{len.desc}</p>
                                    </motion.button>
                                  )
                                })}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* ===== Generate Button ===== */}
                        <motion.div
                          className="sticky bottom-4 z-10"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Card className="glass border-0 shadow-lg overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="flex-1 text-center sm:text-left">
                                  <p className="text-sm font-medium">
                                    {!storyForm.title && !storyForm.genre && !storyForm.ageGroup
                                      ? 'Fill in the form to create your story'
                                      : storyForm.title
                                        ? `"${storyForm.title}" is ready to be created!`
                                        : 'Almost ready! Add a title to continue'}
                                  </p>
                                  <div className="flex items-center gap-2 justify-center sm:justify-start mt-1">
                                    <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                                      <Zap className="w-3 h-3 mr-1" />
                                      {creditsCost} credits
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      You have {credits} credits remaining
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  onClick={handleGenerateStory}
                                  disabled={!storyForm.title || !storyForm.genre || !storyForm.ageGroup}
                                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all text-base px-8 h-12 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Sparkles className="w-5 h-5" />
                                  Generate Story
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              {/* ===== Tab: Library ===== */}
              <TabsContent value="library">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="library"
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-4"
                  >
                    {/* Filter Bar */}
                    <Card className="glass border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="Search stories..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-9 bg-background/50"
                            />
                          </div>
                          <Select>
                            <SelectTrigger className="w-full sm:w-[140px] bg-background/50">
                              <SelectValue placeholder="Genre" />
                            </SelectTrigger>
                            <SelectContent>
                              {STORY_GENRES.map((g) => (
                                <SelectItem key={g.id} value={g.id}>{g.icon} {g.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select>
                            <SelectTrigger className="w-full sm:w-[140px] bg-background/50">
                              <SelectValue placeholder="Age Group" />
                            </SelectTrigger>
                            <SelectContent>
                              {AGE_GROUPS.map((ag) => (
                                <SelectItem key={ag.id} value={ag.id}>{ag.icon} {ag.range}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid sm:grid-cols-[200px_1fr] gap-4">
                      {/* Folder Sidebar */}
                      <Card className="glass border-0 shadow-sm hidden sm:block">
                        <CardContent className="p-3">
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Folders</p>
                          <div className="space-y-1">
                            {folders.map((folder) => (
                              <button
                                key={folder}
                                onClick={() => setSelectedFolder(folder)}
                                className={cn(
                                  'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left',
                                  selectedFolder === folder
                                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium'
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                                )}
                              >
                                <FolderOpen className="w-3.5 h-3.5" />
                                {folder}
                              </button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Stories Grid */}
                      <motion.div
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        {filteredLibrary.map((story) => {
                          const GenreIcon = GENRE_ICONS[story.genre] || BookOpen
                          const genreGrad = GENRE_GRADIENTS[story.genre] || 'from-amber-400 to-orange-500'
                          return (
                            <motion.div key={story.id} variants={staggerItem}>
                              <Card className="storybook-card overflow-hidden group">
                                <div className={cn('h-24 bg-gradient-to-br flex items-center justify-center relative', genreGrad)}>
                                  <GenreIcon className="w-8 h-8 text-white/70" />
                                  <button
                                    onClick={() => toggleFavorite(story.id)}
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-colors"
                                  >
                                    <Heart className={cn('w-3.5 h-3.5', story.isFavorite ? 'text-rose-400 fill-rose-400' : 'text-white/70')} />
                                  </button>
                                </div>
                                <CardContent className="p-3">
                                  <h4 className="text-sm font-medium line-clamp-1">{story.title}</h4>
                                  <div className="flex items-center gap-1.5 mt-1.5">
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">{story.genre}</Badge>
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">{story.ageGroup}</Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )
                        })}
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              {/* ===== Tab: Characters ===== */}
              <TabsContent value="characters">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="characters"
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">Character Library</h2>
                        <p className="text-sm text-muted-foreground">Create and manage reusable characters</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25">
                            <Plus className="w-4 h-4" /> Create Character
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Create New Character</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <label className="text-sm font-medium mb-1.5 block">Name</label>
                              <Input placeholder="Enter character name..." className="bg-background/50" />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1.5 block">Type</label>
                              <Select>
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="child">Child</SelectItem>
                                  <SelectItem value="adult">Adult</SelectItem>
                                  <SelectItem value="animal">Animal</SelectItem>
                                  <SelectItem value="magical">Magical Creature</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1.5 block">Description</label>
                              <Textarea placeholder="Describe this character..." className="bg-background/50 min-h-[80px] resize-none" />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1.5 block">Personality Traits</label>
                              <div className="flex flex-wrap gap-1.5">
                                {PERSONALITY_OPTIONS.map((trait) => (
                                  <button
                                    key={trait}
                                    type="button"
                                    className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors"
                                  >
                                    {trait}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Character Cards Grid */}
                    <motion.div
                      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      {/* Pre-built characters */}
                      {[
                        { name: 'Luna the Brave', type: 'Child', traits: ['Brave', 'Curious', 'Kind'], gradient: 'from-amber-400 to-orange-500', icon: Crown },
                        { name: 'Professor Hoot', type: 'Animal', traits: ['Wise', 'Patient', 'Gentle'], gradient: 'from-emerald-400 to-teal-500', icon: Cat },
                        { name: 'Ember the Dragon', type: 'Magical Creature', traits: ['Friendly', 'Playful', 'Loyal'], gradient: 'from-violet-400 to-purple-500', icon: Sparkles },
                        { name: 'Captain Squawks', type: 'Animal', traits: ['Funny', 'Adventurous', 'Loud'], gradient: 'from-rose-400 to-pink-500', icon: Fish },
                        { name: 'Mystic Mira', type: 'Magical Creature', traits: ['Creative', 'Mysterious', 'Wise'], gradient: 'from-cyan-400 to-blue-500', icon: Ghost },
                        { name: 'Tiny the Explorer', type: 'Child', traits: ['Adventurous', 'Clever', 'Brave'], gradient: 'from-yellow-400 to-amber-500', icon: Rabbit },
                      ].map((char) => {
                        const CharIcon = char.icon
                        return (
                          <motion.div key={char.name} variants={staggerItem}>
                            <Card className="storybook-card overflow-hidden group cursor-pointer">
                              <div className={cn('h-28 bg-gradient-to-br flex items-center justify-center relative', char.gradient)}>
                                <CharIcon className="w-10 h-10 text-white/80" />
                                <Badge className="absolute top-2 right-2 bg-black/20 text-white border-0 backdrop-blur-sm text-[10px]">
                                  {char.type}
                                </Badge>
                              </div>
                              <CardContent className="p-4">
                                <h4 className="font-semibold text-sm mb-2">{char.name}</h4>
                                <div className="flex flex-wrap gap-1">
                                  {char.traits.map((trait) => (
                                    <Badge key={trait} variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-amber-500/5">
                                      {trait}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </div>

          {/* ===== Right Sidebar: Recent Activity ===== */}
          <aside className="hidden lg:block space-y-4">
            {/* Recently Viewed */}
            <Card className="glass border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Recently Viewed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { title: 'The Enchanted Forest', time: '2h ago', progress: 75 },
                  { title: 'Captain Whiskers', time: '5h ago', progress: 40 },
                  { title: 'Luna\'s Dream', time: '1d ago', progress: 100 },
                ].map((item) => (
                  <div key={item.title} className="p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">{item.time}</span>
                    </div>
                    <Progress value={item.progress} className="h-1" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Continue Reading */}
            <Card className="glass border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-violet-500" />
                  Continue Reading
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: 'Space Pals: Mars', page: 5, totalPages: 12, genre: 'scifi' as StoryGenre },
                  { title: 'Dragon\'s Rainbow', page: 8, totalPages: 10, genre: 'fantasy' as StoryGenre },
                ].map((item) => {
                  const progress = Math.round((item.page / item.totalPages) * 100)
                  const GenreIcon = GENRE_ICONS[item.genre] || BookOpen
                  return (
                    <div
                      key={item.title}
                      className="p-3 rounded-xl border border-amber-200/20 dark:border-amber-500/10 bg-background/50 cursor-pointer hover:border-amber-300/40 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shrink-0">
                          <GenreIcon className="w-4 h-4 text-white/80" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Page {item.page} of {item.totalPages}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                          <Play className="w-3 h-3" />
                        </Button>
                      </div>
                      <Progress value={progress} className="h-1 mt-2" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Story Series */}
            <Card className="glass border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Story Series
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { name: 'Luna Adventures', count: 5, color: 'from-amber-400 to-orange-500' },
                  { name: 'Dragon Tales', count: 3, color: 'from-violet-400 to-purple-500' },
                  { name: 'Bedtime Wonders', count: 8, color: 'from-emerald-400 to-teal-500' },
                ].map((series) => (
                  <div
                    key={series.name}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0', series.color)}>
                      <BookMarked className="w-4 h-4 text-white/80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {series.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{series.count} stories</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Create */}
            <Card className="glass border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="inline-block mb-3"
                  >
                    <Sparkles className="w-8 h-8 text-amber-500" />
                  </motion.div>
                  <p className="text-sm font-medium mb-1">Quick Story</p>
                  <p className="text-xs text-muted-foreground mb-3">Generate a story with one click</p>
                  <Button
                    onClick={() => setActiveTab('create')}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 text-xs"
                    size="sm"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Create Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
