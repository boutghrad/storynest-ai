'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ShieldAlert,
  GraduationCap,
  Shield,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  Home as HomeIcon,
  LogOut,
  User,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore, type AppView } from '@/stores/app-store';
import LandingPage from '@/components/landing/landing-page';
import Dashboard from '@/components/dashboard/dashboard';
import StoryReader from '@/components/reader/story-reader';
import AdminDashboard from '@/components/admin/admin-dashboard';
import TeacherPortal from '@/components/teacher/teacher-portal';
import ParentControls from '@/components/parent/parent-controls';

const viewConfig: Record<AppView, { label: string; icon: typeof BookOpen; description: string; group: 'main' | 'app' | 'admin' }> = {
  landing: { label: 'Home', icon: HomeIcon, description: 'Landing page', group: 'main' },
  dashboard: { label: 'Dashboard', icon: LayoutDashboard, description: 'Story workspace', group: 'app' },
  reader: { label: 'Story Reader', icon: BookOpen, description: 'Immersive reading', group: 'app' },
  admin: { label: 'Admin', icon: ShieldAlert, description: 'Platform management', group: 'admin' },
  teacher: { label: 'Teacher Portal', icon: GraduationCap, description: 'Classroom tools', group: 'app' },
  parent: { label: 'Parent Controls', icon: Shield, description: 'Safety & settings', group: 'app' },
  pricing: { label: 'Pricing', icon: Zap, description: 'Plans & billing', group: 'main' },
  'story-create': { label: 'Create Story', icon: Sparkles, description: 'New story', group: 'app' },
};

const appViews: AppView[] = ['dashboard', 'reader', 'teacher', 'parent', 'admin'];

export default function Home() {
  const { currentView, setView, isAuthenticated, user, login, logout } = useAppStore();
  const [showNav, setShowNav] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authLoading, setAuthLoading] = useState(false);

  // Auto-login for demo purposes
  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        login({
          id: 'demo-user-1',
          email: 'parent@storynest.ai',
          name: 'Sarah Johnson',
          image: null,
          role: 'parent',
          subscription: 'family',
          credits: 142,
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, login]);

  const handleAuth = useCallback(async () => {
    setAuthLoading(true);
    try {
      const response = await fetch(`/api/auth?action=${authMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await response.json();
      if (data.user) {
        login(data.user);
        setShowAuthModal(false);
        setView('dashboard');
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setAuthLoading(false);
    }
  }, [authMode, authForm, login, setView]);

  const handleViewChange = useCallback((view: AppView) => {
    setView(view);
    setShowNav(false);
  }, [setView]);

  const handleLogout = useCallback(() => {
    logout();
    setView('landing');
  }, [logout, setView]);

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'dashboard':
        return <Dashboard />;
      case 'reader':
        return <StoryReader />;
      case 'admin':
        return <AdminDashboard />;
      case 'teacher':
        return <TeacherPortal />;
      case 'parent':
        return <ParentControls />;
      case 'pricing':
        return <LandingPage />;
      case 'story-create':
        return <Dashboard />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* Global Navigation Bar - Shows when authenticated */}
      {isAuthenticated && currentView !== 'landing' && (
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between h-full px-4 max-w-[2000px] mx-auto">
            {/* Left: Logo */}
            <button
              onClick={() => handleViewChange('dashboard')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg gradient-text hidden sm:block">StoryNest AI</span>
            </button>

            {/* Center: View Switcher */}
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/50 rounded-full p-1">
              {appViews.map((view) => {
                const config = viewConfig[view];
                const isActive = currentView === view;
                return (
                  <button
                    key={view}
                    onClick={() => handleViewChange(view)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                      isActive
                        ? 'bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 shadow-sm'
                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                    )}
                  >
                    <config.icon className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">{config.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: User menu */}
            <div className="flex items-center gap-3">
              {/* Credits Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                <Zap className="h-3 w-3" />
                <span>{user?.credits ?? 0} credits</span>
              </div>

              {/* User Avatar */}
              <div className="relative">
                <button
                  onClick={() => setShowNav(!showNav)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0) ?? 'U'}
                  </div>
                  <ChevronDown className={cn('h-3 w-3 text-stone-400 transition-transform', showNav && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {showNav && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xl p-1.5"
                    >
                      {/* User info */}
                      <div className="px-3 py-2 mb-1 border-b border-stone-100 dark:border-stone-800">
                        <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{user?.name}</p>
                        <p className="text-xs text-stone-500">{user?.email}</p>
                      </div>

                      <button
                        onClick={() => { handleViewChange('dashboard'); setShowNav(false); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => { handleViewChange('parent'); setShowNav(false); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
                      >
                        <User className="h-4 w-4" />
                        Profile & Settings
                      </button>
                      <div className="my-1 border-t border-stone-100 dark:border-stone-800" />
                      <button
                        onClick={() => { handleLogout(); setShowNav(false); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.nav>
      )}

      {/* Click-away overlay for user menu */}
      {showNav && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNav(false)} />
      )}

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative px-8 pt-8 pb-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold gradient-text">
                    {authMode === 'login' ? 'Welcome Back!' : 'Join StoryNest'}
                  </h2>
                </div>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {authMode === 'login'
                    ? 'Sign in to continue your storytelling journey'
                    : 'Create magical stories for the children in your life'}
                </p>
              </div>

              {/* Form */}
              <div className="px-8 py-6 space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      placeholder="Enter your name"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                    placeholder="Enter your password"
                  />
                </div>

                {/* Demo Quick Login */}
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200/50 dark:border-amber-800/30">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2">Quick Demo Access:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { role: 'Parent', email: 'parent@storynest.ai' },
                      { role: 'Teacher', email: 'teacher@storynest.ai' },
                      { role: 'Admin', email: 'admin@storynest.ai' },
                    ].map((demo) => (
                      <button
                        key={demo.role}
                        onClick={() => {
                          login({
                            id: `demo-${demo.role.toLowerCase()}`,
                            email: demo.email,
                            name: `${demo.role} User`,
                            image: null,
                            role: demo.role.toLowerCase() as 'parent' | 'teacher' | 'admin',
                            subscription: 'family',
                            credits: 142,
                          });
                          setShowAuthModal(false);
                          setView('dashboard');
                        }}
                        className="text-xs px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors font-medium"
                      >
                        {demo.role}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleAuth}
                  disabled={authLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-amber-500/20"
                >
                  {authLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    authMode === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </Button>

                <p className="text-center text-sm text-stone-500">
                  {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                  <button
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="text-amber-600 dark:text-amber-400 font-medium hover:underline"
                  >
                    {authMode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={cn(
        isAuthenticated && currentView !== 'landing' ? 'pt-16' : ''
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
