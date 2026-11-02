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
You are an encouraging, friendly teacher testing a student on what they just learned.

GOAL:
Generate exactly 3 clear, accessible, confidence-building multiple choice questions that verify the student understood the core ideas taught in this lesson.

Course:
${topic}

Lesson Title:
${lessonTitle}

=== LESSON CONTENT TO BASE QUESTIONS ON ===
${lessonContent}
=== END LESSON CONTENT ===

Previously Asked Questions:
${previousQuestions.join("\n")}

STRICT GUIDELINES:
1. TEST UNDERSTANDING, NOT MEMORIZATION OR OBSCURE DETAILS:
   - Ask about the main concepts, real-world analogies, or core principles taught in the text above.
   - Example style: "In the analogy of [concept], why is X preferred over Y?" or "What is the primary benefit of using [concept] according to the lesson?"
   - DO NOT write tricky, punitive, or confusing questions with double negatives.
2. CLEAR & DISTINCT OPTIONS:
   - Provide 4 options that are easy to read and understand.
   - Only ONE option should be clearly correct according to the lesson.
   - The other 3 options should represent common misunderstandings or clearly incorrect ideas (not tricky borderline choices).
3. FRESHNESS:
   - Do not repeat previous questions.
4. TONE:
   - Warm, clear, and focused on reinforcing learning so the student feels capable and motivated.

Return ONLY valid JSON in this exact structure:
{
  "questions": [
    {
      "question": "Clear, friendly question asking about a key takeaway from the lesson...",
      "options": [
        "Plausible Option A",
        "Plausible Option B",
        "Plausible Option C",
        "Plausible Option D"
      ],
      "answer": 0
    }
  ]
}

Rules:
- Exactly 3 questions
- 4 options each
- "answer" is the 0-based integer index of the correct option (0, 1, 2, or 3)
- JSON ONLY (no markdown fences, no extra text)
`;

    const content = await askGroq(
      [
        {
          role: "user",
          content: prompt,
        },
      ],
      {
        temperature: 0.4,
        top_p: 0.9,
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
