import { NextResponse } from "next/server";

// ============================================================
// Mock Admin Statistics Data
// ============================================================

const generateStats = () => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    totalUsers: 12847,
    totalStories: 45832,
    revenue: {
      monthly: 28450.0,
      growth: 12.3,
      currency: "USD",
    },
    activeSubscriptions: {
      total: 8921,
      byPlan: {
        FREE: 5234,
        PRO: 2103,
        FAMILY: 892,
        TEACHER: 542,
        ENTERPRISE: 150,
      },
    },
    recentSignups: {
      today: 47,
      thisWeek: 312,
      thisMonth: 1243,
      growth: 8.7,
    },
    storyGenres: {
      ADVENTURE: 8234,
      FANTASY: 7821,
      FAIRY_TALE: 6432,
      BEDTIME: 5923,
      EDUCATIONAL: 4876,
      SCIENCE_FICTION: 3654,
      MYSTERY: 3217,
      HUMOR: 2891,
      FABLE: 2456,
      MYTHOLOGY: 1987,
      REALISTIC_FICTION: 1543,
      HISTORICAL: 1098,
    },
    ageGroupDistribution: {
      TODDLER: 2341,
      EARLY_CHILD: 5678,
      CHILD: 8901,
      TWEEN: 4532,
      TEEN: 2123,
    },
    contentModeration: {
      pending: 23,
      approved: 4521,
      rejected: 12,
      flagged: 3,
    },
    aiUsage: {
      totalGenerations: 32156,
      totalTokens: 45892340,
      averageGenerationTime: 4.2,
      successRate: 97.8,
      costThisMonth: 1245.67,
    },
    topStories: [
      {
        id: "story_001",
        title: "The Enchanted Forest Adventure",
        views: 15234,
        likes: 3456,
        genre: "FANTASY",
      },
      {
        id: "story_002",
        title: "Captain Whiskers and the Moon Voyage",
        views: 12876,
        likes: 2987,
        genre: "ADVENTURE",
      },
      {
        id: "story_003",
        title: "The Sleepy Dragon's Lullaby",
        views: 11432,
        likes: 2654,
        genre: "BEDTIME",
      },
      {
        id: "story_004",
        title: "Professor Pineapple's Science Class",
        views: 9876,
        likes: 2123,
        genre: "EDUCATIONAL",
      },
      {
        id: "story_005",
        title: "The Mystery of the Missing Cookies",
        views: 8654,
        likes: 1987,
        genre: "MYSTERY",
      },
    ],
    platformHealth: {
      uptime: 99.97,
      averageResponseTime: 142,
      errorRate: 0.03,
      activeConnections: 342,
    },
    periods: {
      lastMonth: lastMonth.toISOString(),
      thisMonth: thisMonth.toISOString(),
      now: now.toISOString(),
    },
  };
};

// ============================================================
// GET — Admin Statistics
// ============================================================

export async function GET() {
  try {
    const stats = generateStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error("[ADMIN_STATS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
}
