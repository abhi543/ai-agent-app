import { supabase } from "./supabase";
import { getAuthenticatedUser } from "./supabase-auth";

interface LessonInsert {
  course_id: string;
  lesson_number: number;
  title: string;
  content: string;
  completed: boolean;
  stage: string;
}

export async function saveLessons(lessons: LessonInsert[]) {
  const user = await getAuthenticatedUser();

  console.log(
    "Saving lessons for user:",
    user?.id ?? "No authenticated user"
  );

  const lessonsWithUser = user
    ? lessons.map((lesson) => ({
        ...lesson,
        user_id: user.id,
      }))
    : lessons;

  const { data, error } = await supabase
    .from("lessons")
    .insert(lessonsWithUser);

  if (error) {
    console.error("Lesson save error:", error);
    throw error;
  }

  console.log("Lessons saved:", data);

  return data;
}