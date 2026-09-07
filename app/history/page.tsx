import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning History | EduGPT",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
