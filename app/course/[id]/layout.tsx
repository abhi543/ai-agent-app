import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Course | EduGPT",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
