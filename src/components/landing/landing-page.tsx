'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Sparkles,
  Wand2,
  Palette,
  Volume2,
  GraduationCap,
  Globe,
  Shield,
  Check,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  ArrowRight,
  Menu,
  X,
  Heart,
  Users,
  MessageCircle,
  Twitter,
  Github,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SUBSCRIPTION_PLANS } from '@/lib/constants'

// ===== Animation Variants =====
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}

// ===== Data =====
const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'For Teachers', href: '#teachers' },
  { label: 'For Parents', href: '#parents' },
]

const features = [
  {
    icon: Wand2,
    title: 'Personalized Stories',
    description: "Every story tailored to your child's age, interests, and dreams",
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    icon: Palette,
    title: 'AI Illustrations',
    description: 'Beautiful illustrations generated for every scene',
    gradient: 'from-violet-400 to-purple-500',
  },
  {
    icon: Volume2,
    title: 'Audio Narration',
    description: 'Listen to stories with warm, engaging AI voices',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    icon: GraduationCap,
    title: 'Educational Adventures',
    description: 'Stories that teach morals, science, and life lessons',
    gradient: 'from-rose-400 to-pink-500',
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    description: 'Create stories in 12+ languages',
    gradient: 'from-cyan-400 to-sky-500',
  },
  {
    icon: Shield,
    title: 'Safe Content',
    description: 'AI-moderated content safe for children of all ages',
    gradient: 'from-amber-400 to-yellow-500',
  },
]

const howItWorksSteps = [
  {
    number: 1,
    title: 'Choose Your Adventure',
    description: 'Select age, genre, themes, and characters',
    icon: BookOpen,
  },
  {
    number: 2,
    title: 'AI Creates Magic',
    description: 'Our AI writes, illustrates, and narrates your story',
    icon: Sparkles,
  },
  {
    number: 3,
    title: 'Read & Listen Together',
    description: 'Enjoy immersive storytelling with your child',
    icon: Heart,
  },
]

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Parent of 2',
    quote: 'My kids absolutely love their personalized stories! Bedtime has gone from a struggle to the best part of their day.',
    rating: 5,
    color: 'bg-amber-500',
  },
  {
    name: 'James Rodriguez',
    role: '3rd Grade Teacher',
    quote: 'StoryNest has transformed how I engage my students. The educational adventures make learning feel like play.',
    rating: 5,
    color: 'bg-violet-500',
  },
  {
    name: 'Emily Chen',
    role: 'Parent of 3',
    quote: 'Having stories in Mandarin for my kids is incredible. They are learning their heritage language through magical tales!',
    rating: 5,
    color: 'bg-emerald-500',
  },
  {
    name: 'David Park',
    role: 'Kindergarten Teacher',
    quote: 'The illustrations are stunning and the narration voices are so warm. My classroom looks forward to story time every day.',
    rating: 5,
    color: 'bg-rose-500',
  },
]

const stats = [
  { value: '50K+', label: 'Stories Created' },
  { value: '10K+', label: 'Happy Families' },
  { value: '4.9', label: 'Star Rating' },
  { value: '12', label: 'Languages' },
]

