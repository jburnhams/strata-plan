import React, { useState, useEffect, useRef } from 'react';

interface TextCellProps {
  value: string;
  onCommit: (value: string) => void;
  maxLength?: number;
  className?: string;
  isFocused?: boolean;
}

export const TextCell: React.FC<TextCellProps> = ({
  value,
  onCommit,
  maxLength = 100,
  className,
  isFocused = false
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
      // Return focus to container if we cancel
      // containerRef.current?.focus();
      // But container is not rendered when editing.
      // After editing, we return to view mode, so parent will re-render or we re-render.
      // If we are still "focused" from parent perspective, effect will run?
      // Actually if isEditing becomes false, we render div with containerRef.
      // Then the effect [isFocused, isEditing] runs. isEditing is false. isFocused is true. -> Focus.
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        maxLength={maxLength}
        className={`w-full p-1 border rounded ${className || ''}`}
        aria-label="Edit text"
      />
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
      {value}
    </div>
  );
};
