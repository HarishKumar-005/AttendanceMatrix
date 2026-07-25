import React from 'react';
import { Search, Filter, RotateCcw, AlertTriangle } from 'lucide-react';
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

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, classSection: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, status: e.target.value });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, startDate: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, endDate: e.target.value });
  };

  const handleToggleDefaulter = () => {
    onFilterChange({ ...filters, isDefaulter: !filters.isDefaulter });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.classSection && filters.classSection !== 'ALL') ||
    (filters.status && filters.status !== 'ALL') ||
    filters.startDate ||
    filters.endDate ||
    filters.isDefaulter
  );

  return (
    <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Filter style={{ width: '1.125rem', height: '1.125rem', color: 'var(--primary)' }} />
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Filter & Search Register
        </h3>
        {hasActiveFilters && (
          <span style={{ fontSize: '0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>
            Active Filters
          </span>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        alignItems: 'end'
      }}>
        {/* Search Input */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
            SEARCH STUDENT OR RECORD CODE
          </label>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Rahul Kumar, STU-102, REC-1001..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
        </div>

        {/* Class Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
            CLASS SECTION
          </label>
          <select
            className="input-control"
            value={filters.classSection || 'ALL'}
            onChange={handleClassChange}
          >
            <option value="ALL">All Classes</option>
            <option value="Class 9-A">Class 9-A</option>
            <option value="Class 9-B">Class 9-B</option>
            <option value="Class 10-A">Class 10-A</option>
            <option value="Class 10-B">Class 10-B</option>
            <option value="Class 11-A">Class 11-A</option>
            <option value="Class 12-A">Class 12-A</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
            ATTENDANCE STATUS
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

        {/* Date Range Start */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
            FROM DATE
          </label>
          <input
            type="date"
            className="input-control"
            value={filters.startDate || ''}
            onChange={handleStartDateChange}
          />
        </div>

        {/* Date Range End */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
            TO DATE
          </label>
          <input
            type="date"
            className="input-control"
            value={filters.endDate || ''}
            onChange={handleEndDateChange}
          />
        </div>

        {/* At-Risk Toggle Button & Clear Button */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn ${filters.isDefaulter ? 'btn-danger' : 'btn-secondary'}`}
            onClick={handleToggleDefaulter}
            style={{ flex: 1, padding: '0.625rem 0.75rem', fontSize: '0.8125rem' }}
            title="Filter students with 5 or more absences in the last 30 days"
          >
            <AlertTriangle style={{ width: '0.875rem', height: '0.875rem' }} />
            {filters.isDefaulter ? 'At-Risk Only' : 'Show At-Risk'}
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
