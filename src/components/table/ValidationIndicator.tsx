import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';

export type ValidationState = 'valid' | 'warning' | 'error';

interface ValidationIndicatorProps {
  state: ValidationState;
  message?: string;
  className?: string;
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
  state,
  message,
  className = ''
}) => {
  if (state === 'valid') return null;

  const Icon = state === 'error' ? AlertCircle : AlertTriangle;
  const colorClass = state === 'error' ? 'text-red-500' : 'text-yellow-500';

  return (
    <div
      className={`inline-flex items-center justify-center ${colorClass} ${className}`}
      title={message}
      data-testid="validation-icon"
    >
      <Icon size={16} />
    </div>
  );
};
