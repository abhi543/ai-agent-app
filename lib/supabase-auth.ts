import { createBrowserClient } from "@supabase/ssr";

export const supabaseAuth = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function waitForInitialSession() {
  return new Promise<boolean>((resolve) => {
    let settled = false;
    let subscription:
      | ReturnType<
          typeof supabaseAuth.auth.onAuthStateChange
        >["data"]["subscription"]
      | null = null;

    const finish = (ready: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timeout);
      subscription?.unsubscribe();
      resolve(ready);
    };

    const timeout = window.setTimeout(() => {
      finish(false);
    }, 1500);

    const listener = supabaseAuth.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION") {
        finish(true);
      }
    });

    subscription = listener.data.subscription;
  });
}

export async function getAuthenticatedUser() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser();

    if (user) {
      return user;
    }

    if (userError && attempt === 4) {
      console.error(
        "Unable to resolve authenticated user:",
        userError
      );
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabaseAuth.auth.getSession();

    if (sessionError && attempt === 4) {
      console.error(
        "Unable to resolve authenticated session:",
        sessionError
      );
    }

    if (session?.user) {
      return session.user;
    }

    if (attempt === 0) {
      await waitForInitialSession();
    } else {
      await delay(250);
    }
  }

  return null;
}
