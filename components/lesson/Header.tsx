"use client";

import { motion } from "framer-motion";
import {
  Clock3,
  Trophy,
  BookOpen,
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
      <div className="h-20 px-8 flex items-center justify-between">

        {/* Left */}

        <div className="flex items-center gap-5">

          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition"
          >
            <ChevronLeft size={20} />
          </Link>

          <div>

            <p className="text-sm text-slate-400">
              {courseTitle}
            </p>

            <h1 className="text-2xl font-bold text-white">
              Lesson {lessonNumber} • {lessonTitle}
            </h1>

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center gap-6">

          <div className="flex items-center gap-2 text-slate-300">

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