const footerLinks = {
  Product: ['Features', 'Pricing', 'Story Creator', 'Library', 'Mobile App'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  Resources: ['Help Center', 'Community', 'For Teachers', 'For Parents', 'API'],
  Legal: ['Privacy', 'Terms', 'COPPA', 'Cookie Policy', 'Licenses'],
}

// ===== Sub-Components =====

function FloatingElement({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -12, 0],
        rotate: [0, 3, -3, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}

function StorybookVisual() {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <motion.div
      className="relative mx-auto w-64 sm:w-72 md:w-80 cursor-pointer"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      onHoverStart={() => setIsFlipped(true)}
      onHoverEnd={() => setIsFlipped(false)}
    >
      {/* Glow behind the book */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/30 via-violet-400/20 to-rose-400/30 blur-2xl scale-110" />

      <motion.div
        className="relative rounded-2xl overflow-hidden shadow-2xl"
        animate={isFlipped ? { rotateY: 8, scale: 1.03 } : { rotateY: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{ perspective: 600 }}
      >
        {/* Story cover */}
        <div className="relative bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 p-6 sm:p-8 text-white">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-16 h-16 border-2 border-white rounded-full" />
            <div className="absolute bottom-6 right-6 w-12 h-12 border-2 border-white rounded-lg rotate-45" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white rounded-full" />
          </div>

          <div className="relative z-10 text-center space-y-4">
            <motion.div
              animate={isFlipped ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2" />
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-bold leading-tight">
              The Enchanted<br />Forest Adventure
            </h3>
            <p className="text-amber-100 text-sm">A personalized story for Luna, age 6</p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className="w-8 h-1 bg-white/40 rounded-full" />
              <div className="w-12 h-1 bg-white/60 rounded-full" />
              <div className="w-8 h-1 bg-white/40 rounded-full" />
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 flex items-center justify-between">
          <span className="text-white/80 text-xs font-medium">StoryNest AI</span>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 text-amber-200 fill-amber-200" />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Animated sparkles around the book */}
      <FloatingElement className="absolute -top-4 -right-4" delay={0}>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-5 h-5 text-amber-400" />
        </motion.div>
      </FloatingElement>
      <FloatingElement className="absolute -bottom-2 -left-4" delay={1.5}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        >
          <Star className="w-4 h-4 text-violet-400 fill-violet-400" />
        </motion.div>
      </FloatingElement>
      <FloatingElement className="absolute top-1/3 -left-6" delay={2.5}>
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.5, 0.8] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
        >
          <Sparkles className="w-3 h-3 text-emerald-400" />
        </motion.div>
      </FloatingElement>
    </motion.div>
  )
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl shadow-lg shadow-amber-500/5 border-b border-amber-200/20 dark:border-amber-500/10'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <img src="/storynest-logo.png" alt="StoryNest AI" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg group-hover:scale-105 transition-transform" />
            <span className="text-lg sm:text-xl font-bold tracking-tight">
              <span className="gradient-text">StoryNest</span>
              <span className="text-foreground ml-0.5">AI</span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Sign In
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Start Creating
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent/50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-amber-200/20 dark:border-amber-500/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" size="sm" className="flex-1">Sign In</Button>
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  <Sparkles className="w-4 h-4" />
                  Start Creating
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

function HeroSection() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })
  const bookX = useTransform(springX, [0, 1], [-5, 5])
  const bookY = useTransform(springY, [0, 1], [-5, 5])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }, [mouseX, mouseY])

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-24 pb-16 px-4"
      onMouseMove={handleMouseMove}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-violet-400/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-300/10 rounded-full blur-3xl" />

        {/* Floating decorative icons */}
        <FloatingElement className="absolute top-24 left-[10%] opacity-20 dark:opacity-10" delay={0}>
          <BookOpen className="w-8 h-8 text-amber-500" />
        </FloatingElement>
        <FloatingElement className="absolute top-40 right-[15%] opacity-20 dark:opacity-10" delay={1}>
          <Star className="w-6 h-6 text-violet-500 fill-violet-500" />
        </FloatingElement>
        <FloatingElement className="absolute bottom-32 left-[20%] opacity-20 dark:opacity-10" delay={2}>
          <Sparkles className="w-7 h-7 text-emerald-500" />
        </FloatingElement>
        <FloatingElement className="absolute top-60 left-[5%] opacity-15 dark:opacity-8" delay={1.5}>
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
        </FloatingElement>
        <FloatingElement className="absolute bottom-48 right-[8%] opacity-15 dark:opacity-8" delay={0.5}>
          <Sparkles className="w-6 h-6 text-rose-400" />
        </FloatingElement>
      </div>

      <div className="relative max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <motion.div
            className="text-center lg:text-left"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={staggerItem}>
              <Badge className="mb-6 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Storytelling
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
              variants={staggerItem}
            >
              Where Every Child Becomes a{' '}
              <span className="gradient-text">Story Hero</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
              variants={staggerItem}
            >
              AI-powered personalized stories with beautiful illustrations and warm narration.
              Create magical adventures tailored to your child in seconds.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
              variants={staggerItem}
            >
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all text-base px-8 h-12"
              >
                <Sparkles className="w-5 h-5" />
                Create Your First Story
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/5 transition-all text-base px-8 h-12"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6"
              variants={staggerItem}
            >
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Storybook visual */}
          <motion.div
            className="flex justify-center lg:justify-end"
            style={{ x: bookX, y: bookY }}
          >
            <StorybookVisual />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28 px-4 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-400/5 dark:bg-violet-400/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="outline" className="mb-4 border-amber-500/30 text-amber-700 dark:text-amber-400">
              <Sparkles className="w-3 h-3 mr-1" />
              Features
            </Badge>
          </motion.div>
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            variants={fadeInUp}
          >
            Everything Your Child Needs for{' '}
            <span className="gradient-text">Magical Stories</span>
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Our AI creates personalized, illustrated, and narrated stories that adapt to every child
          </motion.p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                className="group relative rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-amber-200/30 dark:border-amber-500/10 p-6 sm:p-8 hover:border-amber-400/50 dark:hover:border-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 dark:hover:shadow-amber-500/5"
                variants={staggerItem}
                whileHover={{ y: -4 }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/0 via-violet-500/0 to-rose-500/0 group-hover:from-amber-500/5 group-hover:via-violet-500/5 group-hover:to-rose-500/5 transition-all duration-500 pointer-events-none" />

                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-5 shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section id="teachers" className="py-20 sm:py-28 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-transparent to-violet-50/50 dark:from-amber-950/20 dark:via-transparent dark:to-violet-950/20 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="outline" className="mb-4 border-violet-500/30 text-violet-700 dark:text-violet-400">
              <BookOpen className="w-3 h-3 mr-1" />
              How It Works
            </Badge>
          </motion.div>
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            variants={fadeInUp}
          >
            Three Simple Steps to{' '}
            <span className="gradient-text">Story Magic</span>
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            From idea to enchantment in under a minute
          </motion.p>
        </motion.div>

        <motion.div
          className="relative grid md:grid-cols-3 gap-8 md:gap-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
        >
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-amber-400 via-violet-400 to-rose-400 opacity-30" />

          {howItWorksSteps.map((step) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                className="relative text-center"
                variants={staggerItem}
              >
                {/* Numbered circle */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-amber-500/25">
                    {step.number}
                  </div>
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white shadow-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: step.number * 0.3 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>
                </div>

                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

function PricingSection() {
  // Override highlight: Family plan should be "Most Popular"
  const plans = SUBSCRIPTION_PLANS.map((plan) => ({
    ...plan,
    isPopular: plan.id === 'family',
  }))

  return (
    <section id="pricing" className="py-20 sm:py-28 px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-400/5 dark:bg-amber-400/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="outline" className="mb-4 border-amber-500/30 text-amber-700 dark:text-amber-400">
              <Sparkles className="w-3 h-3 mr-1" />
              Pricing
            </Badge>
          </motion.div>
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            variants={fadeInUp}
          >
            Choose Your{' '}
            <span className="gradient-text">Story Plan</span>
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Start free, upgrade when you are ready for more magic
          </motion.p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              className={`relative rounded-2xl p-6 sm:p-8 flex flex-col transition-all duration-300 ${
                plan.isPopular
                  ? 'bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-400 dark:border-amber-500/60 shadow-xl shadow-amber-500/15 scale-[1.02] lg:scale-105'
                  : 'bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-amber-200/30 dark:border-amber-500/10 hover:border-amber-400/40 dark:hover:border-amber-500/25'
              }`}
              variants={staggerItem}
              whileHover={{ y: -4 }}
            >
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg shadow-amber-500/25 px-4 py-1 text-xs font-semibold">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">
                  ${plan.price}
                </span>
                <span className="text-muted-foreground text-sm">/{plan.period}</span>
                <div className="text-sm text-muted-foreground mt-1">
                  {plan.credits} credits/month
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.isPopular
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40'
                    : plan.id === 'free'
                    ? 'bg-white dark:bg-white/10 text-foreground border border-amber-200/50 dark:border-amber-500/20 hover:bg-amber-50 dark:hover:bg-white/15'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20'
                }`}
                variant={plan.id === 'free' ? 'outline' : 'default'}
                size="lg"
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [])

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section id="parents" className="py-20 sm:py-28 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-50/30 to-transparent dark:from-transparent dark:via-amber-950/10 dark:to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="outline" className="mb-4 border-rose-500/30 text-rose-700 dark:text-rose-400">
              <Heart className="w-3 h-3 mr-1" />
              Testimonials
            </Badge>
          </motion.div>
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            variants={fadeInUp}
          >
            Loved by{' '}
            <span className="gradient-text">Families & Teachers</span>
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            See what parents and educators are saying about StoryNest AI
          </motion.p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 200 : -200 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -200 : 200 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-amber-200/30 dark:border-amber-500/10 rounded-2xl p-8 sm:p-12"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonials[current].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-lg sm:text-xl text-foreground leading-relaxed mb-8 max-w-2xl">
                    &ldquo;{testimonials[current].quote}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${testimonials[current].color} flex items-center justify-center text-white font-semibold text-sm`}>
                      {testimonials[current].name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">{testimonials[current].name}</div>
                      <div className="text-xs text-muted-foreground">{testimonials[current].role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-amber-200/50 dark:border-amber-500/20 flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > current ? 1 : -1)
                    setCurrent(idx)
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    idx === current
                      ? 'bg-amber-500 w-8'
                      : 'bg-amber-300/40 dark:bg-amber-500/30 hover:bg-amber-400/60'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-amber-200/50 dark:border-amber-500/20 flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalCTASection() {
  return (
    <section className="py-20 sm:py-28 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100/60 via-orange-50/40 to-violet-100/50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-violet-950/30 pointer-events-none" />

      {/* Decorative sparkles */}
      <FloatingElement className="absolute top-12 left-[10%] opacity-30" delay={0}>
        <Sparkles className="w-8 h-8 text-amber-500" />
      </FloatingElement>
      <FloatingElement className="absolute bottom-16 right-[12%] opacity-30" delay={1}>
        <Star className="w-6 h-6 text-violet-500 fill-violet-500" />
      </FloatingElement>
      <FloatingElement className="absolute top-1/2 right-[5%] opacity-20" delay={2}>
        <Sparkles className="w-5 h-5 text-rose-400" />
      </FloatingElement>

      <motion.div
        className="max-w-3xl mx-auto text-center relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
      >
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          variants={fadeInUp}
        >
          Start Creating Magical Stories{' '}
          <span className="gradient-text">Tonight</span>
        </motion.h2>

        <motion.p
          className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          variants={fadeInUp}
        >
          Join thousands of families making bedtime unforgettable
        </motion.p>

        <motion.div variants={fadeInUp} className="mb-10">
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all text-lg px-10 h-14 rounded-xl"
          >
            <Sparkles className="w-5 h-5" />
            Create Your First Story — It&apos;s Free
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          variants={fadeInUp}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-500" />
            <span>Child-safe content</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-amber-200/30 dark:border-amber-500/10 bg-white/40 dark:bg-white/[0.02] backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 sm:gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4">
              <img src="/storynest-logo.png" alt="StoryNest AI" className="w-7 h-7 rounded-lg" />
              <span className="font-bold tracking-tight">
                <span className="gradient-text">StoryNest</span>
                <span className="ml-0.5">AI</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Magical AI stories that spark imagination and bring families together.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-amber-200/20 dark:border-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} StoryNest AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Email">
              <Mail className="w-4 h-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Community">
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ===== Main Landing Page Component =====
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  )
}
