import React from 'react';

interface DisplayCellProps {
  value: string | number;
  unit?: string;
  className?: string;
}

export const DisplayCell: React.FC<DisplayCellProps> = ({
  value,
  unit,
  className
}) => {
  return (
    <div className={`p-1 ${className || ''}`}>
      {value} {unit}
    </div>
  );
};
