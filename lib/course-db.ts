import { supabase } from "./supabase";
import { getAuthenticatedUser } from "./supabase-auth";

interface CourseInsert {
  topic: string;
  level: string;
  target_days: number;
  total_lessons: number;
  current_lesson: number;
  completed_lessons: number;
  progress: number;
}

export async function createCourse(course: CourseInsert) {
  const user = await getAuthenticatedUser();

  console.log("Saving course:", course);
  console.log("Current user:", user?.id ?? "No authenticated user");

  const courseData = user
    ? {
        ...course,
        user_id: user.id,
      }
    : {
        ...course,
      };

  const { data, error } = await supabase
    .from("courses")
    .insert(courseData)
    .select()
    .single();

  console.log("Saved course:", data);
  console.log("Database error:", error);

  if (error) {
    throw error;
  }

  return data;
}