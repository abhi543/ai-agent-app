import { supabase } from "./supabase";

export async function saveMessage(message: {
  course_id: string;
  lesson_number: number;
  role: string;
  message: string;
}) {
  const { data, error } = await supabase
    .from("messages")
    .insert(message)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getMessages(courseId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data;
}