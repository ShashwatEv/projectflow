interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
}

export function StatsCard({ title, value, change, isPositive }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p className={`mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
