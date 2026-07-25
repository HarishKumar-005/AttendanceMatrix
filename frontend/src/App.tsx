import React from 'react';
import { Plus, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
import { useAttendance } from './hooks/useAttendance';
import { SummaryCards } from './components/SummaryCards';
import { FilterBar } from './components/FilterBar';
import { AttendanceTable } from './components/AttendanceTable';
import { UIStateWrapper } from './components/UIStateWrapper';
import { AttendanceForm } from './components/AttendanceForm';

export const App: React.FC = () => {
  const {
    records,
    metrics,
    filters,
    loading,
    error,
    selectedRecord,
    isFormOpen,
    setFilters,
    clearFilters,
    refetch,
    openAddModal,
    openEditModal,
    closeModal,
    saveRecord,
  } = useAttendance();

  const isEmptyState = !loading && !error && records.length === 0;

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="glass-panel" style={{
        padding: '1.25rem 2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
          }}>
            <GraduationCap style={{ width: '1.75rem', height: '1.75rem' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                AttendanceMatrix
              </h1>
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <Sparkles style={{ width: '0.75rem', height: '0.75rem' }} />
                SIH Early Warning Engine
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
              School Digital Register & 30-Day Rolling Dropout Risk Prevention System
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.875rem',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)'
          }}>
            <ShieldCheck style={{ width: '1rem', height: '1rem', color: '#10b981' }} />
            <span>3-Tier Architecture Enforced</span>
          </div>

          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus style={{ width: '1.125rem', height: '1.125rem' }} />
            Record Attendance
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        {/* Overview Metric Cards */}
        <SummaryCards metrics={metrics} />

        {/* Search & Filter Controls */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={clearFilters}
        />

        {/* Table & 4 Explicit UI States Container */}
        <UIStateWrapper
          isLoading={loading}
          isError={Boolean(error)}
          errorMessage={error}
          isEmpty={isEmptyState}
          onRetry={refetch}
        >
          <AttendanceTable
            records={records}
            onEditRecord={openEditModal}
          />
        </UIStateWrapper>
      </main>

      {/* Add / Edit Modal Form */}
      <AttendanceForm
        isOpen={isFormOpen}
        record={selectedRecord}
        onClose={closeModal}
        onSubmit={saveRecord}
      />

      {/* Page Footer */}
      <footer style={{
        marginTop: '3rem',
        padding: '1.5rem 0',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.8125rem',
        color: 'var(--text-muted)'
      }}>
        AttendanceMatrix &copy; 2026 | Built for SIH Assessment with React, Express REST API, and Supabase PostgreSQL.
      </footer>
    </div>
  );
};

export default App;
