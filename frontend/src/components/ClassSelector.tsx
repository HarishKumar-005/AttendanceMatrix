import React from 'react';
import { Calendar } from 'lucide-react';

const CLASS_OPTIONS = [
  { value: 'ALL', label: 'All Classes' },
  { value: 'Class 9-A', label: '9-A' },
  { value: 'Class 9-B', label: '9-B' },
  { value: 'Class 10-A', label: '10-A' },
  { value: 'Class 10-B', label: '10-B' },
  { value: 'Class 11-A', label: '11-A' },
  { value: 'Class 12-A', label: '12-A' },
];

interface ClassSelectorProps {
  activeClass: string;
  activeDate: string;
  onClassChange: (cls: string) => void;
  onDateChange: (date: string) => void;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  activeClass,
  activeDate,
  onClassChange,
  onDateChange,
}) => {
  return (
    <div className="class-selector-strip">
      <div className="class-pills-container">
        {CLASS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`class-pill${activeClass === opt.value ? ' active' : ''}`}
            onClick={() => onClassChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="class-date-control">
        <Calendar style={{ width: '0.875rem', height: '0.875rem', color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="date"
          className="input-control"
          value={activeDate}
          onChange={(e) => onDateChange(e.target.value)}
          style={{ width: '9rem', padding: '0.375rem 0.5rem', fontSize: '0.8125rem' }}
        />
      </div>
    </div>
  );
};
