import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ============================================================
// Zod Validation Schemas
// ============================================================

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password too long"),
});

// ============================================================
// Mock User Data (Demo Simulation)
// ============================================================

const MOCK_USERS: Record<
  string,
  {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string | null;
    avatarUrl: string | null;
    subscription: string;
  }
> = {
  "parent@storynest.ai": {
    id: "usr_parent_001",
    name: "Sarah Johnson",
    email: "parent@storynest.ai",
    role: "USER",
    image: null,
    avatarUrl: null,
    subscription: "PRO",
  },
  "teacher@storynest.ai": {
    id: "usr_teacher_001",
    name: "Ms. Rodriguez",
    email: "teacher@storynest.ai",
    role: "TEACHER",
    image: null,
    avatarUrl: null,
    subscription: "TEACHER",
  },
  "admin@storynest.ai": {
    id: "usr_admin_001",
    name: "Admin User",
    email: "admin@storynest.ai",
    role: "ADMIN",
    image: null,
    avatarUrl: null,
    subscription: "ENTERPRISE",
  },
  "family@storynest.ai": {
    id: "usr_family_001",
    name: "The Williams Family",
    email: "family@storynest.ai",
    role: "USER",
    image: null,
    avatarUrl: null,
    subscription: "FAMILY",
  },
};

// ============================================================
// POST — Auth Routes (Action-based routing)
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = request.nextUrl;
    const action = searchParams.get("action") || "login";

    switch (action) {
      case "login":
        return handleLogin(body);
      case "signup":
        return handleSignup(body);
      case "logout":
        return handleLogout();
      default:
        return NextResponse.json(
          { error: `Unknown auth action: ${action}` },
          { status: 400 }
        );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// ============================================================
// Login Handler
// ============================================================

function handleLogin(body: unknown) {
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: result.error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  const { email, password } = result.data;

  // Demo: Accept any password with a known email, or any email with password "demo123"
  const mockUser = MOCK_USERS[email];
  const isDemoPassword = password === "demo123" || password === "password";

  if (!mockUser && !isDemoPassword) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Return user data (create a new mock user for unknown emails with demo password)
  const user = mockUser || {
    id: `usr_${Date.now()}`,
    name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    email,
    role: "USER",
    image: null,
    avatarUrl: null,
    subscription: "FREE",
  };

  // Set a mock session token
  const token = `sn_token_${Buffer.from(email).toString("base64")}_${Date.now()}`;

  return NextResponse.json({
    user,
    token,
    expiresIn: 86400, // 24 hours
  });
}

// ============================================================
// Signup Handler
// ============================================================

function handleSignup(body: unknown) {
  const result = signupSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: result.error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  const { name, email } = result.data;

  // Check if email already exists in mock data
  if (MOCK_USERS[email]) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  // Create a mock new user
  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email,
    role: "USER" as const,
    image: null,
    avatarUrl: null,
    subscription: "FREE",
    onboardingCompleted: false,
    onboardingStep: 0,
  };

  const token = `sn_token_${Buffer.from(email).toString("base64")}_${Date.now()}`;

  return NextResponse.json(
    {
      user: newUser,
      token,
      expiresIn: 86400,
    },
    { status: 201 }
  );
}

// ============================================================
// Logout Handler
// ============================================================

function handleLogout() {
  // In a real app, this would invalidate the session/token
  // For demo, just return success
  return NextResponse.json({
    message: "Logged out successfully",
  });
}
