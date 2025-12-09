import React, { useState, useEffect, useRef } from 'react';

interface NumberCellProps {
  value: number;
  onCommit: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  className?: string;
  isFocused?: boolean;
}

export const NumberCell: React.FC<NumberCellProps> = ({
  value,
  onCommit,
  min = 0,
  max = 1000,
  step = 0.1,
  unit,
  className,
  isFocused = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(String(value));
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
      if (numValue !== value) {
        onCommit(numValue);
      }
    } else {
      // Revert if invalid
      setCurrentValue(String(value));
      setIsEditing(false);
      setError(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(e.target.value);
    const numValue = parseFloat(e.target.value);

    if (!isNaN(numValue) && (numValue < min || numValue > max)) {
        setError(`Value must be between ${min} and ${max}`);
    } else {
        setError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setCurrentValue(String(value));
      setIsEditing(false);
      setError(null);
    }
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
          className={`w-full p-1 border rounded ${error ? 'border-red-500' : ''} ${className || ''}`}
          aria-label="Edit number"
        />
        {error && (
            <div className="absolute top-full left-0 bg-red-100 text-red-800 text-xs p-1 rounded z-10 w-full">
                {error}
            </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer p-1 min-h-[1.5em] hover:bg-gray-100 rounded ${isFocused ? 'ring-2 ring-blue-400' : ''} ${className || ''}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') setIsEditing(true);
      }}
    >
      {value} {unit}
    </div>
  );
};
