import { NextResponse } from "next/server";

function safeJsonParse(text: string) {
  const trimmed = typeof text === "string" ? text.trim() : "";

  // Quick try: direct JSON
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through to more robust extraction
  }

  // Remove common code fences and markdown wrappers
  let cleaned = trimmed.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, "$1");
  cleaned = cleaned.replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ""));

  // Remove leading text like "Here's the JSON:" or similar
  const startIdx = cleaned.search(/[\[{]/);
  if (startIdx !== -1) cleaned = cleaned.slice(startIdx);

  // Attempt to find the largest balanced JSON object/array in the string.
  const candidates: string[] = [];
  for (const open of ["{", "["]) {
    let stack: string[] = [];
    let start = -1;
    for (let i = 0; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (ch === open && stack.length === 0) start = i;
      if (ch === "{" || ch === "[") stack.push(ch);
      else if (ch === "}") {
        if (stack[stack.length - 1] === "{") stack.pop();
        else stack = [];
      } else if (ch === "]") {
        if (stack[stack.length - 1] === "[") stack.pop();
        else stack = [];
      }

      if (stack.length === 0 && start !== -1) {
        const candidate = cleaned.slice(start, i + 1);
        candidates.push(candidate);
        start = -1;
      }
    }
  }

  // Try parsing candidates, prefer the largest one
  candidates.sort((a, b) => b.length - a.length);
  for (const c of candidates) {
    try {
      return JSON.parse(c);
    } catch {
      // ignore
    }
  }

  // Fallback: try to extract a bare JSON-like substring via regex
  const jsonishMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonishMatch) {
    try {
      return JSON.parse(jsonishMatch[0]);
    } catch {
      // fall through
    }
  }

  // If all else fails, throw a SyntaxError similar to JSON.parse
  throw new SyntaxError("Unable to parse JSON from provided text");
}

export async function POST(req: Request) {
  try {
    const { topic, days } = await req.json();

    const prompt = `
You are an expert course creator.

Create a ${days}-day learning roadmap for "${topic}".

Return ONLY valid JSON.

Format:

{
  "lessons": [
    {
      "lesson_number": 1,
      "title": "Lesson title"
    }
  ]
}

Rules:
- Exactly ${days} lessons
- Each lesson should build on the previous one
- No explanations
- No markdown
- JSON only
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lesson generation API returned an error:", response.status, errorText);
      return NextResponse.json(
        { error: `Lesson generation service error: ${response.status}` },
        { status: response.status }
      );
    }

    // Read raw text from upstream API and attempt robust parsing.
    const raw = await response.text();

    // Try to parse the raw body as JSON (the usual case).
    let data:
      | {
          choices?: Array<{
            message?: {
              content?: string;
            };
          }>;
        }
      | undefined;
    try {
      data = JSON.parse(raw) as {
        choices?: Array<{
          message?: {
            content?: string;
          };
        }>;
      };
    } catch {
      data = undefined;
    }

    // Extract the model's textual content if present, otherwise fall back to raw text.
    let content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      // Try to extract a JSON string stored in a "content" property inside the raw text.
      const matchContent = raw.match(/"content"\s*:\s*"([\s\S]*?)"/);
      if (matchContent) {
        // Unescape any escaped quotes inside the captured content.
        content = matchContent[1].replace(/\\"/g, '"');
      } else {
        // No explicit content field — use the entire raw body as the candidate.
        content = raw;
      }
    }

    // Attempt to parse JSON from the model's content (or from the raw body).
    try {
      const parsed = safeJsonParse(content);

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Parsed AI response is not an object.");
      }

      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error("Failed to parse AI completion as JSON:", parseError);
      console.error("Raw upstream response (truncated):", raw.slice(0, 2000));

      return NextResponse.json(
        {
          error: "Failed to parse AI response as JSON",
          debug_snippet: (raw || "").slice(0, 512),
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to generate lessons" },
      { status: 500 }
    );
  }
}