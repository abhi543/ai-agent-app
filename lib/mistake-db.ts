import { supabase } from "./supabase";
import { getAuthenticatedUser } from "./supabase-auth";

export interface MistakeRecord {
  id?: string;
  user_id?: string;
  course_id: string;
  lesson_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  user_answer: string;
  explanation: string;
  mastered?: boolean;
  created_at?: string;
}

const LOCAL_STORAGE_KEY = "edugpt_mistakes_cache";

function getLocalMistakes(): MistakeRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalMistake(mistake: MistakeRecord) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalMistakes();
    const itemWithId = {
      ...mistake,
      id: mistake.id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      created_at: mistake.created_at || new Date().toISOString(),
      mastered: false,
    };
    // Keep max 50 recent mistakes
    const updated = [itemWithId, ...existing.filter((m) => m.question !== mistake.question)].slice(0, 50);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to write mistake to localStorage:", err);
  }
}

export async function saveMistake(mistake: Omit<MistakeRecord, "id" | "user_id">) {
  // Always mirror in localStorage for immediate client feedback / offline resilience
  saveLocalMistake(mistake);

  const user = await getAuthenticatedUser();
  if (!user) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("mistakes")
      .insert({
        ...mistake,
        user_id: user.id,
        mastered: false,
      })
      .select()
      .single();

    if (error) {
      console.warn("Supabase mistake save failed (using local store):", error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn("Error inserting mistake into Supabase:", err);
    return null;
  }
}

export async function getMistakes(): Promise<MistakeRecord[]> {
  const localList = getLocalMistakes();
  const user = await getAuthenticatedUser();

  if (!user) {
    return localList;
  }

  try {
    const { data, error } = await supabase
      .from("mistakes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error || !data || data.length === 0) {
      return localList;
    }

    return data as MistakeRecord[];
  } catch {
    return localList;
  }
}

export async function markMistakeMastered(mistakeId: string): Promise<boolean> {
  // Update local storage
  if (typeof window !== "undefined") {
    try {
      const existing = getLocalMistakes();
      const updated = existing.map((m) =>
        m.id === mistakeId ? { ...m, mastered: true } : m
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  const user = await getAuthenticatedUser();
  if (!user) return true;

  try {
    const { error } = await supabase
      .from("mistakes")
      .update({ mastered: true })
      .eq("id", mistakeId)
      .eq("user_id", user.id);

    return !error;
  } catch {
    return false;
  }
}
