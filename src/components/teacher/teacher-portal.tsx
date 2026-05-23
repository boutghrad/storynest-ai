'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Users,
  BookOpen,
  Plus,
  Copy,
  RefreshCw,
  BarChart3,
  Clock,
  Star,
  ChevronRight,
  X,
  Hash,
  CheckCircle,
  Sparkles,
  School,
  Heart,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// =============================================================================
// Types
// =============================================================================

interface Classroom {
  id: string;
  name: string;
  grade: string;
  subject: string;
  studentCount: number;
  storyCount: number;
  accessCode: string;
  createdAt: string;
}

interface Student {
  id: string;
  name: string;
  avatar: string;
  storiesRead: number;
  readingTime: number; // minutes
  comprehension: number; // percentage
  currentBook: string | null;
  lastActive: string;
}

interface SharedStory {
  id: string;
  title: string;
  genre: string;
  ageGroup: string;
  readCount: number;
  avgRating: number;
  sharedBy: string;
  sharedAt: string;
  coverGradient: string;
}

// =============================================================================
// Mock Data
// =============================================================================

const mockClassrooms: Classroom[] = [
  { id: 'cl1', name: 'Room 204 - Reading Stars', grade: '3rd Grade', subject: 'Language Arts', studentCount: 24, storyCount: 48, accessCode: 'READ204', createdAt: 'Sep 2024' },
  { id: 'cl2', name: 'Room 108 - Story Explorers', grade: '1st Grade', subject: 'Reading', studentCount: 20, storyCount: 35, accessCode: 'EXPL108', createdAt: 'Sep 2024' },
  { id: 'cl3', name: 'Room 312 - Creative Writers', grade: '5th Grade', subject: 'English', studentCount: 28, storyCount: 62, accessCode: 'WRIT312', createdAt: 'Oct 2024' },
];

const mockStudents: Student[] = [
  { id: 'st1', name: 'Emma Thompson', avatar: 'ET', storiesRead: 12, readingTime: 245, comprehension: 92, currentBook: 'Luna and the Starlight Forest', lastActive: '2 min ago' },
  { id: 'st2', name: 'Liam Chen', avatar: 'LC', storiesRead: 8, readingTime: 180, comprehension: 85, currentBook: 'The Brave Little Robot', lastActive: '15 min ago' },
  { id: 'st3', name: 'Sofia Rodriguez', avatar: 'SR', storiesRead: 15, readingTime: 320, comprehension: 95, currentBook: null, lastActive: '1 hr ago' },
  { id: 'st4', name: 'Noah Williams', avatar: 'NW', storiesRead: 6, readingTime: 120, comprehension: 78, currentBook: 'Dragon Academy', lastActive: '3 hr ago' },
  { id: 'st5', name: 'Ava Patel', avatar: 'AP', storiesRead: 10, readingTime: 200, comprehension: 88, currentBook: 'Ocean Adventures', lastActive: '30 min ago' },
  { id: 'st6', name: 'Oliver Kim', avatar: 'OK', storiesRead: 14, readingTime: 280, comprehension: 91, currentBook: 'Space Explorers', lastActive: '5 min ago' },
  { id: 'st7', name: 'Mia Johnson', avatar: 'MJ', storiesRead: 9, readingTime: 165, comprehension: 82, currentBook: null, lastActive: '2 hr ago' },
  { id: 'st8', name: 'Ethan Brown', avatar: 'EB', storiesRead: 11, readingTime: 225, comprehension: 87, currentBook: 'The Magic Garden', lastActive: '45 min ago' },
];

