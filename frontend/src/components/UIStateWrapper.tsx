import React from 'react';
import { Loader2, AlertTriangle, FileX, RefreshCw } from 'lucide-react';

interface UIStateWrapperProps {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string | null;
  isEmpty: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
}

/**
 * Ensures strict compliance with 4 explicit UI States contract:
 * 1. Loading
 * 2. Empty
 * 3. Error
 * 4. Success
 */
export const UIStateWrapper: React.FC<UIStateWrapperProps> = ({
  isLoading,
  isError,
  errorMessage,
  isEmpty,
  onRetry,
  children,
}) => {
  // 1. Loading State
  if (isLoading) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Loader2 style={{ width: '1.75rem', height: '1.75rem', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Loading records...
            </h3>
          </div>
          
          {/* Skeleton representation */}
          <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div className="skeleton" style={{ height: '32px', width: '100%' }} />
            <div className="skeleton" style={{ height: '32px', width: '100%' }} />
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ 
            width: '2.5rem', 
            height: '2.5rem', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(239, 68, 68, 0.15)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#ef4444' 
          }}>
            <AlertTriangle style={{ width: '1.25rem', height: '1.25rem' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Connection failed
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#fca5a5', lineHeight: 1.5, wordBreak: 'break-word' }}>
              {errorMessage || 'An unexpected error occurred while communicating with the server.'}
            </p>
          </div>
          {onRetry && (
            <button className="btn btn-primary" onClick={onRetry} style={{ marginTop: '0.5rem' }}>
              <RefreshCw style={{ width: '1rem', height: '1rem' }} />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (isEmpty) {
    return (
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', maxWidth: '420px', margin: '0 auto' }}>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(99, 102, 241, 0.12)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--primary)' 
          }}>
            <FileX style={{ width: '1.5rem', height: '1.5rem' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
              No records found
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Try adjusting your filters.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4. Success State
  return <>{children}</>;
};
