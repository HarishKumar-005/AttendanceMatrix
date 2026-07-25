import React from 'react';
import { GraduationCap, CheckSquare, History, Plus } from 'lucide-react';
import { ActiveTabMode } from '../hooks/useAttendance';
import { SummaryMetrics } from '../api/client';

interface AppHeaderProps {
  activeTab: ActiveTabMode;
  onTabChange: (tab: ActiveTabMode) => void;
  metrics: SummaryMetrics;
  onOpenAddModal: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onTabChange,
  metrics: _metrics,
  onOpenAddModal,
}) => {
  return (
    <header className="glass-panel" style={{ padding: '0.875rem 1.25rem', marginBottom: '1rem' }}>
      <div className="app-header-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Brand & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <GraduationCap style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              AttendanceMatrix
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
              School attendance workspace &amp; 30-day early-warning register
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs & Quick Action */}
        <div className="app-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="nav-tab-group">
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'workspace' ? 'active' : ''}`}
              onClick={() => onTabChange('workspace')}
            >
              <CheckSquare style={{ width: '0.875rem', height: '0.875rem' }} />
              Workspace
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => onTabChange('history')}
            >
              <History style={{ width: '0.875rem', height: '0.875rem' }} />
              History Log
            </button>
          </div>

          {activeTab === 'history' && (
            <button className="btn btn-secondary" onClick={onOpenAddModal} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
              <Plus style={{ width: '0.875rem', height: '0.875rem' }} />
              Single Log
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
