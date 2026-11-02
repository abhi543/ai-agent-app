import { NextResponse } from "next/server";
import { askGroq } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { topic, title } = await req.json();

    const prompt = `
You are a Principal Software Engineer and master technical instructor creating a world-class, deep-dive masterclass lesson.

Course: ${topic}
Lesson Title: ${title}

YOUR GOAL:
Write a comprehensive, exhaustive, and practically rich technical lesson on "${title}".
AVOID shallow, hand-waving explanations. Go deep into actual mechanics, architectural trade-offs, internal implementation details, and real code.

FORMATTING REQUIREMENTS:
- Use standard Markdown headings with descriptive, meaningful names:
  ## [Section Name]
- DO NOT use generic headings like "Key Idea" or "Section 1". Use real engineering titles like:
  ## Architecture & Internal Mechanics
  ## Step-by-Step Implementation & Working Code
  ## Deep Dive: Trade-offs, Performance & Scalability
  ## Production Pitfalls, Debugging & Edge Cases
  ## Key Engineering Takeaways
- When presenting comparison data or tables, format them cleanly with markdown tables or clear bulleted breakdowns.
- For code snippets, provide complete, realistic, syntactically correct code blocks with language tags (\`\`\`python, \`\`\`typescript, etc.) and explain what happens line-by-line.

CRITICAL RULES:
1. DEPTH: Provide thorough explanations of *why* things work, memory/CPU trade-offs, algorithms, and real failure modes.
2. NO GENERIC PRACTICE EXERCISES: Do NOT include sections called "Practice Exercise", "Homework", or "Exercises".
3. NO QUIZZES OR TEST QUESTIONS: Quizzes are generated dynamically in a separate step.
4. TARGET LENGTH: Comprehensive and detailed (1,000 to 1,600 words of rich content). Do not rush or provide brief summaries.
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
