import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Missing authentication token." },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: { persistSession: false },
    });

    // Verify token and get user context
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid token." },
        { status: 401 }
      );
    }

    const { lessonId, message } = await req.json();

    if (!lessonId || !message) {
      return NextResponse.json(
        { error: "Missing lessonId or message." },
        { status: 400 }
      );
    }

    // Type casting logic for lessonId (handles numeric/bigint primary keys)
    let parsedLessonId: any = lessonId;
    if (
      typeof lessonId === "string" &&
      !isNaN(Number(lessonId)) &&
      !lessonId.includes("-")
    ) {
      parsedLessonId = Number(lessonId);
    }

    // Get current lesson
    const { data: lesson, error: lessonError } = await supabaseClient
      .from("lessons")
      .select("*")
      .eq("id", parsedLessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: "Lesson not found." },
        { status: 404 }
      );
    }

    // Save user's message
    await supabaseClient.from("lesson_messages").insert({
      lesson_id: parsedLessonId,
      role: "user",
      message,
      user_id: user.id, // Explicitly associate with the authenticated user
    });

    // Load previous conversation
    const { data: history } = await supabaseClient
      .from("lesson_messages")
      .select("role, message")
      .eq("lesson_id", parsedLessonId)
      .eq("user_id", user.id) // Filter by user_id for isolation
      .order("created_at", { ascending: true });

    // Keep only the latest 20 messages
    const recentHistory = (history || []).slice(-20);

    // Build conversation for Groq
    const messages: Array<{ role: string; content: string }> = [
      {
        role: "system",
        content: `
You are an expert AI teacher.

You MUST answer ONLY using the lesson below.

Lesson Title:
${lesson.title}

Lesson Content:
${lesson.content}

If the lesson does not contain the answer, say:

"I don't think this lesson covers that yet."

Never invent information.
Always explain simply.
`,
      },
    ];

    // Add previous conversation
    recentHistory.forEach((msg) => {
      messages.push({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.message,
      });
    });

    // Call Groq
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
          temperature: 0.5,
          messages,
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

    const reply = data.choices[0].message.content;

    // Save AI reply
    await supabaseClient.from("lesson_messages").insert({
      lesson_id: parsedLessonId,
      role: "assistant",
      message: reply,
      user_id: user.id, // Explicitly associate with the authenticated user
    });

    return NextResponse.json({
      reply,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Failed to generate response.",
      },
      {
        status: 500,
      }
    );
  }
}