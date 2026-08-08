import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { message, goal } = await request.json();

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
            role: "system",
            content: `You are an AI tutor.
The student's learning goal is "${goal}".

Teach step by step.
Never dump everything at once.
Ask questions after each explanation.
Keep responses under 150 words.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    }
  );

  const text = await response.text();
  console.log("Groq Response:", text);

  if (!response.ok) {
    return NextResponse.json(
      { error: text },
      { status: response.status }
    );
  }

  const data = JSON.parse(text);

  return NextResponse.json({
    reply: data.choices[0].message.content,
  });
}