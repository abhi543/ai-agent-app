interface Props {
  title: string;
  value: string | number;
  icon: string;
}

export default function StatsCard({
  title,
  value,
  icon,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      <div className="text-4xl mb-3">
        {icon}
      </div>

      <h3 className="text-gray-500 text-sm uppercase">
        {title}
      </h3>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>

    </div>
  );
}