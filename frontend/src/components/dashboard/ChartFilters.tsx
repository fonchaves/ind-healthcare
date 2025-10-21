import type { PeriodType, GroupByType, ChartFilters as ChartFiltersType } from '../../types/charts';

interface ChartFiltersProps {
  filters: ChartFiltersType;
  onFiltersChange: (filters: ChartFiltersType) => void;
  states: string[];
  municipalities: Array<{ code: string; name: string }>;
}

export function ChartFilters({ filters, onFiltersChange, states, municipalities }: ChartFiltersProps) {
  const handlePeriodChange = (period: PeriodType) => {
    onFiltersChange({ ...filters, period });
  };

  const handleGroupByChange = (groupBy: GroupByType) => {
    // Clear state/municipality filter when changing groupBy
    onFiltersChange({ ...filters, groupBy, state: undefined, municipality: undefined });
  };

  const handleRegionFilterChange = (value: string) => {
    if (filters.groupBy === 'municipality') {
      onFiltersChange({ ...filters, municipality: value || undefined, state: undefined });
    } else {
      onFiltersChange({ ...filters, state: value || undefined, municipality: undefined });
    }
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

        {/* Region Filter - Dynamic based on groupBy */}
        <div>
          <label htmlFor="region-select" className="block text-sm font-medium text-gray-700 mb-2">
            {filters.groupBy === 'municipality' ? 'Município (obrigatório)' : 'Estado (opcional)'}
            {filters.groupBy === 'municipality' && <span className="text-red-600 ml-1">*</span>}
          </label>
          <select
            id="region-select"
            value={filters.groupBy === 'municipality' ? (filters.municipality || '') : (filters.state || '')}
            onChange={(e) => handleRegionFilterChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              filters.groupBy === 'municipality' && !filters.municipality
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
            required={filters.groupBy === 'municipality'}
          >
            <option value="">
              {filters.groupBy === 'municipality' ? 'Selecione um município...' : 'Todos os estados'}
            </option>
            {filters.groupBy === 'municipality'
              ? municipalities.map((mun) => (
                  <option key={mun.code} value={mun.code}>
                    {mun.name}
                  </option>
                ))
              : states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))
            }
          </select>
          {filters.groupBy === 'municipality' && !filters.municipality && (
            <p className="mt-1 text-sm text-red-600">
              Por favor, selecione um município para visualizar o gráfico. Existem muitos municípios para exibir todos simultaneamente.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
