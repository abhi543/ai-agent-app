import { NextResponse } from "next/server";

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

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.5,
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json({
      explanation: data.choices[0].message.content,
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