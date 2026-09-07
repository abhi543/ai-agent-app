import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lesson | EduGPT",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
