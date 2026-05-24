import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// ============================================================
// Zod Validation Schemas
// ============================================================

const storyGenreEnum = z.enum([
  "ADVENTURE",
  "FANTASY",
  "FAIRY_TALE",
  "SCIENCE_FICTION",
  "MYSTERY",
  "EDUCATIONAL",
  "BEDTIME",
  "HUMOR",
  "FABLE",
  "MYTHOLOGY",
  "REALISTIC_FICTION",
  "HISTORICAL",
]);

const ageGroupEnum = z.enum([
  "TODDLER",
  "EARLY_CHILD",
  "CHILD",
  "TWEEN",
  "TEEN",
]);

const storyStatusEnum = z.enum([
  "DRAFT",
  "GENERATING",
  "REVIEW",
  "PUBLISHED",
  "ARCHIVED",
]);

const getStoriesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  genre: storyGenreEnum.optional(),
  ageGroup: ageGroupEnum.optional(),
  status: storyStatusEnum.optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "title", "viewCount", "likeCount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  authorId: z.string().optional(),
  workspaceId: z.string().optional(),
});

const createStorySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  ageGroup: ageGroupEnum,
  genre: storyGenreEnum,
  moral: z.string().optional(),
  educationalTopic: z.string().optional(),
  language: z.string().default("en"),
  readingTime: z.number().int().optional(),
  isPublic: z.boolean().default(false),
  authorId: z.string().min(1, "Author ID is required"),
  workspaceId: z.string().min(1, "Workspace ID is required"),
  promptUsed: z.string().optional(),
  generationConfig: z.string().optional(),
});

// ============================================================
// GET — List Stories with Pagination & Filtering
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const rawParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      rawParams[key] = value;
    });

    const params = getStoriesSchema.parse(rawParams);
    const { page, limit, genre, ageGroup, status, search, sortBy, sortOrder, authorId, workspaceId } = params;

    // Build where clause
    const where: Record<string, unknown> = {
      deletedAt: null, // Exclude soft-deleted
    };

    if (genre) where.genre = genre;
    if (ageGroup) where.ageGroup = ageGroup;
    if (status) where.status = status;
    if (authorId) where.authorId = authorId;
    if (workspaceId) where.workspaceId = workspaceId;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { moral: { contains: search } },
      ];
    }

    const [stories, total] = await Promise.all([
      db.story.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true, image: true, avatarUrl: true },
          },
          chapters: {
            where: { deletedAt: null },
            select: { id: true, title: true, chapterNumber: true },
            orderBy: { chapterNumber: "asc" },
          },
          _count: {
            select: { scenes: true, images: true, savedBy: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.story.count({ where }),
    ]);

    return NextResponse.json({
      stories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("[STORIES_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

// ============================================================
// POST — Create a New Story
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createStorySchema.parse(body);

    // Verify workspace exists
    const workspace = await db.workspace.findUnique({
      where: { id: data.workspaceId },
    });
    if (!workspace || workspace.deletedAt) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Verify author exists
    const author = await db.user.findUnique({
      where: { id: data.authorId },
    });
    if (!author || author.deletedAt) {
      return NextResponse.json(
        { error: "Author not found" },
        { status: 404 }
      );
    }

    const story = await db.story.create({
      data: {
        title: data.title,
        description: data.description,
        coverImageUrl: data.coverImageUrl || undefined,
        ageGroup: data.ageGroup,
        genre: data.genre,
        moral: data.moral,
        educationalTopic: data.educationalTopic,
        language: data.language,
        readingTime: data.readingTime,
        isPublic: data.isPublic,
        authorId: data.authorId,
        workspaceId: data.workspaceId,
        promptUsed: data.promptUsed,
        generationConfig: data.generationConfig,
        status: "DRAFT",
        moderationStatus: "PENDING",
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true, avatarUrl: true },
        },
        chapters: {
          where: { deletedAt: null },
          orderBy: { chapterNumber: "asc" },
        },
      },
    });

    return NextResponse.json({ story }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("[STORIES_POST]", error);
    return NextResponse.json(
      { error: "Failed to create story" },
      { status: 500 }
    );
  }
}
