import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { lessonId } = await req.json();

    // Mark lesson complete
    const { data: lesson, error } = await supabase
      .from("lessons")
      .update({
        completed: true,
      })
      .eq("id", lessonId)
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
      .eq("completed", true);

    // Get course details
    const { data: course } = await supabase
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

    const { data: nextLesson } = await supabase
      .from("lessons")
      .select("id, lesson_number")
      .eq("course_id", lesson.course_id)
      .eq("lesson_number", lesson.lesson_number + 1)
      .single();

    // ==========================
    // Update Course
    // ==========================

    const updates: any = {
      completed_lessons: completedCount,
      progress,
      streak,
      last_study_date: today,
      // Advance to the next lesson so the dashboard's "today's lesson"
      // actually moves forward instead of staying on lesson 1 forever.
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

    await supabase
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