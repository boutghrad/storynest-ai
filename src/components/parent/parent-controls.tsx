'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  BookOpen,
  Clock,
  Moon,
  GraduationCap,
  ChevronRight,
  Plus,
  Trash2,
  Play,
  Heart,
  Star,
  Eye,
  Timer,
  Baby,
  CheckCircle,
  Sparkles,
  Settings,
  Music,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

interface ReadingHistoryItem {
  id: string;
  title: string;
  genre: string;
  ageGroup: string;
  readAt: string;
  duration: string; // e.g. "12 min"
  completed: boolean;
  coverGradient: string;
  emoji: string;
}

interface PlaylistItem {
  id: string;
  title: string;
  duration: string;
  emoji: string;
}

interface Playlist {
  id: string;
  name: string;
  emoji: string;
  storyCount: number;
  totalDuration: string;
  stories: PlaylistItem[];
}

// =============================================================================
// Mock Data
// =============================================================================

const readingHistory: ReadingHistoryItem[] = [
  { id: 'h1', title: 'Luna and the Starlight Forest', genre: 'Fantasy', ageGroup: '6-8', readAt: 'Today, 7:30 PM', duration: '15 min', completed: true, coverGradient: 'from-violet-400 to-purple-500', emoji: '🧙' },
  { id: 'h2', title: 'The Brave Little Robot', genre: 'Sci-Fi', ageGroup: '6-8', readAt: 'Today, 6:45 PM', duration: '10 min', completed: false, coverGradient: 'from-cyan-400 to-blue-500', emoji: '🛸' },
  { id: 'h3', title: 'Dragon Academy', genre: 'Fantasy', ageGroup: '8-10', readAt: 'Yesterday, 8:00 PM', duration: '18 min', completed: true, coverGradient: 'from-amber-400 to-orange-500', emoji: '🐉' },
  { id: 'h4', title: 'Ocean Adventures', genre: 'Adventure', ageGroup: '6-8', readAt: 'Yesterday, 7:15 PM', duration: '12 min', completed: true, coverGradient: 'from-emerald-400 to-teal-500', emoji: '🗺️' },
  { id: 'h5', title: 'The Magic Garden', genre: 'Fairy Tale', ageGroup: '4-6', readAt: '2 days ago', duration: '8 min', completed: true, coverGradient: 'from-pink-400 to-rose-500', emoji: '🏰' },
  { id: 'h6', title: 'Space Explorers', genre: 'Sci-Fi', ageGroup: '8-10', readAt: '3 days ago', duration: '20 min', completed: true, coverGradient: 'from-indigo-400 to-violet-500', emoji: '🚀' },
  { id: 'h7', title: 'Whispering Woods', genre: 'Bedtime', ageGroup: '4-6', readAt: '4 days ago', duration: '6 min', completed: true, coverGradient: 'from-slate-400 to-indigo-400', emoji: '🌙' },
];

const mockPlaylists: Playlist[] = [
  {
    id: 'p1',
    name: 'Bedtime Favorites',
    emoji: '🌙',
    storyCount: 5,
    totalDuration: '35 min',
    stories: [
      { id: 'ps1', title: 'Whispering Woods', duration: '6 min', emoji: '🌙' },
      { id: 'ps2', title: 'The Dream Catcher', duration: '8 min', emoji: '✨' },
      { id: 'ps3', title: 'Moonlight Lullaby', duration: '7 min', emoji: '🎵' },
      { id: 'ps4', title: 'Starlight Wishes', duration: '5 min', emoji: '⭐' },
      { id: 'ps5', title: 'Cloud Nine Stories', duration: '9 min', emoji: '☁️' },
    ],
  },
  {
    id: 'p2',
    name: 'Weekend Adventures',
    emoji: '🗺️',
    storyCount: 4,
    totalDuration: '50 min',
    stories: [
      { id: 'ps6', title: 'Luna and the Starlight Forest', duration: '15 min', emoji: '🧙' },
      { id: 'ps7', title: 'Dragon Academy', duration: '18 min', emoji: '🐉' },
      { id: 'ps8', title: 'Ocean Adventures', duration: '12 min', emoji: '🗺️' },
      { id: 'ps9', title: 'Space Explorers', duration: '5 min', emoji: '🚀' },
    ],
  },
];

const educationalTopics = [
  { id: 'science', label: 'Science', emoji: '🔬', enabled: true },
  { id: 'math', label: 'Math', emoji: '🔢', enabled: false },
  { id: 'nature', label: 'Nature', emoji: '🌿', enabled: true },
  { id: 'history', label: 'History', emoji: '📜', enabled: false },
  { id: 'geography', label: 'Geography', emoji: '🌍', enabled: true },
  { id: 'social', label: 'Social Skills', emoji: '🤝', enabled: true },
  { id: 'art', label: 'Art & Music', emoji: '🎨', enabled: false },
  { id: 'language', label: 'Language', emoji: '📝', enabled: true },
];

