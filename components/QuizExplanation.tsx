"use client";

interface Props {
  explanations: string[];
}

export default function QuizExplanation({
  explanations,
}: Props) {
  if (explanations.length === 0) return null;

  return (
    <div className="mt-10 border rounded-xl bg-yellow-50 p-8">

      <h2 className="text-3xl font-bold text-yellow-700 mb-8">
        📚 Learn From Your Mistakes
      </h2>

      {explanations.map((item, index) => (

        <div
          key={index}
          className="mb-8 last:mb-0"
        >

          <div className="font-bold text-red-600 mb-3">
            ❌ Question {index + 1}
          </div>

          <div className="whitespace-pre-wrap leading-8 bg-white rounded-lg p-5 border">
            {item}
          </div>

        </div>

      ))}

    </div>
  );
}