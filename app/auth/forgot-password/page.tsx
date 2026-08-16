"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  LockKeyhole,
  Mail,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { supabaseAuth } from "@/lib/supabase-auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabaseAuth.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSent(true);
    } catch (error) {
      console.error("Forgot password error:", error);
      setErrorMessage("Something went wrong while sending the reset email.");
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
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -20, 0],
            scale: [1, 0.94, 1.06, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-32 bottom-10 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[130px]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,10,18,0.8)_78%)]" />

      </div>

      {/* Navigation */}

      <header className="relative z-10 border-b border-white/[0.06] bg-[#070A12]/70 backdrop-blur-xl">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

          <Link href="/" className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
              <Image src="/logo.svg" alt="EduGPT" width={30} height={30} priority />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight">EduGPT</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                AI Learning
              </p>
            </div>

          </Link>

          <Link
            href="/auth/login"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>

        </div>

      </header>

      {/* Main */}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center justify-center px-6 py-12 lg:px-10">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="mx-auto w-full max-w-xl"
        >

          <div className="relative">

            <div className="absolute -inset-5 rounded-[34px] bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-cyan-400/10 blur-2xl" />

            <div className="relative rounded-[28px] border border-white/10 bg-[#0D111C]/95 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9">

              {sent ? (
                <>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 size={23} />
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight">Check your email</h2>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    If an account exists for <span className="text-slate-200">{email.trim()}</span>,
                    we&apos;ve sent a link to reset your password. It may take a minute to arrive —
                    check spam too if you don&apos;t see it.
                  </p>

                  <Link
                    href="/auth/login"
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-4 font-semibold text-white transition hover:bg-white/[0.08]"
                  >
                    Back to login
                  </Link>
                </>
              ) : (
                <>
                  <div className="mb-8">

                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
                      <BrainCircuit size={23} />
                    </div>

                    <h2 className="text-3xl font-bold tracking-tight">Forgot your password?</h2>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Enter your email and we&apos;ll send you a link to reset it.
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

                  <form onSubmit={handleSubmit} className="space-y-5">

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
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-transparent px-3 py-4 text-sm text-white outline-none placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-600 py-4 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Sending link...
                        </>
                      ) : (
                        <>
                          Send reset link
                          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>

                  </form>

                  <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-600">
                    <LockKeyhole size={13} />
                    Secure authentication powered by Supabase.
                  </div>
                </>
              )}

            </div>

          </div>

        </motion.div>

      </div>

    </main>
  );
}