const mockSharedStories: SharedStory[] = [
  { id: 'ss1', title: 'Luna and the Starlight Forest', genre: 'Fantasy', ageGroup: '6-8', readCount: 18, avgRating: 4.8, sharedBy: 'Ms. Adams', sharedAt: '2 days ago', coverGradient: 'from-violet-400 to-purple-500' },
  { id: 'ss2', title: 'The Brave Little Robot', genre: 'Sci-Fi', ageGroup: '6-8', readCount: 14, avgRating: 4.5, sharedBy: 'Ms. Adams', sharedAt: '3 days ago', coverGradient: 'from-cyan-400 to-blue-500' },
  { id: 'ss3', title: 'Dragon Academy', genre: 'Fantasy', ageGroup: '8-10', readCount: 22, avgRating: 4.9, sharedBy: 'Mr. Chen', sharedAt: '1 day ago', coverGradient: 'from-amber-400 to-orange-500' },
  { id: 'ss4', title: 'Ocean Adventures', genre: 'Adventure', ageGroup: '6-8', readCount: 10, avgRating: 4.3, sharedBy: 'Ms. Adams', sharedAt: '5 days ago', coverGradient: 'from-emerald-400 to-teal-500' },
  { id: 'ss5', title: 'The Magic Garden', genre: 'Fairy Tale', ageGroup: '4-6', readCount: 16, avgRating: 4.7, sharedBy: 'Ms. Rivera', sharedAt: '4 days ago', coverGradient: 'from-pink-400 to-rose-500' },
  { id: 'ss6', title: 'Space Explorers', genre: 'Sci-Fi', ageGroup: '8-10', readCount: 20, avgRating: 4.6, sharedBy: 'Mr. Chen', sharedAt: '1 day ago', coverGradient: 'from-indigo-400 to-violet-500' },
];

const genreEmojis: Record<string, string> = {
  Fantasy: '🧙',
  'Sci-Fi': '🛸',
  Adventure: '🗺️',
  'Fairy Tale': '🏰',
  Bedtime: '🌙',
  Educational: '🔬',
};

// =============================================================================
// Animation variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

// =============================================================================
// TeacherPortal Component
// =============================================================================

