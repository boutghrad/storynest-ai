'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize,
  Minimize,
  List,
  X,
  Type,
  Gauge,
  Volume2,
  BookOpen,
  Sparkles,
  Trees,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useReaderSlice } from '@/stores/app-store';

// =============================================================================
// Types
// =============================================================================

interface Dialogue {
  character: string;
  text: string;
}

interface Scene {
  id: string;
  title: string;
  narrative: string;
  dialogue: Dialogue[];
  emotion: string;
  setting: string;
}

interface Chapter {
  id: string;
  title: string;
  scenes: Scene[];
}

interface StoryData {
  id: string;
  title: string;
  author: string;
  genre: string;
  ageGroup: string;
  chapters: Chapter[];
}

// =============================================================================
// Emotion emoji map
// =============================================================================

const EMOTION_EMOJI: Record<string, string> = {
  wonder: '🌟',
  awe: '😲',
  determination: '💪',
  happiness: '😊',
  sadness: '😢',
  excitement: '🎉',
};

// =============================================================================
// Scene gradient map
// =============================================================================

const EMOTION_GRADIENT: Record<string, string> = {
  wonder: 'from-amber-400 via-yellow-300 to-orange-400',
  awe: 'from-purple-400 via-violet-400 to-fuchsia-400',
  determination: 'from-red-400 via-orange-400 to-amber-400',
  happiness: 'from-yellow-300 via-amber-300 to-lime-300',
  sadness: 'from-slate-400 via-blue-300 to-indigo-300',
  excitement: 'from-pink-400 via-rose-400 to-red-400',
};

// =============================================================================
// Text size config
// =============================================================================

type TextSize = 'small' | 'medium' | 'large';

const TEXT_SIZE_MAP: Record<TextSize, { narrative: string; dialogue: string; title: string }> = {
  small: { narrative: 'text-base leading-relaxed', dialogue: 'text-sm', title: 'text-2xl' },
  medium: { narrative: 'text-lg leading-relaxed', dialogue: 'text-base', title: 'text-3xl' },
  large: { narrative: 'text-xl leading-loose', dialogue: 'text-lg', title: 'text-4xl' },
};

// =============================================================================
// Mock Story Data
// =============================================================================

