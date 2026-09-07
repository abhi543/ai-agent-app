"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseAuth } from "@/lib/supabase-auth";

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goal = searchParams.get("goal");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabaseAuth.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.push(
        goal
          ? `/auth/check-email?goal=${encodeURIComponent(goal)}`
          : "/auth/check-email"
      );
    } catch (error) {
      console.error("Signup error:", error);

      setErrorMessage(
        "Something went wrong while creating your account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#070A12] text-white">

      {/* Ambient background */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <motion.div
          animate={{
            x: [0, 70, -20, 0],
            y: [0, -30, 40, 0],
            scale: [1, 1.08, 0.96, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -20, 0],
            scale: [1, 0.94, 1.06, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-32 bottom-10 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[130px]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,10,18,0.8)_78%)]" />

      </div>

      {/* Top navigation */}

      <header className="relative z-10 border-b border-white/[0.06] bg-[#070A12]/70 backdrop-blur-xl">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

          <Link
            href="/"
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">

              <Image
                src="/logo.svg"
                alt="EduGPT"
                width={30}
                height={30}
                priority
              />

            </div>

            <div>
              <p className="text-lg font-bold tracking-tight">
                EduGPT
              </p>

              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                AI Learning
              </p>
            </div>

          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft size={16} />
            Back
          </Link>

        </div>

      </header>

      {/* Main */}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-6 py-12 lg:px-10">

        <div className="grid w-full gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">

          {/* Left information */}

          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2 text-xs font-medium text-cyan-300">

              <Sparkles size={14} />

              Start your learning journey

            </div>

            <h1 className="max-w-xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] xl:text-6xl">

              Build a learning journey that actually fits

              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                you.
              </span>

            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">

              EduGPT combines personalized lessons, an AI mentor,
              practice, and progress tracking in one learning workspace.

            </p>

            <div className="mt-8 space-y-4">

              {[
                "Personalized learning path",
                "AI mentor available during every lesson",
                "Practice and quizzes built around your course",
                "Progress that follows your actual learning",
              ].map((item) => (

                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >

                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10">
                    <Check
                      size={14}
                      className="text-emerald-400"
                    />
                  </div>

                  {item}

                </div>

              ))}

            </div>

            {goal && (
              <div className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/[0.06] p-5">

                <p className="text-xs uppercase tracking-[0.15em] text-blue-300">
                  Your starting goal
                </p>

                <p className="mt-2 text-lg font-semibold text-white">
                  {goal}
                </p>

              </div>
            )}

          </motion.div>

          {/* Signup Card */}

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.65,
              delay: 0.1,
            }}
            className="mx-auto w-full max-w-xl"
          >

            <div className="relative">

              <div className="absolute -inset-5 rounded-[34px] bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-cyan-400/10 blur-2xl" />

              <div className="relative rounded-[28px] border border-white/10 bg-[#0D111C]/95 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9">

                {/* Card header */}

                <div className="mb-8">

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">

                    <BrainCircuit size={23} />

                  </div>

                  <h2 className="text-3xl font-bold tracking-tight">
                    Create your account
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Start building your personalized learning journey.
                  </p>

                </div>

                {/* Error */}

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
                  >
                    {errorMessage}
                  </motion.div>
                )}

                <form
                  onSubmit={handleSignup}
                  className="space-y-5"
                >

                  {/* Name */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Full name
                    </label>

                    <div className="group flex items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 transition focus-within:border-blue-500/50 focus-within:bg-white/[0.06]">

                      <UserRound
                        size={18}
                        className="text-slate-500 transition group-focus-within:text-blue-400"
                      />

                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) =>
                          setName(e.target.value)
                        }
                        placeholder="Your name"
                        className="w-full bg-transparent px-3 py-4 text-sm text-white outline-none placeholder:text-slate-600"
                      />

                    </div>

                  </div>

                  {/* Email */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Email
                    </label>

                    <div className="group flex items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 transition focus-within:border-blue-500/50 focus-within:bg-white/[0.06]">

                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-slate-500 transition group-focus-within:text-blue-400"
                      >
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="14"
                          rx="2"
                        />
                        <path d="m3 7 9 6 9-6" />
                      </svg>

                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        placeholder="you@example.com"
                        className="w-full bg-transparent px-3 py-4 text-sm text-white outline-none placeholder:text-slate-600"
                      />

                    </div>

                  </div>

                  {/* Password */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Password
                    </label>

                    <div className="group flex items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 transition focus-within:border-blue-500/50 focus-within:bg-white/[0.06]">

                      <LockKeyhole
                        size={18}
                        className="text-slate-500 transition group-focus-within:text-blue-400"
                      />

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        placeholder="At least 6 characters"
                        className="w-full bg-transparent px-3 py-4 text-sm text-white outline-none placeholder:text-slate-600"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (current) => !current
                          )
                        }
                        className="text-slate-500 transition hover:text-white"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>

                    </div>

                    <p className="mt-2 text-xs text-slate-600">
                      Use at least 6 characters.
                    </p>

                  </div>

                  {/* Submit */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-600 py-4 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {loading ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating your account...
                      </>
                    ) : (
                      <>
                        Create account

                        <ArrowRight
                          size={18}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}

                  </button>

                </form>

                {/* Login */}

                <div className="mt-7 border-t border-white/[0.06] pt-6 text-center">

                  <p className="text-sm text-slate-500">
                    Already have an account?{" "}

                    <Link
                      href="/auth/login"
                      className="font-semibold text-blue-400 transition hover:text-cyan-300"
                    >
                      Sign in
                    </Link>

                  </p>

                </div>

                {/* Trust */}

                <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-600">

                  <LockKeyhole size={13} />

                  Your account is secured with Supabase authentication.

                </div>

              </div>

            </div>

          </motion.div>

        </div>

      </div>

    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageContent />
    </Suspense>
  );
}