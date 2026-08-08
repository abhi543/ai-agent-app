"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabaseAuth } from "@/lib/supabase-auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } =
        await supabaseAuth.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (!data.session || !data.user) {
        setErrorMessage(
          "Login succeeded, but the browser session could not be restored. Please try again."
        );
        return;
      }

      const {
        data: sessionData,
        error: sessionError,
      } = await supabaseAuth.auth.getSession();

      if (sessionError || !sessionData.session?.user) {
        setErrorMessage(
          "Your session is still being restored. Please try again in a moment."
        );
        return;
      }

      router.replace("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setErrorMessage(
        "Something went wrong while signing you in."
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

      {/* Navigation */}

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

        <div className="grid w-full gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">

          {/* Left */}

          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.06] px-4 py-2 text-xs font-medium text-blue-300">

              <Sparkles size={14} />

              Welcome back

            </div>

            <h1 className="max-w-xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] xl:text-6xl">

              Continue building

              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                your skills.
              </span>

            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">

              Pick up where you left off and continue learning with
              your personalized AI mentor.

            </p>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">

                <BrainCircuit
                  size={20}
                  className="text-cyan-400"
                />

                <p className="mt-3 text-sm font-semibold text-white">
                  AI Mentor
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Learn with guidance
                </p>

              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">

                <Sparkles
                  size={20}
                  className="text-violet-400"
                />

                <p className="mt-3 text-sm font-semibold text-white">
                  Personalized
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your pace, your goals
                </p>

              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">

                <ArrowRight
                  size={20}
                  className="text-blue-400"
                />

                <p className="mt-3 text-sm font-semibold text-white">
                  Keep going
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Resume anytime
                </p>

              </div>

            </div>

          </motion.div>

          {/* Login card */}

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

                <div className="mb-8">

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">

                    <BrainCircuit size={23} />

                  </div>

                  <h2 className="text-3xl font-bold tracking-tight">
                    Welcome back
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Sign in to continue your learning journey.
                  </p>

                </div>

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
                  onSubmit={handleLogin}
                  className="space-y-5"
                >

                  {/* Email */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Email
                    </label>

                    <div className="group flex items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 transition focus-within:border-blue-500/50 focus-within:bg-white/[0.06]">

                      <Mail
                        size={18}
                        className="text-slate-500 transition group-focus-within:text-blue-400"
                      />

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

                    <div className="mb-2 flex items-center justify-between">

                      <label className="block text-sm font-medium text-slate-300">
                        Password
                      </label>

                    </div>

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
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        placeholder="Your password"
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
                        Signing you in...
                      </>
                    ) : (
                      <>
                        Sign in

                        <ArrowRight
                          size={18}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}

                  </button>

                </form>

                {/* Signup */}

                <div className="mt-7 border-t border-white/[0.06] pt-6 text-center">

                  <p className="text-sm text-slate-500">
                    Don&apos;t have an account?{" "}

                    <Link
                      href="/auth/signup"
                      className="font-semibold text-blue-400 transition hover:text-cyan-300"
                    >
                      Create one
                    </Link>

                  </p>

                </div>

                {/* Security */}

                <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-600">

                  <LockKeyhole size={13} />

                  Secure authentication powered by Supabase.

                </div>

              </div>

            </div>

          </motion.div>

        </div>

      </div>

    </main>
  );
}