import { useState, useEffect, useCallback } from 'react';
import {
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
  SummaryMetrics,
  FilterParams,
  CreateRecordPayload,
  StudentRosterEntry,
  SessionLifecycle,
  fetchAttendanceSession,
  saveAttendanceSession,
  fetchRecords,
  createRecord,
  updateRecord,
  updateStudentMobileNumber,
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

export type ActiveTabMode = 'workspace' | 'history';

export function useAttendance() {
  // Navigation & view mode state
  const [activeTab, setActiveTab] = useState<ActiveTabMode>('workspace');

  // Attendance Session Domain State
  const [selectedClassSection, setSelectedClassSection] = useState<string>('10A');

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [roster, setRoster] = useState<StudentRosterEntry[]>([]);
  const [sessionSearch, setSessionSearch] = useState<string>('');
  const [sessionState, setSessionState] = useState<SessionLifecycle>('clean');
  const [sessionLoading, setSessionLoading] = useState<boolean>(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [focusedStudentIndex, setFocusedStudentIndex] = useState<number>(0);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Historical Audit State
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [metrics, setMetrics] = useState<SummaryMetrics>(initialMetrics);
  const [filters, setFiltersState] = useState<FilterParams>(initialFilters);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Form Modal & Student Workspace Drawer state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [selectedStudentCode, setSelectedStudentCode] = useState('');
  const [selectedStudentClassSection, setSelectedStudentClassSection] = useState('');

  // 1. Load Attendance Session for active class & date (with optional server-side search)
  const loadSession = useCallback(async (classSection: string, date: string, search?: string) => {
    setSessionLoading(true);
    setSessionError(null);
    setSaveSuccessMessage(null);
    try {
      const data = await fetchAttendanceSession(classSection, date, search);
      setSession(data);
      setRoster(data.roster || []);
      setSessionState('clean');
      setFocusedStudentIndex(0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load attendance session';
      setSessionError(msg);
      setSession(null);
      setRoster([]);
      setSessionState('failed');
    } finally {
      setSessionLoading(false);
    }
  }, []);

  // 2. Load Attendance History (for audit tab)
  const loadHistoryData = useCallback(async (currentFilters: FilterParams) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await fetchRecords(currentFilters);
      setHistoryRecords(data?.records ?? []);
      setMetrics(data?.metrics ?? initialMetrics);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load attendance history';
      setHistoryError(msg);
      setHistoryRecords([]);
      setMetrics(initialMetrics);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Load session when class, date, or search changes
  useEffect(() => {
    loadSession(selectedClassSection, selectedDate, sessionSearch);
  }, [selectedClassSection, selectedDate, sessionSearch, loadSession]);

  // Load history when tab is 'history' or filters change
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistoryData(filters);
    }
  }, [activeTab, filters, loadHistoryData]);

  // Workspace Roster Actions
  const toggleRosterStatus = (studentId: string, newStatus: AttendanceStatus) => {
    setRoster((prev) =>
      prev.map((entry) =>
        entry.student_id === studentId ? { ...entry, status: newStatus } : entry
      )
    );
    setSessionState('draft');
    setSaveSuccessMessage(null);
  };

  const markAllPresent = () => {
    setRoster((prev) => prev.map((entry) => ({ ...entry, status: 'present' })));
    setSessionState('draft');
    setSaveSuccessMessage(null);
  };

  const saveCurrentSession = async () => {
    if (!roster || roster.length === 0) return;
    setSessionState('saving');
    setSessionError(null);
    setSaveSuccessMessage(null);

    try {
      const res = await saveAttendanceSession({
        class_section: selectedClassSection,
        date: selectedDate,
        records: roster.map((r) => ({
          student_id: r.student_id,
          student_code: r.student_code,
          student_name: r.student_name,
          status: r.status,
          remarks: r.remarks,
        })),
      });

      setSession(res.session);
      setRoster(res.session.roster || []);
      setSessionState('saved');
      setSaveSuccessMessage(`Attendance saved for ${selectedClassSection} (${res.session.present_count} Present, ${res.session.absent_count} Absent)`);

      // Refresh history & metrics in background if defaulters were updated
      if (activeTab === 'history') {
        loadHistoryData(filters);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save attendance session';
      setSessionError(msg);
      setSessionState('failed');
    }
  };

  // Keyboard Shortcuts (P/A/E, 1/2/3, ArrowUp/ArrowDown, Ctrl+S)
  useEffect(() => {
    if (activeTab !== 'workspace' || isFormOpen || roster.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      const activeStudent = roster[focusedStudentIndex];

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedStudentIndex((prev) => Math.min(prev + 1, roster.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedStudentIndex((prev) => Math.max(prev - 1, 0));
      } else if ((e.key === 'p' || e.key === 'P' || e.key === '1') && activeStudent) {
        e.preventDefault();
        toggleRosterStatus(activeStudent.student_id, 'present');
      } else if ((e.key === 'a' || e.key === 'A' || e.key === '2') && activeStudent) {
        e.preventDefault();
        toggleRosterStatus(activeStudent.student_id, 'absent');
      } else if ((e.key === 'e' || e.key === 'E' || e.key === '3') && activeStudent) {
        e.preventDefault();
        toggleRosterStatus(activeStudent.student_id, 'excused');
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        saveCurrentSession();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isFormOpen, roster, focusedStudentIndex, saveCurrentSession]);

  // Drawer Inspection
  const selectStudent = (studentId: string, studentName: string, studentCode: string, classSection: string) => {
    setSelectedStudentId(studentId);
    setSelectedStudentName(studentName);
    setSelectedStudentCode(studentCode);
    setSelectedStudentClassSection(classSection);
  };

  const clearStudentSelection = () => {
    setSelectedStudentId(null);
    setSelectedStudentName('');
    setSelectedStudentCode('');
    setSelectedStudentClassSection('');
  };

  // Modal actions
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

  const saveHistoryRecord = async (payload: CreateRecordPayload) => {
    if (selectedRecord) {
      await updateRecord(selectedRecord.id, payload);
    } else {
      await createRecord(payload);
    }
    // Refresh active session and history after single record mutation
    loadSession(selectedClassSection, selectedDate);
    if (activeTab === 'history') {
      loadHistoryData(filters);
    }
  };

  return {
    // Navigation & View Mode
    activeTab,
    setActiveTab,

    // Session Workspace Domain State
    selectedClassSection,
    setSelectedClassSection,
    selectedDate,
    setSelectedDate,
    sessionSearch,
    setSessionSearch,
    session,
    roster,
    sessionState,
    sessionLoading,
    sessionError,
    focusedStudentIndex,
    setFocusedStudentIndex,
    saveSuccessMessage,

    // Session Actions
    toggleRosterStatus,
    markAllPresent,
    saveCurrentSession,
    refetchSession: () => loadSession(selectedClassSection, selectedDate, sessionSearch),
    updateStudentMobile: async (studentId: string, mobileNumber: string) => {
      await updateStudentMobileNumber(studentId, mobileNumber);
      await loadSession(selectedClassSection, selectedDate, sessionSearch);
    },

    // History Audit Domain State
    historyRecords,
    metrics,
    filters,
    historyLoading,
    historyError,
    setFilters: setFiltersState,
    clearFilters: () => setFiltersState(initialFilters),
    refetchHistory: () => loadHistoryData(filters),

    // Student Workspace Drawer State & Handlers
    selectedStudentId,
    selectedStudentName,
    selectedStudentCode,
    selectedStudentClassSection,
    selectStudent,
    clearStudentSelection,

    // Form Modal State & Handlers
    isFormOpen,
    selectedRecord,
    openAddModal,
    openEditModal,
    closeModal,
    saveHistoryRecord,
  };
}
