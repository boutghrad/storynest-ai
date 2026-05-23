'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  CreditCard,
  DollarSign,
  BookOpen,
  Zap,
  ShieldAlert,
  Megaphone,
  Download,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity,
  Brain,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn, formatNumber } from '@/lib/utils';
import { useAdminSlice } from '@/stores/app-store';

// =============================================================================
// Mock Data
// =============================================================================

const revenueData = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 5800 },
  { month: 'Mar', revenue: 7100 },
  { month: 'Apr', revenue: 8900 },
  { month: 'May', revenue: 11200 },
  { month: 'Jun', revenue: 13400 },
];

const userGrowthData = [
  { month: 'Jan', signups: 320 },
  { month: 'Feb', signups: 480 },
  { month: 'Mar', signups: 620 },
  { month: 'Apr', signups: 750 },
  { month: 'May', signups: 980 },
  { month: 'Jun', signups: 1240 },
];

const subscriptionData = [
  { name: 'Free', value: 4500, color: '#94a3b8' },
  { name: 'Pro', value: 2800, color: '#f59e0b' },
  { name: 'Family', value: 1200, color: '#8b5cf6' },
  { name: 'Teacher', value: 650, color: '#10b981' },
];

const recentActivity = [
  { id: '1', type: 'story', description: 'New story "Luna\'s Adventure" published', user: 'Sarah M.', time: '2 min ago', status: 'approved' },
  { id: '2', type: 'user', description: 'New teacher signup from Oakwood Elementary', user: 'System', time: '5 min ago', status: 'info' },
  { id: '3', type: 'moderation', description: 'Story flagged for review: "Dark Forest Tales"', user: 'Auto-mod', time: '12 min ago', status: 'pending' },
  { id: '4', type: 'story', description: 'Story "Dragon Dreams" went viral (1K+ reads)', user: 'Mike R.', time: '25 min ago', status: 'approved' },
  { id: '5', type: 'moderation', description: 'Content appeal submitted for "Haunted House"', user: 'Tom B.', time: '1 hr ago', status: 'pending' },
  { id: '6', type: 'user', description: 'Premium subscription upgraded to Family plan', user: 'Lisa K.', time: '2 hr ago', status: 'info' },
  { id: '7', type: 'story', description: 'AI story generation timeout (model overload)', user: 'System', time: '3 hr ago', status: 'error' },
  { id: '8', type: 'user', description: 'New parent signup via referral program', user: 'Anna P.', time: '4 hr ago', status: 'info' },
];

const moderationQueue = [
  { id: 'm1', title: 'The Haunted Castle Adventure', author: 'User #4521', ageGroup: '8-10', reason: 'Scary content flagged', submittedAt: '1 hr ago' },
  { id: 'm2', title: 'Secret Club Stories', author: 'User #7832', ageGroup: '6-8', reason: 'Peer pressure themes', submittedAt: '3 hr ago' },
  { id: 'm3', title: 'Midnight Mysteries', author: 'User #1289', ageGroup: '10-12', reason: 'Age-inappropriate language', submittedAt: '5 hr ago' },
  { id: 'm4', title: 'The Warrior Princess', author: 'User #5643', ageGroup: '4-6', reason: 'Violence concern', submittedAt: '6 hr ago' },
];

const aiCostData = [
  { model: 'GPT-4o Mini', costPer1K: 0.00015, requests: 45200, totalCost: 6.78, avgTokens: 850 },
  { model: 'GPT-4o', costPer1K: 0.005, requests: 8400, totalCost: 42.0, avgTokens: 1200 },
  { model: 'DALL-E 3', costPer1K: 0.04, requests: 3200, totalCost: 128.0, avgTokens: 0 },
  { model: 'TTS HD', costPer1K: 0.015, requests: 6800, totalCost: 102.0, avgTokens: 0 },
];

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

// =============================================================================
// AdminDashboard Component
// =============================================================================

