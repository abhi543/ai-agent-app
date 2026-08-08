import { NextResponse } from "next/server";

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
          temperature: 1,
          top_p: 0.95,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;

    const normalizeJson = (text: string) => {
      if (!text) return text;
      return text
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
    };

    const parseJson = (text: string) => {
      try {
        return JSON.parse(text);
      } catch {
        const normalized = normalizeJson(text);

        try {
          return JSON.parse(normalized);
        } catch {
          const match = normalized.match(/(\{[\s\S]*\})/);

          if (match) {
            return JSON.parse(match[1]);
          }

          throw new Error("Invalid JSON");
        }
      }
    };

    const quiz = parseJson(rawContent);

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