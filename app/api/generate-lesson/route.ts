import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic, title, level, style } = await req.json();

    const levelGuidance =
      level === "Expert"
        ? "Assume strong prior knowledge — skip basic definitions, go straight into nuance, edge cases, and advanced technique."
        : level === "Intermediate"
        ? "Assume the learner knows the fundamentals already — briefly ground the topic, then focus most of the lesson on applying it."
        : "Assume the learner is new to this — explain foundational concepts clearly, with no unexplained jargon.";

    const styleGuidance =
      style === "Sprint"
        ? "Keep it tight and focused — the essential concept and one clear example, no extra tangents."
        : style === "Mastery"
        ? "Go deeper than usual — include nuance, common pitfalls, and more than one worked example."
        : "Keep a normal, steady pace with one solid explanation and a clear example.";

    const prompt = `
You are an expert teacher.

Course: ${topic}

Lesson: ${title}

Learner level: ${level || "Beginner"}
${levelGuidance}

Learning style: ${style || "Balanced"}
${styleGuidance}

Teach this lesson in a way that matches the learner's level and style above.

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
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();

      return NextResponse.json(
        { error },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      content: data.choices[0].message.content,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to generate lesson." },
      { status: 500 }
    );
  }
}