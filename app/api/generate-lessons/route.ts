import { NextResponse } from "next/server";
import { askGroq, parseModelJson } from "@/lib/ai";

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

    const content = await askGroq([
      {
        role: "user",
        content: prompt,
      },
    ]);

    try {
      const parsed = parseModelJson(content);

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Parsed AI response is not an object.");
      }

      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error("Failed to parse AI completion as JSON:", parseError);
      console.error("Model response:", content.slice(0, 2000));

      return NextResponse.json(
        {
          error: "Failed to parse AI response as JSON",
          debug_snippet: content.slice(0, 512),
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
