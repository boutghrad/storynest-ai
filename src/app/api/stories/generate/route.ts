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
// SSE Helper
// ============================================================

function createSSEMessage(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// ============================================================
// POST Handler — AI Story Generation with SSE
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

  // Create the AI client
  let ai: ZAI;
  try {
    ai = await ZAI.create();
  } catch {
    return new Response(
      JSON.stringify({ error: "AI service unavailable" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  // Build the story generation prompt
  const ageDescription = AGE_GROUP_PROMPTS[body.ageGroup] || AGE_GROUP_PROMPTS.CHILD;
  const genreDescription = GENRE_PROMPTS[body.genre] || "an engaging story";
  const characterDescriptions = body.characters?.length
    ? body.characters
        .map(
          (c) =>
            `${c.name}${c.role ? ` (${c.role})` : ""}${c.description ? ` — ${c.description}` : ""}`
        )
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

Characters: ${characterDescriptions}`;

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
      "title": "Chapter title",
      "content": "The full chapter text with dialogue, descriptions, and narrative...",
      "wordCount": <word count>,
      "readingTime": <reading time in seconds>,
      "scenes": [
        {
          "title": "Scene title",
          "narrative": "The narrative text for this scene",
          "dialogue": "[{\\"speaker\\": \\"Character Name\\", \\"line\\": \\"Dialogue text\\"}]",
          "emotion": "primary emotion",
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

Make the story vivid, engaging, and age-appropriate. Use descriptive language that sparks imagination.`;

  // Set up SSE stream
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
        // Step 1: Planning story structure
        sendProgress("Planning story structure", 10, {
          message: "Analyzing your story parameters...",
        });

        const planningResponse = await ai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `You are a children's story planner. Create a brief story outline. Respond with ONLY valid JSON: { "outline": "brief 2-3 sentence outline", "themes": ["theme1", "theme2"], "keyMoments": ["moment1", "moment2", "moment3"] }`,
            },
            {
              role: "user",
              content: `Plan a ${body.ageGroup} ${body.genre} story titled "${body.title}" with ${body.chapters} chapters. ${body.moral ? `Moral: ${body.moral}` : ""}`,
            },
          ],
        });

        let planData: Record<string, unknown> = {};
        try {
          // Extract content from SDK response (format: {choices: [{message: {content: "..."}}]})
          let planText: string;
          if (typeof planningResponse === "string") {
            planText = planningResponse;
          } else if (planningResponse && typeof planningResponse === "object" && "choices" in planningResponse) {
            planText = (planningResponse as { choices: Array<{ message: { content: string } }> }).choices[0]?.message?.content || "";
          } else {
            planText = JSON.stringify(planningResponse);
          }
          // Strip markdown code fences if present (```json ... ```)
          planText = planText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
          const planMatch = planText.match(/\{[\s\S]*\}/);
          if (planMatch) {
            planData = JSON.parse(planMatch[0]);
          }
        } catch {
          planData = { outline: "Story planning complete" };
        }

        sendProgress("Planning story structure", 20, {
          message: "Story structure planned!",
          plan: planData,
        });

        // Step 2: Generating chapters
        sendProgress("Generating chapters", 30, {
          message: `Writing ${body.chapters} chapter(s)...`,
        });

        const storyResponse = await ai.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        sendProgress("Generating chapters", 60, {
          message: "Chapters written!",
        });

        // Parse the AI response
        let storyData: Record<string, unknown> = {};
        try {
          // Extract content from SDK response (format: {choices: [{message: {content: "..."}}]})
          let responseText: string;
          if (typeof storyResponse === "string") {
            responseText = storyResponse;
          } else if (storyResponse && typeof storyResponse === "object" && "choices" in storyResponse) {
            responseText = (storyResponse as { choices: Array<{ message: { content: string } }> }).choices[0]?.message?.content || "";
          } else {
            responseText = JSON.stringify(storyResponse);
          }
          // Try to extract JSON from the response
          // Strip markdown code fences if present (```json ... ```)
          responseText = responseText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            storyData = JSON.parse(jsonMatch[0]);
          } else {
            // Fallback: construct a basic story object from raw text
            storyData = {
              title: body.title,
              description: "An AI-generated children's story",
              chapters: [
                {
                  chapterNumber: 1,
                  title: "Chapter 1",
                  content: responseText.slice(0, 3000),
                  scenes: [],
                },
              ],
            };
          }
        } catch {
          storyData = {
            title: body.title,
            description: "An AI-generated children's story",
            chapters: [],
          };
        }

        sendProgress("Creating scene descriptions", 70, {
          message: "Crafting vivid scene descriptions...",
        });

        // Step 3: Scene descriptions (enrich if needed — create scenes from chapter content when missing)
        const chapters = Array.isArray(storyData.chapters)
          ? storyData.chapters
          : [];
        for (const chapter of chapters) {
          const ch = chapter as Record<string, unknown> & {
            scenes?: Array<Record<string, unknown>>;
            content?: string;
            title?: string;
          };
          if (Array.isArray(ch.scenes) && ch.scenes.length > 0) {
            continue; // Scenes already exist from the main generation
          }
          // No scenes — create them from chapter content
          if (ch.content && typeof ch.content === "string" && ch.content.trim()) {
            // Split content into paragraphs for scenes
            const paragraphs = ch.content.split(/\n\n+/).filter((p: string) => p.trim().length > 20);
            ch.scenes = paragraphs.length > 0
              ? paragraphs.map((para: string, idx: number) => ({
                  title: `${ch.title || "Chapter"} - Part ${idx + 1}`,
                  narrative: para.trim(),
                  dialogue: [],
                  emotion: "wonder",
                  setting: "",
                }))
              : [{
                  title: ch.title || "Chapter",
                  narrative: ch.content.trim(),
                  dialogue: [],
                  emotion: "wonder",
                  setting: "",
                }];
          } else {
            // No content at all, add a placeholder scene
            ch.scenes = [{
              title: ch.title || "Chapter",
              narrative: "The story unfolds...",
              dialogue: [],
              emotion: "wonder",
              setting: "",
            }];
          }
        }

        sendProgress("Creating scene descriptions", 75, {
          message: "Scene descriptions ready!",
        });

        // Step 4: Generating illustration prompts
        if (body.includeIllustrations) {
          sendProgress("Generating illustration prompts", 80, {
            message: "Creating magical illustration prompts...",
          });

          // Enrich illustration prompts if they're empty
          for (const chapter of chapters) {
            const ch = chapter as Record<string, unknown> & {
              scenes?: Array<Record<string, unknown>>;
            };
            if (Array.isArray(ch.scenes)) {
              for (const scene of ch.scenes) {
                if (!scene.illustrationPrompt && scene.setting) {
                  scene.illustrationPrompt = `Children's book illustration, warm whimsical watercolor style: ${scene.setting}. Age group: ${body.ageGroup}. Soft lighting, gentle colors, magical atmosphere.`;
                }
              }
            }
          }

          sendProgress("Generating illustration prompts", 90, {
            message: "Illustration prompts created!",
          });
        } else {
          sendProgress("Generating illustration prompts", 90, {
            message: "Skipped (illustrations not requested)",
          });
        }

        // Step 5: Creating moral lesson
        sendProgress("Creating moral lesson", 92, {
          message: "Weaving in the moral lesson...",
        });

        const moralLesson =
          (storyData.moral as string) ||
          body.moral ||
          "Kindness and courage can overcome any challenge.";

        sendProgress("Creating moral lesson", 95, {
          message: "Moral lesson integrated!",
        });

        // Final: Send the complete story
        const completeStory = {
          ...storyData,
          title: (storyData.title as string) || body.title,
          ageGroup: body.ageGroup,
          genre: body.genre,
          language: body.language,
          moral: moralLesson,
          includeIllustrations: body.includeIllustrations,
          includeNarration: body.includeNarration,
          status: "DRAFT",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        sendEvent("complete", {
          step: "Story generation complete",
          progress: 100,
          story: completeStory,
        });

        controller.close();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";

        sendEvent("error", {
          step: "Error",
          progress: 0,
          error: errorMessage,
        });

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
