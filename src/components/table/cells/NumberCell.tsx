import React, { useState, useEffect, useRef } from 'react';
import { ValidationIndicator, ValidationState } from '../ValidationIndicator';

interface NumberCellProps {
  value: number;
  onCommit: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  className?: string;
  isFocused?: boolean;
  validationState?: ValidationState;
  validationMessage?: string;
}

export const NumberCell: React.FC<NumberCellProps> = ({
  value,
  onCommit,
  min = 0,
  max = 1000,
  step = 0.1,
  unit,
  className,
  isFocused = false,
  validationState = 'valid',
  validationMessage
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(String(value));
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentValue(String(value));
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isFocused && !isEditing && containerRef.current) {
      containerRef.current.focus();
    }
  }, [isFocused, isEditing]);

  const validate = (val: number): boolean => {
    if (isNaN(val)) return false;
    if (val < min) return false;
    if (val > max) return false;
    return true;
  };

  const handleBlur = () => {
    const numValue = parseFloat(currentValue);

    if (validate(numValue)) {
      setIsEditing(false);
      setLocalError(null);
      if (numValue !== value) {
        onCommit(numValue);
      }
    } else {
      // Revert if invalid
      setCurrentValue(String(value));
      setIsEditing(false);
      setLocalError(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(e.target.value);
    const numValue = parseFloat(e.target.value);

    if (!isNaN(numValue) && (numValue < min || numValue > max)) {
        setLocalError(`Value must be between ${min} and ${max}`);
    } else {
        setLocalError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setCurrentValue(String(value));
      setIsEditing(false);
      setLocalError(null);
    }
  };

  // Determine effective validation state
  let effectiveState: ValidationState = validationState;
  let effectiveMessage = validationMessage;

  if (localError) {
    effectiveState = 'error';
    effectiveMessage = localError;
  }

  // Border and ring classes based on state
  const getContainerClasses = () => {
    const base = "cursor-pointer p-1 min-h-[1.5em] rounded flex items-center justify-between relative";
    if (isEditing) return "relative";

    let stateClasses = "hover:bg-gray-100";
    if (isFocused) stateClasses += " ring-2 ring-blue-400";

    if (effectiveState === 'error') {
        stateClasses += " border border-red-500 bg-red-50";
    } else if (effectiveState === 'warning') {
        stateClasses += " border border-yellow-500 bg-yellow-50";
    }

    return `${base} ${stateClasses} ${className || ''}`;
  };

  if (isEditing) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="number"
          value={currentValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          step={step}
          min={min}
          max={max}
          className={`w-full p-1 border rounded ${
            effectiveState === 'error' ? 'border-red-500 focus:ring-red-500' :
            effectiveState === 'warning' ? 'border-yellow-500 focus:ring-yellow-500' : ''
          } ${className || ''}`}
          aria-label="Edit number"
        />
        {(effectiveState !== 'valid') && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <ValidationIndicator state={effectiveState} message={effectiveMessage} />
            </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={() => setIsEditing(true)}
      className={getContainerClasses()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') setIsEditing(true);
      }}
    >
      <span className="truncate flex-1">
        {value} <span className="text-gray-500 text-xs">{unit}</span>
      </span>
      {effectiveState !== 'valid' && (
        <ValidationIndicator state={effectiveState} message={effectiveMessage} className="ml-1" />
      )}
    </div>
  );
};
