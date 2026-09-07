import { NextResponse } from "next/server";
import { askGroq } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const {
      question,
      options,
      correctAnswer,
      userAnswer,
    } = await req.json();

    const prompt = `
You are a friendly AI teacher.

Explain why the student's answer is wrong.

Question:
${question}

Options:
${options.join("\n")}

Student selected:
${userAnswer}

Correct answer:
${correctAnswer}

Reply in this format:

Why your answer is incorrect:
...

Correct answer:
...

Simple explanation:
...

Real-world example:
...

Keep it under 200 words.
`;

    const explanation = await askGroq(
      [
        {
          role: "user",
          content: prompt,
        },
      ],
      {
        temperature: 0.5,
      }
    );

    return NextResponse.json({
      explanation,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Unable to generate explanation.",
      },
      {
        status: 500,
      }
    );
  }
}
