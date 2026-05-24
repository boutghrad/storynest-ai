import { NextRequest } from "next/server";
import { z } from "zod";
import ZAI from "z-ai-web-dev-sdk";

// ============================================================
// Zod Validation Schema
// ============================================================

const generateStorySchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  ageGroup: z.enum([
    "TODDLER",
    "EARLY_CHILD",
    "CHILD",
    "TWEEN",
    "TEEN",
  ]),
  genre: z.enum([
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
  ]),
  moral: z.string().optional(),
  characters: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        role: z
          .enum(["PROTAGONIST", "ANTAGONIST", "SUPPORTING", "MENTOR", "SIDEKICK"])
          .optional(),
      })
    )
    .optional(),
  language: z.string().default("en"),
  includeIllustrations: z.boolean().default(true),
  includeNarration: z.boolean().default(false),
  chapters: z.number().min(1).max(10).default(3),
  // If true, return JSON response instead of SSE stream
  mode: z.enum(["sse", "json"]).default("sse"),
});

type GenerateStoryInput = z.infer<typeof generateStorySchema>;

// ============================================================
// Age Group Descriptions for Prompts
// ============================================================

const AGE_GROUP_PROMPTS: Record<string, string> = {
  TODDLER:
    "2-4 years old. Use very simple words, short sentences (3-6 words), lots of repetition, vivid imagery, sound words (onomatopoeia), and gentle themes. No scary elements.",
  EARLY_CHILD:
    "4-6 years old. Use simple vocabulary, short paragraphs, repetition for rhythm, picture-heavy descriptions, and comforting themes. Minimal conflict.",
  CHILD:
    "6-8 years old. Use longer sentences, chapter-like sections, mild adventure, clear moral lessons, relatable characters, and engaging dialogue.",
  TWEEN:
    "8-12 years old. Use complex plots, character development, adventure, emotional depth, multiple story arcs, and sophisticated vocabulary.",
  TEEN:
    "12+ years old. Use sophisticated themes, deeper emotions, complex character relationships, moral ambiguity, and multi-arc narratives.",
};

const GENRE_PROMPTS: Record<string, string> = {
  ADVENTURE: "an exciting adventure with daring quests, exploration, and brave heroes",
  FANTASY: "a magical fantasy with mythical creatures, enchanted worlds, and wonder",
  FAIRY_TALE: "a classic fairy tale with modern twists, magic, and transformation",
  SCIENCE_FICTION: "a science fiction story with space, technology, and future worlds",
  MYSTERY: "a mystery with puzzles, clues, detective work, and surprising reveals",
  EDUCATIONAL: "an educational story that teaches science, history, or nature facts woven into the narrative",
  BEDTIME: "a calming bedtime story with gentle pacing, soothing imagery, and peaceful ending",
  HUMOR: "a funny, laugh-out-loud story with silly situations, wordplay, and comic mishaps",
  FABLE: "a fable with animal characters and a clear moral lesson, like Aesop's tales",
  MYTHOLOGY: "a mythological tale inspired by legends, gods, heroes, and epic journeys",
  REALISTIC_FICTION: "a realistic fiction story about everyday life, relationships, and growing up",
  HISTORICAL: "a historical fiction story set in a real time period with authentic details",
};

// ============================================================
// Helper: Extract text from ZAI SDK response
// ============================================================

function extractAIContent(response: unknown): string {
  if (typeof response === "string") return response;
  if (response && typeof response === "object" && "choices" in response) {
    const resp = response as { choices: Array<{ message: { content: string } }> };
    return resp.choices[0]?.message?.content || "";
  }
  return JSON.stringify(response);
}

// ============================================================
// Helper: Parse AI response JSON (strip code fences, extract JSON)
// ============================================================

function parseAIJSON(text: string): Record<string, unknown> {
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error("No JSON object found in AI response");
}

// ============================================================
// Helper: Enrich chapters with scenes from content
// ============================================================

