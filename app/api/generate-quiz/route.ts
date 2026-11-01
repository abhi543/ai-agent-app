import { NextResponse } from "next/server";
import { askGroq, parseModelJson } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const {
      topic,
      lessonTitle,
      lessonContent,
      previousQuestions = [],
    } = await req.json();

    const prompt = `
You are a senior technical interviewer and engineering mentor.

Course:
${topic}

Lesson:
${lessonTitle}

Lesson Content:
${lessonContent}

Previously Asked Questions:
${previousQuestions.join("\n")}

Your mission:
Generate 3 REAL, PRACTICAL, SCENARIO-BASED multiple choice questions that test actual diagnostic and architectural understanding.

STRICT QUESTION GUIDELINES:
1. NO TRIVIAL / MEMORIZATION QUESTIONS:
   - NEVER ask definition questions like "What is X?", "What does Y stand for?", or "Which keyword defines Z?".
   - NEVER ask purely theoretical recall questions.
2. ASK REAL PRACTICAL QUESTIONS:
   - Ask "What happens if...", "Spot the bug/bottleneck in this scenario", "Which design/trade-off is best for this requirement?", or "What will be the output or behavior?".
   - Frame questions around real problems developers encounter in production or real-world usage.
3. FRESHNESS:
   - DO NOT repeat or rephrase any question from the "Previously Asked Questions" list.
   - Every generation must test different practical edge cases or mechanics.
4. QUALITY OPTIONS:
   - Provide 4 realistic, plausible options. Avoid obvious joke or throwaway options.
   - Only ONE option must be clearly correct based on best practices and real technical behavior.

Return ONLY valid JSON.

Format:
{
  "questions": [
    {
      "question": "Scenario/problem text...",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": 0
    }
  ]
}

Rules:
- Exactly 3 questions
- 4 options each
- Only ONE correct answer
- "answer" is the 0-based index of the correct option (0, 1, 2, or 3)
- JSON ONLY (no markdown fences, no surrounding commentary)
`;

    const content = await askGroq(
      [
        {
          role: "user",
          content: prompt,
        },
      ],
      {
        temperature: 0.85,
        top_p: 0.95,
      }
    );

    const quiz = parseModelJson(content);

    if (!quiz?.questions || !Array.isArray(quiz.questions)) {
      throw new Error("Invalid quiz format received from AI.");
    }

    return NextResponse.json(quiz);

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Quiz generation failed.",
      },
      {
        status: 500,
      }
    );
  }
}
