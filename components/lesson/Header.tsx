"use client";

import { motion } from "framer-motion";
import {
  Clock3,
  Trophy,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  courseTitle: string;
  lessonTitle: string;
  lessonNumber: number;
  xp?: number;
  duration?: number;
}

export default function Header({
  courseTitle,
  lessonTitle,
  lessonNumber,
  xp = 0,
  duration = 15,
}: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -25, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800"
    >
      <div className="flex h-20 min-w-0 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Left */}

        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5">

          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition"
          >
            <ChevronLeft size={20} />
          </Link>

          <div className="min-w-0">

            <p className="text-sm text-slate-400">
              {courseTitle}
            </p>

            <h1 className="truncate text-lg font-bold text-white sm:text-2xl">
              Lesson {lessonNumber} • {lessonTitle}
            </h1>

          </div>

        </div>

        {/* Right */}

        <div className="flex shrink-0 items-center gap-3 sm:gap-6">

          <div className="hidden items-center gap-2 text-slate-300 sm:flex">

            <Clock3 size={18} />

            <span>{duration} min</span>

          </div>

          <div className="flex items-center gap-2 text-yellow-400">

            <Trophy size={18} />

            <span>{xp} XP</span>

          </div>

          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-bold text-white">
            A
          </div>

        </div>

      </div>
    </motion.header>
  );
}