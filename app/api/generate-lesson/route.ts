import { NextResponse } from "next/server";
import { askGroq } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { topic, title } = await req.json();

    const prompt = `
You are a world-class mentor known for the "Feynman Technique" — you have a gift for making even the most advanced and complex technical concepts feel simple, intuitive, and crystal clear without dumbing them down.

Course: ${topic}
Lesson Title: ${title}

YOUR TEACHING PHILOSOPHY:
- "If you can't explain it simply, you don't understand it well enough."
- Always start with an everyday real-world analogy before introducing technical terms.
- Use clean, approachable language. Demystify jargon the moment you introduce it.
- Keep the tone encouraging, engaging, and clear.

STRUCTURE TO FOLLOW (Use Markdown with ## headings):

## The Big Picture & Real-World Analogy
- Start with an intuitive story or everyday analogy (e.g., comparing databases to libraries, APIs to restaurant waiters, vector embeddings to organizing songs by mood).
- Explain WHY this concept exists and what problem it solves in simple terms.

## How It Works (Step-by-Step Breakdown)
- Break down the core mechanism into simple, logical steps (Step 1, Step 2, Step 3).
- Explain the key moving parts in plain English so the reader gets a clear mental picture.

## Simple, Clean Code Example
- Provide a clean, well-commented code snippet that illustrates the concept simply.
- Annotate each important line with simple comments explaining what it does.

## Real-World Use Case & What to Avoid
- Where is this actually used in modern apps?
- What is the #1 beginner mistake or trap, and how do you avoid it?

## Key Takeaways to Remember
- 3 to 4 clear, memorable summary bullet points that solidify understanding.

CRITICAL RULES:
- NO confusing academic jargon without immediate plain-English translation.
- NO trick questions or practice exercises.
- Avoid overwhelming walls of text — use short paragraphs, bullet points, and clean formatting.
- Target: 600 to 900 words of warm, engaging, high-clarity teaching.
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
