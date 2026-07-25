import React from 'react';
import { Users, AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';
import { SummaryMetrics } from '../api/client';

interface SummaryCardsProps {
  metrics: SummaryMetrics;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Records',
      value: metrics.totalRecords.toLocaleString(),
      icon: Users,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.12)',
    },
    {
      title: 'At-Risk',
      value: metrics.defaultersCount.toString(),
      icon: AlertTriangle,
      color: metrics.defaultersCount > 0 ? '#ef4444' : '#10b981',
      bgColor: metrics.defaultersCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.12)',
    },
    {
      title: 'Attendance Rate',
      value: `${metrics.attendanceRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.12)',
    },
    {
      title: 'Threshold',
      value: `≥ ${metrics.policyThreshold} Days`,
      icon: ShieldAlert,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.12)',
    },
  ];

  return (
    <div
      className="kpi-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}
    >
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                }}
              >
                {card.title}
              </span>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginTop: '0.125rem',
                }}
              >
                {card.value}
              </div>
            </div>

            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: card.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
                flexShrink: 0,
              }}
            >
              <IconComponent style={{ width: '1rem', height: '1rem' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
