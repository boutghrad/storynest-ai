import { NextRequest, NextResponse } from "next/server";

// ============================================================
// Mock Notifications Data
// ============================================================

const generateNotifications = () => {
  const now = new Date();

  return [
    {
      id: "notif_001",
      title: "Story Ready! 🎉",
      message:
        'Your story "The Enchanted Forest Adventure" has been generated and is ready to read.',
      type: "STORY_READY",
      isRead: false,
      link: "/stories/story_001",
      createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), // 5 min ago
    },
    {
      id: "notif_002",
      title: "Welcome to StoryNest AI! ✨",
      message:
        "Your account is set up and ready. Create your first magical story now!",
      type: "INFO",
      isRead: false,
      link: "/create",
      createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 min ago
    },
    {
      id: "notif_003",
      title: "New Achievement Unlocked 🏆",
      message:
        "You've created your 5th story! You're on a roll, keep going!",
      type: "ACHIEVEMENT",
      isRead: false,
      link: "/profile",
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: "notif_004",
      title: "Subscription Updated",
      message:
        "Your Pro subscription has been renewed successfully. You have 50 story credits this month.",
      type: "SUBSCRIPTION",
      isRead: true,
      link: "/settings/subscription",
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      id: "notif_005",
      title: "Story Approved ✓",
      message:
        'Your story "Captain Whiskers and the Moon Voyage" has been approved and is now public.',
      type: "MODERATION",
      isRead: true,
      link: "/stories/story_002",
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
      id: "notif_006",
      title: "Classroom Invitation 📚",
      message:
        'Ms. Rodriguez has invited you to join "Reading Rockets" classroom.',
      type: "CLASSROOM_INVITE",
      isRead: false,
      link: "/classrooms/invite/clr_001",
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
      id: "notif_007",
      title: "Weekly Digest 📊",
      message:
        "Your stories were read 234 times this week! Your most popular story was 'The Sleepy Dragon's Lullaby'.",
      type: "INFO",
      isRead: true,
      link: "/analytics",
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    },
    {
      id: "notif_008",
      title: "Content Moderation Notice",
      message:
        'A story you reported has been reviewed and appropriate action has been taken.',
      type: "WARNING",
      isRead: true,
      link: "/moderation",
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    },
  ];
};

// ============================================================
// GET — Notifications List
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const type = searchParams.get("type");

    let notifications = generateNotifications();

    // Filter by read status
    if (unreadOnly) {
      notifications = notifications.filter((n) => !n.isRead);
    }

    // Filter by type
    if (type) {
      notifications = notifications.filter((n) => n.type === type);
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
