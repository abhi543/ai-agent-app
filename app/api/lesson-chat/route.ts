import { NextResponse } from "next/server";
import { askGroq, type GroqMessage } from "@/lib/ai";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    console.info("[lesson-chat] Request received");

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
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

    // Get current lesson
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .eq("user_id", user.id)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: "Lesson not found." },
        { status: 404 }
      );
    }

    // Save user's message
    const { error: userMessageError } = await supabase.from("lesson_messages").insert({
      lesson_id: lessonId,
      user_id: user.id,
      role: "user",
      message,
    });

    if (userMessageError) {
      throw userMessageError;
    }

    // Load previous conversation
    const { data: history } = await supabase
      .from("lesson_messages")
      .select("role, message")
      .eq("lesson_id", lessonId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    // Keep only the latest 20 messages
    const recentHistory = (history || []).slice(-20);

    // Build conversation for Groq
    const messages: GroqMessage[] = [
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

    const reply = await askGroq(messages, {
      temperature: 0.5,
    });

    // Save AI reply
    const { error: assistantMessageError } = await supabase.from("lesson_messages").insert({
      lesson_id: lessonId,
      user_id: user.id,
      role: "assistant",
      message: reply,
    });

    if (assistantMessageError) {
      throw assistantMessageError;
    }

    console.info("[lesson-chat] Response generated");

    return NextResponse.json({
      reply,
    });

  } catch (err) {
    console.error("[lesson-chat] Failed to generate response", err);

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
