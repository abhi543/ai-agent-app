import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

export const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabaseAuth.auth.getSession();

    if (sessionError) {
      console.error(
        "Unable to resolve authenticated user:",
        sessionError
      );
      return null;
    }

    if (session?.user) {
      return session.user;
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser();

    if (userError) {
      console.warn(
        "Unable to refresh authenticated user:",
        userError
      );
      return null;
    }

    return user ?? null;
  } catch (error) {
    console.error(
      "Unable to resolve authenticated user:",
      error
    );
    return null;
  }
}