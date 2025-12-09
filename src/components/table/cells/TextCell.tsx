import React, { useState, useEffect, useRef } from 'react';
import { ValidationIndicator, ValidationState } from '../ValidationIndicator';

interface TextCellProps {
  value: string;
  onCommit: (value: string) => void;
  maxLength?: number;
  className?: string;
  isFocused?: boolean;
  validationState?: ValidationState;
  validationMessage?: string;
}

export const TextCell: React.FC<TextCellProps> = ({
  value,
  onCommit,
  maxLength = 100,
  className,
  isFocused = false,
  validationState = 'valid',
  validationMessage
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentValue(value);
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

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onCommit(currentValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  // Border and ring classes based on state
  const getContainerClasses = () => {
    const base = "cursor-pointer p-1 min-h-[1.5em] rounded flex items-center justify-between relative";
    if (isEditing) return "relative";

    let stateClasses = "hover:bg-gray-100";
    if (isFocused) stateClasses += " ring-2 ring-blue-400";

    if (validationState === 'error') {
        stateClasses += " border border-red-500 bg-red-50";
    } else if (validationState === 'warning') {
        stateClasses += " border border-yellow-500 bg-yellow-50";
    }

    return `${base} ${stateClasses} ${className || ''}`;
  };

  if (isEditing) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          className={`w-full p-1 border rounded ${
            validationState === 'error' ? 'border-red-500 focus:ring-red-500' :
            validationState === 'warning' ? 'border-yellow-500 focus:ring-yellow-500' : ''
          } ${className || ''}`}
          aria-label="Edit text"
        />
        {validationState !== 'valid' && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <ValidationIndicator state={validationState} message={validationMessage} />
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
      <span className="truncate flex-1">{value}</span>
      {validationState !== 'valid' && (
        <ValidationIndicator state={validationState} message={validationMessage} className="ml-1" />
      )}
    </div>
  );
};
