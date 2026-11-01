import { NextResponse } from "next/server";
import { askGroq } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { topic, title } = await req.json();

    const prompt = `
You are an expert instructor and senior technical mentor.

Course: ${topic}
Lesson: ${title}

Teach this lesson with clear technical depth, accurate real-world context, and clear explanations.

Return ONLY plain text.

Structure:

# ${title}

Introduction

Core Mechanism & Detailed Explanation

Production Examples & Practical Code

Common Traps, Pitfalls & Edge Cases

Key Technical Takeaways

CRITICAL RULES:
- Absolutely DO NOT include any section called "Practice Exercise", "Exercise", or "Homework".
- Absolutely DO NOT invent fake exercises or practice assignments.
- Do NOT include any quiz, questions, or answers (quizzes are generated separately).
- Provide concrete, accurate explanations and realistic code/scenarios so the student can be tested directly on the content taught here.

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
