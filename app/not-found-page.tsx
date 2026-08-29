"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Compass, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function GlowBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute right-[-140px] top-[260px] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />
      <div className="absolute bottom-[-180px] left-[35%] h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,10,18,0.82)_80%)]" />
    </div>
  );
}

export default function NotFound() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070A12] text-white">
      <GlowBackground />

      <header className="relative z-10 border-b border-white/[0.06] bg-[#070A12]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
              <Image src="/logo.svg" alt="EduGPT" width={22} height={22} priority />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">EduGPT</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                AI Learning
              </p>
            </div>
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]"
        >
          <Compass size={28} className="text-cyan-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-8 bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-7xl font-bold tracking-tight text-transparent sm:text-8xl"
        >
          404
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
          className="mt-4 text-xl font-semibold"
        >
          This page took a wrong turn.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-2 max-w-md text-sm leading-6 text-slate-400"
        >
          The page you&apos;re looking for doesn&apos;t exist, moved, or the
          link might be broken. Let&apos;s get you back on track.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.02] hover:shadow-blue-500/30"
          >
            <Home size={17} />
            Take me home
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 font-semibold text-white transition hover:bg-white/[0.08]"
          >
            <ArrowLeft size={17} />
            Go to dashboard
          </Link>
        </motion.div>

      </div>
    </main>
  );
}
