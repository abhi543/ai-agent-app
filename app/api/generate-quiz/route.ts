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
You are an expert teacher.
DO NOT generate any question that appears in the "Previously Asked Questions" list.

Every retry must contain completely different questions.
Course:
${topic}

Lesson:
${lessonTitle}

Lesson Content:
${lessonContent}
Previously Asked Questions:

${previousQuestions.join("\n")}

Your task is to generate a BRAND NEW quiz every time.

VERY IMPORTANT RULES:

- NEVER repeat previous questions.
- Every API call MUST produce different questions.
- Ask about different concepts from the lesson.
- Change wording completely.
- Use different examples.
- Mix difficulty (easy, medium, hard).
- Avoid asking the same fact twice.
- Questions should test understanding, not memorization.

Return ONLY valid JSON.

Format:

{
  "questions":[
    {
      "question":"Question text",
      "options":[
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer":1
    }
  ]
}

Rules:

- Exactly 3 questions
- 4 options each
- Only ONE correct answer
- answer is the correct option index (0-3)
- JSON ONLY
`;

    const content = await askGroq(
      [
        {
          role: "user",
          content: prompt,
        },
      ],
      {
        temperature: 1,
        top_p: 0.95,
      }
    );

    const quiz = parseModelJson(content);

    if (!quiz?.questions || !Array.isArray(quiz.questions)) {
      throw new Error("Invalid quiz.");
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