const mockStory: StoryData = {
  id: '1',
  title: 'Luna and the Starlight Forest',
  author: 'StoryNest AI',
  genre: 'Fantasy',
  ageGroup: '6-8',
  chapters: [
    {
      id: 'c1',
      title: 'The Discovery',
      scenes: [
        {
          id: 's1',
          title: 'A Strange Light',
          narrative:
            "In a small village nestled between rolling hills and a whispering forest, a young girl named Luna discovered something extraordinary. While gathering wildflowers near the ancient oak tree, she noticed a soft, silvery glow emanating from between the roots. It was unlike anything she had ever seen — not quite moonlight, not quite firefly sparkle, but something magical in between.",
          dialogue: [
            {
              character: 'Luna',
              text: "What is this beautiful light? It feels like it's calling me!",
            },
            {
              character: 'Forest Whisper',
              text: 'Follow the light, young one. The forest has been waiting for someone brave enough to listen.',
            },
          ],
          emotion: 'wonder',
          setting:
            'A peaceful village edge at twilight, ancient oak tree with glowing roots',
        },
        {
          id: 's2',
          title: 'Into the Forest',
          narrative:
            "With her heart pounding like a tiny drum, Luna stepped between the roots of the great oak. The world behind her seemed to blur and fade, replaced by an enchanted forest where every leaf shimmered with starlight. Fireflies the size of jam jars floated lazily through the air, leaving trails of gold and silver.",
          dialogue: [
            {
              character: 'Luna',
              text: 'This place is incredible! The trees are singing!',
            },
            {
              character: 'Elder Fox',
              text: 'Welcome, little one. I have been the guardian of this forest for three hundred years. Not many can hear the trees sing.',
            },
          ],
          emotion: 'awe',
          setting:
            'An enchanted forest with shimmering starlight leaves and giant fireflies',
        },
        {
          id: 's3',
          title: 'The Quest Begins',
          narrative:
            "Elder Fox explained that the Starlight Forest was losing its magic. The Great Crystal at the heart of the forest had dimmed, and without its light, the magical creatures would soon fade away. Luna felt a warm glow in her chest — the same light that had called her from the village was now glowing softly in her hands.",
          dialogue: [
            {
              character: 'Elder Fox',
              text: 'You carry the Light of Courage, Luna. It chose you for a reason.',
            },
            {
              character: 'Luna',
              text: "But I'm just a girl from the village. How can I help?",
            },
            {
              character: 'Elder Fox',
              text: 'Courage does not require you to be the biggest or the strongest. It only requires you to take the first step.',
            },
          ],
          emotion: 'determination',
          setting:
            'A clearing in the enchanted forest, a glowing crystal dimly visible in the distance',
        },
      ],
    },
    {
      id: 'c2',
      title: 'The Enchanted Path',
      scenes: [
        {
          id: 's4',
          title: 'Whispering Willows',
          narrative:
            "Luna followed the path deeper into the forest, guided by the light in her hands. The willow trees along the path whispered ancient secrets, their long branches swaying gently even though there was no wind. Each tree seemed to lean toward her, sharing fragments of stories from a thousand years past.",
          dialogue: [
            {
              character: 'Willow Elder',
              text: 'The Crystal remembers everything, young one. Every wish, every dream, every kind word ever spoken in this forest.',
            },
            {
              character: 'Luna',
              text: "I can hear them! All the voices from before... they're so beautiful.",
            },
          ],
          emotion: 'wonder',
          setting:
            'A path lined with ancient willow trees that whisper and sway without wind',
        },
        {
          id: 's5',
          title: 'The Bridge of Stars',
          narrative:
            "The path led Luna to a magnificent bridge made entirely of starlight. It arched over a river that flowed with liquid moonlight, and tiny fish made of sparks jumped and danced in the current. At the center of the bridge, a small glowing creature appeared — a star-sprite no bigger than Luna's hand.",
          dialogue: [
            {
              character: 'Star-Sprite Twinkle',
              text: "Oh! A visitor! It's been so long since anyone crossed the Bridge of Stars. Are you going to save the Crystal?",
            },
            {
              character: 'Luna',
              text: "I think so... I hope so. Will you help me?",
            },
            {
              character: 'Star-Sprite Twinkle',
              text: "Of course! I'll light your way. That's what star-sprites do best!",
            },
          ],
          emotion: 'excitement',
          setting:
            'A bridge of pure starlight over a moonlight river, with tiny sparkling fish',
        },
      ],
    },
  ],
};

// =============================================================================
// Page turn animation variants
// =============================================================================

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
};

const pageTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

// =============================================================================
// StoryReader Component
// =============================================================================

