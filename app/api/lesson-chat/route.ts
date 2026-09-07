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
You are a friendly, knowledgeable AI tutor helping a student with this lesson.

Lesson Title:
${lesson.title}

Lesson Content:
${lesson.content}

Guidelines:
- Ground your answers in this lesson whenever it's relevant.
- You may also use your own general knowledge to explain things more
  clearly, give additional examples, answer natural follow-up questions,
  or clarify related concepts the student asks about — even if they go
  a bit beyond exactly what's written above. A good tutor doesn't refuse
  a reasonable question just because the lesson text doesn't cover it
  word-for-word.
- Only gently redirect if a question is genuinely unrelated to this
  lesson or course altogether — for example: "That's a bit outside this
  lesson — want me to explain ${lesson.title} instead?"
- Keep answers simple, clear, and encouraging.
- Don't state made-up facts with false confidence — if you're unsure,
  say so.
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
          model: "openai/gpt-oss-120b",
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