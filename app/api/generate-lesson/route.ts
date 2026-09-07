import { NextResponse } from "next/server";
import { askGroq } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { topic, title } = await req.json();

    const prompt = `
You are an expert teacher.

Course: ${topic}

Lesson: ${title}

Teach this lesson in a beginner-friendly way.

Return ONLY plain text.

Structure:

# ${title}

Structure:

Introduction

Detailed Explanation

Examples

Key Points

Practice Exercise

IMPORTANT:
Do NOT include any quiz.
Do NOT include any questions.
Do NOT include any answers.
The quiz will be generated separately.

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