export default function TeacherPortal() {
  const [classrooms, setClassrooms] = useState(mockClassrooms);
  const [selectedClassroom, setSelectedClassroom] = useState<string>(classrooms[0]?.id || '');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClassroom, setNewClassroom] = useState({ name: '', grade: '', subject: '' });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeClassroom = classrooms.find((c) => c.id === selectedClassroom);

  const handleCreateClassroom = () => {
    if (!newClassroom.name || !newClassroom.grade || !newClassroom.subject) return;

    const classroom: Classroom = {
      id: `cl${Date.now()}`,
      name: newClassroom.name,
      grade: newClassroom.grade,
      subject: newClassroom.subject,
      studentCount: 0,
      storyCount: 0,
      accessCode: newClassroom.name.slice(0, 4).toUpperCase() + Math.floor(Math.random() * 1000),
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };

    setClassrooms((prev) => [...prev, classroom]);
    setSelectedClassroom(classroom.id);
    setNewClassroom({ name: '', grade: '', subject: '' });
    setCreateDialogOpen(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRegenerateCode = (classroomId: string) => {
    setClassrooms((prev) =>
      prev.map((c) =>
        c.id === classroomId
          ? { ...c, accessCode: c.name.slice(0, 4).toUpperCase() + Math.floor(Math.random() * 1000) }
          : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-amber-50 to-violet-50">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-30 border-b border-emerald-200/50 bg-emerald-50/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-emerald-900">Teacher Portal</h1>
              <p className="text-xs text-emerald-600">Manage your classrooms and students</p>
            </div>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="h-4 w-4" /> New Classroom
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Classroom</DialogTitle>
                <DialogDescription>Set up a new classroom for your students.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <label className="mb-1.5 text-sm font-medium text-stone-700">Classroom Name</label>
                  <Input
                    placeholder="e.g., Room 205 - Story Adventurers"
                    value={newClassroom.name}
                    onChange={(e) => setNewClassroom((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1.5 text-sm font-medium text-stone-700">Grade Level</label>
                  <Input
                    placeholder="e.g., 3rd Grade"
                    value={newClassroom.grade}
                    onChange={(e) => setNewClassroom((p) => ({ ...p, grade: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1.5 text-sm font-medium text-stone-700">Subject</label>
                  <Input
                    placeholder="e.g., Language Arts"
                    value={newClassroom.subject}
                    onChange={(e) => setNewClassroom((p) => ({ ...p, subject: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateClassroom}
                  disabled={!newClassroom.name || !newClassroom.grade || !newClassroom.subject}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Create Classroom
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Tabs defaultValue="classrooms" className="space-y-6">
          <TabsList className="bg-emerald-100/80">
            <TabsTrigger value="classrooms" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Classrooms
            </TabsTrigger>
            <TabsTrigger value="stories" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Shared Stories
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Student Progress
            </TabsTrigger>
          </TabsList>

          {/* ===== CLASSROOMS TAB ===== */}
          <TabsContent value="classrooms" className="space-y-6">
            {/* Classroom Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {classrooms.map((classroom) => (
                <button
                  key={classroom.id}
                  onClick={() => setSelectedClassroom(classroom.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-3 text-left transition-all shrink-0',
                    selectedClassroom === classroom.id
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                      : 'bg-white text-stone-700 border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50'
                  )}
                >
                  <School className={cn('h-5 w-5', selectedClassroom === classroom.id ? 'text-emerald-200' : 'text-emerald-500')} />
                  <div>
                    <p className="text-sm font-semibold whitespace-nowrap">{classroom.name}</p>
                    <p className={cn('text-xs', selectedClassroom === classroom.id ? 'text-emerald-200' : 'text-stone-400')}>
                      {classroom.grade} &middot; {classroom.studentCount} students
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Classroom Details */}
            {activeClassroom && (
              <motion.div
                key={activeClassroom.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-6 lg:grid-cols-3"
              >
                {/* Info Card */}
                <Card className="border-emerald-200/60 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-emerald-900 flex items-center gap-2">
                      <School className="h-5 w-5 text-emerald-600" />
                      {activeClassroom.name}
                    </CardTitle>
                    <CardDescription>
                      {activeClassroom.grade} &middot; {activeClassroom.subject} &middot; Created {activeClassroom.createdAt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-xl bg-emerald-50 p-4 text-center">
                        <Users className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
                        <p className="text-2xl font-bold text-emerald-900">{activeClassroom.studentCount}</p>
                        <p className="text-xs text-emerald-600">Students</p>
                      </div>
                      <div className="rounded-xl bg-amber-50 p-4 text-center">
                        <BookOpen className="mx-auto mb-2 h-6 w-6 text-amber-600" />
                        <p className="text-2xl font-bold text-amber-900">{activeClassroom.storyCount}</p>
                        <p className="text-xs text-amber-600">Stories</p>
                      </div>
                      <div className="rounded-xl bg-violet-50 p-4 text-center">
                        <BarChart3 className="mx-auto mb-2 h-6 w-6 text-violet-600" />
                        <p className="text-2xl font-bold text-violet-900">87%</p>
                        <p className="text-xs text-violet-600">Engagement</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Access Code Card */}
                <Card className="border-emerald-200/60">
                  <CardHeader>
                    <CardTitle className="text-base text-emerald-900 flex items-center gap-2">
                      <Hash className="h-4 w-4 text-emerald-600" />
                      Access Code
                    </CardTitle>
                    <CardDescription>Share this code with students to join</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl bg-stone-900 p-4 text-center">
                      <p className="font-mono text-3xl font-bold text-amber-400 tracking-widest">
                        {activeClassroom.accessCode}
                      </p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        onClick={() => handleCopyCode(activeClassroom.accessCode)}
                      >
                        {copiedCode === activeClassroom.accessCode ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-stone-200 text-stone-600 hover:bg-stone-50"
                        onClick={() => handleRegenerateCode(activeClassroom.id)}
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* All Classrooms List */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {classrooms.map((classroom) => (
                <motion.div key={classroom.id} variants={itemVariants}>
                  <Card
                    className={cn(
                      'cursor-pointer transition-all border-2 hover:shadow-md',
                      selectedClassroom === classroom.id
                        ? 'border-emerald-400 shadow-emerald-100 shadow-md'
                        : 'border-stone-200 hover:border-emerald-300'
                    )}
                    onClick={() => setSelectedClassroom(classroom.id)}
                  >
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                          <School className="h-5 w-5 text-emerald-600" />
                        </div>
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[10px]">
                          {classroom.grade}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-stone-900 text-sm">{classroom.name}</h3>
                      <p className="text-xs text-stone-500 mt-0.5">{classroom.subject}</p>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {classroom.studentCount} students
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" /> {classroom.storyCount} stories
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* ===== SHARED STORIES TAB ===== */}
          <TabsContent value="stories" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">Shared Stories</h2>
              <Button size="sm" className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white">
                <Plus className="h-4 w-4" /> Share New Story
              </Button>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {mockSharedStories.map((story) => (
                <motion.div key={story.id} variants={itemVariants}>
                  <Card className="overflow-hidden border-stone-200 hover:shadow-md transition-shadow">
                    {/* Cover gradient */}
                    <div className={cn('relative h-32 bg-gradient-to-br', story.coverGradient)}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl opacity-60">
                          {genreEmojis[story.genre] || '📖'}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-white/20 text-white backdrop-blur-sm border-0 text-[10px]">
                          {story.genre}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-stone-900 text-sm">{story.title}</h3>
                      <p className="mt-0.5 text-xs text-stone-500">
                        Ages {story.ageGroup} &middot; Shared by {story.sharedBy}
                      </p>
                      <Separator className="my-2" />
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" /> {story.readCount} reads
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" /> {story.avgRating}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-stone-400">{story.sharedAt}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* ===== STUDENT PROGRESS TAB ===== */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">Student Progress</h2>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>Class Average:</span>
                <span className="font-semibold text-emerald-600">87% Comprehension</span>
              </div>
            </div>

            {/* Class Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { label: 'Total Students', value: '24', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Avg Stories Read', value: '10.6', icon: BookOpen, color: 'text-amber-600 bg-amber-50' },
                { label: 'Avg Reading Time', value: '4.2 hrs', icon: Clock, color: 'text-violet-600 bg-violet-50' },
                { label: 'Top Comprehension', value: '95%', icon: Sparkles, color: 'text-rose-600 bg-rose-50' },
              ].map((stat) => (
                <Card key={stat.label} className="border-stone-200">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', stat.color)}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">{stat.label}</p>
                      <p className="text-lg font-bold text-stone-900">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Student List */}
            <Card className="border-stone-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-stone-900">Student Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {mockStudents.map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="flex items-center gap-3 rounded-xl border border-stone-100 p-3 hover:bg-emerald-50/50 transition-colors"
                    >
                      {/* Avatar */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white">
                        {student.avatar}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-stone-900">{student.name}</p>
                          <span className="text-[10px] text-stone-400">{student.lastActive}</span>
                        </div>
                        <p className="text-xs text-stone-500 truncate">
                          {student.currentBook ? `Reading: ${student.currentBook}` : 'No active story'}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-4 shrink-0">
                        <div className="text-center">
                          <p className="text-sm font-bold text-stone-900">{student.storiesRead}</p>
                          <p className="text-[10px] text-stone-400">Stories</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-stone-900">{Math.floor(student.readingTime / 60)}h {student.readingTime % 60}m</p>
                          <p className="text-[10px] text-stone-400">Time</p>
                        </div>
                        <div className="text-center min-w-[3.5rem]">
                          <div className="flex items-center gap-1">
                            <p className={cn(
                              'text-sm font-bold',
                              student.comprehension >= 90 ? 'text-emerald-600' :
                              student.comprehension >= 80 ? 'text-amber-600' : 'text-red-600'
                            )}>
                              {student.comprehension}%
                            </p>
                          </div>
                          <p className="text-[10px] text-stone-400">Comp.</p>
                        </div>
                      </div>

                      {/* Comprehension mini-bar */}
                      <div className="w-16 shrink-0 sm:hidden">
                        <Progress
                          value={student.comprehension}
                          className="h-1.5"
                        />
                        <p className="mt-0.5 text-[10px] text-stone-400 text-center">{student.comprehension}%</p>
                      </div>

                      <ChevronRight className="h-4 w-4 text-stone-300 shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
