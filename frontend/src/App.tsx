import React from 'react';
import { useAttendance } from './hooks/useAttendance';
import { AppHeader } from './components/AppHeader';
import { AttendanceWorkspace } from './components/AttendanceWorkspace';
import { AttendanceHistory } from './components/AttendanceHistory';
import { StudentWorkspaceDrawer } from './components/StudentWorkspaceDrawer';
import { AttendanceForm } from './components/AttendanceForm';

export const App: React.FC = () => {
  const {
    // Nav & Mode
    activeTab,
    setActiveTab,

    // Session Workspace Domain State
    selectedClassSection,
    setSelectedClassSection,
    selectedDate,
    setSelectedDate,
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
    refetchSession,

    // History Domain State
    historyRecords,
    metrics,
    filters,
    historyLoading,
    historyError,
    setFilters,
    clearFilters,
    refetchHistory,

    // Student Workspace Drawer State
    selectedStudentId,
    selectedStudentName,
    selectedStudentCode,
    selectedStudentClassSection,
    selectStudent,
    clearStudentSelection,

    // Modal Form State
    isFormOpen,
    selectedRecord,
    openAddModal,
    openEditModal,
    closeModal,
    saveHistoryRecord,
  } = useAttendance();

  return (
    <div className="app-container">
      {/* Top Application Header & Navigation Bar */}
      <AppHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        metrics={metrics}
        onOpenAddModal={openAddModal}
      />

      {/* Main Workspace Layout */}
      <main className="workspace-layout">
        <div className="workspace-main">
          {activeTab === 'workspace' ? (
            /* Primary Domain View: Attendance Workspace */
            <AttendanceWorkspace
              activeClass={selectedClassSection}
              activeDate={selectedDate}
              roster={roster}
              sessionState={sessionState}
              isLoading={sessionLoading}
              isError={Boolean(sessionError)}
              errorMessage={sessionError}
              focusedIndex={focusedStudentIndex}
              selectedStudentId={selectedStudentId}
              saveSuccessMessage={saveSuccessMessage}
              onClassChange={setSelectedClassSection}
              onDateChange={setSelectedDate}
              onStatusToggle={toggleRosterStatus}
              onMarkAllPresent={markAllPresent}
              onSaveSession={saveCurrentSession}
              onStudentClick={selectStudent}
              onFocusRow={setFocusedStudentIndex}
              onRetry={refetchSession}
            />
          ) : (
            /* Secondary Domain View: Attendance History & Audit */
            <AttendanceHistory
              records={historyRecords}
              metrics={metrics}
              filters={filters}
              isLoading={historyLoading}
              isError={Boolean(historyError)}
              errorMessage={historyError}
              selectedStudentId={selectedStudentId}
              onFilterChange={setFilters}
              onClearFilters={clearFilters}
              onEditRecord={openEditModal}
              onStudentClick={selectStudent}
              onRetry={refetchHistory}
            />
          )}
        </div>

        {/* Shared Student Workspace Drawer (Side Panel / Bottom Sheet) */}
        <StudentWorkspaceDrawer
          studentId={selectedStudentId}
          studentName={selectedStudentName}
          studentCode={selectedStudentCode}
          classSection={selectedStudentClassSection}
          onClose={clearStudentSelection}
          onEditRecord={openEditModal}
        />
      </main>

      {/* Dialog Modal for Historical Record Correction */}
      <AttendanceForm
        isOpen={isFormOpen}
        record={selectedRecord}
        onClose={closeModal}
        onSubmit={saveHistoryRecord}
      />

      {/* Footer */}
      <footer style={{
        marginTop: '2rem',
        padding: '1rem 0',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.8125rem',
        color: 'var(--text-muted)'
      }}>
        AttendanceMatrix &copy; 2026
      </footer>
    </div>
  );
};

export default App;
