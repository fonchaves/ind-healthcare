import type { PeriodType, GroupByType, ChartFilters as ChartFiltersType } from '../../types/charts';

interface ChartFiltersProps {
  filters: ChartFiltersType;
  onFiltersChange: (filters: ChartFiltersType) => void;
  states: string[];
}

export function ChartFilters({ filters, onFiltersChange, states }: ChartFiltersProps) {
  const handlePeriodChange = (period: PeriodType) => {
    onFiltersChange({ ...filters, period });
  };

  const handleGroupByChange = (groupBy: GroupByType) => {
    onFiltersChange({ ...filters, groupBy });
  };

  const handleStateChange = (state: string) => {
    onFiltersChange({ ...filters, state: state || undefined });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros do Gráfico</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Period Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período
          </label>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="period"
                value="daily"
                checked={filters.period === 'daily'}
                onChange={(e) => handlePeriodChange(e.target.value as PeriodType)}
                className="mr-2"
              />
              <span className="text-sm">Diário</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="period"
                value="monthly"
                checked={filters.period === 'monthly'}
                onChange={(e) => handlePeriodChange(e.target.value as PeriodType)}
                className="mr-2"
              />
              <span className="text-sm">Mensal</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="period"
                value="yearly"
                checked={filters.period === 'yearly'}
                onChange={(e) => handlePeriodChange(e.target.value as PeriodType)}
                className="mr-2"
              />
              <span className="text-sm">Anual</span>
            </label>
          </div>
        </div>

        {/* Group By Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agrupar Por
          </label>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="groupBy"
                value="state"
                checked={filters.groupBy === 'state'}
                onChange={(e) => handleGroupByChange(e.target.value as GroupByType)}
                className="mr-2"
              />
              <span className="text-sm">Estado</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="groupBy"
                value="municipality"
                checked={filters.groupBy === 'municipality'}
                onChange={(e) => handleGroupByChange(e.target.value as GroupByType)}
                className="mr-2"
              />
              <span className="text-sm">Município</span>
            </label>
          </div>
        </div>

        {/* State Filter */}
        <div>
          <label htmlFor="state-select" className="block text-sm font-medium text-gray-700 mb-2">
            Estado (opcional)
          </label>
          <select
            id="state-select"
            value={filters.state || ''}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os estados</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
