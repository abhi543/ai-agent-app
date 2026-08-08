interface Props {
  streak: number;
}

export default function StreakCard({ streak }: Props) {

  const progress = Math.min((streak / 7) * 100, 100);

  const daysRemaining = Math.max(7 - streak, 0);

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-xl p-8 text-white">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-bold">
            🔥 Learning Streak
          </h2>

          <p className="text-orange-100 mt-2">
            Stay consistent every day.
          </p>

        </div>

        <div className="text-6xl">
          🔥
        </div>

      </div>

      <div className="mt-8">

        <div className="h-4 bg-white/30 rounded-full overflow-hidden">

          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

      <div className="mt-6">

        <div className="text-5xl font-bold">
          {streak} Days
        </div>

        {streak === 0 && (

  <p className="mt-3 text-orange-100 text-lg">
    🚀 Complete your first lesson today and begin your streak.
  </p>

)}

{streak > 0 && streak < 7 && (

  <p className="mt-3 text-orange-100 text-lg">
    💪 Keep going! Only {daysRemaining} more day
    {daysRemaining !== 1 ? "s" : ""}
    {" "}to earn your first weekly badge.
  </p>

)}

{streak >= 7 && streak < 30 && (

  <div>

    <p className="mt-3 text-xl font-bold">
      🥉 Bronze Learner
    </p>

    <p className="text-orange-100">
      Fantastic consistency! Keep building your habit.
    </p>

  </div>

)}

{streak >= 30 && streak < 100 && (

  <div>

    <p className="mt-3 text-xl font-bold">
      🥈 Silver Learner
    </p>

    <p className="text-orange-100">
      You're becoming a serious learner.
    </p>

  </div>

)}

{streak >= 100 && (

  <div>

    <p className="mt-3 text-xl font-bold">
      🥇 Gold Learner
    </p>

    <p className="text-orange-100">
      Incredible dedication. You're among the top learners!
    </p>

  </div>

)}

      </div>

    </div>
  );
}