import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import ZAI from "z-ai-web-dev-sdk";

// ============================================================
// Zod Validation Schema
// ============================================================

const illustrationSizeEnum = z.enum([
  "1024x1024",
  "768x1344",
  "864x1152",
  "1344x768",
  "1152x864",
  "1440x720",
  "720x1440",
]);

const generateIllustrationSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt is required")
    .max(2000, "Prompt too long"),
  style: z
    .enum([
      "watercolor",
      "cartoon",
      "pixel_art",
      "anime",
      "realistic",
      "storybook",
      "whimsical",
      "minimalist",
    ])
    .default("watercolor"),
  width: z.number().int().min(256).max(2048).default(1024),
  height: z.number().int().min(256).max(2048).default(1024),
});

// ============================================================
// Style Prompt Modifiers
// ============================================================

const STYLE_MODIFIERS: Record<string, string> = {
  watercolor:
    "in a soft, warm watercolor illustration style, gentle color washes, dreamy atmosphere, children's book aesthetic",
  cartoon:
    "in a bright, colorful cartoon illustration style, bold outlines, expressive characters, fun and playful",
  pixel_art:
    "in a charming pixel art style, retro video game aesthetic, limited color palette, nostalgic",
  anime:
    "in a beautiful anime illustration style, detailed backgrounds, expressive eyes, vibrant colors",
  realistic:
    "in a realistic, detailed illustration style, natural lighting, photographic quality, lifelike",
  storybook:
    "in a classic children's storybook illustration style, warm and inviting, detailed but accessible, magical atmosphere",
  whimsical:
    "in a whimsical, fantastical illustration style, surreal elements, playful proportions, enchanting colors",
  minimalist:
    "in a clean, minimalist illustration style, simple shapes, limited color palette, modern and elegant",
};

// ============================================================
// Size Mapping to Available API Sizes
// ============================================================

function mapToApiSize(
  width: number,
  height: number
): z.infer<typeof illustrationSizeEnum> {
  const ratio = width / height;

  if (ratio > 1.8) return "1440x720";
  if (ratio > 1.3) return "1344x768";
  if (ratio > 1.05) return "1152x864";
  if (ratio > 0.95) return "1024x1024";
  if (ratio > 0.75) return "864x1152";
  if (ratio > 0.55) return "768x1344";
  return "720x1440";
}

// ============================================================
// POST — Generate AI Illustration
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = generateIllustrationSchema.parse(body);

    // Create AI client
    let ai: ZAI;
    try {
      ai = await ZAI.create();
    } catch {
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 503 }
      );
    }

    // Enhance prompt with style modifier
    const styleModifier =
      STYLE_MODIFIERS[data.style] || STYLE_MODIFIERS.watercolor;
    const enhancedPrompt = `${data.prompt}, ${styleModifier}. Safe for children, no scary or inappropriate content.`;

    // Map dimensions to closest available API size
    const apiSize = mapToApiSize(data.width, data.height);

    // Generate image
    const response = await ai.images.generations.create({
      prompt: enhancedPrompt,
      size: apiSize,
    });

    // Extract base64 image data
    const imageData = response.data?.[0]?.base64;

    if (!imageData) {
      return NextResponse.json(
        { error: "Failed to generate illustration" },
        { status: 500 }
      );
    }

    // Parse the selected size to get actual dimensions
    const [actualWidth, actualHeight] = apiSize
      .split("x")
      .map(Number);

    return NextResponse.json({
      image: {
        base64: imageData,
        width: actualWidth,
        height: actualHeight,
        prompt: enhancedPrompt,
        style: data.style,
        size: apiSize,
      },
    });
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

    console.error("[ILLUSTRATION_GENERATE]", error);
    return NextResponse.json(
      { error: "Failed to generate illustration" },
      { status: 500 }
    );
  }
}