export default function AdminDashboard() {
  const admin = useAdminSlice();
  const [moderationItems, setModerationItems] = useState(moderationQueue);

  const statsCards = [
    {
      title: 'Total Users',
      value: '9,150',
      change: '+12.5%',
      trend: 'up' as const,
      icon: Users,
      color: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-700',
    },
    {
      title: 'Active Subscriptions',
      value: '4,650',
      change: '+8.2%',
      trend: 'up' as const,
      icon: CreditCard,
      color: 'from-violet-500 to-purple-500',
      bgLight: 'bg-violet-50',
      textColor: 'text-violet-700',
    },
    {
      title: 'Monthly Revenue',
      value: '$13,400',
      change: '+19.6%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'from-emerald-500 to-green-500',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
    {
      title: 'Total Stories',
      value: '23,840',
      change: '+15.3%',
      trend: 'up' as const,
      icon: BookOpen,
      color: 'from-rose-500 to-pink-500',
      bgLight: 'bg-rose-50',
      textColor: 'text-rose-700',
    },
    {
      title: 'AI Credits Used',
      value: '184.2K',
      change: '+22.1%',
      trend: 'up' as const,
      icon: Zap,
      color: 'from-yellow-500 to-amber-500',
      bgLight: 'bg-yellow-50',
      textColor: 'text-yellow-700',
    },
    {
      title: 'Moderation Queue',
      value: '4',
      change: '-2',
      trend: 'down' as const,
      icon: ShieldAlert,
      color: 'from-red-500 to-rose-500',
      bgLight: 'bg-red-50',
      textColor: 'text-red-700',
    },
  ];

  const handleApprove = (id: string) => {
    setModerationItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReject = (id: string) => {
    setModerationItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-900">StoryNest Admin</h1>
              <p className="text-xs text-stone-500">Platform Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
              Admin Access
            </Badge>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-amber-400">
              A
            </div>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-stone-100">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="ai-monitor">AI Monitor</TabsTrigger>
          </TabsList>

          {/* ===== OVERVIEW TAB ===== */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stat Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {statsCards.map((stat) => (
                <motion.div key={stat.title} variants={itemVariants}>
                  <Card className="relative overflow-hidden border-stone-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-stone-500">{stat.title}</p>
                          <p className="mt-1 text-2xl font-bold text-stone-900">{stat.value}</p>
                          <div className="mt-1 flex items-center gap-1">
                            {stat.trend === 'up' ? (
                              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 text-red-500" />
                            )}
                            <span
                              className={cn(
                                'text-xs font-medium',
                                stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                              )}
                            >
                              {stat.change}
                            </span>
                            <span className="text-xs text-stone-400">vs last month</span>
                          </div>
                        </div>
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl',
                            stat.bgLight
                          )}
                        >
                          <stat.icon className={cn('h-5 w-5', stat.textColor)} />
                        </div>
                      </div>
                    </CardContent>
                    {/* Gradient accent line */}
                    <div
                      className={cn(
                        'absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r',
                        stat.color
                      )}
                    />
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Revenue Chart */}
              <Card className="border-stone-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-stone-900">Monthly Revenue</CardTitle>
                  <CardDescription>Revenue over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#a8a29e" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#a8a29e" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e7e5e4',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          fill="url(#revenueGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* User Growth Chart */}
              <Card className="border-stone-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-stone-900">User Signups</CardTitle>
                  <CardDescription>New user registrations over 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#a8a29e" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#a8a29e" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e7e5e4',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="signups" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Distribution + Quick Actions */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Pie Chart */}
              <Card className="border-stone-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-stone-900">Subscription Distribution</CardTitle>
                  <CardDescription>Active plan breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subscriptionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {subscriptionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e7e5e4',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex flex-wrap justify-center gap-3">
                    {subscriptionData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-1.5">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs text-stone-600">
                          {entry.name} ({formatNumber(entry.value)})
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Table */}
              <Card className="border-stone-200 lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-stone-900">Recent Activity</CardTitle>
                  <CardDescription>Latest platform events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-72 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Event</TableHead>
                          <TableHead className="text-xs">User</TableHead>
                          <TableHead className="text-xs">Time</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentActivity.map((activity) => (
                          <TableRow key={activity.id}>
                            <TableCell className="max-w-[200px] truncate text-xs">
                              {activity.description}
                            </TableCell>
                            <TableCell className="text-xs text-stone-500">{activity.user}</TableCell>
                            <TableCell className="text-xs text-stone-400">{activity.time}</TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  'text-[10px] px-1.5',
                                  activity.status === 'approved' && 'bg-emerald-100 text-emerald-700',
                                  activity.status === 'pending' && 'bg-amber-100 text-amber-700',
                                  activity.status === 'error' && 'bg-red-100 text-red-700',
                                  activity.status === 'info' && 'bg-stone-100 text-stone-600'
                                )}
                              >
                                {activity.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-stone-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-stone-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" className="gap-2 border-stone-200 text-stone-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200">
                    <Megaphone className="h-4 w-4" /> Send Announcement
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 border-stone-200 text-stone-700 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200">
                    <Download className="h-4 w-4" /> Export Data
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 border-stone-200 text-stone-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200">
                    <RefreshCw className="h-4 w-4" /> Run Moderation
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 border-stone-200 text-stone-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200">
                    <Trash2 className="h-4 w-4" /> Clear Cache
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== ANALYTICS TAB ===== */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Revenue Trend */}
              <Card className="border-stone-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-stone-900">Revenue Trend</CardTitle>
                  <CardDescription>Monthly recurring revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#a8a29e" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#a8a29e" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e7e5e4',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          fill="url(#revGrad2)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* User Growth Bar */}
              <Card className="border-stone-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-stone-900">Growth Analysis</CardTitle>
                  <CardDescription>User acquisition over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#a8a29e" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#a8a29e" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e7e5e4',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="signups" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { label: 'Avg. Revenue/User', value: '$2.89', icon: DollarSign },
                { label: 'Churn Rate', value: '3.2%', icon: Activity },
                { label: 'Stories/User/Month', value: '2.6', icon: BookOpen },
                { label: 'Net Promoter Score', value: '72', icon: TrendingUp },
              ].map((metric) => (
                <Card key={metric.label} className="border-stone-200">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100">
                      <metric.icon className="h-4 w-4 text-stone-600" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">{metric.label}</p>
                      <p className="text-lg font-bold text-stone-900">{metric.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ===== MODERATION TAB ===== */}
          <TabsContent value="moderation" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900">Content Moderation Queue</h2>
                <p className="text-sm text-stone-500">{moderationItems.length} stories pending review</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2 border-stone-200">
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>
            </div>

            {moderationItems.length === 0 ? (
              <Card className="border-stone-200">
                <CardContent className="flex flex-col items-center justify-center p-12">
                  <CheckCircle className="h-12 w-12 text-emerald-400 mb-3" />
                  <p className="text-lg font-semibold text-stone-700">All Clear!</p>
                  <p className="text-sm text-stone-500">No stories pending moderation.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {moderationItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-stone-200">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-stone-900 truncate">
                                {item.title}
                              </h3>
                              <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px] shrink-0">
                                {item.ageGroup}
                              </Badge>
                            </div>
                            <p className="text-sm text-stone-500">
                              by {item.author} &middot; {item.submittedAt}
                            </p>
                            <p className="mt-1 text-sm text-red-600">
                              ⚠️ {item.reason}
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleApprove(item.id)}
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleReject(item.id)}
                            >
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ===== AI MONITOR TAB ===== */}
          <TabsContent value="ai-monitor" className="space-y-6">
            <h2 className="text-lg font-bold text-stone-900">AI Cost & Performance Monitor</h2>

            {/* Cost Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-stone-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                      <DollarSign className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Total API Spend (Monthly)</p>
                      <p className="text-xl font-bold text-stone-900">$278.78</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-stone-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                      <Zap className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Total API Requests</p>
                      <p className="text-xl font-bold text-stone-900">63,600</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-stone-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                      <Brain className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Avg Tokens / Request</p>
                      <p className="text-xl font-bold text-stone-900">1,025</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Model Cost Table */}
            <Card className="border-stone-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-stone-900">Cost Per Model</CardTitle>
                <CardDescription>Breakdown of AI model usage and spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model</TableHead>
                        <TableHead>Cost / 1K Tokens</TableHead>
                        <TableHead>Requests</TableHead>
                        <TableHead>Total Cost</TableHead>
                        <TableHead>Avg Tokens</TableHead>
                        <TableHead>Usage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {aiCostData.map((row) => (
                        <TableRow key={row.model}>
                          <TableCell className="font-medium text-stone-900">{row.model}</TableCell>
                          <TableCell className="text-stone-600">${row.costPer1K}</TableCell>
                          <TableCell className="text-stone-600">{formatNumber(row.requests)}</TableCell>
                          <TableCell className="font-medium text-stone-900">
                            ${row.totalCost.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-stone-600">
                            {row.avgTokens > 0 ? row.avgTokens.toLocaleString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={(row.totalCost / 128) * 100}
                                className="h-2 w-20"
                              />
                              <span className="text-xs text-stone-500">
                                {((row.totalCost / 278.78) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="border-t border-stone-100 pt-4">
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <Clock className="h-3.5 w-3.5" />
                  Last updated: 2 minutes ago
                </div>
              </CardFooter>
            </Card>

            {/* Performance Metrics */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-stone-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-stone-900">API Latency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: 'Story Generation', value: '2.4s', progress: 48 },
                      { label: 'Illustration Generation', value: '8.1s', progress: 81 },
                      { label: 'TTS Narration', value: '1.2s', progress: 24 },
                      { label: 'Chat Completion', value: '0.8s', progress: 16 },
                    ].map((metric) => (
                      <div key={metric.label}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-stone-600">{metric.label}</span>
                          <span className="font-medium text-stone-900">{metric.value}</span>
                        </div>
                        <Progress value={100 - metric.progress} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-stone-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-stone-900">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: 'Story Generation', value: '98.5%', color: 'bg-emerald-500' },
                      { label: 'Illustration Generation', value: '94.2%', color: 'bg-amber-500' },
                      { label: 'TTS Narration', value: '99.1%', color: 'bg-emerald-500' },
                      { label: 'Chat Completion', value: '99.8%', color: 'bg-emerald-500' },
                    ].map((metric) => (
                      <div key={metric.label}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-stone-600">{metric.label}</span>
                          <span className="font-medium text-stone-900">{metric.value}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-stone-100">
                          <div
                            className={cn('h-full rounded-full', metric.color)}
                            style={{ width: metric.value }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
