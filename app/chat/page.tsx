
  "use client";
  import PageHeader from "@/components/PageHeader";
  import Link from "next/link";
  import Image from "next/image";
  import { Suspense, useState } from "react";
  import { useSearchParams } from "next/navigation";
  import { saveMessage } from "@/lib/message-db";
  type Message = {
    sender: "user" | "ai";
    text: string;
  };

  function ChatContent() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const lesson = 1;
    const [isLoading, setIsLoading] = useState(false);

    const searchParams = useSearchParams();

    const goal = searchParams.get("goal");
    const days = searchParams.get("days");
    const courseId = searchParams.get("courseId") ?? "";
   
    const handleSend = async () => {
    try {
      if (message.trim() === "") return;

      const userMessage = message;
      if (courseId) {
        await saveMessage({
          course_id: courseId,
          lesson_number: lesson,
          role: "user",
          message: userMessage,
        });
      } else {
        console.warn("saveMessage skipped: missing courseId");
      }
      setIsLoading(true);

      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: userMessage,
        },
      ]);
      setMessage("");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          goal: goal,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const dataText = await response.text();
      let data: { reply: string };
      try {
        data = JSON.parse(dataText) as { reply: string };
      } catch {
        console.error("Non-JSON response from /api/chat:", dataText);
        throw new Error("Invalid response from chat service");
      }

      if (typeof data.reply !== "string" || data.reply.trim() === "") {
        throw new Error("Invalid response: missing reply field");
      }

      if (courseId) {
        await saveMessage({
          course_id: courseId,
          lesson_number: lesson,
          role: "assistant",
          message: data.reply,
        });
      } else {
        console.warn("saveMessage skipped: missing courseId");
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.reply,
        },
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-3xl mx-auto p-6 h-screen flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10">
                <Image src="/logo.svg" alt="AI Tutor Logo" width={40} height={40} priority />
              </div>
              <PageHeader />
            </div>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition bg-white hover:bg-gray-100 px-4 py-2 rounded-lg">
              ← Home
            </Link>
          </div>

          <div className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Learning Goal</p>
                <p className="text-xl font-bold">{goal}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Duration</p>
                <p className="text-xl font-bold">{days} days</p>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 mb-4 overflow-y-auto flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">👋</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to your {goal} journey!</h2>
                  <p className="text-gray-600 mb-4">Start asking questions and let the AI guide you</p>
                  <p className="text-4xl">📚 Lesson {lesson}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-xl max-w-xs text-gray-800">
                    <p className="font-semibold mb-1">👋 Welcome back!</p>
                    <p className="text-sm">📘 <strong>Lesson {lesson}</strong></p>
                    <p className="text-sm mt-2">Your goal is to learn <strong>{goal}</strong> in <strong>{days}</strong> days.</p>
                    <p className="text-sm mt-2">Let&apos;s begin! Ask me anything! 🚀</p>
                  </div>
                </div>

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`p-4 rounded-xl max-w-xs break-words ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-4 rounded-xl">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition bg-white placeholder-gray-400 shadow-md"
                placeholder="Ask anything about {goal}..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Send ✨</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  export default function ChatPage() {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading chat...</div>}>
        <ChatContent />
      </Suspense>
    );
  } 