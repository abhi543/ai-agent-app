export type Course = {
  id: string;
  topic: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  targetDays: number;
  totalLessons: number;
  currentLesson: number;
  completedLessons: number;
  progress: number;
};