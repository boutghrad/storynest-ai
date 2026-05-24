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
// Helper: Robust JSON parsing from AI response
// Handles: code fences, truncated JSON, partial responses
// ============================================================

function parseAIJSON(text: string): Record<string, unknown> {
  // Step 1: Strip markdown code fences if present
  let cleaned = text.trim();
  
  // Remove opening code fence (```json or ```)
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "");
  // Remove closing code fence
  cleaned = cleaned.replace(/\n?\s*```\s*$/i, "");
  cleaned = cleaned.trim();

  // Step 2: Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue to more robust parsing
  }

  // Step 3: Extract JSON object using balanced brace counting
  const firstBrace = cleaned.indexOf("{");
  if (firstBrace === -1) {
    throw new Error("No JSON object found in AI response");
  }

  // Find the matching closing brace by counting depth
  let depth = 0;
  let lastValidEnd = -1;
  let inString = false;
  let escapeNext = false;

  for (let i = firstBrace; i < cleaned.length; i++) {
    const ch = cleaned[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (ch === "\\") {
      escapeNext = true;
      continue;
    }
    
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    
    if (inString) continue;
    
    if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        lastValidEnd = i;
        break;
      }
    }
  }

  if (lastValidEnd !== -1) {
    const jsonStr = cleaned.substring(firstBrace, lastValidEnd + 1);
    try {
      return JSON.parse(jsonStr);
    } catch {
      // Continue to fallback
    }
  }

  // Step 4: If JSON is truncated, try to repair it by closing open braces/brackets
  const partialJson = cleaned.substring(firstBrace);
  
  // Count unclosed braces and brackets
  let openBraces = 0;
  let openBrackets = 0;
  let inStr = false;
  let esc = false;
  
  for (let i = 0; i < partialJson.length; i++) {
    const ch = partialJson[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") openBraces++;
    if (ch === "}") openBraces--;
    if (ch === "[") openBrackets++;
    if (ch === "]") openBrackets--;
  }

  // Close any open string
  let repaired = partialJson;
  if (inStr) repaired += '"';
  
  // Remove trailing incomplete values (partial strings, incomplete keys)
  // Remove trailing comma and incomplete content after last complete value
  repaired = repaired.replace(/,\s*$/, "");
  
  // If we're in the middle of a value, try to close it
  // Remove incomplete key-value pairs at the end
  repaired = repaired.replace(/,\s*"[^"]*"?\s*:\s*$/, "");
  
  // Close open brackets and braces
  for (let i = 0; i < openBrackets; i++) repaired += "]";
  for (let i = 0; i < openBraces; i++) repaired += "}";

  try {
    return JSON.parse(repaired);
  } catch {
    // Final fallback: try regex extraction
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // Give up
      }
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}

// ============================================================
// Helper: Extract story content from raw AI text when JSON parsing fails
// ============================================================

function extractStoryFromRawText(rawText: string, body: GenerateStoryInput): Record<string, unknown> {
  // Try to extract the actual story content from the raw text
  // Remove code fences if present
  let content = rawText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  
  // Try to find the actual narrative content - look for chapter content
  // If the AI returned JSON-like text, try to extract useful parts
  const contentMatches = content.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/g);
  const titleMatch = content.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  const descriptionMatch = content.match(/"description"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  const moralMatch = content.match(/"moral"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  
  const extractedTitle = titleMatch ? titleMatch[1].replace(/\\"/g, '"') : body.title;
  const extractedDescription = descriptionMatch ? descriptionMatch[1].replace(/\\"/g, '"') : "An AI-generated children's story";
  const extractedMoral = moralMatch ? moralMatch[1].replace(/\\"/g, '"') : body.moral || "Kindness and courage can overcome any challenge.";
  
  // Extract narrative content from scenes
  const narrativeMatches = content.match(/"narrative"\s*:\s*"((?:[^"\\]|\\.)*)"/g);
  
  if (narrativeMatches && narrativeMatches.length > 0) {
    // Build chapters from extracted narratives
    const narratives = narrativeMatches.map((match) => {
      const text = match.replace(/^"narrative"\s*:\s*"/, "").replace(/"$/, "").replace(/\\"/g, '"');
      return text;
    });
    
    const chapterContent = narratives.join("\n\n");
    
    return {
      title: extractedTitle !== body.title ? extractedTitle : body.title,
      description: extractedDescription,
      moral: extractedMoral,
      chapters: [{
        chapterNumber: 1,
        title: extractedTitle || `The Story of ${body.title}`,
        content: chapterContent,
        scenes: narratives.map((narr, idx) => ({
          title: `Scene ${idx + 1}`,
          narrative: narr,
          dialogue: [],
          emotion: idx === 0 ? "wonder" : idx === narratives.length - 1 ? "happiness" : "curiosity",
          setting: "",
          ...(body.includeIllustrations ? {
            illustrationPrompt: `Children's book illustration, warm whimsical watercolor style: A scene from a children's story about ${body.title}. Age group: ${body.ageGroup}. Soft lighting, gentle colors.`
          } : {}),
        })),
      }],
    };
  }
  
  // If we have content matches from chapters, use those
  if (contentMatches && contentMatches.length > 0) {
    const chapterTexts = contentMatches.map((match) => {
      return match.replace(/^"content"\s*:\s*"/, "").replace(/"$/, "").replace(/\\"/g, '"');
    });
    
    const chapterContent = chapterTexts.join("\n\n");
    
    return {
      title: extractedTitle !== body.title ? extractedTitle : body.title,
      description: extractedDescription,
      moral: extractedMoral,
      chapters: [{
        chapterNumber: 1,
        title: extractedTitle || `The Story of ${body.title}`,
        content: chapterContent,
        scenes: [],
      }],
    };
  }
  
  // Last resort: use the raw text but clean it up
  // Remove JSON-like formatting to make it more readable
  const cleanText = content
    .replace(/^\s*\{[\s\S]*?\n\s*"title"/, "") // Remove JSON header
    .replace(/"[a-zA-Z]+"\s*:\s*/g, "") // Remove JSON keys
    .replace(/[\[\]{}"",:]/g, "") // Remove JSON punctuation
    .replace(/\n{3,}/g, "\n\n") // Clean up multiple newlines
    .trim();
  
  return {
    title: body.title,
    description: "An AI-generated children's story",
    moral: body.moral || "Kindness and courage can overcome any challenge.",
    chapters: [{
      chapterNumber: 1,
      title: `The Story of ${body.title}`,
      content: cleanText.slice(0, 5000) || "Once upon a time, a magical adventure began...",
      scenes: [],
    }],
  };
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

  const systemPrompt = `You are StoryNest AI, a world-class children's storyteller. You create age-appropriate, engaging, and magical stories for children.

You MUST respond with ONLY a valid JSON object. No markdown code fences, no extra text before or after the JSON.

The story should be written for children who are ${ageDescription}.
The genre is ${genreDescription}.
The story should be written in ${body.language === "en" ? "English" : body.language}.
${body.moral ? `The moral lesson should be: "${body.moral}"` : "Include an appropriate moral lesson."}
The story should have ${body.chapters} chapter(s).
${body.includeIllustrations ? "Include illustrationPrompt for each scene." : "No illustration prompts needed."}

Characters: ${characterDescriptions}`;

  const userPrompt = `Create a complete children's story titled "${body.title}". 

Respond with ONLY a JSON object (no markdown, no code fences). Format:

{
  "title": "${body.title}",
  "description": "Brief 1-2 sentence description",
  "ageGroup": "${body.ageGroup}",
  "genre": "${body.genre}",
  "language": "${body.language}",
  "moral": "The moral lesson",
  "readingTime": 5,
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Chapter title",
      "content": "Full chapter narrative text with dialogue and descriptions",
      "wordCount": 300,
      "readingTime": 60,
      "scenes": [
        {
          "title": "Scene title",
          "narrative": "Vivid descriptive narrative (100+ words)",
          "dialogue": [{"speaker": "Name", "line": "Speech"}],
          "emotion": "wonder",
          "setting": "Scene setting description",
          "illustrationPrompt": "${body.includeIllustrations ? "Children's book watercolor illustration prompt for this scene" : ""}"
        }
      ]
    }
  ],
  "characters": [
    {"name": "Name", "description": "Description", "type": "CHILD", "role": "PROTAGONIST"}
  ]
}

Make the story vivid, engaging, age-appropriate, and creative.`;

  // Generate the story with AI - use max_tokens to ensure complete response
  const storyResponse = await ai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 8000,
    temperature: 0.8,
  });

  // Parse the AI response
  let storyData: Record<string, unknown>;
  const responseText = extractAIContent(storyResponse);
  
  try {
    storyData = parseAIJSON(responseText);
  } catch (parseError) {
    console.error("[Story Generation] JSON parse failed, extracting from raw text:", parseError);
    // Smart extraction from raw text instead of just dumping it
    storyData = extractStoryFromRawText(responseText, body);
  }

  // Ensure we have chapters
  if (!Array.isArray(storyData.chapters) || storyData.chapters.length === 0) {
    // Try to build chapters from the content
    const content = (storyData.content as string) || (storyData.description as string) || "";
    storyData.chapters = [{
      chapterNumber: 1,
      title: (storyData.title as string) || body.title,
      content: content || "Once upon a time, a magical adventure began...",
      scenes: [],
    }];
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
      console.error("[Story Generation] Error:", errorMessage);
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
