"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Clock3,
  Layers3,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Mentor",
    text: "Get explanations, examples, practice questions, and guidance while you learn.",
  },
  {
    icon: Target,
    title: "Personalized Journey",
    text: "Your learning experience adapts to your level, goals, pace, and progress.",
  },
  {
    icon: Layers3,
    title: "Learn by Doing",
    text: "Move from concepts to examples, practice, quizzes, and real application.",
  },
];

const stats = [
  {
    value: "AI",
    label: "Personalized",
  },
  {
    value: "24/7",
    label: "Available",
  },
  {
    value: "∞",
    label: "Topics",
  },
];

export default function Home() {
  const router = useRouter();
  const [goal, setGoal] = useState("");

  function handleStart() {
    const trimmedGoal = goal.trim();

    if (trimmedGoal) {
      router.push(
        `/auth/signup?goal=${encodeURIComponent(trimmedGoal)}`
      );
      return;
    }

    router.push("/auth/signup");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#070A12] text-white">

      {/* Background */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <motion.div
          animate={{
            x: [0, 80, -30, 0],
            y: [0, -40, 60, 0],
            scale: [1, 1.08, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 50, -30, 0],
            scale: [1, 0.92, 1.08, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[-100px] top-[180px] h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[130px]"
        />

        <motion.div
          animate={{
            x: [0, 30, -40, 0],
            y: [0, -30, 30, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-180px] left-[35%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,10,18,0.75)_75%)]" />

      </div>

      {/* Navigation */}

      <nav className="relative z-10 border-b border-white/[0.06] bg-[#070A12]/70 backdrop-blur-xl">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

          <div className="flex items-center gap-3">

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

          </div>

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Sign in
            </button>

            <button
              type="button"
              onClick={() => router.push("/auth/signup")}
              className="rounded-xl border border-white/10 bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.14]"
            >
              Get started
            </button>

          </div>

        </div>

      </nav>

      {/* Hero */}

      <section className="relative z-10">

        <div className="mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-10 lg:pb-28 lg:pt-24">

          <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">

            {/* Left */}

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2 text-xs font-medium text-cyan-300">

                <Sparkles size={14} />

                Your AI-powered learning workspace

              </div>

              <h1 className="max-w-4xl text-5xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">

                Learn anything.

                <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Your way.
                </span>

              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">

                EduGPT builds a personalized learning journey around
                your goals, then stays beside you with an AI mentor
                while you learn, practice, and improve.

              </p>

              {/* Goal Input */}

              <div className="mt-9 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.045] p-2 shadow-2xl shadow-black/20 backdrop-blur-xl">

                <div className="flex flex-col gap-2 sm:flex-row">

                  <div className="flex flex-1 items-center gap-3 px-4">

                    <BrainCircuit
                      size={20}
                      className="shrink-0 text-cyan-400"
                    />

                    <input
                      type="text"
                      value={goal}
                      onChange={(event) =>
                        setGoal(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleStart();
                        }
                      }}
                      placeholder="What do you want to learn?"
                      className="w-full bg-transparent py-4 text-base text-white outline-none placeholder:text-slate-500"
                    />

                  </div>

                  <button
                    type="button"
                    onClick={handleStart}
                    className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.02] hover:shadow-blue-500/30"
                  >
                    Start learning

                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />

                  </button>

                </div>

              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">

                <span className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  Personalized
                </span>

                <span className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  AI-guided
                </span>

                <span className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-400" />
                  Learn at your pace
                </span>

              </div>

            </motion.div>

            {/* Right Preview */}

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.15,
              }}
              className="relative"
            >

              <div className="absolute -inset-6 rounded-[36px] bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-cyan-400/10 blur-2xl" />

              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0D111C]/90 shadow-2xl shadow-black/40 backdrop-blur-xl">

                {/* Preview Top */}

                <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">

                  <div className="flex items-center gap-3">

                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />

                    <span className="text-xs font-medium text-slate-300">
                      Learning workspace
                    </span>

                  </div>

                  <span className="text-xs text-slate-500">
                    Live preview
                  </span>

                </div>

                {/* Preview Content */}

                <div className="grid grid-cols-[0.32fr_0.68fr]">

                  <div className="border-r border-white/[0.06] p-4">

                    <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Journey
                    </p>

                    {[
                      "Foundations",
                      "Core Concepts",
                      "Practice",
                      "Projects",
                    ].map((item, index) => (

                      <div
                        key={item}
                        className={`mb-2 rounded-xl px-3 py-3 text-xs ${
                          index === 0
                            ? "border border-blue-500/20 bg-blue-500/10 text-blue-300"
                            : "text-slate-500"
                        }`}
                      >
                        {index === 0 ? "●" : "○"} {item}
                      </div>

                    ))}

                  </div>

                  <div className="p-6">

                    <div className="mb-5 flex items-center gap-2 text-cyan-400">

                      <Sparkles size={16} />

                      <span className="text-xs font-semibold">
                        Personalized lesson
                      </span>

                    </div>

                    <h3 className="text-2xl font-bold text-white">
                      Master the fundamentals
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      Learn the concept, see a real example, practice
                      it, then ask your AI mentor anything.
                    </p>

                    <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">

                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <Zap
                          size={16}
                          className="text-yellow-400"
                        />
                        AI Mentor
                      </div>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        “Want me to explain this with a simpler example?”
                      </p>

                    </div>

                    <div className="mt-6 flex items-center gap-3">

                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">

                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "62%" }}
                          transition={{
                            duration: 1.2,
                            delay: 0.7,
                          }}
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                        />

                      </div>

                      <span className="text-xs font-semibold text-cyan-300">
                        62%
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </motion.div>

          </div>

        </div>

      </section>

      {/* Stats */}

      <section className="relative z-10 border-y border-white/[0.06] bg-white/[0.02]">

        <div className="mx-auto grid max-w-7xl grid-cols-3 px-6 lg:px-10">

          {stats.map((stat) => (

            <div
              key={stat.label}
              className="border-r border-white/[0.06] px-4 py-7 text-center last:border-r-0"
            >

              <p className="text-2xl font-bold text-white">
                {stat.value}
              </p>

              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                {stat.label}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* Features */}

      <section className="relative z-10">

        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">

          <div className="max-w-2xl">

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Built around the learner
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Not another course dashboard.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-400">
              EduGPT is designed around the actual learning experience:
              understanding, practicing, asking questions, and making progress.
            </p>

          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">

            {features.map((feature, index) => {

              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    margin: "-80px",
                  }}
                  transition={{
                    delay: index * 0.08,
                  }}
                  whileHover={{
                    y: -5,
                  }}
                  className="group rounded-3xl border border-white/[0.07] bg-white/[0.035] p-6 backdrop-blur-xl transition hover:border-white/[0.12] hover:bg-white/[0.05]"
                >

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 text-cyan-400">

                    <Icon size={22} />

                  </div>

                  <h3 className="mt-6 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {feature.text}
                  </p>

                </motion.div>
              );
            })}

          </div>

        </div>

      </section>

      {/* Bottom CTA */}

      <section className="relative z-10 px-6 pb-16 lg:px-10">

        <div className="mx-auto max-w-7xl">

          <div className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-cyan-500/10 p-8 sm:p-12">

            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">

              <div>

                <div className="flex items-center gap-2 text-cyan-300">
                  <Clock3 size={17} />
                  <span className="text-sm font-medium">
                    Start with your goal
                  </span>
                </div>

                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Your next skill starts here.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                  Tell EduGPT what you want to master. We'll build the
                  learning journey around you.
                </p>

              </div>

              <button
                type="button"
                onClick={() => router.push("/auth/signup")}
                className="group flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-950 transition hover:scale-[1.02]"
              >
                Create your account

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />

              </button>

            </div>

          </div>

        </div>

      </section>

      {/* Footer */}

      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-8 lg:px-10">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-slate-600 sm:flex-row">

          <p>
            © {new Date().getFullYear()} EduGPT
          </p>

          <p>
            Learn smarter. Build deeper.
          </p>

        </div>

      </footer>

    </main>
  );
}