import React from 'react';
import { AttendanceStatus, SessionLifecycle, StudentRosterEntry } from '../api/client';
import { ClassToolbar } from './ClassToolbar';
import { AttendanceSessionBar } from './AttendanceSessionBar';
import { StudentRoster } from './StudentRoster';
import { SessionFooter } from './SessionFooter';
import { UIStateWrapper } from './UIStateWrapper';

interface AttendanceWorkspaceProps {
  activeClass: string;
  activeDate: string;
  roster: StudentRosterEntry[];
  sessionState: SessionLifecycle;
  sessionSearch?: string;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string | null;
  focusedIndex: number;
  selectedStudentId: string | null;
  saveSuccessMessage?: string | null;
  onClassChange: (cls: string) => void;
  onDateChange: (date: string) => void;
  onSearchChange?: (query: string) => void;
  onStatusToggle: (studentId: string, status: AttendanceStatus) => void;
  onMarkAllPresent: () => void;
  onSaveSession: () => void;
  onStudentClick: (studentId: string, studentName: string, studentCode: string, classSection: string) => void;
  onFocusRow: (index: number) => void;
  onRetry: () => void;
}

export const AttendanceWorkspace: React.FC<AttendanceWorkspaceProps> = ({
  activeClass,
  activeDate,
  roster,
  sessionState,
  sessionSearch = '',
  isLoading,
  isError,
  errorMessage,
  focusedIndex,
  selectedStudentId,
  saveSuccessMessage,
  onClassChange,
  onDateChange,
  onSearchChange,
  onStatusToggle,
  onMarkAllPresent,
  onSaveSession,
  onStudentClick,
  onFocusRow,
  onRetry,
}) => {
  const presentCount = roster.filter((r) => r.status === 'present').length;
  const absentCount = roster.filter((r) => r.status === 'absent').length;
  const excusedCount = roster.filter((r) => r.status === 'excused').length;
  const isEmpty = !isLoading && !isError && roster.length === 0;

  return (
    <div className="attendance-workspace-container">
      {/* Class Selector & Session Date Bar */}
      <ClassToolbar
        activeClass={activeClass}
        activeDate={activeDate}
        onClassChange={onClassChange}
        onDateChange={onDateChange}
      />

      {/* Session Header Metrics & Quick Action Bar */}
      <AttendanceSessionBar
        classSection={activeClass}
        sessionDate={activeDate}
        totalEnrolled={roster.length}
        presentCount={presentCount}
        absentCount={absentCount}
        excusedCount={excusedCount}
        sessionState={sessionState}
        searchQuery={sessionSearch}
        onSearchChange={onSearchChange}
        onMarkAllPresent={onMarkAllPresent}
      />

      {/* Roster & 4 UI States Wrapper */}
      <UIStateWrapper
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        isEmpty={isEmpty}
        onRetry={onRetry}
      >
        <StudentRoster
          roster={roster}
          focusedIndex={focusedIndex}
          selectedStudentId={selectedStudentId}
          onStatusToggle={onStatusToggle}
          onStudentClick={onStudentClick}
          onFocusRow={onFocusRow}
        />

        {/* Save Session Footer */}
        <SessionFooter
          sessionState={sessionState}
          onSaveSession={onSaveSession}
          successMessage={saveSuccessMessage}
        />
      </UIStateWrapper>
    </div>
  );
};
