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
You are an expert technical examiner.

TASK:
Generate exactly 3 multiple-choice questions that TEST DIRECTLY ON THE LESSON CONTENT PROVIDED BELOW.

Course:
${topic}

Lesson Title:
${lessonTitle}

=== BEGIN LESSON CONTENT ===
${lessonContent}
=== END LESSON CONTENT ===

Previously Asked Questions:
${previousQuestions.join("\n")}

STRICT CONTENT-ALIGNMENT & QUESTION RULES:
1. CONTENT ACCURACY & ALIGNMENT (MOST IMPORTANT):
   - Every question MUST directly test a concept, code snippet, edge case, or rule that is EXPLICITLY explained in the "LESSON CONTENT" above.
   - Do NOT ask questions about unrelated topics or trivia not covered in this lesson.
   - The correct answer must be indisputably supported by the provided lesson content.
2. NO SHALLOW DEFINITIONS / MEMORIZATION:
   - Do not ask: "What is X?", "What does this acronym stand for?", or "Which keyword defines Y?".
   - Instead ask:
     * "Based on the lesson, what happens if [scenario from lesson]?"
     * "According to the explanation above, why does [pitfall] cause issues?"
     * "In the example shown, what is the expected output/behavior under [condition]?"
3. DIVERSITY & RETRY FRESHNESS:
   - Do NOT repeat or rephrase any question in the "Previously Asked Questions" list.
   - Test 3 distinct sections/concepts from the lesson content.
4. VALID OPTIONS:
   - Provide exactly 4 plausible, relevant options per question.
   - Exactly ONE option must be correct.
   - The 3 distractors must be realistic misconceptions or errors related to the lesson topic.

Return ONLY valid JSON in this exact structure:
{
  "questions": [
    {
      "question": "Clear scenario/question based on the lesson text...",
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
- Output pure JSON only without any markdown formatting or commentary.
`;

    const content = await askGroq(
      [
        {
          role: "user",
          content: prompt,
        },
      ],
      {
        temperature: 0.5,
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
