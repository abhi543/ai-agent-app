"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  Target,
} from "lucide-react";

interface LessonContentProps {
  lessonNumber: number;
  title: string;
  content: string;
  progress?: number;
}

interface ParsedSection {
  title: string;
  body: string;
}

function parseLessonSections(content: string, defaultTitle: string): ParsedSection[] {
  if (!content) return [];

  // Clean out any legacy practice exercises if present
  const cleaned = content.replace(
    /(?:^|\n)#{1,3}\s*(?:practice\s+exercise|exercise|homework)[\s\S]*?(?=\n#{1,3}\s|\n\n\n|$)/gi,
    ""
  );

  // Split on ## Markdown headings
  const parts = cleaned.split(/(?=^##\s+)/m);
  const sections: ParsedSection[] = [];

  for (let i = 0; i < parts.length; i++) {
    const raw = parts[i].trim();
    if (!raw) continue;

    if (raw.startsWith("## ")) {
      const firstLineEnd = raw.indexOf("\n");
      if (firstLineEnd !== -1) {
        const heading = raw.slice(3, firstLineEnd).trim();
        const body = raw.slice(firstLineEnd).trim();
        if (body) {
          sections.push({ title: heading, body });
        }
      } else {
        sections.push({ title: raw.slice(3).trim(), body: "" });
      }
    } else {
      // Intro section or raw text without ##
      // Strip title if it starts with # Title
      let bodyText = raw;
      let heading = i === 0 ? "Overview & Core Mechanics" : `Deep Dive Part ${i + 1}`;

      if (bodyText.startsWith("# ")) {
        const lineEnd = bodyText.indexOf("\n");
        if (lineEnd !== -1) {
          bodyText = bodyText.slice(lineEnd).trim();
        }
      }

      if (bodyText.trim()) {
        sections.push({ title: heading, body: bodyText });
      }
    }
  }

  return sections.length > 0 ? sections : [{ title: defaultTitle, body: content }];
}

function renderFormattedBody(body: string) {
  // Render paragraphs, code blocks, and tables with clean readable styling
  const lines = body.split("\n");
  const elements: React.ReactNode[] = [];
  let codeBuffer: string[] = [];
  let inCodeBlock = false;
  let codeLang = "";
  let tableBuffer: string[] = [];
  let inTable = false;

  function flushCode(keyIdx: number) {
    if (codeBuffer.length > 0) {
      elements.push(
        <div key={`code-${keyIdx}`} className="my-5 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2 text-xs font-mono text-cyan-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <Code2 size={14} />
              {codeLang || "code"}
            </span>
            <span className="text-slate-500 text-[11px]">Production Example</span>
          </div>
          <pre className="overflow-x-auto p-4 text-xs sm:text-sm font-mono leading-6 text-emerald-300">
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        </div>
      );
      codeBuffer = [];
      codeLang = "";
    }
  }

  function flushTable(keyIdx: number) {
    if (tableBuffer.length > 0) {
      // Parse markdown table rows
      const rows = tableBuffer
        .filter((r) => !r.includes("---"))
        .map((r) =>
          r
            .split("|")
            .map((c) => c.trim())
            .filter((c, idx, arr) => (idx > 0 && idx < arr.length - 1) || c.length > 0)
        );

      if (rows.length > 0) {
        const header = rows[0];
        const bodyRows = rows.slice(1);

        elements.push(
          <div key={`table-${keyIdx}`} className="my-6 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70 shadow-md">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                <tr>
                  {header.map((col, cIdx) => (
                    <th key={cIdx} className="px-5 py-3.5">
                      {col.replace(/\*\*/g, "")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-900/40 transition">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-5 py-3.5 text-xs sm:text-sm leading-6">
                        {cell.replace(/\*\*/g, "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      tableBuffer = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block detection
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        inCodeBlock = false;
        flushCode(i);
      } else {
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Markdown table detection
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      inTable = true;
      tableBuffer.push(line.trim());
      continue;
    } else if (inTable) {
      inTable = false;
      flushTable(i);
    }

    // Regular text / subheadings / bullets
    if (line.trim().startsWith("### ")) {
      elements.push(
        <h4 key={`h4-${i}`} className="mt-6 mb-3 text-base sm:text-lg font-bold text-cyan-300">
          {line.trim().slice(4)}
        </h4>
      );
    } else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      elements.push(
        <li key={`li-${i}`} className="ml-5 list-disc text-sm sm:text-base leading-7 text-slate-300">
          {line.trim().slice(2)}
        </li>
      );
    } else if (line.trim()) {
      elements.push(
        <p key={`p-${i}`} className="my-3 text-sm sm:text-base leading-7 sm:leading-8 text-slate-300">
          {line}
        </p>
      );
    }
  }

  flushCode(lines.length + 1);
  flushTable(lines.length + 2);

  return elements;
}

export default function LessonContent({
  lessonNumber,
  title,
  content,
  progress = 0,
}: LessonContentProps) {
  const sections = parseLessonSections(content, title);

  return (
    <main className="min-h-full overflow-y-auto bg-slate-950 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">

        {/* Lesson Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 text-sm text-cyan-400 mb-3">
            <BookOpen size={16} />
            <span>Lesson {lessonNumber} • Deep Dive Masterclass</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            {title}
          </h1>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span>Course Progress</span>
              <span className="font-semibold text-cyan-400">{progress}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Detailed Sections with Meaningful Headers */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.section
              key={`${section.title}-${index}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-xl shadow-black/20 backdrop-blur-xl"
            >
              <div className="mb-6 flex items-center gap-3 border-b border-slate-800/80 pb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {index === 0 ? (
                    <Layers size={20} />
                  ) : index % 2 === 0 ? (
                    <Cpu size={20} />
                  ) : (
                    <Sparkles size={20} />
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {section.title}
                </h2>
              </div>

              <div className="prose prose-invert max-w-none">
                {renderFormattedBody(section.body)}
              </div>
            </motion.section>
          ))}
        </div>

      </div>
    </main>
  );
}