function enrichChaptersWithScenes(
  chapters: unknown[],
  ageGroup: string,
  includeIllustrations: boolean
): Record<string, unknown>[] {
  const result: Record<string, unknown>[] = [];

  for (const chapter of chapters) {
    const ch = { ...(chapter as Record<string, unknown>) };

    if (Array.isArray(ch.scenes) && ch.scenes.length > 0) {
      // Scenes already exist - enrich illustration prompts if needed
      if (includeIllustrations) {
        ch.scenes = (ch.scenes as Record<string, unknown>[]).map((scene) => {
          if (!scene.illustrationPrompt && scene.setting) {
            scene.illustrationPrompt = `Children's book illustration, warm whimsical watercolor style: ${scene.setting}. Age group: ${ageGroup}. Soft lighting, gentle colors, magical atmosphere.`;
          }
          return scene;
        });
      }
      result.push(ch);
      continue;
    }

    // No scenes — create them from chapter content
    const content = typeof ch.content === "string" ? ch.content.trim() : "";
    if (content) {
      const paragraphs = content.split(/\n\n+/).filter((p: string) => p.trim().length > 20);
      ch.scenes = paragraphs.length > 0
        ? paragraphs.map((para: string, idx: number) => ({
            title: `${ch.title || "Chapter"} - Part ${idx + 1}`,
            narrative: para.trim(),
            dialogue: [],
            emotion: idx === 0 ? "wonder" : idx === paragraphs.length - 1 ? "happiness" : "curiosity",
            setting: "",
            ...(includeIllustrations ? {
              illustrationPrompt: `Children's book illustration, warm whimsical watercolor style: A scene from a children's story. Age group: ${ageGroup}. Soft lighting, gentle colors.`
            } : {}),
          }))
        : [{
            title: ch.title || "Chapter",
            narrative: content,
            dialogue: [],
            emotion: "wonder",
            setting: "",
            ...(includeIllustrations ? {
              illustrationPrompt: `Children's book illustration, warm whimsical watercolor style: A scene from a children's story. Age group: ${ageGroup}. Soft lighting, gentle colors.`
            } : {}),
          }];
    } else {
      // No content at all — the AI might have skipped this chapter
      ch.scenes = [{
        title: ch.title || "Chapter",
        narrative: "The adventure continues with wonder and excitement...",
        dialogue: [],
        emotion: "wonder",
        setting: "A magical place where anything can happen",
      }];
    }

    result.push(ch);
  }

  return result;
}

// ============================================================
// Core story generation logic (shared between SSE and JSON modes)
// ============================================================

