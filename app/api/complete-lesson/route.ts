import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
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

    const { lessonId } = await req.json();

    // Mark lesson complete
    const { data: lesson, error } = await supabase
      .from("lessons")
      .update({
        completed: true,
      })
      .eq("id", lessonId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    if (!lesson) throw new Error("Lesson not found.");

    // Count completed lessons
    const { count: completedCount } = await supabase
      .from("lessons")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("course_id", lesson.course_id)
      .eq("user_id", user.id)
      .eq("completed", true);

    // Get course details
    const { data: course } = await supabase
      .from("courses")
      .select(
        "id,total_lessons,streak,last_study_date,certificate_id"
      )
      .eq("id", lesson.course_id)
      .eq("user_id", user.id)
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
    // Update Course
    // ==========================

    const updates: {
      completed_lessons: number | null;
      progress: number;
      streak: number;
      last_study_date: string;
      completed_at?: string;
      certificate_id?: string | null;
    } = {
      completed_lessons: completedCount,
      progress,
      streak,
      last_study_date: today,
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

    await supabase
      .from("courses")
      .update(updates)
      .eq("id", lesson.course_id)
      .eq("user_id", user.id);

    // ==========================
    // Find next lesson
    // ==========================

    const { data: nextLesson } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", lesson.course_id)
      .eq("user_id", user.id)
      .eq("lesson_number", lesson.lesson_number + 1)
      .single();

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
