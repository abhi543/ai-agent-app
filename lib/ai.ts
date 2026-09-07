type GroqRole = "system" | "user" | "assistant";

export interface GroqMessage {
  role: GroqRole;
  content: string;
}

interface GroqOptions {
  model?: string;
  temperature?: number;
  top_p?: number;
}

export async function askGroq(
  messages: GroqMessage[],
  options: GroqOptions = {}
) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: options.model ?? "llama-3.3-70b-versatile",
        messages,
        temperature: options.temperature ?? 0.7,
        ...(options.top_p === undefined ? {} : { top_p: options.top_p }),
      }),
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Groq API error ${response.status}: ${text.slice(0, 300)}`);
  }

  const data = JSON.parse(text);
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Groq returned an empty response.");
  }

  return content;
}

export function parseModelJson(text: string) {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // Model responses sometimes arrive wrapped in prose or code fences.
  }

  let cleaned = trimmed.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, "$1");
  const start = cleaned.search(/[\[{]/);

  if (start !== -1) {
    cleaned = cleaned.slice(start);
  }

  const candidates: string[] = [];

  for (const open of ["{", "["]) {
    let stack: string[] = [];
    let candidateStart = -1;

    for (let index = 0; index < cleaned.length; index += 1) {
      const char = cleaned[index];

      if (char === open && stack.length === 0) {
        candidateStart = index;
      }

      if (char === "{" || char === "[") {
        stack.push(char);
      } else if (char === "}") {
        stack = stack[stack.length - 1] === "{" ? stack.slice(0, -1) : [];
      } else if (char === "]") {
        stack = stack[stack.length - 1] === "[" ? stack.slice(0, -1) : [];
      }

      if (stack.length === 0 && candidateStart !== -1) {
        candidates.push(cleaned.slice(candidateStart, index + 1));
        candidateStart = -1;
      }
    }
  }

  candidates.sort((a, b) => b.length - a.length);

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next candidate.
    }
  }

  throw new SyntaxError("Unable to parse JSON from model response.");
}
