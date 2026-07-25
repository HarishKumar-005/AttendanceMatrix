import React from 'react';
import { Search, RotateCcw, AlertTriangle } from 'lucide-react';
import { FilterParams } from '../api/client';

interface FilterBarProps {
  filters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
  onClearFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, status: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, endDate: e.target.value });
  };

  const handleToggleDefaulter = () => {
    onFilterChange({ ...filters, isDefaulter: !filters.isDefaulter });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.status && filters.status !== 'ALL') ||
    filters.endDate ||
    filters.isDefaulter
  );

  return (
    <div style={{ padding: '0.625rem 0', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
      <div
        className="filter-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr auto',
          gap: '0.625rem',
          alignItems: 'end'
        }}
      >
        {/* Search Input */}
        <div className="search-field">
          <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Search
          </label>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-control"
              placeholder="Search students…"
              value={filters.search || ''}
              onChange={handleSearchChange}
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Status
          </label>
          <select
            className="input-control"
            value={filters.status || 'ALL'}
            onChange={handleStatusChange}
          >
            <option value="ALL">All Statuses</option>
            <option value="present">Present Only</option>
            <option value="absent">Absent Only</option>
            <option value="excused">Excused Only</option>
          </select>
        </div>

        {/* End Date */}
        <div>
          <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            End Date
          </label>
          <input
            type="date"
            className="input-control"
            value={filters.endDate || ''}
            onChange={handleEndDateChange}
          />
        </div>

        {/* At-Risk Toggle & Clear */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn ${filters.isDefaulter ? 'btn-danger' : 'btn-secondary'}`}
            onClick={handleToggleDefaulter}
            style={{ flex: 1, padding: '0.625rem 0.75rem', fontSize: '0.8125rem' }}
            title="Filter students with 5 or more absences in the last 30 days"
          >
            <AlertTriangle style={{ width: '0.875rem', height: '0.875rem' }} />
            {filters.isDefaulter ? 'At-Risk' : 'Risk'}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClearFilters}
              style={{ padding: '0.625rem 0.75rem' }}
              title="Reset all filters"
            >
              <RotateCcw style={{ width: '0.875rem', height: '0.875rem' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
