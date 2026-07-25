import React from 'react';
import { AttendanceRecord, FilterParams, SummaryMetrics } from '../api/client';
import { SummaryCards } from './SummaryCards';
import { FilterBar } from './FilterBar';
import { AttendanceTable } from './AttendanceTable';
import { UIStateWrapper } from './UIStateWrapper';

interface AttendanceHistoryProps {
  records: AttendanceRecord[];
  metrics: SummaryMetrics;
  filters: FilterParams;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string | null;
  selectedStudentId: string | null;
  onFilterChange: (filters: FilterParams) => void;
  onClearFilters: () => void;
  onEditRecord: (record: AttendanceRecord) => void;
  onStudentClick: (studentId: string, studentName: string, studentCode: string, classSection: string) => void;
  onRetry: () => void;
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({
  records,
  metrics,
  filters,
  isLoading,
  isError,
  errorMessage,
  selectedStudentId,
  onFilterChange,
  onClearFilters,
  onEditRecord,
  onStudentClick,
  onRetry,
}) => {
  const isEmpty = !isLoading && !isError && records.length === 0;

  return (
    <div className="attendance-history-container">
      {/* Overview Metrics Cards */}
      <SummaryCards metrics={metrics} />

      {/* Advanced Audit Filter Toolbar */}
      <FilterBar
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
      />

      {/* Historical Records Table & UI State Wrapper */}
      <UIStateWrapper
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        isEmpty={isEmpty}
        onRetry={onRetry}
      >
        <AttendanceTable
          records={records}
          selectedStudentId={selectedStudentId}
          onEditRecord={onEditRecord}
          onStudentClick={(rec) => onStudentClick(rec.student_id, rec.student_name, rec.student_code, rec.class_section)}
        />
      </UIStateWrapper>
    </div>
  );
};
