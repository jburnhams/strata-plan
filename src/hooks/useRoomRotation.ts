import { useCallback, useRef, useState } from 'react';
import { useFloorplanStore } from '../stores/floorplanStore';
import { useUIStore } from '../stores/uiStore';
import { getRoomCenter } from '../services/geometry/room';
import { PIXELS_PER_METER } from '../constants/defaults';

export const useRoomRotation = () => {
  const updateRoom = useFloorplanStore((state) => state.updateRoom);
  const zoomLevel = useUIStore((state) => state.zoomLevel);
  const panOffset = useUIStore((state) => state.panOffset);

  const [isRotating, setIsRotating] = useState(false);
  const dragStartRef = useRef<{ startAngle: number; initialRotation: number; roomId: string } | null>(null);

  // Helper to snap to 90 degrees
  const snapTo90 = (angle: number): 0 | 90 | 180 | 270 => {
    // Normalize angle to 0-360
    let normalized = angle % 360;
    if (normalized < 0) normalized += 360;

    // Find nearest 90 degree increment
    if (normalized >= 45 && normalized < 135) return 90;
    if (normalized >= 135 && normalized < 225) return 180;
    if (normalized >= 225 && normalized < 315) return 270;
    return 0;
  };

  const handleRotationStart = useCallback((e: React.MouseEvent, roomId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const room = useFloorplanStore.getState().getRoomById(roomId);
    if (!room) return;

    // Calculate room center in screen coordinates
    // We need to match the logic in CanvasViewport/SelectionOverlay
    // Screen = World * PPM * Zoom + Pan + CenterOffset (handled by CSS transform usually, but here we need raw values)

    // Wait, the mouse event clientX/Y are screen coordinates relative to viewport.
    // We need to know where the room center is in those same coordinates.
    // The CanvasViewport usually centers 0,0 of world in the middle of the screen div.
    // Let's assume standard behavior:
    // We can use the mouse position directly and the known world position of the room.
    // But we need to convert world room center to screen pixels to get the angle.

    // Let's use the mouse position relative to the room center.
    // But we don't have the room center screen coordinates easily available without duplicating logic.
    // Alternatively, we convert mouse screen coordinates to world coordinates.
    // But `screenToWorld` is likely available or we can access the viewport DOM element.

    // Let's assume we can get the world coordinates of the mouse from the event?
    // No, React event doesn't give that.

    // Better approach: Calculate the angle based on the room center in WORLD space
    // and the mouse position converted to WORLD space.
    // But we don't have `screenToWorld` here easily unless we pass it or duplicate it.

    // However, `SelectionOverlay` is inside `CanvasViewport` (conceptually), but actually likely rendered inside the SVG or a div overlay.
    // If we look at `SelectionOverlay.tsx`, it uses `room.position` (world).

    // Simplest way: The angle of rotation depends on the vector from Center to Mouse.
    // Whether in screen space or world space, the angle is the same (assuming uniform scaling, which we have).
    // So if we can get Mouse in World Space, we are good.

    // We can't easily get Mouse in World Space without `screenToWorld`.
    // But we can observe the `mousemove` on `window`.

    // Let's try to get the element center from the DOM? No, that's messy.

    // Let's just use the current mouse position and the room center projected to screen.
    // World (m) -> Screen (px)
    // x_screen = (x_world * PPM * zoom) + panX + (viewportWidth/2)
    // This depends on viewport dimensions which we don't have in the hook.

    // Re-reading `CanvasViewport` tasks:
    // 4.1.3 Create `worldToScreen`...
    // These functions are likely in `src/utils/coordinates.ts` or similar, OR inside `CanvasViewport` component.
    // If they are utils, we can use them. If they are component logic, we can't.

    // Let's check `src/utils/coordinates.ts`.

    // If not available, we can rely on `e.target` to find the center?
    // The rotation handle is at specific relative position.

    // Actually, `SelectionOverlay` passes `handleResizeStart` which uses `useRoomResize`.
    // Let's see how `useRoomResize` handles coordinate conversion.
    // It likely uses `movementX/Y` (deltas) which are scale-independent (just divide by scale).

    // For rotation, we need absolute angle.
    // But maybe we can just track delta angle?
    // "Drag to rotate" usually means the angle of the mouse relative to the center determines the rotation.

    // Let's check `src/utils/coordinates.ts` first.

    const center = getRoomCenter(room); // World coords

    setIsRotating(true);
    dragStartRef.current = {
      startAngle: 0, // Will be calculated on first move or inferred
      initialRotation: room.rotation,
      roomId
    };

    const handleMove = (moveEvent: MouseEvent) => {
        // We need the room center in screen coordinates to calculate atan2(dy, dx).
        // OR we need the mouse in world coordinates.

        // Let's try to get the SVG element (canvas container) and use its bounding rect.
        const svg = document.querySelector('svg[data-testid="canvas-svg"]');
        if (!svg) return;

        const rect = svg.getBoundingClientRect();
        // The viewBox/transform on the SVG usually handles the pan/zoom.
        // But `Canvas2D` usually puts the transform on a <g>.
        // So `rect` is the viewport.
        // Center of viewport is (width/2, height/2).
        // World (0,0) is at Center + Pan.

        // World Point (wx, wz) to Screen (sx, sy) relative to rect.left/top:
        // sx = (width/2) + panX + (wx * PPM * zoom)
        // sy = (height/2) + panZ + (wz * PPM * zoom)

        const viewportWidth = rect.width;
        const viewportHeight = rect.height;

        const cx_world = center.x;
        const cy_world = center.z; // Z is Y in 2D

        const cx_screen = (viewportWidth / 2) + panOffset.x + (cx_world * PIXELS_PER_METER * zoomLevel);
        // Position2D has x and z. For screen panOffset, z represents the vertical axis (y)
        const cy_screen = (viewportHeight / 2) + panOffset.z + (cy_world * PIXELS_PER_METER * zoomLevel);

        const dx = moveEvent.clientX - rect.left - cx_screen;
        const dy = moveEvent.clientY - rect.top - cy_screen;

        // Angle in radians, +y is down.
        // Atan2(y, x).
        // 0 degrees is usually East (1, 0).
        // In our app, North (Up) is 0 degrees? Or Standard Math?
        // Room rotation: 0 usually means aligned with axes.

        let angleRad = Math.atan2(dy, dx);
        let angleDeg = angleRad * (180 / Math.PI);

        // Adjust to match our rotation system.
        // Usually 0 is North? In CSS/SVG transform, 0 is East?
        // If we look at `RoomShape`, `rotate(${room.rotation}, ...)` is standard SVG rotation (CW from East? No, CW from X-axis).
        // If 0 is standard, it's 3 o'clock.
        // If we want 0 to be 12 o'clock (North), we need to shift.
        // But `RoomShape` likely renders "North" up.
        // Let's assume standard SVG rotation: 0 = +X (Right), 90 = +Y (Down).
        // But in 3D floorplans, X is Right, Z is Down (Top View).
        // So 0 rotation means "aligned with axes".
        // If I drag to the right (+X), angle is 0.
        // If I drag down (+Y), angle is 90.

        // However, the handle is physically placed at "Top" (Negative Z/Y).
        // So initial handle position is at -90 degrees (or 270).
        // We want the rotation to follow the mouse.

        // So we add 90 degrees to align 0 with Up?
        // Let's just calculate raw angle and snap.

        // Current angle from center to mouse:
        let rotation = angleDeg + 90; // Shift so Up is 0

        const snapped = snapTo90(rotation);

        updateRoom(roomId, { rotation: snapped });
    };

    const handleUp = () => {
      setIsRotating(false);
      dragStartRef.current = null;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [updateRoom, zoomLevel, panOffset]);


  const rotateSelectedRoom = useCallback((direction: 'cw' | 'ccw') => {
    const room = useFloorplanStore.getState().getSelectedRoom();
    if (!room) return;

    let newRotation = room.rotation;
    if (direction === 'cw') {
      newRotation = (room.rotation + 90) % 360 as 0 | 90 | 180 | 270;
    } else {
      newRotation = (room.rotation - 90) as 0 | 90 | 180 | 270;
      if (newRotation < 0) newRotation = (newRotation + 360) as any;
    }

    updateRoom(room.id, { rotation: newRotation });
  }, [updateRoom]);

  return {
    handleRotationStart,
    rotateSelectedRoom,
    isRotating
  };
};
