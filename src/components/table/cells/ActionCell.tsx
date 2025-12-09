import React from 'react';

interface ActionCellProps {
  onDelete: () => void;
  className?: string;
}

export const ActionCell: React.FC<ActionCellProps> = ({
  onDelete,
  className
}) => {
  return (
    <div className={`p-1 ${className || ''}`}>
      <button
        onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Delete this room?')) {
                onDelete();
            }
        }}
        aria-label="Delete room"
        className="text-red-600 hover:text-red-800"
      >
        Delete
      </button>
    </div>
  );
};
