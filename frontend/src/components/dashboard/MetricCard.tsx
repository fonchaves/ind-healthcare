import type { Metric } from '../../types/metrics';

interface MetricCardProps {
  title: string;
  metric: Metric;
  icon: React.ReactNode;
}

export function MetricCard({ title, metric, icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</p>
          <p className="text-sm text-gray-500">{metric.context}</p>
        </div>
        <div className="flex-shrink-0 ml-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