async function generateStory(body: GenerateStoryInput): Promise<Record<string, unknown>> {
  // Create the AI client
  const ai = await ZAI.create();

  // Build prompts
  const ageDescription = AGE_GROUP_PROMPTS[body.ageGroup] || AGE_GROUP_PROMPTS.CHILD;
  const genreDescription = GENRE_PROMPTS[body.genre] || "an engaging story";
  const characterDescriptions = body.characters?.length
    ? body.characters
        .map((c) => `${c.name}${c.role ? ` (${c.role})` : ""}${c.description ? ` — ${c.description}` : ""}`)
        .join(", ")
    : "Create suitable characters for the story";

  const systemPrompt = `You are StoryNest AI, a world-class children's storyteller. You create age-appropriate, engaging, and magical stories for children. Your stories are creative, have vivid imagery, and always include a positive moral lesson.

You MUST respond with valid JSON only. No markdown, no code fences, no extra text.

The story should be written for children who are ${ageDescription}.
The genre is ${genreDescription}.
The story should be written in ${body.language === "en" ? "English" : body.language}.
${body.moral ? `The moral lesson should be: "${body.moral}"` : "Include an appropriate moral lesson."}
The story should have ${body.chapters} chapter(s).
${body.includeIllustrations ? "Include scene description prompts for illustrations." : "No illustration prompts needed."}

Characters: ${characterDescriptions}

IMPORTANT: Each chapter MUST have at least 2-3 scenes with:
- "narrative": A vivid, descriptive paragraph (at least 100 words)
- "dialogue": An array of objects with "speaker" and "line" fields
- "emotion": The primary emotion of the scene
- "setting": A brief description of the scene setting
- "illustrationPrompt": A detailed prompt for generating an illustration`;

  const userPrompt = `Create a complete children's story titled "${body.title}" with the following structure. Respond with ONLY a JSON object in this exact format:

{
  "title": "${body.title}",
  "description": "A brief 1-2 sentence description of the story",
  "ageGroup": "${body.ageGroup}",
  "genre": "${body.genre}",
  "language": "${body.language}",
  "moral": "The moral lesson of the story",
  "readingTime": <estimated reading time in minutes>,
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Creative chapter title",
      "content": "The full chapter text with dialogue, descriptions, and narrative...",
      "wordCount": <word count>,
      "readingTime": <reading time in seconds>,
      "scenes": [
        {
          "title": "Scene title",
          "narrative": "A vivid, descriptive narrative for this scene (at least 100 words)",
          "dialogue": [{"speaker": "Character Name", "line": "Dialogue text"}],
          "emotion": "primary emotion (wonder, excitement, curiosity, happiness, etc.)",
          "setting": "Scene setting description",
          "illustrationPrompt": "${body.includeIllustrations ? "Detailed prompt for generating a children's book illustration for this scene, in a warm, whimsical, watercolor style" : ""}"
        }
      ]
    }
  ],
  "characters": [
    {
      "name": "Character name",
      "description": "Character description",
      "type": "CHILD|ADULT|ANIMAL|MAGICAL_CREATURE|ROBOT|OTHER",
      "role": "PROTAGONIST|ANTAGONIST|SUPPORTING|MENTOR|SIDEKICK"
    }
  ]
}

Make the story vivid, engaging, and age-appropriate. Each scene should have unique and creative content. Use descriptive language that sparks imagination. Make each scene different and exciting.`;

  // Generate the story with AI
  const storyResponse = await ai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  // Parse the AI response
  let storyData: Record<string, unknown>;
  try {
    const responseText = extractAIContent(storyResponse);
    storyData = parseAIJSON(responseText);
  } catch {
    // If JSON parsing fails, construct a basic story from raw text
    const rawText = extractAIContent(storyResponse);
    storyData = {
      title: body.title,
      description: "An AI-generated children's story",
      chapters: [
        {
          chapterNumber: 1,
          title: `The Story of ${body.title}`,
          content: rawText.slice(0, 5000),
          scenes: [],
        },
      ],
    };
  }

  // Enrich chapters with scenes
  const rawChapters = Array.isArray(storyData.chapters) ? storyData.chapters : [];
  const enrichedChapters = enrichChaptersWithScenes(rawChapters, body.ageGroup, body.includeIllustrations);

  // Build the final story
  const moralLesson = (storyData.moral as string) || body.moral || "Kindness and courage can overcome any challenge.";

  const completeStory = {
    ...storyData,
    title: (storyData.title as string) || body.title,
    ageGroup: body.ageGroup,
    genre: body.genre,
    language: body.language,
    moral: moralLesson,
    includeIllustrations: body.includeIllustrations,
    includeNarration: body.includeNarration,
    chapters: enrichedChapters,
    status: "DRAFT",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return completeStory;
}

// ============================================================
// SSE Helper
// ============================================================

function createSSEMessage(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// ============================================================
// POST Handler — AI Story Generation (SSE or JSON mode)
// ============================================================

export async function POST(request: NextRequest) {
  // Validate request body
  let body: GenerateStoryInput;
  try {
    const raw = await request.json();
    body = generateStorySchema.parse(raw);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: error.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // JSON mode: return the complete story as a single JSON response
  if (body.mode === "json") {
    try {
      const story = await generateStory(body);
      return new Response(
        JSON.stringify({ success: true, story }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // SSE mode: stream progress events
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(createSSEMessage(event, data)));
      };

      const sendProgress = (step: string, progress: number, data?: unknown) => {
        sendEvent("progress", { step, progress, data });
      };

      try {
        sendProgress("Preparing story generation", 5, {
          message: "Setting up the AI storyteller...",
        });

        // Create AI client
        try {
          await ZAI.create();
        } catch {
          sendEvent("error", { error: "AI service is currently unavailable. Please try again later." });
          controller.close();
          return;
        }

        sendProgress("Planning your story", 15, {
          message: "Thinking about the perfect story for you...",
        });

        // Generate the story
        const story = await generateStory(body);

        sendProgress("Creating scene descriptions", 70, {
          message: "Crafting vivid scene descriptions...",
        });

        sendProgress("Adding finishing touches", 90, {
          message: "Almost done...",
        });

        // Send the complete story
        sendEvent("complete", {
          step: "Story generation complete",
          progress: 100,
          story,
        });

        controller.close();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        sendEvent("error", { error: errorMessage });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
