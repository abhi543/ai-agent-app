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
