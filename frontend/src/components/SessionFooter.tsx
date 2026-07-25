import React from 'react';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import { SessionLifecycle } from '../api/client';

interface SessionFooterProps {
  sessionState: SessionLifecycle;
  onSaveSession: () => void;
  successMessage?: string | null;
}

export const SessionFooter: React.FC<SessionFooterProps> = ({
  sessionState,
  onSaveSession,
  successMessage,
}) => {
  const isSaving = sessionState === 'saving';

  return (
    <div
      className="session-footer-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.875rem 1.25rem',
        marginTop: '0.875rem',
        backgroundColor: 'var(--bg-card-solid)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
        {successMessage ? (
          <span style={{ color: 'var(--present)', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600 }}>
            <CheckCircle2 style={{ width: '1rem', height: '1rem' }} />
            {successMessage}
          </span>
        ) : (
          <span className="keyboard-shortcuts-text" style={{ color: 'var(--text-muted)' }}>
            Keyboard Shortcuts: <kbd className="shortcut-key">P</kbd>/<kbd className="shortcut-key">A</kbd>/<kbd className="shortcut-key">E</kbd> for status · <kbd className="shortcut-key">↑</kbd><kbd className="shortcut-key">↓</kbd> for rows · <kbd className="shortcut-key">Ctrl+S</kbd> to save
          </span>
        )}
      </div>

      <button
        type="button"
        className="btn btn-primary session-save-btn"
        onClick={onSaveSession}
        disabled={isSaving}
        style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem', fontWeight: 700 }}
      >
        {isSaving ? (
          <>
            <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
            Saving Session…
          </>
        ) : (
          <>
            <Save style={{ width: '1rem', height: '1rem' }} />
            Save Attendance Session
          </>
        )}
      </button>
    </div>
  );
};
