import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// ============================================================
// Zod Validation Schema for PATCH
// ============================================================

const updateStorySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable().or(z.literal("")),
  ageGroup: z
    .enum(["TODDLER", "EARLY_CHILD", "CHILD", "TWEEN", "TEEN"])
    .optional(),
  genre: z
    .enum([
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
    ])
    .optional(),
  moral: z.string().optional().nullable(),
  educationalTopic: z.string().optional().nullable(),
  language: z.string().optional(),
  readingTime: z.number().int().optional().nullable(),
  status: z
    .enum(["DRAFT", "GENERATING", "REVIEW", "PUBLISHED", "ARCHIVED"])
    .optional(),
  isPublic: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  moderationStatus: z
    .enum(["PENDING", "APPROVED", "REJECTED", "FLAGGED"])
    .optional(),
  moderationNote: z.string().optional().nullable(),
  aiModel: z.string().optional().nullable(),
  promptUsed: z.string().optional().nullable(),
  generationConfig: z.string().optional().nullable(),
});

// ============================================================
// GET — Get Story with Chapters, Scenes, Characters
// ============================================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const story = await db.story.findUnique({
      where: { id, deletedAt: null },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            avatarUrl: true,
          },
        },
        chapters: {
          where: { deletedAt: null },
          include: {
            scenes: {
              where: { deletedAt: null },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { chapterNumber: "asc" },
        },
        scenes: {
          where: { deletedAt: null },
          orderBy: { sortOrder: "asc" },
        },
        images: {
          where: { deletedAt: null },
          orderBy: { sortOrder: "asc" },
        },
        narrations: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
        },
        savedBy: {
          select: {
            id: true,
            userId: true,
            isFavorite: true,
            rating: true,
            readProgress: true,
          },
        },
        _count: {
          select: {
            savedBy: true,
            analytics: true,
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    // Get characters through StoryCharacter join
    const storyCharacters = await db.storyCharacter.findMany({
      where: { storyId: id },
      include: {
        character: {
          select: {
            id: true,
            name: true,
            description: true,
            personality: true,
            appearance: true,
            voiceType: true,
            type: true,
            age: true,
            gender: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Increment view count
    await db.story.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({
      story: {
        ...story,
        characters: storyCharacters,
      },
    });
  } catch (error) {
    console.error("[STORY_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch story" },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH — Update Story
// ============================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateStorySchema.parse(body);

    // Check story exists and isn't soft-deleted
    const existing = await db.story.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    // Build update data, converting empty strings to null for nullable URL fields
    const updateData: Record<string, unknown> = { ...data };
    if (updateData.coverImageUrl === "") {
      updateData.coverImageUrl = null;
    }

    const story = await db.story.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ story });
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

    console.error("[STORY_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update story" },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE — Soft Delete Story
// ============================================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check story exists and isn't already soft-deleted
    const existing = await db.story.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting deletedAt
    await db.story.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      message: "Story deleted successfully",
      id,
    });
  } catch (error) {
    console.error("[STORY_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete story" },
      { status: 500 }
    );
  }
}
