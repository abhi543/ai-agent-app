import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabaseClient = token
      ? createClient(supabaseUrl, supabaseAnonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          auth: { persistSession: false },
        })
      : createClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: false },
        });

    const { lessonId } = await req.json();

    // Type casting logic for lessonId (handles numeric/bigint primary keys)
    let parsedLessonId: any = lessonId;
    if (
      typeof lessonId === "string" &&
      !isNaN(Number(lessonId)) &&
      !lessonId.includes("-")
    ) {
      parsedLessonId = Number(lessonId);
    }

    // Mark lesson complete
    const { data: lesson, error } = await supabaseClient
      .from("lessons")
      .update({
        completed: true,
      })
      .eq("id", parsedLessonId)
      .select()
      .single();

    if (error) throw error;
    if (!lesson) throw new Error("Lesson not found.");

    // Count completed lessons
    const { count: completedCount } = await supabaseClient
      .from("lessons")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("course_id", lesson.course_id)
      .eq("completed", true);

    // Get course details
    const { data: course } = await supabaseClient
      .from("courses")
      .select(
        "id,total_lessons,streak,last_study_date,certificate_id"
      )
      .eq("id", lesson.course_id)
      .single();

    if (!course) throw new Error("Course not found.");

    // Calculate progress
    const progress = Math.round(
      ((completedCount || 0) / course.total_lessons) * 100
    );

    // ==========================
    // Learning Streak
    // ==========================

    const today = new Date().toISOString().split("T")[0];

    let streak = course.streak || 0;

    if (!course.last_study_date) {
      streak = 1;
    } else {
      const lastDate = new Date(course.last_study_date);
      const currentDate = new Date(today);

      const diff = Math.floor(
        (currentDate.getTime() - lastDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (diff === 0) {
        // already studied today
      } else if (diff === 1) {
        streak += 1;
      } else {
        streak = 1;
      }
    }

    // ==========================
    // Find next lesson
    // ==========================

    const { data: nextLesson } = await supabaseClient
      .from("lessons")
      .select("id, lesson_number")
      .eq("course_id", lesson.course_id)
      .eq("lesson_number", lesson.lesson_number + 1)
      .maybeSingle();

    // ==========================
    // Update Course
    // ==========================

    const updates: any = {
      completed_lessons: completedCount,
      progress,
      streak,
      last_study_date: today,
      current_lesson: nextLesson?.lesson_number ?? lesson.lesson_number,
    };

    let generatedCertificateId: string | null = course.certificate_id || null;

    // Generate certificate ONLY ONCE
    if (progress === 100 && !course.certificate_id) {
      updates.completed_at = new Date().toISOString();

      generatedCertificateId =
        "EDU-" +
        Math.random()
          .toString(36)
          .substring(2, 10)
          .toUpperCase();

      updates.certificate_id = generatedCertificateId;
    }

    await supabaseClient
      .from("courses")
      .update(updates)
      .eq("id", lesson.course_id);

    const isCourseComplete = progress === 100;

    return NextResponse.json({
      success: true,
      nextLessonId: nextLesson?.id || null,
      courseId: lesson.course_id,
      isCourseComplete,
      certificateId: generatedCertificateId,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Unable to complete lesson.",
      },
      {
        status: 500,
      }
    );
  }
}