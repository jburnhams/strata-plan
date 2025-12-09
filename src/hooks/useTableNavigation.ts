import { useState, useCallback, useEffect, useRef } from 'react';
import { Room } from '../types';

interface UseTableNavigationProps {
  rooms: Room[];
  onAddRoom: () => void;
  onDeleteRoom: (id: string) => void;
}

export const useTableNavigation = ({ rooms, onAddRoom, onDeleteRoom }: UseTableNavigationProps) => {
  const [focusedCell, setFocusedCell] = useState<{ roomId: string; colIndex: number } | null>(null);

  // Column indices for navigation logic
  // 0: Name, 1: Length, 2: Width, 3: Height, 4: Type
  const LAST_EDITABLE_COL = 4;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // When using standard `act`, state updates inside events should reflect.
    // However, since we attach the listener via `useEffect`,
    // we need to make sure we are not closing over stale state.
    // We can use a functional state update to get the *current* focusedCell,
    // but we can't get *current* rooms that way inside the event handler easily without refs or re-binding.
    // Re-binding on `focusedCell` change is safe and standard React.

    // If focusedCell is null, we might still want to handle some keys?
    // But per requirements, navigation is relative to current cell.

    // We will let the useEffect re-bind when focusedCell changes.
    // That means `focusedCell` in scope here is correct.

    if (!focusedCell) return;

    const { roomId, colIndex } = focusedCell;
    const roomIndex = rooms.findIndex((r) => r.id === roomId);

    if (roomIndex === -1) return;

    // Ctrl+Enter: Add new room
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      onAddRoom();
      return;
    }

    // Tab navigation
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Previous cell
        if (colIndex > 0) {
          setFocusedCell({ roomId, colIndex: colIndex - 1 });
        } else if (roomIndex > 0) {
          // Go to last cell of previous row
          const prevRoom = rooms[roomIndex - 1];
          setFocusedCell({ roomId: prevRoom.id, colIndex: LAST_EDITABLE_COL });
        }
      } else {
        // Next cell
        if (colIndex < LAST_EDITABLE_COL) {
          setFocusedCell({ roomId, colIndex: colIndex + 1 });
        } else if (roomIndex < rooms.length - 1) {
          // Go to first cell of next row
          const nextRoom = rooms[roomIndex + 1];
          setFocusedCell({ roomId: nextRoom.id, colIndex: 0 });
        } else {
          setFocusedCell(null);
        }
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      if (roomIndex > 0) {
        e.preventDefault();
        setFocusedCell({ roomId: rooms[roomIndex - 1].id, colIndex });
      }
    } else if (e.key === 'ArrowDown') {
      if (roomIndex < rooms.length - 1) {
        e.preventDefault();
        setFocusedCell({ roomId: rooms[roomIndex + 1].id, colIndex });
      }
    } else if (e.key === 'ArrowLeft') {
      const isInput = (e.target as HTMLElement).tagName === 'INPUT';
      if (!isInput) {
         if (colIndex > 0) {
            e.preventDefault();
            setFocusedCell({ roomId, colIndex: colIndex - 1 });
         }
      }
    } else if (e.key === 'ArrowRight') {
      const isInput = (e.target as HTMLElement).tagName === 'INPUT';
      if (!isInput) {
        if (colIndex < LAST_EDITABLE_COL) {
            e.preventDefault();
            setFocusedCell({ roomId, colIndex: colIndex + 1 });
        }
      }
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (roomIndex < rooms.length - 1) {
            setFocusedCell({ roomId: rooms[roomIndex + 1].id, colIndex });
        } else {
            // Last row
            onAddRoom();
        }
    } else if (e.key === 'Delete') {
         const isInput = (e.target as HTMLElement).tagName === 'INPUT';
         if (!isInput) {
             onDeleteRoom(roomId);
         }
    }

  }, [focusedCell, rooms, onAddRoom, onDeleteRoom]);

  // Effect to attach/detach listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    focusedCell,
    setFocusedCell,
  };
};
