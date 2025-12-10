import React from 'react';

interface TableControlsProps {
  onAutoLayout: () => void;
}

export const TableControls: React.FC<TableControlsProps> = ({ onAutoLayout }) => {
  return (
    <div className="flex justify-between items-center p-2 bg-white border-b border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700">Rooms</h3>
      <div className="flex gap-2">
        <button
          onClick={onAutoLayout}
          className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 transition-colors"
          title="Reset room positions to a linear layout"
        >
          Re-layout
        </button>
      </div>
    </div>
  );
};
