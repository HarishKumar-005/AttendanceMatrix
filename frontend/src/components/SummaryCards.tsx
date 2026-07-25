import React from 'react';
import { Users, AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';
import { SummaryMetrics } from '../api/client';

interface SummaryCardsProps {
  metrics: SummaryMetrics;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Attendance Logs',
      value: metrics.totalRecords.toLocaleString(),
      subtext: `${metrics.totalStudents} Active Students Tracked`,
      icon: Users,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.12)',
    },
    {
      title: 'At-Risk Defaulters',
      value: metrics.defaultersCount.toString(),
      subtext: metrics.defaultersCount > 0 ? 'Requires Immediate Intervention' : 'No Critical Risk Flagged',
      icon: AlertTriangle,
      color: metrics.defaultersCount > 0 ? '#ef4444' : '#10b981',
      bgColor: metrics.defaultersCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.12)',
      isPulse: metrics.defaultersCount > 0,
    },
    {
      title: 'Attendance Rate',
      value: `${metrics.attendanceRate.toFixed(1)}%`,
      subtext: '30-Day Rolling Average',
      icon: TrendingUp,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.12)',
    },
    {
      title: 'Dropout Warning Threshold',
      value: `≥ ${metrics.policyThreshold} Days`,
      subtext: 'Absences in 30-Day Window',
      icon: ShieldAlert,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.12)',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.25rem',
      marginBottom: '2rem'
    }}>
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              ...(card.isPulse ? { borderColor: 'rgba(239, 68, 68, 0.4)', boxShadow: '0 0 16px rgba(239, 68, 68, 0.15)' } : {})
            }}
          >
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {card.title}
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                {card.value}
              </div>
              <span style={{ fontSize: '0.75rem', color: card.color, fontWeight: 500 }}>
                {card.subtext}
              </span>
            </div>

            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: card.bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: card.color,
              flexShrink: 0
            }}>
              <IconComponent style={{ width: '1.5rem', height: '1.5rem' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
