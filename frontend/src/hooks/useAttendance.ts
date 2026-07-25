import { useState, useEffect, useCallback } from 'react';
import {
  AttendanceRecord,
  SummaryMetrics,
  FilterParams,
  CreateRecordPayload,
  fetchRecords,
  createRecord,
  updateRecord,
} from '../api/client';

const initialMetrics: SummaryMetrics = {
  totalRecords: 0,
  totalStudents: 0,
  defaultersCount: 0,
  attendanceRate: 0,
  policyThreshold: 5,
};

const initialFilters: FilterParams = {
  search: '',
  classSection: 'ALL',
  status: 'ALL',
  startDate: '',
  endDate: '',
  isDefaulter: false,
};

export function useAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [metrics, setMetrics] = useState<SummaryMetrics>(initialMetrics);
  const [filters, setFiltersState] = useState<FilterParams>(initialFilters);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  const loadAttendanceData = useCallback(async (currentFilters: FilterParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecords(currentFilters);
      setRecords(data.records);
      setMetrics(data.metrics);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load attendance records';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load & filter effect
  useEffect(() => {
    loadAttendanceData(filters);
  }, [filters, loadAttendanceData]);

  const setFilters = (newFilters: FilterParams) => {
    setFiltersState(newFilters);
  };

  const clearFilters = () => {
    setFiltersState(initialFilters);
  };

  const openAddModal = () => {
    setSelectedRecord(null);
    setIsFormOpen(true);
  };

  const openEditModal = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setIsFormOpen(true);
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setSelectedRecord(null);
  };

  const saveRecord = async (payload: CreateRecordPayload) => {
    if (selectedRecord) {
      // Update
      await updateRecord(selectedRecord.id, payload);
    } else {
      // Create
      await createRecord(payload);
    }
    // Refresh records & summary after mutation
    await loadAttendanceData(filters);
  };

  return {
    records,
    metrics,
    filters,
    loading,
    error,
    selectedRecord,
    isFormOpen,
    setFilters,
    clearFilters,
    refetch: () => loadAttendanceData(filters),
    openAddModal,
    openEditModal,
    closeModal,
    saveRecord,
  };
}