const ageGroups = [
  { id: '2-4', label: 'Toddlers', range: '2–4', emoji: '🧒' },
  { id: '4-6', label: 'Early Readers', range: '4–6', emoji: '📖' },
  { id: '6-8', label: 'Young Readers', range: '6–8', emoji: '🌟' },
  { id: '8-10', label: 'Growing Readers', range: '8–10', emoji: '🚀' },
  { id: '10-12', label: 'Pre-Teens', range: '10–12', emoji: '🎯' },
];

// =============================================================================
// Animation variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

// =============================================================================
// ParentControls Component
// =============================================================================

export default function ParentControls() {
  const [safeMode, setSafeMode] = useState(true);
  const [contentFilterLevel, setContentFilterLevel] = useState(2); // 0=low, 1=medium, 2=high
  const [dailyTimeLimit, setDailyTimeLimit] = useState([30]); // minutes
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('6-8');
  const [educationalMode, setEducationalMode] = useState(true);
  const [topics, setTopics] = useState(educationalTopics);
  const [playlists, setPlaylists] = useState(mockPlaylists);
  const [expandedPlaylist, setExpandedPlaylist] = useState<string | null>(null);

  const filterLabels = ['Low', 'Medium', 'High'];
  const filterColors = ['text-emerald-600', 'text-amber-600', 'text-red-600'];

  const toggleTopic = (topicId: string) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    if (expandedPlaylist === playlistId) setExpandedPlaylist(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-amber-50 to-violet-50">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-30 border-b border-rose-200/50 bg-rose-50/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-rose-900">Parent Controls</h1>
              <p className="text-xs text-rose-600">Keep your child safe & happy</p>
            </div>
          </div>
          <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-xs">
            🔒 Protected
          </Badge>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Tabs defaultValue="filters" className="space-y-6">
          <TabsList className="bg-rose-100/80">
            <TabsTrigger value="filters" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
              Content Filters
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
              Reading History
            </TabsTrigger>
            <TabsTrigger value="time" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
              Time & Age
            </TabsTrigger>
            <TabsTrigger value="playlists" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
              Playlists
            </TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
              Education
            </TabsTrigger>
          </TabsList>

          {/* ===== CONTENT FILTERS TAB ===== */}
          <TabsContent value="filters" className="space-y-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {/* Safe Mode */}
              <motion.div variants={itemVariants}>
                <Card className="border-rose-200/60">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                          <Shield className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900">Safe Mode</p>
                          <p className="text-sm text-stone-500">Filter out inappropriate content automatically</p>
                        </div>
                      </div>
                      <Switch
                        checked={safeMode}
                        onCheckedChange={setSafeMode}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </div>
                    {safeMode && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2"
                      >
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs text-emerald-700">
                          Safe mode is active. All content is filtered for child safety.
                        </span>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Content Filter Level */}
              <motion.div variants={itemVariants}>
                <Card className="border-rose-200/60">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                        <Eye className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900">Content Filter Level</p>
                        <p className="text-sm text-stone-500">Choose how strictly to filter content</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {filterLabels.map((label, index) => (
                        <button
                          key={label}
                          onClick={() => setContentFilterLevel(index)}
                          className={cn(
                            'flex-1 rounded-xl py-3 text-center text-sm font-medium transition-all',
                            contentFilterLevel === index
                              ? index === 0
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                                : index === 1
                                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                                  : 'bg-red-500 text-white shadow-md shadow-red-200'
                              : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 rounded-lg bg-stone-50 p-3">
                      <p className="text-xs text-stone-600">
                        {contentFilterLevel === 0 && '🟢 Low filter: Only blocks clearly inappropriate content. Suitable for older children with supervision.'}
                        {contentFilterLevel === 1 && '🟡 Medium filter: Blocks mild violence, scary themes, and suggestive content. Recommended for most ages.'}
                        {contentFilterLevel === 2 && '🔴 High filter: Only allows thoroughly reviewed, age-appropriate content. Best for younger children.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Additional Filter Toggles */}
              <motion.div variants={itemVariants}>
                <Card className="border-rose-200/60">
                  <CardContent className="p-4 space-y-4">
                    {[
                      { icon: Heart, label: 'Block scary stories', description: 'Remove stories with frightening themes', enabled: true, color: 'bg-rose-50 text-rose-600' },
                      { icon: Moon, label: 'Bedtime mode', description: 'Only calm, soothing stories after 7 PM', enabled: false, color: 'bg-violet-50 text-violet-600' },
                      { icon: Star, label: 'Positive endings only', description: 'Ensure all stories end on a happy note', enabled: true, color: 'bg-amber-50 text-amber-600' },
                    ].map((toggle) => (
                      <div key={toggle.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', toggle.color)}>
                            <toggle.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-stone-900">{toggle.label}</p>
                            <p className="text-xs text-stone-500">{toggle.description}</p>
                          </div>
                        </div>
                        <Switch
                          defaultChecked={toggle.enabled}
                          className="data-[state=checked]:bg-rose-500"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ===== READING HISTORY TAB ===== */}
          <TabsContent value="history" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">Reading History</h2>
              <span className="text-sm text-stone-500">{readingHistory.length} stories</span>
            </div>

            {/* Stats Row */}
            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="border-rose-200/60">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                    <BookOpen className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">This Week</p>
                    <p className="text-lg font-bold text-stone-900">7 stories</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-rose-200/60">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
                    <Clock className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Total Time</p>
                    <p className="text-lg font-bold text-stone-900">1h 29m</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-rose-200/60">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Completed</p>
                    <p className="text-lg font-bold text-stone-900">85%</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {readingHistory.map((item, index) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <Card className="border-stone-200/80 hover:shadow-sm transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        {/* Cover */}
                        <div
                          className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br',
                            item.coverGradient
                          )}
                        >
                          <span className="text-xl">{item.emoji}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-stone-900 truncate">
                              {item.title}
                            </p>
                            {item.completed ? (
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-stone-500">
                            <span>{item.genre}</span>
                            <span>&middot;</span>
                            <span>{item.duration}</span>
                            <span>&middot;</span>
                            <span>{item.readAt}</span>
                          </div>
                        </div>

                        {/* Play button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-8 w-8 rounded-full hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Play className="h-3.5 w-3.5 ml-0.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* ===== TIME & AGE TAB ===== */}
          <TabsContent value="time" className="space-y-6">
            {/* Daily Time Limit */}
            <Card className="border-rose-200/60">
              <CardHeader>
                <CardTitle className="text-base text-stone-900 flex items-center gap-2">
                  <Timer className="h-5 w-5 text-amber-500" />
                  Daily Reading Time Limit
                </CardTitle>
                <CardDescription>Set a maximum daily reading time for your child</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-center">
                  <span className="text-4xl font-bold text-amber-600">{dailyTimeLimit[0]}</span>
                  <span className="text-lg text-stone-500 ml-1">minutes</span>
                </div>
                <Slider
                  value={dailyTimeLimit}
                  onValueChange={setDailyTimeLimit}
                  min={5}
                  max={120}
                  step={5}
                  className="w-full"
                />
                <div className="mt-2 flex justify-between text-xs text-stone-400">
                  <span>5 min</span>
                  <span>30 min</span>
                  <span>60 min</span>
                  <span>90 min</span>
                  <span>120 min</span>
                </div>

                {/* Quick presets */}
                <div className="mt-4 flex gap-2">
                  {[
                    { label: '15 min', value: 15 },
                    { label: '30 min', value: 30 },
                    { label: '45 min', value: 45 },
                    { label: '60 min', value: 60 },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setDailyTimeLimit([preset.value])}
                      className={cn(
                        'flex-1 rounded-lg py-2 text-xs font-medium transition-all',
                        dailyTimeLimit[0] === preset.value
                          ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Age Group */}
            <Card className="border-rose-200/60">
              <CardHeader>
                <CardTitle className="text-base text-stone-900 flex items-center gap-2">
                  <Baby className="h-5 w-5 text-violet-500" />
                  Age Group Settings
                </CardTitle>
                <CardDescription>Select the appropriate age group for content filtering</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {ageGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedAgeGroup(group.id)}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-xl p-3 transition-all border-2',
                        selectedAgeGroup === group.id
                          ? 'border-violet-400 bg-violet-50 shadow-md shadow-violet-100'
                          : 'border-stone-200 bg-white hover:border-violet-200 hover:bg-violet-50/50'
                      )}
                    >
                      <span className="text-2xl">{group.emoji}</span>
                      <span className="text-xs font-semibold text-stone-900">{group.label}</span>
                      <span className="text-[10px] text-stone-500">{group.range} yrs</span>
                      {selectedAgeGroup === group.id && (
                        <motion.div
                          layoutId="ageCheck"
                          className="mt-0.5"
                        >
                          <CheckCircle className="h-4 w-4 text-violet-500" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card className="border-rose-200/60">
              <CardHeader>
                <CardTitle className="text-base text-stone-900 flex items-center gap-2">
                  <Moon className="h-5 w-5 text-rose-500" />
                  Reading Schedule
                </CardTitle>
                <CardDescription>Set allowed reading hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Weekdays', time: '6:00 AM – 8:00 PM', enabled: true },
                  { label: 'Weekends', time: '7:00 AM – 9:00 PM', enabled: true },
                  { label: 'Bedtime mode (auto)', time: 'Dim screen after 7 PM', enabled: false },
                ].map((schedule) => (
                  <div key={schedule.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{schedule.label}</p>
                      <p className="text-xs text-stone-500">{schedule.time}</p>
                    </div>
                    <Switch defaultChecked={schedule.enabled} className="data-[state=checked]:bg-rose-500" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== BEDTIME PLAYLISTS TAB ===== */}
          <TabsContent value="playlists" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">Bedtime Playlists</h2>
              <Button size="sm" className="gap-1.5 bg-violet-500 hover:bg-violet-600 text-white">
                <Plus className="h-4 w-4" /> New Playlist
              </Button>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {playlists.map((playlist) => (
                <motion.div key={playlist.id} variants={itemVariants}>
                  <Card className="border-stone-200/80 overflow-hidden">
                    {/* Playlist Header */}
                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        setExpandedPlaylist(
                          expandedPlaylist === playlist.id ? null : playlist.id
                        )
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-500">
                            <Music className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-stone-900">
                              {playlist.emoji} {playlist.name}
                            </p>
                            <p className="text-xs text-stone-500">
                              {playlist.storyCount} stories &middot; {playlist.totalDuration}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-violet-50 hover:text-violet-600"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePlaylist(playlist.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <motion.div
                              animate={{ rotate: expandedPlaylist === playlist.id ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-4 w-4 text-stone-400" />
                            </motion.div>
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    {/* Expanded Stories */}
                    <AnimatePresence>
                      {expandedPlaylist === playlist.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-stone-100 bg-stone-50/50 px-4 py-2">
                            {playlist.stories.map((story, i) => (
                              <div
                                key={story.id}
                                className="flex items-center gap-2 py-2"
                              >
                                <span className="text-xs text-stone-400 w-4 text-center">
                                  {i + 1}
                                </span>
                                <span className="text-sm">{story.emoji}</span>
                                <span className="flex-1 text-sm text-stone-700">
                                  {story.title}
                                </span>
                                <span className="text-xs text-stone-400">
                                  {story.duration}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}

              {playlists.length === 0 && (
                <Card className="border-stone-200/80">
                  <CardContent className="flex flex-col items-center justify-center p-12">
                    <Moon className="h-12 w-12 text-violet-300 mb-3" />
                    <p className="text-lg font-semibold text-stone-700">No Playlists Yet</p>
                    <p className="text-sm text-stone-500">Create a bedtime playlist to get started.</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* ===== EDUCATION TAB ===== */}
          <TabsContent value="education" className="space-y-6">
            {/* Educational Mode Toggle */}
            <Card className="border-rose-200/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                      <GraduationCap className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900">Educational Mode</p>
                      <p className="text-sm text-stone-500">
                        Add learning elements and quizzes to stories
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={educationalMode}
                    onCheckedChange={setEducationalMode}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
                {educationalMode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2"
                  >
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-emerald-700">
                      Educational mode adds comprehension questions, vocabulary highlights, and fun facts to stories.
                    </span>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Topic Selection */}
            <Card className="border-rose-200/60">
              <CardHeader>
                <CardTitle className="text-base text-stone-900 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-amber-500" />
                  Educational Topics
                </CardTitle>
                <CardDescription>
                  Choose which topics to include in educational stories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => toggleTopic(topic.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-xl p-3 text-left transition-all border-2',
                        topic.enabled
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      )}
                    >
                      <span className="text-lg">{topic.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            topic.enabled ? 'text-emerald-800' : 'text-stone-600'
                          )}
                        >
                          {topic.label}
                        </p>
                      </div>
                      {topic.enabled && <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Stats */}
            <Card className="border-rose-200/60">
              <CardHeader>
                <CardTitle className="text-base text-stone-900 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-violet-500" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Vocabulary', value: 72, color: 'bg-violet-500' },
                  { label: 'Comprehension', value: 85, color: 'bg-emerald-500' },
                  { label: 'Reading Level', value: 68, color: 'bg-amber-500' },
                  { label: 'Story Recall', value: 90, color: 'bg-rose-500' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-stone-700 font-medium">{stat.label}</span>
                      <span className="font-bold text-stone-900">{stat.value}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-stone-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={cn('h-full rounded-full', stat.color)}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
