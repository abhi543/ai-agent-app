"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import { motion } from "framer-motion";
import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Sparkles,
  Trophy,
} from "lucide-react";

export default function LessonWorkspace() {
  const [course, setCourse] = useState<any>(null);
const [lessons, setLessons] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  async function loadCourse() {

    // Get latest course
    const { data: latestCourse } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!latestCourse) {
      setLoading(false);
      return;
    }

    setCourse(latestCourse);

    // Get lessons for that course
    const { data: lessonData } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", latestCourse.id)
      .order("lesson_number");

    setLessons(lessonData || []);

    setLoading(false);
  }

  loadCourse();
}, []);
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center text-white bg-slate-950">
      Loading course...
    </div>
  );
}
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* TOP BAR */}

      <header className="h-20 border-b border-slate-800 bg-slate-900/70 backdrop-blur-xl flex items-center justify-between px-8">

        <div>
          <h1 className="text-2xl font-bold">
            {course?.topic}
          </h1>

          <p className="text-sm text-slate-400">
            Lesson {course?.current_lesson}
          </p>
        </div>

        <div className="flex items-center gap-6">

          <div className="flex items-center gap-2 text-slate-300">

            <Clock3 size={18} />

            <span>15 mins</span>

          </div>

          <div className="flex items-center gap-2 text-emerald-400">

            <Trophy size={18} />

            <span>0 XP</span>

          </div>

        </div>

      </header>

      {/* MAIN GRID */}

      <div className="grid grid-cols-12 h-[calc(100vh-80px)]">

        {/* LEFT */}

        {/* LEFT */}

<motion.aside
  initial={{ x: -30, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  className="col-span-2 border-r border-slate-800 bg-slate-900 p-6 overflow-y-auto"
>
  <h2 className="text-xl font-bold mb-2">
    {course?.topic}
  </h2>

  <p className="text-sm text-slate-400 mb-6">
    {course?.level}
  </p>

  {/* Progress */}

  <div className="mb-8">
    <div className="flex justify-between text-xs text-slate-400 mb-2">
      <span>Course Progress</span>
      <span>{course?.progress}%</span>
    </div>

    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
      <div
        style={{ width: `${course?.progress || 0}%` }}
        className="h-full rounded-full bg-cyan-400"
      />
    </div>
  </div>

  {/* Lesson List */}
  <div className="space-y-3">

{lessons.map((lesson,index)=>{

const current=index===0;

return(

<div
key={lesson.id}
className={`rounded-xl border p-4 transition cursor-pointer ${
lesson.completed
? "border-emerald-500 bg-emerald-500/10"
: current
? "border-blue-500 bg-blue-500/10"
: "bg-slate-800 hover:bg-slate-700 border-transparent"
}`}
>

<div className="flex justify-between items-center">

<span
className={
current
? "font-semibold text-blue-300"
: ""
}
>

{lesson.title}

</span>

{lesson.completed ? (

<CheckCircle2
className="text-emerald-400"
size={18}
/>

) : current ? (

<BookOpen
className="text-blue-400"
size={18}
/>

) : (

<Clock3 size={16}/>

)}

</div>

<p className="text-xs text-slate-400 mt-1">

{lesson.completed
? "Completed"
: current
? "Current Lesson"
: "Locked"}

</p>

</div>

);

})}

</div>

  {/* Bottom */}

  <div className="mt-8 border-t border-slate-700 pt-6">

    <div className="flex justify-between mb-3">
      <span className="text-slate-400">
        XP
      </span>

      <span className="text-yellow-400 font-bold">
        120
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-slate-400">
        Streak
      </span>

      <span className="text-orange-400 font-bold">
        🔥 3 Days
      </span>
    </div>

  </div>

</motion.aside>

        {/* CENTER */}

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-7 overflow-y-auto p-10"
        >

          <div className="max-w-4xl mx-auto">

            <div className="mb-10">

              <div className="flex items-center gap-3 mb-4">

                <BookOpen className="text-blue-400" />

                <h2 className="text-3xl font-bold">
                  Variables
                </h2>

              </div>

              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">

                <div className="w-1/5 h-full bg-blue-500 rounded-full" />

              </div>

            </div>

            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8">

              <p className="text-lg leading-9 text-slate-300">

                Imagine you have a box.

                You can put anything inside that box.

                Numbers.

                Names.

                Text.

                Python calls that box a Variable.

              </p>

              <div className="my-10 rounded-2xl bg-slate-800 p-6">

                <code className="text-green-400 text-lg">

                  name = "Abhishek"

                </code>

              </div>

              <p className="text-lg leading-9 text-slate-300">

                Here the variable is called

                <span className="font-bold text-white">
                  {" "}name{" "}
                </span>

                and it stores your text.

              </p>

            </div>

          </div>

        </motion.main>

        {/* RIGHT */}

        <motion.aside
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="col-span-3 border-l border-slate-800 bg-slate-900 p-6"
        >

          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 p-6">

            <div className="flex items-center gap-3 mb-4">

              <BrainCircuit />

              <h3 className="font-bold text-xl">
                AI Tutor
              </h3>

            </div>

            <p className="text-sm leading-7">

              Ask anything while studying.

              I'll explain in simple language.

            </p>

          </div>

          <div className="mt-8 rounded-3xl bg-slate-800 p-6">

            <div className="flex items-center gap-2 mb-4">

              <Sparkles />

              <span className="font-semibold">

                AI Suggestions

              </span>

            </div>

            <ul className="space-y-4 text-sm text-slate-300">

              <li>✔ Explain this lesson</li>

              <li>✔ Give example</li>

              <li>✔ Create quiz</li>

              <li>✔ Practice coding</li>

            </ul>

          </div>

        </motion.aside>

      </div>

    </div>
  );
}