export default function StoryReader() {
  const reader = useReaderSlice();

  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [narrationSpeed, setNarrationSpeed] = useState(1);
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [showChapterDrawer, setShowChapterDrawer] = useState(false);
  const [currentVoice, setCurrentVoice] = useState('storyteller');

  // Flatten all scenes into a page list
  const pages = useMemo(() => {
    const result: { chapter: Chapter; scene: Scene; chapterIndex: number; sceneIndex: number }[] = [];
    mockStory.chapters.forEach((chapter, ci) => {
      chapter.scenes.forEach((scene, si) => {
        result.push({ chapter, scene, chapterIndex: ci, sceneIndex: si });
      });
    });
    return result;
  }, []);

  const totalPages = pages.length;
  const currentPageData = pages[currentPage];
  const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;

  // Navigation
  const goNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setDirection(1);
      setCurrentPage((p) => p + 1);
    }
  }, [currentPage, totalPages]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage((p) => p - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback(
    (pageIndex: number) => {
      setDirection(pageIndex > currentPage ? 1 : -1);
      setCurrentPage(pageIndex);
      setShowChapterDrawer(false);
    },
    [currentPage]
  );

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((f) => !f);
  }, []);

  const toggleNarration = useCallback(() => {
    setIsNarrating((n) => !n);
  }, []);

  if (!currentPageData) return null;

  const { chapter, scene } = currentPageData;

  return (
    <div
      className={cn(
        'relative flex flex-col transition-all duration-500',
        isFullscreen
          ? 'fixed inset-0 z-50 bg-stone-950'
          : 'min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-violet-50'
      )}
    >
      {/* ===== HEADER ===== */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          'sticky top-0 z-30 flex items-center justify-between px-4 py-3 backdrop-blur-xl sm:px-6',
          isFullscreen
            ? 'bg-stone-950/80 border-b border-stone-800'
            : 'bg-amber-50/80 border-b border-amber-200/50'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img src="/storynest-logo.png" alt="StoryNest AI" className={cn('h-9 w-9 rounded-lg', isFullscreen && 'ring-1 ring-amber-500/30')} />
            <div>
              <h1 className={cn(
                'text-sm font-bold leading-tight',
                isFullscreen ? 'text-amber-100' : 'text-amber-900'
              )}>
                {mockStory.title}
              </h1>
              <p className={cn(
                'text-xs',
                isFullscreen ? 'text-stone-400' : 'text-amber-600'
              )}>
                by {mockStory.author}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              'text-xs',
              isFullscreen ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-violet-100 text-violet-700 border-violet-200'
            )}
          >
            🧙 {mockStory.genre}
          </Badge>
          <Badge
            variant="secondary"
            className={cn(
              'text-xs',
              isFullscreen ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-100 text-amber-700 border-amber-200'
            )}
          >
            🌟 {mockStory.ageGroup}
          </Badge>

          <Separator orientation="vertical" className={cn('mx-1 h-6', isFullscreen ? 'bg-stone-700' : 'bg-amber-200')} />

          {/* Chapter Drawer Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowChapterDrawer(true)}
            className={cn(isFullscreen ? 'text-stone-300 hover:text-amber-300 hover:bg-stone-800' : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100')}
          >
            <List className="h-4 w-4" />
          </Button>

          {/* Text Size */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const sizes: TextSize[] = ['small', 'medium', 'large'];
              const nextIndex = (sizes.indexOf(textSize) + 1) % sizes.length;
              setTextSize(sizes[nextIndex]);
            }}
            className={cn(isFullscreen ? 'text-stone-300 hover:text-amber-300 hover:bg-stone-800' : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100')}
          >
            <Type className="h-4 w-4" />
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className={cn(isFullscreen ? 'text-stone-300 hover:text-amber-300 hover:bg-stone-800' : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100')}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </motion.header>

      {/* ===== MAIN READING AREA ===== */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="mx-auto h-full max-w-3xl overflow-y-auto px-4 py-6 sm:px-8 sm:py-8"
          >
            {/* Scene Illustration */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className={cn(
                'relative mb-6 overflow-hidden rounded-2xl',
                isFullscreen ? 'h-52 sm:h-64' : 'h-44 sm:h-56'
              )}
            >
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-br',
                  EMOTION_GRADIENT[scene.emotion] || 'from-amber-400 via-yellow-300 to-orange-400'
                )}
              />
              {/* Decorative floating elements */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  animate={{ y: [-8, 8, -8], rotate: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-[15%] top-[20%] text-4xl opacity-60"
                >
                  {EMOTION_EMOJI[scene.emotion] || '✨'}
                </motion.div>
                <motion.div
                  animate={{ y: [6, -6, 6], rotate: [0, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute right-[20%] top-[30%] text-3xl opacity-50"
                >
                  ⭐
                </motion.div>
                <motion.div
                  animate={{ y: [-5, 5, -5], x: [-3, 3, -3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute left-[60%] top-[60%] text-2xl opacity-40"
                >
                  🌙
                </motion.div>
                <motion.div
                  animate={{ y: [4, -4, 4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                  className="absolute left-[40%] top-[15%] text-2xl opacity-50"
                >
                  ✨
                </motion.div>
              </div>
              {/* Scene icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Trees className="h-10 w-10 text-white/80" />
                </div>
              </div>
              {/* Scene emotion badge */}
              <div className="absolute bottom-3 right-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                  {EMOTION_EMOJI[scene.emotion]} {scene.emotion}
                </span>
              </div>
            </motion.div>

            {/* Chapter & Scene Title */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-4 text-center"
            >
              <p className={cn(
                'mb-1 text-xs font-semibold uppercase tracking-widest',
                isFullscreen ? 'text-amber-400/70' : 'text-amber-500'
              )}>
                Chapter {currentPageData.chapterIndex + 1} — {chapter.title}
              </p>
              <h2
                className={cn(
                  'font-bold',
                  TEXT_SIZE_MAP[textSize].title,
                  isFullscreen
                    ? 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent'
                    : 'text-amber-900'
                )}
              >
                {scene.title}
              </h2>
            </motion.div>

            {/* Scene Setting */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <p
                className={cn(
                  'italic text-center',
                  isFullscreen ? 'text-stone-400' : 'text-amber-700/70',
                  textSize === 'large' ? 'text-base' : 'text-sm'
                )}
              >
                📍 {scene.setting}
              </p>
            </motion.div>

            {/* Narrative Text */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <p
                className={cn(
                  TEXT_SIZE_MAP[textSize].narrative,
                  isFullscreen ? 'text-stone-200' : 'text-stone-700'
                )}
              >
                {scene.narrative}
              </p>
            </motion.div>

            {/* Dialogue */}
            {scene.dialogue.length > 0 && (
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                {scene.dialogue.map((d, i) => (
                  <div
                    key={i}
                    className={cn(
                      'relative rounded-xl p-4',
                      isFullscreen
                        ? 'bg-stone-800/60 border border-stone-700/50'
                        : 'bg-amber-50 border border-amber-200/60'
                    )}
                  >
                    {/* Quote mark */}
                    <span
                      className={cn(
                        'absolute -left-1 -top-2 text-3xl font-serif',
                        isFullscreen ? 'text-amber-500/40' : 'text-amber-400/50'
                      )}
                    >
                      &ldquo;
                    </span>
                    <p
                      className={cn(
                        'mb-1 font-bold text-sm',
                        isFullscreen ? 'text-amber-400' : 'text-amber-700'
                      )}
                    >
                      {d.character}
                    </p>
                    <p
                      className={cn(
                        TEXT_SIZE_MAP[textSize].dialogue,
                        'italic',
                        isFullscreen ? 'text-stone-300' : 'text-stone-600'
                      )}
                    >
                      &ldquo;{d.text}&rdquo;
                    </p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Bottom spacer for scroll */}
            <div className="h-24" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ===== PROGRESS BAR ===== */}
      <div className={cn('relative z-20', isFullscreen ? 'bg-stone-950' : '')}>
        <Progress
          value={progress}
          className={cn(
            'h-1 rounded-none',
            isFullscreen ? '[&>div]:bg-amber-500' : '[&>div]:bg-amber-400'
          )}
        />
      </div>

      {/* ===== BOTTOM CONTROLS ===== */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={cn(
          'sticky bottom-0 z-30 backdrop-blur-xl',
          isFullscreen
            ? 'bg-stone-950/90 border-t border-stone-800'
            : 'bg-amber-50/90 border-t border-amber-200/50'
        )}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Previous */}
          <Button
            variant="ghost"
            size="sm"
            onClick={goPrev}
            disabled={currentPage === 0}
            className={cn(
              'gap-1',
              isFullscreen
                ? 'text-stone-300 hover:text-amber-300 hover:bg-stone-800 disabled:text-stone-600'
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100 disabled:text-amber-300'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          {/* Center controls */}
          <div className="flex items-center gap-2">
            {/* Audio Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleNarration}
              className={cn(
                'h-10 w-10 rounded-full',
                isNarrating
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : isFullscreen
                    ? 'text-stone-300 hover:text-amber-300 hover:bg-stone-800'
                    : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100'
              )}
            >
              {isNarrating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </Button>

            {/* Speed control */}
            {isNarrating && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex items-center gap-1"
              >
                <Gauge className={cn('h-3 w-3', isFullscreen ? 'text-stone-400' : 'text-amber-500')} />
                {[0.75, 1, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setNarrationSpeed(speed)}
                    className={cn(
                      'rounded px-1.5 py-0.5 text-xs font-medium transition-colors',
                      narrationSpeed === speed
                        ? 'bg-amber-500 text-white'
                        : isFullscreen
                          ? 'text-stone-400 hover:text-amber-300'
                          : 'text-amber-600 hover:text-amber-800'
                    )}
                  >
                    {speed}x
                  </button>
                ))}
              </motion.div>
            )}

            {/* Voice indicator */}
            {isNarrating && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                className="flex items-center gap-1"
              >
                <Volume2 className={cn('h-3 w-3', isFullscreen ? 'text-stone-400' : 'text-amber-500')} />
                <span className={cn('text-xs', isFullscreen ? 'text-stone-400' : 'text-amber-600')}>
                  {currentVoice === 'storyteller' ? 'Storyteller' : currentVoice}
                </span>
              </motion.div>
            )}

            {/* Page indicator */}
            <span
              className={cn(
                'min-w-[5rem] text-center text-sm font-medium',
                isFullscreen ? 'text-stone-300' : 'text-amber-700'
              )}
            >
              {currentPage + 1} / {totalPages}
            </span>
          </div>

          {/* Next */}
          <Button
            variant="ghost"
            size="sm"
            onClick={goNext}
            disabled={currentPage === totalPages - 1}
            className={cn(
              'gap-1',
              isFullscreen
                ? 'text-stone-300 hover:text-amber-300 hover:bg-stone-800 disabled:text-stone-600'
                : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100 disabled:text-amber-300'
            )}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* ===== CHAPTER NAVIGATION DRAWER ===== */}
      <AnimatePresence>
        {showChapterDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChapterDrawer(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                'fixed left-0 top-0 bottom-0 z-50 w-80 overflow-y-auto shadow-2xl',
                isFullscreen ? 'bg-stone-900' : 'bg-white'
              )}
            >
              {/* Drawer header */}
              <div
                className={cn(
                  'sticky top-0 z-10 flex items-center justify-between border-b p-4',
                  isFullscreen ? 'border-stone-700 bg-stone-900' : 'border-amber-200 bg-amber-50'
                )}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className={cn('h-5 w-5', isFullscreen ? 'text-amber-400' : 'text-amber-500')} />
                  <h3 className={cn('font-bold', isFullscreen ? 'text-amber-100' : 'text-amber-900')}>
                    Chapters
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowChapterDrawer(false)}
                  className={cn(isFullscreen ? 'text-stone-400 hover:text-amber-300 hover:bg-stone-800' : 'text-amber-600 hover:text-amber-800')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Chapter list */}
              <div className="p-4">
                {mockStory.chapters.map((ch, ci) => (
                  <div key={ch.id} className="mb-4">
                    <p
                      className={cn(
                        'mb-2 text-xs font-semibold uppercase tracking-wider',
                        isFullscreen ? 'text-stone-500' : 'text-amber-500'
                      )}
                    >
                      Chapter {ci + 1}
                    </p>
                    <p
                      className={cn(
                        'mb-2 font-bold',
                        isFullscreen ? 'text-amber-200' : 'text-amber-900'
                      )}
                    >
                      {ch.title}
                    </p>
                    <div className="space-y-1">
                      {ch.scenes.map((sc, si) => {
                        const pageIndex = pages.findIndex(
                          (p) => p.chapterIndex === ci && p.sceneIndex === si
                        );
                        const isActive = pageIndex === currentPage;
                        return (
                          <button
                            key={sc.id}
                            onClick={() => goToPage(pageIndex)}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                              isActive
                                ? isFullscreen
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-amber-100 text-amber-900'
                                : isFullscreen
                                  ? 'text-stone-400 hover:bg-stone-800 hover:text-amber-300'
                                  : 'text-stone-600 hover:bg-amber-50 hover:text-amber-800'
                            )}
                          >
                            <span className="text-base">
                              {EMOTION_EMOJI[sc.emotion] || '📖'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{sc.title}</p>
                              <p
                                className={cn(
                                  'text-xs truncate',
                                  isFullscreen ? 'text-stone-500' : 'text-amber-600/70'
                                )}
                              >
                                Page {pageIndex + 1}
                              </p>
                            </div>
                            {isActive && (
                              <div className="h-2 w-2 rounded-full bg-amber-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== TEXT SIZE INDICATOR (floating) ===== */}
      <AnimatePresence>
        {textSize !== 'medium' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              'fixed bottom-20 left-1/2 z-30 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-medium shadow-lg',
              isFullscreen
                ? 'bg-stone-800 text-amber-300 border border-stone-700'
                : 'bg-amber-100 text-amber-700 border border-amber-200'
            )}
          >
            Text: {textSize.charAt(0).toUpperCase() + textSize.slice(1)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
