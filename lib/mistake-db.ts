import { supabase } from "./supabase";
import { getAuthenticatedUser } from "./supabase-auth";

interface MistakeInsert {
  course_id: string;
  lesson_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  user_answer: string;
  explanation: string;
}

export async function saveMistake(mistake: MistakeInsert) {
  const user = await getAuthenticatedUser();

  if (!user) {
    console.warn("No authenticated user; skipping mistake save.");
    return null;
  }

  const { data, error } = await supabase
    .from("mistakes")
    .insert({
      ...mistake,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Mistake save error:", error);
    return null;
  }

  return data;
}
