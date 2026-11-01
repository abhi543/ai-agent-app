import { NextResponse } from "next/server";
import { askGroq } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { topic, title } = await req.json();

    const prompt = `
You are an expert instructor and industry practitioner.

Course: ${topic}

Lesson: ${title}

Teach this lesson with practical depth and clarity.

Return ONLY plain text.

Structure:

# ${title}

Introduction

Detailed Explanation

Real-World Production Scenarios & Examples

Common Pitfalls & Edge Cases

Key Takeaways

IMPORTANT:
Do NOT include generic practice exercises, homework prompts, or fictional exercises.
Do NOT include any quiz or questions.
Do NOT include any answers.
The quiz will be generated separately.
Focus on actionable understanding, realistic mental models, production code/scenarios, and real-world trade-offs.

Keep the lesson between 500 and 800 words.
`;

    const content = await askGroq([
      {
        role: "user",
        content: prompt,
      },
    ]);

    return NextResponse.json({
      content,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to generate lesson." },
      { status: 500 }
    );
  }
}
