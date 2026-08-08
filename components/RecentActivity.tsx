interface Activity {
  icon: string;
  title: string;
  time: string;
}

interface Props {
  activities: Activity[];
}

export default function RecentActivity({
  activities,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-10">

      <h2 className="text-2xl font-bold mb-6">
        📈 Recent Activity
      </h2>

      {activities.length === 0 ? (

        <p className="text-gray-500">
          No activity yet.
        </p>

      ) : (

        <div className="space-y-5">

          {activities.map((activity, index) => (

            <div
              key={index}
              className="flex items-center justify-between border-b pb-4"
            >

              <div className="flex items-center gap-4">

                <div className="text-3xl">
                  {activity.icon}
                </div>

                <div>

                  <p className="font-semibold">
                    {activity.title}
                  </p>

                  <p className="text-gray-500 text-sm">
                    {activity.time}
                  </p>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}